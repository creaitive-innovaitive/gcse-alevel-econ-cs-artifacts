Lib.classify($("#cl1"), {
  prompt: "Does each statement describe a plain sorted array or a linked list?",
  buckets: [{ label: "Sorted array" }, { label: "Linked list" }],
  items: [
    { text: "Inserting in order shifts every later element", b: 0 }, { text: "Direct access to any position by index", b: 0 }, { text: "Deleting shifts every later element", b: 0 },
    { text: "Inserting in order rewrites two pointers", b: 1 }, { text: "Follow pointers from the start to find an item", b: 1 }, { text: "A deleted slot returns to the heap", b: 1 }, { text: "Needs a start pointer and a null value", b: 1 },
  ],
  done: "Linked lists make insert and delete cheap; arrays make access by position cheap.",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Node", "One item of data together with a pointer to the next item"],
  ["Start pointer", "Index of the first node in the list, or −1 if the list is empty"],
  ["Heap start pointer", "Index of the first free slot"],
  ["Null pointer", "A value (−1) meaning there is no next node"],
  ["Predecessor", "The node that comes before the one being deleted"],
  ["Splice out", "Point the predecessor directly at the successor"],
] });
Lib.order($("#o1"), { prompt: "Put the steps for deleting a node from a linked list in order.", items: [
  "Follow the pointers from the start pointer to find the node and its predecessor.",
  "Point the predecessor's pointer at the node's successor.",
  "Point the deleted node's pointer at the old heap start pointer.",
  "Set the heap start pointer to the deleted node's index.",
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "In an array-based linked list, what does a pointer value of −1 mean?", opts: ["The first node", "There is no next node", "The list is full", "An error"], a: 1, why: "−1 is the null pointer, so the chain ends." },
  { q: "To find an item you should", opts: ["scan the data array from index 0", "start at the start pointer and follow the chain", "use binary search", "start at the heap pointer"], a: 1, why: "The order is held in the pointers, so the array indexes may not be in order." },
  { q: "When a node is deleted, what happens to its slot?", opts: ["It is lost", "It is returned to the front of the heap for reuse", "It is filled with zeros and stays in the list", "The array is shifted along"], a: 1, why: "Freed slots join the heap so new nodes can use them." },
  { q: "Which operation is cheaper in a linked list than in a sorted array?", opts: ["Access by position", "Insert in order", "Reading the last value", "Sorting"], a: 1, why: "Only two pointers change, and no data is shifted." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Linked list", "An ADT where each node holds data and a pointer to the next node."],
  ["Node", "One item of data stored together with a pointer to the next item."],
  ["Start pointer", "Index of the first node in the ordered list; −1 when empty."],
  ["Heap", "The pool of unused slots, held as a chain through a heap start pointer."],
  ["Null pointer", "A pointer value (−1) meaning there is no next node."],
  ["Predecessor", "The node before the one you are working on."],
  ["Parallel arrays", "Two arrays that use the same index for the data and its pointer."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

  // ---- top-level section tabs ----
  (function(){
    var btns = document.querySelectorAll('.section-tab-btn');
    var panels = document.querySelectorAll('section[data-panel]');
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        btns.forEach(function(b){ b.setAttribute('aria-selected','false'); });
        btn.setAttribute('aria-selected','true');
        panels.forEach(function(p){ p.classList.remove('active'); });
        var target = document.querySelector('section[data-panel="' + btn.dataset.panelTab + '"]');
        if (target){
          target.classList.add('active');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      });
    });
  })();

  document.querySelectorAll('.tabs').forEach(function(tabs){
    var btns = tabs.querySelectorAll('.tab-btn');
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        btns.forEach(function(b){ b.setAttribute('aria-selected','false'); });
        btn.setAttribute('aria-selected','true');
        var container = tabs.parentElement;
        container.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
        var target = container.querySelector('#' + btn.dataset.tab);
        if(target) target.classList.add('active');
      });
    });
  });

  // ---- linked-list step-through visualiser ----
  (function(){
    var N = 12;

    function emptyState(){
      return { list: new Array(N).fill(null), ptr: new Array(N).fill(null), start: -1, heapStart: -1 };
    }
    function clone(s){
      return { list: s.list.slice(), ptr: s.ptr.slice(), start: s.start, heapStart: s.heapStart };
    }
    function fmt(v){ return v === null ? '&mdash;' : (v === -1 ? '&minus;1' : String(v)); }

    // ---- full pseudocode blocks, matched line-for-line to the <pre> blocks in the article ----
    var CODE = {
      setup: [
        'DECLARE myLinkedList ARRAY[0:11] OF INTEGER',
        'DECLARE myLinkedListPointers ARRAY[0:11] OF INTEGER',
        'DECLARE startPointer : INTEGER',
        'DECLARE heapStartPointer : INTEGER',
        'DECLARE index : INTEGER',
        '',
        'heapStartPointer ← 0',
        'startPointer ← -1        // list empty',
        '',
        'FOR index ← 0 TO 11',
        '    myLinkedListPointers[index] ← index + 1',
        'NEXT index',
        '',
        '// the heap is itself a linked list of every free space,',
        '// set up once when the linked list is initialised',
        'myLinkedListPointers[11] ← -1',
        '// the final heap pointer is -1: no further free links'
      ],
      find: [
        'FUNCTION find(itemSearch) RETURNS INTEGER',
        '    DECLARE found : BOOLEAN',
        '    CONSTANT nullPointer = -1',
        '    itemPointer ← startPointer',
        '    found ← FALSE',
        '',
        '    WHILE (itemPointer <> nullPointer) AND NOT found DO',
        '        IF myLinkedList[itemPointer] = itemSearch',
        '          THEN',
        '            found ← TRUE',
        '          ELSE',
        '            itemPointer ← myLinkedListPointers[itemPointer]',
        '        ENDIF',
        '    ENDWHILE',
        '',
        '    RETURN itemPointer',
        "    // returns the item's index, or -1 if not found",
        'ENDFUNCTION'
      ],
      insert: [
        'PROCEDURE linkedListAdd(itemAdd)',
        '  IF heapStartPointer = nullPointer',
        '    THEN',
        '      OUTPUT "Linked list full"',
        '    ELSE',
        '      // claim the next free slot from the heap',
        '      newPointer ← heapStartPointer',
        '      heapStartPointer ← myLinkedListPointers[heapStartPointer]',
        '      myLinkedList[newPointer] ← itemAdd',
        '',
        '      IF (startPointer = nullPointer) OR (itemAdd < myLinkedList[startPointer])',
        '        THEN',
        '          // itemAdd is the new smallest value: insert at the head',
        '          myLinkedListPointers[newPointer] ← startPointer',
        '          startPointer ← newPointer',
        '        ELSE',
        '          // walk the chain to find the node just before the right spot',
        '          previousPointer ← startPointer',
        '          currentPointer ← myLinkedListPointers[startPointer]',
        '          WHILE (currentPointer <> nullPointer) AND (myLinkedList[currentPointer] < itemAdd) DO',
        '              previousPointer ← currentPointer',
        '              currentPointer ← myLinkedListPointers[currentPointer]',
        '          ENDWHILE',
        '          // splice the new node in between previousPointer and currentPointer',
        '          myLinkedListPointers[newPointer] ← currentPointer',
        '          myLinkedListPointers[previousPointer] ← newPointer',
        '      ENDIF',
        '  ENDIF',
        'ENDPROCEDURE'
      ],
      del: [
        'PROCEDURE linkedListDelete(itemDelete)',
        '  IF startPointer = nullPointer',
        '    THEN',
        '      OUTPUT "Linked list empty"',
        '    ELSE',
        '      index ← startPointer',
        '      WHILE myLinkedList[index] <> itemDelete AND (index <> nullPointer) DO',
        '          oldIndex ← index',
        '          index ← myLinkedListPointers[index]',
        '      ENDWHILE',
        '',
        '      IF index = nullPointer',
        '        THEN',
        '          OUTPUT "Item ", itemDelete, " not found"',
        '        ELSE',
        '          // unhook the node and return its slot to the heap',
        '          tempPointer ← myLinkedListPointers[index]',
        '          myLinkedListPointers[index] ← heapStartPointer',
        '          heapStartPointer ← index',
        '          myLinkedListPointers[oldIndex] ← tempPointer',
        '      ENDIF',
        '  ENDIF',
        'ENDPROCEDURE'
      ]
    };

    // ---- setup: build the empty list + heap chain ----
    function genSetupSteps(){
      var steps = [];
      var s = emptyState();
      steps.push({ state: clone(s), caption: 'Arrays are declared but nothing is initialised yet.', hl: {}, lines: [0,1,2,3,4] });

      s.heapStart = 0;
      steps.push({ state: clone(s), caption: '<code>heapStartPointer &larr; 0</code> &mdash; the free-slot chain will start at index 0.', hl: { heap: true }, lines: [6] });

      s.start = -1;
      steps.push({ state: clone(s), caption: '<code>startPointer &larr; -1</code> &mdash; the list is empty.', hl: { start: true }, lines: [7] });

      for (var i = 0; i < N; i++){
        s.ptr[i] = i + 1;
        steps.push({ state: clone(s), caption: '<code>index = ' + i + '</code>: <code>myLinkedListPointers[' + i + '] &larr; ' + (i+1) + '</code> &mdash; slot ' + i + ' points to the next free slot.', hl: { cell: i, kind: 'cur' }, lines: [9,10] });
      }

      s.ptr[N-1] = -1;
      steps.push({ state: clone(s), caption: '<code>myLinkedListPointers[' + (N-1) + '] &larr; -1</code> &mdash; the loop would have set the last slot to ' + N + ' (out of range), so this line corrects it to a null pointer, properly ending the heap chain.', hl: { cell: N-1, kind: 'cur' }, lines: [15] });

      return { steps: steps, finalState: clone(s) };
    }

    // ---- insert: ordered insert of one value, returns steps + mutates a working state ----
    function insertOne(state, val){
      var steps = [];
      function push(caption, hl, lines){ steps.push({ state: clone(state), caption: caption, hl: hl || {}, lines: lines || [] }); }

      if (state.heapStart === -1){
        push('Heap is full &mdash; cannot insert ' + val + '.', {}, [1,3]);
        return steps;
      }

      var newPointer = state.heapStart;
      push('<code>newPointer &larr; heapStartPointer = ' + newPointer + '</code> &mdash; claim this free slot from the heap.', { cell: newPointer, kind: 'new' }, [1,6]);

      state.heapStart = state.ptr[newPointer];
      push('<code>heapStartPointer &larr; myLinkedListPointers[' + newPointer + '] = ' + fmt(state.heapStart) + '</code> &mdash; heap pointer moves on.', { heap: true }, [7]);

      state.list[newPointer] = val;
      push('<code>myLinkedList[' + newPointer + '] &larr; ' + val + '</code> &mdash; the data is written into the new node.', { cell: newPointer, kind: 'new' }, [8]);

      if (state.start === -1){
        state.ptr[newPointer] = -1;
        state.start = newPointer;
        push('List was empty, so ' + val + ' becomes the only node: <code>myLinkedListPointers[' + newPointer + '] &larr; -1</code>, <code>startPointer &larr; ' + newPointer + '</code>.', { cell: newPointer, kind: 'new', start: true }, [10,11,13,14]);
      } else if (val < state.list[state.start]){
        var oldStart = state.start;
        state.ptr[newPointer] = oldStart;
        state.start = newPointer;
        push(val + ' &lt; myLinkedList[startPointer] (' + state.list[oldStart] + '), so it becomes the new smallest value: <code>myLinkedListPointers[' + newPointer + '] &larr; ' + oldStart + '</code> (old start), <code>startPointer &larr; ' + newPointer + '</code>.', { cell: newPointer, kind: 'new', start: true }, [10,11,13,14]);
      } else {
        var previousPointer = state.start;
        var currentPointer = state.ptr[state.start];
        push(val + ' &ge; myLinkedList[startPointer] (' + state.list[state.start] + ') &mdash; walk the chain: <code>previousPointer &larr; startPointer = ' + previousPointer + '</code>, <code>currentPointer &larr; ' + fmt(currentPointer) + '</code>.', { cell: previousPointer, kind: 'prev' }, [15,16,17,18]);

        while (currentPointer !== -1 && state.list[currentPointer] < val){
          push('myLinkedList[currentPointer] (' + state.list[currentPointer] + ') &lt; ' + val + ' &mdash; keep walking.', { cell: currentPointer, kind: 'cur' }, [19]);
          previousPointer = currentPointer;
          currentPointer = state.ptr[currentPointer];
          push('<code>previousPointer &larr; ' + previousPointer + '</code>, <code>currentPointer &larr; ' + fmt(currentPointer) + '</code>.', { cell: previousPointer, kind: 'prev' }, [20,21]);
        }

        push('Found the gap &mdash; splice ' + val + ' in between index ' + previousPointer + ' and ' + (currentPointer === -1 ? 'the end of the list' : 'index ' + currentPointer) + '.', { cell: previousPointer, kind: 'prev' }, [19,22]);

        state.ptr[newPointer] = currentPointer;
        state.ptr[previousPointer] = newPointer;
        push('<code>myLinkedListPointers[' + newPointer + '] &larr; ' + fmt(currentPointer) + '</code>, <code>myLinkedListPointers[' + previousPointer + '] &larr; ' + newPointer + '</code>.', { cell: newPointer, kind: 'new' }, [23,24,25]);
      }

      return steps;
    }

    function genInsertSteps(initialState, values){
      var state = clone(initialState);
      var steps = [{ state: clone(state), caption: 'Starting point: empty list, full heap (from the setup above).', hl: {}, lines: [0] }];
      values.forEach(function(val){
        steps.push({ state: clone(state), caption: '&mdash; Inserting ' + val + ' &mdash;', hl: {}, lines: [0] });
        steps = steps.concat(insertOne(state, val));
      });
      return { steps: steps, finalState: clone(state) };
    }

    // ---- find: search for a value ----
    function genFindSteps(initialState, target){
      var state = clone(initialState);
      var steps = [];
      var itemPointer = state.start;
      steps.push({ state: clone(state), caption: '<code>itemPointer &larr; startPointer = ' + itemPointer + '</code>', hl: { cell: itemPointer, kind: 'cur' }, lines: [3] });

      var found = false;
      while (itemPointer !== -1 && !found){
        if (state.list[itemPointer] === target){
          found = true;
          steps.push({ state: clone(state), caption: 'myLinkedList[' + itemPointer + '] (' + state.list[itemPointer] + ') = ' + target + ' &rarr; <code>found &larr; TRUE</code>', hl: { cell: itemPointer, kind: 'cur' }, lines: [6,7,8,9] });
        } else {
          steps.push({ state: clone(state), caption: 'myLinkedList[' + itemPointer + '] (' + state.list[itemPointer] + ') &ne; ' + target, hl: { cell: itemPointer, kind: 'cur' }, lines: [6,7,10,11] });
          itemPointer = state.ptr[itemPointer];
          steps.push({ state: clone(state), caption: '<code>itemPointer &larr; myLinkedListPointers[...] = ' + fmt(itemPointer) + '</code>', hl: { cell: itemPointer, kind: 'cur' }, lines: [11] });
        }
      }
      steps.push({ state: clone(state), caption: 'Loop ends. <code>RETURN itemPointer</code> = ' + (itemPointer === -1 ? '&minus;1 (not found)' : itemPointer) + '.', hl: { cell: itemPointer, kind: 'cur' }, lines: [13,15] });
      return { steps: steps, finalState: state };
    }

    // ---- delete: remove a value ----
    function genDeleteSteps(initialState, target){
      var state = clone(initialState);
      var steps = [];
      var index = state.start;
      var oldIndex = null;
      steps.push({ state: clone(state), caption: '<code>index &larr; startPointer = ' + index + '</code>', hl: { cell: index, kind: 'cur' }, lines: [5] });

      while (index !== -1 && state.list[index] !== target){
        steps.push({ state: clone(state), caption: 'myLinkedList[' + index + '] (' + state.list[index] + ') &ne; ' + target, hl: { cell: index, kind: 'cur' }, lines: [6] });
        oldIndex = index;
        index = state.ptr[index];
        steps.push({ state: clone(state), caption: '<code>oldIndex &larr; ' + oldIndex + '</code>, <code>index &larr; myLinkedListPointers[' + oldIndex + '] = ' + fmt(index) + '</code>', hl: { cell: index, kind: 'cur', prevCell: oldIndex }, lines: [7,8] });
      }

      steps.push({ state: clone(state), caption: 'myLinkedList[' + index + '] (' + state.list[index] + ') = ' + target + ' &mdash; found it at index ' + index + '; predecessor is index ' + oldIndex + '.', hl: { cell: index, kind: 'cur', prevCell: oldIndex }, lines: [6,11] });

      var tempPointer = state.ptr[index];
      steps.push({ state: clone(state), caption: '<code>tempPointer &larr; myLinkedListPointers[' + index + '] = ' + fmt(tempPointer) + '</code> &mdash; save where the deleted node used to point.', hl: { cell: index, kind: 'cur' }, lines: [16] });

      state.ptr[index] = state.heapStart;
      steps.push({ state: clone(state), caption: '<code>myLinkedListPointers[' + index + '] &larr; heapStartPointer = ' + state.heapStart + '</code> &mdash; the freed slot joins the front of the heap chain.', hl: { cell: index, kind: 'cur' }, lines: [17] });

      state.heapStart = index;
      steps.push({ state: clone(state), caption: '<code>heapStartPointer &larr; ' + index + '</code> &mdash; heap now starts at the freed slot.', hl: { heap: true }, lines: [18] });

      state.ptr[oldIndex] = tempPointer;
      steps.push({ state: clone(state), caption: '<code>myLinkedListPointers[' + oldIndex + '] &larr; tempPointer = ' + fmt(tempPointer) + '</code> &mdash; predecessor now points straight past the deleted node.', hl: { cell: oldIndex, kind: 'prev' }, lines: [19] });

      return { steps: steps, finalState: state };
    }

    // ---- renderer, shared by all four widgets ----
    function renderStepper(container, steps, codeLines){
      var title = container.querySelector('.stepper-title');
      container.innerHTML = '';
      if (title) container.appendChild(title);

      container.insertAdjacentHTML('beforeend',
        '<div class="stepper-controls">' +
          '<button class="step-btn" data-action="reset" type="button">Reset</button>' +
          '<button class="step-btn" data-action="prev" type="button">&larr; Back</button>' +
          '<span class="step-count"></span>' +
          '<button class="step-btn primary" data-action="next" type="button">Next &rarr;</button>' +
        '</div>' +
        '<div class="stepper-pointers"></div>' +
        '<div class="stepper-array">' +
          '<div class="stepper-array-label">myLinkedList</div>' +
          '<div class="stepper-row" data-row="list"></div>' +
        '</div>' +
        '<div class="stepper-array">' +
          '<div class="stepper-array-label">myLinkedListPointers</div>' +
          '<div class="stepper-row" data-row="ptr"></div>' +
        '</div>' +
        '<pre class="stepper-code" data-code></pre>' +
        '<div class="stepper-caption"></div>'
      );

      var els = {
        count: container.querySelector('.step-count'),
        pointers: container.querySelector('.stepper-pointers'),
        rowList: container.querySelector('[data-row="list"]'),
        rowPtr: container.querySelector('[data-row="ptr"]'),
        code: container.querySelector('[data-code]'),
        caption: container.querySelector('.stepper-caption'),
        btnReset: container.querySelector('[data-action="reset"]'),
        btnPrev: container.querySelector('[data-action="prev"]'),
        btnNext: container.querySelector('[data-action="next"]')
      };

      // build the full code block once; each line is its own element so we can
      // just toggle a class on it per step rather than re-render the text
      var lineEls = codeLines.map(function(text){
        var span = document.createElement('span');
        span.className = 'code-line';
        span.textContent = text.length ? text : ' ';
        els.code.appendChild(span);
        return span;
      });

      var i = 0;

      function cellClass(idx, hl){
        if (!hl) return '';
        if (hl.cell === idx) return ' cell-' + (hl.kind || 'cur');
        if (hl.prevCell === idx) return ' cell-prev';
        return '';
      }

      function render(){
        var step = steps[i];
        var s = step.state;
        els.count.textContent = 'Step ' + (i+1) + ' of ' + steps.length;
        els.btnPrev.disabled = i === 0;
        els.btnNext.disabled = i === steps.length - 1;

        els.pointers.innerHTML =
          '<span class="ptr-badge' + (step.hl.start ? ' hl' : '') + '">startPointer = ' + fmt(s.start) + '</span>' +
          '<span class="ptr-badge' + (step.hl.heap ? ' hl' : '') + '">heapStartPointer = ' + fmt(s.heapStart) + '</span>';

        els.rowList.innerHTML = s.list.map(function(v, idx){
          return '<div class="cell' + cellClass(idx, step.hl) + '"><span class="cell-idx">' + idx + '</span><span class="cell-val">' + (v === null ? '&nbsp;' : v) + '</span></div>';
        }).join('');

        els.rowPtr.innerHTML = s.ptr.map(function(v, idx){
          return '<div class="cell' + cellClass(idx, step.hl) + '"><span class="cell-idx">' + idx + '</span><span class="cell-val">' + (v === null ? '&nbsp;' : fmt(v)) + '</span></div>';
        }).join('');

        lineEls.forEach(function(el, idx){
          el.classList.toggle('active', step.lines.indexOf(idx) !== -1);
        });
        if (step.lines.length){
          lineEls[step.lines[0]].scrollIntoView({ block: 'nearest' });
        }

        els.caption.innerHTML = step.caption;
      }

      els.btnNext.addEventListener('click', function(){ if (i < steps.length - 1){ i++; render(); } });
      els.btnPrev.addEventListener('click', function(){ if (i > 0){ i--; render(); } });
      els.btnReset.addEventListener('click', function(){ i = 0; render(); });

      render();
    }

    // ---- build the four demos, sharing one consistent worked example ----
    var setupResult = genSetupSteps();
    var insertResult = genInsertSteps(setupResult.finalState, [27, 19, 36, 42, 16]);
    var findResult = genFindSteps(insertResult.finalState, 42);
    var deleteResult = genDeleteSteps(insertResult.finalState, 36);

    var mounts = {
      'stepper-setup': { steps: setupResult.steps, code: CODE.setup },
      'stepper-insert': { steps: insertResult.steps, code: CODE.insert },
      'stepper-find': { steps: findResult.steps, code: CODE.find },
      'stepper-delete': { steps: deleteResult.steps, code: CODE.del }
    };
    Object.keys(mounts).forEach(function(id){
      var el = document.getElementById(id);
      if (el) renderStepper(el, mounts[id].steps, mounts[id].code);
    });
  })();

})();
