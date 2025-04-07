import { Typography, MenuItem, FormControl, Select, InputLabel, SelectChangeEvent } from "@mui/material";
import { PartialArticle } from "../custom_objects/models";
import { useState, useEffect } from "react";
import "../global.css";
import { APIBASE } from "../ApiBase";

interface Props{
    article: PartialArticle,
    lineNumber: number,
    onClick: (article: PartialArticle) => void,
    userPrivileges: number[]
}

function AdminArticleCard({ article, lineNumber, onClick, userPrivileges }: Props){

    const lineNumberString: string = lineNumber.toString();
    const height: number = (18*1.5) + ((lineNumber)*(16*1.5)) + 15;
    const heightString: string = height.toString() + "px";
    const [tag, setTag] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const getTagsInfo = async () => {
        
        const params = new URLSearchParams({
            ID: article.ID.toString()
        });

        const response = await fetch(APIBASE + `/api/v1/article/tag?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        setTag(data.tag as string);
        setTags(data.tags as string[]);
    }

    const updateTag = async (potentialTag: string) => {
        const params = new URLSearchParams({
            ID: article.ID.toString(),
            TagName : potentialTag
        });

        const response = await fetch(APIBASE + `/api/v1/article/tag?${params.toString()}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
    }

    const handleChange = (event: SelectChangeEvent<string>) => {
            const {
              target: { value },
            } = event;
            console.log(`value is ${value}`)
            const potentialTag = value as string;
            setTag(potentialTag);

            updateTag(potentialTag);
    }

    useEffect(() => {
        getTagsInfo()
    }, [])

    return (
        <div onClick={() => {onClick(article)}}
            className="HaveShadow"
            style={{width: "85%", height: heightString, display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid grey", borderRadius: "20px", margin: "10px", position: "relative", cursor: userPrivileges.includes(3)?"pointer":"auto", backgroundColor: "white" }}
        >

            <div style={{width: "100%",  display: "flex", flexDirection: "row", alignItems: "space-evenly", }}>
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

                {userPrivileges.includes(3) && (
                    <FormControl size="small" sx={{minWidth: "20%", marginTop: "8px", marginRight: "40px", borderRadius: "10px"}}>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={tag}
                            onChange={handleChange}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {tags.map((tempTag) => (
                                <MenuItem key={tempTag} value={tempTag}>
                                    {tempTag}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </div>

            <Typography style={{
                fontSize: "16px",
                textAlign: "left",
                width: "95%",
                paddingTop: "8px",
                marginBottom: "8px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: lineNumberString,
                WebkitBoxOrient: "vertical",
            }}>{article.Article_Description}</Typography>
        
        </div>
    );
}

export default AdminArticleCard;