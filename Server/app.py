import os
import mysql.connector
from mysql.connector import Error

from flask import Flask, request, render_template, redirect, url_for, abort, jsonify
from flask import flash
from flask_sqlalchemy import SQLAlchemy

import json, datetime

scriptdir = os.path.abspath(os.path.dirname(__file__))
dbpath = os.path.join(scriptdir, 'banking.sqlite3')

app = Flask(__name__)
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

@app.get('/article/')
def get_article():

    title = request.args.get("title")
    articleData = []

    try:
        connection = mysql.connector.connect(
            host='10.18.103.22',
            database='helpgccedu',
            user='root',
            password='C0dePr0j$'
        )

        if connection.is_connected():
            cursor = connection.cursor()

            query = f"SELECT * FROM Articles WHERE Title = '{title}';"
            cursor.execute(query)

            rows = cursor.fetchall()
            for row in rows:
                articleData.append({
                    "id": row[0],
                    "title": row[1],
                    "content": row[2],
                    "description": row[3],
                    "image_name": row[4]
                })
    
            returnableArticle = {
                'id': articleData[0],
                'title': articleData[1],
                'content': articleData[2],
                'description': articleData[3],
                'image_name': articleData[4]
            }

            connection.commit()          

            return jsonify({'article': returnableArticle}), 200 # Change this to return a JSON object
            # of the article we just created; NO RENDER TEMPLATE
    except Error as e:
        print("Error while connecting to MySQL: ", e)
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL Connection is closed")


@app.post('/create-article/')
def post_article_form():

    try:
        connection = mysql.connector.connect(
            host='10.18.103.22',
            database='helpgccedu',
            user='root',
            password='C0dePr0j$'
        )
        if connection.is_connected():

            cursor = connection.cursor()

            form = ArticleForm()
            if form.validate():
                article = Article(title=form.title.data, content=form.content.data, description = form.description.data, image_name = form.image_name.data)
                
                query = """
                INSERT INTO Articles (Title, Content, Article_Description, Image)
                VALUES (%s, %s, %s, %s);
                """

                print(article.title)
                print(article.content)

                cursor.execute(query, (article.title, article.content, article.description, article.image_name))
                connection.commit()          

                return redirect(url_for('view_articles_search'))
            if not form.validate():
                for field,msg in form.errors.items():
                    flash(f"{field}: {msg}")
                    return redirect(url_for('view_articles_search'))
                
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
    search = request.args.get("search")
    userID = request.args.get("userID")
    time = datetime.datetime.now()


    try:
        connection = mysql.connector.connect(
            host='10.18.103.22',
            database='helpgccedu',
            user='root',
            password='C0dePr0j$'
        )
        if connection.is_connected():
            cursor = connection.cursor()

            query = f"SELECT * FROM Articles WHERE Title LIKE '%{search}%';"
            cursor.execute(query)

            rows = cursor.fetchall()
            for row in rows:
                articles.append({
                    "id": row[0],
                    "title": row[1],
                    "content": row[2],
                    "description": row[3],
                    "image_name": row[4]
                })

            query = """
                INSERT INTO Searches (SearchQuery, UserID, Timestamp)
                VALUES (%s, %s, %s);
                """
            cursor.execute(query, (search, userID, time))
            connection.commit()

            return articles
    except Error as e:
        print("Error while connecting to MySQL: ", e)
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL Connection is closed")

class Article(db.Model):
    __tablename__ = 'Articles'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode, nullable=False)
    content = db.Column(db.Unicode)
    description = db.Column(db.Unicode)
    image_name = db.Column(db.Unicode)
    def __str__(self):
        return f"Article name: {self.title}"
    
# def connect_to_mysql():
#     try:
#         connection = mysql.connector.connect(
#             host='10.18.103.22',
#             database='helpgccedu',
#             user='root',
#             password='C0dePr0j$'
#         )
#         if connection.is_connected():
#             db_info = connection.get_server_info()
#             print("Connected to MYSQL Server version", db_info)

#             cursor = connection.cursor()
#             cursor.execute("SELECT DATABASE();")
#             record = cursor.fetchone()
#             print("You're connected to the database:", record[0])

#             # query = "SELECT * FROM Articles;"
#             # cursor.execute(query)

#             # rows = cursor.fetchall()
#             # print("Rows in the Articles table:")
#             # for row in rows:
#             #     print(row)

#             query = """
#             SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
#             FROM information_schema.COLUMNS
#             WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s;
#             """
#             cursor.execute(query, ('helpgccedu', 'Articles'))

#             # Fetch and print column metadata
#             columns = cursor.fetchall()
#             print("Columns in the Articles table:")
#             for column in columns:
#                 print(f"Name: {column[0]}, Type: {column[1]}, Nullable: {column[2]}, Key: {column[3]}, Default: {column[4]}")

#     except Error as e:
#         print("Error while connecting to MySQL: ", e)

#     finally:
#         if 'connection' in locals() and connection.is_connected():
#             cursor.close()
#             connection.close()
#             print("MySQL Connection is closed")

# # if __name__ == '__main__':
# #     connect_to_mysql()