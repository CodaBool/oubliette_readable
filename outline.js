const outline = document.querySelector("#outline");
const outlineList = outline.querySelector(".outline-list");
const toggle = document.querySelector("#outline-toggle");
const headings = Array.from(document.querySelectorAll(".document :is(h1, h2)"));

const usedIds = new Set();

function slugify(text) {
  const base =
    text
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-") || "section";

  let slug = base;
  for (let i = 2; usedIds.has(slug) || document.getElementById(slug); i++) {
    slug = `${base}-${i}`;
  }
  usedIds.add(slug);
  return slug;
}

function setOpen(open) {
  document.body.classList.toggle("outline-open", open);
  toggle.setAttribute("aria-expanded", String(open));
}

const links = new Map();
let currentGroup = null;

for (const heading of headings) {
  if (!heading.id) heading.id = slugify(heading.textContent);

  const link = document.createElement("a");
  link.href = `#${heading.id}`;
  link.append(...Array.from(heading.childNodes, (node) => node.cloneNode(true)));
  link.addEventListener("click", (event) => {
    event.preventDefault();
    heading.scrollIntoView({ behavior: "smooth", block: "start" });
    // replaceState so outline clicks don't pile up history in the parent frame.
    history.replaceState(null, "", link.hash);
    setOpen(false);
  });
  links.set(heading, link);

  const item = document.createElement("li");
  item.className = `outline-${heading.tagName.toLowerCase()}`;
  item.append(link);

  if (heading.tagName === "H1" || !currentGroup) {
    outlineList.append(item);
    currentGroup = document.createElement("ol");
    item.append(currentGroup);
  } else {
    currentGroup.append(item);
  }
}

for (const group of outlineList.querySelectorAll("ol")) {
  if (!group.children.length) group.remove();
}

toggle.addEventListener("click", () => {
  setOpen(!document.body.classList.contains("outline-open"));
});

addEventListener("keydown", (event) => {
  if (event.key === "Escape") setOpen(false);
});

let activeLink = null;
let updateRequested = false;

function updateActive() {
  updateRequested = false;

  let active = headings[0];
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top > innerHeight * 0.25) break;
    active = heading;
  }

  const link = links.get(active);
  if (link === activeLink) return;

  activeLink?.removeAttribute("aria-current");
  link?.setAttribute("aria-current", "true");
  activeLink = link;

  link?.scrollIntoView({ block: "nearest" });
}

function requestUpdate() {
  if (updateRequested) return;
  updateRequested = true;
  requestAnimationFrame(updateActive);
}

addEventListener("scroll", requestUpdate, { passive: true });
addEventListener("resize", requestUpdate);

// Ids are assigned at runtime, so honour a deep link once they exist.
if (location.hash) {
  document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

updateActive();
