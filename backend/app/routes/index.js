import userRoute from "../../app/routes/user.js";
import deliveryRoutes from "../../app/routes/delivery.js";
import masteradminRoutes from "../../app/routes/masteradmin.js";
import vendorRoutes from "../../app/routes/vendor.js";
import franchiseRoutes from "../../app/routes/franchise.js";
import catalogRoutes from "../../app/routes/catalog.js";
import productRoutes from "../../app/routes/product.js";
import orderRoutes from "../../app/routes/order.js";
import paymentRoutes from "../../app/routes/payment.js";

const setupRoutes = (app) => {
    app.use("/user", userRoute);
    app.use("/delivery", deliveryRoutes);
    app.use("/masteradmin", masteradminRoutes);
    app.use("/vendor", vendorRoutes);
    app.use("/franchise", franchiseRoutes);
    app.use("/catalog", catalogRoutes);
    app.use("/products", productRoutes);
    app.use("/orders", orderRoutes);
    app.use("/payment", paymentRoutes);
}
export default setupRoutes;
