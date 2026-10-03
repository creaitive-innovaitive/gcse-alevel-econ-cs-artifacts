// Shared auth + progress layer. Loaded on chapter pages, artifact pages and the profile page.
(function () {
  const cfg = window.SITE_CONFIG || {};
  const base = new URL("../", document.currentScript.src).href; // site root
  const configured = !!(cfg.supabaseUrl && cfg.anonKey && window.supabase);
  const sb = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.anonKey) : null;

  const Site = { configured, sb, base, profileUrl: base + "profile/", done: new Map(), me: null };
  window.Site = Site;

  // The catalog holds each artifact's default role (review or resource). Admin overrides live in the
  // artifact_roles table and are layered on here, so progress totals follow whatever the admin chose.
  let catPromise = null;
  Site.catalog = () => (catPromise = catPromise || (async () => {
    const cat = await fetch(base + "assets/catalog.json", { cache: "no-cache" }).then((r) => r.json());
    if (sb) {
      try {
        const { data } = await sb.from("artifact_roles").select("slug,role");
        (data || []).forEach((r) => { if (cat.artifacts[r.slug]) cat.artifacts[r.slug].role = r.role; });
      } catch (e) {}
    }
    const rev = (s) => cat.artifacts[s]?.role === "review";
    Object.values(cat.courses).forEach((c) => {
      const seen = new Set();
      c.groups.forEach((g) => g.chapters.forEach((ch) => { ch.slugs = (ch.all || ch.slugs).filter(rev); ch.slugs.forEach((s) => seen.add(s)); }));
      c.slugs = [...seen];
    });
    cat.order = cat.order.filter(rev);
    return cat;
  })());

  // Admin only: set an artifact to "review" or "resource".
  Site.setRole = async (slug, role) => {
    const { error } = await sb.from("artifact_roles").upsert({ slug, role, updated_at: new Date().toISOString() });
    if (error) return false;
    const cat = await Site.catalog();
    cat.artifacts[slug].role = role;
    document.dispatchEvent(new CustomEvent("site:rolechange", { detail: { slug, role } }));
    return true;
  };

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

  Site.bindButtons = () => bindButtons();
  async function bindButtons() {
    const btns = document.querySelectorAll("[data-done-slug]");
    if (!btns.length) return;
    if (!configured) { btns.forEach((b) => (b.hidden = true)); return; }
    await Site.whoami();
    await Site.loadProgress();
    let cat = null;
    try { cat = await Site.catalog(); Site.assessed = cat.assessed || {}; } catch (e) {}
    if (Site.me && !Site.me.is_admin && !Site.me.is_teacher && Object.keys(Site.assessed).length) {
      const { data } = await sb.rpc("my_attempts");
      (data || []).forEach((r) => Site.attempts.set(r.slug, r));
    }
    const isRev = (s) => !cat || cat.artifacts[s]?.role === "review";
    btns.forEach((b) => {
      if (b.dataset.bound) return;
      b.dataset.bound = "1";
      b.hidden = !isRev(b.dataset.doneSlug);
      paint(b);
      b.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!Site.me) { location.href = Site.profileUrl; return; }
        if (Site.assessed[b.dataset.doneSlug]) { location.href = assessUrl(b.dataset.doneSlug); return; }
        b.disabled = true;
        const ok = await Site.toggle(b.dataset.doneSlug);
        b.disabled = false;
        if (!ok) { alert("That could not be saved. If this lesson has an assessment, pass it to complete the lesson."); location.reload(); return; }
        document.querySelectorAll(`[data-done-slug="${b.dataset.doneSlug}"]`).forEach(paint);
      });
    });
  }


  // Admin-only role toggles: any [data-role-toggle="slug"] button.
  async function bindRoleToggles() {
    const tgs = document.querySelectorAll("[data-role-toggle]");
    if (!tgs.length || !configured) return;
    await Site.whoami();
    if (!Site.me || !Site.me.is_admin) return;
    const cat = await Site.catalog();
    const paintT = (t) => {
      const r = cat.artifacts[t.dataset.roleToggle]?.role;
      t.textContent = r === "review" ? "Admin: move to Resources" : "Admin: make Chapter review";
      t.title = "Only admins see this. It changes where the artifact appears for everyone.";
    };
    tgs.forEach((t) => {
      t.hidden = false;
      paintT(t);
      t.addEventListener("click", async (e) => {
        e.preventDefault();
        const slug = t.dataset.roleToggle;
        t.disabled = true;
        const ok = await Site.setRole(slug, cat.artifacts[slug].role === "review" ? "resource" : "review");
        t.disabled = false;
        if (!ok) alert("Could not save. Has the artifact_roles SQL been run in Supabase?");
      });
    });
    document.addEventListener("site:rolechange", () => tgs.forEach(paintT));
  }

  // Teacher notification bell, to the right of Profile in the navbar.
  Site.refreshBell = async () => {
    const nav = document.querySelector("nav.main");
    if (!nav || !Site.me || !Site.me.is_admin) return;
    const { data } = await sb.rpc("admin_notifications");
    const n = data ? (data.approvals || 0) + (data.retakes || 0) : 0;
    let a = nav.querySelector(".bell");
    if (!a) {
      a = document.createElement("a");
      a.className = "bell"; a.href = Site.profileUrl;
      a.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v3.5L4.5 16h15L18 12.5V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><b></b>';
      a.addEventListener("click", () => { try { sessionStorage.setItem("site.admintab", "approvals"); } catch (e) {} });
      nav.appendChild(a);
    }
    a.querySelector("b").textContent = n || "";
    a.title = n ? `${data.approvals || 0} subject request(s), ${data.retakes || 0} retake request(s)` : "No notifications";
    a.classList.toggle("has", n > 0);
  };
  async function startBell() { if (configured) { await Site.whoami(); Site.refreshBell(); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startBell); else startBell();

  const start = () => { bindButtons(); bindRoleToggles(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
