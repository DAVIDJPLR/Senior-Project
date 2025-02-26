import React, { useEffect, useState } from "react"
import { FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, Input } from "@mui/material"
import { Article, PartialTag } from "../custom_objects/models"

interface TagDropdownProps {
    article: Article
}

function TagDropdown( {article}: TagDropdownProps) {
    const [tags, setTags] = useState<string[]>([])
    const [selectedTag, setSelectedTag] = useState<string>(article.Tags[0].TagName || "")

    useEffect(() => {
        fetch("http://localhost:5000/api/v1/articletag/getall", {
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
        const newTag = event.target.value as string;
        setSelectedTag(newTag)
    }

    return (
        <FormControl variant="outlined" size="small" style={{marginTop: "10px"}}>
            <InputLabel id="tag-dropdown-label">Tag</InputLabel>
            <Select
                labelId="tag-dropdown-label"
                id="tag-dropdown"
                value={selectedTag}
                onChange={tagChanged}
                label="Tag"
            >
                {tags.map((tag, index) => (
                    <MenuItem key={index} value={tag}>
                        {tag}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default TagDropdown;