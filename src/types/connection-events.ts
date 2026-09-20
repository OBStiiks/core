export const CONNECTION_EVENTS = {
    STATE_CHANGED: 'connection:state:changed',
} as const;

export type ConnectionEvent = typeof CONNECTION_EVENTS[keyof typeof CONNECTION_EVENTS];