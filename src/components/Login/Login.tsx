import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [login, setLogin] = useState('');
    const [pass, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLogin(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
      
        const hashedPassword = CryptoJS.MD5(pass).toString();

        try {
            const response = await fetch('http://localhost:5157/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                
                body: JSON.stringify({
                    Login: login,
                    Password: hashedPassword 
                })
            });

            if (response.ok) {
                const responseData = await response.json();
                
               
                const token = typeof responseData === 'string' ? responseData : responseData.token;
                
                localStorage.setItem('token', token);

                
                navigate('/pipelines');

            } else {
                setError('Неверный логин или пароль');
            }
        } catch (err) {
            setError('Ошибка сети');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>Вход в систему</h2>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="login" style={{ display: 'block', marginBottom: '5px' }}>Логин</label>
                    <input 
                        onChange={handleLoginChange} 
                        value={login} 
                        id="login" 
                        name="login" 
                        type="text" 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        required
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="pas" style={{ display: 'block', marginBottom: '5px' }}>Пароль</label>
                    <input 
                        onChange={handlePasswordChange} 
                        value={pass} 
                        id="pas" 
                        name="pas" 
                        type="password" 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ width: '100%', padding: '10px', cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    {isLoading ? 'Загрузка...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default Login;