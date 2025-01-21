import os
import mysql.connector
from mysql.connector import Error

from flask import Flask, request, render_template, redirect, url_for, abort, jsonify
from flask import flash
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin

import json, datetime

scriptdir = os.path.abspath(os.path.dirname(__file__))
dbpath = os.path.join(scriptdir, 'helpgccedu.sqlite3')

app = Flask(__name__)
cors = CORS(app, resources={r"/search/": {"origins": "http://localhost:5173/"}})
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbpath}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'correcthorsebatterystaple'


db = SQLAlchemy(app)

from forms import ArticleForm

@app.get("/")
def main():
    return {
        "message": "Hello World"
    }

from models import Article, AdminPrivilege, Feedback, NoSolution, Search, Tag, User

@app.get('/article/')
def get_article():

    title = request.args.get("title", "How to connect to the GCC WiFi")
    articleData = []

    try:
        connection = mysql.connector.connect(
            host='10.18.103.22',
            database='helpgccedu',
            user='root',
            password='C0dePr0j$'
        )

        if connection.is_connected():

            try:
                cursor = connection.cursor()

                #query = f"SELECT * FROM helpgccedu.Articles WHERE Title = '{title}';"

                art = db.Article.query.filter(Article.title == title).all()


                #cursor.execute(query)
    
                returnableArticle = {
                    'id': art.id,
                    'title': art.title,
                    'content': art.content,
                    'description': art.article_description,
                    'image_name': art.image
                }

                connection.commit()          

                return jsonify({'article': returnableArticle}), 200
            except Exception as e:
                return jsonify({'error': 'Internal Server Error'}), 500

    except Error as e:
        print("Error while connecting to MySQL: ", e)
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL Connection is closed")


@app.post('/article/')
def post_article_form():

    title = request.args.get("title", "Oh no my Iphone broke")
    content = request.args.get("content", "Dropped in toilet")
    description = request.args.get("description", "Whoops")
    image_name = request.args.get("image_name", "ahh.jpg")

    try:
        connection = mysql.connector.connect(
            host='10.18.103.22',
            database='helpgccedu',
            user='root',
            password='C0dePr0j$'
        )
        if connection.is_connected():
            try:
                cursor = connection.cursor()
                
                art = Article(title=title, content=content, article_description=description, image=image_name)

                db.session.add(art)
                db.session.commit()

                #cursor.execute(query, (title, content, description, image_name))
                #connection.commit()          

                return redirect(url_for('get_article'))
            
            except Exception as e:
                return jsonify({'error': 'Internal Server Error'}), 500
                
    except Error as e:
        print("Error while connecting to MySQL: ", e)
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL Connection is closed")
    
@app.get("/articles/search/")
def view_articles_search():
    articles = []
    search = request.args.get("search", "GCC WiFi")
    userID = request.args.get("userID", 1)
    time = datetime.datetime.now()

    try:
        connection = mysql.connector.connect(
            host='10.18.103.22',
            database='helpgccedu',
            user='root',
            password='C0dePr0j$'
        )
        if connection.is_connected():

            try:
                cursor = connection.cursor()

                #query = f"SELECT * FROM Articles WHERE Title LIKE '%{search}%';"
                #cursor.execute(query)

                art_list = db.Article.query.filter(Article.title.contains(search)).all()

                for art in art_list:
                    articles.append({
                        "id": art.id,
                        "title": art.title,
                        "content": art.content,
                        "description": art.article_description,
                        "image_name": art.image
                    })

                # query = """
                #     INSERT INTO Searches (SearchQuery, UserID, SearchTime)
                #     VALUES (%s, %s, %s);
                #     """
                
                query = Search(searchID=userID, searchQuery=search, searchTime=time)
                db.session.add(query)

                # cursor.execute(query, (search, userID, time))
                # connection.commit()

                return articles
            
            except Exception as e:
                return jsonify({'error': 'Internal Server Error'}), 500

    except Error as e:
        print("Error while connecting to MySQL: ", e)
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL Connection is closed")

# class Article(db.Model):
#     __tablename__ = 'Articles'
#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.Unicode, nullable=False)
#     content = db.Column(db.Unicode)
#     description = db.Column(db.Unicode)
#     image_name = db.Column(db.Unicode)
#     def __str__(self):
#         return f"Article name: {self.title}"