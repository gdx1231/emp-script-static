#!/bin/sh
echo create app2.js
cd `dirname $0`
echo 当前目录：$(pwd)

cat src/*.js  > app2.js
 

echo start compress app2.js with google 
java -jar /Users/admin/java/workspace/EmpScriptV2/WebRoot/EWA_STYLE/js/js_jquery/compiler.jar \
 --js app2.js --js_output_file app2.min.js  --create_source_map app2.min.js.map

echo "//# sourceMappingURL=/EmpScriptV2/EWA_STYLE/app2/js/app2.min.js.map" >> app2.min.js 
echo OK