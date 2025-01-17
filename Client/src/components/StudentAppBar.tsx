import { AppBar, Typography, Grid2, Divider } from "@mui/material/";
import { StudentScreen, Screen } from "../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentAppBar ({ currentScreen, setCurrentScreen }: Props){
    return (
        <AppBar elevation={1} sx={{width: "100%", height: "8%", backgroundColor: 'white'}}>
            <Grid2 container direction={"row"} sx={{width: "100%", height: "100%"}}>
                {/* <Grid2 key={"Left_Space"} sx={{width: "10%"}}>

                </Grid2> */}
                <Grid2 key={"App_Bar_Nav"} sx={{width: '100%', height: "100%"}}>
                    <Grid2 container alignItems={"center"} justifyContent={"center"} direction={"row"} spacing={3} sx={{width: "100%", height: "100%"}}>
                        <Grid2 key={"Browse"}>
                            {(currentScreen === StudentScreen.Browse) ? <Typography sx={{color: 'black', fontSize: '20px', fontWeight: '600'}}>Browse</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Browse);}} sx={{color: '#2872c2', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px', fontWeight: '600'}}>Browse</Typography>}
                        </Grid2>
                        <Grid2 key={"Divider_1"}>
                            <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                        </Grid2>
                        <Grid2 key={"Home"}>
                        {(currentScreen === StudentScreen.Home) ? <Typography sx={{color: 'black', fontSize: '20px', fontWeight: '600'}}>Home</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Home);}} sx={{color: '#2872c2', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px', fontWeight: '600'}}>Home</Typography>}
                        </Grid2>
                        <Grid2 key={"Divider_2"}>
                            <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                        </Grid2>
                        <Grid2 key={"Recently_Viewed"}>
                        {(currentScreen === StudentScreen.Recently_Viewed) ? <Typography sx={{color: 'black', fontSize: '20px', fontWeight: '600'}}>Recently Viewed</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Recently_Viewed);}} sx={{color: '#2872c2', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px', fontWeight: '600'}}>Recently Viewed</Typography>}  
                        </Grid2>
                    </Grid2>
                </Grid2>
                {/* <Grid2 key={"Right_Space"} sx={{width: "10%"}}>

                </Grid2> */}
            </Grid2>
        </AppBar>
    );
}

export default StudentAppBar