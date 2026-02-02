import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
let socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export const connectSocket = (uid) => {
  if (!uid) return socket;
  if (socket.connected) return socket;

  socket.auth = { uid };   // ✅ not token anymore
  socket.connect();
  console.log("🔌 Socket connected for user:", uid);
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export default socket;
