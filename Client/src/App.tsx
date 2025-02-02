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
import { SignInButton } from "./components/SignInButton";
import './global.css';

/**
* Renders information about the signed-in user or a button to retrieve data about the user
*/

const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);

    function RequestProfileData() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance
            .acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            })
            .then((response) => {
                console.log(`response: ${response}`)
                callMsGraph(response.accessToken).then((response) => setGraphData(response));
            });
    }

    return (
        <>
            <h5 className="card-title">Welcome {accounts[0].name}</h5>
            <br/>
            {graphData ? (
                <ProfileData graphData={graphData} />
            ) : (
                <Button variant="secondary" onClick={RequestProfileData}>
                    Request Profile Information
                </Button>
            )}
        </>
    );
};

function App() {

    const [authenticated, setAuthenticated] = useState(true);
    const [admin, setAdmin] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(StudentScreen.Home)

    useEffect(() => {
        if (authenticated){
            if (admin){
                setCurrentScreen(AdminScreen.Splash);
            } else {
                setCurrentScreen(StudentScreen.Home);
            }
        } else {

        }
    }, [authenticated, admin])

    useEffect(() => {
        if (admin){
            setCurrentScreen(AdminScreen.Splash);
        } else {
            setCurrentScreen(StudentScreen.Home);
        }
    }, [admin]);

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
        <>
            <AuthenticatedTemplate>
                <MainContent />
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <SignInButton></SignInButton>
            </UnauthenticatedTemplate>
        </>
    );
}

export default App
