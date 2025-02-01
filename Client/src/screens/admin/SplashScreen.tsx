import { TableContainer, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import AdminAppBar from "../../components/AdminAppBar";
import { PartialArticle, PartialSearch } from "../../custom_objects/models";
import { useState, useEffect } from "react";
import { Screen, AdminScreen } from "../../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminHome({ currentScreen, setCurrentScreen }: Props){
    const tenDaysInMilliseconds = 60 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const sixtyDaysAgoInSeconds = (currentTime - tenDaysInMilliseconds)/1000;

    const lstSize = 10;

    const [problemArticles, setProblemArticles] = useState<PartialArticle[]>([]);
    const [problemArticleDate, setProblemArticleDate] = useState(sixtyDaysAgoInSeconds);

    const [goodArticles, setGoodArticles] = useState<PartialArticle[]>([]);
    const [goodArticleDate, setGoodArticleDate] = useState(sixtyDaysAgoInSeconds)
    const [goodRatings, setGoodRatings] = useState<number[]>([])

    const [problemSearches, setProblemSearches] = useState<PartialSearch[]>([]);
    const [problemSearchDate, setProblemSearchDate] = useState(sixtyDaysAgoInSeconds)

    const [userCount, setUserCount] = useState<number>();
    const [articleCount, setArticleCount] = useState<number>();
    const [searchCount, setSearchCount] = useState<number>();
    const [statsDate, setStatsSate] = useState(sixtyDaysAgoInSeconds)

    const getProblemArticles = async () => {
        const params = new URLSearchParams({
            time: problemArticleDate.toString(),
            size: lstSize.toString()
        });

        const response = await fetch(`http://localhost:5000/api/v1/articles/problems?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setProblemArticles(data.articles as PartialArticle[]);
    }

    const getGoodArticles = async () => {
        const params = new URLSearchParams({
            time: goodArticleDate.toString(),
            size: lstSize.toString()
        });

        const response = await fetch(`http://localhost:5000/api/v1/articles/popular?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setGoodArticles(data.articles as PartialArticle[]);
        setGoodRatings(data.thumbs_up as number[]);
    }

    const getProblemSearches = async () => {
        const params = new URLSearchParams({
            time: problemSearchDate.toString(),
            size: lstSize.toString()
        });

        const response = await fetch(`http://localhost:5000/api/v1/searches/problems?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setProblemSearches(data.searches as PartialSearch[]);
    }  

    const getStats = async () => {
        const response = await fetch(`http://localhost:5000/api/v1/system/stats?`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setUserCount(data.user_count as number);
        setArticleCount(data.article_count as number);
        setSearchCount(data.search_count as number);
    }

    useEffect(() => {
        getProblemArticles();
        getGoodArticles();
        getProblemSearches();
        getStats();
    }, [])

    useEffect(() => {
        getProblemArticles()
    }, [problemArticleDate])

    useEffect(() => {
        getGoodArticles()
    }, [goodArticleDate])

    useEffect(() => {
        getProblemSearches()
    }, [problemSearchDate])

    useEffect(() => {
        getStats
    }, [statsDate])

    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
            <div style={{ flexShrink: 0, height: "10%", width: "100%"}}></div>
            <div style={{ height: "85%", width: "100%", display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}>
                <fieldset style={{ height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: "10px", marginRight: "5px", borderRadius: '4px', overflow: "auto" }}>
                    <legend style={{marginLeft: "10px"}}>
                        <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Problem Articles</Typography>
                    </legend>
                    <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                        {problemArticles.map((article, index) => (
                            <div key={index} style={{ width: "90%", height: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid black", borderRadius: "8px" }}>
                                <Typography sx={{ fontSize: "16px", color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline' }}>{article.Title}</Typography>
                            </div>
                        ))}
                    </div>
                </fieldset>
                <fieldset style={{ height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: "5px", marginRight: "10px", borderRadius: '4px', overflow: "auto" }}>
                    <legend style={{marginLeft: "10px"}}>
                        <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Problem Searches</Typography>
                    </legend>
                    <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                        {problemSearches.map((search, index) => (
                            <div key={index} style={{ width: "90%", height: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid black", borderRadius: "8px" }}>
                                <Typography sx={{ fontSize: "16px", color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline' }}>{search.SearchQuery}</Typography>
                            </div>
                        ))}
                    </div>
                </fieldset>
                <fieldset style={{ height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: "10px", marginRight: "5px", borderRadius: '4px', overflow: "auto" }}>
                    <legend style={{marginLeft: "10px"}}>
                        <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Article Analytics</Typography>
                    </legend>
                    <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                        <TableContainer sx={{border: 1, borderWidth: 1, borderRadius: "4px", borderColor: "gray", height: "100%", width: "100%"}}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Typography sx={{fontSize: "14px"}}>Name (Article)</Typography>
                                        </TableCell>
                                        <TableCell>   
                                            <Typography sx={{fontSize: "14px"}}>Thumbs Up</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {goodArticles.map((article, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography sx={{fontSize: "12px"}}>{article.Title}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{fontSize: "12px"}}>{goodRatings[index]}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </fieldset>
                <fieldset style={{ height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: "5px", marginRight: "10px", borderRadius: '4px', overflow: "auto" }}>
                    <legend style={{marginLeft: "10px"}}>
                        <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>General Stats</Typography>
                    </legend>
                    <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", overflow: "auto" }}>
                        <Typography>Total number of users: {userCount}</Typography>
                        <Typography>Total number of articles: {articleCount}</Typography>
                        <Typography>Total number of searches: {searchCount}</Typography>
                    </div>
                </fieldset>
            </div>
        </div>
    )
}

export default AdminHome;