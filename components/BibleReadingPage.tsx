
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronRight, Check, ArrowLeft, Calendar, Trash2, AlertCircle, ShieldCheck, CheckCircle2, BarChart3, User, BookOpen, X, Loader2, Zap, Star, Camera, Share2 } from 'lucide-react';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { supabase } from '../lib/supabaseClient';

// --- DADOS FIXOS DO PLANO DE LEITURA ---
const RAW_PLAN = [
  {
    month: "Janeiro",
    readings: "Gênesis 1–3; Gênesis 4–7; Gênesis 8–11; Gênesis 12–15; Gênesis 16–18; Gênesis 19–20; Gênesis 21–23; Gênesis 24–25; Gênesis 26–28; Gênesis 29–30; Gênesis 31–32; Gênesis 33–35; Gênesis 36–38; Gênesis 39–41; Gênesis 42–44; Gênesis 45–47; Gênesis 48–50; Êxodo 1–2; Êxodo 3–5; Êxodo 6–9; Êxodo 10–12; Êxodo 13–15; Êxodo 16–18; Êxodo 19–21; Êxodo 22–24; Êxodo 25–27; Êxodo 28–29; Êxodo 30–31; Êxodo 32–34; Êxodo 35–37; Êxodo 38–40"
  },
  {
    month: "Fevereiro",
    readings: "Levítico 1–4; Levítico 5–7; Levítico 8–9; Levítico 10–12; Levítico 13; Levítico 14–15; Levítico 16–18; Levítico 19–21; Levítico 22–23; Levítico 24–25; Levítico 26–27; Números 1–2; Números 3–4; Números 5–6; Números 7; Números 8–10; Números 11–13; Números 14; Números 15–17; Números 18–21; Números 22–24; Números 25–26; Números 27–29; Números 30–31; Números 32–33; Números 34–36; Deuteronômio 1–2; Deuteronômio 3–4"
  },
  {
    month: "Março",
    readings: "Deuteronômio 5–7; Deuteronômio 8–10; Deuteronômio 11–13; Deuteronômio 14–17; Deuteronômio 18–20; Deuteronômio 21–23; Deuteronômio 24–26; Deuteronômio 27–28; Deuteronômio 29–31; Deuteronômio 32–34; Josué 1–4; Josué 5–7; Josué 8–9; Josué 10–11; Josué 12–14; Josué 15–17; Josué 18–20; Josué 21–22; Josué 23–24; Juízes 1–3; Juízes 4–5; Juízes 6–8; Juízes 9–10; Juízes 11–12; Juízes 13–16; Juízes 17–18; Juízes 19–21; Rute 1–4; 1 Samuel 1–3; 1 Samuel 4–7; 1 Samuel 8–10"
  },
  {
    month: "Abril",
    readings: "1 Samuel 11–13; 1 Samuel 14–15; 1 Samuel 16–17; 1 Samuel 18–20; 1 Samuel 21–24; 1 Samuel 25–27; 1 Samuel 28–31; 2 Samuel 1–3; 2 Samuel 4–7; 2 Samuel 8–11; 2 Samuel 12–13; 2 Samuel 14–15; 2 Samuel 16–17; 2 Samuel 18–19; 2 Samuel 20–22; 2 Samuel 23–24; 1 Reis 1; 1 Reis 2–3; 1 Reis 4–6; 1 Reis 7; 1 Reis 8; 1 Reis 9–10; 1 Reis 11–12; 1 Reis 13–14; 1 Reis 15–16; 1 Reis 17–19; 1 Reis 20–22; 2 Reis 1–2; 2 Reis 3–4; 2 Reis 5–7"
  },
  {
    month: "Maio",
    readings: "2 Reis 8–9; 2 Reis 10–12; 2 Reis 13–14; 2 Reis 15–16; 2 Reis 17–18; 2 Reis 19–21; 2 Reis 22–25; 1 Crônicas 1–2; 1 Crônicas 3–4; 1 Crônicas 5–6; 1 Crônicas 7–9; 1 Crônicas 10–12; 1 Crônicas 13–16; 1 Crônicas 17–19; 1 Crônicas 20–23; 1 Crônicas 24–26; 1 Crônicas 27–29; 2 Crônicas 1–4; 2 Crônicas 5–7; 2 Crônicas 8–10; 2 Crônicas 11–14; 2 Crônicas 15–18; 2 Crônicas 19–22; 2 Crônicas 23–25; 2 Crônicas 26–28; 2 Crônicas 29–30; 2 Crônicas 31–33; 2 Crônicas 34–36; Esdras 1–2; Esdras 3–5; Esdras 6–8"
  },
  {
    month: "Junho",
    readings: "Esdras 9–10; Neemias 1–3; Neemias 4–6; Neemias 7–8; Neemias 9–10; Neemias 11–13; Ester 1–3; Ester 4–7; Ester 8–10; Jó 1–5; Jó 6–10; Jó 11–15; Jó 16–21; Jó 22–28; Jó 29–33; Jó 34–37; Jó 38–42; Salmos 1–9; Salmos 10–17; Salmos 18–22; Salmos 23–31; Salmos 32–37; Salmos 38–44; Salmos 45–51; Salmos 52–59; Salmos 60–67; Salmos 68–77; Salmos 78–81; Salmos 82–89"
  },
  {
    month: "Julho",
    readings: "Salmos 90–97; Salmos 98–104; Salmos 105–107; Salmos 108–116; Salmos 117–119:72; Salmos 119:73–176; Salmos 120–134; Salmos 135–142; Salmos 143–150; Provérbios 1–4; Provérbios 5–8; Provérbios 9–13; Provérbios 14–17; Provérbios 18–21; Provérbios 22–24; Provérbios 25–28; Provérbios 29–31; Eclesiastes 1–6; Eclesiastes 7–12; Cantares 1–8; Isaías 1–4; Isaías 5–8; Isaías 9–12; Isaías 13–16; Isaías 17–21; Isaías 22–25; Isaías 26–28; Isaías 29–31; Isaías 32–35; Isaías 36–39; Isaías 40–42"
  },
  {
    month: "Agosto",
    readings: "Isaías 43–47; Isaías 48–51; Isaías 52–56; Isaías 57–59; Isaías 60–63; Isaías 64–66; Jeremias 1–3; Jeremias 4–6; Jeremias 7–9; Jeremias 10–12; Jeremias 13–15; Jeremias 16–18; Jeremias 19–22; Jeremias 23–25; Jeremias 26–28; Jeremias 29–30; Jeremias 31–32; Jeremias 33–35; Jeremias 36–38; Jeremias 39–41; Jeremias 42–44; Jeremias 45–48; Jeremias 49–50; Jeremias 51–52; Lamentações 1–2; Lamentações 3–5; Ezequiel 1–4; Ezequiel 5–8; Ezequiel 9–12; Ezequiel 13–15; Ezequiel 16"
  },
  {
    month: "Setembro",
    readings: "Ezequiel 17–19; Ezequiel 20–21; Ezequiel 22–23; Ezequiel 24–26; Ezequiel 27–28; Ezequiel 29–31; Ezequiel 32–33; Ezequiel 34–36; Ezequiel 37–38; Ezequiel 39–40; Ezequiel 41–43; Ezequiel 44–45; Ezequiel 46–48; Daniel 1–2; Daniel 3–4; Daniel 5–6; Daniel 7–8; Daniel 9–10; Daniel 11–12; Oséias 1–6; Oséias 7–12; Oséias 13–14; Amós 1–5; Amós 6–9; Obadias; Jonas 1–4; Miquéias 1–7; Naum; Habacuque; Sofonias; Ageu; Zacarias 1–6; Zacarias 7–10"
  },
  {
    month: "Outubro",
    readings: "Zacarias 11–14; Malaquias 1–4; Mateus 1–4; Mateus 5–7; Mateus 8–9; Mateus 10–12; Mateus 13–14; Mateus 15–17; Mateus 18–20; Mateus 21–22; Mateus 23–24; Mateus 25–26; Mateus 27–28; Marcos 1–3; Marcos 4–5; Marcos 6–7; Marcos 8–9; Marcos 10–11; Marcos 12–13; Marcos 14–16; Lucas 1; Lucas 2–3; Lucas 4–5; Lucas 6–7; Lucas 8; Lucas 9; Lucas 10–11; Lucas 12–13; Lucas 14–16; Lucas 17–18; Lucas 19–20"
  },
  {
    month: "Novembro",
    readings: "Lucas 21–22; Lucas 23–24; João 1–3; João 4–5; João 6–7; João 8–9; João 10–11; João 12–13; João 14–16; João 17–18; João 19–21; Atos 1–4; Atos 5–7; Atos 8–9; Atos 10–11; Atos 12–13; Atos 14–15; Atos 16–18; Atos 19–20; Atos 21–23; Atos 24–26; Atos 27–28; Romanos 1–3; Romanos 4–7; Romanos 8–11; Romanos 12–14; Romanos 15–16; 1 Coríntios 1–4; 1 Coríntios 5–8; 1 Coríntios 9–11"
  },
  {
    month: "Dezembro",
    readings: "1 Coríntios 12–14; 1 Coríntios 15–16; 2 Coríntios 1–3; 2 Coríntios 4–7; 2 Coríntios 8–13; Gálatas 1–6; Efésios 1–3; Efésios 4–6; Filipenses 1–4; Colossenses 1–4; 1 Tessalonicenses 1–5; 2 Tessalonicenses 1–3; 1 Timóteo 1–4; 1 Timóteo 5–6; 2 Timóteo 1–4; Tito; Filemom; Hebreus 1–4; Hebreus 5–9; Hebreus 10–11; Hebreus 12–13; Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1 João 1–5; 2 João; 3 João; Judas; Apocalipse 1–5; Apocalipse 6–9; Apocalipse 10–12; Apocalipse 13–16; Apocalipse 17–19; Apocalipse 20–22"
  },
];

// Processamento dos dados
const ANNUAL_PLAN = RAW_PLAN.map((m, mIdx) => ({
  id: mIdx,
  name: m.month,
  items: m.readings.split('; ').map((ref, rIdx) => ({
    id: `m${mIdx}-i${rIdx}`,
    ref: ref.trim()
  }))
}));

// Mapeamento de Livros para API (Português -> Identificador API)
// Alguns livros na API bible-api.com com translation=almeida exigem o nome em PT ou respondem errado em EN (ex: Ezra -> Ezekiel)
const BIBLE_BOOK_MAP: Record<string, string> = {
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

interface BibleReadingPageProps {
  onBack: () => void;
  onIntroComplete?: () => void;
}

interface Verse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleTextResponse {
  reference: string;
  text: string;
  verses: Verse[];
  error?: string;
}

// --- COMPONENTS ---

const PRIMEIROCARREGAMENTO: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    const funMessages = [
        "Abrindo o Mar Vermelho...",
        "Afiando a Espada do Espírito...",
        "Preparando o Maná do dia...",
        "Chamando os Profetas...",
        "Derrubando Muralhas...",
        "Enchendo o azeite...",
        "Sintonizando na Rádio Celestial..."
    ];

    useEffect(() => {
        const duration = 3000;
        const intervalTime = 30; 
        const steps = duration / intervalTime;
        let currentStep = 0;

        const progressTimer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min((currentStep / steps) * 100, 100);
            setProgress(newProgress);

            if (currentStep >= steps) {
                clearInterval(progressTimer);
                setTimeout(onFinish, 500);
            }
        }, intervalTime);

        const messageTimer = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % funMessages.length);
        }, 800);

        return () => {
            clearInterval(progressTimer);
            clearInterval(messageTimer);
        };
    }, []);

    return (
        <motion.div 
            className="fixed inset-0 z-[100] bg-[#19244e] flex flex-col items-center justify-center p-6 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ y: "-100%", transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#253c96_0%,#19244e_100%)] opacity-80" />
            <div className="absolute inset-0 opacity-10" style={{ 
                backgroundImage: 'radial-gradient(#c4e7e5 2px, transparent 2px)',
                backgroundSize: '30px 30px'
            }} />

            <div className="relative z-10 mb-12">
                <motion.div
                    animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                >
                     <div className="absolute inset-0 bg-[#f36b2e]/20 blur-3xl rounded-full scale-150 animate-pulse" />
                     <img 
                        src="https://raw.githubusercontent.com/mblarson/imagens/main/mascotebiblia.png" 
                        alt="Mascote Bíblia"
                        className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_0_30px_rgba(243,107,46,0.3)]"
                     />
                     <div className="absolute -top-4 -right-4 text-[#f59a1e] animate-bounce"><Star fill="currentColor" /></div>
                     <div className="absolute bottom-4 -left-8 text-[#f36b2e] animate-pulse"><Zap fill="currentColor" size={32} /></div>
                </motion.div>
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-4">
                <div className="h-8 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={messageIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-[#c4e7e5] font-fun text-xl md:text-2xl uppercase tracking-wide text-center"
                        >
                            {funMessages[messageIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                <div className="w-full h-6 md:h-8 bg-[#19244e] border-4 border-[#c4e7e5] rounded-full overflow-hidden relative shadow-[0_0_20px_rgba(196,231,229,0.1)]">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #c4e7e5 25%, transparent 25%, transparent 50%, #c4e7e5 50%, #c4e7e5 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }} />
                    <motion.div 
                        className="h-full bg-[#f36b2e] relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_white]" />
                    </motion.div>
                </div>
                <p className="text-[#c4e7e5]/30 text-xs font-mono font-bold mt-2">CARREGANDO {Math.round(progress)}%</p>
            </div>
        </motion.div>
    );
};

const BibleIntro: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // Safety timeout: if video doesn't trigger onEnded within 12s, finish anyway
        // This is increased because mobile networks can be slow
        const timer = setTimeout(() => {
            if (window.innerWidth < 768 && !isVideoReady) {
                console.log("Video loading timed out, finishing intro...");
                onFinish();
            }
        }, 12000);

        return () => {
            window.removeEventListener('resize', checkMobile);
            clearTimeout(timer);
        };
    }, [onFinish, isVideoReady]);

    // If it's desktop or there was a video error, use original loading
    if (!isMobile || videoError) {
        return <PRIMEIROCARREGAMENTO onFinish={onFinish} />;
    }

    return (
        <motion.div 
            className="fixed inset-0 z-[100] bg-[#19244e] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
            {!isVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#19244e] z-10">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
            )}
            
            <video
                autoPlay
                muted
                playsInline
                webkit-playsinline="true"
                preload="auto"
                className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
                onEnded={onFinish}
                onCanPlay={() => setIsVideoReady(true)}
                onPlaying={() => setIsVideoReady(true)} // Double check to show as soon as it plays
                onError={(e) => {
                    console.error("Cloudinary video failed:", e);
                    setVideoError(true);
                }}
            >
                {/* Cloudinary Optimized Streaming - Using f_auto for best performance/format selection */}
                <source 
                    src="https://res.cloudinary.com/dcmi2z6xp/video/upload/f_auto,q_auto/v1776882503/leiturabiblica_wqle8r.mp4" 
                    type="video/mp4" 
                />
            </video>
        </motion.div>
    );
};

const ReadingReader: React.FC<{ 
  item: { id: string; ref: string } | null; 
  onClose: () => void; 
  onComplete: (id: string, ref: string) => void;
}> = ({ item, onClose, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<BibleTextResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;

    const fetchPart = async (ref: string): Promise<Verse[]> => {
      const encodedRef = encodeURIComponent(ref);
      const res = await fetch(`https://bible-api.com/${encodedRef}?translation=almeida`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro na API (${res.status})`);
      }
      const data = await res.json();
      return data.verses || [];
    };

    const fetchText = async () => {
      setLoading(true);
      setError(null);
      try {
        let cleanRef = item.ref.replace(/–|—/g, '-');
        let bookPt = "";
        let bookEn = "";

        for (const [pt, en] of Object.entries(BIBLE_BOOK_MAP)) {
          if (cleanRef.startsWith(pt)) {
            bookPt = pt;
            bookEn = en;
            break;
          }
        }

        if (!bookEn) throw new Error("Livro não identificado.");

        // Lógica aprimorada de parser para evitar o erro "too many chapters"
        // Formatos tratados: "Salmos 1-9", "Salmos 117-119:72", "Gênesis 1-3"
        const rangeRegex = new RegExp(`${bookPt}\\s+(\\d+)(?::(\\d+))?\\s*(?:-|–|—)\\s*(\\d+)(?::(\\d+))?`);
        const rangeMatch = cleanRef.match(rangeRegex);

        let finalVerses: Verse[] = [];

        if (rangeMatch) {
          const startChapter = parseInt(rangeMatch[1]);
          const startVerse = rangeMatch[2] ? parseInt(rangeMatch[2]) : null;
          const endChapter = rangeMatch[3] ? parseInt(rangeMatch[3]) : startChapter;
          const endVerse = rangeMatch[4] ? parseInt(rangeMatch[4]) : null;

          // SEMPRE buscamos capítulo por capítulo se houver um intervalo, 
          // isso garante que nunca estouraremos o limite de "too many chapters" do backend.
          for (let ch = startChapter; ch <= endChapter; ch++) {
            let currentQuery = `${bookEn} ${ch}`;
            
            // Caso especial: início em versículo específico no primeiro capítulo do intervalo
            if (ch === startChapter && startVerse) {
              if (startChapter === endChapter && endVerse) {
                // Intervalo de versículos no mesmo capítulo: Genesis 1:1-5
                currentQuery += `:${startVerse}-${endVerse}`;
              } else {
                // Início no meio do capítulo mas continua para outros: Genesis 1:10-FIM
                currentQuery += `:${startVerse}-999`; // bible-api entende 999 como "até o fim"
              }
            } 
            // Caso especial: fim em versículo específico no último capítulo do intervalo
            else if (ch === endChapter && endVerse) {
              currentQuery += `:1-${endVerse}`;
            }

            try {
              const part = await fetchPart(currentQuery);
              finalVerses = [...finalVerses, ...part];
            } catch (partErr: any) {
              // Se falhar em um capítulo específico, lançamos o erro
              throw partErr;
            }
          }
        } else {
          // Caso seja apenas um capítulo: "João 3" ou "João 3:16"
          const singleMatch = cleanRef.match(new RegExp(`${bookPt}\\s+(\\d+)(?::(\\d+))?`));
          if (singleMatch) {
            const ch = singleMatch[1];
            const vs = singleMatch[2] ? `:${singleMatch[2]}` : "";
            finalVerses = await fetchPart(`${bookEn} ${ch}${vs}`);
          } else {
            // Fallback para referências que o Regex não capturou (simples)
            const apiRef = cleanRef.replace(bookPt, bookEn);
            finalVerses = await fetchPart(apiRef);
          }
        }

        if (finalVerses.length === 0) throw new Error("Nenhum versículo encontrado.");
        
        setContent({ reference: item.ref, text: "", verses: finalVerses });
      } catch (err: any) {
        console.error("🚨 [Bible API Error]:", err);
        if (err.message.includes("404")) {
           setError("Texto não encontrado para esta referência na tradução escolhida.");
        } else {
           setError("Erro ao carregar o texto bíblico. Verifique sua conexão.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       {/* Backdrop */}
       <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }} 
         onClick={onClose} 
         className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
       />
       
       <motion.div 
         initial={{ scale: 0.9, y: 30, opacity: 0, rotate: -1 }} 
         animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }} 
         exit={{ scale: 0.9, y: 30, opacity: 0, rotate: 1 }} 
         transition={{ type: "spring", stiffness: 200, damping: 25 }}
         className="relative bg-[#f5f3ef] w-full max-w-2xl max-h-[90vh] rounded-[4px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
       >
          {/* Subtle paper texture/gradient overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_0%,transparent_5%,transparent_95%,rgba(0,0,0,0.03)_100%)]" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '4px 4px' }} />

          {/* Paper Edge Decor */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/5" />

          <div className="relative z-10 flex flex-col h-full overflow-hidden">
            {/* Header style "Página de Bíblia" */}
            <div className="p-8 pb-4 text-center border-b border-[#e5e0d5]">
               <h3 className="text-[#c4a484] font-serif italic text-sm mb-1">Sagrada Escritura</h3>
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2c2c2c] tracking-tight">{item.ref}</h2>
               <button onClick={onClose} className="absolute top-6 right-6 p-2 text-[#2c2c2c]/30 hover:text-[#2c2c2c] transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:px-16 md:py-12 no-scrollbar scroll-smooth">
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-20 text-[#c4a484]">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p className="font-serif italic text-sm">Preparando a página...</p>
                 </div>
               ) : error ? (
                 <div className="flex flex-col items-center justify-center py-20 text-red-800 text-center">
                    <AlertCircle size={40} className="mb-4 opacity-50" />
                    <p className="font-serif font-bold mb-4">{error}</p>
                    <button onClick={onClose} className="px-8 py-3 bg-[#2c2c2c] text-white rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all">Voltar</button>
                 </div>
               ) : (
                 <div className="font-serif text-[#2c2c2c] whitespace-normal leading-[1.8] text-justify md:text-lg">
                    {content?.verses?.map((verse, idx) => (
                      <span key={idx} className="relative transition-colors duration-500 hover:bg-[#efece5]">
                         <sup className="text-[#c4a484] font-bold text-[10px] mr-1.5 align-top inline-block mt-1 select-none font-sans">{verse.verse}</sup>
                         <span className="mr-1">{verse.text.trim()}</span>
                         {verse.text.endsWith('\n') ? <span className="block h-4" /> : ' '}
                      </span>
                    ))}
                    <div className="mt-16 pt-8 border-t border-[#e5e0d5] text-center text-[#c4a484] text-[10px] uppercase tracking-[0.2em] italic font-serif">Almeida Revista e Corrigida</div>
                 </div>
               )}
            </div>

            {/* Footer / Action */}
            <div className="p-8 pt-4 bg-[#f1eee8] border-t border-[#e5e0d5] flex justify-center">
               <button 
                 onClick={() => { onComplete(item.id, item.ref); onClose(); }} 
                 disabled={loading || !!error} 
                 className="group relative w-full md:w-auto overflow-hidden px-10 py-4 bg-[#2c2c2c] text-[#f5f3ef] font-bold uppercase tracking-[0.2em] text-xs rounded-sm shadow-xl transition-all hover:bg-[#1a1a1a] disabled:opacity-30 flex items-center justify-center gap-3"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <CheckCircle2 size={18} className="text-[#c4a484]" /> 
                  Concluir Leitura
               </button>
            </div>
          </div>
       </motion.div>
    </div>
  );
};

// --- CELEBRATION MODAL COMPONENT ---
const CelebrationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 300 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
      />
      <motion.div 
        initial={{ scale: 0.8, y: 100, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.8, y: 100, opacity: 0 }} 
        className="relative bg-gradient-to-b from-[#253c96] to-[#19244e] border-2 border-[#f36b2e]/30 w-full max-w-sm rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(243,107,46,0.2)] p-6 text-center max-h-[90vh] flex flex-col"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f36b2e] to-transparent" />
        
        <div className="overflow-y-auto no-scrollbar flex-1 flex flex-col items-center">
          <div className="mb-4 shrink-0 relative">
            <motion.img 
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              src="https://raw.githubusercontent.com/mblarson/imagens/main/logo50anosquadrada.png" 
              alt="Logo 50 Anos" 
              className="w-20 h-auto mx-auto relative z-10 mix-blend-screen"
              referrerPolicy="no-referrer"
            />
          </div>

          <h2 className="text-2xl font-display uppercase text-white mb-4 leading-tight shrink-0">
            Parabéns!
          </h2>
          
          <div className="space-y-4 mb-6">
            <p className="text-white/80 text-base leading-relaxed font-medium">
              Você tem se demonstrado dedicado à Palavra de Deus.
            </p>
            <p className="text-[#f36b2e] text-lg font-bold uppercase tracking-wide">
              Reconhecendo esse comprometimento, a Umademats te dará um brinde SURPRESA.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-[#f59a1e]/20 flex items-center justify-center shrink-0">
                <Camera className="text-[#f59a1e]" size={16} />
              </div>
              <p className="text-white/60 text-[11px] italic leading-tight">
                Tire um print dessa tela e poste nos stories marcando <span className="text-white font-bold not-italic">@umademats</span>!
              </p>
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
              Deus te abençoe.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-[#f36b2e] text-black font-black uppercase py-4 rounded-2xl hover:bg-white transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 group shrink-0 mt-2"
        >
          Continuar Lendo <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};

export const BibleReadingPage: React.FC<BibleReadingPageProps> = ({ onBack, onIntroComplete }) => {
  const [view, setView] = useState<'months' | 'details'>('months');
  const [selectedMonthId, setSelectedMonthId] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [readingItem, setReadingItem] = useState<{id: string, ref: string} | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { completedItems, toggleItemCompletion, resetProgress, isItemComplete, user, loading } = useReadingProgress();
  const { config } = useSiteConfig();

  const getMonthStats = (monthId: number) => {
    const month = ANNUAL_PLAN[monthId];
    const total = month.items.length;
    const completed = month.items.filter(item => completedItems.includes(item.id)).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const totalAnnualProgress = useMemo(() => {
    let totalItems = 0;
    let totalCompleted = 0;
    ANNUAL_PLAN.forEach(m => {
      totalItems += m.items.length;
      totalCompleted += m.items.filter(i => completedItems.includes(i.id)).length;
    });
    return totalItems === 0 ? 0 : Math.round((totalCompleted / totalItems) * 100);
  }, [completedItems]);

  const handleLogin = async () => {
    localStorage.setItem('return_to_bible', 'true');
    const redirectTo = window.location.origin;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } } });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };
  const handleMonthSelect = (id: number) => { setSelectedMonthId(id); setView('details'); };
  const handleBackNavigation = () => { if (view === 'details') setView('months'); else onBack(); };
  const openReading = (item: {id: string, ref: string}) => setReadingItem(item);

  const handleCompleteReading = (id: string, ref: string) => {
    if (!isItemComplete(id)) {
      toggleItemCompletion(id, ref);
      if (config.bible_campaign_active) {
        setShowCelebration(true);
      }
    }
  };

  if (showIntro) return <BibleIntro onFinish={() => { setShowIntro(false); if (onIntroComplete) onIntroComplete(); }} />;

  return (
    <div className="min-h-screen w-full bg-[#19244e] text-[#c4e7e5] flex flex-col font-sans">
      <AnimatePresence>
        {readingItem && (
          <ReadingReader 
            item={readingItem} 
            onClose={() => setReadingItem(null)} 
            onComplete={handleCompleteReading} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCelebration && <CelebrationModal onClose={() => setShowCelebration(false)} />}
      </AnimatePresence>
      <header className="sticky top-0 z-40 bg-[#19244e]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button onClick={handleBackNavigation} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white group"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /></button>
            <div className="flex flex-col justify-center h-full pt-1">
              <h1 className="font-display italic uppercase text-2xl tracking-tight text-white leading-[0.8]">UMADE<span className="text-[#f36b2e]">MATS</span></h1>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#f59a1e] font-bold opacity-80 mt-1">Leitura Bíblica 2026</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {!loading && (
               user ? (
                 <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-1.5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 rounded-full border border-white/10 transition-all group max-w-[200px]">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0">{user.user_metadata.avatar_url ? <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" /> : <User size={16} className="text-white/70 m-auto mt-2" />}</div>
                    <div className="flex flex-col items-start overflow-hidden"><span className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none group-hover:text-red-400">Sair de</span><span className="text-xs text-white font-bold truncate w-full group-hover:text-red-300">{user.user_metadata.full_name || user.email?.split('@')[0]}</span></div>
                 </button>
               ) : (
                 <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition-colors shadow-lg"><span className="text-xs font-bold font-sans text-gray-700 tracking-wide">Entrar com Google</span></button>
               )
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full fluid-container relative">
        <AnimatePresence mode="wait">
          {view === 'months' ? (
            <motion.div key="months" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
               <div className="px-6 pt-8 pb-4">
                  <h2 className="text-3xl font-display uppercase text-white">Selecione o Mês</h2>
                  <p className="text-white/50 text-sm">Visualize o plano completo de leitura.</p>
               </div>
               <div className="flex flex-col w-full">
                 <div className="px-4 mb-6">
                   <div className="bg-[#253c96] rounded-xl p-4 border border-white/10 flex items-center gap-4">
                      <div className="bg-[#f36b2e]/10 p-3 rounded-full"><BarChart3 className="text-[#f36b2e]" size={24} /></div>
                      <div className="flex-1">
                         <div className="flex justify-between text-xs font-bold uppercase mb-2"><span className="text-white">Progresso Anual</span><span className="text-[#f36b2e]">{totalAnnualProgress}%</span></div>
                         <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${totalAnnualProgress}%` }} className="h-full bg-gradient-to-r from-[#f59a1e] to-[#f36b2e] rounded-full" /></div>
                      </div>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pb-12">
                   {ANNUAL_PLAN.map((month) => {
                     const stats = getMonthStats(month.id);
                     const isComplete = stats.percentage === 100;
                     return (
                       <motion.button key={month.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02, translateY: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleMonthSelect(month.id)} className={`relative overflow-hidden rounded-2xl p-6 aspect-[4/3] flex flex-col justify-between text-left border transition-all duration-300 group ${isComplete ? 'bg-[#f36b2e]/10 border-[#f36b2e] text-white' : 'bg-[#253c96] border-white/5 hover:border-white/20 text-[#c4e7e5]'}`}>
                         {isComplete && <div className="absolute top-0 right-0 p-3"><div className="bg-[#f36b2e] rounded-full p-1 shadow-lg"><Check size={12} className="text-black" strokeWidth={3} /></div></div>}
                         <div><span className="text-xs font-sans font-bold uppercase tracking-widest opacity-50 block mb-1">Mês {(month.id + 1).toString().padStart(2,'0')}</span><h3 className={`text-2xl font-display uppercase tracking-wide group-hover:text-[#f36b2e] transition-colors ${isComplete ? 'text-[#f36b2e]' : 'text-white'}`}>{month.name}</h3></div>
                         <div className="w-full"><div className="flex justify-between text-[10px] uppercase font-bold mb-1 opacity-70"><span>Progresso</span><span>{stats.percentage}%</span></div><div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${stats.percentage}%` }} className={`h-full rounded-full ${isComplete ? 'bg-[#f36b2e]' : 'bg-[#f59a1e]'}`} /></div></div>
                       </motion.button>
                     );
                   })}
                 </div>
                 <div className="w-full px-6 py-8 border-t border-white/5 mt-auto flex justify-center">
                    {!showResetConfirm ? (
                      <button onClick={() => setShowResetConfirm(true)} className="text-white/30 text-xs uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2"><Trash2 size={14} /> Reiniciar Histórico</button>
                    ) : (
                       <div className="flex flex-col items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl w-full max-sm"><div className="flex items-center gap-2 text-red-400"><AlertCircle size={16} /><span className="text-sm font-bold">Apagar todo o progresso?</span></div><div className="flex gap-3 w-full"><button onClick={() => setShowResetConfirm(false)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wide text-white">Cancelar</button><button onClick={() => { resetProgress(); setShowResetConfirm(false); }} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-xs font-bold uppercase tracking-wide text-white shadow-lg">Sim, Apagar</button></div></div>
                    )}
                 </div>
               </div>
            </motion.div>
          ) : (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full">
               <div className="flex flex-col gap-4 p-4 pb-24 max-w-3xl mx-auto w-full">
                 <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div><h2 className="text-[#f59a1e] font-sans text-xs font-bold uppercase tracking-[0.2em] mb-2">Plano Mensal</h2><h1 className="text-4xl md:text-6xl font-display text-white uppercase leading-none">{ANNUAL_PLAN[selectedMonthId].name}</h1></div>
                    {getMonthStats(selectedMonthId).percentage === 100 && <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-xs bg-green-500/20 text-green-500 border border-green-500/50 shadow-lg select-none"><CheckCircle2 size={18} /> Mês Concluído</div>}
                 </div>
                 <div className="mb-8">
                     <div className="flex justify-between text-xs text-white/50 mb-1 font-mono"><span>{getMonthStats(selectedMonthId).completed} / {getMonthStats(selectedMonthId).total} leituras</span><span>{getMonthStats(selectedMonthId).percentage}%</span></div>
                     <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${getMonthStats(selectedMonthId).percentage}%` }} className="h-full bg-[#f36b2e]" /></div>
                 </div>
                 <div className="flex flex-col gap-2">
                    {ANNUAL_PLAN[selectedMonthId].items.map((item, index) => {
                      const isRead = isItemComplete(item.id);
                      return (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} onClick={() => openReading(item)} className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all duration-200 select-none ${isRead ? 'bg-[#253c96] border-[#f36b2e]/30 opacity-60 hover:opacity-100' : 'bg-[#253c96]/40 border-white/5 hover:bg-[#253c96]/60 hover:border-white/20'}`}>
                           <div className="flex items-center gap-4"><div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${isRead ? 'bg-[#f36b2e] border-[#f36b2e]' : 'bg-transparent border-white/20 group-hover:border-white/50'}`}>{isRead ? <Check size={16} className="text-black" strokeWidth={3} /> : <BookOpen size={14} className="text-white/50" />}</div><span className={`font-serif text-lg md:text-xl transition-colors ${isRead ? 'text-white/40 line-through decoration-white/20' : 'text-white'}`}>{item.ref}</span></div>
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#f36b2e] text-xs font-bold uppercase tracking-wider flex items-center gap-1">Ler Agora <ChevronRight size={14} /></div>
                        </motion.div>
                      );
                    })}
                 </div>
                 <div className="mt-8 p-4 rounded-xl bg-[#c4e7e5]/10 border border-[#c4e7e5]/20 flex gap-3 text-[#c4e7e5]"><ShieldCheck className="shrink-0" /><p className="text-xs leading-relaxed">Este sistema apenas organiza o seu progresso. Lembre-se de ler a Bíblia Sagrada em seu momento devocional para edificação espiritual.</p></div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
