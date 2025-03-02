import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { joinRoom, subscribeToRoomUsers, socket } from "../components/socket"; 

const CodeBlockPage = () => {
    const { blockId } = useParams();
    console.log("Params:", blockId);

    const [codeBlock, setCodeBlock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCount, setUserCount] = useState(0);
    const [mentorId, setMentorId] = useState(null);

    useEffect(() => {
        if (!blockId) {
            setError("Invalid ID provided");
            setLoading(false);
            return;
        }

        console.log("🔄 Fetching code block...");
        fetch(`http://localhost:3000/api/codeblocks/${blockId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setCodeBlock(data);
                setLoading(false);
                console.log("✅ Code block loaded:", data);
            })
            .catch(error => {
                console.error("❌ Error fetching code block:", error);
                setError(error.message);
                setLoading(false);
            });

        // ✅ Join the correct room
        joinRoom(blockId);
        console.log(`📌 Joining room: ${blockId}`);

        // ✅ Subscribe to updates only for this room
        const unsubscribe = subscribeToRoomUsers(blockId, setUserCount, setMentorId);

        return () => {
            console.log("🔇 Cleaning up socket listeners...");
            unsubscribe();
        };
    }, [blockId]);

    if (loading) {
        return <h1>⏳ Loading...</h1>;
    }

    if (error) {
        return <h1>❌ Error: {error}</h1>;
    }

    return (
        <div>
            <h1>{codeBlock?.title || "No title available"}</h1>
            <textarea value={codeBlock?.initialCode || ""} readOnly />
            <p>👥 Users in this code block: {userCount}</p>
            <p>🏆 {mentorId === socket.id ? "You are the mentor!" : `Mentor: ${mentorId}`}</p>
        </div>
    );
};

export default CodeBlockPage;
