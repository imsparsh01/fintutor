import { Platform } from 'react-native';
import { authenticatedFetch, BACKEND_URL } from './backend';
import { dataExportFilename, formatDataExport } from './dataExportFormat';
import { supabase } from './supabase';

type ExportEnvelope = { generated_at?: string } & Record<string, unknown>;

export async function downloadCurrentUserData(password: string): Promise<void> {
  if (!supabase) throw new Error('Authentication is not configured.');
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user.email;
  if (!email) throw new Error('Your signed-in email could not be verified.');

  const response = await authenticatedFetch(`${BACKEND_URL}/account/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? 'Your data export could not be prepared.');
  }

  const envelope = (await response.json()) as ExportEnvelope;
  const contents = formatDataExport(envelope);
  const filename = dataExportFilename(envelope.generated_at ?? '');
  if (Platform.OS === 'web') {
    downloadInBrowser(contents, filename);
    return;
  }
  await shareOnDevice(contents, filename);
}

function downloadInBrowser(contents: string, filename: string): void {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function shareOnDevice(contents: string, filename: string): Promise<void> {
  const [{ File, Paths }, Sharing] = await Promise.all([
    import('expo-file-system'),
    import('expo-sharing'),
  ]);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Saving or sharing files is not available on this device.');
  }
  const file = new File(Paths.cache, filename);
  try {
    file.create({ overwrite: true });
    file.write(contents);
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Save your FinTutor data',
      UTI: 'public.json',
    });
  } finally {
    if (file.exists) file.delete();
  }
}
