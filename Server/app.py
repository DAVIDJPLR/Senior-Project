import os
import mysql.connector
from mysql.connector import Error

from flask import Flask, request, render_template, redirect, url_for, abort
from flask import flash
from flask_sqlalchemy import SQLAlchemy

scriptdir = os.path.abspath(os.path.dirname(__file__))
dbpath = os.path.join(scriptdir, 'banking.sqlite3')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbpath}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

from forms import ArticleForm

@app.get("/")
def main():
    return {
        "message": "Hello World"
    }

# TODO: add route to post article form
@app.post('/articles/')
def post_article_form():
    form = ArticleForm()
    if form.validate():
        article = Article(title=form.title.data, content=form.content.data)
        db.session.add(article)
        db.session.commit()
        return redirect(url_for('get_article_form'))
    if not form.validate():
        for field,msg in form.errors.items():
            flash(f"{field}: {msg}")
        return redirect(url_for('get_article_contact'))
    
@app.get("/search/")
def view_articles_search():
    articles = []

    try:
        connection = mysql.connector.connect(
            host='10.18.103.22',
            database='helpgccedu',
            user='root',
            password='C0dePr0j$'
        )
        if connection.is_connected():
            cursor = connection.cursor()

            query = "SELECT * FROM Articles;"
            cursor.execute(query)

            rows = cursor.fetchall()
            print("Rows in the Articles table:")
            for row in rows:
                articles.append(Article(id=row[0], title=row[1], content=row[2], description=row[3], image_name=row[4]))
    except Error as e:
        print("Error while connecting to MySQL: ", e)
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL Connection is closed")

    return render_template("search.html", articles=articles)

class Article(db.Model):
    __tablename__ = 'Articles'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode, nullable=False)
    content = db.Column(db.Unicode, nullable=False)
    description = db.Column(db.Unicode, nullable=False)
    image_name = db.Column(db.Unicode, nullable=False)
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