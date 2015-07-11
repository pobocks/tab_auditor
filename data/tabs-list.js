"use strict";

self.port.on("show", function (tab_data) {
  document.getElementById("tabslist").innerHTML =
    [for (td of tab_data) '<li data-id="' + td.id + '">' + td.title + " (" + td.url + ")</li>"].join("\n");

  var redraw = (e) => {
    e.stopPropagation();
    e.preventDefault();

    var val = e.target.value.replace(/\\/, "\\\\"),
        re,
        filter = document.getElementById("filter"),
        shown = document.getElementById('shown'),
        els = document.getElementById("tabslist").children,
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
        if (el.textContent.match(re)) {
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

  filter.addEventListener("keyup", redraw);
  document.getElementById('kill').addEventListener("click", function (e) {
    e.preventDefault();
    filter.value = '';
    self.port.emit("kill", [for (li of document.querySelectorAll('#tabslist li.selected')) li.dataset.id]);
  });

  filter.dispatchEvent(new KeyboardEvent('keyup', {cancelable: true, bubbles: true}));
});
