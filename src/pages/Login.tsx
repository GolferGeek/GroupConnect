import { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonCard,
  IonCardContent,
  useIonToast,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { createUserProfile } from '../services/database';
import { useHistory } from 'react-router-dom';

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
          await createUserProfile({ ...user, email, username });
          present({
            message: 'Check your email for verification link',
            duration: 3000,
            position: 'top',
            color: 'success'
          });
        }
      }
    } catch (error) {
      present({
        message: error.message || 'An error occurred',
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

              <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                {mode === 'signup' && (
                  <IonItem>
                    <IonLabel position="floating">Username</IonLabel>
                    <IonInput
                      type="text"
                      value={username}
                      onIonChange={e => setUsername(e.detail.value!)}
                      required
                    />
                  </IonItem>
                )}

                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={e => setEmail(e.detail.value!)}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={e => setPassword(e.detail.value!)}
                    required
                  />
                </IonItem>

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