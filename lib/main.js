var data = require("sdk/self").data;
var btns = require("sdk/ui/button/action");
var { viewFor } = require("sdk/view/core");
var browserWindow = require("sdk/windows").browserWindows.activeWindow;

var tabs_list = require("sdk/panel").Panel({
  contentURL: data.url("tabs-list.html"),
  contentScriptFile: data.url("tabs-list.js")
});

var button = btns.ActionButton({
  id: "tabitha",
  label: "Tabitha",
  icon: "./icon-16.png",
  onClick: showTabsList
});

function showTabsList(state) {
  tabs_list.show();
}

tabs_list.on("show", ()=> {
  var tab_data = [for (tab of browserWindow.tabs) {title: tab.title, url: tab.url}];
  tabs_list.port.emit("show", tab_data);

});

function handleClick(state) {
  let str = viewFor(browserWindow).prompt("Kill tabs matching this regex:");
  if (str) {
    str = str.replace(/\\/, "\\\\");
    for (let tab of browserWindow.tabs) {
      if (tab.url.match(RegExp(str))){
        console.log(tab.title, tab.url);
      }
    }
  }
}
