import React, { useState, useEffect } from "react";

const PaymentButton = ({ appointmentId }) => {
  const [amount, setAmount] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token"); // Retrieve token from localStorage

  useEffect(() => {
    // Fetch appointment details from the backend
    const fetchAppointmentDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/payment-razorpay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ appointmentId }),
        });

        const data = await response.json();
        if (data.success) {
          setAmount(data.order.amount / 100); // Convert from paisa to INR
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId, backendUrl, token]);

  const handlePayment = async () => {
    try {
      if (!amount) {
        alert("Amount not available!");
        return;
      }

      // Get Order ID from backend
      const orderResponse = await fetch(`${backendUrl}/payment-razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appointmentId }),
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        alert(orderData.message);
        return;
      }

      // Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount, // Already in paisa
        currency: "INR",
        name: "Acme Corp",
        description: "Payment for appointment",
        image: "https://example.com/your_logo.jpg",
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyResponse = await fetch(`${backendUrl}/verify-razorpay`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            alert("Payment Successful!");
          } else {
            alert("Payment Verification Failed!");
          }
        },
        prefill: { name: "Gaurav Kumar", email: "gaurav.kumar@example.com" },
        theme: { color: "#F37254" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <button onClick={handlePayment} className="bg-blue-500 text-white p-2 rounded">
      {amount ? `Pay ₹${amount}` : "Loading..."}
    </button>
  );
};

export default PaymentButton;
