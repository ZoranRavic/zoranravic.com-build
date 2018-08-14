(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){(function(factory){var globalObject=typeof window==="object"&&window||typeof self==="object"&&self;if(typeof exports!=="undefined"){factory(exports)}else if(globalObject){globalObject.hljs=factory({});if(typeof define==="function"&&define.amd){define([],function(){return globalObject.hljs})}}})(function(hljs){var ArrayProto=[],objectKeys=Object.keys;var languages={},aliases={};var noHighlightRe=/^(no-?highlight|plain|text)$/i,languagePrefixRe=/\blang(?:uage)?-([\w-]+)\b/i,fixMarkupRe=/((^(<[^>]+>|\t|)+|(?:\n)))/gm;var spanEndTag="</span>";var options={classPrefix:"hljs-",tabReplace:null,useBR:false,languages:undefined};function escape(value){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function tag(node){return node.nodeName.toLowerCase()}function testRe(re,lexeme){var match=re&&re.exec(lexeme);return match&&match.index===0}function isNotHighlighted(language){return noHighlightRe.test(language)}function blockLanguage(block){var i,match,length,_class;var classes=block.className+" ";classes+=block.parentNode?block.parentNode.className:"";match=languagePrefixRe.exec(classes);if(match){return getLanguage(match[1])?match[1]:"no-highlight"}classes=classes.split(/\s+/);for(i=0,length=classes.length;i<length;i++){_class=classes[i];if(isNotHighlighted(_class)||getLanguage(_class)){return _class}}}function inherit(parent){var key;var result={};var objects=Array.prototype.slice.call(arguments,1);for(key in parent)result[key]=parent[key];objects.forEach(function(obj){for(key in obj)result[key]=obj[key]});return result}function nodeStream(node){var result=[];(function _nodeStream(node,offset){for(var child=node.firstChild;child;child=child.nextSibling){if(child.nodeType===3)offset+=child.nodeValue.length;else if(child.nodeType===1){result.push({event:"start",offset:offset,node:child});offset=_nodeStream(child,offset);if(!tag(child).match(/br|hr|img|input/)){result.push({event:"stop",offset:offset,node:child})}}}return offset})(node,0);return result}function mergeStreams(original,highlighted,value){var processed=0;var result="";var nodeStack=[];function selectStream(){if(!original.length||!highlighted.length){return original.length?original:highlighted}if(original[0].offset!==highlighted[0].offset){return original[0].offset<highlighted[0].offset?original:highlighted}return highlighted[0].event==="start"?original:highlighted}function open(node){function attr_str(a){return" "+a.nodeName+'="'+escape(a.value).replace('"',"&quot;")+'"'}result+="<"+tag(node)+ArrayProto.map.call(node.attributes,attr_str).join("")+">"}function close(node){result+="</"+tag(node)+">"}function render(event){(event.event==="start"?open:close)(event.node)}while(original.length||highlighted.length){var stream=selectStream();result+=escape(value.substring(processed,stream[0].offset));processed=stream[0].offset;if(stream===original){nodeStack.reverse().forEach(close);do{render(stream.splice(0,1)[0]);stream=selectStream()}while(stream===original&&stream.length&&stream[0].offset===processed);nodeStack.reverse().forEach(open)}else{if(stream[0].event==="start"){nodeStack.push(stream[0].node)}else{nodeStack.pop()}render(stream.splice(0,1)[0])}}return result+escape(value.substr(processed))}function expand_mode(mode){if(mode.variants&&!mode.cached_variants){mode.cached_variants=mode.variants.map(function(variant){return inherit(mode,{variants:null},variant)})}return mode.cached_variants||mode.endsWithParent&&[inherit(mode)]||[mode]}function compileLanguage(language){function reStr(re){return re&&re.source||re}function langRe(value,global){return new RegExp(reStr(value),"m"+(language.case_insensitive?"i":"")+(global?"g":""))}function compileMode(mode,parent){if(mode.compiled)return;mode.compiled=true;mode.keywords=mode.keywords||mode.beginKeywords;if(mode.keywords){var compiled_keywords={};var flatten=function(className,str){if(language.case_insensitive){str=str.toLowerCase()}str.split(" ").forEach(function(kw){var pair=kw.split("|");compiled_keywords[pair[0]]=[className,pair[1]?Number(pair[1]):1]})};if(typeof mode.keywords==="string"){flatten("keyword",mode.keywords)}else{objectKeys(mode.keywords).forEach(function(className){flatten(className,mode.keywords[className])})}mode.keywords=compiled_keywords}mode.lexemesRe=langRe(mode.lexemes||/\w+/,true);if(parent){if(mode.beginKeywords){mode.begin="\\b("+mode.beginKeywords.split(" ").join("|")+")\\b"}if(!mode.begin)mode.begin=/\B|\b/;mode.beginRe=langRe(mode.begin);if(!mode.end&&!mode.endsWithParent)mode.end=/\B|\b/;if(mode.end)mode.endRe=langRe(mode.end);mode.terminator_end=reStr(mode.end)||"";if(mode.endsWithParent&&parent.terminator_end)mode.terminator_end+=(mode.end?"|":"")+parent.terminator_end}if(mode.illegal)mode.illegalRe=langRe(mode.illegal);if(mode.relevance==null)mode.relevance=1;if(!mode.contains){mode.contains=[]}mode.contains=Array.prototype.concat.apply([],mode.contains.map(function(c){return expand_mode(c==="self"?mode:c)}));mode.contains.forEach(function(c){compileMode(c,mode)});if(mode.starts){compileMode(mode.starts,parent)}var terminators=mode.contains.map(function(c){return c.beginKeywords?"\\.?("+c.begin+")\\.?":c.begin}).concat([mode.terminator_end,mode.illegal]).map(reStr).filter(Boolean);mode.terminators=terminators.length?langRe(terminators.join("|"),true):{exec:function(){return null}}}compileMode(language)}function highlight(name,value,ignore_illegals,continuation){function subMode(lexeme,mode){var i,length;for(i=0,length=mode.contains.length;i<length;i++){if(testRe(mode.contains[i].beginRe,lexeme)){return mode.contains[i]}}}function endOfMode(mode,lexeme){if(testRe(mode.endRe,lexeme)){while(mode.endsParent&&mode.parent){mode=mode.parent}return mode}if(mode.endsWithParent){return endOfMode(mode.parent,lexeme)}}function isIllegal(lexeme,mode){return!ignore_illegals&&testRe(mode.illegalRe,lexeme)}function keywordMatch(mode,match){var match_str=language.case_insensitive?match[0].toLowerCase():match[0];return mode.keywords.hasOwnProperty(match_str)&&mode.keywords[match_str]}function buildSpan(classname,insideSpan,leaveOpen,noPrefix){var classPrefix=noPrefix?"":options.classPrefix,openSpan='<span class="'+classPrefix,closeSpan=leaveOpen?"":spanEndTag;openSpan+=classname+'">';return openSpan+insideSpan+closeSpan}function processKeywords(){var keyword_match,last_index,match,result;if(!top.keywords)return escape(mode_buffer);result="";last_index=0;top.lexemesRe.lastIndex=0;match=top.lexemesRe.exec(mode_buffer);while(match){result+=escape(mode_buffer.substring(last_index,match.index));keyword_match=keywordMatch(top,match);if(keyword_match){relevance+=keyword_match[1];result+=buildSpan(keyword_match[0],escape(match[0]))}else{result+=escape(match[0])}last_index=top.lexemesRe.lastIndex;match=top.lexemesRe.exec(mode_buffer)}return result+escape(mode_buffer.substr(last_index))}function processSubLanguage(){var explicit=typeof top.subLanguage==="string";if(explicit&&!languages[top.subLanguage]){return escape(mode_buffer)}var result=explicit?highlight(top.subLanguage,mode_buffer,true,continuations[top.subLanguage]):highlightAuto(mode_buffer,top.subLanguage.length?top.subLanguage:undefined);if(top.relevance>0){relevance+=result.relevance}if(explicit){continuations[top.subLanguage]=result.top}return buildSpan(result.language,result.value,false,true)}function processBuffer(){result+=top.subLanguage!=null?processSubLanguage():processKeywords();mode_buffer=""}function startNewMode(mode){result+=mode.className?buildSpan(mode.className,"",true):"";top=Object.create(mode,{parent:{value:top}})}function processLexeme(buffer,lexeme){mode_buffer+=buffer;if(lexeme==null){processBuffer();return 0}var new_mode=subMode(lexeme,top);if(new_mode){if(new_mode.skip){mode_buffer+=lexeme}else{if(new_mode.excludeBegin){mode_buffer+=lexeme}processBuffer();if(!new_mode.returnBegin&&!new_mode.excludeBegin){mode_buffer=lexeme}}startNewMode(new_mode,lexeme);return new_mode.returnBegin?0:lexeme.length}var end_mode=endOfMode(top,lexeme);if(end_mode){var origin=top;if(origin.skip){mode_buffer+=lexeme}else{if(!(origin.returnEnd||origin.excludeEnd)){mode_buffer+=lexeme}processBuffer();if(origin.excludeEnd){mode_buffer=lexeme}}do{if(top.className){result+=spanEndTag}if(!top.skip){relevance+=top.relevance}top=top.parent}while(top!==end_mode.parent);if(end_mode.starts){startNewMode(end_mode.starts,"")}return origin.returnEnd?0:lexeme.length}if(isIllegal(lexeme,top))throw new Error('Illegal lexeme "'+lexeme+'" for mode "'+(top.className||"<unnamed>")+'"');mode_buffer+=lexeme;return lexeme.length||1}var language=getLanguage(name);if(!language){throw new Error('Unknown language: "'+name+'"')}compileLanguage(language);var top=continuation||language;var continuations={};var result="",current;for(current=top;current!==language;current=current.parent){if(current.className){result=buildSpan(current.className,"",true)+result}}var mode_buffer="";var relevance=0;try{var match,count,index=0;while(true){top.terminators.lastIndex=index;match=top.terminators.exec(value);if(!match)break;count=processLexeme(value.substring(index,match.index),match[0]);index=match.index+count}processLexeme(value.substr(index));for(current=top;current.parent;current=current.parent){if(current.className){result+=spanEndTag}}return{relevance:relevance,value:result,language:name,top:top}}catch(e){if(e.message&&e.message.indexOf("Illegal")!==-1){return{relevance:0,value:escape(value)}}else{throw e}}}function highlightAuto(text,languageSubset){languageSubset=languageSubset||options.languages||objectKeys(languages);var result={relevance:0,value:escape(text)};var second_best=result;languageSubset.filter(getLanguage).forEach(function(name){var current=highlight(name,text,false);current.language=name;if(current.relevance>second_best.relevance){second_best=current}if(current.relevance>result.relevance){second_best=result;result=current}});if(second_best.language){result.second_best=second_best}return result}function fixMarkup(value){return!(options.tabReplace||options.useBR)?value:value.replace(fixMarkupRe,function(match,p1){if(options.useBR&&match==="\n"){return"<br>"}else if(options.tabReplace){return p1.replace(/\t/g,options.tabReplace)}return""})}function buildClassName(prevClassName,currentLang,resultLang){var language=currentLang?aliases[currentLang]:resultLang,result=[prevClassName.trim()];if(!prevClassName.match(/\bhljs\b/)){result.push("hljs")}if(prevClassName.indexOf(language)===-1){result.push(language)}return result.join(" ").trim()}function highlightBlock(block){var node,originalStream,result,resultNode,text;var language=blockLanguage(block);if(isNotHighlighted(language))return;if(options.useBR){node=document.createElementNS("http://www.w3.org/1999/xhtml","div");node.innerHTML=block.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")}else{node=block}text=node.textContent;result=language?highlight(language,text,true):highlightAuto(text);originalStream=nodeStream(node);if(originalStream.length){resultNode=document.createElementNS("http://www.w3.org/1999/xhtml","div");resultNode.innerHTML=result.value;result.value=mergeStreams(originalStream,nodeStream(resultNode),text)}result.value=fixMarkup(result.value);block.innerHTML=result.value;block.className=buildClassName(block.className,language,result.language);block.result={language:result.language,re:result.relevance};if(result.second_best){block.second_best={language:result.second_best.language,re:result.second_best.relevance}}}function configure(user_options){options=inherit(options,user_options)}function initHighlighting(){if(initHighlighting.called)return;initHighlighting.called=true;var blocks=document.querySelectorAll("pre code");ArrayProto.forEach.call(blocks,highlightBlock)}function initHighlightingOnLoad(){addEventListener("DOMContentLoaded",initHighlighting,false);addEventListener("load",initHighlighting,false)}function registerLanguage(name,language){var lang=languages[name]=language(hljs);if(lang.aliases){lang.aliases.forEach(function(alias){aliases[alias]=name})}}function listLanguages(){return objectKeys(languages)}function getLanguage(name){name=(name||"").toLowerCase();return languages[name]||languages[aliases[name]]}hljs.highlight=highlight;hljs.highlightAuto=highlightAuto;hljs.fixMarkup=fixMarkup;hljs.highlightBlock=highlightBlock;hljs.configure=configure;hljs.initHighlighting=initHighlighting;hljs.initHighlightingOnLoad=initHighlightingOnLoad;hljs.registerLanguage=registerLanguage;hljs.listLanguages=listLanguages;hljs.getLanguage=getLanguage;hljs.inherit=inherit;hljs.IDENT_RE="[a-zA-Z]\\w*";hljs.UNDERSCORE_IDENT_RE="[a-zA-Z_]\\w*";hljs.NUMBER_RE="\\b\\d+(\\.\\d+)?";hljs.C_NUMBER_RE="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";hljs.BINARY_NUMBER_RE="\\b(0b[01]+)";hljs.RE_STARTERS_RE="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";hljs.BACKSLASH_ESCAPE={begin:"\\\\[\\s\\S]",relevance:0};hljs.APOS_STRING_MODE={className:"string",begin:"'",end:"'",illegal:"\\n",contains:[hljs.BACKSLASH_ESCAPE]};hljs.QUOTE_STRING_MODE={className:"string",begin:'"',end:'"',illegal:"\\n",contains:[hljs.BACKSLASH_ESCAPE]};hljs.PHRASAL_WORDS_MODE={begin:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/};hljs.COMMENT=function(begin,end,inherits){var mode=hljs.inherit({className:"comment",begin:begin,end:end,contains:[]},inherits||{});mode.contains.push(hljs.PHRASAL_WORDS_MODE);mode.contains.push({className:"doctag",begin:"(?:TODO|FIXME|NOTE|BUG|XXX):",relevance:0});return mode};hljs.C_LINE_COMMENT_MODE=hljs.COMMENT("//","$");hljs.C_BLOCK_COMMENT_MODE=hljs.COMMENT("/\\*","\\*/");hljs.HASH_COMMENT_MODE=hljs.COMMENT("#","$");hljs.NUMBER_MODE={className:"number",begin:hljs.NUMBER_RE,relevance:0};hljs.C_NUMBER_MODE={className:"number",begin:hljs.C_NUMBER_RE,relevance:0};hljs.BINARY_NUMBER_MODE={className:"number",begin:hljs.BINARY_NUMBER_RE,relevance:0};hljs.CSS_NUMBER_MODE={className:"number",begin:hljs.NUMBER_RE+"("+"%|em|ex|ch|rem"+"|vw|vh|vmin|vmax"+"|cm|mm|in|pt|pc|px"+"|deg|grad|rad|turn"+"|s|ms"+"|Hz|kHz"+"|dpi|dpcm|dppx"+")?",relevance:0};hljs.REGEXP_MODE={className:"regexp",begin:/\//,end:/\/[gimuy]*/,illegal:/\n/,contains:[hljs.BACKSLASH_ESCAPE,{begin:/\[/,end:/\]/,relevance:0,contains:[hljs.BACKSLASH_ESCAPE]}]};hljs.TITLE_MODE={className:"title",begin:hljs.IDENT_RE,relevance:0};hljs.UNDERSCORE_TITLE_MODE={className:"title",begin:hljs.UNDERSCORE_IDENT_RE,relevance:0};hljs.METHOD_GUARD={begin:"\\.\\s*"+hljs.UNDERSCORE_IDENT_RE,relevance:0};return hljs})},{}],2:[function(require,module,exports){module.exports=function(hljs){var IDENT_RE="[A-Za-z$_][0-9A-Za-z$_]*";var KEYWORDS={keyword:"in of if for while finally var new function do return void else break catch "+"instanceof with throw case default try this switch continue typeof delete "+"let yield const export super debugger as async await static "+"import from as",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent "+"encodeURI encodeURIComponent escape unescape Object Function Boolean Error "+"EvalError InternalError RangeError ReferenceError StopIteration SyntaxError "+"TypeError URIError Number Math Date String RegExp Array Float32Array "+"Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array "+"Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require "+"module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect "+"Promise"};var EXPRESSIONS;var NUMBER={className:"number",variants:[{begin:"\\b(0[bB][01]+)"},{begin:"\\b(0[oO][0-7]+)"},{begin:hljs.C_NUMBER_RE}],relevance:0};var SUBST={className:"subst",begin:"\\$\\{",end:"\\}",keywords:KEYWORDS,contains:[]};var TEMPLATE_STRING={className:"string",begin:"`",end:"`",contains:[hljs.BACKSLASH_ESCAPE,SUBST]};SUBST.contains=[hljs.APOS_STRING_MODE,hljs.QUOTE_STRING_MODE,TEMPLATE_STRING,NUMBER,hljs.REGEXP_MODE];var PARAMS_CONTAINS=SUBST.contains.concat([hljs.C_BLOCK_COMMENT_MODE,hljs.C_LINE_COMMENT_MODE]);return{aliases:["js","jsx"],keywords:KEYWORDS,contains:[{className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},{className:"meta",begin:/^#!/,end:/$/},hljs.APOS_STRING_MODE,hljs.QUOTE_STRING_MODE,TEMPLATE_STRING,hljs.C_LINE_COMMENT_MODE,hljs.C_BLOCK_COMMENT_MODE,NUMBER,{begin:/[{,]\s*/,relevance:0,contains:[{begin:IDENT_RE+"\\s*:",returnBegin:true,relevance:0,contains:[{className:"attr",begin:IDENT_RE,relevance:0}]}]},{begin:"("+hljs.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",contains:[hljs.C_LINE_COMMENT_MODE,hljs.C_BLOCK_COMMENT_MODE,hljs.REGEXP_MODE,{className:"function",begin:"(\\(.*?\\)|"+IDENT_RE+")\\s*=>",returnBegin:true,end:"\\s*=>",contains:[{className:"params",variants:[{begin:IDENT_RE},{begin:/\(\s*\)/},{begin:/\(/,end:/\)/,excludeBegin:true,excludeEnd:true,keywords:KEYWORDS,contains:PARAMS_CONTAINS}]}]},{begin:/</,end:/(\/\w+|\w+\/)>/,subLanguage:"xml",contains:[{begin:/<\w+\s*\/>/,skip:true},{begin:/<\w+/,end:/(\/\w+|\w+\/)>/,skip:true,contains:[{begin:/<\w+\s*\/>/,skip:true},"self"]}]}],relevance:0},{className:"function",beginKeywords:"function",end:/\{/,excludeEnd:true,contains:[hljs.inherit(hljs.TITLE_MODE,{begin:IDENT_RE}),{className:"params",begin:/\(/,end:/\)/,excludeBegin:true,excludeEnd:true,contains:PARAMS_CONTAINS}],illegal:/\[|%/},{begin:/\$[(.]/},hljs.METHOD_GUARD,{className:"class",beginKeywords:"class",end:/[{;=]/,excludeEnd:true,illegal:/[:"\[\]]/,contains:[{beginKeywords:"extends"},hljs.UNDERSCORE_TITLE_MODE]},{beginKeywords:"constructor",end:/\{/,excludeEnd:true}],illegal:/#(?!!)/}}},{}],3:[function(require,module,exports){"use strict";function __export(m){for(var p in m)if(!exports.hasOwnProperty(p))exports[p]=m[p]}Object.defineProperty(exports,"__esModule",{value:true});__export(require("./lib/randomId"));__export(require("./lib/svg"));__export(require("./lib/pattern"));__export(require("./lib/line"));__export(require("./lib/circle"));__export(require("./lib/path"));__export(require("./lib/hexagon"));__export(require("./lib/square"));__export(require("./lib/cube"));__export(require("./lib/gradient"));__export(require("./lib/helpers"))},{"./lib/circle":4,"./lib/cube":5,"./lib/gradient":6,"./lib/helpers":7,"./lib/hexagon":8,"./lib/line":9,"./lib/path":10,"./lib/pattern":11,"./lib/randomId":12,"./lib/square":13,"./lib/svg":14}],4:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");function circle(options){options=options||{};const size=options.size||20;const radius=options.radius||2;const fill=options.fill||"#333";return velements_1.h("circle",{cx:size/2,cy:size/2,r:radius,fill:fill,stroke:options.stroke,"stroke-width":options.strokeWidth})}exports.circle=circle;function circleComplement(options){options=options||{};const size=options.size||20;const radius=options.radius||2;const strokeWidth=options.strokeWidth||0;const stroke=options.stroke||"#333";const fill=options.fill||stroke;const circles=[];const positions=[[size/2,size/2],[0,0],[0,size],[size,0],[size,size]];for(let i=0;i<positions.length;++i){const pos=positions[i];circles.push(velements_1.h("circle",{cx:pos[0],cy:pos[1],r:radius,fill:fill,stroke:stroke,"stroke-width":strokeWidth}))}return circles}exports.circleComplement=circleComplement},{velements:15}],5:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");const pattern_1=require("./pattern");function cubePattern(options){options=options||{};const size=options.size||20;const left=options.left||"rgba(0,0,0,.06)";const right=options.right||"rgba(0,0,0,.12)";const n=pattern_1.pattern({width:size*.625,height:size,content:[velements_1.h("g",{id:"cube"},velements_1.h("path",{fill:left,d:"M0,0l5,3v5l-5,-3Z"}),velements_1.h("path",{fill:right,d:"M10,0l-5,3v5l5,-3"})),velements_1.h("use",{x:5,y:8,href:"#cube"}),velements_1.h("use",{x:-5,y:8,href:"#cube"})],background:options.background});n.attrs.viewBox="0 0 10 16";return n}exports.cubePattern=cubePattern},{"./pattern":11,velements:15}],6:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");const randomId_1=require("./randomId");function diagonalGradient(colors){return linearGradientAddColors(velements_1.h("linearGradient",{id:randomId_1.randomId(),x2:1,y2:1}),colors)}exports.diagonalGradient=diagonalGradient;function rdiagonalGradient(colors){return linearGradientAddColors(velements_1.h("linearGradient",{id:randomId_1.randomId(),x1:1,x2:0,y2:1}),colors)}exports.rdiagonalGradient=rdiagonalGradient;function verticalGradient(colors){return linearGradientAddColors(velements_1.h("linearGradient",{id:randomId_1.randomId(),x2:0,y2:1}),colors)}exports.verticalGradient=verticalGradient;function horizontalGradient(colors){return linearGradientAddColors(velements_1.h("linearGradient",{id:randomId_1.randomId(),x2:1,y2:0}),colors)}exports.horizontalGradient=horizontalGradient;function linearGradientAddColors(n,colors){for(let i=0;i<colors.length;++i){n.children.push(velements_1.h("stop",i==0?{"stop-color":colors[i]}:{"stop-color":colors[i],offset:i/(colors.length-1)*100+"%"}))}return n}exports.linearGradientAddColors=linearGradientAddColors},{"./randomId":12,velements:15}],7:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const svg_1=require("./svg");const pattern_1=require("./pattern");const line_1=require("./line");const circle_1=require("./circle");const path_1=require("./path");function patternLine(options){options=options||{};options.content=line_1.line(options);return pattern_1.pattern(options)}exports.patternLine=patternLine;function patternCircle(options){options=options||{};options.content=circle_1.circle(options);return pattern_1.pattern(options)}exports.patternCircle=patternCircle;function patternCircleComplement(options){options=options||{};options.content=circle_1.circleComplement(options);return pattern_1.pattern(options)}exports.patternCircleComplement=patternCircleComplement;function patternLinePath(options){options=options||{};options.content=path_1.path(options);return pattern_1.pattern(options)}exports.patternLinePath=patternLinePath;function svgRectPattern(options){return svg_1.svgRect(pattern_1.pattern(options))}exports.svgRectPattern=svgRectPattern;function svgRectPatternLine(options){return svg_1.svgRect(patternLine(options))}exports.svgRectPatternLine=svgRectPatternLine;function svgRectPatternCircle(options){return svg_1.svgRect(patternCircle(options))}exports.svgRectPatternCircle=svgRectPatternCircle;function svgRectPatternCircleComplement(options){return svg_1.svgRect(patternCircleComplement(options))}exports.svgRectPatternCircleComplement=svgRectPatternCircleComplement;function svgRectPatternPath(options){return svg_1.svgRect(patternLinePath(options))}exports.svgRectPatternPath=svgRectPatternPath},{"./circle":4,"./line":9,"./path":10,"./pattern":11,"./svg":14}],8:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");const pattern_1=require("./pattern");function hexagonPattern(options){options=options||{};const s=options.size||20;const strokeWidth=options.strokeWidth||2;const stroke=options.stroke||"#333";const fill=options.fill||"transparent";const shapeRendering=options.shapeRendering||"auto";const sqrt3=Math.sqrt(3);const s2=s/2;const s3s=s*3;const ss32=s*sqrt3/2;return pattern_1.pattern({width:s*3,height:s*sqrt3,content:velements_1.h("path",{stroke:stroke,fill:fill,"stroke-width":strokeWidth,"shape-rendering":shapeRendering,"stroke-linecap":"square",d:`M${s},0l${s},0l${s2},${ss32}l${-s2},${ss32}l${-s},0l${-s2},${-ss32}ZM0,${ss32}l${s2},0M${s3s},${ss32}l${-s2},0`}),background:options.background})}exports.hexagonPattern=hexagonPattern},{"./pattern":11,velements:15}],9:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");function line(options){options=options||{};const size=options.size||20;const strokeWidth=options.strokeWidth||2;const stroke=options.stroke||"#333";const shapeRendering=options.shapeRendering||"auto";const orientation=options.orientation||"diagonal";return velements_1.h("path",{stroke:stroke,"stroke-width":strokeWidth,"shape-rendering":shapeRendering,"stroke-linecap":"square",d:linePath(size,orientation)})}exports.line=line;function linePath(s,orientation){const s2=s/2;const s4=s/4;const s34=s*3/4;const s54=s*5/4;switch(orientation){case"0/8":case"vertical":return`M${s2},0l0,${s}`;case"1/8":return`M${s4},0l${s2},${s}M${-s4},0l${s2},${s}M${s34},0l${s2},${s}`;case"2/8":case"diagonal":return`M0,${s}l${s},${-s}M${-s4},${s4}l${s2},${-s2}M${s34},${s54}l${s2},${-s2}`;case"3/8":return`M0,${s34}l${s},${-s2}M0,${s4}l${s},${-s2}M0,${s54}l${s},${-s2}`;case"4/8":case"horizontal":return`M0,${s2}l${s},0`;case"5/8":return`M0,${-s4}l${s},${s2}M0,${s4}l${s},${s2}M0,${s34}l${s},${s2}`;case"6/8":return`M0,0l${s},${s}M${-s4},${s34}l${s2},${s2} M ${s34},${-s4}l${s2},${s2}`;case"7/8":return`M${-s4},0l${s2},${s}M${s4},0l${s2},${s}M${s34},0l${s2},${s}`;default:return`M${s2},0l0,${s}`}}exports.linePath=linePath},{velements:15}],10:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");function path(options){options=options||{};const size=options.size||20;const strokeWidth=options.strokeWidth||2;const stroke=options.stroke||"#333";const fill=options.fill||"transparent";const shapeRendering=options.shapeRendering||"auto";const path=options.path||"woven";return velements_1.h("path",{stroke:stroke,fill:fill,"stroke-width":strokeWidth,"shape-rendering":shapeRendering,"stroke-linecap":"square",d:paths(size,path)})}exports.path=path;function paths(s,p){const s2=s/2;const s4=s/4;const s8=s/8;const s34=s*3/4;const s38=s*3/8;const s54=s*5/4;switch(p){case"squares":return`M${s4},${s4}l${s2},0l0,${s2}l${-s2},0Z`;case"nylon":return`M0,${s4}l${s4},0l0,${-s4}M${s34},${s}l0,${-s4}l${s4},0M${s4},${s2}l0,${s4}l${s4},0M${s2},${s4}l${s4},0l0,${s4}`;case"waves":return`M0,${s2}c${s8},${-s4},${s38},${-s4},${s2},0c${s8},${s4},${s38},${s4},${s2},0M${-s2},${s2}c${s8},${s4},${s38},${s4},${s2},0M${s},${s2}c${s8},${-s4},${s38},${-s4},${s2},0`;case"woven":return`M${s4},${s/4}l${s2},${s2}M${s34},${s4}l${s2},${-s2}M${s4},${s34}l${-s2},${s2}M${s34},${s54}l${s2},${-s2} M${-s4},${s4}l${s2},${-s2}`;case"crosses":return`M${s4},${s4}l${s2},${s2}M${s4},${s34}l${s2},${-s2}`;case"caps":return`M${s4},${s34}l${s4},${-s2}l${s4},${s2}`;default:return p(s)}}exports.paths=paths},{velements:15}],11:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");const randomId_1=require("./randomId");function pattern(options){const size=options.size||20;const width=options.width||size;const height=options.height||size;const content=Array.isArray(options.content)?options.content:[options.content];const n=velements_1.h("pattern",{id:randomId_1.randomId(),patternUnits:"userSpaceOnUse",width:width,height:height},...content);if(options.background){const bg=velements_1.h("rect",{width:width,height:height,fill:options.background});n.children.unshift(bg)}return n}exports.pattern=pattern},{"./randomId":12,velements:15}],12:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.randomId=(()=>(Math.random().toString(36)+"00000000000000000").replace(/[^a-z]+/g,"").slice(0,5))},{}],13:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");const pattern_1=require("./pattern");function squarePattern(options){options=options||{};const size=options.size||20;const fill=options.fill||"#333";const halfSize=size/2;const content=[];if(options.background){content.push(velements_1.h("rect",{fill:options.background,width:size,height:size}))}content.push(velements_1.h("rect",{fill:fill,width:halfSize,height:halfSize}),velements_1.h("rect",{fill:fill,width:halfSize,height:halfSize,x:halfSize,y:halfSize}));return pattern_1.pattern({width:size,height:size,content:content})}exports.squarePattern=squarePattern;function diagonalSquarePattern(options){options=options||{};const size=options.size||20;const fill=options.fill||"#333";const diagonalSize=size*.707;const content=[];if(options.background){content.push(velements_1.h("rect",{fill:options.background,width:size,height:size}))}content.push(velements_1.h("rect",{fill:fill,width:diagonalSize,height:diagonalSize,transform:`translate(${size/2} 0) rotate(45)`}));return pattern_1.pattern({width:size,height:size,content:content})}exports.diagonalSquarePattern=diagonalSquarePattern},{"./pattern":11,velements:15}],14:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const velements_1=require("velements");function svg(options){return velements_1.h("svg",null,velements_1.h("defs",null,options.defs),options.content)}exports.svg=svg;function svgRect(...patterns){return velements_1.h("svg",null,velements_1.h("defs",null,patterns),patterns.map(p=>velements_1.h("rect",{fill:`url(#${p.attrs.id})`,x:0,y:0,height:"100%",width:"100%"})))}exports.svgRect=svgRect},{velements:15}],15:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.h=((name,attrs,...children)=>new VElement(name,attrs,...children));class VElement{constructor(name,attrs,...children){if(Array.isArray(name)){this.namespace=name[0];this.name=name[1]}else if(svgElementNames.indexOf(name)>=0){this.namespace="http://www.w3.org/2000/svg";this.name=name}else{this.name=name}this.attrs={};if(attrs&&typeof attrs==="object"){for(const attr in attrs){const value=attrs[attr];if(value!=null){if(typeof value==="object"){const ns=attr.indexOf("http")==0?attr:"http://www.w3.org/1999/"+attr;for(const nsAttr in value){if(value[nsAttr]!=null){this.attrs[ns]=this.attrs[ns]||{};this.attrs[ns][nsAttr]=value[nsAttr].toString()}}}else{this.attrs[attr]=value.toString()}}}}this.children=[];for(const child of children){if(Array.isArray(child)){this.children.push(...child)}else{this.children.push(child)}}}attr(attr,val){if(arguments.length==1){return this.attrs[attr]}else{this.attrs[attr]=val.toString();return this}}data(attr,val){if(arguments.length==1){return this.attrs["data-"+attr]}else{this.attrs["data-"+attr]=val;return this}}attrNS(namespace,attr,val){const ns=namespace.indexOf("http")==0?namespace:"http://www.w3.org/1999/"+namespace;if(arguments.length==2){return this.attrs[ns]?this.attrs[ns][attr]:undefined}else{this.attrs[ns]=this.attrs[ns]||{};this.attrs[ns][attr]=val;return this}}append(node){this.children.push(node);return this}remove(node){const index=this.children.indexOf(node);if(index>=0){this.children.splice(index,1)}return this}get innerHTML(){return this.children.join("")}get outerHTML(){return this.toString()}toString(){let attrsStr="";for(const attr in this.attrs){const value=this.attrs[attr];if(value!=null){if(typeof value==="object"){for(const nsAttr in value){if(value[nsAttr]!=null){attrsStr+=` ${attr}:${nsAttr}="${value[nsAttr]}"`}}}else{attrsStr+=` ${attr}="${value}"`}}}return this.children.length==0?`<${this.name}${attrsStr}/>`:`<${this.name}${attrsStr}>${this.children.join("")}</${this.name}>`}toElement(){const element=this.namespace?document.createElementNS(this.namespace,this.name):document.createElement(this.name);for(const attr in this.attrs){const value=this.attrs[attr];if(value!=null){if(typeof value==="object"){for(const nsAttr in value){if(value[nsAttr]!=null){element.setAttributeNS(attr,nsAttr,value[nsAttr])}}}else if(typeof value==="function"){const event=attr.indexOf("on")==0?attr.substr(2):attr;element.addEventListener(event,value)}else{element.setAttribute(attr,value)}}}for(const child of this.children){if(typeof child==="string"){element.appendChild(document.createTextNode(child))}else{element.appendChild(child.toElement())}}return element}toReactElement(React){if(arguments.length==0){React=require("react"+"")}const children=[];for(const child of this.children){if(child instanceof VElement){children.push(child.toReactElement(React))}else if(!(child instanceof VComment)){children.push(child)}}return typeof React==="function"?React(this.name,this.attrs,children):React.createElement(this.name,this.attrs,children)}get id(){return this.attrs.id}set id(id){this.attrs.id=id}get className(){return this.attrs["class"]}set className(className){this.attrs["class"]=className}addClasses(...names){if(this.attrs["class"]){const list=this.attrs["class"].split(" ");for(const name of names){if(list.indexOf(name)<0){list.push(name)}}this.attrs["class"]=list.join(" ")}else{this.attrs["class"]=names.join(" ")}return this}removeClasses(...names){if(this.attrs["class"]){const list=this.attrs["class"].split(" ");for(const name of names){const index=list.indexOf(name);if(list.indexOf(name)>=0){list.splice(index,1)}}this.attrs["class"]=list.join(" ")}return this}hasClasses(...names){if(this.attrs["class"]){const list=this.attrs["class"].split(" ");for(const name of names){if(list.indexOf(name)<0){return false}}return true}return names.length==0}style(name,val){const list=this.attrs["style"]?this.attrs["style"].split(";"):[];const style={};for(const item of list){const i=item.indexOf(":");if(i>=0){style[item.substring(0,i).trim()]=item.substring(i+1).trim()}}if(arguments.length==0){return style}else if(arguments.length==1){return style[name]}else{style[name]=val.toString();let res="";for(const key in style){res+=key+":"+style[key]+";"}this.attrs["style"]=res;return this}}}exports.VElement=VElement;class VComment{constructor(text){this.text=text}toString(){return this.text!=null?`\x3c!-- ${this.text} --\x3e`:"\x3c!-- --\x3e"}toElement(){return this.text!=null?document.createComment(this.text):document.createComment("")}}exports.VComment=VComment;const svgElementNames=["a","altGlyph","altGlyphDef","altGlyphItem","animate","animateColor","animateMotion","animateTransform","circle","clipPath","color-profile","cursor","defs","desc","discard","ellipse","feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence","filter","font","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignObject","g","glyph","glyphRef","hatch","hatchpath","hkern","image","line","linearGradient","marker","mask","mesh","meshgradient","meshpatch","meshrow","metadata","missing-glyph","mpath","path","pattern","polygon","polyline","radialGradient","rect","script","set","solidcolor","stop","style","svg","switch","symbol","text","textPath","title","tref","tspan","unknown","use","view","vkern"]},{}],16:[function(require,module,exports){switch(location.pathname){case"/":require("./mainHome");break;case"/svg-textures":require("./mainSvgTextures");break}},{"./mainHome":17,"./mainSvgTextures":18}],17:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const svg_textures_1=require("svg-textures");const apply=(selector,content)=>{document.querySelector(selector).appendChild(content.toElement())};apply(".hero .bg-svg",svg_textures_1.svgRectPattern({content:svg_textures_1.circle({radius:4,stroke:"rgba(0,0,0,.13)",fill:"transparent",strokeWidth:1})}));apply(".blue .bg-svg",svg_textures_1.svgRectPattern({content:svg_textures_1.path({path:"woven",stroke:"rgba(0,0,0,.13)",strokeWidth:1})}));apply(".green .bg-svg",svg_textures_1.svgRectPattern({size:30,content:svg_textures_1.path({size:30,path:"nylon",stroke:"rgba(0,0,0,.13)",fill:"transparent",strokeWidth:1,shapeRendering:"crispEdges"})}));apply(".yellow .bg-svg",svg_textures_1.svgRectPattern({content:svg_textures_1.path({path:"caps",stroke:"rgba(0,0,0,.13)",fill:"transparent",strokeWidth:1})}));apply(".purple .bg-svg",svg_textures_1.svgRectPattern({content:svg_textures_1.circle({radius:1,fill:"rgba(0,0,0,.25)",strokeWidth:0})}));apply(".pink .bg-svg",svg_textures_1.svgRectPattern({content:svg_textures_1.path({path:"squares",stroke:"rgba(0,0,0,.12)",fill:"transparent",strokeWidth:1})}));apply(".dark .bg-svg",svg_textures_1.svgRectPattern({content:svg_textures_1.path({path:"crosses",stroke:"rgba(255,255,255,.13)",strokeWidth:1})}))},{"svg-textures":3}],18:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});const svgtextures=require("svg-textures");const hljs=require("highlight.js/lib/highlight");hljs.registerLanguage("javascript",require("highlight.js/lib/languages/javascript"));hljs.initHighlightingOnLoad();window.hljs=hljs;for(const func in svgtextures){window[func]=svgtextures[func]}for(const example of document.querySelectorAll(".examples .content")){const codeEl=example.querySelector(".code");const errorEl=example.querySelector(".error");const previewEl=example.querySelector(".preview");console.log(codeEl);applySvg(codeEl,previewEl,errorEl);codeEl.addEventListener("input",()=>{applySvg(codeEl,previewEl,errorEl);codeEl.__hasChanged=true},false);codeEl.addEventListener("focusout",()=>{if(codeEl.__hasChanged){const code=example.querySelector("code");code.innerHTML=hljs.highlight("js",code.innerText).value;codeEl.__hasChanged=false}},false)}function applySvg(codeEl,previewEl,errorEl){const code=codeEl.innerText;if(code){try{const res=eval(code);previewEl.innerText="";previewEl.appendChild(res.toElement());errorEl.innerText=""}catch(e){errorEl.innerText=`Line ${e.lineNumber}: ${e.message}`}}else{previewEl.innerText="";errorEl.innerText=""}}},{"highlight.js/lib/highlight":1,"highlight.js/lib/languages/javascript":2,"svg-textures":3}]},{},[16]);