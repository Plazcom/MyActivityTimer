import { BungieAPIService, Activity } from './BungieAPIService';

export interface PlayerTrackingConfig {
  membershipType: string;
  membershipId: string;
  characterId: string;
  checkInterval: number; // en millisecondes
}

export interface ActivityChangeEvent {
  previousActivity: Activity | null;
  currentActivity: Activity | null;
  timestamp: string;
}

export class ActivityTracker {
  private trackingConfigs: Map<string, PlayerTrackingConfig> = new Map();
  private currentActivities: Map<string, Activity | null> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Array<(event: ActivityChangeEvent) => void> = [];

  constructor(private bungieAPI: BungieAPIService) {}

  addPlayer(playerId: string, config: PlayerTrackingConfig): void {
    this.trackingConfigs.set(playerId, config);
    this.currentActivities.set(playerId, null);
    
    // Démarrer le suivi pour ce joueur
    this.startPlayerTracking(playerId);
  }

  removePlayer(playerId: string): void {
    // Arrêter le suivi
    const interval = this.intervals.get(playerId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(playerId);
    }
    
    // Nettoyer les données
    this.trackingConfigs.delete(playerId);
    this.currentActivities.delete(playerId);
  }

  onActivityChange(listener: (event: ActivityChangeEvent) => void): void {
    this.listeners.push(listener);
  }

  startTracking(): void {
    console.log('🎯 Démarrage du suivi des activités...');
    
    // Démarrer le suivi pour tous les joueurs configurés
    for (const [playerId] of this.trackingConfigs) {
      this.startPlayerTracking(playerId);
    }
  }

  stopTracking(): void {
    console.log('⏹️ Arrêt du suivi des activités...');
    
    // Arrêter tous les intervals
    for (const [playerId, interval] of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }

  getCurrentActivity(playerId: string): Activity | null {
    return this.currentActivities.get(playerId) || null;
  }

  getAllCurrentActivities(): Map<string, Activity | null> {
    return new Map(this.currentActivities);
  }

  private startPlayerTracking(playerId: string): void {
    const config = this.trackingConfigs.get(playerId);
    if (!config) return;

    // Arrêter un éventuel suivi précédent
    const existingInterval = this.intervals.get(playerId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Démarrer le nouveau suivi
    const interval = setInterval(async () => {
      await this.checkPlayerActivity(playerId);
    }, config.checkInterval);

    this.intervals.set(playerId, interval);
    
    // Faire un premier check immédiatement
    this.checkPlayerActivity(playerId);
  }

  private async checkPlayerActivity(playerId: string): Promise<void> {
    try {
      const config = this.trackingConfigs.get(playerId);
      if (!config) return;

      const currentActivity = await this.bungieAPI.getCurrentActivity(
        config.membershipType,
        config.membershipId,
        config.characterId
      );

      const previousActivity = this.currentActivities.get(playerId);
      
      // Vérifier s'il y a eu un changement d'activité
      if (this.hasActivityChanged(previousActivity, currentActivity)) {
        this.currentActivities.set(playerId, currentActivity);
        
        const changeEvent: ActivityChangeEvent = {
          previousActivity,
          currentActivity,
          timestamp: new Date().toISOString()
        };

        // Notifier tous les listeners
        this.notifyActivityChange(changeEvent);
        
        console.log(`🔄 Changement d'activité détecté pour ${playerId}:`, {
          previous: previousActivity?.activityName || 'Aucune',
          current: currentActivity?.activityName || 'Aucune'
        });
      }
    } catch (error) {
      console.error(`❌ Erreur lors du suivi de l'activité pour ${playerId}:`, error);
    }
  }

  private hasActivityChanged(previous: Activity | null, current: Activity | null): boolean {
    // Si les deux sont null, pas de changement
    if (!previous && !current) return false;
    
    // Si l'un est null et l'autre non, il y a changement
    if (!previous || !current) return true;
    
    // Comparer les IDs d'activité
    return previous.activityId !== current.activityId;
  }

  private notifyActivityChange(event: ActivityChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('❌ Erreur dans un listener de changement d\'activité:', error);
      }
    });
  }

  // Méthodes utilitaires pour le debugging
  getTrackingStatus(): { [playerId: string]: { 
    config: PlayerTrackingConfig, 
    currentActivity: Activity | null,
    isTracking: boolean 
  }} {
    const status: any = {};
    
    for (const [playerId, config] of this.trackingConfigs) {
      status[playerId] = {
        config,
        currentActivity: this.currentActivities.get(playerId) || null,
        isTracking: this.intervals.has(playerId)
      };
    }
    
    return status;
  }
}
