import {useEffect, useState} from 'react'
import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import {PartialArticle} from "../../custom_objects/models"
import AdminArticleCard from '../../components/AdminArticleCard';
import EditArticleModal from './EditScreen';
import AdminSearchBar from "../../components/AdminSearchBar";
import { useMediaQuery } from "react-responsive"; 

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminArticles({ currentScreen, setCurrentScreen }: Props){
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedArticle, setSelectedArticle] = useState<PartialArticle | null>(null)
    const [articles, setArticles] = useState<PartialArticle[]>([])
    const [searchVal, setsearchVal] = useState("");
    const [tagVal, settagVal] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const isMobile = useMediaQuery({ maxWidth: 767 });

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

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            console.log(searchVal); 
            setHasSearched(true);
            handleSearch()
        }
    };

    const handleSearch = () => {
        if (searchVal === ""){
            defaultArticles()
            console.log("default")
        } else {
            searchArticles()
        }
    };

    const defaultArticles = async () => {
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

    const searchArticles = async () => {
        const params = new URLSearchParams({
            searchQuery: searchVal,
            tagName: tagVal
        });

        console.log(`searching with val ${searchVal} and tag ${tagVal}`)

        const response = await fetch(`http://localhost:5000/api/v1/articles/search/tagandquery?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)

        setArticles(data.results as PartialArticle[])
    }
    
    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden"}}>
            {!isMobile && (
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                    <AdminSearchBar setSearchVal={setsearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={"medium"}></AdminSearchBar>
                </div>
            )}
            <div style={{ width: "100%", height: "95%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto"}}>
                {articles.map((article) => (
                    <AdminArticleCard
                        key={article.ID}
                        article={article}
                        lineNumber={3}
                        onClick={handleEditArticle}
                    />
                ))}
                <EditArticleModal
                    open={editModalOpen}
                    article={selectedArticle}
                    onClose={handleCloseModal}
                />
            </div>
            {isMobile && (
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                </div>
            )}
        </div>
    )
}

export default AdminArticles;