from flask.views import MethodView
from flask_smorest import Blueprint
from flask import session, request, jsonify, redirect, render_template, url_for
from sqlalchemy import or_, desc
from app import app, db, auth

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

TENANT_ID = os.getenv("TENANT_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
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