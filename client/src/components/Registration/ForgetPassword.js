import { useRef, useState } from "react";
import styles from "./ForgetPassword.module.css";

const ForgetPassword = () => {
  const formRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button
    const formData = new FormData(formRef.current);
    const data = { email: formData.get("email") };

    try {
      const res = await fetch("http://localhost:3000/password/forgotpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setMessage("Check your email for the password reset link.");
        setError(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Something went wrong.");
        setMessage(null);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to send the request.");
      setMessage(null);
    } finally {
      if (formRef.current) {
        formRef.current.reset();
      }
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <h1>Forget Password</h1>
        <form onSubmit={submitHandler} ref={formRef}>
          <input type="email" placeholder="Email" name="email" required />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default ForgetPassword;
