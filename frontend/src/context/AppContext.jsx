import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const [doctors, setDoctors] = useState([]);
  const [token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token') : false)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { line1: "", line2: "" },
    gender: "",
    dob: "",
    image: "",
  });

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/doctor/list");
      console.log("Doctors Data:", data); // Log the data here
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/user/get-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log("User Data:", data);
  
      if (data.success && data.userData) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "User data not found.");
        setUserData({
          name: "",
          email: "",
          phone: "",
          address: { line1: "", line2: "" },
          gender: "",
          dob: "",
          image: "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch user data.");
    }
  };
  
  

  const value = {
    doctors, getDoctorsData,
    currencySymbol,
    token,setToken,
    backendUrl, userData, setUserData, getUserData 
  };

  useEffect(() => {
    console.log(doctors);
    getDoctorsData();
  }, []);

  useEffect(()=>{
    if (token) {
      getUserData()
    }else{
      setUserData(false)
    }
  },[token])

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
