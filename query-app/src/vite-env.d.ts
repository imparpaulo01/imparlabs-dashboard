/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEO4J_URI: string;
  readonly VITE_NEO4J_USER: string;
  readonly VITE_NEO4J_PASSWORD: string;
  readonly VITE_GROQ_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
