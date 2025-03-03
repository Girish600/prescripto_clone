import validator from "validator";
import bycrpt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";

// register

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "Missing details" });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .send({ success: false, message: "enter valid details" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .send({ success: false, message: "enter strong password" });
    }

    const hashedPassword = await bycrpt.hash(
      password,
      +process.env.SALT_ROUNDS
    );

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

    res.status(200).send({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

// login

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "user does not exist" });
    }

    const isMatch = await bycrpt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
      res.status(200).send({ success: true, token });
    } else {
      res.status(400).send({ status: false, message: "Invalid credntials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

// user profile data

const getProfile = async (req, res) => {
  try {
    // Get userId from req.user (set by authUser middleware)
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .send({ success: false, message: "User ID is required." });
    }

    // Fetch user data from the database
    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }

    res.status(200).send({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

// update profile

const updateProfile = async (req, res) => {
  try {
    // Get userId from the auth middleware, not req.body
    const userId = req.user.id;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    // Validate required fields
    if (!name || !phone || !dob || !gender) {
      return res.status(400).send({ success: false, message: "Data missing" });
    }

    // Update user details
    await userModel.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        address: address ? JSON.parse(address) : undefined,
        dob,
        gender,
      },
      { new: true } // Ensure you get the updated document back
    );

    // Handle image upload if an image is provided
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      // Update user's image
      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.status(200).send({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

// book appointment

const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.send({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked;

    // Ensure slotDate is initialized
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = []; // Initialize empty array if it doesn't exist
    }

    // Check if slot is already booked
    if (slots_booked[slotDate].includes(slotTime)) {
      return res.send({ success: false, message: "Slot Not Available" });
    }

    // Add new slot
    slots_booked[slotDate].push(slotTime);

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId: req.user.id,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save updated slot data
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.send({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

// get user appointments on appointment page

const listAppointment = async (req, res) => {
  try {
    // Get user ID from req.user (set by authUser middleware)
    const userId = req.user.id;

    const appointments = await appointmentModel.find({ userId });

    if (appointments.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No appointments found." });
    }

    res.send({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

// cancel appointment

const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    //verify appointment user

    if (appointmentData.userId !== userId) {
      return res.send({ success: false, message: "Unauthrized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctors slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.send({ success: true, message: "appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

// API to make payment through razorpay

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {

  try {
    const { appointmentId } = req.body;

  const appointmentData = await appointmentModel.findById(appointmentId);

  if (!appointmentData || appointmentData.cancelled) {
    return res.send({success:true, message:'Appointment cancelled or not found'})
  }

  // creating options for razorpay payment

  const options= {
    amount: appointmentData.amount*100,
    currency:process.env.CURRENCY,
    receipt:appointmentId
  }

  const order= await razorpayInstance.orders.create(options)

  res.send({success:true,order})
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  }

};

// API for verify payment of razorpay

const verifyRazorpay= async(req, res)=>{
  try {
    const {razorpay_order_id}= req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    console.log(orderInfo)
    if (orderInfo.status === 'paid') {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {payment:true})
      res.send({success:true, message:'payment successful'})
    }else{
      res.send({success:false,message:'payment failed'})
    }


  } catch (error) {
    console.log(error);
    res.send({success:false,message:error.message})
  }
}

export {
  registerUser,
  userLogin,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay
};
