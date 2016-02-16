"use strict";

(function () {

  let ui = {
    filter: document.getElementById("filter"),
    method: document.getElementById("filter-method"),
    shown: document.getElementById('shown'),
    tabslist: document.getElementById("tabslist")
  };

  let winrep = [];

  var tabs;

  /* Array of functions which return a regex to use
     for filtering tabs. */
  let filter_methods = {
    /* Matches strings with all positive tokens present
       and no negative tokens present */
    "Token": val => {
      let pos = [], neg = [],
          re_quote = /[-\/\\^$*+?.()|\[\]{}]/g,
          tokens = val.split(/\s+/),
          len = tokens.length;

      while (len--) {
        if (tokens[len].match(/^\^/)) {
          if (tokens[len] === '^') { continue; }
          neg.push(tokens[len].slice(1));
        }
        else {
          pos.push(tokens[len]);
        }
      }

      pos = pos.map(tok => `(?=.*${tok.replace(re_quote, '\\$&')})`).join('');
      neg = (neg.length > 0) ? `(^((?!${ neg.map(tok => tok.replace(re_quote, '\\$&')).join('|') }).)*$)$` : ''

      return '^' + pos + neg;
    },
    "Regex": val => {
      return val;
    }
  };

  // Redraw when filter-method changes
  ui.method.addEventListener('change', function (e) {
    ui.filter.dispatchEvent(new KeyboardEvent('keyup', {cancelable: true, bubbles: true}));
  });

  let redraw = (e) => {
    e.stopPropagation();
    e.preventDefault();

    let tgt      = e.target || ui.filter,
        val      = tgt.value,
        char_len = val.length,
        case_sen = "i",
        re,
        els      = ui.tabslist.children,
        i;

    // Case insensitive unless uppercase chars in string
    while (char_len--) {
      if (val[char_len] !== val[char_len].toLowerCase()) {
        case_sen = "";
        break;
      }
    }

    /* Val might not contain a working regex, because users input one char at  *
     * a time, or might just write bad regex. Ideally, perhaps, we'd strip any *
     * broken parts off the end of what we have, but for now we're just gonna  *
     * treat that case as "no regex"                                           */
    try { re = RegExp(filter_methods[ui.method.value](val), case_sen) } catch (e) { re = null }

    i = 0;
    if (!val || !re) {
      for (let el of els) {
        i++;
        el.className = '';
      }
    }
    else {
      for (let el of els){
        if (el.querySelector('.label') &&
            el.querySelector('.label').textContent.match(re)) {
          i++;
          el.className = "selected";
        }
        else { el.className = 'unselected' }
      }
    }

    let visible = document.querySelectorAll('#tabslist > li:not(.unselected)'),
        last = visible[visible.length - 1];
    if (last) { last.className += ' last' }

    ui.shown.textContent = (i === els.length) ?
      ui.shown.textContent = "All " + i + " tabs shown" :
      ui.shown.textContent = "" + i + " of " + els.length + " tabs selected";
  };

  let redraw_all = (e) => {
    e.stopPropagation();
    e.preventDefault();

    let tgt = e.target || ui.filter,
        val = tgt.value,
        re,
        els = document.querySelectorAll('#tabslist > li:not(.window-title)'),
        i;

    try { re = RegExp(filter_methods[ui.method.value](val), "i") } catch (e) { re = null }

    i = 0;
    if (!val || !re) {
      for (let el of els) {
        i++;
        el.className = '';
      }
    }
    else {
      for (let el of els){
        if (el.querySelector('.label') && el.querySelector('.label').textContent.match(re)) {
          i++;
          el.className = "selected";
        }
        else { el.className = 'unselected' }
      }
    }

    let visible = document.querySelectorAll('#tabslist > li:not(.unselected):not(.window-title)'),
        last = visible[visible.length - 1];
    if (last) { last.className += ' last' }

    ui.shown.textContent = (i === els.length) ?
      ui.shown.textContent = "All " + i + " tabs shown" :
      ui.shown.textContent = "" + i + " of " + els.length + " tabs selected";
  };
  self.port.on("populate", function (tab_data) {
    tabs = tab_data;
    show_f_all(tabs);
  });

  var show_f_all = function (w_data) {
    document.getElementById("tabslist").innerHTML =
      [for (w of w_data)
        [`<li class="window-title">${w.active ? 'Active ' : ''} Window ${w.window_id}</li>`].concat(
          [for (td of w.tabs)
           ((td.search_string = `${td.title} (${td.url})`),
            `<li data-id="${td.id}">
              <span class="label">${td.search_string}</span>
              <button class="thumb"><i class="fa fa-search"></i></button>
              <button class="kill"><i class="fa fa-close"></i></button>
           </li>`)]
        ).join("\n")
      ].join("\n");
    winrep = w_data;
    // Directly call redraw bc needs to be done immediately
    redraw_all(new KeyboardEvent('keyup', {cancelable: true, bubbles: true}));
  };

  self.port.on("show", show_f_all);

  var redraw_TO = null;
  ui.filter.addEventListener("keyup", function (e) {
    clearTimeout(redraw_TO);
    redraw_TO = setTimeout(redraw_all, 200, e);
  });

  // Bulk kill selected tabs
  document.getElementById('kill').addEventListener("click", function (e) {
    e.preventDefault();
    ui.filter.value = '';
    self.port.emit("kill", [for (li of document.querySelectorAll('#tabslist li.selected')) li.dataset.id]);
  });

  // Deduplicate selected (or all)
  document.getElementById('dedup').addEventListener("click", function (e) {
    e.preventDefault();
    let query = ui.filter.value ? '#tabslist li.selected' : '#tabslist li';

    self.port.emit("deduplicate", [for (li of document.querySelectorAll(query)) li.dataset.id]);
  });

  // Collect selected tabs into new window
  document.getElementById('collect').addEventListener("click", function (e) {
    e.preventDefault();
    ui.filter.value = '';
    self.port.emit("collect", [for (li of document.querySelectorAll('#tabslist li.selected')) li.dataset.id]);
  });

  // Collate selected tabs at end of window
  document.getElementById('collate').addEventListener("click", function (e) {
    e.preventDefault();
    ui.filter.value = '';
    self.port.emit("collate", [for (li of document.querySelectorAll('#tabslist li.selected')) li.dataset.id]);
  });

  // Individual kill and goto buttons
  ui.tabslist.addEventListener('click', function (e) {
    let me = e.originalTarget;
    e.preventDefault();

    if (me.classList.contains('kill')) {
      self.port.emit('kill', [me.parentElement.dataset.id]);
    }
    else if (me.classList.contains('thumb')){
      self.port.emit('goto', me.parentElement.dataset.id);
    }
  });

})();
