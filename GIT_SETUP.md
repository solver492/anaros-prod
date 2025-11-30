# 📝 Configuration Git et Déploiement Vercel

## 1️⃣ Configuration Git Locale

### Initialiser le Dépôt

```bash
cd c:\Users\d3drone\Desktop\AnarosERP

# Initialiser Git
git init

# Configurer votre identité (une seule fois)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Vérifier la configuration
git config --list
```

### Ajouter et Committer les Fichiers

```bash
# Ajouter tous les fichiers
git add .

# Vérifier les changements
git status

# Créer un commit initial
git commit -m "Initial commit: AnarosERP application"

# Renommer la branche en 'main' (standard Vercel)
git branch -M main
```

## 2️⃣ Créer un Dépôt GitHub

### Via l'Interface Web

1. Allez sur https://github.com/new
2. Remplissez les informations:
   - **Repository name**: `anaros-erp`
   - **Description**: `Application de gestion de spa/salon de beauté`
   - **Visibility**: Public ou Private
3. NE cochez PAS "Initialize this repository with:"
4. Cliquez "Create repository"

### Copier l'URL

Vous verrez une URL comme:
```
https://github.com/YOUR_USERNAME/anaros-erp.git
```

## 3️⃣ Connecter le Dépôt Local à GitHub

```bash
# Ajouter le dépôt distant
git remote add origin https://github.com/YOUR_USERNAME/anaros-erp.git

# Vérifier que le dépôt distant est bien ajouté
git remote -v

# Pousser le code vers GitHub
git push -u origin main
```

## 4️⃣ Vérifier sur GitHub

1. Allez sur https://github.com/YOUR_USERNAME/anaros-erp
2. Vérifiez que tous les fichiers sont présents
3. Vérifiez que le commit initial est visible

## 5️⃣ Déployer sur Vercel

### Via l'Interface Web (Recommandé)

1. Allez sur https://vercel.com/new
2. Cliquez "Import Git Repository"
3. Connectez votre compte GitHub (si pas déjà connecté)
4. Cherchez `anaros-erp`
5. Cliquez "Import"
6. Configurez le projet:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Cliquez "Deploy"

### Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

## 6️⃣ Configurer les Variables d'Environnement

### Dans le Dashboard Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet `anaros-erp`
3. Allez à **Settings → Environment Variables**
4. Ajoutez les variables:

```
NODE_ENV = production
DATABASE_URL = postgresql://user:password@host:5432/db
SESSION_SECRET = votre-clé-secrète-aléatoire
```

5. Cliquez "Save"
6. Allez à **Deployments** et redéployez

## 7️⃣ Mettre à Jour le Code

### Après des Modifications Locales

```bash
# Voir les changements
git status

# Ajouter les changements
git add .

# Créer un commit
git commit -m "Description des changements"

# Pousser vers GitHub
git push origin main
```

**Vercel redéploiera automatiquement!** ✨

## 📋 Commandes Git Utiles

```bash
# Voir l'historique des commits
git log

# Voir les changements non committés
git diff

# Annuler les changements locaux
git checkout .

# Supprimer les fichiers non trackés
git clean -fd

# Voir les branches
git branch -a

# Créer une nouvelle branche
git checkout -b feature/ma-feature

# Fusionner une branche
git merge feature/ma-feature

# Voir le statut du dépôt distant
git fetch
git status
```

## 🔄 Workflow Recommandé

### Pour les Développements

```bash
# 1. Créer une branche pour votre feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Faire vos changements et tester localement
npm run dev

# 3. Committer vos changements
git add .
git commit -m "Ajouter nouvelle fonctionnalité"

# 4. Pousser la branche
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request sur GitHub
# (Allez sur GitHub et cliquez "Compare & pull request")

# 6. Une fois approuvée, fusionner sur main
git checkout main
git merge feature/nouvelle-fonctionnalite
git push origin main

# 7. Vercel redéploiera automatiquement!
```

## 🚀 Déploiement Automatique

Vercel redéploiera automatiquement quand vous:
- Poussez vers `main`
- Créez une Pull Request (déploiement de preview)
- Mergez une Pull Request

## 📊 Voir le Statut du Déploiement

```bash
# Via Vercel CLI
vercel status

# Via le Dashboard
# https://vercel.com/dashboard/anaros-erp
```

## ⚠️ Fichiers à Ne Pas Committer

Assurez-vous que `.gitignore` contient:

```
node_modules/
dist/
.env
.env.local
.env.*.local
*.log
.DS_Store
.vscode/
.idea/
```

## ✅ Checklist Avant de Déployer

- [ ] Code testé localement
- [ ] `npm run build` fonctionne
- [ ] `npm start` fonctionne
- [ ] Tous les fichiers sont committés
- [ ] `.gitignore` est correctement configuré
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Base de données configurée

## 🎉 C'est Prêt!

Votre application est maintenant prête pour la production! 🚀

---

**Besoin d'aide?**
- Git: https://git-scm.com/doc
- GitHub: https://docs.github.com
- Vercel: https://vercel.com/docs
