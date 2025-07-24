import type { UserProfile } from '@/lib/types';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
    name: string;
}

export interface UpdatePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updatePassword: (data: UpdatePasswordData) => Promise<void>;
}
