/* 試験場コース図（ドラスタ独自作成の参考図）
   上から見た簡略図。北が上。外周は時計回り。 */
(function () {
  var COURSES = {
    'komyoike-kari-1': {
      title: '光明池 仮免許 1コース',
      steps: [
        { d: 'M 520 61 L 590 61 C 625 61 625 29 660 29 L 810 29 Q 966 29 966 185 L 966 455 Q 966 611 810 611 L 190 611 Q 34 611 34 455 L 34 185 Q 34 29 190 29 L 480 29',
          text: '発着点をスタートし、すぐに右側の車線へ進路変更。外周を時計回りに1周します。' },
        { d: 'M 480 29 L 810 29 Q 966 29 966 185 L 966 455 Q 966 611 810 611 C 770 611 770 579 730 579 L 420 579 Q 400 579 400 559 L 400 370 Q 400 352 382 352 L 318 352 Q 300 352 300 370 L 300 430',
          text: '外周を東側・南側へ進み、南側から中央の道路へ右折して北へ。交差点の手前で左折して坂道へ。' },
        { d: 'M 300 430 L 300 472 Q 300 490 318 490 L 382 490 Q 400 490 400 472 L 400 338 Q 400 320 418 320 L 620 320 C 670 320 600 240 680 232 C 760 224 690 150 745 150 L 358 150 Q 340 150 340 168 L 340 205 L 290 205 L 290 262 L 250 262 L 250 302 Q 250 320 268 320 L 360 320',
          text: '坂道を下りて左折し、中央の道路を北へ。交差点を右折して東へ進み、S字へ。北側の道路に出たら一時停止して左折し、西へ進んでクランクへ。クランクを抜けたら交差点へ向かいます。' },
        { d: 'M 360 320 L 782 320 Q 800 320 800 302 L 800 168 Q 800 150 782 150 L 218 150 Q 200 150 200 168 L 200 472 Q 200 490 218 490 L 782 490 Q 800 490 800 472 L 800 338 Q 800 320 782 320 L 518 320 Q 500 320 500 338 L 500 420',
          text: '交差点を直進して東へ。左折して北側の道路を西へ進み、内周をぐるりと回って東側から中央の道路へ。中央の道路を西へ進み、左折して南へ。' },
        { d: 'M 500 420 L 500 472 Q 500 490 518 490 L 782 490 Q 800 490 800 472 L 800 338 Q 800 320 782 320 L 658 320 Q 640 320 640 338 L 640 430',
          text: '一時停止をして左折し、東へ。北へ進んで中央の道路を西へ。横断歩道に注意して、左折して南へ進みます。' },
        { d: 'M 640 430 L 640 595 Q 640 611 624 611 L 190 611 Q 34 611 34 455 L 34 185 Q 34 29 190 29 L 520 29',
          text: '一時停止をして外周へ出て右折。外周を西側・北側へ進み、発着点に戻ります。' }
      ]
    }
  };

  var BASE =
    // 芝生
    '<rect width="1000" height="640" rx="20" fill="#cfe8c4"/>' +
    // 道路：白い縁取り → 舗装 の順に重ねて、合流部分を1本につなげる
    roads() +
    // 外周の車線境界（破線）
    '<rect x="50" y="45" width="900" height="550" rx="140" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="18 14"/>' +
    // 坂道
    '<rect x="285" y="395" width="30" height="50" fill="url(#cm-hatch)"/>' +
    // 交差点の横断歩道
    '<g fill="#fff">' + [0, 1, 2, 3, 4].map(function (i) { return '<rect x="' + (384 + i * 7) + '" y="294" width="4" height="10"/><rect x="' + (384 + i * 7) + '" y="336" width="4" height="10"/>'; }).join('') + '</g>' +
    '<g fill="#fff">' + [0, 1, 2, 3, 4].map(function (i) { return '<rect x="702" y="' + (305 + i * 7) + '" width="10" height="4"/>'; }).join('') + '</g>' +
    // ラベル
    lab(520, 45, '発着点', '#0e5c9e', '#fff') +
    lab(686, 262, 'S字') + lab(300, 238, 'クランク') + lab(256, 420, '坂道') +
    stop(712, 165) + stop(500, 470) + stop(640, 470) +
    '<g transform="translate(940 600)"><circle r="17" fill="#fff" stroke="#24333d" stroke-width="2"/><path d="M0 -12 L6 4 L0 0 L-6 4Z" fill="#e53935"/><text y="12" text-anchor="middle" font-size="10" font-weight="900" fill="#24333d">北</text></g>';

  function roads() {
    var R = [
      ['M 190 45 L 810 45 Q 950 45 950 185 L 950 455 Q 950 595 810 595 L 190 595 Q 50 595 50 455 L 50 185 Q 50 45 190 45 Z', 76],
      ['M 218 150 L 782 150 Q 800 150 800 168 L 800 472 Q 800 490 782 490 L 218 490 Q 200 490 200 472 L 200 168 Q 200 150 218 150 Z', 40],
      ['M 200 320 L 800 320', 40],
      ['M 400 150 L 400 595', 40],
      ['M 640 320 L 640 595', 40],
      ['M 500 320 L 500 490', 40],
      ['M 300 352 L 400 352', 34],
      ['M 300 352 L 300 490', 36],
      ['M 620 320 C 670 320 600 240 680 232 C 760 224 690 150 745 150', 34],
      ['M 340 150 L 340 205 L 290 205 L 290 262 L 250 262 L 250 320', 34]
    ];
    function layer(color, extra) {
      return R.map(function (r) { return '<path d="' + r[0] + '" fill="none" stroke="' + color + '" stroke-width="' + (r[1] + extra) + '" stroke-linejoin="round"/>'; }).join('');
    }
    return layer('#ffffff', 8) + layer('#7d868d', 0);
  }
  function lab(x, y, t, bg, fg) {
    var w = t.length * 15 + 14;
    return '<g><rect x="' + (x - w / 2) + '" y="' + (y - 12) + '" width="' + w + '" height="24" rx="12" fill="' + (bg || '#fff') + '" stroke="#24333d" stroke-width="1.5"/>' +
      '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="14" font-weight="800" fill="' + (fg || '#24333d') + '">' + t + '</text></g>';
  }
  function stop(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-11 -9 L11 -9 L0 10Z" fill="#e53935" stroke="#fff" stroke-width="1.5"/><text y="-1" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff">止</text></g>';
  }

  function render(el) {
    var C = COURSES[el.dataset.course]; if (!C) return;
    var n = C.steps.length, cur = 0;
    var defs = '<defs><pattern id="cm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#b7bec4"/><line x1="0" y1="0" x2="0" y2="6" stroke="#6f777d" stroke-width="2"/></pattern>' +
      '<marker id="cm-ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff6a00"/></marker>' +
      '<marker id="cm-ahg" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1f9fe0"/></marker></defs>';
    var btns = '<button type="button" data-s="all">全体</button>' + C.steps.map(function (_, i) { return '<button type="button" data-s="' + i + '">' + '①②③④⑤⑥⑦⑧⑨'[i] + '</button>'; }).join('');
    el.innerHTML = '<div class="cm-tabs" role="group" aria-label="走行順路の段階">' + btns + '</div>' +
      '<svg class="cm-svg" viewBox="0 0 1000 640" role="img" aria-label="' + C.title + 'の走行順路">' + defs + BASE + '<g class="cm-route"></g></svg>' +
      '<div class="cm-cap"><p class="cm-text"></p><div class="cm-nav"><button type="button" data-nav="-1">‹ 前へ</button><button type="button" data-nav="1">次へ ›</button></div></div>';
    var g = el.querySelector('.cm-route'), txt = el.querySelector('.cm-text');
    function path(d, done) {
      return '<path d="' + d + '" fill="none" stroke="' + (done ? '#1f9fe0' : '#ff6a00') + '" stroke-width="' + (done ? 6 : 8) + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (done ? .45 : 1) + '"' +
        (done ? '' : ' stroke-dasharray="1 0" marker-end="url(#cm-ah)" class="cm-active"') + '/>';
    }
    function show(s) {
      cur = s;
      el.querySelectorAll('[data-s]').forEach(function (b) { b.classList.toggle('on', String(s) === b.dataset.s); });
      if (s === 'all') {
        g.innerHTML = C.steps.map(function (st) { return path(st.d, false); }).join('');
        txt.innerHTML = '<b>' + C.title + '：全体の順路</b>' + '①〜⑥のボタンで、順番に確認できます。';
      } else {
        g.innerHTML = C.steps.slice(0, s).map(function (st) { return path(st.d, true); }).join('') + path(C.steps[s].d, false);
        txt.innerHTML = '<b>' + '①②③④⑤⑥⑦⑧⑨'[s] + '（' + (s + 1) + ' / ' + n + '）</b>' + C.steps[s].text;
      }
      el.querySelector('[data-nav="-1"]').disabled = s === 'all' || s === 0;
      el.querySelector('[data-nav="1"]').disabled = s !== 'all' && s === n - 1;
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.s) show(b.dataset.s === 'all' ? 'all' : +b.dataset.s);
      else if (b.dataset.nav) show(cur === 'all' ? 0 : Math.max(0, Math.min(n - 1, cur + +b.dataset.nav)));
    });
    show(0);
  }
  document.querySelectorAll('.cm[data-course]').forEach(render);
})();
