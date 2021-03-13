#!/bin/sh
echo create css.css
cd `dirname $0`
echo 当前目录：$(pwd)

cat default/css_src/*.css  > default/css.css

echo start compress with YUI 
java -jar  `dirname $0`/'yuicompressor-2.4.8.jar'  default/css.css -o default/css.min.css --type css --line-break 480

echo ok