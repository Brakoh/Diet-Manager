import type { Meta, Plan } from '../types'

export const DEFAULT_NOTES =
  "Gli alimenti come pasta, riso, carne, verdure vanno pesati crudi; per il condimento utilizza olio extravergine, poco sale e soprattutto niente alcool; puoi utilizzare le spezie se ti piacciono (basilico, curcuma, origano, prezzemolo, pepe, paprika, timo, salvia, cipolla, aglio…). Bevi almeno 2 litri di acqua al giorno, se qualche giorno non puoi consumare quanto riportato nel piano nutrizionale puoi sostituire gli alimenti con quelli di un altro giorno, facendo attenzione poi a rispettare il piano nutrizionale; lo spuntino mattutino può essere invertito con quello pomeridiano e viceversa, così come il pranzo con la cena.. Per quanto riguarda le cotture, evita di soffriggere o friggere gli alimenti, preferisci una cottura alla piastra o in padella antiaderente; l'olio indicato nel piano alimentare si riferisce alla quantità massima da utilizzare per condire l'intero pasto."

export const defaultPlan: Plan = {
  lun: {
    colazione:
      '50g pane integrale tostato (o 2 fette pancarrè integrale) con 50g fesa di tacchino (o 40g bresaola) + pomodorini',
    pranzo:
      '200g macinato di pollo o tacchino + 70g pasta o riso + 5g parmigiano + 200g broccoli + 1 cucchiaio di olio (10ml)',
    spuntino:
      '1 confezione di 2 gallette ricoperte al cioccolato fondente (es. gullon 26g) + 1 banana (150g)',
    cena:
      '200g ceci o lenticchie o fagioli cotti (o 65g pasta di legumi o lenticchie secche) + 50g pane tostato + 200g minestrone solo verdure + 1 cucchiaio di olio (10ml)',
  },
  mar: {
    colazione:
      '200ml latte parzialmente scremato + 40g cornflakes (o fiocchi di farro o di riso e frumento)',
    pranzo:
      '80g pasta o riso o couscous + 2 scatolette di tonno sgocciolato (o 200g gamberetti) + 200g zucchine + 1 cucchiaio di olio (10ml)',
    spuntino: '150g melone invernale + 10g noci o mandorle o nocciole',
    cena: '2 uova + 200g bietole + 50g frisella integrale (o 60g pane integrale) + 1 cucchiaio di olio (10ml)',
  },
  mer: {
    colazione:
      '200ml latte parzialmente scremato + 50g pane tostato (o 2 fette pancarrè integrale) con 1 cucchiaino di crema novi (10-15g)',
    pranzo:
      '70g riso o pasta con 150g ceci o lenticchie o fagioli cotti + 10g parmigiano + 200g funghi + 1 cucchiaio di olio (10ml)',
    spuntino: '1 pera (150g) + 20g parmigiano',
    cena:
      '250g merluzzo o nasello (o 260g calamaro o 250g gamberi) + 200g spinaci + 200g patate (o 50g pane) + 1 cucchiaio di olio (10ml)',
  },
  gio: {
    colazione:
      "200ml latte parzialmente scremato + 40g cornflakes (o fiocchi d'avena o fiocchi di farro)",
    pranzo:
      '70g pane con 120g fesa di tacchino (o 80g bresaola) + pomodori e rucola + 10g parmigiano + 1 cucchiaio di olio (10ml)',
    spuntino: "10g noci o burro d'arachidi 100% + 1 yogurt greco bianco 0% (150g) + 150g uva",
    cena:
      '70g pasta o farro o miglio o cous cous + 200g bocconcini di pesce spada (o 120g salmone o 100g tonno fresco) + 200g carciofi + 1 cucchiaio di olio (10ml)',
  },
  ven: {
    colazione: '50g pane integrale tostato + 30g philadelphia protein + pomodorini',
    pranzo:
      '70g riso o frisella integrale + 200g piselli surgelati + 5g parmigiano + 200g zucca + 1 cucchiaio di olio (10ml)',
    spuntino: '1 mela (150g) + 20g parmigiano',
    cena:
      '100g mozzarella di bufala (o 300g fiocchi di latte o 150g ricotta di mucca o 100g feta) + 250g melanzane grigliate + 5g parmigiano + 50g frisella integrale (o 60g pane integrale) + 1 cucchiaio di olio (10ml)',
  },
  sab: {
    colazione: '50g pane integrale tostato + 50g fesa di tacchino + pomodorini + origano',
    pranzo:
      '200g straccetti di pollo o tacchino + 200g cicoria + 50g pane integrale + 1 cucchiaio di olio (10ml)',
    spuntino: '1 cachi (150g)',
    cena: '1 pizza a scelta o altro',
  },
  dom: {
    colazione:
      'Pancakes: 30g farina di avena o 0 + 30g yogurt greco bianco 0% + cannella + 70ml albumi farciti con 150g frutta + 10-15g crema novi',
    pranzo:
      '70g pasta + salsa di pomodoro + 1 cucchiaino di parmigiano (5g) + 150g fettina di vitello + verdure + 2 cucchiai di olio (20ml)',
    spuntino: '1 dolcetto o 1 gelato piccolo',
    cena:
      '150g merluzzo o nasello (o 180g polpo o 60g salmone affumicato) + 200g scarola + 40g pane integrale + 1 cucchiaio di olio (10ml)',
  },
}

export const defaultMeta: Meta = {
  patient: 'Vittorio Borrello',
  nutritionist: 'Dott.ssa Chiara Selce',
  planDate: '13/10/2026',
  notes: DEFAULT_NOTES,
  sourceName: 'BORRELLO VITTORIO 13-10-2026.docx',
  importedAt: null,
}
