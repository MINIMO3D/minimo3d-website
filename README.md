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

## Preisrechner und Bestellung

- Seite `/preisrechner`: Upload (STL, STP/STEP, OBJ, 3MF), 3D-Ansicht, Fertigungsanalyse mit PDF, Sofortpreis, Bestellung.
- Preise, Rabatte, Versand und Bauraum stehen im Admin-Bereich unter Preisrechner › Preise und Einstellungen.
- Je Material: Preis je kg, Dichte, Zeit- und Preisfaktor und Farben unter Inhalte › Materialien › Preisrechner.
- Bestellungen und hochgeladene Dateien stehen unter Preisrechner › Bestellungen.
- Stripe: `./scripts/set-stripe-key.sh` trägt den geheimen Schlüssel ein. Ohne Schlüssel zeigt der Rechner den Preis, die Bestellung läuft dann als Anfrage.
- Optional für Stripe-Webhooks: `STRIPE_WEBHOOK_SECRET` in `.env`, Ziel `https://DOMAIN/rechner/stripe-webhook`, Ereignis `checkout.session.completed`.
- E-Mail: `./scripts/set-smtp.sh` trägt die Zugangsdaten eines Postfachs ein (Bestellbestätigung, Passwort zurücksetzen, Hinweis bei neuer Bestellung oder Anfrage). Ohne Zugangsdaten sendet die Website keine E-Mails.
- Kundenkonto: `/konto` (Privat- und Geschäftskunden). Rabatt und Kauf auf Rechnung je Geschäftskunde im Admin-Bereich unter Kunden. Kundenkonten haben keinen Zugang zum Admin-Bereich.

## Noch offen

- E-Mail-Benachrichtigung bei neuen Anfragen und Bestellungen (SMTP)
- Newsletter
- Versand ins EU-Ausland im Preisrechner
