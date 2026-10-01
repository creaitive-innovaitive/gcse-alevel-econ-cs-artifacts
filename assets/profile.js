// Profile page: sign in, student dashboard, admin console.
(function () {
  const S = window.Site;
  const root = document.getElementById("profile-root");
  const DOMAIN = "@danang.sis.edu.vn";
  const COURSE_KEYS = ["ig-econ", "ig-cs", "a-econ", "a-cs"];
  let catalog;

  // Academic words for assigned passwords: two words and two digits, e.g. OutcomeMethod47.
  const WORDS = ("analyse approach assess assume benefit concept consist context contrast create data define derive "
    + "design device distinct economy element evaluate evidence factor feature final focus formula function "
    + "framework hypothesis identify illustrate impact indicate input interpret issue labour layer logic margin "
    + "method model monitor network norm obtain outcome output parallel phase policy predict principle process "
    + "project quote range ratio region relevant research resource response restrict role sector select sequence "
    + "source specific structure survey symbol target theory tradition transfer trend unique valid variable version "
    + "volume").split(" ");
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  const rnd = (n) => crypto.getRandomValues(new Uint32Array(1))[0] % n;
  function genPassword(taken = new Set()) {
    for (;;) {
      const a = WORDS[rnd(WORDS.length)], b = WORDS[rnd(WORDS.length)];
      const pw = cap(a) + cap(b) + String(10 + rnd(90));
      if (a !== b && !taken.has(pw)) return pw;
    }
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
  const $ = (sel, el = root) => el.querySelector(sel);
  const msg = (el, text, ok) => { el.textContent = text; el.className = "msg " + (ok ? "ok" : "err"); el.hidden = !text; };

  if (!S.configured) {
    root.innerHTML = `<div class="placeholder"><h2>Accounts are not switched on yet</h2>
      <p>The site owner still needs to connect the account service. See <b>README.md</b>, section "Profile setup".</p></div>`;
    return;
  }
  const sb = S.sb;

  // ---------- signed-out view ----------
  // First sign-in creates the login: the database only accepts it when the password matches the one
  // the teacher assigned, so there is no separate sign-up step for students.
  function viewSignedOut() {
    root.innerHTML = `
      <div class="auth-card"><h2>Sign in</h2>
        <form id="f-in">
          <label>School email<input type="email" name="email" autocomplete="username" required placeholder="name${DOMAIN}"></label>
          <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
          <button class="btn" type="submit">Sign in</button><p class="msg" hidden></p>
          <p class="hint">Use the email and password your teacher gave you. If you cannot sign in, ask your teacher.</p>
        </form>
      </div>`;
    $("#f-in").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, m = $(".msg", f), btn = $("button", f);
      const email = f.email.value.trim().toLowerCase(), password = f.password.value;
      btn.disabled = true;
      let { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        const r = await sb.auth.signUp({ email, password });
        error = r.error || (r.data.session ? null : { message: "no session" });
      }
      btn.disabled = false;
      if (error) return msg(m, "Wrong email or password.", false);
      boot();
    });
  }

  // ---------- progress helpers ----------
  const subjectSlugs = (subjects) => {
    const out = new Set();
    subjects.forEach((k) => catalog.courses[k]?.slugs.forEach((s) => out.add(s)));
    return out;
  };
  const pct = (done, total) => (total ? Math.round((100 * done) / total) : 0);

  function pills(subjects) {
    return subjects.length
      ? subjects.filter((k) => catalog.courses[k]).map((k) => `<a class="pill" data-accent="${catalog.courses[k].accent}" href="${S.base}${catalog.courses[k].url}">${esc(catalog.courses[k].title)}</a>`).join("")
      : `<span class="hint">No subjects assigned yet. Ask your teacher.</span>`;
  }

  function chapterMap(course, done) {
    return course.groups.map((g) => `
      <div class="mapgroup"><h4>${esc(g.title)}</h4><div class="tiles">
      ${g.chapters.map((ch) => {
        const total = ch.slugs.length, n = ch.slugs.filter((s) => done.has(s)).length;
        const st = !total ? "empty" : n === total ? "full" : n ? "part" : "none";
        return `<a class="tile ${st}" href="${S.base}${ch.url}" title="${esc(ch.title)}${total ? ` (${n}/${total} done)` : " (nothing yet)"}">${esc(ch.label)}</a>`;
      }).join("")}</div></div>`).join("");
  }

  // ---------- student dashboard ----------
  function viewDashboard(me, done) {
    const mine = me.subjects.filter((k) => catalog.courses[k]);
    const all = subjectSlugs(mine);
    const doneN = [...all].filter((s) => done.has(s)).length;
    const next = catalog.order.find((s) => all.has(s) && !done.has(s));
    const recent = [...done.entries()].filter(([s]) => catalog.artifacts[s]).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 5);
    const perSubject = mine.map((k) => {
      const c = catalog.courses[k], t = c.slugs.length, n = c.slugs.filter((s) => done.has(s)).length;
      return `<section class="card block" data-accent="${c.accent}">
        <div class="row"><h3><a href="${S.base}${c.url}">${esc(c.title)}</a></h3><span class="big">${pct(n, t)}%</span></div>
        <div class="bar2"><i style="width:${pct(n, t)}%"></i></div>
        <p class="hint">${n} of ${t} activities done. Each square is a coursebook chapter: filled is all done, half is started, grey has nothing yet.</p>
        ${chapterMap(c, done)}</section>`;
    }).join("");
    const nextA = next && catalog.artifacts[next];

    return `
      <section class="idcard"><h1>${esc(me.name)}</h1><p class="email">${esc(me.email)}</p><div class="pills">${pills(me.subjects)}</div></section>
      <div class="grid two dash">
        <section class="card block"><h3>Overall progress</h3><div class="row"><span class="big">${pct(doneN, all.size)}%</span><span class="hint">${doneN} of ${all.size} activities</span></div>
          <div class="bar2"><i style="width:${pct(doneN, all.size)}%"></i></div></section>
        <section class="card block"><h3>Up next</h3>${nextA
          ? `<p><a class="lnk" href="${S.base}${nextA.url}">${esc(nextA.title)}</a></p><p class="hint">${esc(nextA.chapterTitle)}</p>`
          : `<p class="hint">${all.size ? "You have finished everything currently available. Well done." : "Nothing to show until subjects are assigned."}</p>`}</section>
      </div>
      ${perSubject}
      <div class="grid two dash">
        <section class="card block"><h3>Recently completed</h3>${recent.length
          ? `<ul class="plain">${recent.map(([s, d]) => `<li><a class="lnk" href="${S.base}${catalog.artifacts[s].url}">${esc(catalog.artifacts[s].title)}</a> <span class="hint">${fmt(d)}</span></li>`).join("")}</ul>`
          : `<p class="hint">Mark an activity as done and it will show up here.</p>`}</section>
        <section class="card block empty"><h3>Assessment scores</h3><p class="hint">Coming soon.</p></section>
      </div>
      <section class="card block"><h3>Account</h3>
        <form id="f-pw" class="inline"><label>New password<input type="password" name="password" autocomplete="new-password" minlength="8" required></label>
        <label>Confirm<input type="password" name="confirm" autocomplete="new-password" minlength="8" required></label>
        <button class="btn" type="submit">Change password</button><p class="msg" hidden></p></form>
        <p><button class="btn ghost" id="signout">Sign out</button></p></section>`;
  }

  function wireAccount() {
    $("#f-pw")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, m = $(".msg", f);
      if (f.password.value !== f.confirm.value) return msg(m, "Passwords do not match.", false);
      const { error } = await sb.auth.updateUser({ password: f.password.value });
      if (error) return msg(m, error.message, false);
      f.reset();
      msg(m, "Password changed.", true);
    });
    $("#signout")?.addEventListener("click", async () => { await sb.auth.signOut(); S.me = null; boot(); });
  }

  // ---------- admin console ----------
  async function loadAdmin() {
    const [{ data: people, error }, { data: prog }] = await Promise.all([
      sb.from("profiles").select("*").order("name"),
      sb.rpc("admin_progress"),
    ]);
    if (error) throw error;
    const byEmail = new Map();
    (prog || []).forEach((r) => { if (!byEmail.has(r.email)) byEmail.set(r.email, new Map()); byEmail.get(r.email).set(r.slug, r.done_at); });
    return { people: people || [], byEmail };
  }

  const subjectBoxes = (chosen = []) => COURSE_KEYS.map((k) =>
    `<label class="chk"><input type="checkbox" name="subj" value="${k}" ${chosen.includes(k) ? "checked" : ""}> ${esc(catalog.courses[k].title)}</label>`).join("");

  function adminRows(state) {
    return state.people.map((p) => {
      const all = subjectSlugs(p.subjects), d = state.byEmail.get(p.email) || new Map();
      const n = [...all].filter((s) => d.has(s)).length;
      const status = p.signed_up_at ? (p.last_seen ? "Active " + fmt(p.last_seen) : "Signed up") : "Not signed up";
      return `<tr data-email="${esc(p.email)}"><td><b>${esc(p.name)}</b><br><span class="hint">${esc(p.email)}</span></td>
        <td><div class="pills">${pills(p.subjects)}</div></td><td>${esc(status)}</td><td>${pct(n, all.size)}%<br><span class="hint">${n}/${all.size}</span></td>
        <td class="acts"><button class="mini" data-act="edit">Edit</button><button class="mini" data-act="reset">Reset login</button><button class="mini danger" data-act="del">Delete</button></td></tr>`;
    }).join("") || `<tr><td colspan="5" class="hint">No students yet. Add some above.</td></tr>`;
  }

  async function renderAdmin(host) {
    host.innerHTML = `<p class="hint">Loading students…</p>`;
    let state;
    try { state = await loadAdmin(); }
    catch (e) { host.innerHTML = `<p class="msg err">Could not load students: ${esc(e.message)}. Has schema.sql been run?</p>`; return; }

    host.innerHTML = `
      <details class="card block" open><summary><h3>Add students</h3></summary>
        <form id="f-add"><label>One student per line: <b>Name, email</b> (a password is generated for each)
          <textarea name="lines" rows="5" required placeholder="An Nguyen, an.nguyen${DOMAIN}"></textarea></label>
          <div class="chks">${subjectBoxes()}</div>
          <button class="btn" type="submit">Add students</button><p class="msg" hidden></p></form></details>
      <details class="card block"><summary><h3>Student passwords (${state.people.length})</h3></summary>
        <p class="hint">Assigned passwords, visible to admins only. Students sign in with these; if they later change their own password this list is out of date, use Reset login to start them again.</p>
        <div class="row"><span></span><button class="mini" id="copypw">Copy as table</button></div>
        <div class="tablewrap"><table class="tbl"><thead><tr><th>Student</th><th>Email</th><th>Password</th></tr></thead><tbody>
        ${state.people.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.email)}</td><td><code>${esc(p.password)}</code></td></tr>`).join("") || `<tr><td colspan="3" class="hint">No students yet.</td></tr>`}
        </tbody></table></div></details>
      <section class="card block"><div class="row"><h3>Students (${state.people.length})</h3><button class="mini" id="csv">Export CSV</button></div>
        <div class="tablewrap"><table class="tbl"><thead><tr><th>Student</th><th>Subjects</th><th>Status</th><th>Progress</th><th></th></tr></thead>
        <tbody>${adminRows(state)}</tbody></table></div></section>
      <dialog id="dlg"><form method="dialog" id="f-edit"></form></dialog>`;

    $("#f-add").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, m = $(".msg", f);
      const subjects = [...f.querySelectorAll("[name=subj]:checked")].map((c) => c.value);
      const taken = new Set(state.people.map((x) => x.password));
      const have = new Map(state.people.map((x) => [x.email, x]));
      const fresh = [], existing = [], bad = [];
      f.lines.value.split("\n").map((l) => l.trim()).filter(Boolean).forEach((l) => {
        const parts = l.split(/[,\t;]/).map((x) => x.trim());
        const email = (parts.pop() || "").toLowerCase(), name = parts.join(" ").trim();
        if (!name || !email.endsWith(DOMAIN)) return bad.push(l);
        if (have.has(email)) return existing.push({ email, name, subjects });
        const password = genPassword(taken); taken.add(password);
        fresh.push({ email, name, subjects, password });
      });
      if (bad.length) return msg(m, `Check these lines (need a name and a ${DOMAIN} email): ${bad.join(" | ")}`, false);
      if (fresh.length) {
        const { error } = await sb.from("profiles").insert(fresh);
        if (error) return msg(m, error.message, false);
      }
      for (const r of existing) {
        const { error } = await sb.from("profiles").update({ name: r.name, subjects: r.subjects }).eq("email", r.email);
        if (error) return msg(m, error.message, false);
      }
      renderAdmin(host);
    });

    $("#copypw").addEventListener("click", async () => {
      const text = ["Name\tEmail\tPassword", ...state.people.map((p) => [p.name, p.email, p.password].join("\t"))].join("\n");
      await navigator.clipboard.writeText(text);
      $("#copypw").textContent = "Copied";
    });

    $("#csv").addEventListener("click", () => {
      const head = ["Name", "Email", "Subjects", "Done", "Total", "Percent"];
      const lines = state.people.map((p) => {
        const all = subjectSlugs(p.subjects), d = state.byEmail.get(p.email) || new Map(), n = [...all].filter((s) => d.has(s)).length;
        return [p.name, p.email, p.subjects.join(" "), n, all.size, pct(n, all.size)].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
      a.download = "progress.csv"; a.click();
    });

    host.querySelector("tbody").addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const email = btn.closest("tr").dataset.email, p = state.people.find((x) => x.email === email);
      if (btn.dataset.act === "reset") {
        if (!confirm(`Reset the login for ${p.name}? They keep their progress and sign in again with the password on the list.`)) return;
        const { error } = await sb.rpc("admin_reset_login", { target: email });
        alert(error ? "Could not reset: " + error.message : "Done. " + p.name + " can sign in again with: " + p.password);
        if (!error) renderAdmin(host);
      } else if (btn.dataset.act === "del") {
        if (!confirm(`Delete ${p.name} (${email}) and all their progress? This cannot be undone.`)) return;
        const { error } = await sb.rpc("admin_delete_student", { target: email });
        if (error) alert(error.message); else renderAdmin(host);
      } else {
        const dlg = $("#dlg"), f = $("#f-edit");
        f.innerHTML = `<h3>Edit student</h3><p class="hint">${esc(email)}</p>
          <label>Name<input name="name" value="${esc(p.name)}" required></label>
          <label>Assigned password<input name="password" value="${esc(p.password)}" required minlength="8"></label>
          <p class="hint">Changing the password only affects a new login. Use Reset login to apply it to a student who already has one.</p>
          <div class="chks">${subjectBoxes(p.subjects)}</div>
          <p class="hint">To change an email address, delete the student and add them again.</p>
          <div class="row"><button class="btn" value="save">Save</button><button class="btn ghost" value="cancel" formnovalidate>Cancel</button></div>`;
        dlg.showModal();
        f.onsubmit = async (ev) => {
          if (ev.submitter?.value !== "save") return;
          const subjects = [...f.querySelectorAll("[name=subj]:checked")].map((c) => c.value);
          const { error } = await sb.from("profiles").update({ name: f.elements.name.value.trim(), subjects, password: f.elements.password.value.trim() }).eq("email", email);
          if (error) alert(error.message); else renderAdmin(host);
        };
      }
    });
  }

  // ---------- boot ----------
  async function boot() {
    catalog = catalog || (await S.catalog());
    const me = await S.whoami();
    if (!me) {
      if (await S.session()) {
        root.innerHTML = `<div class="placeholder"><h2>Not on the class list</h2><p>You are signed in, but this email has not been added by your teacher.</p>
          <p><button class="btn ghost" id="signout">Sign out</button></p></div>`;
        return wireAccount();
      }
      return viewSignedOut();
    }
    const done = await S.loadProgress();
    root.innerHTML = viewDashboard(me, done) + (me.is_admin ? `<h2 class="group">Admin</h2><div id="admin"></div>` : "");
    wireAccount();
    if (me.is_admin) renderAdmin($("#admin"));
  }

  boot();
})();
