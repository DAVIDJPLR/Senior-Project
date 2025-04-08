import os

from flask import Flask, session, redirect, render_template, request, url_for, jsonify
from werkzeug.utils import secure_filename
import posixpath as psx
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy

scriptdir = os.path.abspath(os.path.dirname(__file__))
static_path = os.path.join(scriptdir, 'static')
app = Flask(__name__)

# The supports_credentials argument ensures that cookies get passed back 
# and forth between the front end and the backend to maintain the same session
# when appropriate
CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'https://computerhelp.gcc.edu'])

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://root:C0dePr0j$@10.18.103.22:3306/helpgccedu"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['UPLOAD_FOLDER'] = static_path
os.makedirs(static_path, exist_ok=True)
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# TODO: Change secret key to something more secure at some point
app.config['SECRET_KEY'] = 'correcthorsebatterystaple'

db = SQLAlchemy(app)
# @app.before_request
# def set_session_constants():
#     # session['current_user_id'] = 1
#     # session['current_user_role'] = 'admin'

from blueprints.blueprints_v1 import apiv1
app.register_blueprint(apiv1)