#!/bin/sh
echo create vue-ewa.js
cd `dirname $0`
echo 当前目录：$(pwd)

cat src/0.txt src/*.js src/z.txt  > vue-ewa.js
 

echo start compress app2.js with google 
java -jar /Users/admin/java/workspace/EmpScriptV2/WebRoot/EWA_STYLE/js/js_jquery/compiler.jar \
 --js vue-ewa.js --js_output_file vue-ewa.min.js  --create_source_map vue-ewa.min.js.map

echo "//# sourceMappingURL=/EmpScriptV2/EWA_STYLE/vue/vue-ewa.min.js.map" >> vue-ewa.min.js 
echo OK