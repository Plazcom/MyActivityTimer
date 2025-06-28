<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Destiny 2 Overlay Timer - Instructions pour Copilot

## Contexte du projet
Ce projet est une application **Destiny 2 Overlay Timer** qui permet aux joueurs de suivre leurs activités de jeu avec des timers en overlay. L'application utilise :

- **Backend** : Node.js avec Express et TypeScript
- **API** : Intégration avec l'API officielle Bungie pour Destiny 2
- **Frontend** : Electron pour l'interface desktop et l'overlay
- **Communication** : WebSocket pour les mises à jour en temps réel
- **Services** : Gestion des timers, suivi des activités, intégration API Bungie

## Architecture du code
- `src/main.ts` : Serveur Express principal avec API REST et WebSocket
- `src/services/BungieAPIService.ts` : Service d'intégration avec l'API Bungie
- `src/services/ActivityTracker.ts` : Service de suivi des activités du joueur
- `src/services/TimerService.ts` : Service de gestion des timers
- `src/electron/main.ts` : Processus principal Electron pour l'overlay
- `src/electron/index.html` : Interface de configuration
- `src/electron/overlay.html` : Interface de l'overlay en jeu
- `src/electron/js/` : Scripts JavaScript pour les interfaces

## Conventions de code
- Utiliser TypeScript pour tous les nouveaux fichiers backend
- Suivre les patterns async/await pour les opérations asynchrones
- Utiliser des interfaces TypeScript pour définir les types de données
- Commenter les fonctions complexes en français
- Gérer les erreurs de manière appropriée avec try/catch
- Utiliser des emojis dans les logs pour une meilleure lisibilité

## Spécificités Destiny 2
- Les types d'activité sont définis selon la nomenclature Bungie
- Les durées estimées sont basées sur l'expérience typique des joueurs
- L'API Bungie utilise des membershipType spécifiques (Steam=3, Xbox=1, PlayStation=2, etc.)
- Les timers doivent être en temps réel avec des mises à jour fluides

## Bonnes pratiques
- Toujours valider les données venant de l'API Bungie
- Gérer les cas de déconnexion/reconnexion WebSocket
- Optimiser l'overlay pour les performances gaming
- Maintenir la compatibilité avec différentes résolutions d'écran
- Prévoir les cas d'erreur réseau et d'API

## Tests et debug
- Utiliser console.log avec des emojis pour les messages de debug
- Tester la connexion API avant les opérations critiques
- Vérifier la réactivité de l'overlay en jeu
- S'assurer que l'application fonctionne sans clé API (mode démo)
