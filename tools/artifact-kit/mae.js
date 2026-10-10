// uses: econ
const OBJECTIVES = [
{
  id:"growth", label:"Growth", color:"var(--growth)", short:"Economic Growth",
  title:"Economic Growth",
  def:"An increase in the value of goods and services produced in an economy over time, usually measured as the % change in real GDP. Governments want growth that is steady and sustainable, not a short boom followed by a crash.",
  keywords:[
    ["Real GDP","The total value of output produced in the UK in a year, adjusted for inflation so it reflects a genuine change in the amount produced, not just higher prices."],
    ["Economic (business) cycle","The pattern of boom, recession, slump (trough) and recovery that real GDP follows over time in the UK economy."],
    ["Recession","A period when real GDP falls for two consecutive quarters (six months) &mdash; the UK entered recessions in 2008&ndash;09 and briefly in 2020."],
    ["Trend growth rate","The average sustainable rate of growth the UK economy can achieve over the long run without triggering excessive inflation, historically around 2&ndash;2.5% a year."],
    ["Output gap","The difference between actual GDP and potential (trend) GDP &mdash; a negative gap means spare capacity, a positive gap means the economy is overheating."]
  ],
  chart:"growth",
  questions:[
    {q:"Define economic growth. [2]", meta:"Similar to CIE 0455 Paper 2", a:"An increase in the value of goods and services produced by an economy [1] over a period of time, usually measured by the % change in real GDP [1]."},
    {q:"Using Fig. 1 (a diagram showing real GDP over ten years), identify the year in which the UK economy was in recession. [2]", meta:"Data-response style", a:"The year(s) where two consecutive quarters show falling real GDP [1] &mdash; identify from the trend shown, e.g. a clear dip below the previous year's level sustained over the period [1]."},
    {q:"Explain two causes of economic growth in an economy such as the UK. [4]", a:"<strong>Cause 1:</strong> Rising consumer spending (C) increases aggregate demand, encouraging firms to raise output [1] leading to higher real GDP [1]. <strong>Cause 2:</strong> Increased investment or improved productivity/technology raises the economy's productive capacity [1], shifting AS outward and allowing sustained growth [1]."},
    {q:"Discuss whether economic growth always benefits everyone in an economy. [8]", a:"Benefits: higher incomes, more jobs, higher tax revenue for public services, rising living standards. Costs: growth can be unevenly distributed (widening inequality), can cause negative externalities (pollution, congestion), and rapid growth risks demand-pull inflation. A balanced answer weighs distribution and environmental cost against the benefits, and may conclude growth needs to be 'inclusive' and 'sustainable' to benefit everyone."}
  ],
  conflicts:[["Inflation","Growing too fast, beyond the trend rate, pulls demand ahead of supply and causes demand-pull inflation &mdash; the economy 'overheats'."],
    ["Balance of payments","Higher UK incomes raise spending on imports (which have a high income elasticity of demand), worsening the current account."],
    ["Environment","More output generally means more resource use and carbon emissions, unless growth is decoupled from environmental damage."]],
  facts:["The UK measures GDP every quarter via the ONS &mdash; the 'flash estimate' is published before all the data is even in, so early figures get revised later.",
  "In 2020, UK real GDP fell by around 11% in a single year because of the pandemic &mdash; the sharpest annual fall in over 300 years of records.",
  "Economists distinguish growth (more stuff produced) from development (better living standards, health, education) &mdash; a country can grow without developing."]
},
{
  id:"unemployment", label:"Unemployment", color:"var(--unemp)", short:"Low Unemployment",
  title:"Low Unemployment",
  def:"The government aims to keep the number of people who are willing and able to work, but cannot find a job, as low as possible. Unemployment is measured by the claimant count and the Labour Force Survey (ILO measure).",
  keywords:[
    ["Unemployment rate","The percentage of the UK labour force who are unemployed (willing and able to work but without a job)."],
    ["Claimant count","The number of people in the UK claiming unemployment-related benefits (Jobseeker's Allowance / Universal Credit)."],
    ["Labour Force Survey","A quarterly survey using the ILO definition, widely seen as the more accurate UK unemployment measure than the claimant count."],
    ["Full employment","Not literally 0% unemployment &mdash; it means everyone who wants a job at the going wage rate can find one, allowing for some frictional unemployment."],
    ["Cyclical unemployment","Unemployment caused by a fall in aggregate demand during a downturn in the economic cycle &mdash; rises sharply in a UK recession."],
    ["Structural unemployment","Unemployment caused by a mismatch of skills or location, often from the decline of an industry, e.g. UK coal mining and steel towns."]
  ],
  chart:"unemployment",
  questions:[
    {q:"Define full employment. [2]", a:"A situation where everyone who is willing and able to work at the current wage rate can find a job [1], though some frictional unemployment will still exist [1]."},
    {q:"Identify two types of unemployment other than cyclical unemployment. [2]", a:"Any two of: structural, frictional, seasonal, technological unemployment [1 mark each, max 2]."},
    {q:"Explain how a rise in unemployment might affect government finances. [4]", a:"Unemployed workers pay less income tax and NI, reducing government revenue [1] because fewer people are earning wages [1]. At the same time the government pays more in benefits (Universal Credit/JSA) [1], increasing government spending, which together worsens the budget position [1]."},
    {q:"Discuss the policies a government could use to reduce structural unemployment. [8]", a:"Retraining schemes and apprenticeships improve worker skills to match available jobs; regional policy (grants, infrastructure) attracts firms to areas of high unemployment; improved information on job vacancies reduces mismatch. Evaluation: retraining takes time and money, and firms may not relocate if costs elsewhere are lower &mdash; so supply-side policy is slow-acting compared with demand-side fixes for cyclical unemployment."}
  ],
  conflicts:[["Inflation","Very low unemployment can push wages up as firms compete for scarce workers, feeding into cost-push/wage-price inflation."],
    ["Growth","Reducing unemployment via demand-side stimulus can be inflationary if it pushes the economy past full capacity."]],
  facts:["The UK claimant count and the Labour Force Survey unemployment rate can move in different directions in the same month &mdash; always check which measure a question is using.",
  "Youth unemployment (16&ndash;24) in the UK is consistently roughly double the overall rate, partly due to a lack of experience and frictional job search."]
},
{
  id:"inflation", label:"Inflation", color:"var(--inflation)", short:"Low & Stable Inflation",
  title:"Low and Stable Inflation",
  def:"The government's inflation target, set for the Bank of England, is 2% as measured by the Consumer Prices Index (CPI). The aim is price stability &mdash; not zero inflation, and definitely not deflation.",
  keywords:[
    ["CPI (Consumer Prices Index)","The main UK measure of inflation, tracking the price of a fixed 'basket' of goods and services bought by a typical household."],
    ["Inflation target","The Bank of England's remit from the Treasury: keep CPI inflation at 2% &plusmn; 1%; if it moves outside this the Governor must write an open letter explaining why."],
    ["Bank Rate","The Bank of England's main interest rate, set by the Monetary Policy Committee (MPC) to control inflation &mdash; raising it cools demand."],
    ["Demand-pull inflation","Inflation caused by aggregate demand rising faster than aggregate supply, e.g. from a consumer spending boom."],
    ["Cost-push inflation","Inflation caused by rising costs of production (wages, energy, imported raw materials) being passed on as higher prices."],
    ["Deflation","A sustained fall in the general price level &mdash; seen as harmful because it can delay spending and increase the real burden of debt."]
  ],
  chart:"inflation",
  questions:[
    {q:"Define inflation. [2]", a:"A sustained rise in the general (average) level of prices in an economy [1], usually measured by the % change in CPI over a year [1]."},
    {q:"State the UK government's inflation target. [1]", a:"2% CPI inflation [1]."},
    {q:"Explain one cause of cost-push inflation. [3]", a:"A rise in the price of imported raw materials, such as oil, raises firms' costs of production [1]. Firms pass these higher costs on to consumers as higher prices to protect their profit margins [1], causing the general price level to rise [1]."},
    {q:"Discuss the possible consequences of high inflation for an economy such as the UK. [8]", a:"Consequences: erodes the real value of savings and fixed incomes (pensioners hit hardest); reduces international competitiveness of UK exports if wages/prices rise faster than trading partners; creates uncertainty, discouraging investment; menu and shoe-leather costs. Some argue mild inflation encourages spending over saving. A good answer evaluates who is worst affected and links to policy (interest rate rises) and its own trade-off with growth/unemployment."}
  ],
  conflicts:[["Unemployment","The Phillips Curve trade-off: policies to cut inflation (raising interest rates) reduce spending and can raise cyclical unemployment."],
    ["Growth","Raising interest rates to control inflation slows consumer spending and investment, which can also slow economic growth."]],
  facts:["The 2% target isn't arbitrary &mdash; most independent central banks target somewhere between 1&ndash;3%, low enough to protect savers but high enough to avoid the dangers of deflation.",
  "In 2022, UK CPI inflation hit over 11%, its highest in more than 40 years, driven heavily by energy prices after Russia's invasion of Ukraine &mdash; a classic cost-push shock."]
},
{
  id:"bop", label:"Balance of Payments", color:"var(--bop)", short:"Balance of Payments Equilibrium",
  title:"Balance of Payments Equilibrium",
  def:"A record of all financial transactions between the UK and the rest of the world. Governments aim for broad equilibrium on the current account &mdash; avoiding a large, persistent deficit (importing far more than exporting) or surplus.",
  keywords:[
    ["Current account","The part of the balance of payments recording trade in goods and services, plus income flows and transfers between the UK and abroad."],
    ["Trade deficit","When the value of a country's imports of goods and services exceeds the value of its exports &mdash; a long-standing feature of the UK economy."],
    ["Exchange rate","The price of one currency (£) in terms of another &mdash; a weaker pound makes UK exports cheaper abroad and imports more expensive."],
    ["Competitiveness","The ability of UK firms to sell goods and services against foreign rivals, based on price and quality/non-price factors."],
    ["Protectionism","Government policies (tariffs, quotas) used to restrict imports and protect domestic industries &mdash; can improve the trade balance but risks retaliation."]
  ],
  chart:"bop",
  questions:[
    {q:"Define the balance of payments. [2]", a:"A record of all the financial transactions (payments and receipts) between a country and the rest of the world [1] over a given time period, usually a year [1]."},
    {q:"Identify two items that would appear as a credit on the UK's current account. [2]", a:"Any two of: exports of goods, exports of services, income received from overseas investments, transfers received from abroad [1 mark each]."},
    {q:"Explain how a fall in the value of the pound (£) might affect the UK's balance of payments. [4]", a:"A weaker pound makes UK exports relatively cheaper for foreign buyers [1], likely increasing export demand/volume [1]. It also makes imports more expensive for UK consumers [1], which may reduce import volumes, together improving the current account balance, assuming demand is price elastic [1]."},
    {q:"Discuss whether a persistent trade deficit is always a problem for the UK economy. [8]", a:"Problems: deficit must be financed by borrowing or selling assets, can signal weak competitiveness, and a rapid unwinding could destabilise the currency. Not always a problem: it can reflect strong consumer confidence and demand for imported investment goods that boost future productivity; deficits can persist for decades without crisis if financed by stable capital inflows (as in the UK). A strong answer weighs short-run versus long-run and the cause of the deficit."}
  ],
  conflicts:[["Growth","Strong UK growth raises household incomes, and since imports have a high income elasticity of demand, spending on imports rises, worsening the trade balance."],
    ["Inflation","Devaluing the pound to boost exports also raises the price of imported goods, feeding cost-push inflation."],
    ["Unemployment","Protecting the trade balance with tariffs can protect UK jobs in some industries but raises costs for firms that rely on imported inputs elsewhere."]],
  facts:["The UK has run a current account deficit almost every year since the 1980s, one of the most persistent deficits of any G7 economy, largely offset by strong flows of foreign investment income.",
  "The UK's biggest single export by far is financial and business services, not physical goods &mdash; this is often overlooked because 'trade' is usually pictured as ships and containers."]
},
{
  id:"distribution", label:"Fair Distribution", color:"var(--dist)", short:"Fair Distribution of Income",
  title:"Fair Distribution of Income",
  def:"Governments aim to reduce excessive inequality between the richest and poorest in society, so that economic growth and prosperity are shared reasonably fairly, not concentrated among a small group.",
  keywords:[
    ["Income inequality","The uneven way in which a country's total income is shared between individuals or households."],
    ["Gini coefficient","A single number between 0 (perfect equality) and 1 (perfect inequality) used to measure and compare income inequality between countries or over time."],
    ["Progressive tax","A tax where the proportion of income paid in tax rises as income rises, e.g. UK Income Tax, used to redistribute income."],
    ["Regressive tax","A tax that takes a larger proportion of income from lower earners than higher earners, e.g. VAT, which can worsen inequality."],
    ["Universal Credit","The UK's main means-tested welfare benefit, designed to top up the income of low-income and unemployed households."],
    ["Absolute vs relative poverty","Absolute poverty is not having enough income to meet basic needs; relative poverty means having significantly less income than the average person in society."]
  ],
  chart:"distribution",
  questions:[
    {q:"Define income inequality. [2]", a:"The extent to which income is unevenly distributed [1] between individuals or households in an economy [1]."},
    {q:"Identify two types of tax used by the UK government to redistribute income. [2]", a:"Any two of: income tax, inheritance tax, corporation tax, capital gains tax [1 mark each]."},
    {q:"Explain how progressive taxation can help to redistribute income. [4]", a:"A progressive tax takes a higher percentage of income from high earners than low earners [1], raising more revenue proportionally from the rich [1]. This revenue can then fund benefits and public services used disproportionately by lower-income households [1], reducing the gap between rich and poor [1]."},
    {q:"Discuss the view that reducing income inequality should be the government's most important macroeconomic objective. [8]", a:"For: extreme inequality can cause social unrest, reduce social mobility, and lower aggregate demand if poorer households (who spend a higher share of income) have less to spend. Against: excessive redistribution may reduce incentives to work or invest, potentially harming growth, and other objectives (like controlling inflation) directly affect everyone's living standards too. A good answer argues no single objective dominates &mdash; they are pursued together, with trade-offs."}
  ],
  conflicts:[["Growth","High taxes used to redistribute income can reduce the incentive to work, save or invest, potentially slowing overall economic growth (the equity&ndash;efficiency trade-off)."],
    ["Unemployment","Generous out-of-work benefits, while reducing poverty, can in theory create a disincentive to seek work, known as the unemployment trap."]],
  facts:["The UK's Gini coefficient is one of the highest among large European economies, though it has been broadly stable, not rising sharply, over the past 20 years.",
  "'Redistribution of income' isn't officially one of the Bank of England's jobs &mdash; it's mainly delivered through fiscal policy (tax and benefits set by the Treasury), which is why this objective is politically the most contested of the six."]
},
{
  id:"environment", label:"Environment", color:"var(--env)", short:"Environmental Protection",
  title:"Protection of the Environment",
  def:"The aim of achieving economic growth and development in a way that does not cause unacceptable damage to the environment, balancing current living standards against the needs of future generations (sustainable development).",
  keywords:[
    ["Sustainable development","Development that meets the needs of the present without compromising the ability of future generations to meet their own needs."],
    ["Negative externality","A cost of production or consumption (e.g. pollution) that falls on a third party not involved in the transaction, and is not reflected in the market price."],
    ["Carbon tax / emissions pricing","A tax placed on carbon emissions (e.g. UK Emissions Trading Scheme) designed to make polluters pay the true social cost of their output."],
    ["Renewable energy","Energy from sources that are naturally replenished, such as wind and solar &mdash; a growing share of UK electricity generation."],
    ["Net zero","The UK's legally binding target to reduce greenhouse gas emissions to net zero by 2050."]
  ],
  chart:"environment",
  questions:[
    {q:"Define a negative externality. [2]", a:"A cost of an economic activity [1] that is suffered by a third party not directly involved in the transaction/production [1]."},
    {q:"Identify two policies a government could use to reduce pollution from firms. [2]", a:"Any two of: pollution taxes, tradeable pollution permits, regulation/legal limits, subsidies for clean technology [1 mark each]."},
    {q:"Explain how a carbon tax might reduce a negative production externality. [4]", a:"A carbon tax raises the cost of production for polluting firms [1], forcing them to internalise the external cost of emissions [1]. This raises their prices and/or reduces their output of the polluting good [1], reducing the quantity of pollution generated as the market moves closer to the socially optimal level of output [1]."},
    {q:"Discuss whether protecting the environment should take priority over economic growth. [8]", a:"For priority: environmental damage (climate change, resource depletion) is often irreversible and threatens long-run living standards and future growth itself. Against: strict environmental regulation can raise costs for UK firms, reducing competitiveness and jobs in the short run, especially versus countries with weaker rules. A strong answer notes the two aims can align through green growth/investment in renewables, so it isn't necessarily a straight trade-off."}
  ],
  conflicts:[["Growth","Many forms of economic growth rely on burning fossil fuels and consuming natural resources, directly conflicting with environmental targets, unless growth is 'green'."],
    ["Unemployment","Shutting down high-polluting industries (e.g. coal power) protects the environment but can cause structural unemployment in those regions."]],
  facts:["The UK was the first major economy to pass a legally binding net zero by 2050 target into law, in 2019.",
  "The UK has cut its carbon emissions by around 50% since 1990 while its economy has grown &mdash; a rare real-world example of at least partial decoupling of growth from emissions."]
}
];


const DATA = {
  growth:{unit:"% real GDP growth", years:[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], values:[2.4,2.2,2.4,1.7,1.6,-10.4,8.7,4.8,0.6,1.1], series:"UK real GDP growth"},
  unemployment:{unit:"% unemployment rate", years:[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], values:[5.4,4.9,4.4,4.1,3.8,4.6,4.5,3.7,4.0,4.3], series:"UK ILO unemployment rate"},
  inflation:{unit:"% CPI inflation", years:[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], values:[0.0,0.7,2.7,2.5,1.8,0.9,2.6,9.1,7.3,2.5], series:"UK CPI inflation", target:2},
  bop:{unit:"£bn current account balance", years:[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], values:[-98,-104,-77,-75,-58,-40,-46,-84,-21,-30], series:"UK current account balance"},
  distribution:{unit:"Gini coefficient (x100)", years:[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], values:[33,33,34,34,34,32,32,35,34,34], series:"UK income Gini coefficient"},
  environment:{unit:"MtCO2e greenhouse gas emissions", years:[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], values:[497,474,464,451,435,364,425,406,384,371], series:"UK territorial emissions"}
};


const strip = (s) => String(s).replace(/&mdash;/g, "-").replace(/&ndash;/g, "-");
/* Learn */
$("#learnBody").innerHTML = OBJECTIVES.map((o, i) => `<h2>${i + 1} · ${o.title}</h2><p>${o.def}</p>
  <div class="tw"><table class="t"><tr><th>Key word</th><th>Meaning in a UK context</th></tr>${o.keywords.map((k) => `<tr><td><b>${k[0]}</b></td><td>${k[1]}</td></tr>`).join("")}</table></div>
  ${o.conflicts.map((c) => `<div class="tip"><b class="h">Conflicts with ${c[0]}</b>${c[1]}</div>`).join("")}`).join("");
/* Watch: chain reaction */
Lib.stepper($("#stA"), {
  w: 760, h: 340, label: "A rise in demand improves growth and unemployment but worsens inflation and the current account", base: { a: 0, b: 0, c: 0, d: 0 },
  draw: (s) => {
    const box = (x, y, t1, t2, cls, op) => op ? SV.rect(x, y, 200, 80, cls, { rx: 12, opacity: op, style: "stroke:var(--line);stroke-width:2" }) + SV.text(x + 100, y + 36, t1, "lbl bd", { "text-anchor": "middle", opacity: op }) + SV.text(x + 100, y + 58, t2, "sm", { "text-anchor": "middle", opacity: op }) : "";
    let o = box(280, 20, "Government boosts demand", "tax cuts or spending", "f1", 1);
    o += box(30, 150, "Growth rises", "aim met", "f3", s.a) + box(280, 150, "Unemployment falls", "aim met", "f3", s.b) + box(530, 150, "Inflation rises", "aim at risk", "f2", s.c);
    o += box(280, 255, "Imports rise", "current account worsens", "f2", s.d);
    return o;
  },
  steps: [
    { cap: "The government cuts taxes or raises spending to <b>boost aggregate demand</b>.", s: {} },
    { cap: "Spending rises, firms produce more: <b>economic growth</b> improves.", s: { a: 1 } },
    { cap: "Firms hire more workers, so <b>unemployment falls</b>.", s: { a: 1, b: 1 } },
    { cap: "But demand may outrun supply, and prices rise: <b>demand-pull inflation</b>.", s: { a: 1, b: 1, c: 1 } },
    { cap: "Higher incomes also raise spending on <b>imports</b>, which worsens the <b>balance of payments</b>. Two aims met, two put at risk.", s: { a: 1, b: 1, c: 1, d: 1 } },
  ],
});
/* Explore */
function drawAim(id) {
  const o = OBJECTIVES.find((x) => x.id === id), d = DATA[id], W = 680, H = 280, pl = 46, pr = 16, pt = 16, pb = 30;
  const min = Math.min(0, ...d.values), max = Math.max(...d.values), rg = (max - min) || 1;
  const X = (i) => pl + (i / (d.years.length - 1)) * (W - pl - pr), Y = (v) => pt + (H - pt - pb) - ((v - min) / rg) * (H - pt - pb);
  let s = "";
  for (let k = 0; k <= 4; k++) { const v = min + (rg / 4) * k; s += SV.line(pl, Y(v), W - pr, Y(v), "gr") + SV.text(pl - 8, Y(v) + 4, v.toFixed(1), "sm", { "text-anchor": "end" }); }
  d.years.forEach((yr, i) => { if (i % 2 === 0 || i === d.years.length - 1) s += SV.text(X(i), H - 8, yr, "sm", { "text-anchor": "middle" }); });
  s += SV.line(pl, Y(0), W - pr, Y(0), "ax", { style: "stroke-width:1.4" });
  s += SV.path("M" + d.values.map((v, i) => X(i) + "," + Y(v)).join(" L"), "c1");
  if (d.target !== undefined) s += SV.line(pl, Y(d.target), W - pr, Y(d.target), "dash", { style: "stroke:var(--accent);stroke-width:1.5" }) + SV.text(W - pr, Y(d.target) - 4, "2% target", "sm", { "text-anchor": "end" });
  d.values.forEach((v, i) => { s += SV.circle(X(i), Y(v), 3.5, "dot1") + `<title>${d.years[i]}: ${v}</title>`; });
  $("#chart").innerHTML = s;
  $("#cap").textContent = `${d.series}, ${d.years[0]}-${d.years[d.years.length - 1]} (illustrative UK figures, ${d.unit}).`;
  $("#conf").innerHTML = `<h3>${o.title}: where it conflicts with other aims</h3>` + o.conflicts.map((c) => `<div class="tip"><b class="h">vs ${c[0]}</b>${c[1]}</div>`).join("");
  $$("#pills button").forEach((b) => b.classList.toggle("pri", b.dataset.id === id));
}
OBJECTIVES.forEach((o) => { const b = document.createElement("button"); b.className = "b"; b.textContent = o.label; b.dataset.id = o.id; b.onclick = () => drawAim(o.id); $("#pills").appendChild(b); });
drawAim(OBJECTIVES[0].id);
/* Real world and Exam */
$("#facts").innerHTML = OBJECTIVES.map((o) => o.facts.map((f) => `<div class="rw"><h3>${o.title}</h3><p>${f}</p></div>`).join("")).join("");
$("#exq").innerHTML = OBJECTIVES.map((o) => `<h3>${o.title}</h3>` + o.questions.map((q) => `<details class="eq"><summary>${q.q}${q.meta ? ` <span class="cmd">${q.meta}</span>` : ""}</summary><div class="body"><div class="ans"><b>Model answer and mark guide:</b> ${q.a}</div></div></details>`).join("")).join("");
/* Practise */
Lib.classify($("#cl1"), {
  prompt: "Which aim does each statement describe?",
  buckets: OBJECTIVES.map((o) => ({ label: o.label })),
  items: [
    { text: "Real GDP rising over time", b: 0 }, { text: "Recession: two quarters of falling output", b: 0 },
    { text: "People who are able and willing to work but cannot find a job", b: 1 }, { text: "The ILO unemployment rate", b: 1 },
    { text: "Prices rising, CPI above the 2% target", b: 2 }, { text: "Demand-pull inflation", b: 2 },
    { text: "Imports greater than exports", b: 3 }, { text: "A current account deficit", b: 3 },
    { text: "The gap between rich and poor households", b: 4 }, { text: "The Gini coefficient", b: 4 },
    { text: "Carbon emissions and pollution", b: 5 }, { text: "Net zero by 2050", b: 5 },
  ],
  done: "Each aim has its own measure: real GDP, the unemployment rate, CPI, the current account, the Gini coefficient and emissions.",
});
const kws = OBJECTIVES.map((o) => o.keywords[0]);
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: kws.map((k) => [strip(k[0]), strip(k[1]).replace(/<[^>]+>/g, "")]) });
Lib.calc($("#c1"), { qs: [
  { q: "Real GDP was £2,000bn last year and £2,060bn this year. What is the growth rate (%)?", a: 3, unit: "%", hint: "(new − old) ÷ old × 100.", sol: "(2,060 − 2,000) ÷ 2,000 × 100 = 3%." },
  { q: "There are 34 million people in the labour force and 1.7 million are unemployed. What is the unemployment rate (%)?", a: 5, unit: "%", hint: "Unemployed ÷ labour force × 100.", sol: "1.7 ÷ 34 × 100 = 5%." },
  { q: "The price index rises from 100 to 107. What is the inflation rate (%)?", a: 7, unit: "%", sol: "(107 − 100) ÷ 100 × 100 = 7%." },
  { q: "Exports are £600bn and imports are £640bn. What is the trade balance (£bn)? Use a minus sign for a deficit.", a: -40, unit: "£bn", hint: "Exports − imports.", sol: "600 − 640 = −£40bn, a deficit." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "Which is one of the four main macroeconomic aims?", opts: ["Higher taxes", "Low unemployment", "More imports", "A bigger budget deficit"], a: 1, why: "The four are growth, low unemployment, stable prices and a balance of payments that is not in persistent deficit." },
  { q: "Rapid growth beyond the trend rate is most likely to cause", opts: ["lower prices", "demand-pull inflation", "a smaller current account deficit", "falling imports"], a: 1, why: "Demand outruns supply, so prices rise." },
  { q: "A recession is", opts: ["one quarter of falling GDP", "two consecutive quarters of falling real GDP", "inflation above 2%", "unemployment above 5%"], a: 1, why: "Two quarters (six months) of falling real GDP." },
  { q: "The Gini coefficient measures", opts: ["inflation", "inequality of income", "emissions", "the current account"], a: 1, why: "A higher value means a more unequal distribution of income." },
] });
const allCards = OBJECTIVES.flatMap((o) => o.keywords.map((k) => [strip(k[0]), strip(k[1]).replace(/<[^>]+>/g, "")]));
Lib.cards($("#fc1"), { cards: allCards });
