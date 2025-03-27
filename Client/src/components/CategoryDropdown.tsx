import { useEffect, useState } from "react"
import { FormControl, InputLabel, Select, SelectChangeEvent, MenuItem } from "@mui/material"
import { PartialMetaTag, MetaTag } from "../custom_objects/models"

interface CategoryDropdownProps {
    articleID: number,
    setCurrentCategory: (x: string) => void
}

function CategoryDropdown( {articleID, setCurrentCategory}: CategoryDropdownProps) {
    const [categories, setCategories] = useState<PartialMetaTag[]>([])
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string>('')
    const [selectedCategoryID, setSelectedCategoryID] = useState<number>(0)
    const [selectedCategory, setSelectedCategory] = useState<MetaTag>()

    useEffect(() => {
        fetch(`http://localhost:5000/api/v1/article/categories?ArticleID=${articleID}`, {
            method: "GET",
            credentials: "include"
        })
        .then(response => {
            if(!response.ok) {
                throw new Error('Failed to fetch article meta tag')
            }
            return response.json()
        })
        .then(data => {
            console.log("Article meta tag = ", data)
            if (data && data.metatags) {
                setSelectedCategoryLabel(data.metatags[0].TagName)
                setSelectedCategoryID(data.metatags[0].ID)
                setSelectedCategory(data.metatags[0])
                console.log(selectedCategoryLabel)
                console.log(selectedCategoryID)
                console.log(selectedCategory)
            }
        })
        .catch(error => {
            console.error("Error fetching tag: ", error)
        })
    }, [])

    useEffect(() => {
        fetch('http://localhost:5000/api/v1/categories', {
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
            if (data && data.categories) {
                setCategories(data.categories)
            }            
        })
        .catch(error => {
            console.error("Error fetching tags: ", error)
        })
    }, [])

    const categoryChanged = (event: SelectChangeEvent<string>) => {
        const newCategoryID = parseInt(event.target.value)
        setSelectedCategoryID(newCategoryID)
        const newCategory = categories.find((tag) => tag.ID === newCategoryID);
        const newCategoryLabel = newCategory ? newCategory.TagName : ""
        setSelectedCategoryLabel(newCategoryLabel)
        setCurrentCategory(newCategoryLabel)
        console.log(newCategoryID)
        console.log(newCategoryLabel)
        
        fetch("http://localhost:5000/api/v1/article/categories", {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                articleID: articleID,
                metatagID: newCategoryID
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
                value={selectedCategoryID.toString()}
                onChange={categoryChanged}
                label="Tag"
            >
                {categories.map((tag, index) => (
                    <MenuItem key={tag.ID} value={tag.ID.toString()}>
                        {tag.TagName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default CategoryDropdown;