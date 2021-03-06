define("ace/mode/c9search_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text_highlight_rules"],function(e,t,r){"use strict";var n=e("../lib/oop");var c=e("../lib/lang");var i=e("./text_highlight_rules").TextHighlightRules;function h(e,t){try{return new RegExp(e,t)}catch(e){}}var a=function(){this.$rules={start:[{tokenNames:["c9searchresults.constant.numeric","c9searchresults.text","c9searchresults.text","c9searchresults.keyword"],regex:/(^\s+[0-9]+)(:)(\d*\s?)([^\r\n]+)/,onMatch:function(e,t,r){var n=this.splitRegex.exec(e);var i=this.tokenNames;var a=[{type:i[0],value:n[1]},{type:i[1],value:n[2]}];if(n[3]){if(n[3]==" ")a[1]={type:i[1],value:n[2]+" "};else a.push({type:i[1],value:n[3]})}var o=r[1];var s=n[4];var u;var c=0;if(o&&o.exec){o.lastIndex=0;while(u=o.exec(s)){var h=s.substring(c,u.index);c=o.lastIndex;if(h)a.push({type:i[2],value:h});if(u[0])a.push({type:i[3],value:u[0]});else if(!h)break}}if(c<s.length)a.push({type:i[2],value:s.substr(c)});return a}},{regex:"^Searching for [^\\r\\n]*$",onMatch:function(e,t,r){var n=e.split("");if(n.length<3)return"text";var i,a;var o=0;var s=[{value:n[o++]+"'",type:"text"},{value:a=n[o++],type:"text"},{value:"'"+n[o++],type:"text"}];if(n[2]!==" in"){s.push({value:"'"+n[o++]+"'",type:"text"},{value:n[o++],type:"text"})}s.push({value:" "+n[o++]+" ",type:"text"});if(n[o+1]){i=n[o+1];s.push({value:"("+n[o+1]+")",type:"text"});o+=1}else{o-=1}while(o++<n.length){n[o]&&s.push({value:n[o],type:"text"})}if(a){if(!/regex/.test(i))a=c.escapeRegExp(a);if(/whole/.test(i))a="\\b"+a+"\\b"}var u=a&&h("("+a+")",/ sensitive/.test(i)?"g":"ig");if(u){r[0]=t;r[1]=u}return s}},{regex:"^(?=Found \\d+ matches)",token:"text",next:"numbers"},{token:"string",regex:"^\\S:?[^:]+",next:"numbers"}],numbers:[{regex:"\\d+",token:"constant.numeric"},{regex:"$",token:"text",next:"start"}]};this.normalizeRules()};n.inherits(a,i);t.C9SearchHighlightRules=a});define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(e,t,r){"use strict";var s=e("../range").Range;var n=function(){};(function(){this.checkOutdent=function(e,t){if(!/^\s+$/.test(e))return false;return/^\s*\}/.test(t)};this.autoOutdent=function(e,t){var r=e.getLine(t);var n=r.match(/^(\s*\})/);if(!n)return 0;var i=n[1].length;var a=e.findMatchingBracket({row:t,column:i});if(!a||a.row==t)return 0;var o=this.$getIndent(e.getLine(a.row));e.replace(new s(t,0,t,i-1),o)};this.$getIndent=function(e){return e.match(/^\s*/)[0]}}).call(n.prototype);t.MatchingBraceOutdent=n});define("ace/mode/folding/c9search",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,r){"use strict";var n=e("../../lib/oop");var g=e("../../range").Range;var i=e("./fold_mode").FoldMode;var a=t.FoldMode=function(){};n.inherits(a,i);(function(){this.foldingStartMarker=/^(\S.*:|Searching for.*)$/;this.foldingStopMarker=/^(\s+|Found.*)$/;this.getFoldWidgetRange=function(e,t,r){var n=e.doc.getAllLines(r);var i=n[r];var a=/^(Found.*|Searching for.*)$/;var o=/^(\S.*:|\s*)$/;var s=a.test(i)?a:o;var u=r;var c=r;if(this.foldingStartMarker.test(i)){for(var h=r+1,l=e.getLength();h<l;h++){if(s.test(n[h]))break}c=h}else if(this.foldingStopMarker.test(i)){for(var h=r-1;h>=0;h--){i=n[h];if(s.test(i))break}u=h}if(u!=c){var d=i.length;if(s===a)d=i.search(/\(Found[^)]+\)$|$/);return new g(u,d,c,0)}}}).call(a.prototype)});define("ace/mode/c9search",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/c9search_highlight_rules","ace/mode/matching_brace_outdent","ace/mode/folding/c9search"],function(e,t,r){"use strict";var n=e("../lib/oop");var i=e("./text").Mode;var a=e("./c9search_highlight_rules").C9SearchHighlightRules;var o=e("./matching_brace_outdent").MatchingBraceOutdent;var s=e("./folding/c9search").FoldMode;var u=function(){this.HighlightRules=a;this.$outdent=new o;this.foldingRules=new s};n.inherits(u,i);(function(){this.getNextLineIndent=function(e,t,r){var n=this.$getIndent(t);return n};this.checkOutdent=function(e,t,r){return this.$outdent.checkOutdent(t,r)};this.autoOutdent=function(e,t,r){this.$outdent.autoOutdent(t,r)};this.$id="ace/mode/c9search"}).call(u.prototype);t.Mode=u});(function(){window.require(["ace/mode/c9search"],function(e){if(typeof module=="object"&&typeof exports=="object"&&module){module.exports=e}})})();