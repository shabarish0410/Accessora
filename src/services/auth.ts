import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SESSION_KEY = 'app_session_token';
const USER_KEY = 'app_session_user';

export interface AppUser {
  userId: string;
  role: 'guard' | 'chairman' | 'incharge' | 'admin';
  username: string;
  fullName: string;
  token: string;
}

export const AuthService = {
  /**
   * Log in with a plain username and password.
   * Calls the custom `login` RPC in Supabase.
   */
  async login(username: string, password: string): Promise<AppUser> {
    const { data, error } = await supabase.rpc('login', {
      p_username: username.trim().toLowerCase(),
      p_password: password,
    });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Invalid username or password');

    const row = data[0];
    const user: AppUser = {
      userId: row.user_id,
      role: row.role,
      username: username.trim().toLowerCase(),
      fullName: row.full_name || username,
      token: row.token,
    };

    // Persist session to device storage
    await AsyncStorage.setItem(SESSION_KEY, row.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Log out the current user. Deletes the session from the database.
   */
  async logout(): Promise<void> {
    const token = await AsyncStorage.getItem(SESSION_KEY);
    if (token) {
      await supabase.rpc('logout', { p_token: token });
    }
    await AsyncStorage.removeItem(SESSION_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },

  /**
   * Change password for the current user.
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const token = await AsyncStorage.getItem(SESSION_KEY);
    if (!token) throw new Error('Not logged in');

    const { error } = await supabase.rpc('change_password', {
      p_token: token,
      p_old_password: oldPassword,
      p_new_password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Restore a persisted session from device storage.
   * Validates the token against the database.
   */
  async restoreSession(): Promise<AppUser | null> {
    try {
      const token = await AsyncStorage.getItem(SESSION_KEY);
      if (!token) return null;

      const { data, error } = await supabase.rpc('get_current_user', { p_token: token });
      if (error || !data || data.length === 0) {
        // Token expired or invalid — clear storage
        await AsyncStorage.removeItem(SESSION_KEY);
        await AsyncStorage.removeItem(USER_KEY);
        return null;
      }

      const row = data[0];
      const user: AppUser = {
        userId: row.user_id,
        role: row.role,
        username: row.username,
        fullName: row.full_name || row.username,
        token,
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Get the current session token (for passing to RPCs).
   */
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(SESSION_KEY);
  },

  /**
   * Create a new guard account. Only Incharge/Admin can call this.
   */
  async createGuard(username: string, password: string, fullName?: string): Promise<void> {
    const token = await AsyncStorage.getItem(SESSION_KEY);
    if (!token) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('create_guard', {
      p_token: token,
      p_username: username.trim().toLowerCase(),
      p_password: password,
      p_full_name: fullName || username.trim(),
    });

    if (error) throw new Error(error.message);
  },

  /**
   * Delete a guard account. Only Incharge/Admin can call this.
   */
  async deleteGuard(guardId: string): Promise<void> {
    const token = await AsyncStorage.getItem(SESSION_KEY);
    if (!token) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('delete_guard', {
      p_token: token,
      p_guard_id: guardId,
    });

    if (error) throw new Error(error.message);
  },
};
