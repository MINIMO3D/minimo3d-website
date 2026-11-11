#!/bin/sh
# Trägt den geheimen Stripe-Schlüssel in die Datei .env ein und startet die Website neu.
# Der Schlüssel wird beim Tippen nicht angezeigt und landet nirgends sonst.
set -e
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Die Datei .env fehlt. Bitte zuerst ./scripts/setup-env.sh ausführen."; exit 1; }

printf "Geheimer Stripe-Schlüssel (beginnt mit sk_test_ oder sk_live_ oder rk_): "
stty -echo 2>/dev/null || true
read -r KEY
stty echo 2>/dev/null || true
echo

case "$KEY" in
  sk_test_*|sk_live_*|rk_test_*|rk_live_*) ;;
  *) echo "Das sieht nicht nach einem geheimen Stripe-Schlüssel aus. Nichts geändert."; exit 1 ;;
esac

umask 077
grep -v '^STRIPE_SECRET_KEY=' .env > .env.tmp || true
printf 'STRIPE_SECRET_KEY=%s\n' "$KEY" >> .env.tmp
mv .env.tmp .env
unset KEY

docker compose up -d
echo "Stripe-Schlüssel gespeichert. Die Website wurde neu gestartet."
