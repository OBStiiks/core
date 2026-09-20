import type { OBSRequestTypes, OBSResponseTypes } from 'obs-websocket-js';

export type RequestHandler = <Type extends keyof OBSRequestTypes>(
    requestType: Type,
    requestData?: OBSRequestTypes[Type]
) => Promise<OBSResponseTypes[Type]>;