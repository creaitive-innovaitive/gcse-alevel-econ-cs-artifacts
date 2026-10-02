// Assessment page: ?a=<artifact slug>. Questions come from the database without answer keys;
// marking happens server-side, so answers are only revealed after the one allowed submission.
(function () {
  const S = window.Site;
  const root = document.getElementById("assess-root");
  const slug = new URLSearchParams(location.search).get("a") || "";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, el = root) => el.querySelector(sel);
  const draftKey = "site.draft." + slug;
  let catalog, quiz, me;

  const lessonUrl = () => S.base + "artifacts/" + slug + "/";
  const loadDraft = () => { try { return JSON.parse(localStorage.getItem(draftKey) || "{}"); } catch (e) { return {}; } };
  const saveDraft = (d) => { try { localStorage.setItem(draftKey, JSON.stringify(d)); } catch (e) {} };

  const code = (q) => (q.code ? `<pre class="code">${esc(q.code)}</pre>` : "");
  const ICONS = {
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    no: '<path d="M7 7l10 10M17 7L7 17" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
    part: '<path d="M6 12h12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  };
  const icon = (k) => `<svg class="ico ${k}" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="12"/>${ICONS[k]}</svg>`;

  function field(q, val) {
    if (q.type === "mcq") {
      return `<div class="opts">${q.opts.map((o, i) => `<label class="opt"><input type="radio" name="${q.id}" value="${i}" ${String(val) === String(i) ? "checked" : ""}> <span>${esc(o)}</span></label>`).join("")}</div>`;
    }
    if (q.type === "num") return `<input class="ans" name="${q.id}" inputmode="decimal" autocomplete="off" value="${esc(val || "")}" placeholder="${esc(q.hint || "Enter a number.")}">`;
    return `<input class="ans" name="${q.id}" autocomplete="off" value="${esc(val || "")}" placeholder="${esc(q.hint || "A key term or short phrase.")}">`;
  }

  function viewForm(preview) {
    const draft = loadDraft();
    const total = quiz.questions.reduce((t, q) => t + q.marks, 0);
    root.innerHTML = `<section class="card block"><h3>${esc(quiz.title)}</h3>
      <p class="hint">${quiz.questions.length} questions, ${total} marks. Pass mark ${quiz.pass}%. Type key terms and numbers, or pick the best option. You have <b>one attempt</b>: after you submit, answers are locked and you see your score, the model answers and feedback. Spelling does not need to be perfect, but use the key terms.</p>
      ${preview ? '<p class="msg err">You are signed in as a teacher, so you can read the questions but not submit.</p>' : ""}
      <p><a class="lnk" href="${lessonUrl()}">Open the lesson</a> if you want to revise first.</p></section>
      <form id="qf">${quiz.questions.map((q, i) => `<section class="card block q"><div class="row"><b>Question ${i + 1}</b><span class="hint">${q.marks} mark${q.marks === 1 ? "" : "s"}</span></div>
        <p class="qtext">${esc(q.q)}</p>${code(q)}${field(q, draft[q.id])}</section>`).join("")}
        <section class="card block"><p class="hint" id="left"></p><p class="msg err" hidden></p><button class="btn" type="submit" ${preview ? "disabled" : ""}>Submit answers</button></section></form>`;
    const f = $("#qf"), left = $("#left");
    const read = () => Object.fromEntries(quiz.questions.map((q) => {
      const el = f.elements[q.id];
      return [q.id, q.type === "mcq" ? (f.querySelector(`[name=${q.id}]:checked`)?.value ?? "") : (el.value || "").trim()];
    }));
    const upd = () => {
      const a = read(), n = Object.values(a).filter((v) => v !== "").length;
      left.textContent = `${n} of ${quiz.questions.length} answered. Answers are kept on this device until you submit.`;
      saveDraft(a);
    };
    f.addEventListener("input", upd); upd();
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const a = read(), blank = Object.values(a).filter((v) => v === "").length;
      const ok = confirm(`${blank ? blank + " question(s) are blank. " : ""}Submit now? You cannot change your answers afterwards.`);
      if (!ok) return;
      const btn = f.querySelector("button[type=submit]"), m = $(".msg", f);
      btn.disabled = true;
      const { data, error } = await S.sb.rpc("submit_assessment", { _slug: slug, _answers: a });
      if (error) { btn.disabled = false; m.textContent = error.message; m.hidden = false; return; }
      try { localStorage.removeItem(draftKey); } catch (e2) {}
      S.me && sessionStorage.removeItem("site.me");
      viewResult({ score: data.score, max: data.max, pct: data.pct, result: data.result }, true);
      window.scrollTo(0, 0);
    });
  }

  function advice(items, pct) {
    const miss = {};
    items.filter((i) => i.got < i.max && i.topic).forEach((i) => { miss[i.topic] = (miss[i.topic] || 0) + 1; });
    const topics = Object.keys(miss);
    const band = pct >= quiz.pass ? "You have met the pass mark and this lesson now counts as complete."
      : pct >= 50 ? `You are ${quiz.pass - pct} percentage points from the pass mark. Revise the topics below, then ask your teacher to reset the assessment for another try.`
      : "This topic needs more work. Go back through the lesson, especially the worked examples, then ask your teacher to reset the assessment.";
    return `<p>${band}</p>${topics.length ? `<p><b>To improve next time, focus on:</b> ${topics.map((t) => `<span class="pill soft">${esc(t)}</span>`).join(" ")}</p>` : '<p>Nothing to fix. Full marks.</p>'}`;
  }

  function viewResult(att, fresh) {
    const items = att.result.items, pass = att.pct >= quiz.pass;
    root.innerHTML = `<section class="card block result ${pass ? "pass" : "fail"}">
        <div class="row"><h3>${esc(quiz.title)}</h3><span class="big">${att.pct}%</span></div>
        <p><b>${att.score} / ${att.max} marks.</b> Pass mark ${quiz.pass}%. ${pass ? "Passed." : "Not yet passed."}${fresh ? "" : ` <span class="hint">Submitted ${att.at ? new Date(att.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}.</span>`}</p>
        ${advice(items, att.pct)}
        <p><a class="btn ghost" href="${lessonUrl()}">Back to the lesson</a> <a class="btn ghost" href="${S.profileUrl}">My profile</a>
          ${pass && !(me.is_admin || me.is_teacher) ? ' <button class="btn" id="retake">Retake for practice</button>' : ""}</p>
        ${!pass && !(me.is_admin || me.is_teacher) ? (att.requested ? `<p class="hint">Retake requested on ${new Date(att.requested).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}. Your teacher will reset it when they have seen it.</p>` : '<p><button class="btn" id="reqretake">Request a retake</button></p>') : ""}
        ${pass ? '<p class="hint">Retaking is optional. Your pass stays on record and the lesson stays complete, whatever you score next time.</p>' : ""}</section>
      ${items.map((it, i) => {
        const full = it.got >= it.max, part = it.got > 0 && !full;
        return `<section class="card block q ${full ? "good" : part ? "part" : "bad"}"><div class="row"><b>Question ${i + 1}</b><span class="score">${icon(full ? "ok" : part ? "part" : "no")}<small>${it.got} / ${it.max}</small></span></div>
          <p class="qtext">${esc(it.q)}</p>${code(it)}
          <p><span class="hint">Your answer</span><br>${it.typed ? esc(it.typed) : "<i>No answer</i>"}</p>
          ${full ? "" : `<p><span class="hint">Model answer</span><br>${esc(it.model)}</p>`}
          <p class="fb">${esc(it.feedback)}</p></section>`;
      }).join("")}`;
    $("#reqretake")?.addEventListener("click", async (e) => {
      const { error } = await S.sb.rpc("request_retake", { _slug: slug });
      if (error) return alert(error.message);
      e.target.outerHTML = '<span class="hint">Retake requested. Your teacher has been notified.</span>';
    });
    $("#retake")?.addEventListener("click", async () => {
      if (!confirm("Start a fresh attempt? Your current result is kept in your history.")) return;
      const { error } = await S.sb.rpc("retake_assessment", { _slug: slug });
      if (error) return alert(error.message);
      try { localStorage.removeItem(draftKey); } catch (e) {}
      viewForm(false);
      window.scrollTo(0, 0);
    });
  }

  async function boot() {
    if (!slug) { root.innerHTML = `<p class="msg err">No lesson chosen.</p>`; return; }
    me = await S.whoami();
    if (!me) {
      try { sessionStorage.setItem("site.next", location.href); } catch (e) {}
      root.innerHTML = `<section class="card block"><h3>Sign in to take the assessment</h3><p><a class="btn" href="${S.profileUrl}">Sign in</a></p></section>`;
      return;
    }
    const { data, error } = await S.sb.rpc("get_assessment", { _slug: slug });
    if (error || !data) { root.innerHTML = `<p class="msg err">${error ? esc(error.message) : "There is no assessment for this lesson yet."}</p>`; return; }
    quiz = data;
    if (data.attempt) viewResult(data.attempt, false);
    else viewForm(!!(me.is_admin || me.is_teacher));
  }
  boot();
})();
