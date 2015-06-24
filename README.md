# Tab Auditor

This addon is designed to deal with the author's terrible ADD-fueled tab accretion.

Basically, what this does is allow a user to select a group of tabs whose URI or title match a regex, and either close them or contiguously group them in the tab bar.

## Filtering/Finding methods
- Tab display
- Regex on title/URL(/meta? fulltext prob a bad idea)
- Time:Initial open
- Time:Last view (feasible?)

## To be implemented
- Contiguous grouping
  - sort by depth in routing hierarchy? (e.g. [www.e.com, www.e.com/one-thing, www.e.com/one/two])
- Actually killing tabs
- Break out tabs into new window/tab group
- Deduplication
