import { apiSuccess, jsonResponse } from '@/lib/api-response';

const STARTED_AT = new Date().toISOString();

/** Liveness — process up (no external deps). Used by load balancers / Docker HEALTHCHECK. */
export async function GET() {
  return jsonResponse(
    apiSuccess({
      status: 'ok',
      service: 'kesbyar-web',
      probe: 'liveness',
      version: process.env.npm_package_version ?? '0.1.0',
      startedAt: STARTED_AT,
      environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development',
    }),
  );
}
