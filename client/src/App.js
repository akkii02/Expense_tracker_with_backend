import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import logo from './logo.svg';
import './App.css';
import RegistrationPage from './components/Registration/RegistrationPage';
import LoginPage from "./components/Registration/LoginPage";

function App() {
  return (
    <Router>
    <Routes> 
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage/>} />
    </Routes>
</Router>
  );
}

export default App;
