import { Typography, Divider } from "@mui/material/";
import { StudentScreen, Screen } from "../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void
}

function StudentAppBar ({ currentScreen, setCurrentScreen }: Props){
    return (
        <div style={{ width: "100%", height: "50px", backgroundColor: "white", marginBottom: "10px" }}>
            <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px"}}>
                {(currentScreen === StudentScreen.Browse) ? <Typography sx={{color: 'black', fontSize: '20px', fontWeight: '600'}}>Browse</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Browse);}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px', fontWeight: '600'}}>Browse</Typography>}
                <div>
                    <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                </div>
                {(currentScreen === StudentScreen.Home) ? <Typography sx={{color: 'black', fontSize: '20px', fontWeight: '600'}}>Home</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Home);}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px', fontWeight: '600'}}>Home</Typography>}
                <div>
                    <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'black', height: "16px"}}></Divider>
                </div>
                {(currentScreen === StudentScreen.Recently_Viewed) ? <Typography sx={{color: 'black', fontSize: '20px', fontWeight: '600'}}>Recently Viewed</Typography> : <Typography onClick={() => {setCurrentScreen(StudentScreen.Recently_Viewed);}} sx={{color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px', fontWeight: '600'}}>Recently Viewed</Typography>}  
            </div>
        </div>
    );
}

export default StudentAppBar