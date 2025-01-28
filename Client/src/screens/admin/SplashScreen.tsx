import { Typography } from "@mui/material";
import AdminAppBar from "../../components/AdminAppBar";
import { PartialArticle } from "../../custom_objects/models";
import { useState, useEffect } from "react";
import { Screen } from "../../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminHome({ currentScreen, setCurrentScreen }: Props){

    const [problemArticles, setProblemArticles] = useState<PartialArticle[]>([]);
    const [articles, setArticles] = useState<PartialArticle[]>([]);

    useEffect(() => {
        const articleList: PartialArticle[] = getPartialArticles();
        // Sort this in descending order of thumbsdown
        setProblemArticles(articleList.sort((a, b) => b.ThumbsDown - a.ThumbsDown));
        // sort this in descending order of thumbsup
        setArticles(articleList.sort((a, b) => b.ThumbsUp - a.ThumbsUp));
    }, [])

    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
            <div style={{ flexShrink: 0, height: "10%", width: "100%"}}></div>
            <div style={{ height: "85%", width: "100%", display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}>
                <fieldset style={{ height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: "10px", marginRight: "5px", borderRadius: '4px' }}>
                    <legend style={{marginLeft: "10px"}}>
                        <Typography sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Problem Articles</Typography>
                    </legend>
                    <div style={{width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                        {problemArticles.map((article) => (
                            <div key={article.ID} style={{width: "90%", height: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid black", borderRadius: "8px"}}>
                                <Typography sx={{fontSize: "16px", color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>{article.Title}</Typography>
                            </div>
                        ))}
                    </div>
                </fieldset>
                <fieldset style={{ height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: "5px", marginRight: "10px", borderRadius: '4px' }}>
                    <legend style={{marginLeft: "10px"}}>
                        <Typography sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Problem Searches</Typography>
                    </legend>
                    Content 2
                </fieldset>
                <fieldset style={{ height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: "10px", marginRight: "5px", borderRadius: '4px' }}>
                    <legend style={{marginLeft: "10px"}}>
                        <Typography sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Article Analytics</Typography>
                    </legend>
                    Content 3
                </fieldset>
                <fieldset style={{ height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: "5px", marginRight: "10px", borderRadius: '4px' }}>
                    <legend style={{marginLeft: "10px"}}>
                        <Typography sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Search Analytics</Typography>
                    </legend>
                    Content 4
                </fieldset>
            </div>
        </div>
    )
}

function getPartialArticles(): PartialArticle[]{
    return [
        {
            ID: 1,
            Title: "Problem Article 1",
            Article_Description: "This is the first problem article",
            Content: "This is the content of the first problem article",
            Image: "problem_image1.jpg",
            ThumbsUp: 5,
            ThumbsDown: 1
        },
        {
            ID: 2,
            Title: "Problem Article 2",
            Article_Description: "This is the second problem article",
            Content: "This is the content of the second problem article",
            Image: "problem_image2.jpg",
            ThumbsUp: 10,
            ThumbsDown: 2
        },
        {
            ID: 3,
            Title: "Problem Article 3",
            Article_Description: "This is the third problem article",
            Content: "This is the content of the third problem article",
            Image: "problem_image3.jpg",
            ThumbsUp: 15,
            ThumbsDown: 3
        },
        {
            ID: 4,
            Title: "Problem Article 4",
            Article_Description: "This is the fourth problem article",
            Content: "This is the content of the fourth problem article",
            Image: "problem_image4.jpg",
            ThumbsUp: 20,
            ThumbsDown: 4
        },
        {
            ID: 5,
            Title: "Problem Article 5",
            Article_Description: "This is the fifth problem article",
            Content: "This is the content of the fifth problem article",
            Image: "problem_image5.jpg",
            ThumbsUp: 25,
            ThumbsDown: 5
        }
    ];
}

export default AdminHome;