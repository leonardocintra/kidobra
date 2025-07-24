export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  provider: 'password' | 'google';
}
