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
        shown = document.getElementById('shown'),
        re,
        unselected;

    try {
      re = RegExp(val);
    }
    catch (e) {
      re = null;
    }

    var i = 0;
    if (!val || !re) {
      for (var el of els) {
        i++;
        el.className = (i <= 10 ? '' : 'hidden');
      }
      if (i <= 10) {
        shown.textContent = "All " + i + " tabs shown";
      }
      else {
        shown.textContent = "10 of " + i + " tabs shown";
      }
    }
    else {

      for (var el of els){
        if (el.textContent.match(re)) {
          i++;
          el.className = (i <= 10 ? "selected" : "selected hidden");
        }
        else {
          el.className = 'unselected';
        }
      }


      if (i <= 10) {
        shown.textContent = "" + i + " tabs selected";
      }
      else {
        shown.textContent = "" + 10 + " shown of " + i + " tabs selected";
      }
    }

  });
});
