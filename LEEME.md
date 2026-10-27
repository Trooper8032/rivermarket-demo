# RiverMarket · demo de marketplace (v2)
Ejecutar: `cd /workspace/marketplace-demo && python3 -m http.server 18480` → http://127.0.0.1:18480/
Páginas: index.html (captar vendedores), directorio.html, tienda.html?t=ID, panel.html.
Datos de ejemplo en localStorage (claves rg_mkt_v2, rg_carrito2, rg_sesion2). "Restaurar datos de ejemplo" en el panel.
## Créditos
- Diseño y CSS (Tailwind) basados en Freshcart de Codescandy, licencia MIT: https://github.com/codescandy/freshcart-tailwind-ecommerce-HTML-template — ver LICENSE-Freshcart.txt
- Fotos: Unsplash (Licencia Unsplash, uso libre), carpeta assets/images/demo. Datos de ejemplo.
- Íconos: Tabler Icons (MIT), por CDN. Fuente Inter (OFL), Google Fonts.

## Fase 1 real (Supabase)
- Base de datos, autenticación y almacenamiento: Supabase (proyecto "RiverMarket"). El sitio solo usa la clave pública (anon); la seguridad está en las políticas RLS.
- Verificación de identidad en el navegador: @vladmandic/face-api (MIT).
- Mejorar foto (quitar fondo): modelo U-2-Netp (Apache-2.0) con onnxruntime-web (MIT). Reemplaza a @imgly/background-removal (AGPL-3.0).
- Dictar producto: Whisper base (MIT) con transformers.js (Apache-2.0). Lista de precios y capturas de Yape/Plin: tesseract.js (Apache-2.0).
- QR: qrcodejs (MIT). Iconos: Tabler Icons (MIT). Plantilla base: Freshcart (MIT).
