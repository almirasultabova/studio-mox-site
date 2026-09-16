// Accessible lightbox for service galleries.
(function () {
  const items = Array.from(document.querySelectorAll(".srv-gallery-item img"));
  if (!items.length) return;

  const overlay = document.createElement("div");
  overlay.className = "lb-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Просмотр фотографии");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <button class="lb-close" type="button" aria-label="Закрыть">×</button>
    <button class="lb-arrow lb-prev" type="button" aria-label="Предыдущее фото">‹</button>
    <button class="lb-arrow lb-next" type="button" aria-label="Следующее фото">›</button>
    <img class="lb-img" alt="">
    <div class="lb-counter" aria-live="polite"></div>`;
  document.body.appendChild(overlay);

  const image = overlay.querySelector(".lb-img");
  const counter = overlay.querySelector(".lb-counter");
  const closeButton = overlay.querySelector(".lb-close");
  let index = 0;
  let previousFocus = null;

  function show(nextIndex) {
    index = (nextIndex + items.length) % items.length;
    image.src = items[index].src;
    image.alt = items[index].alt || "";
    counter.textContent = `${index + 1} / ${items.length}`;
  }

  function open(nextIndex) {
    previousFocus = document.activeElement;
    show(nextIndex);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function close() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (previousFocus) previousFocus.focus();
  }

  items.forEach((item, itemIndex) => {
    const target = item.closest(".srv-gallery-item") || item;
    target.tabIndex = 0;
    target.setAttribute("role", "button");
    target.setAttribute("aria-label", `Открыть фото ${itemIndex + 1}`);
    target.addEventListener("click", () => open(itemIndex));
    target.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open(itemIndex);
      }
    });
  });

  closeButton.addEventListener("click", close);
  overlay.querySelector(".lb-prev").addEventListener("click", (event) => {
    event.stopPropagation();
    show(index - 1);
  });
  overlay.querySelector(".lb-next").addEventListener("click", (event) => {
    event.stopPropagation();
    show(index + 1);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", (event) => {
    if (!overlay.classList.contains("open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "Tab") {
      const controls = Array.from(overlay.querySelectorAll("button:not([disabled])"));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  let startX = 0;
  overlay.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - startX;
    if (Math.abs(distance) > 40) show(index + (distance > 0 ? -1 : 1));
  });
})();
