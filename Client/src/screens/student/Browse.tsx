import StudentAppBar from "../../components/StudentAppBar";
import { PartialArticle, PartialMetaTag } from "../../custom_objects/models";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import ArticleModal from "../../components/ArticleModal";
import { Typography, Button } from '@mui/material';

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentBrowse({ currentScreen, setCurrentScreen }: Props){

    const [viewArticles, setViewArticles] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<PartialMetaTag | null>(null)

    if (viewArticles){
        return(
            <div style={{width: "100vw", height: "100vh"}}>
                <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentAppBar>
                <div style={{ flexShrink: 0, height: "10%", width: "100%"}}></div>
                <BrowseArticles currentCategory={currentCategory} setCurrentCategory={setCurrentCategory} setViewArticles={setViewArticles}></BrowseArticles>
            </div>
        )
    } else {
        return(
            <div style={{width: "100vw", height: "100vh"}}>
                <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentAppBar>
                <div style={{ flexShrink: 0, height: "10%", width: "100%"}}></div>
                <BrowseCategories setViewArticles={setViewArticles} setCurrentCategory={setCurrentCategory}></BrowseCategories>
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
            searchQuery: cat.TagName
        });

        console.log(`searching with val ${cat.TagName}`)

        const response = await fetch(`http://localhost:5000/api/v1/articles/search?${params.toString()}`, {
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
        <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{width: "100%", height: "20px", display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "10px"}}>
                <div style={{width: "10px"}}></div>
                <Button onClick={() => {
                    setCurrentCategory(null);
                    setViewArticles(false);
                }}
                    variant="text" sx={{fontSize: "20px", fontWeight: "700"}}>{"< Categories"}</Button>
            </div>
            {articles?.map((article) => {
                return <ArticleCard onClick={() => {
                    setCurrentArticle(article);
                    setOpenArticleModal(true)
                }} article={article} lineNumber={3} key={article.ID}/>;
            })}
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

    useEffect(() => {
        setCategories(getTestMetaTags());
    }, [])

    const handleClick = (cat: PartialMetaTag) => {
        setCurrentCategory(cat)
        setViewArticles(true)
    }

    return(
        <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
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
    return (
        <div onClick={onClick}
            style={{ cursor: "pointer", width: '100%', height: "80px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "1px solid grey", borderRadius: "20px"}}>
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