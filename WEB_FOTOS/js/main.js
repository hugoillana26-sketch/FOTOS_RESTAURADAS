/* =====================================================================
   CONFIGURACIÓN — TODOS los números del sistema de créditos están aquí.
   Cambia cualquier valor en este objeto y se aplica en toda la web.
   ===================================================================== */
const CONFIG = {
  welcomeBonus: 500,       // créditos de regalo la primera vez que se visita la web
  dailyBonus: 150,         // créditos del bono diario
  wheelValues: [10, 25, 50, 75, 100, 150, 200, 20], // deben coincidir en orden con los <li> de .wheel__labels en el HTML
  costs: {
    color: 30,             // coste de colorizar una foto
    calidad: 20,           // coste de mejorar calidad
    video: 100,            // coste de convertir a vídeo
  },
};

/* =====================================================================
   SISTEMA DE CRÉDITOS
   ---------------------------------------------------------------------
   IMPORTANTE — LÉELO ANTES DE LANZAR LA WEB EN PRODUCCIÓN:
   Este sistema guarda el saldo de créditos en el propio navegador
   (localStorage), solo para poder ENSEÑAR y PROBAR la interfaz ahora
   mismo, sin necesidad de cuentas de usuario ni backend todavía.

   Esto NO es seguro para una web real de pago: cualquiera puede abrir
   las herramientas de desarrollador de su navegador y cambiar su propio
   saldo a mano. Para que los créditos sean de fiar de verdad, el saldo
   tiene que vivir en un servidor/base de datos (por ejemplo, junto con
   el backend del paso 5), nunca solo en el navegador del usuario.
   ===================================================================== */
const Credits = {
  KEY_BALANCE: 'revela_credits_balance',
  KEY_LAST_DAILY: 'revela_last_daily_claim',
  KEY_LAST_WHEEL: 'revela_last_wheel_spin',

  getBalance() {
    const stored = localStorage.getItem(this.KEY_BALANCE);
    if (stored === null) {
      // Primera visita: regalamos el bono de bienvenida
      localStorage.setItem(this.KEY_BALANCE, CONFIG.welcomeBonus);
      return CONFIG.welcomeBonus;
    }
    return parseInt(stored, 10);
  },

  add(amount) {
    const newBalance = this.getBalance() + amount;
    localStorage.setItem(this.KEY_BALANCE, newBalance);
    updateCreditDisplay(newBalance, true);
    return newBalance;
  },

  todayString() {
    return new Date().toISOString().slice(0, 10); // "AAAA-MM-DD"
  },

  canClaimDaily() {
    return localStorage.getItem(this.KEY_LAST_DAILY) !== this.todayString();
  },
  markDailyClaimed() {
    localStorage.setItem(this.KEY_LAST_DAILY, this.todayString());
  },

  canSpinWheel() {
    return localStorage.getItem(this.KEY_LAST_WHEEL) !== this.todayString();
  },
  markWheelSpun() {
    localStorage.setItem(this.KEY_LAST_WHEEL, this.todayString());
  },
};

function updateCreditDisplay(balance, animate = false) {
  const amountEl = document.querySelector('[data-credit-amount]');
  const pillEl = document.querySelector('[data-credit-pill]');
  if (!amountEl) return;
  amountEl.textContent = balance.toLocaleString('es-ES');
  if (animate && pillEl) {
    pillEl.classList.add('is-bumped');
    setTimeout(() => pillEl.classList.remove('is-bumped'), 220);
  }
}

function initCreditsUI() {
  updateCreditDisplay(Credits.getBalance());

  // --- Bono diario ---
  const dailyBtn = document.querySelector('[data-daily-claim]');
  if (dailyBtn) {
    const refreshDailyButton = () => {
      if (Credits.canClaimDaily()) {
        dailyBtn.disabled = false;
        dailyBtn.textContent = 'Reclamar bono de hoy';
      } else {
        dailyBtn.disabled = true;
        dailyBtn.textContent = 'Ya reclamado hoy — vuelve mañana';
      }
    };
    dailyBtn.addEventListener('click', () => {
      if (!Credits.canClaimDaily()) return;
      Credits.add(CONFIG.dailyBonus);
      Credits.markDailyClaimed();
      refreshDailyButton();
    });
    refreshDailyButton();
  }

  // --- Ruleta de la suerte ---
  const wheel = document.querySelector('[data-wheel]');
  const spinBtn = document.querySelector('[data-wheel-spin]');
  const resultEl = document.querySelector('[data-wheel-result]');
  if (wheel && spinBtn) {
    const segmentAngle = 360 / CONFIG.wheelValues.length;
    let currentRotation = 0;

    const refreshSpinButton = () => {
      if (Credits.canSpinWheel()) {
        spinBtn.disabled = false;
        spinBtn.textContent = 'Girar la ruleta';
      } else {
        spinBtn.disabled = true;
        spinBtn.textContent = 'Ya has girado hoy — vuelve mañana';
      }
    };

    spinBtn.addEventListener('click', () => {
      if (!Credits.canSpinWheel()) return;

      const winningIndex = Math.floor(Math.random() * CONFIG.wheelValues.length);
      const winningValue = CONFIG.wheelValues[winningIndex];

      // Calculamos el ángulo para que el puntero acabe sobre el sector ganador,
      // añadiendo varias vueltas completas para que el giro se vea bien.
      const extraSpins = 4 * 360;
      const targetAngle = 360 - (winningIndex * segmentAngle) - segmentAngle / 2;
      currentRotation += extraSpins + targetAngle - (currentRotation % 360);

      wheel.style.transform = `rotate(${currentRotation}deg)`;
      spinBtn.disabled = true;
      resultEl.textContent = 'Girando…';

      setTimeout(() => {
        Credits.add(winningValue);
        Credits.markWheelSpun();
        resultEl.textContent = `¡Enhorabuena! Has ganado ${winningValue} créditos.`;
        refreshSpinButton();
      }, 4000); // coincide con la duración de la transición del CSS (.wheel)
    });

    refreshSpinButton();
  }
}

/* =====================================================================
   ANIMACIÓN AL HACER SCROLL
   ===================================================================== */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => observer.observe(el));

  // Bloque emotivo: las líneas aparecen una a una, no todas a la vez
  const sequences = document.querySelectorAll('[data-reveal-sequence]');
  sequences.forEach((sequence) => {
    const lines = sequence.querySelectorAll('.memory-line');
    const seqObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lines.forEach((line, i) => {
            setTimeout(() => line.classList.add('is-visible'), i * 500);
          });
          seqObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    seqObserver.observe(sequence);
  });
}

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
  initCreditsUI();
  initScrollReveal();
});
