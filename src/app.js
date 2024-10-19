import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/error-handler.js"

import { app ,server} from "./socket/socket.js";

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));


app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))
app.use(cookieParser())

//routes import

import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";

//routes declaration

app.use("/api/v1/users" , userRouter);
app.use("/api/v1/message" , messageRouter);

app.use(errorHandler)


export {app , server}