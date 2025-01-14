import AdminAppBar from "../../components/AdminAppBar";
import { Screen } from "../../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function AdminHome({ currentScreen, setCurrentScreen }: Props){
    return(
        <div style={{width: "100vw", height: "100vh"}}>
            <AdminAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></AdminAppBar>
        </div>
    )
}

export default AdminHome;