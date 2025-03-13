import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {useNavigate} from 'react-router-dom'


function MyAppointments() {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const months= [ '','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  
  const slotDateFormat= (slotDate)=>{
    const dateArray= slotDate.split('_');
    return dateArray[0]+ " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }
  const navigate= useNavigate()
  // Fetch user's appointments
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message || "No appointments found");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch appointments");
    }
  };

  const cancelAppointment = async(appointmentId)=>{
    try {
      
      const {data}= await axios.post(backendUrl + '/user/cancel-appointment',{appointmentId}, {headers:{Authorization:`Bearer ${token}`}});
      if (data.success) {
        toast.success(data.message);
        getUserAppointments()
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }

  // const intiPay= (order)=>{

  //   const options= {
  //     key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //     amount: order.amount,
  //     currency:order.currency,
  //     name:'Appointment Payment',
  //     description: 'Appointment Payment',
  //     order_id:order.id,
  //     receipt: order.receipt,
  //     handler:async(response)=>{
  //       console.log(response)
  //       try {
          
  //         const {data}= await axios.post(backendUrl + '/user/verify-razorpay', response, {headers:{Authorization:`Bearer ${token}`}})
  //         if (data.success) {
  //           getUserAppointments()
  //           navigate('/my-appointments')
  //         }

  //       } catch (error) {
  //         console.log(error);
  //         toast.error(error.message)
  //       }
  //     }
  //   }

  //   const rzp= new window.Razorpay(options)
  //   rzp.open()

  // }

  const intiPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: function (response) {
        console.log("Razorpay Response:", response);
        axios
          .post(
            `${backendUrl}/user/verify-razorpay`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then(({ data }) => {
            console.log("Payment Verification Success:", data);
            toast.success("Payment verified successfully!");
            getUserAppointments();
            navigate("/my-appointments");
          })
          .catch((error) => {
            console.error("Payment Verification Failed:", error);
            toast.error(error.response?.data?.message || "Payment verification failed.");
          });
      },
      theme: {
        color: "#3399cc",
      },
    };
  
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  

  const appointmentRazorpay= async(appointmentId)=>{

    try {
      const {data}= await axios.post(backendUrl + '/user/payment-razorpay', {appointmentId}, {headers:{Authorization:`Bearer ${token}`}})

      if (data.success) {
        intiPay(data.order)
      }

    } catch (error) {
      
    }

  }

  useEffect(() => {
    if (token) {
      getUserAppointments();
      getDoctorsData();
    }
  }, [token]);

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div>
        {appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.docData.image} alt='' />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                <p className='text-xs'>{item.docData.address?.line1}</p>
                <p className='text-xs'>{item.docData.address?.line2}</p>
                <p className='text-xs mt-1'>
                  <span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>
              <div className='flex flex-col gap-2 justify-end'>
                {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>Paid</button>}
                {!item.cancelled && !item.payment && !item.isCompleted && <button onClick={()=>appointmentRazorpay(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button> }
                {!item.cancelled && !item.isCompleted && <button onClick={()=>cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel Appointment</button> }
                {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment Cancelled  </button>}
                {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}
              </div>
            </div>
          ))
        ) : (
          <p>No appointments found.</p>
        )}
      </div>
    </div>
  );
}

export default MyAppointments;