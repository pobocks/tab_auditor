exports.main = function (options, callbacks) {
  let data = require("sdk/self").data,
      btns = require("sdk/ui/button/action"),
      browserWindows = require("sdk/windows").browserWindows,
      { setTimeout, clearTimeout } = require('sdk/timers'),
      ui = require("sdk/ui"),
      ui_urls = { html: data.url('tabs-list.html'),
                  js: data.url('tabs-list.js') }

  let datafy = function (bwt) {
    return [for (tab of bwt) if (tab.title !== 'Tab Auditor') {id: tab.id, title: tab.title, url: tab.url}];
  }

  /* Attach backend to frontend, per-window */
  let attach_auditor = (tab) => {
    let worker = tab.attach({ contentScriptFile: ui_urls.js }),
        tabs = tab.window.tabs,
        show_TO,
        redisplay = function () {
          clearTimeout(show_TO);
          show_TO = setTimeout(() => { worker.port.emit("show", datafy(this))}, 200);
        }

    /* Redisplay on changes in tabs */
    tabs.on("close", redisplay);
    tabs.on("ready", redisplay);
    tabs.on("open", redisplay);

    worker.port.emit('show', datafy(tabs));

    /* Kill tabs with specified ids */
    worker.port.on("kill", (data) => {
      let my_ids = new Set(data);
      for (tab of tabs) {
        if (my_ids.has(tab.id)) {
          tab.close();
        }
      }
      worker.port.emit("show", datafy(tabs));
    });

    /* Collect specified tabs into new window        *
     *   Note: actually opens new tabs - moving tabs *
     *         seems to be unsupported by AddOn SDK  */
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

    /* Kill all but first tab with url */
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

  let button = btns.ActionButton({
    id: "tab-auditor",
    label: "Tab Auditor",
    icon: "./icon-16.png",
    onClick: () => {
      let tabs = browserWindows.activeWindow.tabs;
      if (tabs.activeTab.url === ui_urls.html){
        tabs.activeTab.close();
      }
      else {
        let tabs_list = null;
        for (let t of tabs) {
          if (t.url === ui_urls.html) {
            tabs_list = t;
            attach_auditor(t);
            t.activate();
            break;
          }
        }
        if (!tabs_list) {
          tabs_list = tabs.open({
            url: ui_urls.html,
            onReady: attach_auditor
          });
        }
      };
    }
  });

  /* Attach to existing auditor tabs, in case any
     were open when firefox last closed */
  for (w of browserWindows) {
    for (t of w.tabs) {
      if (t.url === ui_urls.html) {
        attach_auditor(t);
        break;
      }
    }
  };
};
