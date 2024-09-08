import styles from "./RegistrationPage.module.css";

const RegistrationPage = () => {
    return (
        <div className={styles.main}>
            <div className={styles.card}>
            <h1>Registration Page</h1>
            <form action="http://localhost:3000/user/signup" method="post">
                <input type="text" placeholder="Name" name="name" />
                <input type="email" placeholder="Email" name="email" />
                <input type="password" placeholder="Password" name="password" />
                <button type="submit">SignUp</button>
            </form>
            <p>Already have an account? <a href="#">Login</a></p>
            </div>
        </div>
    )
};
export default RegistrationPage;