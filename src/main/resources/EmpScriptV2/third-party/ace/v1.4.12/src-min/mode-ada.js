define("ace/mode/ada_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,r){"use strict";var n=e("../lib/oop");var a=e("./text_highlight_rules").TextHighlightRules;var i=function(){var e="abort|else|new|return|abs|elsif|not|reverse|abstract|end|null|accept|entry|select|"+"access|exception|of|separate|aliased|exit|or|some|all|others|subtype|and|for|out|synchronized|"+"array|function|overriding|at|tagged|generic|package|task|begin|goto|pragma|terminate|"+"body|private|then|if|procedure|type|case|in|protected|constant|interface|until|"+"|is|raise|use|declare|range|delay|limited|record|when|delta|loop|rem|while|digits|renames|with|do|mod|requeue|xor";var t="true|false|null";var r="count|min|max|avg|sum|rank|now|coalesce|main";var n=this.createKeywordMapper({"support.function":r,keyword:e,"constant.language":t},"identifier",true);this.$rules={start:[{token:"comment",regex:"--.*$"},{token:"string",regex:'".*?"'},{token:"string",regex:"'.'"},{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},{token:n,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="},{token:"paren.lparen",regex:"[\\(]"},{token:"paren.rparen",regex:"[\\)]"},{token:"text",regex:"\\s+"}]}};n.inherits(i,a);t.AdaHighlightRules=i});define("ace/mode/ada",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/ada_highlight_rules","ace/range"],function(e,t,r){"use strict";var n=e("../lib/oop");var a=e("./text").Mode;var i=e("./ada_highlight_rules").AdaHighlightRules;var s=e("../range").Range;var o=function(){this.HighlightRules=i;this.$behaviour=this.$defaultBehaviour};n.inherits(o,a);(function(){this.lineCommentStart="--";this.getNextLineIndent=function(e,t,r){var n=this.$getIndent(t);var a=this.getTokenizer().getLineTokens(t,e);var i=a.tokens;if(i.length&&i[i.length-1].type=="comment"){return n}if(e=="start"){var o=t.match(/^.*(begin|loop|then|is|do)\s*$/);if(o){n+=r}}return n};this.checkOutdent=function(e,t,r){var n=t+r;if(n.match(/^\s*(begin|end)$/)){return true}return false};this.autoOutdent=function(e,t,r){var n=t.getLine(r);var a=t.getLine(r-1);var i=this.$getIndent(a).length;var o=this.$getIndent(n).length;if(o<=i){return}t.outdentRows(new s(r,0,r+2,0))};this.$id="ace/mode/ada"}).call(o.prototype);t.Mode=o});(function(){window.require(["ace/mode/ada"],function(e){if(typeof module=="object"&&typeof exports=="object"&&module){module.exports=e}})})();