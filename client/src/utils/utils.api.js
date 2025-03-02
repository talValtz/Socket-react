import axios from "axios";

const API_URL = "http://localhost:3000"; // יש לעדכן לפי השרת שלך

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// דוגמה לבקשה לקבלת כל בלוקי הקוד
export const getCodeBlocks = async () => {
  try {
    const response = await api.get("api/codeblocks");
    return response.data;
  } catch (error) {
    console.error("Error fetching code blocks:", error);
    return [];
  }
};
