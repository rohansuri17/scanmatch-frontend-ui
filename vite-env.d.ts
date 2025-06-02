// vite-env.d.ts
/// <reference types="vite/client" />

declare module 'pdfjs-dist/build/pdf.worker.min.js?worker' {
    const workerSrc: string;
    export default workerSrc;
  }