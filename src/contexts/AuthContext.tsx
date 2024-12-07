import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { createUserProfile, getUserProfile, UserProfile } from '../services/database';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setProfile(profile);
    } catch (error: any) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session:', initialSession);
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        loadUserProfile(initialSession.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      console.log('Starting signup process...');
      
      // Default role ID for member (2)
      const DEFAULT_ROLE_ID = 2;
      // Default user type ID (1)
      const DEFAULT_TYPE_ID = 1;

      // Get the member role if possible, otherwise use default
      let roleId = DEFAULT_ROLE_ID;
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .limit(1);

        console.log('Available role data:', roleData);
        
        if (!roleError && roleData && roleData.length > 0) {
          roleId = roleData[0].id || DEFAULT_ROLE_ID;
        }
      } catch (error) {
        console.warn('Could not fetch role ID, using default:', error);
      }

      // Get the general user type, with fallback to default
      let typeId = DEFAULT_TYPE_ID;
      try {
        const { data: typeData, error: typeError } = await supabase
          .from('user_types')
          .select('*')
          .limit(1);

        console.log('Available type data:', typeData);
        
        if (!typeError && typeData && typeData.length > 0) {
          typeId = typeData[0].id || DEFAULT_TYPE_ID;
        }
      } catch (error) {
        console.warn('Could not fetch type ID, using default:', error);
      }

      console.log('Creating auth user with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Error in auth signup:', error);
        // Show user-friendly error message
        const toast = document.createElement('ion-toast');
        toast.message = error.message === 'User already registered'
          ? 'This email is already registered. Please log in instead.'
          : 'Unable to create account. Please try again.';
        toast.duration = 5000;
        toast.position = 'top';
        toast.color = 'warning';
        document.body.appendChild(toast);
        await toast.present();
        
        setLoading(false);
        return { data: { user: null, session: null }, error };
      }

      console.log('Auth signup successful:', data);

      if (data?.user) {
        const profileData = {
          id: data.user.id,
          email,
          username,
          role_id: roleId,
          user_type_id: typeId
        };

        console.log('Creating/updating user profile with:', profileData);
        try {
          await createUserProfile(profileData);
          console.log('Profile creation/update successful');
          
          // Show success message about email verification
          const toast = document.createElement('ion-toast');
          toast.message = 'Account created successfully! Please check your email for a verification link.';
          toast.duration = 5000;
          toast.position = 'top';
          toast.color = 'success';
          document.body.appendChild(toast);
          await toast.present();
          
        } catch (profileError: any) {
          console.error('Error in profile creation:', profileError);
          
          // Show user-friendly error message
          const toast = document.createElement('ion-toast');
          toast.message = 'This email is already registered. Please log in instead.';
          toast.duration = 5000;
          toast.position = 'top';
          toast.color = 'warning';
          document.body.appendChild(toast);
          await toast.present();
          
          setLoading(false);
          return { 
            data: { user: null, session: null }, 
            error: new AuthError('Account already exists')
          };
        }
      }

      setLoading(false);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in signup process:', error);
      
      // Show generic error message
      const toast = document.createElement('ion-toast');
      toast.message = 'Unable to create account. Please try again.';
      toast.duration = 5000;
      toast.position = 'top';
      toast.color = 'danger';
      document.body.appendChild(toast);
      await toast.present();
      
      setLoading(false);
      return {
        data: { user: null, session: null },
        error: error instanceof AuthError ? error : new AuthError(error.message)
      };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return {
        data: { user: null, session: null },
        error
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('1. Starting signOut process');
      
      const { error } = await supabase.auth.signOut();
      console.log('2. Supabase signOut result:', { error });
      
      if (error) throw error;
      
      console.log('3. Clearing auth state');
      // Clear auth state
      setSession(null);
      setUser(null);
      setProfile(null);
      
      console.log('4. Clearing localStorage');
      // Clear any cached data
      localStorage.clear();
      
      // The auth state change listener will handle the redirect
      console.log('5. SignOut process complete - waiting for auth state change');
    } catch (error) {
      console.error('Error in signOut process:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 