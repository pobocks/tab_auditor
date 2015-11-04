# Dev Notes

## Current Event Structure

### Overview

Tab Auditor is currently structured so that each window gets a separate auditor, and all searches are thus within one window.  There's also a lot of iteration through `browserWindow.tabs`, generating arrays of safe reps of all the tabs to pass to the frontend, etc.  Events are named stupidly, and need replacement badly.

### Backend (lib/main.js)

| Event Name  | Description                                           |
|-------------|-------------------------------------------------------|
| kill        | Close one or more tabs                                |
| collect     | Close one or more tabs, open their URLs in new window |
| deduplicate | Close all but first tab with the same URL             |
| goto        | Activate tab                                          |

Additionally, the backend tracks and responds to these events from the `tabs` object:

| Event Name | Description      |
|------------|------------------|
| close      | a tab is closed  |
| open       | a tab is opened  |
| ready      | a tab's ready event is fired (i.e. a tab is shown after browser restart) |

### Frontend (data/tab-list.js)

The frontend responds to a single event triggered by the backend, named `show`, which is a template-string driven draw of the representations of all tabs in a window.

The frontend has three functions - it displays or redisplays the representations of tabs passed from the backend via `show`, it passes events from the UI to the backend for processing, and it provides "client-side" regex filtering of elements based on data stored in the elements' datasets.

## Planned event structure

### Overview

Auditor will attach once, to the global `tabs` object, and will use a subordinate data structure or structures to keep track of id->index mapping, what window a tab belongs to, etc.  The tab_destructor will provide a unified view into all tabs managed by Firefox, OPTIONALLY filtered by window (and other criteria).

This structure will be synchronized with changes to the `tabs` object; the goal is to prevent iteration from being necessary to do things like kill or collect tabs.  Additionally, this should make it possible to keep more of the app's redraw behavior strictly "client side" - rather than an addition or close requiring an entire redraw, it should be possible to just add or remove the changed elements.

### Data structures

#### Representation map
Object (Map?) of either actual tab objects (if safe/sane) or positional refs to object positions in tabs, keyed by `tab.id`.  Possibly map of maps storing window info as `map[window-id][tab-id]`.  In the extremity, possibly multiple mappings - they should be fairly cheap to maintain even if large, since there only needs to be one copy of each during runtime.

Possibly wrap the different reps in an object which manages its own state - synching multiple refs on all relevant events could be hard or easy, depending on how FF handles things like tab ids (does tab id change after drag to new window?  Does tab position ever change?  If you close and reopen a tab, using the "recently closed" thingumie, does it have same or new id?

#### Diff/Op spec
Object representing a change to the list of tabs.

Questions:

- Can represent more than one kind of change? (e.g. kills and "moves" at same time)
- Strawman:


```javascript
  {
    event:   "eventName",
    kill:    [id, id, id],
    collect: [id, id, id],
    dedup:   [id, id, id]
  }
```
