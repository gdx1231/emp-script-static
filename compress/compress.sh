#!/bin/sh

echo create EWA.js
cd `dirname $0`
echo 当前目录：$(pwd)

cat src/core/*.js  > EWA.js

echo create EWA_UI.js
cat src/ui/*.js > EWA_UI.js

echo create EWA_FRAME.js
cat src/frames/*.js > EWA_FRAME.js

echo create EWA_MISC.js
cat src/misc/*.js > EWA_MISC.js

echo create EWA_ALL.js
cat EWA.js EWA_UI.js EWA_FRAME.js  EWA_MISC.js > EWA_ALL.js

echo start compress with google 


#echo start compress EWA_ALL.js
java -jar compiler.jar --js EWA_ALL.js --js_output_file EWA_ALL.min.compiler.js --create_source_map EWA_ALL.min.2.0.js.map

echo start combine EWA_ALL.min.2.0.js
mv EWA_ALL.min.compiler.js EWA_ALL.min.2.0.js
echo "//# sourceMappingURL=/EmpScriptV2/EWA_STYLE/js/js_jquery/EWA_ALL.min.2.0.js.map" >> EWA_ALL.min.2.0.js
















