var data = require("sdk/self").data;
var btns = require("sdk/ui/button/action");
var { viewFor } = require("sdk/view/core");
var browserWindows = require("sdk/windows").browserWindows

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

        /* Redisplay on changes in tabs */
        tabs.on("close", function (data) {worker.port.emit("show", datafy(this))});
        tabs.on("ready", function (data) {worker.port.emit("show", datafy(this))});
        tabs.on("open", function (data) {worker.port.emit("show", datafy(this))});

        worker.port.emit('show', datafy(tabs));

        worker.port.on("kill", (data) => {
          for (my_id of data) {
            for (tab of tabs) {
              if (tab.id === my_id) {
                tab.close();
              }
            }
          }
          worker.port.emit("show", datafy(tabs));

        });

        worker.port.on("collect", (data) => {
          let newWindow,
              start_idx,
              len = data.length;
          for (start_idx = 0;start_idx < len;start_idx++) {
            for (tab of tabs) {
              if (tab.id === data[start_idx]) {
                if (!newWindow) {
                  newWindow = browserWindows.open(tab.url);
                  tab.close();

                  // HAX: Window doesn't have a gBrowser when initially returned,
                  //      so the rest of the group has to be opened in handler
                  data.splice(start_idx, 1);
                  newWindow.on('open', function (w) {
                    for (let my_id of data) {
                      for (tab of tabs) {
                        if (tab.id === my_id) {
                          newWindow.tabs.open(tab.url);
                          tab.close();
                        }
                      }
                    }
                  });
                  break;
                }

              }
            }
          }
          if (newWindow) {
            worker.port.emit("show", datafy(tabs));
          }
        });

      }});
  }
});
