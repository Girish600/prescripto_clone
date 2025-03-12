import React, { useEffect, useState } from "react";
import PaymentButton from "../components/PaymentButton";

const CheckoutPage = () => {
  const [orderId, setOrderId] = useState(null);
  const [amount, setAmount] = useState(299); // Replace with actual amount

  useEffect(() => {
    fetch("/create-order", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setOrderId(data.orderId))
      .catch((error) => console.error("Error fetching order:", error));
  }, []);

  return (
    <div>
      <h1>Checkout Page</h1>
      {orderId ? <PaymentButton orderId={orderId} amount={amount} /> : <p>Loading payment...</p>}
    </div>
  );
};

export default CheckoutPage;
