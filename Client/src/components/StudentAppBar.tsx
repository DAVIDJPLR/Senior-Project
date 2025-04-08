import { Typography, Divider, useTheme, Box, Stack, Button } from "@mui/material/";
import { StudentScreen, Screen } from "../custom_objects/Screens";
import HomeIcon from "@mui/icons-material/Home"
import SearchIcon from "@mui/icons-material/Search"
import HistoryIcon from "@mui/icons-material/History"
import React from "react";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void
}

const navItems = [
    {label: "Browse", icon: <SearchIcon />, screen: StudentScreen.Browse},
    {label: "Home", icon: <HomeIcon />, screen: StudentScreen.Home},
    {label: "Recently Viewed", icon: <HistoryIcon />, screen: StudentScreen.Recently_Viewed},
]
function StudentAppBar ({ currentScreen, setCurrentScreen }: Props){
    
    return (
        <Box sx={{ width: "100%", backgroundColor: theme => theme.palette.secondary.main, py: 1}}>
            <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                alignItems="center"
            >
                <Box sx={{position: "absolute", left: 24}}>
                    <Typography variant="h6" sx={{fontWeight: 700, color: "white"}}>
                        help.gcc.edu
                    </Typography>
                </Box>
                {navItems.map((item, index) => (
                    <React.Fragment key={item.screen}>
                        <Button
                            onClick={() => setCurrentScreen(item.screen)}
                            startIcon={item.icon}
                            variant={currentScreen === item.screen ? "contained" : "text"}
                            sx={{
                                fontWeight: 600,
                                fontSize: "1rem",
                                color: currentScreen === item.screen ? "black" : "white",
                                backgroundColor: currentScreen === item.screen ? "white" : "transparent",
                                textTransform: "none",
                                px: 2,
                                py: 1.25,
                                borderRadius: 2,
                                "&:hover": {
                                    backgroundColor: currentScreen === item.screen ? "white" : "rgba(255, 255, 255, 0.1)",
                                }
                            }}
                        >
                            {item.label}
                        </Button>

                        {index < navItems.length-1 && (
                            <Divider orientation = "vertical" flexItem sx={{borderColor: 'black', height: 28}} />
                        )}
                    </React.Fragment>
                ))}
            </Stack>
        </Box>
    )
    // return (
    //     <div style={{ width: "100%", height: "100%", backgroundColor: theme.palette.secondary.main }}>
    //         <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px"}}>
    //             {(currentScreen === StudentScreen.Browse) ? <Typography sx={{color: 'black', fontSize: '120%', fontWeight: '600'}}>Browse</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Browse);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline', fontSize: '100%', fontWeight: '600'}}>Browse</Typography>}
    //             <div>
    //                 <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
    //             </div>
    //             {(currentScreen === StudentScreen.Home) ? <Typography sx={{color: 'black', fontSize: '120%', fontWeight: '600'}}>Home</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Home);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline', fontSize: '100%', fontWeight: '600'}}>Home</Typography>}
    //             <div>
    //                 <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
    //             </div>
    //             {(currentScreen === StudentScreen.Recently_Viewed) ? <Typography sx={{color: 'black', fontSize: '120%', fontWeight: '600'}}>Recently Viewed</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Recently_Viewed);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline', fontSize: '100%', fontWeight: '600'}}>Recently Viewed</Typography>}  
    //         </div>
    //     </div>
    // );
}

export default StudentAppBar