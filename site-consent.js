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
      "<span>Необходимые cookies обеспечивают работу сайта. Cookies аналитики и Яндекс.Метрика включаются только после вашего согласия.</span>",
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
      ".mox-consent{position:fixed;left:20px;right:20px;bottom:20px;z-index:var(--z-overlay,10000);display:flex;align-items:center;gap:20px;max-width:1120px;margin:0 auto;padding:16px 18px;background:rgba(46,41,38,.98);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:var(--radius-sm,4px);box-shadow:var(--shadow-medium,0 22px 56px -34px rgba(46,41,38,.38));font:14px/1.5 var(--font-body,Inter,sans-serif)}",
      ".mox-consent[hidden]{display:none}",
      ".mox-consent__copy{display:grid;gap:3px;flex:1}",
      ".mox-consent__copy strong{font-size:16px;font-weight:500}",
      ".mox-consent__copy span{color:rgba(250,247,242,.82)}",
      ".mox-consent__copy a{width:max-content;color:var(--color-warm-soft,#E8D5BD);text-underline-offset:3px}",
      ".mox-consent__actions{display:flex;gap:8px;flex-wrap:wrap}",
      ".mox-consent__button{min-height:44px;padding:10px 16px;border:1px solid var(--color-accent,#3D6E35);border-radius:var(--radius-xs,2px);background:var(--color-accent,#3D6E35);color:#fff;font:500 12px/1 var(--font-body,Inter,sans-serif);letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background var(--motion-fast,160ms) ease-out,border-color var(--motion-fast,160ms) ease-out}",
      ".mox-consent__button:hover{border-color:var(--color-accent-hover,#2F572A);background:var(--color-accent-hover,#2F572A)}.mox-consent__button--ghost{border-color:rgba(255,255,255,.4);background:transparent}.mox-consent__button--ghost:hover{border-color:#fff;background:rgba(255,255,255,.08)}.mox-consent__button:focus-visible{outline:2px solid var(--color-focus,#205FC7);outline-offset:3px}",
      ".mox-cookie-settings{border:0;background:none;color:inherit;font:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}",
      "@media(max-width:900px){.mox-consent-visible .sticky-cta,.mox-consent-visible .srv-mobile-cta{display:none!important}}",
      "@media(max-width:700px){.mox-consent{left:10px;right:10px;bottom:10px;display:grid;gap:12px;padding:14px;font-size:13px}.mox-consent__actions{display:grid;grid-template-columns:1fr 1fr}.mox-consent__button{padding:9px 10px;font-size:11px}.mox-consent__copy span{max-width:42ch}}",
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

  function setBannerVisibility(banner, visible) {
    banner.hidden = !visible;
    document.documentElement.classList.toggle("mox-consent-visible", visible);
  }

  function setChoice(value) {
    writeConsent(value);
    var banner = ensureBanner();
    setBannerVisibility(banner, false);
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
      setBannerVisibility(ensureBanner(), true);
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
    setBannerVisibility(banner, !consent);
    if (consent === "accepted") loadAnalytics();
    addSettingsControl();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
