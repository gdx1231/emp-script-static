define("ace/mode/xml_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop");var o=e("./text_highlight_rules").TextHighlightRules;var a=function(e){var t="[_:a-zA-ZÀ-￿][-_:.a-zA-Z0-9À-￿]*";this.$rules={start:[{token:"string.cdata.xml",regex:"<\\!\\[CDATA\\[",next:"cdata"},{token:["punctuation.instruction.xml","keyword.instruction.xml"],regex:"(<\\?)("+t+")",next:"processing_instruction"},{token:"comment.start.xml",regex:"<\\!--",next:"comment"},{token:["xml-pe.doctype.xml","xml-pe.doctype.xml"],regex:"(<\\!)(DOCTYPE)(?=[\\s])",next:"doctype",caseInsensitive:true},{include:"tag"},{token:"text.end-tag-open.xml",regex:"</"},{token:"text.tag-open.xml",regex:"<"},{include:"reference"},{defaultToken:"text.xml"}],processing_instruction:[{token:"entity.other.attribute-name.decl-attribute-name.xml",regex:t},{token:"keyword.operator.decl-attribute-equals.xml",regex:"="},{include:"whitespace"},{include:"string"},{token:"punctuation.xml-decl.xml",regex:"\\?>",next:"start"}],doctype:[{include:"whitespace"},{include:"string"},{token:"xml-pe.doctype.xml",regex:">",next:"start"},{token:"xml-pe.xml",regex:"[-_a-zA-Z0-9:]+"},{token:"punctuation.int-subset",regex:"\\[",push:"int_subset"}],int_subset:[{token:"text.xml",regex:"\\s+"},{token:"punctuation.int-subset.xml",regex:"]",next:"pop"},{token:["punctuation.markup-decl.xml","keyword.markup-decl.xml"],regex:"(<\\!)("+t+")",push:[{token:"text",regex:"\\s+"},{token:"punctuation.markup-decl.xml",regex:">",next:"pop"},{include:"string"}]}],cdata:[{token:"string.cdata.xml",regex:"\\]\\]>",next:"start"},{token:"text.xml",regex:"\\s+"},{token:"text.xml",regex:"(?:[^\\]]|\\](?!\\]>))+"}],comment:[{token:"comment.end.xml",regex:"--\x3e",next:"start"},{defaultToken:"comment.xml"}],reference:[{token:"constant.language.escape.reference.xml",regex:"(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"}],attr_reference:[{token:"constant.language.escape.reference.attribute-value.xml",regex:"(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"}],tag:[{token:["meta.tag.punctuation.tag-open.xml","meta.tag.punctuation.end-tag-open.xml","meta.tag.tag-name.xml"],regex:"(?:(<)|(</))((?:"+t+":)?"+t+")",next:[{include:"attributes"},{token:"meta.tag.punctuation.tag-close.xml",regex:"/?>",next:"start"}]}],tag_whitespace:[{token:"text.tag-whitespace.xml",regex:"\\s+"}],whitespace:[{token:"text.whitespace.xml",regex:"\\s+"}],string:[{token:"string.xml",regex:"'",push:[{token:"string.xml",regex:"'",next:"pop"},{defaultToken:"string.xml"}]},{token:"string.xml",regex:'"',push:[{token:"string.xml",regex:'"',next:"pop"},{defaultToken:"string.xml"}]}],attributes:[{token:"entity.other.attribute-name.xml",regex:t},{token:"keyword.operator.attribute-equals.xml",regex:"="},{include:"tag_whitespace"},{include:"attribute_value"}],attribute_value:[{token:"string.attribute-value.xml",regex:"'",push:[{token:"string.attribute-value.xml",regex:"'",next:"pop"},{include:"attr_reference"},{defaultToken:"string.attribute-value.xml"}]},{token:"string.attribute-value.xml",regex:'"',push:[{token:"string.attribute-value.xml",regex:'"',next:"pop"},{include:"attr_reference"},{defaultToken:"string.attribute-value.xml"}]}]};if(this.constructor===a)this.normalizeRules()};(function(){this.embedTagRules=function(e,t,n){this.$rules.tag.unshift({token:["meta.tag.punctuation.tag-open.xml","meta.tag."+n+".tag-name.xml"],regex:"(<)("+n+"(?=\\s|>|$))",next:[{include:"attributes"},{token:"meta.tag.punctuation.tag-close.xml",regex:"/?>",next:t+"start"}]});this.$rules[n+"-end"]=[{include:"attributes"},{token:"meta.tag.punctuation.tag-close.xml",regex:"/?>",next:"start",onMatch:function(e,t,n){n.splice(0);return this.token}}];this.embedRules(e,t,[{token:["meta.tag.punctuation.end-tag-open.xml","meta.tag."+n+".tag-name.xml"],regex:"(</)("+n+"(?=\\s|>|$))",next:n+"-end"},{token:"string.cdata.xml",regex:"<\\!\\[CDATA\\["},{token:"string.cdata.xml",regex:"\\]\\]>"}])}}).call(o.prototype);r.inherits(a,o);t.XmlHighlightRules=a});define("ace/mode/behaviour/xml",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"],function(e,t,n){"use strict";var r=e("../../lib/oop");var o=e("../behaviour").Behaviour;var h=e("../../token_iterator").TokenIterator;var a=e("../../lib/lang");function m(e,t){return e&&e.type.lastIndexOf(t+".xml")>-1}var i=function(){this.add("string_dquotes","insertion",function(e,t,n,r,o){if(o=='"'||o=="'"){var a=o;var i=r.doc.getTextRange(n.getSelectionRange());if(i!==""&&i!=="'"&&i!='"'&&n.getWrapBehavioursEnabled()){return{text:a+i+a,selection:false}}var s=n.getCursorPosition();var l=r.doc.getLine(s.row);var u=l.substring(s.column,s.column+1);var g=new h(r,s.row,s.column);var c=g.getCurrentToken();if(u==a&&(m(c,"attribute-value")||m(c,"string"))){return{text:"",selection:[1,1]}}if(!c)c=g.stepBackward();if(!c)return;while(m(c,"tag-whitespace")||m(c,"whitespace")){c=g.stepBackward()}var d=!u||u.match(/\s/);if(m(c,"attribute-equals")&&(d||u==">")||m(c,"decl-attribute-equals")&&(d||u=="?")){return{text:a+a,selection:[1,1]}}}});this.add("string_dquotes","deletion",function(e,t,n,r,o){var a=r.doc.getTextRange(o);if(!o.isMultiLine()&&(a=='"'||a=="'")){var i=r.doc.getLine(o.start.row);var s=i.substring(o.start.column+1,o.start.column+2);if(s==a){o.end.column++;return o}}});this.add("autoclosing","insertion",function(e,t,n,r,o){if(o==">"){var a=n.getSelectionRange().start;var i=new h(r,a.row,a.column);var s=i.getCurrentToken()||i.stepBackward();if(!s||!(m(s,"tag-name")||m(s,"tag-whitespace")||m(s,"attribute-name")||m(s,"attribute-equals")||m(s,"attribute-value")))return;if(m(s,"reference.attribute-value"))return;if(m(s,"attribute-value")){var l=i.getCurrentTokenColumn()+s.value.length;if(a.column<l)return;if(a.column==l){var u=i.stepForward();if(u&&m(u,"attribute-value"))return;i.stepBackward()}}if(/^\s*>/.test(r.getLine(a.row).slice(a.column)))return;while(!m(s,"tag-name")){s=i.stepBackward();if(s.value=="<"){s=i.stepForward();break}}var g=i.getCurrentTokenRow();var c=i.getCurrentTokenColumn();if(m(i.stepBackward(),"end-tag-open"))return;var d=s.value;if(g==a.row)d=d.substring(0,a.column-c);if(this.voidElements.hasOwnProperty(d.toLowerCase()))return;return{text:">"+"</"+d+">",selection:[1,1]}}});this.add("autoindent","insertion",function(e,t,n,r,o){if(o=="\n"){var a=n.getCursorPosition();var i=r.getLine(a.row);var s=new h(r,a.row,a.column);var l=s.getCurrentToken();if(l&&l.type.indexOf("tag-close")!==-1){if(l.value=="/>")return;while(l&&l.type.indexOf("tag-name")===-1){l=s.stepBackward()}if(!l){return}var u=l.value;var g=s.getCurrentTokenRow();l=s.stepBackward();if(!l||l.type.indexOf("end-tag")!==-1){return}if(this.voidElements&&!this.voidElements[u]){var c=r.getTokenAt(a.row,a.column+1);var i=r.getLine(g);var d=this.$getIndent(i);var m=d+r.getTabString();if(c&&c.value==="</"){return{text:"\n"+m+"\n"+d,selection:[1,m.length,1,m.length]}}else{return{text:"\n"+m}}}}}})};r.inherits(i,o);t.XmlBehaviour=i});define("ace/mode/folding/xml",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/range","ace/mode/folding/fold_mode","ace/token_iterator"],function(e,t,n){"use strict";var r=e("../../lib/oop");var o=e("../../lib/lang");var g=e("../../range").Range;var a=e("./fold_mode").FoldMode;var c=e("../../token_iterator").TokenIterator;var i=t.FoldMode=function(e,t){a.call(this);this.voidElements=e||{};this.optionalEndTags=r.mixin({},this.voidElements);if(t)r.mixin(this.optionalEndTags,t)};r.inherits(i,a);var s=function(){this.tagName="";this.closing=false;this.selfClosing=false;this.start={row:0,column:0};this.end={row:0,column:0}};function l(e,t){return e.type.lastIndexOf(t+".xml")>-1}(function(){this.getFoldWidget=function(e,t,n){var r=this._getFirstTagInLine(e,n);if(!r)return this.getCommentFoldWidget(e,n);if(r.closing||!r.tagName&&r.selfClosing)return t=="markbeginend"?"end":"";if(!r.tagName||r.selfClosing||this.voidElements.hasOwnProperty(r.tagName.toLowerCase()))return"";if(this._findEndTagInLine(e,n,r.tagName,r.end.column))return"";return"start"};this.getCommentFoldWidget=function(e,t){if(/comment/.test(e.getState(t))&&/<!-/.test(e.getLine(t)))return"start";return""};this._getFirstTagInLine=function(e,t){var n=e.getTokens(t);var r=new s;for(var o=0;o<n.length;o++){var a=n[o];if(l(a,"tag-open")){r.end.column=r.start.column+a.value.length;r.closing=l(a,"end-tag-open");a=n[++o];if(!a)return null;r.tagName=a.value;r.end.column+=a.value.length;for(o++;o<n.length;o++){a=n[o];r.end.column+=a.value.length;if(l(a,"tag-close")){r.selfClosing=a.value=="/>";break}}return r}else if(l(a,"tag-close")){r.selfClosing=a.value=="/>";return r}r.start.column+=a.value.length}return null};this._findEndTagInLine=function(e,t,n,r){var o=e.getTokens(t);var a=0;for(var i=0;i<o.length;i++){var s=o[i];a+=s.value.length;if(a<r)continue;if(l(s,"end-tag-open")){s=o[i+1];if(s&&s.value==n)return true}}return false};this._readTagForward=function(e){var t=e.getCurrentToken();if(!t)return null;var n=new s;do{if(l(t,"tag-open")){n.closing=l(t,"end-tag-open");n.start.row=e.getCurrentTokenRow();n.start.column=e.getCurrentTokenColumn()}else if(l(t,"tag-name")){n.tagName=t.value}else if(l(t,"tag-close")){n.selfClosing=t.value=="/>";n.end.row=e.getCurrentTokenRow();n.end.column=e.getCurrentTokenColumn()+t.value.length;e.stepForward();return n}}while(t=e.stepForward());return null};this._readTagBackward=function(e){var t=e.getCurrentToken();if(!t)return null;var n=new s;do{if(l(t,"tag-open")){n.closing=l(t,"end-tag-open");n.start.row=e.getCurrentTokenRow();n.start.column=e.getCurrentTokenColumn();e.stepBackward();return n}else if(l(t,"tag-name")){n.tagName=t.value}else if(l(t,"tag-close")){n.selfClosing=t.value=="/>";n.end.row=e.getCurrentTokenRow();n.end.column=e.getCurrentTokenColumn()+t.value.length}}while(t=e.stepBackward());return null};this._pop=function(e,t){while(e.length){var n=e[e.length-1];if(!t||n.tagName==t.tagName){return e.pop()}else if(this.optionalEndTags.hasOwnProperty(n.tagName)){e.pop();continue}else{return null}}};this.getFoldWidgetRange=function(e,t,n){var r=this._getFirstTagInLine(e,n);if(!r){return this.getCommentFoldWidget(e,n)&&e.getCommentFoldRange(n,e.getLine(n).length)}var o=r.closing||r.selfClosing;var a=[];var i;if(!o){var s=new c(e,n,r.start.column);var l={row:n,column:r.start.column+r.tagName.length+2};if(r.start.row==r.end.row)l.column=r.end.column;while(i=this._readTagForward(s)){if(i.selfClosing){if(!a.length){i.start.column+=i.tagName.length+2;i.end.column-=2;return g.fromPoints(i.start,i.end)}else continue}if(i.closing){this._pop(a,i);if(a.length==0)return g.fromPoints(l,i.start)}else{a.push(i)}}}else{var s=new c(e,n,r.end.column);var u={row:n,column:r.start.column};while(i=this._readTagBackward(s)){if(i.selfClosing){if(!a.length){i.start.column+=i.tagName.length+2;i.end.column-=2;return g.fromPoints(i.start,i.end)}else continue}if(!i.closing){this._pop(a,i);if(a.length==0){i.start.column+=i.tagName.length+2;if(i.start.row==i.end.row&&i.start.column<i.end.column)i.start.column=i.end.column;return g.fromPoints(i.start,u)}}else{a.push(i)}}}}}).call(i.prototype)});define("ace/mode/xml",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text","ace/mode/xml_highlight_rules","ace/mode/behaviour/xml","ace/mode/folding/xml","ace/worker/worker_client"],function(e,t,n){"use strict";var r=e("../lib/oop");var o=e("../lib/lang");var a=e("./text").Mode;var i=e("./xml_highlight_rules").XmlHighlightRules;var s=e("./behaviour/xml").XmlBehaviour;var l=e("./folding/xml").FoldMode;var u=e("../worker/worker_client").WorkerClient;var g=function(){this.HighlightRules=i;this.$behaviour=new s;this.foldingRules=new l};r.inherits(g,a);(function(){this.voidElements=o.arrayToMap([]);this.blockComment={start:"\x3c!--",end:"--\x3e"};this.createWorker=function(t){var e=new u(["ace"],"ace/mode/xml_worker","Worker");e.attachToDocument(t.getDocument());e.on("error",function(e){t.setAnnotations(e.data)});e.on("terminate",function(){t.clearAnnotations()});return e};this.$id="ace/mode/xml"}).call(g.prototype);t.Mode=g});define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop");var o=e("./text_highlight_rules").TextHighlightRules;var a=function(){this.$rules={start:[{token:"comment.doc.tag",regex:"@[\\w\\d_]+"},a.getTagRule(),{defaultToken:"comment.doc",caseInsensitive:true}]}};r.inherits(a,o);a.getTagRule=function(e){return{token:"comment.doc.tag.storage.type",regex:"\\b(?:TODO|FIXME|XXX|HACK)\\b"}};a.getStartRule=function(e){return{token:"comment.doc",regex:"\\/\\*(?=\\*)",next:e}};a.getEndRule=function(e){return{token:"comment.doc",regex:"\\*\\/",next:e}};t.DocCommentHighlightRules=a});define("ace/mode/javascript_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop");var o=e("./doc_comment_highlight_rules").DocCommentHighlightRules;var a=e("./text_highlight_rules").TextHighlightRules;var i="[a-zA-Z\\$_¡-￿][a-zA-Z\\d\\$_¡-￿]*";var s=function(e){var t=this.createKeywordMapper({"variable.language":"Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|"+"Namespace|QName|XML|XMLList|"+"ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|"+"Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|"+"Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|"+"SyntaxError|TypeError|URIError|"+"decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|"+"isNaN|parseFloat|parseInt|"+"JSON|Math|"+"this|arguments|prototype|window|document",keyword:"const|yield|import|get|set|async|await|"+"break|case|catch|continue|default|delete|do|else|finally|for|function|"+"if|in|of|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|"+"__parent__|__count__|escape|unescape|with|__proto__|"+"class|enum|extends|super|export|implements|private|public|interface|package|protected|static","storage.type":"const|let|var|function","constant.language":"null|Infinity|NaN|undefined","support.function":"alert","constant.language.boolean":"true|false"},"identifier");var n="case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void";var r="\\\\(?:x[0-9a-fA-F]{2}|"+"u[0-9a-fA-F]{4}|"+"u{[0-9a-fA-F]{1,6}}|"+"[0-2][0-7]{0,2}|"+"3[0-7][0-7]?|"+"[4-7][0-7]?|"+".)";this.$rules={no_regex:[o.getStartRule("doc-start"),u("no_regex"),{token:"string",regex:"'(?=.)",next:"qstring"},{token:"string",regex:'"(?=.)',next:"qqstring"},{token:"constant.numeric",regex:/0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/},{token:"constant.numeric",regex:/(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/},{token:["storage.type","punctuation.operator","support.function","punctuation.operator","entity.name.function","text","keyword.operator"],regex:"("+i+")(\\.)(prototype)(\\.)("+i+")(\\s*)(=)",next:"function_arguments"},{token:["storage.type","punctuation.operator","entity.name.function","text","keyword.operator","text","storage.type","text","paren.lparen"],regex:"("+i+")(\\.)("+i+")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",next:"function_arguments"},{token:["entity.name.function","text","keyword.operator","text","storage.type","text","paren.lparen"],regex:"("+i+")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",next:"function_arguments"},{token:["storage.type","punctuation.operator","entity.name.function","text","keyword.operator","text","storage.type","text","entity.name.function","text","paren.lparen"],regex:"("+i+")(\\.)("+i+")(\\s*)(=)(\\s*)(function)(\\s+)(\\w+)(\\s*)(\\()",next:"function_arguments"},{token:["storage.type","text","entity.name.function","text","paren.lparen"],regex:"(function)(\\s+)("+i+")(\\s*)(\\()",next:"function_arguments"},{token:["entity.name.function","text","punctuation.operator","text","storage.type","text","paren.lparen"],regex:"("+i+")(\\s*)(:)(\\s*)(function)(\\s*)(\\()",next:"function_arguments"},{token:["text","text","storage.type","text","paren.lparen"],regex:"(:)(\\s*)(function)(\\s*)(\\()",next:"function_arguments"},{token:"keyword",regex:"from(?=\\s*('|\"))"},{token:"keyword",regex:"(?:"+n+")\\b",next:"start"},{token:["support.constant"],regex:/that\b/},{token:["storage.type","punctuation.operator","support.function.firebug"],regex:/(console)(\.)(warn|info|log|error|time|trace|timeEnd|assert)\b/},{token:t,regex:i},{token:"punctuation.operator",regex:/[.](?![.])/,next:"property"},{token:"storage.type",regex:/=>/,next:"start"},{token:"keyword.operator",regex:/--|\+\+|\.{3}|===|==|=|!=|!==|<+=?|>+=?|!|&&|\|\||\?:|[!$%&*+\-~\/^]=?/,next:"start"},{token:"punctuation.operator",regex:/[?:,;.]/,next:"start"},{token:"paren.lparen",regex:/[\[({]/,next:"start"},{token:"paren.rparen",regex:/[\])}]/},{token:"comment",regex:/^#!.*$/}],property:[{token:"text",regex:"\\s+"},{token:["storage.type","punctuation.operator","entity.name.function","text","keyword.operator","text","storage.type","text","entity.name.function","text","paren.lparen"],regex:"("+i+")(\\.)("+i+")(\\s*)(=)(\\s*)(function)(?:(\\s+)(\\w+))?(\\s*)(\\()",next:"function_arguments"},{token:"punctuation.operator",regex:/[.](?![.])/},{token:"support.function",regex:/(s(?:h(?:ift|ow(?:Mod(?:elessDialog|alDialog)|Help))|croll(?:X|By(?:Pages|Lines)?|Y|To)?|t(?:op|rike)|i(?:n|zeToContent|debar|gnText)|ort|u(?:p|b(?:str(?:ing)?)?)|pli(?:ce|t)|e(?:nd|t(?:Re(?:sizable|questHeader)|M(?:i(?:nutes|lliseconds)|onth)|Seconds|Ho(?:tKeys|urs)|Year|Cursor|Time(?:out)?|Interval|ZOptions|Date|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(?:ome|andleEvent)|navigate|c(?:har(?:CodeAt|At)|o(?:s|n(?:cat|textual|firm)|mpile)|eil|lear(?:Timeout|Interval)?|a(?:ptureEvents|ll)|reate(?:StyleSheet|Popup|EventObject))|t(?:o(?:GMTString|S(?:tring|ource)|U(?:TCString|pperCase)|Lo(?:caleString|werCase))|est|a(?:n|int(?:Enabled)?))|i(?:s(?:NaN|Finite)|ndexOf|talics)|d(?:isableExternalCapture|ump|etachEvent)|u(?:n(?:shift|taint|escape|watch)|pdateCommands)|j(?:oin|avaEnabled)|p(?:o(?:p|w)|ush|lugins.refresh|a(?:ddings|rse(?:Int|Float)?)|r(?:int|ompt|eference))|e(?:scape|nableExternalCapture|val|lementFromPoint|x(?:p|ec(?:Script|Command)?))|valueOf|UTC|queryCommand(?:State|Indeterm|Enabled|Value)|f(?:i(?:nd|le(?:ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(?:nt(?:size|color)|rward)|loor|romCharCode)|watch|l(?:ink|o(?:ad|g)|astIndexOf)|a(?:sin|nchor|cos|t(?:tachEvent|ob|an(?:2)?)|pply|lert|b(?:s|ort))|r(?:ou(?:nd|teEvents)|e(?:size(?:By|To)|calc|turnValue|place|verse|l(?:oad|ease(?:Capture|Events)))|andom)|g(?:o|et(?:ResponseHeader|M(?:i(?:nutes|lliseconds)|onth)|Se(?:conds|lection)|Hours|Year|Time(?:zoneOffset)?|Da(?:y|te)|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Da(?:y|te)|FullYear)|FullYear|A(?:ttention|llResponseHeaders)))|m(?:in|ove(?:B(?:y|elow)|To(?:Absolute)?|Above)|ergeAttributes|a(?:tch|rgins|x))|b(?:toa|ig|o(?:ld|rderWidths)|link|ack))\b(?=\()/},{token:"support.function.dom",regex:/(s(?:ub(?:stringData|mit)|plitText|e(?:t(?:NamedItem|Attribute(?:Node)?)|lect))|has(?:ChildNodes|Feature)|namedItem|c(?:l(?:ick|o(?:se|neNode))|reate(?:C(?:omment|DATASection|aption)|T(?:Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(?:ntityReference|lement)|Attribute))|tabIndex|i(?:nsert(?:Row|Before|Cell|Data)|tem)|open|delete(?:Row|C(?:ell|aption)|T(?:Head|Foot)|Data)|focus|write(?:ln)?|a(?:dd|ppend(?:Child|Data))|re(?:set|place(?:Child|Data)|move(?:NamedItem|Child|Attribute(?:Node)?)?)|get(?:NamedItem|Element(?:sBy(?:Name|TagName|ClassName)|ById)|Attribute(?:Node)?)|blur)\b(?=\()/},{token:"support.constant",regex:/(s(?:ystemLanguage|cr(?:ipts|ollbars|een(?:X|Y|Top|Left))|t(?:yle(?:Sheets)?|atus(?:Text|bar)?)|ibling(?:Below|Above)|ource|uffixes|e(?:curity(?:Policy)?|l(?:ection|f)))|h(?:istory|ost(?:name)?|as(?:h|Focus))|y|X(?:MLDocument|SLDocument)|n(?:ext|ame(?:space(?:s|URI)|Prop))|M(?:IN_VALUE|AX_VALUE)|c(?:haracterSet|o(?:n(?:structor|trollers)|okieEnabled|lorDepth|mp(?:onents|lete))|urrent|puClass|l(?:i(?:p(?:boardData)?|entInformation)|osed|asses)|alle(?:e|r)|rypto)|t(?:o(?:olbar|p)|ext(?:Transform|Indent|Decoration|Align)|ags)|SQRT(?:1_2|2)|i(?:n(?:ner(?:Height|Width)|put)|ds|gnoreCase)|zIndex|o(?:scpu|n(?:readystatechange|Line)|uter(?:Height|Width)|p(?:sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(?:i(?:splay|alog(?:Height|Top|Width|Left|Arguments)|rectories)|e(?:scription|fault(?:Status|Ch(?:ecked|arset)|View)))|u(?:ser(?:Profile|Language|Agent)|n(?:iqueID|defined)|pdateInterval)|_content|p(?:ixelDepth|ort|ersonalbar|kcs11|l(?:ugins|atform)|a(?:thname|dding(?:Right|Bottom|Top|Left)|rent(?:Window|Layer)?|ge(?:X(?:Offset)?|Y(?:Offset)?))|r(?:o(?:to(?:col|type)|duct(?:Sub)?|mpter)|e(?:vious|fix)))|e(?:n(?:coding|abledPlugin)|x(?:ternal|pando)|mbeds)|v(?:isibility|endor(?:Sub)?|Linkcolor)|URLUnencoded|P(?:I|OSITIVE_INFINITY)|f(?:ilename|o(?:nt(?:Size|Family|Weight)|rmName)|rame(?:s|Element)|gColor)|E|whiteSpace|l(?:i(?:stStyleType|n(?:eHeight|kColor))|o(?:ca(?:tion(?:bar)?|lName)|wsrc)|e(?:ngth|ft(?:Context)?)|a(?:st(?:M(?:odified|atch)|Index|Paren)|yer(?:s|X)|nguage))|a(?:pp(?:MinorVersion|Name|Co(?:deName|re)|Version)|vail(?:Height|Top|Width|Left)|ll|r(?:ity|guments)|Linkcolor|bove)|r(?:ight(?:Context)?|e(?:sponse(?:XML|Text)|adyState))|global|x|m(?:imeTypes|ultiline|enubar|argin(?:Right|Bottom|Top|Left))|L(?:N(?:10|2)|OG(?:10E|2E))|b(?:o(?:ttom|rder(?:Width|RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(?:Color|Image)))\b/},{token:"identifier",regex:i},{regex:"",token:"empty",next:"no_regex"}],start:[o.getStartRule("doc-start"),u("start"),{token:"string.regexp",regex:"\\/",next:"regex"},{token:"text",regex:"\\s+|^$",next:"start"},{token:"empty",regex:"",next:"no_regex"}],regex:[{token:"regexp.keyword.operator",regex:"\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"},{token:"string.regexp",regex:"/[sxngimy]*",next:"no_regex"},{token:"invalid",regex:/\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/},{token:"constant.language.escape",regex:/\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/},{token:"constant.language.delimiter",regex:/\|/},{token:"constant.language.escape",regex:/\[\^?/,next:"regex_character_class"},{token:"empty",regex:"$",next:"no_regex"},{defaultToken:"string.regexp"}],regex_character_class:[{token:"regexp.charclass.keyword.operator",regex:"\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"},{token:"constant.language.escape",regex:"]",next:"regex"},{token:"constant.language.escape",regex:"-"},{token:"empty",regex:"$",next:"no_regex"},{defaultToken:"string.regexp.charachterclass"}],function_arguments:[{token:"variable.parameter",regex:i},{token:"punctuation.operator",regex:"[, ]+"},{token:"punctuation.operator",regex:"$"},{token:"empty",regex:"",next:"no_regex"}],qqstring:[{token:"constant.language.escape",regex:r},{token:"string",regex:"\\\\$",consumeLineEnd:true},{token:"string",regex:'"|$',next:"no_regex"},{defaultToken:"string"}],qstring:[{token:"constant.language.escape",regex:r},{token:"string",regex:"\\\\$",consumeLineEnd:true},{token:"string",regex:"'|$",next:"no_regex"},{defaultToken:"string"}]};if(!e||!e.noES6){this.$rules.no_regex.unshift({regex:"[{}]",onMatch:function(e,t,n){this.next=e=="{"?this.nextState:"";if(e=="{"&&n.length){n.unshift("start",t)}else if(e=="}"&&n.length){n.shift();this.next=n.shift();if(this.next.indexOf("string")!=-1||this.next.indexOf("jsx")!=-1)return"paren.quasi.end"}return e=="{"?"paren.lparen":"paren.rparen"},nextState:"start"},{token:"string.quasi.start",regex:/`/,push:[{token:"constant.language.escape",regex:r},{token:"paren.quasi.start",regex:/\${/,push:"start"},{token:"string.quasi.end",regex:/`/,next:"pop"},{defaultToken:"string.quasi"}]});if(!e||e.jsx!=false)l.call(this)}this.embedRules(o,"doc-",[o.getEndRule("no_regex")]);this.normalizeRules()};r.inherits(s,a);function l(){var e=i.replace("\\d","\\d\\-");var t={onMatch:function(e,t,n){var r=e.charAt(1)=="/"?2:1;if(r==1){if(t!=this.nextState)n.unshift(this.next,this.nextState,0);else n.unshift(this.next);n[2]++}else if(r==2){if(t==this.nextState){n[1]--;if(!n[1]||n[1]<0){n.shift();n.shift()}}}return[{type:"meta.tag.punctuation."+(r==1?"":"end-")+"tag-open.xml",value:e.slice(0,r)},{type:"meta.tag.tag-name.xml",value:e.substr(r)}]},regex:"</?"+e+"",next:"jsxAttributes",nextState:"jsx"};this.$rules.start.unshift(t);var n={regex:"{",token:"paren.quasi.start",push:"start"};this.$rules.jsx=[n,t,{include:"reference"},{defaultToken:"string"}];this.$rules.jsxAttributes=[{token:"meta.tag.punctuation.tag-close.xml",regex:"/?>",onMatch:function(e,t,n){if(t==n[0])n.shift();if(e.length==2){if(n[0]==this.nextState)n[1]--;if(!n[1]||n[1]<0){n.splice(0,2)}}this.next=n[0]||"start";return[{type:this.token,value:e}]},nextState:"jsx"},n,u("jsxAttributes"),{token:"entity.other.attribute-name.xml",regex:e},{token:"keyword.operator.attribute-equals.xml",regex:"="},{token:"text.tag-whitespace.xml",regex:"\\s+"},{token:"string.attribute-value.xml",regex:"'",stateName:"jsx_attr_q",push:[{token:"string.attribute-value.xml",regex:"'",next:"pop"},{include:"reference"},{defaultToken:"string.attribute-value.xml"}]},{token:"string.attribute-value.xml",regex:'"',stateName:"jsx_attr_qq",push:[{token:"string.attribute-value.xml",regex:'"',next:"pop"},{include:"reference"},{defaultToken:"string.attribute-value.xml"}]},t];this.$rules.reference=[{token:"constant.language.escape.reference.xml",regex:"(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"}]}function u(e){return[{token:"comment",regex:/\/\*/,next:[o.getTagRule(),{token:"comment",regex:"\\*\\/",next:e||"pop"},{defaultToken:"comment",caseInsensitive:true}]},{token:"comment",regex:"\\/\\/",next:[o.getTagRule(),{token:"comment",regex:"$|^",next:e||"pop"},{defaultToken:"comment",caseInsensitive:true}]}]}t.JavaScriptHighlightRules=s});define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(e,t,n){"use strict";var s=e("../range").Range;var r=function(){};(function(){this.checkOutdent=function(e,t){if(!/^\s+$/.test(e))return false;return/^\s*\}/.test(t)};this.autoOutdent=function(e,t){var n=e.getLine(t);var r=n.match(/^(\s*\})/);if(!r)return 0;var o=r[1].length;var a=e.findMatchingBracket({row:t,column:o});if(!a||a.row==t)return 0;var i=this.$getIndent(e.getLine(a.row));e.replace(new s(t,0,t,o-1),i)};this.$getIndent=function(e){return e.match(/^\s*/)[0]}}).call(r.prototype);t.MatchingBraceOutdent=r});define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,n){"use strict";var r=e("../../lib/oop");var g=e("../../range").Range;var o=e("./fold_mode").FoldMode;var a=t.FoldMode=function(e){if(e){this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start));this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end))}};r.inherits(a,o);(function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/;this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/;this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/;this._getFoldWidgetBase=this.getFoldWidget;this.getFoldWidget=function(e,t,n){var r=e.getLine(n);if(this.singleLineBlockCommentRe.test(r)){if(!this.startRegionRe.test(r)&&!this.tripleStarBlockCommentRe.test(r))return""}var o=this._getFoldWidgetBase(e,t,n);if(!o&&this.startRegionRe.test(r))return"start";return o};this.getFoldWidgetRange=function(e,t,n,r){var o=e.getLine(n);if(this.startRegionRe.test(o))return this.getCommentRegionBlock(e,o,n);var a=o.match(this.foldingStartMarker);if(a){var i=a.index;if(a[1])return this.openingBracketBlock(e,a[1],n,i);var s=e.getCommentFoldRange(n,i+a[0].length,1);if(s&&!s.isMultiLine()){if(r){s=this.getSectionRange(e,n)}else if(t!="all")s=null}return s}if(t==="markbegin")return;var a=o.match(this.foldingStopMarker);if(a){var i=a.index+a[0].length;if(a[1])return this.closingBracketBlock(e,a[1],n,i);return e.getCommentFoldRange(n,i,-1)}};this.getSectionRange=function(e,t){var n=e.getLine(t);var r=n.search(/\S/);var o=t;var a=n.length;t=t+1;var i=t;var s=e.getLength();while(++t<s){n=e.getLine(t);var l=n.search(/\S/);if(l===-1)continue;if(r>l)break;var u=this.getFoldWidgetRange(e,"all",t);if(u){if(u.start.row<=o){break}else if(u.isMultiLine()){t=u.end.row}else if(r==l){break}}i=t}return new g(o,a,i,e.getLine(i).length)};this.getCommentRegionBlock=function(e,t,n){var r=t.search(/\s*$/);var o=e.getLength();var a=n;var i=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;var s=1;while(++n<o){t=e.getLine(n);var l=i.exec(t);if(!l)continue;if(l[1])s--;else s++;if(!s)break}var u=n;if(u>a){return new g(a,r,u,t.length)}}}).call(a.prototype)});define("ace/mode/javascript",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/javascript_highlight_rules","ace/mode/matching_brace_outdent","ace/worker/worker_client","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle"],function(e,t,n){"use strict";var r=e("../lib/oop");var o=e("./text").Mode;var a=e("./javascript_highlight_rules").JavaScriptHighlightRules;var i=e("./matching_brace_outdent").MatchingBraceOutdent;var s=e("../worker/worker_client").WorkerClient;var l=e("./behaviour/cstyle").CstyleBehaviour;var u=e("./folding/cstyle").FoldMode;var g=function(){this.HighlightRules=a;this.$outdent=new i;this.$behaviour=new l;this.foldingRules=new u};r.inherits(g,o);(function(){this.lineCommentStart="//";this.blockComment={start:"/*",end:"*/"};this.$quotes={'"':'"',"'":"'","`":"`"};this.getNextLineIndent=function(e,t,n){var r=this.$getIndent(t);var o=this.getTokenizer().getLineTokens(t,e);var a=o.tokens;var i=o.state;if(a.length&&a[a.length-1].type=="comment"){return r}if(e=="start"||e=="no_regex"){var s=t.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);if(s){r+=n}}else if(e=="doc-start"){if(i=="start"||i=="no_regex"){return""}var s=t.match(/^\s*(\/?)\*/);if(s){if(s[1]){r+=" "}r+="* "}}return r};this.checkOutdent=function(e,t,n){return this.$outdent.checkOutdent(t,n)};this.autoOutdent=function(e,t,n){this.$outdent.autoOutdent(t,n)};this.createWorker=function(t){var e=new s(["ace"],"ace/mode/javascript_worker","JavaScriptWorker");e.attachToDocument(t.getDocument());e.on("annotate",function(e){t.setAnnotations(e.data)});e.on("terminate",function(){t.clearAnnotations()});return e};this.$id="ace/mode/javascript";this.snippetFileId="ace/snippets/javascript"}).call(g.prototype);t.Mode=g});define("ace/mode/svg_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/javascript_highlight_rules","ace/mode/xml_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop");var o=e("./javascript_highlight_rules").JavaScriptHighlightRules;var a=e("./xml_highlight_rules").XmlHighlightRules;var i=function(){a.call(this);this.embedTagRules(o,"js-","script");this.normalizeRules()};r.inherits(i,a);t.SvgHighlightRules=i});define("ace/mode/folding/mixed",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode"],function(e,t,n){"use strict";var r=e("../../lib/oop");var o=e("./fold_mode").FoldMode;var a=t.FoldMode=function(e,t){this.defaultMode=e;this.subModes=t};r.inherits(a,o);(function(){this.$getMode=function(e){if(typeof e!="string")e=e[0];for(var t in this.subModes){if(e.indexOf(t)===0)return this.subModes[t]}return null};this.$tryMode=function(e,t,n,r){var o=this.$getMode(e);return o?o.getFoldWidget(t,n,r):""};this.getFoldWidget=function(e,t,n){return this.$tryMode(e.getState(n-1),e,t,n)||this.$tryMode(e.getState(n),e,t,n)||this.defaultMode.getFoldWidget(e,t,n)};this.getFoldWidgetRange=function(e,t,n){var r=this.$getMode(e.getState(n-1));if(!r||!r.getFoldWidget(e,t,n))r=this.$getMode(e.getState(n));if(!r||!r.getFoldWidget(e,t,n))r=this.defaultMode;return r.getFoldWidgetRange(e,t,n)}}).call(a.prototype)});define("ace/mode/svg",["require","exports","module","ace/lib/oop","ace/mode/xml","ace/mode/javascript","ace/mode/svg_highlight_rules","ace/mode/folding/mixed","ace/mode/folding/xml","ace/mode/folding/cstyle"],function(e,t,n){"use strict";var r=e("../lib/oop");var o=e("./xml").Mode;var a=e("./javascript").Mode;var i=e("./svg_highlight_rules").SvgHighlightRules;var s=e("./folding/mixed").FoldMode;var l=e("./folding/xml").FoldMode;var u=e("./folding/cstyle").FoldMode;var g=function(){o.call(this);this.HighlightRules=i;this.createModeDelegates({"js-":a});this.foldingRules=new s(new l,{"js-":new u})};r.inherits(g,o);(function(){this.getNextLineIndent=function(e,t,n){return this.$getIndent(t)};this.$id="ace/mode/svg"}).call(g.prototype);t.Mode=g});(function(){window.require(["ace/mode/svg"],function(e){if(typeof module=="object"&&typeof exports=="object"&&module){module.exports=e}})})();