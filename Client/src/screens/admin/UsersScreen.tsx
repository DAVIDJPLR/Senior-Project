import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import { User } from "../../custom_objects/User";
import { AdminPrivilege } from "../../custom_objects/AdminPrivilege";
import AdminCard from "../../components/AdminCard";
import { Typography } from "@mui/material";
import SearchBar from "../../components/SearchBar";
import { useState } from "react";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminUsers({ currentScreen, setCurrentScreen }: Props){

    const [searchVal, setsearchVal] = useState("");

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
            Email: "dlaroux@azavar.com",
            Device: "device",
            Major: "Major",
            GradYear: 2025,
            AdminPrivileges: privileges
        },
        {
            ID: 2,
            Email: "djpleroux@gmail.com",
            Device: "device",
            Major: "Major",
            GradYear: 2025,
            AdminPrivileges: privileges
        },
        {
            ID: 3,
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
            <div style={{height: "10%"}}></div>
            <SearchBar searchval={searchVal} setSearchVal={setsearchVal} handleKeyUp={handleKeyUp}></SearchBar>
            <Typography style={{fontSize: "24px", fontWeight: "600"}}>Current Administrators</Typography>
            {users.map((user) => <AdminCard user={user}></AdminCard>)}
        </div>
    )
}

export default AdminUsers;