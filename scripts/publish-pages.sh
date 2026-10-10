#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$root"

npm run build:web

remote=$(git remote get-url origin)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

cp -R dist/. "$tmp/"
touch "$tmp/.nojekyll"

git -C "$tmp" init -b gh-pages
git -C "$tmp" add -A
git -C "$tmp" commit -m "Publica el sitio de GitHub Pages."
git -C "$tmp" push --force "$remote" HEAD:gh-pages
