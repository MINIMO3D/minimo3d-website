import { h2, p, rt, ul } from './lexical'

// Erstbefüllung, übernommen von der bisherigen Website (Stand November 2026).
// Alle Inhalte lassen sich danach im Admin-Bereich ändern.

export const settings = {
  company: 'MINIMO3D',
  owner: 'Daniele Bucci',
  ownerTitle: 'Unternehmensinhaber',
  street: 'Kirchstraße 65',
  city: '73765 Neuhausen auf den Fildern',
  phone: '+49 7158 6883442',
  email: 'support@minimo3d.com',
  pickup: 'Abholung werktags 10–18 Uhr',
  vatId: 'DE286185561',
  priceNote: 'FDM-Teile ab 7,76 € inkl. MwSt., zzgl. Versand. Keine Mindestmenge.',
  social: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/minimo3d/' },
    { label: 'Instagram', url: 'https://www.instagram.com/_minimo3d_/' },
    { label: 'Facebook', url: 'https://www.facebook.com/minimo3d' },
  ],
  seoDescription:
    '3D-Druck in Neuhausen auf den Fildern bei Stuttgart: Prototypen, Ersatzteile und Kleinserien aus 43 Materialien. FDM, SLA, 3D-Scan und Machbarkeitsanalyse.',
}

export const homepage = {
  eyebrow: '3D-Druck · Neuhausen auf den Fildern bei Stuttgart',
  headline: 'Bauteile, die halten.',
  heroButtonLabel: 'Sofortangebot',
  text: 'Prototypen, Ersatzteile und Kleinserien aus 43 Materialien. Sie senden uns Ihre Datei, wir prüfen sie und melden uns innerhalb von 24 Stunden mit einem Angebot.',
  stats: [
    { value: 'ab 1 Stück', label: 'keine Mindestmenge' },
    { value: '43 Materialien', label: '40 Kunststoffe, 3 Harze' },
    { value: '24 Stunden', label: 'bis zum Angebot' },
    { value: '350 × 320 mm', label: 'FDM-Bauraum, größer auf Anfrage' },
  ],
  advantages: [
    { title: 'Ab einem Stück', text: 'Es gibt keine Mindestmenge. Wir fertigen auch das einzelne Ersatzteil.' },
    { title: 'Im eigenen Haus', text: 'Druck, Nachbearbeitung und Prüfung finden in unserer eigenen Werkstatt statt.' },
    { title: 'Material mit Plan', text: 'Ein Scharnier, drei Materialien: Wir wählen nach Belastung, Temperatur und gewünschter Oberfläche.' },
    { title: 'Erst prüfen, dann fertigen', text: 'Datei und Einsatzzweck besprechen wir mit Ihnen, bevor der Druck startet. Das fertige Teil prüfen wir vor dem Versand.' },
  ],
  servicesHeadline: 'Alles rund um Ihr Bauteil.',
  servicesNote: 'Dazu Nachbearbeitung nach Bedarf: Schleifen, Grundieren und Lackieren.',
  materialsHeadline: 'Das Material entscheidet mit.',
  materialsText: 'Acht Materialien als Einstieg. Insgesamt stehen 43 zur Wahl, von PLA bis Carbon-Nylon.',
  materialsImageCaption: 'Materialmuster: Farben und Oberflächen im direkten Vergleich',
  stepsHeadline: 'In drei Schritten zum Bauteil.',
  steps: [
    { title: 'Datei und Zweck', text: 'Sie senden uns eine Datei, ein Foto oder eine Beschreibung und sagen, was das Teil leisten soll.' },
    { title: 'Prüfung und Vorschlag', text: 'Innerhalb von 24 Stunden erhalten Sie unseren Vorschlag zu Verfahren, Material und Preis.' },
    { title: 'Fertigung und Prüfung', text: 'Nach Ihrer Freigabe drucken und prüfen wir das Teil. Dann versenden wir es oder legen es zur Abholung bereit.' },
  ],
  faq: [
    {
      question: 'Welche Dateien kann ich senden?',
      answer: 'STL, STEP, 3MF und OBJ. Fotos, Skizzen und PDF sind ebenfalls möglich. Insgesamt bis 50 MB und höchstens fünf Dateien, größere Dateien per Link.',
    },
    {
      question: 'Gibt es Rabatt für Kleinserien?',
      answer: 'Ab fünf Stück sinkt der Stückpreis, weitere Stufen gibt es ab zehn und ab 25 Stück. Für wiederkehrende Aufträge vereinbaren wir feste Konditionen.',
    },
    {
      question: 'Was kostet der Versand?',
      answer: 'Innerhalb Deutschlands 4,90 € mit DHL, ab 50 € Warenwert kostenlos. In die EU ab 14,90 €. Die Abholung in der Werkstatt ist kostenlos.',
    },
    {
      question: 'Wie lange dauert ein Auftrag?',
      answer: 'Im Standard 3 bis 5 Werktage nach Zahlungseingang bei bis zu 24 Stunden Druckzeit, bei längeren Druckzeiten entsprechend mehr. Express ist gegen 50 % Aufschlag (mindestens 18,00 € inkl. MwSt.) möglich.',
    },
    {
      question: 'Was passiert mit meinen CAD-Daten?',
      answer: 'Wir nutzen Ihre Daten nur für Ihr Projekt, geben sie nicht weiter und löschen sie auf Wunsch. Vor Projektbeginn unterzeichnen wir auf Wunsch ein NDA.',
    },
  ],
  inquiryHeadline: 'Erzählen Sie uns, was Ihr Bauteil leisten soll.',
  inquiryText: 'Sie erhalten innerhalb von 24 Stunden ein verbindliches Angebot per E-Mail.',
}

export const services = [
  {
    title: 'FDM 3D-Druck',
    slug: 'fdm-druck',
    order: 10,
    spec: 'bis 350 × 320 mm',
    summary: 'Das Standardverfahren für Funktionsteile aus Kunststoff. Größere Teile fertigen wir auf Anfrage.',
    headline: 'Funktionale Teile. Ohne Werkzeugkosten.',
    intro:
      'FDM baut Bauteile Schicht für Schicht aus technischem Kunststoff auf. Das Verfahren ist wirtschaftlich für Prototypen, Vorrichtungen, Ersatzteile und Kleinserien.',
    useCases: [
      { title: 'Prototypen mit Funktion', text: 'Für Entwicklungsabteilungen, die Konstruktionsstände schnell prüfen wollen.' },
      { title: 'Vorrichtungen und Ersatzteile', text: 'Für Betriebe, die Teile ohne Werkzeugkosten brauchen.' },
      { title: 'Kleinserien ab einem Stück', text: 'Für Stückzahlen, bei denen sich Spritzguss nicht lohnt.' },
    ],
    features: [
      { text: '40 technische Kunststoffe' },
      { text: 'Kurze Iterationszyklen' },
      { text: 'Belastbare Bauteile' },
      { text: 'Keine Mindestmenge' },
    ],
    specs: [
      { label: 'Bauraum', value: 'bis 350 × 320 mm, über 325 mm auf Anfrage' },
      { label: 'Schichthöhe', value: '0,1 bis 0,3 mm, je nach Bauteil' },
      { label: 'Toleranzen', value: '±0,1 bis 0,3 mm' },
      { label: 'Größere Teile', value: 'geteilt und gefügt möglich' },
      { label: 'Materialien', value: '40 technische Kunststoffe' },
    ],
    noteTitle: 'Die Anwendung entscheidet.',
    noteText: 'Maß, Material und Geometrie bestimmen die erreichbare Genauigkeit. Kritische Passungen klären wir vorab mit Ihnen.',
    stepsTitle: 'So läuft ein FDM-Auftrag',
    steps: [
      { title: 'Datei prüfen', text: 'Wir prüfen Wandstärken, Überhänge und Passungen.' },
      { title: 'Material wählen', text: 'Wir ordnen Belastung, Temperatur und Umgebung ein.' },
      { title: 'Fertigen', text: 'Wir drucken, entfernen die Stützstrukturen und prüfen das Teil.' },
      { title: 'Nachbearbeiten (optional)', text: 'Schleifen, grundieren, lackieren oder Gewindeeinsätze setzen.' },
    ],
    faq: [
      {
        question: 'Wie groß können FDM-Teile sein?',
        answer:
          'Bis 350 × 320 mm, darüber auf Anfrage. Größere Teile bis zur Druckerbreite entstehen im Zwei-Düsen-Modus. Noch größere Teile teilen und fügen wir, die Trennebene legen wir gemeinsam mit Ihnen fest.',
      },
      {
        question: 'Welche Toleranzen sind erreichbar?',
        answer:
          '±0,1 bis 0,3 mm, abhängig von Material, Größe und Geometrie. Nennen Sie uns enger tolerierte Maße vorab. Oft lassen sie sich durch die Ausrichtung oder durch Nacharbeit lösen.',
      },
      {
        question: 'Welches Material eignet sich?',
        answer:
          'Das richtet sich nach Last, Temperatur und Umgebung. PETG ist der Standard, ASA eignet sich für draußen, Polyamide für belastete Funktionsteile und faserverstärkte Typen für steife, formstabile Bauteile. Wir schlagen Ihnen anhand Ihrer Anforderungen ein Material vor.',
      },
      {
        question: 'Sieht man die Schichtlinien?',
        answer:
          'Ja, je nach Schichthöhe mehr oder weniger deutlich. Senkrechte Flächen wirken am unauffälligsten, flache Schrägen am auffälligsten. Ist die Oberfläche wichtig, schleifen und grundieren wir das Teil oder drucken es im SLA-Verfahren.',
      },
      {
        question: 'Können Gewinde eingebracht werden?',
        answer:
          'Ja. Gedruckte Gewinde halten nur bei größeren Durchmessern und geringer Last. Sonst pressen oder schmelzen wir Gewindeeinsätze aus Messing ein. Geben Sie die gewünschte Schraube in der Anfrage an.',
      },
    ],
  },
  {
    title: 'SLA 3D-Druck',
    slug: 'sla-druck',
    order: 20,
    spec: 'bis 22 cm',
    summary: 'Sichtteile, Modelle und filigrane Kleinteile mit sehr glatter Oberfläche.',
    headline: 'Wenn Oberfläche und Details zählen.',
    intro:
      'SLA härtet flüssiges Kunstharz mit UV-Licht aus. Das Verfahren eignet sich für sehr feine Geometrien und glatte Sichtflächen bei Mustern, Modellen und kleinen Präzisionsteilen.',
    useCases: [
      { title: 'Sichtteile und Designmuster', text: 'Muster und Modelle, die Sie vorzeigen können.' },
      { title: 'Filigrane Passproben', text: 'Bauteile mit sehr feinen Strukturen oder dünnen Wänden.' },
      { title: 'Urmodelle für Abformungen', text: 'Vorlagen für Silikonformen.' },
    ],
    features: [
      { text: 'Feinste Strukturen' },
      { text: 'Glatte Oberflächen' },
      { text: 'Schichthöhe ab 0,025 mm' },
      { text: 'Gezielte Harzauswahl' },
    ],
    specs: [
      { label: 'Bauraum', value: '211,7 × 118,4 × 220 mm' },
      { label: 'Schichthöhe', value: 'ab 0,025 mm' },
      { label: 'Toleranzen', value: '±0,05 bis 0,1 mm' },
      { label: 'Harze', value: 'Standard, zäh, hochtemperaturfest' },
    ],
    noteTitle: 'Die Anwendung entscheidet.',
    noteText: 'SLA überzeugt bei Details. Bei großen oder dauerhaft belasteten Funktionsteilen prüfen wir, ob FDM besser passt.',
    stepsTitle: 'So läuft ein SLA-Auftrag',
    steps: [
      { title: 'Geometrie prüfen', text: 'Wir legen Sichtflächen und kritische Details fest.' },
      { title: 'Harz wählen', text: 'Wir gleichen Optik, Zähigkeit und Wärmebedarf ab.' },
      { title: 'Nachhärten', text: 'Waschen, nachhärten und Stützpunkte entfernen.' },
      { title: 'Nachbearbeiten (optional)', text: 'Schleifen, polieren oder lackieren.' },
    ],
    faq: [
      {
        question: 'Wann ist SLA besser als FDM?',
        answer:
          'Wenn Oberflächenqualität oder feine Details entscheiden, etwa bei Sichtteilen, filigranen Passproben und Urmodellen. Für mechanisch belastete und größere Teile ist FDM meist die bessere und günstigere Wahl.',
      },
      {
        question: 'Sind SLA-Teile belastbar?',
        answer:
          'Standardharze sind vergleichsweise spröde. Als Alternativen gibt es ein zähes und ein hochtemperaturbeständiges Harz. Bei dauerhafter mechanischer Belastung empfehlen wir meist FDM mit einem technischen Kunststoff.',
      },
      {
        question: 'Sind SLA-Teile UV-beständig?',
        answer:
          'Nur eingeschränkt. Unter dauerhafter UV-Einstrahlung können Harzteile vergilben und verspröden. Für den Außeneinsatz empfehlen wir ASA oder ASA-CF im FDM-Verfahren.',
      },
      {
        question: 'Wie groß darf ein SLA-Teil sein?',
        answer:
          'Der Bauraum misst 211,7 × 118,4 × 220 mm, Teile bis 22 cm passen am Stück. Größere Teile drucken wir geteilt und fügen sie, oder wir fertigen sie im FDM-Verfahren.',
      },
    ],
  },
  {
    title: '3D-Scan',
    slug: '3d-scan',
    order: 30,
    spec: 'wenige cm bis mehrere m',
    summary: 'Wir bauen Ersatzteile nach, auch wenn es keine Zeichnung mehr gibt.',
    headline: 'Vom realen Teil zu nutzbaren Daten.',
    intro:
      'Wir digitalisieren vorhandene Bauteile und bauen sie digital nach (Reverse Engineering). Das Ergebnis ist ein Mesh, also ein Dreiecksnetz der Oberfläche. Auf Wunsch erhalten Sie ein bearbeitbares CAD-Modell, auch ohne Zeichnung oder Originaldatei.',
    useCases: [
      { title: 'Ersatzteile ohne CAD-Daten', text: 'Für Teile ohne Zeichnung und ohne CAD-Modell.' },
      { title: 'Anpassung an bestehende Formen', text: 'Für Bauteile, die an vorhandene Geometrien anschließen müssen.' },
      { title: 'Soll-Ist-Vergleich', text: 'Wir prüfen, ob ein gefertigtes Teil dem Modell entspricht.' },
    ],
    features: [
      { text: 'Auflösung bis 0,1 mm' },
      { text: 'Objekte in vielen Größen' },
      { text: 'CAD-Rückführung möglich' },
      { text: 'Fertigung aus einer Hand' },
    ],
    specs: [
      { label: 'Scanner', value: 'Creality RaptorX' },
      { label: 'Auflösung', value: 'bis 0,1 mm' },
      { label: 'Objektgröße', value: 'wenige cm bis mehrere Meter' },
      { label: 'Ausgabe', value: 'Mesh, optional CAD-Modell' },
    ],
    noteTitle: 'Die Anwendung entscheidet.',
    noteText: 'Ein Scan ist zunächst eine Oberfläche aus Messpunkten. Änderungen im CAD erfordern eine gesonderte Rückführung.',
    stepsTitle: 'So läuft ein Scan-Auftrag',
    steps: [
      { title: 'Teil erfassen', text: 'Wir bereiten die Oberflächen vor und scannen die Geometrie.' },
      { title: 'Daten aufbereiten', text: 'Wir bereinigen und prüfen das Mesh.' },
      { title: 'Design ändern (optional)', text: 'Auf Wunsch passen wir Maße und Form im CAD an.' },
      { title: 'Weiterverwenden', text: 'Wir drucken das Teil nach, oder Sie übernehmen Mesh oder CAD-Modell.' },
    ],
    faq: [
      {
        question: 'Bekomme ich ein bearbeitbares CAD-Modell?',
        answer:
          'Der Scan liefert zunächst ein Mesh. Die Rückführung in bearbeitbare CAD-Flächen ist zusätzlicher Aufwand und erfolgt nach Absprache. Sagen Sie uns bitte, ob Sie nur nachdrucken oder weiterkonstruieren wollen.',
      },
      {
        question: 'Können auch glänzende oder dunkle Teile gescannt werden?',
        answer: 'Ja. Reflektierende Oberflächen sind anspruchsvoller, lassen sich mit geeigneter Vorbereitung aber zuverlässig erfassen.',
      },
    ],
  },
  {
    title: 'Machbarkeitsanalyse',
    slug: 'machbarkeitsanalyse',
    order: 40,
    spec: 'vor dem Druck',
    summary: 'Wir prüfen Druckbarkeit, Wandstärken und Toleranzen und verbessern die Konstruktion.',
    headline: 'Kritische Stellen erkennen, bevor sie kosten.',
    intro:
      'Wir prüfen Ihre Konstruktion gezielt auf additive Fertigung: Wandstärken, Überhänge, Toleranzen und Materialwahl. Sie erhalten konkrete Empfehlungen für Ihr Bauteil.',
    useCases: [
      { title: 'Erste additive Konstruktion', text: 'Für Konstruktionen, die zum ersten Mal gedruckt werden.' },
      { title: 'Umstellung von anderen Verfahren', text: 'Für Teile, die bisher gefräst oder gespritzt wurden.' },
      { title: 'Teile, die bisher nicht hielten', text: 'Für Bauteile, bei denen frühere Drucke versagt haben.' },
    ],
    features: [
      { text: 'Konkrete Änderungsvorschläge' },
      { text: 'Materialempfehlung nach Einsatz' },
      { text: 'Direkter Ansprechpartner' },
      { text: 'Prüfung vor dem Druck' },
    ],
    specs: [
      { label: 'Grundlage', value: 'STL, STEP, OBJ oder Zeichnung' },
      { label: 'Prüfung', value: 'Geometrie, Toleranz, Material' },
      { label: 'Ergebnis', value: 'Konkrete Empfehlungen' },
    ],
    noteTitle: 'Die Anwendung entscheidet.',
    noteText: 'Die übliche Prüfung einer Anfrage ist kostenlos. Eine vertiefte Konstruktionsberatung stimmen wir vorab mit Ihnen ab.',
    stepsTitle: 'So läuft eine Designberatung',
    steps: [
      { title: 'Ziel verstehen', text: 'Wir klären Einsatz, Lasten und kritische Maße.' },
      { title: 'Bauteil analysieren', text: 'Wir prüfen Fertigungsgerechtheit und Risiken.' },
      { title: 'Änderungen empfehlen', text: 'Wir halten konkrete nächste Schritte fest.' },
    ],
    faq: [
      {
        question: 'Kostet die Prüfung extra?',
        answer:
          'Die Druckbarkeitsprüfung im Rahmen einer Anfrage ist Standard und kostenlos. Bei tiefergehender Beratung oder einer Überarbeitung der Daten besprechen wir den Aufwand vorher.',
      },
      {
        question: 'Was passiert, wenn mein Modell nicht druckbar ist?',
        answer:
          'Wir nennen Ihnen das konkrete Problem und schlagen eine Lösung vor. Meist ist das eine kleine Geometrieänderung oder eine andere Ausrichtung im Bauraum.',
      },
      {
        question: 'Was bekomme ich als Ergebnis?',
        answer:
          'Eine schriftliche Rückmeldung: zu dünne Wände, Überhänge mit Stützbedarf, die realistische Toleranz je Passung und ein Material passend zu Last, Temperatur und Umgebung. Keine allgemeine Checkliste.',
      },
    ],
  },
]

const legalNote =
  'Dieser Text muss noch aus der bisherigen Website übernommen werden. Bitte fügen Sie ihn hier im Admin-Bereich unter Inhalte › Seiten ein.'

export const pages = [
  {
    title: 'Über uns',
    slug: 'ueber-uns',
    eyebrow: 'Über uns',
    intro:
      '3D-Druck aus Neuhausen bei Stuttgart. Wir fertigen Funktionsteile: Prototypen, Ersatzteile und Kleinserien. Ein Teil unserer Aufträge kommt über die Plattform Xometry, auf der wir zertifizierter Fertigungspartner sind.',
    content: rt(
      h2('So arbeiten wir'),
      ul([
        '**Jede Anfrage wird geprüft.** Wir sehen uns Datei, Stückzahl und Einsatzzweck an, bevor wir ein Angebot machen. Passt ein Verfahren nicht, sagen wir das.',
        '**Ein Ansprechpartner.** Kein Ticketsystem, keine Warteschleife. Sie sprechen mit der Person, die Ihr Teil kennt.',
        '**Fertigung im eigenen Haus.** Druck, Nachbearbeitung und Sichtprüfung finden unter einem Dach statt.',
        '**Keine Mindestmenge.** Vom Einzelstück bis zur Kleinserie.',
      ]),
      h2('Fertigungspartner auf Xometry'),
      p('Unser Xometry-Profil weist eine Weiterempfehlungsrate von 98 % aus. Unsere Kunden kommen aus aller Welt, von Filderstadt bis Australien. Gefertigt wird ausschließlich in Neuhausen auf den Fildern.'),
      h2('Partnerschaften'),
      p('Für Unternehmen, die regelmäßig bestellen, beschaffen wir Materialien, stimmen Einstellungen und Nachbearbeitung auf ihre Teile ab und vereinbaren mengenabhängige Preise.'),
      h2('Express'),
      p('Für dringende und kurzfristige Aufträge. Der Aufschlag beträgt 50 %, mindestens 18,00 € inkl. MwSt.'),
      h2('Die Werkstatt in Zahlen'),
      ul([
        '**Adresse:** Kirchstraße 65, 73765 Neuhausen auf den Fildern, südlich von Stuttgart',
        '**Verfahren:** FDM-Druck, SLA-Druck, 3D-Scan mit Reverse Engineering, Machbarkeitsanalyse',
        '**Materialien:** 43, davon 40 Kunststoffe für FDM und 3 Harze für SLA',
        '**Bauraum:** FDM bis 350 × 320 mm, über 325 mm auf Anfrage, größere Teile werden geteilt. SLA bis 22 cm.',
        '**Stückzahl:** vom Einzelstück bis zur Kleinserie',
        '**Versand:** Deutschland 4,90 €, ab 50 € Warenwert kostenlos. EU ab 14,90 €. Abholung werktags 10–18 Uhr.',
        '**Rückmeldung:** Anfragen beantworten wir innerhalb von 24 Stunden.',
      ]),
    ),
    showInquiry: true,
  },
  {
    title: '3D-Druck auf den Fildern',
    slug: '3d-druck-stuttgart',
    eyebrow: '3D-Druck Stuttgart',
    intro:
      'Unsere Werkstatt liegt in Neuhausen auf den Fildern, südlich von Stuttgart, zwischen Flughafen und Neckar. Sie können Ihr Bauteil selbst abholen. Alles andere versenden wir innerhalb Deutschlands und in alle EU-Länder.',
    content: rt(
      h2('Nah an Stuttgart. Versand in ganz Deutschland.'),
      ul([
        '**Abholung:** werktags 10 bis 18 Uhr. Bitte kündigen Sie sich vorher telefonisch an: +49 7158 6883442.',
        '**Kurzfristige Besprechung:** Schwierige Teile können Sie in der Region kurzfristig mit uns durchsprechen.',
        '**Versand:** Deutschland und alle EU-Länder.',
      ]),
      h2('Einzugsgebiet'),
      p('Neuhausen, Stuttgart, Esslingen, Ostfildern, Leinfelden-Echterdingen, Filderstadt, Denkendorf und Wolfschlugen.'),
    ),
    faq: [
      {
        question: 'Kann ich Teile in Stuttgart abholen?',
        answer: 'Ja, werktags 10 bis 18 Uhr in Neuhausen auf den Fildern, nach kurzer Ankündigung. Alternativ versenden wir per Post.',
      },
      {
        question: 'Muss ich für eine Anfrage vorbeikommen?',
        answer: 'Nein. Anfragen laufen meist über das Formular oder per E-Mail. Wenn Sie lieber persönlich sprechen, rufen Sie uns an.',
      },
      {
        question: 'Fertigen Sie auch für Kunden außerhalb der Region?',
        answer: 'Ja, wir versenden innerhalb Deutschlands und in alle EU-Länder. Die Abholung ist ein zusätzliches Angebot.',
      },
    ],
    showInquiry: true,
  },
  {
    title: 'Impressum',
    slug: 'impressum',
    content: rt(
      h2('Angaben gemäß § 5 DDG'),
      p('MINIMO3D, Inhaber: Daniele Bucci, Kirchstraße 65, 73765 Neuhausen auf den Fildern, Deutschland'),
      h2('Kontakt'),
      p('Telefon: +49 7158 6883442 · E-Mail: support@minimo3d.com'),
      h2('Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV'),
      p('Daniele Bucci, Anschrift wie oben'),
      h2('Umsatzsteuer-ID'),
      p('DE286185561'),
      h2('Weitere Angaben'),
      p('Die Abschnitte Haftung für Inhalte, Haftung für Links, Urheberrecht und Verbraucherstreitbeilegung müssen noch aus der bisherigen Website übernommen werden. Bitte fügen Sie sie hier im Admin-Bereich unter Inhalte › Seiten ein.'),
    ),
    showInquiry: false,
  },
  { title: 'Datenschutz', slug: 'datenschutz', content: rt(p(legalNote)), showInquiry: false },
  { title: 'AGB', slug: 'agb', content: rt(p(legalNote)), showInquiry: false },
]

export const articles = [
  {
    title: 'FDM 3D-Druck erklärt',
    slug: 'fdm',
    order: 10,
    category: 'fdm',
    author: 'Daniele Bucci',
    updated: '2026-10-02T00:00:00.000Z',
    summary: 'Wie ein FDM-Teil entsteht, worauf es bei Ausrichtung, Schichthöhe und Material ankommt und wo das Verfahren an Grenzen stößt.',
    content: rt(
      h2('So entsteht ein FDM-Teil'),
      p('Ein Kunststofffaden wird geschmolzen und Schicht für Schicht abgelegt. Vor dem Druck zerlegt ein Slicer das Modell in diese Schichten. Für Anschauungsmodelle reicht ein Füllgrad von etwa 15 bis 25 %, belastete Funktionsteile bekommen 50 bis 80 %.'),
      h2('Warum die Lage im Drucker zählt'),
      p('Bauteile sind entlang der Bahnen belastbarer als zwischen den Schichten. Die Ausrichtung im Drucker bestimmt deshalb die Festigkeit mit.'),
      h2('Überhänge und Stützen'),
      p('Bis etwa 45 Grad trägt jede Schicht die nächste. Flachere Bereiche brauchen Stützstrukturen. Alternativen sind Fasen oder eine gedrehte Ausrichtung.'),
      h2('Schichthöhe: Optik gegen Zeit'),
      p('Dünnere Schichten glätten Rundungen, verlängern die Druckzeit aber deutlich. Möglich sind 0,1 bis 0,3 mm. Für Vorrichtungen und Innenteile empfehlen wir 0,2 bis 0,3 mm, für Sichtteile 0,1 mm.'),
      h2('Welches Material wofür'),
      p('Wir bieten 40 technische Kunststoffe in vier Familien: Standard, Technisch, Faserverstärkt und Flexibel. PLA wird ab etwa 60 °C weich. PETG hält etwas mehr aus und verträgt Feuchtigkeit besser.'),
      h2('Richtig konstruieren'),
      ul([
        '**Wandstärke:** mindestens 1,2 mm',
        '**Passungen:** 0,2 bis 0,4 mm Spiel je Seite',
        '**Dateiformate:** STL, 3MF, STEP, IGES, OBJ',
      ]),
      h2('Wo FDM an Grenzen kommt'),
      p('Bei feinsten Details und sehr glatten Oberflächen ist SLA im Vorteil. FDM erreicht Toleranzen von ±0,1 bis 0,3 mm, SLA ±0,05 bis 0,1 mm. Dafür ist der FDM-Bauraum mit bis zu 350 × 320 mm größer als der SLA-Bauraum mit 211,7 × 118,4 × 220 mm, und die Auswahl an Werkstoffen ist breiter.'),
    ),
  },
  {
    title: '3D-Druck Grundlagen',
    slug: 'allgemein',
    order: 20,
    category: 'allgemein',
    author: 'Daniele Bucci',
    updated: '2026-10-02T00:00:00.000Z',
    summary: 'Wie sich 3D-Druck vom Fräsen und Spritzguss unterscheidet und wann er sich lohnt.',
    content: rt(
      h2('Aufbauen statt abtragen.'),
      p('Beim Fräsen wird Material entfernt, beim 3D-Druck wird es schichtweise aufgebaut. Deshalb heißt das Verfahren additive Fertigung. Es braucht keine Werkzeuge, und komplexe Innenformen lassen sich leichter umsetzen.'),
      h2('Von der Datei zum Teil.'),
      p('Vier Schritte führen zum Bauteil: das 3D-Modell (STL, 3MF oder STEP), das Slicen, der Druck und die Nacharbeit.'),
      h2('Zwei Verfahren, zwei Stärken.'),
      p('FDM legt geschmolzenen Kunststoff als Bahn ab und erreicht Toleranzen von ±0,1 bis 0,3 mm. SLA härtet flüssiges Harz mit UV-Licht und erreicht ±0,05 bis 0,1 mm.'),
      h2('Wann sich 3D-Druck lohnt.'),
      p('Spritzguss braucht ein Werkzeug aus Stahl oder Aluminium, das sich erst bei größeren Stückzahlen rechnet. Beim 3D-Druck kostet das erste Teil etwa so viel wie das zehnte, weil kein Werkzeug gebaut wird. Bei wenigen Stücken ist der 3D-Druck deshalb günstiger.'),
      h2('Was Komplexität kostet.'),
      p('Komplexe Formen kosten im 3D-Druck kaum mehr. Die Kosten entstehen vor allem durch Volumen, Material und Stützstrukturen.'),
      h2('Das Material entscheidet.'),
      ul([
        '**Modelle:** PLA oder Standardharz',
        '**Funktionsteile:** PETG, ABS oder Polyamid',
        '**Wärme und Witterung:** ASA',
        '**Steife Teile:** PLA-CF oder PETG-CF',
        '**Flexible Teile:** TPU',
      ]),
      h2('Wofür 3D-Druck eingesetzt wird.'),
      p('Prototypen, Vorrichtungen, Kleinserien und Ersatzteile.'),
    ),
  },
]
