/* Logo-Plaetze: zeigt Dateien aus logos/ (svg oder png) links neben dem passenden Text an, falls vorhanden.
   apple -> vor "Mac", microsoft-teams (oder teams) -> vor "Microsoft Teams",
   system-settings (oder settings) -> vor dem Systemeinstellungen-Pfad. */
(function () {
  var found = {};
  function load(name, done) {
    if (name in found) { if (found[name]) done(found[name]); return; }
    var names = ({ 'microsoft-teams': ['microsoft-teams', 'teams'], 'system-settings': ['system-settings', 'settings'] })[name] || [name];
    var tries = [], i = 0;
    names.forEach(function (n) { tries.push('logos/' + n + '.svg', 'logos/' + n + '.png'); });
    (function next() {
      if (i >= tries.length) { found[name] = null; return; }
      var url = tries[i++], probe = new Image();
      probe.onload = function () { found[name] = url; done(url); };
      probe.onerror = next;
      probe.src = url;
    })();
  }
  function logo(name, cls, place) {
    var done = false;
    load(name, function (url) {
      if (done) return; done = true;
      var el = document.createElement('img');
      el.src = url; el.alt = ''; el.setAttribute('aria-hidden', 'true');
      el.className = 'lg ' + cls;
      place(el);
    });
  }
  /* put el directly in front of the first match of re inside root's text */
  function before(root, re, el) {
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), node, m;
    while ((node = walk.nextNode())) {
      m = node.nodeValue.match(re);
      if (m) {
        var word = node.splitText(m.index);
        word.splitText(m[0].split(' ')[0].length);
        var keep = document.createElement('span');
        keep.style.whiteSpace = 'nowrap';
        word.parentNode.insertBefore(keep, word);
        keep.appendChild(el); keep.appendChild(word);
        return;
      }
    }
  }
  var css = document.createElement('style');
  css.textContent =
    '.lg{display:inline-block;width:auto;max-width:none;object-fit:contain}' +
    '.lg-mac{height:.8em;margin-right:.14em;vertical-align:-.06em}' +
    '.lg-teams{height:.92em;margin-right:.22em;vertical-align:-.1em}' +
    '.sub .lg-teams{height:1.1em;vertical-align:-.2em}' +
    '.lg-sys{height:1.35em;margin-right:.35em;vertical-align:-.32em;border-radius:22%}' +
    '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .lg-mac{filter:invert(1)}}' +
    ':root[data-theme="dark"] .lg-mac{filter:invert(1)}';
  document.head.appendChild(css);

  function decorate() {
    var copy = document.getElementById('copy');
    if (!copy) return;
    Array.prototype.forEach.call(copy.querySelectorAll('h1, .sub'), function (h) {
      if (/\bMac\b/.test(h.textContent) && !h.querySelector('.lg-mac'))
        logo('apple', 'lg-mac', function (el) { before(h, /\bMac\b/, el); });
      if (/Microsoft Teams/.test(h.textContent) && !h.querySelector('.lg-teams'))
        logo('microsoft-teams', 'lg-teams', function (el) { before(h, /Microsoft Teams/, el); });
    });
    Array.prototype.forEach.call(copy.querySelectorAll('.path'), function (p) {
      if (/Systemeinstellungen|System Settings/.test(p.textContent) && !(p.previousSibling && p.previousSibling.className === 'lg lg-sys'))
        logo('system-settings', 'lg-sys', function (el) { p.parentNode.insertBefore(el, p); });
    });
  }
  function start() {
    var copy = document.getElementById('copy');
    if (!copy) return;
    new MutationObserver(function () { decorate(); }).observe(copy, { childList: true });
    decorate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
