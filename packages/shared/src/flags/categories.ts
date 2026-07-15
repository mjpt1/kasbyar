/**
 * Feature flag categories — distinct from plan entitlements (ADR-006).
 * @see docs/flags/feature-flag-policy.md
 */

export const FLAG_CATEGORIES = {
  RELEASE: 'release',
  BETA: 'beta',
  PILOT: 'pilot',
  KILL_SWITCH: 'kill_switch',
  INTERNAL: 'internal',
  DEMO: 'demo',
} as const;

export type FlagCategory = (typeof FLAG_CATEGORIES)[keyof typeof FLAG_CATEGORIES];

export const RELEASE_FLAGS = {
  EXAMPLE_MODULE: 'release.example_module',
} as const;

export const KILL_SWITCHES = {
  AI_ASSISTANT: 'kill.ai_assistant',
  AUTOMATION_RUN: 'kill.automation_run',
  FILE_UPLOAD: 'kill.file_upload',
  EXTERNAL_NOTIFICATIONS: 'kill.external_notifications',
} as const;

export const INTERNAL_FLAGS = {
  AUDIT_EXPORT: 'internal.audit_export',
  OPS_DEBUG_PANEL: 'internal.ops_debug',
} as const;

export type ReleaseFlagKey = (typeof RELEASE_FLAGS)[keyof typeof RELEASE_FLAGS];
export type KillSwitchKey = (typeof KILL_SWITCHES)[keyof typeof KILL_SWITCHES];
export type InternalFlagKey = (typeof INTERNAL_FLAGS)[keyof typeof INTERNAL_FLAGS];

export type FeatureFlagKey = ReleaseFlagKey | KillSwitchKey | InternalFlagKey | string;

export const FLAG_ENV_PREFIX = {
  FEATURE: 'FEATURE_FLAG_',
  KILL: 'KILL_SWITCH_',
  PILOT: 'PILOT_FLAG_',
} as const;
