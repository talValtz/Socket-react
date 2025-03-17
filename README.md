### Live Demo
The project is deployed and available online!

https://js-lecture-react-socket.netlify.app/

### Code collab
A real-time collaborative coding platform where multiple users can join code blocks, edit code together, and interact using Socket.io and MongoDB

### Features
Real-time collaboration using WebSockets (Socket.io)
User roles: Mentor & Participants
Live user tracking: See active users in a room
Code validation: Compare user code with pre-defined solutions
Lobby system: Users can join different code rooms
Persistence: MongoDB stores code blocks and participants
Clean UI: Styled with CSS modules and responsive design


### Project Structure


code-collab/
│── client/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main application pages (Lobby, CodeBlock)
│   │   ├── context/     # State management (UserContext, etc.)
│   │   ├── utils/       # Helper functions
│   │   ├── App.jsx      # Main App entry
│   │   ├── main.jsx     # React entry point
│   ├── package.json     # Frontend dependencies
│
│── server/          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Request handling logic
│   │   ├── sockets/      # Socket.io event handling
│   │   ├── config/       # Database & environment config
│   │   ├── index.js      # Server entry point
│   ├── package.json      # Backend dependencies

### Tech Stack
## Frontend
React (Vite)
React Router
CSS Modules
WebSockets (Socket.io Client)

## Backend
Node.js (Express)
MongoDB (Mongoose)
Socket.io (WebSockets)
CORS & dotenv 
