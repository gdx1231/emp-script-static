define("ace/ext/whitespace",["require","exports","module","ace/lib/lang"],function(e,r,t){"use strict";var S=e("../lib/lang");r.$detectIndentation=function(e,t){var r=[];var n=[];var i=0;var a=0;var o=Math.min(e.length,1e3);for(var s=0;s<o;s++){var c=e[s];if(!/^\s*[^*+\-\s]/.test(c))continue;if(c[0]=="\t"){i++;a=-Number.MAX_VALUE}else{var f=c.match(/^ */)[0].length;if(f&&c[f]!="\t"){var g=f-a;if(g>0&&!(a%g)&&!(f%g))n[g]=(n[g]||0)+1;r[f]=(r[f]||0)+1}a=f}while(s<o&&c[c.length-1]=="\\")c=e[s++]}function v(e){var t=0;for(var n=e;n<r.length;n+=e)t+=r[n]||0;return t}var u=n.reduce(function(e,t){return e+t},0);var l={score:0,length:0};var h=0;for(var s=1;s<12;s++){var d=v(s);if(s==1){h=d;d=r[1]?.9:.8;if(!r.length)d=0}else d/=h;if(n[s])d+=n[s]/u;if(d>l.score)l={score:d,length:s}}if(l.score&&l.score>1.4)var p=l.length;if(i>h+1){if(p==1||h<i/4||l.score<1.8)p=undefined;return{ch:"\t",length:p}}if(h>i+1)return{ch:" ",length:p}};r.detectIndentation=function(e){var t=e.getLines(0,1e3);var n=r.$detectIndentation(t)||{};if(n.ch)e.setUseSoftTabs(n.ch==" ");if(n.length)e.setTabSize(n.length);return n};r.trimTrailingSpace=function(e,t){var n=e.getDocument();var r=n.getAllLines();var i=t&&t.trimEmpty?-1:0;var a=[],o=-1;if(t&&t.keepCursorPosition){if(e.selection.rangeCount){e.selection.rangeList.ranges.forEach(function(e,t,n){var r=n[t+1];if(r&&r.cursor.row==e.cursor.row)return;a.push(e.cursor)})}else{a.push(e.selection.getCursor())}o=0}var s=a[o]&&a[o].row;for(var c=0,f=r.length;c<f;c++){var g=r[c];var v=g.search(/\s+$/);if(c==s){if(v<a[o].column&&v>i)v=a[o].column;o++;s=a[o]?a[o].row:-1}if(v>i)n.removeInLine(c,v,g.length)}};r.convertIndentation=function(e,t,n){var r=e.getTabString()[0];var i=e.getTabSize();if(!n)n=i;if(!t)t=r;var a=t=="\t"?t:S.stringRepeat(t,n);var o=e.doc;var s=o.getAllLines();var c={};var f={};for(var g=0,v=s.length;g<v;g++){var u=s[g];var l=u.match(/^\s*/)[0];if(l){var h=e.$getStringScreenWidth(l)[0];var d=Math.floor(h/i);var p=h%i;var m=c[d]||(c[d]=S.stringRepeat(a,d));m+=f[p]||(f[p]=S.stringRepeat(" ",p));if(m!=l){o.removeInLine(g,0,l.length);o.insertInLine({row:g,column:0},m)}}}e.setTabSize(n);e.setUseSoftTabs(t==" ")};r.$parseStringArg=function(e){var t={};if(/t/.test(e))t.ch="\t";else if(/s/.test(e))t.ch=" ";var n=e.match(/\d+/);if(n)t.length=parseInt(n[0],10);return t};r.$parseArg=function(e){if(!e)return{};if(typeof e=="string")return r.$parseStringArg(e);if(typeof e.text=="string")return r.$parseStringArg(e.text);return e};r.commands=[{name:"detectIndentation",description:"Detect indentation from content",exec:function(e){r.detectIndentation(e.session)}},{name:"trimTrailingSpace",description:"Trim trailing whitespace",exec:function(e,t){r.trimTrailingSpace(e.session,t)}},{name:"convertIndentation",description:"Convert indentation to ...",exec:function(e,t){var n=r.$parseArg(t);r.convertIndentation(e.session,n.ch,n.length)}},{name:"setIndentation",description:"Set indentation",exec:function(e,t){var n=r.$parseArg(t);n.length&&e.session.setTabSize(n.length);n.ch&&e.session.setUseSoftTabs(n.ch==" ")}}]});(function(){window.require(["ace/ext/whitespace"],function(e){if(typeof module=="object"&&typeof exports=="object"&&module){module.exports=e}})})();