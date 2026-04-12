# Le Fil — Vivre Ensemble

## Description
Plateforme communautaire "vivre ensemble" — réseau social de quartier / copropriété avec gestion d'événements, discussions et services entre voisins. Paiements pour services premium.

## Stack Technique
- **Framework** : Next.js 16 (App Router, Turbopack, React 19)
- **Langage** : TypeScript 6
- **Auth/DB** : Supabase (SSR + supabase-js)
- **UI** : Tailwind CSS 4, Framer Motion, Lucide icons
- **Paiements** : Stripe
- **DB directe** : pg (PostgreSQL, devDependencies)

## Connexions
- SUPABASE (auth + base de données + storage)
- STRIPE (abonnements/services premium)

## Conventions de Code
- App Router Next.js 16
- Dev avec Turbopack : `next dev --turbopack`
- Routes : `admin/`, `api/`, `connexion/`, `dashboard/`, `inscription/`, `onboarding/`, `partage/`
- Providers.tsx à la racine de app/
- Supabase SSR auth
- Tailwind CSS v4

## Règles Métier
- Onboarding utilisateur structuré
- Dashboard communautaire
- Système de partage entre voisins
- Admin panel pour gestion
- Mot de passe oublié / reset password flows
- Mode offline supporté (`offline/`)
