import express from "express"
import dotenv from "dotenv"
// Trigger restart v2
import connectDB from "./app/dbConfig/dbConfig.js"
import setupRoutes from "./app/routes/index.js";
import cors from "cors"
import { createServer } from "http";
import { initSocket } from "./app/lib/socket.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOSTNAME || "0.0.0.0";

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello, World!');
});
connectDB();
setupRoutes(app);




const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`server is running on port ${PORT}`)
})
