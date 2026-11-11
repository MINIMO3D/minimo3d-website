#!/bin/sh
# Richtet den E-Mail-Versand der Website ein (Bestellbestätigungen, Passwort zurücksetzen, Hinweise an Sie).
# Die Zugangsdaten eines Postfachs werden in die Datei .env geschrieben. Das Passwort wird beim Tippen nicht angezeigt.
set -e
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Die Datei .env fehlt. Bitte zuerst ./scripts/setup-env.sh ausführen."; exit 1; }

echo "E-Mail-Versand einrichten. Eingabetaste übernimmt den Wert in eckigen Klammern."
printf "SMTP-Server [smtp.ionos.de]: "; read -r HOST; HOST=${HOST:-smtp.ionos.de}
printf "Port [587]: "; read -r PORT; PORT=${PORT:-587}
printf "Postfach (E-Mail-Adresse, z. B. support@minimo3d.com): "; read -r MAILUSER
printf "Passwort des Postfachs: "
stty -echo 2>/dev/null || true
read -r PASS
stty echo 2>/dev/null || true
echo

case "$MAILUSER" in
  *@*.*) ;;
  *) echo "Das Postfach muss eine E-Mail-Adresse sein. Nichts geändert."; exit 1 ;;
esac
[ -n "$PASS" ] || { echo "Kein Passwort eingegeben. Nichts geändert."; exit 1; }
case "$PASS" in
  *"'"*) echo "Das Passwort enthält ein einfaches Anführungszeichen ('). Bitte vergeben Sie für das Postfach ein Passwort ohne dieses Zeichen. Nichts geändert."; exit 1 ;;
esac
case "$PORT" in
  ''|*[!0-9]*) echo "Der Port muss eine Zahl sein. Nichts geändert."; exit 1 ;;
esac

umask 077
grep -v -e '^SMTP_HOST=' -e '^SMTP_PORT=' -e '^SMTP_USER=' -e '^SMTP_PASS=' -e '^SMTP_FROM=' .env > .env.tmp || true
{
  printf 'SMTP_HOST=%s\n' "$HOST"
  printf 'SMTP_PORT=%s\n' "$PORT"
  printf 'SMTP_USER=%s\n' "$MAILUSER"
  # einfache Anführungszeichen, damit Sonderzeichen im Passwort erhalten bleiben
  printf "SMTP_PASS='%s'\n" "$PASS"
  printf 'SMTP_FROM=%s\n' "$MAILUSER"
} >> .env.tmp
mv .env.tmp .env
unset PASS

docker compose up -d
echo "Gespeichert. Die Website wurde neu gestartet."
echo "Test: Auf der Website unter Login > Passwort vergessen die Adresse eines Kundenkontos eingeben."
echo "Fehler stehen im Protokoll: docker compose logs app --tail 50"
