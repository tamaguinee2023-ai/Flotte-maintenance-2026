# Fleet Maintenance Pro — Déploiement Vercel

## 🚀 Déploiement en 3 étapes

### Option A — Vercel CLI (recommandé)

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Se placer dans ce dossier
cd fleet-vercel

# 3. Déployer
vercel --prod
```

Suivre les invites : créer un compte ou se connecter, confirmer le projet → URL publique générée instantanément.

---

### Option B — Vercel Dashboard (sans terminal)

1. Aller sur **https://vercel.com** → "Add New Project"
2. Cliquer **"Import Git Repository"** ou **"Upload"**
3. Glisser ce dossier (`fleet-vercel/`) dans la zone d'upload
4. Cliquer **Deploy** → URL disponible en ~30 secondes

---

### Option C — GitHub + Vercel (déploiement continu)

```bash
# Depuis ce dossier
git init
git add .
git commit -m "Fleet Maintenance Pro v13"
git remote add origin https://github.com/TON_USER/fleet-pro.git
git push -u origin main
```
Puis connecter le repo GitHub sur vercel.com → chaque `git push` redéploie automatiquement.

---

## 📱 Fonctionnalités mobiles

- **Sidebar off-canvas** avec hamburger ☰ et swipe depuis le bord gauche
- **Bottom navigation** (5 onglets raccourcis) visible sur mobile
- **Touch targets ≥ 44px** pour tous les boutons
- **iOS safe-area** (notch + home indicator) respectée
- **Zoom iOS désactivé** (font-size 16px sur les inputs)
- **Catalogue pièces** en grille 2 colonnes sur mobile

## ✏️ Personnalisation du nom

Une fois l'app ouverte, cliquer sur le bouton **✏️** (topbar droite) pour :
- Changer l'icône emoji
- Renommer l'application
- Modifier le slogan

Le nom est sauvegardé en localStorage (persistant par appareil/navigateur).

---

## 🔧 Configuration Supabase

Renseigner l'**URL** et la **Anon Key** Supabase dans l'écran de connexion.
Les données sont chiffrées côté Supabase avec Row Level Security (RLS).

## 📦 Structure du dossier

```
fleet-vercel/
├── index.html      # Application complète (single-file)
├── vercel.json     # Configuration Vercel
└── README.md       # Ce guide
```

---

*HABATECH — Conakry & Siguiri, Guinée*
