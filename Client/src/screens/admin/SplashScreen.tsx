import { TableContainer, Typography, Table, TableHead, TableRow, TableCell, TableBody, useTheme, Paper, Box, SxProps } from "@mui/material";
import AdminAppBar from "../../components/AdminAppBar";
import { PartialArticle, PartialSearch, PartialAdminPrivilege } from "../../custom_objects/models";
import { useState, useEffect } from "react";
import { Screen, AdminScreen } from "../../custom_objects/Screens";
import { useMediaQuery } from "react-responsive"; 
import EditArticleModal from './EditScreen';
import { APIBASE } from "../../ApiBase";
import UsageChart from "../../components/UsageChart";
import { Theme } from "@emotion/react";

interface DataPoint {
    name: string;
    value: number;
  }

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminSplashScreen({ currentScreen, setCurrentScreen }: Props){
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

    const [usageData, setUsageData] = useState<DataPoint[]>([
        { name: '', value: 0 },
        { name: '', value: 0 },
        { name: '', value: 0 },
        { name: '', value: 0 },
        { name: '', value: 0 },
      ]);

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

    const getData = async () => {
        const response = await fetch(APIBASE + '/api/v1/system/usage', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setUsageData(data.usage_data as DataPoint[])
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
        getData();
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

    return (
        <Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box sx={{ width: "100%" }}>
                <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            </Box>

            <Box sx={{ flexGrow: 1, display: "flex", backgroundColor: theme.palette.secondary.main, gap: 2, p: 2 }}>
                <Box sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 2 }}>
                    <PanelCard 
                        title="Article Analytics"
                        onTitleClick={() => setCurrentScreen(AdminScreen.Analysis)}
                        sx={{flexBasis: "48%", minHeight: 0, p: 1}}
                    >
                        <TableContainer component={Paper}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name (Article)</TableCell>
                                        <TableCell>Thumbs Up</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {goodArticles.map((article, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{article.Title}</TableCell>
                                            <TableCell>{goodRatings[index]}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </PanelCard>

                    <PanelCard title="Usage Over Time" sx={{flexBasis: "48%", minHeight: 0, p: 1}}>
                        <UsageChart data={usageData} />
                    </PanelCard>
                </Box>

                <Box sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 2 }}>
                  <PanelCard
                    title="Recent Searches with No Solution"
                    onTitleClick={() => setCurrentScreen(AdminScreen.Analysis)}
                    sx={{flexBasis: "48%", p: 1}}
                  >
                    {problemSearches.map((search, index) => (
                      <Box key={index} sx={{ my: 0.5, p: 1, border: "1px solid", borderColor: "grey.400", borderRadius: 1 }}>
                        <Typography>{search.SearchQuery}</Typography>
                      </Box>
                    ))}
                  </PanelCard>

                  <PanelCard
                    title="Recently Downvoted Articles"
                    onTitleClick={() => setCurrentScreen(AdminScreen.Analysis)}
                    sx={{flexBasis: "48%", p: 1}}
                  >
                    {problemArticles.map((article, index) => (
                        <Box key={index} sx={{ my: 0.5, p: 1, border: "1px solid", borderColor: "grey.400", borderRadius: 1 }}>
                            <Typography
                                onClick={() => privilegeIDs.includes(3) && handleEditArticle(article)}
                                sx={{
                                    fontSize: "16px",
                                    color: privilegeIDs.includes(3) ? 'secondary.main' : "text.primary",
                                    cursor: privilegeIDs.includes(3) ? 'pointer' : "default",
                                    textDecoration: privilegeIDs.includes(3) ? 'underline' : "none"
                                }}
                            >
                              {article.Title}
                            </Typography>
                        </Box>
                    ))}
                  </PanelCard>
                </Box>
            </Box>
            {privilegeIDs.includes(3) && (
                <EditArticleModal
                    open={editModalOpen}
                    article={selectedArticle}
                    onClose={handleCloseModal}
                />
            )}
        </Box>
    )
}

interface PanelCardProps {
    title: string
    children: React.ReactNode
    onTitleClick?: () => void
    sx?: SxProps<Theme>
}
const PanelCard = ({title, children, onTitleClick, sx}: PanelCardProps) => {
    const clickable = !!onTitleClick

    return (
    <Paper elevation={2} sx={{
        borderRadius: 2,
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        ...sx
    }}>
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
                pb: 0.5,
                borderBottom: "1px solid",
                borderColor: "divider"
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{ 
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "text.primary",
                    cursor: onTitleClick ? 'pointer' : 'default',
                    "&:hover": clickable ? {color: "secondary.main", textDecoration: "underline"} : {},
                    transition: "color 0.2s ease",
                }}
                onClick={onTitleClick}
            >
                {title}
            </Typography>
        </Box>
        <Box sx={{flexGrow: 1, overflow: "auto"}}>
            {children}
        </Box>
    </Paper>
)}
function createEmptyArticle(): PartialArticle {
    return {
        ID: -1,
        Title: "",
        Content: "",
        Article_Description: "",
        Image: "",
        NumThumbsUp: 0,
        NumThumbsDown: 0
    };
}

export default AdminSplashScreen;