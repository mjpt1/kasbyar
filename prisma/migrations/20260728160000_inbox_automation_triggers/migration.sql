-- Inbox / conversation automation triggers (Phase 6)
ALTER TYPE "AutomationTrigger" ADD VALUE IF NOT EXISTS 'INBOUND_MESSAGE';
ALTER TYPE "AutomationTrigger" ADD VALUE IF NOT EXISTS 'NEGATIVE_SENTIMENT';
ALTER TYPE "AutomationTrigger" ADD VALUE IF NOT EXISTS 'MISSED_CALL';
