#!/bin/sh
# Legt einmalig die Datei .env mit zufälligen Passwörtern an.
set -e
cd "$(dirname "$0")/.."
if [ -f .env ]; then
  echo ".env gibt es schon. Nichts geändert."
  exit 0
fi
umask 077
cat > .env <<ENV
POSTGRES_PASSWORD=$(openssl rand -hex 24)
PAYLOAD_SECRET=$(openssl rand -hex 32)
SITE_ADDRESS=:80
ENV
echo ".env angelegt."
