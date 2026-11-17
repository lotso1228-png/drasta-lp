(function () {
  var Q = window.QUIZ, root = document.getElementById('quiz');
  var KEY = 'drasta-quiz-miss-';
  var st = null; // {kind, list:[idx], i, answers:[{idx, pick, ok}]}

  function load(kind) { try { return JSON.parse(localStorage.getItem(KEY + kind)) || []; } catch (e) { return []; } }
  function save(kind, arr) { try { localStorage.setItem(KEY + kind, JSON.stringify(arr)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mark(b) { return b ? '○' : '×'; }
  function top() { var y = root.getBoundingClientRect().top + window.scrollY - 90; if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'smooth' }); }

  function home() {
    st = null;
    var h = '<div class="qz-home">';
    ['karimen', 'honmen'].forEach(function (k) {
      var d = Q[k], miss = load(k).length;
      h += '<div class="qz-card"><h3>' + d.name + '<small>全' + d.q.length + '問・○×式</small></h3>' +
        '<p>' + d.real + '</p>' +
        '<button class="qz-btn" data-start="' + k + '">' + d.name + 'をはじめる</button>' +
        (miss ? '<button class="qz-btn ghost" data-retry="' + k + '">前回まちがえた' + miss + '問だけ解く</button>' : '') +
        '</div>';
    });
    root.innerHTML = h + '</div>';
  }

  function start(kind, onlyMiss) {
    var idx = onlyMiss ? load(kind) : Q[kind].q.map(function (_, i) { return i; });
    if (!idx.length) return home();
    st = { kind: kind, list: shuffle(idx), i: 0, answers: [], miss: !!onlyMiss };
    ask(); top();
  }

  function ask() {
    var d = Q[st.kind], n = st.list.length, q = d.q[st.list[st.i]];
    root.innerHTML =
      '<div class="qz-play">' +
      '<div class="qz-head"><span>' + d.name + (st.miss ? '（まちがえた問題）' : '') + '</span><span>' + (st.i + 1) + ' / ' + n + '</span></div>' +
      '<div class="qz-bar"><i style="width:' + (st.i / n * 100) + '%"></i></div>' +
      '<p class="qz-q"><b>問' + (st.i + 1) + '</b>' + esc(q.t) + '</p>' +
      '<div class="qz-ans"><button class="qz-ox" data-pick="1" aria-label="正しい（○）">○</button><button class="qz-ox" data-pick="0" aria-label="誤り（×）">×</button></div>' +
      '<div class="qz-fb" aria-live="polite"></div>' +
      '<button class="qz-quit" data-quit>やめて結果を見る</button>' +
      '</div>';
  }

  function pick(v) {
    var q = Q[st.kind].q[st.list[st.i]], ok = v === q.a;
    st.answers.push({ idx: st.list[st.i], pick: v, ok: ok });
    root.querySelectorAll('.qz-ox').forEach(function (b) {
      b.disabled = true;
      var bv = b.getAttribute('data-pick') === '1';
      if (bv === q.a) b.classList.add('right'); else if (bv === v) b.classList.add('wrong');
    });
    var last = st.i === st.list.length - 1;
    root.querySelector('.qz-fb').innerHTML =
      '<div class="qz-res ' + (ok ? 'ok' : 'ng') + '"><strong>' + (ok ? '正解！' : '不正解') + '</strong>　答えは「' + mark(q.a) + '」</div>' +
      '<p class="qz-exp">' + esc(q.e) + '</p>' +
      '<button class="qz-btn" data-next>' + (last ? '結果を見る' : '次の問題へ') + '</button>';
    root.querySelector('[data-next]').focus({ preventScroll: true });
  }

  function result() {
    var d = Q[st.kind], a = st.answers, n = a.length;
    if (!n) return home();
    var ok = a.filter(function (x) { return x.ok; }).length, rate = Math.round(ok / n * 100), pass = rate >= 90;
    var wrong = a.filter(function (x) { return !x.ok; });
    // 保存：今回まちがえた問題を記録し、今回正解した問題は記録から外す
    var store = load(st.kind);
    a.forEach(function (x) {
      var p = store.indexOf(x.idx);
      if (x.ok && p > -1) store.splice(p, 1);
      if (!x.ok && p < 0) store.push(x.idx);
    });
    save(st.kind, store);

    var h = '<div class="qz-result">' +
      '<div class="qz-score ' + (pass ? 'pass' : 'fail') + '"><span class="qz-big">' + ok + '<small> / ' + n + '問</small></span>' +
      '<span>正答率 ' + rate + '％</span><b>' + (pass ? '合格ライン（90％）クリア！' : '合格ライン（90％）まであと少し') + '</b></div>';
    if (wrong.length) {
      h += '<h3 class="qz-h">まちがえた問題（' + wrong.length + '問）</h3><ol class="qz-list">';
      wrong.forEach(function (x) {
        var q = d.q[x.idx];
        h += '<li><p class="qz-lq">' + esc(q.t) + '</p>' +
          '<p class="qz-lmeta"><span class="ng">あなたの答え：' + mark(x.pick) + '</span><span class="ok">正解：' + mark(q.a) + '</span></p>' +
          '<p class="qz-exp">' + esc(q.e) + '</p></li>';
      });
      h += '</ol><button class="qz-btn" data-again="miss">まちがえた問題だけもう一度</button>';
    } else {
      h += '<p class="qz-perfect">全問正解です。この調子で本番に備えましょう！</p>';
    }
    h += '<button class="qz-btn ghost" data-again="all">全問をもう一度</button>' +
      '<button class="qz-btn ghost" data-home>試験の選択にもどる</button>' +
      '<details class="qz-all"><summary>今回の全問題と解説を見る</summary><ol class="qz-list">';
    a.forEach(function (x) {
      var q = d.q[x.idx];
      h += '<li class="' + (x.ok ? 'is-ok' : 'is-ng') + '"><p class="qz-lq">' + esc(q.t) + '</p>' +
        '<p class="qz-lmeta"><span class="' + (x.ok ? 'ok' : 'ng') + '">' + (x.ok ? '正解' : '不正解') + '</span><span>答え：' + mark(q.a) + '</span></p>' +
        '<p class="qz-exp">' + esc(q.e) + '</p></li>';
    });
    h += '</ol></details></div>';
    st.wrongNow = wrong.map(function (x) { return x.idx; });
    root.innerHTML = h; top();
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.start) start(b.dataset.start, false);
    else if (b.dataset.retry) start(b.dataset.retry, true);
    else if (b.hasAttribute('data-pick')) pick(b.dataset.pick === '1');
    else if (b.hasAttribute('data-next')) { if (st.i < st.list.length - 1) { st.i++; ask(); } else result(); }
    else if (b.hasAttribute('data-quit')) result();
    else if (b.hasAttribute('data-home')) { home(); top(); }
    else if (b.dataset.again === 'all') start(st.kind, false);
    else if (b.dataset.again === 'miss') { var k = st.kind, w = st.wrongNow; st = { kind: k, list: shuffle(w), i: 0, answers: [], miss: true }; ask(); top(); }
  });

  home();
})();
