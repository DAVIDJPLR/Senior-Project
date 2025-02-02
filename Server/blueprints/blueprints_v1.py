from flask.views import MethodView
from flask_smorest import Blueprint
from flask import session, request, jsonify, redirect, render_template, url_for
from sqlalchemy import or_, desc, func
from datetime import datetime, timedelta
from app import app, db, auth

from auth import TENANT_ID, CLIENT_ID

import os, traceback, models, requests, jwt, redis
from jwt.algorithms import RSAAlgorithm
import time
import app_config

apiv1 = Blueprint(
    "apiv1", 
    "apiv1", 
    url_prefix="/api/v1/", 
    description="Version 1 of the backend rest api for help.gcc.edu"
)

revoked_tokens = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"

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
            print(token)
            # callmsGraph (Token) get email
            # You need to set session["current_user_id"], session["current_user_role"], session["current_   vileges"]
            return {'msg': "Logged in"}, 200
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    
@apiv1.route("/user/info", methods=["OPTIONS", "GET"])
class UserInfo(MethodView):
    def options(self):
        return '', 200
    def get(self):
        if "current_user_id" in session and "current_user_role" in session and "current_user_privileges" in session:
            return {'msg': "Not implemented yet"}, 501
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
            if 'current_user_id' in session:
                articles: list[models.Article] = models.Article.query.all()
                
                returnableArticles = [article.toJSONPartial() for article in articles]
                return {'articles': returnableArticles}, 200
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
            if 'current_user_id' in session:
                id = request.args.get("userID")
                if id:
                    article = models.Article.query.filter(models.Article.ID == id).all()
                    returnableArticle = article[0].toJSONPartial()
                    return {'article': returnableArticle}, 200
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
            if 'current_user_id' in session:
                article = request.json
                if article:
                    title: str = article.get('Title')
                    content: str = article.get('Content')
                    desc: str = article.get('Article_Description')
                    image: str = article.get('Image')
        
                    article = Article(Title=title, Content=content,
                                      Article_Description=desc,
                                      Image=image)
                    
                    db.session.add(article)
                    db.session.commit()
                else:
                    return {'msg': 'No article submitted'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session:
                article_updated = request.json
                if article_updated:
                    id: int = article_updated.get("ID")
                    title: str = article_updated.get('Title')
                    content: str = article_updated.get('Content')
                    desc: str = article_updated.get('Article_Description')
                    image: str = article_updated.get('Image')

                    article = models.Article.query.filter(models.Article.ID == id).all()
                    article.Title = title
                    article.Content = content
                    article.Article_Description = desc
                    article.Image = image

                    time = datetime.now()
                    eh = models.EditHistory(ArticleID=id, UserID=session['current_user_id'],
                                            Edit_Time=time)
                    db.session.add(eh)
                    
                    db.session.commit()
                else:
                    return {'msg': 'No update data submitted'}, 400
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
            if 'current_user_id' in session and 'current_user_role' in session:
                users: models.User = models.User.query.all()
                
                returnableUsers = [user.toJSONPartial() for user in users]
                
                return {'users': returnableUsers}, 200
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
            if 'current_user_id' in session and 'current_user_role' in session:
                searchQuery = request.args.get("searchQuery")

                users = models.User.query.filter(
                    or_(
                        models.User.FName.ilike(f"%{searchQuery}%"),
                        models.User.LName.ilike(f"%{searchQuery}%"),
                        models.User.Email.ilike(f"%{searchQuery}%")
                    )
                ).all()
                
                returnableUsers = [user.toJSONPartial() for user in users]
                
                return {'users': returnableUsers}, 200
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
            if 'current_user_id' in session and 'current_user_role' in session:
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
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def post(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session:
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
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session:
                data = request.json
                if data:
                    id = data.get("ID")
                    if id:
                        user: models.User = models.User.query.filter_by(ID=id).first()
                        if user:
                            # Email = db.Column(db.Unicode, nullable=True)
                            if data.get("Email"):
                                user.Email = data.get("Email")
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
                            return {'msg', 'No user found with given ID'}, 404
                    else:
                        return {'msg': 'No user id included in request'}, 400
                else:
                    return {'msg': 'No body in the request'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def delete(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session:
                id = request.args.get("ID")
                user: models.User = models.User.query.filter_by(ID=id).first()
                db.session.delete(user)
                db.session.commit()
                if user:
                    return '', 200
                else:
                    return {'msg': 'No such user'}, 404
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
        
@apiv1.route("/admin/privileges", methods=["OPTIONS", "GET"])
class AdminPrivileges(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session:
                privileges: list[models.AdminPrivilege] = models.AdminPrivilege.query.all()
                returnablePrivileges = [priv.toJSONPartial() for priv in privileges]
                return {'privileges': returnablePrivileges}, 200
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
            if 'current_user_id' in session and 'current_user_role' in session:
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
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def put(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session:
                data = request.json
                if data:
                    id = data.get("ID")
                    if id:
                        user: models.User = models.User.query.filter_by(ID=id).first()
                        privilegeIDs = data.get("privilegeIDs")
                        
                        userPrivileges: list[models.AdminPrivilege] = []
                        
                        for id in privilegeIDs:
                            priv: models.AdminPrivilege = models.AdminPrivilege.query.filter_by(ID=id).first()
                            if priv:
                                userPrivileges.append(priv)
                        
                        user.AdminPrivileges = userPrivileges
                        db.session.commit()
                        return {'user': user.toJSONPartial()}, 201   
                    else:
                        return {'msg': 'No user id included in request'}, 400
                else:
                    return {'msg': 'No body in the request'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def post(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session:
                data = request.json
                if data:
                    print(data)
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
                            db.session.commit()
                            return {'user': user.toJSONPartial()}, 201
                        else:
                            return {'msg', 'No user found with given ID'}, 404
                    else:
                        return {'msg': 'No user id included in request'}, 400
                else:
                    return {'msg': 'No body in the request'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500
    def delete(self):
        try:
            if 'current_user_id' in session and 'current_user_role' in session:
                id = request.args.get("ID")
                user: models.User = models.User.query.filter_by(ID=id).first()
                if user:
                    user.AdminPrivileges = []
                    db.session.commit()
                    return {'msg': 'Admin Deleted'}, 200
                else:
                    return {'msg': 'No such user'}, 404
            else:
                return {'msg': 'Unauthorized access'}, 401
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
            if 'current_user_id' in session:
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
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
                print(f"Error: {e}")
                traceback.print_exc()
                return {'msg': f"Error: {e}"}, 500

@apiv1.route("/category", methods=["OPTIONS", "GET"])
class Category(MethodView):
    def options(self):
        return '', 200
    
    def get(self):
        try:
            if 'current_user_id' in session:
                id = request.args.get("ID")
                category: models.MetaTag = models.MetaTag.query.filter_by(ID=id).first()
                return {'category': category.toJSON()}, 200
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/categories", methods=["OPTIONS", "GET"])
class Categories(MethodView):
    def options(self):
        return '', 200

    def get(self):
        try:
            if 'current_user_id' in session:
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
            if 'current_user_id' in session:
                searchQuery = request.args.get("searchQuery")

                articles = models.Article.query.filter(
                    or_(
                        models.Article.Title.ilike(f"%{searchQuery}%"),
                        models.Article.Content.ilike(f"%{searchQuery}%"),
                        models.Article.Article_Description.ilike(f"%{searchQuery}%")
                    )
                ).all()

                returnedArticles = [article.toJSONPartial() for article in articles]
                
                search = models.Search(SearchQuery=searchQuery, UserID=session.get('current_user_id'))
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
                
                print("======================")
                
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
    
    def get(self):
        try:
            if 'current_user_id' in session:
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
            if 'current_user_id' in session:
                recentlyViewedArticles: list[models.Article] = models.Article.query.join(
                    models.ViewHistory, models.Article.ID==models.ViewHistory.ArticleID
                ).filter(
                    models.ViewHistory.UserID == session.get('current_user_id')
                ).order_by(
                    models.ViewHistory.View_Time
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
            if 'current_user_id' in session and session['current_user_role'] == "admin":
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
                        ).outerjoin(
                            models.Feedback, models.Article.ID == models.Feedback.ArticleID
                        ).filter(
                            (models.Feedback.Submission_Time >= time_datetime) | (models.Feedback.ID == None),
                            (models.Feedback.Positive == True) | (models.Feedback.ID == None)
                        ).group_by(
                            models.Article.ID
                        ).order_by(
                            func.count(models.Feedback.ID).desc()
                        ).limit(size_int).all()

                        articles: list[models.Article] = [article for article, thumbs_up_count in articles_with_thumbs_up]
                        thumbs_up_counts = [thumbs_up_count for article, thumbs_up_count in articles_with_thumbs_up]
                        
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
                            'searches': returnableSearchCount
                        }, 200 
                        
                    except ValueError:
                        return {'msg': 'Incorrect time format. time should be in unix format'}, 400
                else:
                    return {'msg': 'no time argument included in request'}, 400
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
            if 'current_user_id' in session and session['current_user_role'] == "admin":
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
            if 'current_user_id' in session and session['current_user_role'] == "admin":
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
                            func.count(models.Feedback.ID).asc()
                        ).limit(size_int).all()

                        articles = [article for article, thumbs_up_count in articles_with_thumbs_up]
                        returnable_articles = [article.toJSONPartial() for article in articles]
                        return {'articles': returnable_articles}, 200   
                    except ValueError:
                        return {'msg': 'Incorrect time format. time should be in unix format'}, 400
                else:
                    return {'msg': 'no time argument included in request'}, 400
            else:
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@apiv1.route("/articles/trending", methods=["OPTIONS", "GET"])
class Trending(MethodView):
    def options(self):
        return '', 200
    def get(self):
        try:
            if 'current_user_id' in session:

                articles = db.session.query(
                    models.Article,
                    func.count(models.ViewHistory.ArticleID).label('view_count')
                ).join(
                    models.ViewHistory, models.Article.ID == models.ViewHistory.ArticleID
                ).group_by(
                    models.Article.ID
                ).order_by(
                    func.count(models.ViewHistory.ArticleID).desc()
                ).all()
                
                returnableArticles = [article.toJSONPartial() for article, ranking in articles]
                return {'articles': returnableArticles}, 200
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
            if 'current_user_id' in session:
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
            if 'current_user_id' in session:
                data = request.json
                if data:
                    content = data.get("content")
                    if content:
                        newNoSolution: models.NoSolution = models.NoSolution(Content=content, UserID=session["current_user_id"])
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
        
@apiv1.route("/searches/problems", methods=["OPTIONS", "GET"])
class SearchesProblems(MethodView):
    def options(self):
        return '', 200
    
    def get(self):
        try:
            if 'current_user_id' in session and session['current_user_role'] == "admin":
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
            if 'current_user_id' in session and session['current_user_role'] == "admin":
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
                return {'msg': 'Unauthorized access'}, 401
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {'msg': f"Error: {e}"}, 500

@app.route("/login")
def login():
    return render_template("login.html", version=__version__, **auth.log_in(
        scopes=app_config.SCOPE, # Have user consent to scopes during log-in
        redirect_uri=url_for("auth_response", _external=True), # Optional. If present, this absolute URL must match your app's redirect_uri registered in Microsoft Entra admin center
        prompt="select_account",  # Optional.
        ))

@app.route(app_config.REDIRECT_PATH)
def auth_response():
    result = auth.complete_log_in(request.args)
    if "error" in result:
        return render_template("auth_error.html", result=result)
    return redirect(url_for("index"))

@apiv1.route("/logout", methods=["OPTIONS", "GET"])
def logout():
    return redirect(auth.log_out(url_for("index", _external=True)))

@apiv1.route("/", methods=["OPTIONS", "GET"])
def index():
    if not (app.config["CLIENT_ID"] and app.config["CLIENT_SECRET"]):
        # This check is not strictly necessary.
        # You can remove this check from your production code.
        return render_template('config_error.html')
    if not auth.get_user():
        return redirect(url_for("login"))
    return render_template('index.html', user=auth.get_user(), version=__version__)

@app.route("/call_downstream_api")
def call_downstream_api():
    token = auth.get_token_for_user(app_config.SCOPE)
    if "error" in token:
        return redirect(url_for("login"))
    # Use access token to call downstream api
    api_result = requests.get(
        app_config.ENDPOINT,
        headers={'Authorization': 'Bearer ' + token['access_token']},
        timeout=30,
    ).json()
    return render_template('display.html', result=api_result)