import express from 'express';
import cors from 'cors';
// import { configDotenv } from 'dotenv';
import 'dotenv/config'
import connectToDb from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import userRouter from './routes/userRoutes.js';

// app config

const app= express();
connectCloudinary();
app.use(express.json());
app.use(cors());

app.use('/admin',adminRouter)

app.use('/doctor', doctorRouter)

app.use('/user', userRouter)

app.get('/',(req,res)=>{
    res.send('This is Home Page')
})

app.listen(process.env.PORT,()=>{
    connectToDb();
    console.log(`server running at port ${process.env.PORT}`)
})