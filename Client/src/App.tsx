import { Screen, StudentScreen, AdminScreen } from "./custom_objects/Screens";
import { useState, useEffect } from "react";

// import { PageLayout } from './components/PageLayout';
import { loginRequest } from './authConfig';
import { callMsGraph } from './graph';
import { ProfileData } from './components/ProfileData';

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import Button from 'react-bootstrap/Button';

import StudentBrowse from "./screens/student/Browse";
import StudentHome from "./screens/student/Home";
import StudentRecent from "./screens/student/Recently_Viewed";
import AdminAnalysis from "./screens/admin/AnalysisScreen";
import AdminArticles from "./screens/admin/ArticlesScreen";
import AdminBacklog from "./screens/admin/BacklogScreen";
import AdminHome from "./screens/admin/SplashScreen";
import AdminUsers from "./screens/admin/UsersScreen";
import { SignInRedirect } from "./components/SignInRedirect";
import './global.css';

interface handleTokenProps{
    setAuthenticated: (auth: boolean) => void
}

function HandleToken({setAuthenticated}: handleTokenProps){
    
    const { instance, accounts } = useMsal();

    const backendLogin = async (token: string) => {
        const response = await fetch('http://localhost:5000/api/v1/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 'token': token })
        });

        const data = await response.json();
        console.log(data)

        if (response.status == 200){
            setAuthenticated(true);
        }
    }

    useEffect(() => {
        instance
        .acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
        })  
        .then((response) => {
            backendLogin(response.accessToken);
        });
    }, [])

    return(
        <></>
    );
}

function App() {

    const [authenticated, setAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [currentScreen, setCurrentScreen] = useState<Screen>(StudentScreen.Home)

    useEffect(() => {
        if (authenticated){

            // fetch request to user/info
            // if data.role is admin then splash else home
            if (admin){
                setCurrentScreen(AdminScreen.Splash);
            } else {
                setCurrentScreen(StudentScreen.Home);
            }
        } 
    }, [authenticated])

    /**
    * If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
    */
    const MainContent = () => {
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
            // <div className="App">
            //     <AuthenticatedTemplate>
            //         <ProfileContent />
            //     </AuthenticatedTemplate>

            //     <UnauthenticatedTemplate>
            //         <h5>
            //             <center>
            //                 Please sign-in to see your profile information.
            //             </center>
            //         </h5>
            //     </UnauthenticatedTemplate>
            // </div>
    };

    return (
        <div style={{width: "100vw", height: "100vh"}}>
            <AuthenticatedTemplate>
                <HandleToken setAuthenticated={setAuthenticated}/>
                <MainContent/>
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <SignInRedirect/>
            </UnauthenticatedTemplate>
        </div>
    );
}

export default App
