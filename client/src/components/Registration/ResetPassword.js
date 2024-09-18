import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ForgetPassword.module.css";

const ResetPassword = () => {
  const { token } = useParams(); // Assumes the token is passed as a URL param
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const res = await fetch(`http://localhost:3000/password/reset/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: password }), // Ensure this matches the expected body
      });
  
      if (res.ok) {
        setMessage("Password has been reset successfully.");
        setError(null);
        navigate("/"); // Redirect to login page
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to reset password.");
        setMessage(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send the request.");
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <h1>Reset Password</h1>
        <form onSubmit={submitHandler}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Reset Password"}
          </button>
        </form>
        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
