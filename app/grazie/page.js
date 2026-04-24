'use client';

import { useEffect } from 'react';

export default function Grazie() {
  useEffect(() => {
    localStorage.setItem('oniros_paid', 'true');
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{
      background: 'radial-gradient(ellipse at 20% 10%, #1a2847 0%, #0a1020 45%, #05080f 100%)',
    }}>
      <div className="text-center px-6">
        <div className="text-amber-200/70 text-5xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>☾</div>
        <h1 className="text-amber-100 text-3xl italic mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Grazie
        </h1>
        <p className="text-stone-300/70 text-lg mb-8 max-w-md mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
          Il pagamento è andato a buon fine. Ora puoi leggere il tuo sogno con tutte e cinque le lenti.
        </p>
        <a href="/" className="inline-block bg-amber-200/90 hover:bg-amber-100 text-stone-950 px-8 py-4 text-lg italic transition-all" style={{ fontFamily: 'Georgia, serif' }}>
          Torna a Oniros
        </a>
      </div>
    </div>
  );
}