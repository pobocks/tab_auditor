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
    var tabs_list = tabs.open({url: data.url("tabs-list.html"),
                               onReady: (tab) => {
                                 var worker = tab.attach({ contentScriptFile: data.url("tabs-list.js") });

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

                                   tabs.on("close", (data)=> {worker.port.emit("show", datafy(tabs))});
                                   tabs.on("open", (data)=> {worker.port.emit("show", datafy(tabs))});
                                 });

                               }});
  }
});
