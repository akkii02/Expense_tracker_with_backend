import { useDispatch, useSelector } from "react-redux";
import styles from "./Navbar.module.css";
import { useEffect } from "react";
import { setPremiumUser } from "../../Store/authSlice";

const Navbar = () => {
  const isLogin = useSelector((state)=>state.auth.isLogin)
  const premiumUser = useSelector((state)=>state.auth.premiumUser)
  const dispatch = useDispatch();
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []); 

  const handlePayment = async () => {
    const amountInINR = 10; 
    try{
        const response = await fetch('http://localhost:3000/create-order', {
            method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(amountInINR), 
        currency: 'INR',
    }),
});

const order = await response.json();
const options = {
  key: 'rzp_test_4s4LGedgW0mcBd', 
  amount: Number(order.amount), 
  currency: order.currency,
  name: 'Your Expense Tracker',
  description: 'Payment for your expense',
  order_id: order.id, 
  handler: function (response) {
    alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
    if(response){
        dispatch(setPremiumUser())
    }
  },
  prefill: {
    name: 'Akshay Sable',
    email: 'akshaysable097@gmail.com',
  },
};

  const rzp1 = new window.Razorpay(options);
  rzp1.open();
}catch(err){
console.log("err",err)
}
  
  };
  
  

  
  
    return (
        <div className={styles.navbar}>
            <div className={styles.container}>
                <h1>Expense Tracker</h1>
                {premiumUser && isLogin && <button onClick={handlePayment} className={styles.btn}>Buy Premium Membership</button>}
            </div>
        </div>
    )
};
export default Navbar;