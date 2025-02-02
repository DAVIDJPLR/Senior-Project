import React, {useEffect, useState} from 'react'
import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import {PartialArticle} from "../../custom_objects/models"
import AdminArticleCard from '../../components/AdminArticleCard';
import EditArticleModal from './EditScreen';

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminArticles({ currentScreen, setCurrentScreen }: Props){
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedArticle, setSelectedArticle] = useState<PartialArticle | null>(null)
    const [articles, setArticles] = useState<PartialArticle[]>([])

    const handleEditArticle = (article: PartialArticle) => {
        setSelectedArticle(article)
        setEditModalOpen(true)
    };

    const handleCloseModal = () => {
        setEditModalOpen(false)
        setSelectedArticle(null)
    };
    
    useEffect(() => {
        getArticles()
    }, []);

    const getArticles = async () => {
        const response = await fetch('http://localhost:5000/api/v1/articles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)

        setArticles(data.articles as PartialArticle[])
    }
    
    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
            <div style={{ flexShrink: 0, height: "10%", width: "100%"}}></div>
            <div style={{ alignItems: "center"}}>
                {articles.map((article, index) => (
                    <AdminArticleCard
                        key={article.ID}
                        article={article}
                        lineNumber={3}
                        onClick={() => console.log("Card clicked")}
                        onEditClick={handleEditArticle}
                    />
                ))}
                <EditArticleModal
                    open={editModalOpen}
                    article={selectedArticle}
                    onClose={handleCloseModal}
                />
            </div>
        </div>
    )
}

export default AdminArticles;