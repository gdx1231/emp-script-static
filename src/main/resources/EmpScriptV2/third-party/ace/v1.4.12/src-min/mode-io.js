define("ace/mode/io_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,i){"use strict";var o=e("../lib/oop");var n=e("./text_highlight_rules").TextHighlightRules;var r=function(){this.$rules={start:[{token:"keyword.control.io",regex:"\\b(?:if|ifTrue|ifFalse|ifTrueIfFalse|for|loop|reverseForeach|foreach|map|continue|break|while|do|return)\\b"},{token:"punctuation.definition.comment.io",regex:"/\\*",push:[{token:"punctuation.definition.comment.io",regex:"\\*/",next:"pop"},{defaultToken:"comment.block.io"}]},{token:"punctuation.definition.comment.io",regex:"//",push:[{token:"comment.line.double-slash.io",regex:"$",next:"pop"},{defaultToken:"comment.line.double-slash.io"}]},{token:"punctuation.definition.comment.io",regex:"#",push:[{token:"comment.line.number-sign.io",regex:"$",next:"pop"},{defaultToken:"comment.line.number-sign.io"}]},{token:"variable.language.io",regex:"\\b(?:self|sender|target|proto|protos|parent)\\b",comment:"I wonder if some of this isn't variable.other.language? --Allan; scoping this as variable.language to match Objective-C's handling of 'self', which is inconsistent with C++'s handling of 'this' but perhaps intentionally so -- Rob"},{token:"keyword.operator.io",regex:"<=|>=|=|:=|\\*|\\||\\|\\||\\+|-|/|&|&&|>|<|\\?|@|@@|\\b(?:and|or)\\b"},{token:"constant.other.io",regex:"\\bGL[\\w_]+\\b"},{token:"support.class.io",regex:"\\b[A-Z](?:\\w+)?\\b"},{token:"support.function.io",regex:"\\b(?:clone|call|init|method|list|vector|block|\\w+(?=\\s*\\())\\b"},{token:"support.function.open-gl.io",regex:"\\bgl(?:u|ut)?[A-Z]\\w+\\b"},{token:"punctuation.definition.string.begin.io",regex:'"""',push:[{token:"punctuation.definition.string.end.io",regex:'"""',next:"pop"},{token:"constant.character.escape.io",regex:"\\\\."},{defaultToken:"string.quoted.triple.io"}]},{token:"punctuation.definition.string.begin.io",regex:'"',push:[{token:"punctuation.definition.string.end.io",regex:'"',next:"pop"},{token:"constant.character.escape.io",regex:"\\\\."},{defaultToken:"string.quoted.double.io"}]},{token:"constant.numeric.io",regex:"\\b(?:0(?:x|X)[0-9a-fA-F]*|(?:[0-9]+\\.?[0-9]*|\\.[0-9]+)(?:(?:e|E)(?:\\+|-)?[0-9]+)?)(?:L|l|UL|ul|u|U|F|f)?\\b"},{token:"variable.other.global.io",regex:"Lobby\\b"},{token:"constant.language.io",regex:"\\b(?:TRUE|true|FALSE|false|NULL|null|Null|Nil|nil|YES|NO)\\b"}]};this.normalizeRules()};r.metaData={fileTypes:["io"],keyEquivalent:"^~I",name:"Io",scopeName:"source.io"};o.inherits(r,n);t.IoHighlightRules=r});define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,i){"use strict";var o=e("../../lib/oop");var u=e("../../range").Range;var n=e("./fold_mode").FoldMode;var r=t.FoldMode=function(e){if(e){this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start));this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end))}};o.inherits(r,n);(function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/;this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/;this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/;this._getFoldWidgetBase=this.getFoldWidget;this.getFoldWidget=function(e,t,i){var o=e.getLine(i);if(this.singleLineBlockCommentRe.test(o)){if(!this.startRegionRe.test(o)&&!this.tripleStarBlockCommentRe.test(o))return""}var n=this._getFoldWidgetBase(e,t,i);if(!n&&this.startRegionRe.test(o))return"start";return n};this.getFoldWidgetRange=function(e,t,i,o){var n=e.getLine(i);if(this.startRegionRe.test(n))return this.getCommentRegionBlock(e,n,i);var r=n.match(this.foldingStartMarker);if(r){var a=r.index;if(r[1])return this.openingBracketBlock(e,r[1],i,a);var s=e.getCommentFoldRange(i,a+r[0].length,1);if(s&&!s.isMultiLine()){if(o){s=this.getSectionRange(e,i)}else if(t!="all")s=null}return s}if(t==="markbegin")return;var r=n.match(this.foldingStopMarker);if(r){var a=r.index+r[0].length;if(r[1])return this.closingBracketBlock(e,r[1],i,a);return e.getCommentFoldRange(i,a,-1)}};this.getSectionRange=function(e,t){var i=e.getLine(t);var o=i.search(/\S/);var n=t;var r=i.length;t=t+1;var a=t;var s=e.getLength();while(++t<s){i=e.getLine(t);var l=i.search(/\S/);if(l===-1)continue;if(o>l)break;var g=this.getFoldWidgetRange(e,"all",t);if(g){if(g.start.row<=n){break}else if(g.isMultiLine()){t=g.end.row}else if(o==l){break}}a=t}return new u(n,r,a,e.getLine(a).length)};this.getCommentRegionBlock=function(e,t,i){var o=t.search(/\s*$/);var n=e.getLength();var r=i;var a=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;var s=1;while(++i<n){t=e.getLine(i);var l=a.exec(t);if(!l)continue;if(l[1])s--;else s++;if(!s)break}var g=i;if(g>r){return new u(r,o,g,t.length)}}}).call(r.prototype)});define("ace/mode/io",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/io_highlight_rules","ace/mode/folding/cstyle"],function(e,t,i){"use strict";var o=e("../lib/oop");var n=e("./text").Mode;var r=e("./io_highlight_rules").IoHighlightRules;var a=e("./folding/cstyle").FoldMode;var s=function(){this.HighlightRules=r;this.foldingRules=new a;this.$behaviour=this.$defaultBehaviour};o.inherits(s,n);(function(){this.lineCommentStart="//";this.blockComment={start:"/*",end:"*/"};this.$id="ace/mode/io";this.snippetFileId="ace/snippets/io"}).call(s.prototype);t.Mode=s});(function(){window.require(["ace/mode/io"],function(e){if(typeof module=="object"&&typeof exports=="object"&&module){module.exports=e}})})();