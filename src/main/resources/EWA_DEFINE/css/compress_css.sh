#!/bin/sh
cd `dirname $0`
echo 当前目录：$(pwd)

cat src/*.css > define.css

echo start compress define.css with YUI 
java -jar  ~/java/workspace/EmpScriptV2/WebRoot/EWA_STYLE/skins/yuicompressor-2.4.8.jar  define.css -o define.min.css --type css --line-break 180

 
echo OK