from flask.views import MethodView
from flask_smorest import Blueprint
from flask import session, request, jsonify, send_from_directory, redirect, render_template, url_for
from sqlalchemy import and_, or_, desc, func, case
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from app import app, db
from build_dictionary import build_custom_dictionary
from semantic_embedding import build_embeddings, hybrid_search
from spellcheck import correct_query
from threading import Thread

from auth import TENANT_ID, CLIENT_ID
from search import tfidf_search

import os, traceback, models, requests, jwt, redis, json
from typing import Any
from jwt.algorithms import RSAAlgorithm

apiv1 = Blueprint(
    "apiv1", 
    "apiv1", 
    url_prefix="/api/v1/", 
    description="Version 1 of the backend rest api for help.gcc.edu"
)

revoked_tokens = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"

stopWords = set()
file = open("stop_words.txt", "r")
for line in file:
    stopWords.add(line.strip())
file.close()

def get_signing_keys():
    response = requests.get(JWKS_URL)
    keys = response.json()['keys']
    
    # Debugging - Print out all keys for inspection
    # print("Available Keys:", keys)
    return {key['kid']: RSAAlgorithm.from_jwk(key) for key in keys}

SIGNING_KEYS = get_signing_keys()

def validate_jwt(token):
    global SIGNING_KEYS
    try:
        SIGNING_KEYS = get_signing_keys()  # Refresh keys
        headers = jwt.get_unverified_header(token)
        kid = headers.get('kid')
        print(f"JWT Kid: {kid}")

        if kid not in SIGNING_KEYS:
            print("KID not found in signing keys. Refreshing keys...")
            SIGNING_KEYS = get_signing_keys()

        decoded_token = jwt.decode(
            token,
            key=SIGNING_KEYS.get(kid, None),
            algorithms=['RS256'],
            audience=CLIENT_ID,
            issuer=f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
        )
        return decoded_token
    except jwt.ExpiredSignatureError:
        print("JWT expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Error validating JWT: {e}")
        return None

def decode_jwt_header(token):
    try:
        # Get the unverified header to check which key was used to sign the JWT
        header = jwt.get_unverified_header(token)
        print("JWT Header:", header)
        return header
    except Exception as e:
        print(f"Error decoding JWT header: {e}")
        return None

@apiv1.route("/user/login", methods=["OPTIONS", "POST"])
class UserLogin(MethodView):
    def options(self):
        return '', 200
    def post(self):
        try:
            data = request.json
            token = data.get("token")

            if not token:
                return jsonify({"msg": "No token provided"}), 400

            decoded_token = jwt.decode(token, options={"verify_signature": False})
            email = decoded_token.get("unique_name")
            if not email:
                return jsonify({"msg": "Invalid token: No email found"}), 401
            
            user: models.User = models.User.query.filter_by(Email=email).first()

            if user:
                session['current_user_id'] = user.ID
                privs: list[AdminPrivileges] = user.AdminPrivileges

                if len(privs) > 0:
                    privs: list[int] = [priv.ID for priv in privs]
                    session['current_user_privileges'] = privs

                    if 5 in privs:
                        session['current_user_role'] = "superadmin"
                    else:
                        session['current_user_role'] = "admin"       
                else:
                    session['current_user_role'] = "student"
                    session['current_user_privileges'] = []

                print(session["current_user_id"])

                return jsonify({"msg": "Login successful", "UserID": user.ID}), 200
            else:
                newUser = models.User(Email=email, LName=decoded_token.get("family_name"), FName=decoded_token.get("given_name"))
                db.session.add(newUser)
                db.session.commit()

                session["current_user_id"] = newUser.ID
                session["current_user_role"] = "student"
                session["current_user_privileges"] = []

                print(session["current_user_id"])

                return jsonify({"msg": "User successfully registered"}), 200
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

# Grabs and returns user info (including admin privileges)
@apiv1.route("/user/info", methods=["OPTIONS", "GET"])
class UserInfo(MethodView):
    def options(self):
        return '', 200
    
    def get(self):
        if "current_user_id" in session and "current_user_role" in session and "current_user_privileges" in session:
            currentPrivileges: list[models.AdminPrivilege] = []
            for id in session["current_user_privileges"]:
                priv: models.AdminPrivilege = models.AdminPrivilege.query.filter_by(ID=id).first()
                if priv:
                    currentPrivileges.append(priv)
            returnablePrivileges = [priv.toJSONPartial() for priv in currentPrivileges]
            return {
                "current_user_id": session["current_user_id"],
                "current_user_role": session["current_user_role"],
                "current_privileges": returnablePrivileges
            }, 200
        else:
            return {'msg': "Not logged in"}, 401

@apiv1.route("/articles", methods=["OPTIONS", "GET"])
class Articles(MethodView):
    # The options method always needs to be included in
    # a route class. The options method completes the handshaking
    # between the front end and the backend. You can copy
    # this exact options method for any future route classes
    def options(self):
        return '', 200
    # There should always be two parts to your return statement.
    # First, the json object that is being returned. This object 
    # can be as complec or simple as you need it to be. Second the
    # return code. This is to tell the front end what has taken place.
    # There are different codes for different errors and different 
    # actions that have taken place.
    # 
    # You should always wrap the entire methof in a try except block
    # and return a code 500 in the except block, but make sure to always
    # handle errors as thoroughly as possible within the try block. The
    # Try Except block is just there to catch any anomolies we have not 
    # accounted for.
    # 
    # checking if current_user_id is in session is essentially doing our authentication
    # Once single sign on is figured out we will dynamically set this but for now it is hard
    # coded in. The is also a variable callee current_user_role stored in the session
    # it can either be 'admin' or 'user' this will eventually helo us determine what
    # page to display to the user but is not important for now
    # 
    # All models have two helper function .toJSONPartial and .toJSON these return different
    # json objects if the respective models. As a general rule when returning a list of 
    # model objects you should return using .toJSONPartial if you are returning a single
    # model object, you should use .toJSON
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                articles: list[models.Article] = models.Article.query.all()
                
                returnableArticles = [article.toJSONPartial() for article in articles]
                return {'articlesJSON': returnableArticles}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/article/tag", methods=["OPTIONS", "GET", "PUT"])
class ArticleTag(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                id = request.args.get("ID")
                if id:
                    article: models.Article = models.Article.query.filter_by(ID=id).first()
                    if article:
                        tag: models.Tag = article.Tags[0]
                        tags: list[models.Tag] = models.Tag.query.all()
                        
                        return{
                            'tag': tag.TagName,
                            'tags': [tag.TagName for tag in tags]
                        }, 200
                    else:
                        return {'msg': 'No such article'}, 404
                else:
                    return {'msg': 'No article id specified'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session and 3 in session['current_user_privileges']:
                id = request.args.get("ID")
                tagName = request.args.get("TagName")
                if id and tagName:
                    tag: models.Tag = models.Tag.query.filter_by(TagName=tagName).first()
                    article: models.Article = models.Article.query.filter_by(ID=id).first()
                    
                    article.Tags = [tag]
                    db.session.commit()
                    
                    return {'msg': 'Article tag updated successfully'}, 200
                else:
                    return {'msg': 'No article id or tag name specified'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/article", methods=["OPTIONS", "GET", "POST", "PUT"])
class Article(MethodView):
    def options(self):
        return '', 200
        
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                id = request.args.get("articleID")
                if id:
                    if int(id) >= 0:
                        article = models.Article.query.filter(models.Article.ID == id).all()
                        returnableArticle = article[0].toJSONPartial()

                        userID = session.get('current_user_id')
                        time = datetime.now()
                        vh = models.ViewHistory(ArticleID=id, UserID=userID,
                                                View_Time=time)     
                        db.session.add(vh)
                        db.session.commit()
                        
                        return {'article': returnableArticle}, 200
                    else:
                        return {'msg': "Creating Article"}, 200
                else:
                    return {'msg': 'No article specified'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def post(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 1 in session['current_user_privileges']:
                    
                    data = request.json
                    
                    title: str = data.get('title')
                    content: str = data.get('content')
                    desc: str = data.get('desc')
                    tag: str = data.get('tag')
                    metatag: str = data.get('metatag')
                    image: str = data.get('image')
                    
                    if not image:
                        image = ""

                    if len(title) > 100:
                        return {'msg': 'Article title length exceeds database limit of 100 characters.'}, 400
                    if len(content) > 5000:
                        return {'msg': 'Article content length exceeds database limit of 5000 characters.'}, 400
                    if len(desc) > 500:
                        return {'msg': 'Article description length exceeds database limit of 500 characters.'}, 400
                    if len(image) > 100:
                        return {'msg': 'Article image path length exceeds database limit of 100 characters.'}, 400

                    addTag: models.Tag = models.Tag.query.filter_by(TagName=tag).first()
                    addMetaTag: models.MetaTag = models.MetaTag.query.filter_by(TagName=metatag).first()
        
                    if len(image) > 0:
                        article: models.Article = models.Article(Title=title, Content=json.dumps(content),
                                    Article_Description=desc,
                                    Image=image)
                    else:
                        article: models.Article = models.Article(Title=title, Content=json.dumps(content),
                                    Article_Description=desc)
                        
                    db.session.add(article)
                    if addTag:
                        article.Tags = [addTag]
                    if addMetaTag:
                        article.MetaTags = [addMetaTag]
                    
                    db.session.commit()
                    build_custom_dictionary()
                    Thread(target=build_embeddings()).start()

                    return {"msg": "Article Added successfully"}, 200

                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to create articles.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 3 in session['current_user_privileges']:
                    article_updated = request.json
                    userID = session['current_user_id']
                    
                    if article_updated:
                        id: int = article_updated.get("ID")
                        title: str = article_updated.get('Title')
                        content: str = article_updated.get('Content')
                        desc: str = article_updated.get('Article_Description')
                        tag: str = article_updated.get('Tag')
                        metatag: str = article_updated.get('MetaTag')
                        image: str = article_updated.get('Image')

                        if title:
                            if len(title) > 100:
                                return {'msg': 'Updated article title length exceeds database limit of 100 characters.'}, 400
                        if content:
                            if len(content) > 5000:
                                return {'msg': 'Updated article content length exceeds database limit of 5000 characters.'}, 400
                        if desc:
                            if len(desc) > 500:
                                return {'msg': 'Updated article description length exceeds database limit of 500 characters.'}, 400
                        if image:
                            if len(image) > 100:
                                return {'msg': 'Updated article image path length exceeds database limit of 100 characters.'}, 400

                        article = models.Article.query.filter(models.Article.ID == id).first()
                        if not article:
                            return {'msg': 'Article not found'}, 404
                        article.Title = title
                        article.Content = json.dumps(content)
                        article.Article_Description = desc
                        article.Image = image
                        
                        updateTag: models.Tag = models.Tag.query.filter_by(TagName=tag).first()
                        updateMetaTag: models.MetaTag = models.MetaTag.query.filter_by(TagName=metatag).first()

                        if updateTag:
                            article.Tags = [updateTag]
                        if updateMetaTag:
                            article.MetaTags = [updateMetaTag]

                        time = datetime.now()
                        eh = models.EditHistory(ArticleID=id, UserID=userID, Edit_Time=time)
                        db.session.add(eh)
                        
                        db.session.commit()
                        build_custom_dictionary()
                        Thread(target=build_embeddings()).start()
                        return {'msg': 'Article updated successfully'}, 200
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to edit articles.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/users", methods=["OPTIONS", "GET"])
class Users(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_' and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    all_users: list[models.User] = models.User.query.all()

                    users = []
                    for user in all_users:
                        data = user.toJSON()
                        if not data["AdminPrivileges"]:
                            users.append(user)
                        
                    returnableUsers = [user.toJSONPartial() for user in users]
                    
                    return {'users': returnableUsers}, 200
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to add/remove users as admins.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/users/search", methods=["OPTIONS", "GET"])
class UserSearch(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    searchQuery = request.args.get("searchQuery")

                    searched_users: list[models.User] = models.User.query.filter(
                        or_(
                            models.User.FName.ilike(f"%{searchQuery}%"),
                            models.User.LName.ilike(f"%{searchQuery}%"),
                            models.User.Email.ilike(f"%{searchQuery}%")
                        )
                    ).all()
                
                    users = []
                    for user in searched_users:
                        data = user.toJSON()
                        if not data["AdminPrivileges"]:
                            users.append(user)

                    returnableUsers = [user.toJSONPartial() for user in users]
                    
                    return {'users': returnableUsers}, 200
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to add/remove users as admins.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/user", methods=["OPTIONS", "GET", "POST", "PUT"])
class User(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    id = request.args.get("ID")
                    user: models.User = models.User.query.filter_by(ID=id).first()
                    
                    if user:
                        return {
                            'user': user.toJSONPartial(),
                            'adminPrivileges': [ap.toJSONPartial for ap in user.AdminPrivileges]
                        }, 200
                    else:
                        return {'msg': 'No such user'}, 404
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to add/remove users as admins.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def post(self): # useless?
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                data = request.json
                if data:
                    email = data.get("Email")
                    if email:
                        user: models.User = models.User(Email=email)
                        
                        db.session.add(user)
                        
                        # Device = db.Column(db.Unicode, nullable=True)
                        if data.get("Device"):
                            user.Device = data.get("Device")
                        # Major = db.Column(db.Unicode, nullable=True)
                        if data.get("Major"):
                            user.Major = data.get("Major")
                        # GradYear = db.Column(db.Integer, nullable=True)
                        if data.get("GradYear"):
                            user.GradYear = data.get("GradYear")
                        # LName = db.Column(db.Unicode, nullable=True)
                        if data.get("LName"):
                            user.LName = data.get("LName")
                        # FName = db.Column(db.Unicode, nullable=True)
                        if data.get("FName"):
                            user.FName = data.get("FName")
                            
                        db.session.commit()
                        return {'user': user.toJSONPartial()}, 201
                        
                    else:
                        return {'msg': 'No email included to create user with'}, 400
                else:
                    return {'msg': 'No body in the request'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self): # admin only? where will this be used?
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    data = request.json
                    if data:
                        id = data.get("ID")
                        if id:
                            user: models.User = models.User.query.filter_by(ID=id).first()
                            if user:
                                if data.get("Email"):
                                    user.Email = data.get("Email")
                                if data.get("Device"):
                                    user.Device = data.get("Device")
                                if data.get("Major"):
                                    user.Major = data.get("Major")
                                if data.get("GradYear"):
                                    user.GradYear = data.get("GradYear")
                                if data.get("LName"):
                                    user.LName = data.get("LName")
                                if data.get("FName"):
                                    user.FName = data.get("FName")
                                    
                                db.session.commit()
                                return {'user': user.toJSONPartial()}, 201
                            else:
                                return {'msg', 'No user found with given ID'}, 404
                        else:
                            return {'msg': 'No user id included in request'}, 400
                    else:
                        return {'msg': 'No body in the request'}, 400
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to edit a user.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def delete(self): # unused?
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    id = request.args.get("ID")
                    user: models.User = models.User.query.filter_by(ID=id).first()

                    if user:
                        db.session.delete(user)
                        db.session.commit()

                        return {'msg': 'User successfully deleted', 'ID': user.ID}, 200
                    else:
                        return {'msg': 'No such user'}, 404
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to delete a user.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

# Returns ALL admin privileges for testing purposes (Does NOT get an individual admin's privileges)
@apiv1.route("/admin/privileges", methods=["OPTIONS", "GET"])
class AdminPrivileges(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    privileges: list[models.AdminPrivilege] = models.AdminPrivilege.query.all()
                    returnablePrivileges = [priv.toJSONPartial() for priv in privileges]
                    return {'privileges': returnablePrivileges}, 200
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/admin", methods=["OPTION", "GET", "POST", "PUT", "DELETE"])
class Admin(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    id = request.args.get("ID")
                    user: models.User = models.User.query.filter_by(ID=id).first()
                    
                    if user:
                        return {
                            'user': user.toJSONPartial(),
                            'adminPrivileges': [ap.toJSONPartial for ap in user.AdminPrivileges]
                        }, 200
                    else:
                        return {'msg': 'No such user'}, 404
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    data = request.json
                    if data:
                        id = data.get("ID")
                        if id:
                            user: models.User = models.User.query.filter_by(ID=id).first()
                            if user:
                                user_privs: list[int] = [priv.ID for priv in user.AdminPrivileges]
                                privilegeIDs = data.get("privilegeIDs")

                                if 5 in user_privs:
                                    super_admins: list[models.User] = []
                                    users = models.User.query.all()
                                    for tempUser in users:
                                        for priv in tempUser.AdminPrivileges:
                                            if priv.ID == 5:
                                                super_admins.append(tempUser)

                                    if len(super_admins) > 1:
                                        userPrivileges: list[models.AdminPrivilege] = []
                                    
                                        for id in privilegeIDs:
                                            priv: models.AdminPrivilege = models.AdminPrivilege.query.filter_by(ID=id).first()
                                            if priv:
                                                userPrivileges.append(priv)
                                        
                                        user.AdminPrivileges = userPrivileges

                                        if (session['current_user_id'] == user.ID):
                                            newPrivileges: list[int] = [priv.ID for priv in userPrivileges]
                                            session['current_user_privileges'] = newPrivileges

                                        db.session.commit()
                                        return {'user': user.toJSONPartial()}, 201 
                                    else:
                                        return {'msg': 'WARNING: Please add at least one other super admin before editing or removing super admin privileges!'}, 403
                                else:
                                    userPrivileges: list[models.AdminPrivilege] = []
                                
                                    for id in privilegeIDs:
                                        priv: models.AdminPrivilege = models.AdminPrivilege.query.filter_by(ID=id).first()
                                        if priv:
                                            userPrivileges.append(priv)
                                    
                                    user.AdminPrivileges = userPrivileges
                                    if (session['current_user_id'] == user.ID):
                                        newPrivileges: list[int] = [priv.ID for priv in userPrivileges]
                                        session['current_user_privileges'] = newPrivileges

                                    db.session.commit()
                                    return {'user': user.toJSONPartial()}, 201 
                            else:
                                return {'msg': 'No such admin user'}, 404  
                        else:
                            return {'msg': 'No user id included in request'}, 400
                    else:
                        return {'msg': 'No body in the request'}, 400
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to edit admin privileges.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def post(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    data = request.json
                    if data:
                        id = data.get("ID")
                        if id:
                            user: models.User = models.User.query.filter_by(ID=id).first()
                            if user:                            
                                privileges: list[models.AdminPrivilege] = []
                                
                                allPrivileges: list[models.AdminPrivilege] = models.AdminPrivilege.query.all()
                                
                                privileges.append(allPrivileges[0])
                                privileges.append(allPrivileges[2])
                                privileges.append(allPrivileges[3])
                                    
                                user.AdminPrivileges = privileges
                                if (session['current_user_id'] == user.ID):
                                    adminPrivs: list[int] = [priv.ID for priv in privileges]
                                    session['current_user_privileges'] = adminPrivs

                                db.session.commit()
                                return {'user': user.toJSONPartial()}, 201
                            else:
                                return {'msg', 'No user found with given ID'}, 404
                        else:
                            return {'msg': 'No user id included in request'}, 400
                    else:
                        return {'msg': 'No body in the request'}, 400
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to add users as admins.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def delete(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    id = request.args.get("ID")
                    user: models.User = models.User.query.filter_by(ID=id).first()
                    if user:
                        user_privs: list[int] = [priv.ID for priv in user.AdminPrivileges]

                        if 5 in user_privs:
                            super_admins: list[models.User] = []
                            users = models.User.query.all()
                            for tempUser in users:
                                for priv in tempUser.AdminPrivileges:
                                    if priv.ID == 5:
                                        super_admins.append(tempUser)

                            if len(super_admins) > 1:
                                user.AdminPrivileges = []
                                if (session['current_user_id'] == user.ID):
                                    session['current_user_privileges'] = []
                                    
                                db.session.commit()
                                return {'msg': 'Super Admin Deleted'}, 200
                            else:
                                return {'msg': 'WARNING: Please add at least one other super admin before deleting sole super admin!'}, 403
                        else:
                            user.AdminPrivileges = []
                            if (session['current_user_id'] == user.ID):
                                session['current_user_privileges'] = []

                            db.session.commit()
                            return {'msg': 'Admin Deleted'}, 200
                    else:
                        return {'msg': 'No such admin user'}, 404
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to remove users as admins.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 403
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/admins/search", methods=["OPTIONS", "GET"])
class AdminSearch(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    searchQuery = request.args.get("searchQuery")

                    users: list[models.User] = models.User.query.filter(
                        or_(
                            models.User.FName.ilike(f"%{searchQuery}%"),
                            models.User.LName.ilike(f"%{searchQuery}%"),
                            models.User.Email.ilike(f"%{searchQuery}%")
                        )
                    ).all()
                    
                    admins = []
                    for user in users:
                        if len(user.AdminPrivileges) > 0:
                            admins.append(user)
                    
                    returnableAdmins = [admin.toJSONPartial() for admin in admins]
                    
                    return {'admins': returnableAdmins}, 200
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 403
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/admins", methods=["OPTIONS", "GET"])
class Admins(MethodView):
    def options(self):
        return '', 200

    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    admins = []
                    users = models.User.query.all()
                    for user in users:
                        data = user.toJSON()
                        if data["AdminPrivileges"]:
                            admins.append(user)
                    returnableAdmins = [admin.toJSONPartial() for admin in admins]
                    if returnableAdmins:
                        return {'admins': returnableAdmins}, 200
                    else:
                        return {'msg': 'No admins'}, 200
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
                print(f"Error: {e}")
                traceback.print_exc()
                return {'msg': f"Error: {e}"}, 500

@apiv1.route("/category", methods=["OPTIONS", "GET", "POST", "PUT"])
class Category(MethodView):
    def options(self):
        return '', 200
    
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                id = request.args.get("ID")
                category: models.MetaTag = models.MetaTag.query.filter_by(ID=id).first()
                return {'category': category.toJSON()}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
    def post(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    data = request.json
                    if data:
                        tagName = data.get("TagName")
                        if len(tagName) > 30:
                            return {'msg': 'Category name exceeds database limit of 30 characters.'}, 400

                        newCategory = models.MetaTag(TagName=tagName)

                        db.session.add(newCategory)
                        db.session.commit()
                        print("New category created")
                        return {'ID': newCategory.ID, 'TagName': newCategory.TagName}, 201
                    else:
                        return {'msg': 'No content submitted'}, 400
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    category_updated = request.json
                    userID = session['current_user_id']
                    
                    if category_updated:
                        id: int = category_updated.get("ID")
                        tagName: str = category_updated.get('TagName')
                        if len(tagName) > 30:
                            return {'msg': 'Category name exceeds database limit of 30 characters.'}, 400

                        category = models.MetaTag.query.filter(models.MetaTag.ID == id).first()
                        if not category:
                            return {'msg': 'Article not found'}, 404
                        category.TagName = tagName
                        
                        db.session.commit()
                        return {'msg': 'Category updated successfully'}, 200
                    else:
                        return {'msg': 'No content submitted'}, 400
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/articletag", methods=["OPTIONS", "GET", "POST", "PUT"])
class ArticleTag(MethodView):
    def options(self):
        return '', 200
    
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    id = request.args.get("ID")
                    category: models.Tag = models.Tag.query.filter_by(ID=id).first()
                    return {'Tag': category.toJSON()}, 200
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def post(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    data = request.json()
                    if data:
                        tagName = data.get("TagName")
                        newTag = models.Tag(TagName=tagName)

                        db.session.add(newTag)
                        db.session.commit()
                        return {'Article tag': newTag.toJSON()}, 201
                    else:
                        return {'msg': 'No content submitted'}, 400
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to create a new article tag.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 5 in session['current_user_privileges']:
                    tag_updated = request.json
                    
                    if tag_updated:
                        id: int = tag_updated.get("ID")
                        tagName: str = tag_updated.get('TagName')

                        tag = models.Tag.query.filter(models.Tag.ID == id).first()
                        if not tag:
                            return {'msg': 'Tag not found'}, 404
                        tag.TagName = tagName
                        
                        db.session.commit()
                        return {'msg': 'Article tag updated successfully'}, 200
                    else:
                        return {'msg': 'No content submitted'}, 400
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to edit an existing article tag.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/articletag/getall", methods=["OPTIONS", "GET"])
class TagNames(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session:
                tags = models.Tag.query.all()
                returnTags = [tag.toJSONPartial() for tag in tags]
                db.session.commit()
                return {'Tags': returnTags}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
## returns all meta tags in the database, for UI purposes
@apiv1.route("/metatags/getall", methods=["OPTIONS", "GET"])
class MetaTagNames(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session:
                metatags = models.MetaTag.query.all()
                returnMetaTags = [metatag.toJSONPartial() for metatag in metatags]
                db.session.commit()
                return {'MetaTags': returnMetaTags}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/categories", methods=["OPTIONS", "GET", "POST"])
class Categories(MethodView):
    def options(self):
        return '', 200

    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                categories: list[models.MetaTag] = models.MetaTag.query.all()
                returnableCategories = [category.toJSONPartial() for category in categories]
                return {'categories': returnableCategories}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/articles/search", methods=["OPTIONS", "GET"])
class Search(MethodView):
    def options(self):
        return '', 200
    
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                searchQuery: str = request.args.get("searchQuery")

                if len(searchQuery) > 3:
                    searchQuery = correct_query(searchQuery)
                    smartSearchQuery = [term.lower() for term in searchQuery.split(" ")]

                    for term in searchQuery.lower().split(" "):
                        if term in stopWords:
                            smartSearchQuery.remove(term)

                    search_results = tfidf_search(smartSearchQuery)
                    search_results = hybrid_search(search_results, searchQuery)

                    all_articles: list[models.Article] = models.Article.query.all()

                    articles = list()
                    for articleID, importance in search_results:
                        a = next((article for article in all_articles if article.ID == articleID and importance > 0.0), None)
                        if a is not None:
                            articles.append(a)
                else:
                    articles = models.Article.query.filter(
                        or_(
                            models.Article.Title.ilike(f"%{searchQuery}%"),
                            models.Article.Content.ilike(f"%{searchQuery}%"),
                            models.Article.Article_Description.ilike(f"%{searchQuery}%")
                        )
                    ).all()

                returnedArticles = [article.toJSONPartial() for article in articles]

                if len(searchQuery) > 500:
                    truncatedQuery: str = searchQuery[:500]
                else:
                    truncatedQuery: str = searchQuery

                search = models.Search(SearchQuery=truncatedQuery, UserID=session.get('current_user_id'))
                db.session.add(search)
                
                topResult = articles[0] if len(articles) > 0 else None
                if topResult:
                    search.TopResult = topResult.ID
                    
                secondResult = articles[1] if len(articles) > 1 else None
                if secondResult:
                    search.SecondResult = secondResult.ID
                
                thirdResult = articles[2] if len(articles) > 2 else None
                if thirdResult:
                    search.ThirdResult = thirdResult.ID
                
                fourthResult = articles[3] if len(articles) > 3 else None
                if fourthResult:
                    search.FourthResult = fourthResult.ID
                
                fifthResult = articles[4] if len(articles) > 4 else None
                if fifthResult:
                    search.FifthResult = fifthResult.ID

                db.session.commit()
                
                return {'results': returnedArticles}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/categories/articles", methods=["OPTIONS", "GET"])
class ArticleCategories(MethodView):
    def options(self):
        return '', 200
    
    def get(self): # not used in any student only routes, but doesn't seem like it needs to be admin only?
        try:
            if 'current_user_id' in session and 'current_user_roles' in session and 'current_user_privileges' in session:
                category = request.args.get("category")
                metaTag: models.MetaTag = models.MetaTag.query.filter_by(tagName=category).first()
                articles: list[models.Article] = metaTag.Articles
                returnableArticles = [article.toJSONPartial() for article in articles]
                return {'articles': returnableArticles}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401

        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500      
        
@apiv1.route("/user/viewedarticles", methods=["OPTIONS", "GET"])
class UserViewHistory(MethodView):
    def options(self):
        return '', 200
    
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                recentlyViewedArticles: list[models.Article] = models.Article.query.join(
                    models.ViewHistory
                ).filter_by(
                    UserID=session.get('current_user_id')
                ).order_by(
                    models.ViewHistory.View_Time.desc()
                ).all()
                
                returnableArticles = [article.toJSONPartial() for article in recentlyViewedArticles]
                return {'articles': returnableArticles}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/articles/indepth", methods=["OPTIONS", "GET"])
class ArticlesInDepth(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    time = request.args.get("time")
                    if time:
                        try:
                            time_int = float(time)
                            time_datetime = datetime.fromtimestamp(time_int)
                            size = request.args.get("size")
                            size_int = 10
                            if size:
                                try:
                                    size_int = int(size)
                                except ValueError:
                                    return {'msg': 'Incorrect size argument. size should be an int'}, 400
                            
                            articles: list[models.Article] = models.Article.query.all()
                            thumbs_up_counts = [article.ThumbsUp for article in articles]
                            thumbs_down_counts = [article.ThumbsDown for article in articles]

                            returnable_articles = [article.toJSONPartial() for article in articles]
                            
                            articleSearches = {}
                            searches: list[models.Search] = models.Search.query.filter(
                                models.Search.SearchTime >= time_datetime
                            ).all()
                            for search in searches:
                                if search.TopResult in articleSearches:
                                    articleSearches[search.TopResult] += 1
                                else:
                                    articleSearches[search.TopResult] = 1
                                    
                                if search.SecondResult in articleSearches:
                                    articleSearches[search.SecondResult] += 1
                                else:
                                    articleSearches[search.SecondResult] = 1
                                    
                                if search.ThirdResult in articleSearches:
                                    articleSearches[search.ThirdResult] += 1
                                else:
                                    articleSearches[search.ThirdResult] = 1
                                    
                                if search.FourthResult in articleSearches:
                                    articleSearches[search.FourthResult] += 1
                                else:
                                    articleSearches[search.FourthResult] = 1
                                    
                                if search.FifthResult in articleSearches:
                                    articleSearches[search.FifthResult] += 1
                                else:
                                    articleSearches[search.FifthResult] = 1
                                    
                            returnableSearchCount = []
                            
                            for addr in articles:
                                if addr.ID in articleSearches:
                                    returnableSearchCount.append(articleSearches[addr.ID])
                                else:
                                    returnableSearchCount.append(0)
                            
                            return {
                                'articles': returnable_articles, 
                                'thumbs_up': thumbs_up_counts,
                                'thumbs_down': thumbs_down_counts,
                                'searches': returnableSearchCount
                            }, 200 
                            
                        except ValueError as e:
                            print(f"Error: {e}")
                            traceback.print_exc()
                            return {'msg': 'Incorrect time format. time should be in unix format'}, 400
                    else:
                        return {'msg': 'no time argument included in request'}, 400
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/articles/popular", methods=["OPTIONS", "GET"])
class ArticlesPopular(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    time = request.args.get("time")
                    if time:
                        try:
                            time_int = float(time)
                            time_datetime = datetime.fromtimestamp(time_int)
                            size = request.args.get("size")
                            size_int = 10
                            if size:
                                try:
                                    size_int = int(size)
                                except ValueError:
                                    return {'msg': 'Incorrect size argument. size should be an int'}, 400
                            
                            articles_with_thumbs_up = db.session.query(
                                models.Article,
                                func.count(models.Feedback.ID).label('thumbs_up_count')
                            ).join(
                                models.Feedback, models.Article.ID == models.Feedback.ArticleID
                            ).filter(
                                models.Feedback.Submission_Time >= time_datetime,
                                models.Feedback.Positive == True
                            ).group_by(
                                models.Article.ID
                            ).order_by(
                                func.count(models.Feedback.ID).desc()
                            ).limit(size_int).all()

                            articles = [article for article, thumbs_up_count in articles_with_thumbs_up]
                            thumbs_up_counts = [thumbs_up_count for article, thumbs_up_count in articles_with_thumbs_up]
                            
                            returnable_articles = [article.toJSONPartial() for article in articles]
                            return {'articles': returnable_articles, 'thumbs_up': thumbs_up_counts}, 200 
                            
                        except ValueError:
                            return {'msg': 'Incorrect time format. time should be in unix format'}, 400
                    else:
                        return {'msg': 'no time argument included in request'}, 400
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/articles/problems", methods=["OPTIONS", "GET"])
class ArticlesProblems(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    time = request.args.get("time")
                    if time:
                        try:
                            time_int = float(time)
                            time_datetime = datetime.fromtimestamp(time_int)
                            size = request.args.get("size")
                            
                            articles: list[models.Article] = (
                                                        db.session.query(models.Article)
                                                        .filter(models.Article.ThumbsDown > 0)  # Only include articles with more than 0 thumbs down
                                                        .order_by(desc(models.Article.ThumbsDown))  # Sort by ThumbsDown in descending order
                                                        .limit(10)  # Limit to the top 10 articles
                                                        .all()  # Execute the query and return the results
                                                    )
                            
                            returnable_articles = [article.toJSONPartial() for article in articles]
                            return {'articles': returnable_articles}, 200   
                        except ValueError:
                            return {'msg': 'Incorrect time format. time should be in unix format'}, 400
                    else:
                        return {'msg': 'no time argument included in request'}, 400
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
          
@apiv1.route("/articles/backlog", methods=["OPTIONS", "GET"])
class Backlog(MethodView):
    def options(self):
        return '', 200
    
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 4 in session['current_user_privileges']:
                    articles = models.Article.query.all()
                    published = []

                    for article in articles:  
                        for tag in article.Tags:
                            if tag.ID == 1:
                                published.append(article)

                    backlog = [article for article in articles if article not in published]
                    returnableBacklog = [article.toJSONPartial() for article in backlog]
                    return {'backlog': returnableBacklog}, 200
                else:
                    if session['current_user_role'] == "student":
                        return {'msg': 'Unauthorized access'}, 403
                    else:
                        return {'msg': 'You do not have permission to access the admin backlog.'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
              
@apiv1.route("/nosolution", methods=["OPTIONS", "POST"])
class NoSolution(MethodView):
    def options(self):
        return '', 200
    
    def post(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                data = request.json
                if data:
                    content = data.get("content")
                    if content:
                        if len(content) > 500:
                            truncatedContent: str = content[:500]
                        else:
                            truncatedContent: str = content

                        newNoSolution: models.NoSolution = models.NoSolution(Content=truncatedContent, UserID=session["current_user_id"])
                        db.session.add(newNoSolution)
                        db.session.commit()
                        return {'NoSolution': newNoSolution.toJSON()}, 201
                    else:
                       return {'msg': 'No content submitted '}, 400 
                else:
                    return {'msg': 'No content submitted '}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/feedback", methods=["OPTIONS", "GET", "POST"])
class Feedback(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                    user = session['current_user_id']
                    article = request.args.get("articleID")
                    recentFeedback: models.Feedback = models.Feedback.query.filter(models.Feedback.UserID == user, models.Feedback.ArticleID == article).first()
                    if recentFeedback:
                        return {"exists": True, "positive": recentFeedback.Positive}
                    else:
                        return {"exists": False}
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f'Error: {e}'}
        
    def post(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                data = request.json
                if data:
                    submission_time = datetime.now()
                    positive = data.get("Positive")
                    userID = session['current_user_id']
                    articleID = data.get("ArticleID")
                    
                    oldFeedback: models.Feedback = models.Feedback.query.filter(
                        models.Feedback.UserID == userID,
                        models.Feedback.ArticleID == articleID
                    ).first()

                    article: models.Article = models.Article.query.filter_by(ID=articleID).first()

                    if oldFeedback:
                        if positive == True and oldFeedback.Positive == False:
                            article.ThumbsUp = (article.ThumbsUp + 1) if article.ThumbsUp else 1
                            article.ThumbsDown = (article.ThumbsDown - 1) if article.ThumbsDown else 0
                        elif positive == False and oldFeedback.Positive == True:
                            article.ThumbsUp = (article.ThumbsUp - 1) if article.ThumbsUp else 0
                            article.ThumbsDown = (article.ThumbsDown + 1) if article.ThumbsDown else 1
                        else:
                            return {'msg': 'No update made in request'}, 400
                        
                        oldFeedback.Positive = positive
                        oldFeedback.Submission_Time = submission_time

                        db.session.commit()
                        return {'Feedback': oldFeedback.toJSON()}, 201

                    if positive == True:
                        if article.ThumbsUp:
                            article.ThumbsUp = article.ThumbsUp + 1
                        else:
                            article.ThumbsUp = 1
                    else:
                        if article.ThumbsDown:
                            article.ThumbsDown = article.ThumbsDown + 1
                        else:
                            article.ThumbsDown = 1
                    
                    newFeedback: models.Feedback = models.Feedback(Submission_Time=submission_time, Positive=positive, UserID=userID, ArticleID=articleID)
                    db.session.add(newFeedback)
                    db.session.commit()
                    return {'Feedback': newFeedback.toJSON()}, 201
                else:
                    return {'msg': 'No content submitted '}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/searches/problems", methods=["OPTIONS", "GET"])
class SearchesProblems(MethodView):
    def options(self):
        return '', 200

    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    time = request.args.get("time")
                    if time:
                        try:
                            time_int = float(time)
                            time_datetime = datetime.fromtimestamp(time_int)
                            
                            no_solutions: list[models.NoSolution] = models.NoSolution.query.filter(
                                models.NoSolution.Submission_Time >= time_datetime
                            ).order_by(
                                models.NoSolution.Submission_Time.desc()
                            ).all()
                            
                            problemSearches: list[models.Search] = []
                            seen_search_ids = set()
                            
                            for noSol in no_solutions:
                                submitTime = noSol.Submission_Time
                                uid = noSol.UserID
                                
                                closest_search: models.Search = models.Search.query.filter(
                                    models.Search.UserID == uid,
                                    models.Search.SearchTime <= submitTime
                                ).order_by(
                                    models.Search.SearchTime.desc()
                                ).first()
                                
                                if closest_search and closest_search.SearchID not in seen_search_ids:
                                    problemSearches.append(closest_search)
                                    seen_search_ids.add(closest_search.SearchID)
                            
                            returnableSearches = [s.toJSONPartial() for s in problemSearches]
                            
                            return {'searches': returnableSearches}                            
                            
                        except ValueError:
                            return {'msg': 'Incorrect time format. time should be in unix format'}, 400
                    else:
                        return {'msg': 'no time argument included in request'}, 400
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
   
@apiv1.route("/system/usage", methods=["OPTIONS", "GET"])
class SystemUsage(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    time1 = datetime.now() - timedelta(hours=24)
                    time2 = time1 - timedelta(hours=24)
                    time3 = time2 - timedelta(hours=24)
                    time4 = time3 - timedelta(hours=24)
                    time5 = time4 - timedelta(hours=24)
                    
                    searches1_count = models.Search.query.filter(
                        models.Search.SearchTime >= time1
                    ).with_entities(func.count()).scalar()
                    viewHistory1_count = models.ViewHistory.query.filter(
                        models.ViewHistory.View_Time >= time1
                    ).with_entities(func.count()).scalar()
                    usageVal1 = (searches1_count*3) + viewHistory1_count

                    searches2_count = models.Search.query.filter(
                        models.Search.SearchTime >= time2,
                        models.Search.SearchTime < time1
                    ).with_entities(func.count()).scalar()
                    viewHistory2_count = models.ViewHistory.query.filter(
                        models.ViewHistory.View_Time >= time2,
                        models.ViewHistory.View_Time < time1
                    ).with_entities(func.count()).scalar()
                    usageVal2 = (searches2_count*3) + viewHistory2_count

                    searches3_count = models.Search.query.filter(
                        models.Search.SearchTime >= time3,
                        models.Search.SearchTime < time2
                    ).with_entities(func.count()).scalar()
                    viewHistory3_count = models.ViewHistory.query.filter(
                        models.ViewHistory.View_Time >= time3,
                        models.ViewHistory.View_Time < time2
                    ).with_entities(func.count()).scalar()
                    usageVal3 = (searches3_count*3) + viewHistory3_count

                    searches4_count = models.Search.query.filter(
                        models.Search.SearchTime >= time4,
                        models.Search.SearchTime < time3
                    ).with_entities(func.count()).scalar()
                    viewHistory4_count = models.ViewHistory.query.filter(
                        models.ViewHistory.View_Time >= time4,
                        models.ViewHistory.View_Time < time3
                    ).with_entities(func.count()).scalar()
                    usageVal4 = (searches4_count*3) + viewHistory4_count

                    searches5_count = models.Search.query.filter(
                        models.Search.SearchTime >= time5,
                        models.Search.SearchTime < time4
                    ).with_entities(func.count()).scalar()
                    viewHistory5_count = models.ViewHistory.query.filter(
                        models.ViewHistory.View_Time >= time5,
                        models.ViewHistory.View_Time < time4
                    ).with_entities(func.count()).scalar()
                    usageVal5 = (searches5_count*3) + viewHistory5_count
                    
                    return {
                        "usage_data": [
                            {
                                "name": (time5 + timedelta(hours=24)).strftime("%m-%d"),
                                "value": usageVal5
                            },
                            {
                                "name": (time4 + timedelta(hours=24)).strftime("%m-%d"),
                                "value": usageVal4
                            },
                            {
                                "name": (time3 + timedelta(hours=24)).strftime("%m-%d"),
                                "value": usageVal3
                            },
                            {
                                "name": (time2 + timedelta(hours=24)).strftime("%m-%d"),
                                "value": usageVal2
                            },
                            {
                                "name": (time1 + timedelta(hours=24)).strftime("%m-%d"),
                                "value": usageVal1
                            }
                        ]
                    }, 200
                    
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/system/stats", methods=["OPTIONS", "GET"])
class SystemStats(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    one_week_ago = datetime.now() - timedelta(weeks=1)
        
                    user_count = db.session.query(func.count(models.User.ID)).scalar()
                    article_count = db.session.query(func.count(models.Article.ID)).scalar()
                    search_count = db.session.query(func.count(models.Search.SearchID)).filter(models.Search.SearchTime >= one_week_ago).scalar()
                    
                    return {
                        'user_count': user_count,
                        'article_count': article_count,
                        'search_count': search_count
                    }
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/articles/search/tagandquery", methods=["OPTIONS", "GET"])
class SystemStatsSearch(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) >= 0:
                    searchQuery = request.args.get("searchQuery")
                    smartSearchQuery = [term.lower() for term in searchQuery.split(" ")]

                    for term in searchQuery.split(" "):
                        if term in stopWords or len(term) == 0:
                            smartSearchQuery.remove(term)

                    tags = request.args.get("tags")
                    if len(tags) > 0:
                        tagNames = tags.split(",")
                    else:
                        tagNames = ["Published", "Needs Review", "High Priority", "In Progress", "Archived"]

                    print(len(tagNames))

                    if len(smartSearchQuery) > 0:
                        search_results = tfidf_search(smartSearchQuery)
                        search_results = hybrid_search(search_results, searchQuery)
                        all_articles: list[models.Article] = models.Article.query.all()

                        tagIds: list[int] = []
                        if len(tagNames) > 0:
                            for tag in tagNames:
                                tagId = models.Tag.query.filter_by(TagName=tag).first().ID
                                tagIds.append(tagId)
                        else:
                            tagIds = []
                        
                        print(tagIds)
                        taggedArticles: list[models.Article] = []

                        for x in all_articles:
                            for tag in x.Tags:
                                if tag.ID in tagIds or len(tagIds) == 0:
                                    taggedArticles.append(x)
                                    break

                        articles = list()
                        for articleID, importance in search_results:
                            a = next((article for article in all_articles if article.ID == articleID and article in taggedArticles and importance > 0.0), None)
                            if a is not None:
                                articles.append(a)
                    else:
                        articles = list()
                        if len(tagNames) > 0:
                            for tag in tagNames:
                                actualTag: models.Tag = models.Tag.query.filter_by(TagName=tag).first()
                                articles.extend(actualTag.Articles)
                    
                    totalArticles = list(articles)

                    returnableArticles = [article.toJSONPartial() for article in totalArticles]
                    
                    return {'results': returnableArticles}, 200
                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/article/tags", methods=["OPTIONS", "GET", "PUT"])
class SystemStatsSearch(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:

                    articleID = request.args.get("ArticleID")
                    
                    if int(articleID) >= 0:
                        article: models.Article = models.Article.query.filter_by(ID=articleID).first()

                        tags = []
                        for tag in article.Tags:
                            tags.append(tag)
                        
                        returnableTags = [tag.toJSONPartial() for tag in tags]
                        db.session.commit()

                        return {'tags': returnableTags}, 200
                    else:
                        return {'msg': "Creating Article"}, 200

                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 3 in session['current_user_privileges']:
                    tag_updated = request.json

                    if tag_updated:
                        article_id: int = tag_updated.get("articleID")
                        tag_id: int = tag_updated.get("tagID")
                        article = models.Article.query.get(article_id)
                        if article:
                            tag = models.Tag.query.get(tag_id)
                            article.Tags = [tag]
                            db.session.commit()

                            return {'msg': 'Article tag updated successfully.'}, 200
                        else:
                            return {'msg': 'No article provided.'}, 400
                    else:
                        return {'msg': 'No data provided.'}, 400
                else:
                    return {'msg': 'Unauthorized privileges.'}, 403
            else:
                return {'msg': 'Unauthorized access.'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/article/thumbs_down_dates/", methods=["OPTIONS", "GET"])
class ArticleThumbsDownDates(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:
                    
                    
                    articles: list[models.Article] = (
                                                        db.session.query(models.Article)
                                                        .filter(models.Article.ThumbsDown > 0)  # Only include articles with more than 0 thumbs down
                                                        .order_by(desc(models.Article.ThumbsDown))  # Sort by ThumbsDown in descending order
                                                        .limit(10)  # Limit to the top 10 articles
                                                        .all()  # Execute the query and return the results
                                                    )
                        
                    articles_to_thumbs_down = {}
                        
                    for article in articles:
                        articleID = article.ID
                        thumbs_down_dates = models.Feedback.query.with_entities(models.Feedback.Submission_Time).filter(
                            and_(
                                models.Feedback.ArticleID == articleID,
                                models.Feedback.Positive == False  # Filtering only thumbs-down feedback
                            )  
                            
                            ).order_by(models.Feedback.Submission_Time.desc()).all()

                        dates = [date[0] for date in thumbs_down_dates]

                        milliDates = []

                        for date in dates:
                            print(article.ID)
                            print(date.timestamp())
                            milliDates.append(date.timestamp())

                        timeNow = datetime.now().timestamp()
                        weight = 0

                        for date in milliDates:
                            weight+=(abs(1/timeNow - date))

                        articles_to_thumbs_down[articleID] = weight

                    sorted_dict_desc = dict(sorted(articles_to_thumbs_down.items(), key=lambda item: item[1], reverse=True))
                    print(sorted_dict_desc)
                    sorted_article_ids = list(sorted_dict_desc.keys())

                    sorted_articles = []                        
                    for id in sorted_article_ids:
                        temp_article = models.Article.query.filter_by(ID=id).first()
                        sorted_articles.append(temp_article)

                    db.session.commit()

                    returnable_sorted_articles = [article.toJSONPartial() for article in sorted_articles]                        

                    return {'articles': returnable_sorted_articles}, 200
                    

                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/articles/trending/", methods=["OPTIONS", "GET"])
class TrendingArticles(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                articles: list[models.Article] = (
                    db.session.query(models.Article)
                    .join(models.Article.Tags)
                    .filter(models.Tag.TagName == 'Published')
                    .all()  # Execute the query and return the results
                )

                articles_to_views = {}
                    
                for article in articles:
                    articleID = article.ID
                    view_dates = models.ViewHistory.query.with_entities(
                        models.ViewHistory.View_Time
                    ).filter(
                        models.ViewHistory.ArticleID == articleID
                    ).order_by(
                        models.ViewHistory.View_Time.desc()
                    ).all()

                    # print(articleID)
                    #print(view_dates)

                    dates = [date[0] for date in view_dates]

                    milliDates = []

                    for date in dates:
                        #print(article.ID)
                        #print(date.timestamp())
                        milliDates.append(date.timestamp())

                    timeNow = datetime.now().timestamp()
                    weight = 0

                    for date in milliDates:
                        weight+=(abs(1/((timeNow - date)+date))/timeNow)

                    articles_to_views[articleID] = weight

                sorted_dict_desc = dict(sorted(articles_to_views.items(), key=lambda item: item[1], reverse=True))
                sorted_article_ids = list(sorted_dict_desc.keys())

                sorted_articles = []                        
                for id in sorted_article_ids:
                    temp_article = models.Article.query.filter_by(ID=id).first()
                    sorted_articles.append(temp_article)

                db.session.commit()

                returnable_sorted_articles = [article.toJSONPartial() for article in sorted_articles]                      

                return {'articles': returnable_sorted_articles}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/article/categories", methods=["OPTIONS", "GET", "PUT"])
class SystemStatsSearch(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if len(session['current_user_privileges']) > 0:

                    articleID = request.args.get("ArticleID")
                    
                    if int(articleID) >= 0:
                        article: models.Article = models.Article.query.filter_by(ID=articleID).first()

                        metatags = []
                        for metatag in article.MetaTags:
                            metatags.append(metatag)
                        
                        returnableMetaTags = [metatag.toJSONPartial() for metatag in metatags]
                        db.session.commit()

                        return {'metatags': returnableMetaTags}, 200
                    else:
                        return {'msg': "Creating Article"}, 200

                else:
                    return {'msg': 'Unauthorized access'}, 403
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session and 'current_user_privileges' in session:
                if 3 in session['current_user_privileges']:
                    metatag_updated = request.json

                    if metatag_updated:
                        article_id: int = metatag_updated.get("articleID")
                        metatag_id: int = metatag_updated.get("metatagID")
                        print(metatag_id)
                        article = models.Article.query.get(article_id)
                        if article:
                            metatag = models.MetaTag.query.get(metatag_id)
                            article.MetaTags = [metatag]
                            db.session.commit()

                            return {'msg': 'Article metatag updated successfully.', 
                                    'metatag id': metatag_id}, 200
                        else:
                            return {'msg': 'No article provided.'}, 400
                    else:
                        return {'msg': 'No data provided.'}, 400
                else:
                    return {'msg': 'Unauthorized privileges.'}, 403
            else:
                return {'msg': 'Unauthorized access.'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/image", methods=["OPTIONS", "GET", "PUT", "POST", "DELETE"])
class ImageUpload(MethodView):
    def options(self):
        return '', 200
    def post(self):
        try:
            if 'image' not in request.files:
                return {'msg': 'No file found'}, 400
            file = request.files['image']
            if file.filename == '':
                return {'msg': 'No file selected'}, 400
            articleID = request.form.get("articleID")
            article: models.Article = models.Article.query.get(articleID)
            filename = secure_filename(os.path.basename(file.filename))
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print(filepath)
            file.save(filepath)
            article.Image = filepath
            db.session.commit()
            image_url = url_for('uploaded_file', filename=filename, _external=True)
            return {'msg': 'Image saved successfully', 'url': image_url}, 200
        except Exception as e:
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

# this route is only used by the /image POST route to fetch the URL of an image        
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)