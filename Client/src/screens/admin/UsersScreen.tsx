import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import { User } from "../../custom_objects/User";
import { AdminPrivilege } from "../../custom_objects/AdminPrivilege";
import AdminCard from "../../components/AdminCard";
import { Typography, Button, Popover, Modal } from "@mui/material";
import SearchBar from "../../components/SearchBar";
import { useState } from "react";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UserCard from "../../components/UserCard";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminUsers({ currentScreen, setCurrentScreen }: Props){

    const [searchVal, setSearchVal] = useState("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    ];

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
    ];

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            console.log(searchVal);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            <div style={{ width: "90%", height: "10%", display: "flex", flexDirection: "column", alignItems: "end", justifyContent: "center" }}>
                <Button
                    variant="outlined"
                    sx={{ height: "40px", width: "40px", borderWidth: "0px", padding: 0, borderRadius: "50%", display: "flex", justifyContent: "center", minWidth: 0, zIndex: 9000 }}
                    onClick={handleClick}
                >
                    <AddCircleOutlineIcon sx={{ height: "40px", width: "40px" }} />
                </Button>
            </div>
            <SearchBar setSearchVal={setSearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={'small'} />
            <Typography style={{ fontSize: "24px", fontWeight: "600" }}>Current Administrators</Typography>
            {users.map((user) => <AdminCard user={user} key={user.ID} />)}
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                sx={{zIndex: 9999}}
            >
                <UserModal />
            </Popover>
        </div>
    );
}

interface AdminModalProps{
    open: boolean,
    handleClose: () => void
}

function AdminModal({ open, handleClose }: AdminModalProps) {
    return(
        <Modal 
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: "100%", width: "100%"}}
        >
            <div
                style={{height: '70%', width: '80%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}
            >

            </div>
        </Modal>
    );
}

function UserModal() {
    const [users, setUsers] = useState(testUsers());
    const [searchVal, setSearchVal] = useState("");

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            console.log(searchVal);
        }
    };

    return (
        <div style={{width: "40vw", height: "50vh", paddingTop: '16px', backgroundColor: 'white', borderRadius: '8px', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <SearchBar setSearchVal={setSearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={'small'} />
            {users.slice(0, 3).map((user) => <UserCard user={user} key={user.ID} onClick={() => {}} />)}
        </div>
    );
}

function testUsers(): User[]{
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
    ];

    const users: User[] = [];
    for (let i = 1; i <= 20; i++) {
        users.push({
            ID: i,
            FirstName: `FirstName${i}`,
            LastName: `LastName${i}`,
            Email: `user${i}@example.com`,
            Device: `Device${i}`,
            Major: `Major${i}`,
            GradYear: 2025,
            AdminPrivileges: privileges
        });
    }
    return users;
}

export default AdminUsers;