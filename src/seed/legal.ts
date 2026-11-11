import { h2, h3, p, rt, ul } from './lexical'

// Rechtstexte, zugeschnitten auf diese Website (Stand November 2026).
// Entwürfe: vor dem Livegang von einer Anwältin oder einem Anwalt prüfen lassen.

export const LEGAL_PLACEHOLDER = 'muss noch aus der bisherigen Website übernommen werden'
export const LEGAL_PLACEHOLDER_2 = 'müssen noch aus der bisherigen Website übernommen werden'

export const impressum = rt(
  h2('Angaben gemäß § 5 DDG'),
  p('MINIMO3D'),
  p('Inhaber: Daniele Bucci (Einzelunternehmen)'),
  p('Kirchstraße 65, 73765 Neuhausen auf den Fildern, Deutschland'),
  h2('Kontakt'),
  p('Telefon: +49 7158 6883442'),
  p('E-Mail: support@minimo3d.com'),
  h2('Umsatzsteuer-Identifikationsnummer'),
  p('Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE286185561'),
  h2('Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV'),
  p('Daniele Bucci, Kirchstraße 65, 73765 Neuhausen auf den Fildern'),
  h2('Verbraucherstreitbeilegung'),
  p('Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'),
  h2('Haftung für Inhalte'),
  p('Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung von Informationen nach den allgemeinen Gesetzen bleiben unberührt. Sobald uns eine konkrete Rechtsverletzung bekannt wird, entfernen wir den betreffenden Inhalt umgehend.'),
  h2('Haftung für Links'),
  p('Diese Website enthält Links zu Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist der jeweilige Anbieter verantwortlich. Bei der Verlinkung waren keine Rechtsverstöße erkennbar. Sobald uns Rechtsverletzungen bekannt werden, entfernen wir die betreffenden Links umgehend.'),
  h2('Urheberrecht'),
  p('Die Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Verwertung außerhalb der Grenzen des Urheberrechts brauchen unsere schriftliche Zustimmung. Dateien, die Kunden uns übermitteln, bleiben Eigentum der Kunden.'),
)

export const datenschutz = rt(
  p('Mit dieser Erklärung informieren wir Sie nach Art. 13 der Datenschutz-Grundverordnung (DSGVO) darüber, welche personenbezogenen Daten wir auf dieser Website verarbeiten, wozu und auf welcher Rechtsgrundlage.'),

  h2('1. Verantwortlicher'),
  p('MINIMO3D, Inhaber Daniele Bucci, Kirchstraße 65, 73765 Neuhausen auf den Fildern, Deutschland. Telefon: +49 7158 6883442, E-Mail: support@minimo3d.com.'),
  p('Ein Datenschutzbeauftragter ist nicht bestellt, da hierzu keine gesetzliche Pflicht besteht. Für alle Fragen zum Datenschutz erreichen Sie uns unter den genannten Kontaktdaten.'),

  h2('2. Das Wichtigste in Kürze'),
  ul([
    'Diese Website verwendet keine Analyse-, Werbe- oder Tracking-Dienste. Für Besucher setzen wir keine Cookies. Nur wenn Sie sich im Kundenkonto anmelden, setzen wir ein technisch notwendiges Anmelde-Cookie.',
    'Schriften, Bilder und Videos liefern wir vom eigenen Server aus. Es werden keine Inhalte von Google, YouTube oder sozialen Netzwerken eingebunden.',
    'Wir verarbeiten Ihre Daten nur, wenn Sie uns kontaktieren, den Preisrechner nutzen, ein Kundenkonto anlegen oder bestellen.',
    'Die Website und alle hochgeladenen Dateien liegen auf einem Server in Deutschland.',
  ]),

  h2('3. Aufruf der Website und Hosting'),
  p('Beim Aufruf der Website überträgt Ihr Browser technisch notwendige Verbindungsdaten an unseren Server: IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite und Angaben zu Browser und Betriebssystem. Diese Daten brauchen wir, um Ihnen die Website auszuliefern und um den Betrieb und die Sicherheit zu gewährleisten. Wir führen sie nicht mit anderen Daten zusammen und erstellen keine Nutzungsprofile.'),
  p('Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. f DSGVO. Unser berechtigtes Interesse ist der sichere und störungsfreie Betrieb der Website.'),
  p('Die Website wird auf einem Server der IONOS SE, Elgendorfer Straße 57, 56410 Montabaur, in einem Rechenzentrum in Deutschland betrieben. Mit IONOS besteht ein Vertrag über die Auftragsverarbeitung nach Art. 28 DSGVO.'),

  h2('4. Kontakt und Anfrageformular'),
  p('Wenn Sie uns über das Anfrageformular, per E-Mail oder telefonisch kontaktieren, verarbeiten wir Ihre Angaben, um Ihre Anfrage zu bearbeiten. Im Formular sind das Name, E-Mail-Adresse, Ihre Nachricht und, wenn Sie sie angeben, Firma und hochgeladene Dateien wie 3D-Modelle, Zeichnungen oder Fotos.'),
  p('Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO, soweit Ihre Anfrage auf ein Angebot oder einen Vertrag zielt, im Übrigen Art. 6 Abs. 1 Buchst. f DSGVO. Unser berechtigtes Interesse ist die Beantwortung Ihrer Anfrage.'),
  p('Anfragen und zugehörige Dateien löschen wir automatisch nach zwölf Monaten, auf Ihren Wunsch auch früher. Entsteht aus der Anfrage ein Auftrag, gelten die Fristen für Aufträge.'),

  h2('5. Preisrechner'),
  p('Wenn Sie im Preisrechner eine 3D-Datei hochladen, wird sie auf unseren Server in Deutschland übertragen. Dort berechnen wir Abmessungen, Volumen und Oberfläche, prüfen die Druckbarkeit und ermitteln den Preis. Für die Berechnung müssen Sie keine persönlichen Angaben machen.'),
  p('Zum Schutz vor Missbrauch begrenzen wir die Zahl der Uploads je Anschluss. Dazu wird Ihre IP-Adresse für höchstens zehn Minuten im Arbeitsspeicher des Servers gehalten und nicht dauerhaft gespeichert.'),
  p('Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO (vorvertragliche Maßnahmen auf Ihre Anfrage) und Art. 6 Abs. 1 Buchst. f DSGVO (Schutz vor Missbrauch).'),
  p('Bestellen Sie nicht, löschen wir die Datei und die Berechnung nach sieben Tagen. Bestellen Sie, wird die Datei Teil Ihres Auftrags. Sind Sie beim Hochladen in Ihrem Kundenkonto angemeldet, bleibt die Datei dort gespeichert, bis Sie sie entfernen oder Ihr Konto löschen.'),

  h2('6. Bestellung und Vertragsabwicklung'),
  p('Bei einer Bestellung verarbeiten wir die Angaben zu Ihrem Auftrag (Datei, Material, Ausführung, Stückzahl, Preis, Lieferart, Ihr Hinweis zum Auftrag, bei Geschäftskunden auch Bestellreferenz und Kostenstelle) sowie die Daten, die Sie im Bestellschritt angeben oder die aus Ihrem Kundenkonto übernommen werden: Name, E-Mail-Adresse, Rechnungs- und Lieferadresse und, wenn Sie sie angeben, Telefonnummer, Firma und Umsatzsteuer-Identifikationsnummer.'),
  p('Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO (Vertragserfüllung). Für die Aufbewahrung von Rechnungen und Buchungsunterlagen ist Rechtsgrundlage Art. 6 Abs. 1 Buchst. c DSGVO in Verbindung mit § 147 Abgabenordnung und § 257 Handelsgesetzbuch.'),

  h2('7. Kundenkonto'),
  p('Ein Kundenkonto ist freiwillig. Sie können weiterhin ohne Konto anfragen und bestellen. Wenn Sie ein Konto anlegen, speichern wir Ihren Namen, Ihre E-Mail-Adresse, Ihr Passwort in verschlüsselter Form (als Hashwert, den wir nicht zurückrechnen können) und, wenn Sie sie angeben, Telefonnummer, Rechnungs- und Lieferadresse. Bei Geschäftskundenkonten speichern wir zusätzlich Firma und Umsatzsteuer-Identifikationsnummer sowie die mit Ihnen vereinbarten Konditionen (Rabatt, Kauf auf Rechnung).'),
  p('Im Konto sehen Sie Ihre Bestellungen mit Status und Ihre im Preisrechner hochgeladenen Dateien. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO (Nutzungsvertrag über das Kundenkonto und Abwicklung Ihrer Bestellungen).'),
  h3('Anmeldung und Schutz des Kontos'),
  p('Bei der Anmeldung setzen wir ein Cookie, das Sie als angemeldet ausweist (siehe Abschnitt 10). Zum Schutz vor unbefugten Zugriffen zählen wir Fehlversuche je Konto und sperren es nach mehreren Fehlversuchen für zehn Minuten. Außerdem begrenzen wir die Zahl der Anmelde- und Registrierungsversuche je Anschluss. Dazu wird Ihre IP-Adresse für höchstens eine Stunde im Arbeitsspeicher des Servers gehalten und nicht dauerhaft gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. f DSGVO. Unser berechtigtes Interesse ist die Sicherheit der Kundenkonten.'),
  h3('Prüfung der Umsatzsteuer-Identifikationsnummer'),
  p('Bei Geschäftskundenkonten prüfen wir die angegebene Umsatzsteuer-Identifikationsnummer über das MwSt-Informationsaustauschsystem (VIES) der Europäischen Kommission. Dabei übermitteln wir nur die Nummer selbst. Die Kommission meldet zurück, ob die Nummer gültig ist. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. f DSGVO. Unser berechtigtes Interesse ist es, Geschäftskundenkonten nur Unternehmern einzurichten und Rechnungen korrekt auszustellen.'),
  h3('Kauf auf Rechnung'),
  p('Den Kauf auf Rechnung schalten wir für Geschäftskunden von Hand frei. Wir holen dafür keine Auskünfte bei Auskunfteien ein und treffen keine automatisierte Entscheidung.'),
  h3('E-Mails zum Konto und zu Bestellungen'),
  p('Wir senden Ihnen die E-Mails, die für Konto und Bestellung nötig sind: die Bestätigung der Registrierung, Bestellbestätigungen und, auf Ihre Anforderung, den Link zum Zurücksetzen des Passworts. Der Versand läuft über unser E-Mail-Postfach bei unserem Hoster. Werbung senden wir darüber nicht.'),
  h3('Konto löschen'),
  p('Sie können Ihr Konto jederzeit im Bereich „Profil“ selbst löschen oder uns damit beauftragen. Dabei löschen wir Ihre Kontodaten und Ihre gespeicherten Dateien, soweit sie nicht zu einem Auftrag gehören. Daten zu abgeschlossenen Aufträgen bewahren wir ohne Bezug zum Konto weiter auf, soweit wir dazu gesetzlich verpflichtet sind (Abschnitt 13).'),

  h2('8. Zahlung über Stripe'),
  p('Die Zahlung wickeln wir über den Zahlungsdienst Stripe ab. Anbieter für Kunden in Europa ist die Stripe Payments Europe, Limited, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland. Für die Zahlung werden Sie auf eine Seite von Stripe weitergeleitet. Damit Sie Ihre Angaben dort nicht erneut eingeben müssen, übermitteln wir Stripe die Daten aus dem Bestellschritt: Name, E-Mail-Adresse, Rechnungs- und Lieferadresse und, wenn angegeben, Telefonnummer, Firma und Umsatzsteuer-Identifikationsnummer. Ihre Zahlungsdaten geben Sie bei Stripe ein. Ihre Zahlungsdaten, etwa Kartennummern, erhalten und speichern wir nicht. Stripe teilt uns mit, ob die Zahlung erfolgt ist, und übermittelt uns Name, E-Mail-Adresse, Telefonnummer und Adresse für die Abwicklung des Auftrags.'),
  p('Stripe verarbeitet Zahlungsdaten in eigener Verantwortung, unter anderem zur Betrugsprävention, und setzt auf seiner Bezahlseite eigene Cookies ein. Dabei können Daten an verbundene Unternehmen in den USA übermittelt werden. Stripe stützt diese Übermittlung auf das EU-U.S. Data Privacy Framework und auf Standardvertragsklauseln der EU-Kommission. Einzelheiten finden Sie in der Datenschutzerklärung von Stripe unter https://stripe.com/de/privacy.'),
  p('Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO (Zahlungsabwicklung für Ihren Vertrag). Beim Kauf auf Rechnung nutzen wir Stripe nicht.'),

  h2('9. Versand'),
  p('Für den Versand geben wir Ihren Namen und Ihre Lieferadresse an das Versandunternehmen weiter, derzeit die DHL Paket GmbH, Sträßchensweg 10, 53113 Bonn. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO. Ihre E-Mail-Adresse oder Telefonnummer geben wir für Paketankündigungen nur weiter, wenn Sie dem zugestimmt haben.'),

  h2('10. Cookies und Speicherung auf Ihrem Gerät'),
  p('Für Besucher dieser Website setzen wir keine Cookies. Wir verwenden keine Cookies zu Analyse- oder Werbezwecken.'),
  p('Wenn Sie sich in Ihrem Kundenkonto anmelden, setzen wir ein einziges Cookie mit dem Namen „payload-token“. Es enthält ein verschlüsselt signiertes Anmeldekennzeichen und sorgt dafür, dass Sie beim Wechsel zwischen den Seiten angemeldet bleiben. Es ist für Skripte nicht auslesbar und wird beim Abmelden gelöscht, spätestens nach 14 Tagen.'),
  p('Dieses Cookie ist unbedingt erforderlich, um Ihnen das von Ihnen gewünschte Kundenkonto bereitzustellen. Eine Einwilligung ist nach § 25 Abs. 2 Nr. 2 TDDDG deshalb nicht erforderlich, und es erscheint kein Cookie-Banner. Die Bezahlseite von Stripe liegt außerhalb unserer Website und unterliegt den Regeln von Stripe.'),

  h2('11. Links zu sozialen Netzwerken und anderen Websites'),
  p('Unsere Website enthält einfache Links zu unseren Profilen bei LinkedIn, Instagram und Facebook. Daten werden erst übertragen, wenn Sie einen solchen Link anklicken. Dann gelten die Datenschutzbestimmungen des jeweiligen Anbieters.'),

  h2('12. Empfänger Ihrer Daten'),
  p('Ihre Daten erhalten nur die Stellen, die wir für die genannten Zwecke brauchen: unser Hoster (IONOS SE), der Zahlungsdienst (Stripe), das Versandunternehmen (DHL), bei Geschäftskunden die Europäische Kommission für die Prüfung der Umsatzsteuer-Identifikationsnummer sowie unsere Steuerberatung und Finanzbehörden im Rahmen gesetzlicher Pflichten. Wir verkaufen keine Daten und geben sie nicht zu Werbezwecken weiter.'),

  h2('13. Speicherdauer'),
  ul([
    '**Anfragen über das Formular:** zwölf Monate.',
    '**Berechnungen im Preisrechner ohne Bestellung und ohne Kundenkonto:** sieben Tage.',
    '**Kundenkonto und darin gespeicherte Dateien:** bis Sie die Datei entfernen oder das Konto löschen.',
    '**Aufträge, Rechnungen und Buchungsunterlagen:** nach den handels- und steuerrechtlichen Aufbewahrungsfristen, je nach Unterlage sechs bis zehn Jahre.',
    '**3D-Dateien zu Aufträgen:** solange wir sie für den Auftrag, für Nachbestellungen und für mögliche Gewährleistungsfälle brauchen. Auf Ihren Wunsch löschen wir sie früher.',
  ]),

  h2('14. Ihre Rechte'),
  p('Sie haben das Recht auf Auskunft über Ihre bei uns gespeicherten Daten (Art. 15 DSGVO), auf Berichtigung (Art. 16), auf Löschung (Art. 17), auf Einschränkung der Verarbeitung (Art. 18) und auf Datenübertragbarkeit (Art. 20). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3).'),
  h3('Widerspruchsrecht'),
  p('Soweit wir Ihre Daten auf Grundlage berechtigter Interessen nach Art. 6 Abs. 1 Buchst. f DSGVO verarbeiten, können Sie dieser Verarbeitung aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO).'),
  p('Um Ihre Rechte auszuüben, genügt eine formlose Nachricht an support@minimo3d.com.'),
  h3('Beschwerde bei einer Aufsichtsbehörde'),
  p('Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel an Ihrem Wohnort. Für uns zuständig ist der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg, Lautenschlagerstraße 20, 70173 Stuttgart, https://www.baden-wuerttemberg.datenschutz.de.'),

  h2('15. Pflicht zur Angabe von Daten'),
  p('Sie können die Website nutzen, ohne persönliche Angaben zu machen. Für eine Anfrage brauchen wir Name, E-Mail-Adresse und Ihre Nachricht, für ein Kundenkonto Name, E-Mail-Adresse und Passwort, für ein Geschäftskundenkonto zusätzlich Firma, Rechnungsadresse und Umsatzsteuer-Identifikationsnummer, für eine Bestellung die Angaben, die für Vertrag, Zahlung und Lieferung nötig sind. Ohne diese Angaben können wir die Anfrage oder Bestellung nicht bearbeiten und das Konto nicht einrichten.'),

  h2('16. Keine automatisierte Entscheidung'),
  p('Eine automatisierte Entscheidungsfindung im Sinne von Art. 22 DSGVO, einschließlich Profiling, findet nicht statt. Der Preisrechner berechnet den Preis allein aus der Geometrie der Datei und der gewählten Ausführung.'),

  h2('17. Sicherheit'),
  p('Die Übertragung zwischen Ihrem Browser und unserem Server ist verschlüsselt (TLS). Hochgeladene Dateien sind nur für uns und, im Kundenkonto, für Sie selbst zugänglich. Passwörter speichern wir nur als Hashwert.'),

  h2('18. Stand und Änderungen'),
  p('Stand: November 2026. Wir passen diese Erklärung an, wenn sich die Website oder die Rechtslage ändert.'),
)

export const agb = rt(
  p('Allgemeine Geschäftsbedingungen von MINIMO3D, Inhaber Daniele Bucci, Kirchstraße 65, 73765 Neuhausen auf den Fildern (im Folgenden „wir“).'),

  h2('§ 1 Geltungsbereich'),
  p('(1) Diese Bedingungen gelten für alle Verträge über 3D-Druck, 3D-Scan, Konstruktions- und Beratungsleistungen, die Verbraucher und Unternehmer (im Folgenden „Kunde“) mit uns schließen, über den Preisrechner auf dieser Website, per Anfrage, E-Mail oder Telefon.'),
  p('(2) Verbraucher ist, wer den Vertrag zu Zwecken schließt, die überwiegend weder seiner gewerblichen noch seiner selbständigen beruflichen Tätigkeit zugerechnet werden können. Unternehmer ist, wer bei Vertragsschluss in Ausübung seiner gewerblichen oder selbständigen beruflichen Tätigkeit handelt.'),
  p('(3) Abweichende Bedingungen des Kunden gelten nur, wenn wir ihnen ausdrücklich zugestimmt haben.'),

  h2('§ 2 Vertragsschluss'),
  p('(1) Die Darstellung unserer Leistungen und die Preisanzeige im Preisrechner sind noch kein bindendes Angebot.'),
  p('(2) Bestellung über den Preisrechner: Nach Auswahl der Ausführung gibt der Kunde seine Kontakt- und Adressdaten an. Anschließend leiten wir ihn zur Bezahlseite unseres Zahlungsdienstes weiter. Bis zum Abschluss des Bezahlvorgangs kann er seine Angaben prüfen und berichtigen. Mit dem Abschluss des Bezahlvorgangs gibt der Kunde ein verbindliches Angebot ab. Wir nehmen es an, indem wir die Bestellung per E-Mail bestätigen oder mit der Fertigung beginnen, spätestens innerhalb von drei Werktagen. Nehmen wir das Angebot nicht an, erstatten wir die Zahlung unverzüglich und vollständig.'),
  p('(3) Bestellung auf Rechnung: Für den Kauf auf Rechnung freigeschaltete Geschäftskunden können im Preisrechner ohne Bezahlvorgang bestellen. Vor dem Absenden sehen sie alle Angaben und können sie berichtigen. Mit dem Klick auf „Zahlungspflichtig bestellen“ gibt der Kunde ein verbindliches Angebot ab. Wir nehmen es an, indem wir die Bestellung per E-Mail bestätigen oder mit der Fertigung beginnen, spätestens innerhalb von drei Werktagen.'),
  p('(4) Anfrage: Auf eine Anfrage erstellen wir ein Angebot. Der Vertrag kommt zustande, wenn der Kunde dieses Angebot in Textform annimmt.'),
  p('(5) Kundenkonto: Ein Kundenkonto ist freiwillig und kostenlos. Der Kunde macht bei der Registrierung wahrheitsgemäße Angaben, hält sie aktuell und bewahrt seine Zugangsdaten vertraulich auf. Geschäftskundenkonten richten wir nur für Unternehmer ein; dafür ist eine gültige Umsatzsteuer-Identifikationsnummer anzugeben. Der Kunde kann sein Konto jederzeit löschen. Wir können ein Konto sperren, wenn es missbräuchlich oder mit falschen Angaben genutzt wird.'),
  p('(6) Vertragssprache ist Deutsch. Wir speichern die Bestelldaten. Der Kunde erhält sie mit der Bestellbestätigung und kann sie, wenn er angemeldet bestellt hat, in seinem Kundenkonto einsehen. Diese Bedingungen sind auf unserer Website jederzeit abrufbar.'),

  h2('§ 3 Dateien und Vorgaben des Kunden'),
  p('(1) Wir fertigen nach den Dateien und Vorgaben des Kunden. Der Kunde ist dafür verantwortlich, dass seine Konstruktion für den vorgesehenen Zweck geeignet ist. Eine Prüfung der Konstruktion auf Funktion, Festigkeit oder Sicherheit schulden wir nur, wenn das ausdrücklich vereinbart ist.'),
  p('(2) Die Fertigungsanalyse im Preisrechner ist eine automatische Vorprüfung auf Druckbarkeit. Sie ersetzt keine Konstruktionsprüfung und begründet keine Zusage bestimmter Eigenschaften.'),
  p('(3) Der Kunde versichert, dass er zur Nutzung der übermittelten Dateien berechtigt ist und ihre Fertigung keine Rechte Dritter und keine gesetzlichen Verbote verletzt. Er stellt uns von Ansprüchen Dritter frei, die auf einer Verletzung dieser Zusicherung beruhen, soweit er die Verletzung zu vertreten hat.'),
  p('(4) Wir fertigen keine Waffen, wesentlichen Waffenteile oder sonst gesetzlich verbotenen Gegenstände. Solche Aufträge lehnen wir ab und erstatten bereits geleistete Zahlungen.'),
  p('(5) Stellt sich bei unserer Prüfung heraus, dass ein Teil nicht oder nicht in der bestellten Ausführung herstellbar ist, stimmen wir eine Änderung mit dem Kunden ab. Kommt keine Einigung zustande, können beide Seiten vom Vertrag zurücktreten. Geleistete Zahlungen erstatten wir dann vollständig.'),

  h2('§ 4 Preise, Versandkosten und Zahlung'),
  p('(1) Alle Preise auf der Website sind Endpreise in Euro einschließlich der gesetzlichen Umsatzsteuer. Angemeldeten Geschäftskunden zeigen wir zusätzlich die Nettopreise; Umsatzsteuer und Bruttobetrag sind vor Abgabe der Bestellung gesondert ausgewiesen. Im Preisrechner fällt je Bestellung eine Auftragspauschale für Prüfung, Abwicklung und Verpackung an. Sie ist im angezeigten Gesamtpreis enthalten.'),
  p('(2) Versandkosten zeigen wir vor Abgabe der Bestellung gesondert an. Die Abholung in Neuhausen auf den Fildern ist kostenlos.'),
  p('(3) Bei Bestellungen über den Preisrechner ist die Zahlung sofort fällig und erfolgt über die auf der Bezahlseite angebotenen Zahlungsarten. Bei Aufträgen auf Angebot gilt die dort genannte Zahlungsweise.'),
  p('(4) Kauf auf Rechnung bieten wir Geschäftskunden nach unserer Freischaltung an. Ein Anspruch darauf besteht nicht. Der Rechnungsbetrag ist ohne Abzug innerhalb der im Kundenkonto und auf der Rechnung genannten Frist zu zahlen, ohne besondere Vereinbarung innerhalb von 14 Tagen ab Rechnungsdatum. Bei Zahlungsverzug oder begründeten Zweifeln an der Zahlungsfähigkeit können wir die Freischaltung für künftige Bestellungen widerrufen.'),
  p('(5) Ein mit einem Geschäftskunden vereinbarter Rabatt gilt für die Teilepreise künftiger Bestellungen über das Kundenkonto. Auftragspauschale, Express-Zuschlag und Versandkosten sind davon ausgenommen. Wir können den Rabatt für künftige Bestellungen ändern.'),

  h2('§ 5 Lieferung, Lieferzeit und Abholung'),
  p('(1) Bestellungen über den Preisrechner liefern wir innerhalb Deutschlands oder halten sie zur Abholung bereit. Lieferungen in andere Länder erfolgen nach gesonderter Vereinbarung.'),
  p('(2) Die im Preisrechner oder im Angebot genannte Lieferzeit beginnt mit dem Zahlungseingang, bei Zahlung auf Rechnung mit Vertragsschluss. Klärt der Kunde Rückfragen zur Datei nicht umgehend, verlängert sich die Lieferzeit um die Dauer der Verzögerung.'),
  p('(3) Bei Abholung benachrichtigen wir den Kunden, sobald die Ware bereitliegt.'),
  p('(4) Ist der Kunde Unternehmer, geht die Gefahr mit Übergabe an das Versandunternehmen auf ihn über. Für Verbraucher gilt die gesetzliche Regelung.'),

  h2('§ 6 Beschaffenheit und Toleranzen'),
  p('(1) 3D-gedruckte Teile haben verfahrensbedingte Merkmale. Sichtbare Schichtlinien, Spuren von Stützstrukturen, Nahtstellen, geringe Farb- und Glanzabweichungen sowie leichter Verzug sind keine Mängel.'),
  p('(2) Soweit nichts anderes vereinbart ist, gelten folgende Maßtoleranzen: beim FDM-Druck ±0,3 mm oder ±0,5 % des Nennmaßes, je nachdem, welcher Wert größer ist, beim SLA-Druck ±0,15 mm oder ±0,3 %. Engere Toleranzen müssen vor Vertragsschluss in Textform vereinbart werden.'),
  p('(3) Die Drucklage, die Anordnung von Stützstrukturen und die Druckparameter innerhalb der bestellten Ausführung wählen wir nach fachlichem Ermessen.'),
  p('(4) Angaben zu Materialeigenschaften auf der Website stammen aus Datenblättern der Hersteller und beziehen sich auf genormte Prüfkörper. Sie sind keine Zusage für das einzelne Bauteil.'),
  p('(5) Unsere Teile sind ohne ausdrückliche Vereinbarung in Textform nicht für sicherheitskritische Anwendungen, für die Luftfahrt, für medizinische Zwecke oder für den Kontakt mit Lebensmitteln bestimmt.'),

  h2('§ 7 Kein Widerrufsrecht bei Anfertigung nach Kundenvorgaben'),
  p('Wir fertigen jedes Teil nach den Dateien und der Auswahl des Kunden. Für Verträge über Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist, besteht nach § 312g Abs. 2 Nr. 1 BGB kein Widerrufsrecht. Die gesetzlichen Rechte bei Mängeln bleiben unberührt.'),

  h2('§ 8 Mängelhaftung'),
  p('(1) Es gelten die gesetzlichen Vorschriften zur Mängelhaftung, soweit nachfolgend nichts anderes bestimmt ist.'),
  p('(2) Ist der Kunde Unternehmer, verjähren Mängelansprüche in einem Jahr ab Ablieferung. Das gilt nicht für Schadensersatzansprüche nach § 9 und nicht, soweit das Gesetz zwingend längere Fristen vorsieht. Ist der Kunde Kaufmann, gilt die Untersuchungs- und Rügepflicht nach § 377 HGB.'),
  p('(3) Verbraucher bitten wir, offensichtliche Transportschäden möglichst bald beim Zusteller und bei uns zu melden. Ihre gesetzlichen Ansprüche hängen davon nicht ab.'),

  h2('§ 9 Haftung'),
  p('(1) Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit, nach dem Produkthaftungsgesetz und soweit wir eine Garantie übernommen haben.'),
  p('(2) Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht ist unsere Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Wesentlich sind Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf.'),
  p('(3) Im Übrigen ist unsere Haftung ausgeschlossen. Das gilt auch zugunsten unserer Mitarbeiter und Erfüllungsgehilfen.'),

  h2('§ 10 Eigentumsvorbehalt'),
  p('Die Ware bleibt bis zur vollständigen Zahlung unser Eigentum.'),

  h2('§ 11 Vertraulichkeit, Rechte an Dateien und Löschung'),
  p('(1) Dateien und Unterlagen des Kunden behandeln wir vertraulich. Wir verwenden sie nur für den jeweiligen Auftrag und geben sie nicht an Dritte weiter. Auf Wunsch schließen wir vor Auftragsbeginn eine Geheimhaltungsvereinbarung.'),
  p('(2) Alle Rechte an den Dateien bleiben beim Kunden. Wir erhalten nur das Recht, sie zur Erfüllung des Auftrags zu nutzen.'),
  p('(3) Dateien aus dem Preisrechner, zu denen keine Bestellung erfolgt, löschen wir nach sieben Tagen. Dateien, die ein angemeldeter Kunde hochlädt, bleiben in seinem Kundenkonto gespeichert, bis er sie entfernt oder das Konto löscht. Dateien zu Aufträgen löschen wir auf Wunsch des Kunden, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.'),

  h2('§ 12 Streitbeilegung'),
  p('Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'),

  h2('§ 13 Schlussbestimmungen'),
  p('(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gegenüber Verbrauchern gilt diese Rechtswahl nur, soweit ihnen dadurch nicht der Schutz zwingender Bestimmungen des Staates entzogen wird, in dem sie ihren gewöhnlichen Aufenthalt haben.'),
  p('(2) Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand unser Geschäftssitz.'),
  p('(3) Sollte eine Bestimmung dieser Bedingungen unwirksam sein, bleiben die übrigen Bestimmungen wirksam.'),
  p('Stand: November 2026'),
)
