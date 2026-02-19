import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket;

export const initSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: true
        });

        socket.on("connect", () => {
            console.log("Connected to Socket.io server");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from Socket.io server");
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const joinAdminDeliveryTracking = () => {
    const s = getSocket();
    s.emit("join_admin_delivery");
};

export const joinOrderRoom = (orderId) => {
    const s = getSocket();
    s.emit("join_order_room", orderId);
};
