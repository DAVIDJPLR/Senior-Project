import { useEffect, useState } from "react"
import { FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, Box, CircularProgress } from "@mui/material"
import { PartialMetaTag, MetaTag } from "../custom_objects/models"
import { APIBASE } from "../ApiBase"

interface CategoryDropdownProps {
    articleID: number,
    setCurrentCategory: (x: string) => void
}

function CategoryDropdown( {articleID, setCurrentCategory}: CategoryDropdownProps) {
    const [categories, setCategories] = useState<PartialMetaTag[]>([])
    const [selectedCategoryID, setSelectedCategoryID] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const CREATE_NEW_CATEGORY_ID = -1;

    useEffect(() => {
        fetch(APIBASE + `/api/v1/article/categories?ArticleID=${articleID}`, {
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
            if (data && data.metatags) {
                setSelectedCategoryID(data.metatags[0].ID)
            }
        })
        .catch(error => {
            console.error("Error fetching tag: ", error)
        })
    }, [])

    useEffect(() => {
        fetch(APIBASE + '/api/v1/categories', {
            method: "GET",
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tags')
            }
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

    const categoryChanged = async (event: SelectChangeEvent<string>) => {
        
        const value = event.target.value
        let newCategoryID = parseInt(value)
        setLoading(true)
        try {
            if (newCategoryID === CREATE_NEW_CATEGORY_ID) {
                const newCategoryName = prompt("Enter a new category name: ")
                if (!newCategoryName) {
                    setLoading(false)
                    return
                }
                const response = await fetch (APIBASE + "/api/v1/category", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        TagName: newCategoryName
                    })
                })

                if (!response.ok) throw new Error("Failed to create category.")

                const created = await response.json()
                newCategoryID = created.ID;
                setCategories(prev => [...prev, created])
                setSelectedCategoryID(newCategoryID)
                setCurrentCategory(created.TagName)
            } else {
                const newCategory = categories.find((tag) => tag.ID === newCategoryID);
                const newCategoryLabel = newCategory ? newCategory.TagName : ""
            
                setSelectedCategoryID(newCategoryID)
                setCurrentCategory(newCategoryLabel)
              
            }

            const putResponse = await fetch(APIBASE + "/api/v1/article/categories", {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    articleID: articleID,
                    metatagID: newCategoryID
                })
            });

            if (!putResponse.ok) {
                throw new Error("Failed to update article tag");
           }

            const updated = await putResponse.json();
            console.log("Article tag updated: ", updated);
        } catch (error) {
            console.log("Error handling category change: ", error)
        } finally {
            setLoading(false)
        }
    }

    let createText = "+ Create new category"

    if (selectedCategoryID === undefined) {
        return null;
    }
    return (
        <Box sx={{position: "relative", width: 200}}>
            <FormControl variant="outlined" size="small" sx={{width: 200}}>
                <InputLabel id="tag-dropdown-label">Tag</InputLabel>
                <Select
                    labelId="tag-dropdown-label"
                    id="tag-dropdown"
                    value={selectedCategoryID.toString()}
                    onChange={categoryChanged}
                    label="Category"
                    disabled={loading}
            >
                {categories.map((tag) => (
                    <MenuItem key={tag.ID} value={tag.ID.toString()}>
                        {tag.TagName}
                    </MenuItem>
                ))}
                <MenuItem value={CREATE_NEW_CATEGORY_ID}>{createText}</MenuItem>
              </Select>
            </FormControl>

            {loading && (
                <CircularProgress
                    size={24}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: "-12px",
                        marginBottom: "-12px",
                        zIndex: 1,
                    }}
                />
            )}
        </Box>
    );
}

export default CategoryDropdown;