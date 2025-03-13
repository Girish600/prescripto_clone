import express from 'express';
import { bookAppointment, cancelAppointment, getProfile, verifyRazorpay, listAppointment, paymentRazorpay, registerUser, updateProfile, userLogin } from '../controller/userController.js';
import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';


const userRouter= express.Router();

userRouter.post('/register', registerUser)

userRouter.post('/login', userLogin)

userRouter.get('/get-profile', authUser, getProfile)

userRouter.post('/update-profile', upload.single('image'), authUser , updateProfile)

userRouter.post('/book-appointment', authUser, bookAppointment)

userRouter.get('/appointments', authUser, listAppointment)

userRouter.post('/cancel-appointment', authUser, cancelAppointment)

userRouter.post('/payment-razorpay', authUser, paymentRazorpay)

userRouter.post('/verify-razorpay', authUser, verifyRazorpay)

export default  userRouter ;