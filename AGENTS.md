# AGENTS.md — emp-script-static

## Build & test

```bash
mvn clean package      # build JAR (also copies to sister project `../../workspace.newVersion/allclass/lib/`)
mvn clean install      # install to local Maven repo
mvn clean deploy -P release  # release to Maven Central (needs GPG + Sonatype credentials)
mvn test               # run tests (JUnit 4; only a single main-method Test.java, no real suites)
```

Java source target is **1.8**. The only dependency scoped `compile` (not `provided`/`test`) is `commons-io`.

## Architecture

This is a **static resource library** for the EWA framework — it ships JS, CSS, images inside a JAR.  
The 5 Java classes in `com.gdxsoft.easyweb.resources` load and serve these resources at runtime.

### Resource layout

All deployable static files live under `src/main/resources/EmpScriptV2/`.  
`Resources.java` prepends `/EmpScriptV2` to every path when looking up via `getResource()`.  
Add new static files inside that tree; the JAR's classpath root is NOT served directly.

### JS source modules (before compression)

```
EmpScriptV2/EWA_STYLE/js/source/src/
  core/       → concat → EWA.js
  ui/         → concat → EWA_UI.js
  frames/     → concat → EWA_FRAME.js
  misc/       → concat → EWA_MISC.js
```

Concatenated & minified by `compress/js.sh` (Google Closure Compiler via `compiler.jar`).  
Output artifacts (`ewa.js`, `ewa.min.js`, `ewa.min.map`) land in `EWA_STYLE/js/`.

### Backward-compatible path rewrites

`Resources.getResource()` maps several legacy paths to current locations — see `Resources.java:130-155`.  
Examples: `EWA_ALL.js` → `EWA_STYLE/js/ewa.js`, missing-version jQuery → pinned version, typo `thrid-party` → `third-party`.  
Keep these mappings when renaming or moving resources.

### Compress scripts

Run from the `compress/` directory. Scripts use relative paths (`../src/main/resources/...`), so the working directory matters.

### HSQLDB demo databases

`ewa-script-hsqldb/start.sh` starts 3 databases on port 11002 for local EWA development.  
`DemoDataOfHsqldb.java` can programmatically extract the data ZIP.

## Security notes

`Resources.java` blocks paths containing `..`, disallowed extensions (exe, bat, sh, java, jsp, class, jar, jar, properties),  
and filenames containing `ewa_conf` or `appliaction.yml` (note: intentional/frozen typo — do not "fix").

## Existing docs

- `QWEN.md` — full Chinese-language project overview (more detail than README)
- `docs/` — JavaScript module documentation (markdown generated from source comments)
