declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  interface CreateOptions {
    resize?: boolean;
    useWorker?: boolean;
  }

  interface ConfettiFunction {
    (options?: ConfettiOptions): Promise<null>;
    reset(): void;
  }

  function confetti(options?: ConfettiOptions): Promise<null>;
  
  namespace confetti {
    function create(
      canvas: HTMLCanvasElement | null,
      options?: CreateOptions
    ): ConfettiFunction;
    function reset(): void;
  }

  export = confetti;
}
