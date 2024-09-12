import { Link, useNavigate } from "react-router-dom";
import styles from "./RegistrationPage.module.css";
import React, { useRef, useState } from "react";

const RegistrationPage = () => {
    const [error, setError] = useState("");    
    const formRef = useRef(null);
    const navigate = useNavigate();
  
    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch('http://localhost:3000/user/signup', {
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
            const result = await response.text();
            alert(result); 
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
                <h1>Registration Page</h1>
                <form onSubmit={submitHandler} ref={formRef}>
                    <input type="text" placeholder="Name" name="name" required />
                    <input type="email" placeholder="Email" name="email" required />
                    <input type="password" placeholder="Password" name="password" required />
                    <button type="submit">Sign Up</button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
                <p>Already have an account? <Link to="/">Login</Link></p>
            </div>
        </div>
    );
};

export default RegistrationPage;
