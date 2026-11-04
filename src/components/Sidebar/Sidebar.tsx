import {Link} from 'react-router-dom';
import { useState } from 'react';


const Sidebar = () =>{
    const [isOpen, setIsOpen] = useState(false);
    return(
        <>
        <button style={{position:'fixed', top:'20px', left:'20px', zIndex:1000}} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '✕' : '☰'}
        </button>

        {isOpen && <div onClick={() => setIsOpen(false)} style={{position: 'fixed', top: 0, left: 0, width: '100vw', height:'100vh', backgroundColor:'rgba(0,0,0,0.5)', zIndex:998}} />}

        <div style={{transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', width:'250px', height:'100vh', backgroundColor: 'black', textDecoration:'none', position: 'fixed', top: 0, left: 0, zIndex: 999, marginTop: '20px'}}>
            <h2>Меню</h2>
            <nav>
                <Link style={{display: 'block', padding:'10px', color:'white', textDecoration:'none'}} to="/pipelines">Трубы</Link>
                <Link style={{display: 'block', padding:'10px', color:'white', textDecoration:'none'}} to="/contractors">Исполнители</Link>
                <Link style={{display: 'block', padding:'10px', color:'white', textDecoration:'none'}} to="/maintenancerecords">Записи о ТО</Link>
                
            </nav>
        </div>
        </>
    );
};

export default Sidebar;