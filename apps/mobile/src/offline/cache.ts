import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'kesbyar_cache:';

export async function cacheGet<T>(key: string): Promise<{ data: T; cachedAt: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as { data: T; cachedAt: number };
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PREFIX + key,
      JSON.stringify({ data, cachedAt: Date.now() }),
    );
  } catch {
    // ignore quota errors
  }
}

export async function cacheRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export function cacheKey(orgId: string | null | undefined, path: string): string {
  return `${orgId ?? 'none'}:${path}`;
}
