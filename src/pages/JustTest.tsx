import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Add custom styles for dynamic buttons and modern look
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = 'http://svalmazchecks1-001-site1.ntempurl.com/api/Auth';

const App: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const endpoint = isLogin ? `${API_BASE}/login` : `${API_BASE}/register`;
        const payload = { email, password };

        try {
            const response = await axios.post(endpoint, payload);

            if (isLogin) {
                Cookies.set('jwt', response.data, { expires: 7 }); // Save JWT in cookies for 7 days
                setMessage('Login successful!');
            } else {
                setMessage(response.data.message);
            }
        } catch (error: any) {
            if (error.response) {
                setMessage(error.response.data.detail || 'An error occurred.');
            } else {
                setMessage('Network error. Please try again later.');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="form-container shadow p-4 rounded">
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {message && <div className="alert alert-info">{message}</div>}
                    <button
                        type="submit"
                        className="btn btn-primary w-100 dynamic-btn"
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <button
                        className="btn btn-link"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Don’t have an account? Register' : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;