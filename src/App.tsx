import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import Home from './components/Pages/Pipe';
import Layout from './components/Layout/Layout';
import Contractors from './components/Pages/Contractors';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<Layout />}>
                    <Route path="/pipelines" element={<Home />} />
                    <Route path="/contractors" element={<Contractors />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;