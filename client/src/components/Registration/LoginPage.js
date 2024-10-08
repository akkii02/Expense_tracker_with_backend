import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css"; 
import React, { useRef, useState } from "react";
import { login,setToken, setTotalExpense } from "../../Store/authSlice";
import { useDispatch } from "react-redux";
import { setPremiumUser } from "../../Store/authSlice";

const LoginPage = () => {
    const [error, setError] = useState("");    
    const formRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch('http://localhost:3000/user/login', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const result = response.headers.get('Content-Type')?.includes('application/json') 
                    ? await response.json() 
                    : await response.text();
                
                throw new Error(result); 
            }
            const result = await response.json();
            console.log("res",result);
            const {message,token,receipt} = result;
            alert(message); 
            if(receipt){
                console.log("ccc",receipt)
                dispatch(setPremiumUser())
            }
            // dispatch(setTotalExpense(totalExpense))
            dispatch(setToken(token))
            dispatch(login());
            navigate("/");  
            setError(""); 
        } catch (error) {
            setError(error.message);
        }

        if (formRef.current) {
            formRef.current.reset(); 
        }
    };

    return (
        <div className={styles.main}>
            <div className={styles.card}>
                <h1>Login Page</h1>
                <form onSubmit={submitHandler} ref={formRef}>
                    <input type="email" placeholder="Email" name="email" required />
                    <input type="password" placeholder="Password" name="password" required />
                    <button type="submit">Login</button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
                <p>Don't have an account? <Link to="/signup">Register</Link></p>
                <p><Link to="/password/forgotpassword">Forget Password</Link></p>
            </div>
        </div>
    );
};

export default LoginPage;
