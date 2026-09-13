/* =====================================================================
   SLIDER ANTES / DESPUÉS
   Funciona para cualquier elemento con [data-ba-slider] en la página,
   así que el mismo código sirve para el del hero y el de la demo.
   ===================================================================== */
function initBeforeAfterSliders(root = document) {
  const sliders = root.querySelectorAll('[data-ba-slider]');

  sliders.forEach((slider) => {
    const range = slider.querySelector('[data-ba-range]');
    const beforePanel = slider.querySelector('[data-ba-before-panel]');
    const handle = slider.querySelector('[data-ba-handle]');

    if (!range || !beforePanel || !handle) return;

    const update = () => {
      const value = range.value; // 0-100
      beforePanel.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
      handle.style.left = `${value}%`;
    };

    range.addEventListener('input', update);
    update(); // posición inicial
  });
}

/* =====================================================================
   DEMO: subir foto propia
   ===================================================================== */
function initUploadDemo() {
  const dropzone = document.querySelector('[data-dropzone]');
  const input = document.querySelector('[data-uploader-input]');
  const resultBlock = document.querySelector('[data-demo-result]');
  const uploaderBlock = document.querySelector('[data-uploader]');
  const resultBefore = document.querySelector('[data-result-before]');
  const resultAfter = document.querySelector('[data-result-after]');
  const statusEl = document.querySelector('[data-demo-status]');
  const resetBtn = document.querySelector('[data-demo-reset]');

  if (!dropzone || !input) return;

  // Resaltar la zona al arrastrar un archivo encima
  ['dragenter', 'dragover'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
  });
  ['dragleave', 'drop'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;

      // Mostramos la foto original inmediatamente
      resultBefore.innerHTML = `<img src="${dataUrl}" alt="Tu foto original">`;
      resultAfter.innerHTML = `<img src="${dataUrl}" alt="Procesando tu foto" style="filter: grayscale(0.2) contrast(0.95);">`;

      uploaderBlock.hidden = true;
      resultBlock.hidden = false;
      initBeforeAfterSliders(resultBlock); // activa el slider para este bloque nuevo

      statusEl.textContent = 'Restaurando tu foto…';

      processPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  resetBtn?.addEventListener('click', () => {
    resultBlock.hidden = true;
    uploaderBlock.hidden = false;
    input.value = '';
    statusEl.textContent = '';
  });

  /* ---------------------------------------------------------------
     PROCESAMIENTO DE LA FOTO
     ---------------------------------------------------------------
     Ahora mismo esto es una SIMULACIÓN (aplica un filtro CSS de
     ejemplo tras una pequeña espera) para poder probar toda la
     interacción sin tener aún la IA conectada.

     PASO 5 (conexión con la IA real): sustituye el contenido de esta
     función por una llamada fetch() a nuestro backend de Cloudflare
     Workers, que a su vez llama a la API de Replicate. Por ejemplo:

       async function processPhoto(dataUrl) {
         statusEl.textContent = 'Restaurando tu foto…';
         const response = await fetch('https://TU-WORKER.workers.dev/procesar', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ image: dataUrl })
         });
         const { resultUrl } = await response.json();
         resultAfter.innerHTML = `<img src="${resultUrl}" alt="Foto restaurada">`;
         resultAfter.classList.add('ken-burns');
         statusEl.textContent = '¡Listo! Así ha quedado tu foto.';
       }

     Lo dejamos ya con esa forma para no tener que tocar el resto del
     código cuando lleguemos a ese paso.
  --------------------------------------------------------------- */
  function processPhoto(dataUrl) {
    setTimeout(() => {
      resultAfter.innerHTML = `<img src="${dataUrl}" alt="Foto restaurada (simulación)">`;
      resultAfter.classList.add('ken-burns');
      statusEl.textContent = '¡Listo! (Resultado de ejemplo — la IA real se conecta en el paso 5)';
    }, 1400);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initBeforeAfterSliders();
  initUploadDemo();
});
