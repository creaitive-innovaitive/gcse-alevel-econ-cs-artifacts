// Profile page: sign in, student dashboard, admin console.
(function () {
  const S = window.Site;
  const root = document.getElementById("profile-root");
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const COURSE_KEYS = ["ig-econ", "ig-cs", "a-econ", "a-cs"];
  let catalog, adminMe = "", adminTab = null, openClass = null;

  // Three classes, five class-subject groups. Student membership is stored per group (the ids below);
  // joining a group gives the student that group's course.
  const CLASS_LIST = [
    { id: "ig1", title: "IG1", groups: [{ id: "ig1-cs", label: "CS", subject: "ig-cs" }] },
    { id: "ig2", title: "IG2", groups: [{ id: "ig2-cs", label: "CS", subject: "ig-cs" }, { id: "ig2-econ", label: "Econ", subject: "ig-econ" }] },
    { id: "al", title: "AL", groups: [{ id: "a-cs", label: "CS", subject: "a-cs" }, { id: "a-econ", label: "Econ", subject: "a-econ" }] },
  ];
  const CLASSES = CLASS_LIST.flatMap((c) => c.groups.map((g) => ({ ...g, cls: c.title, title: `${c.title} ${g.label}` })));
  const classSubjects = (ids) => [...new Set(CLASSES.filter((c) => ids.includes(c.id)).map((c) => c.subject))];
  const union = (a, b) => [...new Set([...a, ...b])];

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
  // Logins are created by the admin panel, so students only ever sign in.
  function viewSignedOut() {
    root.innerHTML = `
      <div class="auth-card"><h2>Sign in</h2>
        <form id="f-in">
          <label>Email<input type="email" name="email" autocomplete="username" required></label>
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
      const { error } = await sb.auth.signInWithPassword({ email, password });
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
      : `<span class="hint">No subjects yet.</span>`;
  }

  function subjectPanel(me) {
    const pend = (me.requested || []).filter((k) => catalog.courses[k]);
    const avail = COURSE_KEYS.filter((k) => !me.subjects.includes(k) && !pend.includes(k));
    const pendHtml = pend.map((k) => `<span class="pill pending" data-accent="${catalog.courses[k].accent}">${esc(catalog.courses[k].title)} · waiting for approval <button class="x" data-cancel="${k}" title="Cancel request">×</button></span>`).join("");
    const req = !me.is_admin && avail.length
      ? `<p class="hint">Join a subject: ${avail.map((k) => `<button class="mini" data-req="${k}">+ ${esc(catalog.courses[k].title)}</button>`).join(" ")}</p>` : "";
    return `<div class="pills">${pills(me.subjects.filter((k) => catalog.courses[k]))}${pendHtml}</div>${req}`;
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

    const account = `<section class="card block"><h3>Account</h3>
        <form id="f-pw" class="inline"><label>New password<input type="password" name="password" autocomplete="new-password" minlength="8" required></label>
        <label>Confirm<input type="password" name="confirm" autocomplete="new-password" minlength="8" required></label>
        <button class="btn" type="submit">Change password</button><p class="msg" hidden></p></form>
        <p><button class="btn ghost" id="signout">Sign out</button></p></section>`;

    // Teachers get the chapter map only: no percentages, up next, history or scores.
    if (me.is_admin) {
      const maps = mine.map((k) => {
        const c = catalog.courses[k];
        return `<section class="card block" data-accent="${c.accent}"><h3><a href="${S.base}${c.url}">${esc(c.title)}</a></h3>${chapterMap(c, done)}</section>`;
      }).join("");
      return `<section class="idcard"><h1>${esc(me.name)}</h1><p class="email">${esc(me.email)}${me.email2 ? ` · ${esc(me.email2)}` : ""}</p>${subjectPanel(me)}</section><!--split-->
        <p class="hint">Course map. Each square is a coursebook chapter: filled means every activity is done, half means started, grey means nothing there yet.</p>${maps}${account}`;
    }

    return `
      <section class="idcard"><h1>${esc(me.name)}</h1><p class="email">${esc(me.email)}${me.email2 ? ` · ${esc(me.email2)}` : ""}</p>${subjectPanel(me)}</section><!--split-->
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
      ${account}`;
  }

  function wireAccount() {
    root.querySelectorAll("[data-req],[data-cancel]").forEach((b) => b.addEventListener("click", async () => {
      b.disabled = true;
      const { error } = b.dataset.req ? await sb.rpc("request_subject", { subject: b.dataset.req }) : await sb.rpc("cancel_request", { subject: b.dataset.cancel });
      if (error) { alert(error.message); b.disabled = false; return; }
      boot();
    }));
    $("#f-pw")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, m = $(".msg", f);
      if (f.password.value !== f.confirm.value) return msg(m, "Passwords do not match.", false);
      const { error } = await sb.rpc("set_my_password", { new_password: f.password.value });
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

  const classBoxes = (chosen = []) => CLASS_LIST.map((c) =>
    `<div class="clsrow"><b>${esc(c.title)}</b>${c.groups.map((g) =>
      `<label class="chk"><input type="checkbox" name="cls" value="${g.id}" ${chosen.includes(g.id) ? "checked" : ""}> ${esc(g.label)}</label>`).join("")}</div>`).join("");

  const progressOf = (state, p) => {
    const all = subjectSlugs(p.subjects), d = state.byEmail.get(p.email) || new Map();
    const n = [...all].filter((s) => d.has(s)).length;
    return { n, total: all.size, pct: pct(n, all.size) };
  };

  function classTable(state, list) {
    return `<div class="tablewrap"><table class="tbl"><thead><tr><th>Student</th><th>Subjects</th><th>Status</th><th>Progress</th><th></th></tr></thead>
      <tbody class="stu">${adminRows(state, list)}</tbody></table></div>`;
  }

  function classAccordion(state) {
    const avgOf = (list) => (list.length ? Math.round(list.reduce((t, p) => t + progressOf(state, p).pct, 0) / list.length) : 0);
    const bar = (id, title, list, inner) => `<details class="card block cls" name="cls" data-cls="${id}" ${openClass === id ? "open" : ""}>
        <summary><h3>${esc(title)}</h3>${list.length ? `<span class="hint">average progress ${avgOf(list)}%</span>` : ""}</summary>${inner}</details>`;
    const out = [];
    const loose = state.people.filter((p) => !(p.classes || []).length);
    if (loose.length) out.push(bar("none", "Not in a class", loose, classTable(state, loose)));
    CLASS_LIST.forEach((c) => {
      const ids = c.groups.map((g) => g.id);
      const everyone = state.people.filter((p) => (p.classes || []).some((x) => ids.includes(x)));
      const inner = everyone.length ? classTable(state, everyone) : '<p class="hint">No students in this class yet.</p>';
      out.push(bar(c.id, c.title, everyone, inner));
    });
    return out.join("");
  }
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  function adminRows(state, list) {
    return list.map((p) => {
      const all = subjectSlugs(p.subjects), d = state.byEmail.get(p.email) || new Map();
      const n = [...all].filter((s) => d.has(s)).length;
      const status = p.signed_up_at ? (p.last_seen ? "Active " + fmt(p.last_seen) : "Signed up") : "Not signed up";
      return `<tr data-email="${esc(p.email)}"><td><b>${esc(p.name)}</b><br><span class="hint">${esc(p.email)}${p.email2 ? `<br>${esc(p.email2)}` : ""}</span></td>
        <td><div class="pills">${pills(p.subjects)}</div></td><td>${esc(status)}</td><td>${pct(n, all.size)}%<br><span class="hint">${n}/${all.size}</span></td>
        <td class="acts"><button class="mini" data-act="edit">Edit</button><button class="mini" data-act="reset">Reset login</button><button class="mini danger" data-act="del">Delete</button></td></tr>`;
    }).join("");
  }

  async function renderAdmin(host) {
    host.innerHTML = `<p class="hint">Loading students…</p>`;
    let state;
    try { state = await loadAdmin(); }
    catch (e) { host.innerHTML = `<p class="msg err">Could not load students: ${esc(e.message)}. Has schema.sql been run?</p>`; return; }

    const pending = state.people.flatMap((p) => (p.requested || []).filter((k) => catalog.courses[k]).map((k) => ({ p, k })));
    const tab = adminTab || (pending.length ? "approvals" : "students");
    const toggleClass = (d) => d.addEventListener("toggle", () => { if (d.open) openClass = d.dataset.cls; else if (openClass === d.dataset.cls) openClass = null; });
    host.innerHTML = `
      <div class="tabs admintabs" role="tablist">
        <button data-at="approvals">Approvals${pending.length ? ` (${pending.length})` : ""}</button><button data-at="students">Classes</button>
        <button data-at="add">Add students</button><button data-at="pw">Passwords</button><button data-at="me">My profile</button></div>
      <div class="tabpanel" data-panel="approvals"><section class="card block ${pending.length ? "attn" : ""}"><div class="row"><h3>Pending approvals (${pending.length})</h3>${pending.length > 1 ? '<button class="mini" id="approveall">Approve all</button>' : ""}</div>
        ${pending.length ? `<ul class="plain">${pending.map(({ p, k }) => `<li class="row" data-email="${esc(p.email)}" data-subj="${k}">
          <span><b>${esc(p.name)}</b> <span class="hint">${esc(p.email)}</span> wants <span class="pill" data-accent="${catalog.courses[k].accent}">${esc(catalog.courses[k].title)}</span></span>
          <span><button class="mini ok" data-ap="yes">Approve</button> <button class="mini danger" data-ap="no">Decline</button></span></li>`).join("")}</ul>` : '<p class="hint">Nothing waiting.</p>'}</section></div>
      <div class="tabpanel" data-panel="add"><section class="card block"><h3>Add students</h3>
        <form id="f-add"><label>One student per line: <b>Name, email</b> or <b>Name, email, second email</b> (a password is generated for each)
          <textarea name="lines" rows="5" required placeholder="An Nguyen, an@school.edu.vn, parent@gmail.com"></textarea></label>
          <div class="chks">${classBoxes()}</div>
          <button class="btn" type="submit">Add students</button><p class="msg" hidden></p></form></section></div>
      <div class="tabpanel" data-panel="pw"><section class="card block"><h3>Student passwords (${state.people.length})</h3>
        <p class="hint">Assigned passwords, visible to admins only. Students sign in with these. If a student changes their own password this list is out of date; Reset login puts it back to the listed one.</p>
        <div class="row"><span></span><button class="mini" id="copypw">Copy as table</button></div>
        <div class="tablewrap"><table class="tbl"><thead><tr><th>Student</th><th>Email</th><th>Password</th></tr></thead><tbody>
        ${state.people.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.email)}${p.email2 ? `<br>${esc(p.email2)}` : ""}</td><td><code>${esc(p.password)}</code></td></tr>`).join("") || `<tr><td colspan="3" class="hint">No students yet.</td></tr>`}
        </tbody></table></div></section></div>
      <div class="tabpanel" data-panel="students"><div class="row"><h3>Classes</h3><button class="mini" id="csv">Export CSV</button></div>
        <p class="hint">Open a class to manage its students.</p>${classAccordion(state)}</div>
      <div class="tabpanel" data-panel="me">${adminMe}</div>
      <dialog id="dlg"><form method="dialog" id="f-edit"></form></dialog>`;
    const showTab = (t) => {
      adminTab = t;
      host.querySelectorAll("[data-at]").forEach((b) => b.classList.toggle("on", b.dataset.at === t));
      host.querySelectorAll(".tabpanel").forEach((d) => (d.hidden = d.dataset.panel !== t));
    };
    host.querySelectorAll("[data-at]").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.at)));
    showTab(tab);
    wireAccount();

    $("#f-add").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, m = $(".msg", f);
      const classes = [...f.querySelectorAll("[name=cls]:checked")].map((c) => c.value);
      if (!classes.length) return msg(m, "Tick at least one class.", false);
      const subjects = classSubjects(classes);
      const taken = new Set(state.people.map((x) => x.password));
      const have = new Map(state.people.map((x) => [x.email, x]));
      const used = new Set(state.people.flatMap((x) => [x.email, x.email2].filter(Boolean)));
      const fresh = [], existing = [], bad = [];
      f.lines.value.split("\n").map((l) => l.trim()).filter(Boolean).forEach((l) => {
        const parts = l.split(/[,\t;]/).map((x) => x.trim()).filter(Boolean);
        const emails = parts.filter((x) => x.includes("@")).map((x) => x.toLowerCase());
        const name = parts.filter((x) => !x.includes("@")).join(" ").trim();
        const [email, email2] = emails;
        if (!name || !email || emails.length > 2 || !emails.every((x) => EMAIL_RE.test(x)) || email === email2) return bad.push(l);
        if (have.has(email)) return existing.push({ email, name, subjects, classes });
        if (emails.some((x) => used.has(x))) return bad.push(l + " (email already in use)");
        emails.forEach((x) => used.add(x));
        const password = genPassword(taken); taken.add(password);
        fresh.push({ email, email2: email2 || null, name, subjects, classes, password });
      });
      if (bad.length) return msg(m, `Check these lines (need a name and one or two valid emails): ${bad.join(" | ")}`, false);
      if (fresh.length) {
        const { error } = await sb.from("profiles").insert(fresh);
        if (error) return msg(m, error.message, false);
        for (const r of fresh) {
          for (const addr of [r.email, r.email2].filter(Boolean)) {
            const { error: e2 } = await sb.rpc("admin_create_login", { target: addr });
            if (e2) return msg(m, `Added ${r.name} but could not create the login for ${addr}: ${e2.message}`, false);
          }
        }
      }
      for (const r of existing) {
        const old = have.get(r.email);
        const { error } = await sb.from("profiles").update({ name: r.name, subjects: union(old.subjects, r.subjects), classes: union(old.classes || [], r.classes) }).eq("email", r.email);
        if (error) return msg(m, error.message, false);
      }
      renderAdmin(host);
    });

    $("#copypw").addEventListener("click", async () => {
      const text = ["Name\tEmail\tEmail 2\tPassword", ...state.people.map((p) => [p.name, p.email, p.email2 || "", p.password].join("\t"))].join("\n");
      await navigator.clipboard.writeText(text);
      $("#copypw").textContent = "Copied";
    });

    const decide = async (p, k, yes) => {
      const subjects = yes && !p.subjects.includes(k) ? [...p.subjects, k] : p.subjects;
      const { error } = await sb.from("profiles").update({ subjects, requested: (p.requested || []).filter((x) => x !== k) }).eq("email", p.email);
      if (error) alert(error.message);
      p.subjects = subjects; p.requested = (p.requested || []).filter((x) => x !== k);
    };
    host.querySelectorAll("[data-ap]").forEach((b) => b.addEventListener("click", async () => {
      const li = b.closest("li");
      await decide(state.people.find((x) => x.email === li.dataset.email), li.dataset.subj, b.dataset.ap === "yes");
      renderAdmin(host);
    }));
    $("#approveall")?.addEventListener("click", async () => { for (const { p, k } of pending) await decide(p, k, true); renderAdmin(host); });

    $("#csv").addEventListener("click", () => {
      const head = ["Name", "Email", "Email 2", "Classes", "Subjects", "Done", "Total", "Percent"];
      const lines = state.people.map((p) => {
        const all = subjectSlugs(p.subjects), d = state.byEmail.get(p.email) || new Map(), n = [...all].filter((s) => d.has(s)).length;
        return [p.name, p.email, p.email2 || "", (p.classes || []).join(" "), p.subjects.join(" "), n, all.size, pct(n, all.size)].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
      a.download = "progress.csv"; a.click();
    });

    host.querySelectorAll("details.cls").forEach(toggleClass);
    host.querySelectorAll(".stu").forEach((tb) => tb.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const email = btn.closest("tr").dataset.email, p = state.people.find((x) => x.email === email);
      if (btn.dataset.act === "reset") {
        if (!confirm(`Recreate the login(s) for ${p.name} with the password on the list? They keep their progress.`)) return;
        const { error } = await sb.rpc("admin_reset_login", { target: email });
        alert(error ? "Could not reset: " + error.message : "Done. " + p.name + " can sign in with: " + p.password);
        if (!error) renderAdmin(host);
      } else if (btn.dataset.act === "del") {
        if (!confirm(`Delete ${p.name} (${email}) and all their progress? This cannot be undone.`)) return;
        const { error } = await sb.rpc("admin_delete_student", { target: email });
        if (error) alert(error.message); else renderAdmin(host);
      } else {
        const dlg = $("#dlg"), f = $("#f-edit");
        f.innerHTML = `<h3>Edit student</h3><p class="hint">${esc(email)}</p>
          <label>Name<input name="name" value="${esc(p.name)}" required></label>
          <label>Second email (optional)<input type="email" name="email2" value="${esc(p.email2 || "")}"></label>
          <label>Assigned password<input name="password" value="${esc(p.password)}" required minlength="8"></label>
          <p class="hint">Changing the password only affects new logins. Use Reset login to apply it to a student who already has one.</p>
          <p class="hint">Classes</p><div class="chks">${classBoxes(p.classes || [])}</div>
          <p class="hint">Subjects (a class adds its own subject automatically)</p><div class="chks">${subjectBoxes(p.subjects)}</div>
          <p class="hint">To change the main email address, delete the student and add them again. A second email gets its own login with the same password.</p>
          <div class="row"><button class="btn" value="save">Save</button><button class="btn ghost" value="cancel" formnovalidate>Cancel</button></div>`;
        dlg.showModal();
        f.onsubmit = async (ev) => {
          if (ev.submitter?.value !== "save") return;
          const classes = [...f.querySelectorAll("[name=cls]:checked")].map((c) => c.value);
          const subjects = union([...f.querySelectorAll("[name=subj]:checked")].map((c) => c.value), classSubjects(classes));
          const e2 = f.elements.email2.value.trim().toLowerCase();
          if (e2 && !EMAIL_RE.test(e2)) return alert("Second email is not valid.");
          const { error } = await sb.from("profiles").update({ name: f.elements.name.value.trim(), subjects, classes, password: f.elements.password.value.trim() }).eq("email", email);
          if (error) return alert(error.message);
          if (e2 !== (p.email2 || "")) {
            const { error: e3 } = await sb.rpc("admin_set_email2", { target: email, new_email2: e2 });
            if (e3) alert("Saved, but the second email failed: " + e3.message);
          }
          renderAdmin(host);
        };
      }
    }));
  }

  // ---------- boot ----------
  async function boot() {
    catalog = catalog || (await S.catalog());
    const me = await S.whoami(true);
    if (me) {
      const next = sessionStorage.getItem("site.next");
      if (next) { sessionStorage.removeItem("site.next"); if (next.startsWith(S.base)) { location.href = next; return; } }
    }
    if (!me) {
      if (await S.session()) {
        root.innerHTML = `<div class="placeholder"><h2>Not on the class list</h2><p>You are signed in, but this email has not been added by your teacher.</p>
          <p><button class="btn ghost" id="signout">Sign out</button></p></div>`;
        return wireAccount();
      }
      return viewSignedOut();
    }
    const done = await S.loadProgress();
    const [head, body] = viewDashboard(me, done).split("<!--split-->");
    if (me.is_admin) {
      adminMe = body;
      root.innerHTML = head + `<div id="admin"></div>`;
      renderAdmin($("#admin"));
    } else {
      root.innerHTML = head + body;
      wireAccount();
    }
  }

  boot();
})();
