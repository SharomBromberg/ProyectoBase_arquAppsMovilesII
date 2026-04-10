self.addEventListener("fetch", function (event) {
  // Service worker mínimo para que sea reconocida como PWA
  event.respondWith(fetch(event.request));
});
