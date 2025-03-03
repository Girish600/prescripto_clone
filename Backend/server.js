import express from 'express';
import cors from 'cors';
// import { configDotenv } from 'dotenv';
import 'dotenv/config'
import connectToDb from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import userRouter from './routes/userRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// create _dirname for es module 

const __filename= fileURLToPath(import.meta.url);
const __dirname= dirname(__filename)

// app config

const app= express();
connectCloudinary();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "frontend/dist")))

app.use('/admin',adminRouter)

app.use('/doctor', doctorRouter)

app.use('/user', userRouter)

// app.get('/',(req,res)=>{
//     res.send('This is Home Page')
// })

app.get('*', (req,res)=>{
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
})

app.listen(process.env.PORT,()=>{
    connectToDb();
    console.log(`server running at port ${process.env.PORT}`)
})