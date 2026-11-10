// Erstbefüllung der Materialien. Danach werden sie im Admin-Bereich gepflegt.

type M = [name: string, family: string, category: string, summary: string, keywords?: string]

const list: M[] = [
  ['PLA Basic', 'PLA', 'Standard', 'Für Anschauungsmodelle und Passproben, bei denen Form und Maß zählen.', 'Einfach druckbar'],
  ['PLA Matte', 'PLA', 'Standard', 'Matte, blendfreie Oberfläche für Modelle mit wenig Glanz.'],
  ['PLA Silk+', 'PLA', 'Standard', 'Glänzende Optik für Sichtteile.'],
  ['PLA Translucent', 'PLA', 'Standard', 'Lichtdurchlässig, für Leuchten und Abdeckungen.'],
  ['PLA Tough+', 'PLA', 'Standard', 'Zäher als PLA Basic, bei gleichem Druckverhalten.'],
  ['PLA Wood', 'PLA', 'Standard', 'Holzgefülltes PLA mit matter Haptik.'],
  ['PLA Sparkle', 'PLA', 'Standard', 'PLA mit Glitzerpartikeln.'],
  ['PLA Marble', 'PLA', 'Standard', 'Gesprenkelte, steinartige Oberfläche.'],
  ['PLA Metal', 'PLA', 'Standard', 'Metallgefülltes PLA für schwerere Teile.'],
  ['PLA Galaxy', 'PLA', 'Standard', 'Dunkle Grundfarbe mit schimmernden Einschlüssen.'],
  ['PLA Glow', 'PLA', 'Standard', 'Leuchtet nach Lichteinfall im Dunkeln.'],
  ['PLA Aero', 'PLA', 'Standard', 'Geschäumtes PLA für sehr leichte Teile.'],
  ['PETG Basic', 'PETG', 'Standard', 'Zähe, chemisch beständige Teile für den Alltag.', 'Zäh, chemisch beständig'],
  ['PETG Matte', 'PETG', 'Standard', 'Zähes PETG mit matter Oberfläche.'],
  ['PETG Translucent', 'PETG', 'Standard', 'Lichtdurchlässig und zäh.'],
  ['ABS', 'ABS / ASA', 'Technisch', 'Temperaturbeständige Funktionsteile.', 'Schlagzäh, wärmebeständig'],
  ['ASA', 'ABS / ASA', 'Technisch', 'UV-beständig, für den Außeneinsatz.', 'UV-beständig, für draußen'],
  ['ASA Aero', 'ABS / ASA', 'Technisch', 'Geschäumtes ASA für leichte Teile im Außenbereich.'],
  ['ABS-M30', 'ABS / ASA', 'Technisch', 'Industrielles ABS mit besserer Schichthaftung.'],
  ['ABS-ESD7', 'ABS / ASA', 'Technisch', 'Elektrostatisch ableitendes ABS.'],
  ['PC', 'PC', 'Technisch', 'Fest und wärmebeständig.'],
  ['PC FR', 'PC', 'Technisch', 'Polycarbonat mit Flammschutz.'],
  ['PC-ABS', 'PC', 'Technisch', 'Festigkeit von PC, Druckbarkeit von ABS.'],
  ['PP', 'PP', 'Technisch', 'Chemisch beständig und dauerhaft biegsam.'],
  ['PA12 (Nylon 12)', 'Nylon (PA)', 'Technisch', 'Zäh, abrieb- und chemikalienbeständig.', 'Zäh, abriebfest'],
  ['PA6 (Nylon 6)', 'Nylon (PA)', 'Technisch', 'Fester als PA12, nimmt aber mehr Feuchtigkeit auf.'],
  ['PA6/66', 'Nylon (PA)', 'Technisch', 'Copolymer mit ausgewogenen Eigenschaften.'],
  ['PLA-CF', 'Faserverstärkt', 'Faserverstärkt', 'Carbonverstärktes PLA für steife Teile.', 'Steif, matte Oberfläche'],
  ['PETG-CF', 'Faserverstärkt', 'Faserverstärkt', 'Steifes PETG mit Carbonfasern.', 'Formstabil, technische Optik'],
  ['ABS-GF', 'Faserverstärkt', 'Faserverstärkt', 'ABS mit Glasfasern und weniger Verzug.'],
  ['ASA-CF', 'Faserverstärkt', 'Faserverstärkt', 'UV-beständig und carbonverstärkt.'],
  ['PA6-GF', 'Faserverstärkt', 'Faserverstärkt', 'Glasfaserverstärktes Polyamid für hohe Lasten.'],
  ['PA6-CF', 'Faserverstärkt', 'Faserverstärkt', 'Carbonverstärktes PA6 mit Leichtbaupotenzial.'],
  ['PA12-CF', 'Faserverstärkt', 'Faserverstärkt', 'Carbonverstärktes PA12.'],
  ['PET-CF', 'Faserverstärkt', 'Faserverstärkt', 'Steif, formstabil und wärmebeständig.'],
  ['PPA-CF', 'Faserverstärkt', 'Faserverstärkt', 'Hochleistungs-Polyamid.'],
  ['PPS-CF', 'Faserverstärkt', 'Faserverstärkt', 'Chemisch sehr beständig.'],
  ['TPU 85A', 'TPU (flexibel)', 'Flexibel', 'Sehr weich und stark dehnbar.', 'Weich, stark dehnbar'],
  ['TPU 90A', 'TPU (flexibel)', 'Flexibel', 'Ausgewogen zwischen Flexibilität und Stabilität.'],
  ['TPU 68D', 'TPU (flexibel)', 'Flexibel', 'Halbstarr, biegt sich, ohne einzuknicken.'],
  ['Standard-Resin', 'Harz (SLA)', 'Standard', 'Feine Details und glatte Oberflächen.'],
  ['Zähes Resin', 'Harz (SLA)', 'Technisch', 'ABS-ähnlich, bricht nicht spröde.'],
  ['Hochtemperatur-Resin', 'Harz (SLA)', 'Technisch', 'Bleibt formstabil, wo Standardharz weich wird.'],
]

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const plaBasic = {
  headline: 'Einfach drucken. Form sicher prüfen.',
  description:
    'PLA Basic eignet sich für Anschauungsmodelle und Passproben, bei denen Form und Maß zählen. Es druckt zuverlässig ohne viel Abstimmung, hält das Maß für Passproben und zeigt feine Details gut.',
  ratings: {
    printability: { score: 5, note: 'Unkompliziert und zuverlässig' },
    stiffness: { score: 3, note: 'Formstabil, aber nicht für hohe Kräfte' },
    toughness: { score: 2, note: 'Bricht eher, als dass es nachgibt' },
    heat: { score: 1, note: 'Für warme Umgebungen ungeeignet' },
    outdoor: { score: 1, note: 'Vor allem für Innenräume' },
  },
  specs: [
    { label: 'Dichte', value: '1,24 g/cm³' },
    { label: 'Zugfestigkeit', value: '35 MPa (X-Y) / 31 MPa (Z)' },
    { label: 'Zug-E-Modul', value: '2580 MPa (X-Y) / 2060 MPa (Z)' },
    { label: 'Bruchdehnung', value: '12,2 % (X-Y) / 7,5 % (Z)' },
    { label: 'Biegefestigkeit', value: '76 MPa (X-Y) / 59 MPa (Z)' },
    { label: 'Biegemodul', value: '2750 MPa (X-Y) / 2370 MPa (Z)' },
    { label: 'Charpy-Schlagzähigkeit', value: '26,6 kJ/m² (X-Y) / 13,8 kJ/m² (Z)' },
    { label: 'Charpy-Kerbschlagzähigkeit', value: '7,9 kJ/m² (X-Y)' },
    { label: 'Wärmeformbeständigkeit (HDT)', value: '54 °C bei 1,8 MPa / 57 °C bei 0,45 MPa' },
    { label: 'Vicat-Erweichung', value: '57 °C' },
  ],
  specSource:
    'Die Werte stammen aus dem Herstellerdatenblatt von Bambu Lab (PLA Basic V3.0) und dienen als Orientierung. X-Y meint die Richtung entlang der Schichten, Z quer dazu. Reale Bauteile können je nach Form, Füllung und Druckrichtung abweichen.',
  goodFor: [{ text: 'Anschauungsmodelle' }, { text: 'Vorrichtungen ohne Last' }, { text: 'Passproben' }, { text: 'Designmuster' }],
  notFor: [
    { text: 'Umgebungen mit Wärme, auch schon mäßiger' },
    { text: 'Teile mit Schlagbelastung oder hohen Kräften' },
    { text: 'Dauerhafter Außeneinsatz' },
  ],
}

export const materials = list.map(([name, family, category, summary, keywords], i) => ({
  name,
  slug: slugify(name),
  order: (i + 1) * 10,
  family,
  category,
  process: family === 'Harz (SLA)' ? 'SLA' : 'FDM',
  summary,
  keywords,
  featured: Boolean(keywords),
  ...(name === 'PLA Basic' ? plaBasic : {}),
}))
