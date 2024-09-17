import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import logo from './logo.svg';
import './App.css';
import RegistrationPage from './components/Registration/RegistrationPage';
import LoginPage from "./components/Registration/LoginPage";
import Expense from "./components/Expenses/Expense";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar/Navbar";
import ForgetPassword from "./components/Registration/ForgetPassword";

function App() {
  const isLogin = useSelector((state)=>state.auth.isLogin)
  return (
    <Router>
      <Navbar/>
    <Routes> 
        <Route path="/" element={isLogin ? <Expense/> :<LoginPage/>} />
        <Route path="/signup" element={<RegistrationPage/>} />
        <Route path="/password/forgotpassword" element={<ForgetPassword/>} />
        {/* <Route path="/expense" element={<Expense/>}/> */}
    </Routes>
</Router>
  );
}

export default App;
