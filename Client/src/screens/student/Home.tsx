import StudentAppBar from "../../components/StudentAppBar";
import SearchBar from "../../components/SearchBar";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import ArticleModal from "../../components/ArticleModal";
import { Typography, Modal, Button, TextField } from "@mui/material";
import { PartialArticle } from "../../custom_objects/models";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentHome({ currentScreen, setCurrentScreen }: Props){

    const [searchVal, setsearchVal] = useState("");

    const [articles, setArticles] = useState<PartialArticle[]>([]);

    const [openNoResultFoundModal, setOpenNoResultFoundModal] = useState(false);

    const [currentArticle, setCurrentArticle] = useState<PartialArticle | null>(null);
    const [openArticleModal, setOpenArticleModal] = useState(false);

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
        if (event.key === "Enter") {
            console.log(searchVal); 
            setHasSearched(true);
            handleSearch()
        }
    };

    const handleSearch = () => {
        if (searchVal === ""){
            defaultArticles()
            console.log("default")
        } else {
            searchArticles()
        }
    };

    const defaultArticles = async () => {
        const response = await fetch('http://localhost:5000/api/v1/articles', {
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
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
            <div style={{ flexShrink: 0, height: "10%", width: "100%"}}></div>
            <SearchBar setSearchVal={setsearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={"medium"}></SearchBar>
            <div style={{ flexShrink: 0, height: "10px"}}></div>            
            {articles?.map((article) => {
                return <ArticleCard onClick={() => {
                    setCurrentArticle(article);
                    setOpenArticleModal(true)
                }} article={article} lineNumber={3} key={article.ID}/>;
            })}
            {hasSearched && <Typography onClick={() => {
                setOpenNoResultFoundModal(true);
            }} sx={{color: 'text.secondary', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px', fontWeight: '600', position: 'fixed', bottom: 20, ackdropFilter: 'blur(5px)', backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '10px', borderRadius: '8px'}}>I didn't find a solution</Typography>}
       
            <NoResultFoundModal open={openNoResultFoundModal} setOpen={setOpenNoResultFoundModal}/>
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
}

function NoResultFoundModal({ open, setOpen }: NoResultFoundModalProps){
    
    const [problemDescription, setProblemDescription] = useState("");
    
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
                        rows={18}
                        defaultValue=""
                        onChange={(e) => setProblemDescription(e.target.value)}
                        variant="outlined"
                        sx={{width: "99%"}}
                    ></TextField>
                </div>
                <div style={{height: "10%", width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <Button variant="contained" sx={{height: "64px", width: "152px", backGroundColor: "primary"}} onClick={() => {
                        setOpen(false);
                        console.log(problemDescription);
                    }}>Submit</Button>
                </div>
            </div>
        </Modal>
    );
}

export default StudentHome;