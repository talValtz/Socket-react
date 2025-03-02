import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { joinRoom, leaveRoom, subscribeToRoomUsers, socket } from "../components/socket"; 
import styles from "../styles/CodeBlockPage.module.css"; 

const CodeBlockPage = () => {
    const { blockId } = useParams();
    const navigate = useNavigate(); 

    const [codeBlock, setCodeBlock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCount, setUserCount] = useState(0);
    const [mentorId, setMentorId] = useState(null);
    const [codeContent, setCodeContent] = useState("");
    const [isCorrect, setIsCorrect] = useState(false); 

    useEffect(() => {
        if (!blockId) {
            setError("Invalid ID provided");
            setLoading(false);
            return;
        }

        fetch(`http://localhost:3000/api/codeblocks/${blockId}`)
            .then(response => response.json())
            .then(data => {
                setCodeBlock(data);
                setCodeContent(data.initialCode || "");
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });

        joinRoom(blockId);
        const unsubscribe = subscribeToRoomUsers(blockId, setUserCount, setMentorId);

        // Handles mentor leaving the room, redirecting all users to the lobby
        const handleMentorLeft = ({ blockId: leftBlockId }) => {
            if (leftBlockId === blockId) {
                alert("Mentor has left. Redirecting to the lobby.");
                navigate("/");
            }
        };

        socket.on("mentorLeft", handleMentorLeft);

        return () => {
            leaveRoom(blockId);
            socket.off("mentorLeft", handleMentorLeft);
            unsubscribe();
        };
    }, [blockId]);

    // Checks if the user's input matches the correct solution
    const checkSolution = (input) => {
        if (codeBlock?.solution && input.trim() === codeBlock.solution.trim()) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }
    };

    // Handles user input and checks solution validity
    const handleCodeChange = (e) => {
        const newCode = e.target.value;
        setCodeContent(newCode);
        checkSolution(newCode);
    };

    if (loading) return <h1 className={styles.loading}>Loading...</h1>;
    if (error) return <h1 className={styles.error}>Error: {error}</h1>;

    return (
        <div className={styles.codeBlockPage}>
            <h1 className={styles.title}>{codeBlock?.title || "No title available"}</h1>

            <div style={{ position: "relative", display: "inline-block" }}>
                {/* Displays a smiley image if the solution is correct */}
                {isCorrect && (
                    <img 
                        src="/smiley.png" 
                        alt="Correct Answer" 
                        className={styles.smileyImage}
                    />
                )}

                <textarea
                    className={styles.codeEditor}
                    value={codeContent}
                    onChange={handleCodeChange}
                    readOnly={mentorId === socket.id}
                    placeholder={mentorId === socket.id ? "Mentor mode: read-only" : "You can edit the code"}
                />
            </div>

            <div className={styles.info}>
                <p>Users in this code block: <strong>{userCount}</strong></p>
                <p>{mentorId === socket.id ? "You are the mentor!" : "You Are Student"}</p>
            </div>

            <button className={styles.backButton} onClick={() => navigate(-1)}>Back</button>
        </div>
    );
};

export default CodeBlockPage;