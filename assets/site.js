const btn = document.querySelector(".menu");
const nav = document.querySelector("nav.main");
btn?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});
