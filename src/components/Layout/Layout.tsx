import { Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import logo from '../../assets/logo.svg';


const Layout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            
            <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img 
                        src={logo} 
                        alt="Логотип" 
                        style={{ height: '40px', width: 'auto' }} 
                    />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        Pipelines TO
                    </Typography>
                    </Box>
                    <Button 
                        color="inherit" 
                        startIcon={<LogoutIcon />} 
                        onClick={handleLogout}
                    >
                        Выйти
                    </Button>
                </Toolbar>
            </AppBar>

            
            <Box sx={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <Box component="main" sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5' }}>
                    <Outlet />
                </Box>
            </Box>

            
            <Box 
                component="footer" 
                sx={{ 
                    py: 2, 
                    px: 3, 
                    backgroundColor: '#2c3e50', 
                    color: 'white',
                    textAlign: 'center'
                }}
            >
                <Typography variant="body2">
                    © 2026 
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Vasileva
                </Typography>
            </Box>

        </Box>
    );
};

export default Layout;