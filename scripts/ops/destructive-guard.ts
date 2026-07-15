export {
  getAppEnvironment,
  isDestructiveDbAllowed,
  isProductionEnvironment,
  isRestoreAllowed,
  parseDatabaseUrl,
} from '@kesbyar/shared';

import { isDestructiveDbAllowed, isRestoreAllowed } from '@kesbyar/shared';

export function requireDestructiveDbAllowed(actionLabel: string): void {
  if (isDestructiveDbAllowed()) return;
  console.error(
    `❌ ${actionLabel} در production مسدود است. برای اجرای اجباری (با احتیاط شدید): ALLOW_SEED=true`,
  );
  process.exit(1);
}

export function requireRestoreAllowed(): void {
  if (isRestoreAllowed()) return;
  console.error('❌ بازگردانی دیتابیس نیاز به تأیید صریح دارد.');
  console.error('   local/staging: CONFIRM_RESTORE=true');
  console.error('   production: ALLOW_RESTORE=true و CONFIRM_RESTORE=true');
  process.exit(1);
}
