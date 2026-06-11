# Audit GreenIT final

## Contexte

Application auditée après les optimisations d'écoconception.

- URL auditée : http://localhost:3000
- Date de l'audit : 11 juin 2026
- Mode de lancement : `npm run dev`
- Frontend : http://localhost:3000
- Backend : http://localhost:5001
- Navigateur : Brave avec DevTools

## Résultats Lighthouse

Audit Lighthouse réalisé sur `http://localhost:3000`.

- Score Performance : 94 / 100
- First Contentful Paint : 0,9 s
- Largest Contentful Paint : 1,5 s
- Total Blocking Time : 0 ms
- Speed Index : 0,9 s
- Cumulative Layout Shift : 0,001

Captures :

- `screenshots/02-final-lighthouse.png`
- `screenshots/03-final-lighthouse.png`

## Poids de la page

D'après Chrome DevTools > Network :

- Poids transféré : 1,3 kB
- Taille totale des ressources : 2,6 MB
- Nombre de requêtes : 16
- Temps de fin de chargement observé : 4,35 s

Capture :

- `screenshots/00-final-network.png`

## Métriques affichées par l'application

D'après les métriques affichées directement dans l'interface :

- Poids HTML : 0 kB
- Poids page : 2 kB
- Ressources : 14
- JS : 2 kB
- CSS : 0,0 kB
- Images : 0 kB
- DOM : 86 éléments
- Cache hit : 100 %
- RAM serveur : 0 MB
- CPU : 0
- RPS : 0
- Load page : 4 001 ms

Capture :

- `screenshots/01-final-metrics.png`

## Comparaison avant / après

| Indicateur | Avant | Après | Évolution |
|---|---:|---:|---:|
| Score Lighthouse Performance | 25 / 100 | 94 / 100 | +69 points |
| Poids de la page | 7,7 MB transférés | 1,3 kB transférés | forte baisse |
| Nombre de requêtes | 248 | 16 | -232 requêtes |
| Temps de chargement | LCP 9,6 s | LCP 1,5 s | -8,1 s |

## Autres indicateurs observés

| Indicateur | Avant | Après | Évolution |
|---|---:|---:|---:|
| First Contentful Paint | 5,3 s | 0,9 s | -4,4 s |
| Total Blocking Time | 5 120 ms | 0 ms | -5 120 ms |
| Speed Index | 14,8 s | 0,9 s | -13,9 s |
| Cumulative Layout Shift | 0 | 0,001 | stable |
| DOM | 185 éléments | 86 éléments | -99 éléments |
| Images | environ 7 093 kB | 0 kB | forte baisse |
| CSS affiché par l'application | environ 7 092,7 kB | 0,0 kB | forte baisse |
| JS affiché par l'application | 191 kB | 2 kB | forte baisse |

## Améliorations obtenues

- Suppression du chargement dynamique de `big.js` et `big.css`
- Suppression des appels automatiques répétés vers `/api/payload`
- Réduction du polling serveur vers `/api/server`
- Suppression de l'image lourde `large.jpg`
- Suppression de l'image de fond et remplacement par un effet CSS sans requête réseau
- Allègement du CSS global avec suppression des imports externes inutiles
- Chargement différé de Three.js uniquement quand la visualisation 3D devient utile
- Réduction du nombre d'objets 3D et limitation du rendu à environ 15 FPS
- Remplacement des icônes React par du texte court pour réduire le bundle principal
- Ajout d'un cache côté backend pour les fichiers statiques restants

## Analyse

Les optimisations produisent un gain très net. Le score Lighthouse Performance passe de 25 / 100 à 94 / 100, ce qui dépasse l'objectif fixé dans le plan d'action.

Le Largest Contentful Paint passe de 9,6 s à 1,5 s. L'objectif recommandé de 2,5 s est donc atteint.

Le Total Blocking Time passe de 5 120 ms à 0 ms. Cela montre que la page ne bloque presque plus le thread principal pendant le chargement.

Le poids transféré passe de 7,7 MB à 1,3 kB et le nombre de requêtes passe de 248 à 16. Ces résultats confirment la réduction des ressources inutiles et des appels réseau.

## Problèmes restants

- La taille totale des ressources reste à 2,6 MB dans DevTools, notamment à cause des fichiers servis en mode développement par Vite
- Le chunk Three.js reste lourd, même s'il est chargé plus tard et seulement quand la visualisation devient utile
- L'audit est réalisé avec `npm run dev`, donc les résultats peuvent différer d'un audit sur un build de production
- Certaines dépendances restent présentes dans `package.json` alors qu'elles ne sont pas forcément utilisées par l'écran principal

## Conclusion finale

Les objectifs principaux de l'exercice sont atteints. L'application conserve son fonctionnement principal tout en réduisant fortement son poids, son nombre de requêtes et son coût JavaScript.

Le score Lighthouse final de 94 / 100, le LCP à 1,5 s, les 16 requêtes réseau et le poids transféré de 1,3 kB montrent une amélioration significative par rapport à l'audit initial.
