from flask import Flask, request, render_template, redirect, url_for, abort
from flask import flash
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

class Article(db.Model):
    __tablename__ = 'Articles'
    id = db.column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode, nullable=False)
    content = db.Column(db.Unicode, nullable=False)
    description = db.Column(db.Unicode, nullable=False)
    image_name = db.Column(db.Unicode, nullable=False)
    good = db.Column(db.Integer, nullable=False)
    bad = db.Column(db.Integer, nullable=False)
    usefulness = db.Column(db.Float, nullable=False)
    def __str__(self):
        return f"Article name: {self.title}"
