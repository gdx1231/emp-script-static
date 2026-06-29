---
name: source-map-debugging
description: Debugging unexpected URLs/content in source map files — verify actual origin before explaining
source: auto-skill
extracted_at: '2026-06-29T06:11:21.952Z'
---

# Source Map Debugging

When investigating unexpected URLs or content appearing in browser DevTools from source maps:

## Steps

1. **Search the actual map file first** — use `grep` or parse JSON to check if the content literally exists in the `.map` file. Don't assume.

2. **Check the `sources` field** — parse the map JSON and inspect `sources` and `sourceRoot`. Source map `sources` paths are relative and get resolved by the browser against the map file's URL.

3. **Verify the user's actual browser URL** — ask or check what URL the user is actually visiting. The browser resolves relative `sources` paths against the map file URL, which is derived from the page URL. If the user's URL doesn't contain the unexpected domain, the domain is NOT coming from source map path resolution.

4. **Search exhaustively across all projects** — if the content isn't in the map file and doesn't match the browser URL, it must come from somewhere else:
   - Another project's configuration files
   - Server-side rendered pages
   - Runtime-injected JavaScript variables
   - A different loaded script's source map

## Common Pitfall

Do NOT jump to "the browser resolves relative paths against the page URL" as the explanation without first confirming the user's actual browser URL matches the unexpected domain. If the user is on `localhost:8080` but sees `demo1.example.com`, the domain is coming from application code or configuration, not from URL resolution.

## Fixing Source Map `sources` Paths

When `sources` contains build-machine relative paths (e.g., `compress/../src/...`), fix the build script to normalize paths to filenames only. Post-process the generated map file after the compiler runs, replacing each entry in the `sources` array with just its basename.
