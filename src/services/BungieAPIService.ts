import axios, { AxiosInstance } from 'axios';

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

export class BungieAPIService {
  private apiClient: AxiosInstance;
  private readonly baseURL = 'https://www.bungie.net/Platform';

  constructor(private apiKey: string) {
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async searchPlayer(displayName: string, membershipType?: number): Promise<BungiePlayer[]> {
    try {
      const response = await this.apiClient.post('/Destiny2/SearchDestinyPlayer/', {
        displayName,
        membershipType: membershipType || -1 // -1 pour tous les types
      });

      if (response.data.ErrorCode !== 1) {
        throw new Error(`Erreur API Bungie: ${response.data.Message}`);
      }

      return response.data.Response.map((player: any) => ({
        membershipId: player.membershipId,
        membershipType: player.membershipType,
        displayName: player.displayName,
        bungieGlobalDisplayName: player.bungieGlobalDisplayName
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche du joueur:', error);
      throw error;
    }
  }

  async getPlayer(membershipType: string, membershipId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200`
      );

      if (response.data.ErrorCode !== 1) {
        throw new Error(`Erreur API Bungie: ${response.data.Message}`);
      }

      return response.data.Response;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  async getRecentActivities(membershipType: string, membershipId: string): Promise<Activity[]> {
    try {
      const response = await this.apiClient.get(
        `/Destiny2/${membershipType}/Account/${membershipId}/Character/0/Stats/Activities/?count=10&mode=0`
      );

      if (response.data.ErrorCode !== 1) {
        throw new Error(`Erreur API Bungie: ${response.data.Message}`);
      }

      const activities = response.data.Response.activities || [];
      
      return activities.map((activity: any) => ({
        activityId: activity.activityDetails.instanceId,
        activityType: this.getActivityTypeName(activity.activityDetails.mode),
        activityName: activity.activityDetails.referenceId,
        startTime: activity.period,
        duration: activity.activityDetails.activityDurationSeconds,
        isCompleted: activity.values.completed?.basic?.value === 1
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      return [];
    }
  }

  async getCurrentActivity(membershipType: string, membershipId: string, characterId: string): Promise<Activity | null> {
    try {
      const response = await this.apiClient.get(
        `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=204`
      );

      if (response.data.ErrorCode !== 1 || !response.data.Response.activities?.data) {
        return null;
      }

      const currentActivity = response.data.Response.activities.data.currentActivityHash;
      if (!currentActivity) {
        return null;
      }

      // Récupérer les détails de l'activité depuis le manifest
      const activityDetails = await this.getActivityDetails(currentActivity);
      
      return {
        activityId: currentActivity.toString(),
        activityType: activityDetails?.activityTypeName || 'Inconnue',
        activityName: activityDetails?.displayProperties?.name || 'Activité inconnue',
        startTime: new Date().toISOString(),
        isCompleted: false
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'activité actuelle:', error);
      return null;
    }
  }

  private async getActivityDetails(activityHash: number): Promise<any> {
    try {
      // Cette fonction nécessiterait le manifest Destiny 2 pour fonctionner complètement
      // Pour l'instant, on retourne des données par défaut
      return {
        activityTypeName: this.getActivityTypeByHash(activityHash),
        displayProperties: {
          name: `Activité ${activityHash}`
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'activité:', error);
      return null;
    }
  }

  private getActivityTypeName(mode: number): string {
    const activityTypes: { [key: number]: string } = {
      0: 'Aucune',
      2: 'Histoire',
      3: 'Grève',
      4: 'Raid',
      5: 'JcJ',
      6: 'Patrouille',
      7: 'JcJ Privé',
      9: 'Réservé9',
      10: 'Contrôle',
      11: 'Réservé11',
      12: 'Choc',
      13: 'Réservé13',
      15: 'Zone Mortelle',
      16: 'Doublons',
      17: 'Réservé17',
      18: 'Tous les modes JcJ',
      19: 'Percée',
      20: 'Réservé20',
      21: 'Réservé21',
      22: 'Réservé22',
      24: 'Réserve de fer',
      25: 'Réservé25',
      26: 'Réservé26',
      27: 'Réservé27',
      28: 'Réservé28',
      29: 'Réservé29',
      30: 'Réservé30',
      31: 'Suprématie',
      32: 'JcJ Privé Tous les modes',
      37: 'Survie',
      38: 'Compte à rebours',
      39: 'Traque',
      40: 'Élimination',
      41: 'Épreuve d\'Osiris',
      42: 'Épreuve d\'Osiris Tous les modes',
      43: 'JcJ Compétitif',
      44: 'JcJ Rapide',
      45: 'Chasse au trésor',
      46: 'Collecte',
      47: 'Survie Compétitif',
      48: 'Contrôle Compétitif',
      49: 'Éclipse',
      50: 'Éclipse Compétitive',
      51: 'Saisons Épreuve d\'Osiris',
      59: 'PvEvP',
      60: 'Momentum',
      61: 'Momentum Contrôle',
      62: 'Zone de guerre freelance',
      63: 'Contrôle freelance',
      64: 'Éclipse freelance',
      65: 'Grève de maître-d\'œuvre',
      66: 'Raid de maître-d\'œuvre',
      67: 'Donjons',
      68: 'Donjons de maître-d\'œuvre',
      69: 'Grève de grand maître'
    };

    return activityTypes[mode] || `Mode ${mode}`;
  }

  private getActivityTypeByHash(hash: number): string {
    // Mapping basique des hashes d'activité les plus communs
    // Dans une implémentation complète, ceci utiliserait le manifest
    const commonActivities: { [key: number]: string } = {
      2394244350: 'Raid',
      1164760504: 'Grève',
      1164760505: 'Grève Héroïque',
      4110605575: 'JcJ',
      1673326313: 'Gambit'
    };

    return commonActivities[hash] || 'Activité';
  }
}
