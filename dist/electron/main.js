"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
// Charger les variables d'environnement
require('dotenv').config();
// Configuration pour éviter les erreurs GPU
if (process.env.ELECTRON_DISABLE_GPU === 'true') {
    electron_1.app.commandLine.appendSwitch('--disable-gpu');
    electron_1.app.commandLine.appendSwitch('--disable-gpu-sandbox');
    console.log('🔧 GPU désactivé via configuration');
}
electron_1.app.commandLine.appendSwitch('--disable-software-rasterizer');
electron_1.app.commandLine.appendSwitch('--disable-background-timer-throttling');
electron_1.app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
electron_1.app.commandLine.appendSwitch('--disable-renderer-backgrounding');
electron_1.app.commandLine.appendSwitch('--disable-features', 'TranslateUI');
electron_1.app.commandLine.appendSwitch('--disable-ipc-flooding-protection');
// Réduire les erreurs de sécurité en mode développement
if (process.env.NODE_ENV === 'development') {
    electron_1.app.commandLine.appendSwitch('--ignore-certificate-errors');
    electron_1.app.commandLine.appendSwitch('--ignore-ssl-errors');
}
let mainWindow = null;
let overlayWindow = null;
const createMainWindow = () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
            offscreen: false
        },
        icon: path_1.default.join(__dirname, '../assets/icon.png'),
        title: 'Destiny 2 Overlay Timer - Configuration',
        show: false // Masquer jusqu'à ce que ready-to-show
    });
    // En développement, charger depuis le serveur local
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, 'index.html'));
    }
    // Afficher la fenêtre quand elle est prête
    mainWindow.once('ready-to-show', () => {
        if (mainWindow) {
            mainWindow.show();
            console.log('🖥️ Fenêtre principale affichée');
        }
    });
    // Ouvrir les outils développeur en mode dev
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};
const createOverlayWindow = () => {
    const primaryDisplay = electron_1.screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    overlayWindow = new electron_1.BrowserWindow({
        width: 400,
        height: 200,
        x: width - 420, // Positionner à droite
        y: 20, // En haut
        frame: false, // Pas de barre de titre
        alwaysOnTop: true, // Toujours au-dessus
        transparent: true, // Transparent
        skipTaskbar: true, // Ne pas apparaître dans la barre des tâches
        focusable: false, // Ne peut pas recevoir le focus
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
            offscreen: false
        },
        show: false // Caché par défaut
    });
    // Charger l'interface de l'overlay
    if (process.env.NODE_ENV === 'development') {
        overlayWindow.loadURL('http://localhost:3000/overlay');
    }
    else {
        overlayWindow.loadFile(path_1.default.join(__dirname, 'overlay.html'));
    }
    // Rendre la fenêtre cliquable à travers (passthrough)
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
};
// IPC Handlers
electron_1.ipcMain.handle('show-overlay', () => {
    if (overlayWindow) {
        overlayWindow.show();
        return true;
    }
    return false;
});
electron_1.ipcMain.handle('hide-overlay', () => {
    if (overlayWindow) {
        overlayWindow.hide();
        return true;
    }
    return false;
});
electron_1.ipcMain.handle('toggle-overlay', () => {
    if (overlayWindow) {
        if (overlayWindow.isVisible()) {
            overlayWindow.hide();
            return false;
        }
        else {
            overlayWindow.show();
            return true;
        }
    }
    return false;
});
electron_1.ipcMain.handle('set-overlay-position', (event, x, y) => {
    if (overlayWindow) {
        overlayWindow.setPosition(x, y);
        return true;
    }
    return false;
});
electron_1.ipcMain.handle('set-overlay-size', (event, width, height) => {
    if (overlayWindow) {
        overlayWindow.setSize(width, height);
        return true;
    }
    return false;
});
electron_1.ipcMain.handle('get-display-info', () => {
    const displays = electron_1.screen.getAllDisplays();
    return displays.map(display => ({
        id: display.id,
        bounds: display.bounds,
        workArea: display.workArea,
        scaleFactor: display.scaleFactor,
        rotation: display.rotation,
        touchSupport: display.touchSupport
    }));
});
// App Event Handlers
electron_1.app.whenReady().then(() => {
    createMainWindow();
    createOverlayWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    // Nettoyer les ressources si nécessaire
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close();
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
    }
});
// Empêcher la création de plusieurs instances
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        // Quelqu'un a essayé de lancer une seconde instance, on focus la fenêtre à la place
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
}
// Gestion des erreurs GPU et autres problèmes Electron
electron_1.app.on('gpu-process-crashed', (event, killed) => {
    console.log('⚠️ Processus GPU crashé, redémarrage automatique...');
    // L'application continue généralement de fonctionner avec le rendu logiciel
});
electron_1.app.on('renderer-process-crashed', (event, webContents, killed) => {
    console.log('⚠️ Processus de rendu crashé');
    // Recharger la fenêtre si nécessaire
    if (webContents && !webContents.isDestroyed()) {
        webContents.reload();
    }
});
electron_1.app.on('child-process-gone', (event, details) => {
    console.log('⚠️ Processus enfant arrêté:', details.type, details.reason);
});
// Désactiver l'accélération matérielle si des problèmes GPU persistent
if (process.argv.includes('--disable-hardware-acceleration')) {
    electron_1.app.disableHardwareAcceleration();
    console.log('🔧 Accélération matérielle désactivée');
}
