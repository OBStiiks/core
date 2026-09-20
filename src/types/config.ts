export interface Config {
    host: string;
    port: number;
    password?: string;
    autoReconnect?: boolean;
    reconnectInterval?: number;
}
