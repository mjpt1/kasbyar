import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { KILL_SWITCHES, RELEASE_FLAGS } from '@kesbyar/shared';

import {
  isFeatureFlagEnabled,
  isKillSwitchActive,
  isPilotFlagEnabled,
} from '@/lib/flags';

describe('flags', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it('release flags default off', () => {
    expect(isFeatureFlagEnabled(RELEASE_FLAGS.EXAMPLE_MODULE)).toBe(false);
  });

  it('release flags on when env set', () => {
    process.env.FEATURE_FLAG_RELEASE_EXAMPLE_MODULE = 'true';
    expect(isFeatureFlagEnabled(RELEASE_FLAGS.EXAMPLE_MODULE)).toBe(true);
  });

  it('kill switch active when env true', () => {
    process.env.KILL_SWITCH_KILL_AI_ASSISTANT = 'true';
    expect(isKillSwitchActive(KILL_SWITCHES.AI_ASSISTANT)).toBe(true);
  });

  it('pilot flags use PILOT_FLAG prefix', () => {
    process.env.PILOT_FLAG_BETA_EXPORT = '1';
    expect(isPilotFlagEnabled('beta.export')).toBe(true);
  });
});
