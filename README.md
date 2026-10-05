# Terminal

Your own shell in a tab, started in a folder you choose.

Terminal is an ordinary Hearthscale app. Nothing in the platform knows its
name; it installs from the Marketplace like any other app.

## Working on it

With a Hearthscale platform running on this machine:

```
hearthscale dev .
```

links this folder into the running platform, picks up every change, and
asks once in the window before any code runs.

## The view

Terminal shows one view, `views/terminal.js`, a module with no build step.
It places one `terminal` slot over the whole page, and Hearthscale draws
the person's own live shell there: the window opens the shell with its
own authority and the person's keys reach it from the window, so they
never pass through the app. The slot names the folder the shell starts
in, which must lie inside a folder the person gave the app; until there
is one, the page offers the folder pick (`roots` in `uses`).

The slot's id names the shell in its tab: the same tab takes up the same
shell while the platform holds it, and the shell ends with the tab.

## Releasing

Install the Hearthscale registry's GitHub App on this repository once. Then
every release whose tag equals `version` in `app.json` is picked up by the
Marketplace.

```
hearthscale pack .
```

builds the package to attach to the release.

## Licence

MIT. See `LICENSE`.
