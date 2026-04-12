# Le Fil — Agent Workflows

## Commandes de Build
```bash
npm install              # Installer les dépendances
npm run build            # Build production (next build)
npm run dev              # Dev server avec Turbopack
npm run lint             # Linting
```

## Workflows
1. **Ajouter une page** : créer dans `src/app/[nom]/page.tsx`
2. **Ajouter une route API** : créer `src/app/api/[nom]/route.ts`
3. **Modifier la DB** : via Supabase Dashboard ou migrations SQL dans `supabase/`
4. **Déploiement** : push git → Vercel auto-deploy

## Patterns du Projet
- Dev avec Turbopack (`next dev --turbopack`)
- Auth via Supabase SSR
- Providers.tsx à la racine pour les contextes React
- Routes structurées : connexion, inscription, dashboard, onboarding, admin
- Flow d'onboarding complet pour nouveaux utilisateurs
- Mode offline supporté
- Supabase pour auth + DB + storage
- Stripe pour abonnements premium
- Animations Framer Motion
