import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// for add new doctor

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;
    // console.log({name, email, password, speciality, degree, experience, about, fees, address},imageFile);

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .send({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .send({ success: false, message: "please enter valid email" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .send({ success: false, message: "please enter a strong password" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      +process.env.SALT_ROUNDS
    );

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageURL = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageURL,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.status(200).send({ success: true, message: "Doctor added" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, message: error.message });
  }
};

// verify admin or login admin

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.SECRET_KEY);
      res.status(200).send({ success: true, token });
    } else {
      res.status(400).send({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, message: error.message });
  }
};

// get All doctors

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.status(200).send({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, message: error.message });
  }
};

const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.send({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
};

// api for cancel appointment

const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

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

//   api to get dashboard data for admin panel

const adminDashboard = async (req, res) => {
  try {
    const doctors= await doctorModel.find({});

    const users= await userModel.find({});

    const appointments= await appointmentModel.find({});

    const dashData={
        doctors: doctors.length,
        appointments:appointments.length,
        patients:users.length,
        latestAppointments: appointments.reverse().slice(0,5)
    }

    res.send({success:true, dashData})

  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard
};
