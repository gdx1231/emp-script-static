#!/bin/sh
sh_dir=`dirname $0`
src=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_DEFINE/css

echo DIR：   ${sh_dir}
echo SRC：   ${src}

cat ${src}/src/*.css > ${src}/define.css

echo start compress define.css with YUI 
echo  ${src}/define.css
java -jar  ${sh_dir}/yuicompressor-2.4.8.jar  "${src}/define.css" -o "${src}/define.min.css" --type css --line-break 680

 
echo OK
