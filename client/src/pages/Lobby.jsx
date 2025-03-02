import { useEffect, useState } from "react";
import { getCodeBlocks } from "../utils/utils.api";
import { Link } from "react-router-dom";
import { subscribeToUserCount } from "../components/socket"; 
import styles from "../styles/Lobby.module.css";  

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]); // List of available code blocks
  const [userCount, setUserCount] = useState(0);  // Number of users in the lobby

  useEffect(() => {
    // Fetch list of available code blocks
    const fetchData = async () => {
      try {
        const data = await getCodeBlocks();
        setCodeBlocks(data);
      } catch (error) {
        console.error("Error fetching code blocks:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Subscribe to real-time user count updates in the lobby
    const unsubscribe = subscribeToUserCount(setUserCount);
    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  return (
    <div className={styles.lobbyContainer}>
      <h1 className={styles.title}>Choose a Code Block</h1>

      <ul className={styles.blockList}>
        {codeBlocks.map(block => (
          <li key={block._id} className={styles.blockItem}>
            <Link to={`/codeblock/${block._id}`} className={styles.blockLink}>
              <button className={styles.blockButton}>
                {block.title}
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
