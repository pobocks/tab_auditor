"use strict";

addon.port.on("show", function (tab_data) {
  document.getElementById("tabslist").innerHTML = "<li>" +
    [for (td of tab_data) td.title + " (" + td.url + ")"].join("</li><li>") +
    "</li>";

  document.getElementById("filter").addEventListener("keyup", (e) => {
    e.stopPropagation();
    e.preventDefault();

    var val = e.target.value.replace(/\\/, "\\\\"),
        els = document.getElementById("tabslist").childNodes,
        re;

    try {
      re = RegExp(val);
    }
    catch (e) {
      re = null;
    }
    Array.prototype.map.bind(els)( (el, i) => {
      if (!val || !re) {
        el.className = '';
      }
      else if (el.textContent.match(re)) {
        el.className = "highlight";
      }
      else {
        el.className = '';
      }
    });
  });
});
