'use client';

import React, { useState, useEffect } from 'react';

const LENSES = [
  { id: 'jung', name: 'Jung', year: '1934', tagline: 'Il messaggio del tuo profondo', glyph: '☉', question: 'Cosa ti sta dicendo la tua mente profonda?', free: true },
  { id: 'freud', name: 'Freud', year: '1899', tagline: 'Il sogno come desiderio rimosso', glyph: 'Ψ', question: 'Cosa stai desiderando senza ammetterlo?', free: false },
  { id: 'gestalt', name: 'Gestalt', year: '1969', tagline: 'Tutti i personaggi sei tu', glyph: '◐', question: 'Quale parte di te stai ignorando?', free: false },
  { id: 'cognitivo', name: 'Scienza', year: '2010', tagline: 'Cosa fa il tuo cervello mentre sogni', glyph: '◈', question: 'Cosa sta elaborando il tuo cervello?', free: false },
  { id: 'simbolico', name: 'Tradizione', year: '', tagline: 'Il significato antico dei simboli', glyph: '✦', question: 'Cosa dicono i simboli antichi?', free: false },
];

export default function Oniros() {
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [allInterpretations, setAllInterpretations] = useState({});
  const [lensStatus, setLensStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('input');
  const [showPaywallBanner, setShowPaywallBanner] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [paid, setPaid] = useState(false);
  const [hasUsedFreeLens, setHasUsedFreeLens] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('oniros_paid') === 'true') {
      setPaid(true);
      const savedDream = localStorage.getItem('oniros_dream');
      if (savedDream) {
        setDream(savedDream);
        localStorage.removeItem('oniros_dream');
      }
    }
    if (localStorage.getItem('oniros_used_free') === 'true') {
      setHasUsedFreeLens(true);
    }
  }, []);

  const handleCheckout = async () => {
    try {
      localStorage.setItem('oniros_dream', dream);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError('Errore nel pagamento. Riprova.');
    }
  };

  const fetchLens = async (lensId, dreamText) => {
    setLensStatus(prev => ({ ...prev, [lensId]: 'loading' }));
    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream: dreamText, lens: lensId }),
      });
      const data = await response.json();
      if (data.interpretation) {
        setAllInterpretations(prev => ({ ...prev, [lensId]: data.interpretation }));
        setLensStatus(prev => ({ ...prev, [lensId]: 'done' }));
      } else {
        setLensStatus(prev => ({ ...prev, [lensId]: 'error' }));
      }
    } catch (e) {
      setLensStatus(prev => ({ ...prev, [lensId]: 'error' }));
    }
  };

  const interpret = async () => {
    if (dream.trim().length < 30) {
      setError('Racconta il sogno con più dettaglio — almeno qualche frase.');
      return;
    }
    if (hasUsedFreeLens && !paid) {
      setShowPaywallBanner(true);
      return;
    }
    setError('');
    setLoading(true);
    setAllInterpretations({});
    setLensStatus({});
    setStage('result');

    if (!paid) {
      setHasUsedFreeLens(true);
      localStorage.setItem('oniros_used_free', 'true');
      // Solo Jung in anteprima
      await fetchLens('jung', dream);
      setInterpretation('done');
    } else {
      // Tutte e 5 in parallelo
      await Promise.all(LENSES.map(l => fetchLens(l.id, dream)));
      setInterpretation('done');
    }
    setLoading(false);
  };

  const reset = () => {
    setStage('input');
    setInterpretation('');
    setAllInterpretations({});
    setLensStatus({});
    setDream('');
    setFeedback('');
    setFeedbackSent(false);
    setPaid(false);
    localStorage.removeItem('oniros_paid');
  };

  const truncateWords = (text, limit) => {
    const words = text.split(/\s+/);
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '…';
  };

  const renderInterpretation = (text) => {
    if (!text) return null;
    const parts = text.split(/^## /m).filter(Boolean);
    return parts.map((part, i) => {
      const lines = part.split('\n');
      const heading = lines[0];
      const body = lines.slice(1).join('\n').trim();
      return (
        <div key={i} className="mb-6">
          <h3 className="text-[12px] uppercase tracking-[0.2em] text-amber-200/70 mb-3 border-b border-amber-200/10 pb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {heading}
          </h3>
          <p className="text-[16px] leading-[1.8] text-stone-100/85 whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
            {body}
          </p>
        </div>
      );
    });
  };

  const lensesToShow = paid ? LENSES : LENSES.filter(l => l.free);

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at 20% 10%, #1a2847 0%, #0a1020 45%, #05080f 100%)',
    }}>
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{
        backgroundImage: `radial-gradient(1px 1px at 20px 30px, #e4d5a0, transparent),
                          radial-gradient(1px 1px at 40px 70px, #c9b880, transparent),
                          radial-gradient(1.5px 1.5px at 90px 40px, #e4d5a0, transparent),
                          radial-gradient(1px 1px at 130px 80px, #a89560, transparent),
                          radial-gradient(1px 1px at 160px 120px, #e4d5a0, transparent)`,
        backgroundSize: '200px 200px',
      }} />

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16">
        <header className="mb-10 md:mb-14">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-amber-200/70 text-2xl" style={{ fontFamily: 'Georgia, serif' }}>☾</span>
            <h1 className="text-amber-100 text-4xl md:text-5xl tracking-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}>
              Oniros
            </h1>
          </div>
          <p className="text-stone-300/70 text-sm tracking-[0.25em] uppercase ml-10">
            Atelier dei sogni
          </p>
        </header>

        {stage === 'input' && (
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              <p className="text-stone-200/80 text-[17px] leading-relaxed mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Lo stesso sogno, letto da cinque scuole di pensiero diverse, può dirti cose completamente opposte. Freud vede desideri nascosti. Jung vede messaggi dall'inconscio. La Gestalt vede parti di te che non riconosci. Le neuroscienze vedono il cervello al lavoro. La tradizione vede presagi.
              </p>
              <p className="text-amber-200/70 text-[17px] leading-relaxed italic mb-12" style={{ fontFamily: 'Georgia, serif' }}>
                Nessuno di loro ha torto. Ognuno illumina un angolo diverso dello stesso sogno.
              </p>

              <div className="space-y-6">
                {[
                  { glyph: '✦', num: '01', title: 'Racconti il sogno', sub: 'come lo ricordi, con tutti i dettagli', highlight: false },
                  { glyph: '☉', num: '02', title: 'Leggi Jung gratis', sub: "un'anteprima gratuita — la prima voce", highlight: true },
                  { glyph: '☾', num: '03', title: 'Sblocchi tutto per 2,99€', sub: 'tutte e cinque le voci sul tuo sogno', highlight: true },
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full border border-amber-200/40 flex items-center justify-center bg-stone-950">
                        <span className="text-amber-200/70 text-base">{step.glyph}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-px h-6 bg-gradient-to-b from-amber-200/20 to-transparent mt-1" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <div className="text-[10px] tracking-[0.2em] uppercase text-stone-600 mb-0.5">{step.num}</div>
                      <div className={`text-sm italic ${step.highlight ? 'text-amber-200' : 'text-stone-300'}`} style={{ fontFamily: 'Georgia, serif' }}>
                        {step.title}
                      </div>
                      <div className="text-stone-500 text-xs mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="block italic text-amber-200/80 text-lg mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Racconta il tuo sogno
              </span>
              <span className="block text-stone-400/60 text-sm mb-4 leading-relaxed">
                Tutto quello che ricordi: scene, persone, luoghi, oggetti, emozioni. Più dettagli, più la lettura sarà precisa.
              </span>
              <textarea
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                placeholder="Ero in una casa che conoscevo ma non era la mia..."
                rows={12}
                className="w-full bg-stone-950/40 border border-amber-200/20 rounded-md p-5 text-[17px] leading-relaxed text-stone-100 placeholder-stone-500/50 focus:outline-none focus:border-amber-200/50 transition-colors resize-none"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <div className="flex justify-between items-center mt-2 mb-5">
                <span className="text-stone-500 text-xs">{dream.length} caratteri</span>
                {error && <span className="text-red-300/80 text-sm italic">{error}</span>}
              </div>

              <button
                onClick={interpret}
                disabled={loading}
                className="w-full group rounded-md py-4 px-8 text-lg italic tracking-wide transition-all disabled:opacity-50"
                style={{
                  fontFamily: 'Georgia, serif',
                  background: 'linear-gradient(135deg, #d4b483 0%, #c9a96e 50%, #b8935a 100%)',
                  color: '#0a1020',
                  boxShadow: '0 0 30px rgba(212,180,131,0.15), 0 2px 8px rgba(0,0,0,0.4)',
                }}
              >
                <span className="flex items-center justify-center gap-3">
                  <span>Interpreta il sogno</span>
                  <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                </span>
              </button>

              {showPaywallBanner && (
                <div className="mt-5 p-5 border border-amber-200/30 bg-amber-200/5 rounded-md">
                  <p className="text-amber-100 italic mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    Hai già usato l'anteprima gratuita.
                  </p>
                  <p className="text-stone-400 text-sm mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    Sblocca l'interpretazione completa — tutte e cinque le voci — per 2,99€.
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-md py-3 px-6 italic transition-all text-sm"
                    style={{
                      fontFamily: 'Georgia, serif',
                      background: 'linear-gradient(135deg, #d4b483 0%, #b8935a 100%)',
                      color: '#0a1020',
                    }}
                  >
                    Sblocca l'interpretazione completa — 2,99€
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {stage === 'result' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-10 pl-4 border-l-2 border-stone-700/60">
              <div className="text-stone-500 text-xs uppercase tracking-widest mb-2">Il sogno</div>
              <div className="text-stone-300/70 italic text-[15px] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                &quot;{dream.length > 280 ? dream.slice(0, 280) + '…' : dream}&quot;
              </div>
            </div>

            {/* Loading status */}
            {loading && (
              <div className="mb-10 p-5 border border-stone-700/40 rounded-md">
                <p className="text-stone-400 text-sm italic mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  {paid ? 'Le cinque voci stanno leggendo il tuo sogno…' : 'Lettura in corso…'}
                </p>
                {paid && (
                  <div className="space-y-3">
                    {LENSES.map(lens => (
                      <div key={lens.id} className="flex items-center gap-3">
                        <span className={`text-base w-5 ${lensStatus[lens.id] === 'done' ? 'text-amber-200' : lensStatus[lens.id] === 'loading' ? 'text-amber-200/50' : 'text-stone-700'}`}>
                          {lens.glyph}
                        </span>
                        <span className={`text-sm ${lensStatus[lens.id] === 'done' ? 'text-stone-300' : lensStatus[lens.id] === 'loading' ? 'text-stone-400' : 'text-stone-600'}`} style={{ fontFamily: 'Georgia, serif' }}>
                          {lens.name}
                        </span>
                        <span className="text-xs italic text-stone-600" style={{ fontFamily: 'Georgia, serif' }}>
                          {lensStatus[lens.id] === 'done' ? '— completata' : lensStatus[lens.id] === 'loading' ? '— in lettura…' : '— in attesa'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Interpretazioni */}
            {lensesToShow.map((lens, i) => {
              const text = allInterpretations[lens.id];
              const status = lensStatus[lens.id];
              if (!text && status !== 'done') return null;

              const displayText = (!paid && lens.free)
                ? truncateWords(text || '', 200)
                : text || '';

              return (
                <div key={lens.id} className={`mb-12 pb-12 ${i < lensesToShow.length - 1 ? 'border-b border-stone-800/60' : ''}`}>
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-amber-200 text-2xl">{lens.glyph}</span>
                    <div>
                      <span className="text-amber-100 text-xl italic" style={{ fontFamily: 'Georgia, serif' }}>{lens.name}</span>
                      {lens.year && <span className="text-stone-600 text-xs ml-2">{lens.year}</span>}
                      <div className="text-stone-500 text-xs italic mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>— {lens.question}</div>
                    </div>
                  </div>
                  {renderInterpretation(displayText)}
                </div>
              );
            })}

            {/* Paywall dopo Jung */}
            {!paid && hasUsedFreeLens && allInterpretations['jung'] && (
              <div className="mt-2 p-6 border border-amber-200/20 bg-amber-200/5 rounded-md">
                <p className="text-amber-100 italic text-lg mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                  Jung ha letto il tuo sogno. Ma Freud lo legge in modo completamente diverso.
                </p>
                <p className="text-stone-400 text-sm mb-5" style={{ fontFamily: 'Georgia, serif' }}>
                  La lettura completa include tutte e cinque le voci. Non per averne di più — perché la verità del tuo sogno non sta in una sola.
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full rounded-md py-4 px-6 italic transition-all"
                  style={{
                    fontFamily: 'Georgia, serif',
                    background: 'linear-gradient(135deg, #d4b483 0%, #b8935a 100%)',
                    color: '#0a1020',
                    fontSize: '1rem',
                    boxShadow: '0 0 24px rgba(212,180,131,0.12)',
                  }}
                >
                  Leggi l'interpretazione completa — 2,99€
                </button>
              </div>
            )}

            {!loading && interpretation && (
              <div className="mt-12 pt-8 border-t border-amber-200/20">
                <button
                  onClick={reset}
                  className="italic text-amber-200/80 hover:text-amber-100 transition-colors"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  ← Un altro sogno
                </button>
              </div>
            )}
          </div>
        )}

        {stage === 'result' && !loading && interpretation && (
          <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-stone-800/60">
            <p className="text-stone-400 text-sm italic mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Cosa ti ha lasciato questa interpretazione?
            </p>
            {!feedbackSent ? (
              <div className="flex flex-wrap gap-3">
                {[
                  'Mi ha fatto riflettere',
                  'Troppo generico, poteva valere per chiunque',
                  'Non pagherei per le altre voci',
                ].map(option => (
                  <button
                    key={option}
                    onClick={async () => {
                      setFeedback(option);
                      await fetch('https://formspree.io/f/mojyrloy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ feedback: option }),
                      });
                      setFeedbackSent(true);
                    }}
                    className={`px-4 py-2 text-sm border rounded-md transition-all italic ${feedback === option
                      ? 'border-amber-200/60 text-amber-100'
                      : 'border-stone-700/40 text-stone-400 hover:border-stone-500/60'
                      }`}
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
                Grazie — ci aiuta a migliorare.
              </p>
            )}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-stone-800/60 text-center">
          <div className="text-stone-500 text-xs tracking-[0.3em] uppercase italic mb-2">
            Oniros · solo per svago — non sostituisce consulenza psicologica o medica
          </div>
          <a href="mailto:onirosapp@gmail.com" className="text-stone-600 text-xs hover:text-stone-400 transition-colors">onirosapp@gmail.com</a>
        </footer>
      </div>
    </div>
  );
}