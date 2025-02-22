import StudentAppBar from "../../components/StudentAppBar";
import SearchBar from "../../components/SearchBar";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import ArticleModal from "../../components/ArticleModal";
import { Typography, Modal, Button, TextField } from "@mui/material";
import { PartialArticle } from "../../custom_objects/models"
import { useMediaQuery } from "react-responsive";  

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
            const response = await fetch('http://localhost:5000/api/v1/user/viewedarticles', {
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

    useEffect(() => {
        getRecentArticles();
    }, []);

    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            {!isMobile && (
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
                </div>
            )}

            <div style={{height: "95%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto"}}>
                <div><h1>Recently Viewed</h1></div>
                {articles?.map((article) => {
                    return <ArticleCard onClick={() => {
                        setCurrentArticle(article);
                        setOpenArticleModal(true)
                    }} article={article} lineNumber={3} key={article.ID}/>;
                })}
            </div>

            {isMobile && (
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
                </div>
            )}

            <ArticleModal handleClose={() => {
                setOpenArticleModal(false);
                setCurrentArticle(null);
                }} open={openArticleModal} article={currentArticle}></ArticleModal>
        </div>
    )
}

export default StudentRecent;