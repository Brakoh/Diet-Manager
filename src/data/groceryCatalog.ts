export type GroceryCategoryId = 'proteine' | 'carboidrati' | 'frutta' | 'verdure' | 'dispensa' | 'altro'

export type CatalogEntry = {
  id: string
  label: string
  category: Exclude<GroceryCategoryId, 'altro'>
  pattern: RegExp
  rank: number
}

export const GROCERY_CATEGORIES: { id: GroceryCategoryId; title: string; hint: string }[] = [
  { id: 'proteine', title: 'Fonti proteiche', hint: 'Carne, pesce, uova, latticini e legumi' },
  { id: 'carboidrati', title: 'Carboidrati e cereali', hint: 'Pane, pasta, riso e derivati' },
  { id: 'frutta', title: 'Frutta, secca e dolci', hint: 'Frutta fresca, secca e un extra dolce' },
  { id: 'verdure', title: 'Verdure e ortaggi', hint: 'Verdure del piano' },
  { id: 'dispensa', title: 'Condimenti e dispensa', hint: 'Olio, latte e spezie' },
  { id: 'altro', title: 'Altro dal piano', hint: 'Voci non catalogate' },
]

export const GROCERY_CATALOG: CatalogEntry[] = [
  { id: 'macinato', label: 'Macinato di pollo o tacchino', category: 'proteine', rank: 120, pattern: /macinato di pollo|macinato di tacchino/i },
  { id: 'fesa', label: 'Fesa di tacchino', category: 'proteine', rank: 140, pattern: /fesa di tacchino/i },
  { id: 'bresaola', label: 'Bresaola', category: 'proteine', rank: 150, pattern: /bresaola/i },
  { id: 'tonno-scatola', label: 'Tonno in scatola', category: 'proteine', rank: 180, pattern: /\btonno\b/i },
  { id: 'tonno-fresco', label: 'Tonno fresco', category: 'proteine', rank: 170, pattern: /tonno fresco/i },
  { id: 'pesce', label: 'Salmone fresco / bocconcini di pesce spada', category: 'proteine', rank: 200, pattern: /pesce spada|\bsalmone\b/i },
  { id: 'salmone-affumicato', label: 'Salmone affumicato', category: 'proteine', rank: 190, pattern: /salmone affumicato/i },
  { id: 'gamberi', label: 'Gamberetti / gamberi', category: 'proteine', rank: 210, pattern: /gamberetti|gamberi/i },
  { id: 'merluzzo', label: 'Merluzzo o nasello', category: 'proteine', rank: 220, pattern: /merluzzo|nasello/i },
  { id: 'calamaro', label: 'Calamaro', category: 'proteine', rank: 230, pattern: /calamaro/i },
  { id: 'polpo', label: 'Polpo', category: 'proteine', rank: 240, pattern: /polpo/i },
  { id: 'vitello', label: 'Fettina di vitello', category: 'proteine', rank: 160, pattern: /vitello/i },
  { id: 'uova', label: 'Uova', category: 'proteine', rank: 80, pattern: /\buova\b|\buovo\b/i },
  { id: 'albume', label: "Albume d'uovo", category: 'proteine', rank: 70, pattern: /albumi|albume/i },
  { id: 'straccetti', label: 'Straccetti di pollo o tacchino', category: 'proteine', rank: 130, pattern: /straccetti/i },
  { id: 'parmigiano', label: 'Parmigiano', category: 'proteine', rank: 250, pattern: /parmigiano/i },
  { id: 'philadelphia', label: 'Philadelphia protein', category: 'proteine', rank: 20, pattern: /philadelphia/i },
  { id: 'yogurt', label: 'Yogurt greco bianco 0%', category: 'proteine', rank: 30, pattern: /yogurt greco/i },
  { id: 'mozzarella', label: 'Mozzarella di bufala', category: 'proteine', rank: 40, pattern: /mozzarella/i },
  { id: 'fiocchi-latte', label: 'Fiocchi di latte', category: 'proteine', rank: 50, pattern: /fiocchi di latte/i },
  { id: 'ricotta', label: 'Ricotta di mucca', category: 'proteine', rank: 55, pattern: /ricotta/i },
  { id: 'feta', label: 'Feta', category: 'proteine', rank: 60, pattern: /\bfeta\b/i },
  { id: 'legumi', label: 'Ceci, lenticchie, fagioli (cotti o secchi)', category: 'proteine', rank: 110, pattern: /ceci|lenticchie|fagioli/i },
  { id: 'pasta-legumi', label: 'Pasta di legumi', category: 'proteine', rank: 10, pattern: /pasta di legumi/i },
  { id: 'piselli', label: 'Piselli surgelati / in barattolo', category: 'proteine', rank: 100, pattern: /piselli/i },

  { id: 'pane', label: 'Pane integrale / pancarrè integrale', category: 'carboidrati', rank: 320, pattern: /pancarr[eè]|\bpane\b/i },
  { id: 'frisella', label: 'Frisella integrale', category: 'carboidrati', rank: 300, pattern: /frisella/i },
  { id: 'pasta', label: 'Pasta', category: 'carboidrati', rank: 350, pattern: /\bpasta\b/i },
  { id: 'riso', label: 'Riso', category: 'carboidrati', rank: 340, pattern: /\briso\b/i },
  { id: 'cereali', label: 'Couscous, farro, miglio', category: 'carboidrati', rank: 330, pattern: /cous\s?cous|\bfarro\b|\bmiglio\b|\borzo\b/i },
  { id: 'cornflakes', label: "Cornflakes o fiocchi d'avena", category: 'carboidrati', rank: 280, pattern: /cornflakes|fiocchi d'avena|fiocchi di avena|fiocchi di farro|fiocchi di riso|fiocchi di frumento|riso e frumento/i },
  { id: 'farina', label: 'Farina di avena o tipo 0', category: 'carboidrati', rank: 270, pattern: /farina di avena|farina tipo 0|farina di tipo 0/i },
  { id: 'gallette', label: 'Gallette ricoperte di cioccolato fondente', category: 'carboidrati', rank: 310, pattern: /gallette/i },
  { id: 'patate', label: 'Patate', category: 'carboidrati', rank: 360, pattern: /\bpatate\b/i },

  { id: 'banana', label: 'Banana', category: 'frutta', rank: 400, pattern: /banana/i },
  { id: 'melone', label: 'Melone invernale', category: 'frutta', rank: 410, pattern: /melone/i },
  { id: 'pera', label: 'Pera', category: 'frutta', rank: 420, pattern: /\bpera\b/i },
  { id: 'uva', label: 'Uva', category: 'frutta', rank: 430, pattern: /\buva\b/i },
  { id: 'mela', label: 'Mela', category: 'frutta', rank: 450, pattern: /\bmela\b/i },
  { id: 'cachi', label: 'Cachi', category: 'frutta', rank: 460, pattern: /cachi/i },
  { id: 'frutta', label: 'Frutta mista', category: 'frutta', rank: 470, pattern: /\bfrutta\b/i },
  { id: 'frutta-secca', label: 'Noci, mandorle, nocciole', category: 'frutta', rank: 390, pattern: /nocciole|mandorle|\bnoci\b/i },
  { id: 'arachidi', label: "Burro d'arachidi 100%", category: 'frutta', rank: 370, pattern: /arachidi/i },
  { id: 'crema-novi', label: 'Crema Novi', category: 'frutta', rank: 380, pattern: /crema novi/i },
  { id: 'dolcetto', label: 'Dolcetto o gelato piccolo', category: 'frutta', rank: 385, pattern: /dolcetto|gelato/i },

  { id: 'broccoli', label: 'Broccoli', category: 'verdure', rank: 510, pattern: /broccoli/i },
  { id: 'minestrone', label: 'Minestrone solo verdure', category: 'verdure', rank: 90, pattern: /minestrone(?:\s+solo\s+verdure)?/i },
  { id: 'zucchine', label: 'Zucchine', category: 'verdure', rank: 520, pattern: /zucchine/i },
  { id: 'bietole', label: 'Bietole', category: 'verdure', rank: 530, pattern: /bietol/i },
  { id: 'funghi', label: 'Funghi', category: 'verdure', rank: 540, pattern: /funghi/i },
  { id: 'spinaci', label: 'Spinaci', category: 'verdure', rank: 550, pattern: /spinaci/i },
  { id: 'pomodori', label: 'Pomodori / pomodorini', category: 'verdure', rank: 500, pattern: /pomodor/i },
  { id: 'salsa', label: 'Salsa di pomodoro', category: 'verdure', rank: 85, pattern: /salsa di pomodoro/i },
  { id: 'rucola', label: 'Rucola', category: 'verdure', rank: 560, pattern: /rucola/i },
  { id: 'carciofi', label: 'Carciofi', category: 'verdure', rank: 570, pattern: /carciofi/i },
  { id: 'zucca', label: 'Zucca', category: 'verdure', rank: 580, pattern: /\bzucca\b/i },
  { id: 'melanzane', label: 'Melanzane', category: 'verdure', rank: 440, pattern: /melanzane/i },
  { id: 'cicoria', label: 'Cicoria', category: 'verdure', rank: 590, pattern: /cicoria/i },
  { id: 'scarola', label: 'Scarola', category: 'verdure', rank: 600, pattern: /scarola/i },
  { id: 'verdure', label: 'Verdure', category: 'verdure', rank: 610, pattern: /\bverdure\b/i },

  { id: 'olio', label: "Olio extravergine d'oliva", category: 'dispensa', rank: 700, pattern: /\bolio\b/i },
  { id: 'latte', label: 'Latte parzialmente scremato', category: 'dispensa', rank: 710, pattern: /\blatte\b/i },
  { id: 'spezie', label: 'Spezie', category: 'dispensa', rank: 730, pattern: /basilico|curcuma|origano|prezzemolo|\bpepe\b|paprika|timo|salvia|cipolla|aglio/i },
  { id: 'cannella', label: 'Cannella', category: 'dispensa', rank: 720, pattern: /cannella/i },
]

const byRank = [...GROCERY_CATALOG].sort((a, b) => a.rank - b.rank)

export type CatalogHit = { id: string; start: number; end: number }

export function locateCatalog(text: string): CatalogHit[] {
  const found: { id: string; start: number; end: number; rank: number }[] = []
  for (const item of byRank) {
    const re = new RegExp(item.pattern.source, 'gi')
    for (const match of text.matchAll(re)) {
      const start = match.index ?? 0
      found.push({ id: item.id, start, end: start + match[0].length, rank: item.rank })
    }
  }
  found.sort((a, b) => a.rank - b.rank || a.start - b.start)
  const kept: CatalogHit[] = []
  for (const hit of found) {
    if (kept.some((item) => hit.start < item.end && hit.end > item.start)) continue
    kept.push({ id: hit.id, start: hit.start, end: hit.end })
  }
  return kept.sort((a, b) => a.start - b.start)
}
