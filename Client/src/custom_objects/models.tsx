export interface PartialEditHistory{
    ArticleID: number,
    UserID: number,
    Edit_Time: number
}
export interface EditHistory extends PartialEditHistory{
    User: User,
    Article: Article
}

export interface PartialViewHistory{
    ArticleID: number,
    UserID: number,
    Edit_Time: number
}
export interface ViewHistory extends PartialViewHistory{
    User: User,
    Article: Article
}

export interface PartialArticle{
    ID: number,
    Title: string,
    Content: string,
    Article_Description: string,
    Image: string,
    ThumbsUp: number,
    ThumbsDown: number
}
export interface Article extends PartialArticle{
    Views: ViewHistory[],
    Edits: EditHistory[],
    Tags: Tag[],
    Feedback: Feedback[],
    MetaTags: MetaTag[]
}

export interface PartialAdminPrivilege{
    ID: number,
    PrivilegeName: string
}
export interface AdminPrivilege extends PartialAdminPrivilege{
    Users: User[]
}

export interface PartialFeedback{
    ID: number,
    Submission_Time: number,
    Positive: boolean,
    UserID: number,
    ArticleID: number
}
export interface Feedback extends PartialFeedback{
    User: User,
    Article: Article
}

export interface PartialNoSolution{
    ID: number,
    Content: string,
    Submission_Time: number,
    UserID: number
}
export interface NoSolution extends PartialNoSolution{
    User: User
}

export interface PartialSearch{
    SearchID: number,
    SearchQuery: string,
    NoSolutionID: number,
    UserID: number,
    TopResult: number,
    SecondResult: number,
    ThirdResult: number,
    FourthResult: number,
    FifthResult: number,
    SearchTime: number
}
export interface Search extends PartialSearch{
 
}

export interface PartialTag{
    ID: number,
    TagName: string
}
export interface Tag extends PartialTag{
    Articles: Article[]
}

export interface PartialMetaTag{
    ID: number,
    TagName: string
}
export interface MetaTag extends PartialMetaTag{
    Articles: Article[]
}

export interface PartialUser{
    ID: number,
    Email: string,
    Device: string,
    Major: string,
    GradYear: string,
    LName: string,
    FName: string,
    AdminPrivileges: AdminPrivilege[]
}
export interface User extends PartialUser{
    Views: ViewHistory[],
    Edits: EditHistory[],
    NoSolutions: NoSolution[],
    Feedback: Feedback[]
}