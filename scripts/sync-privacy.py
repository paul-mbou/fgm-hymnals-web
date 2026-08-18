#!/usr/bin/env python3
"""Regenerate privacy.html from the Flutter app PRIVACY_POLICY.md.

Usage (from fgm-hymnals-web root):
  python3 scripts/sync-privacy.py
  npm run sync:privacy
"""

from __future__ import annotations

import html
import pathlib
import re
import sys

WEB_ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_MD = (
    pathlib.Path.home()
    / "My_Projects/Flutter/Apps/fgm_lyrics_app/PRIVACY_POLICY.md"
)
SITE_URL = "https://fgm-hymnals-web.vercel.app/privacy"
OLD_SITE = "https://sites.google.com/view/fgmn-hymnal-privacy-policy"


def inline(s: str) -> str:
    s = html.escape(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        r'<a href="\2" rel="noopener noreferrer">\1</a>',
        s,
    )
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    return s


def convert(md: str) -> str:
    lines = md.splitlines()
    out: list[str] = []
    i = 0
    in_ul = False
    in_ol = False
    table_rows: list[str] = []

    def close_lists() -> None:
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    def flush_table() -> None:
        nonlocal table_rows
        if not table_rows:
            return
        out.append('<div class="table-wrap"><table>')
        for ri, row in enumerate(table_rows):
            cells = [c.strip() for c in row.strip("|").split("|")]
            if ri == 1 and all(
                re.fullmatch(r":?-+:?", c.replace(" ", "")) for c in cells
            ):
                continue
            tag = "th" if ri == 0 else "td"
            out.append(
                "<tr>"
                + "".join(f"<{tag}>{inline(c)}</{tag}>" for c in cells)
                + "</tr>"
            )
        out.append("</table></div>")
        table_rows = []

    while i < len(lines):
        stripped = lines[i].strip()

        if stripped.startswith("|") and "|" in stripped[1:]:
            close_lists()
            table_rows.append(stripped)
            i += 1
            continue
        if table_rows:
            flush_table()

        if stripped == "---":
            close_lists()
            i += 1
            continue

        if stripped.startswith("# "):
            close_lists()
            out.append(f"<h1>{inline(stripped[2:])}</h1>")
        elif stripped.startswith("### "):
            close_lists()
            out.append(f"<h3>{inline(stripped[4:])}</h3>")
        elif stripped.startswith("## "):
            close_lists()
            out.append(f"<h2>{inline(stripped[3:])}</h2>")
        elif stripped.startswith("> "):
            close_lists()
            out.append(f'<p class="note">{inline(stripped[2:])}</p>')
        elif re.match(r"^\d+\.\s+", stripped):
            if in_ul:
                out.append("</ul>")
                in_ul = False
            if not in_ol:
                out.append("<ol>")
                in_ol = True
            item = re.sub(r"^\d+\.\s+", "", stripped)
            out.append(f"<li>{inline(item)}</li>")
        elif stripped.startswith("- "):
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{inline(stripped[2:])}</li>")
        elif stripped == "":
            close_lists()
        elif (
            stripped.startswith("*")
            and stripped.endswith("*")
            and not stripped.startswith("**")
        ):
            close_lists()
            out.append(f'<p class="muted">{inline(stripped.strip("* "))}</p>')
        else:
            close_lists()
            out.append(f"<p>{inline(stripped)}</p>")
        i += 1

    close_lists()
    if table_rows:
        flush_table()
    return "\n".join(out)


def patch_urls(md: str) -> str:
    return md.replace(OLD_SITE, SITE_URL)


def build_page(en_html: str, fr_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description"
    content="Privacy Policy for FGM Hymnals — Official Full Gospel Mission hymnbook app." />
  <meta name="theme-color" content="#141210" />
  <meta property="og:title" content="Privacy Policy — FGM Hymnals" />
  <meta property="og:description" content="How FGM Hymnals collects, uses, and protects your data." />
  <meta property="og:image" content="/logo.png" />
  <meta property="og:type" content="website" />
  <link rel="icon" href="/logo.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
    rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <title>Privacy Policy — FGM Hymnals</title>
</head>

<body class="page-privacy">
  <div class="grain" aria-hidden="true"></div>

  <header class="top">
    <a class="brand-mark" href="/" aria-label="FGM Hymnals">
      <img src="/logo.png" width="36" height="36" alt="" />
      <span>FGM Hymnals</span>
    </a>
    <div class="top-actions">
      <div class="lang" role="group" aria-label="Language">
        <button type="button" data-lang="en" class="lang-btn is-active">EN</button>
        <button type="button" data-lang="fr" class="lang-btn">FR</button>
      </div>
      <a class="btn btn-sm" href="/" data-i18n="backHome">Back to home</a>
    </div>
  </header>

  <main class="legal">
    <article class="prose is-lang-active" data-lang-block="en">
{en_html}
    </article>
    <article class="prose" data-lang-block="fr" hidden>
{fr_html}
    </article>
  </main>

  <footer class="foot">
    <p>
      <span data-i18n="footerBrand">FGM Hymnals · Official · MM</span>
    </p>
    <p>
      <a href="/" data-i18n="backHome">Back to home</a>
      ·
      <a href="/privacy" data-i18n="privacy">Privacy Policy</a>
    </p>
  </footer>

  <script src="/script.js" defer></script>
</body>

</html>
"""


def main() -> int:
    md_path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_MD
    if not md_path.is_file():
        print(f"Privacy policy not found: {md_path}", file=sys.stderr)
        return 1

    text = patch_urls(md_path.read_text(encoding="utf-8"))
    parts = re.split(r"\n(?=# Politique de confidentialité)", text, maxsplit=1)
    en_md = parts[0].strip()
    fr_md = parts[1].strip() if len(parts) > 1 else ""
    if not fr_md:
        print("French section missing in PRIVACY_POLICY.md", file=sys.stderr)
        return 1

    page = build_page(convert(en_md), convert(fr_md))
    out = WEB_ROOT / "privacy.html"
    out.write_text(page, encoding="utf-8")

    public = WEB_ROOT / "public" / "privacy.html"
    if public.parent.is_dir():
        public.write_text(page, encoding="utf-8")

    print(f"Synced {md_path} → {out}")
    if public.parent.is_dir():
        print(f"Synced {md_path} → {public}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
