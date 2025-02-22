import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import { TableContainer, Table, TableHead, TableRow, TableCell, Typography, TableBody } from "@mui/material";
import { PartialArticle } from "../../custom_objects/models";
import { useState, useEffect } from "react";


interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminAnalysis({ currentScreen, setCurrentScreen }: Props){

    const tenDaysInMilliseconds = 60 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const sixtyDaysAgoInSeconds = (currentTime - tenDaysInMilliseconds)/1000;

    const lstSize = 10;
    
    const [articles, setArticles] = useState<PartialArticle[]>([]);
    const [numSearches, setNumSearches] = useState<number[]>([]);
    const [numThumbsUp, setNumThumbsUp] = useState<number[]>([]);
    const [numThumbsDown, setNumThumbsDown] = useState<number[]>([]);
    const [articlesDate, setArticlesDate] = useState(sixtyDaysAgoInSeconds);

    const getData = async() => {
        const params = new URLSearchParams({
            time: articlesDate.toString(),
            size: lstSize.toString()
        });

        const response = await fetch(`http://localhost:5000/api/v1/articles/indepth?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setArticles(data.articles as PartialArticle[]);
        setNumThumbsUp(data.thumbs_up as number[]);
        setNumThumbsDown(data.thumbs_down as number[]);
        setNumSearches(data.searches as number[]);
    }

    useEffect(() => {
        getData()
    }, [])

    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
            </div>
            <div style={{height: "5%"}}></div>
            <div style={{ width: "90%", height: "85%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                <TableContainer sx={{border: 1, borderWidth: 1, borderRadius: "4px", borderColor: "gray", height: "100%", width: "100%"}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography sx={{fontSize: "14px"}}>Name (Article)</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{fontSize: "14px"}}>Searches</Typography>
                                </TableCell>
                                <TableCell>   
                                    <Typography sx={{fontSize: "14px"}}>Thumbs Up</Typography>
                                </TableCell>
                                <TableCell>
                                <Typography sx={{fontSize: "14px"}}>Thumbs Down</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {articles.map((article, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography sx={{fontSize: "12px"}}>{article.Title}</Typography>
                                    </TableCell>
                                    <TableCell>
                                    <Typography sx={{fontSize: "12px"}}>{numSearches[index]}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{fontSize: "12px"}}>{numThumbsUp[index]}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{fontSize: "12px"}}>{numThumbsDown[index]}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}

export default AdminAnalysis;