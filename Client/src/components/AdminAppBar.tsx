import { Typography, Grid2, Divider, useTheme } from "@mui/material/";
import { Screen, AdminScreen } from "../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminAppBar ({ currentScreen, setCurrentScreen }: Props){
    const theme = useTheme();
     
    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: theme.palette.secondary.main }}>
            <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px"}}>
                <div key={"App_Bar_Nav"} style={{width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px"}}>
                    
                    {(currentScreen === AdminScreen.Analysis) ? <Typography sx={{color: 'black'}}>Analysis</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Analysis</Typography>}
                    
                    <div key={"Divider_1"}>
                        <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                    </div>
                    
                    {(currentScreen === AdminScreen.Articles) ? <Typography sx={{color: 'black'}}>Articles</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Articles);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Articles</Typography>}
                    
                    <div key={"Divider_2"}>
                        <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                    </div>
                    
                    {(currentScreen === AdminScreen.Splash) ? <Typography sx={{color: 'black'}}>Home</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Splash);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Home</Typography>}  
                    
                    <div key={"Divider_4"}>
                        <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                    </div>
                    
                    {(currentScreen === AdminScreen.Users) ? <Typography sx={{color: 'black'}}>Users</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Users);}} sx={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Users</Typography>}  
                        
                </div>
            </div>
        </div>
    );
}

export default AdminAppBar;