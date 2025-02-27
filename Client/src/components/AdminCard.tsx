import { PartialUser } from "../custom_objects/models";
import { Typography, Grid2 } from "@mui/material";

interface Props{
    user: PartialUser,
    onClick: () => void,
    width: string,
}

function AdminCard({ user, onClick, width }: Props){

    const privilegeString: string = `| ${user.AdminPrivileges.map((privilege) => privilege.PrivilegeName).join(" | ")} |`;

    return(
        <div className="HaveShadow" style={{width: width, height: "46px", display: "flex", flexDirection: "column", alignItems: "center", border: "2px solid grey", borderRadius: "5px", margin: "10px", backgroundColor: "white"}}>
            <Grid2 container direction="row" justifyContent="center" alignItems="center" sx={{width: "98%"}}>
                <Grid2 key="LeftSpace" sx={{width: "33%"}}>
                    <Typography style={{ fontSize: "16px", fontWeight: "600", textAlign: "left", width: "95%", overflow: "hidden"}}>{user.FName} {user.LName}</Typography>
                </Grid2>
                <Grid2 key="Email" sx={{width: "34%"}}>
                    <Typography style={{ fontSize: "12px", textAlign: "center", width: "95%", overflow: "hidden"}}>{user.Email}</Typography>
                </Grid2>
                <Grid2 sx={{width: "33%"}}>
                    <Typography 
                        onClick={onClick}
                        sx={{ fontSize: "12px", textAlign: "right", width: "95%", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", color: 'text.secondary', cursor: 'pointer', textDecoration: 'underline'}}
                    >Manage User</Typography>
                </Grid2>
            </Grid2>
            <Typography style={{ fontSize: "12px", textAlign: "center", width: "95%", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical",}}>{privilegeString}</Typography>
        </div>
    );
}

export default AdminCard;