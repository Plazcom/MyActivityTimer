import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

const createMainWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Destiny 2 Overlay Timer - Configuration'
  });

  // En développement, charger depuis le serveur local
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Ouvrir les outils développeur en mode dev
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createOverlayWindow = (): void => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
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
      enableRemoteModule: true
    },
    show: false // Caché par défaut
  });

  // Charger l'interface de l'overlay
  if (process.env.NODE_ENV === 'development') {
    overlayWindow.loadURL('http://localhost:3000/overlay');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/overlay.html'));
  }

  // Rendre la fenêtre cliquable à travers (passthrough)
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
};

// IPC Handlers
ipcMain.handle('show-overlay', () => {
  if (overlayWindow) {
    overlayWindow.show();
    return true;
  }
  return false;
});

ipcMain.handle('hide-overlay', () => {
  if (overlayWindow) {
    overlayWindow.hide();
    return true;
  }
  return false;
});

ipcMain.handle('toggle-overlay', () => {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
      return false;
    } else {
      overlayWindow.show();
      return true;
    }
  }
  return false;
});

ipcMain.handle('set-overlay-position', (event, x: number, y: number) => {
  if (overlayWindow) {
    overlayWindow.setPosition(x, y);
    return true;
  }
  return false;
});

ipcMain.handle('set-overlay-size', (event, width: number, height: number) => {
  if (overlayWindow) {
    overlayWindow.setSize(width, height);
    return true;
  }
  return false;
});

ipcMain.handle('get-display-info', () => {
  const displays = screen.getAllDisplays();
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
app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Nettoyer les ressources si nécessaire
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

// Empêcher la création de plusieurs instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Quelqu'un a essayé de lancer une seconde instance, on focus la fenêtre à la place
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
