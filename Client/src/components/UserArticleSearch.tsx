import { Container, Typography, Paper, Box }  from '@mui/material';
import ArticleModal from "./ArticleModal"
import { useState, useEffect } from "react";

interface ArticleResponse{
    articles: Article[]
}

interface Article{
    id: number,
    title: string,
    description: string,
    content: string
}

async function getArticles(fun: (articles: Article[]) => void){
    const response = await fetch("http://localhost:5000/search/")
    const list: ArticleResponse = await validateJSON(response)
    fun(list.articles)
}

function UserArticleSearch() {
    const [articleModalStatus, setArticleModalStatus] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

    const article1: Article = {
        id: -1,
        title: "None", 
        description: "None",
        content: "None"
    }
    const list: Article[] = [article1]
    const [articleList, setArticleLists] = useState(list);

    useEffect(() => {
        getArticles(setArticleLists)
      }, [])

    // const article1: Article = {
    //     id: 1,
    //     name: "How to Connect to the wifi", 
    //     description: "Learn more about how you can connect to the wifi by clicking on this article"
    // }
    //   const article2: Article = {
    //     id: 2,
    //     name: "How to Log in to MyGCC", 
    //     description: "Learn more about how you to log in to the MyGCC by clicking on this article. Or avoid logging in at all costs"
    // }
    //   const articleList = [article1, article2]
      
      const handleCloseArticleModal = () => {
        setArticleModalStatus(false);
    }

      const handleArticleTileClick = () => {
        setArticleModalStatus(true);
    }

    return(
        <div style={{ height: '80%', width: "100%", paddingTop: 0, paddingBottom: 0 }}>
            <div 
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px'
                }}
            >
                {articleList.map((article) => (
                <Paper 
                    sx={{height: 125}} key={article.id} elevation={3}
                    onClick={() => {
                        setCurrentArticle(article);
                        handleArticleTileClick();
                    }}
                    className='clickable'
                >
                    <Typography variant="h3">{article.title}</Typography>
                    <Typography sx={{textAlign: 'left', px: 2}}>{article.description}</Typography>
                </Paper>
                ))}
            </div>
            <div style={{height: 20}}></div>
            <ArticleModal
                handleClose={handleCloseArticleModal}
                open={articleModalStatus}
                article={currentArticle}
            />
        </div>
    );
}

export default UserArticleSearch;

/**
 * Validate a response to ensure the HTTP status code indcates success.
 * 
 * @param {Response} response HTTP response to be checked
 * @returns {object} object encoded by JSON in the response
 */
async function validateJSON(response: Response) {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
  }
