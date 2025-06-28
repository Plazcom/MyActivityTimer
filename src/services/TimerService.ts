export interface Timer {
  id: string;
  activityType: string;
  startTime: Date;
  expectedDuration?: number; // en secondes
  isActive: boolean;
  currentTime: number; // temps écoulé en secondes
}

export interface TimerUpdate {
  timerId: string;
  currentTime: number;
  isActive: boolean;
  progress?: number; // pourcentage si expectedDuration est définie
}

export type TimerUpdateCallback = (update: TimerUpdate) => void;

export class TimerService {
  private timers: Map<string, Timer> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private updateCallbacks: TimerUpdateCallback[] = [];

  constructor(private updateIntervalMs: number = 1000) {}

  startTimer(activityType: string, expectedDuration?: number): Timer {
    const timer: Timer = {
      id: this.generateTimerId(),
      activityType,
      startTime: new Date(),
      expectedDuration,
      isActive: true,
      currentTime: 0
    };

    this.timers.set(timer.id, timer);
    
    console.log(`⏱️ Timer démarré pour ${activityType} (ID: ${timer.id})`);
    
    return timer;
  }

  stopTimer(timerId: string): { success: boolean; finalTime?: number; message: string } {
    const timer = this.timers.get(timerId);
    
    if (!timer) {
      return {
        success: false,
        message: `Timer avec l'ID ${timerId} introuvable`
      };
    }

    if (!timer.isActive) {
      return {
        success: false,
        finalTime: timer.currentTime,
        message: `Timer ${timerId} déjà arrêté`
      };
    }

    timer.isActive = false;
    const finalTime = this.calculateCurrentTime(timer);
    timer.currentTime = finalTime;

    console.log(`⏹️ Timer arrêté pour ${timer.activityType} (ID: ${timerId}), temps final: ${this.formatTime(finalTime)}`);

    return {
      success: true,
      finalTime,
      message: `Timer arrêté avec succès après ${this.formatTime(finalTime)}`
    };
  }

  getTimer(timerId: string): Timer | null {
    return this.timers.get(timerId) || null;
  }

  getActiveTimers(): Timer[] {
    return Array.from(this.timers.values()).filter(timer => timer.isActive);
  }

  getAllTimers(): Timer[] {
    return Array.from(this.timers.values());
  }

  deleteTimer(timerId: string): boolean {
    const deleted = this.timers.delete(timerId);
    if (deleted) {
      console.log(`🗑️ Timer supprimé (ID: ${timerId})`);
    }
    return deleted;
  }

  clearAllTimers(): void {
    const count = this.timers.size;
    this.timers.clear();
    console.log(`🧹 ${count} timer(s) supprimé(s)`);
  }

  startTimerUpdates(callback?: TimerUpdateCallback): void {
    if (callback) {
      this.updateCallbacks.push(callback);
    }

    if (this.updateInterval) {
      return; // Déjà démarré
    }

    this.updateInterval = setInterval(() => {
      this.updateActiveTimers();
    }, this.updateIntervalMs);

    console.log('🔄 Mises à jour des timers démarrées');
  }

  stopTimerUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏸️ Mises à jour des timers arrêtées');
    }
  }

  onTimerUpdate(callback: TimerUpdateCallback): void {
    this.updateCallbacks.push(callback);
  }

  // Méthodes utilitaires
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  getTimerProgress(timerId: string): number | null {
    const timer = this.timers.get(timerId);
    if (!timer || !timer.expectedDuration) {
      return null;
    }

    const currentTime = timer.isActive ? this.calculateCurrentTime(timer) : timer.currentTime;
    return Math.min((currentTime / timer.expectedDuration) * 100, 100);
  }

  // Durées typiques pour les activités Destiny 2
  static getTypicalDuration(activityType: string): number | undefined {
    const durations: { [key: string]: number } = {
      'Raid': 3600, // 1 heure
      'Donjons': 1800, // 30 minutes
      'Grève': 900, // 15 minutes
      'Grève Héroïque': 1200, // 20 minutes
      'Grève de maître-d\'œuvre': 1800, // 30 minutes
      'Grève de grand maître': 2700, // 45 minutes
      'JcJ': 600, // 10 minutes
      'Gambit': 900, // 15 minutes
      'Épreuve d\'Osiris': 420, // 7 minutes
      'Patrouille': 1800, // 30 minutes
      'Zone Mortelle': 300, // 5 minutes
      'Percée': 600, // 10 minutes
      'Contrôle': 720, // 12 minutes
      'Choc': 480, // 8 minutes
      'Élimination': 360, // 6 minutes
      'Survie': 480 // 8 minutes
    };

    return durations[activityType];
  }

  private generateTimerId(): string {
    return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateCurrentTime(timer: Timer): number {
    const now = new Date();
    const elapsedMs = now.getTime() - timer.startTime.getTime();
    return Math.floor(elapsedMs / 1000);
  }

  private updateActiveTimers(): void {
    for (const timer of this.timers.values()) {
      if (!timer.isActive) continue;

      const currentTime = this.calculateCurrentTime(timer);
      timer.currentTime = currentTime;

      const update: TimerUpdate = {
        timerId: timer.id,
        currentTime,
        isActive: timer.isActive,
        progress: timer.expectedDuration ? (currentTime / timer.expectedDuration) * 100 : undefined
      };

      // Notifier tous les callbacks
      this.updateCallbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('❌ Erreur dans un callback de mise à jour de timer:', error);
        }
      });
    }
  }
}
