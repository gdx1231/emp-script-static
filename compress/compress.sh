#!/bin/sh

echo create EWA.js
sh_dir=`dirname $0`

src=${sh_dir}/../src/main/resources/EWA_STYLE/js/source/src
target=${sh_dir}/../src/main/resources/EWA_STYLE/js/source

echo   DIR：${sh_dir}
echo   SRC：${src}
echo TARGET：${target}

cat ${src}/core/*.js  > ${target}/EWA.js

echo create EWA_UI.js
cat ${src}/ui/*.js > ${target}/EWA_UI.js

echo create EWA_FRAME.js
cat ${src}/frames/*.js > ${target}/EWA_FRAME.js

echo create EWA_MISC.js
cat ${src}/misc/*.js > ${target}/EWA_MISC.js

echo create EWA_ALL.js
cat ${target}/EWA.js ${target}/EWA_UI.js ${target}/EWA_FRAME.js  ${target}/EWA_MISC.js > ${target}/EWA_ALL.js

echo start compress with google 

#echo start compress EWA_ALL.js
java -jar ${sh_dir}/compiler.jar --js ${target}/EWA_ALL.js --js_output_file ${target}/EWA_ALL.min.js --create_source_map ${target}/EWA_ALL.min.map

echo "//# sourceMappingURL=ewa.min.map" >> ${target}/EWA_ALL.min.js
echo start combine EWA_ALL.min.2.0.js
mv ${target}/EWA_ALL.min.js ${target}/../ewa.min.js
mv ${target}/EWA_ALL.js ${target}/../ewa.js
mv ${target}/EWA_ALL.min.map ${target}/../ewa.min.map
















