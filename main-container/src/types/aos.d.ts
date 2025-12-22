declare module 'aos' {
  export interface AosOptions {
    duration?: number;
    once?: boolean;
    mirror?: boolean;
    offset?: number;
  }

  export function init(options?: AosOptions): void;
  export function refresh(): void;
  export function refreshHard(): void;
}
