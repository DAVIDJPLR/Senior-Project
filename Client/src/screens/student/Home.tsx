import StudentAppBar from "../../components/StudentAppBar";
import SearchBar from "../../components/SearchBar";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import { Article } from "../../custom_objects/Article";
import ArticleCard from "../../components/ArticleCard";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentHome({ currentScreen, setCurrentScreen }: Props){

    const [searchVal, setsearchVal] = useState("");

    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        const someArticles: Article[] = [
            {
                id: 1,
                title: "Article 1",
                description: "This is the first article",
                content: "This is the content of the first article"
            },
            {
                id: 2,
                title: "Article 2",
                description: "This is the second article",
                content: "This is the content of the second article"
            },
            {
                id: 3,
                title: "Article 3",
                description: "This is the third article",
                content: "This is the content of the third article"
            },
        ]

        setArticles(someArticles);
    }, []);

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            console.log(searchVal); 
        }
    };

    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
            <div style={{height: "10%"}}></div>
            <SearchBar searchval={searchVal} setSearchVal={setsearchVal} handleKeyUp={handleKeyUp}></SearchBar>
            <div style={{height: "10px"}}></div>            
            {articles?.map((article) => {
                return <ArticleCard article={article} lineNumber={3} key={article.id}/>;
            })}
        </div>
    )
}

export default StudentHome;