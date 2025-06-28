// État de l'overlay
let timers = new Map();
let websocket = null;
let isVisible = true;

// Configuration
const config = {
    serverUrl: 'http://localhost:3000',
    updateInterval: 1000, // 1 seconde
    maxTimers: 5 // Nombre maximum de timers à afficher
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    connectWebSocket();
    setupEventListeners();
    
    // Démarrer la mise à jour de l'affichage
    setInterval(updateDisplay, 1000);
});

// Connexion WebSocket
function connectWebSocket() {
    try {
        websocket = new WebSocket('ws://localhost:3000');
        
        websocket.onopen = function() {
            console.log('Overlay WebSocket connecté');
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
            console.log('Overlay WebSocket fermé');
            
            // Tentative de reconnexion après 3 secondes
            setTimeout(() => {
                connectWebSocket();
            }, 3000);
        };
        
        websocket.onerror = function(error) {
            console.error('Erreur Overlay WebSocket:', error);
        };
    } catch (error) {
        console.error('Erreur lors de la connexion WebSocket:', error);
    }
}

// Gestion des messages WebSocket
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'TIMER_STARTED':
            addTimer(data.data);
            break;
            
        case 'TIMER_STOPPED':
            removeTimer(data.data.timerId);
            break;
            
        case 'TIMER_UPDATE':
            updateTimer(data.data);
            break;
            
        case 'ACTIVE_TIMERS':
            loadTimers(data.data);
            break;
            
        default:
            console.log('Message overlay non géré:', data);
    }
}

// Gestion des timers
function addTimer(timer) {
    timers.set(timer.id, timer);
    updateDisplay();
}

function removeTimer(timerId) {
    timers.delete(timerId);
    updateDisplay();
}

function updateTimer(timerUpdate) {
    const timer = timers.get(timerUpdate.timerId);
    if (timer) {
        timer.currentTime = timerUpdate.currentTime;
        timer.progress = timerUpdate.progress;
        // Pas besoin d'appeler updateDisplay ici car il est appelé par l'interval
    }
}

function loadTimers(timersList) {
    timers.clear();
    if (timersList && Array.isArray(timersList)) {
        timersList.forEach(timer => {
            timers.set(timer.id, timer);
        });
    }
    updateDisplay();
}

// Mise à jour de l'affichage
function updateDisplay() {
    const activeTimers = Array.from(timers.values()).filter(timer => timer.isActive);
    const overlay = document.getElementById('timerOverlay');
    
    if (activeTimers.length === 0) {
        showNoTimers();
    } else if (activeTimers.length === 1) {
        showSingleTimer(activeTimers[0]);
    } else {
        showMultipleTimers(activeTimers);
    }
    
    // Afficher l'overlay s'il y a des timers
    if (activeTimers.length > 0) {
        overlay.style.display = 'block';
    }
}

function showNoTimers() {
    const overlay = document.getElementById('timerOverlay');
    const singleTimer = document.getElementById('singleTimer');
    const multipleTimers = document.getElementById('multipleTimers');
    const noTimers = document.getElementById('noTimers');
    
    singleTimer.style.display = 'none';
    multipleTimers.style.display = 'none';
    noTimers.style.display = 'block';
    
    overlay.className = 'timer-overlay fade-in';
}

function showSingleTimer(timer) {
    const overlay = document.getElementById('timerOverlay');
    const singleTimer = document.getElementById('singleTimer');
    const multipleTimers = document.getElementById('multipleTimers');
    const noTimers = document.getElementById('noTimers');
    
    // Masquer les autres vues
    multipleTimers.style.display = 'none';
    noTimers.style.display = 'none';
    singleTimer.style.display = 'block';
    
    // Mettre à jour le contenu
    document.getElementById('singleTimerTitle').textContent = timer.activityType;
    document.getElementById('singleTimerDisplay').textContent = formatTime(timer.currentTime);
    
    // Gérer la barre de progression
    const progressContainer = document.getElementById('singleProgressContainer');
    const progressBar = document.getElementById('singleProgressBar');
    const timerInfo = document.getElementById('singleTimerInfo');
    
    if (timer.expectedDuration) {
        const progress = Math.min((timer.currentTime / timer.expectedDuration) * 100, 100);
        const remaining = Math.max(timer.expectedDuration - timer.currentTime, 0);
        
        progressContainer.style.display = 'block';
        timerInfo.style.display = 'flex';
        
        progressBar.style.width = `${progress}%`;
        document.getElementById('singleTimerRemaining').textContent = `Temps restant: ${formatTime(remaining)}`;
        document.getElementById('singleTimerPercentage').textContent = `${Math.floor(progress)}%`;
        
        // Appliquer les styles selon le progrès
        const timerDisplay = document.getElementById('singleTimerDisplay');
        const overlayElement = overlay;
        
        timerDisplay.className = 'timer-display';
        progressBar.className = 'progress-bar';
        overlayElement.className = 'timer-overlay active';
        
        if (progress > 90) {
            timerDisplay.classList.add('danger');
            progressBar.classList.add('danger');
            overlayElement.classList.add('danger');
        } else if (progress > 75) {
            timerDisplay.classList.add('warning');
            progressBar.classList.add('warning');
            overlayElement.classList.add('warning');
        }
    } else {
        progressContainer.style.display = 'none';
        timerInfo.style.display = 'none';
        overlay.className = 'timer-overlay active';
    }
}

function showMultipleTimers(timersList) {
    const overlay = document.getElementById('timerOverlay');
    const singleTimer = document.getElementById('singleTimer');
    const multipleTimers = document.getElementById('multipleTimers');
    const noTimers = document.getElementById('noTimers');
    
    // Masquer les autres vues
    singleTimer.style.display = 'none';
    noTimers.style.display = 'none';
    multipleTimers.style.display = 'block';
    
    // Limiter le nombre de timers affichés
    const displayTimers = timersList.slice(0, config.maxTimers);
    
    // Générer le HTML pour les timers multiples
    multipleTimers.innerHTML = displayTimers.map(timer => {
        const progress = timer.expectedDuration ? 
            Math.min((timer.currentTime / timer.expectedDuration) * 100, 100) : 0;
        const remaining = timer.expectedDuration ? 
            Math.max(timer.expectedDuration - timer.currentTime, 0) : 0;
        
        const progressClass = progress > 90 ? 'danger' : progress > 75 ? 'warning' : '';
        const displayClass = progress > 90 ? 'danger' : progress > 75 ? 'warning' : '';
        
        return `
            <div class="timer-item">
                <div class="timer-title">${timer.activityType}</div>
                <div class="timer-display ${displayClass}">${formatTime(timer.currentTime)}</div>
                ${timer.expectedDuration ? `
                    <div class="progress-container">
                        <div class="progress-bar ${progressClass}" style="width: ${progress}%"></div>
                    </div>
                    <div class="timer-info">
                        <span class="timer-remaining">${formatTime(remaining)}</span>
                        <span class="timer-percentage">${Math.floor(progress)}%</span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    overlay.className = 'timer-overlay active';
}

// Gestion des événements
function setupEventListeners() {
    // Écouter les messages depuis le processus principal d'Electron
    if (typeof window.electronAPI !== 'undefined') {
        // Configuration des événements Electron si nécessaire
    }
    
    // Gestion du redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        adjustOverlaySize();
    });
}

function adjustOverlaySize() {
    // Ajuster la taille de l'overlay en fonction du contenu
    const overlay = document.getElementById('timerOverlay');
    const container = document.querySelector('.overlay-container');
    
    if (overlay && container) {
        // Calcul automatique de la taille optimale
        const rect = overlay.getBoundingClientRect();
        if (rect.height > 0) {
            container.style.height = `${rect.height + 20}px`;
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

// Fonctions de contrôle de l'overlay
function show() {
    isVisible = true;
    document.getElementById('timerOverlay').style.display = 'block';
}

function hide() {
    isVisible = false;
    document.getElementById('timerOverlay').style.display = 'none';
}

function toggle() {
    if (isVisible) {
        hide();
    } else {
        show();
    }
    return isVisible;
}

// Récupération des timers actifs au démarrage
async function fetchInitialTimers() {
    try {
        const response = await fetch(`${config.serverUrl}/api/timers`);
        if (response.ok) {
            const timersList = await response.json();
            loadTimers(timersList);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des timers initiaux:', error);
    }
}

// Démarrer la récupération des timers
setTimeout(fetchInitialTimers, 1000);
