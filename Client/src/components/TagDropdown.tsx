import { useEffect, useState } from "react"
import { FormControl, InputLabel, Select, SelectChangeEvent, MenuItem } from "@mui/material"
import { PartialTag, Tag } from "../custom_objects/models"
import { APIBASE } from "../ApiBase"

interface TagDropdownProps {
    articleID: number,
    setCurrentTag: (x: string) => void
}

function TagDropdown( {articleID, setCurrentTag}: TagDropdownProps) {
    const [tags, setTags] = useState<PartialTag[]>([])
    const [selectedTagLabel, setSelectedTagLabel] = useState<string>('')
    const [selectedTagID, setSelectedTagID] = useState<number>(0)
    const [selectedTag, setSelectedTag] = useState<Tag>()

    useEffect(() => {
        fetch(APIBASE + `/api/v1/article/tags?ArticleID=${articleID}`, {
            method: "GET",
            credentials: "include"
        })
        .then(response => {
            if(!response.ok) {
                throw new Error('Failed to fetch article tag')
            }
            return response.json()
        })
        .then(data => {
            console.log("Article tag = ", data)
            if (data && data.tags) {
                setSelectedTagLabel(data.tags[0].TagName)
                setSelectedTagID(data.tags[0].ID)
                setSelectedTag(data.tags[0])
                console.log(selectedTagLabel)
                console.log(selectedTagID)
                console.log(selectedTag)
            }
        })
        .catch(error => {
            console.error("Error fetching tag: ", error)
        })
    }, [])

    useEffect(() => {
        fetch(APIBASE + '/api/v1/articletag/getall', {
            method: "GET",
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tags')
            }
            console.log("Returning Tags")
            return response.json()
        })
        .then(data => {
            console.log("Setting tags", data) 
            if (data && data.Tags) {
                setTags(data.Tags)
            }            
        })
        .catch(error => {
            console.error("Error fetching tags: ", error)
        })
    }, [])

    const tagChanged = (event: SelectChangeEvent<string>) => {
        const newTagID = parseInt(event.target.value)
        setSelectedTagID(newTagID)
        const newTag = tags.find((tag) => tag.ID === newTagID);
        const newTagLabel = newTag ? newTag.TagName : ""
        setSelectedTagLabel(newTagLabel)
        setCurrentTag(newTagLabel)
        console.log(newTagID)
        console.log(newTagLabel)
        
        fetch("http://localhost:5000/api/v1/article/tags", {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                articleID: articleID,
                tagID: newTagID
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update article tag")
            }
            return response.json()
        })
        .then(data => {
            console.log("Article tag updated: ", data)
        })
        .catch(error => {
            console.error("Error updating tag: ", error)
        })
    }

    return (
        <FormControl variant="outlined" size="small" sx={{width: 200}}>
            <InputLabel id="tag-dropdown-label">Tag</InputLabel>
            <Select
                labelId="tag-dropdown-label"
                id="tag-dropdown"
                value={selectedTagID.toString()}
                onChange={tagChanged}
                label="Tag"
            >
                {tags.map((tag, index) => (
                    <MenuItem key={tag.ID} value={tag.ID.toString()}>
                        {tag.TagName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default TagDropdown;