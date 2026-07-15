/**
 * Server-side feature flag enforcement — separate from plan entitlements.
 * @see docs/flags/feature-flag-policy.md
 */
import {
  FLAG_ENV_PREFIX,
  KILL_SWITCHES,
  type FeatureFlagKey,
  type KillSwitchKey,
} from '@kesbyar/shared';

function envKey(prefix: string, flagKey: string): string {
  return `${prefix}${flagKey.toUpperCase().replace(/\./g, '_').replace(/-/g, '_')}`;
}

function readTruthyEnv(key: string): boolean | undefined {
  const v = process.env[key];
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return undefined;
}

/** Release/beta/internal flags — default off unless env explicitly true */
export function isFeatureFlagEnabled(flagKey: FeatureFlagKey): boolean {
  const key = envKey(FLAG_ENV_PREFIX.FEATURE, flagKey);
  return readTruthyEnv(key) === true;
}

/** Kill switches — env true disables the capability */
export function isKillSwitchActive(switchKey: KillSwitchKey | string): boolean {
  const key = envKey(FLAG_ENV_PREFIX.KILL, switchKey);
  return readTruthyEnv(key) === true;
}

export function isAiAssistantKilled(): boolean {
  return isKillSwitchActive(KILL_SWITCHES.AI_ASSISTANT);
}

export function isPilotFlagEnabled(flagKey: string): boolean {
  const key = envKey(FLAG_ENV_PREFIX.PILOT, flagKey);
  return readTruthyEnv(key) === true;
}
