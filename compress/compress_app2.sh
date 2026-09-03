#!/bin/sh
echo create app2.js

sh_dir=`dirname $0`
cd "$sh_dir" && sh_dir=$(pwd)

src=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/app2/js/src
target=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/app2/js

echo   DIR：${sh_dir}
echo   SRC：${src}
echo TARGET：${target}

cat ${src}/*.js  > ${target}/app2.js


echo start compress app2.js with google
# 在 target 目录内调用编译器，map 的 file/sources 会写成相对 target 的裸文件名
(cd "${target}" && java -jar "${sh_dir}/compiler.jar" \
 --js app2.js --js_output_file app2.min.js --create_source_map app2.min.js.map)

# echo "//# sourceMappingURL=/EmpScriptV2/EWA_STYLE/app2/js/app2.min.js.map" >> ${target}/app2.min.js
echo OK
