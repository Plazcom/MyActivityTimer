declare function saveConfig(): void;
declare function loadConfig(): void;
declare function updateUI(): void;
declare function testConnection(): Promise<void>;
declare function startTimer(): Promise<void>;
declare function stopTimer(timerId: any): Promise<void>;
declare function refreshTimers(): Promise<void>;
declare function updateTimersDisplay(timersList: any): void;
declare function showOverlay(): Promise<void>;
declare function hideOverlay(): Promise<void>;
declare function toggleOverlay(): Promise<void>;
declare function connectWebSocket(): void;
declare function connectWebSocket(): void;
declare function handleWebSocketMessage(data: any): void;
declare function handleWebSocketMessage(data: any): void;
declare function updateSingleTimer(timerUpdate: any): void;
declare function formatTime(seconds: any): string;
declare function formatTime(seconds: any): string;
declare function showStatus(message: any, type?: string): void;
declare function updateAPIStatus(connected: any): void;
declare namespace config {
    let apiKey: string;
    let membershipType: string;
    let membershipId: string;
    let serverUrl: string;
}
declare let websocket: null;
declare let timers: Map<any, any>;
declare let isConnected: boolean;
