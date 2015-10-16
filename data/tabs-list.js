"use strict";

(function () {

  var ui = {
    filter: document.getElementById("filter"),
    shown: document.getElementById('shown'),
    tabslist: document.getElementById("tabslist")
  };

  var redraw = (e) => {
    e.stopPropagation();
    e.preventDefault();

    var val = e.target.value,
        re,
        els = ui.tabslist.children,
        i;

    try { re = RegExp(val, "i") } catch (e) { re = null }

    i = 0;
    if (!val || !re) {
      for (var el of els) {
        i++;
        el.className = '';
      }
    }
    else {
      for (var el of els){
        if (el.querySelector('.label') && el.querySelector('.label').textContent.match(re)) {
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

  self.port.on("show", function (tab_data) {
    document.getElementById("tabslist").innerHTML =
      [for (td of tab_data)
        `<li data-id="${td.id}">
           <span class="label">${td.title} (${td.url})</span>
           <button class="kill"><i class="fa fa-close"></i></button>
         </li>`].join("\n");

    // Trigger redraw by triggering filter
    ui.filter.dispatchEvent(new KeyboardEvent('keyup', {cancelable: true, bubbles: true}));
  });

  ui.filter.addEventListener("keyup", redraw);

  // Bulk kill selected tabs
  document.getElementById('kill').addEventListener("click", function (e) {
    e.preventDefault();
    ui.filter.value = '';
    self.port.emit("kill", [for (li of document.querySelectorAll('#tabslist li.selected')) li.dataset.id]);
  });

  // Deduplicate selected (or all)
  document.getElementById('dedup').addEventListener("click", function (e) {
    e.preventDefault();
    var query = ui.filter.value ? '#tabslist li.selected' : '#tabslist li';

    self.port.emit("deduplicate", [for (li of document.querySelectorAll(query)) li.dataset.id]);
  });

  // Collect selected tabs into new window
  document.getElementById('collect').addEventListener("click", function (e) {
    e.preventDefault();
    ui.filter.value = '';
    self.port.emit("collect", [for (li of document.querySelectorAll('#tabslist li.selected')) li.dataset.id]);
  });

  // Individual kill buttons
  ui.tabslist.addEventListener('click', function (e) {
    var me = e.originalTarget;
    e.preventDefault();

    if (me.classList.contains('kill')) {
      self.port.emit('kill', [me.parentElement.dataset.id]);
    }
  });

})();
