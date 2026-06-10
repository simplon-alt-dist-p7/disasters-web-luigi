# Audit GreenIT initial

## Contexte

Application auditée avant toute modification du code.

- URL auditée : http://localhost:3000
- Date de l'audit : 10 juin 2026
- Mode de lancement : `npm run dev`
- Frontend : http://localhost:3000
- Backend : http://localhost:5001
- Navigateur : Brave avec DevTools
- Cache navigateur : désactivé pendant la mesure réseau

## Résultats Lighthouse

Audit Lighthouse réalisé sur `http://localhost:3000`.

- Score Performance : 25 / 100
- First Contentful Paint : 5,3 s
- Largest Contentful Paint : 9,6 s
- Total Blocking Time : 5 120 ms
- Speed Index : 14,8 s
- Cumulative Layout Shift : 0

Captures :

- `screenshots/initial-lighthouse-0.png`
- `screenshots/initial-lighthouse-1.png`

## Poids de la page

D'après Chrome DevTools > Network :

- Poids transféré : 7,7 MB
- Taille totale des ressources : 180 MB
- Temps de fin de chargement observé : 2,8 min

Ces valeurs sont élevées pour une page d'application simple. La taille totale des ressources est particulièrement importante, ce qui indique que la page charge ou déclenche beaucoup de données après l'affichage initial.

Capture :

- `screenshots/00-initial-network.png`

## Nombre de requêtes réseau

Nombre de requêtes observées dans Chrome DevTools > Network :

- Requêtes totales : 248
- Requêtes API : très nombreuses, principalement des appels `fetch` vers `/api/payload` et `/api/server`
- Requêtes JS : présentes, dont le bundle principal et `big.js`
- Requêtes CSS : présentes, dont `big.css`
- Requêtes images : présentes, dont `large.jpg`

La capture réseau montre que des requêtes continuent à être envoyées après le chargement initial. Cela augmente le trafic réseau et la consommation côté navigateur et côté serveur.

## Métriques affichées par l'application

D'après les métriques affichées directement dans l'interface :

- Poids HTML : 1 kB
- Poids page : environ 7 323 à 7 374 kB selon le moment de la capture
- Ressources : entre 97 et 250 selon le moment de la mesure
- JS : 191 kB
- CSS : 7 092,7 kB
- Images : 7 093 kB
- DOM : 185 éléments
- Cache hit : entre -1 % et 1 %
- RAM serveur : 64 MB
- CPU : 17,55
- RPS : 7
- Load page : 180 002 ms

Capture :

- `screenshots/01-initial-metrics.png`

## Principaux problèmes identifiés

1. L'image de fond `large.jpg` est lourde et chargée dès l'ouverture de la page.
2. Le fichier CSS `big.css` représente environ 7 MB, ce qui est très élevé pour une feuille de style.
3. Le fichier JavaScript `big.js` est chargé dynamiquement alors qu'il semble surtout servir à alourdir la page.
4. L'application déclenche régulièrement des appels API vers `/api/payload`, ce qui augmente le nombre de requêtes réseau.
5. Le payload API est volumineux et renvoyé plusieurs fois, ce qui consomme inutilement de la bande passante.
6. L'animation 3D avec Three.js tourne en continu, ce qui augmente la consommation CPU/GPU.
7. Le score Lighthouse Performance est faible à cause du temps de chargement, du Total Blocking Time et du Speed Index.
8. Le cache semble peu efficace, avec un taux affiché proche de 0 %.
9. Plusieurs dépendances lourdes sont présentes dans le projet, comme `three`, `moment`, `jquery`, `bootstrap`, `recharts` et `victory`. Certaines peuvent être inutiles ou remplaçables.

## Justification des constats

Les captures d'écran montrent :

- un score Lighthouse Performance de 25 / 100 ;
- un First Contentful Paint de 5,3 s ;
- un Largest Contentful Paint de 9,6 s ;
- un Total Blocking Time de 5 120 ms ;
- 248 requêtes réseau ;
- 7,7 MB transférés ;
- 180 MB de ressources ;
- une page affichant environ 7 MB de CSS et 7 MB d'images ;
- des appels `fetch` répétés vers le backend.

Ces résultats confirment que l'application fonctionne, mais qu'elle consomme trop de ressources pour le service rendu.

## Conclusion initiale

L'application présente plusieurs problèmes d'écoconception : ressources trop lourdes, appels réseau répétés, cache inefficace et rendu 3D continu. Les optimisations prioritaires seront la réduction des assets, la suppression des chargements inutiles, la limitation des appels API, l'amélioration du cache et la simplification du rendu animé.
