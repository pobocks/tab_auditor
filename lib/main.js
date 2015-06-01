var data = require("sdk/self").data;
var btns = require("sdk/ui/button/action");
var { viewFor } = require("sdk/view/core");
var browserWindow = require("sdk/windows").browserWindows.activeWindow;

var ui = require("sdk/ui");
var pWorker;

var tabs_list = ui.Sidebar({
  id: 'tab_auditor',
  title: 'Tab Auditor',
  url: data.url("tabs-list.html"),
  onReady: (worker) => {
    pWorker = worker;
    var tab_data = [for (tab of browserWindow.tabs) {title: tab.title, url: tab.url}];
    worker.port.emit("show", tab_data);
  }
});

var button = btns.ActionButton({
  id: "tabitha",
  label: "Tabitha",
  icon: "./icon-16.png",
  onClick: () => { tabs_list.show() }
});
