import express from "express"
import dotenv from  "dotenv"
import connectDB  from "./app/dbConfig/dbConfig.js"
import setupRoutes from "./app/routes/index.js";
import cors  from "cors"

dotenv.config();
const app= express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOSTNAME || "0.0.0.0";

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello, World!');
});
connectDB();
setupRoutes(app);




app.listen(PORT,HOST,()=>{
    console.log(`server is running on http://${HOST}:${PORT}`)
})
