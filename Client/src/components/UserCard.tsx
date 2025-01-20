import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Typography, Button } from "@mui/material";
import { User } from "../custom_objects/User";

interface Props{
    user: User;
    onClick: () => void;
}

function UserCard( { user, onClick }: Props){
    return(
        <div style={{width: "90%", height: "60px", display: "flex", flexDirection: "row", alignItems: "center", border: "2px solid grey", borderRadius: "5px", margin: "10px"}}>
            <div style={{width: "80%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                <Typography sx={{ fontSize: "16px", fontWeight: "600", textAlign: "center", overflow: "hidden"}}>{user.FirstName} {user.LastName}</Typography>
                <Typography component="a" href={`mailto:${user.Email}`} sx={{ fontSize: "14px", fontWeight: "400  ", textAlign: "center", overflow: "hidden", color: "text.secondary", textDecoration: "underline", cursor: "pointer"}}>{user.Email}</Typography>
            </div>
            <div style={{width: "20%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                <Button
                    variant="outlined"
                    sx={{ height: "32px", width: "32px", borderWidth: "0px", padding: 0, borderRadius: "50%", display: "flex", justifyContent: "center", minWidth: 0 }}
                    onClick={onClick}
                >
                    <AddCircleOutlineIcon sx={{ height: "32px", width: "32px" }} />
                </Button>
            </div>
        </div>
    );
}

export default UserCard;