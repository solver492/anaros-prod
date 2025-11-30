# 🚀 Déploiement AnarosERP sur Vercel

## 📋 Résumé Rapide

L'application AnarosERP est prête pour être déployée sur Vercel. Voici les étapes essentielles:

### 1️⃣ Préparation

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit: AnarosERP"

# Créer un dépôt sur GitHub
# https://github.com/new
```

### 2️⃣ Déploiement

**Option A: Interface Web (Plus Simple)**
1. Allez sur https://vercel.com/new
2. Cliquez "Import Git Repository"
3. Sélectionnez votre dépôt GitHub
4. Cliquez "Deploy"

**Option B: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 3️⃣ Configuration des Variables d'Environnement

Dans le Dashboard Vercel, allez à **Settings → Environment Variables** et ajoutez:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/db
SESSION_SECRET=votre-clé-secrète-aléatoire
```

## 📁 Fichiers de Configuration

- **`vercel.json`** - Configuration Vercel
- **`.vercelignore`** - Fichiers à ignorer lors du déploiement
- **`.env.example`** - Template des variables d'environnement
- **`DEPLOYMENT.md`** - Guide détaillé de déploiement

## 🏗️ Architecture

```
Vercel (Frontend + API)
├── React App (Client)
│   ├── React Big Calendar
│   ├── Dashboard
│   └── Gestion des RDV
└── Express Server (API)
    ├── Routes API
    ├── Authentification
    └── Gestion des données
         ↓
    PostgreSQL Database
```

## 🔧 Commandes Essentielles

```bash
# Développement local
npm run dev

# Build production
npm run build

# Démarrer production
npm start

# Vérifier les types
npm run check

# Migrations DB
npm run db:push
```

## 📊 Stack Technique

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Supabase recommandé)
- **Calendrier**: React Big Calendar (Open Source)
- **UI**: Tailwind CSS + shadcn/ui
- **Déploiement**: Vercel

## ✨ Fonctionnalités

✅ Calendrier intelligent avec filtrage par employé
✅ Gestion des rendez-vous
✅ Dashboard avec KPIs
✅ Gestion des clients et services
✅ Authentification sécurisée
✅ 100% Open Source (React Big Calendar)

## 🚀 Prochaines Étapes

1. **Créer un dépôt GitHub** (si pas déjà fait)
2. **Pousser le code** vers GitHub
3. **Configurer Vercel** avec votre dépôt
4. **Ajouter les variables d'environnement**
5. **Configurer la base de données PostgreSQL**
6. **Exécuter les migrations**: `npm run db:push`
7. **Tester l'application en production**

## 📞 Support

- Documentation Vercel: https://vercel.com/docs
- Documentation Express: https://expressjs.com
- Documentation React: https://react.dev
- React Big Calendar: https://jquense.github.io/react-big-calendar/

## 📝 Notes Importantes

- Assurez-vous que `package-lock.json` est committée
- Les variables d'environnement ne doivent pas être committées
- Utilisez `.env.local` pour le développement local
- Testez localement avec `npm run build && npm start` avant de déployer

---

**Besoin d'aide?** Consultez `DEPLOYMENT.md` pour un guide détaillé.
