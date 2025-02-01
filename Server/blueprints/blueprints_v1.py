from flask.views import MethodView
from flask_smorest import Blueprint
from flask import session, request, jsonify
from sqlalchemy import or_, desc, func, select
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

                topResult = returnedArticles[0] if len(returnedArticles) > 0 else None
                secondResult = returnedArticles[1] if len(returnedArticles) > 1 else None
                thirdResult = returnedArticles[2] if len(returnedArticles) > 2 else None
                fourthResult = returnedArticles[3] if len(returnedArticles) > 3 else None
                fifthResult = returnedArticles[4] if len(returnedArticles) > 4 else None

                search = models.Search(SearchQuery=searchQuery, UserID=session.get('current_user_id'), TopResult=topResult,
                                       SecondResult=secondResult, ThirdResult=thirdResult,
                                       FourthResult=fourthResult, FifthResult=fifthResult)
                db.session.add(search)
                
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