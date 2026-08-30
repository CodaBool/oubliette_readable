const root = document.documentElement;
const button = document.querySelector("#theme-toggle");
const icon = button.querySelector("span");

function updateButton() {
  const isDark = root.dataset.theme === "dark";
  const label = isDark
    ? "Switch to light theme"
    : "Switch to OLED dark theme";

  icon.textContent = isDark ? "☀" : "☾";
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
  button.setAttribute("aria-pressed", String(isDark));
}

button.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  updateButton();
});

updateButton();

const stickyHeadings = document.querySelector("#sticky-headings");
const stickyHeadingsInner = stickyHeadings.querySelector(
  ".sticky-headings-inner",
);
const documentHeadings = Array.from(
  document.querySelectorAll(".document h1"),
);

let stickyUpdateRequested = false;

function makeStickyRow(heading) {
  const row = document.createElement("div");
  row.className = `sticky-heading-row sticky-${heading.tagName.toLowerCase()}`;
  row.append(...Array.from(heading.childNodes, (node) => node.cloneNode(true)));
  return row;
}

function updateStickyHeadings() {
  stickyUpdateRequested = false;

  let activeH1 = null;

  for (const heading of documentHeadings) {
    if (heading.getBoundingClientRect().top > 0) {
      break;
    }

    activeH1 = heading;
  }

  stickyHeadingsInner.replaceChildren(
    ...(activeH1 ? [makeStickyRow(activeH1)] : []),
  );
  stickyHeadings.classList.toggle("is-visible", Boolean(activeH1));
}

function requestStickyUpdate() {
  if (stickyUpdateRequested) return;

  stickyUpdateRequested = true;
  requestAnimationFrame(updateStickyHeadings);
}

addEventListener("scroll", requestStickyUpdate, { passive: true });
addEventListener("resize", requestStickyUpdate);
updateStickyHeadings();
