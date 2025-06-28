import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';
import { BungieAPIService } from './services/BungieAPIService';
import { ActivityTracker } from './services/ActivityTracker';
import { TimerService } from './services/TimerService';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Services
const bungieAPI = new BungieAPIService(process.env.BUNGIE_API_KEY || '');
const activityTracker = new ActivityTracker(bungieAPI);
const timerService = new TimerService();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/player/:membershipType/:membershipId', async (req, res) => {
  try {
    const { membershipType, membershipId } = req.params;
    const playerData = await bungieAPI.getPlayer(membershipType, membershipId);
    res.json(playerData);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des données du joueur' });
  }
});

app.get('/api/activities/:membershipType/:membershipId', async (req, res) => {
  try {
    const { membershipType, membershipId } = req.params;
    const activities = await bungieAPI.getRecentActivities(membershipType, membershipId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des activités' });
  }
});

app.post('/api/timer/start', (req, res) => {
  const { activityType, expectedDuration } = req.body;
  const timer = timerService.startTimer(activityType, expectedDuration);
  
  // Diffuser le nouveau timer via WebSocket
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'TIMER_STARTED',
        data: timer
      }));
    }
  });
  
  res.json(timer);
});

app.post('/api/timer/stop/:timerId', (req, res) => {
  const { timerId } = req.params;
  const result = timerService.stopTimer(timerId);
  
  // Diffuser l'arrêt du timer via WebSocket
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'TIMER_STOPPED',
        data: { timerId, result }
      }));
    }
  });
  
  res.json(result);
});

app.get('/api/timers', (req, res) => {
  const timers = timerService.getActiveTimers();
  res.json(timers);
});

// WebSocket pour les mises à jour en temps réel
wss.on('connection', (ws) => {
  console.log('Nouvelle connexion WebSocket');
  
  // Envoyer les timers actifs au nouveau client
  const activeTimers = timerService.getActiveTimers();
  ws.send(JSON.stringify({
    type: 'ACTIVE_TIMERS',
    data: activeTimers
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Message reçu:', data);
      
      // Traiter les messages du client si nécessaire
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (error) {
      console.error('Erreur lors du parsing du message WebSocket:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Connexion WebSocket fermée');
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur API Destiny 2 démarré sur le port ${PORT}`);
  console.log(`📊 WebSocket disponible sur ws://localhost:${PORT}`);
  
  // Démarrer le suivi automatique des activités
  activityTracker.startTracking();
  
  // Démarrer les mises à jour des timers
  timerService.startTimerUpdates((update) => {
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'TIMER_UPDATE',
          data: update
        }));
      }
    });
  });
});

export default app;
