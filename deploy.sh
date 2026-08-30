#!/usr/bin/env bash
# Deploy helper for iCare Transportation Services -> GitHub Pages
#
# Usage:  ./deploy.sh
#
# Assembles docs/ (the GitHub Pages source) from the source tree, then
# rewrites the ../css and ../js relative links to sibling-relative
# (css/ and js/), then commits + pushes to origin/master.
#
# NOTE: the source layout is NOT a flat static site. The HTML lives in
# public/ while css/, js/, and assets/ live at the PROJECT ROOT (which
# is why the HTML references them as ../css and ../js locally). Pages
# serves /docs as the site ROOT, so everything must be flattened to
# siblings. This script reproduces exactly what was deployed by hand:
#   - copy public/*.html          -> docs/
#   - copy css/ js/ assets/       -> docs/  (siblings of the HTML)
#
# Why: GitHub Pages serves the /docs folder as the site ROOT, so the
# HTML and the css/js folders are siblings. The ../ path that works
# locally (public/ one level below css/) breaks on Pages. This script
# fixes it automatically so styling always loads.

set -euo pipefail
cd "$(dirname "$0")"

echo "==> Assembling docs/ from public/ + root css/ js/ assets/"
rm -rf docs
mkdir -p docs
cp -r public/* docs/      # HTML pages (index.html, about.html, ...)
cp -r css     docs/        # sibling styles
cp -r js      docs/        # sibling scripts
cp -r assets  docs/        # images, fonts, favicon

echo "==> Rewriting ../css, ../js, ../assets -> sibling paths for Pages root"
for f in docs/*.html; do
  sed -i -E 's#\.\./css/#css/#g; s#\.\./js/#js/#g; s#\.\./assets/#assets/#g' "$f"
done

echo "==> Committing + pushing"
git add docs
git commit -m "Deploy: sync public/ to docs/ ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
git push origin master

echo "==> Done. Live at https://ishowlinux.github.io/icare-transportation-services/"
