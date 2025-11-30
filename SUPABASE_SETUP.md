# 🔧 Configuration Supabase - Guide Complet

## ✅ Étape 1: Vérifier la Connexion

Tes informations Supabase:
```
Project URL: https://ysaysbafnzylzvwzvkdj.supabase.co
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ Étape 2: Créer les Tables via SQL Editor

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez à **SQL Editor** (dans le menu de gauche)
4. Cliquez **"New Query"**
5. Copiez et collez le SQL ci-dessous:

### SQL à Exécuter

```sql
-- Create profiles table (users/employees)
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  color_code TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create service categories table
CREATE TABLE IF NOT EXISTS services_categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES services_categories(id),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create staff skills table
CREATE TABLE IF NOT EXISTS staff_skills (
  profile_id VARCHAR(36) NOT NULL REFERENCES profiles(id),
  category_id INTEGER NOT NULL REFERENCES services_categories(id),
  PRIMARY KEY (profile_id, category_id)
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  client_id VARCHAR(36) NOT NULL REFERENCES clients(id),
  staff_id VARCHAR(36) NOT NULL REFERENCES profiles(id),
  service_id VARCHAR(36) NOT NULL REFERENCES services(id),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Create users table (legacy)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
```

6. Cliquez **"Run"** (ou Ctrl+Enter)
7. Attendez que l'exécution se termine ✅

## ✅ Étape 3: Vérifier les Tables

1. Allez à **Table Editor** (dans le menu de gauche)
2. Vérifiez que ces tables existent:
   - ✅ profiles
   - ✅ services_categories
   - ✅ services
   - ✅ staff_skills
   - ✅ clients
   - ✅ appointments
   - ✅ users

## ✅ Étape 4: Obtenir la DATABASE_URL

1. Allez à **Settings → Database** (en bas du menu)
2. Cherchez **"Connection String"**
3. Sélectionnez **"URI"**
4. Copiez l'URL complète

L'URL ressemble à:
```
postgresql://postgres.ysaysbafnzylzvwzvkdj:PASSWORD@db.ysaysbafnzylzvwzvkdj.supabase.co:5432/postgres
```

## ✅ Étape 5: Ajouter DATABASE_URL à Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet `anaros-prod`
3. Allez à **Settings → Environment Variables**
4. Ajoute une nouvelle variable:
   ```
   Name: DATABASE_URL
   Value: [Colle l'URL PostgreSQL de Supabase]
   ```
5. Cliquez **"Save"**
6. Allez à **Deployments** et redéploie

## 🎯 Résumé des Tables Créées

| Table | Description |
|-------|-------------|
| **profiles** | Employés/Utilisateurs |
| **services_categories** | Catégories de services |
| **services** | Services (coiffure, massage, etc.) |
| **staff_skills** | Compétences des employés |
| **clients** | Clients |
| **appointments** | Rendez-vous |
| **users** | Utilisateurs (legacy) |

## 🔍 Vérifier la Connexion Locale

```bash
# Test de connexion
npm run db:push

# Si ça fonctionne, tu verras:
# ✅ Database connected successfully
```

## ✅ Checklist

- [ ] SQL exécuté dans Supabase SQL Editor
- [ ] Toutes les tables créées
- [ ] DATABASE_URL obtenue
- [ ] DATABASE_URL ajoutée à Vercel
- [ ] Redéploiement lancé sur Vercel
- [ ] Application fonctionne en production

## 🚀 Prochaines Étapes

1. Exécuter le SQL dans Supabase
2. Vérifier les tables
3. Obtenir la DATABASE_URL
4. Ajouter à Vercel
5. Redéployer
6. Tester l'application

## ⚠️ Erreurs Courantes

**Erreur: "relation does not exist"**
- Les tables n'ont pas été créées
- Vérifiez que le SQL a été exécuté correctement

**Erreur: "permission denied"**
- Vérifiez que vous utilisez la bonne clé API
- Assurez-vous que le rôle a les permissions

**Erreur: "connection refused"**
- Vérifiez la DATABASE_URL
- Assurez-vous que Supabase est accessible

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- SQL Reference: https://www.postgresql.org/docs/
