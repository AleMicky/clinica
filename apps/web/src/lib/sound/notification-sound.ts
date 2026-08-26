/**
 * Reproduce un sonido suave y moderno de campana usando Web Audio API.
 * No depende de archivos de audio externos, funciona instantáneamente y sin latencia.
 */
export function playNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, now);
    masterGain.connect(ctx.destination);

    // Tono 1: Armónico brillante (F5 - 698.46 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(masterGain);

    // Tono 2: Tono agudo y nítido (C6 - 1046.50 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1046.5, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.35, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc1.start(now);
    osc1.stop(now + 0.35);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.55);

    setTimeout(() => {
      void ctx.close();
    }, 700);
  } catch (error) {
    console.debug("Audio de notificación silenciado o no permitido por el navegador:", error);
  }
}
