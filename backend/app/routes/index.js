import userRoute from "../../app/routes/user.js";
import deliveryRoutes from "../../app/routes/delivery.js";
import masteradminRoutes from "../../app/routes/masteradmin.js";
import vendorRoutes from "../../app/routes/vendor.js";
import franchiseRoutes from "../../app/routes/franchise.js";



const setupRoutes=(app)=>{
 app.use("/user",userRoute);
 app.use("/delivery", deliveryRoutes);
 app.use("/masteradmin", masteradminRoutes);
 app.use("/vendor", vendorRoutes);
app.use("/franchise", franchiseRoutes);   
    
    
}
 export default setupRoutes;

