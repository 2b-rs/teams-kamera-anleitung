/* Logo-Plaetze: zeigt Dateien aus logos/ (svg oder png) an, falls vorhanden.
   apple -> hinter "Mac", microsoft-teams -> vor "Microsoft Teams",
   microsoft -> in der Kopfzeile der Startseite, system-settings -> vor dem Systemeinstellungen-Pfad. */
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
    load(name, function (url) {
      var el = document.createElement('img');
      el.src = url; el.alt = ''; el.setAttribute('aria-hidden', 'true');
      el.className = 'lg ' + cls;
      if (!place.done) { place.done = true; place(el); }
    });
  }
  var css = document.createElement('style');
  css.textContent =
    '.lg{display:inline-block;width:auto;max-width:none;object-fit:contain}' +
    'h1 .lg-mac{height:.78em;margin-left:.2em;vertical-align:-.04em}' +
    '.lg-teams{height:1.05em;margin-right:.35em;vertical-align:-.18em}' +
    'h1 .lg-teams{height:.85em;vertical-align:-.08em}' +
    '.lg-ms{height:1.3em;margin-left:.6em;vertical-align:-.3em}' +
    '.lg-sys{height:1.35em;margin-right:.35em;vertical-align:-.32em;border-radius:22%}';
  document.head.appendChild(css);

  function decorate() {
    var copy = document.getElementById('copy');
    if (!copy) return;
    var h1 = copy.querySelector('h1'), sub = copy.querySelector('.sub'), kicker = copy.querySelector('.kicker');
    if (h1 && /\bMac\s*$/.test(h1.textContent) && !h1.querySelector('.lg-mac'))
      logo('apple', 'lg-mac', function (el) { h1.appendChild(el); });
    if (sub && /Microsoft Teams/.test(sub.textContent) && !sub.querySelector('.lg-teams'))
      logo('microsoft-teams', 'lg-teams', function (el) { sub.insertBefore(el, sub.firstChild); });
    if (sub && kicker && !kicker.querySelector('.lg-ms'))
      logo('microsoft', 'lg-ms', function (el) { kicker.appendChild(el); });
    if (h1 && !sub && /Microsoft Teams/.test(h1.textContent) && !h1.querySelector('.lg-teams'))
      logo('microsoft-teams', 'lg-teams', function (el) { h1.insertBefore(el, h1.firstChild); });
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
