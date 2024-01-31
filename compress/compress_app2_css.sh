#!/bin/sh

sh_dir=`dirname $0`
src=${sh_dir}/../src/main/resources/EmpScriptV2/EWA_STYLE/app2/css

echo start compress app.css with YUI 
java -jar  ${sh_dir}/yuicompressor-2.4.8.jar  ${src}/app.css -o ${src}/app.min.css --type css --line-break 180

echo start compress app_ewa.css with YUI 
java -jar  ${sh_dir}/yuicompressor-2.4.8.jar  ${src}/app_ewa.css -o ${src}/app_ewa.min.css --type css --line-break 180
 
echo OK
