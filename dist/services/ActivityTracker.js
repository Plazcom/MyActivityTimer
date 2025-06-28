"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTracker = void 0;
class ActivityTracker {
    constructor(bungieAPI) {
        this.bungieAPI = bungieAPI;
        this.trackingConfigs = new Map();
        this.currentActivities = new Map();
        this.intervals = new Map();
        this.listeners = [];
    }
    addPlayer(playerId, config) {
        this.trackingConfigs.set(playerId, config);
        this.currentActivities.set(playerId, null);
        // Démarrer le suivi pour ce joueur
        this.startPlayerTracking(playerId);
    }
    removePlayer(playerId) {
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
    onActivityChange(listener) {
        this.listeners.push(listener);
    }
    startTracking() {
        console.log('🎯 Démarrage du suivi des activités...');
        // Démarrer le suivi pour tous les joueurs configurés
        for (const [playerId] of this.trackingConfigs) {
            this.startPlayerTracking(playerId);
        }
    }
    stopTracking() {
        console.log('⏹️ Arrêt du suivi des activités...');
        // Arrêter tous les intervals
        for (const [playerId, interval] of this.intervals) {
            clearInterval(interval);
        }
        this.intervals.clear();
    }
    getCurrentActivity(playerId) {
        return this.currentActivities.get(playerId) || null;
    }
    getAllCurrentActivities() {
        return new Map(this.currentActivities);
    }
    startPlayerTracking(playerId) {
        const config = this.trackingConfigs.get(playerId);
        if (!config)
            return;
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
    async checkPlayerActivity(playerId) {
        try {
            const config = this.trackingConfigs.get(playerId);
            if (!config)
                return;
            const currentActivity = await this.bungieAPI.getCurrentActivity(config.membershipType, config.membershipId, config.characterId) ?? null;
            const previousActivity = this.currentActivities.get(playerId) ?? null;
            // Vérifier s'il y a eu un changement d'activité
            if (this.hasActivityChanged(previousActivity, currentActivity)) {
                this.currentActivities.set(playerId, currentActivity);
                const changeEvent = {
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
        }
        catch (error) {
            console.error(`❌ Erreur lors du suivi de l'activité pour ${playerId}:`, error);
        }
    }
    hasActivityChanged(previous, current) {
        // Si les deux sont null, pas de changement
        if (!previous && !current)
            return false;
        // Si l'un est null et l'autre non, il y a changement
        if (!previous || !current)
            return true;
        // Comparer les IDs d'activité
        return previous.activityId !== current.activityId;
    }
    notifyActivityChange(event) {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            }
            catch (error) {
                console.error('❌ Erreur dans un listener de changement d\'activité:', error);
            }
        });
    }
    // Méthodes utilitaires pour le debugging
    getTrackingStatus() {
        const status = {};
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
exports.ActivityTracker = ActivityTracker;
