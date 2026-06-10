# Plan d'action écoconception

## User stories sélectionnées

Les user stories retenues sont celles qui répondent directement aux problèmes observés dans `audit-initial.md`

| Story | Priorité | Problème principal traité | Indicateur cible |
| --- | --- | --- | --- |
| Story 1 : Chargement initial plus rapide | Haute | Performance Lighthouse faible, LCP à 9,6 s, Speed Index à 14,8 s | LCP < 2,5 s, Performance Lighthouse > 70 |
| Story 2 : Réduction poids images | Haute | Environ 7 MB d'images chargées, dont `large.jpg` | Images < 500 kB |
| Story 4 : Réduction des requêtes réseau inutiles | Haute | 248 requêtes réseau, appels répétés vers `/api/payload` et `/api/server` | Moins de 50 requêtes après chargement |
| Story 3 : Accessibilité améliorée | Moyenne / Basse | Maintenir une interface lisible après optimisation | Accessibilité Lighthouse > 90 |

## Modifications prévues

- Retirer l'injection dynamique de `big.css` et `big.js`, car ces fichiers augmentent fortement le poids CSS/JS sans être nécessaires au fonctionnement principal
- Optimiser l'image de fond `large.jpg` avec une version compressée et adaptée à l'affichage
- Réduire la fréquence des appels backend et supprimer les appels répétés vers `/api/payload` quand ils ne sont pas indispensables
- Conserver la visualisation 3D, mais réduire son impact : moins d'objets, rendu moins fréquent ou arrêt lorsque la section n'est pas visible
- Configurer un cache plus efficace pour les fichiers statiques qui ne changent pas à chaque requête
- Vérifier les contrastes après les changements visuels pour conserver une interface accessible

## Ordre de réalisation

- Étape 1 : Supprimer les chargements artificiellement lourds `big.css` et `big.js`
- Étape 2 : Réduire ou remplacer `large.jpg` par une image plus légère
- Étape 3 : Limiter les appels API automatiques, surtout `/api/payload`
- Étape 4 : Réduire le coût de l'animation 3D ou la rendre optionnelle
- Étape 5 : Améliorer le cache des fichiers statiques côté backend
- Étape 6 : Refaire un audit final et comparer les résultats avec `audit-initial.md`
- Étape 7 : Amélioration des contrastes si la lisibilité a été impactée par les modifications

## Résultats attendus

Les valeurs suivantes sont des objectifs cibles et seront vérifiées lors de l'audit final

- Score Lighthouse Performance supérieur à 70
- Largest Contentful Paint inférieur à 2,5 s
- Poids transféré inférieur à 2 MB
- Nombre de requêtes réseau inférieur à 50 après chargement
- Poids total des images inférieur à 500 kB
- Baisse du CPU, du RPS et de la consommation réseau grâce à la réduction des appels backend et du rendu continu

## Sources des objectifs

- Seuil LCP recommandé : Google indique qu'un bon Largest Contentful Paint doit être inférieur ou égal à 2,5 s - Source : https://web.dev/articles/lcp
- Core Web Vitals : Google Search Central recommande aussi un LCP dans les 2,5 premières secondes - Source : https://developers.google.com/search/docs/appearance/core-web-vitals
- Score Lighthouse : la documentation Chrome explique que le score Performance Lighthouse est calculé à partir de plusieurs métriques, dont LCP, TBT, FCP, Speed Index et CLS - Source : https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
- Les objectifs de poids transféré, nombre de requêtes et poids images sont des objectifs internes définis à partir de l'audit initial : 7,7 MB transférés, 248 requêtes réseau et environ 7 MB d'images

## Mesure après optimisation

Après les modifications, un nouvel audit sera réalisé dans les mêmes conditions que l'audit initial :

- Lancement avec `npm run dev`
- Frontend audité sur http://localhost:3000
- Cache désactivé dans DevTools pour la mesure réseau
- Mesure Lighthouse
- Relevé du poids transféré, du nombre de requêtes et des métriques affichées par l'application
- Création d'un fichier `audit-final.md` avec une comparaison avant / après
