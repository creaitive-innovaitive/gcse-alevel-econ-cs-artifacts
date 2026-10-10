Lib.stepper($("#stA"), {
  w: 760, h: 300, label: "A DNS request passed from DNS server 1 to DNS server 2 and back", base: { a: 0, b: 0, c: 0, d: 0 },
  draw: (s) => {
    const box = (x, y, t1, t2, cls) => SV.rect(x, y, 150, 74, cls, { rx: 12, style: "stroke:var(--line);stroke-width:2" }) + SV.text(x + 75, y + 32, t1, "lbl bd", { "text-anchor": "middle" }) + SV.text(x + 75, y + 54, t2, "sm", { "text-anchor": "middle" });
    const msg = (x1, x2, y, t, op) => op ? SV.line(x1, y, x2, y, "c1", { opacity: op }) + SV.arrowHead(x2, y, x2 > x1 ? "r" : "l", "dot1") + SV.text((x1 + x2) / 2, y - 8, t, "sm", { "text-anchor": "middle", opacity: op }) : "";
    let o = box(20, 110, "Computer", "browser", "f1") + box(305, 110, "DNS server 1", "no record yet", "f4") + box(590, 110, "DNS server 2", "has the record", "f3");
    o += msg(172, 303, 135, "1 domain name", s.a) + msg(457, 588, 135, "2 passes it on", s.b) + msg(588, 457, 165, "3 IP address", s.c) + msg(303, 172, 195, "4 IP address (stored by DNS 1)", s.d);
    return o;
  },
  steps: [
    { cap: "A computer wants <b>www.school-shoes.com</b>. It needs an IP address.", s: {} },
    { cap: "The computer sends the <b>domain name</b> to DNS server 1. It has no record, so it <b>passes the request on</b> to DNS server 2.", s: { a: 1, b: 1 } },
    { cap: "DNS server 2 has the record and returns the <b>IP address</b> to DNS server 1.", s: { a: 1, b: 1, c: 1 } },
    { cap: "DNS server 1 <b>stores</b> the record and sends the <b>IP address</b> to the computer, which can now contact the web server.", s: { a: 1, b: 1, c: 1, d: 1 } },
  ],
});
const DNSP = {
  hit: [[0, 1], "DNS server 1 already has the record, so it returns the IP address straight away. This is quick."],
  miss: [[0, 1, 2], "DNS server 1 has no record, so it asks DNS server 2. The IP address comes back and DNS server 1 stores it for next time."],
  none: [[0, 1, 2], "No DNS server has a record. An error such as \"server not found\" is shown and the page cannot be loaded."],
};
function showDNS(k) {
  const d = DNSP[k]; $("#v1").textContent = d[1];
  const names = ["Computer", "DNS server 1", "DNS server 2"];
  let o = ""; names.forEach((n, i) => { const x = 30 + i * 230, used = d[0].includes(i); o += SV.rect(x, 70, 170, 80, used ? "f1" : "cell", { rx: 12, style: "stroke:var(--line);stroke-width:2" }) + SV.text(x + 85, 116, n, "lbl bd", { "text-anchor": "middle" }); if (i) o += SV.line(x - 60, 110, x, 110, d[0].includes(i) ? "c1" : "gr"); });
  o += SV.text(350, 190, k === "none" ? "Result: error" : "Result: IP address returned", "lbl bd " + (k === "none" ? "t2" : "t3"), { "text-anchor": "middle" });
  $("#lab1").innerHTML = o; $$("[data-k]").forEach((b) => b.classList.toggle("pri", b.dataset.k === k));
}
$$("[data-k]").forEach((b) => (b.onclick = () => showDNS(b.dataset.k)));
showDNS("hit");
Lib.order($("#o1"), { prompt: "Put the DNS steps in order.", items: [
  "The browser sends the domain name to a DNS server.",
  "The DNS server looks for the domain name in its database.",
  "If there is no record, it passes the request to another DNS server.",
  "The IP address is returned to the browser.",
  "The browser contacts the web server at that IP address.",
] });
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["DNS", "Translates a domain name into an IP address"],
  ["Domain name", "The human-friendly name of a website"],
  ["IP address", "A unique number identifying a device on a network"],
  ["Web server", "Stores a website's files and sends them on request"],
  ["Cache", "A stored copy kept so a repeat request is answered faster"],
] });
Lib.cards($("#fc1"), { cards: [
  ["DNS", "Domain Name System: translates a domain name into an IP address."],
  ["Domain name", "The human-friendly name of a website's host."],
  ["IP address", "A unique number that identifies a device on a network."],
  ["DNS server", "A computer that stores domain names and their IP addresses."],
  ["Web server", "A computer that stores a website and sends pages on request."],
  ["Cache", "A stored copy kept so the next request can be answered faster."],
] });
