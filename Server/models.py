from flask_sqlalchemy import SQLAlchemy
from app import db

ViewHistory = db.Table(
    'ViewHistory',
    db.Column('articleID', db.Integer, db.ForeignKey('Articles.ID'), primary_key=True),
    db.Column('userID', db.Integer, db.ForeignKey('Users.ID'), primary_key=True),
    db.Column('view_time', db.DateTime, default=db.func.now(), primary_key=True)
)

EditHistory = db.Table(
    'EditHistory',
    db.Column('articleID', db.Integer, db.ForeignKey('Articles.ID'), primary_key=True),
    db.Column('userID', db.Integer, db.ForeignKey('Users.ID'), primary_key=True),
    db.Column('edit_time', db.DateTime, default=db.func.now(), primary_key=True)
)

Admins = db.Table(
    'Admins',
    db.Column('userID', db.Integer, db.ForeignKey('Users.ID'), primary_key=True),
    db.Column('privilegeID', db.Integer, db.ForeignKey('AdminPrivileges.ID'), primary_key=True)
)

ArticleTags = db.Table(
    'ArticleTags',
    db.Column('articleID', db.Integer, db.ForeignKey('Articles.ID'), primary_key=True),
    db.Column('tagID', db.Integer, db.ForeignKey('Tags.ID'), primary_key=True)
)

ArticleMetaTags = db.Table(
    'ArticleTags',
    db.Column('articleID', db.Integer, db.ForeignKey('Articles.ID'), primary_key=True),
    db.Column('metaTagID', db.Integer, db.ForeignKey('MetaTags.ID'), nullable=False)
)

class Article(db.Model):
    __tablename__ = 'Articles'
    ID = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode, nullable=False)
    content = db.Column(db.Unicode, nullable=True)
    article_description = db.Column(db.Unicode, nullable=True)
    image = db.Column(db.Unicode, nullable=True)
    thumbsUp = db.Column(db.Integer, nullable=True)
    thumbsDown = db.Column(db.Integer, nullable=True)

    viewedBy = db.relationship('Users', secondary=ViewHistory, backref='Users')
    editedBy = db.relationship('Users', secondary=EditHistory, backref='Users')
    taggedAs = db.relationship('Tags', secondary=ArticleTags, backref='Tags')
    topicTaggedAs = db.relationship('MetaTags', secondary=ArticleMetaTags, backref='MetaTags')

    have = db.relationship('Feedback', back_populates='isFor')

    def __str__(self):
        return f"Article name: {self.title}"

class AdminPrivilege(db.Model):
    __tablename__ = 'AdminPrivileges'
    ID = db.Column(db.Integer, primary_key=True)
    privilegeName = db.Column(db.Unicode, nullable=False)

    userHas = db.relationship('Users', secondary=Admins, backref='Users')

class Feedback(db.Model):
    __tablename__ = 'Feedback'
    ID = db.Column(db.Integer, primary_key=True)
    submission_time = db.Column(db.DateTime, default=db.func.now(), nullable=True)
    positive = db.Column(db.Integer, nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('Users.ID'), nullable=False)
    articleID = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=False)

    givenBy = db.relationship('Users', back_populates='give')
    isFor = db.relationship('Articles', back_populates='have')

class NoSolution(db.Model):
    __tablename__ = 'NoSolutions'
    ID = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Unicode, nullable=True)
    submission_time = db.Column(db.DateTime, default=db.func.now(), nullable=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.ID'), nullable=False)

    submit = db.relationship('Users', back_populates='submit')

class Search(db.Model):
    __tablename__ = 'Searches'
    searchID = db.Column(db.Integer, primary_key=True)
    searchQuery = db.Column(db.Unicode, nullable=False)
    noSolutionID = db.Column(db.Integer, db.ForeignKey('NoSolutions.ID'), nullable=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.ID'), nullable=True)
    topResult = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=True)
    secondResult = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=True)
    thirdResult = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=True)
    fourthResult = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=True)
    fifthResult = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=True)
    searchTime = db.Column(db.DateTime, default=db.func.now(), nullable=True)

class Tag(db.Model):
    __tablename__ = 'Tags'
    ID = db.Column(db.Integer, primary_key=True)
    tagName = db.Column(db.Unicode, nullable=False)

    usedOn = db.relationship('Articles', secondary=ArticleTags, backref='Articles')

class MetaTag(db.Model):
    __tablename__ = 'MetaTags'
    ID = db.Column(db.Integer, primary_key=True)
    tagName = db.Column(db.Unicode, nullable=False)

    denote = db.relationship('Articles', secondary=ArticleMetaTags, backref='Articles')

class User(db.Model):
    __tablename__ = 'Users'
    ID = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.Unicode, nullable=True)
    device = db.Column(db.Unicode, nullable=True)
    major = db.Column(db.Unicode, nullable=True)
    gradYear = db.Column(db.Integer, nullable=True)
    lastName = db.Column(db.Unicode, nullable=True)
    firstName = db.Column(db.Unicode, nullable=True)

    view = db.relationship('Articles', secondary=ViewHistory, backref='Articles')
    edit = db.relationship('Articles', secondary=EditHistory, backref='Articles')
    has = db.relationship('AdminPrivileges', secondary=Admins, backref='AdminPrivileges')

    submit = db.relationship('NoSolutions', back_populates='submittedBy')
    give = db.relationship('Feedback', back_populates='givenBy')