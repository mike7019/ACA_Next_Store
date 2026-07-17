/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly SESSION_SECRET: string;
  readonly ADMIN_EMAIL: string;
  readonly ADMIN_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    admin: { id: number; email: string; nombre: string } | null;
  }
}
