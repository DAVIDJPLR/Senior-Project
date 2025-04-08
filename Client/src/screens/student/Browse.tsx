import StudentAppBar from "../../components/StudentAppBar";
import { PartialArticle, PartialMetaTag, MetaTag } from "../../custom_objects/models";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import ArticleModal from "../../components/ArticleModal";
import { Typography, Button, Box } from '@mui/material';
import { ArrowBack } from "@mui/icons-material";
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

    return (
        <Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
          {!isMobile && (
            <Box sx={{ width: "100%" }}>
              <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            </Box>
          )}
    
          <Box sx={{ flexGrow: 1, px: 2, py: 3, overflowY: "auto" }}>
            {viewArticles && currentCategory ? (
              <BrowseArticles
                currentCategory={currentCategory}
                setCurrentCategory={setCurrentCategory}
                setViewArticles={setViewArticles}
              />
            ) : (
              <BrowseCategories
                setCurrentCategory={setCurrentCategory}
                setViewArticles={setViewArticles}
              />
            )}
          </Box>
    
          {isMobile && (
            <Box sx={{ width: "100%" }}>
              <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            </Box>
          )}
        </Box>
      )
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
        await fetch(APIBASE + `/api/v1/article?articleID=${article.ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        console.log("Article view logged.")
    }

    return(
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ width: "100%", mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            setCurrentCategory(null);
            setViewArticles(false);
          }}
          sx={{ fontWeight: 600, fontSize: "1rem" }}
        >
          Categories
        </Button>
      </Box>

      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        {articles.map((article) => (
          <Box key={article.ID} sx={{ display: "flex", justifyContent: "center" }}>
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

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {categories.map((category) => (
            <CategoryCard key={category.ID} category={category} onClick={() => handleClick(category)} />
          ))}
        </Box>
      )
}

interface CategoryCardProps{
    category: PartialMetaTag,
    onClick: () => void
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
    return (
        <Box
          onClick={onClick}
          sx={{
            cursor: "pointer",
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid",
            borderColor: "black",
            borderRadius: 2,
            boxShadow: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: 3,
              backgroundColor: "grey.50",
            },
          }}
        >
          <Typography variant="h6">{category.TagName}</Typography>
        </Box>
      )
}

export default StudentBrowse;