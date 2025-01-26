from flask.views import MethodView
from flask_smorest import Blueprint
from flask import session, request, jsonify
from app import db

import time
import traceback
import models

import datetime

apiv1 = Blueprint(
    "apiv1", 
    "apiv1", 
    url_prefix="/api/v1/", 
    description="Version 1 of the backend rest api for help.gcc.edu"
)

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
                userID = request.args.get("userID")
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
                    eh = models.EditHistory(ArticleID=id, UserID=userID,
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
                        admins.append[user]
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