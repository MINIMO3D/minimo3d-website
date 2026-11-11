// Bewertungen 1–5 für den Materialvergleich:
// [Druckbarkeit, Steifigkeit, Zähigkeit, Hitzebeständigkeit, Außentauglichkeit]
//
// "site": von der bisherigen Website minimo3d.com übernommen.
// "estimate": vorläufige Einschätzung, bitte im Admin-Bereich prüfen und anpassen.

type R = [number, number, number, number, number]

const site: Record<string, R> = {
  'PLA Basic': [5, 3, 2, 1, 1],
  'PLA Matte': [5, 3, 2, 1, 1],
  'PLA Silk+': [4, 3, 1, 1, 1],
  'PLA Translucent': [4, 3, 2, 1, 1],
  'PLA Tough+': [5, 3, 3, 1, 1],
  'PLA Wood': [3, 2, 1, 1, 1],
  'PLA Marble': [4, 3, 2, 1, 1],
  'PLA Galaxy': [4, 3, 2, 1, 1],
  'PLA Glow': [3, 3, 1, 1, 1],
  'ASA Aero': [3, 2, 3, 3, 5],
  'ABS-M30': [3, 3, 4, 3, 2],
  PC: [2, 4, 5, 4, 2],
  'PC FR': [2, 4, 4, 4, 2],
}

const estimate: Record<string, R> = {
  'PLA Sparkle': [4, 3, 2, 1, 1],
  'PLA Metal': [4, 3, 2, 1, 1],
  'PLA Aero': [3, 2, 2, 1, 1],
  'PETG Basic': [4, 3, 3, 2, 3],
  'PETG Matte': [4, 3, 3, 2, 3],
  'PETG Translucent': [4, 3, 3, 2, 3],
  ABS: [3, 3, 4, 3, 2],
  ASA: [3, 3, 4, 3, 5],
  'ABS-ESD7': [3, 3, 3, 3, 2],
  'PC-ABS': [2, 4, 5, 4, 2],
  PP: [2, 2, 5, 3, 3],
  'PA12 (Nylon 12)': [3, 3, 5, 3, 3],
  'PA6 (Nylon 6)': [2, 3, 5, 4, 3],
  'PA6/66': [2, 3, 5, 4, 3],
  'PLA-CF': [4, 4, 2, 1, 1],
  'PETG-CF': [4, 4, 2, 2, 3],
  'ABS-GF': [3, 4, 3, 3, 2],
  'ASA-CF': [3, 4, 3, 3, 5],
  'PA6-GF': [2, 5, 3, 5, 3],
  'PA6-CF': [2, 5, 3, 5, 3],
  'PA12-CF': [3, 5, 3, 4, 4],
  'PET-CF': [3, 5, 2, 5, 4],
  'PPA-CF': [2, 5, 3, 5, 4],
  'PPS-CF': [2, 5, 2, 5, 5],
  'TPU 85A': [2, 1, 5, 2, 3],
  'TPU 90A': [3, 1, 5, 2, 3],
  'TPU 68D': [3, 2, 5, 3, 3],
  'Standard-Resin': [4, 3, 1, 1, 1],
  'Zähes Resin': [4, 3, 3, 2, 1],
  'Hochtemperatur-Resin': [3, 4, 1, 5, 1],
}

export const ratingKeys = ['printability', 'stiffness', 'toughness', 'heat', 'outdoor'] as const

export const ratingsFor = (name: string): Record<string, { score: number }> | null => {
  const r = site[name] || estimate[name]
  if (!r) return null
  return Object.fromEntries(ratingKeys.map((key, i) => [key, { score: r[i] }]))
}
