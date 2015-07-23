var data = require("sdk/self").data;
var btns = require("sdk/ui/button/action");
var { viewFor } = require("sdk/view/core");
var browserWindows = require("sdk/windows").browserWindows;
var { setTimeout, clearTimeout } = require('sdk/timers');

var ui = require("sdk/ui");

var datafy = function (bwt) {
  return [for (tab of bwt) if (tab.title !== 'Tab Auditor') {id: tab.id, title: tab.title, url: tab.url}];
}

var button = btns.ActionButton({
  id: "tabitha",
  label: "Tabitha",
  icon: "./icon-16.png",
  onClick: () => {
    var tabs = browserWindows.activeWindow.tabs;

    var tabs_list = tabs.open({
      url: data.url("tabs-list.html"),
      onReady: (tab) => {
        var worker = tab.attach({ contentScriptFile: data.url("tabs-list.js") });

        var show_TO;
        var redisplay = function () {
          clearTimeout(show_TO);
          show_TO = setTimeout(() => { worker.port.emit("show", datafy(this))}, 200);
        }

        /* Redisplay on changes in tabs */
        tabs.on("close", redisplay);
        tabs.on("ready", redisplay);
        tabs.on("open", redisplay);

        worker.port.emit('show', datafy(tabs));

        worker.port.on("kill", (data) => {
          let my_ids = new Set(data);
          for (tab of tabs) {
            if (my_ids.has(tab.id)) {
              tab.close();
            }
          }
          worker.port.emit("show", datafy(tabs));

        });

        worker.port.on("collect", (data) => {
          let newWindow,
              collectables = new Set(data);
          for (tab of tabs) { // outer
            if (collectables.has(tab.id)) {
              newWindow = browserWindows.open(tab.url);
              tab.close();

              // HAX: Window doesn't have a gBrowser when initially returned,
              //      so the rest of the group has to be opened in handler
              newWindow.on('open', function (w) {

                for (tab of tabs) {
                  if (collectables.has(tab.id)) {
                    newWindow.tabs.open(tab.url);
                    tab.close();
                  }
                }
              });
              break; // ref:outer
            }
          }

          if (newWindow) {
            worker.port.emit("show", datafy(tabs));
          }
        });

        worker.port.on('deduplicate', function (data) {
          let dups = new Set(),
              selection = new Set(data);

          for (let tab of tabs) {
            if (selection.has(tab.id)) {
              if (dups.has(tab.url)) {
                tab.close();
              }
              else {
                dups.add(tab.url);
              }
            }
          }

          worker.port.emit("show", datafy(tabs));
        });
      }
    });
  }});
