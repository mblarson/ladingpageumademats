const RAW_PLAN = [
  { month: "Janeiro", readings: "Gênesis 1–3; Gênesis 4–7; Gênesis 8–11; Gênesis 12–15; Gênesis 16–18; Gênesis 19–20; Gênesis 21–23; Gênesis 24–25; Gênesis 26–28; Gênesis 29–30; Gênesis 31–32; Gênesis 33–35; Gênesis 36–38; Gênesis 39–41; Gênesis 42–44; Gênesis 45–47; Gênesis 48–50; Êxodo 1–2; Êxodo 3–5; Êxodo 6–9; Êxodo 10–12; Êxodo 13–15; Êxodo 16–18; Êxodo 19–21; Êxodo 22–24; Êxodo 25–27; Êxodo 28–29; Êxodo 30–31; Êxodo 32–34; Êxodo 35–37; Êxodo 38–40" },
  { month: "Fevereiro", readings: "Levítico 1–4; Levítico 5–7; Levítico 8–9; Levítico 10–12; Levítico 13; Levítico 14–15; Levítico 16–18; Levítico 19–21; Levítico 22–23; Levítico 24–25; Levítico 26–27; Números 1–2; Números 3–4; Números 5–6; Números 7; Números 8–10; Números 11–13; Números 14; Números 15–17; Números 18–21; Números 22–24; Números 25–26; Números 27–29; Números 30–31; Números 32–33; Números 34–36; Deuteronômio 1–2; Deuteronômio 3–4" },
  { month: "Março", readings: "Deuteronômio 5–7; Deuteronômio 8–10; Deuteronômio 11–13; Deuteronômio 14–17; Deuteronômio 18–20; Deuteronômio 21–23; Deuteronômio 24–26; Deuteronômio 27–28; Deuteronômio 29–31; Deuteronômio 32–34; Josué 1–4; Josué 5–7; Josué 8–9; Josué 10–11; Josué 12–14; Josué 15–17; Josué 18–20; Josué 21–22; Josué 23–24; Juízes 1–3; Juízes 4–5; Juízes 6–8; Juízes 9–10; Juízes 11–12; Juízes 13–16; Juízes 17–18; Juízes 19–21; Rute 1–4; 1 Samuel 1–3; 1 Samuel 4–7; 1 Samuel 8–10" },
  { month: "Abril", readings: "1 Samuel 11–13; 1 Samuel 14–15; 1 Samuel 16–17; 1 Samuel 18–20; 1 Samuel 21–24; 1 Samuel 25–27; 1 Samuel 28–31; 2 Samuel 1–3; 2 Samuel 4–7; 2 Samuel 8–11; 2 Samuel 12–13; 2 Samuel 14–15; 2 Samuel 16–17; 2 Samuel 18–19; 2 Samuel 20–22; 2 Samuel 23–24; 1 Reis 1; 1 Reis 2–3; 1 Reis 4–6; 1 Reis 7; 1 Reis 8; 1 Reis 9–10; 1 Reis 11–12; 1 Reis 13–14; 1 Reis 15–16; 1 Reis 17–19; 1 Reis 20–22; 2 Reis 1–2; 2 Reis 3–4; 2 Reis 5–7" },
  { month: "Maio", readings: "2 Reis 8–9; 2 Reis 10–12; 2 Reis 13–14; 2 Reis 15–16; 2 Reis 17–18; 2 Reis 19–21; 2 Reis 22–25; 1 Crônicas 1–2; 1 Crônicas 3–4; 1 Crônicas 5–6; 1 Crônicas 7–9; 1 Crônicas 10–12; 1 Crônicas 13–16; 1 Crônicas 17–19; 1 Crônicas 20–23; 1 Crônicas 24–26; 1 Crônicas 27–29; 2 Crônicas 1–4; 2 Crônicas 5–7; 2 Crônicas 8–10; 2 Crônicas 11–14; 2 Crônicas 15–18; 2 Crônicas 19–22; 2 Crônicas 23–25; 2 Crônicas 26–28; 2 Crônicas 29–30; 2 Crônicas 31–33; 2 Crônicas 34–36; Esdras 1–2; Esdras 3–5; Esdras 6–8" },
  { month: "Junho", readings: "Esdras 9–10; Neemias 1–3; Neemias 4–6; Neemias 7–8; Neemias 9–10; Neemias 11–13; Ester 1–3; Ester 4–7; Ester 8–10; Jó 1–5; Jó 6–10; Jó 11–15; Jó 16–21; Jó 22–28; Jó 29–33; Jó 34–37; Jó 38–42; Salmos 1–9; Salmos 10–17; Salmos 18–22; Salmos 23–31; Salmos 32–37; Salmos 38–44; Salmos 45–51; Salmos 52–59; Salmos 60–67; Salmos 68–77; Salmos 78–81; Salmos 82–89" },
  { month: "Julho", readings: "Salmos 90–97; Salmos 98–104; Salmos 105–107; Salmos 108–116; Salmos 117–119:72; Salmos 119:73–176; Salmos 120–134; Salmos 135–142; Salmos 143–150; Provérbios 1–4; Provérbios 5–8; Provérbios 9–13; Provérbios 14–17; Provérbios 18–21; Provérbios 22–24; Provérbios 25–28; Provérbios 29–31; Eclesiastes 1–6; Eclesiastes 7–12; Cantares 1–8; Isaías 1–4; Isaías 5–8; Isaías 9–12; Isaías 13–16; Isaías 17–21; Isaías 22–25; Isaías 26–28; Isaías 29–31; Isaías 32–35; Isaías 36–39; Isaías 40–42" },
  { month: "Agosto", readings: "Isaías 43–47; Isaías 48–51; Isaías 52–56; Isaías 57–59; Isaías 60–63; Isaías 64–66; Jeremias 1–3; Jeremias 4–6; Jeremias 7–9; Jeremias 10–12; Jeremias 13–15; Jeremias 16–18; Jeremias 19–22; Jeremias 23–25; Jeremias 26–28; Jeremias 29–30; Jeremias 31–32; Jeremias 33–35; Jeremias 36–38; Jeremias 39–41; Jeremias 42–44; Jeremias 45–48; Jeremias 49–50; Jeremias 51–52; Lamentações 1–2; Lamentações 3–5; Ezequiel 1–4; Ezequiel 5–8; Ezequiel 9–12; Ezequiel 13–15; Ezequiel 16" },
  { month: "Setembro", readings: "Ezequiel 17–19; Ezequiel 20–21; Ezequiel 22–23; Ezequiel 24–26; Ezequiel 27–28; Ezequiel 29–31; Ezequiel 32–33; Ezequiel 34–36; Ezequiel 37–38; Ezequiel 39–40; Ezequiel 41–43; Ezequiel 44–45; Ezequiel 46–48; Daniel 1–2; Daniel 3–4; Daniel 5–6; Daniel 7–8; Daniel 9–10; Daniel 11–12; Oséias 1–6; Oséias 7–12; Oséias 13–14; Amós 1–5; Amós 6–9; Obadias; Jonas 1–4; Miquéias 1–7; Naum; Habacuque; Sofonias; Ageu; Zacarias 1–6; Zacarias 7–10" },
  { month: "Outubro", readings: "Zacarias 11–14; Malaquias 1–4; Mateus 1–4; Mateus 5–7; Mateus 8–9; Mateus 10–12; Mateus 13–14; Mateus 15–17; Mateus 18–20; Mateus 21–22; Mateus 23–24; Mateus 25–26; Mateus 27–28; Marcos 1–3; Marcos 4–5; Marcos 6–7; Marcos 8–9; Marcos 10–11; Marcos 12–13; Marcos 14–16; Lucas 1; Lucas 2–3; Lucas 4–5; Lucas 6–7; Lucas 8; Lucas 9; Lucas 10–11; Lucas 12–13; Lucas 14–16; Lucas 17–18; Lucas 19–20" },
  { month: "Novembro", readings: "Lucas 21–22; Lucas 23–24; João 1–3; João 4–5; João 6–7; João 8–9; João 10–11; João 12–13; João 14–16; João 17–18; João 19–21; Atos 1–4; Atos 5–7; Atos 8–9; Atos 10–11; Atos 12–13; Atos 14–15; Atos 16–18; Atos 19–20; Atos 21–23; Atos 24–26; Atos 27–28; Romanos 1–3; Romanos 4–7; Romanos 8–11; Romanos 12–14; Romanos 15–16; 1 Coríntios 1–4; 1 Coríntios 5–8; 1 Coríntios 9–11" },
  { month: "Dezembro", readings: "1 Coríntios 12–14; 1 Coríntios 15–16; 2 Coríntios 1–3; 2 Coríntios 4–7; 2 Coríntios 8–13; Gálatas 1–6; Efésios 1–3; Efésios 4–6; Filipenses 1–4; Colossenses 1–4; 1 Tessalonicenses 1–5; 2 Tessalonicenses 1–3; 1 Timóteo 1–4; 1 Timóteo 5–6; 2 Timóteo 1–4; Tito; Filemom; Hebreus 1–4; Hebreus 5–9; Hebreus 10–11; Hebreus 12–13; Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1 João 1–5; 2 João; 3 João; Judas; Apocalipse 1–5; Apocalipse 6–9; Apocalipse 10–12; Apocalipse 13–16; Apocalipse 17–19; Apocalipse 20–22" }
];

const BIBLE_BOOK_MAP = {
  "Gênesis": "Gênesis", "Êxodo": "Êxodo", "Levítico": "Levítico", "Números": "Números",
  "Deuteronômio": "Deuteronômio", "Josué": "Josué", "Juízes": "Juízes", "Rute": "Rute",
  "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel", "1 Reis": "1 Reis", "2 Reis": "2 Reis",
  "1 Crônicas": "1 Crônicas", "2 Crônicas": "2 Crônicas", "Esdras": "Esdras", "Neemias": "Neemias",
  "Ester": "Ester", "Jó": "Jó", "Salmos": "Salmos", "Provérbios": "Provérbios",
  "Eclesiastes": "Eclesiastes", "Cantares": "Cantares", "Isaías": "Isaías",
  "Jeremias": "Jeremias", "Lamentações": "Lamentações", "Ezequiel": "Ezequiel", "Daniel": "Daniel",
  "Oséias": "Oséias", "Joel": "Joel", "Amós": "Amós", "Obadias": "Obadias", "Jonas": "Jonas",
  "Miquéias": "Miquéias", "Naum": "Naum", "Habacuque": "Habacuque", "Sofonias": "Sofonias",
  "Ageu": "Ageu", "Zacarias": "Zacarias", "Malaquias": "Malaquias", "Mateus": "Mateus",
  "Marcos": "Marcos", "Lucas": "Lucas", "João": "João", "Atos": "Atos", "Romanos": "Romanos",
  "1 Coríntios": "1 Coríntios", "2 Coríntios": "2 Coríntios", "Gálatas": "Gálatas",
  "Efésios": "Efésios", "Filipenses": "Filipenses", "Colossenses": "Colossenses",
  "1 Tessalonicenses": "1 Tessalonicenses", "2 Tessalonicenses": "2 Tessalonicenses",
  "1 Timóteo": "1 Timóteo", "2 Timóteo": "2 Timóteo", "Tito": "Tito", "Filemom": "Filemom",
  "Hebreus": "Hebreus", "Tiago": "Tiago", "1 Pedro": "1 Pedro", "2 Pedro": "2 Pedro",
  "1 João": "1 João", "2 João": "2 João", "3 João": "3 João", "Judas": "Judas", "Apocalipse": "Apocalipse"
};

const allRefs = RAW_PLAN.flatMap(m => m.readings.split('; ').map(r => r.trim()));

const fallbackRefs = [];

for (const ref of allRefs) {
  let cleanRef = ref.replace(/–|—/g, '-');
  let bookPt = "";
  let bookEn = "";

  for (const [pt, en] of Object.entries(BIBLE_BOOK_MAP)) {
    if (cleanRef.startsWith(pt)) {
      bookPt = pt;
      bookEn = en;
      break;
    }
  }

  const rangeRegex = new RegExp(`${bookPt}\\s+(\\d+)(?::(\\d+))?\\s*(?:-|–|—)\\s*(\\d+)(?::(\\d+))?`);
  const rangeMatch = cleanRef.match(rangeRegex);

  if (rangeMatch) {
    // Range match
  } else {
    const singleMatch = cleanRef.match(new RegExp(`${bookPt}\\s+(\\d+)(?::(\\d+))?`));
    if (singleMatch) {
      // Single match
    } else {
      fallbackRefs.push({ ref, cleanRef, bookPt, bookEn });
    }
  }
}

console.log("Total Fallbacks found:", fallbackRefs.length);
console.log(JSON.stringify(fallbackRefs, null, 2));
