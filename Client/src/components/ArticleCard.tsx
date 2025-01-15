import { Typography } from "@mui/material";
import { Article } from "../custom_objects/Article";

interface Props{
    article: Article,
    lineNumber: number
}

function ArticleCard({ article, lineNumber }: Props){
    const lineNumberString: string = lineNumber.toString();
    const height: number = (18*1.5) + ((lineNumber)*(16*1.5)) + 15;
    const heightString: string = height.toString() + "px";
    return (
        <div style={{width: "85%", height: heightString, display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid grey", borderRadius: "20px", margin: "10px"}}>
            <Typography style={{ fontSize: "18px", textAlign: "center", width: "95%", paddingTop: "5px", overflow: "hidden", fontWeight: "600", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical",}}>{article.title}</Typography>
            <Typography style={{ fontSize: "16px", textAlign: "left", width: "95%", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: lineNumberString, WebkitBoxOrient: "vertical",}}>{article.description}</Typography>
        </div>
    );
}

export default ArticleCard;