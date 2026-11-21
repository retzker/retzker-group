// Retzker Group website: publication filters and the Ramsey-fringe drawing on the home page.
(function () {
  'use strict';

  // ---- publications: filter by type + search
  var list = document.querySelector('.pub-page');
  if (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll('.pub'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter'));
    var input = document.getElementById('pub-search');
    var count = document.getElementById('pub-count');
    var empty = document.getElementById('pub-empty');
    var kind = 'all';

    var apply = function () {
      var words = (input.value || '').toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;
      items.forEach(function (li) {
        var ok = (kind === 'all' || li.getAttribute('data-kind') === kind) &&
          words.every(function (w) { return li.getAttribute('data-search').indexOf(w) !== -1; });
        li.hidden = !ok;
        if (ok) shown++;
      });
      list.querySelectorAll('.year-group, .pub-section').forEach(function (g) {
        g.hidden = !g.querySelector('.pub:not([hidden])');
      });
      count.textContent = shown === items.length ? '' : 'Showing ' + shown + ' of ' + items.length + '.';
      empty.hidden = shown !== 0;
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        kind = b.getAttribute('data-filter');
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        apply();
      });
    });
    input.addEventListener('input', apply);
  }

  // ---- home: a Ramsey fringe (cos oscillation under a T2 decay envelope)
  var canvas = document.getElementById('trace');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var colors = function () {
      var s = getComputedStyle(document.documentElement);
      return { accent: s.getPropertyValue('--accent').trim() || '#1f4e79',
               rule: s.getPropertyValue('--rule').trim() || '#d5dde7',
               muted: s.getPropertyValue('--muted').trim() || '#586577' };
    };
    var draw = function (phase) {
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.clientWidth || 640, h = canvas.clientHeight || 360;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var c = colors(), padL = 34, padR = 8, padT = 12, padB = 26;
      var x0 = padL, x1 = w - padR, mid = padT + (h - padT - padB) / 2, amp = (h - padT - padB) / 2;
      // axes
      ctx.strokeStyle = c.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, padT); ctx.lineTo(x0, h - padB); ctx.lineTo(x1, h - padB); ctx.stroke();
      ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x0, mid); ctx.lineTo(x1, mid); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.muted; ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
      ctx.fillText('1', x0 - 8, padT + 4); ctx.fillText('\xbd', x0 - 8, mid); ctx.fillText('0', x0 - 8, h - padB - 4);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('free evolution time \u03c4', x0, h - 6);
      ctx.textAlign = 'right'; ctx.fillText('P(\u2191)', x1, padT + 10);
      // envelope
      var T2 = 0.42, f = 9.5, N = 360;
      ctx.strokeStyle = c.muted; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      [1, -1].forEach(function (sgn) {
        ctx.beginPath();
        for (var i = 0; i <= N; i++) {
          var t = i / N, y = mid - sgn * amp * 0.92 * Math.exp(-t / T2);
          var x = x0 + t * (x1 - x0);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // fringe
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (var j = 0; j <= N * 2; j++) {
        var t2 = j / (N * 2);
        var y2 = mid - amp * 0.92 * Math.exp(-t2 / T2) * Math.cos(2 * Math.PI * f * t2 + phase);
        var xx = x0 + t2 * (x1 - x0);
        j ? ctx.lineTo(xx, y2) : ctx.moveTo(xx, y2);
      }
      ctx.stroke();
      // sample points, as a measured signal would have
      ctx.fillStyle = c.accent;
      for (var k = 0; k <= 56; k++) {
        var t3 = k / 56;
        var y3 = mid - amp * 0.92 * Math.exp(-t3 / T2) * Math.cos(2 * Math.PI * f * t3 + phase);
        ctx.beginPath(); ctx.arc(x0 + t3 * (x1 - x0), y3, 2.1, 0, 2 * Math.PI); ctx.fill();
      }
    };
    var phase = 0, last = 0;
    var tick = function (ts) {
      if (ts - last > 40) { phase += 0.035; draw(phase); last = ts; }
      requestAnimationFrame(tick);
    };
    draw(0);
    if (!reduce && window.requestAnimationFrame) requestAnimationFrame(tick);
    window.addEventListener('resize', function () { draw(phase); });
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', function () { draw(phase); });
    }
  }
})();
