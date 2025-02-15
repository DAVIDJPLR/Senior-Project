import { AppBar, Typography, Grid2, Divider } from "@mui/material/";
import { Screen, AdminScreen } from "../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminAppBar ({ currentScreen, setCurrentScreen }: Props){
    return (
        <AppBar elevation={0} sx={{width: "100%", height: "10%", backgroundColor: 'white'}}>
            <Grid2 container direction={"row"} sx={{width: "100%", height: "100%"}}>
                {/* <Grid2 key={"Left_Space"} sx={{width: "10%"}}>

                </Grid2> */}
                <Grid2 key={"App_Bar_Nav"} sx={{width: '100%', height: "100%"}}>
                    <Grid2 container alignItems={"center"} justifyContent={"center"} direction={"row"} spacing={2} sx={{width: "100%", height: "100%"}}>
                        <Grid2 key={"Analysis"}>
                            {(currentScreen === AdminScreen.Analysis) ? <Typography sx={{color: 'black'}}>Analysis</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Analysis);}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Analysis</Typography>}
                        </Grid2>
                        <Grid2 key={"Divider_1"}>
                            <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                        </Grid2>
                        <Grid2 key={"Articles"}>
                            {(currentScreen === AdminScreen.Articles) ? <Typography sx={{color: 'black'}}>Articles</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Articles);}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Articles</Typography>}
                        </Grid2>
                        <Grid2 key={"Divider_2"}>
                            <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                        </Grid2>
                        <Grid2 key={"Splash"}>
                            {(currentScreen === AdminScreen.Splash) ? <Typography sx={{color: 'black'}}>Home</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Splash);}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Home</Typography>}  
                        </Grid2>
                        <Grid2 key={"Divider_4"}>
                            <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                        </Grid2>
                        {/* <Grid2 key={"Backlog"}>
                            {(currentScreen === AdminScreen.BackLog) ? <Typography sx={{color: 'black'}}>Backlog</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.BackLog);}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Backlog</Typography>}  
                        </Grid2>
                        <Grid2 key={"Divider_3"}>
                            <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                        </Grid2> */}
                        <Grid2 key={"Users"}>
                            {(currentScreen === AdminScreen.Users) ? <Typography sx={{color: 'black'}}>Users</Typography> : <Typography onClick={() => {setCurrentScreen(AdminScreen.Users);}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline'}}>Users</Typography>}  
                        </Grid2>
                    </Grid2>
                </Grid2>
                {/* <Grid2 key={"Right_Space"} sx={{width: "10%"}}>

                </Grid2> */}
            </Grid2>
        </AppBar>
    );
}

export default AdminAppBar;