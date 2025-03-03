import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.status(200).send({ success: true, message: "Availablity Changed" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    // console.log('Fetched doctors:', doctors);  // Debug log to see if doctors are retrieved
    res.status(200).send({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, message: error.message });
  }
};

// API for doctor login

const loginDoctor = async (req, res) => {
  try {
    // console.log(req.body, "from frontend")

    const { email, password } = req.body;
    // console.log(email, password, "form frontennd")
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.send({ success: false, message: "invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.SECRET_KEY);
      res.send({ success: true, token });
    } else {
      res.send({ success: false, message: "invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
};

// Api to get doctor appointments for doctor panel

const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.doc.id;
    const appointments = await appointmentModel.find({ docId });

    res.send({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
};

// api to mark appointment mark completed

const appointmentComplete = async (req, res) => {
  try {
    const docId = req.doc.id;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.send({ success: true, message: "Appointment Completed" });
    } else {
      return res.send({ success: false, message: "mark failed" });
    }
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
};

// api for cancel appointment

const appointmentCancel = async (req, res) => {
  try {
    const docId = req.doc.id;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.send({ success: true, message: "Appointment cancelled" });
    } else {
      return res.send({ success: false, message: "Cancellation failed" });
    }
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
};

// api to get dashboard data for doctor panel

const doctorDashboard = async (req, res) => {
  try {
    const docId = req.doc.id;
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.send({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
};

// API to get doctor profile

const doctorProfile = async (req, res) => {
  try {
    const docId = req.doc.id;
    const profileData = await doctorModel.findById(docId).select("-password");

    res.send({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
};

// APi to update doctor profile data

const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.doc.id;
    const { fees, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

    res.send({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
};

export {
  changeAvailablity,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  updateDoctorProfile,
  doctorProfile,
};
