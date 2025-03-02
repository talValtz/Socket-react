import { useEffect, useState } from "react";
import { getCodeBlocks } from "../utils/utils.api";
import { Link } from "react-router-dom";
//import io from "socket.io-client";
import { subscribeToUserCount } from "../components/socket"; // Import socket logic


//const socket = io.connect("http://localhost:3000", { transports: ["websocket"] });

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [roomCounts, setRoomCounts] = useState({});
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCodeBlocks();
      setCodeBlocks(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToUserCount(setUserCount);
    return unsubscribe; // Clean up on component unmount
  }, []);

  return (
    <div>
      <h1>Choose code block</h1>
      <h2>👥 Users in lobby: {userCount}</h2>
      
      <ul>
        {codeBlocks.map(block => (
          <li key={block._id}>
            <Link to={`/codeblock/${block._id}`}>
              <button>
                {block.title} ({roomCounts[block._id] || 0} online)
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
