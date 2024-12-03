import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { IonContent, IonPage, IonItem, IonLabel, IonInput, IonButton, IonSegment, IonSegmentButton, IonCard, IonCardContent, useIonToast, } from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { createUserProfile } from '../services/database';
import { useHistory } from 'react-router-dom';
const Login = () => {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const history = useHistory();
    const [present] = useIonToast();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'login') {
                await signIn(email, password);
                history.push('/home');
            }
            else {
                const { data: { user } } = await signUp(email, password);
                if (user) {
                    await createUserProfile({ ...user, email, username });
                    present({
                        message: 'Check your email for verification link',
                        duration: 3000,
                        position: 'top',
                        color: 'success'
                    });
                }
            }
        }
        catch (error) {
            present({
                message: error.message || 'An error occurred',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(IonPage, { children: _jsx(IonContent, { className: "ion-padding", children: _jsx("div", { style: { maxWidth: '400px', margin: '0 auto', paddingTop: '2rem' }, children: _jsx(IonCard, { children: _jsxs(IonCardContent, { children: [_jsx("h1", { style: { textAlign: 'center', marginBottom: '2rem' }, children: "GroupConnect" }), _jsxs(IonSegment, { value: mode, onIonChange: e => setMode(e.detail.value), children: [_jsx(IonSegmentButton, { value: "login", children: "Login" }), _jsx(IonSegmentButton, { value: "signup", children: "Sign Up" })] }), _jsxs("form", { onSubmit: handleSubmit, style: { marginTop: '1rem' }, children: [mode === 'signup' && (_jsxs(IonItem, { children: [_jsx(IonLabel, { position: "floating", children: "Username" }), _jsx(IonInput, { type: "text", value: username, onIonChange: e => setUsername(e.detail.value), required: true })] })), _jsxs(IonItem, { children: [_jsx(IonLabel, { position: "floating", children: "Email" }), _jsx(IonInput, { type: "email", value: email, onIonChange: e => setEmail(e.detail.value), required: true })] }), _jsxs(IonItem, { children: [_jsx(IonLabel, { position: "floating", children: "Password" }), _jsx(IonInput, { type: "password", value: password, onIonChange: e => setPassword(e.detail.value), required: true })] }), _jsx(IonButton, { expand: "block", type: "submit", style: { marginTop: '2rem' }, disabled: loading, children: mode === 'login' ? 'Sign In' : 'Sign Up' })] })] }) }) }) }) }));
};
export default Login;
