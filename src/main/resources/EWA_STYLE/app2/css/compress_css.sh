#!/bin/sh
cd `dirname $0`
echo 当前目录：$(pwd)

echo start compress app.css with YUI 
java -jar  /Users/admin/java/workspace/EmpScriptV2/WebRoot/EWA_STYLE/skins/yuicompressor-2.4.8.jar  app.css -o app.min.css --type css --line-break 180

echo start compress app_ewa.css with YUI 
java -jar  /Users/admin/java/workspace/EmpScriptV2/WebRoot/EWA_STYLE/skins/yuicompressor-2.4.8.jar  app_ewa.css -o app_ewa.min.css --type css --line-break 180
 
echo OK