
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lobby from "./pages/Lobby";
import CodeBlockPage from "./pages/CodeBlockPage.jsx";
import io from "socket.io-client";
import './styles/style.app.css';




const socket = io.connect("http://localhost:5174");


const App = () => {
    return (
        <Router>
            <div className="appContainer">
                <Routes>
                    <Route path="/" element={<Lobby />} />
                    <Route path="/codeblock/:blockId" element={<CodeBlockPage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;



