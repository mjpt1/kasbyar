import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '@/config';

export async function saveAuthSession(input: {
  token: string;
  organizationId: string | null;
  expiresAt: string;
}) {
  await SecureStore.setItemAsync(STORAGE_KEYS.token, input.token);
  await SecureStore.setItemAsync(STORAGE_KEYS.expiresAt, input.expiresAt);
  if (input.organizationId) {
    await SecureStore.setItemAsync(STORAGE_KEYS.orgId, input.organizationId);
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.orgId);
  }
}

export async function saveOrganizationId(organizationId: string) {
  await SecureStore.setItemAsync(STORAGE_KEYS.orgId, organizationId);
}

export async function loadAuthSession(): Promise<{
  token: string;
  organizationId: string | null;
  expiresAt: string | null;
} | null> {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.token);
  if (!token) return null;
  const organizationId = (await SecureStore.getItemAsync(STORAGE_KEYS.orgId)) ?? null;
  const expiresAt = (await SecureStore.getItemAsync(STORAGE_KEYS.expiresAt)) ?? null;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    await clearAuthSession();
    return null;
  }
  return { token, organizationId, expiresAt };
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.orgId);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.expiresAt);
}
