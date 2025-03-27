import StudentAppBar from "../../components/StudentAppBar";
import { PartialArticle, PartialMetaTag, MetaTag } from "../../custom_objects/models";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import ArticleModal from "../../components/ArticleModal";
import { Typography, Button } from '@mui/material';
import { useMediaQuery } from "react-responsive"; 
import { APIBASE } from "../../ApiBase";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentBrowse({ currentScreen, setCurrentScreen }: Props){

    const [viewArticles, setViewArticles] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<PartialMetaTag | null>(null)

    const isMobile = useMediaQuery({ maxWidth: 767 });

    if (viewArticles){
        return(
            <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
                {!isMobile && (
                    <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
                    </div>
                )}
                
                <BrowseArticles currentCategory={currentCategory} setCurrentCategory={setCurrentCategory} setViewArticles={setViewArticles}></BrowseArticles>
                
                {isMobile && (
                <div style={{height: "6%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
                </div>
                )}
            </div>
        )
    } else {
        return(
            <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
                {!isMobile && (
                    <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
                    </div>
                )}
                
                <BrowseCategories setViewArticles={setViewArticles} setCurrentCategory={setCurrentCategory}></BrowseCategories>
                
                {isMobile && (
                <div style={{height: "6%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
                </div>
                )}
            </div>
        )
    }
}

interface BrowseArticlesProps{
    currentCategory: PartialMetaTag | null,
    setCurrentCategory: (cat: PartialMetaTag | null) => void,
    setViewArticles: (viewArticles: boolean) => void
}

function BrowseArticles({currentCategory, setCurrentCategory, setViewArticles}: BrowseArticlesProps){

    const [articles, setArticles] = useState<PartialArticle[]>([])
    const [currentArticle, setCurrentArticle] = useState<PartialArticle | null>(null);
    const [openArticleModal, setOpenArticleModal] = useState(false);

    useEffect(() => {
        if (currentCategory){
            getArticles(currentCategory)
        }
    }, [])

    const getArticles = async (cat: PartialMetaTag) => {
        const params = new URLSearchParams({
            ID: cat.ID.toString()
        });

        const response = await fetch(APIBASE + `/api/v1/category?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)
        
        setArticles((data.category as MetaTag).Articles)
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

    return(
        <div style={{width: "100%", height: "95%", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{width: "100%", height: "5%", display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "10px", paddingTop: "5%"}}>
                <Button onClick={() => {
                    setCurrentCategory(null);
                    setViewArticles(false);
                }}
                    variant="text" sx={{fontSize: "20px", fontWeight: "700"}}>{"< Categories"}</Button>
            </div>
            <div style={{width: "100%", height: "95%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto"}}>
                {articles?.map((article) => {
                    return <ArticleCard onClick={() => {
                        setCurrentArticle(article);
                        setOpenArticleModal(true)
                        logView(article)
                    }} article={article} lineNumber={3} key={article.ID}/>;
                })}
            </div>
            <ArticleModal handleClose={() => {
                setOpenArticleModal(false);
                setCurrentArticle(null);
                }} open={openArticleModal} article={currentArticle}>
            </ArticleModal>
        </div>
    );
}

interface BrowseCategoriesProps{
    setViewArticles: (viewArticles: boolean) => void,
    setCurrentCategory: (category: PartialMetaTag) => void
}

function BrowseCategories({setViewArticles, setCurrentCategory}: BrowseCategoriesProps){

    const [categories, setCategories] = useState<PartialMetaTag[]>([]);

    const getCategories = async () => {
        const response = await fetch(APIBASE + '/api/v1/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)

        setCategories(data.categories as PartialMetaTag[])
    }

    useEffect(() => {
        getCategories()
    }, [])

    const handleClick = (cat: PartialMetaTag) => {
        setCurrentCategory(cat)
        setViewArticles(true)
    }

    return(
        <div style={{width: "100%", height: "95%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto", paddingTop: "5%", paddingBottom: "5%"}}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', width: '90%' }}>
                {categories.map((category) => (
                    <CategoryCard key={category.ID} category={category} onClick={() => {handleClick(category)}}/>
                ))}
            </div>
        </div>
    );
}

interface CategoryCardProps{
    category: PartialMetaTag,
    onClick: () => void
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
    console.log(category.TagName)
    return (
        <div onClick={onClick}
            style={{ cursor: "pointer", width: '100%', height: "80px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "1px solid grey", borderRadius: "20px", boxShadow: "0px 0px 10px 0px Gainsboro" }}>
            <Typography variant="h6">{category.TagName}</Typography>
        </div>
    );
}

function getTestMetaTags(): PartialMetaTag[]{
    return [
        {
            ID: 1,
            TagName: "Technology"
        },
        {
            ID: 2,
            TagName: "Science"
        },
        {
            ID: 3,
            TagName: "Health"
        },
        {
            ID: 4,
            TagName: "Education"
        },
        {
            ID: 5,
            TagName: "Business"
        },
        {
            ID: 6,
            TagName: "Entertainment"
        },
        {
            ID: 7,
            TagName: "Sports"
        },
        {
            ID: 8,
            TagName: "Travel"
        },
        {
            ID: 9,
            TagName: "How to"
        }
    ];
}
export default StudentBrowse;