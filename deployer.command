#!/bin/bash
cd "$(dirname "$0")"

echo "===================================="
echo "  LUMIIA TRESORERIE — Déploiement"
echo "===================================="

echo "→ Déploiement Cloud Function Firebase..."
firebase deploy --only functions:pennylane

echo "→ Push GitHub Pages..."
git add -A
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push

echo ""
echo "✅ Déployé !"
echo "   App : https://i-immersion.github.io/lumiia-tresorerie/"
echo "   Proxy : https://europe-west1-lumiia-live.cloudfunctions.net/pennylane"
