import { Server } from "socket.io";
import jwt from "jsonwebtoken";

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

        socket.on("join_franchise_room", (franchiseId) => {
            socket.join(`franchise_${franchiseId}`);
            console.log(`Socket ${socket.id} joined franchise_${franchiseId}`);
        });

        socket.on("join_delivery_room", (deliveryId) => {
            socket.join(`delivery_${deliveryId}`);
            console.log(`Socket ${socket.id} joined delivery_${deliveryId}`);
        });

        socket.on("join_vendor_room", (payload) => {
            try {
                let vendorIdFromToken = null;

                // Expect payload as object: { token: "JWT_HERE" }
                if (payload && typeof payload === "object" && payload.token) {
                    const decoded = jwt.verify(payload.token, process.env.JWT_SECRET);
                    vendorIdFromToken = decoded.id;
                }

                if (!vendorIdFromToken) {
                    console.warn(`join_vendor_room: Missing or invalid token from socket ${socket.id}`);
                    return;
                }

                const roomName = `vendor_${vendorIdFromToken}`;
                socket.join(roomName);
                console.log(`Socket ${socket.id} joined ${roomName} (secured via token)`);
            } catch (err) {
                console.error("join_vendor_room auth error:", err.message);
            }
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

export const emitToFranchise = (franchiseId, event, data) => {
    if (io) {
        io.to(`franchise_${franchiseId}`).emit(event, data);
    }
};

export const emitToDelivery = (deliveryId, event, data) => {
    if (io) {
        io.to(`delivery_${deliveryId}`).emit(event, data);
    }
};

export const emitToVendor = (vendorId, event, data) => {
    if (io) {
        io.to(`vendor_${vendorId}`).emit(event, data);
    }
};
