import StudentAppBar from "../../components/StudentAppBar";
import SearchBar from "../../components/SearchBar";
import { Screen } from "../../custom_objects/Screens";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";
import ArticleModal from "../../components/ArticleModal";
import { Typography, Modal, Button, TextField } from "@mui/material";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentRecent({ currentScreen, setCurrentScreen }: Props){
    return(
        <div style={{width: "100vw", height: "100vh"}}>
            <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentAppBar>
            <div><h1>Recently Viewed</h1></div>
        </div>
    )
}

export default StudentRecent;