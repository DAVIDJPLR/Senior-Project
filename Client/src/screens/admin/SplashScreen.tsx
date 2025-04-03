import { TableContainer, Typography, Table, TableHead, TableRow, TableCell, TableBody, useTheme } from "@mui/material";
import AdminAppBar from "../../components/AdminAppBar";
import { PartialArticle, PartialSearch, PartialAdminPrivilege } from "../../custom_objects/models";
import { useState, useEffect } from "react";
import { Screen, AdminScreen } from "../../custom_objects/Screens";
import { useMediaQuery } from "react-responsive"; 
import EditArticleModal from './EditScreen';
import { APIBASE } from "../../ApiBase";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminHome({ currentScreen, setCurrentScreen }: Props){
    const tenDaysInMilliseconds = 60 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const sixtyDaysAgoInSeconds = (currentTime - tenDaysInMilliseconds)/1000;

    const [privileges, setPrivileges] = useState<PartialAdminPrivilege[]>([]);
    const [privilegeIDs, setPrivilegesIDs] = useState([0])

    const isMobile = useMediaQuery({ maxWidth: 767 });

    const lstSize = 10;

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedArticle, setSelectedArticle] = useState<PartialArticle>(createEmptyArticle())

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

    const theme = useTheme();

    const handleEditArticle = (article: PartialArticle) => {
        if (privilegeIDs.includes(3)){
            setSelectedArticle(article)
            setEditModalOpen(true)
        }
    };

    const handleCloseModal = () => {
        setEditModalOpen(false)
        setSelectedArticle(createEmptyArticle())
    };

    const loadPrivileges = async () => {
        const response = await fetch(APIBASE + '/api/v1/user/info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setPrivileges(data.current_privileges as PartialAdminPrivilege[])
        const temp1 = data.current_privileges as PartialAdminPrivilege[]
        const temp2 = temp1.map(priv => priv.ID)
        setPrivilegesIDs(temp2)
    }

    const getProblemArticles = async () => {
        const response = await fetch(APIBASE + `/api/v1/article/thumbs_down_dates/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json()

        setProblemArticles(data.articles as PartialArticle[]);
    }

    const getGoodArticles = async () => {
        const params = new URLSearchParams({
            time: goodArticleDate.toString(),
            size: lstSize.toString()
        });

        const response = await fetch(APIBASE + `/api/v1/articles/popular?${params.toString()}`, {
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

        const response = await fetch(APIBASE + `/api/v1/searches/problems?${params.toString()}`, {
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
        const response = await fetch(APIBASE + `/api/v1/system/stats?`, {
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
        loadPrivileges();
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
        getStats()
    }, [statsDate])

    if (!isMobile){
        return(
            <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
                
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                </div>

                <div style={{height: "95%", width: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: theme.palette.secondary.main}}>
                    <div style={{height: "100%", width: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                        <div style={{width: "100%", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly"}}>
                            <fieldset style={{ height: "98%", width: "98%", display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: "space-evenly", borderRadius: '4px', overflowY: "auto", overflowX: "hidden", border: "1px solid grey", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white" }}>
                                <legend style={{marginLeft: "10px"}}>
                                    <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Article Analytics</Typography>
                                </legend>
                                <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                                    <TableContainer sx={{border: 1, borderWidth: 1, borderRadius: "4px", borderColor: "gray", height: "100%", width: "100%", marginBottom: "1%"}}>
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
                        </div>
                        <div style={{width: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", marginBottom: "1%"}}>
                            <div style={{width: "30%", aspectRatio: "1/1", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px solid gray", color: "black", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white"}}>
                                <Typography sx={{fontSize: "300%", lineHeight: "1", marginBottom: "2px" }}>{articleCount}</Typography>
                                <Typography sx={{fontSize: "80%", lineHeight: "1", marginBottom: "2px" }}>Articles</Typography>
                            </div>
                            <div style={{width: "30%", aspectRatio: "1/1", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px solid gray", color: "black", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white"}}>
                                <Typography sx={{fontSize: "300%", lineHeight: "1", marginBottom: "2px" }}>{userCount}</Typography>
                                <Typography sx={{fontSize: "80%", lineHeight: "1", marginBottom: "2px" }}>Active users</Typography>
                            </div>

                            <div style={{width: "30%", aspectRatio: "1/1", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px solid gray", color: "black", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white"}}>
                                <Typography sx={{fontSize: "300%", lineHeight: "1", marginBottom: "2px" }}>{searchCount}</Typography>
                                <Typography sx={{fontSize: "80%", lineHeight: "1", marginBottom: "2px" }}>Searches</Typography>
                            </div>
                        </div>
                    </div>
                    <div style={{height: "100%", width: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                        <div style={{height: "50%", width: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                            <fieldset style={{ height: "98%", width: "98%", display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflowY: "auto", overflowX: "hidden", border: "1px solid grey", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white" }}>
                                <legend style={{marginLeft: "10px"}}>
                                    <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Problem Searches</Typography>
                                </legend>
                                <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                                    {problemSearches.map((search, index) => (
                                        <div key={index} style={{ width: "90%", height: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid black", borderRadius: "8px" }}>
                                            <Typography 
                                                sx={{ fontSize: "16px", color: 'black', cursor: 'pointer' }}
                                            >{search.SearchQuery}</Typography>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                        <div style={{height: "50%", width: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                            <fieldset style={{ height: "98%", width: "98%", display: 'flex', flexDirection: "column",alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflowY: "auto", overflowX: "hidden", border: "1px solid grey", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white" }}>
                                <legend style={{marginLeft: "10px"}}>
                                    <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Problem Articles</Typography>
                                </legend>
                                <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                                    {problemArticles.map((article, index) => (
                                        <div key={index} style={{ width: "90%", height: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid black", borderRadius: "8px" }}>
                                            <Typography 
                                                onClick={() => {handleEditArticle(article)}}
                                                sx={{ fontSize: "16px", color: privilegeIDs.includes(3)?'secondary.main':"black" , cursor: privilegeIDs.includes(3)?'pointer':"auto" , textDecoration: privilegeIDs.includes(3)?'underline':"none" }}
                                                >{article.Title}</Typography>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>
                {privilegeIDs.includes(3) && (
                    <EditArticleModal
                        open={editModalOpen}
                        article={selectedArticle}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
        );
    } else {
        return(
            <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div style={{height: "95%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: theme.palette.secondary.main, overflow: "auto"}}>
                    
                    <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", marginTop: "5px"}}>
                        <fieldset style={{ height: "98%", width: "98%", display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: "space-evenly", borderRadius: '4px', overflowY: "auto", overflowX: "hidden", border: "1px solid grey", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white" }}>
                            <legend style={{marginLeft: "10px"}}>
                                <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Article Analytics</Typography>
                            </legend>
                            <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                                <TableContainer sx={{border: 1, borderWidth: 1, borderRadius: "4px", borderColor: "gray", height: "100%", width: "100%", marginBottom: "1%"}}>
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
                    </div>                    
                    
                    <div style={{height: "50%", width: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                        <fieldset style={{ height: "98%", width: "98%", display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflowY: "auto", overflowX: "hidden", border: "1px solid grey", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white" }}>
                            <legend style={{marginLeft: "10px"}}>
                                <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Problem Searches</Typography>
                            </legend>
                            <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                                {problemSearches.map((search, index) => (
                                    <div key={index} style={{ width: "90%", height: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid black", borderRadius: "8px" }}>
                                        <Typography sx={{ fontSize: "16px", color: 'black', cursor: 'pointer' }}>{search.SearchQuery}</Typography>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    </div>

                    <div style={{height: "50%", width: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                        <fieldset style={{ height: "98%", width: "98%", display: 'flex', flexDirection: "column",alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflowY: "auto", overflowX: "hidden", border: "1px solid grey", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white" }}>
                            <legend style={{marginLeft: "10px"}}>
                                <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis)}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Problem Articles</Typography>
                            </legend>
                            <div style={{ width: "90%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", overflow: "auto" }}>
                                {problemArticles.map((article, index) => (
                                    <div key={index} style={{ width: "90%", height: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid black", borderRadius: "8px" }}>
                                        <Typography 
                                            onClick={() => {handleEditArticle(article)}}
                                            sx={{ fontSize: "16px", color: privilegeIDs.includes(3)?'secondary.main':"black" , cursor: privilegeIDs.includes(3)?'pointer':"auto" , textDecoration: privilegeIDs.includes(3)?'underline':"none" }}
                                        >{article.Title}</Typography>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                    
                    <div style={{width: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", marginBottom: "1%"}}>
                        <div style={{width: "30%", aspectRatio: "1/1", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px solid gray", color: "black", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white"}}>
                            <Typography sx={{fontSize: "300%", lineHeight: "1", marginBottom: "2px" }}>{articleCount}</Typography>
                            <Typography sx={{fontSize: "80%", lineHeight: "1", marginBottom: "2px" }}>Articles</Typography>
                        </div>
                        <div style={{width: "30%", aspectRatio: "1/1", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px solid gray", color: "black", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white"}}>
                            <Typography sx={{fontSize: "300%", lineHeight: "1", marginBottom: "2px" }}>{userCount}</Typography>
                            <Typography sx={{fontSize: "80%", lineHeight: "1", marginBottom: "2px" }}>Active users</Typography>
                        </div>

                        <div style={{width: "30%", aspectRatio: "1/1", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px solid gray", color: "black", boxShadow: "0px 0px 5px 0px black", backgroundColor: "white"}}>
                            <Typography sx={{fontSize: "300%", lineHeight: "1", marginBottom: "2px" }}>{searchCount}</Typography>
                            <Typography sx={{fontSize: "80%", lineHeight: "1", marginBottom: "2px" }}>Searches</Typography>
                        </div>
                    </div>
                </div>
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                </div>

                {privilegeIDs.includes(3) && (
                    <EditArticleModal
                        open={editModalOpen}
                        article={selectedArticle}
                        onClose={handleCloseModal}
                    />
                )}

            </div>
        );
    }
}

function createEmptyArticle(): PartialArticle {
    return {
        ID: -1,
        Title: "",
        Content: "",
        Article_Description: "",
        Image: "",
        ThumbsUp: 0,
        ThumbsDown: 0
    };
}

export default AdminHome;