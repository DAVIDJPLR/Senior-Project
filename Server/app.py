import os

from flask import Flask, session, redirect, render_template, request, url_for, jsonify
from werkzeug.utils import secure_filename
import posixpath as psx
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from auth import DB_LOGIN, SECRET_KEY

scriptdir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)

# The supports_credentials argument ensures that cookies get passed back 
# and forth between the front end and the backend to maintain the same session
# when appropriate
CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'https://computerhelp.gcc.edu'])

app.config['SQLALCHEMY_DATABASE_URI'] = DB_LOGIN
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}
app.config['MAX_CONTENT_SIZE'] = 5 * 1024 * 1024 # 5 MB

# TODO: Change secret key to something more secure at some point
app.config['SECRET_KEY'] = 'correcthorsebatterystaple'

db = SQLAlchemy(app)
# @app.before_request
# def set_session_constants():
#     # session['current_user_id'] = 1
#     # session['current_user_role'] = 'admin'

from blueprints.blueprints_v1 import apiv1
app.register_blueprint(apiv1)