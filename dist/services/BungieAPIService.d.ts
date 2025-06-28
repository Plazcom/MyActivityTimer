export interface BungiePlayer {
    membershipId: string;
    membershipType: number;
    displayName: string;
    bungieGlobalDisplayName: string;
}
export interface Activity {
    activityId: string;
    activityType: string;
    activityName: string;
    startTime: string;
    duration?: number;
    isCompleted: boolean;
}
export declare class BungieAPIService {
    private apiKey;
    private apiClient;
    private readonly baseURL;
    constructor(apiKey: string);
    searchPlayer(displayName: string, membershipType?: number): Promise<BungiePlayer[]>;
    getPlayer(membershipType: string, membershipId: string): Promise<any>;
    getRecentActivities(membershipType: string, membershipId: string): Promise<Activity[]>;
    getCurrentActivity(membershipType: string, membershipId: string, characterId: string): Promise<Activity | null>;
    private getActivityDetails;
    private getActivityTypeName;
    private getActivityTypeByHash;
}
