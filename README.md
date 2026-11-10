# MINIMO3D Website

Website für MINIMO3D (minimo3d.com), gebaut mit Payload CMS 3 und Next.js.

## Aufbau

- `src/collections`, `src/globals`: Inhaltsmodell (Leistungen, Materialien, Wissen, Seiten, Bilder, Anfragen, Startseite, Firmendaten)
- `src/app/(frontend)`: die öffentliche Website
- `src/app/(payload)`: der Admin-Bereich unter `/admin`
- `src/seed`: Erstbefüllung einer leeren Datenbank mit den Inhalten der bisherigen Website
- `src/migrations`: Datenbank-Migrationen, laufen beim Start automatisch
- `compose.yml`, `Dockerfile`, `Caddyfile`: Betrieb auf dem Server (PostgreSQL 17, App, Caddy)

## Auf dem Server starten

```sh
./scripts/setup-env.sh     # einmalig: legt .env mit zufälligen Passwörtern an
docker compose up -d --build
```

Danach ist die Website über die IP-Adresse des Servers erreichbar und der Admin-Bereich unter `/admin`.
Beim ersten Aufruf von `/admin` wird das Admin-Konto angelegt.

## Aktualisieren

```sh
./scripts/deploy.sh
```

## Domain verbinden

In `.env` die Zeile `SITE_ADDRESS=:80` durch `SITE_ADDRESS=minimo3d.com, www.minimo3d.com` ersetzen,
die Domain per DNS auf den Server zeigen lassen und `docker compose up -d` ausführen.
Caddy holt das HTTPS-Zertifikat selbst.

## Nach Änderungen am Inhaltsmodell

```sh
npx payload migrate:create kurzer-name
npx payload generate:types
```

## Noch offen (Phase 2)

- Preisrechner mit Festpreis und Stripe-Checkout
- E-Mail-Benachrichtigung bei neuen Anfragen (SMTP)
- Newsletter
