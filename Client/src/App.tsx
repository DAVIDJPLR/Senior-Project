import { Screen, StudentScreen, AdminScreen } from "./custom_objects/Screens";
import { useState, useEffect, StrictMode } from "react";

import { loginRequest } from './authConfig';

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
import { PartialAdminPrivilege } from "./custom_objects/models";

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
    const [privileges, setPrivileges] = useState<PartialAdminPrivilege[]>([]);
    const [currentScreen, setCurrentScreen] = useState<Screen>(StudentScreen.Home);

    const getInfo = async () => {
        const response = await fetch(`http://localhost:5000/api/v1/user/info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (response.status == 200){
            console.log(`current_user_role: ${data.current_user_role}`)
            if (data.current_user_role === "admin" || data.current_user_role === "superadmin"){
                setAdmin(true);
                setPrivileges(data.current_privileges as PartialAdminPrivilege[]);
            } else {
                setAdmin(false);
            }
        } else {
            setAuthenticated(false);
        }
    }

    useEffect(() => {
        if (admin === true){
            setCurrentScreen(AdminScreen.Splash);
        } else {
            setCurrentScreen(StudentScreen.Home);
        }
    }, [admin])

    useEffect(() => {
        if (authenticated){

            // fetch request to user/info
            // if data.role is admin then splash else home

            getInfo();
            
            console.log(`Here is the admin value: ${admin}`)
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
        <Routes>
            <Route
                path = "/"
                element = {
                  admin ? (
                    <AdminHome currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminHome>
                  ) : (
                    <StudentHome currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentHome>
                  )
                }
            />
            <Route
                path = "/article:articleID"
                // element = {

                // }
            />
            <Route
                path = "/article:articleID/edit"
            />
            <Route
                path = "/search/"
            />
            <Route
                path = "/user/viewedarticles"
                element = { <StudentRecent currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentRecent> }
            />
            <Route
                path = "/categories/articles"
                element = { <StudentBrowse currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentBrowse> }
            />
            <Route

            />
            <Route

            />
            <Route

            />
            <Route

            />
        </Routes>
        // switch (currentScreen) {
        //     case AdminScreen.Analysis:
        //         return(
        //             <AdminAnalysis currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminAnalysis>
        //         );
        //     case AdminScreen.Articles:
        //         return(
        //             <AdminArticles currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminArticles>
        //         );
        //     case AdminScreen.BackLog:
        //         return(
        //             <AdminBacklog currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminBacklog>
        //         );
        //     case AdminScreen.Splash:
        //         return(
        //             <AdminHome currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminHome>
        //         );
        //     case AdminScreen.Users:
        //         return(
        //             <AdminUsers currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminUsers>
        //         );
        //     case StudentScreen.Browse:
        //         return(
        //             <StudentBrowse currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentBrowse>
        //         );
        //     case StudentScreen.Home:
        //         return(
        //             <StudentHome currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentHome>
        //         );
        //     case StudentScreen.Recently_Viewed:
        //         return(
        //             <StudentRecent currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentRecent>
        //         );
        // }
    };

    return (
        <div style={{width: "100vw", height: "100vh"}}>
            <AuthenticatedTemplate>
                <HandleToken setAuthenticated={setAuthenticated}/>
                <StrictMode>
                    <Router>
                        {/* <MainContent/> */}
                        <Routes>
                            <Route
                                path = "/"
                                element = {
                                admin ? (
                                    <AdminHome currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></AdminHome>
                                ) : (
                                    <StudentHome currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentHome>
                                )
                                }
                            />
                            <Route
                                path = "/article:articleID"
                                // element = {

                                // }
                            />
                            <Route
                                path = "/article:articleID/edit"
                            />
                            <Route
                                path = "/search/"
                            />
                            <Route
                                path = "/user/viewedarticles"
                                element = { <StudentRecent currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentRecent> }
                            />
                            <Route
                                path = "/categories/articles"
                                element = { <StudentBrowse currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentBrowse> }
                            />
                            <Route

                            />
                            <Route

                            />
                            <Route

                            />
                            <Route

                            />
                        </Routes>
                    </Router>
                </StrictMode>
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <SignInRedirect/>
            </UnauthenticatedTemplate>
        </div>
    );
}

export default App

            // <Routes>
            //   {/* Home Route */}
            //   <Route
            //     path="/"
            //     element={
            //       isUnauthorized ? (
            //         <Navigate to="/unauthorized/" />
            //       ) : isAuthenticated ? (
            //         <HomePage isAuthenticated={isAuthenticated} refreshData={false} />
            //       ) : (
            //         <Navigate to="/auth/" />
            //       )
            //     }
            //   />
            //   {/* Student Details Route */}
            //   <Route
            //     path="/student/:studentId"
            //     element={
            //       isUnauthorized ? <Navigate to="/unauthorized/" /> : isAuthenticated ? <StudentDetails /> : <Navigate to="/auth/" />
            //     }
            //   />
            //   {/* Student Local Search Route */}
            //   <Route
            //     path="/local_search/:studentId"
            //     element={
            //       isUnauthorized ? <Navigate to="/unauthorized/" /> : isAuthenticated ? <LocalSearch /> : <Navigate to="/auth/" />
            //     }
            //   />
            //   {/* Requirements Route */}
            //   <Route
            //     path="/requirements/"
            //     element={
            //       isUnauthorized ? <Navigate to="/unauthorized/" /> : isAuthenticated ? <Requirements /> : <Navigate to="/auth/" />
            //     }
            //   />
            //   {/* Solutions Route */}
            //   <Route
            //     path="/solutions/"
            //     element={
            //       isUnauthorized ? <Navigate to="/unauthorized/" /> : isAuthenticated ? <Solutions /> : <Navigate to="/auth/" />
            //     }
            //   />
            //   {/* Admin Route */}
            //   <Route
            //     path="/admin/"
            //     element={
            //       isUnauthorized ? <Navigate to="/unauthorized/" /> : isAuthenticated ? <Admin currentUser={currentUser} /> : <Navigate to="/auth/" />
            //     }
            //   />
            //   {/* Authentication Route */}
            //   <Route
            //     path="/auth/"
            //     element={
            //       <Authentication
            //         setIsAuthenticated={setIsAuthenticated}
            //         setIsUnauthorized={setIsUnauthorized}
            //         setCurrentUser={setCurrentUser}
            //         setIsLoading={setIsLoadingCallback}
            //         setBackendData={setBackendData} 
            //       />
            //     }
            //   />
            //   {/* Unauthorized Route */}
            //   <Route path="/unauthorized/" element={<Unauthorized />} />
            // </Routes>