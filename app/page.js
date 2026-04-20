'use client';

import React, { useState } from 'react';

const LENSES = [
  {
    id: 'freud',
    name: 'Freud',
    year: '1899',
    tagline: 'Il sogno come desiderio rimosso',
    short: 'Il desiderio nascosto',
    whenToChoose: 'Scegli questa se vuoi capire cosa il tuo sogno sta cercando di nascondere. Freud pensava che i sogni camuffassero desideri che non vogliamo ammettere nemmeno a noi stessi.',
    glyph: 'Ψ',
  },
  {
    id: 'jung',
    name: 'Jung',
    year: '1934',
    tagline: 'Il messaggio del tuo profondo',
    short: 'Il messaggio simbolico',
    whenToChoose: 'Scegli questa se senti che il sogno voleva dirti qualcosa. Jung vedeva i sogni come messaggi che arrivano da una parte più antica e saggia di noi, per mostrarci cosa stiamo ignorando.',
    glyph: '☉',
  },
  {
    id: 'gestalt',
    name: 'Gestalt',
    year: '1969',
    tagline: 'Tutti i personaggi sei tu',
    short: 'Ogni elemento sei tu',
    whenToChoose: 'Scegli questa per una lettura diretta e concreta. Nella Gestalt tutto ciò che appare nel sogno — persone, animali, luoghi — è una parte di te che stai ignorando o respingendo.',
    glyph: '◐',
  },
  {
    id: 'cognitivo',
    name: 'Scienza',
    year: '2010',
    tagline: 'Cosa fa il tuo cervello mentre sogni',
    short: 'La lettura scientifica',
    whenToChoose: 'Scegli questa se vuoi una spiegazione basata sulle neuroscienze, senza misticismi. Il sogno come elaborazione di memoria ed emozioni, non come messaggio in codice.',
    glyph: '◈',
  },
  {
    id: 'simbolico',
    name: 'Tradizione',
    year: '—',
    tagline: 'Il significato antico dei simboli',
    short: 'Simboli della tradizione',
    whenToChoose: 'Scegli questa per la lettura più ludica e antica. Serpenti, acqua, denti che cadono: cosa dicevano i libri di interpretazione dei sogni prima della psicologia.',
    glyph: '✦',
  },
];

export default function Oniros() {
  const [dream, setDream] = useState('');
  const [selectedLens, setSelectedLens] = useState('jung');
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('input');

  const interpret = async () => {
    if (dream.trim().length < 30) {
      setError('Racconta il sogno con più dettaglio — almeno qualche frase.');
      return;
    }
    setError('');
    setLoading(true);
    setStage('result');
    setInterpretation('');

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream, lens: selectedLens }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setStage('input');
      } else {
        setInterpretation(data.interpretation);
      }
    } catch (e) {
      setError('Qualcosa è andato storto. Riprova.');
      setStage('input');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage('input');
    setInterpretation('');
    setDream('');
  };

  const currentLens = LENSES.find(l => l.id === selectedLens);

  const renderInterpretation = (text) => {
    if (!text) return null;
    const parts = text.split(/^## /m).filter(Boolean);
    return parts.map((part, i) => {
      const lines = part.split('\n');
      const heading = lines[0];
      const body = lines.slice(1).join('\n').trim();
      return (
        <div key={i} className="mb-8">
          <h3 className="text-[13px] uppercase tracking-[0.2em] text-amber-200/90 mb-3 border-b border-amber-200/20 pb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {heading}
          </h3>
          <p className="text-[17px] leading-[1.75] text-stone-100/90 whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
            {body}
          </p>
        </div>
      );
    });
  };

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

      <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">
        <header className="mb-10 md:mb-12">
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
          <>
            <div className="mb-10 md:mb-12 max-w-3xl">
              <p className="text-stone-200/80 text-[17px] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                Lo stesso sogno può dirti cose molto diverse a seconda di chi lo legge.
                Raccontalo qui sotto, poi scegli <em>con quale lente</em> vuoi leggerlo.
                Ogni lente è una scuola diversa di pensiero sui sogni — e ogni lente ti mostrerà il tuo sogno sotto una luce nuova.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-8 md:gap-12">
              <div className="md:col-span-3">
                <div className="block">
                  <span className="block italic text-amber-200/80 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                    Racconta il tuo sogno
                  </span>
                  <span className="block text-stone-400/60 text-sm mb-4 leading-relaxed">
                    Tutto quello che ricordi: scene, persone, luoghi, oggetti, emozioni. Più dettagli, più la lettura sarà precisa.
                  </span>
                  <textarea
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    placeholder="Ero in una casa che conoscevo ma non era la mia..."
                    rows={14}
                    className="w-full bg-stone-950/40 border border-amber-200/20 rounded-sm p-5 text-[17px] leading-relaxed text-stone-100 placeholder-stone-500/50 focus:outline-none focus:border-amber-200/50 transition-colors resize-none"
                    style={{ fontFamily: 'Georgia, serif' }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-stone-500 text-xs">{dream.length} caratteri</span>
                    {error && <span className="text-red-300/80 text-sm italic">{error}</span>}
                  </div>
                </div>

                <button
                  onClick={interpret}
                  disabled={loading}
                  className="mt-6 bg-amber-200/90 hover:bg-amber-100 text-stone-950 px-8 py-4 text-lg tracking-wide transition-all disabled:opacity-50 italic"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Interpreta il sogno →
                </button>
              </div>

              <div className="md:col-span-2">
                <span className="block italic text-amber-200/80 text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                  Scegli la lente
                </span>
                <span className="block text-stone-400/60 text-sm mb-4 leading-relaxed">
                  Tocca una lente per vedere cosa ti offrirà. Puoi cambiarla quando vuoi.
                </span>

                <div className="space-y-2">
                  {LENSES.map(lens => {
                    const active = selectedLens === lens.id;
                    return (
                      <button
                        key={lens.id}
                        onClick={() => setSelectedLens(lens.id)}
                        className={`w-full text-left p-4 border transition-all ${
                          active
                            ? 'border-amber-200/60 bg-amber-200/5'
                            : 'border-stone-700/40 hover:border-stone-500/60 bg-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-2xl leading-none mt-0.5 ${active ? 'text-amber-200' : 'text-stone-500'}`}>
                            {lens.glyph}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className={`text-lg ${active ? 'text-amber-100' : 'text-stone-200'}`} style={{ fontFamily: 'Georgia, serif' }}>
                                {lens.name}
                              </span>
                              <span className="text-stone-500 text-xs">{lens.year}</span>
                              <span className={`text-xs italic ${active ? 'text-amber-200/70' : 'text-stone-500'}`}>
                                — {lens.short}
                              </span>
                            </div>
                            {active && (
                              <div className="mt-3 text-stone-200/85 text-sm leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                                {lens.whenToChoose}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {stage === 'result' && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-amber-200/20">
              <span className="text-3xl text-amber-200">{currentLens.glyph}</span>
              <div>
                <div className="text-amber-100 text-xl italic" style={{ fontFamily: 'Georgia, serif' }}>
                  Lettura secondo {currentLens.name}
                </div>
                <div className="text-stone-400 text-sm italic">{currentLens.tagline}</div>
              </div>
            </div>

            <div className="mb-10 pl-4 border-l-2 border-stone-700/60">
              <div className="text-stone-500 text-xs uppercase tracking-widest mb-2">Il sogno</div>
              <div className="text-stone-300/70 italic text-[15px] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                &quot;{dream.length > 280 ? dream.slice(0, 280) + '…' : dream}&quot;
              </div>
            </div>

            {loading && (
              <div className="py-12 text-center">
                <div className="inline-block text-amber-200/60 text-4xl animate-pulse" style={{ animationDuration: '2s' }}>
                  ☾
                </div>
                <div className="mt-4 italic text-stone-400" style={{ fontFamily: 'Georgia, serif' }}>
                  Lettura in corso...
                </div>
              </div>
            )}

            {!loading && interpretation && (
              <div>
                {renderInterpretation(interpretation)}

                <div className="mt-12 pt-8 border-t border-amber-200/20 flex flex-wrap gap-4">
                  <button
                    onClick={reset}
                    className="italic text-amber-200/80 hover:text-amber-100 transition-colors"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    ← Un altro sogno
                  </button>
                  <span className="text-stone-600">·</span>
                  <button
                    onClick={() => { setStage('input'); setInterpretation(''); }}
                    className="italic text-amber-200/80 hover:text-amber-100 transition-colors"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Leggi lo stesso sogno con un&apos;altra lente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-stone-800/60 text-center">
          <div className="text-stone-500 text-xs tracking-[0.3em] uppercase italic">
            Oniros · svago e curiosità — non consulenza clinica
          </div>
        </footer>
      </div>
    </div>
  );
}