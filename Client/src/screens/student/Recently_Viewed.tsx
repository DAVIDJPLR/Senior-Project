import StudentAppBar from "../../components/StudentAppBar";
import { Screen } from "../../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentRecent({ currentScreen, setCurrentScreen }: Props){
    return(
        <div style={{width: "100vw", height: "100vh"}}>
            <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}></StudentAppBar>
        </div>
    )
}

export default StudentRecent;