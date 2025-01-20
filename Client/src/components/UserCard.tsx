import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Typography } from "@mui/material";
import { User } from "../custom_objects/User";
import { Add } from '@mui/icons-material';

interface Props{
    user: User;
    onClick: () => void;
}

function UserCard( { user, onClick }: Props){
    return(
        <div style={{width: "90%", height: "46px", display: "flex", flexDirection: "column", alignItems: "center", border: "2px solid grey", borderRadius: "5px", margin: "10px"}}>
            <div style={{width: "80%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                <Typography style={{ fontSize: "16px", fontWeight: "600", textAlign: "center", overflow: "hidden"}}>{user.FirstName} {user.LastName}</Typography>
                <Typography style={{ fontSize: "14px", fontWeight: "400  ", textAlign: "center", overflow: "hidden"}}>{user.Email}</Typography>
            </div>
            <div style={{width: "20%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                <AddCircleOutlineIcon onClick={onClick} sx={{ fontSize: "16px"}}></AddCircleOutlineIcon>
            </div>
        </div>
    );
}

export default UserCard;