import { useCallback, useEffect, useRef } from 'react';
import sellerAlert from '@/assets/sounds/seller_alert.mp3';

/**
 * Hook to manage notification sound alerts with browser autoplay priming.
 * @returns {Object} { playNotificationSound }
 */
export function useNotificationSound() {
    const audioRef = useRef(null);
    const hasPrimedAudioRef = useRef(false);

    // Initialise audio on mount if not already done
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(sellerAlert);
        }
    }, []);

    // Prime audio on first user interaction so browser autoplay policies don't block alerts later.
    useEffect(() => {
        if (hasPrimedAudioRef.current) return;

        const prime = () => {
            if (hasPrimedAudioRef.current) return;
            try {
                const audio = audioRef.current || new Audio(sellerAlert);
                audioRef.current = audio;
                
                // Mute and play/pause immediately to "prime" the audio context
                audio.muted = true;
                const p = audio.play();
                
                if (p && typeof p.then === 'function') {
                    p.then(() => {
                        audio.pause();
                        audio.muted = false;
                        audio.currentTime = 0;
                        hasPrimedAudioRef.current = true;
                    }).catch(() => {
                        // Priming failed, will try oscillator fallback in playNotificationSound
                    });
                } else {
                    audio.pause();
                    audio.muted = false;
                    audio.currentTime = 0;
                    hasPrimedAudioRef.current = true;
                }
            } catch (_) {
                // Silently fail priming
            } finally {
                window.removeEventListener('click', prime);
                window.removeEventListener('touchstart', prime);
                window.removeEventListener('keydown', prime);
            }
        };

        window.addEventListener('click', prime, { once: true });
        window.addEventListener('touchstart', prime, { once: true });
        window.addEventListener('keydown', prime, { once: true });

        return () => {
            window.removeEventListener('click', prime);
            window.removeEventListener('touchstart', prime);
            window.removeEventListener('keydown', prime);
        };
    }, []);

    const playNotificationSound = useCallback(() => {
        const fallbackBeep = () => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                const ctx = new AudioContext();

                const playBeep = (freq, startTime, duration) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
                    gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
                    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
                    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(ctx.currentTime + startTime);
                    osc.stop(ctx.currentTime + startTime + duration);
                };

                // Buzzer-like pattern
                playBeep(880, 0, 0.15);
                playBeep(1108.73, 0.15, 0.25);

                setTimeout(() => {
                    playBeep(880, 0, 0.15);
                    playBeep(1108.73, 0.15, 0.25);
                }, 800);

                if (ctx.state === 'suspended') ctx.resume();
            } catch (_) {
                // Silent fallback
            }
        };

        try {
            const audio = audioRef.current || new Audio(sellerAlert);
            audioRef.current = audio;
            audio.volume = 1.0;
            audio.currentTime = 0;
            const playPromise = audio.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => fallbackBeep());
            }
        } catch (_) {
            fallbackBeep();
        }
    }, []);

    return { playNotificationSound };
}
