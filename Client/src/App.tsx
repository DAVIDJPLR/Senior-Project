import { Screen, StudentScreen, AdminScreen } from "./custom_objects/Screens";
import { useState, useEffect } from "react";
import StudentBrowse from "./screens/student/Browse";
import StudentHome from "./screens/student/Home";
import StudentRecent from "./screens/student/Recently_Viewd";
import AdminAnalysis from "./screens/admin/AnalysisScreen";
import AdminArticles from "./screens/admin/ArticlesScreen";
import AdminBacklog from "./screens/admin/BacklogScreen";
import AdminHome from "./screens/admin/SplashScreen";
import AdminUsers from "./screens/admin/UsersScreen";

import './global.css';

function App() {

    const [admin, setAdmin] = useState(false);
    const [currentScreen, setCurrentScreen] = useState<Screen>(StudentScreen.Home)

    useEffect(() => {
        if (admin){
            setCurrentScreen(AdminScreen.Splash);
        } else {
            setCurrentScreen(StudentScreen.Home);
        }
    }, [admin]);

    switch (currentScreen) {
        case AdminScreen.Analysis:
            return(
                <AdminAnalysis currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminAnalysis>
            );
        case AdminScreen.Articles:
            return(
                <AdminArticles currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminArticles>
            );
        case AdminScreen.BackLog:
            return(
                <AdminBacklog currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminBacklog>
            );
        case AdminScreen.Splash:
            return(
                <AdminHome currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminHome>
            );
        case AdminScreen.Users:
            return(
                <AdminUsers currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminUsers>
            );
        case StudentScreen.Browse:
            return(
                <StudentBrowse currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentBrowse>
            );
        case StudentScreen.Home:
            return(
                <StudentHome currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentHome>
            );
        case StudentScreen.Recently_Viewed:
            return(
                <StudentRecent currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentRecent>
            );
    }
}

export default App
