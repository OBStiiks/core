import { ScenesResource } from './scenes-resource.js';
import type { RequestHandler } from '../types/request-handler.js';

export function createResources(requestHandler: RequestHandler) {
    return {
        scenes: new ScenesResource(requestHandler)
    };
}

export type Resources = ReturnType<typeof createResources>;