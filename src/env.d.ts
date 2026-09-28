interface ImportMetaEnv {
  /** Tally form link. Share link, embed link or form id. Unset shows a placeholder. */
  readonly PUBLIC_TALLY_FORM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
