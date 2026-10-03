// Classroom gate: students only see the subjects they are approved for. This is a front-end gate on public
// files, so it keeps the site tidy for students but is not a hard lock.
(function () {
  const S = window.Site;
  const el = document.currentScript;
  const courses = (el.dataset.courses || "").split(",").filter(Boolean);
  const html = document.documentElement;
  const reveal = () => html.classList.remove("gated");

  function deny(title, text, linkText) {
    document.body.innerHTML = `<div style="max-width:460px;margin:12vh auto;padding:24px;font:16px/1.5 -apple-system,Segoe UI,sans-serif;color:#16202a;background:#fff;border:1px solid #ddd8cc;border-radius:12px">
      <h2 style="margin:0 0 8px;font-family:Georgia,serif">${title}</h2><p>${text}</p>
      <p><a href="${S.profileUrl}" style="color:#2b5d7c;font-weight:700">${linkText}</a></p></div>`;
    document.body.style.cssText = "background:#f6f4ef;visibility:visible";
    reveal();
  }

  function filterNav(me) {
    if (!me || me.is_admin) return;
    document.querySelectorAll("[data-course]").forEach((a) => {
      if (!me.subjects.includes(a.dataset.course)) a.hidden = true;
    });
  }

  async function run() {
    if (!S || !S.configured) return reveal();
    const timer = courses.length && setTimeout(() => deny("Could not check your access", "Check your connection, then sign in on your profile page.", "Go to Profile"), 8000);
    const me = await S.whoami();
    clearTimeout(timer);
    filterNav(me);
    if (!courses.length) return reveal();
    if (!me) {
      try { sessionStorage.setItem("site.next", location.href); } catch (e) {}
      return deny("Sign in to open this lesson", "Lessons are for registered students. Sign in with your school email.", "Sign in");
    }
    if (me.is_admin || courses.some((c) => me.subjects.includes(c))) return reveal();
    deny("You are not registered for this subject", "Ask for it from your profile page. Your teacher will approve it.", "Go to Profile");
  }
  run().catch(() => courses.length && deny("Could not check your access", "Please try again.", "Go to Profile"));
})();
