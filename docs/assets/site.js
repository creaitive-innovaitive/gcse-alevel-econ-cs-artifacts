const btn = document.querySelector(".menu");
const nav = document.querySelector("nav.main");
btn?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});

// Light/dark toggle. The choice is stored per browser; with nothing stored the system setting applies.
const themeBtn = document.querySelector(".theme");
const root = document.documentElement;
const currentTheme = () => root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
function paintTheme() {
  if (!themeBtn) return;
  const dark = currentTheme() === "dark";
  themeBtn.textContent = dark ? "☀" : "☾";
  themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  themeBtn.title = themeBtn.getAttribute("aria-label");
}
themeBtn?.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("site.theme", next); } catch (e) {}
  paintTheme();
});
paintTheme();
