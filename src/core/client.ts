import { OBSWebSocket, type EventTypes } from 'obs-websocket-js';
import { CONNECTION_EVENTS } from '../types/connection-events.js';
import { EventEmitter } from 'node:events';
import type { Config } from '../types/config.js';
import { CONNECTION_STATE, type ConnectionState } from '../types/connection-state.js';
import type { RequestHandler } from '../types/request-handler.js';
import { registerSceneEvents } from '../events/scene.js';

const CONNECTION_NATIVE_EVENTS = {
    CONNECTION_CLOSED: 'ConnectionClosed',
} as const satisfies Partial<Record<string, keyof EventTypes>>;

export class OBStiiksClient extends EventEmitter {
    private obs: OBSWebSocket;
    private state: ConnectionState = CONNECTION_STATE.DISCONNECTED;
    private connectPromise?: Promise<void>|undefined;
    private isManualDisconnect = false;

    constructor(private readonly config: Config) {
        super();
        this.obs = new OBSWebSocket();
        this.registerNativeListeners();
    }

    public get connectionState(): ConnectionState {
        return this.state;
    }

    public connect(): Promise<void> {
        // If already connected, resolve immediately.
        if (this.state === CONNECTION_STATE.CONNECTED)
            return Promise.resolve();

        // If a connection attempt is already in progress, return the existing promise.
        if (this.connectPromise)
            return this.connectPromise;

        this.connectPromise = this.connectInternal();
        
        // Ensure that the connectPromise is cleared once the connection attempt is finished, regardless of success or failure.
        this.connectPromise.finally(() => {
            this.connectPromise = undefined;
        });

        return this.connectPromise;
    }

    public call: RequestHandler = (requestType, requestData) => {
        return this.obs.call(requestType, requestData);
    }

    private async connectInternal(): Promise<void> {
        this.setState(CONNECTION_STATE.CONNECTING);

        const url = `ws://${this.config.host}:${this.config.port}`;

        try {
            await this.obs.connect(url, this.config.password);
            this.setState(CONNECTION_STATE.CONNECTED);
        } catch (error) {
            this.setState(CONNECTION_STATE.DISCONNECTED);
            throw error;
        }
    }

    private registerNativeListeners(): void {
        this.obs.on(CONNECTION_NATIVE_EVENTS.CONNECTION_CLOSED, () => {
            this.setState(CONNECTION_STATE.DISCONNECTED);
            if (!this.isManualDisconnect)
                this.reconnect();
        })

        registerSceneEvents(this.obs, this.emit.bind(this));
    }

    public async disconnect(): Promise<void> {
        if (this.state === CONNECTION_STATE.DISCONNECTED)
            return;

        this.isManualDisconnect = true;


        try {
            await this.obs.disconnect();
        } finally {
            this.setState(CONNECTION_STATE.DISCONNECTED);
            this.isManualDisconnect = false;
        }
    }

    private reconnect(): void {
        if (!this.config.autoReconnect)
            return;

        this.setState(CONNECTION_STATE.RECONNECTING);
        setTimeout(() => {
            this.connect().catch(() => {
                if (!this.isManualDisconnect)
                    this.reconnect();
            });
        }, this.config.reconnectInterval ?? 5000);
    }

    private setState(newState: ConnectionState): void {
        if (this.state === newState)
            return;

        this.state = newState;
        this.emit(CONNECTION_EVENTS.STATE_CHANGED, newState);
    }
}