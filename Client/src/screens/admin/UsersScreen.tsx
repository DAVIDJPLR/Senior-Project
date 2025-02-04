import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import AdminCard from "../../components/AdminCard";
import { Typography, Button, Popover, Modal, Table, TableBody, TableRow, TableCell, TableContainer, DialogContent, DialogTitle, Dialog, DialogContentText, DialogActions } from "@mui/material";
import SearchBar from "../../components/SearchBar";
import { useState, useEffect } from "react";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UserCard from "../../components/UserCard";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { PartialAdminPrivilege, PartialUser } from "../../custom_objects/models";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminUsers({ currentScreen, setCurrentScreen }: Props){

    const [searchVal, setSearchVal] = useState("");
    const [openAdminModal, setOpenAdminModal] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<PartialUser | null>(null)

    const [refresh, setRefresh] = useState(false);

    const [admins, setAdmins] = useState<PartialUser[]>([])

    const loadAdmins = async () => {
        const response = await fetch('http://localhost:5000/api/v1/admins', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(`data: ${data}`)

        setAdmins(data.admins as PartialUser[])
    }

    useEffect(() => {
        if (refresh === true){
            loadAdmins()
        }
        setRefresh(false)
    }, [refresh])

    useEffect(() => {
        loadAdmins()
    }, []);

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
            <div style={{ width: "100%", height: "5%"}}></div>
            <SearchBar setSearchVal={setSearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={'small'} />
            <Typography style={{ fontSize: "24px", fontWeight: "600" }}>Current Administrators</Typography>
            {admins?.map((admin) => <AdminCard user={admin} key={admin.ID} 
                onClick={() => {
                    setSelectedAdmin(admin);
                    setOpenAdminModal(true);
                }} />)}
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
                <UserModal handleClose={handleClose} setRefresh={setRefresh} />
            </Popover>

            <AdminModal open={openAdminModal} handleClose={ () => {setOpenAdminModal(false)} } selectedAdmin={selectedAdmin} setRefresh={setRefresh} ></AdminModal>
        </div>
    );
}

interface AdminModalProps{
    open: boolean,
    handleClose: () => void,
    selectedAdmin: PartialUser | null,
    setRefresh: (refresh: boolean) => void
}

function AdminModal({ open, handleClose, selectedAdmin, setRefresh }: AdminModalProps) {

    const [adminPrivileges, setAdminPrivileges] = useState<PartialAdminPrivilege[]>(selectedAdmin?.AdminPrivileges || []);

    const [privileges, setPrivileges] = useState<PartialAdminPrivilege[]>([])
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const getPrivileges = async() => {
        const response = await fetch('http://localhost:5000/api/v1/admin/privileges', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)

        setPrivileges(data.privileges as PartialAdminPrivilege[])
    }

    useEffect(() => {
        getPrivileges()
    }, [])

    useEffect(() => {
        setAdminPrivileges(selectedAdmin?.AdminPrivileges || [])
    }, [open]);

    const saveAdmin = async () => {
        const privilegeIDs = adminPrivileges.map(priv => priv.ID);

        const response = await fetch('http://localhost:5000/api/v1/admin', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                "ID": selectedAdmin?.ID,
                "privilegeIDs": privilegeIDs
            })
        });

        const data = await response.json();
        console.log(data)

        setRefresh(true);
        handleClose()
    }

    const deleteAdmin = async () => {
        const params = new URLSearchParams({
            ID: selectedAdmin?.ID.toString() || ''
        });

        const response = await fetch(`http://localhost:5000/api/v1/admin?${params.toString()}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)
        handleClose()
        setRefresh(true)
    }

    const togglePrivilege = (privilege: PartialAdminPrivilege) => {
        if (adminPrivileges.some((p) => p.ID === privilege.ID)) {
            // Remove the privilege
            setAdminPrivileges((prev) => prev.filter((p) => p.ID !== privilege.ID));
        } else {
            // Add the privilege
            setAdminPrivileges((prev) => [...prev, privilege]);
        }
    };

    return(
        <Modal 
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: "100%", width: "100%", zIndex: 9999}}
        >
            <div
                style={{height: '70%', width: '60%', backgroundColor: 'white', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}
            >
                <Typography sx={{fontSize: "22px", fontWeight: "600"}}>{selectedAdmin?.FName} {selectedAdmin?.LName}</Typography>
                <Typography   sx={{fontSize: "12px", fontweight: "500", textDecoration: "underline", color: "secondary.main", cursor: "pointer"}}>{selectedAdmin?.Email}</Typography>
                <TableContainer sx={{ maxHeight: '70%', width: '90%', margin: "10px", border: "1px solid grey" }}>
                    <Table>
                        <TableBody>
                            {privileges.map((privilege) =>(
                                <TableRow key={privilege.ID}>
                                    <TableCell sx={{width: "70%"}}>{privilege.PrivilegeName}</TableCell>
                                    <TableCell sx={{width: "10%"}}>
                                        <CheckIcon
                                            onClick={() => togglePrivilege(privilege)}
                                            sx={{
                                                cursor: 'pointer',
                                                color: adminPrivileges.some(
                                                    (p) => p.ID === privilege.ID
                                                )
                                                    ? 'green'
                                                    : 'grey',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{width: "10%"}}>
                                        <CloseIcon
                                            onClick={() => togglePrivilege(privilege)}
                                            sx={{
                                                cursor: 'pointer',
                                                color: adminPrivileges.some(
                                                    (p) => p.ID === privilege.ID
                                                )
                                                    ? 'grey'
                                                    : 'red',
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: "20px"}}>
                    <Button variant="contained" onClick={() => {
                        // deleteAdmin()
                        setOpenConfirmDialog(true)
                    }}>Delete Admin</Button>
                    <Button variant="contained" sx={{backgroundColor: "green"}} onClick={() => {
                        saveAdmin()
                    }}>Save Changes</Button>
                </div>
                <ConfirmSubmissionDialog open={openConfirmDialog} onClose={() => {setOpenConfirmDialog(false)}} onConfirm={() => {
                    deleteAdmin()
                    setOpenConfirmDialog(false)
                }} userName={`${selectedAdmin?.FName} ${selectedAdmin?.LName}`}/>
            </div>
        </Modal>
    );
}

interface userModalProps{
    handleClose: () => void,
    setRefresh: (refresh: boolean) => void
}

function UserModal({ handleClose, setRefresh }: userModalProps) {
    const [users, setUsers] = useState<PartialUser[]>();
    const [searchVal, setSearchVal] = useState("");
    const [selectedUser, setSelectedUser] = useState<PartialUser>();

    const getAllUsers = async () => {
        const response = await fetch('http://localhost:5000/api/v1/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(`data: ${data}`)

        setUsers(data.users as PartialUser[])
    }

    const searchUsers = async () => {
        const params = new URLSearchParams({
            searchQuery: searchVal
        });

        const response = await fetch(`http://localhost:5000/api/v1/users/search?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        console.log(`data: ${data}`)

        setUsers(data.users as PartialUser[])
    }

    const addUser = async() => {
        console.log(selectedUser)
        const response = await fetch('http://localhost:5000/api/v1/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 'ID': selectedUser?.ID })
        });

        const data = await response.json();
        console.log(data)

        setRefresh(true);
    }

    useEffect(() => {
        if (selectedUser !== undefined) {
            addUser();
        }
    }, [selectedUser])

    useEffect(() => {
        getAllUsers();
    }, [])

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            searchUsers();
            console.log(searchVal);
        }
    };

    return (
        <div style={{width: "40vw", height: "50vh", paddingTop: '16px', backgroundColor: 'white', borderRadius: '8px', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <SearchBar setSearchVal={setSearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={'small'}/>
            <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto"}}>
                {users?.map((user) => <UserCard user={user} key={user.ID} onClick={() => {
                    setSelectedUser(user);
                    handleClose();
                }} />)}
            </div>
        </div>
    );
}

interface confirmSubmissionProps{
    open: boolean,
    onClose: () => void,
    onConfirm: () => void,
    userName: string
}

function ConfirmSubmissionDialog({ open, onClose, onConfirm, userName }: confirmSubmissionProps){
    return(
        <Dialog open={open} onClose={onClose} sx={{width: "100%", height: "100%", zIndex: 9999}}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete <strong>{userName}</strong> as an admin? 
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button size='large' onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button size='large' onClick={onConfirm} variant="contained" sx={{backgroundColor: "red"}} >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AdminUsers;