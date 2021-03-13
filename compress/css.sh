#!/bin/sh
echo create css.css

sh_dir=`dirname $0`
src=${sh_dir}/../src/main/resources/EWA_STYLE/skins/default

echo DIR：   ${sh_dir}
echo SRC：   ${src}

cat ${src}/css_src/*.css  > ${src}/css.css

echo start compress with YUI 
java -jar  ${sh_dir}/yuicompressor-2.4.8.jar  ${src}/css.css -o ${src}/css.min.css --type css --line-break 480

echo ok