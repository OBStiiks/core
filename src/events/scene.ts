import type { OBSWebSocket, EventTypes } from 'obs-websocket-js';
import { SCENE_EVENTS, type SceneEvent } from '../types/scene-events.js';

const SCENE_NATIVE_EVENTS = {
    SCENE_CREATED: 'SceneCreated',
    SCENE_REMOVED: 'SceneRemoved',
    SCENE_NAME_CHANGED: 'SceneNameChanged',
    CURRENT_PROGRAM_SCENE_CHANGED: 'CurrentProgramSceneChanged',
    CURRENT_PREVIEW_SCENE_CHANGED: 'CurrentPreviewSceneChanged',
    SCENE_LIST_CHANGED: 'SceneListChanged'
} as const satisfies Partial<Record<string, keyof EventTypes>>;

export function registerSceneEvents(
    obs: OBSWebSocket,
    emit: (event: SceneEvent, ...args: unknown[]) => void
): void {
    obs.on(SCENE_NATIVE_EVENTS.SCENE_CREATED, (data) => {
        emit(SCENE_EVENTS.CREATED, {
            name: data.sceneName,
            uuid: data.sceneUuid,
            isGroup: data.isGroup,
        })
    })
}