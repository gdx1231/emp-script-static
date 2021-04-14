#!/bin/sh
echo create vue-ewa.js
cd `dirname $0`
echo 当前目录：$(pwd)

cat ../src/main/resources/EWA_STYLE/vue/src/0.txt \
	../src/main/resources/EWA_STYLE/vue/src/*.js \
	../src/main/resources/EWA_STYLE/vue/src/z.txt  > ../src/main/resources/EWA_STYLE/vue/vue-ewa.js
 

echo start compress app2.js with google 
java -jar compiler.jar \
 --js ../src/main/resources/EWA_STYLE/vue/vue-ewa.js \
 --js_output_file ../src/main/resources/EWA_STYLE/vue/vue-ewa.min.js  \
 --create_source_map ../src/main/resources/EWA_STYLE/vue/vue-ewa.min.js.map

echo "//# sourceMappingURL=vue-ewa.min.js.map" >> ../src/main/resources/EWA_STYLE/vue/vue-ewa.min.js 
echo OK