export interface Timer {
    id: string;
    activityType: string;
    startTime: Date;
    expectedDuration?: number;
    isActive: boolean;
    currentTime: number;
}
export interface TimerUpdate {
    timerId: string;
    currentTime: number;
    isActive: boolean;
    progress?: number;
}
export type TimerUpdateCallback = (update: TimerUpdate) => void;
export declare class TimerService {
    private updateIntervalMs;
    private timers;
    private updateInterval;
    private updateCallbacks;
    constructor(updateIntervalMs?: number);
    startTimer(activityType: string, expectedDuration?: number): Timer;
    stopTimer(timerId: string): {
        success: boolean;
        finalTime?: number;
        message: string;
    };
    getTimer(timerId: string): Timer | null;
    getActiveTimers(): Timer[];
    getAllTimers(): Timer[];
    deleteTimer(timerId: string): boolean;
    clearAllTimers(): void;
    startTimerUpdates(callback?: TimerUpdateCallback): void;
    stopTimerUpdates(): void;
    onTimerUpdate(callback: TimerUpdateCallback): void;
    formatTime(seconds: number): string;
    getTimerProgress(timerId: string): number | null;
    static getTypicalDuration(activityType: string): number | undefined;
    private generateTimerId;
    private calculateCurrentTime;
    private updateActiveTimers;
}
