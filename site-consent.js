(function () {
  "use strict";

  var STORAGE_KEY = "mox-cookie-consent";
  var LEGACY_KEY = "mox-cookie-accepted";
  var config = window.MOX_ANALYTICS || {};
  var counterId = Number(config.counterId || 108746024);
  var analyticsLoaded = false;

  function readConsent() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      if (value === "accepted" || value === "rejected") return value;
      if (localStorage.getItem(LEGACY_KEY) === "1") return "accepted";
    } catch (error) {
      return "";
    }
    return "";
  }

  function writeConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      localStorage.removeItem(LEGACY_KEY);
    } catch (error) {
      // The site remains usable when storage is blocked.
    }
  }

  function loadAnalytics() {
    if (analyticsLoaded || !counterId) return;
    analyticsLoaded = true;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js?id=" + counterId;
    document.head.appendChild(script);

    window.ym(counterId, "init", {
      ssr: true,
      webvisor: true,
      trackHash: true,
      clickmap: true,
      ecommerce: "dataLayer",
      accurateTrackBounce: true,
      trackLinks: true
    });
  }

  function bannerMarkup() {
    return [
      '<div class="mox-consent__copy">',
      "<strong>Настройки cookies</strong>",
      "<span>Необходимые cookies обеспечивают работу сайта. Аналитику Яндекс.Метрики включим только с вашего согласия.</span>",
      '<a href="/privacy.html">Подробнее в политике</a>',
      "</div>",
      '<div class="mox-consent__actions">',
      '<button class="mox-consent__button mox-consent__button--ghost" type="button" data-consent="rejected">Только необходимые</button>',
      '<button class="mox-consent__button" type="button" data-consent="accepted">Принять</button>',
      "</div>"
    ].join("");
  }

  function ensureStyles() {
    if (document.getElementById("mox-consent-styles")) return;
    var style = document.createElement("style");
    style.id = "mox-consent-styles";
    style.textContent = [
      ".mox-consent{position:fixed;left:20px;right:20px;bottom:20px;z-index:10000;display:flex;align-items:center;gap:20px;max-width:1120px;margin:0 auto;padding:16px 18px;background:rgba(50,43,38,.97);color:#faf7f2;border:1px solid rgba(255,255,255,.14);box-shadow:0 16px 48px rgba(0,0,0,.3);font:14px/1.45 Georgia,serif}",
      ".mox-consent[hidden]{display:none}",
      ".mox-consent__copy{display:grid;gap:3px;flex:1}",
      ".mox-consent__copy strong{font-size:15px}",
      ".mox-consent__copy span{color:rgba(250,247,242,.82)}",
      ".mox-consent__copy a{width:max-content;color:#d8c29f;text-underline-offset:3px}",
      ".mox-consent__actions{display:flex;gap:8px;flex-wrap:wrap}",
      ".mox-consent__button{min-height:44px;padding:10px 16px;border:1px solid #5f8f43;background:#4f8435;color:#fff;font:600 12px/1 Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}",
      ".mox-consent__button--ghost{border-color:rgba(255,255,255,.35);background:transparent}",
      ".mox-cookie-settings{border:0;background:none;color:inherit;font:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}",
      "@media(max-width:700px){.mox-consent{left:10px;right:10px;bottom:74px;display:grid;gap:12px;padding:14px;font-size:12px}.mox-consent__actions{display:grid;grid-template-columns:1fr 1fr}.mox-consent__button{padding:9px 10px;font-size:10px}.mox-consent__copy span{max-width:42ch}}",
      "@media(prefers-reduced-motion:reduce){.mox-consent *{scroll-behavior:auto!important}}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensureBanner() {
    var banner = document.getElementById("mox-cookie-banner");
    if (!banner) {
      banner = document.createElement("aside");
      banner.id = "mox-cookie-banner";
      banner.className = "mox-consent";
      banner.setAttribute("aria-label", "Настройки cookies");
      banner.setAttribute("role", "region");
      banner.innerHTML = bannerMarkup();
      document.body.appendChild(banner);
    }
    return banner;
  }

  function setChoice(value) {
    writeConsent(value);
    var banner = ensureBanner();
    banner.hidden = true;
    if (value === "accepted") loadAnalytics();
    document.dispatchEvent(new CustomEvent("mox:consent", { detail: value }));
  }

  function addSettingsControl() {
    var footer = document.querySelector("footer, .srv-footer");
    if (!footer || footer.querySelector(".mox-cookie-settings")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "mox-cookie-settings";
    button.textContent = "Настройки cookies";
    button.addEventListener("click", function () {
      ensureBanner().hidden = false;
    });
    footer.appendChild(document.createTextNode(" · "));
    footer.appendChild(button);
  }

  function init() {
    ensureStyles();
    var banner = ensureBanner();
    banner.addEventListener("click", function (event) {
      var button = event.target.closest("[data-consent]");
      if (button) setChoice(button.getAttribute("data-consent"));
    });

    var consent = readConsent();
    banner.hidden = Boolean(consent);
    if (consent === "accepted") loadAnalytics();
    addSettingsControl();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
