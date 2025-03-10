import axios from "axios";
VITE_API_URL="https://socket-react-1.onrender.com"

//const API_URL = "http://localhost:3000"; // Update according to the server address
const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Fetches all code blocks from the server.
 * @returns {Array} An array of code blocks or an empty array in case of an error.
 */
export const getCodeBlocks = async () => {
  try {
    const response = await api.get("api/codeblocks");
    return response.data;
  } catch (error) {
    return [];
  }
};
