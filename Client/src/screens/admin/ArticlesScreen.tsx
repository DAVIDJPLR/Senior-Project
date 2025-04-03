import {useEffect, useState} from 'react'
import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import {PartialArticle, PartialTag} from "../../custom_objects/models"
import AdminArticleCard from '../../components/AdminArticleCard';
import EditArticleModal from './EditScreen';
import AdminSearchBar from "../../components/AdminSearchBar";
import { useMediaQuery } from "react-responsive";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { PartialAdminPrivilege } from "../../custom_objects/models";
import { useTheme, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText, SelectChangeEvent, Button } from "@mui/material";
import { APIBASE } from '../../ApiBase';

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
    const [selectedArticle, setSelectedArticle] = useState<PartialArticle>(createEmptyArticle())
    const [articles, setArticles] = useState<PartialArticle[]>([])
    const [searchVal, setSearchVal] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);

    const [privileges, setPrivileges] = useState<PartialAdminPrivilege[]>([]);
    const [privilegeIDs, setPrivilegesIDs] = useState([0])

    const isMobile = useMediaQuery({ maxWidth: 767 });

    const theme = useTheme();

    const loadPrivileges = async () => {
        const response = await fetch(APIBASE + '/api/v1/user/info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setPrivileges(data.current_privileges as PartialAdminPrivilege[])
        const temp1 = data.current_privileges as PartialAdminPrivilege[]
        const temp2 = temp1.map(priv => priv.ID)
        setPrivilegesIDs(temp2)
    }

    const handleEditArticle = (article: PartialArticle) => {
        setSelectedArticle(article)
        setEditModalOpen(true)
    };

    const handleCloseModal = () => {
        setEditModalOpen(false)
        setSelectedArticle(createEmptyArticle())
    };
    
    useEffect(() => {
        getArticles()
        getTags()
        loadPrivileges()
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
        const response = await fetch(APIBASE + '/api/v1/articletag/getall', {
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
        const response = await fetch(APIBASE + '/api/v1/articles', {
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
        console.log(searchVal); 
        handleSearch()
        
        // if (event.key === "Enter") {
        //     console.log(searchVal); 
        //     handleSearch()
        // }
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
        const response = await fetch(APIBASE + '/api/v1/articles', {
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

        const response = await fetch(APIBASE + `/api/v1/articles/search/tagandquery?${params.toString()}`, {
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

    if (privilegeIDs[0] === 0) {

        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    }

    if (privilegeIDs[0] !== 0) {

        return(
            <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden"}}>
                {!isMobile && (
                    <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                    </div>
                )}
                
                <div style={{ width: "100%", height: "95%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto", backgroundColor: theme.palette.secondary.main}}>
                    <div style={{width: "100%", height: "20%", display: "flex", flexDirection: "row", justifyContent: "evenly-spaced", alignItems: "center"}}>
                        <div style={{height: "100%", width: "7.5%", display: "flex", flexDirection: "row", alignItems: "space-evenly", gap: "10%"}}>
    
                        </div>
                        <div style={{height: "100%", width: "85%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10%"}}>
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
                        {privilegeIDs.includes(1) && (
                            <div style={{height: "100%", width: "7.5%", display: "flex", flexDirection: "column", alignItems: "felx-start", justifyContent: "center"}}>
                                <Button onClick={() => {handleEditArticle(createEmptyArticle())}}>
                                    <AddCircleOutlineIcon sx={{ height: "40px", width: "40px", color: "white" }} />
                                </Button>
                            </div>
                        )}
                        
                        
                    </div>
                    {articles.map((article) => (
                        <AdminArticleCard
                            key={article.ID}
                            article={article}
                            lineNumber={3}
                            onClick={handleEditArticle}
                            userPrivileges={privilegeIDs}
                        />
                    ))}
                    
                    {privilegeIDs.includes(3) && (
                        <EditArticleModal
                        open={editModalOpen}
                        article={selectedArticle}
                        onClose={handleCloseModal}
                        />
                    )}
                    
                    
                </div>
                {isMobile && (
                    <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                    </div>
                )}
            </div>
        );
    }
}

function createEmptyArticle(): PartialArticle {
    return {
        ID: -1,
        Title: "",
        Content: "",
        Article_Description: "",
        Image: "",
        ThumbsUp: 0,
        ThumbsDown: 0
    };
}

export default AdminArticles;