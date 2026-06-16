# Mon CRM — TPE

CRM pour TPE/PME (contacts, pipeline, activités, tâches, statistiques) construit
avec **Next.js (App Router) + TypeScript + Tailwind CSS** et **Supabase**
(authentification + Postgres), déployé sur **Netlify**.

> Migration depuis l'ancienne version mono-fichier `crm-tpe.html` (HTML/JS vanilla).
> Le fichier d'origine est conservé à la racine comme référence — il pourra être
> supprimé une fois la parité validée.

## Stack

- Next.js 15 (App Router, Server Components, Server Actions)
- TypeScript
- Tailwind CSS (design system porté dans `src/app/globals.css`)
- Supabase via `@supabase/ssr` (sessions par cookies, SSR + middleware)
- Netlify (`@netlify/plugin-nextjs`)

## Démarrage local

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Configurer les variables d'environnement. Copier `.env.example` vers
   `.env.local` et renseigner les valeurs Supabase (Project Settings → API) :

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

   Ouvrir http://localhost:3000 (redirige vers `/login` si non connecté).

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — serveur de production
- `npm run lint` — ESLint

## Structure

```
src/
├── middleware.ts            # rafraîchit la session + protège les routes
├── app/
│   ├── layout.tsx           # layout racine (polices DM Sans/Mono, globals.css)
│   ├── globals.css          # variables CSS + design system (Tailwind @layer)
│   ├── login/               # connexion / inscription / mot de passe oublié
│   ├── reset-password/      # nouveau mot de passe (après email)
│   ├── auth/callback/       # échange du code Supabase (PKCE)
│   ├── (app)/               # zone authentifiée (shell partagé)
│   │   ├── layout.tsx       # garde d'auth + données + providers
│   │   ├── dashboard/  contacts/  pipeline/
│   │   ├── activites/  taches/  stats/  parametres/
│   └── actions/             # Server Actions (CRUD, auth, import…)
├── components/              # shell (sidebar, topbar…), modales, primitives
├── lib/
│   ├── supabase/            # clients browser/server + helper middleware
│   ├── data.ts              # lecture des données côté serveur
│   ├── mappers.ts  format.ts  constants.ts
└── types/db.ts              # types des tables et modèles applicatifs
```

## Déploiement Netlify

1. Connecter le dépôt à Netlify (le runtime Next.js est activé via
   `netlify.toml` → `@netlify/plugin-nextjs`).
2. Définir les variables d'environnement dans Netlify
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_SITE_URL=https://<votre-site>.netlify.app`).
3. Dans Supabase → Authentication → URL Configuration, ajouter l'URL du site et
   autoriser la redirection `https://<votre-site>.netlify.app/auth/callback`.

## Base de données Supabase

Tables utilisées : `contacts`, `opportunities`, `activities`, `tasks`,
`user_profiles`, `team_invitations`. Le schéma existant est inchangé par rapport
à l'ancienne version ; chaque ligne est isolée par `user_id` (RLS recommandé).

> ⚠️ **À configurer avant utilisation.** Le projet Supabase codé en dur dans
> l'ancien `crm-tpe.html` (`dwyotxplyzgtlzdgifgm.supabase.co`) **n'existe plus**
> (DNS `NXDOMAIN`). Remplacez les valeurs de `.env.local` par celles d'un projet
> Supabase valide (Project Settings → API) avant de tester les flux connectés.

## Statut de vérification

Vérifié dans l'environnement de build (sans backend) :

- ✅ Build de production (`npm run build`) — 14 routes, ESLint + TypeScript OK
- ✅ Démarrage du serveur de dev
- ✅ Garde d'authentification SSR : `/` et `/dashboard` → redirection `307` vers
  `/login` ; `/login` rend correctement

Reste à vérifier avec un backend Supabase valide (nécessite une connexion) :

- ⛔ Connexion / inscription / réinitialisation du mot de passe
- ⛔ CRUD contacts, opportunités, activités, tâches
- ⛔ Import CSV/XLSX et export CSV
- ⛔ Profil, changement de mot de passe, invitations d'équipe

### Pour exécuter la passe de tests connectés

1. Renseigner un `NEXT_PUBLIC_SUPABASE_URL` et un `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   valides dans `.env.local`.
2. S'assurer que les 6 tables existent (voir ci-dessus).
3. Créer un **compte de test pré-confirmé** si la confirmation par email est
   activée (Supabase → Authentication → Users → Add user → *Auto Confirm*),
   sinon la connexion échoue tant que l'email n'est pas validé.
