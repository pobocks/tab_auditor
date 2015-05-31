"use strict";

self.port.on("show", (tab_data)=> {
  document.getElementById("tabslist").innerHTML = "<li>" +
    [for (td of tab_data) td.title + " (" + td.url + ")"].join("</li><li>") +
    "</li>";
});
