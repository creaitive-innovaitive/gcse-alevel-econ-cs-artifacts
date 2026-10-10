Lib.order($("#o1"), { prompt: "Put the steps in order.", items: [
  "The user enters a URL into the browser.",
  "The browser sends the domain name to a DNS server.",
  "The IP address is returned to the browser.",
  "The browser requests the page from the web server.",
  "The web server sends the HTML files back.",
  "The browser renders the page.",
] });
Lib.classify($("#cl1"), {
  prompt: "Which device carries out each action?",
  buckets: [{ label: "Browser" }, { label: "DNS server" }, { label: "Web server" }],
  items: [
    { text: "Sends the domain name", b: 0 }, { text: "Renders the HTML", b: 0 },
    { text: "Looks up the IP address", b: 1 }, { text: "Passes the request on to another DNS server", b: 1 },
    { text: "Stores the website files", b: 2 }, { text: "Sends the HTML back", b: 2 },
  ],
  done: "Browser asks, DNS server looks up, web server sends.",
});
Lib.quiz($("#qz1"), { qs: [
  { q: "What does a DNS server send back to the browser?", opts: ["The web page", "An IP address", "A cookie", "The HTML files"], a: 1, why: "It translates the domain name into an IP address." },
  { q: "Which device sends the HTML files?", opts: ["Browser", "DNS server", "Web server", "Router"], a: 2, why: "The web server stores the website and sends it when asked." },
  { q: "If no DNS server has a record for a domain name, the browser shows", opts: ["the page", "an error such as server not found", "a cookie", "nothing"], a: 1, why: "Without an IP address the browser cannot contact a web server." },
] });
const FAILS = [
  ["Domain name mistyped", 1, "No DNS server has a record, so no IP address is returned. The browser shows an error such as \"server not found\"."],
  ["Web server is down", 3, "The browser has the IP address but the web server does not answer, so it shows a timeout or an error such as \"server unavailable\"."],
  ["Page file does not exist", 4, "The web server answers but has no such page, so it sends back an error page (for example 404 not found)."],
  ["Everything works", -1, "Every step succeeds: the browser renders the page."],
];
const STEPS = ["Browser", "DNS server", "IP returned", "Web server", "HTML sent", "Render"];
function showFail(k) {
  const f = FAILS[k];
  $("#v1").textContent = f[2];
  let o = "";
  STEPS.forEach((s, i) => { const x = 10 + i * 113, bad = i === f[1], ok = f[1] < 0 || i < f[1];
    o += SV.rect(x, 30, 100, 60, bad ? "f2" : ok ? "f3" : "cell", { rx: 10, style: "stroke:var(--line);stroke-width:2" }) + SV.text(x + 50, 65, s, "lbl bd", { "text-anchor": "middle" }); });
  $("#lab1").innerHTML = o;
  $$("#fails button").forEach((b, j) => b.classList.toggle("pri", j === k));
}
FAILS.forEach((f, k) => { const b = document.createElement("button"); b.className = "b"; b.textContent = f[0]; b.onclick = () => showFail(k); $("#fails").appendChild(b); });
showFail(0);
Lib.cards($("#fc1"), { cards: [
  ["URL", "Uniform Resource Locator: the full address of a web page."],
  ["Domain name", "The human-friendly name of a website's host, such as www.school-shoes.com."],
  ["DNS", "Domain Name System: translates a domain name into an IP address."],
  ["IP address", "A unique number that identifies a device on a network."],
  ["Web server", "A computer that stores a website and sends its pages on request."],
  ["HTML", "The code that describes the structure and content of a web page."],
  ["Browser", "Software that requests web pages and renders HTML."],
  ["Cache", "A stored copy of data, so a repeat request can be answered faster."],
] });
