define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,n){"use strict";var r=e("../../lib/oop");var c=e("../../range").Range;var i=e("./fold_mode").FoldMode;var o=t.FoldMode=function(e){if(e){this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start));this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end))}};r.inherits(o,i);(function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/;this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/;this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/;this._getFoldWidgetBase=this.getFoldWidget;this.getFoldWidget=function(e,t,n){var r=e.getLine(n);if(this.singleLineBlockCommentRe.test(r)){if(!this.startRegionRe.test(r)&&!this.tripleStarBlockCommentRe.test(r))return""}var i=this._getFoldWidgetBase(e,t,n);if(!i&&this.startRegionRe.test(r))return"start";return i};this.getFoldWidgetRange=function(e,t,n,r){var i=e.getLine(n);if(this.startRegionRe.test(i))return this.getCommentRegionBlock(e,i,n);var o=i.match(this.foldingStartMarker);if(o){var a=o.index;if(o[1])return this.openingBracketBlock(e,o[1],n,a);var s=e.getCommentFoldRange(n,a+o[0].length,1);if(s&&!s.isMultiLine()){if(r){s=this.getSectionRange(e,n)}else if(t!="all")s=null}return s}if(t==="markbegin")return;var o=i.match(this.foldingStopMarker);if(o){var a=o.index+o[0].length;if(o[1])return this.closingBracketBlock(e,o[1],n,a);return e.getCommentFoldRange(n,a,-1)}};this.getSectionRange=function(e,t){var n=e.getLine(t);var r=n.search(/\S/);var i=t;var o=n.length;t=t+1;var a=t;var s=e.getLength();while(++t<s){n=e.getLine(t);var g=n.search(/\S/);if(g===-1)continue;if(r>g)break;var l=this.getFoldWidgetRange(e,"all",t);if(l){if(l.start.row<=i){break}else if(l.isMultiLine()){t=l.end.row}else if(r==g){break}}a=t}return new c(i,o,a,e.getLine(a).length)};this.getCommentRegionBlock=function(e,t,n){var r=t.search(/\s*$/);var i=e.getLength();var o=n;var a=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;var s=1;while(++n<i){t=e.getLine(n);var g=a.exec(t);if(!g)continue;if(g[1])s--;else s++;if(!s)break}var l=n;if(l>o){return new c(o,r,l,t.length)}}}).call(o.prototype)});define("ace/mode/tcl_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop");var i=e("./text_highlight_rules").TextHighlightRules;var o=function(){this.$rules={start:[{token:"comment",regex:"#.*\\\\$",next:"commentfollow"},{token:"comment",regex:"#.*$"},{token:"support.function",regex:"[\\\\]$",next:"splitlineStart"},{token:"text",regex:/\\(?:["{}\[\]$\\])/},{token:"text",regex:"^|[^{][;][^}]|[/\r/]",next:"commandItem"},{token:"string",regex:'[ ]*["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'},{token:"string",regex:'[ ]*["]',next:"qqstring"},{token:"variable.instance",regex:"[$]",next:"variable"},{token:"support.function",regex:"!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|{\\*}|;|::"},{token:"identifier",regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"paren.lparen",regex:"[[{]",next:"commandItem"},{token:"paren.lparen",regex:"[(]"},{token:"paren.rparen",regex:"[\\])}]"},{token:"text",regex:"\\s+"}],commandItem:[{token:"comment",regex:"#.*\\\\$",next:"commentfollow"},{token:"comment",regex:"#.*$",next:"start"},{token:"string",regex:'[ ]*["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'},{token:"variable.instance",regex:"[$]",next:"variable"},{token:"support.function",regex:"(?:[:][:])[a-zA-Z0-9_/]+(?:[:][:])",next:"commandItem"},{token:"support.function",regex:"[a-zA-Z0-9_/]+(?:[:][:])",next:"commandItem"},{token:"support.function",regex:"(?:[:][:])",next:"commandItem"},{token:"paren.rparen",regex:"[\\])}]"},{token:"paren.lparen",regex:"[[({]"},{token:"support.function",regex:"!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|{\\*}|;|::"},{token:"keyword",regex:"[a-zA-Z0-9_/]+",next:"start"}],commentfollow:[{token:"comment",regex:".*\\\\$",next:"commentfollow"},{token:"comment",regex:".+",next:"start"}],splitlineStart:[{token:"text",regex:"^.",next:"start"}],variable:[{token:"variable.instance",regex:"[a-zA-Z_\\d]+(?:[(][a-zA-Z_\\d]+[)])?",next:"start"},{token:"variable.instance",regex:"{?[a-zA-Z_\\d]+}?",next:"start"}],qqstring:[{token:"string",regex:'(?:[^\\\\]|\\\\.)*?["]',next:"start"},{token:"string",regex:".+"}]}};r.inherits(o,i);t.TclHighlightRules=o});define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(e,t,n){"use strict";var s=e("../range").Range;var r=function(){};(function(){this.checkOutdent=function(e,t){if(!/^\s+$/.test(e))return false;return/^\s*\}/.test(t)};this.autoOutdent=function(e,t){var n=e.getLine(t);var r=n.match(/^(\s*\})/);if(!r)return 0;var i=r[1].length;var o=e.findMatchingBracket({row:t,column:i});if(!o||o.row==t)return 0;var a=this.$getIndent(e.getLine(o.row));e.replace(new s(t,0,t,i-1),a)};this.$getIndent=function(e){return e.match(/^\s*/)[0]}}).call(r.prototype);t.MatchingBraceOutdent=r});define("ace/mode/tcl",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/folding/cstyle","ace/mode/tcl_highlight_rules","ace/mode/matching_brace_outdent","ace/range"],function(e,t,n){"use strict";var r=e("../lib/oop");var i=e("./text").Mode;var o=e("./folding/cstyle").FoldMode;var a=e("./tcl_highlight_rules").TclHighlightRules;var s=e("./matching_brace_outdent").MatchingBraceOutdent;var g=e("../range").Range;var l=function(){this.HighlightRules=a;this.$outdent=new s;this.foldingRules=new o;this.$behaviour=this.$defaultBehaviour};r.inherits(l,i);(function(){this.lineCommentStart="#";this.getNextLineIndent=function(e,t,n){var r=this.$getIndent(t);var i=this.getTokenizer().getLineTokens(t,e);var o=i.tokens;if(o.length&&o[o.length-1].type=="comment"){return r}if(e=="start"){var a=t.match(/^.*[\{\(\[]\s*$/);if(a){r+=n}}return r};this.checkOutdent=function(e,t,n){return this.$outdent.checkOutdent(t,n)};this.autoOutdent=function(e,t,n){this.$outdent.autoOutdent(t,n)};this.$id="ace/mode/tcl";this.snippetFileId="ace/snippets/tcl"}).call(l.prototype);t.Mode=l});(function(){window.require(["ace/mode/tcl"],function(e){if(typeof module=="object"&&typeof exports=="object"&&module){module.exports=e}})})();