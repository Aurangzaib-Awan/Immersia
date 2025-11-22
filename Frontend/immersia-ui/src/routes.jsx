import {Route,Routes} from "react-router-dom";
import Home from "./pages/Home.jsx"
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Learn from "./pages/Learn.jsx";
import Projects from "./pages/Projects.jsx";
import Talent from "./pages/Talent.jsx";
import Skills from "./pages/Skills.jsx";
import Mindmap from "./pages/MindMap.jsx";
import Divide from "./pages/Divide.jsx";

function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/signup" element={<Signup />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/learn" element={<Learn />}/>
            <Route path="/project" element={<Projects />}/>
            <Route path="/talent" element={<Talent />}/>
            <Route path="/skill" element={<Skills />}/>
            <Route path="/mindmap" element={<Mindmap />}/>
            <Route path="/divide" element={<Divide />}/>
        </Routes>

    )
}
export default AppRoutes;