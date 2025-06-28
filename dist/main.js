"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const BungieAPIService_1 = require("./services/BungieAPIService");
const ActivityTracker_1 = require("./services/ActivityTracker");
const TimerService_1 = require("./services/TimerService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Vérification de la clé API
const apiKey = process.env.BUNGIE_API_KEY;
if (!apiKey) {
    console.error('❌ ERREUR: Clé API Bungie manquante ! Vérifiez votre fichier .env');
    process.exit(1);
}
console.log(`🔑 Clé API Bungie chargée: ${apiKey.substring(0, 8)}...`);
// Services
const bungieAPI = new BungieAPIService_1.BungieAPIService(apiKey);
const activityTracker = new ActivityTracker_1.ActivityTracker(bungieAPI);
const timerService = new TimerService_1.TimerService();
// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Test de la clé API
app.get('/api/test', async (req, res) => {
    try {
        console.log('🧪 Test de la clé API...');
        const response = await bungieAPI.searchPlayer('test', 3); // Test avec un nom bidon
        res.json({
            status: 'API_OK',
            message: 'Clé API fonctionnelle',
            apiKey: apiKey.substring(0, 8) + '...'
        });
    }
    catch (error) {
        console.error('❌ Test API échoué:', error.message);
        res.status(500).json({
            status: 'API_ERROR',
            error: error.message,
            apiKey: apiKey.substring(0, 8) + '...'
        });
    }
});
app.get('/api/player/:membershipType/:membershipId', async (req, res) => {
    try {
        const { membershipType, membershipId } = req.params;
        const playerData = await bungieAPI.getPlayer(membershipType, membershipId);
        res.json(playerData);
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données du joueur' });
    }
});
app.get('/api/activities/:membershipType/:membershipId', async (req, res) => {
    try {
        const { membershipType, membershipId } = req.params;
        const activities = await bungieAPI.getRecentActivities(membershipType, membershipId);
        res.json(activities);
    }
    catch (error) {
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
        }
        catch (error) {
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
exports.default = app;
