import Sidebar from '../Sidebar/Sidebar';
import {Outlet} from 'react-router-dom';


const Layout = () =>{
   
    return(
        <div style={{padding:'20px'}}>
            <Sidebar />
            <div style={{flex:1, padding:'20px'}}>
                <Outlet/>
            </div>
        </div>
    );
};

export default Layout;