define("ace/mode/yaml_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop");var i=e("./text_highlight_rules").TextHighlightRules;var o=function(){this.$rules={start:[{token:"comment",regex:"#.*$"},{token:"list.markup",regex:/^(?:-{3}|\.{3})\s*(?=#|$)/},{token:"list.markup",regex:/^\s*[\-?](?:$|\s)/},{token:"constant",regex:"!![\\w//]+"},{token:"constant.language",regex:"[&\\*][a-zA-Z0-9-_]+"},{token:["meta.tag","keyword"],regex:/^(\s*\w.*?)(:(?=\s|$))/},{token:["meta.tag","keyword"],regex:/(\w+?)(\s*:(?=\s|$))/},{token:"keyword.operator",regex:"<<\\w*:\\w*"},{token:"keyword.operator",regex:"-\\s*(?=[{])"},{token:"string",regex:'["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'},{token:"string",regex:/[|>][-+\d]*(?:$|\s+(?:$|#))/,onMatch:function(e,t,n,r){r=r.replace(/ #.*/,"");var i=/^ *((:\s*)?-(\s*[^|>])?)?/.exec(r)[0].replace(/\S\s*$/,"").length;var o=parseInt(/\d+[\s+-]*$/.exec(r));if(o){i+=o-1;this.next="mlString"}else{this.next="mlStringPre"}if(!n.length){n.push(this.next);n.push(i)}else{n[0]=this.next;n[1]=i}return this.token},next:"mlString"},{token:"string",regex:"['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"},{token:"constant.numeric",regex:/(\b|[+\-\.])[\d_]+(?:(?:\.[\d_]*)?(?:[eE][+\-]?[\d_]+)?)(?=[^\d-\w]|$)/},{token:"constant.numeric",regex:/[+\-]?\.inf\b|NaN\b|0x[\dA-Fa-f_]+|0b[10_]+/},{token:"constant.language.boolean",regex:"\\b(?:true|false|TRUE|FALSE|True|False|yes|no)\\b"},{token:"paren.lparen",regex:"[[({]"},{token:"paren.rparen",regex:"[\\])}]"},{token:"text",regex:/[^\s,:\[\]\{\}]+/}],mlStringPre:[{token:"indent",regex:/^ *$/},{token:"indent",regex:/^ */,onMatch:function(e,t,n){var r=n[1];if(r>=e.length){this.next="start";n.shift();n.shift()}else{n[1]=e.length-1;this.next=n[0]="mlString"}return this.token},next:"mlString"},{defaultToken:"string"}],mlString:[{token:"indent",regex:/^ *$/},{token:"indent",regex:/^ */,onMatch:function(e,t,n){var r=n[1];if(r>=e.length){this.next="start";n.splice(0)}else{this.next="mlString"}return this.token},next:"mlString"},{token:"string",regex:".+"}]};this.normalizeRules()};r.inherits(o,i);t.YamlHighlightRules=o});define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(e,t,n){"use strict";var s=e("../range").Range;var r=function(){};(function(){this.checkOutdent=function(e,t){if(!/^\s+$/.test(e))return false;return/^\s*\}/.test(t)};this.autoOutdent=function(e,t){var n=e.getLine(t);var r=n.match(/^(\s*\})/);if(!r)return 0;var i=r[1].length;var o=e.findMatchingBracket({row:t,column:i});if(!o||o.row==t)return 0;var a=this.$getIndent(e.getLine(o.row));e.replace(new s(t,0,t,i-1),a)};this.$getIndent=function(e){return e.match(/^\s*/)[0]}}).call(r.prototype);t.MatchingBraceOutdent=r});define("ace/mode/folding/coffee",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"],function(e,t,n){"use strict";var r=e("../../lib/oop");var i=e("./fold_mode").FoldMode;var h=e("../../range").Range;var o=t.FoldMode=function(){};r.inherits(o,i);(function(){this.getFoldWidgetRange=function(e,t,n){var r=this.indentationBlock(e,n);if(r)return r;var i=/\S/;var o=e.getLine(n);var a=o.search(i);if(a==-1||o[a]!="#")return;var s=o.length;var g=e.getLength();var l=n;var u=n;while(++n<g){o=e.getLine(n);var c=o.search(i);if(c==-1)continue;if(o[c]!="#")break;u=n}if(u>l){var d=e.getLine(u).length;return new h(l,s,u,d)}};this.getFoldWidget=function(e,t,n){var r=e.getLine(n);var i=r.search(/\S/);var o=e.getLine(n+1);var a=e.getLine(n-1);var s=a.search(/\S/);var g=o.search(/\S/);if(i==-1){e.foldWidgets[n-1]=s!=-1&&s<g?"start":"";return""}if(s==-1){if(i==g&&r[i]=="#"&&o[i]=="#"){e.foldWidgets[n-1]="";e.foldWidgets[n+1]="";return"start"}}else if(s==i&&r[i]=="#"&&a[i]=="#"){if(e.getLine(n-2).search(/\S/)==-1){e.foldWidgets[n-1]="start";e.foldWidgets[n+1]="";return""}}if(s!=-1&&s<i)e.foldWidgets[n-1]="start";else e.foldWidgets[n-1]="";if(i<g)return"start";else return""}}).call(o.prototype)});define("ace/mode/yaml",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/yaml_highlight_rules","ace/mode/matching_brace_outdent","ace/mode/folding/coffee"],function(e,t,n){"use strict";var r=e("../lib/oop");var i=e("./text").Mode;var o=e("./yaml_highlight_rules").YamlHighlightRules;var a=e("./matching_brace_outdent").MatchingBraceOutdent;var s=e("./folding/coffee").FoldMode;var g=function(){this.HighlightRules=o;this.$outdent=new a;this.foldingRules=new s;this.$behaviour=this.$defaultBehaviour};r.inherits(g,i);(function(){this.lineCommentStart=["#"];this.getNextLineIndent=function(e,t,n){var r=this.$getIndent(t);if(e=="start"){var i=t.match(/^.*[\{\(\[]\s*$/);if(i){r+=n}}return r};this.checkOutdent=function(e,t,n){return this.$outdent.checkOutdent(t,n)};this.autoOutdent=function(e,t,n){this.$outdent.autoOutdent(t,n)};this.$id="ace/mode/yaml"}).call(g.prototype);t.Mode=g});(function(){window.require(["ace/mode/yaml"],function(e){if(typeof module=="object"&&typeof exports=="object"&&module){module.exports=e}})})();