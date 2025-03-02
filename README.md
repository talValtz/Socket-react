code-collab/
│── client/          # React (Vite/CRA)
│   ├── src/
│   │   ├── components/  # רכיבים לשימוש חוזר
│   │   ├── pages/       # דפי האפליקציה (Lobby, CodeBlock)
│   │   ├── context/     # ניהול State (UserContext וכו')
│   │   ├── utils/       # פונקציות עזר
│   │   ├── App.jsx
│   │   ├── main.jsx
│   ├── package.json
│
│── server/          # Express Server
│   ├── src/
│   │   ├── models/       # סכמות של MongoDB
│   │   ├── routes/       # ניתוב בקשות API
│   │   ├── controllers/  # לוגיקת עיבוד הבקשות
│   │   ├── sockets/      # ניהול חיבורי Socket.io
│   │   ├── config/       # קונפיגורציה (DB וכו')
│   │   ├── index.js      # נקודת כניסה לסרבר
│   ├── package.json