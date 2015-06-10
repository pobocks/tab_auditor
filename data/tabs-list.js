"use strict";

addon.port.on("show", function (tab_data) {
  document.getElementById("tabslist").innerHTML = "<li>" +
    [for (td of tab_data) td.title + " (" + td.url + ")"].join("</li><li>") +
    "</li>";

  var redraw = (e) => {
    e.stopPropagation();
    e.preventDefault();

    var val = e.target.value.replace(/\\/, "\\\\"),
        re,
        filter = document.getElementById("filter"),
        shown = document.getElementById('shown'),
        els = document.getElementById("tabslist").childNodes;

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

  };

  filter.addEventListener("keyup", redraw);

});
