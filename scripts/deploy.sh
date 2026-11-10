#!/bin/sh
# Holt den neuesten Stand von GitHub und startet die Website neu.
set -e
cd "$(dirname "$0")/.."
git pull --ff-only
docker compose up -d --build
docker compose ps
