(function () {
  var Q = window.QUIZ, root = document.getElementById('quiz');
  var KEY = 'drasta-quiz-miss2-';

  // 問題にIDをつけてまとめる（k=仮免, h=本免, d=危険予測）
  var ITEMS = {};
  Q.karimen.q.forEach(function (x, i) { ITEMS['k' + i] = { id: 'k' + i, type: 'ox', t: x.t, a: x.a, e: x.e, s: x.s }; });
  Q.honmen.q.forEach(function (x, i) { ITEMS['h' + i] = { id: 'h' + i, type: 'ox', t: x.t, a: x.a, e: x.e }; });
  Q.kiken.forEach(function (x, i) { ITEMS['d' + i] = { id: 'd' + i, type: 'kiken', img: 'assets/kiken/d' + i + '.svg?v=1', scene: x.scene, sub: x.sub, e: x.e }; });
  var K = Object.keys(ITEMS).filter(function (k) { return k[0] === 'k'; });
  var H = Object.keys(ITEMS).filter(function (k) { return k[0] === 'h'; });
  var D = Object.keys(ITEMS).filter(function (k) { return k[0] === 'd'; });

  var TESTS = {
    karimen: { name: '仮免学科', quick: { n: 30, from: K }, exam: { text: K, textN: 50, kiken: 0, min: 30, desc: '50問・30分・45点以上で合格' } },
    honmen: { name: '本免学科', quick: { n: 30, from: H }, exam: { text: K.concat(H), textN: 90, kiken: 5, min: 50, desc: '文章90問＋危険予測5問・50分・90点以上で合格' } }
  };

  var st = null, timer = null;

  function load(k) { try { return JSON.parse(localStorage.getItem(KEY + k)) || []; } catch (e) { return []; } }
  function save(k, a) { try { localStorage.setItem(KEY + k, JSON.stringify(a)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mark(b) { return b === undefined ? '－' : (b ? '○' : '×'); }
  function fig(it, small) { return '<figure class="qz-fig' + (small ? ' sm' : '') + '"><img src="' + it.img + '" alt="' + esc(it.scene) + '" width="400" height="300" loading="lazy" decoding="async"><figcaption>上から見た図（青い車が自車）</figcaption></figure>'; }
  function pts(it) { return it.type === 'kiken' ? 2 : 1; }
  function sign(it) { return it.s ? '<img class="qz-sign" src="assets/signs/' + it.s + '.png?v=2" alt="標識の図" width="120" height="120" decoding="async">' : ''; }
  function top() { var y = root.getBoundingClientRect().top + window.scrollY - 90; if (Math.abs(window.scrollY - y) > 40) window.scrollTo({ top: y, behavior: 'smooth' }); }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }

  function home() {
    stopTimer(); st = null;
    var h = '<div class="qz-home">';
    ['karimen', 'honmen'].forEach(function (k) {
      var T = TESTS[k], miss = load(k).length;
      h += '<div class="qz-card"><h3>' + T.name + '</h3>' +
        '<button class="qz-btn" data-go="' + k + ':quick">かんたん練習（30問）<small>1問ごとに正解と解説</small></button>' +
        '<button class="qz-btn exam" data-go="' + k + ':exam">本番形式（' + (T.exam.textN + T.exam.kiken) + '問）<small>' + T.exam.desc + '</small></button>' +
        (miss ? '<button class="qz-btn ghost" data-go="' + k + ':miss">前回まちがえた' + miss + '問だけ解く</button>' : '') +
        '</div>';
    });
    root.innerHTML = h + '</div><p class="qz-note">本番形式は、本番と同じ問題数・制限時間・合格点です。解答中は正解を表示せず、最後にまとめて採点します。</p>';
  }

  // 答えが×の問題を、全体の25〜40％の範囲で毎回ちがう数だけ選ぶ
  var lastF = {};
  function mix(pool, n, key) {
    var F = shuffle(pool.filter(function (id) { return !ITEMS[id].a; }));
    var T = shuffle(pool.filter(function (id) { return ITEMS[id].a; }));
    var lo = Math.max(Math.ceil(n * 0.25), n - T.length), hi = Math.min(Math.floor(n * 0.40), F.length);
    var prev = lastF[key];
    if (prev === undefined) { try { prev = +sessionStorage.getItem('drasta-quiz-f-' + key); } catch (e) {} }
    var f, tries = 0;
    do { f = lo + Math.floor(Math.random() * (hi - lo + 1)); } while (hi > lo && f === prev && ++tries < 20);
    lastF[key] = f;
    try { sessionStorage.setItem('drasta-quiz-f-' + key, f); } catch (e) {}
    return shuffle(F.slice(0, f).concat(T.slice(0, n - f)));
  }

  function start(test, mode, list) {
    stopTimer();
    var T = TESTS[test], ids;
    if (list) ids = shuffle(list);
    else if (mode === 'quick') ids = mix(T.quick.from, T.quick.n, test + ':quick');
    else if (mode === 'miss') ids = shuffle(load(test));
    else ids = mix(T.exam.text, T.exam.textN, test + ':exam').concat(shuffle(D).slice(0, T.exam.kiken));
    if (!ids.length) return home();
    st = { test: test, mode: mode, list: ids, i: 0, ans: {}, exam: mode === 'exam' };
    if (typeof gtag === 'function') gtag('event', 'quiz_start', { quiz_test: test, quiz_mode: mode, quiz_questions: ids.length });
    if (st.exam) {
      st.end = Date.now() + T.exam.min * 60000;
      timer = setInterval(tick, 1000);
    }
    ask(); top();
  }

  function tick() {
    var left = Math.max(0, Math.round((st.end - Date.now()) / 1000));
    var el = root.querySelector('.qz-timer');
    if (el) { el.textContent = '残り ' + fmt(left); el.classList.toggle('low', left <= 300); }
    if (!left) { st.timeout = true; result(); }
  }

  function label() {
    var T = TESTS[st.test];
    return T.name + (st.mode === 'exam' ? '・本番形式' : st.mode === 'miss' ? '・まちがえた問題' : '・かんたん練習');
  }

  function ask() {
    var n = st.list.length, it = ITEMS[st.list[st.i]];
    var h = '<div class="qz-play">' +
      '<div class="qz-head"><span>' + label() + '</span><span>' + (st.exam ? '<span class="qz-timer">残り ' + fmt(Math.max(0, Math.round((st.end - Date.now()) / 1000))) + '</span>　' : '') + (st.i + 1) + ' / ' + n + '</span></div>' +
      '<div class="qz-bar"><i style="width:' + (st.i / n * 100) + '%"></i></div>';
    if (it.type === 'ox') {
      h += sign(it) + '<p class="qz-q"><b>問' + (st.i + 1) + '</b>' + esc(it.t) + '</p>' +
        '<div class="qz-ans"><button class="qz-ox" data-pick="1" aria-label="正しい（○）">○</button><button class="qz-ox" data-pick="0" aria-label="誤り（×）">×</button></div>';
    } else {
      h += '<p class="qz-q"><b>問' + (st.i + 1) + '　危険予測（2点）</b></p>' + fig(it) + '<p class="qz-q">' + esc(it.scene) + '<span class="qz-sub">この状況で、次のことに注意して運転する場合、それぞれ正しければ○、誤りなら×を選んでください。（3つすべて正解で2点）</span></p><ol class="qz-kk">';
      it.sub.forEach(function (s, j) {
        h += '<li><p>（' + (j + 1) + '）' + esc(s.t) + '</p><div class="qz-mini" role="group"><button class="qz-ox sm" data-sub="' + j + '" data-v="1" aria-label="（' + (j + 1) + '）○">○</button><button class="qz-ox sm" data-sub="' + j + '" data-v="0" aria-label="（' + (j + 1) + '）×">×</button></div></li>';
      });
      h += '</ol><button class="qz-btn" data-kkgo disabled>解答する</button>';
      st.kk = [];
    }
    h += '<div class="qz-fb" aria-live="polite"></div>' +
      '<button class="qz-quit" data-quit>' + (st.exam ? 'ここで終了して採点する' : 'やめて結果を見る') + '</button></div>';
    root.innerHTML = h;
  }

  function judge(it, v) { return it.type === 'ox' ? v === it.a : it.sub.every(function (s, j) { return v[j] === s.a; }); }

  function answer(v) {
    var it = ITEMS[st.list[st.i]], ok = judge(it, v);
    st.ans[it.id] = { v: v, ok: ok };
    if (st.exam) return next();
    if (it.type === 'ox') {
      root.querySelectorAll('.qz-ans .qz-ox').forEach(function (b) {
        b.disabled = true; var bv = b.dataset.pick === '1';
        if (bv === it.a) b.classList.add('right'); else if (bv === v) b.classList.add('wrong');
      });
    } else {
      root.querySelectorAll('.qz-kk .qz-ox').forEach(function (b) {
        b.disabled = true; var j = +b.dataset.sub, bv = b.dataset.v === '1';
        if (bv === it.sub[j].a) b.classList.add('right'); else if (bv === v[j]) b.classList.add('wrong');
      });
      root.querySelector('[data-kkgo]').remove();
    }
    var last = st.i === st.list.length - 1;
    root.querySelector('.qz-fb').innerHTML =
      '<div class="qz-res ' + (ok ? 'ok' : 'ng') + '"><strong>' + (ok ? '正解！' : '不正解') + '</strong>　' + (it.type === 'ox' ? '答えは「' + mark(it.a) + '」' : '答えは ' + it.sub.map(function (s, j) { return '（' + (j + 1) + '）' + mark(s.a); }).join(' ')) + '</div>' +
      '<p class="qz-exp">' + esc(it.e) + '</p>' +
      '<button class="qz-btn" data-next>' + (last ? '結果を見る' : '次の問題へ') + '</button>';
    root.querySelector('[data-next]').focus({ preventScroll: true });
  }

  function next() { if (st.i < st.list.length - 1) { st.i++; ask(); if (!st.exam) top(); } else result(); }

  function result() {
    stopTimer();
    var T = TESTS[st.test], ids = st.exam ? st.list : st.list.filter(function (id) { return st.ans[id]; });
    if (!ids.length) return home();
    var max = 0, got = 0, wrong = [], blank = 0;
    ids.forEach(function (id) {
      var it = ITEMS[id], a = st.ans[id]; max += pts(it);
      if (!a) { blank++; return; }
      if (a.ok) got += pts(it); else wrong.push(id);
    });
    var rate = Math.round(got / max * 100), pass = got / max >= 0.9;
    if (typeof gtag === 'function') gtag('event', 'quiz_complete', { quiz_test: st.test, quiz_mode: st.mode, quiz_score: rate, quiz_pass: pass ? 'yes' : 'no', quiz_timeout: st.timeout ? 'yes' : 'no' });
    // 記録：まちがえた問題を追加し、正解した問題は外す
    var store = load(st.test);
    Object.keys(st.ans).forEach(function (id) {
      var p = store.indexOf(id);
      if (st.ans[id].ok && p > -1) store.splice(p, 1);
      if (!st.ans[id].ok && p < 0) store.push(id);
    });
    save(st.test, store);
    st.wrongNow = wrong;

    var unit = st.exam ? '点' : '問';
    var h = '<div class="qz-result">' +
      (st.timeout ? '<p class="qz-to">制限時間になりました。</p>' : '') +
      '<div class="qz-score ' + (pass ? 'pass' : 'fail') + '"><span class="qz-sm">' + label() + '</span>' +
      '<span class="qz-big">' + got + '<small> / ' + max + unit + '</small></span>' +
      '<span>正答率 ' + rate + '％' + (blank ? '（未回答 ' + blank + '問）' : '') + '</span>' +
      '<b>' + (st.exam ? (pass ? '合格です！（' + Math.ceil(max * 0.9) + '点以上）' : '不合格（合格は' + Math.ceil(max * 0.9) + '点以上）') : (pass ? '合格ライン（90％）クリア！' : '合格ライン（90％）まであと少し')) + '</b></div>';
    if (wrong.length) {
      h += '<h3 class="qz-h">まちがえた問題（' + wrong.length + '問）</h3><ol class="qz-list">';
      wrong.forEach(function (id) { h += review(id, true); });
      h += '</ol><button class="qz-btn" data-again="miss">まちがえた問題だけもう一度</button>';
    } else if (!blank) {
      h += '<p class="qz-perfect">全問正解です。この調子で本番に備えましょう！</p>';
    }
    h += '<button class="qz-btn ghost" data-again="same">同じ形式でもう一度</button>' +
      '<button class="qz-btn ghost" data-home>試験の選択にもどる</button>' +
      '<details class="qz-all"><summary>今回の全問題と解説を見る</summary><ol class="qz-list">';
    ids.forEach(function (id) { h += review(id, false); });
    h += '</ol></details></div>';
    root.innerHTML = h; top();
  }

  function review(id, onlyWrong) {
    var it = ITEMS[id], a = st.ans[id], cls = !a ? 'is-blank' : a.ok ? 'is-ok' : 'is-ng', h;
    var status = !a ? '<span class="na">未回答</span>' : a.ok ? '<span class="ok">正解</span>' : '<span class="ng">不正解</span>';
    if (it.type === 'ox') {
      h = sign(it) + '<p class="qz-lq">' + esc(it.t) + '</p><p class="qz-lmeta">' + (onlyWrong ? '' : status) +
        '<span class="ng">あなたの答え：' + mark(a && a.v) + '</span><span class="ok">正解：' + mark(it.a) + '</span></p>';
    } else {
      h = '<p class="qz-lq">【危険予測】' + esc(it.scene) + '</p>' + fig(it, true) + (onlyWrong ? '' : '<p class="qz-lmeta">' + status + '</p>') + '<ul class="qz-ksub">';
      it.sub.forEach(function (s, j) {
        var mine = a && a.v[j], bad = a && mine !== s.a;
        h += '<li class="' + (bad ? 'bad' : '') + '">（' + (j + 1) + '）' + esc(s.t) + '<span>あなた：' + mark(mine) + '　正解：' + mark(s.a) + '</span></li>';
      });
      h += '</ul>';
    }
    return '<li class="' + (onlyWrong ? '' : cls) + '">' + h + '<p class="qz-exp">' + esc(it.e) + '</p></li>';
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    var d = b.dataset;
    if (d.go) { var p = d.go.split(':'); start(p[0], p[1]); }
    else if (d.pick !== undefined) answer(d.pick === '1');
    else if (d.sub !== undefined) {
      st.kk[+d.sub] = d.v === '1';
      b.parentNode.querySelectorAll('button').forEach(function (x) { x.classList.toggle('sel', x === b); });
      root.querySelector('[data-kkgo]').disabled = !(st.kk[0] !== undefined && st.kk[1] !== undefined && st.kk[2] !== undefined);
    }
    else if (b.hasAttribute('data-kkgo')) answer(st.kk.slice());
    else if (b.hasAttribute('data-next')) next();
    else if (b.hasAttribute('data-quit')) result();
    else if (b.hasAttribute('data-home')) { home(); top(); }
    else if (d.again === 'same') start(st.test, st.mode === 'miss' ? 'quick' : st.mode);
    else if (d.again === 'miss') start(st.test, 'miss', st.wrongNow);
  });

  home();
})();
