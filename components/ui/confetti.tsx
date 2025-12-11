"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  /**
   * Délai avant le déclenchement (en ms)
   */
  delay?: number;
  /**
   * Durée de l'animation (en ms)
   */
  duration?: number;
}

export function Confetti({ delay = 500, duration = 3000 }: ConfettiProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const end = Date.now() + duration;
      const colors = ["#FFE66D", "#FF6B6B", "#4ECDC4", "#45B7D1"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration]);

  return null;
}

/**
 * Variante avec explosion centrale
 */
export function ConfettiBurst({ delay = 500 }: { delay?: number }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ["#FFE66D", "#FF6B6B", "#4ECDC4", "#45B7D1"],
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return null;
}
