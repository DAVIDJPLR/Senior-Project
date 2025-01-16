import { Grid2, Typography } from "@mui/material";
import { User } from "../custom_objects/User";

interface Props{
    user: User;
    onClick: () => void;
}

// TODO: Implement the UserCard component for modal to add admin users
function UserCard( { user, onClick }: Props){
    return(
        <div style={{width: "90%", height: "46px", display: "flex", flexDirection: "column", alignItems: "center", border: "2px solid grey", borderRadius: "5px", margin: "10px"}}>
            <Grid2 container direction="row" justifyContent="center" alignItems="center" sx={{width: "100%"}}>
                <Grid2 key="Info" sx={{width: "60"}}>
                    <Typography style={{ fontSize: "16px", fontWeight: "600", textAlign: "left", width: "95%", overflow: "hidden"}}>{user.FirstName} {user.LastName}</Typography>
                </Grid2>
                <Grid2 key="Email" sx={{width: "40%"}}>

                </Grid2>
            </Grid2>
        </div>
    );
}

export default UserCard;