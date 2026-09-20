import type { OBStiiksClient } from '../core/client.js';
import type { Resources } from '../resources/index.js';

export interface ModuleContext {
    client: OBStiiksClient;
    resources: Resources;
}

export interface OBStiiksModule {
    readonly name: string;

    register(context: ModuleContext): void|Promise<void>;

    onConnect?(): void|Promise<void>;
    onDisconnect?(): void|Promise<void>;
}