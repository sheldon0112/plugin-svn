// CC GUI adaptation of EastChilde/dsh-svn. See LICENSE.
export default function activate(ctx) {
  const React = ctx.react
  const { useState, useEffect, useRef, useCallback, useMemo } = React
  const h = React.createElement

  ctx.theme.injectCss(`
.svn-root { font: inherit; color: CanvasText; --svn-accent: #4d6bfe; --svn-line: rgba(127,127,127,.22); --svn-soft: rgba(127,127,127,.08); --svn-hover: rgba(127,127,127,.13); --svn-muted: rgba(127,127,127,.95); }
.svn-root *, .svn-root *::before, .svn-root *::after { box-sizing: border-box; }
.svn-root button { font: inherit; color: inherit; }
.svn-center { height: 100%; min-height: 0; display: flex; flex-direction: column; }
.svn-workspace-picker { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-bottom: 1px solid var(--svn-line); }
.svn-workspace-picker select { max-width: 100%; }
.svn-shell { flex: 1; min-height: 0; background: Canvas; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.svn-head { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--svn-line); flex: none; }
.svn-logo { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg,#4d6bfe,#7a5cf0); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 12px; letter-spacing: .04em; flex: none; box-shadow: 0 3px 10px rgba(77,107,254,.35); }
.svn-headmain { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.svn-title { font-size: 14px; font-weight: 650; display: flex; align-items: center; gap: 8px; }
.svn-sub { font-size: 11.5px; color: var(--svn-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 520px; }
.svn-revpill { font-size: 10.5px; font-weight: 600; padding: 1px 7px; border-radius: 999px; background: rgba(77,107,254,.13); color: var(--svn-accent); border: 1px solid rgba(77,107,254,.25); }
.svn-head-actions { margin-left: auto; display: flex; align-items: center; gap: 6px; flex: none; }
.svn-busy { font-size: 11.5px; color: var(--svn-muted); display: inline-flex; align-items: center; gap: 6px; margin-right: 4px; }
.svn-spin { width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(127,127,127,.3); border-top-color: var(--svn-accent); display: inline-block; animation: svnspin .8s linear infinite; }
@keyframes svnspin { to { transform: rotate(360deg); } }
.svn-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 8px; border: 1px solid var(--svn-line); background: transparent; cursor: pointer; font-size: 12px; white-space: nowrap; transition: background .12s, border-color .12s; }
.svn-btn:hover:not(:disabled) { background: var(--svn-hover); }
.svn-btn:disabled { opacity: .45; cursor: default; }
.svn-btn.primary { background: var(--svn-accent); border-color: var(--svn-accent); color: #fff; font-weight: 600; }
.svn-btn.primary:hover:not(:disabled) { background: #3f5bea; }
.svn-btn.primary:disabled { background: var(--svn-soft); border-color: var(--svn-line); color: var(--svn-muted); opacity: 1; }
.svn-btn.danger { color: #e5484d; border-color: rgba(229,72,77,.4); }
.svn-btn.danger:hover:not(:disabled) { background: rgba(229,72,77,.12); }
.svn-btn.small { padding: 3px 8px; font-size: 11.5px; border-radius: 6px; }
.svn-icon { width: 28px; height: 28px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: grid; place-items: center; font-size: 16px; color: var(--svn-muted); }
.svn-icon:hover { background: var(--svn-hover); color: inherit; }
.svn-body { flex: 1; display: flex; min-height: 0; }
.svn-side { width: 236px; flex: none; border-right: 1px solid var(--svn-line); overflow: auto; padding: 10px; display: flex; flex-direction: column; gap: 12px; }
.svn-side-title { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--svn-muted); font-weight: 650; display: flex; align-items: center; justify-content: space-between; }
.svn-wc { display: flex; flex-direction: column; gap: 2px; padding: 7px 8px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; background: none; text-align: left; width: 100%; }
.svn-wc:hover { background: var(--svn-hover); }
.svn-wc.on { border-color: rgba(77,107,254,.45); background: rgba(77,107,254,.09); }
.svn-wc-name { font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.svn-wc-path { font-size: 10.5px; color: var(--svn-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; direction: rtl; text-align: left; }
.svn-dot { width: 7px; height: 7px; border-radius: 50%; flex: none; background: #2f9e68; }
.svn-dot.bad { background: #e5484d; }
.svn-kv { display: flex; flex-direction: column; gap: 5px; font-size: 11.5px; }
.svn-kv-row { display: flex; gap: 6px; min-width: 0; }
.svn-kv-k { color: var(--svn-muted); flex: none; width: 58px; }
.svn-kv-v { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.svn-side-empty { font-size: 11.5px; color: var(--svn-muted); line-height: 1.6; }
.svn-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.svn-tabs { display: flex; align-items: center; gap: 2px; padding: 0 12px; border-bottom: 1px solid var(--svn-line); flex: none; height: 38px; }
.svn-tab { height: 100%; padding: 0 10px; border: none; background: none; cursor: pointer; color: var(--svn-muted); font-size: 12.5px; border-bottom: 2px solid transparent; display: inline-flex; align-items: center; gap: 6px; }
.svn-tab:hover { color: inherit; }
.svn-tab.on { color: var(--svn-accent); border-bottom-color: var(--svn-accent); font-weight: 600; }
.svn-tab .svn-count { font-size: 10.5px; padding: 0 5px; border-radius: 999px; background: var(--svn-soft); color: var(--svn-muted); }
.svn-tab.on .svn-count { background: rgba(77,107,254,.15); color: var(--svn-accent); }
.svn-tabsep { flex: 1; }
.svn-view { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.svn-toolbar { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--svn-soft); flex-wrap: wrap; flex: none; }
.svn-input { border: 1px solid var(--svn-line); border-radius: 7px; background: transparent; color: inherit; font: inherit; font-size: 12px; padding: 4px 8px; min-width: 0; }
.svn-input:focus { outline: 1px solid var(--svn-accent); outline-offset: -1px; border-color: var(--svn-accent); }
.svn-input.grow { flex: 1; }
.svn-input.sm { width: 92px; }
.svn-input.md { width: 128px; }
.svn-chip { border: 1px solid var(--svn-line); background: transparent; border-radius: 999px; padding: 2px 9px; font-size: 11px; cursor: pointer; color: var(--svn-muted); display: inline-flex; align-items: center; gap: 4px; }
.svn-chip:hover { background: var(--svn-hover); }
.svn-chip.on { border-color: var(--svn-accent); color: var(--svn-accent); background: rgba(77,107,254,.1); }
.svn-chip b { font-weight: 650; font-variant-numeric: tabular-nums; }
.svn-chips { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; padding: 8px 12px; border-bottom: 1px solid var(--svn-soft); flex: none; }
.svn-list { flex: 1; overflow: auto; min-height: 0; }
.svn-row { display: flex; align-items: center; gap: 8px; padding: 5px 12px; border-bottom: 1px solid var(--svn-soft); cursor: pointer; min-width: 0; }
.svn-row:hover { background: var(--svn-hover); }
.svn-row.sel { background: rgba(77,107,254,.08); }
.svn-row.conflict { background: rgba(229,72,77,.06); }
.svn-row input[type=checkbox] { width: 13px; height: 13px; accent-color: var(--svn-accent); flex: none; cursor: pointer; }
.svn-badge { width: 20px; height: 20px; border-radius: 5px; display: grid; place-items: center; font-size: 11px; font-weight: 700; flex: none; font-family: ui-monospace, Consolas, monospace; }
.svn-path { flex: 1; min-width: 0; font-family: ui-monospace, "Cascadia Code", Consolas, monospace; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-path .svn-dir { color: var(--svn-muted); }
.svn-prop { font-size: 9px; font-weight: 700; color: #8e4ec6; border: 1px solid rgba(142,78,198,.4); border-radius: 3px; padding: 0 3px; margin-left: 5px; vertical-align: 1px; }
.svn-tag { font-size: 9.5px; padding: 1px 5px; border-radius: 4px; background: rgba(229,72,77,.16); color: #e5484d; flex: none; }
.svn-footer { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-top: 1px solid var(--svn-line); flex-wrap: wrap; flex: none; background: var(--svn-soft); }
.svn-footer-gap { flex: 1; }
.svn-muted { color: var(--svn-muted); font-size: 11.5px; }
.svn-history { display: flex; flex: 1; min-height: 0; }
.svn-log { width: 55%; border-right: 1px solid var(--svn-line); display: flex; flex-direction: column; min-width: 0; }
.svn-log-list { flex: 1; overflow: auto; min-height: 0; }
.svn-logrow { display: flex; gap: 9px; padding: 8px 12px; border-bottom: 1px solid var(--svn-soft); cursor: pointer; align-items: flex-start; }
.svn-logrow:hover { background: var(--svn-hover); }
.svn-logrow.sel { background: rgba(77,107,254,.09); }
.svn-rev { font-family: ui-monospace, Consolas, monospace; font-size: 11px; font-weight: 700; color: var(--svn-accent); background: rgba(77,107,254,.1); border-radius: 5px; padding: 2px 5px; flex: none; margin-top: 1px; }
.svn-logmain { min-width: 0; flex: 1; }
.svn-logmsg { font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-logmeta { font-size: 10.5px; color: var(--svn-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-logmore { padding: 8px 12px; border-top: 1px solid var(--svn-soft); }
.svn-detail { flex: 1; overflow: auto; padding: 14px 16px; min-width: 0; }
.svn-detail-empty { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--svn-muted); font-size: 12px; text-align: center; line-height: 1.7; }
.svn-detail-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.svn-detail-author { font-size: 12px; font-weight: 600; }
.svn-detail-date { font-size: 11px; color: var(--svn-muted); }
.svn-msg { font-size: 12.5px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; background: var(--svn-soft); border: 1px solid var(--svn-soft); border-radius: 9px; padding: 9px 11px; margin: 0 0 12px; max-height: 220px; overflow: auto; }
.svn-section { font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--svn-muted); font-weight: 650; margin: 10px 0 6px; display: flex; align-items: center; gap: 6px; }
.svn-pathlist { display: flex; flex-direction: column; border: 1px solid var(--svn-soft); border-radius: 9px; overflow: hidden; }
.svn-pathrow { display: flex; align-items: center; gap: 7px; padding: 5px 8px; cursor: pointer; border-bottom: 1px solid var(--svn-soft); min-width: 0; }
.svn-pathrow:last-child { border-bottom: none; }
.svn-pathrow:hover { background: var(--svn-hover); }
.svn-pathrow .svn-path { font-size: 11.5px; }
.svn-action { width: 17px; height: 17px; border-radius: 4px; display: grid; place-items: center; font-size: 9.5px; font-weight: 700; font-family: ui-monospace, Consolas, monospace; flex: none; }
.svn-diff { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.svn-diff-head { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--svn-soft); flex: none; flex-wrap: wrap; }
.svn-diff-title { font-size: 12.5px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.svn-stat { font-size: 11px; font-family: ui-monospace, Consolas, monospace; }
.svn-stat.add { color: #2f9e68; }
.svn-stat.del { color: #e5484d; }
.svn-diff-body { flex: 1; overflow: auto; min-height: 0; background: rgba(127,127,127,.025); }
.svn-diff-body table { border-collapse: collapse; width: 100%; font-family: ui-monospace, "Cascadia Code", Consolas, monospace; font-size: 12px; line-height: 1.55; }
.svn-dline { display: flex; min-width: max-content; }
.svn-dno { width: 44px; flex: none; text-align: right; padding-right: 9px; color: var(--svn-muted); opacity: .55; user-select: none; font-size: 10.5px; }
.svn-dtext { white-space: pre; padding-right: 28px; flex: 1; }
.svn-diff-body.wrap .svn-dtext { white-space: pre-wrap; word-break: break-word; }
.svn-dline.add { background: rgba(46,160,67,.14); }
.svn-dline.add .svn-dtext { color: #1f7a4d; }
.svn-dline.del { background: rgba(248,81,73,.12); }
.svn-dline.del .svn-dtext { color: #b3383c; }
.svn-dline.hunk { background: rgba(77,107,254,.1); }
.svn-dline.hunk .svn-dtext { color: #4d6bfe; font-weight: 600; }
.svn-dline.meta .svn-dtext { color: var(--svn-muted); }
.svn-dline.meta { background: var(--svn-soft); }
.svn-blame { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.svn-blame-body { flex: 1; overflow: auto; min-height: 0; }
.svn-blame-row { display: flex; gap: 8px; padding: 1px 10px; font-family: ui-monospace, Consolas, monospace; font-size: 11.5px; line-height: 1.6; }
.svn-blame-row:hover { background: var(--svn-hover); }
.svn-blame-no { width: 40px; text-align: right; color: var(--svn-muted); opacity: .6; flex: none; }
.svn-blame-rev { width: 46px; text-align: right; color: var(--svn-accent); flex: none; cursor: pointer; }
.svn-blame-author { width: 76px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--svn-muted); flex: none; }
.svn-blame-text { white-space: pre; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
.svn-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--svn-muted); font-size: 12.5px; padding: 30px; text-align: center; }
.svn-empty-icon { font-size: 30px; opacity: .5; }
.svn-errorbox { margin: 10px 12px; padding: 8px 10px; border-radius: 8px; background: rgba(229,72,77,.1); border: 1px solid rgba(229,72,77,.28); color: #c53b3f; font-size: 12px; display: flex; align-items: center; gap: 8px; }
.svn-errorbox .svn-btn { margin-left: auto; }
.svn-loading { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--svn-muted); font-size: 12px; }
.svn-toast { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); z-index: 20; max-width: 82%; padding: 7px 14px; border-radius: 999px; font-size: 12px; background: rgba(24,26,32,.94); color: #fff; box-shadow: 0 8px 28px rgba(0,0,0,.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-toast.err { background: rgba(190,50,55,.96); }
.svn-toast.warn { background: rgba(168,112,20,.97); }
.svn-modal-back { position: fixed; inset: 0; z-index: 10001; background: rgba(8,10,16,.45); display: flex; align-items: center; justify-content: center; padding: 20px; }
.svn-modal { background: Canvas; color: CanvasText; border: 1px solid var(--svn-line); border-radius: 12px; box-shadow: 0 24px 70px rgba(0,0,0,.4); max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; max-width: 94vw; }
.svn-modal-head { display: flex; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--svn-line); flex: none; }
.svn-modal-title { font-size: 13px; font-weight: 650; }
.svn-modal-head .svn-icon { margin-left: auto; }
.svn-modal-body { padding: 14px; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
.svn-modal-foot { padding: 10px 14px; border-top: 1px solid var(--svn-line); display: flex; justify-content: flex-end; gap: 8px; flex: none; }
.svn-textarea { width: 100%; min-height: 110px; resize: vertical; border: 1px solid var(--svn-line); border-radius: 9px; background: transparent; color: inherit; font: inherit; font-size: 12.5px; line-height: 1.6; padding: 8px 10px; }
.svn-textarea:focus { outline: 1px solid var(--svn-accent); outline-offset: -1px; }
.svn-commit-list { max-height: 200px; overflow: auto; border: 1px solid var(--svn-soft); border-radius: 9px; }
.svn-commit-item { display: flex; align-items: center; gap: 7px; padding: 4px 8px; font-family: ui-monospace, Consolas, monospace; font-size: 11.5px; border-bottom: 1px solid var(--svn-soft); }
.svn-commit-item:last-child { border-bottom: none; }
.svn-hint { font-size: 11px; color: var(--svn-muted); line-height: 1.55; }
.svn-choice { display: flex; gap: 8px; align-items: flex-start; padding: 7px 9px; border: 1px solid var(--svn-line); border-radius: 8px; cursor: pointer; }
.svn-choice:hover { background: var(--svn-hover); }
.svn-choice.on { border-color: var(--svn-accent); background: rgba(77,107,254,.08); }
.svn-choice input { margin-top: 2px; accent-color: var(--svn-accent); }
.svn-choice div { display: flex; flex-direction: column; gap: 1px; }
.svn-choice b { font-size: 12px; font-weight: 600; }
.svn-choice span { font-size: 11px; color: var(--svn-muted); }
.svn-candidate { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid var(--svn-soft); border-radius: 8px; }
.svn-candidate .svn-path { font-size: 11px; }
.svn-picker { display: flex; flex-direction: column; gap: 8px; height: min(62vh, 540px); min-height: 0; }
.svn-picker-path { display: flex; gap: 6px; align-items: center; }
.svn-picker-roots { display: flex; gap: 6px; flex-wrap: wrap; }
.svn-picker-root { display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--svn-line); background: transparent; border-radius: 7px; padding: 3px 9px; font-size: 11.5px; color: var(--svn-muted); cursor: pointer; }
.svn-picker-root:hover { background: var(--svn-hover); color: CanvasText; }
.svn-picker-tools { display: flex; gap: 8px; align-items: center; }
.svn-picker-filter { flex: 1; min-width: 0; }
.svn-picker-toggle { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--svn-muted); white-space: nowrap; cursor: pointer; user-select: none; }
.svn-picker-toggle input { accent-color: var(--svn-accent); }
.svn-picker-list { flex: 1; min-height: 0; overflow: auto; border: 1px solid var(--svn-line); border-radius: 10px; background: Canvas; }
.svn-picker-row { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-bottom: 1px solid var(--svn-soft); cursor: pointer; min-width: 0; }
.svn-picker-row:last-child { border-bottom: none; }
.svn-picker-row:hover { background: var(--svn-hover); }
.svn-picker-row.is-wc { background: rgba(48,164,108,.05); }
.svn-folder-glyph { flex: none; }
.svn-picker-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.svn-picker-name { font-size: 12.5px; font-weight: 550; color: CanvasText; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-picker-sub { font-size: 10.5px; color: var(--svn-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-picker-wc { font-size: 9.5px; padding: 1px 6px; border-radius: 999px; background: rgba(48,164,108,.16); color: #2f9e68; font-weight: 600; flex: none; }
.svn-picker-chevron { color: var(--svn-muted); font-size: 15px; line-height: 1; flex: none; opacity: .7; }
.svn-picker-empty { padding: 36px 10px; text-align: center; color: var(--svn-muted); font-size: 12px; }
.svn-picker-status { font-size: 11.5px; color: var(--svn-muted); }
.svn-picker-status.ok { color: #2f9e68; }
.svn-picker-foot { display: flex; align-items: center; gap: 8px; width: 100%; }
.svn-modal-head .svn-icon { background: transparent !important; border: none; }
.svn-hbtn { display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 9px; border-radius: 7px; border: 1px solid var(--svn-line); background: transparent; cursor: pointer; font-size: 11.5px; color: inherit; }
.svn-hbtn:hover { background: var(--svn-hover); }
.svn-hbtn-dot { width: 6px; height: 6px; border-radius: 50%; background: #4d6bfe; }
.svn-tabtitle { display: inline-flex; align-items: center; gap: 5px; }
.svn-tabtitle i { width: 6px; height: 6px; border-radius: 50%; background: #4d6bfe; }
.svn-pane { padding: 10px 12px 16px; display: flex; flex-direction: column; gap: 9px; min-height: 100%; }
.svn-pane-head { display: flex; align-items: center; gap: 7px; }
.svn-pane-title { font-size: 13px; font-weight: 650; display: flex; align-items: center; gap: 6px; }
.svn-pane-actions { margin-left: auto; display: flex; gap: 2px; }
.svn-pane-wc { width: 100%; border: 1px solid var(--svn-line); border-radius: 7px; background: transparent; color: inherit; font-size: 11.5px; padding: 4px 6px; }
.svn-pane-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.svn-pane-file { display: flex; align-items: center; gap: 6px; padding: 3px 2px; cursor: pointer; border-radius: 5px; min-width: 0; }
.svn-pane-file:hover { background: var(--svn-hover); }
.svn-pane-file .svn-path { font-size: 11px; }
.svn-pane-logrow { display: flex; gap: 6px; align-items: baseline; padding: 2px 2px; cursor: pointer; border-radius: 5px; min-width: 0; }
.svn-pane-logrow:hover { background: var(--svn-hover); }
.svn-pane-logmsg { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.svn-pane-logmeta { font-size: 10px; color: var(--svn-muted); flex: none; }
.svn-pane-empty { font-size: 11.5px; color: var(--svn-muted); line-height: 1.65; }
@media (max-width: 860px) { .svn-side { display: none; } .svn-log { width: 100%; } .svn-detail { display: none; } }
`)

  const writes = new Set()

  function parseXml(source) {
    const doc = new DOMParser().parseFromString(source, 'application/xml')
    if (doc.querySelector('parsererror')) throw new Error('无法解析 SVN 的 XML 输出')
    return doc
  }

  function field(node, selector) {
    return node?.querySelector(selector)?.textContent || ''
  }

  function target(path, revision = '') {
    return path + '@' + revision
  }

  function localPath(root, rel = '') {
    if (rel.startsWith('/') || rel.split('/').includes('..')) throw new Error('请输入工作副本内的相对路径')
    return rel && rel !== '.' ? root.replace(/\/$/, '') + '/' + rel : root
  }

  async function svn(command, args, targets) {
    const result = await ctx.bridge.invoke('plugin_exec_run', {
      bin: 'svn',
      args: [command, '--non-interactive', ...args, '--', ...targets],
      env: { LC_ALL: 'en_US.UTF-8' },
      timeoutMs: 120000,
    })
    if (result.code !== 0) throw new Error(result.stderr.trim() || 'SVN 执行失败')
    return result.stdout
  }

  function hasConflict(entry) {
    return entry.item === 'conflicted' || entry.props === 'conflicted' || entry.treeConflicted
  }

  function hasLocalChange(entry) {
    return entry.item !== 'normal' || entry.props === 'modified' || hasConflict(entry)
  }

  function displayStatus(entry) {
    return hasConflict(entry) ? 'conflicted' : entry.item
  }

  function remoteStatusLabel(status) {
    if (!status) return ''
    const item = status.item && !['none', 'normal'].includes(status.item) ? metaOf(status.item).label : ''
    const props = status.props === 'modified' ? '属性修改' : ''
    return [item, props].filter(Boolean).join('、')
  }

  function makeApi(workspacePath) {
    let info
    return async function api(route, options = {}) {
      if (route === '/state') {
        if (!workspacePath || !workspacePath.startsWith('/')) throw new Error('请打开本机 SVN 工作区')
        const doc = parseXml(await svn('info', ['--xml'], [target(workspacePath)]))
        const entry = doc.querySelector('entry')
        const path = field(entry, 'wc-info > wcroot-abspath')
        if (!path) throw new Error('当前工作区没有 SVN 工作副本')
        info = {
          path,
          name: path.split('/').pop() || path,
          revision: Number(entry.getAttribute('revision')),
          url: field(entry, 'url'),
          root: field(entry, 'repository > root'),
          relativeUrl: field(entry, 'relative-url'),
          lastChangedRev: Number(entry.querySelector('commit')?.getAttribute('revision')),
          lastChangedAuthor: field(entry, 'commit > author'),
          lastChangedDate: field(entry, 'commit > date'),
        }
        // The active workspace can be nested or switched. Use its URL for the WC root.
        if (path !== workspacePath.replace(/\/$/, '')) {
          const rootEntry = parseXml(await svn('info', ['--xml'], [target(path)])).querySelector('entry')
          info.url = field(rootEntry, 'url')
          info.relativeUrl = field(rootEntry, 'relative-url')
          info.revision = Number(rootEntry.getAttribute('revision'))
          info.lastChangedRev = Number(rootEntry.querySelector('commit')?.getAttribute('revision'))
          info.lastChangedAuthor = field(rootEntry, 'commit > author')
          info.lastChangedDate = field(rootEntry, 'commit > date')
        }
        return { workingCopies: [info] }
      }

      const root = options.wc
      const repoTarget = options.path?.startsWith('/')
      const path = repoTarget ? options.path.split('/').map(encodeURIComponent).join('/') : ''
      const rel = options.path || ''
      const revision = Number(options.revision)
      const validRevision = Number.isSafeInteger(revision) && revision > 0
      const location = repoTarget ? info.root.replace(/\/$/, '') + path : localPath(root, rel)

      if (route === '/status') {
        const args = ['--xml', '--ignore-externals']
        if (options.remote) args.push('--show-updates')
        const doc = parseXml(await svn('status', args, [target(root)]))
        const entries = Array.from(doc.querySelectorAll('entry')).flatMap((entry) => {
          const wc = entry.querySelector('wc-status')
          const commit = wc?.querySelector('commit')
          const repos = entry.querySelector('repos-status')
          const raw = entry.getAttribute('path')
          if (!wc || (raw !== root && !raw.startsWith(root + '/'))) return []
          return [{
            path: raw === root ? '.' : raw.slice(root.length + 1),
            item: wc.getAttribute('item'),
            props: wc.getAttribute('props'),
            copied: wc.getAttribute('copied') === 'true',
            commit: commit && { revision: Number(commit.getAttribute('revision')), author: field(commit, 'author') },
            treeConflicted: wc.getAttribute('tree-conflicted') === 'true',
            reposStatus: repos && { item: repos.getAttribute('item'), props: repos.getAttribute('props') },
          }]
        })
        const summary = { total: 0, props: 0 }
        for (const entry of entries) {
          if (entry.props === 'modified') summary.props++
          if (hasLocalChange(entry)) summary.total++
          const item = displayStatus(entry)
          summary[item] = (summary[item] || 0) + 1
        }
        return { entries, summary }
      }

      if (route === '/log') {
        if (Number(info.revision) === 0 && !options.path) {
          const head = parseXml(await svn('info', ['--xml', '-r', 'HEAD'], [target(info.url, 'HEAD')]))
          if (head.querySelector('entry')?.getAttribute('revision') === '0') return { entries: [], hasMore: false }
        }
        const limit = 20
        const before = options.beforeRev ? options.beforeRev - 1 : 'HEAD'
        const historyLocation = repoTarget || !rel ? (repoTarget ? location : info.url)
          : info.url.replace(/\/$/, '') + '/' + rel.split('/').map(encodeURIComponent).join('/')
        const doc = parseXml(await svn('log', ['--xml', '-l', String(limit), '-r', before + ':1'], [target(historyLocation, 'HEAD')]))
        const page = Array.from(doc.querySelectorAll('logentry'), (entry) => ({
          revision: Number(entry.getAttribute('revision')),
          author: field(entry, 'author'),
          date: field(entry, 'date'),
          message: field(entry, 'msg'),
        }))
        const author = options.author?.trim().toLowerCase() || ''
        const keyword = options.keyword?.trim().toLowerCase() || ''
        const entries = page.filter((entry) => {
          const date = entry.date.slice(0, 10)
          return entry.author.toLowerCase().includes(author)
            && (!options.from || date >= options.from)
            && (!options.to || date <= options.to)
            && [entry.message, entry.author]
              .some((value) => value.toLowerCase().includes(keyword))
        })
        const nextBefore = page.at(-1)?.revision
        return { entries, nextBefore, hasMore: page.length === limit && nextBefore > 1 }
      }

      if (route === '/log-detail') {
        if (!validRevision) throw new Error('无效的 SVN 修订号')
        let doc
        try {
          const xml = await svn('log', ['--xml', '-v', '-r', String(revision)], [target(info.url, 'HEAD')])
          doc = parseXml(xml)
        } catch (error) {
          if (error.message === '无法解析 SVN 的 XML 输出') {
            throw new Error('无法读取改动路径，详细记录可能超过 CC GUI 的输出上限。')
          }
          throw error
        }
        const entry = doc.querySelector('logentry')
        if (!entry) throw new Error('找不到该修订的详细记录')
        return {
          paths: Array.from(entry.querySelectorAll('paths > path'), (item) => ({
            action: item.getAttribute('action'),
            kind: item.getAttribute('kind'),
            path: item.textContent,
            copyFrom: item.getAttribute('copyfrom-path'),
            copyFromRev: Number(item.getAttribute('copyfrom-rev')),
          })),
        }
      }

      if (route === '/diff') {
        const args = ['--internal-diff']
        let destinations = [location]
        if (validRevision) {
          if (repoTarget) {
            args.push('-r', (revision - 1) + ':' + revision, '--old', info.root)
            destinations = [rel.slice(1)]
          } else {
            args.push('-c', String(revision))
            destinations = [target(info.url, revision)]
          }
        }
        const synthesized = !validRevision && options.unversioned === true
        if (synthesized) {
          args.push('--old', '/dev/null', '--new', target(location))
          destinations = []
        }
        const diff = await svn('diff', args, destinations)
        return {
          diff,
          synthesized,
          relPath: rel,
          revision: validRevision ? revision : undefined,
          empty: !diff,
          binary: /Cannot display: file marked as a binary type/.test(diff),
          additions: (diff.match(/^\+(?!\+\+)/gm) || []).length,
          deletions: (diff.match(/^-(?!--)/gm) || []).length,
        }
      }

      if (route === '/blame') {
        const end = validRevision ? String(revision) : (repoTarget ? 'HEAD' : 'BASE')
        const output = await svn('blame', ['-r', '1:' + end], [target(location, end)])
        const rows = output.replace(/\r?\n$/, '').split(/\r?\n/).filter(Boolean)
        const lines = rows.slice(0, 5000).map((row, index) => {
          const match = /^\s*(\d+|-)\s+(\S+) (.*)$/.exec(row)
          if (!match) throw new Error('无法解析 SVN 溯源输出')
          return { line: index + 1, revision: Number(match[1]) || 0, author: match[2], text: match[3] }
        })
        return { lines, total: rows.length, remote: true, truncated: rows.length > lines.length }
      }

      if (writes.has(root)) throw new Error('当前工作副本正在执行 SVN 操作')
      const paths = options.paths?.map((item) => localPath(root, item)) || []
      const targets = paths.map((item) => target(item))
      const scoped = ['/commit', '/revert', '/delete', '/add', '/resolve'].includes(route)
      if (scoped && !targets.length) throw new Error('请先勾选操作路径')
      const modes = ['working', 'base', 'mine-full', 'theirs-full', 'mine-conflict', 'theirs-conflict']
      const commands = {
        '/update': ['update', ['--accept', 'postpone', '--ignore-externals'], [root]],
        '/commit': ['commit', ['--depth', 'empty', '-m', options.message || ''], targets],
        '/revert': ['revert', ['--depth', 'empty'], targets],
        '/delete': ['delete', [], targets],
        '/add': ['add', ['--parents'], targets],
        '/resolve': ['resolve', ['--accept', modes.includes(options.accept) ? options.accept : 'working'], targets],
        '/cleanup': ['cleanup', [], [root]],
      }
      const command = commands[route]
      if (!command) throw new Error('不支持的 SVN 操作')
      writes.add(root)
      try {
        const output = await svn(...command)
        return {
          output,
          revision: Number(/(?:Committed|Updated to|At) revision (\d+)/i.exec(output)?.[1]) || null,
          conflicts: Array.from(output.matchAll(/(?:Text|Property|Tree) conflicts: (\d+)/gi), (match) => Number(match[1])).reduce((sum, count) => sum + count, 0),
        }
      } finally {
        writes.delete(root)
      }
    }
  }

  const COMMIT_ITEMS = { modified: 1, added: 1, deleted: 1, replaced: 1 }

  const STATUS_META = {
    conflicted: { letter: 'C', label: '冲突', color: '#e5484d', bg: 'rgba(229,72,77,.16)' },
    modified: { letter: 'M', label: '修改', color: '#c98421', bg: 'rgba(217,144,42,.16)' },
    added: { letter: 'A', label: '新增', color: '#2f9e68', bg: 'rgba(48,164,108,.16)' },
    deleted: { letter: 'D', label: '删除', color: '#e5484d', bg: 'rgba(229,72,77,.14)' },
    missing: { letter: '!', label: '丢失', color: '#e5484d', bg: 'rgba(229,72,77,.14)' },
    unversioned: { letter: '?', label: '未纳入', color: '#8b93a7', bg: 'rgba(139,147,167,.16)' },
    replaced: { letter: 'R', label: '替换', color: '#8e4ec6', bg: 'rgba(142,78,198,.16)' },
    obstructed: { letter: '~', label: '阻塞', color: '#e5484d', bg: 'rgba(229,72,77,.14)' },
    incomplete: { letter: '!', label: '不完整', color: '#e5484d', bg: 'rgba(229,72,77,.14)' },
    external: { letter: 'X', label: '外部', color: '#8b93a7', bg: 'rgba(139,147,167,.16)' },
    ignored: { letter: 'I', label: '忽略', color: '#8b93a7', bg: 'rgba(139,147,167,.14)' },
    normal: { letter: ' ', label: '正常', color: '#8b93a7', bg: 'rgba(139,147,167,.14)' },
  }

  function metaOf(item) {
    return STATUS_META[item] || { letter: '?', label: item || '未知', color: '#8b93a7', bg: 'rgba(139,147,167,.16)' }
  }

  function pad2(n) {
    return String(n).padStart(2, '0')
  }

  function fmtDate(iso, withTime) {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return String(iso).slice(0, 16).replace('T', ' ')
    const head = date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
    return withTime === false ? head : head + ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes())
  }

  function firstLine(message, max) {
    const line = String(message || '').split(/\r?\n/)[0].trim()
    const limit = max || 200
    return line.length > limit ? line.slice(0, limit) + '…' : line
  }

  function splitPath(rel) {
    const value = String(rel || '').replace(/\\/g, '/')
    const index = value.lastIndexOf('/')
    if (index < 0) return ['', value]
    return [value.slice(0, index + 1), value.slice(index + 1)]
  }

  function copyText(value) {
    const text = String(value || '')
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    }
    return Promise.resolve(fallbackCopy(text))
  }

  function fallbackCopy(text) {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    } catch (err) {}
  }

  function parseDiff(text) {
    const lines = []
    let oldNo = 0
    let newNo = 0
    for (const raw of String(text || '').split(/\r?\n/)) {
      if (raw.startsWith('@@')) {
        const match = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw)
        if (match) {
          oldNo = Number(match[1]) || 0
          newNo = Number(match[2]) || 0
        }
        lines.push({ type: 'hunk', text: raw })
        continue
      }
      if (raw.startsWith('+++') || raw.startsWith('---')) {
        lines.push({ type: 'meta', text: raw })
        continue
      }
      if (/^(Index:|={5,}|Property changes on:|Added:|Modified:|Deleted:|## )/.test(raw)) {
        lines.push({ type: 'meta', text: raw })
        continue
      }
      if (raw.startsWith('+')) {
        lines.push({ type: 'add', text: raw, newNo })
        newNo += 1
        continue
      }
      if (raw.startsWith('-')) {
        lines.push({ type: 'del', text: raw, oldNo })
        oldNo += 1
        continue
      }
      if (raw.startsWith(' ')) {
        lines.push({ type: 'ctx', text: raw, oldNo, newNo })
        oldNo += 1
        newNo += 1
        continue
      }
      lines.push({ type: 'meta', text: raw })
    }
    return lines
  }

  function actionMeta(action) {
    if (action === 'A') return { bg: 'rgba(48,164,108,.16)', color: '#2f9e68' }
    if (action === 'D') return { bg: 'rgba(229,72,77,.14)', color: '#e5484d' }
    if (action === 'R') return { bg: 'rgba(142,78,198,.16)', color: '#8e4ec6' }
    return { bg: 'rgba(217,144,42,.16)', color: '#c98421' }
  }

  function Spinner() {
    return h('span', { className: 'svn-spin' })
  }

  function StatusBadge(props) {
    const meta = metaOf(props.item)
    return h('span', {
      className: 'svn-badge',
      style: { background: meta.bg, color: meta.color },
      title: meta.label,
    }, meta.letter)
  }

  function Empty(props) {
    return h('div', { className: 'svn-empty' },
      h('div', { className: 'svn-empty-icon' }, props.icon || '⌗'),
      h('div', null, props.title),
      props.hint ? h('div', { style: { fontSize: 11.5, opacity: .8 } }, props.hint) : null,
      props.action || null,
    )
  }

  function Modal(props) {
    useEffect(() => {
      const onKey = (event) => {
        if (event.key === 'Escape') {
          event.stopImmediatePropagation()
          props.onClose()
        }
      }
      window.addEventListener('keydown', onKey, true)
      return () => window.removeEventListener('keydown', onKey, true)
    }, [props.onClose])

    return h('div', {
      className: 'svn-root svn-modal-back',
      onMouseDown: (event) => { if (event.target === event.currentTarget) props.onClose() },
    }, h('div', { className: 'svn-modal', style: { width: props.width || 460 } },
      h('div', { className: 'svn-modal-head' },
        h('div', { className: 'svn-modal-title' }, props.title),
        h('button', { type: 'button', className: 'svn-icon', title: '关闭', onClick: props.onClose }, '×'),
      ),
      h('div', { className: 'svn-modal-body' }, props.children),
      props.footer ? h('div', { className: 'svn-modal-foot' }, props.footer) : null,
    ))
  }

  function ConfirmDialog(props) {
    const [working, setWorking] = useState(false)
    const [error, setError] = useState('')

    async function confirm() {
      setWorking(true)
      setError('')
      try {
        const ok = props.onOk ? await props.onOk() : true
        if (ok !== false) props.onClose()
      } catch (err) {
        setError(String((err && err.message) || err))
      } finally {
        setWorking(false)
      }
    }

    return h(Modal, {
      title: props.title,
      width: 460,
      onClose: working ? () => {} : props.onClose,
      footer: h(React.Fragment, null,
        h('button', { type: 'button', className: 'svn-btn', onClick: props.onClose, disabled: working }, '取消'),
        h('button', {
          type: 'button',
          className: 'svn-btn ' + (props.danger ? 'danger' : 'primary'),
          onClick: confirm,
          disabled: working,
        }, working ? '处理中…' : (props.okLabel || '确定')),
      ),
    },
      h('div', { style: { fontSize: 12.5, lineHeight: 1.75 } }, props.body),
      props.detail ? h('pre', { className: 'svn-msg', style: { margin: 0, maxHeight: 160, fontSize: 11.5 } }, props.detail) : null,
      error ? h('div', { className: 'svn-errorbox', style: { margin: 0 } }, error) : null,
    )
  }

  //#endregion

  // 组件实现（继续保持在一个 factory 里，便于宿主加载）
  //#region 主面板

  function SvnApp(props) {
    const [stateData, setStateData] = useState(null)
    const [stateLoading, setStateLoading] = useState(true)
    const [stateError, setStateError] = useState('')
    const api = props.api
    const [status, setStatus] = useState(null)
    const [statusLoading, setStatusLoading] = useState(false)
    const [statusError, setStatusError] = useState('')
    const [log, setLog] = useState(null)
    const [logLoading, setLogLoading] = useState(false)
    const [logError, setLogError] = useState('')
    const [filters, setFilters] = useState({ author: '', keyword: '', path: '', from: '', to: '' })
    const [filterDraft, setFilterDraft] = useState({ author: '', keyword: '', path: '', from: '', to: '' })
    const [tab, setTab] = useState('changes')
    const [returnTab, setReturnTab] = useState('changes')
    const [detail, setDetail] = useState(null)
    const [selected, setSelected] = useState(() => Object.create(null))
    const [itemFilter, setItemFilter] = useState('all')
    const [pathFilter, setPathFilter] = useState('')
    const [remote, setRemote] = useState(false)
    const [diff, setDiff] = useState(null)
    const [blame, setBlame] = useState(null)
    const [busy, setBusy] = useState('')
    const [toast, setToast] = useState(null)
    const [confirm, setConfirm] = useState(null)
    const [commitOpen, setCommitOpen] = useState(false)
    const [commitPaths, setCommitPaths] = useState([])
    const [commitMessage, setCommitMessage] = useState('')
    const [resolveOpen, setResolveOpen] = useState(false)

    const toastTimer = useRef(null)
    const statusSeq = useRef(0)
    const logSeq = useRef(0)

    function notify(message, kind) {
      setToast({ message: String(message), kind: kind || 'ok' })
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 4200)
    }

    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

    const current = stateData?.workingCopies[0]
    const currentPath = current?.path || ''

    const loadState = useCallback(async (silent) => {
      if (!silent) setStateLoading(true)
      try {
        const data = await api('/state')
        setStateData(data)
        setStateError('')
        return data
      } catch (err) {
        setStateError(String((err && err.message) || err))
        return null
      } finally {
        if (!silent) setStateLoading(false)
      }
    }, [])

    useEffect(() => {
      void loadState()
    }, [loadState])

    const loadStatus = useCallback(async (options) => {
      if (!currentPath) return
      const seq = statusSeq.current + 1
      statusSeq.current = seq
      setStatusLoading(true)
      setStatusError('')
      try {
        const data = await api('/status', { wc: currentPath, remote: !!(options && options.remote) })
        if (seq !== statusSeq.current) return
        setStatus(data)
        setSelected((prev) => {
          const next = Object.create(null)
          for (const entry of data.entries) if (prev[entry.path]) next[entry.path] = true
          return next
        })
      } catch (err) {
        if (seq === statusSeq.current) setStatusError(String((err && err.message) || err))
      } finally {
        if (seq === statusSeq.current) setStatusLoading(false)
      }
    }, [currentPath])

    const loadLog = useCallback(async (options) => {
      if (!currentPath) return
      const opts = options || {}
      const useFilters = opts.filters || filters
      const seq = logSeq.current + 1
      logSeq.current = seq
      setLogLoading(true)
      setLogError('')
      try {
        const data = await api('/log', {
          wc: currentPath,
          beforeRev: opts.beforeRev,
          author: useFilters.author,
          keyword: useFilters.keyword,
          path: useFilters.path,
          from: useFilters.from,
          to: useFilters.to,
        })
        if (seq !== logSeq.current) return
        setLog((prev) => {
          if (opts.append && prev) return Object.assign({}, data, { entries: prev.entries.concat(data.entries) })
          return data
        })
        if (opts.filters) setFilters(opts.filters)
      } catch (err) {
        if (seq === logSeq.current) setLogError(String((err && err.message) || err))
      } finally {
        if (seq === logSeq.current) setLogLoading(false)
      }
    }, [currentPath, filters])

    useEffect(() => {
      setStatus(null)
      setLog(null)
      setDetail(null)
      setDiff(null)
      setBlame(null)
      setSelected(Object.create(null))
      setTab((prev) => (prev === 'diff' || prev === 'blame' ? 'changes' : prev))
      setStatusError('')
      setLogError('')
      if (currentPath) {
        loadStatus({ remote: remote })
        loadLog({ filters: filters })
      }
    }, [currentPath])

    async function perform(label, fn) {
      setBusy(label)
      try {
        return await fn()
      } catch (err) {
        notify(String((err && err.message) || err), 'err')
        return null
      } finally {
        setBusy('')
      }
    }

    async function refreshAll() {
      await loadState(true)
      await Promise.all([loadStatus({ remote: remote }), loadLog({ filters: filters })])
    }

    async function loadDetail(entry) {
      const request = { ...entry, loading: true }
      setDetail(request)
      try {
        const data = await api('/log-detail', { wc: currentPath, revision: entry.revision })
        setDetail((current) => current === request ? { ...entry, paths: data.paths } : current)
      } catch (error) {
        setDetail((current) => current === request ? { ...entry, error: error.message } : current)
      }
    }

    function openDiff(options) {
      const opts = options || {}
      setReturnTab(tab === 'diff' || tab === 'blame' ? returnTab : tab)
      setTab('diff')
      setDiff({ loading: true, title: opts.title || '差异', data: null, error: '' })
      api('/diff', Object.assign({ wc: currentPath }, opts.body || {}))
        .then((data) => setDiff({ loading: false, title: opts.title || '差异', data: data, error: '' }))
        .catch((err) => setDiff({ loading: false, title: opts.title || '差异', data: null, error: String((err && err.message) || err) }))
    }

    function openBlame(pathValue, label, revision) {
      setReturnTab(tab === 'diff' || tab === 'blame' ? returnTab : tab)
      setTab('blame')
      setBlame({ loading: true, path: pathValue, label: label || pathValue, data: null, error: '' })
      api('/blame', { wc: currentPath, path: pathValue, revision })
        .then((data) => setBlame({ loading: false, path: pathValue, label: label || pathValue, data: data, error: '' }))
        .catch((err) => setBlame({ loading: false, path: pathValue, label: label || pathValue, data: null, error: String((err && err.message) || err) }))
    }

    const entries = (status && status.entries) || []
    const selectedEntries = entries.filter((entry) => selected[entry.path])
    const selectedCommittable = selectedEntries.filter((entry) => !hasConflict(entry) && (Object.hasOwn(COMMIT_ITEMS, entry.item) || (entry.item === 'normal' && entry.props === 'modified')))

    function togglePath(value) {
      setSelected((prev) => {
        const next = Object.assign(Object.create(null), prev)
        if (next[value]) delete next[value]
        else next[value] = true
        return next
      })
    }

    function selectAll() {
      const next = Object.create(null)
      for (const entry of entries) if (entry.item !== 'ignored' && hasLocalChange(entry)) next[entry.path] = true
      setSelected(next)
    }

    function invertSelection() {
      setSelected((prev) => {
        const next = Object.create(null)
        for (const entry of entries) {
          if (entry.item === 'ignored' || !hasLocalChange(entry)) continue
          if (!prev[entry.path]) next[entry.path] = true
        }
        return next
      })
    }

    function openCommitDialog() {
      const paths = selectedCommittable.map((entry) => entry.path)
      if (!paths.length) {
        notify('请勾选要提交的变更（未纳入版本控制的文件需要先「纳入」）', 'warn')
        return
      }
      setCommitPaths(paths)
      setCommitMessage('')
      setCommitOpen(true)
    }

    async function submitCommit() {
      const message = commitMessage.trim()
      if (!message) {
        notify('提交信息不能为空', 'err')
        return
      }
      const result = await perform('正在提交…', () => api('/commit', { wc: currentPath, paths: commitPaths, message: message }))
      if (!result) return
      notify('已提交 r' + result.revision + '（' + commitPaths.length + ' 个文件）', 'ok')
      setCommitOpen(false)
      setCommitMessage('')
      setSelected(Object.create(null))
      await refreshAll()
    }

    function askUpdate() {
      setConfirm({
        title: '更新工作副本',
        body: '将从仓库拉取「' + current.name + '」的最新内容。本地未提交的修改会保留，冲突的文件会被标记出来。',
        okLabel: '开始更新',
        onOk: async () => {
          const result = await perform('正在更新…', () => api('/update', { wc: currentPath }))
          if (!result) return false
          notify(result.conflicts
            ? '更新完成：r' + result.revision + '，发现 ' + result.conflicts + ' 个冲突'
            : '更新完成：r' + result.revision, result.conflicts ? 'warn' : 'ok')
          setSelected(Object.create(null))
          await refreshAll()
          return true
        },
      })
    }

    function askRevert() {
      const paths = selectedEntries.filter((entry) => entry.item !== 'unversioned').map((entry) => entry.path)
      if (!paths.length) {
        notify('先勾选要还原的文件', 'warn')
        return
      }
      setConfirm({
        title: '还原修改',
        body: '将丢弃这 ' + paths.length + ' 个文件里未提交的本地修改，此操作不可撤销。',
        detail: paths.slice(0, 6).join('\n') + (paths.length > 6 ? '\n…' : ''),
        okLabel: '还原',
        danger: true,
        onOk: async () => {
          const result = await perform('正在还原…', () => api('/revert', { wc: currentPath, paths: paths }))
          if (!result) return false
          notify('已还原 ' + paths.length + ' 个文件')
          setSelected(Object.create(null))
          await refreshAll()
          return true
        },
      })
    }

    function askDelete() {
      const paths = selectedEntries.filter((entry) => entry.item !== 'unversioned').map((entry) => entry.path)
      if (!paths.length) {
        notify('先勾选要删除的文件', 'warn')
        return
      }
      setConfirm({
        title: '从版本库删除',
        body: '将 svn delete 这 ' + paths.length + ' 个文件/目录；提交后才会真正从仓库删除。',
        detail: paths.slice(0, 6).join('\n') + (paths.length > 6 ? '\n…' : ''),
        okLabel: '删除',
        danger: true,
        onOk: async () => {
          const result = await perform('正在删除…', () => api('/delete', { wc: currentPath, paths: paths }))
          if (!result) return false
          notify('已标记删除 ' + paths.length + ' 项')
          await refreshAll()
          return true
        },
      })
    }

    function askAdd() {
      const paths = selectedEntries.filter((entry) => entry.item === 'unversioned').map((entry) => entry.path)
      if (!paths.length) {
        notify('先勾选未纳入版本控制的文件', 'warn')
        return
      }
      setConfirm({
        title: '纳入版本控制',
        body: '将把这 ' + paths.length + ' 个文件 svn add，之后即可提交。',
        detail: paths.slice(0, 6).join('\n') + (paths.length > 6 ? '\n…' : ''),
        okLabel: '纳入',
        onOk: async () => {
          const result = await perform('正在纳入…', () => api('/add', { wc: currentPath, paths: paths }))
          if (!result) return false
          notify('已纳入 ' + paths.length + ' 个文件')
          await refreshAll()
          return true
        },
      })
    }

    function askResolve() {
      const paths = selectedEntries.filter(hasConflict).map((entry) => entry.path)
      if (!paths.length) {
        notify('先勾选有冲突的文件', 'warn')
        return
      }
      setResolveOpen(true)
    }

    async function doResolve(accept) {
      const paths = selectedEntries.filter(hasConflict).map((entry) => entry.path)
      const result = await perform('正在标记解决…', () => api('/resolve', { wc: currentPath, paths: paths, accept: accept }))
      if (!result) return
      notify('已标记 ' + paths.length + ' 个文件为解决（' + accept + '）')
      setResolveOpen(false)
      setSelected(Object.create(null))
      await refreshAll()
    }

    function askCleanup() {
      setConfirm({
        title: '清理工作副本',
        body: '执行 svn cleanup，清理锁和未完成的事务。工作副本被锁住或中断过操作时使用。',
        okLabel: '清理',
        onOk: async () => {
          const result = await perform('正在清理…', () => api('/cleanup', { wc: currentPath }))
          if (!result) return false
          notify('清理完成')
          return true
        },
      })
    }

    function applyFilters() {
      loadLog({ filters: filterDraft })
    }

    function resetFilters() {
      const empty = { author: '', keyword: '', path: '', from: '', to: '' }
      setFilterDraft(empty)
      loadLog({ filters: empty })
    }

    const tabButton = (name, label, count) => h('button', {
      type: 'button',
      className: 'svn-tab' + (tab === name ? ' on' : ''),
      onClick: () => setTab(name),
    }, label, count ? h('span', { className: 'svn-count' }, count) : null)

    const total = status && status.summary ? status.summary.total : 0

    return h('div', { className: 'svn-root svn-shell', onMouseDown: (event) => event.stopPropagation() },
      h('div', { className: 'svn-head' },
        h('div', { className: 'svn-logo' }, 'SVN'),
        h('div', { className: 'svn-headmain' },
          h('div', { className: 'svn-title' },
            '版本控制',
            current ? h('span', { className: 'svn-revpill', title: '当前版本' }, 'r' + current.revision) : null,
          ),
          h('div', { className: 'svn-sub', title: current ? current.path : '' },
            current ? current.name + ' · ' + current.path : '选择一个工作副本'),
        ),
        h('div', { className: 'svn-head-actions' },
          busy ? h('span', { className: 'svn-busy' }, h(Spinner), busy) : null,
          h('button', { type: 'button', className: 'svn-icon', title: '刷新', onClick: refreshAll, disabled: !!busy }, '⟳'),
          h('button', { type: 'button', className: 'svn-btn', onClick: askUpdate, disabled: !!busy || !current || current.ok === false }, '↓ 更新'),
          h('button', { type: 'button', className: 'svn-btn primary', onClick: openCommitDialog, disabled: !!busy || !current || current.ok === false }, '✓ 提交'),
        ),
      ),

      h('div', { className: 'svn-body' },
        h(SvnSidebar, {
          state: stateData,
          current: current,
          loading: stateLoading,
          error: stateError,
          busy: busy,
          onCleanup: askCleanup,
          onRetry: () => loadState(false),
        }),

        h('div', { className: 'svn-main' },
          h('div', { className: 'svn-tabs' },
            tabButton('changes', '更改', total || ''),
            tabButton('history', '历史', log && log.entries ? log.entries.length : ''),
            tab === 'diff' ? h('span', { className: 'svn-tab on' }, '差异') : null,
            tab === 'blame' ? h('span', { className: 'svn-tab on' }, '溯源') : null,
            h('div', { className: 'svn-tabsep' }),
            status ? h('span', { className: 'svn-muted' }, remote ? '已对比服务器' : '本地状态') : null,
          ),

          tab === 'changes' ? h(ChangesView, {
            status: status,
            loading: statusLoading,
            error: statusError,
            selected: selected,
            toggle: togglePath,
            selectAll: selectAll,
            invert: invertSelection,
            itemFilter: itemFilter,
            setItemFilter: setItemFilter,
            pathFilter: pathFilter,
            setPathFilter: setPathFilter,
            remote: remote,
            onRemote: () => {
              const next = !remote
              setRemote(next)
              loadStatus({ remote: next })
            },
            onRowDiff: (entry) => openDiff({ title: entry.path, body: { path: entry.path, unversioned: entry.item === 'unversioned' } }),
            onBlame: (entry) => openBlame(entry.path, entry.path),
            onCommit: openCommitDialog,
            onRevert: askRevert,
            onAdd: askAdd,
            onDelete: askDelete,
            onResolve: askResolve,
            onRetry: () => loadStatus({ remote: remote }),
            busy: busy,
          }) : null,

          tab === 'history' ? h(HistoryView, {
            log: log,
            loading: logLoading,
            error: logError,
            filters: filterDraft,
            setFilters: setFilterDraft,
            onApply: applyFilters,
            onReset: resetFilters,
            onLoadMore: () => log && loadLog({ append: true, beforeRev: log.nextBefore, filters: filters }),
            detail: detail,
            onSelectDetail: loadDetail,
            onRevisionDiff: (entry) => openDiff({ title: 'r' + entry.revision + ' 的改动', body: { revision: entry.revision } }),
            onPathDiff: (entry, item) => openDiff({
              title: 'r' + entry.revision + ' · ' + item.path,
              body: { revision: entry.revision, path: item.path },
            }),
            onPathBlame: (entry, item) => openBlame(item.path, 'r' + entry.revision + ' · ' + item.path, entry.revision),
            onRetry: () => loadLog({ filters: filters }),
          }) : null,

          tab === 'diff' ? h(DiffView, {
            diff: diff,
            onBack: () => setTab(returnTab),
            onBlame: () => {
              if (diff && diff.data && diff.data.relPath) openBlame(diff.data.relPath, diff.data.relPath, diff.data.revision)
            },
          }) : null,

          tab === 'blame' ? h(BlameView, {
            blame: blame,
            onBack: () => setTab(returnTab),
            onRevisionDiff: (revision) => openDiff({ title: 'r' + revision + ' 的改动', body: { revision: revision } }),
          }) : null,
        ),
      ),

      toast ? h('div', { className: 'svn-toast' + (toast.kind === 'err' ? ' err' : toast.kind === 'warn' ? ' warn' : '') }, toast.message) : null,

      confirm ? h(ConfirmDialog, {
        title: confirm.title,
        body: confirm.body,
        detail: confirm.detail,
        danger: confirm.danger,
        okLabel: confirm.okLabel,
        busy: busy,
        onOk: confirm.onOk,
        onClose: () => setConfirm(null),
      }) : null,

      commitOpen ? h(CommitDialog, {
        paths: commitPaths,
        entries: entries,
        message: commitMessage,
        setMessage: setCommitMessage,
        busy: busy,
        onClose: () => { if (!busy) setCommitOpen(false) },
        onSubmit: submitCommit,
      }) : null,

      resolveOpen ? h(ResolveDialog, {
        count: selectedEntries.filter(hasConflict).length,
        busy: busy,
        onClose: () => { if (!busy) setResolveOpen(false) },
        onConfirm: doResolve,
      }) : null,

    )
  }

  //#endregion

  //#region 侧栏

  function SvnSidebar(props) {
    const state = props.state
    const current = props.current
    const copies = (state && state.workingCopies) || []

    return h('div', { className: 'svn-side' },
      h('div', null,
        h('div', { className: 'svn-side-title' }, '工作副本'),
        props.loading ? h('div', { className: 'svn-loading', style: { flex: 'none', padding: 12 } }, h(Spinner), '加载中…') : null,
        props.error ? h('div', { className: 'svn-errorbox', style: { margin: '8px 0' } },
          h('span', null, props.error),
          h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry }, '重试'),
        ) : null,
        !props.loading && !copies.length ? h('div', { className: 'svn-side-empty' },
          '请在 CC GUI 打开本机 SVN 工作区。',
        ) : null,
        copies.map((item) => h('div', {
          key: item.path,
          className: 'svn-wc' + (current && current.path === item.path ? ' on' : ''),
          title: item.path,
        },
          h('div', { className: 'svn-wc-name' },
            h('span', { className: 'svn-dot' + (item.ok === false ? ' bad' : '') }),
            item.name || item.path,
            item.revision ? h('span', { className: 'svn-revpill' }, 'r' + item.revision) : null,
          ),
          h('div', { className: 'svn-wc-path' }, item.ok === false ? (item.error || '不可用') : item.path),
        )),
      ),

      current && current.ok !== false ? h('div', null,
        h('div', { className: 'svn-side-title' }, '仓库'),
        h('div', { className: 'svn-kv' },
          h('div', { className: 'svn-kv-row' }, h('span', { className: 'svn-kv-k' }, 'URL'), h('span', { className: 'svn-kv-v', title: current.url }, current.url || '-')),
          h('div', { className: 'svn-kv-row' }, h('span', { className: 'svn-kv-k' }, '仓库根'), h('span', { className: 'svn-kv-v', title: current.root }, current.root || '-')),
          h('div', { className: 'svn-kv-row' }, h('span', { className: 'svn-kv-k' }, '最后修改'), h('span', { className: 'svn-kv-v' }, 'r' + current.lastChangedRev + ' · ' + (current.lastChangedAuthor || '-'))),
          h('div', { className: 'svn-kv-row' }, h('span', { className: 'svn-kv-k' }, '时间'), h('span', { className: 'svn-kv-v' }, fmtDate(current.lastChangedDate))),
        ),
        h('div', { style: { display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' } },
          h('button', { type: 'button', className: 'svn-btn small', onClick: props.onCleanup, disabled: !!props.busy }, '清理锁'),
        ),
      ) : null,

    )
  }

  //#endregion

  //#region 更改视图

  function ChangesView(props) {
    const status = props.status
    const entries = (status && status.entries) || []
    const summary = (status && status.summary) || {}
    const keyword = props.pathFilter.trim().toLowerCase()
    const visible = entries.filter((entry) => {
      if (props.itemFilter !== 'all' && displayStatus(entry) !== props.itemFilter) return false
      if (keyword && !entry.path.toLowerCase().includes(keyword)) return false
      return true
    })
    const selectedCount = entries.filter((entry) => props.selected[entry.path]).length
    const chips = [
      ['conflicted', '冲突'], ['modified', '修改'], ['added', '新增'],
      ['deleted', '删除'], ['missing', '丢失'], ['unversioned', '未纳入'],
    ]

    return h('div', { className: 'svn-view' },
      h('div', { className: 'svn-chips' },
        h('button', {
          type: 'button', className: 'svn-chip' + (props.itemFilter === 'all' ? ' on' : ''),
          onClick: () => props.setItemFilter('all'),
        }, '全部 ', h('b', null, summary.total || 0)),
        chips.filter(([key]) => summary[key]).map(([key, label]) => h('button', {
          key: key,
          type: 'button',
          className: 'svn-chip' + (props.itemFilter === key ? ' on' : ''),
          onClick: () => props.setItemFilter(props.itemFilter === key ? 'all' : key),
        }, label, ' ', h('b', null, summary[key]))),
        summary.props ? h('span', { className: 'svn-muted', title: '属性被修改的文件数' }, '· 属性 ' + summary.props) : null,
      ),

      h('div', { className: 'svn-toolbar' },
        h('input', {
          className: 'svn-input grow',
          placeholder: '过滤路径…',
          value: props.pathFilter,
          onChange: (event) => props.setPathFilter(event.target.value),
        }),
        h('button', {
          type: 'button',
          className: 'svn-btn small' + (props.remote ? ' primary' : ''),
          onClick: props.onRemote,
          disabled: props.loading,
          title: 'svn status -u：对比服务器上的新版本',
        }, props.remote ? '✓ 已对比服务器' : '对比服务器'),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry, disabled: props.loading }, '刷新'),
      ),

      props.error ? h('div', { className: 'svn-errorbox' },
        h('span', null, props.error),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry }, '重试'),
      ) : null,

      h('div', { className: 'svn-list' },
        props.loading && !status ? h('div', { className: 'svn-loading' }, h(Spinner), '读取工作副本状态…') : null,
        !props.loading && status && visible.length === 0 ? h(Empty, {
          icon: '✓',
          title: entries.length ? '没有符合筛选条件的文件' : '工作副本没有本地更改',
          hint: entries.length ? '试试切换上方的状态筛选或清空过滤。' : '可以点右上角「更新」拉取最新版本。',
        }) : null,
        visible.map((entry) => {
          const remoteLabel = props.remote ? remoteStatusLabel(entry.reposStatus) : ''
          const parts = splitPath(entry.path)
          return h('div', {
            key: entry.path,
            className: 'svn-row' + (props.selected[entry.path] ? ' sel' : '') + (hasConflict(entry) ? ' conflict' : ''),
            onClick: () => props.onRowDiff(entry),
            title: entry.path + (entry.commit ? '\n最后提交：r' + entry.commit.revision + ' ' + (entry.commit.author || '') : ''),
          },
            h('input', {
              type: 'checkbox',
              checked: !!props.selected[entry.path],
              onClick: (event) => event.stopPropagation(),
              onChange: () => props.toggle(entry.path),
            }),
            h(StatusBadge, { item: displayStatus(entry) }),
            h('span', { className: 'svn-path' },
              parts[0] ? h('span', { className: 'svn-dir' }, parts[0]) : null,
              parts[1],
              entry.props === 'modified' ? h('span', { className: 'svn-prop', title: '属性有修改' }, 'P') : null,
            ),
            remoteLabel ? h('span', { className: 'svn-prop' }, '远端：' + remoteLabel) : null,
            entry.props === 'conflicted' ? h('span', { className: 'svn-tag' }, '属性冲突') : null,
            entry.treeConflicted ? h('span', { className: 'svn-tag' }, '树冲突') : null,
            entry.copied ? h('span', { className: 'svn-tag', style: { background: 'rgba(48,164,108,.16)', color: '#2f9e68' } }, '复制') : null,
            h('button', {
              type: 'button',
              className: 'svn-icon',
              style: { width: 22, height: 22, fontSize: 11 },
              title: '逐行溯源（blame）',
              onClick: (event) => { event.stopPropagation(); props.onBlame(entry) },
            }, '溯'),
          )
        }),
        props.loading && status ? h('div', { className: 'svn-loading', style: { flex: 'none', padding: 10 } }, h(Spinner), '刷新中…') : null,
      ),

      h('div', { className: 'svn-footer' },
        h('span', { className: 'svn-muted' }, '已选 ' + selectedCount + ' / ' + entries.length),
        h('div', { className: 'svn-footer-gap' }),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.selectAll }, '全选'),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.invert }, '反选'),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onAdd, disabled: !!props.busy }, '纳入'),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onResolve, disabled: !!props.busy }, '解决冲突'),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRevert, disabled: !!props.busy }, '还原'),
        h('button', { type: 'button', className: 'svn-btn small danger', onClick: props.onDelete, disabled: !!props.busy }, '删除'),
        h('button', { type: 'button', className: 'svn-btn primary', onClick: props.onCommit, disabled: !!props.busy || !(summary.total || 0) }, '提交所选'),
      ),
    )
  }

  //#endregion

  //#region 历史视图

  function HistoryView(props) {
    const log = props.log
    const entries = (log && log.entries) || []
    const detail = props.detail
    const filters = props.filters || {}

    return h('div', { className: 'svn-view' },
      h('div', { className: 'svn-toolbar' },
        h('input', {
          className: 'svn-input sm',
          placeholder: '作者',
          value: filters.author || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { author: event.target.value })),
        }),
        h('input', {
          className: 'svn-input grow',
          placeholder: '关键词（提交信息 / 作者）',
          value: filters.keyword || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { keyword: event.target.value })),
          onKeyDown: (event) => { if (event.key === 'Enter') props.onApply() },
        }),
        h('input', {
          className: 'svn-input md',
          placeholder: '限定路径',
          value: filters.path || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { path: event.target.value })),
          onKeyDown: (event) => { if (event.key === 'Enter') props.onApply() },
        }),
        h('input', {
          className: 'svn-input sm',
          type: 'date',
          title: '起始日期',
          value: filters.from || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { from: event.target.value })),
        }),
        h('input', {
          className: 'svn-input sm',
          type: 'date',
          title: '结束日期',
          value: filters.to || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { to: event.target.value })),
        }),
        h('button', { type: 'button', className: 'svn-btn small primary', onClick: props.onApply, disabled: props.loading }, '查询'),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onReset, disabled: props.loading }, '重置'),
      ),

      props.error ? h('div', { className: 'svn-errorbox' },
        h('span', null, props.error),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry }, '重试'),
      ) : null,

      h('div', { className: 'svn-history' },
        h('div', { className: 'svn-log' },
          h('div', { className: 'svn-log-list' },
            props.loading && !log ? h('div', { className: 'svn-loading' }, h(Spinner), '读取提交历史…') : null,
            !props.loading && log && entries.length === 0 ? h(Empty, {
              icon: '⌗',
              title: '没有匹配的提交记录',
              hint: '试试放宽作者 / 关键词 / 日期，或清空「限定路径」。',
            }) : null,
            entries.map((entry) => h('div', {
              key: entry.revision,
              className: 'svn-logrow' + (detail && detail.revision === entry.revision ? ' sel' : ''),
              onClick: () => props.onSelectDetail(entry),
            },
              h('span', { className: 'svn-rev' }, 'r' + entry.revision),
              h('div', { className: 'svn-logmain' },
                h('div', { className: 'svn-logmsg' }, firstLine(entry.message) || '(无提交信息)'),
                h('div', { className: 'svn-logmeta' },
                  (entry.author || '(无作者)') + ' · ' + fmtDate(entry.date),
                ),
              ),
            )),
            log && log.hasMore ? h('div', { className: 'svn-logmore' },
              h('button', { type: 'button', className: 'svn-btn small', onClick: props.onLoadMore, disabled: props.loading },
                props.loading ? '加载中…' : '加载更早的提交'),
            ) : null,
          ),
        ),
        h('div', { className: 'svn-detail' },
          detail ? h(CommitDetail, {
            entry: detail,
            onRetry: () => props.onSelectDetail(detail),
            onRevisionDiff: props.onRevisionDiff,
            onPathDiff: props.onPathDiff,
            onPathBlame: props.onPathBlame,
          }) : h('div', { className: 'svn-detail-empty' },
            h('div', null, '选择左侧的一条提交记录', h('br'), '查看提交信息、改动文件与版本差异'),
          ),
        ),
      ),
    )
  }

  function CommitDetail(props) {
    const entry = props.entry
    return h('div', null,
      h('div', { className: 'svn-detail-head' },
        h('span', { className: 'svn-rev' }, 'r' + entry.revision),
        h('span', { className: 'svn-detail-author' }, entry.author || '(无作者)'),
        h('span', { className: 'svn-detail-date' }, fmtDate(entry.date)),
        h('div', { style: { marginLeft: 'auto', display: 'flex', gap: 5 } },
          h('button', {
            type: 'button', className: 'svn-btn small', title: '复制版本号',
            onClick: () => copyText(String(entry.revision)),
          }, '复制版本'),
          h('button', { type: 'button', className: 'svn-btn small primary', onClick: () => props.onRevisionDiff(entry) }, '查看此版本差异'),
        ),
      ),
      h('pre', { className: 'svn-msg' }, entry.message || '(无提交信息)'),
      entry.loading ? h('div', { className: 'svn-hint', role: 'status' }, '正在读取改动路径…') : null,
      entry.error ? h('div', { className: 'svn-errorbox' },
        h('span', null, entry.error),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry }, '重试'),
      ) : null,
      !entry.loading && !entry.error ? h('div', { className: 'svn-section' }, '改动文件 ' + (entry.paths ? entry.paths.length : 0)) : null,
      entry.paths && entry.paths.length ? h('div', { className: 'svn-pathlist' },
        entry.paths.map((item, index) => {
          const action = actionMeta(item.action)
          return h('div', {
            key: index + ':' + item.path,
            className: 'svn-pathrow',
            onClick: () => props.onPathDiff(entry, item),
            title: '查看该文件在此版本中的差异',
          },
            h('span', { className: 'svn-action', style: { background: action.bg, color: action.color } }, item.action),
            h('span', { className: 'svn-path' }, item.path),
            item.copyFrom ? h('span', { className: 'svn-tag', title: '复制自 ' + item.copyFrom + '@' + item.copyFromRev }, 'copy') : null,
            h('button', {
              type: 'button', className: 'svn-icon', style: { width: 22, height: 22, fontSize: 10 },
              title: '查看该版本中此文件的逐行溯源',
              onClick: (event) => { event.stopPropagation(); props.onPathBlame(entry, item) },
            }, '溯'),
          )
        }),
      ) : !entry.loading && !entry.error ? h('div', { className: 'svn-hint' }, '这个版本没有记录改动路径。') : null,
      h('div', { className: 'svn-hint', style: { marginTop: 12 } }, '提示：点文件看该版本中的差异；「溯」按该版本溯源。'),
    )
  }

  //#endregion

  //#region 差异 / 溯源

  function DiffView(props) {
    const state = props.diff
    const [wrap, setWrap] = useState(false)
    if (!state) return null

    if (state.loading) {
      return h('div', { className: 'svn-view' },
        h('div', { className: 'svn-diff-head' },
          h('span', { className: 'svn-diff-title' }, state.title),
          h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBack }, '← 返回'),
        ),
        h('div', { className: 'svn-loading' }, h(Spinner), '计算差异…'),
      )
    }

    if (state.error) {
      return h('div', { className: 'svn-view' },
        h('div', { className: 'svn-diff-head' },
          h('span', { className: 'svn-diff-title' }, state.title),
          h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBack }, '← 返回'),
        ),
        h('div', { className: 'svn-errorbox' }, h('span', null, state.error)),
      )
    }

    const data = state.data || {}
    const lines = parseDiff(data.diff || '')
    const shown = lines.slice(0, 4000)

    return h('div', { className: 'svn-view svn-diff' },
      h('div', { className: 'svn-diff-head' },
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBack }, '← 返回'),
        h('span', { className: 'svn-diff-title', title: state.title }, state.title),
        data.relPath ? h('span', { className: 'svn-muted' }, data.relPath) : null,
        h('span', { className: 'svn-stat add' }, '+' + (data.additions || 0)),
        h('span', { className: 'svn-stat del' }, '-' + (data.deletions || 0)),
        data.truncated ? h('span', { className: 'svn-tag' }, '已截断') : null,
        h('div', { style: { marginLeft: 'auto', display: 'flex', gap: 5 } },
          data.relPath && !data.synthesized ? h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBlame, title: '查看该文件的逐行溯源' }, '溯源') : null,
          h('button', { type: 'button', className: 'svn-btn small', onClick: () => copyText(data.diff || '') }, '复制差异'),
          h('button', { type: 'button', className: 'svn-btn small' + (wrap ? ' primary' : ''), onClick: () => setWrap(!wrap) }, '换行'),
        ),
      ),
      data.binary ? h('div', { className: 'svn-hint', style: { padding: '8px 12px' } }, '文件被标记为二进制，文本差异无法显示。') : null,
      data.outsideWc ? h('div', { className: 'svn-hint', style: { padding: '8px 12px' } }, '该路径不在当前工作副本内，显示的是整个版本的差异。') : null,
      data.synthesized ? h('div', { className: 'svn-hint', style: { padding: '8px 12px' } }, '该文件未纳入版本控制，下面按「新增」展示工作副本内容。') : null,
      data.empty ? h(Empty, { icon: '≡', title: '没有差异', hint: '工作副本与版本库在这一范围里内容一致。' }) : h('div', { className: 'svn-diff-body' + (wrap ? ' wrap' : '') },
        shown.map((line, index) => h('div', { key: index, className: 'svn-dline ' + line.type },
          h('span', { className: 'svn-dno' }, line.oldNo === undefined ? '' : line.oldNo),
          h('span', { className: 'svn-dno' }, line.newNo === undefined ? '' : line.newNo),
          h('span', { className: 'svn-dtext' }, line.text === '' ? ' ' : line.text),
        )),
        lines.length > shown.length ? h('div', { className: 'svn-hint', style: { padding: '8px 12px' } },
          '差异共 ' + lines.length + ' 行，仅显示前 ' + shown.length + ' 行；完整内容可复制。',
        ) : null,
      ),
    )
  }

  function BlameView(props) {
    const state = props.blame
    if (!state) return null

    const header = (right) => h('div', { className: 'svn-diff-head' },
      h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBack }, '← 返回'),
      h('span', { className: 'svn-diff-title' }, 'blame · ' + state.label),
      right || null,
    )

    if (state.loading) {
      return h('div', { className: 'svn-view' }, header(), h('div', { className: 'svn-loading' }, h(Spinner), '逐行溯源…'))
    }
    if (state.error) {
      return h('div', { className: 'svn-view' }, header(), h('div', { className: 'svn-errorbox' }, h('span', null, state.error)))
    }

    const data = state.data || {}
    const lines = (data.lines || []).slice(0, 3000)
    return h('div', { className: 'svn-view svn-blame' },
      header(h(React.Fragment, null,
        data.remote ? h('span', { className: 'svn-tag', title: '该文件按仓库版本溯源，不含本地未提交的改动' }, '仓库版本') : null,
        h('span', { className: 'svn-muted' }, data.total + ' 行'),
      )),
      h('div', { className: 'svn-blame-body' },
        lines.map((line) => h('div', { key: line.line, className: 'svn-blame-row' },
          h('span', { className: 'svn-blame-no' }, line.line),
          h('span', {
            className: 'svn-blame-rev',
            title: line.revision ? '查看 r' + line.revision + ' 的差异' : '本地未提交的改动',
            onClick: () => { if (line.revision && props.onRevisionDiff) props.onRevisionDiff(line.revision) },
          }, line.revision ? 'r' + line.revision : '-'),
          h('span', { className: 'svn-blame-author', title: line.author || '' }, line.author || '-'),
          h('span', { className: 'svn-blame-text' }, line.text === '' ? ' ' : line.text),
        )),
        (data.lines || []).length > lines.length ? h('div', { className: 'svn-hint', style: { padding: 8 } },
          '共 ' + data.total + ' 行，仅显示前 ' + lines.length + ' 行。',
        ) : null,
      ),
    )
  }

  //#endregion

  //#region 提交 / 解决 / 添加 / 设置

  function CommitDialog(props) {
    const entryMap = {}
    for (const entry of props.entries) entryMap[entry.path] = entry
    return h(Modal, {
      title: '提交 ' + props.paths.length + ' 个文件',
      width: 640,
      onClose: props.onClose,
      footer: h(React.Fragment, null,
        h('button', { type: 'button', className: 'svn-btn', onClick: props.onClose, disabled: !!props.busy }, '取消'),
        h('button', {
          type: 'button',
          className: 'svn-btn primary',
          onClick: props.onSubmit,
          disabled: !!props.busy || !props.message.trim(),
        }, props.busy || '提交'),
      ),
    },
      h('div', { className: 'svn-commit-list' },
        props.paths.map((pathValue) => {
          const entry = entryMap[pathValue]
          const meta = metaOf(entry ? entry.item : 'modified')
          return h('div', { key: pathValue, className: 'svn-commit-item' },
            h('span', { className: 'svn-badge', style: { width: 16, height: 16, fontSize: 9.5, background: meta.bg, color: meta.color } }, meta.letter),
            h('span', { className: 'svn-path' }, pathValue),
          )
        }),
      ),
      h('textarea', {
        className: 'svn-textarea',
        placeholder: '提交信息（必填）…  Ctrl+Enter 提交',
        value: props.message,
        autoFocus: true,
        onChange: (event) => props.setMessage(event.target.value),
        onKeyDown: (event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') props.onSubmit()
        },
      }),
      h('div', { className: 'svn-hint' }, '提交信息以 UTF-8 写入仓库；提交失败时工作副本保持原样。'),
    )
  }

  function ResolveDialog(props) {
    const [accept, setAccept] = useState('working')
    const options = [
      ['working', '保留当前工作副本内容', '把冲突标记为已解决，文件内容保持现状（通常已手工改好）。'],
      ['mine-full', '全部采用我的版本', '用本地版本覆盖，丢弃仓库带来的改动。'],
      ['theirs-full', '全部采用仓库版本', '用仓库版本覆盖，丢弃本地改动。'],
      ['base', '采用 BASE 版本', '回到最近一次更新后的原始内容。'],
    ]
    return h(Modal, {
      title: '解决冲突（' + props.count + ' 个文件）',
      width: 500,
      onClose: props.onClose,
      footer: h(React.Fragment, null,
        h('button', { type: 'button', className: 'svn-btn', onClick: props.onClose, disabled: !!props.busy }, '取消'),
        h('button', { type: 'button', className: 'svn-btn primary', onClick: () => props.onConfirm(accept), disabled: !!props.busy }, props.busy || '标记为已解决'),
      ),
    },
      options.map(([value, label, hint]) => h('label', {
        key: value,
        className: 'svn-choice' + (accept === value ? ' on' : ''),
      },
        h('input', { type: 'radio', name: 'svn-resolve', checked: accept === value, onChange: () => setAccept(value) }),
        h('div', null, h('b', null, label), h('span', null, hint)),
      )),
    )
  }


  function WorkspacePanel() {
    const [workspaces, setWorkspaces] = useState([])
    const [workspacePath, setWorkspacePath] = useState('')
    const [message, setMessage] = useState('正在读取工作区…')
    const api = useMemo(() => makeApi(workspacePath), [workspacePath])

    useEffect(() => {
      let active = true
      ctx.workspaces.list().then((rows) => {
        if (!active) return
        const localRows = rows.filter((row) => row.path.startsWith('/') && row.kind !== 'worktree')
        localRows.sort((left, right) => (right.lastOpenedAt ?? 0) - (left.lastOpenedAt ?? 0))
        setWorkspaces(localRows)
        setWorkspacePath(localRows[0]?.path || '')
        setMessage(localRows.length ? '' : '请先在 CC GUI 添加本机 SVN 工作区。')
      }).catch((error) => {
        if (active) setMessage('读取工作区失败：' + error.message)
      })
      return () => { active = false }
    }, [])

    return h('div', { className: 'svn-root svn-center' },
      workspaces.length ? h('label', { className: 'svn-workspace-picker' },
        h('span', { className: 'svn-side-title' }, '工作区'),
        h('select', {
          className: 'svn-input',
          value: workspacePath,
          onChange: (event) => setWorkspacePath(event.target.value),
        }, workspaces.map((row) => h('option', { key: row.id, value: row.path }, row.name))),
      ) : h('div', { className: 'svn-workspace-picker', role: 'status' }, message),
      workspacePath ? h(SvnApp, { key: workspacePath, api }) : null,
    )
  }

  const label = () => 'SVN 管理面板'
  ctx.ui.registerCenterTab({ key: 'svn', title: label, component: WorkspacePanel })
  ctx.ui.registerSidebarNav({
    key: 'svn',
    label,
    onOpen: () => ctx.ui.openCenterTab('svn'),
  })
}
