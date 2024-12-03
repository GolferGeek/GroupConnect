import { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardContent,
  useIonToast,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { createUserProfile } from '../services/database';
import { useHistory } from 'react-router-dom';

interface SignUpData {
  email: string;
  username: string;
  id: string;
}

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        history.push('/home');
      } else {
        const { data: { user } } = await signUp(email, password);
        if (user) {
          const userData: SignUpData = {
            id: user.id,
            email: user.email || '',
            username
          };
          await createUserProfile(userData);
          present({
            message: 'Check your email for verification link',
            duration: 3000,
            position: 'top',
            color: 'success'
          });
        }
      }
    } catch (error: any) {
      present({
        message: error?.message || 'An error occurred',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '2rem' }}>
          <IonCard>
            <IonCardContent>
              <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>GroupConnect</h1>
              
              <IonSegment value={mode} onIonChange={e => setMode(e.detail.value as 'login' | 'signup')}>
                <IonSegmentButton value="login">Login</IonSegmentButton>
                <IonSegmentButton value="signup">Sign Up</IonSegmentButton>
              </IonSegment>

              <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {mode === 'signup' && (
                    <IonInput
                      label="Username"
                      labelPlacement="floating"
                      fill="solid"
                      type="text"
                      value={username}
                      onIonInput={e => setUsername(e.detail.value!)}
                      required
                    />
                  )}

                  <IonInput
                    label="Email"
                    labelPlacement="floating"
                    fill="solid"
                    type="email"
                    value={email}
                    onIonInput={e => setEmail(e.detail.value!)}
                    required
                  />

                  <IonInput
                    label="Password"
                    labelPlacement="floating"
                    fill="solid"
                    type="password"
                    value={password}
                    onIonInput={e => setPassword(e.detail.value!)}
                    required
                  />
                </div>

                <IonButton
                  expand="block"
                  type="submit"
                  style={{ marginTop: '2rem' }}
                  disabled={loading}
                >
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login; 