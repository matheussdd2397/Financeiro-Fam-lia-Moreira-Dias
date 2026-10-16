/* Serviço do app "Nosso mês".
   Ele só existe porque o Chrome exige um para deixar instalar o app na tela inicial.
   Regra simples e segura: a página é sempre buscada na internet (então uma atualização do
   index.html aparece na hora). Só se o celular estiver sem internet é que ele mostra a última
   cópia guardada. Os dados (Firebase) e as fontes NÃO passam por aqui: nada de gasto é guardado. */
const CACHE = "nosso-mes-pagina-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.mode !== "navigate") return;   /* só a página; o resto passa direto */
  e.respondWith((async () => {
    try {
      const resp = await fetch(req);
      if (resp && resp.ok) (await caches.open(CACHE)).put(req, resp.clone());
      return resp;
    } catch (err) {
      const guardada = await caches.match(req, { ignoreSearch: true });
      if (guardada) return guardada;
      return new Response("<meta charset=utf-8><body style='font-family:sans-serif;padding:24px'><h2>Sem internet</h2><p>Conecte-se para abrir o Nosso mês.</p>", { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
  })());
});
