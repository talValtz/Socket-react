
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lobby from "./pages/Lobby";
import CodeBlockPage from "./pages/CodeBlockPage.jsx";
import io from "socket.io-client";


const socket = io.connect("http://localhost:5174");


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/codeblock/:blockId" element={<CodeBlockPage/>} />
            </Routes>
        </Router>
    );
};

export default App;



