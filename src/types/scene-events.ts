export const SCENE_EVENTS = {
    CREATED: 'scene:created',
    CHANGED: 'scene:changed',
} as const;

export type SceneEvent = typeof SCENE_EVENTS[keyof typeof SCENE_EVENTS];