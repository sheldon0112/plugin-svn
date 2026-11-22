# SVN Management Panel for CC GUI

[简体中文](README.md) | [English](README.en.md)

Manage local Subversion working copies inside CC GUI: inspect changes, browse history, compare diffs, view line-by-line blame, commit changes, and resolve conflicts.

- **Personal repository**: [sheldon0112/plugin-svn](https://github.com/sheldon0112/plugin-svn)
- **Author**: AnnoDomini
- **Current version**: `0.2.1`
- **Plugin ID**: `ccgui-svn`
- **Minimum host version**: CC GUI `1.2.4`, plugin SDK `^0.3`
- **License**: [MIT](LICENSE)

Compatibility: verified on a real Windows 11 machine (CC GUI `1.2.4` + TortoiseSVN 1.14.2) and covered by macOS CI; other platforms are future extensions. See the [0.2.1 delivery notes](docs/release-0.2.1.md).

## Features

| Feature | Description |
| --- | --- |
| Workspace selection | Select local SVN working copies registered in CC GUI |
| Local changes | Filter by status or path, inspect content and property changes, and select target paths |
| Server comparison | Use `svn status -u` to show incoming changes alongside file status |
| Diff preview | Inspect working-copy, revision-wide, or individual-file diffs, with wrapping and copying |
| History search | Filter by author, keyword, path, or date; load 20 revision summaries at a time and fetch changed paths on demand |
| Line-by-line blame | View repository revisions and authors per line, then open revision diffs |
| Working-copy operations | Update, clean up, add, revert, delete, and commit selected changes |
| Conflict workbench | Identify text, property, and tree conflicts; inspect local and incoming text changes and confirm resolutions |
| Ignore rules | Append rules for unversioned paths to their parent directory’s `svn:ignore` |
| File locks | Inspect repository locks, lock files, and release valid locks held by the current working copy |
| Branches and tags | Switch the working copy to a repository-relative path |
| Language and theme | Simplified Chinese and English; follow CC GUI’s language and light, dark, or system theme settings |

## Installation

### Prerequisites

1. Install CC GUI `1.2.4` or later.
2. Install the Subversion command-line client and ensure CC GUI can find `svn`:

   ```bash
   svn --version
   ```

3. Prepare an existing local SVN checkout and open or register it in CC GUI. Authentication is handled by the local SVN client; first verify repository access from a terminal.

### Install from a local directory

```bash
git clone https://github.com/sheldon0112/plugin-svn.git
```

Alternatively, download a ZIP from the repository page and extract it.

1. Open **Plugins → Install from local directory** in CC GUI’s sidebar.
2. Select the cloned or extracted plugin directory containing both `manifest.json` and `main.js`.
3. Review and grant the permissions requested by the host.
4. Open **SVN Management Panel** from the sidebar and select an SVN working copy from the **Workspace** dropdown.

The plugin is a self-contained ESM file. No `npm install` or build step is required to use it.

### Update and uninstall

- **Update**: Obtain the new files and install from the plugin directory again. The same plugin ID is replaced and hot-reloaded without restarting CC GUI.
- **Uninstall**: Remove the plugin from CC GUI’s Plugins page. The host retains plugin data for 30 days.

## Usage

### Review and commit changes

1. Refresh **Changes**, then filter files by status or path.
2. Click a file to inspect its diff, or right-click for file history, blame, and other actions.
3. Add new files to version control, then select the changes to commit.
4. Click **Commit**, review the target paths, enter a message, and confirm. The commit dialog supports `Ctrl+Enter`.

Selected paths hidden by filters are included in the selection indicator. Review the confirmation dialog before committing. Reverting discards uncommitted local edits. Deleting a directory includes its children; repository deletion takes effect when committed.

**Compare with server** reads remote status without updating working-copy contents. Use **Update** to fetch changes.

### Browse history and blame

Set author, keyword, path, or date filters in **History**, then click **Search**. Keywords match commit messages and authors; use **Limit to path** to query a file or directory. Choose **Load older commits** to continue browsing.

Selecting a revision loads its changed paths. Open a revision-wide or individual-file diff from the details. Blame shows repository content and excludes uncommitted local edits.

### Resolve conflicts

Open **Conflicts**, or right-click a conflicted path to open the workbench. An update that detects conflicts also opens the workbench.

Review local diffs and incoming text changes before choosing a resolution. Resolve property and tree conflicts manually in the working copy first, then choose **Resolved manually; keep the current state**. Commit the resolution afterward as needed.

### Add ignore rules

Right-click an unversioned path in **Changes** and choose **Add ignore rule**. The rule is appended to the parent directory’s `svn:ignore` property. Commit that directory’s property change to share it with the team.

### Manage file locks

Click **File lock** and enter a file path relative to the working-copy root, or check a file’s lock from the Changes context menu. The dialog shows the repository lock owner and allows locking. Unlocking is available when the current working copy holds a valid lock.

**Clean up locks** runs `svn cleanup` to address working-copy locks and interrupted operations. It is separate from releasing a repository file lock.

### Switch branches or tags

Click **Switch branch or tag**, review the current path, and enter a repository-relative target, for example:

```text
^/trunk
^/branches/release
^/tags/v1.0
```

Before switching, resolve local changes, unversioned files, file locks held by the working copy, and switched child paths. Switching refreshes status and history. Switching supports working-copy root directory names containing `@`.

## Permissions and data

| Permission | Purpose |
| --- | --- |
| `ui:sidebar-entry` | Register the sidebar entry |
| `ui:center-tab` | Open the main panel tab |
| `host:workspace` | Read CC GUI’s workspace list |
| `theme` | Inject panel styles |
| `exec:svn` | Execute the local `svn` client through the host |
| `i18n` | Register interface translations |

The plugin has no separate upload service. Repository access and existing SVN credentials are handled by the local SVN client. Operations such as committing, locking, and unlocking access or modify the repository according to SVN command behavior.

## Limitations and troubleshooting

| Symptom | Checks and remedies |
| --- | --- |
| Installation fails or the entry is missing | Check the CC GUI version, selected directory, and permission or loading errors on the Plugins page |
| `svn` cannot be found | Install the command-line client and ensure the CC GUI process can locate the executable |
| No working copy is available | Open or register a local SVN working copy in CC GUI; run `svn info` in that directory to verify it |
| Authentication or connection failure | Run `svn info` and `svn status -u` against the same working copy in a terminal; check authentication, network access, and repository permissions |
| Working copy is locked | Ensure no other SVN operation is running, then use **Clean up locks** |
| Revision details fail to load | Revisions with many changed paths may exceed CC GUI’s command-output limit |
| No text diff for a binary file | The diff viewer displays text; binary files show an explanatory message |
| Diff display is truncated | Only part of the diff is rendered; try copying it. Available content remains subject to the host’s output limit |

## Development and verification

### Repository structure

```text
plugin-svn/
├── manifest.json       # Metadata, compatibility, and permissions
├── main.js             # Self-contained ESM entry, UI, and SVN operations
├── README.md           # Chinese documentation
├── README.en.md        # English documentation
├── LICENSE
└── test/
    ├── package.json
    ├── package-lock.json
    └── regression.mjs  # Mock-host and local SVN repository regression test
```

### Regression test

Requires Node.js `22.12+` (22.x) or `24+`, plus `npm`, `svn`, and `svnadmin`. Run from the repository root:

```bash
npm ci --prefix test
npm test --prefix test
```

Tests use a mocked CC GUI host and temporary local SVN repositories. The UI regression cleans up its repositories and simulates commits; extended.mjs preserves its fixture directory and tests actual commits. Real CC GUI host integration still requires separate verification.

After modifying the plugin, reinstall from the local directory and check workspace selection, language, theme, and the relevant SVN operations in CC GUI.

## Issues and contributions

Report bugs and suggestions through [GitHub Issues](https://github.com/sheldon0112/plugin-svn/issues). Include CC GUI, plugin, operating-system, and SVN versions, reproduction steps, and error messages. Redact credentials and private repository URLs from logs.

Pull requests are welcome. Keep the plugin entry self-contained and run the relevant regression tests for behavior changes.

## License

Distributed under the [MIT License](LICENSE), retaining upstream copyright and license notices.


