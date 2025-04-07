import StudentAppBar from "../../components/StudentAppBar";
import SearchBar from "../../components/SearchBar";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import ArticleModal from "../../components/ArticleModal";
import { Typography, Modal, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert } from "@mui/material";
import { PartialArticle } from "../../custom_objects/models";
import { useMediaQuery } from "react-responsive";   
import { APIBASE } from "../../ApiBase";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentHome({ currentScreen, setCurrentScreen }: Props){

    const [searchVal, setsearchVal] = useState("");

    const [alertVis, setAlertVis] = useState(false);

    const [articles, setArticles] = useState<PartialArticle[]>([]);

    const [openNoResultFoundModal, setOpenNoResultFoundModal] = useState(false);

    const [currentArticle, setCurrentArticle] = useState<PartialArticle | null>(null);
    const [openArticleModal, setOpenArticleModal] = useState(false);

    const isMobile = useMediaQuery({ maxWidth: 767 });

    useEffect(() => {
        defaultArticles()
    }, []);

    useEffect(() => {
        if (openNoResultFoundModal){
            setHasSearched(false);
        }
    }, [openNoResultFoundModal]);

    const [hasSearched, setHasSearched] = useState(false);

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(searchVal); 
        setHasSearched(true);
        handleSearch()
        
        // if (event.key === "Enter") {
        //     console.log(searchVal); 
        //     setHasSearched(true);
        //     handleSearch()
        // }
    };

    const handleSearch = () => {
        if (searchVal.length === 0) {
            defaultArticles()
            console.log("default")
        } else {
            searchArticles()
        }
    };

    const defaultArticles = async () => {
        const response = await fetch(APIBASE + '/api/v1/articles/trending/', {
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
            searchQuery: searchVal
        });

        console.log(`searching with val ${searchVal}`)

        const response = await fetch(APIBASE + `/api/v1/articles/search?${params.toString()}`, {
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
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden"}}>
            {alertVis && (
                <Alert severity="success" onClose={() => {setAlertVis(false)}} style={{position: 'fixed', top: "20px", zIndex: 1300, fontSize: '1.5rem', padding: '20px'}}>Issue Submitted</Alert>
            )}
            {!isMobile && (
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
                </div>
            )}

            <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "5%", marginTop: "5%"}}>
                <SearchBar setSearchVal={setsearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={"medium"}></SearchBar>
            </div>

            <div style={{height: "85%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto"}}>
                {articles?.map((article) => {
                    return <ArticleCard onClick={() => {
                        setCurrentArticle(article);
                        setOpenArticleModal(true);
                        logView(article);
                    }} article={article} lineNumber={3} key={article.ID}/>;
                })}
            </div> 

            {isMobile && (
                <div style={{height: "6%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
                </div>
            )}

            {hasSearched && <Typography onClick={() => {
                setOpenNoResultFoundModal(true);
            }} sx={{color: 'text.secondary', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px', fontWeight: '600', position: 'fixed', bottom: 60, ackdropFilter: 'blur(5px)', backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '10px', borderRadius: '8px'}}>I didn't find a solution</Typography>}
       
            <NoResultFoundModal open={openNoResultFoundModal} setOpen={setOpenNoResultFoundModal} setAlertVis={setAlertVis}/>
            <ArticleModal handleClose={() => {
                setOpenArticleModal(false);
                setCurrentArticle(null);
                }} open={openArticleModal} article={currentArticle}></ArticleModal>
        </div>
    )
}

interface NoResultFoundModalProps{
    open: boolean,
    setOpen: (open: boolean) => void,
    setAlertVis: (alertVis: boolean) => void
}

function NoResultFoundModal({ open, setOpen, setAlertVis }: NoResultFoundModalProps){
    
    const [problemDescription, setProblemDescription] = useState("");
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const isMobile = useMediaQuery({ maxWidth: 767 });
    
    const submitContent = async () => {
        const response = await fetch(APIBASE + '/api/v1/nosolution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 'content': problemDescription })
        });

        const data = await response.json();
        console.log(data)
    }

    return(
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: "100%", width: "100%"}}
        >
            <div style={{height: "70%", width: "80%", backgroundColor: 'white', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{height: "10%", width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <Typography sx={{textDecoration: "underline"}}> No Solution</Typography>
                </div>
                <div style={{height: "80%", width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <TextField
                        id="outlined-multiline-static"
                        label="What problem are you having?"
                        multiline
                        rows={isMobile ? 13 : 9}
                        defaultValue=""
                        onChange={(e) => setProblemDescription(e.target.value)}
                        variant="outlined"
                        sx={{width: "99%", height: "99%"}}
                    ></TextField>
                </div>
                <div style={{height: "10%", width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <Button variant="contained" sx={{height: "64px", width: "152px", backGroundColor: "primary"}} onClick={() => {
                        setOpenConfirmDialog(true)
                    }}>Submit</Button>
                </div>
                <ConfirmSubmissionDialog open={openConfirmDialog} onClose={() => {setOpenConfirmDialog(false)}} onConfirm={() => {
                    setOpen(false);
                    setOpenConfirmDialog(false);
                    submitContent();
                    setAlertVis(true);
                }} content={problemDescription}></ConfirmSubmissionDialog>
            </div>
        </Modal>
    );
}

interface confirmSubmissionProps{
    open: boolean,
    onClose: () => void,
    onConfirm: () => void,
    content: string
}

function ConfirmSubmissionDialog({ open, onClose, onConfirm, content }: confirmSubmissionProps){
    return(
        <Dialog open={open} onClose={onClose} sx={{width: "100%", height: "100%"}}>
            <DialogTitle sx={{fontSize: "30px"}}>Confirm Submission</DialogTitle>
            <DialogContent>
                <Typography sx={{fontSize: "25px", color: "grey"}}>Submission:</Typography>
                <div style={{height: "10px"}}></div>
                <DialogContentText sx={{fontSize: "20px", color: "black"}}>
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button size='large' onClick={onClose} variant="contained" sx={{height: "80px", width: "200px"}}>
                    Cancel
                </Button>
                <Button size='large' onClick={onConfirm} variant="contained" sx={{backgroundColor: "green", height: "80px", width: "200px"}} >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default StudentHome;