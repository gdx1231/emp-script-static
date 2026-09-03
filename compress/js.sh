#!/bin/sh

echo create EWA.js
sh_dir=`dirname $0`
cd "$sh_dir" && sh_dir=$(pwd)

src=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/js/source/src
target=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/js/source
final=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/js

echo   DIR：${sh_dir}
echo   SRC：${src}
echo TARGET：${target}
echo FINAL：${final}

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

# 未压缩合并文件放到最终目录（ewa.js），并作为 sourcemap 的 source
mv ${target}/EWA_ALL.js ${final}/ewa.js

# 在最终目录内调用编译器，map 的 file/sources 写成相对 ewa.min.map 的裸文件名
(cd "${final}" && java -jar "${sh_dir}/compiler.jar" \
 --js ewa.js --js_output_file ewa.min.js --language_out ECMASCRIPT_2019 \
 --create_source_map ewa.min.map)

echo "//# sourceMappingURL=ewa.min.map" >> "${final}/ewa.min.js"
echo start combine EWA_ALL.min.2.0.js
















