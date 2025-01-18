Use helpgccedu;

CREATE TABLE IF NOT EXISTS Articles (
	ID INT NOT NULL AUTO_INCREMENT,
    Title VARCHAR(100) NOT NULL,
    Content VARCHAR(5000),
    Article_Description VARCHAR (500),
    Image VARCHAR(100),
    ThumbsUp INT,
    ThumbsDown INT,
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS Users(
	ID INT NOT NULL AUTO_INCREMENT,
    Email VARCHAR(50),
    FName VARCHAR(20),
    LName VARCHAR(20),
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

# Make SearchTime NOT NULL once Alex updates code
CREATE TABLE IF NOT EXISTS Searches (
	SearchID INT NOT NULL AUTO_INCREMENT,
    SearchQuery VARCHAR(500) NOT NULL,
    SearchTime timestamp,
    NoSolutionID INT,
    UserID INT,
    TopResult INT,
    SecondResult INT,
    ThirdResult INT,
    FourthResult INT,
    FifthResult INT,
    primary key (SearchID),
    foreign key (UserID) references Users(ID),
    foreign key (NoSolutionID) references NoSolutions(ID),
    foreign key (TopResult) references Articles(ID),
    foreign key (SecondResult) references Articles(ID),
    foreign key (ThirdResult) references Articles(ID),
    foreign key (FourthResult) references Articles(ID),
    foreign key (FifthResult) references Articles(ID)
);

CREATE INDEX idx_feedback_articleid ON Feedback(ArticleID);
CREATE INDEX idx_articles_tagid ON ArticleTags(TagID);
CREATE INDEX idx_tags_articleid ON ArticleTags(ArticleID);










