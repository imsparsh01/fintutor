import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedFetch, BACKEND_URL } from './backend';
import { supabase } from './supabase';

export async function deleteCurrentAccount(password: string): Promise<void> {
  if (!supabase) throw new Error('Authentication is not configured.');
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user.email;
  if (!email) throw new Error('Your signed-in email could not be verified.');
  const response = await authenticatedFetch(`${BACKEND_URL}/account/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmation: 'DELETE MY ACCOUNT' }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? 'Account deletion could not be completed.');
  }
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  await AsyncStorage.clear();
}
