/**
 * Type declarations for environment variables used by the Viostream SDK.
 *
 * The loader reads these at runtime (Vite statically replaces them at build
 * time in consuming applications).
 *
 * - `PUBLIC_VIOSTREAM_HOST` — SvelteKit convention
 * - `VITE_VIOSTREAM_HOST`   — plain Vite convention
 */

interface ImportMetaEnv {
  /** Override the Viostream API hostname (SvelteKit convention). */
  readonly PUBLIC_VIOSTREAM_HOST?: string;
  /** Override the Viostream API hostname (plain Vite convention). */
  readonly VITE_VIOSTREAM_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
