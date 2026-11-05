import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import Home from './components/Pages/Pipe';
import Layout from './components/Layout/Layout';
import Contractors from './components/Pages/Contractors';
import MaintenanceRecords from './components/Pages/MaintenanceRecord';
import Reports from './components/Pages/Reports';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<Layout />}>
                    <Route path="/pipelines" element={<Home />} />
                    <Route path="/contractors" element={<Contractors />} />
                    <Route path="/maintenancerecords" element={<MaintenanceRecords />} />
                    <Route path="/reports" element={<Reports />} />
                    
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;