import { OBStiiksClient } from './core/client.js';
import type { Config } from './types/config.js';
import type { ModuleContext, OBStiiksModule } from './types/modules.js';
import { createResources, type Resources } from './resources/index.js';

/**
 * Public entry point of the SDK.
 * 
 * Owns the underlying OBS connection ({@link OBStiiksClient}) and the typed
 * request surface ({@link Resources}), and orchestrates the lifecycle of
 * optional third-party modules (e.g. Discord, Twitch)
 */
export class OBStiiks {
    /** Low-level connection wrapper: state machine, reconnection, raw OBS requests */
    public readonly client: OBStiiksClient;

    /** Typed, domain-scoped API surface (scenes, inputs, transitions, ...). */
    public readonly resources: Resources;

    /** Registered modules, keyed by their unique {@link OBStiiksModule.name}. */
    private readonly modules = new Map<string, OBStiiksModule>();

    /**
     * Creates a new instance of the OBStiiks SDK.
     * 
     * @param config Connection settings for the underlying OBS WebSocket.
     */
    constructor(config: Config) {
        this.client = new OBStiiksClient(config);
        this.resources = createResources(this.client.call)
    }

    /**
     * Registers a module and runs its `register()` hook.
     *
     * @param module The module instance to register.
     * @returns The current {@link OBStiiks} instance, for chaining.
     * @throws {Error} If a module with the same `name` is already registered.
     */
    public async addModule(module: OBStiiksModule): Promise<this> {
        if (this.modules.has(module.name))
            throw new Error(`Module with name "${module.name}" already exists.`);

        const context: ModuleContext = {
            client: this.client,
            resources: this.resources,
        };

        await module.register(context);
        this.modules.set(module.name, module);

        return this;
    }

    /**
     * Retrieves a previously registered module by its class, fully typed.
     *
     * @param moduleClass The class (constructor) of the module to look up.
     * @returns The matching module instance, or `undefined` if none is registered.
     *
     * @example
     * ```ts
     * sdk.getModule(TwitchModule)?.on('follow', (data) => { ... });
     * ```
     */
    public getModule<T extends OBStiiksModule>(
        moduleClass: new (...args: any[]) => T
    ): T | undefined {
        for (const module of this.modules.values()) {
            if (module instanceof moduleClass) {
                return module as T;
            }
        }

        return undefined;
    }

    /**
     * Connects to OBS, then runs `onConnect()` on every registered module.
     */
    public async connect(): Promise<void> {
        await this.client.connect();

        for (const module of this.modules.values()) {
            await module.onConnect?.();
        }
    }
    /**
     * Disconnects from OBS, then runs `onDisconnect()` on every registered module.
     */
    public async disconnect(): Promise<void> {
        for (const module of this.modules.values()) {
            await module.onDisconnect?.();
        }

        await this.client.disconnect();
    }
}