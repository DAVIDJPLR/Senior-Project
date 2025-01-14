Use helpgccedu;

CREATE TABLE IF NOT EXISTS Articles (
	ID INT NOT NULL AUTO_INCREMENT,
    Title VARCHAR(100) NOT NULL,
    Content VARCHAR(5000),
    Article_Description VARCHAR (500),
    Image VARCHAR(100),
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS Users(
	ID INT NOT NULL AUTO_INCREMENT,
    Email VARCHAR(50),
    Device VARCHAR(50),
    Major VARCHAR(50),
    GradYear INT,
    primary key (ID)
);

CREATE TABLE IF NOT EXISTS Feedback (
	ID INT NOT NULL AUTO_INCREMENT,
    Submission_Time TIMESTAMP,
    Positive BOOLEAN NOT NULL,
    UserID INT NOT NULL,
    ArticleID INT NOT NULL,
    PRIMARY KEY (ID),
    foreign key (UserID) references Users(ID),
    foreign key (ArticleID) references Articles(ID)
);

CREATE TABLE IF NOT EXISTS NoSolutions (
	ID INT NOT NULL AUTO_INCREMENT,
    Content VARCHAR(500),
    Submission_Time timestamp,
    UserID INT NOT NULL,
    primary key (ID),
    foreign key (UserID) references Users(ID)
);

CREATE TABLE IF NOT EXISTS Tags (
	ID INT NOT NULL AUTO_INCREMENT,
    TagName VARCHAR(30) NOT NULL,
    primary key (ID)
);

CREATE TABLE IF NOT EXISTS ArticleTags (
	ArticleID INT NOT NULL,
    TagID INT NOT NULL,
    primary key (ArticleID, TagID),
    foreign key (ArticleID) references Articles(ID),
    foreign key (TagID) references Tags(ID)
);

CREATE TABLE IF NOT EXISTS EditHistory (
	ArticleID INT NOT NULL,
    UserID INT NOT NULL,
    Edit_Time TIMESTAMP NOT NULL,
    primary key (ArticleID, UserID, Edit_Time),
    foreign key (ArticleID) references Articles(ID),
    foreign key (UserID) references Users(ID)
);

CREATE TABLE IF NOT EXISTS ViewHistory (
	ArticleID INT NOT NULL,
    UserID INT NOT NULL,
    View_Time TIMESTAMP NOT NULL,
    primary key (ArticleID, UserID, View_Time),
    foreign key (ArticleID) references Articles(ID),
    foreign key (UserID) references Users(ID)
);

CREATE TABLE IF NOT EXISTS AdminPrivileges (
	ID INT NOT NULL,
    PrivilegeName VARCHAR(50) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS Admins (
	UserID INT NOT NULL,
    PrivilegeID INT NOT NULL,
    primary key (UserID, PrivilegeID),
    foreign key (PrivilegeID) references AdminPrivileges(ID),
    foreign key (UserID) references Users(ID)
);

CREATE INDEX idx_feedback_articleid ON Feedback(ArticleID);
CREATE INDEX idx_articles_tagid ON ArticleTags(TagID);
CREATE INDEX idx_tags_articleid ON ArticleTags(ArticleID);










