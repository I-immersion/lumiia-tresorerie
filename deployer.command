#!/bin/bash
cd "$(dirname "$0")"

echo "===================================="
echo "  LUMIIA TRESORERIE — Déploiement"
echo "===================================="

# 1. Installer les dépendances si besoin
if [ ! -d "functions/node_modules" ]; then
  echo "→ Installation des dépendances..."
  cd functions && npm install && cd ..
fi

# 2. Déployer la Cloud Function
echo "→ Déploiement Cloud Function Firebase..."
firebase deploy --only functions

# 3. Récupérer l'URL de la fonction et mettre à jour index.html
FUNCTION_URL="https://europe-west1-lumiia-live.cloudfunctions.net/pennylane"
sed -i '' "s|PROXY_URL_ICI|${FUNCTION_URL}|g" index.html

# 4. Pousser sur GitHub
echo "→ Push GitHub Pages..."
git add -A
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push

echo ""
echo "✅ Déployé !"
echo "   App : https://i-immersion.github.io/lumiia-tresorerie/"
echo "   Proxy : ${FUNCTION_URL}"
