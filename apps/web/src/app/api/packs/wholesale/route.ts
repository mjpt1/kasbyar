import { createWave4PackRouteHandlers } from '@/server/packs/work-items/wave4-route';

const handlers = createWave4PackRouteHandlers('WHOLESALE');

export const GET = handlers.GET;
export const POST = handlers.POST;
