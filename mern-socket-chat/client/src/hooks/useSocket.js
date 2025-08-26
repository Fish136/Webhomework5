import { io } from "socket.io-client";

let socketInstance = null;

export function createSocket(token) {
  if (socketInstance) return socketInstance; // reuse existing socket
  if (!token) return null;

  socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
  });


  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      socketInstance?.disconnect();
      socketInstance = null;
    });
  }

  return socketInstance;
}
