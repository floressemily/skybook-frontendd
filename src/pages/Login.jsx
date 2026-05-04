// src/pages/Login.jsx
import AuthCard from '../components/auth/AuthCard';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth.css';

const Login = () => (
    <AuthCard>
        <LoginForm />
    </AuthCard>
);

export default Login;