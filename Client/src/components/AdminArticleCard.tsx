import { Typography } from "@mui/material";
import { PartialArticle } from "../custom_objects/models";

interface Props{
    article: PartialArticle,
    lineNumber: number,
    onClick: (article: PartialArticle) => void
}

function AdminArticleCard({ article, lineNumber, onClick }: Props){
    const lineNumberString: string = lineNumber.toString();
    const height: number = (18*1.5) + ((lineNumber)*(16*1.5)) + 15;
    const heightString: string = height.toString() + "px";
    return (
        <div onClick={() => {onClick(article)}}
            style={{width: "85%", height: heightString, display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid grey", borderRadius: "20px", margin: "10px", position: "relative" }}
        >
            <Typography style={{
                fontSize: "18px",
                textAlign: "center",
                width: "95%",
                paddingTop: "5px",
                overflow: "hidden",
                fontWeight: "600",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
            }}> {article.Title}</Typography>

            <Typography style={{
                fontSize: "16px",
                textAlign: "left",
                width: "95%",
                paddingTop: "8px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: lineNumberString,
                WebkitBoxOrient: "vertical",
            }}>{article.Article_Description}</Typography>
        
        </div>
    );
}

export default AdminArticleCard;