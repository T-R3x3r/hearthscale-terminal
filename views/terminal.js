/**
 * The Terminal app's page: the person's own live shell, which Hearthscale
 * draws over the whole page in a `terminal` slot and opens in a folder the
 * person gave the app. The page names its tab after that folder and never
 * sees what is typed there. Until the person has given a folder, the page
 * offers the folder pick.
 */
import {
  App,
  McpUiMessageResultSchema as Answer,
  PostMessageTransport,
} from '@modelcontextprotocol/ext-apps';

const SHEET = `
html, body, .terminal-root { height: 100%; margin: 0; }
.terminal-glyph { display: block; flex: none; width: 1em; height: 1em; line-height: 1; }
.hs-empty-view > .terminal-glyph { color: var(--dim); margin-bottom: var(--space); }
.hs-shell .hs-button:active .terminal-glyph { transform: var(--press); opacity: var(--press-fade); }
`;

const app = new App({ name: 'Terminal', version: '1.1.0' }, {}, { autoResize: false });

/** One request of the host, its result whole. */
const call = (method, params = {}) => app.request({ method, params }, Answer);

/** A Remix Icon by its remixicon.com name, at a size in pixels. */
function glyph(name, size) {
  const mark = document.createElement('i');
  mark.className = `ri-${name} terminal-glyph`;
  mark.style.fontSize = `${size}px`;
  mark.setAttribute('aria-hidden', 'true');
  return mark;
}

const root = document.createElement('div');
root.className = 'terminal-root';

/** The folder the shell starts in: the last one the person gave the app,
 *  not the app's own data folder. */
const folderOf = (mounts) => mounts.filter((m) => m.handle !== 'data').at(-1)?.path ?? null;

/** The page's one slot, the shell over the whole page, or none. */
const place = (cwd) =>
  call('hearthscale/ui/slots', {
    slots:
      cwd === null
        ? []
        : [
            {
              id: 'shell',
              kind: 'terminal',
              cwd,
              insets: { left: 0, top: 0, right: 0, bottom: 0 },
            },
          ],
  });

/** The pick of a folder, on the person's click. The shell that starts
 *  there is the person's own and can change what is in it, so the picker
 *  and the app's settings page name read and change. */
async function pick() {
  const { mount } = await call('hearthscale/roots/request', {
    purpose: 'Choose the folder your shell starts in',
    shape: 'folder',
    mode: 'read-write',
  });
  if (mount) show(mount.path);
}

/** The longest title `hearthscale/ui/set-tab` takes. */
const TAB_TITLE_CHARS = 200;

/** Names the tab the page fills after the folder the shell starts in, or
 *  gives back the surface's title while no folder is given. */
async function name(cwd) {
  const folder = cwd === null ? null : (cwd.split(/[\\/]/).filter(Boolean).pop() ?? cwd);
  await call('hearthscale/ui/set-tab', { title: folder?.slice(0, TAB_TITLE_CHARS) ?? null });
}

/** The shell in `cwd`, or the pick while no folder is given. */
function show(cwd) {
  root.replaceChildren();
  if (cwd === null) {
    const empty = document.createElement('div');
    empty.className = 'hs-empty-view';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hs-button';
    button.dataset.variant = 'secondary';
    button.dataset.size = 'sm';
    button.append(glyph('folder-open-line', 14), 'Choose a folder');
    button.addEventListener('click', () => void pick());
    empty.append(glyph('terminal-box-line', 30), button);
    root.append(empty);
  }
  void place(cwd);
  // A refusal leaves the tab the title it has.
  name(cwd).catch(() => {});
}

const style = document.createElement('style');
style.textContent = SHEET;
document.head.append(style);
document.body.append(root);

await app.connect(new PostMessageTransport(window.parent, window.parent));
const { mounts } = await call('hearthscale/roots/list');
show(folderOf(mounts));
