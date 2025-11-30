#!/bin/bash

# Script de déploiement sur Vercel
# Usage: ./deploy.sh

echo "🚀 Déploiement AnarosERP sur Vercel"
echo "===================================="
echo ""

# Vérifier si Git est initialisé
if [ ! -d ".git" ]; then
  echo "❌ Erreur: Git n'est pas initialisé"
  echo "Exécutez d'abord: git init"
  exit 1
fi

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
  echo "📦 Installation de Vercel CLI..."
  npm install -g vercel
fi

# Build local
echo "🔨 Build de l'application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Erreur lors du build"
  exit 1
fi

# Commit et push
echo "📤 Commit et push vers Git..."
git add .
git commit -m "Deploy: AnarosERP $(date +%Y-%m-%d\ %H:%M:%S)"
git push

# Déployer sur Vercel
echo "🌐 Déploiement sur Vercel..."
vercel --prod

echo ""
echo "✅ Déploiement terminé!"
echo "Consultez votre application sur le lien fourni par Vercel"
