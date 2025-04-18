import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import { TableContainer, Table, TableHead, TableRow, TableCell, Typography, TableBody, useTheme } from "@mui/material";
import { PartialArticle, PartialSearch, PartialAdminPrivilege } from "../../custom_objects/models";
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import EditArticleModal from './EditScreen';
import { APIBASE } from "../../ApiBase";


interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminAnalysis({ currentScreen, setCurrentScreen }: Props){

    const tenDaysInMilliseconds = 60 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const sixtyDaysAgoInSeconds = (currentTime - tenDaysInMilliseconds)/1000;

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const theme = useTheme();

    const lstSize = 10;
    
    const [articles, setArticles] = useState<PartialArticle[]>([]);
    const [numSearches, setNumSearches] = useState<number[]>([]);
    const [numThumbsUp, setNumThumbsUp] = useState<number[]>([]);
    const [numThumbsDown, setNumThumbsDown] = useState<number[]>([]);
    const [articlesDate, setArticlesDate] = useState(sixtyDaysAgoInSeconds);

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedArticle, setSelectedArticle] = useState<PartialArticle>(createEmptyArticle())
    const [privilegeIDs, setPrivilegesIDs] = useState([0])
    const [privileges, setPrivileges] = useState<PartialAdminPrivilege[]>([]);

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

    const getData = async() => {
        const params = new URLSearchParams({
            time: articlesDate.toString(),
            size: lstSize.toString()
        });

        const response = await fetch(APIBASE + `/api/v1/articles/indepth?${params.toString()}`, {
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

    useEffect(() => {
        getData()
        loadPrivileges();
    }, [])

    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            {!isMobile && (
                <div style={{width: "100%"}}>
                    <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                </div>
            )}
            <div style={{ width: "100%", height: "95%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", overflow: "auto", backgroundColor: theme.palette.secondary.main }}>
                <TableContainer className="HaveShadow" sx={{border: 1, borderWidth: 1, borderRadius: "4px", borderColor: "gray", height: "98%", width: "98%", backgroundColor: "white"}}>
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
                                    <Typography 
                                                onClick={() => {handleEditArticle(article)}}
                                                sx={{ fontSize: "12px", color: privilegeIDs.includes(3)?'secondary.main':"black" , cursor: privilegeIDs.includes(3)?'pointer':"auto" , textDecoration: privilegeIDs.includes(3)?'underline':"none" }}
                                                >{article.Title}
                                    </Typography>
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

                {privilegeIDs.includes(3) && (
                    <EditArticleModal
                        open={editModalOpen}
                        article={selectedArticle}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
            {isMobile && (
                <div style={{width: "100%"}}>
                    <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                </div>
            )}
        </div>
    )
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

export default AdminAnalysis;