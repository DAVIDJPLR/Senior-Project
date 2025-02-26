import {useEffect, useState} from 'react'
import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import {PartialArticle, PartialTag} from "../../custom_objects/models"
import AdminArticleCard from '../../components/AdminArticleCard';
import EditArticleModal from './EditScreen';
import AdminSearchBar from "../../components/AdminSearchBar";
import { useMediaQuery } from "react-responsive";
import { useTheme, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText, SelectChangeEvent } from "@mui/material";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminArticles({ currentScreen, setCurrentScreen }: Props){

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

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedArticle, setSelectedArticle] = useState<PartialArticle | null>(null)
    const [articles, setArticles] = useState<PartialArticle[]>([])
    const [searchVal, setSearchVal] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);

    const isMobile = useMediaQuery({ maxWidth: 767 });

    const theme = useTheme();

    const handleEditArticle = (article: PartialArticle) => {
        setSelectedArticle(article)
        setEditModalOpen(true)
    };

    const handleCloseModal = () => {
        setEditModalOpen(false)
        setSelectedArticle(null)
    };
    
    useEffect(() => {
        getArticles()
        getTags()
    }, []);

    useEffect(() => {
        handleSearch()
    }, [tags])

    const handleChange = (event: SelectChangeEvent<typeof tags>) => {
        const {
          target: { value },
        } = event;
        console.log(`value is ${value}`)
        const potentialTags = Array.isArray(value) ? value.join(",") : value as string;
        if (potentialTags.length === 0) {
            setTags([])
        } else {
            setTags(potentialTags.split(","));
        }
    }
    
    const getTags = async () => {
        const response = await fetch('http://localhost:5000/api/v1/articletag/getall', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)

        setAllTags(data.Tags.map((tag: PartialTag) => tag.TagName))
        console.log(allTags)
    }

    const getArticles = async () => {
        const response = await fetch('http://localhost:5000/api/v1/articles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)

        setArticles(data.articles as PartialArticle[])
    }

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            console.log(searchVal); 
            handleSearch()
        }
    };

    const handleSearch = () => {
        console.log(`searching with val |${searchVal}| and tags |${tags}|`)
        console.log(`len of tags is ${tags.length}`)
        if (searchVal === "" && tags.length === 0) {
            defaultArticles()
            console.log("default")
        } else {
            searchArticles()
        }
    };

    const defaultArticles = async () => {
        const response = await fetch('http://localhost:5000/api/v1/articles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)

        setArticles(data.articles as PartialArticle[])
    }

    const searchArticles = async () => {
        const params = new URLSearchParams({
            searchQuery: searchVal,
            tags: tags.join(",")
        });

        console.log(`searching with val ${searchVal} and tag ${tags}`)

        const response = await fetch(`http://localhost:5000/api/v1/articles/search/tagandquery?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)

        setArticles(data.results as PartialArticle[])
    }
    
    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden"}}>
            {!isMobile && (
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                </div>
            )}
            
            <div style={{ width: "100%", height: "95%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto", backgroundColor: theme.palette.secondary.main}}>
                <div style={{width: "90%", height: "20%", display: "flex", flexDirection: "row", justifyContent: "evenly-spaced", alignItems: "center", gap: "10%"}}>
                    <AdminSearchBar setSearchVal={setSearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={"medium"}></AdminSearchBar>
                
                    <FormControl size="small" className='HaveShadow' sx={{ m: 1, width: 300, backgroundColor: "white", borderRadius: "5px"}}>
                        <InputLabel id="demo-multiple-checkbox-label" sx={{color: "black"}}>Filter tags</InputLabel>
                        <Select
                        labelId="demo-multiple-checkbox-label"
                        id="demo-multiple-checkbox"
                        multiple
                        value={tags}
                        onChange={handleChange}
                        input={<OutlinedInput label="Tags" />}
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={MenuProps}
                        >
                        {allTags.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                            <Checkbox checked={tags.includes(tag)} />
                            <ListItemText primary={tag} />
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                </div>
                {articles.map((article) => (
                    <AdminArticleCard
                        key={article.ID}
                        article={article}
                        lineNumber={3}
                        onClick={handleEditArticle}
                    />
                ))}
                <EditArticleModal
                    open={editModalOpen}
                    article={selectedArticle}
                    onClose={handleCloseModal}
                />
            </div>
            {isMobile && (
                <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                </div>
            )}
        </div>
    )
}

export default AdminArticles;