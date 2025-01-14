import StudentAppBar from "../../components/StudentAppBar";
import UserArticleSearch from "../../components/UserArticleSearch";
import { Screen } from "../../custom_objects/Screens";

interface Props{
    currentScreen: Screen
    setCurrentScreen: (screen: Screen) => void,
}

function StudentHome({ currentScreen, setCurrentScreen }: Props){
    return(
        <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <StudentAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} ></StudentAppBar>
            <div style={{height: "20%", width: "100%"}}></div>
            {/* <div style={{ flexGrow: 1 }}>
                <UserArticleSearch />
            </div> */}
        </div>
    )
}

export default StudentHome;