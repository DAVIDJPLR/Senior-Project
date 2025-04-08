import StudentAppBar from "../../components/StudentAppBar";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import ArticleModal from "../../components/ArticleModal";
import { PartialArticle } from "../../custom_objects/models"
import { useMediaQuery } from "react-responsive";  
import { APIBASE } from "../../ApiBase";
import { Box, Typography } from "@mui/material"

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentRecent({ currentScreen, setCurrentScreen }: Props){
    const [articles, setArticles] = useState<PartialArticle[]>([]);
    const [currentArticle, setCurrentArticle] = useState<PartialArticle | null>(null);
    const [openArticleModal, setOpenArticleModal] = useState(false);

    const isMobile = useMediaQuery({ maxWidth: 767 });

    const getRecentArticles = async () => {
        try {
            const response = await fetch(APIBASE + '/api/v1/user/viewedarticles', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log(data)

            setArticles(data.articles as PartialArticle[])
        } catch (error) {
            console.error("Error fetching articles: ", error)
        }
    }

    const logView = async(article: PartialArticle) => {
        const response = await fetch(APIBASE + `/api/v1/article?articleID=${article.ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        console.log("Article view logged.")
    }

    useEffect(() => {
        getRecentArticles();
    }, []);

    return (
        <Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
          {!isMobile && (
            <Box sx={{ width: "100%" }}>
              <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            </Box>
          )}
    
          <Box
            sx={{
              flexGrow: 1,
              px: 2,
              py: 3,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Recently Viewed
            </Typography>
    
            {articles.map(article => (
              <Box key={article.ID} sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 1 }}>
                <ArticleCard
                  article={article}
                  lineNumber={3}
                  onClick={() => {
                    setCurrentArticle(article);
                    setOpenArticleModal(true);
                    logView(article);
                  }}
                />
              </Box>
            ))}
          </Box>
          {isMobile && (
            <Box sx={{ width: "100%" }}>
              <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            </Box>
          )}
    
          {/* Modal */}
          <ArticleModal
            open={openArticleModal}
            article={currentArticle}
            handleClose={() => {
              setOpenArticleModal(false);
              setCurrentArticle(null);
            }}
          />
        </Box>
      )
}

export default StudentRecent;