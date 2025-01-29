import React, {useState} from "react";
import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import { TextEditor } from "../../components/TextEditor";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function ArticleEdit({ currentScreen, setCurrentScreen }: Props){
    const [articleContent, setArticleContent] = useState<string>("");

    const handleContentChange = (content: string) => {
        setArticleContent(content);
    };
    
    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column"}}>
            <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>

            {/* Text Editor */}
            <div style={({flex: 1, padding: "16px", overflow: "auto"})}>
                <h2>Edit Article</h2>
                <TextEditor/>   
            </div>
        </div>
    )
}

export default ArticleEdit;