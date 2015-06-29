var data = require("sdk/self").data;
var btns = require("sdk/ui/button/action");
var { viewFor } = require("sdk/view/core");
var browserWindows = require("sdk/windows").browserWindows

var ui = require("sdk/ui");
var pWorker;

var datafy = function (bwt) {
  return [for (tab of bwt) {id: tab.id, title: tab.title, url: tab.url}];
}

var tabs_list = ui.Sidebar({
  id: 'tab_auditor',
  title: 'Tab Auditor',
  url: data.url("tabs-list.html"),
  onReady: (worker) => {
    pWorker = worker;
    var browserWindow = browserWindows.activeWindow;
    var tab_data = datafy(browserWindow.tabs);
    browserWindow.tabs.on("close", (data)=> {worker.port.emit("show", datafy(browserWindow.tabs))});
    browserWindow.tabs.on("open", (data)=> {worker.port.emit("show", datafy(browserWindow.tabs))});

    worker.port.emit("show", tab_data);
    worker.port.on("kill", (data) => {
      for (my_id of data) {
        for (tab of browserWindow.tabs) {
          if (tab.id === my_id) {
            tab.close();
          }
        }
      }
      let tab_data = [for (tab of browserWindow.tabs) {id: tab.id, title: tab.title, url: tab.url}];
      worker.port.emit("show", tab_data);
    })
  }
});


var button = btns.ActionButton({
  id: "tabitha",
  label: "Tabitha",
  icon: "./icon-16.png",
  onClick: () => { tabs_list.show() }
});
