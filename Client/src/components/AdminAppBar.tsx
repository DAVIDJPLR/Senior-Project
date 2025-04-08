import { Typography, Grid2, Divider, useTheme, AppBar, Toolbar, Box, Button } from "@mui/material/";
import { Screen, AdminScreen } from "../custom_objects/Screens";
import { BorderBottom } from "@mui/icons-material";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

const navItems = [
    { label: "Analysis", screen: AdminScreen.Analysis },
    { label: "Articles", screen: AdminScreen.Articles },
    { label: "Home", screen: AdminScreen.Splash},
    { label: "Users", screen: AdminScreen.Users },
]

// Serves as a navigation bar located at the top of all admin screens
// to allow quick travel between each of them.
function AdminAppBar ({ currentScreen, setCurrentScreen }: Props){
    const theme = useTheme();
     
    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                boxShadow: "none",
                BorderBottom: `1px solid ${theme.palette.divider}`,
                minHeight: 40,
            }}
        >
            <Toolbar
                disableGutters
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1.5,
                    minHeight: 40,
                    paddingX: 1,
                }}
            >
                <Box sx={{position: "absolute", left: 24}}>
                    <Typography variant="h6" sx={{fontWeight: 700, color: "white"}}>
                        help.gcc.edu
                    </Typography>
                </Box>
                {navItems.map((item, index) => (
                    <Box key={item.screen} sx={{ display: "flex", alignItems: "center"}}>
                        <Button
                            variant={currentScreen === item.screen ? "outlined" : "text"}
                            onClick={() => setCurrentScreen(item.screen)}
                            sx={{
                                color: currentScreen === item.screen ? "black" : "white",
                                borderColor: "white",
                                fontWeight: currentScreen === item.screen ? "bold" : "normal",
                                textTransform: "none",
                                padding: "2x 8px",
                                minWidth: 64,
                                lineHeight: 1.25,
                                height: 30,
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                        {index < navItems.length-1 && (
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{
                                    mx: 1,
                                    borderColor: "rgba(255, 255, 255, 0.3)"
                                }}
                            />
                        )}
                    </Box>
                ))}
            </Toolbar>
        </AppBar>
    )
    // return (
    //     <div style={{ width: "100%", height: "100%", backgroundColor: theme.palette.secondary.main }}>
    //         <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px"}}>
    //             <div key={"App_Bar_Nav"} style={{width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px"}}>
                    
    //                 {(currentScreen === AdminScreen.Analysis) ? <Typography sx={{color: 'black'}}>Analysis</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Analysis</Typography>}
                    
    //                 <div>
    //                     <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
    //                 </div>
                    
    //                 {(currentScreen === AdminScreen.Articles) ? <Typography sx={{color: 'black'}}>Articles</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Articles);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Articles</Typography>}
                    
    //                 <div>
    //                     <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
    //                 </div>
                    
    //                 {(currentScreen === AdminScreen.Splash) ? <Typography sx={{color: 'black'}}>Home</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Splash);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Home</Typography>}  
                    
    //                 <div>
    //                     <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
    //                 </div>
                    
    //                 {(currentScreen === AdminScreen.Users) ? <Typography sx={{color: 'black'}}>Users</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Users);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Users</Typography>}  
                        
    //             </div>
    //         </div>
    //     </div>
    // );
}

export default AdminAppBar;