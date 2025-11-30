# Guide de Déploiement sur Vercel

## Prérequis

1. Compte Vercel (https://vercel.com)
2. Git installé
3. Dépôt GitHub/GitLab/Bitbucket

## Étapes de Déploiement

### 1. Préparer le Dépôt Git

```bash
git init
git add .
git commit -m "Initial commit: AnarosERP application"
git branch -M main
git remote add origin https://github.com/your-username/anaros-erp.git
git push -u origin main
```

### 2. Déployer sur Vercel

#### Option A: Via l'Interface Vercel

1. Allez sur https://vercel.com/new
2. Importez votre dépôt GitHub/GitLab/Bitbucket
3. Sélectionnez le projet
4. Configurez les variables d'environnement:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Votre URL PostgreSQL
   - `SESSION_SECRET`: Une clé secrète aléatoire
5. Cliquez sur "Deploy"

#### Option B: Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel
```

### 3. Configurer les Variables d'Environnement

Dans le Dashboard Vercel:
1. Allez à Settings → Environment Variables
2. Ajoutez les variables nécessaires:
   - `NODE_ENV=production`
   - `DATABASE_URL=<votre-url-postgresql>`
   - `SESSION_SECRET=<clé-secrète-aléatoire>`

### 4. Configurer la Base de Données

L'application utilise une base de données PostgreSQL. Options:

#### Supabase (Recommandé)
1. Créez un compte sur https://supabase.com
2. Créez un nouveau projet
3. Copiez l'URL de connexion PostgreSQL
4. Ajoutez-la comme variable d'environnement `DATABASE_URL`

#### PostgreSQL Externe
- Utilisez un service comme Heroku PostgreSQL, AWS RDS, ou DigitalOcean
- Ajoutez l'URL de connexion comme variable d'environnement

### 5. Exécuter les Migrations

Après le premier déploiement:

```bash
npm run db:push
```

Ou via Vercel CLI:

```bash
vercel env pull
npm run db:push
```

## Architecture de Déploiement

```
┌─────────────────────────────────────┐
│         Vercel (Frontend + API)     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   React App (Client)         │  │
│  │   - React Big Calendar       │  │
│  │   - Gestion des RDV          │  │
│  │   - Dashboard                │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Express Server (API)       │  │
│  │   - Routes API               │  │
│  │   - Gestion des données      │  │
│  │   - Authentification         │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   (Supabase / AWS RDS / etc.)       │
└─────────────────────────────────────┘
```

## Optimisations pour Vercel

### 1. Serverless Functions
- Les fonctions Express sont converties en Serverless Functions
- Temps limite: 60 secondes (configurable)
- Mémoire: 1024 MB (configurable)

### 2. Caching
- Les assets statiques sont cachés par Vercel
- Les API responses peuvent être cachées avec des headers

### 3. Monitoring
- Vercel fournit des logs et des métriques
- Utilisez le Dashboard pour monitorer les performances

## Dépannage

### Erreur: "Cannot find module"
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Exécutez `npm install` localement et committez `package-lock.json`

### Erreur: "Database connection failed"
- Vérifiez que `DATABASE_URL` est correctement configurée
- Testez la connexion localement avec `npm run db:push`

### Erreur: "Build failed"
- Vérifiez les logs de build dans le Dashboard Vercel
- Assurez-vous que `npm run build` fonctionne localement

### Erreur: "Port already in use"
- Vercel assigne automatiquement le port
- Ne forcez pas le port dans le code

## Commandes Utiles

```bash
# Développement local
npm run dev

# Build pour production
npm run build

# Démarrer le serveur de production
npm start

# Vérifier les types TypeScript
npm run check

# Pousser les migrations
npm run db:push
```

## Performance

### Recommandations

1. **Optimiser les images**: Utilisez des formats modernes (WebP)
2. **Code splitting**: Vite le fait automatiquement
3. **Lazy loading**: Chargez les composants à la demande
4. **Database indexing**: Créez des index sur les colonnes fréquemment interrogées
5. **Caching**: Utilisez React Query pour le caching côté client

### Métriques

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

## Support

Pour plus d'informations:
- Documentation Vercel: https://vercel.com/docs
- Documentation Express: https://expressjs.com
- Documentation React: https://react.dev
