import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import logo from './logo.svg';
import './App.css';
import RegistrationPage from './components/Registration/RegistrationPage';

function App() {
  return (
    <Router>
    <Routes> 
        <Route path="/" element={<RegistrationPage />} />
    </Routes>
</Router>
  );
}

export default App;
