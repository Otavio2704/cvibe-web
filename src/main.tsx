import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Parte 2 do fallback de SPA para GitHub Pages (ver public/404.html).
// Decodifica a URL real a partir da query string criada pelo 404.html e
// reescreve a URL do navegador ANTES do React Router montar, para que o
// deep-link (ex: /dashboard) ou refresh de página seja restaurado
// corretamente.
//
// Esse código morava como um <script> separado no index.html, rodando antes
// do script do React. Mas o vite-plugin-singlefile reordena os scripts no
// build de produção — o script do React (com o Router dentro) acaba sendo
// injetado no <head>, antes do script de decodificação no <body>. Resultado:
// o Router processava a URL "crua" (com "/?/dashboard") antes da decodificação
// rodar, e a rota não batia com nada — daí o 404 ao dar refresh.
//
// Rodando essa lógica aqui, no topo do main.tsx, ela é garantidamente
// executada antes do createRoot/Router, não importa como o bundler reordene
// as tags <script> no HTML final.
(function redirectFromGithubPages404(l: Location) {
  if (l.search[1] === '/') {
    const decoded = l.search.slice(1).split('&').map((s) => {
      return s.replace(/~and~/g, '&');
    }).join('?');
    window.history.replaceState(
      null, '',
      l.pathname.slice(0, -1) + decoded + l.hash
    );
  }
})(window.location);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
