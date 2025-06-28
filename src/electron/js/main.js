// Configuration et état de l'application
let config = {
    apiKey: '',
    membershipType: '3', // Steam par défaut
    membershipId: '',
    serverUrl: 'http://localhost:3000'
};

let websocket = null;
let timers = new Map();
let isConnected = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadConfig();
    connectWebSocket();
    refreshTimers();
    
    // Charger les données depuis localStorage si disponibles
    const savedConfig = localStorage.getItem('destiny2-config');
    if (savedConfig) {
        try {
            config = { ...config, ...JSON.parse(savedConfig) };
            updateUI();
        } catch (e) {
            console.error('Erreur lors du chargement de la configuration:', e);
        }
    }
});

// Gestion de la configuration
function saveConfig() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const membershipType = document.getElementById('membershipType').value;
    const membershipId = document.getElementById('membershipId').value.trim();
    
    if (!apiKey) {
        showStatus('Veuillez entrer une clé API valide', 'error');
        return;
    }
    
    if (!membershipId) {
        showStatus('Veuillez entrer votre ID de compte', 'error');
        return;
    }
    
    config.apiKey = apiKey;
    config.membershipType = membershipType;
    config.membershipId = membershipId;
    
    // Sauvegarder dans localStorage
    localStorage.setItem('destiny2-config', JSON.stringify(config));
    
    showStatus('Configuration sauvegardée avec succès!', 'success');
    
    // Tester la connexion automatiquement
    setTimeout(() => {
        testConnection();
    }, 1000);
}

function loadConfig() {
    const saved = localStorage.getItem('destiny2-config');
    if (saved) {
        try {
            config = { ...config, ...JSON.parse(saved) };
            updateUI();
        } catch (e) {
            console.error('Erreur lors du chargement de la configuration:', e);
        }
    }
}

function updateUI() {
    if (config.apiKey) {
        document.getElementById('apiKey').value = config.apiKey;
    }
    document.getElementById('membershipType').value = config.membershipType;
    if (config.membershipId) {
        document.getElementById('membershipId').value = config.membershipId;
    }
}

// Test de connexion à l'API
async function testConnection() {
    if (!config.apiKey || !config.membershipId) {
        showStatus('Veuillez d\'abord configurer votre API', 'error');
        return;
    }
    
    try {
        showStatus('Test de connexion en cours...', 'info');
        
        const response = await fetch(`${config.serverUrl}/api/player/${config.membershipType}/${config.membershipId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            showStatus('Connexion réussie! Profil récupéré.', 'success');
            updateAPIStatus(true);
            console.log('Données du profil:', data);
        } else {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showStatus('Erreur de connexion à l\'API Bungie', 'error');
        updateAPIStatus(false);
    }
}

// Gestion des timers
async function startTimer() {
    const activityType = document.getElementById('activityType').value;
    const expectedDurationInput = document.getElementById('expectedDuration').value;
    const expectedDuration = expectedDurationInput ? parseInt(expectedDurationInput) * 60 : undefined;
    
    try {
        const response = await fetch(`${config.serverUrl}/api/timer/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activityType,
                expectedDuration
            })
        });
        
        if (response.ok) {
            const timer = await response.json();
            showStatus(`Timer démarré pour ${activityType}`, 'success');
            
            // Réinitialiser le formulaire
            document.getElementById('expectedDuration').value = '';
            
            // Rafraîchir la liste des timers
            setTimeout(refreshTimers, 500);
        } else {
            throw new Error('Erreur lors du démarrage du timer');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showStatus('Erreur lors du démarrage du timer', 'error');
    }
}

async function stopTimer(timerId) {
    try {
        const response = await fetch(`${config.serverUrl}/api/timer/stop/${timerId}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.json();
            showStatus(result.message, 'success');
            refreshTimers();
        } else {
            throw new Error('Erreur lors de l\'arrêt du timer');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showStatus('Erreur lors de l\'arrêt du timer', 'error');
    }
}

async function refreshTimers() {
    try {
        const response = await fetch(`${config.serverUrl}/api/timers`);
        
        if (response.ok) {
            const timersList = await response.json();
            updateTimersDisplay(timersList);
        } else {
            console.error('Erreur lors de la récupération des timers');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function updateTimersDisplay(timersList) {
    const container = document.getElementById('timersList');
    
    if (!timersList || timersList.length === 0) {
        container.innerHTML = '<div class="no-timers">Aucun timer actif</div>';
        return;
    }
    
    container.innerHTML = timersList.map(timer => {
        const progress = timer.expectedDuration ? 
            Math.min((timer.currentTime / timer.expectedDuration) * 100, 100) : 0;
        
        const progressClass = progress > 80 ? 'danger' : progress > 60 ? 'warning' : '';
        
        return `
            <div class="timer-card ${progressClass}">
                <h3>${timer.activityType}</h3>
                <div class="timer-display">${formatTime(timer.currentTime)}</div>
                ${timer.expectedDuration ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="timer-info">
                        <span>Restant: ${formatTime(timer.expectedDuration - timer.currentTime)}</span>
                        <span>${Math.floor(progress)}%</span>
                    </div>
                ` : ''}
                <div style="margin-top: 10px;">
                    <button class="btn" onclick="stopTimer('${timer.id}')">⏹️ Arrêter</button>
                </div>
            </div>
        `;
    }).join('');
}

// Gestion de l'overlay
async function showOverlay() {
    if (typeof window.electronAPI !== 'undefined') {
        const result = await window.electronAPI.invoke('show-overlay');
        if (result) {
            showStatus('Overlay affiché', 'success');
        }
    } else {
        showStatus('Fonction disponible uniquement dans l\'application Electron', 'error');
    }
}

async function hideOverlay() {
    if (typeof window.electronAPI !== 'undefined') {
        const result = await window.electronAPI.invoke('hide-overlay');
        if (result) {
            showStatus('Overlay masqué', 'success');
        }
    } else {
        showStatus('Fonction disponible uniquement dans l\'application Electron', 'error');
    }
}

async function toggleOverlay() {
    if (typeof window.electronAPI !== 'undefined') {
        const isVisible = await window.electronAPI.invoke('toggle-overlay');
        showStatus(isVisible ? 'Overlay affiché' : 'Overlay masqué', 'success');
    } else {
        showStatus('Fonction disponible uniquement dans l\'application Electron', 'error');
    }
}

// WebSocket pour les mises à jour en temps réel
function connectWebSocket() {
    try {
        websocket = new WebSocket('ws://localhost:3000');
        
        websocket.onopen = function() {
            console.log('WebSocket connecté');
            updateAPIStatus(true);
        };
        
        websocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (e) {
                console.error('Erreur parsing WebSocket message:', e);
            }
        };
        
        websocket.onclose = function() {
            console.log('WebSocket fermé');
            updateAPIStatus(false);
            
            // Tentative de reconnexion après 5 secondes
            setTimeout(() => {
                if (!isConnected) {
                    connectWebSocket();
                }
            }, 5000);
        };
        
        websocket.onerror = function(error) {
            console.error('Erreur WebSocket:', error);
            updateAPIStatus(false);
        };
    } catch (error) {
        console.error('Erreur lors de la connexion WebSocket:', error);
        updateAPIStatus(false);
    }
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'TIMER_STARTED':
            console.log('Nouveau timer démarré:', data.data);
            refreshTimers();
            break;
            
        case 'TIMER_STOPPED':
            console.log('Timer arrêté:', data.data);
            refreshTimers();
            break;
            
        case 'TIMER_UPDATE':
            // Mettre à jour l'affichage du timer sans recharger toute la liste
            updateSingleTimer(data.data);
            break;
            
        case 'ACTIVE_TIMERS':
            updateTimersDisplay(data.data);
            break;
            
        default:
            console.log('Message WebSocket non géré:', data);
    }
}

function updateSingleTimer(timerUpdate) {
    // Mettre à jour un timer spécifique dans l'affichage
    const timerCard = document.querySelector(`[data-timer-id="${timerUpdate.timerId}"]`);
    if (timerCard) {
        const timeDisplay = timerCard.querySelector('.timer-display');
        if (timeDisplay) {
            timeDisplay.textContent = formatTime(timerUpdate.currentTime);
        }
        
        if (timerUpdate.progress !== undefined) {
            const progressFill = timerCard.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${Math.min(timerUpdate.progress, 100)}%`;
            }
        }
    }
}

// Fonctions utilitaires
function formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
    
    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
}

function updateAPIStatus(connected) {
    isConnected = connected;
    const indicator = document.getElementById('apiStatus');
    const text = document.getElementById('apiStatusText');
    
    if (connected) {
        indicator.classList.add('connected');
        text.textContent = 'Connecté';
    } else {
        indicator.classList.remove('connected');
        text.textContent = 'Déconnecté';
    }
}

// Actualisation automatique des timers
setInterval(refreshTimers, 5000); // Actualiser toutes les 5 secondes
