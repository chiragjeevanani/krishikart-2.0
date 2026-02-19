import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("join_order_room", (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`Socket ${socket.id} joined room order_${orderId}`);
        });

        socket.on("join_admin_delivery", () => {
            socket.join("admin_delivery_tracking");
            console.log(`Socket ${socket.id} joined admin_delivery_tracking`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const emitToAdmin = (event, data) => {
    if (io) {
        io.to("admin_delivery_tracking").emit(event, data);
    }
};

export const emitToOrderRoom = (orderId, event, data) => {
    if (io) {
        io.to(`order_${orderId}`).emit(event, data);
    }
};
