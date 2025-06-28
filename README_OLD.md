# 🎮 Destiny 2 Overlay Timer

<div align="center">

![Destiny 2](https://img.shields.io/badge/Destiny%202-Compatible-orange?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Electron](https://img.shields.io/badge/Electron-Desktop-blue?style=for-the-badge&logo=electron)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Une application complète pour suivre vos activités Destiny 2 avec des timers en overlay en temps réel.**

[🚀 Installation](#-installation) • [🎯 Utilisation](#-utilisation) • [🏗️ Architecture](#%EF%B8%8F-architecture-du-projet) • [🔧 Configuration](#-configuration-avancée)

</div>

---

## 📋 Table des matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Installation](#-installation)
- [🎯 Utilisation](#-utilisation)
- [🏗️ Architecture du projet](#%EF%B8%8F-architecture-du-projet)
- [🎮 Types d'activités](#-types-dactivités-supportées)
- [🔧 Configuration avancée](#-configuration-avancée)
- [🚨 Dépannage](#-dépannage)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---------------|-------------|
| 🔗 **Intégration API Bungie** | Connexion directe à l'API officielle Destiny 2 |
| ⏱️ **Timers personnalisés** | Créez des timers pour toutes vos activités |
| 🎯 **Overlay gaming** | Interface transparente superposée à votre jeu |
| 📊 **Suivi en temps réel** | Mises à jour automatiques via WebSocket |
| 🎨 **Interface moderne** | Design adapté aux gamers avec thème sombre |
| ⚡ **Performances optimisées** | Application légère utilisant Electron |

## 🚀 Installation

> **Prérequis**
> - ✅ Node.js 18+ installé sur votre système
> - 🔑 Une clé API Bungie (gratuite sur [bungie.net](https://www.bungie.net/en/Application))
> - 🎮 Votre ID de compte Destiny 2

### 📦 Installation rapide

```powershell
# 1. Cloner le projet
git clone https://github.com/votre-username/destiny2-overlay-timer.git
cd destiny2-overlay-timer

# 2. Installer les dépendances
npm install

# 3. Configuration (voir section suivante)
cp .env.example .env

# 4. Construire l'application
npm run build

# 5. Démarrer l'application
npm start
```

### ⚙️ Configuration de l'API Bungie

<details>
<summary>🔧 Étapes détaillées de configuration</summary>

1. **Obtenir une clé API** :
   - Rendez-vous sur [bungie.net/en/Application](https://www.bungie.net/en/Application)
   - Créez une nouvelle application
   - Copiez votre clé API

2. **Configurer le fichier .env** :
   ```env
   BUNGIE_API_KEY=votre_clé_api_bungie_ici
   PORT=3000
   NODE_ENV=development
   ```

3. **Trouver votre ID de compte** :
   - Connectez-vous à [bungie.net](https://www.bungie.net)
   - Allez dans votre profil
   - L'ID est dans l'URL : `/Profile/[type]/[id]`

</details>

## 🎯 Utilisation

### 🚀 Démarrage rapide

```powershell
# Terminal 1 : Démarrer le serveur API
npm start

# Terminal 2 : Démarrer l'interface Electron
npm run electron
```

<details>
<summary>📋 Guide d'utilisation détaillé</summary>

### Configuration initiale

1. **🔑 Configuration API** :
   - Lancez l'application Electron
   - Entrez votre clé API et ID de compte
   - Testez la connexion

2. **⏱️ Créer un timer** :
   - Sélectionnez le type d'activité
   - Optionnel : définissez une durée estimée
   - Cliquez sur "Démarrer Timer"

3. **🎯 Contrôler l'overlay** :
   - **Afficher Overlay** : Rend l'overlay visible
   - **Masquer Overlay** : Cache l'overlay
   - **Basculer Overlay** : Alterne entre visible/caché

4. **📊 Suivre vos activités** :
   - L'overlay affiche les timers actifs
   - Barres de progression pour les activités avec durée estimée
   - Alertes visuelles quand le temps est écoulé

</details>

## 🏗️ Architecture du projet

```
📁 src/
├── 🚀 main.ts                 # Serveur API Express
├── 📁 services/
│   ├── 🔗 BungieAPIService.ts  # Interface API Bungie
│   ├── 📊 ActivityTracker.ts   # Suivi des activités
│   └── ⏱️ TimerService.ts      # Gestion des timers
└── 📁 electron/
    ├── ⚙️ main.ts             # Processus principal Electron
    ├── 🖥️ index.html          # Interface de configuration
    ├── 🎯 overlay.html        # Interface de l'overlay
    └── 📁 js/
        ├── 📋 main.js         # Logique interface principale
        └── 🎮 overlay.js      # Logique overlay
```

### 🔧 Stack technique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Backend** | Node.js + Express + TypeScript | API REST et WebSocket |
| **Frontend** | Electron + HTML/CSS/JS | Interface desktop et overlay |
| **API** | Bungie API | Données Destiny 2 |
| **Communication** | WebSocket | Temps réel |

## 🎮 Types d'activités supportées

<div align="center">

| 🎯 Activité | ⏱️ Durée estimée | 📊 Difficulté |
|-------------|------------------|---------------|
| **🏛️ Raids** | 60 minutes | ⭐⭐⭐⭐⭐ |
| **🗡️ Donjons** | 30 minutes | ⭐⭐⭐⭐ |
| **⚔️ Grèves** | 15 minutes | ⭐⭐ |
| **🔥 Grèves Héroïques** | 20 minutes | ⭐⭐⭐ |
| **💀 Grèves de Maître-d'œuvre** | 30 minutes | ⭐⭐⭐⭐ |
| **👑 Grèves de Grand Maître** | 45 minutes | ⭐⭐⭐⭐⭐ |
| **🎯 JcJ (Crucible)** | 10 minutes | ⭐⭐ |
| **🎰 Gambit** | 15 minutes | ⭐⭐⭐ |
| **🏆 Épreuve d'Osiris** | 7 minutes | ⭐⭐⭐⭐ |
| **🗺️ Patrouilles** | 30 minutes | ⭐ |

</div>

## 🔧 Configuration avancée

<details>
<summary>⚙️ Variables d'environnement</summary>

```env
# 🔗 API Configuration
BUNGIE_API_KEY=your_bungie_api_key
PORT=3000
NODE_ENV=development

# 🌐 WebSocket Configuration
WS_PORT=3000

# 🖥️ Electron Configuration
ELECTRON_ENABLE_LOGGING=true
```

</details>

<details>
<summary>🎨 Personnalisation de l'overlay</summary>

L'overlay peut être personnalisé en modifiant :

- **📍 Position** : Via les contrôles dans l'interface
- **📏 Taille** : Automatique selon le contenu
- **👻 Transparence** : Définie dans le CSS
- **🎨 Couleurs** : Thème modifiable dans les fichiers CSS

</details>

## 🚨 Dépannage

<details>
<summary>🔧 Problèmes courants et solutions</summary>

### ❌ "npm n'est pas reconnu"
```powershell
# Solution : Installer Node.js
# 1. Téléchargez Node.js depuis https://nodejs.org
# 2. Redémarrez votre terminal
```

### 🔌 Erreur de connexion API
- ✅ Vérifiez votre clé API Bungie
- ✅ Assurez-vous que votre ID de compte est correct  
- ✅ Vérifiez votre connexion internet

### 👻 L'overlay ne s'affiche pas
- ✅ Vérifiez que le serveur API fonctionne
- ✅ Relancez l'application Electron
- ✅ Vérifiez les permissions d'affichage

### 🌐 WebSocket ne se connecte pas
- ✅ Vérifiez que le port 3000 n'est pas bloqué
- ✅ Redémarrez le serveur API

</details>

<details>
<summary>📋 Logs de débogage</summary>

| Composant | Localisation des logs |
|-----------|----------------------|
| **🚀 Serveur API** | Console du terminal |
| **🖥️ Electron** | Outils développeur (F12) |
| **🎯 Overlay** | Console du processus overlay |

</details>

## 🤝 Contribution

<div align="center">

[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

</div>

Les contributions sont les bienvenues ! Pour contribuer :

1. 🍴 **Fork** le projet
2. 🌿 **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. 💾 **Committez** vos changements (`git commit -m 'Ajout: nouvelle fonctionnalité'`)
4. 📤 **Poussez** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. 🔄 **Ouvrez** une Pull Request

## 💡 Fonctionnalités futures

<details>
<summary>🚀 Roadmap du projet</summary>

### 📋 À venir
- [ ] 🤖 Suivi automatique des activités en cours
- [ ] 📊 Historique des sessions de jeu
- [ ] 📈 Statistiques détaillées
- [ ] 🔔 Notifications système
- [ ] 🎨 Thèmes personnalisables

### 🔮 Vision long terme
- [ ] 👥 Support multi-joueurs
- [ ] 💬 Intégration Discord
- [ ] 📺 Mode streaming (OBS compatible)
- [ ] 📱 Application mobile companion

</details>

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🔗 Liens utiles

<div align="center">

[![Bungie API](https://img.shields.io/badge/Bungie%20API-Documentation-orange?style=for-the-badge)](https://bungie-net.github.io/multi/)
[![Destiny 2 API](https://img.shields.io/badge/Destiny%202%20API-Guide-blue?style=for-the-badge)](https://github.com/Bungie-net/api)
[![Electron](https://img.shields.io/badge/Electron-Documentation-lightblue?style=for-the-badge&logo=electron)](https://www.electronjs.org/docs)
[![Node.js](https://img.shields.io/badge/Node.js-Documentation-green?style=for-the-badge&logo=node.js)](https://nodejs.org/docs)

</div>

---

<div align="center">

**⚠️ Note importante**

Cette application nécessite une clé API Bungie valide pour fonctionner.
Assurez-vous de respecter les [Conditions d'utilisation de l'API Bungie](https://www.bungie.net/en/Bungie/API).

---

<sub>Fait avec ❤️ pour la communauté Destiny 2</sub>

</div>

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🔗 Liens utiles

- [API Bungie Documentation](https://bungie-net.github.io/multi/)
- [Destiny 2 API Guide](https://github.com/Bungie-net/api)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)

## 💡 Fonctionnalités futures

- [ ] Suivi automatique des activités en cours
- [ ] Historique des sessions de jeu
- [ ] Statistiques détaillées
- [ ] Notifications système
- [ ] Thèmes personnalisables
- [ ] Support multi-joueurs
- [ ] Intégration Discord
- [ ] Mode streaming (OBS compatible)

---

**Note** : Cette application nécessite une clé API Bungie valide pour fonctionner. Assurez-vous de respecter les [Conditions d'utilisation de l'API Bungie](https://www.bungie.net/en/Bungie/API).
#   M y A c t i v i t y T i m e r 
 
 # MyActivityTimer
