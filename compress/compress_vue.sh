#!/bin/sh
echo create vue-ewa.js
sh_dir=`dirname $0`
cd "$sh_dir" && sh_dir=$(pwd)

src=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/vue/src
target=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/vue

echo 当前目录：$(pwd)

cat ${src}/0.txt \
	${src}/*.js \
	${src}/z.txt  > ${target}/vue-ewa.js


echo start compress vue-ewa.js with google
# 在 target 目录内调用编译器，map 的 file/sources 写成相对 target 的裸文件名
(cd "${target}" && java -jar "${sh_dir}/compiler.jar" \
 --js vue-ewa.js --js_output_file vue-ewa.min.js \
 --create_source_map vue-ewa.min.js.map)

echo "//# sourceMappingURL=vue-ewa.min.js.map" >> ${target}/vue-ewa.min.js
echo OK