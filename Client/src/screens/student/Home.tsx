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
            <SearchBar setSearchVal={setsearchVal} handleKeyUp={handleKeyUp} size={"medium"}></SearchBar>
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

function getTestArticles(): PartialArticle[]{
    return [
        {
            ID: 1,
            Title: "Article 1",
            Article_Description: "This is the first article",
            Content: "This is the content of the first article",
            Image: "image1.jpg",
            ThumbsUp: 10,
            ThumbsDown: 2
        },
        {
            ID: 2,
            Title: "Article 2",
            Article_Description: "This is the second article",
            Content: "This is the content of the second article",
            Image: "image2.jpg",
            ThumbsUp: 15,
            ThumbsDown: 3
        },
        {
            ID: 3,
            Title: "Article 3",
            Article_Description: "This is the third article",
            Content: "This is the content of the third article",
            Image: "image3.jpg",
            ThumbsUp: 20,
            ThumbsDown: 1
        },
        {
            ID: 4,
            Title: "Article 4",
            Article_Description: "This is the fourth article",
            Content: "This is the content of the fourth article",
            Image: "image4.jpg",
            ThumbsUp: 25,
            ThumbsDown: 5
        },
        {
            ID: 5,
            Title: "Article 5",
            Article_Description: "This is the fifth article",
            Content: "This is the content of the fifth article",
            Image: "image5.jpg",
            ThumbsUp: 30,
            ThumbsDown: 4
        },
        {
            ID: 6,
            Title: "Article 6",
            Article_Description: "This is the sixth article",
            Content: "This is the content of the sixth article",
            Image: "image6.jpg",
            ThumbsUp: 35,
            ThumbsDown: 6
        },
        {
            ID: 7,
            Title: "Article 7",
            Article_Description: "This is the seventh article",
            Content: "This is the content of the seventh article",
            Image: "image7.jpg",
            ThumbsUp: 40,
            ThumbsDown: 7
        },
        {
            ID: 8,
            Title: "Article 8",
            Article_Description: "This is the eighth article",
            Content: "This is the content of the eighth article",
            Image: "image8.jpg",
            ThumbsUp: 45,
            ThumbsDown: 8
        },
        {
            ID: 9,
            Title: "Article 9",
            Article_Description: "This is the ninth article",
            Content: "This is the content of the ninth article",
            Image: "image9.jpg",
            ThumbsUp: 50,
            ThumbsDown: 9
        },
        {
            ID: 10,
            Title: "Article 10",
            Article_Description: "This is the tenth article",
            Content: "This is the content of the tenth article",
            Image: "image10.jpg",
            ThumbsUp: 55,
            ThumbsDown: 10
        },
        {
            ID: 11,
            Title: "Article 11",
            Article_Description: "This is the eleventh article",
            Content: "This is the content of the eleventh article",
            Image: "image11.jpg",
            ThumbsUp: 60,
            ThumbsDown: 11
        },
        {
            ID: 12,
            Title: "Article 12",
            Article_Description: "This is the twelfth article",
            Content: "This is the content of the twelfth article",
            Image: "image12.jpg",
            ThumbsUp: 65,
            ThumbsDown: 12
        },
        {
            ID: 13,
            Title: "Article 13",
            Article_Description: "This is the thirteenth article",
            Content: "This is the content of the thirteenth article",
            Image: "image13.jpg",
            ThumbsUp: 70,
            ThumbsDown: 13
        },
        {
            ID: 14,
            Title: "Article 14",
            Article_Description: "This is the fourteenth article",
            Content: "This is the content of the fourteenth article",
            Image: "image14.jpg",
            ThumbsUp: 75,
            ThumbsDown: 14
        },
        {
            ID: 15,
            Title: "Article 15",
            Article_Description: "This is the fifteenth article",
            Content: "This is the content of the fifteenth article",
            Image: "image15.jpg",
            ThumbsUp: 80,
            ThumbsDown: 15
        },
        {
            ID: 16,
            Title: "Article 16",
            Article_Description: "This is the sixteenth article",
            Content: "This is the content of the sixteenth article",
            Image: "image16.jpg",
            ThumbsUp: 85,
            ThumbsDown: 16
        },
        {
            ID: 17,
            Title: "Article 17",
            Article_Description: "This is the seventeenth article",
            Content: "This is the content of the seventeenth article",
            Image: "image17.jpg",
            ThumbsUp: 90,
            ThumbsDown: 17
        },
        {
            ID: 18,
            Title: "Article 18",
            Article_Description: "This is the eighteenth article",
            Content: "This is the content of the eighteenth article",
            Image: "image18.jpg",
            ThumbsUp: 95,
            ThumbsDown: 18
        },
        {
            ID: 19,
            Title: "Article 19",
            Article_Description: "This is the nineteenth article",
            Content: "This is the content of the nineteenth article",
            Image: "image19.jpg",
            ThumbsUp: 100,
            ThumbsDown: 19
        },
        {
            ID: 20,
            Title: "Article 20",
            Article_Description: "This is the twentieth article",
            Content: "This is the content of the twentieth article",
            Image: "image20.jpg",
            ThumbsUp: 105,
            ThumbsDown: 20
        },
        {
            ID: 21,
            Title: "Article 21",
            Article_Description: "This is the twenty-first article",
            Content: "This is the content of the twenty-first article",
            Image: "image21.jpg",
            ThumbsUp: 110,
            ThumbsDown: 21
        },
        {
            ID: 22,
            Title: "Article 22",
            Article_Description: "This is the twenty-second article",
            Content: "This is the content of the twenty-second article",
            Image: "image22.jpg",
            ThumbsUp: 115,
            ThumbsDown: 22
        },
        {
            ID: 23,
            Title: "Article 23",
            Article_Description: "This is the twenty-third article",
            Content: "This is the content of the twenty-third article",
            Image: "image23.jpg",
            ThumbsUp: 120,
            ThumbsDown: 23
        },
        {
            ID: 24,
            Title: "Article 24",
            Article_Description: "This is the twenty-fourth article",
            Content: "This is the content of the twenty-fourth article",
            Image: "image24.jpg",
            ThumbsUp: 125,
            ThumbsDown: 24
        },
        {
            ID: 25,
            Title: "Article 25",
            Article_Description: "This is the twenty-fifth article",
            Content: "This is the content of the twenty-fifth article",
            Image: "image25.jpg",
            ThumbsUp: 130,
            ThumbsDown: 25
        },
        {
            ID: 26,
            Title: "Article 26",
            Article_Description: "This is the twenty-sixth article",
            Content: "This is the content of the twenty-sixth article",
            Image: "image26.jpg",
            ThumbsUp: 135,
            ThumbsDown: 26
        },
        {
            ID: 27,
            Title: "Article 27",
            Article_Description: "This is the twenty-seventh article",
            Content: "This is the content of the twenty-seventh article",
            Image: "image27.jpg",
            ThumbsUp: 140,
            ThumbsDown: 27
        },
        {
            ID: 28,
            Title: "Article 28",
            Article_Description: "This is the twenty-eighth article",
            Content: "This is the content of the twenty-eighth article",
            Image: "image28.jpg",
            ThumbsUp: 145,
            ThumbsDown: 28
        },
        {
            ID: 29,
            Title: "Article 29",
            Article_Description: "This is the twenty-ninth article",
            Content: "This is the content of the twenty-ninth article",
            Image: "image29.jpg",
            ThumbsUp: 150,
            ThumbsDown: 29
        },
        {
            ID: 30,
            Title: "Article 30",
            Article_Description: "This is the thirtieth article",
            Content: "This is the content of the thirtieth article",
            Image: "image30.jpg",
            ThumbsUp: 155,
            ThumbsDown: 30
        }
    ];
}

export default StudentHome;