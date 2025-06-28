"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimerService = void 0;
class TimerService {
    constructor(updateIntervalMs = 1000) {
        this.updateIntervalMs = updateIntervalMs;
        this.timers = new Map();
        this.updateInterval = null;
        this.updateCallbacks = [];
    }
    startTimer(activityType, expectedDuration) {
        const timer = {
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
    stopTimer(timerId) {
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
    getTimer(timerId) {
        return this.timers.get(timerId) || null;
    }
    getActiveTimers() {
        return Array.from(this.timers.values()).filter(timer => timer.isActive);
    }
    getAllTimers() {
        return Array.from(this.timers.values());
    }
    deleteTimer(timerId) {
        const deleted = this.timers.delete(timerId);
        if (deleted) {
            console.log(`🗑️ Timer supprimé (ID: ${timerId})`);
        }
        return deleted;
    }
    clearAllTimers() {
        const count = this.timers.size;
        this.timers.clear();
        console.log(`🧹 ${count} timer(s) supprimé(s)`);
    }
    startTimerUpdates(callback) {
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
    stopTimerUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏸️ Mises à jour des timers arrêtées');
        }
    }
    onTimerUpdate(callback) {
        this.updateCallbacks.push(callback);
    }
    // Méthodes utilitaires
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }
    getTimerProgress(timerId) {
        const timer = this.timers.get(timerId);
        if (!timer || !timer.expectedDuration) {
            return null;
        }
        const currentTime = timer.isActive ? this.calculateCurrentTime(timer) : timer.currentTime;
        return Math.min((currentTime / timer.expectedDuration) * 100, 100);
    }
    // Durées typiques pour les activités Destiny 2
    static getTypicalDuration(activityType) {
        const durations = {
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
    generateTimerId() {
        return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    calculateCurrentTime(timer) {
        const now = new Date();
        const elapsedMs = now.getTime() - timer.startTime.getTime();
        return Math.floor(elapsedMs / 1000);
    }
    updateActiveTimers() {
        for (const timer of this.timers.values()) {
            if (!timer.isActive)
                continue;
            const currentTime = this.calculateCurrentTime(timer);
            timer.currentTime = currentTime;
            const update = {
                timerId: timer.id,
                currentTime,
                isActive: timer.isActive,
                progress: timer.expectedDuration ? (currentTime / timer.expectedDuration) * 100 : undefined
            };
            // Notifier tous les callbacks
            this.updateCallbacks.forEach(callback => {
                try {
                    callback(update);
                }
                catch (error) {
                    console.error('❌ Erreur dans un callback de mise à jour de timer:', error);
                }
            });
        }
    }
}
exports.TimerService = TimerService;
