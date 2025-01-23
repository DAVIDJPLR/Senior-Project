from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from app import db

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
    'ArticleMetaTags',
    db.Column('articleID', db.Integer, db.ForeignKey('Articles.ID'), primary_key=True),
    db.Column('metaTagID', db.Integer, db.ForeignKey('MetaTags.ID'), nullable=False)
)

class EditHistory(db.Model):
    __tablename__= 'EditHistory'
    ArticleID = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=False)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.ID'), nullable=False)
    Edit_Time = db.Column(db.DateTime, default=db.func.now(), primary_key=True)
    
    User = db.relationship('User', back_populates='Edits', lazy='select')
    Article = db.relationship('Article', back_populates='Edits', lazy='select')
    
    def toJSONPartial(self):
        return{
            'ArticleID': self.ArticleID,
            'UserID': self.UserID,
            'Edit_Time': int(self.Edit_Time.timestamp())
        }  
    def toJSON(self):
        return {
            'ArticleID': self.ArticleID,
            'UserID': self.UserID,
            'Edit_Time': int(self.Edit_Time.timestamp()),
            'User': self.User.toJSONPartial(),
            'Article': self.Article.toJSONPartial()
        }

class ViewHistory(db.Model):
    __tablename__= 'ViewHistory'
    ArticleID = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=False)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.ID'), nullable=False)
    View_Time = db.Column(db.DateTime, default=db.func.now(), primary_key=True)
    
    User = db.relationship('User', back_populates='Views', lazy='select')
    Article = db.relationship('Article', back_populates='Views', lazy='select')

    def toJSONPartial(self):
        return {
            'ArticleID': self.ArticleID,
            'UserID': self.UserID,
            'View_Time': int(self.View_Time.timestamp())
        }
    def toJSON(self):
        return {
            'ArticleID': self.ArticleID,
            'UserID': self.UserID,
            'View_Time': int(self.View_Time.timestamp()),
            'User': self.User.toJSONPartial(),
            'Article': self.Article.toJSONPartial()
        }

class Article(db.Model):
    __tablename__ = 'Articles'
    ID = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.Unicode, nullable=False)
    Content = db.Column(db.Unicode, nullable=True)
    Article_Description = db.Column(db.Unicode, nullable=True)
    Image = db.Column(db.Unicode, nullable=True)
    ThumbsUp = db.Column(db.Integer, nullable=True)
    ThumbsDown = db.Column(db.Integer, nullable=True)

    Views = db.relationship('ViewHistory', back_populates='Article', lazy='select')
    Edits = db.relationship('EditHistory', back_populates='Article', lazy='select')
    Tags = db.relationship('Tag', secondary=ArticleTags, back_populates='Articles')
    Feedback = db.relationship('Feedback', back_populates='Article', lazy='select')
    MetaTags = db.relationship('MetaTag', secondary=ArticleMetaTags, back_populates='Articles', lazy='select')

    def __str__(self):
        return f"Article name: {self.title}"
    
    def toJSONPartial(self):
        return{
            'ID': self.ID,
            'Title': self.Title,
            'Content': self.Content,
            'Article_Description': self.Article_Description,
            'Image': self.Image,
            'ThumbsUp': self.ThumbsUp,
            'ThumbsDown': self.ThumbsDown
        } 
    def toJSON(self):
         return{
            'ID': self.ID,
            'Title': self.Title,
            'Content': self.Content,
            'Article_Description': self.Article_Description,
            'Image': self.Image,
            'ThumbsUp': self.ThumbsUp,
            'ThumbsDown': self.ThumbsDown,
            'Views': [view.toJSONPartial for view in self.Views],
            'Edits': [edit.toJSONPartial for edit in self.Edits],
            'Tags': [tag.toJSONPartial for tag in self.Tags],
            'Feedback': [fb.toJSONPartial for fb in self.Feedback],
            'MetaTags': [metatag.toJSONPartial for metatag in self.MetaTags]
        }
        

class AdminPrivilege(db.Model):
    __tablename__ = 'AdminPrivileges'
    ID = db.Column(db.Integer, primary_key=True)
    privilegeName = db.Column(db.Unicode, nullable=False)

    Users = db.relationship('User', secondary=Admins, back_populates='AdminPrivileges', lazy='select')

    def toJSONPartial(self):
        return {
            'ID': self.ID,
            'privilegeName': self.privilegeName
        }
    def toJSON(self):
        return {
            'ID': self.ID,
            'privilegeName': self.privilegeName,
            'Users': [user.toJSONPartial() for user in self.Users]
        }

class Feedback(db.Model):
    __tablename__ = 'Feedback'
    ID = db.Column(db.Integer, primary_key=True)
    submission_time = db.Column(db.DateTime, default=db.func.now(), nullable=True)
    positive = db.Column(db.Integer, nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('Users.ID'), nullable=False)
    articleID = db.Column(db.Integer, db.ForeignKey('Articles.ID'), nullable=False)

    User = db.relationship('User', back_populates='Feedback', lazy='select')
    Article = db.relationship('Article', back_populates='Feedback', lazy='select')

    def toJSONPartial(self):
        return {
            'ID': self.ID,
            'submission_time': int(self.submission_time.timestamp()),
            'positive': self.positive,
            'userID': self.userID,
            'articleID': self.articleID
        }
    def toJSON(self):
        return {
            'ID': self.ID,
            'submission_time': int(self.submission_time.timestamp()),
            'positive': self.positive,
            'userID': self.userID,
            'articleID': self.articleID,
            'User': self.User.toJSONPartial(),
            'Article': self.Article.toJSONPartial()
        }

class NoSolution(db.Model):
    __tablename__ = 'NoSolutions'
    ID = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Unicode, nullable=True)
    submission_time = db.Column(db.DateTime, default=db.func.now(), nullable=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.ID'), nullable=False)

    User = db.relationship('User', back_populates='NoSolutions', lazy='select')

    def toJSONPartial(self):
        return {
            'ID': self.ID,
            'content': self.content,
            'submission_time': int(self.submission_time.timestamp()),
            'userID': self.userID
        }
    def toJSON(self):
        return {
            'ID': self.ID,
            'content': self.content,
            'submission_time': int(self.submission_time.timestamp()),
            'userID': self.userID,
            'User': self.User.toJSONPartial()
        }

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

    def toJSONPartial(self):
        return {
            'searchID': self.searchID,
            'searchQuery': self.searchQuery,
            'noSolutionID': self.noSolutionID,
            'userID': self.userID,
            'topResult': self.topResult,
            'secondResult': self.secondResult,
            'thirdResult': self.thirdResult,
            'fourthResult': self.fourthResult,
            'fifthResult': self.fifthResult,
            'searchTime': int(self.searchTime.timestamp())
        }
    def toJSONPartial(self):
        return {
            'searchID': self.searchID,
            'searchQuery': self.searchQuery,
            'noSolutionID': self.noSolutionID,
            'userID': self.userID,
            'topResult': self.topResult,
            'secondResult': self.secondResult,
            'thirdResult': self.thirdResult,
            'fourthResult': self.fourthResult,
            'fifthResult': self.fifthResult,
            'searchTime': int(self.searchTime.timestamp())
        }

class Tag(db.Model):
    __tablename__ = 'Tags'
    ID = db.Column(db.Integer, primary_key=True)
    tagName = db.Column(db.Unicode, nullable=False)

    Articles = db.relationship('Article', secondary=ArticleTags, back_populates='Tags')

    def toJSONPartial(self):
        return {
            'ID': self.ID,
            'tagName': self.tagName
        }
    def toJSON(self):
        return {
            'ID': self.ID,
            'tagName': self.tagName,
            'Articles': [article.toJSONPartial() for article in self.Articles]
        }

class MetaTag(db.Model):
    __tablename__ = 'MetaTags'
    ID = db.Column(db.Integer, primary_key=True)
    tagName = db.Column(db.Unicode, nullable=False)

    Articles = db.relationship('Article', secondary=ArticleMetaTags, back_populates='MetaTags')

    def toJSONPartial(self):
        return {
            'ID': self.ID,
            'tagName': self.tagName
        }
    def toJSON(self):
        return {
            'ID': self.ID,
            'tagName': self.tagName,
            'Articles': [article.toJSONPartial() for article in self.Articles]
        }

class User(db.Model):
    __tablename__ = 'Users'
    ID = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.Unicode, nullable=True)
    device = db.Column(db.Unicode, nullable=True)
    major = db.Column(db.Unicode, nullable=True)
    gradYear = db.Column(db.Integer, nullable=True)
    LName = db.Column(db.Unicode, nullable=True)
    FName = db.Column(db.Unicode, nullable=True)

    Views = db.relationship('ViewHistory', back_populates='User', lazy='select')
    Edits = db.relationship('EditHistory', back_populates='User', lazy='select') 
    AdminPrivileges = db.relationship('AdminPrivilege', secondary=Admins, back_populates='Users', lazy='select')
    NoSolutions = db.relationship('NoSolution', back_populates='User', lazy='select')
    Feedback = db.relationship('Feedback', back_populates='User', lazy='select')
    
    def toJSONPartial(self):
        return {
            'ID': self.ID,
            'email': self.email,
            'device': self.device,
            'major': self.major,
            'gradYear': self.gradYear,
            'LName': self.LName,
            'FName': self.FName
        }
    def toJSON(self):
        return {
            'ID': self.ID,
            'email': self.email,
            'device': self.device,
            'major': self.major,
            'gradYear': self.gradYear,
            'LName': self.LName,
            'FName': self.FName,
            'Views': [view.toJSONPartial() for view in self.Views],
            'Edits': [edit.toJSONPartial() for edit in self.Edits],
            'AdminPrivileges': [privilege.toJSONPartial() for privilege in self.AdminPrivileges],
            'NoSolutions': [solution.toJSONPartial() for solution in self.NoSolutions],
            'Feedback': [feedback.toJSONPartial() for feedback in self.Feedback]
        }