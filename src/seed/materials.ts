import { ratingsFor } from './ratings'

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

// Preisrechner: [Preis € je kg netto, Dichte g/cm³, Zeitfaktor]. Schätzwerte zum Start, im Admin-Bereich änderbar.
export const calcData: Record<string, [number, number, number]> = {
  'PLA Basic': [45, 1.24, 1], 'PLA Matte': [48, 1.32, 1], 'PLA Silk+': [55, 1.27, 1], 'PLA Translucent': [52, 1.25, 1],
  'PLA Tough+': [55, 1.26, 1], 'PLA Wood': [60, 1.15, 1], 'PLA Sparkle': [55, 1.26, 1], 'PLA Marble': [55, 1.22, 1],
  'PLA Metal': [60, 1.25, 1], 'PLA Galaxy': [55, 1.19, 1], 'PLA Glow': [60, 1.26, 1], 'PLA Aero': [75, 0.9, 1],
  'PETG Basic': [48, 1.25, 1], 'PETG Matte': [52, 1.27, 1], 'PETG Translucent': [52, 1.25, 1],
  ABS: [52, 1.05, 1], ASA: [68, 1.05, 1], 'ASA Aero': [90, 0.99, 1], 'ABS-M30': [180, 1.04, 1.1], 'ABS-ESD7': [260, 1.04, 1.1],
  PC: [95, 1.2, 1.2], 'PC FR': [120, 1.19, 1.2], 'PC-ABS': [90, 1.1, 1.2], PP: [95, 0.9, 1.3],
  'PA12 (Nylon 12)': [130, 1.01, 1.2], 'PA6 (Nylon 6)': [120, 1.13, 1.2], 'PA6/66': [125, 1.12, 1.2],
  'PLA-CF': [80, 1.22, 1], 'PETG-CF': [85, 1.25, 1], 'ABS-GF': [85, 1.08, 1], 'ASA-CF': [95, 1.11, 1],
  'PA6-GF': [140, 1.2, 1.2], 'PA6-CF': [170, 1.09, 1.2], 'PA12-CF': [190, 1.06, 1.2], 'PET-CF': [160, 1.29, 1.2],
  'PPA-CF': [260, 1.21, 1.3], 'PPS-CF': [320, 1.26, 1.3],
  'TPU 85A': [95, 1.12, 2], 'TPU 90A': [90, 1.14, 1.8], 'TPU 68D': [100, 1.17, 1.5],
}

// Preisfaktor für anspruchsvolle Materialien (Trocknung, gehärtete Düse, mehr Ausschuss).
// Angelehnt an die bisherige Preisliste: PA12-CF kostet dort knapp das Fünffache von PETG.
export const priceFactors: Record<string, number> = {
  'PLA-CF': 1.2, 'PETG-CF': 1.2, 'ABS-GF': 1.2, 'ASA-CF': 1.2,
  'ABS-M30': 1.2, 'ABS-ESD7': 1.2, PC: 1.3, 'PC FR': 1.4, 'PC-ABS': 1.3, PP: 1.3,
  'PA12 (Nylon 12)': 1.5, 'PA6 (Nylon 6)': 1.4, 'PA6/66': 1.4,
  'PA6-GF': 1.8, 'PET-CF': 1.9, 'PA6-CF': 2.2, 'PA12-CF': 2.4, 'PPA-CF': 2.4, 'PPS-CF': 2.4,
  'TPU 85A': 1.2, 'TPU 90A': 1.2, 'TPU 68D': 1.2,
}

/** Carbonfaser-Materialien gibt es nur in Schwarz. */
export const calcFor = (name: string) => {
  const d = calcData[name]
  if (!d) return { enabled: false }
  return {
    enabled: true,
    pricePerKg: d[0],
    density: d[1],
    timeFactor: d[2],
    priceFactor: priceFactors[name] || 1,
    colors: /-CF$/.test(name) ? [{ name: 'Schwarz', hex: '#1c1c1e' }] : [],
  }
}

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
  calc: calcFor(name),
  ...(ratingsFor(name) ? { ratings: ratingsFor(name) } : {}),
  ...(name === 'PLA Basic' ? plaBasic : {}),
}))
