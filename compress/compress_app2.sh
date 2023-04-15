#!/bin/sh
echo create app2.js

sh_dir=`dirname $0`

src=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/app2/js/src
target=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/app2/js

cd `dirname $0`
echo 当前目录：$(pwd)

cat ${src}/*.js  > ${target}/app2.js
 

echo start compress app2.js with google 
java -jar ${sh_dir}/compiler.jar \
 --js ${target}/app2.js --js_output_file ${target}/app2.min.js  --create_source_map ${target}/app2.min.js.map

echo "//# sourceMappingURL=/EmpScriptV2/EWA_STYLE/app2/js/app2.min.js.map" >> ${target}/app2.min.js 
echo OK