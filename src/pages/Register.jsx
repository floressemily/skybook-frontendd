// src/pages/Register.jsx
import AuthCard from '../components/auth/AuthCard';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/auth.css';

const Register = () => (
    <AuthCard>
        <RegisterForm />
    </AuthCard>
);

export default Register;