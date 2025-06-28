import { BungieAPIService, Activity } from './BungieAPIService';
export interface PlayerTrackingConfig {
    membershipType: string;
    membershipId: string;
    characterId: string;
    checkInterval: number;
}
export interface ActivityChangeEvent {
    previousActivity: Activity | null;
    currentActivity: Activity | null;
    timestamp: string;
}
export declare class ActivityTracker {
    private bungieAPI;
    private trackingConfigs;
    private currentActivities;
    private intervals;
    private listeners;
    constructor(bungieAPI: BungieAPIService);
    addPlayer(playerId: string, config: PlayerTrackingConfig): void;
    removePlayer(playerId: string): void;
    onActivityChange(listener: (event: ActivityChangeEvent) => void): void;
    startTracking(): void;
    stopTracking(): void;
    getCurrentActivity(playerId: string): Activity | null;
    getAllCurrentActivities(): Map<string, Activity | null>;
    private startPlayerTracking;
    private checkPlayerActivity;
    private hasActivityChanged;
    private notifyActivityChange;
    getTrackingStatus(): {
        [playerId: string]: {
            config: PlayerTrackingConfig;
            currentActivity: Activity | null;
            isTracking: boolean;
        };
    };
}
