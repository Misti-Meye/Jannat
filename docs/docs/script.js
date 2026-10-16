const photoData = [
  { src: "images/jannat-01.webp", alt: "Jannat in red on a leafy road", caption: "Red looks lovely" },
  { src: "images/jannat-02.webp", alt: "Jannat in black and silver with a light scarf", caption: "A sunny day" },
  { src: "images/jannat-03.webp", alt: "Jannat with a small flower in her hair", caption: "My sunshine" },
  { src: "images/jannat-04.webp", alt: "Jannat in cream, with green leaves around her", caption: "A calm little moment" },
  { src: "images/jannat-05.webp", alt: "Jannat holding a sunflower by the road", caption: "You and a sunflower" },
  { src: "images/jannat-06.webp", alt: "Jannat in a pink outfit by a doorway", caption: "A lovely pink day" },
  { src: "images/puso-portrait.webp", alt: "Puso, a ginger and white cat, lying with paws stretched out", caption: "Puso's best pose" },
  { src: "images/puso-nap.webp", alt: "Puso the ginger and white cat resting on the floor", caption: "Ready for a nap" }
];

const revealItems = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lightbox = document.querySelector(".lightbox");
const photoTrack = document.querySelector(".photo-grid");
const carouselToggle = document.querySelector(".carousel-toggle");
const carouselToggleLabel = carouselToggle.querySelector(".carousel-toggle-label");
let carouselPaused = reduceMotion;
let carouselFrame = null;
let lastFrameTime = null;
let carouselOffset = 0;
const carouselSpeed = 22;

function stopCarousel() {
  if (carouselFrame !== null) {
    window.cancelAnimationFrame(carouselFrame);
    carouselFrame = null;
  }
  lastFrameTime = null;
}

function startCarousel() {
  if (carouselPaused || carouselFrame !== null || document.hidden || lightbox.open) return;
  if (photoTrack.matches(":hover") || photoTrack.contains(document.activeElement)) return;
  carouselFrame = window.requestAnimationFrame(animatePhotoTrack);
}

function animatePhotoTrack(timestamp) {
  carouselFrame = null;
  if (carouselPaused || document.hidden || lightbox.open) return;
  if (photoTrack.matches(":hover") || photoTrack.contains(document.activeElement)) return;
  if (lastFrameTime === null) lastFrameTime = timestamp;
  const elapsed = Math.min(timestamp - lastFrameTime, 64);
  lastFrameTime = timestamp;
  const gap = Number.parseFloat(getComputedStyle(photoTrack).gap) || 0;
  const firstCard = photoTrack.firstElementChild;
  const cardStep = firstCard ? firstCard.getBoundingClientRect().width + gap : 0;
  carouselOffset -= carouselSpeed * elapsed / 1000;
  while (cardStep > 0 && -carouselOffset >= cardStep) {
    photoTrack.append(photoTrack.firstElementChild);
    carouselOffset += cardStep;
  }
  photoTrack.style.transform = `translate3d(${carouselOffset}px, 0, 0)`;
  carouselFrame = window.requestAnimationFrame(animatePhotoTrack);
}

function setCarouselPaused(paused) {
  carouselPaused = paused;
  carouselToggle.classList.toggle("is-paused", paused);
  carouselToggle.setAttribute("aria-pressed", String(paused));
  carouselToggleLabel.textContent = paused ? "Play photos" : "Pause photos";
  if (paused) stopCarousel();
  else startCarousel();
}

setCarouselPaused(reduceMotion);
carouselToggle.addEventListener("click", () => setCarouselPaused(!carouselPaused));
photoTrack.addEventListener("pointerenter", stopCarousel);
photoTrack.addEventListener("pointerleave", startCarousel);
photoTrack.addEventListener("focusin", stopCarousel);
photoTrack.addEventListener("focusout", (event) => {
  if (!photoTrack.contains(event.relatedTarget) && !lightbox.open) startCarousel();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopCarousel();
  else startCarousel();
});

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  });
});

const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxCount = document.querySelector(".lightbox-count");
const closeButton = document.querySelector(".lightbox-close");
const previousButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");
const photoTriggers = [...document.querySelectorAll("[data-photo]")];
let activePhotoIndex = 0;
let lastTrigger = null;

function showPhoto(index) {
  activePhotoIndex = (index + photoData.length) % photoData.length;
  const photo = photoData[activePhotoIndex];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCaption.textContent = photo.caption;
  lightboxCount.textContent = `${String(activePhotoIndex + 1).padStart(2, "0")} / ${String(photoData.length).padStart(2, "0")}`;
}

photoTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    lastTrigger = trigger;
    stopCarousel();
    showPhoto(Number(trigger.dataset.photo));
    lightbox.showModal();
    closeButton.focus();
  });
});

function closeLightbox() {
  if (lightbox.open) lightbox.close();
}

closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => showPhoto(activePhotoIndex - 1));
nextButton.addEventListener("click", () => showPhoto(activePhotoIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener("close", () => {
  if (lastTrigger) lastTrigger.focus();
  startCarousel();
});
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPhoto(activePhotoIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(activePhotoIndex + 1);
  } else if (event.key === "Tab") {
    const focusable = [closeButton, previousButton, nextButton];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
