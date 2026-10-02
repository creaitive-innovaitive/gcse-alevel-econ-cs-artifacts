// Shared auth + progress layer. Loaded on chapter pages, artifact pages and the profile page.
(function () {
  const cfg = window.SITE_CONFIG || {};
  const base = new URL("../", document.currentScript.src).href; // site root
  const configured = !!(cfg.supabaseUrl && cfg.anonKey && window.supabase);
  const sb = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.anonKey) : null;

  const Site = { configured, sb, base, profileUrl: base + "profile/", done: new Map(), me: null };
  window.Site = Site;

  Site.catalog = () => fetch(base + "assets/catalog.json").then((r) => r.json());

  Site.session = async () => (sb ? (await sb.auth.getSession()).data.session : null);

  // Returns {email, name, subjects, requested, is_admin} or null when signed out / not on the roster.
  // Cached briefly so every page load does not wait on the database; pass force to refresh.
  Site.whoami = async (force) => {
    if (!sb || !(await Site.session())) { sessionStorage.removeItem("site.me"); Site.me = null; return null; }
    if (!force) {
      try {
        const c = JSON.parse(sessionStorage.getItem("site.me") || "null");
        if (c && Date.now() - c.t < 60000) return (Site.me = c.me);
      } catch (e) {}
    }
    const { data } = await sb.rpc("whoami");
    Site.me = data || null;
    try { sessionStorage.setItem("site.me", JSON.stringify({ t: Date.now(), me: Site.me })); } catch (e) {}
    return Site.me;
  };

  Site.loadProgress = async () => {
    Site.done = new Map();
    if (!Site.me) return Site.done;
    const { data } = await sb.from("progress").select("slug,done_at").eq("email", Site.me.email);
    (data || []).forEach((r) => Site.done.set(r.slug, r.done_at));
    return Site.done;
  };

  Site.toggle = async (slug) => {
    if (!Site.me) return false;
    if (Site.done.has(slug)) {
      const { error } = await sb.from("progress").delete().eq("email", Site.me.email).eq("slug", slug);
      if (error) return false;
      Site.done.delete(slug);
    } else {
      const { error } = await sb.from("progress").insert({ email: Site.me.email, slug });
      if (error) return false;
      Site.done.set(slug, new Date().toISOString());
    }
    return true;
  };

  // "Mark done" buttons: any element with data-done-slug. Lessons that have an assessment are completed by
  // passing it, so their button becomes a link to the assessment.
  Site.assessed = {};
  Site.attempts = new Map();
  const assessUrl = (slug) => base + "assess/?a=" + encodeURIComponent(slug);

  function paint(btn) {
    const slug = btn.dataset.doneSlug, a = Site.assessed[slug];
    if (a) {
      const t = Site.attempts.get(slug), staff = Site.me && (Site.me.is_admin || Site.me.is_teacher);
      btn.title = `Complete by scoring ${a.pass}% or more`;
      btn.classList.toggle("is-done", Site.done.has(slug));
      btn.textContent = !Site.me ? "Sign in to take assessment" : staff ? "Preview assessment"
        : Site.done.has(slug) ? `✓ Passed${t ? " (" + t.pct + "%)" : ""}` : t ? `Assessment ${t.pct}%` : "Take assessment";
      return;
    }
    if (!Site.me) {
      btn.textContent = "Sign in to track";
      btn.classList.remove("is-done");
      btn.title = "Sign in on the Profile page to record your progress";
    } else if (Site.done.has(slug)) {
      btn.textContent = "✓ Done";
      btn.classList.add("is-done");
      btn.title = "Click to undo";
    } else {
      btn.textContent = "Mark done";
      btn.classList.remove("is-done");
      btn.title = "";
    }
  }

  async function bindButtons() {
    const btns = document.querySelectorAll("[data-done-slug]");
    if (!btns.length) return;
    if (!configured) { btns.forEach((b) => (b.hidden = true)); return; }
    await Site.whoami();
    await Site.loadProgress();
    try { Site.assessed = (await Site.catalog()).assessed || {}; } catch (e) {}
    if (Site.me && !Site.me.is_admin && !Site.me.is_teacher && Object.keys(Site.assessed).length) {
      const { data } = await sb.rpc("my_attempts");
      (data || []).forEach((r) => Site.attempts.set(r.slug, r));
    }
    btns.forEach((b) => {
      b.hidden = false;
      paint(b);
      b.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!Site.me) { location.href = Site.profileUrl; return; }
        if (Site.assessed[b.dataset.doneSlug]) { location.href = assessUrl(b.dataset.doneSlug); return; }
        b.disabled = true;
        await Site.toggle(b.dataset.doneSlug);
        b.disabled = false;
        document.querySelectorAll(`[data-done-slug="${b.dataset.doneSlug}"]`).forEach(paint);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindButtons);
  else bindButtons();
})();
