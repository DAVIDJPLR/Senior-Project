import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import { User } from "../../custom_objects/User";
import { AdminPrivilege } from "../../custom_objects/AdminPrivilege";
import AdminCard from "../../components/AdminCard";
import { Typography, Button, Modal } from "@mui/material";
import SearchBar from "../../components/SearchBar";
import { useState } from "react";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminUsers({ currentScreen, setCurrentScreen }: Props){

    const [searchVal, setsearchVal] = useState("");
    const [showUserModal, setShowUserModal] = useState(false);

    const privileges: AdminPrivilege[] = [
        {
            ID: 1,
            PrivilegeName: "Privilege 1"
        },
        {
            ID: 2,
            PrivilegeName: "Privilege 2"
        },
        {
            ID: 3,
            PrivilegeName: "Privilege 3"
        },
    ]

    const users: User[] = [
        {
            ID: 1,
            FirstName: "David",
            LastName: "Le Roux",
            Email: "dlaroux@azavar.com",
            Device: "device",
            Major: "Major",
            GradYear: 2025,
            AdminPrivileges: privileges
        },
        {
            ID: 2,
            FirstName: "David",
            LastName: "Le Roux",
            Email: "djpleroux@gmail.com",
            Device: "device",
            Major: "Major",
            GradYear: 2025,
            AdminPrivileges: privileges
        },
        {
            ID: 3,
            FirstName: "David",
            LastName: "Le Roux",
            Email: "lerouxdj21@gcc.edu",
            Device: "device",
            Major: "Major",
            GradYear: 2025,
            AdminPrivileges: privileges
        }
    ]

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            console.log(searchVal); 
        }
    };

    return(
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
            <div style={{width: "90%", height: "10%", 
                display: "flex", flexDirection: "column", 
                alignItems: "end", justifyContent: "center",}}
                onClick={() => setShowUserModal(true)}>
                <Button variant="outlined" sx={{height: "40px", width: "40px", borderWidth: "0px", padding: 0, borderRadius: "50%", display: "flex", justifyContent: "center", minWidth: 0, zIndex: 9999}}>
                    <AddCircleOutlineIcon sx={{height: "40px", width: "40px"}}></AddCircleOutlineIcon>
                </Button>
                
            </div>
            <SearchBar setSearchVal={setsearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={'small'}></SearchBar>
            <Typography style={{fontSize: "24px", fontWeight: "600"}}>Current Administrators</Typography>
            {users.map((user) => <AdminCard user={user} key={user.ID}></AdminCard>)}
        </div>
    )
}

interface UserModalProps{
    open: boolean;
    handleClose: () => void
}

function UserModal({ open, handleClose }: UserModalProps){
    return(
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: "100%", width: "100%"}}
        >
            <div>

            </div>
        </Modal>
    );
}

export default AdminUsers;