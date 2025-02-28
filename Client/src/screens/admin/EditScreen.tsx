import React, {useEffect, useState} from "react";
import { TextField, Dialog, AppBar, Toolbar, IconButton, Typography, Slide, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText, SelectChangeEvent} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {TransitionProps} from "@mui/material/transitions";
// import AdminAppBar from "../../components/AdminAppBar";
import { TextEditor } from "../../components/TextEditor";
import { PartialArticle, PartialMetaTag } from "../../custom_objects/models";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
})

interface Props{
    open: boolean;
    article: PartialArticle;
    onClose: () => void;
}

function EditArticleModal({ open, article, onClose }: Props) {
    const articleID = article.ID
    console.log(articleID)

    const [categories, setCategories] = useState<string[]>([])
    const [allCategories, setAllCategories] = useState<string[]>([])
    const [newCategory, setNewCategory] = useState("")

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
            },
        },
        };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            addCategory()
        }
    };

    const addCategory = async() => {
        const params = new URLSearchParams({
            articleID: (article.ID).toString(),
            category: newCategory,
        });

        const response = await fetch(`http://localhost:5000/api/v1/article/categories?${params.toString()}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        setNewCategory("")
        getCategories()
    }

    const getCategories = async() => {
        const responseAllCategories = await fetch('http://localhost:5000/api/v1/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const dataAllCategories = await responseAllCategories.json();
        console.log(dataAllCategories)

        setAllCategories(dataAllCategories.categories.map((category: PartialMetaTag) => category.TagName))
        console.log(allCategories)

        const params = new URLSearchParams({
            articleID: (article.ID).toString()
        });

        const responseCategories = await fetch(`http://localhost:5000/api/v1/article/categories?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const dataCategories = await responseCategories.json();
        console.log(dataCategories)

        const tempCategories = dataCategories.categories as string[]
        if (Array.isArray(tempCategories) && tempCategories.every(item => typeof item === 'string')) {
            setCategories(dataCategories.categories as string[]);
        } else {
            setCategories([]);
        }
        console.log(allCategories)
    }

    useEffect(() => {
        getCategories()
    }, []);

    const handleCatChange = (event: SelectChangeEvent<string | string[]>) => {
        const {
            target: { value },
          } = event;
          console.log(`value is ${value}`)
          const potentialCategories = Array.isArray(value) ? value.join(",") : value as string;
          if (potentialCategories.length === 0) {
              setCategories([])
          } else {
            setCategories(potentialCategories.split(","));
          }
    }

    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AppBar sx={{position: "relative"}}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {article ? "Edit Article" : "New Article"}
                    </Typography>
                </Toolbar>
            </AppBar>
            <div style={{width: "100%", height: "20%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div style={{display: "flex", flexDirection: "row" , backgroundColor: "white",  width: '80%', height: "100%", marginTop: '10px'}}>
                    <div style={{width: "50%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                        <FormControl size="small" className='HaveShadow' sx={{ m: 1, width: 300, backgroundColor: "white", borderRadius: "5px"}}>
                            <InputLabel id="demo-multiple-checkbox-label" sx={{color: "black"}}>Categories</InputLabel>
                            <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            value={categories}
                            onChange={handleCatChange}
                            input={<OutlinedInput label="Tags" />}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}
                            >
                            {allCategories.map((category) => (
                                <MenuItem key={category} value={category}>
                                <Checkbox checked={categories.includes(category)} />
                                <ListItemText primary={category} />
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{width: "50%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                        <TextField variant="outlined" size="small" sx={{width: "90%", backgroundColor: "white", color: "black"}} 
                        onChange={(e) => setNewCategory(e.target.value)}
                        label="Make a new category"
                        value={newCategory}
                        className="HaveShadow"
                        onKeyUp={handleKeyUp}></TextField>
                    </div>
                </div>
            </div>
            <div style={{padding: "16px"}}>
                <TextEditor articleID={articleID}/>
            </div>
        </Dialog>
    )
}

export default EditArticleModal;