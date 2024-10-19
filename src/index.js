import dotenv from "dotenv"
import { app ,server} from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: '.env'
})

connectDB()
.then(() => {
    server.listen(process.env.PORT || 8000 , () => {
        console.log(`server is running on https://localhost:${process.env.PORT}`);
    })
}).catch((err) => {
    console.log("Mongo DB connection failed :",err);
})
