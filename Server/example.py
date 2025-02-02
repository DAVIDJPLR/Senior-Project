from future import annotations
# from app.login import bp
# from app.models import *
# from app.login.loginforms import RegisterForm, LoginForm
from datetime import datetime
from flask import request, jsonify, render_template, redirect, url_for, flash, current_app
from flask_login import login_required
from flask_login import current_user, login_user, logout_user
import os
from werkzeug.utils import secure_filename
import jwt
import requests
from jwt.algorithms import RSAAlgorithm
import redis

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

#File storage:
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def add_dietary_restrictions(restriction_ids, user_id):
    # theoretically this will prevent duplicate data
    UserDietaryRestriction.query.filter_by(user_id=user_id).delete()

    for restriction_id in restriction_ids:
        new_restriction = UserDietaryRestriction(user_id=user_id, restriction_id=restriction_id)
        db.session.add(new_restriction)

    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error adding dietary restrictions for user {user_id}: {e}")

@bp.route('/api/login/sso/', methods=['POST'])
def sso_login():
    data = request.json
    token = data.get("token")

    print("LOGIN TOKEN: ", token)
    decoded = jwt.decode(token, options={"verify_signature": False})
    print("DECODED TOKEN: ", decoded)


    if not token:
        return jsonify({"message": "No token provided"}), 400

    decoded_token = validate_jwt(token)
    if not decoded_token:
        return jsonify({"message": "Invalid token"}), 401

    email = decoded_token.get("preferred_username")  #email
    print(email)
    if not email:
        return jsonify({"message": "Invalid token: No email found"}), 401

    user = User.query.filter_by(email_address=email).first()

    if user:
        login_user(user, remember=True)
        return jsonify({"message": "Login successful", "user_id": user.id}), 200
    else:
        return jsonify({"message": "User not registered"}), 403

@bp.route('/api/logout/', methods=['POST'])
def logout():
    # Get the token from the Authorization header
    token = request.headers.get('Authorization')
    
    # Ensure the token is present in the request
    if not token:
        return jsonify({"message": "Token is missing from request"}), 400

    # Remove "Bearer " prefix if it exists
    token = token.replace("Bearer ", "")

    # Decode the JWT to check its contents without verifying signature for debugging
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        print("Decoded token: ", decoded)
    except jwt.DecodeError as e:
        print(f"Error decoding JWT: {e}")
        return jsonify({"message": "Invalid token"}), 401

    # Now check if the token is an access token or an ID token
    if 'id_token' in decoded:
        # If it's an ID token, you need to handle it differently (probably store it in session or invalidate it based on its session)
        print("ID Token detected - Handle logout with ID token")
        # If you're using the ID token for login, you need to invalidate the session based on that
        # Here you would typically invalidate the user session
        logout_user()
        return jsonify({"message": "Successfully logged out with ID token"}), 200
    
    # Otherwise, it's an access token and you can proceed with the revocation
    decoded_token = validate_jwt(token)
    if not decoded_token:
        return jsonify({"message": "Invalid access token"}), 401

    # Extract the JWT ID (jti) to keep track of the token and revoke it
    jti = decoded_token.get("jti")
    if jti:
        # Store the JWT ID in Redis with a 24-hour expiration time to mark it as revoked
        revoked_tokens.set(jti, "revoked", ex=3600 * 24)  
        print(f"Access token {jti} marked as revoked.")

    # Log out the current user (invalidate the session)
    logout_user()
    return jsonify({"message": "Successfully logged out"}), 200