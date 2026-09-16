/* ZonQR — Catálogo persistente (localStorage) */
(function () {
  const KEY = "zonqr_catalog_v1";
  const PIN_KEY = "zonqr_admin_pin";
  function getDefault() {
    return {
      zone: window.ZONQR_DATA ? { ...window.ZONQR_DATA.zone } : { name: "Zona", center: [25.56, -108.47], radiusKm: 1.5 },
      businesses: window.ZONQR_DATA ? JSON.parse(JSON.stringify(window.ZONQR_DATA.businesses)) : [],
      categories: window.ZONQR_DATA ? window.ZONQR_DATA.categories : []
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.businesses)) return null;
      return data;
    } catch (e) {
      console.warn("[ZonQR] catalog load error", e);
      return null;
    }
  }
  function save(catalog) {
    localStorage.setItem(KEY, JSON.stringify(catalog));
  }
  function applyToWindow(catalog) {
    if (!window.ZONQR_DATA) window.ZONQR_DATA = {};
    if (catalog.zone) window.ZONQR_DATA.zone = catalog.zone;
    if (catalog.businesses) window.ZONQR_DATA.businesses = catalog.businesses;
    if (catalog.categories) window.ZONQR_DATA.categories = catalog.categories;
  }
  const stored = load();
  if (stored) {
    applyToWindow(stored);
    console.log("[ZonQR] Catálogo desde localStorage:", stored.businesses.length, "negocios");
  }
  window.ZONQR_STORAGE = {
    KEY, load, save, getDefault, applyToWindow,
    exportJSON() {
      const data = load() || {
        zone: window.ZONQR_DATA.zone,
        businesses: window.ZONQR_DATA.businesses,
        categories: window.ZONQR_DATA.categories
      };
      return JSON.stringify(data, null, 2);
    },
    importJSON(str) {
      const data = JSON.parse(str);
      if (!Array.isArray(data.businesses)) throw new Error("JSON inválido: falta businesses[]");
      save(data);
      applyToWindow(data);
      return data;
    },
    resetToDemo() {
      localStorage.removeItem(KEY);
      location.reload();
    },
    getPin() {
      return localStorage.getItem(PIN_KEY) || "zonqr";
    },
    setPin(pin) {
      localStorage.setItem(PIN_KEY, pin);
    }
  };
})();
