"""Course structure and artifact placement. Edit this file, run build.py, push."""

SITE_TITLE = "Econ & CS Artifacts"
SITE_TAGLINE = "Interactive lessons, walkthroughs and revision activities for GCSE and A-Level Economics and Computer Science."

# Each course: key -> metadata. 'levels' is used by A-Level courses (AS / A Level split).
# Chapters are dicts: id (url slug), label (shown on card), title, group (optional heading in grid).


def _ch(n, title, group=None):
    return {"id": f"ch-{n:02d}", "n": n, "label": str(n), "title": title, "group": group}


IG_CS = [
    _ch(1, "Data representation"),
    _ch(2, "Data transmission"),
    _ch(3, "Hardware"),
    _ch(4, "Software"),
    _ch(5, "The internet and its uses"),
    _ch(6, "Automated and emerging technologies"),
    _ch(7, "Algorithm design and problem solving"),
    _ch(8, "Programming"),
    _ch(9, "Databases"),
    _ch(10, "Boolean logic"),
]

IG_ECON_SECTIONS = [
    {
        "id": "section-1", "n": 1, "title": "The basic economic problem",
        "chapters": [
            _ch(1, "The nature of the economic problem"),
            _ch(2, "Factors of production"),
            _ch(3, "Opportunity cost"),
            _ch(4, "Production possibility curves"),
        ],
    },
    {
        "id": "section-2", "n": 2, "title": "The allocation of resources",
        "chapters": [
            _ch(5, "Microeconomics and macroeconomics"),
            _ch(6, "The role of markets in allocating resources"),
            _ch(7, "Demand"),
            _ch(8, "Supply"),
            _ch(9, "Price determination"),
            _ch(10, "Price changes"),
            _ch(11, "Price elasticity of demand"),
            _ch(12, "Price elasticity of supply"),
            _ch(13, "Market economic system"),
            _ch(14, "Market failure"),
            _ch(15, "Mixed economic system"),
        ],
    },
    {
        "id": "section-3", "n": 3, "title": "Microeconomic decision makers",
        "chapters": [
            _ch(16, "Money and banking"),
            _ch(17, "Households"),
            _ch(18, "Workers"),
            _ch(19, "Trade unions"),
            _ch(20, "Firms"),
            _ch(21, "Firms and production"),
            _ch(22, "Firms, costs, revenue and objectives"),
            _ch(23, "Market structure"),
        ],
    },
    {
        "id": "section-4", "n": 4, "title": "Government and the macroeconomy",
        "chapters": [
            _ch(24, "The role of government"),
            _ch(25, "The macroeconomic aims of government"),
            _ch(26, "Fiscal policy"),
            _ch(27, "Monetary policy"),
            _ch(28, "Supply-side policies"),
            _ch(29, "Economic growth"),
            _ch(30, "Employment and unemployment"),
            _ch(31, "Inflation and deflation"),
        ],
    },
    {
        "id": "section-5", "n": 5, "title": "Economic development",
        "chapters": [
            _ch(32, "Living standards"),
            _ch(33, "Poverty"),
            _ch(34, "Population"),
            _ch(35, "Differences in economic development between countries"),
        ],
    },
    {
        "id": "section-6", "n": 6, "title": "International trade and globalisation",
        "chapters": [
            _ch(36, "International specialisation"),
            _ch(37, "Free trade and protection"),
            _ch(38, "Foreign exchange rates"),
            _ch(39, "Current account of balance of payments"),
        ],
    },
]

A_CS_AS = [
    _ch(1, "Information representation and multimedia"),
    _ch(2, "Communication"),
    _ch(3, "Hardware"),
    _ch(4, "Processor fundamentals"),
    _ch(5, "System software"),
    _ch(6, "Security, privacy and data integrity"),
    _ch(7, "Ethics and ownership"),
    _ch(8, "Databases"),
    _ch(9, "Algorithm design and problem solving"),
    _ch(10, "Data types and structures"),
    _ch(11, "Programming"),
    _ch(12, "Software development"),
]

A_CS_A2 = [
    _ch(13, "Data representation"),
    _ch(14, "Communication and internet technologies"),
    _ch(15, "Hardware"),
    _ch(16, "System software and virtual machines"),
    _ch(17, "Security"),
    _ch(18, "Artificial intelligence (AI)"),
    _ch(19, "Computational thinking and problem solving"),
    _ch(20, "Further programming"),
]

_AE1 = "1 · Basic economic ideas and resource allocation"
_AE2 = "2 · The price system and the microeconomy"
_AE3 = "3 · Government microeconomic intervention"
_AE4 = "4 · The macroeconomy"
_AE5 = "5 · Government macroeconomic intervention"
_AE6 = "6 · International economic issues"
_AE7 = "7 · The price system and the microeconomy"
_AE8 = "8 · Government microeconomic intervention"
_AE9 = "9 · The macroeconomy"
_AE10 = "10 · Government macroeconomic intervention"
_AE11 = "11 · International economic issues"

A_ECON_AS = [
    _ch(1, "Scarcity, choice and opportunity cost", _AE1),
    _ch(2, "Economic methodology", _AE1),
    _ch(3, "Factors of production", _AE1),
    _ch(4, "Resource allocation in different economic systems", _AE1),
    _ch(5, "Production possibility curves", _AE1),
    _ch(6, "Classification of goods and services", _AE1),
    _ch(7, "Demand and supply curves", _AE2),
    _ch(8, "Price elasticity, income elasticity and cross elasticity of demand", _AE2),
    _ch(9, "Price elasticity of supply", _AE2),
    _ch(10, "The interaction of demand and supply", _AE2),
    _ch(11, "Consumer and producer surplus", _AE2),
    _ch(12, "Reasons for government intervention in markets", _AE3),
    _ch(13, "Methods and effects of government intervention in markets", _AE3),
    _ch(14, "Addressing income and wealth inequality", _AE3),
    _ch(15, "National income statistics", _AE4),
    _ch(16, "Introduction to the circular flow of income", _AE4),
    _ch(17, "Aggregate demand and aggregate supply analysis", _AE4),
    _ch(18, "Economic growth", _AE4),
    _ch(19, "Unemployment", _AE4),
    _ch(20, "Price stability", _AE4),
    _ch(21, "Government macroeconomic policy objectives", _AE5),
    _ch(22, "Fiscal policy", _AE5),
    _ch(23, "Monetary policy", _AE5),
    _ch(24, "Supply-side policy", _AE5),
    _ch(25, "The reasons for international trade", _AE6),
    _ch(26, "Protectionism", _AE6),
    _ch(27, "Current account of the balance of payments", _AE6),
    _ch(28, "Exchange rates", _AE6),
    _ch(29, "Policies to correct imbalances in the current account of the balance of payments", _AE6),
    {"id": "exam-technique", "n": None, "label": "★", "title": "Exam technique", "group": "Exam preparation"},
]

A_ECON_A2 = [
    _ch(30, "Utility", _AE7),
    _ch(31, "Indifference curves and budget lines", _AE7),
    _ch(32, "Efficiency and market failure", _AE7),
    _ch(33, "Private costs and benefits, externalities and social costs and benefits", _AE7),
    _ch(34, "Types of cost, revenue and profit, short-run and long-run production", _AE7),
    _ch(35, "Different market structures", _AE7),
    _ch(36, "Growth and survival of firms", _AE7),
    _ch(37, "Differing objectives and policies of firms", _AE7),
    _ch(38, "Government policies to achieve efficient resource allocation and correct market failure", _AE8),
    _ch(39, "Equity and redistribution of income and wealth", _AE8),
    _ch(40, "Labour market forces and government intervention", _AE8),
    _ch(41, "The circular flow of income", _AE9),
    _ch(42, "Economic growth and sustainability", _AE9),
    _ch(43, "Employment and unemployment", _AE9),
    _ch(44, "Money and banking", _AE9),
    _ch(45, "Government macroeconomic policy objectives", _AE10),
    _ch(46, "Links between macroeconomic problems and their interrelatedness", _AE10),
    _ch(47, "Effectiveness of policy options to meet all macroeconomic objectives", _AE10),
    _ch(48, "Policies to correct disequilibrium in the balance of payments", _AE11),
    _ch(49, "Exchange rates", _AE11),
    _ch(50, "Economic development", _AE11),
    _ch(51, "Characteristics of countries at different levels of development", _AE11),
    _ch(52, "Relationship between countries at different levels of development", _AE11),
    _ch(53, "Globalisation", _AE11),
    _ch(54, "Preparing for assessment", "Exam preparation"),
]

# Course registry. 'kind' drives the page structure:
#   chapters  -> one grid of chapters
#   sections  -> grid of sections, each with its own grid of chapters
#   levels    -> AS / A Level cards, each with its own grid of chapters
COURSES = {
    "ig-cs": {
        "nav": "IG CS", "title": "IGCSE Computer Science", "kind": "chapters", "accent": "teal",
        "blurb": "Cambridge IGCSE Computer Science, following the ten chapters of the coursebook.",
        "chapters": IG_CS,
    },
    "ig-econ": {
        "nav": "IG Econ", "title": "IGCSE Economics", "kind": "sections", "accent": "amber",
        "blurb": "Cambridge IGCSE Economics, six sections of the coursebook with a page for every chapter.",
        "sections": IG_ECON_SECTIONS,
    },
    "a-cs": {
        "nav": "A CS", "title": "A-Level Computer Science", "kind": "levels", "accent": "indigo",
        "blurb": "Cambridge A-Level Computer Science (9618), split into AS and A Level content.",
        "levels": [
            {"id": "as", "title": "AS Level", "blurb": "Chapters 1 to 12", "chapters": A_CS_AS},
            {"id": "a-level", "title": "A Level", "blurb": "Chapters 13 to 20", "chapters": A_CS_A2},
        ],
    },
    "a-econ": {
        "nav": "A Econ", "title": "A-Level Economics", "kind": "levels", "accent": "plum",
        "blurb": "Cambridge A-Level Economics (9708), split into AS and A Level content.",
        "levels": [
            {"id": "as", "title": "AS Level", "blurb": "Chapters 1 to 29", "chapters": A_ECON_AS},
            {"id": "a-level", "title": "A Level", "blurb": "Chapters 30 to 54", "chapters": A_ECON_A2},
        ],
    },
}

# Artifacts. 'src' is the folder under artifacts_src/. 'places' is a list of
# (course, chapter id) pairs; the first is the primary home (used for the back link).
# 'role': "review" is the main chapter review (tracked on the Profile page); anything else is a
# supplementary "resource" shown on the chapter's Resources tab. Sub-section reviews (5.1, 5.2, ...) are reviews too. Leave it out for resources.
# 'at': coursebook position of a resource, e.g. "31.2" or "19.1.4". Resources sort by it, in
# coursebook order; ones without it come last, in the order listed here.
ARTIFACTS = [
    # IGCSE Computer Science
    {"src": "igcse-compression-lab", "title": "IGCSE Compression Lab", "kind": "Interactive",
     "desc": "Run-length encoding step by step, RLE on a bitmap, encode and decode tasks, lossy sliders and real-world examples.",
     "places": [("ig-cs", "ch-01")]},
    {"src": "ig-cs-software-keyword-workout", "title": "Software: Keyword Workout", "kind": "Worksheet",
     "desc": "Match, gap-fill, sort and quick-fire activities on operating systems, utilities and translators.",
     "places": [("ig-cs", "ch-04")]},
    {"src": "internet-and-www", "role": "review", "at": "5.1", "title": "The Internet and the World Wide Web", "kind": "Interactive",
     "desc": "5.1 The internet versus the WWW, a cookie flowchart ordering task, exam-style questions and top tips.",
     "places": [("ig-cs", "ch-05")]},
    {"src": "how-a-website-loads", "title": "How a Website Loads", "kind": "Animation",
     "desc": "Animated six-step journey from typing a URL to seeing the page, with DNS lookups.",
     "places": [("ig-cs", "ch-05")]},
    {"src": "dns-clue-station", "title": "DNS Clue Station", "kind": "Classroom activity",
     "desc": "Team check-in game. Sequence the DNS cards, enter the code word, get a question.",
     "places": [("ig-cs", "ch-05")]},
    {"src": "blockchain-explained", "role": "review", "at": "5.2", "title": "Blockchain Explained", "kind": "Interactive",
     "desc": "5.2 Blockchaining, proof of work, cryptography, Bitcoin, Ethereum and Cardano, with an animated payment.",
     "places": [("ig-cs", "ch-05")]},
    {"src": "cyber-security", "role": "review", "at": "5.3", "title": "Cyber Security", "kind": "Interactive",
     "desc": "5.3 Threats and defences, slider labs for DDoS and brute-force attacks, top tips and practice questions.",
     "places": [("ig-cs", "ch-05")]},

    # IGCSE Economics
    {"src": "macro-aims-explorer", "role": "review", "title": "The Four + Two Aims", "kind": "Interactive",
     "desc": "The macroeconomic aims of government and why hitting one often means missing another.",
     "places": [("ig-econ", "ch-25")]},

    # A-Level Computer Science
    {"src": "linked-lists", "role": "review", "title": "Linked Lists", "kind": "Walkthrough",
     "desc": "Abstract data types: how a linked list stores, inserts and deletes nodes using pointers.",
     "places": [("a-cs", "a-level/ch-19")]},
    {"src": "implementing-adts", "role": "review", "at": "19.1.4", "title": "Implementing One ADT from Another", "kind": "Interactive",
     "desc": "19.1.4 Linked lists from arrays, dictionaries from linked lists, simulators and exam questions.",
     "places": [("a-cs", "a-level/ch-19")]},
    {"src": "insertion-sort", "title": "Insertion Sort, Step by Step", "kind": "Walkthrough",
     "desc": "Trace an insertion sort pass by pass and compare it with bubble sort.",
     "places": [("a-cs", "a-level/ch-19")]},
    {"src": "binary-search-tree", "title": "Binary Search Tree Walkthrough", "kind": "Walkthrough",
     "desc": "Insert, search and traverse a binary tree one step at a time.",
     "places": [("a-cs", "a-level/ch-19")]},
    {"src": "big-o-notation", "role": "review", "at": "19.1.5", "title": "Comparing Algorithms: Big O Notation", "kind": "Interactive",
     "desc": "19.1.5 Order of growth, comparing algorithms and a practice set.",
     "places": [("a-cs", "a-level/ch-19")]},

    # A-Level Economics
    {"src": "as-resit-exam-technique", "title": "AS Resit Exam Technique Pack", "kind": "Exam pack",
     "desc": "Eight printable resources for Paper 2: command words, scope, evaluation, application and 12-mark structure.",
     "places": [("a-econ", "as/exam-technique")]},
    {"src": "giffen-paradox", "title": "The Giffen Paradox", "kind": "Interactive",
     "desc": "Indifference curves and budget lines, and where the Giffen paradox really comes from.",
     "places": [("a-econ", "a-level/ch-31")]},
    {"src": "firm-in-focus", "title": "Firm in Focus", "kind": "Interactive",
     "desc": "How a firm turns inputs into output and output into profit: costs, revenue and production.",
     "places": [("a-econ", "a-level/ch-34")]},
    {"src": "market-structures-lab", "title": "Market Structures Lab", "kind": "Interactive",
     "desc": "Same costs, different market. How structure decides price, output and profit.",
     "places": [("a-econ", "a-level/ch-35")]},
    {"src": "multipliers-markets-monopsony", "title": "Multipliers, Markets and Monopsony", "kind": "Walkthrough",
     "desc": "Three diagrams built step by step in exam order: the multiplier, market equilibrium and monopsony.",
     "places": [("a-econ", "a-level/ch-41"), ("a-econ", "a-level/ch-40")]},
    {"src": "liquidity-trap-notes", "title": "Liquidity Trap Notes", "kind": "Notes",
     "desc": "Why cutting rates to zero can stop working, how bonds fit in, and how QE tries to fix it.",
     "places": [("a-econ", "a-level/ch-44")]},
    {"src": "liquidity-trap-lab", "title": "Liquidity Trap Lab", "kind": "Interactive",
     "desc": "Definitions, diagrams, real data and levels-of-response practice on the liquidity trap.",
     "places": [("a-econ", "a-level/ch-44")]},

    # A-Level Economics, AS chapters requested by students
    {"src": "as-elasticities-of-demand", "role": "review", "title": "Elasticities of Demand", "kind": "Interactive",
     "desc": "Price, income and cross elasticity: animated diagrams, labs, drag-and-drop practice, calculations and exam questions with model answers.",
     "places": [("a-econ", "as/ch-08")]},
    {"src": "as-government-intervention", "role": "review", "title": "Methods and Effects of Government Intervention", "kind": "Interactive",
     "desc": "Indirect taxes and incidence, subsidies, direct provision, price controls, buffer stocks and information, with diagrams, labs and exam practice.",
     "places": [("a-econ", "as/ch-13")]},
    {"src": "as-comparative-advantage", "role": "review", "title": "Comparative Advantage and the Gains from Trade", "kind": "Interactive",
     "desc": "Opportunity cost, specialisation, terms of trade and the limits of the theory, with animated PPCs, labs and exam questions.",
     "places": [("a-econ", "as/ch-25")]},
    {"src": "as-balance-of-payments", "role": "review", "title": "The Current Account of the Balance of Payments", "kind": "Interactive",
     "desc": "Credits and debits, the four components, calculations, causes and consequences of deficits and surpluses, with exam practice.",
     "places": [("a-econ", "as/ch-27")]},
    {"src": "as-reasons-for-intervention", "role": "review", "title": "Reasons for Government Intervention in Markets", "kind": "Interactive",
     "desc": "Public goods and the free rider problem, merit and demerit goods, and why governments set price controls, with diagrams, labs and exam practice.",
     "places": [("a-econ", "as/ch-12")]},
    {"src": "as-elasticity-of-supply", "role": "review", "title": "Price Elasticity of Supply", "kind": "Interactive",
     "desc": "PES values, what determines supply flexibility, and why farm prices swing, with animated diagrams, labs, calculations and exam questions.",
     "places": [("a-econ", "as/ch-09")]},
]
