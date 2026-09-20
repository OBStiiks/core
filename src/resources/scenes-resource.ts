import type { RequestHandler } from '../types/request-handler.js';
import type { OBSResponseTypes } from 'obs-websocket-js';

export interface Scene {
    name: string;
    uuid: string;
    index: number;
}

export interface SceneList {
    currentProgramSceneName: string;
    currentProgramSceneUuid: string;
    currentPreviewSceneName: string|null;
    currentPreviewSceneUuid: string|null;
    scenes: Scene[];
}

export class ScenesResource {
    constructor(private readonly call: RequestHandler) {}

    public async list(): Promise<SceneList> {
        const response = await this.call('GetSceneList');

        return {
            currentProgramSceneName: response.currentProgramSceneName,
            currentProgramSceneUuid: response.currentProgramSceneUuid,
            currentPreviewSceneName: response.currentPreviewSceneName || null,
            currentPreviewSceneUuid: response.currentPreviewSceneUuid || null,
            scenes: (response.scenes as Array<{
                sceneName: string;
                sceneUuid: string;
                sceneIndex: number;
            }>).map((scene) => ({
                name: scene.sceneName,
                uuid: scene.sceneUuid,
                index: scene.sceneIndex,
            })),
        };
    }

    public getCurrentScene(): Promise<OBSResponseTypes['GetCurrentProgramScene']> {
        return this.call('GetCurrentProgramScene');
    }

    public setCurrentScene(sceneName: string): Promise<void> {
        return this.call('SetCurrentProgramScene', { sceneName });
    }
}