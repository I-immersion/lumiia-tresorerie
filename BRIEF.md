# BRIEF PRODUIT — LUMIIA Trésorerie

## Pourquoi cette application existe

Pennylane est utilisé pour les factures, devis, banque et comptabilité.
Mais Pennylane fait mal deux choses essentielles :
- L'interface n'est pas visuelle — pas de graphiques, pas de courbes, pas de camemberts
- La gestion de trésorerie est superficielle malgré l'abonnement (~50€/mois)

Cette app est un **outil de pilotage financier visuel**, synchronisé en temps réel avec
Pennylane via son API, qui fait ce que Pennylane ne fait pas bien.

## Profil utilisateur

- Emmanuel, dirigeant LUMIIA
- TPE bar, 3-4 salariés à venir (jamais 15)
- Très visuel — a besoin de voir les chiffres en graphiques, pas en tableaux
- Pas expert finance — l'outil doit l'aider à penser à tout

## Ce que l'app doit faire (roadmap par blocs)

### Bloc 1 — Vision temps réel ✅ (v1.3)
Solde, factures en cours, charges fournisseurs, alertes retard.

### Bloc 2 — Historique graphique (à faire)
Courbe de trésorerie sur 3/6/12 mois, camembert des dépenses par catégorie,
comparaison mois/mois. C'est le gros manque visuel actuel.

### Bloc 3 — Projection future (à faire)
Solde prévu à 30/60/90 jours : charges connues (Pennylane) + récurrences détectées
+ saisies manuelles. Courbe "trésorerie prévisionnelle".

### Bloc 4 — Saisie intelligente des dépenses (à faire)
- Détection automatique des récurrences dans les transactions Pennylane
- Checklist des postes standards (eau, loyer, assurance, consommables bar...)
- Questions contextuelles : "tu as prévu du réassort ce mois-ci ?"
- Estimation mensuelle depuis les factures existantes, modifiable

### Bloc 5 — Alertes & pilotage (à faire)
Seuil d'alerte trésorerie, notification si projection passe sous X€,
rappels paiements à venir.

## Principes d'architecture

- App **indépendante** de Workspace — connexion future = juste un bouton, pas avant
- Données financières : jamais dans Firebase, toujours via Cloud Function → API Pennylane
- Code extensible par blocs — chaque nouveau bloc ne remet pas en question les précédents
- Stack : HTML/CSS/JS vanilla, Firebase Auth, Cloud Function proxy Pennylane

## État technique actuel

- **Version déployée** : v1.3 — https://i-immersion.github.io/lumiia-tresorerie/
- **Firebase Auth** : actif (email/password, 3 comptes)
- **Cloud Function** : sécurisée, vérifie le token Firebase Auth avant d'appeler Pennylane
- **Repo** : https://github.com/i-immersion/lumiia-tresorerie
- **Chemin local** : /Users/emmanuelexbrayat/Dropbox/DB LUMIIA 2025/Outils APP Claude/lumiia-tresorerie
- **Déploiement** : deployer.command (double-clic)
- **Cloud Function deploy** : `firebase deploy --only functions:pennylane` depuis le chemin local
