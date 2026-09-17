(function () {
  var COUNTER_ID = 108746024;
  var GENERIC_GOAL = "dikidi_widget_open";
  var LEGACY_GENERIC_GOAL = "dikidi_widget_click";
  var WIDGET_GOALS = {
    "213049": "dikidi_company",
    "213051": "dikidi_anastasia",
    "213052": "dikidi_oksana",
    "213054": "dikidi_underarms",
    "213055": "dikidi_course",
    "213056": "dikidi_lashes",
    "213061": "dikidi_classic_bikini",
    "213062": "dikidi_full_legs",
    "213063": "dikidi_bikini_underarms",
    "213064": "dikidi_carbon_face"
  };

  function getWidgetId(href) {
    var match = href && href.match(/[?#&]widget=(\d+)/);
    return match ? match[1] : "";
  }

  function sendGoal(goalName, params) {
    if (typeof window.ym !== "function") return;

    try {
      window.ym(COUNTER_ID, "reachGoal", goalName, params || {});
    } catch (error) {
      // Analytics must never block the DIKIDI widget.
    }
  }

  document.addEventListener("click", function (event) {
    var anyLink = event.target.closest && event.target.closest("a[href]");
    if (!anyLink) return;
    var href = anyLink.getAttribute("href") || "";
    var interactionGoal = "";
    if (href.indexOf("tel:") === 0) interactionGoal = "tel_click";
    else if (href.indexOf("vk.ru/") !== -1) interactionGoal = "vk_click";
    else if (href.indexOf("max.ru/") !== -1) interactionGoal = "max_click";
    else if (href.indexOf("t.me/") !== -1) interactionGoal = "telegram_click";
    else if (anyLink.classList.contains("directions-link")) interactionGoal = "directions_click";
    else if (anyLink.classList.contains("review-source") || anyLink.classList.contains("platform-btn")) interactionGoal = "review_platform_click";
    else if (/yandex\.(?:ru|com)\/maps|2gis\.ru/.test(href)) interactionGoal = "maps_click";
    else if (/^(?:\.\.\/)?services\/.+\.html/.test(href)) interactionGoal = "service_detail_click";
    else if (/(?:first-visit|wax-or-sugar)\.html/.test(href)) interactionGoal = "guide_open";
    if (interactionGoal) {
      sendGoal(interactionGoal, {
        href: href,
        label: (anyLink.textContent || "").trim(),
        page_path: window.location.pathname,
        page_title: document.title
      });
    }

    var link = event.target.closest('a[href*="dikidi.ru/#widget="]');
    if (!link) return;

    var widgetId = getWidgetId(link.getAttribute("href"));
    var params = {
      widget_id: widgetId,
      label: (link.textContent || "").trim(),
      page_path: window.location.pathname,
      page_title: document.title,
      service_slug: (window.location.pathname.match(/\/services\/([^/.]+)/) || [])[1] || "",
      placement: link.closest(".sticky-cta") ? "sticky" : link.closest(".master-card") ? "master" : link.closest(".service-card") ? "service_card" : link.closest(".srv-cta") ? "service_bottom" : link.closest(".srv-hero") ? "service_hero" : "page"
    };

    sendGoal(GENERIC_GOAL, params);
    sendGoal(LEGACY_GENERIC_GOAL, params);

    if (WIDGET_GOALS[widgetId]) {
      sendGoal(WIDGET_GOALS[widgetId], params);
    }
  });
})();
