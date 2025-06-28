declare function connectWebSocket(): void;
declare function connectWebSocket(): void;
declare function handleWebSocketMessage(data: any): void;
declare function handleWebSocketMessage(data: any): void;
declare function addTimer(timer: any): void;
declare function removeTimer(timerId: any): void;
declare function updateTimer(timerUpdate: any): void;
declare function loadTimers(timersList: any): void;
declare function updateDisplay(): void;
declare function showNoTimers(): void;
declare function showSingleTimer(timer: any): void;
declare function showMultipleTimers(timersList: any): void;
declare function setupEventListeners(): void;
declare function adjustOverlaySize(): void;
declare function formatTime(seconds: any): string;
declare function formatTime(seconds: any): string;
declare function show(): void;
declare function hide(): void;
declare function toggle(): boolean;
declare function fetchInitialTimers(): Promise<void>;
declare let timers: Map<any, any>;
declare let websocket: null;
declare let isVisible: boolean;
declare namespace config {
    let serverUrl: string;
    let updateInterval: number;
    let maxTimers: number;
}
