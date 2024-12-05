import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  useIonToast,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        const response = await signUp(email, password, username);
        if (response.error) {
          throw response.error;
        }
        history.push('/home');
      } else {
        const { data, error } = await signIn(email, password);
        if (error) {
          throw error;
        }
        if (data?.user) {
          history.push('/home');
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '2rem' }}>
          <h1 className="ion-text-center">GroupConnect</h1>
          
          <IonSegment 
            value={mode} 
            onIonChange={e => setMode(e.detail.value as 'login' | 'signup')}
            className="ion-margin-bottom"
          >
            <IonSegmentButton value="login">
              <IonLabel>Login</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="signup">
              <IonLabel>Sign Up</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <IonItem>
                <IonLabel position="stacked">Username</IonLabel>
                <IonInput
                  value={username}
                  onIonChange={e => setUsername(e.detail.value!)}
                  placeholder="Enter username"
                  required
                />
              </IonItem>
            )}

            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonChange={e => setEmail(e.detail.value!)}
                placeholder="Enter email"
                required
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={e => setPassword(e.detail.value!)}
                placeholder="Enter password"
                required
              />
            </IonItem>

            <IonButton
              expand="block"
              type="submit"
              className="ion-margin-top"
              disabled={loading}
            >
              {loading ? (
                <IonSpinner name="crescent" />
              ) : mode === 'login' ? (
                'Login'
              ) : (
                'Sign Up'
              )}
            </IonButton>
          </form>

          {mode === 'signup' && (
            <IonText color="medium" className="ion-text-center ion-margin-top">
              <p>
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login; 