import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";
import AdminCard from "../../components/AdminCard";
import { Typography, Button, Popover, Modal, Table, TableBody, TableRow, TableCell, TableContainer, DialogContent, DialogTitle, Dialog, DialogContentText, DialogActions, useTheme } from "@mui/material";
import SearchBar from "../../components/SearchBar";
import { useState, useEffect } from "react";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UserCard from "../../components/UserCard";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { PartialAdminPrivilege, PartialUser } from "../../custom_objects/models";
import { useMediaQuery } from "react-responsive"; 
import { APIBASE } from "../../ApiBase";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function UsersScreen({ currentScreen, setCurrentScreen }: Props){

    const [searchVal, setSearchVal] = useState("");
    const [openAdminModal, setOpenAdminModal] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<PartialUser | null>(null)

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const theme = useTheme();

    const [refresh, setRefresh] = useState(false);

    const [admins, setAdmins] = useState<PartialUser[]>([])

    const [currentAdmin, setCurrentAdmin] = useState(-1);
    const [privileges, setPrivileges] = useState<PartialAdminPrivilege[]>([]);
    const [privilegeIDs, setPrivilegesIDs] = useState([0])

    const searchAdmins = async() =>{
        const params = new URLSearchParams({
            searchQuery: searchVal
        });

        const response = await fetch(APIBASE + `/api/v1/admins/search?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        setAdmins(data.admins as PartialUser[])
    }

    const loadAdmins = async () => {
        const response = await fetch(APIBASE + '/api/v1/admins', {
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

    const loadPrivileges = async () => {
        const response = await fetch(APIBASE + '/api/v1/user/info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();

        console.log(data)

        setCurrentAdmin(data.current_user_id as number)

        setPrivileges(data.current_privileges as PartialAdminPrivilege[])
        const temp1 = data.current_privileges as PartialAdminPrivilege[]
        const temp2 = temp1.map(priv => priv.ID)
        setPrivilegesIDs(temp2)
    }

    useEffect(() => {
        if (refresh === true){
            loadAdmins()
            loadPrivileges()
        }
        setRefresh(false)
    }, [refresh])

    useEffect(() => {
        loadAdmins()
        loadPrivileges()
    }, []);

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (searchVal === "") {
                loadAdmins()
            } else {
                searchAdmins()
            }
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

    if (privilegeIDs[0] === 0) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    }

    if (privilegeIDs[0] !== 0) {
        return (
            
            <div style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: "hidden"
            }}>

                {!isMobile && (
                    <div style={{width: "100%"}}>
                        <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                    </div>
                )}
                

                <div style={{ width: "100%", height: "95%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto", backgroundColor: theme.palette.secondary.main}}>
                    <div style={{height: "3%"}}></div>
                    <div style={{ width: "100%", minHeight: "90px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>
                        <SearchBar setSearchVal={setSearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={'small'} />
                        {privilegeIDs.includes(5) && (
                            <Button
                                aria-label="Add Admin User"
                                variant="outlined"
                                sx={{ height: "40px", width: "40px", borderWidth: "0px", padding: 0, borderRadius: "50%", display: "flex", justifyContent: "center", minWidth: 0, zIndex: 9000 }}
                                onClick={handleClick}
                            >
                                <AddCircleOutlineIcon  sx={{ height: "40px", width: "40px", color: "white" }} />
                            </Button>
                        )}
                    </div>
                    <Typography style={{ fontSize: "24px", fontWeight: "600", marginTop: '8px' }}>Current Administrators</Typography>
                    {admins?.map((admin) => <AdminCard user={admin} key={admin.ID} width={isMobile ? "90%" : "60%"} userPrivileges={privilegeIDs}
                        onClick={() => {
                            if (privilegeIDs.includes(5)) {
                                setSelectedAdmin(admin);
                                setOpenAdminModal(true);
                            }
                            else {
                                
                            }
                            
                        }} />)}
                </div>

                
                {isMobile && (
                    <div style={{height: "5%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
                    </div>
                )}
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

                <AdminModal open={openAdminModal} handleClose={ () => {setOpenAdminModal(false)} } selectedAdmin={selectedAdmin} setRefresh={setRefresh} currentAdmin={currentAdmin} ></AdminModal>
            </div>
        );
    }
}

interface AdminModalProps{
    open: boolean,
    handleClose: () => void,
    selectedAdmin: PartialUser | null,
    setRefresh: (refresh: boolean) => void,
    currentAdmin: number
}

function AdminModal({ open, handleClose, selectedAdmin, setRefresh, currentAdmin }: AdminModalProps) {

    const [adminPrivileges, setAdminPrivileges] = useState<PartialAdminPrivilege[]>(selectedAdmin?.AdminPrivileges || []);

    const [privileges, setPrivileges] = useState<PartialAdminPrivilege[]>([])
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const getPrivileges = async() => {
        const response = await fetch(APIBASE + '/api/v1/admin/privileges', {
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

        const response = await fetch(APIBASE + '/api/v1/admin', {
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

        const response = await fetch(APIBASE + `/api/v1/admin?${params.toString()}`, {
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
                <Typography component="a" href={`mailto:${selectedAdmin?.Email}`} sx={{fontSize: "12px", fontweight: "500", textDecoration: "underline", color: "secondary.main", cursor: "pointer"}}>{selectedAdmin?.Email.toUpperCase()}</Typography>
                <TableContainer sx={{ maxHeight: '70%', width: '90%', margin: "10px", border: "1px solid grey" }}>
                    <Table>
                        <TableBody>
                            {privileges
                            .filter((privilege) => (currentAdmin===selectedAdmin?.ID && 5!==privilege.ID) || (currentAdmin!==selectedAdmin?.ID))
                            .map((privilege) =>(
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
                    {!(currentAdmin === selectedAdmin?.ID) && (
                        <Button variant="contained" onClick={() => {
                            // deleteAdmin()
                            setOpenConfirmDialog(true)
                        }}>Delete Admin</Button>
                    )}
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

    const isMobile = useMediaQuery({ maxWidth: 767 });

    const getAllUsers = async () => {
        const response = await fetch(APIBASE + '/api/v1/users', {
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

        const response = await fetch(APIBASE + `/api/v1/users/search?${params.toString()}`, {
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
        const response = await fetch(APIBASE + '/api/v1/admin', {
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

    if (isMobile){
        return (
            <div style={{width: "90vw", maxHeight: "90vh", paddingTop: '16px', backgroundColor: 'white', borderRadius: '8px', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <SearchBar setSearchVal={setSearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={'small'}/>
                <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto"}}>
                    {users?.map((user) => <UserCard user={user} key={user.ID} onClick={() => {
                        setSelectedUser(user);
                        handleClose();
                    }} />)}
                </div>
            </div>
        );
    } else {
        return (
            <div style={{width: "40vw", maxHeight: "90vh", paddingTop: '16px', gap: '12px', backgroundColor: 'white', borderRadius: '8px', display: "flex", flexDirection: "column", alignItems: "center"}}>
                <SearchBar setSearchVal={setSearchVal} searchVal={searchVal} handleKeyUp={handleKeyUp} size={'small'}/>
                <div style={{width: "100%", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto"}}>
                    {users?.map((user) => <UserCard user={user} key={user.ID} onClick={() => {
                        setSelectedUser(user);
                        handleClose();
                    }} />)}
                </div>
            </div>
        );
    }
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

export default UsersScreen;