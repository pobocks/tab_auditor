"use strict";

(function () {

  var filter = document.getElementById("filter"),
      shown = document.getElementById('shown'),
      tabslist = document.getElementById("tabslist");

  var redraw = (e) => {
    e.stopPropagation();
    e.preventDefault();

    var val = e.target.value.replace(/\\/, "\\\\"),
        re,
        els = tabslist.children,
        i;

    try {
      re = RegExp(val, "i");
    }
    catch (e) {
      re = null;
    }

    i = 0;
    if (!val || !re) {
      for (var el of els) {
        i++;
        el.className = '';
      }

      shown.textContent = "All " + i + " tabs shown";
    }
    else {
      i = 0;
      for (var el of els){
        if (el.querySelector('.label') && el.querySelector('.label').textContent.match(re)) {
          i++;
          el.className = "selected";
        }
        else {
          el.className = 'unselected';
        }
      }
      shown.textContent = "" + i + " of " + els.length + " tabs selected";
    }
  };

  self.port.on("show", function (tab_data) {
    document.getElementById("tabslist").innerHTML =
      [for (td of tab_data) `<li data-id="${td.id}"><span class="label">${td.title} (${td.url})</span> <button class="kill">X</button></li>`].join("\n");
    filter.dispatchEvent(new KeyboardEvent('keyup', {cancelable: true, bubbles: true}));
  });

  filter.addEventListener("keyup", redraw);

  document.getElementById('kill').addEventListener("click", function (e) {
    e.preventDefault();
    filter.value = '';
    self.port.emit("kill", [for (li of document.querySelectorAll('#tabslist li.selected')) li.dataset.id]);
  });

  document.getElementById('dedup').addEventListener("click", function (e) {
    e.preventDefault();
    var query = filter.value ? '#tabslist li.selected' : '#tabslist li';

    self.port.emit("deduplicate", [for (li of document.querySelectorAll(query)) li.dataset.id]);
  });

  document.getElementById('collect').addEventListener("click", function (e) {
    e.preventDefault();
    filter.value = '';
    self.port.emit("collect", [for (li of document.querySelectorAll('#tabslist li.selected')) li.dataset.id]);
  });


  tabslist.addEventListener('click', function (e) {
    var me = e.originalTarget;
    e.preventDefault();

    if (me.classList.contains('kill')) {
      self.port.emit('kill', [me.parentElement.dataset.id]);
    }
  });

})();
