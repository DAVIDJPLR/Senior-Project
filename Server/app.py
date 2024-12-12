import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

scriptdir = os.path.dirname(os.path.abspath(__file__))
dbfile = os.path.join(scriptdir, "help.sqlite3")

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbfile}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Article(db.Model):
    __tablename__ = 'Articles'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode, nullable=False)
    content = db.Column(db.Unicode, nullable=False)
    description = db.Column(db.Unicode, nullable=False)
    image = db.Column(db.Unicode)
    good = db.Column(db.Integer, nullable=False)
    bad = db.Column(db.Integer, nullable=False)
    usefulness = db.Column(db.Float, nullable=False)

@app.get("/")
def main():
    return {
        "message": "Hello World"
    }

@app.get("/search/")
def view_articles():
    pass

