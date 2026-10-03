!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).JSZip=e()}}(function(){return function s(a,o,h){function u(r,e){if(!o[r]){if(!a[r]){var t="function"==typeof require&&require;if(!e&&t)return t(r,!0);if(l)return l(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var i=o[r]={exports:{}};a[r][0].call(i.exports,function(e){var t=a[r][1][e];return u(t||e)},i,i.exports,s,a,o,h)}return o[r].exports}for(var l="function"==typeof require&&require,e=0;e<h.length;e++)u(h[e]);return u}({1:[function(e,t,r){"use strict";var d=e("./utils"),c=e("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(e){for(var t,r,n,i,s,a,o,h=[],u=0,l=e.length,f=l,c="string"!==d.getTypeOf(e);u<e.length;)f=l-u,n=c?(t=e[u++],r=u<l?e[u++]:0,u<l?e[u++]:0):(t=e.charCodeAt(u++),r=u<l?e.charCodeAt(u++):0,u<l?e.charCodeAt(u++):0),i=t>>2,s=(3&t)<<4|r>>4,a=1<f?(15&r)<<2|n>>6:64,o=2<f?63&n:64,h.push(p.charAt(i)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(e){var t,r,n,i,s,a,o=0,h=0,u="data:";if(e.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(e=e.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(e.charAt(e.length-1)===p.charAt(64)&&f--,e.charAt(e.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=c.uint8array?new Uint8Array(0|f):new Array(0|f);o<e.length;)t=p.indexOf(e.charAt(o++))<<2|(i=p.indexOf(e.charAt(o++)))>>4,r=(15&i)<<4|(s=p.indexOf(e.charAt(o++)))>>2,n=(3&s)<<6|(a=p.indexOf(e.charAt(o++))),l[h++]=t,64!==s&&(l[h++]=r),64!==a&&(l[h++]=n);return l}},{"./support":30,"./utils":32}],2:[function(e,t,r){"use strict";var n=e("./external"),i=e("./stream/DataWorker"),s=e("./stream/Crc32Probe"),a=e("./stream/DataLengthProbe");function o(e,t,r,n,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=r,this.compression=n,this.compressedContent=i}o.prototype={getContentWorker:function(){var e=new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),t=this;return e.on("end",function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),e},getCompressedWorker:function(){return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(e,t,r){return e.pipe(new s).pipe(new a("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression",t)},t.exports=o},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,r){"use strict";var n=e("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(){return new n("STORE compression")},uncompressWorker:function(){return new n("STORE decompression")}},r.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,r){"use strict";var n=e("./utils");var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t){return void 0!==e&&e.length?"string"!==n.getTypeOf(e)?function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}(0|t,e,e.length,0):function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t.charCodeAt(a))];return-1^e}(0|t,e,e.length,0):0}},{"./utils":32}],5:[function(e,t,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(e,t,r){"use strict";var n=null;n="undefined"!=typeof Promise?Promise:e("lie"),t.exports={Promise:n}},{lie:37}],7:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,i=e("pako"),s=e("./utils"),a=e("./stream/GenericWorker"),o=n?"uint8array":"array";function h(e,t){a.call(this,"FlateWorker/"+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}r.magic="\b\0",s.inherits(h,a),h.prototype.processChunk=function(e){this.meta=e.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,e.data),!1)},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},h.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var t=this;this._pako.onData=function(e){t.push({data:e,meta:t.meta})}},r.compressWorker=function(e){return new h("Deflate",e)},r.uncompressWorker=function(){return new h("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,r){"use strict";function A(e,t){var r,n="";for(r=0;r<t;r++)n+=String.fromCharCode(255&e),e>>>=8;return n}function n(e,t,r,n,i,s){var a,o,h=e.file,u=e.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),c=I.transformTo("string",O.utf8encode(h.name)),d=h.comment,p=I.transformTo("string",s(d)),m=I.transformTo("string",O.utf8encode(d)),_=c.length!==h.name.length,g=m.length!==d.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};t&&!r||(x.crc32=e.crc32,x.compressedSize=e.compressedSize,x.uncompressedSize=e.uncompressedSize);var S=0;t&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===i?(C=798,z|=function(e,t){var r=e;return e||(r=t?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(e){return 63&(e||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+c,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\0",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\0\0\0\0"+A(z,4)+A(n,4)+f+b+p}}var I=e("../utils"),i=e("../stream/GenericWorker"),O=e("../utf8"),B=e("../crc32"),R=e("../signature");function s(e,t,r,n){i.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=r,this.encodeFileName=n,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(s,i),s.prototype.push=function(e){var t=e.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,i.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:r?(t+100*(r-n-1))/r:100}}))},s.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var r=n(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},s.prototype.closedSource=function(e){this.accumulate=!1;var t=this.streamFiles&&!e.file.dir,r=n(e,t,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),t)this.push({data:function(e){return R.DATA_DESCRIPTOR+A(e.crc32,4)+A(e.compressedSize,4)+A(e.uncompressedSize,4)}(e),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},s.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var r=this.bytesWritten-e,n=function(e,t,r,n,i){var s=I.transformTo("string",i(n));return R.CENTRAL_DIRECTORY_END+"\0\0\0\0"+A(e,2)+A(e,2)+A(t,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,e,this.zipComment,this.encodeFileName);this.push({data:n,meta:{percent:100}})},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},s.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on("error",function(e){t.error(e)}),this},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(e){var t=this._sources;if(!i.prototype.error.call(this,e))return!1;for(var r=0;r<t.length;r++)try{t[r].error(e)}catch(e){}return!0},s.prototype.lock=function(){i.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=s},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,r){"use strict";var u=e("../compressions"),n=e("./ZipFileWorker");r.generateWorker=function(e,a,t){var o=new n(a.streamFiles,t,a.platform,a.encodeFileName),h=0;try{e.forEach(function(e,t){h++;var r=function(e,t){var r=e||t,n=u[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(t.options.compression,a.compression),n=t.options.compressionOptions||a.compressionOptions||{},i=t.dir,s=t.date;t._compressWorker(r,n).withStreamInfo("file",{name:e,dir:i,date:s,comment:t.comment||"",unixPermissions:t.unixPermissions,dosPermissions:t.dosPermissions}).pipe(o)}),o.entriesCount=h}catch(e){o.error(e)}return o}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,r){"use strict";function n(){if(!(this instanceof n))return new n;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var e=new n;for(var t in this)"function"!=typeof this[t]&&(e[t]=this[t]);return e}}(n.prototype=e("./object")).loadAsync=e("./load"),n.support=e("./support"),n.defaults=e("./defaults"),n.version="3.10.1",n.loadAsync=function(e,t){return(new n).loadAsync(e,t)},n.external=e("./external"),t.exports=n},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,r){"use strict";var u=e("./utils"),i=e("./external"),n=e("./utf8"),s=e("./zipEntries"),a=e("./stream/Crc32Probe"),l=e("./nodejsUtils");function f(n){return new i.Promise(function(e,t){var r=n.decompressed.getContentWorker().pipe(new a);r.on("error",function(e){t(e)}).on("end",function(){r.streamInfo.crc32!==n.decompressed.crc32?t(new Error("Corrupted zip : CRC32 mismatch")):e()}).resume()})}t.exports=function(e,o){var h=this;return o=u.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),l.isNode&&l.isStream(e)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):u.prepareContent("the loaded zip file",e,!0,o.optimizedBinaryString,o.base64).then(function(e){var t=new s(o);return t.load(e),t}).then(function(e){var t=[i.Promise.resolve(e)],r=e.files;if(o.checkCRC32)for(var n=0;n<r.length;n++)t.push(f(r[n]));return i.Promise.all(t)}).then(function(e){for(var t=e.shift(),r=t.files,n=0;n<r.length;n++){var i=r[n],s=i.fileNameStr,a=u.resolve(i.fileNameStr);h.file(a,i.decompressed,{binary:!0,optimizedBinaryString:!0,date:i.date,dir:i.dir,comment:i.fileCommentStr.length?i.fileCommentStr:null,unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions,createFolders:o.createFolders}),i.dir||(h.file(a).unsafeOriginalName=s)}return t.zipComment.length&&(h.comment=t.zipComment),h})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../stream/GenericWorker");function s(e,t){i.call(this,"Nodejs stream input adapter for "+e),this._upstreamEnded=!1,this._bindStream(t)}n.inherits(s,i),s.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on("data",function(e){t.push({data:e,meta:{percent:0}})}).on("error",function(e){t.isPaused?this.generatedError=e:t.error(e)}).on("end",function(){t.isPaused?t._upstreamEnded=!0:t.end()})},s.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,r){"use strict";var i=e("readable-stream").Readable;function n(e,t,r){i.call(this,t),this._helper=e;var n=this;e.on("data",function(e,t){n.push(e)||n._helper.pause(),r&&r(t)}).on("error",function(e){n.emit("error",e)}).on("end",function(){n.push(null)})}e("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},t.exports=n},{"../utils":32,"readable-stream":16}],14:[function(e,t,r){"use strict";t.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if("number"==typeof e)throw new Error('The "data" argument must not be a number');return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&"function"==typeof e.on&&"function"==typeof e.pause&&"function"==typeof e.resume}}},{}],15:[function(e,t,r){"use strict";function s(e,t,r){var n,i=u.getTypeOf(t),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=g(e)),s.createFolders&&(n=_(e))&&b.call(this,n,!0);var a="string"===i&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(t instanceof c&&0===t.uncompressedSize||s.dir||!t||0===t.length)&&(s.base64=!1,s.binary=!0,t="",s.compression="STORE",i="string");var o=null;o=t instanceof c||t instanceof l?t:p.isNode&&p.isStream(t)?new m(e,t):u.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var h=new d(e,o,s);this.files[e]=h}var i=e("./utf8"),u=e("./utils"),l=e("./stream/GenericWorker"),a=e("./stream/StreamHelper"),f=e("./defaults"),c=e("./compressedObject"),d=e("./zipObject"),o=e("./generate"),p=e("./nodejsUtils"),m=e("./nodejs/NodejsStreamInputAdapter"),_=function(e){"/"===e.slice(-1)&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf("/");return 0<t?e.substring(0,t):""},g=function(e){return"/"!==e.slice(-1)&&(e+="/"),e},b=function(e,t){return t=void 0!==t?t:f.createFolders,e=g(e),this.files[e]||s.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function h(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var n={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(e){var t,r,n;for(t in this.files)n=this.files[t],(r=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(r,n)},filter:function(r){var n=[];return this.forEach(function(e,t){r(e,t)&&n.push(t)}),n},file:function(e,t,r){if(1!==arguments.length)return e=this.root+e,s.call(this,e,t,r),this;if(h(e)){var n=e;return this.filter(function(e,t){return!t.dir&&n.test(e)})}var i=this.files[this.root+e];return i&&!i.dir?i:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(e,t){return t.dir&&r.test(e)});var e=this.root+r,t=b.call(this,e),n=this.clone();return n.root=t.name,n},remove:function(r){r=this.root+r;var e=this.files[r];if(e||("/"!==r.slice(-1)&&(r+="/"),e=this.files[r]),e&&!e.dir)delete this.files[r];else for(var t=this.filter(function(e,t){return t.name.slice(0,r.length)===r}),n=0;n<t.length;n++)delete this.files[t[n].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(e){var t,r={};try{if((r=u.extend(e||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var n=r.comment||this.comment||"";t=o.generateWorker(this,r,n)}catch(e){(t=new l("error")).error(e)}return new a(t,r.type||"string",r.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e=e||{}).type||(e.type="nodebuffer"),this.generateInternalStream(e).toNodejsStream(t)}};t.exports=n},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,r){"use strict";t.exports=e("stream")},{stream:void 0}],17:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===t&&this.data[s+1]===r&&this.data[s+2]===n&&this.data[s+3]===i)return s-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.readData(4);return t===s[0]&&r===s[1]&&n===s[2]&&i===s[3]},i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,r){"use strict";var n=e("../utils");function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(){},readInt:function(e){var t,r=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)r=(r<<8)+this.byteAt(t);return this.index+=e,r},readString:function(e){return n.transformTo("string",this.readData(e))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,r){"use strict";var n=e("./Uint8ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,r){"use strict";var n=e("./ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return new Uint8Array(0);var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../support"),s=e("./ArrayReader"),a=e("./StringReader"),o=e("./NodeBufferReader"),h=e("./Uint8ArrayReader");t.exports=function(e){var t=n.getTypeOf(e);return n.checkSupport(t),"string"!==t||i.uint8array?"nodebuffer"===t?new o(e):i.uint8array?new h(n.transformTo("uint8array",e)):new s(n.transformTo("array",e)):new a(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../utils");function s(e){n.call(this,"ConvertWorker to "+e),this.destType=e}i.inherits(s,n),s.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../crc32");function s(){n.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(s,n),s.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataLengthProbe for "+e),this.propName=e,this.withStreamInfo(e,0)}n.inherits(s,i),s.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataWorker");var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=n.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}n.inherits(s,i),s.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,n.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(n.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":e=this.data.substring(this.index,t);break;case"uint8array":e=this.data.subarray(this.index,t);break;case"array":case"nodebuffer":e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,r){"use strict";function n(e){this.name=e||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}n.prototype={push:function(e){this.emit("data",e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(e){this.emit("error",e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit("error",e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var r=0;r<this._listeners[e].length;r++)this._listeners[e][r].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.end()}),e.on("error",function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e="Worker "+this.name;return this.previous?this.previous+" -> "+e:e}},t.exports=n},{}],29:[function(e,t,r){"use strict";var h=e("../utils"),i=e("./ConvertWorker"),s=e("./GenericWorker"),u=e("../base64"),n=e("../support"),a=e("../external"),o=null;if(n.nodestream)try{o=e("../nodejs/NodejsStreamOutputAdapter")}catch(e){}function l(e,o){return new a.Promise(function(t,r){var n=[],i=e._internalType,s=e._outputType,a=e._mimeType;e.on("data",function(e,t){n.push(e),o&&o(t)}).on("error",function(e){n=[],r(e)}).on("end",function(){try{var e=function(e,t,r){switch(e){case"blob":return h.newBlob(h.transformTo("arraybuffer",t),r);case"base64":return u.encode(t);default:return h.transformTo(e,t)}}(s,function(e,t){var r,n=0,i=null,s=0;for(r=0;r<t.length;r++)s+=t[r].length;switch(e){case"string":return t.join("");case"array":return Array.prototype.concat.apply([],t);case"uint8array":for(i=new Uint8Array(s),r=0;r<t.length;r++)i.set(t[r],n),n+=t[r].length;return i;case"nodebuffer":return Buffer.concat(t);default:throw new Error("concat : unsupported type '"+e+"'")}}(i,n),a);t(e)}catch(e){r(e)}n=[]}).resume()})}function f(e,t,r){var n=t;switch(t){case"blob":case"arraybuffer":n="uint8array";break;case"base64":n="string"}try{this._internalType=n,this._outputType=t,this._mimeType=r,h.checkSupport(n),this._worker=e.pipe(new i(n)),e.lock()}catch(e){this._worker=new s("error"),this._worker.error(e)}}f.prototype={accumulate:function(e){return l(this,e)},on:function(e,t){var r=this;return"data"===e?this._worker.on(e,function(e){t.call(r,e.data,e.meta)}):this._worker.on(e,function(){h.delay(t,arguments,r)}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},e)}},t.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var n=new ArrayBuffer(0);try{r.blob=0===new Blob([n],{type:"application/zip"}).size}catch(e){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(n),r.blob=0===i.getBlob("application/zip").size}catch(e){r.blob=!1}}}try{r.nodestream=!!e("readable-stream").Readable}catch(e){r.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,s){"use strict";for(var o=e("./utils"),h=e("./support"),r=e("./nodejsUtils"),n=e("./stream/GenericWorker"),u=new Array(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;u[254]=u[254]=1;function a(){n.call(this,"utf-8 decode"),this.leftOver=null}function l(){n.call(this,"utf-8 encode")}s.utf8encode=function(e){return h.nodebuffer?r.newBufferFrom(e,"utf-8"):function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=h.uint8array?new Uint8Array(o):new Array(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t}(e)},s.utf8decode=function(e){return h.nodebuffer?o.transformTo("nodebuffer",e).toString("utf-8"):function(e){var t,r,n,i,s=e.length,a=new Array(2*s);for(t=r=0;t<s;)if((n=e[t++])<128)a[r++]=n;else if(4<(i=u[n]))a[r++]=65533,t+=i-1;else{for(n&=2===i?31:3===i?15:7;1<i&&t<s;)n=n<<6|63&e[t++],i--;1<i?a[r++]=65533:n<65536?a[r++]=n:(n-=65536,a[r++]=55296|n>>10&1023,a[r++]=56320|1023&n)}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(e=o.transformTo(h.uint8array?"uint8array":"array",e))},o.inherits(a,n),a.prototype.processChunk=function(e){var t=o.transformTo(h.uint8array?"uint8array":"array",e.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=t;(t=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),t.set(r,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var n=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}(t),i=t;n!==t.length&&(h.uint8array?(i=t.subarray(0,n),this.leftOver=t.subarray(n,t.length)):(i=t.slice(0,n),this.leftOver=t.slice(n,t.length))),this.push({data:s.utf8decode(i),meta:e.meta})},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=a,o.inherits(l,n),l.prototype.processChunk=function(e){this.push({data:s.utf8encode(e.data),meta:e.meta})},s.Utf8EncodeWorker=l},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,a){"use strict";var o=e("./support"),h=e("./base64"),r=e("./nodejsUtils"),u=e("./external");function n(e){return e}function l(e,t){for(var r=0;r<e.length;++r)t[r]=255&e.charCodeAt(r);return t}e("setimmediate"),a.newBlob=function(t,r){a.checkSupport("blob");try{return new Blob([t],{type:r})}catch(e){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return n.append(t),n.getBlob(r)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};var i={stringifyByChunk:function(e,t,r){var n=[],i=0,s=e.length;if(s<=r)return String.fromCharCode.apply(null,e);for(;i<s;)"array"===t||"nodebuffer"===t?n.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+r,s)))):n.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+r,s)))),i+=r;return n.join("")},stringifyByChar:function(e){for(var t="",r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return t},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(e){return!1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(e){return!1}}()}};function s(e){var t=65536,r=a.getTypeOf(e),n=!0;if("uint8array"===r?n=i.applyCanBeUsed.uint8array:"nodebuffer"===r&&(n=i.applyCanBeUsed.nodebuffer),n)for(;1<t;)try{return i.stringifyByChunk(e,r,t)}catch(e){t=Math.floor(t/2)}return i.stringifyByChar(e)}function f(e,t){for(var r=0;r<e.length;r++)t[r]=e[r];return t}a.applyFromCharCode=s;var c={};c.string={string:n,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return c.string.uint8array(e).buffer},uint8array:function(e){return l(e,new Uint8Array(e.length))},nodebuffer:function(e){return l(e,r.allocBuffer(e.length))}},c.array={string:s,array:n,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(e)}},c.arraybuffer={string:function(e){return s(new Uint8Array(e))},array:function(e){return f(new Uint8Array(e),new Array(e.byteLength))},arraybuffer:n,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(new Uint8Array(e))}},c.uint8array={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:n,nodebuffer:function(e){return r.newBufferFrom(e)}},c.nodebuffer={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return c.nodebuffer.uint8array(e).buffer},uint8array:function(e){return f(e,new Uint8Array(e.length))},nodebuffer:n},a.transformTo=function(e,t){if(t=t||"",!e)return t;a.checkSupport(e);var r=a.getTypeOf(t);return c[r][e](t)},a.resolve=function(e){for(var t=e.split("/"),r=[],n=0;n<t.length;n++){var i=t[n];"."===i||""===i&&0!==n&&n!==t.length-1||(".."===i?r.pop():r.push(i))}return r.join("/")},a.getTypeOf=function(e){return"string"==typeof e?"string":"[object Array]"===Object.prototype.toString.call(e)?"array":o.nodebuffer&&r.isBuffer(e)?"nodebuffer":o.uint8array&&e instanceof Uint8Array?"uint8array":o.arraybuffer&&e instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(e){if(!o[e.toLowerCase()])throw new Error(e+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(e){var t,r,n="";for(r=0;r<(e||"").length;r++)n+="\\x"+((t=e.charCodeAt(r))<16?"0":"")+t.toString(16).toUpperCase();return n},a.delay=function(e,t,r){setImmediate(function(){e.apply(r||null,t||[])})},a.inherits=function(e,t){function r(){}r.prototype=t.prototype,e.prototype=new r},a.extend=function(){var e,t,r={};for(e=0;e<arguments.length;e++)for(t in arguments[e])Object.prototype.hasOwnProperty.call(arguments[e],t)&&void 0===r[t]&&(r[t]=arguments[e][t]);return r},a.prepareContent=function(r,e,n,i,s){return u.Promise.resolve(e).then(function(n){return o.blob&&(n instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(n)))&&"undefined"!=typeof FileReader?new u.Promise(function(t,r){var e=new FileReader;e.onload=function(e){t(e.target.result)},e.onerror=function(e){r(e.target.error)},e.readAsArrayBuffer(n)}):n}).then(function(e){var t=a.getTypeOf(e);return t?("arraybuffer"===t?e=a.transformTo("uint8array",e):"string"===t&&(s?e=h.decode(e):n&&!0!==i&&(e=function(e){return l(e,o.uint8array?new Uint8Array(e.length):new Array(e.length))}(e))),e):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),i=e("./utils"),s=e("./signature"),a=e("./zipEntry"),o=e("./support");function h(e){this.files=[],this.loadOptions=e}h.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(t)+", expected "+i.pretty(e)+")")}},isSignature:function(e,t){var r=this.reader.index;this.reader.setIndex(e);var n=this.reader.readString(4)===t;return this.reader.setIndex(r),n},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=o.uint8array?"uint8array":"array",r=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,r,n=this.zip64EndOfCentralSize-44;0<n;)e=this.reader.readInt(2),t=this.reader.readInt(4),r=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(e<0)throw!this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html"):new Error("Corrupted zip: can't find end of central directory");this.reader.setIndex(e);var t=e;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(e),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var n=t-r;if(0<n)this.isSignature(t,s.CENTRAL_FILE_HEADER)||(this.reader.zero=n);else if(n<0)throw new Error("Corrupted zip: missing "+Math.abs(n)+" bytes.")},prepareReader:function(e){this.reader=n(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=h},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),s=e("./utils"),i=e("./compressedObject"),a=e("./crc32"),o=e("./utf8"),h=e("./compressions"),u=e("./support");function l(e,t){this.options=e,this.loadOptions=t}l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,r;if(e.skip(22),this.fileNameLength=e.readInt(2),r=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(t=function(e){for(var t in h)if(Object.prototype.hasOwnProperty.call(h,t)&&h[t].magic===e)return h[t];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new i(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==e&&(this.dosPermissions=63&this.externalFileAttributes),3==e&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var e=n(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(e){var t,r,n,i=e.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});e.index+4<i;)t=e.readInt(2),r=e.readInt(2),n=e.readData(r),this.extraFields[t]={id:t,length:r,value:n};e.setIndex(i)},handleUTF8:function(){var e=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(null!==t)this.fileNameStr=t;else{var r=s.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var n=this.findExtraFieldUnicodeComment();if(null!==n)this.fileCommentStr=n;else{var i=s.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(i)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileName)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileComment)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null}},t.exports=l},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,r){"use strict";function n(e,t,r){this.name=e,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=t,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=e("./stream/StreamHelper"),i=e("./stream/DataWorker"),a=e("./utf8"),o=e("./compressedObject"),h=e("./stream/GenericWorker");n.prototype={internalStream:function(e){var t=null,r="string";try{if(!e)throw new Error("No output type specified.");var n="string"===(r=e.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),t=this._decompressWorker();var i=!this._dataBinary;i&&!n&&(t=t.pipe(new a.Utf8EncodeWorker)),!i&&n&&(t=t.pipe(new a.Utf8DecodeWorker))}catch(e){(t=new h("error")).error(e)}return new s(t,r,"")},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||"nodebuffer").toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof o&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,e,t)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new i(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)n.prototype[u[f]]=l;t.exports=n},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,l,t){(function(t){"use strict";var r,n,e=t.MutationObserver||t.WebKitMutationObserver;if(e){var i=0,s=new e(u),a=t.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=i=++i%2}}else if(t.setImmediate||void 0===t.MessageChannel)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){u(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(u,0)};else{var o=new t.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0)}}var h=[];function u(){var e,t;n=!0;for(var r=h.length;r;){for(t=h,h=[],e=-1;++e<r;)t[e]();r=h.length}n=!1}l.exports=function(e){1!==h.push(e)||n||r()}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(e,t,r){"use strict";var i=e("immediate");function u(){}var l={},s=["REJECTED"],a=["FULFILLED"],n=["PENDING"];function o(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=n,this.queue=[],this.outcome=void 0,e!==u&&d(this,e)}function h(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function f(t,r,n){i(function(){var e;try{e=r(n)}catch(e){return l.reject(t,e)}e===t?l.reject(t,new TypeError("Cannot resolve promise with itself")):l.resolve(t,e)})}function c(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function d(t,e){var r=!1;function n(e){r||(r=!0,l.reject(t,e))}function i(e){r||(r=!0,l.resolve(t,e))}var s=p(function(){e(i,n)});"error"===s.status&&n(s.value)}function p(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}(t.exports=o).prototype.finally=function(t){if("function"!=typeof t)return this;var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},o.prototype.catch=function(e){return this.then(null,e)},o.prototype.then=function(e,t){if("function"!=typeof e&&this.state===a||"function"!=typeof t&&this.state===s)return this;var r=new this.constructor(u);this.state!==n?f(r,this.state===a?e:t,this.outcome):this.queue.push(new h(r,e,t));return r},h.prototype.callFulfilled=function(e){l.resolve(this.promise,e)},h.prototype.otherCallFulfilled=function(e){f(this.promise,this.onFulfilled,e)},h.prototype.callRejected=function(e){l.reject(this.promise,e)},h.prototype.otherCallRejected=function(e){f(this.promise,this.onRejected,e)},l.resolve=function(e,t){var r=p(c,t);if("error"===r.status)return l.reject(e,r.value);var n=r.value;if(n)d(e,n);else{e.state=a,e.outcome=t;for(var i=-1,s=e.queue.length;++i<s;)e.queue[i].callFulfilled(t)}return e},l.reject=function(e,t){e.state=s,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},o.resolve=function(e){if(e instanceof this)return e;return l.resolve(new this(u),e)},o.reject=function(e){var t=new this(u);return l.reject(t,e)},o.all=function(e){var r=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);var s=new Array(n),a=0,t=-1,o=new this(u);for(;++t<n;)h(e[t],t);return o;function h(e,t){r.resolve(e).then(function(e){s[t]=e,++a!==n||i||(i=!0,l.resolve(o,s))},function(e){i||(i=!0,l.reject(o,e))})}},o.race=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var r=e.length,n=!1;if(!r)return this.resolve([]);var i=-1,s=new this(u);for(;++i<r;)a=e[i],t.resolve(a).then(function(e){n||(n=!0,l.resolve(s,e))},function(e){n||(n=!0,l.reject(s,e))});var a;return s}},{immediate:36}],38:[function(e,t,r){"use strict";var n={};(0,e("./lib/utils/common").assign)(n,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),t.exports=n},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,r){"use strict";var a=e("./zlib/deflate"),o=e("./utils/common"),h=e("./utils/strings"),i=e("./zlib/messages"),s=e("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,c=0,d=8;function p(e){if(!(this instanceof p))return new p(e);this.options=o.assign({level:f,method:d,chunkSize:16384,windowBits:15,memLevel:8,strategy:c,to:""},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(r!==l)throw new Error(i[r]);if(t.header&&a.deflateSetHeader(this.strm,t.header),t.dictionary){var n;if(n="string"==typeof t.dictionary?h.string2buf(t.dictionary):"[object ArrayBuffer]"===u.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(r=a.deflateSetDictionary(this.strm,n))!==l)throw new Error(i[r]);this._dict_set=!0}}function n(e,t){var r=new p(t);if(r.push(e,!0),r.err)throw r.msg||i[r.err];return r.result}p.prototype.push=function(e,t){var r,n,i=this.strm,s=this.options.chunkSize;if(this.ended)return!1;n=t===~~t?t:!0===t?4:0,"string"==typeof e?i.input=h.string2buf(e):"[object ArrayBuffer]"===u.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;do{if(0===i.avail_out&&(i.output=new o.Buf8(s),i.next_out=0,i.avail_out=s),1!==(r=a.deflate(i,n))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==i.avail_out&&(0!==i.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(i.output,i.next_out))):this.onData(o.shrinkBuf(i.output,i.next_out)))}while((0<i.avail_in||0===i.avail_out)&&1!==r);return 4===n?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==n||(this.onEnd(l),!(i.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Deflate=p,r.deflate=n,r.deflateRaw=function(e,t){return(t=t||{}).raw=!0,n(e,t)},r.gzip=function(e,t){return(t=t||{}).gzip=!0,n(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,r){"use strict";var c=e("./zlib/inflate"),d=e("./utils/common"),p=e("./utils/strings"),m=e("./zlib/constants"),n=e("./zlib/messages"),i=e("./zlib/zstream"),s=e("./zlib/gzheader"),_=Object.prototype.toString;function a(e){if(!(this instanceof a))return new a(e);this.options=d.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var r=c.inflateInit2(this.strm,t.windowBits);if(r!==m.Z_OK)throw new Error(n[r]);this.header=new s,c.inflateGetHeader(this.strm,this.header)}function o(e,t){var r=new a(t);if(r.push(e,!0),r.err)throw r.msg||n[r.err];return r.result}a.prototype.push=function(e,t){var r,n,i,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof e?h.input=p.binstring2buf(e):"[object ArrayBuffer]"===_.call(e)?h.input=new Uint8Array(e):h.input=e,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new d.Buf8(u),h.next_out=0,h.avail_out=u),(r=c.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=c.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||n!==m.Z_FINISH&&n!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(i=p.utf8border(h.output,h.next_out),s=h.next_out-i,a=p.buf2string(h.output,i),h.next_out=s,h.avail_out=u-s,s&&d.arraySet(h.output,h.output,i,s,0),this.onData(a)):this.onData(d.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0)}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(n=m.Z_FINISH),n===m.Z_FINISH?(r=c.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):n!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(e){this.chunks.push(e)},a.prototype.onEnd=function(e){e===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=d.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Inflate=a,r.inflate=o,r.inflateRaw=function(e,t){return(t=t||{}).raw=!0,o(e,t)},r.ungzip=o},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)r.hasOwnProperty(n)&&(e[n]=r[n])}}return e},r.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){var t,r,n,i,s,a;for(t=n=0,r=e.length;t<r;t++)n+=e[t].length;for(a=new Uint8Array(n),t=i=0,r=e.length;t<r;t++)s=e[t],a.set(s,i),i+=s.length;return a}},s={arraySet:function(e,t,r,n,i){for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){return[].concat.apply([],e)}};r.setTyped=function(e){e?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,i)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(n)},{}],42:[function(e,t,r){"use strict";var h=e("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){s=!1}for(var u=new h.Buf8(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function l(e,t){if(t<65537&&(e.subarray&&s||!e.subarray&&i))return String.fromCharCode.apply(null,h.shrinkBuf(e,t));for(var r="",n=0;n<t;n++)r+=String.fromCharCode(e[n]);return r}u[254]=u[254]=1,r.string2buf=function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=new h.Buf8(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t},r.buf2binstring=function(e){return l(e,e.length)},r.binstring2buf=function(e){for(var t=new h.Buf8(e.length),r=0,n=t.length;r<n;r++)t[r]=e.charCodeAt(r);return t},r.buf2string=function(e,t){var r,n,i,s,a=t||e.length,o=new Array(2*a);for(r=n=0;r<a;)if((i=e[r++])<128)o[n++]=i;else if(4<(s=u[i]))o[n++]=65533,r+=s-1;else{for(i&=2===s?31:3===s?15:7;1<s&&r<a;)i=i<<6|63&e[r++],s--;1<s?o[n++]=65533:i<65536?o[n++]=i:(i-=65536,o[n++]=55296|i>>10&1023,o[n++]=56320|1023&i)}return l(o,n)},r.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}},{"./common":41}],43:[function(e,t,r){"use strict";t.exports=function(e,t,r,n){for(var i=65535&e|0,s=e>>>16&65535|0,a=0;0!==r;){for(r-=a=2e3<r?2e3:r;s=s+(i=i+t[n++]|0)|0,--a;);i%=65521,s%=65521}return i|s<<16|0}},{}],44:[function(e,t,r){"use strict";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,r){"use strict";var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}},{}],46:[function(e,t,r){"use strict";var h,c=e("../utils/common"),u=e("./trees"),d=e("./adler32"),p=e("./crc32"),n=e("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,i=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;function R(e,t){return e.msg=n[t],t}function T(e){return(e<<1)-(4<e?9:0)}function D(e){for(var t=e.length;0<=--t;)e[t]=0}function F(e){var t=e.state,r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(c.arraySet(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0))}function N(e,t){u._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,F(e.strm)}function U(e,t){e.pending_buf[e.pending++]=t}function P(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function L(e,t){var r,n,i=e.max_chain_length,s=e.strstart,a=e.prev_length,o=e.nice_match,h=e.strstart>e.w_size-z?e.strstart-(e.w_size-z):0,u=e.window,l=e.w_mask,f=e.prev,c=e.strstart+S,d=u[s+a-1],p=u[s+a];e.prev_length>=e.good_match&&(i>>=2),o>e.lookahead&&(o=e.lookahead);do{if(u[(r=t)+a]===p&&u[r+a-1]===d&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<c);if(n=S-(c-s),s=c-S,a<n){if(e.match_start=t,o<=(a=n))break;d=u[s+a-1],p=u[s+a]}}}while((t=f[t&l])>h&&0!=--i);return a<=e.lookahead?a:e.lookahead}function j(e){var t,r,n,i,s,a,o,h,u,l,f=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=f+(f-z)){for(c.arraySet(e.window,e.window,f,f,0),e.match_start-=f,e.strstart-=f,e.block_start-=f,t=r=e.hash_size;n=e.head[--t],e.head[t]=f<=n?n-f:0,--r;);for(t=r=f;n=e.prev[--t],e.prev[t]=f<=n?n-f:0,--r;);i+=f}if(0===e.strm.avail_in)break;if(a=e.strm,o=e.window,h=e.strstart+e.lookahead,u=i,l=void 0,l=a.avail_in,u<l&&(l=u),r=0===l?0:(a.avail_in-=l,c.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=d(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),e.lookahead+=r,e.lookahead+e.insert>=x)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+x-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<x)););}while(e.lookahead<z&&0!==e.strm.avail_in)}function Z(e,t){for(var r,n;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r)),e.match_length>=x)if(n=u._tr_tally(e,e.strstart-e.match_start,e.match_length-x),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=x){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,0!=--e.match_length;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function W(e,t){for(var r,n,i;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=x-1,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r),e.match_length<=5&&(1===e.strategy||e.match_length===x&&4096<e.strstart-e.match_start)&&(e.match_length=x-1)),e.prev_length>=x&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-x,n=u._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-x),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!=--e.prev_length;);if(e.match_available=0,e.match_length=x-1,e.strstart++,n&&(N(e,!1),0===e.strm.avail_out))return A}else if(e.match_available){if((n=u._tr_tally(e,0,e.window[e.strstart-1]))&&N(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return A}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=u._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function M(e,t,r,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=n,this.func=i}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new c.Buf16(2*w),this.dyn_dtree=new c.Buf16(2*(2*a+1)),this.bl_tree=new c.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new c.Buf16(k+1),this.heap=new c.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new c.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=i,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?C:E,e.adler=2===t.wrap?0:1,t.last_flush=l,u._tr_init(t),m):R(e,_)}function K(e){var t=G(e);return t===m&&function(e){e.window_size=2*e.w_size,D(e.head),e.max_lazy_match=h[e.level].max_lazy,e.good_match=h[e.level].good_length,e.nice_match=h[e.level].nice_length,e.max_chain_length=h[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=x-1,e.match_available=0,e.ins_h=0}(e.state),t}function Y(e,t,r,n,i,s){if(!e)return _;var a=1;if(t===g&&(t=6),n<0?(a=0,n=-n):15<n&&(a=2,n-=16),i<1||y<i||r!==v||n<8||15<n||t<0||9<t||s<0||b<s)return R(e,_);8===n&&(n=9);var o=new H;return(e.state=o).strm=e,o.wrap=a,o.gzhead=null,o.w_bits=n,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=i+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new c.Buf8(2*o.w_size),o.head=new c.Buf16(o.hash_size),o.prev=new c.Buf16(o.w_size),o.lit_bufsize=1<<i+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new c.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=r,K(e)}h=[new M(0,0,0,0,function(e,t){var r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(j(e),0===e.lookahead&&t===l)return A;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+r;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,N(e,!1),0===e.strm.avail_out))return A;if(e.strstart-e.block_start>=e.w_size-z&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):(e.strstart>e.block_start&&(N(e,!1),e.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(e,t){return Y(e,t,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?_:(e.state.gzhead=t,m):_},r.deflate=function(e,t){var r,n,i,s;if(!e||!e.state||5<t||t<0)return e?R(e,_):_;if(n=e.state,!e.output||!e.input&&0!==e.avail_in||666===n.status&&t!==f)return R(e,0===e.avail_out?-5:_);if(n.strm=e,r=n.last_flush,n.last_flush=t,n.status===C)if(2===n.wrap)e.adler=0,U(n,31),U(n,139),U(n,8),n.gzhead?(U(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),U(n,255&n.gzhead.time),U(n,n.gzhead.time>>8&255),U(n,n.gzhead.time>>16&255),U(n,n.gzhead.time>>24&255),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(U(n,255&n.gzhead.extra.length),U(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=p(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(U(n,0),U(n,0),U(n,0),U(n,0),U(n,0),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,3),n.status=E);else{var a=v+(n.w_bits-8<<4)<<8;a|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(a|=32),a+=31-a%31,n.status=E,P(n,a),0!==n.strstart&&(P(n,e.adler>>>16),P(n,65535&e.adler)),e.adler=1}if(69===n.status)if(n.gzhead.extra){for(i=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending!==n.pending_buf_size));)U(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&F(e),n.pending+2<=n.pending_buf_size&&(U(n,255&e.adler),U(n,e.adler>>8&255),e.adler=0,n.status=E)):n.status=E),0!==n.pending){if(F(e),0===e.avail_out)return n.last_flush=-1,m}else if(0===e.avail_in&&T(t)<=T(r)&&t!==f)return R(e,-5);if(666===n.status&&0!==e.avail_in)return R(e,-5);if(0!==e.avail_in||0!==n.lookahead||t!==l&&666!==n.status){var o=2===n.strategy?function(e,t){for(var r;;){if(0===e.lookahead&&(j(e),0===e.lookahead)){if(t===l)return A;break}if(e.match_length=0,r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):3===n.strategy?function(e,t){for(var r,n,i,s,a=e.window;;){if(e.lookahead<=S){if(j(e),e.lookahead<=S&&t===l)return A;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=x&&0<e.strstart&&(n=a[i=e.strstart-1])===a[++i]&&n===a[++i]&&n===a[++i]){s=e.strstart+S;do{}while(n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&i<s);e.match_length=S-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=x?(r=u._tr_tally(e,1,e.match_length-x),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):h[n.level].func(n,t);if(o!==O&&o!==B||(n.status=666),o===A||o===O)return 0===e.avail_out&&(n.last_flush=-1),m;if(o===I&&(1===t?u._tr_align(n):5!==t&&(u._tr_stored_block(n,0,0,!1),3===t&&(D(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),F(e),0===e.avail_out))return n.last_flush=-1,m}return t!==f?m:n.wrap<=0?1:(2===n.wrap?(U(n,255&e.adler),U(n,e.adler>>8&255),U(n,e.adler>>16&255),U(n,e.adler>>24&255),U(n,255&e.total_in),U(n,e.total_in>>8&255),U(n,e.total_in>>16&255),U(n,e.total_in>>24&255)):(P(n,e.adler>>>16),P(n,65535&e.adler)),F(e),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?m:1)},r.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==C&&69!==t&&73!==t&&91!==t&&103!==t&&t!==E&&666!==t?R(e,_):(e.state=null,t===E?R(e,-3):m):_},r.deflateSetDictionary=function(e,t){var r,n,i,s,a,o,h,u,l=t.length;if(!e||!e.state)return _;if(2===(s=(r=e.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(e.adler=d(e.adler,t,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new c.Buf8(r.w_size),c.arraySet(u,t,l-r.w_size,r.w_size,0),t=u,l=r.w_size),a=e.avail_in,o=e.next_in,h=e.input,e.avail_in=l,e.next_in=0,e.input=t,j(r);r.lookahead>=x;){for(n=r.strstart,i=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[n+x-1])&r.hash_mask,r.prev[n&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=n,n++,--i;);r.strstart=n,r.lookahead=x-1,j(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,e.next_in=o,e.input=h,e.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,r){"use strict";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,t,r){"use strict";t.exports=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C;r=e.state,n=e.next_in,z=e.input,i=n+(e.avail_in-5),s=e.next_out,C=e.output,a=s-(t-e.avail_out),o=s+(e.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,c=r.window,d=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;e:do{p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=m[d&g];t:for(;;){if(d>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else{if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(d&(1<<y)-1)];continue t}if(32&y){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}w=65535&v,(y&=15)&&(p<y&&(d+=z[n++]<<p,p+=8),w+=d&(1<<y)-1,d>>>=y,p-=y),p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=_[d&b];r:for(;;){if(d>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(d&(1<<y)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&v,p<(y&=15)&&(d+=z[n++]<<p,(p+=8)<y&&(d+=z[n++]<<p,p+=8)),h<(k+=d&(1<<y)-1)){e.msg="invalid distance too far back",r.mode=30;break e}if(d>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=c,(x=0)===f){if(x+=u-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}}else if(f<y){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=c[x++],--y;);if(x=0,f<w){for(w-=y=f;C[s++]=c[x++],--y;);x=s-k,S=C}}}else if(x+=f-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}for(;2<w;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],1<w&&(C[s++]=S[x++]))}else{for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],1<w&&(C[s++]=C[x++]))}break}}break}}while(n<i&&s<o);n-=w=p>>3,d&=(1<<(p-=w<<3))-1,e.next_in=n,e.next_out=s,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=s<o?o-s+257:257-(s-o),r.hold=d,r.bits=p}},{}],49:[function(e,t,r){"use strict";var I=e("../utils/common"),O=e("./adler32"),B=e("./crc32"),R=e("./inffast"),T=e("./inftrees"),D=1,F=2,N=0,U=-2,P=1,n=852,i=592;function L(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function a(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=P,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new I.Buf32(n),t.distcode=t.distdyn=new I.Buf32(i),t.sane=1,t.back=-1,N):U}function o(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,a(e)):U}function h(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,o(e))):U}function u(e,t){var r,n;return e?(n=new s,(e.state=n).window=null,(r=h(e,t))!==N&&(e.state=null),r):U}var l,f,c=!0;function j(e){if(c){var t;for(l=new I.Buf32(512),f=new I.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(T(D,e.lens,0,288,l,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;T(F,e.lens,0,32,f,0,e.work,{bits:5}),c=!1}e.lencode=l,e.lenbits=9,e.distcode=f,e.distbits=5}function Z(e,t,r,n){var i,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),n>=s.wsize?(I.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(n<(i=s.wsize-s.wnext)&&(i=n),I.arraySet(s.window,t,r-n,i,s.wnext),(n-=i)?(I.arraySet(s.window,t,r-n,n,0),s.wnext=n,s.whave=s.wsize):(s.wnext+=i,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=i))),0}r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(e){return u(e,15)},r.inflateInit2=u,r.inflate=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(r=e.state).mode&&(r.mode=13),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,f=o,c=h,x=N;e:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(d=r.length)&&(d=o),d&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,n,s,d,k)),512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,r.length-=d),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}l=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}e.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==t)break;u>>>=2,l-=2;break e;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(d=r.length){if(o<d&&(d=o),h<d&&(d=h),0===d)break e;I.arraySet(i,n,s,d,a),o-=d,s+=d,h-=d,a+=d,r.length-=d;break}r.mode=12;break;case 17:for(;l<14;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(b<16)u>>>=_,l-=_,r.lens[r.have++]=b;else{if(16===b){for(z=_+2;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u>>>=_,l-=_,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],d=3+(3&u),u>>>=2,l-=2}else if(17===b){for(z=_+3;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=3+(7&(u>>>=_)),u>>>=3,l-=3}else{for(z=_+7;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=11+(127&(u>>>=_)),u>>>=7,l-=7}if(r.have+d>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;d--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(6<=o&&258<=h){e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,R(e,c),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,64&g){e.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break e;if(d=c-h,r.offset>d){if((d=r.offset-d)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}p=d>r.wnext?(d-=r.wnext,r.wsize-d):r.wnext-d,d>r.length&&(d=r.length),m=r.window}else m=i,p=a-r.offset,d=r.length;for(h<d&&(d=h),h-=d,r.length-=d;i[a++]=m[p++],--d;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break e;i[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;l<32;){if(0===o)break e;o--,u|=n[s++]<<l,l+=8}if(c-=h,e.total_out+=c,r.total+=c,c&&(e.adler=r.check=r.flags?B(r.check,i,c,a-c):O(r.check,i,c,a-c)),c=h,(r.flags?u:L(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}l=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}l=u=0}r.mode=29;case 29:x=1;break e;case 30:x=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,(r.wsize||c!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&Z(e,e.output,e.next_out,c-e.avail_out)?(r.mode=31,-4):(f-=e.avail_in,c-=e.avail_out,e.total_in+=f,e.total_out+=c,r.total+=c,r.wrap&&c&&(e.adler=r.check=r.flags?B(r.check,i,c,e.next_out-c):O(r.check,i,c,e.next_out-c)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===c||4===t)&&x===N&&(x=-5),x)},r.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,N},r.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?U:((r.head=t).done=!1,N):U},r.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,t,n,0)!==r.check?-3:Z(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,r){"use strict";var D=e("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,r,n,i,s,a,o){var h,u,l,f,c,d,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;b<=15;b++)O[b]=0;for(v=0;v<n;v++)O[t[r+v]]++;for(k=g,w=15;1<=w&&0===O[w];w--);if(w<k&&(k=w),0===w)return i[s++]=20971520,i[s++]=20971520,o.bits=1,0;for(y=1;y<w&&0===O[y];y++);for(k<y&&(k=y),b=z=1;b<=15;b++)if(z<<=1,(z-=O[b])<0)return-1;if(0<z&&(0===e||1!==w))return-1;for(B[1]=0,b=1;b<15;b++)B[b+1]=B[b]+O[b];for(v=0;v<n;v++)0!==t[r+v]&&(a[B[t[r+v]]++]=v);if(d=0===e?(A=R=a,19):1===e?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,c=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===e&&852<C||2===e&&592<C)return 1;for(;;){for(p=b-S,_=a[v]<d?(m=0,a[v]):a[v]>d?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;i[c+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=t[r+a[v]]}if(k<b&&(E&f)!==l){for(0===S&&(S=k),c+=y,z=1<<(x=b-S);x+S<w&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===e&&852<C||2===e&&592<C)return 1;i[l=E&f]=k<<24|x<<16|c-s|0}}return 0!==E&&(i[c+E]=b-S<<24|64<<16|0),o.bits=k,0}},{"../utils/common":41}],51:[function(e,t,r){"use strict";t.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,t,r){"use strict";var i=e("../utils/common"),o=0,h=1;function n(e){for(var t=e.length;0<=--t;)e[t]=0}var s=0,a=29,u=256,l=u+1+a,f=30,c=19,_=2*l+1,g=15,d=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));n(z);var C=new Array(2*f);n(C);var E=new Array(512);n(E);var A=new Array(256);n(A);var I=new Array(a);n(I);var O,B,R,T=new Array(f);function D(e,t,r,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function F(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function N(e){return e<256?E[e]:E[256+(e>>>7)]}function U(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function P(e,t,r){e.bi_valid>d-r?(e.bi_buf|=t<<e.bi_valid&65535,U(e,e.bi_buf),e.bi_buf=t>>d-e.bi_valid,e.bi_valid+=r-d):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r)}function L(e,t,r){P(e,r[2*t],r[2*t+1])}function j(e,t){for(var r=0;r|=1&e,e>>>=1,r<<=1,0<--t;);return r>>>1}function Z(e,t,r){var n,i,s=new Array(g+1),a=0;for(n=1;n<=g;n++)s[n]=a=a+r[n-1]<<1;for(i=0;i<=t;i++){var o=e[2*i+1];0!==o&&(e[2*i]=j(s[o]++,o))}}function W(e){var t;for(t=0;t<l;t++)e.dyn_ltree[2*t]=0;for(t=0;t<f;t++)e.dyn_dtree[2*t]=0;for(t=0;t<c;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*m]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function M(e){8<e.bi_valid?U(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function H(e,t,r,n){var i=2*t,s=2*r;return e[i]<e[s]||e[i]===e[s]&&n[t]<=n[r]}function G(e,t,r){for(var n=e.heap[r],i=r<<1;i<=e.heap_len&&(i<e.heap_len&&H(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!H(t,n,e.heap[i],e.depth));)e.heap[r]=e.heap[i],r=i,i<<=1;e.heap[r]=n}function K(e,t,r){var n,i,s,a,o=0;if(0!==e.last_lit)for(;n=e.pending_buf[e.d_buf+2*o]<<8|e.pending_buf[e.d_buf+2*o+1],i=e.pending_buf[e.l_buf+o],o++,0===n?L(e,i,t):(L(e,(s=A[i])+u+1,t),0!==(a=w[s])&&P(e,i-=I[s],a),L(e,s=N(--n),r),0!==(a=k[s])&&P(e,n-=T[s],a)),o<e.last_lit;);L(e,m,t)}function Y(e,t){var r,n,i,s=t.dyn_tree,a=t.stat_desc.static_tree,o=t.stat_desc.has_stree,h=t.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=_,r=0;r<h;r++)0!==s[2*r]?(e.heap[++e.heap_len]=u=r,e.depth[r]=0):s[2*r+1]=0;for(;e.heap_len<2;)s[2*(i=e.heap[++e.heap_len]=u<2?++u:0)]=1,e.depth[i]=0,e.opt_len--,o&&(e.static_len-=a[2*i+1]);for(t.max_code=u,r=e.heap_len>>1;1<=r;r--)G(e,s,r);for(i=h;r=e.heap[1],e.heap[1]=e.heap[e.heap_len--],G(e,s,1),n=e.heap[1],e.heap[--e.heap_max]=r,e.heap[--e.heap_max]=n,s[2*i]=s[2*r]+s[2*n],e.depth[i]=(e.depth[r]>=e.depth[n]?e.depth[r]:e.depth[n])+1,s[2*r+1]=s[2*n+1]=i,e.heap[1]=i++,G(e,s,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var r,n,i,s,a,o,h=t.dyn_tree,u=t.max_code,l=t.stat_desc.static_tree,f=t.stat_desc.has_stree,c=t.stat_desc.extra_bits,d=t.stat_desc.extra_base,p=t.stat_desc.max_length,m=0;for(s=0;s<=g;s++)e.bl_count[s]=0;for(h[2*e.heap[e.heap_max]+1]=0,r=e.heap_max+1;r<_;r++)p<(s=h[2*h[2*(n=e.heap[r])+1]+1]+1)&&(s=p,m++),h[2*n+1]=s,u<n||(e.bl_count[s]++,a=0,d<=n&&(a=c[n-d]),o=h[2*n],e.opt_len+=o*(s+a),f&&(e.static_len+=o*(l[2*n+1]+a)));if(0!==m){do{for(s=p-1;0===e.bl_count[s];)s--;e.bl_count[s]--,e.bl_count[s+1]+=2,e.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(n=e.bl_count[s];0!==n;)u<(i=e.heap[--r])||(h[2*i+1]!==s&&(e.opt_len+=(s-h[2*i+1])*h[2*i],h[2*i+1]=s),n--)}}(e,t),Z(s,u,e.bl_count)}function X(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),t[2*(r+1)+1]=65535,n=0;n<=r;n++)i=a,a=t[2*(n+1)+1],++o<h&&i===a||(o<u?e.bl_tree[2*i]+=o:0!==i?(i!==s&&e.bl_tree[2*i]++,e.bl_tree[2*b]++):o<=10?e.bl_tree[2*v]++:e.bl_tree[2*y]++,s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4))}function V(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),n=0;n<=r;n++)if(i=a,a=t[2*(n+1)+1],!(++o<h&&i===a)){if(o<u)for(;L(e,i,e.bl_tree),0!=--o;);else 0!==i?(i!==s&&(L(e,i,e.bl_tree),o--),L(e,b,e.bl_tree),P(e,o-3,2)):o<=10?(L(e,v,e.bl_tree),P(e,o-3,3)):(L(e,y,e.bl_tree),P(e,o-11,7));s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4)}}n(T);var q=!1;function J(e,t,r,n){P(e,(s<<1)+(n?1:0),3),function(e,t,r,n){M(e),n&&(U(e,r),U(e,~r)),i.arraySet(e.pending_buf,e.window,t,r,e.pending),e.pending+=r}(e,t,r,!0)}r._tr_init=function(e){q||(function(){var e,t,r,n,i,s=new Array(g+1);for(n=r=0;n<a-1;n++)for(I[n]=r,e=0;e<1<<w[n];e++)A[r++]=n;for(A[r-1]=n,n=i=0;n<16;n++)for(T[n]=i,e=0;e<1<<k[n];e++)E[i++]=n;for(i>>=7;n<f;n++)for(T[n]=i<<7,e=0;e<1<<k[n]-7;e++)E[256+i++]=n;for(t=0;t<=g;t++)s[t]=0;for(e=0;e<=143;)z[2*e+1]=8,e++,s[8]++;for(;e<=255;)z[2*e+1]=9,e++,s[9]++;for(;e<=279;)z[2*e+1]=7,e++,s[7]++;for(;e<=287;)z[2*e+1]=8,e++,s[8]++;for(Z(z,l+1,s),e=0;e<f;e++)C[2*e+1]=5,C[2*e]=j(e,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,c,p)}(),q=!0),e.l_desc=new F(e.dyn_ltree,O),e.d_desc=new F(e.dyn_dtree,B),e.bl_desc=new F(e.bl_tree,R),e.bi_buf=0,e.bi_valid=0,W(e)},r._tr_stored_block=J,r._tr_flush_block=function(e,t,r,n){var i,s,a=0;0<e.level?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return o;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return h;for(t=32;t<u;t++)if(0!==e.dyn_ltree[2*t])return h;return o}(e)),Y(e,e.l_desc),Y(e,e.d_desc),a=function(e){var t;for(X(e,e.dyn_ltree,e.l_desc.max_code),X(e,e.dyn_dtree,e.d_desc.max_code),Y(e,e.bl_desc),t=c-1;3<=t&&0===e.bl_tree[2*S[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=i&&(i=s)):i=s=r+5,r+4<=i&&-1!==t?J(e,t,r,n):4===e.strategy||s===i?(P(e,2+(n?1:0),3),K(e,z,C)):(P(e,4+(n?1:0),3),function(e,t,r,n){var i;for(P(e,t-257,5),P(e,r-1,5),P(e,n-4,4),i=0;i<n;i++)P(e,e.bl_tree[2*S[i]+1],3);V(e,e.dyn_ltree,t-1),V(e,e.dyn_dtree,r-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,a+1),K(e,e.dyn_ltree,e.dyn_dtree)),W(e),n&&M(e)},r._tr_tally=function(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(A[r]+u+1)]++,e.dyn_dtree[2*N(t)]++),e.last_lit===e.lit_bufsize-1},r._tr_align=function(e){P(e,2,3),L(e,m,z),function(e){16===e.bi_valid?(U(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},{"../utils/common":41}],53:[function(e,t,r){"use strict";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,r){(function(e){!function(r,n){"use strict";if(!r.setImmediate){var i,s,t,a,o=1,h={},u=!1,l=r.document,e=Object.getPrototypeOf&&Object.getPrototypeOf(r);e=e&&e.setTimeout?e:r,i="[object process]"==={}.toString.call(r.process)?function(e){process.nextTick(function(){c(e)})}:function(){if(r.postMessage&&!r.importScripts){var e=!0,t=r.onmessage;return r.onmessage=function(){e=!1},r.postMessage("","*"),r.onmessage=t,e}}()?(a="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",d,!1):r.attachEvent("onmessage",d),function(e){r.postMessage(a+e,"*")}):r.MessageChannel?((t=new MessageChannel).port1.onmessage=function(e){c(e.data)},function(e){t.port2.postMessage(e)}):l&&"onreadystatechange"in l.createElement("script")?(s=l.documentElement,function(e){var t=l.createElement("script");t.onreadystatechange=function(){c(e),t.onreadystatechange=null,s.removeChild(t),t=null},s.appendChild(t)}):function(e){setTimeout(c,0,e)},e.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];var n={callback:e,args:t};return h[o]=n,i(o),o++},e.clearImmediate=f}function f(e){delete h[e]}function c(e){if(u)setTimeout(c,0,e);else{var t=h[e];if(t){u=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}(t)}finally{f(e),u=!1}}}}function d(e){e.source===r&&"string"==typeof e.data&&0===e.data.indexOf(a)&&c(+e.data.slice(a.length))}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[10])(10)});window.toggleSection = function toggleSection(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('is-collapsed');
};
const EMBEDDED_COLOR_SCHEME_XML = "<ColorSchemeTypes>\n\t<ColorSchemeType ColorSchemeName=\"Template\">\n\t\t<ColorSchemeID>0</ColorSchemeID>\n\t\t<DefaultUnlocked>--</DefaultUnlocked>\n\t\t<DisplayNameKey>Must be a valid entry in stringTable.xml</DisplayNameKey>\n\t\t<IconName>--</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>--</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<InfinityIconName>--</InfinityIconName>\n\t\t<InfinityIconFileName>UI_Icons</InfinityIconFileName>\n\t\t<UniversalIconOriginalDimension>0</UniversalIconOriginalDimension>\n\t\t<OrderID>1</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>false</BroadcasterEnabled>\n\t\t<HairLt_Swap>--</HairLt_Swap>\n\t\t<Hair_Swap>--</Hair_Swap>\n\t\t<HairDk_Swap>--</HairDk_Swap>\n\t\t<Body1VL_Swap>--</Body1VL_Swap>\n\t\t<Body1Lt_Swap>--</Body1Lt_Swap>\n\t\t<Body1_Swap>--</Body1_Swap>\n\t\t<Body1Dk_Swap>--</Body1Dk_Swap>\n\t\t<Body1VD_Swap>--</Body1VD_Swap>\n\t\t<Body1Acc_Swap>--</Body1Acc_Swap>\n\t\t<Body2VL_Swap>--</Body2VL_Swap>\n\t\t<Body2Lt_Swap>--</Body2Lt_Swap>\n\t\t<Body2_Swap>--</Body2_Swap>\n\t\t<Body2Dk_Swap>--</Body2Dk_Swap>\n\t\t<Body2VD_Swap>--</Body2VD_Swap>\n\t\t<Body2Acc_Swap>--</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>--</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>--</SpecialLt_Swap>\n\t\t<Special_Swap>--</Special_Swap>\n\t\t<SpecialDk_Swap>--</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>--</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>--</SpecialAcc_Swap>\n\t\t<HandsLt_Swap>--</HandsLt_Swap>\n\t\t<HandsDk_Swap>--</HandsDk_Swap>\n\t\t<HandsSkinLt_Swap>--</HandsSkinLt_Swap>\n\t\t<HandsSkinDk_Swap>--</HandsSkinDk_Swap>\n\t\t<ClothVL_Swap>--</ClothVL_Swap>\n\t\t<ClothLt_Swap>--</ClothLt_Swap>\n\t\t<Cloth_Swap>--</Cloth_Swap>\n\t\t<ClothDk_Swap>--</ClothDk_Swap>\n\t\t<WeaponVL_Swap>--</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>--</WeaponLt_Swap>\n\t\t<Weapon_Swap>--</Weapon_Swap>\n\t\t<WeaponDk_Swap>--</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>--</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>--,--</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>--</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>--</FallbackMyTeamColor>\n\t\t<IndicatorColor>--</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Red\">\n\t\t<ColorSchemeID>1</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Red_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Red</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>2</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0x963E25</HairLt_Swap>\n\t\t<Hair_Swap>0x600D09</Hair_Swap>\n\t\t<HairDk_Swap>0x33160B</HairDk_Swap>\n\t\t<Body1VL_Swap>0xF7AF91</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xEF6F58</Body1Lt_Swap>\n\t\t<Body1_Swap>0xCF1F31</Body1_Swap>\n\t\t<Body1Dk_Swap>0x761B32</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x560222</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xB5313A</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xDE989D</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xC06770</Body2Lt_Swap>\n\t\t<Body2_Swap>0x8D2945</Body2_Swap>\n\t\t<Body2Dk_Swap>0x58122D</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x3C1021</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x9C3C50</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFD2D2</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xD0012B</SpecialLt_Swap>\n\t\t<Special_Swap>0x5C0118</Special_Swap>\n\t\t<SpecialDk_Swap>0x2B000B</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x1E030A</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x690268</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF3E4E1</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xEEBDB7</ClothLt_Swap>\n\t\t<Cloth_Swap>0xC68A91</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA35162</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFE7E7</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB8B3B3</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x807474</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x563838</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x987A7F</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Orange,Pink,TeamRed1,Sunset,Valhallentines,EsportRed,Brown,OEL1,BP9,HolidayJolly,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamRed1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0xCF1F31</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Blue\">\n\t\t<ColorSchemeID>2</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Blue_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Blue</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>3</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0x4B6387</HairLt_Swap>\n\t\t<Hair_Swap>0x242D53</Hair_Swap>\n\t\t<HairDk_Swap>0x171A1E</HairDk_Swap>\n\t\t<Body1VL_Swap>0xBBE2FF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x6FADFB</Body1Lt_Swap>\n\t\t<Body1_Swap>0x0A77EF</Body1_Swap>\n\t\t<Body1Dk_Swap>0x0C4994</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x0B366B</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x607DF5</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xA2DFEA</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x63A6BC</Body2Lt_Swap>\n\t\t<Body2_Swap>0x367987</Body2_Swap>\n\t\t<Body2Dk_Swap>0x24424D</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x203138</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x247E99</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xE8FFFE</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xA7F5FC</SpecialLt_Swap>\n\t\t<Special_Swap>0x44E3E3</Special_Swap>\n\t\t<SpecialDk_Swap>0x409EB3</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x2E7787</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x8CBCFF</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE0E4FC</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xBFC8E5</ClothLt_Swap>\n\t\t<Cloth_Swap>0x97A7BF</Cloth_Swap>\n\t\t<ClothDk_Swap>0x576D8A</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xE7EFFF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xA9B0BB</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x747680</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x32455D</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x7D8B9F</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Green,Cyan,TeamBlue1,CommunityColors,Ranked,Ranked2,BattlePass01,BattlePass02,Space,Purple,HomeTeam,Esport,BP8,Bifrost,BP10,EsportSeafoam,Summer2,HomeTeamReunion,Blacklight</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamBlue1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0x0A77EF</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Yellow\">\n\t\t<ColorSchemeID>3</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Yellow_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Yellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>4</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0xE7DCB6</HairLt_Swap>\n\t\t<Hair_Swap>0xD4B759</Hair_Swap>\n\t\t<HairDk_Swap>0x836625</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFEFFF0</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFBF8C4</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFAE658</Body1_Swap>\n\t\t<Body1Dk_Swap>0xECAB33</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xD0952D</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xFECA83</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFEE8C</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFFD36C</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFDAE37</Body2_Swap>\n\t\t<Body2Dk_Swap>0xD37516</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xA35E1B</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xFFB379</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFE9DD</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFC09B</SpecialLt_Swap>\n\t\t<Special_Swap>0xFF8135</Special_Swap>\n\t\t<SpecialDk_Swap>0xCE4A0B</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x983302</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFFC535</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFDFFEE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAF8C5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEE49D</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE7CA92</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFF9E2</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xBDBCB3</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x807E72</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x695237</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x9F8F7A</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Orange,White,Grey,Summer,Ranked2,EsportElectric,Spring,EsportPink,TeamYellow1,EsportHelios</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xFAE658</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Green\">\n\t\t<ColorSchemeID>4</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Green_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Green</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>5</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0x8F966D</HairLt_Swap>\n\t\t<Hair_Swap>0x626653</Hair_Swap>\n\t\t<HairDk_Swap>0x393E31</HairDk_Swap>\n\t\t<Body1VL_Swap>0xBBFBC0</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x8DE481</Body1Lt_Swap>\n\t\t<Body1_Swap>0x25C76D</Body1_Swap>\n\t\t<Body1Dk_Swap>0x1E9565</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x0E7249</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x1DCF95</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x80B5AE</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x497C75</Body2Lt_Swap>\n\t\t<Body2_Swap>0x314F48</Body2_Swap>\n\t\t<Body2Dk_Swap>0x273433</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x1E2726</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x407373</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFEFFF0</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFAF7C0</SpecialLt_Swap>\n\t\t<Special_Swap>0xF2EB53</Special_Swap>\n\t\t<SpecialDk_Swap>0xF2C53C</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xB6983D</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xC7F253</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE7FFEA</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xD5EED2</ClothLt_Swap>\n\t\t<Cloth_Swap>0xA6CBB7</Cloth_Swap>\n\t\t<ClothDk_Swap>0x7AA895</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xEEFFF1</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB3BDB3</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x798071</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x3B5839</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x889F7D</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Cyan,TeamBlue1,Holiday,StPaddy,GameFuel,BattlePass01,BattlePass03,Spring,Esport,EsportElectric,BP6,BP7,TeamYellow1,Bifrost,BP11,EsportSeafoam,Summer2,Blacklight,HolidayJolly,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x25C76D</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Orange\">\n\t\t<ColorSchemeID>5</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Orange_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Orange</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>6</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0xD08133</HairLt_Swap>\n\t\t<Hair_Swap>0xAD5A09</Hair_Swap>\n\t\t<HairDk_Swap>0x4A2809</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFE7BF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFBC48</Body1Lt_Swap>\n\t\t<Body1_Swap>0xF58218</Body1_Swap>\n\t\t<Body1Dk_Swap>0xAA240D</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x771606</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xDB5530</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xEEDDD8</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xDB917D</Body2Lt_Swap>\n\t\t<Body2_Swap>0xB86258</Body2_Swap>\n\t\t<Body2Dk_Swap>0x722929</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x4F0D0D</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xC98563</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF5DAE7</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xD97F92</SpecialLt_Swap>\n\t\t<Special_Swap>0xCB295D</Special_Swap>\n\t\t<SpecialDk_Swap>0x80082E</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x58182C</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xDE5F47</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF3E6D1</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAD592</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEAA6B</Cloth_Swap>\n\t\t<ClothDk_Swap>0xD07B63</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFECDB</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xBFB9AE</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x79726C</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x563B2A</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x9A8479</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Red,Yellow,Brown,Pink,TeamRed1,Sunset,Summer,Spring,CommunityColors2,EsportElectric,TeamYellow1,EsportHelios</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamRed1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0xF58218</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Purple\">\n\t\t<ColorSchemeID>6</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Purple_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Purple</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>7</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0xCBBBFF</HairLt_Swap>\n\t\t<Hair_Swap>0x7767E9</Hair_Swap>\n\t\t<HairDk_Swap>0x3129A1</HairDk_Swap>\n\t\t<Body1VL_Swap>0xECD9FF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xCA93FF</Body1Lt_Swap>\n\t\t<Body1_Swap>0x874CD0</Body1_Swap>\n\t\t<Body1Dk_Swap>0x4E2680</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x312243</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xC559E2</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xDCDEF3</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xA7A9E7</Body2Lt_Swap>\n\t\t<Body2_Swap>0x6668B4</Body2_Swap>\n\t\t<Body2Dk_Swap>0x3C396D</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x2A293F</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xA57DCB</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xE7F9FF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xB4F0FF</SpecialLt_Swap>\n\t\t<Special_Swap>0x5DD3E7</Special_Swap>\n\t\t<SpecialDk_Swap>0x0679A8</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x18536B</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x8CA9FF</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE9DFF5</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xDBC7EE</ClothLt_Swap>\n\t\t<Cloth_Swap>0xB192D7</Cloth_Swap>\n\t\t<ClothDk_Swap>0x876AAD</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xEEECFF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xADA9BB</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x656174</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x3F3858</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x717498</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Brown,Cyan,Black,TeamRed1,BattlePass02,Ranked,Blue,Pink,Sunset,100Mil,BP8,TeamPurple1,Bifrost,BP10,ArtDeco,EsportSeafoam,BP12,Blacklight</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x874CD0</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Brown\">\n\t\t<ColorSchemeID>7</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Brown_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Brown</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>8</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0xC4AA8C</HairLt_Swap>\n\t\t<Hair_Swap>0x724B32</Hair_Swap>\n\t\t<HairDk_Swap>0x433224</HairDk_Swap>\n\t\t<Body1VL_Swap>0xE7D2B4</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xA6682D</Body1Lt_Swap>\n\t\t<Body1_Swap>0x723A18</Body1_Swap>\n\t\t<Body1Dk_Swap>0x432411</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x331706</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xA67A16</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xE2D0D0</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x8E7176</Body2Lt_Swap>\n\t\t<Body2_Swap>0x5B393E</Body2_Swap>\n\t\t<Body2Dk_Swap>0x332122</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x201718</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x8A614E</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFEFEC</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFF5454</SpecialLt_Swap>\n\t\t<Special_Swap>0xE50C1B</Special_Swap>\n\t\t<SpecialDk_Swap>0x5F0502</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x410A09</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE9570F</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE9DCC9</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xBFA68E</ClothLt_Swap>\n\t\t<Cloth_Swap>0x957865</Cloth_Swap>\n\t\t<ClothDk_Swap>0x725848</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFF5EC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB8B5B0</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x69635F</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x4D3932</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x937E7B</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Orange,Purple,Black,TeamRed1,CommunityColors,CommunityColors2,BP6,Red,EsportRed,TeamYellow1,BP9,ArtDeco</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x723A18</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Cyan\">\n\t\t<ColorSchemeID>8</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Cyan_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Cyan</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>9</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0x4173AF</HairLt_Swap>\n\t\t<Hair_Swap>0x254467</Hair_Swap>\n\t\t<HairDk_Swap>0x0E253D</HairDk_Swap>\n\t\t<Body1VL_Swap>0xDAFCF8</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xA2EEE2</Body1Lt_Swap>\n\t\t<Body1_Swap>0x50CCD7</Body1_Swap>\n\t\t<Body1Dk_Swap>0x30809C</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x2C5462</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x7DE7BB</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xD7F7F2</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xACE3D5</Body2Lt_Swap>\n\t\t<Body2_Swap>0x84C9AB</Body2_Swap>\n\t\t<Body2Dk_Swap>0x508379</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x3D5450</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x93D0C4</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFEFAE</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFD36F</SpecialLt_Swap>\n\t\t<Special_Swap>0xFCA92E</Special_Swap>\n\t\t<SpecialDk_Swap>0xF45F04</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xA64104</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE9E755</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE3FAF7</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xC6F3EC</ClothLt_Swap>\n\t\t<Cloth_Swap>0xA4DDE2</Cloth_Swap>\n\t\t<ClothDk_Swap>0x7CAEBF</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xE7FFFC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xAFBBB9</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x707C7E</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x295666</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x8AA6A3</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Green,Purple,TeamBlue1,CommunityColors,BattlePass01,Esport,Space,Summer,Ranked,BP8,Bifrost,BP10,EsportSeafoam,Summer2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamBlue1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0x50CCD7</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Pink\">\n\t\t<ColorSchemeID>9</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Pink_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Pink</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>10</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0xFDD9FF</HairLt_Swap>\n\t\t<Hair_Swap>0xDE8CE2</Hair_Swap>\n\t\t<HairDk_Swap>0xAE59B8</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFEE9F7</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFCB6E1</Body1Lt_Swap>\n\t\t<Body1_Swap>0xF383C0</Body1_Swap>\n\t\t<Body1Dk_Swap>0xCF54A4</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xB13F89</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xDE90E7</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFDF5FF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF3C8F2</Body2Lt_Swap>\n\t\t<Body2_Swap>0xDBA1DA</Body2_Swap>\n\t\t<Body2Dk_Swap>0xB871B3</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x8E538A</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xEC91D6</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xE8E7FF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xD5C9FF</SpecialLt_Swap>\n\t\t<Special_Swap>0xAE95FF</Special_Swap>\n\t\t<SpecialDk_Swap>0x8950F3</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x5E38A6</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE295FF</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFE7F6</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAD7ED</ClothLt_Swap>\n\t\t<Cloth_Swap>0xF3BBDA</Cloth_Swap>\n\t\t<ClothDk_Swap>0xDE96C5</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFECFB</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xC4B6C0</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x958792</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x85546F</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xB494B6</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Red,Orange,TeamRed1,Sunset,Valhallentines,CommunityColors2,BattlePass03,Purple,BattlePass02,EsportPink,Bifrost,BP10,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamRed1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0xF383C0</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"White\">\n\t\t<ColorSchemeID>10</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_White_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_White</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>11</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0xFFFFFF</HairLt_Swap>\n\t\t<Hair_Swap>0xF7F9F9</Hair_Swap>\n\t\t<HairDk_Swap>0xBCCDE0</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFFFF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xF9FCFE</Body1Lt_Swap>\n\t\t<Body1_Swap>0xEEF4F5</Body1_Swap>\n\t\t<Body1Dk_Swap>0xB6CADE</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x9EB3C9</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xDDE7EC</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFFFF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF5F9FC</Body2Lt_Swap>\n\t\t<Body2_Swap>0xF5F9FC</Body2_Swap>\n\t\t<Body2Dk_Swap>0xB4C6DC</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x9EB1C9</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xD9E2EC</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xB8C4D8</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x97A9C6</SpecialLt_Swap>\n\t\t<Special_Swap>0x6680AA</Special_Swap>\n\t\t<SpecialDk_Swap>0x465B80</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x3B485F</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x7B7AB6</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFFFF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF5F8FA</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEAF1F5</Cloth_Swap>\n\t\t<ClothDk_Swap>0xD8E3EE</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFFFF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xDDE7EE</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xC3D5E2</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x7592B5</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xC4D4F0</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Yellow,Grey,Anniversary,OEL1,BattlePass03,Space,EsportHelios,BP10,BP12</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xEEF4F5</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Black\">\n\t\t<ColorSchemeID>11</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Black_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Black</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>12</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<BroadcasterEnabled>true</BroadcasterEnabled>\n\t\t<HairLt_Swap>0x535560</HairLt_Swap>\n\t\t<Hair_Swap>0x2C2B31</Hair_Swap>\n\t\t<HairDk_Swap>0x07070A</HairDk_Swap>\n\t\t<Body1VL_Swap>0x9FA0A3</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x4F5562</Body1Lt_Swap>\n\t\t<Body1_Swap>0x2D313A</Body1_Swap>\n\t\t<Body1Dk_Swap>0x181F25</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x0E0E12</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x34424A</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x636569</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x373A3F</Body2Lt_Swap>\n\t\t<Body2_Swap>0x222527</Body2_Swap>\n\t\t<Body2Dk_Swap>0x161A1C</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x010102</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x282E35</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xAF0C29</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x8E0B22</SpecialLt_Swap>\n\t\t<Special_Swap>0x690A1E</Special_Swap>\n\t\t<SpecialDk_Swap>0x46001E</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x2E0113</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x690050</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0x797F8C</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x585E69</ClothLt_Swap>\n\t\t<Cloth_Swap>0x41454D</Cloth_Swap>\n\t\t<ClothDk_Swap>0x202A33</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0x9A9B9F</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x525258</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x303035</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x020202</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x5E5864</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Purple,Brown,Grey,Brawlhalloween,HomeTeam,GameFuel,EsportRed,BP6,100Mil,BP9,EsportHelios,BP11,Esport,ArtDeco,EsportDigital,HomeTeamReunion,BP12,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x24272D</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"GameFuel\">\n\t\t<ColorSchemeID>12</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_GameFuel_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_GameFuel</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>13</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x534f53</HairLt_Swap>\n\t\t<Hair_Swap>0x1e1c1d</Hair_Swap>\n\t\t<HairDk_Swap>0x010101</HairDk_Swap>\n\t\t<Body1VL_Swap>0x656365</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x534f53</Body1Lt_Swap>\n\t\t<Body1_Swap>0x333033</Body1_Swap>\n\t\t<Body1Dk_Swap>0x181416</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x030304</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x3b3f32</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xefffad</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xccf666</Body2Lt_Swap>\n\t\t<Body2_Swap>0x95c93c</Body2_Swap>\n\t\t<Body2Dk_Swap>0x619606</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x3c6e00</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x8aae0c</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xf5faf3</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xf5faf3</SpecialLt_Swap>\n\t\t<Special_Swap>0xe9efe6</Special_Swap>\n\t\t<SpecialDk_Swap>0xd2dacf</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xb6beb1</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xeff4e7</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xc0bec2</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x8e8b91</ClothLt_Swap>\n\t\t<Cloth_Swap>0x5b565b</Cloth_Swap>\n\t\t<ClothDk_Swap>0x322f32</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xfefff0</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xf0f3e5</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xc8ccbf</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xa1a795</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xc1c8a1</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Black,HomeTeam,Ranked,Ranked2,Holiday,Green,StPaddy,BattlePass01,BP6,BP7,100Mil,BP9,BP11,BP12,ArtDeco,EsportDigital,Blacklight,Brawlhalloween2,HolidayJolly,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x95c93c</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BattlePass01\">\n\t\t<ColorSchemeID>13</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BattlePass01_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS1Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_DevOnly</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>14</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x1F477E</HairLt_Swap>\n\t\t<Hair_Swap>0x1E0949</Hair_Swap>\n\t\t<HairDk_Swap>0x070711</HairDk_Swap>\n\t\t<Body1VL_Swap>0x74FEB2</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x4EC3BB</Body1Lt_Swap>\n\t\t<Body1_Swap>0x4665A1</Body1_Swap>\n\t\t<Body1Dk_Swap>0x491C72</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x21104C</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x4882BE</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x4BC0B8</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x2C6990</Body2Lt_Swap>\n\t\t<Body2_Swap>0x232B5F</Body2_Swap>\n\t\t<Body2Dk_Swap>0x2A0A3B</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x000004</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x4548BB</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFFCD</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xE9FFA1</SpecialLt_Swap>\n\t\t<Special_Swap>0xAEFFAF</Special_Swap>\n\t\t<SpecialDk_Swap>0x65E8A2</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x3DBBA6</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x68FFED</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFFFF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xD9FFFF</ClothLt_Swap>\n\t\t<Cloth_Swap>0x9DC0E2</Cloth_Swap>\n\t\t<ClothDk_Swap>0x6372A5</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFFFA</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFFDDE</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFFE293</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xBE886F</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xC7E5BB</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Green,Cyan,TeamBlue1,BattlePass02,BattlePass03,GameFuel,Esport,Space,BP6,Ranked,100Mil,BP8,Bifrost,BP10,BP11,BP12,EsportSeafoam,BP7,EsportDigital,HomeTeamReunion,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamBlue1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0x4665A1</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BattlePass02\">\n\t\t<ColorSchemeID>14</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BattlePass02_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS2Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_DevOnly</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>15</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xDC2489</HairLt_Swap>\n\t\t<Hair_Swap>0x831985</Hair_Swap>\n\t\t<HairDk_Swap>0x520A6B</HairDk_Swap>\n\t\t<Body1VL_Swap>0x40BAFF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x4E81EE</Body1Lt_Swap>\n\t\t<Body1_Swap>0x5854C6</Body1_Swap>\n\t\t<Body1Dk_Swap>0x5D2A8F</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x4B1857</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x5156BB</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x2874CA</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x2D4FBB</Body2Lt_Swap>\n\t\t<Body2_Swap>0x342A8D</Body2_Swap>\n\t\t<Body2Dk_Swap>0x30124E</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x17031C</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x2C5388</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFE295</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFF8D7E</SpecialLt_Swap>\n\t\t<Special_Swap>0xFF23A0</Special_Swap>\n\t\t<SpecialDk_Swap>0xC5008B</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x8D0095</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x9D6DF0</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFFDC</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xD0FFDA</ClothLt_Swap>\n\t\t<Cloth_Swap>0x74FFE2</Cloth_Swap>\n\t\t<ClothDk_Swap>0x3ACADC</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF9FFFF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xCFFCFF</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x7CD8FF</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x706BE1</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xCDA2FF</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Purple,Sunset,BattlePass01,Pink,Valhallentines,HomeTeam,100Mil,BP8,Bifrost,BP10,BP12,HomeTeamReunion,Blacklight,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xFF23A0</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Esport\">\n\t\t<ColorSchemeID>15</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Esports_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Esport</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_EsportUniversal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<OrderID>16</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x00415C</HairLt_Swap>\n\t\t<Hair_Swap>0x002232</Hair_Swap>\n\t\t<HairDk_Swap>0x00070B</HairDk_Swap>\n\t\t<Body1VL_Swap>0x5D7378</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x3C4B51</Body1Lt_Swap>\n\t\t<Body1_Swap>0x273135</Body1_Swap>\n\t\t<Body1Dk_Swap>0x07141B</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x00030C</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x12453E</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x00D9DC</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x00ACCA</Body2Lt_Swap>\n\t\t<Body2_Swap>0x008BB3</Body2_Swap>\n\t\t<Body2Dk_Swap>0x005375</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x002130</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x0B8C9E</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFBFFCE</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFF688</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFD636</Special_Swap>\n\t\t<SpecialDk_Swap>0xFF9C2F</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xFB7243</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xC3E493</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFFFA</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF4FFE9</ClothLt_Swap>\n\t\t<Cloth_Swap>0xDBF0E5</Cloth_Swap>\n\t\t<ClothDk_Swap>0xBEDEE0</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xEEFFE8</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xBBFFDE</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x3AFFC5</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x22CAE5</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x59E9DF</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Cyan,CommunityColors,Ranked,Ranked2,TeamBlue1,Blue,BattlePass01,Space,Green,100Mil,Brawlhalloween,EsportElectric,BP11,BP12,Black,ArtDeco,EsportSeafoam,Summer2,EsportDigital,Blacklight,Brawlhalloween2,HomeTeam</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x3AFFC5</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Anniversary\">\n\t\t<ColorSchemeID>16</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Anniversary_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Anniversary</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>17</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x3F3B75</HairLt_Swap>\n\t\t<Hair_Swap>0x1A1626</Hair_Swap>\n\t\t<HairDk_Swap>0x040207</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFFFF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFFFEF</Body1Lt_Swap>\n\t\t<Body1_Swap>0xE5FBFF</Body1_Swap>\n\t\t<Body1Dk_Swap>0xCBE0FF</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xACAFFF</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xF1E0FF</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x829EDF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x6068AE</Body2Lt_Swap>\n\t\t<Body2_Swap>0x443F72</Body2_Swap>\n\t\t<Body2Dk_Swap>0x28294A</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x0F1118</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x61457A</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0x694E9A</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x313366</SpecialLt_Swap>\n\t\t<Special_Swap>0x161C35</Special_Swap>\n\t\t<SpecialDk_Swap>0x06070C</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x000002</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x47134E</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFFFF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFFFFEF</ClothLt_Swap>\n\t\t<Cloth_Swap>0xE5FBFF</Cloth_Swap>\n\t\t<ClothDk_Swap>0xCBE0FF</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFFEF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFF7D0</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xEBCFB0</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xB08AA5</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xE1A3AC</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>White,OEL1,Space,BattlePass03,Grey,Spring,Ranked,100Mil,Ranked2,BP12,EsportHelios,Blacklight</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xE5FBFF</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BattlePass03\">\n\t\t<ColorSchemeID>17</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BP3_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP3</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS3Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_DevOnly</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>18</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFBFFFF</HairLt_Swap>\n\t\t<Hair_Swap>0xEAF5FB</Hair_Swap>\n\t\t<HairDk_Swap>0xAEBECF</HairDk_Swap>\n\t\t<Body1VL_Swap>0x92C2B9</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x60939C</Body1Lt_Swap>\n\t\t<Body1_Swap>0x3E5563</Body1_Swap>\n\t\t<Body1Dk_Swap>0x29343F</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x151828</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x6F8B8D</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFEFFF3</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF1F6F2</Body2Lt_Swap>\n\t\t<Body2_Swap>0xDBEAF3</Body2_Swap>\n\t\t<Body2Dk_Swap>0xA6C0CF</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x869BB0</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xB8DFE1</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xBDFFD2</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x59E69E</SpecialLt_Swap>\n\t\t<Special_Swap>0x36A181</Special_Swap>\n\t\t<SpecialDk_Swap>0x2C5E5B</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x25444A</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x7EB4AC</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xA8D9C8</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x77B2BB</ClothLt_Swap>\n\t\t<Cloth_Swap>0x5B788A</Cloth_Swap>\n\t\t<ClothDk_Swap>0x3B4A59</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFFF8</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xEAF6F5</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xC2D7E4</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x7E91A6</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x90B6C1</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Green,Holiday,StPaddy,BattlePass01,Anniversary,White,Grey,Ranked,Pink,Spring,Valhallentines,Ranked2,Space,OEL1,EsportHelios,EsportDigital,BP12,Blacklight,HolidayJolly,Valhallentines2,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x60939C</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Spring\">\n\t\t<ColorSchemeID>18</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Pastel_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_VerdantBloom</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>19</OrderID>\n\t\t<Rarity>M</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFE8B2</HairLt_Swap>\n\t\t<Hair_Swap>0xFFBBA7</Hair_Swap>\n\t\t<HairDk_Swap>0xE28FA9</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFDDA</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xECEB88</Body1Lt_Swap>\n\t\t<Body1_Swap>0xB0D08E</Body1_Swap>\n\t\t<Body1Dk_Swap>0x6998A1</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x4F666B</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x7BBDDA</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFFFF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFDFCD4</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFDDDAF</Body2_Swap>\n\t\t<Body2Dk_Swap>0xECABA0</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xC47B93</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xC5D1D3</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFDFDFD</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFDFDEB</SpecialLt_Swap>\n\t\t<Special_Swap>0xF7EEDA</Special_Swap>\n\t\t<SpecialDk_Swap>0xCFDAC8</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xC8B093</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xD1EEFE</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFDFDFD</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFCFCEA</ClothLt_Swap>\n\t\t<Cloth_Swap>0xFAF2E0</Cloth_Swap>\n\t\t<ClothDk_Swap>0xD7E1D1</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFEEC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xF5E3CE</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xD0C3BA</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x9EA0AA</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xA4B6CD</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Green,CommunityColors2,Summer,Anniversary,Holiday,Valhallentines,StPaddy,BattlePass03,TeamBlue1,Yellow,Orange,BP7,EsportElectric,EsportPink,TeamYellow1,Bifrost,BP11,Summer2,HolidayJolly,Valhallentines2,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xB0D08E</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Sunset\">\n\t\t<ColorSchemeID>19</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Sunset_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Sunset</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>20</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<HairLt_Swap>0xFFF5E1</HairLt_Swap>\n\t\t<Hair_Swap>0xFFDD99</Hair_Swap>\n\t\t<HairDk_Swap>0xEC9742</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFBD2E1</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xE886B1</Body1Lt_Swap>\n\t\t<Body1_Swap>0xD72F7A</Body1_Swap>\n\t\t<Body1Dk_Swap>0x852162</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x620040</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xC84FB6</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xC186E6</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x943CC8</Body2Lt_Swap>\n\t\t<Body2_Swap>0x5E247F</Body2_Swap>\n\t\t<Body2Dk_Swap>0x36216C</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x231B38</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x643FC5</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFEFE8</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFD7C6</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFAC8A</Special_Swap>\n\t\t<SpecialDk_Swap>0xFF6624</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xC64812</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFF9CA1</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFE0F2</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xEEBCE8</ClothLt_Swap>\n\t\t<Cloth_Swap>0xD899DB</Cloth_Swap>\n\t\t<ClothDk_Swap>0xBF67A1</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFE2FC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x6553B8</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x303087</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x2E1B4F</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x6339C9</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Red,Orange,Pink,TeamRed1,Valhallentines,BattlePass02,Purple,BP8,Bifrost,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xD72F7A</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Grey\">\n\t\t<ColorSchemeID>20</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Grey_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Grey</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>21</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<HairLt_Swap>0xA5AFBC</HairLt_Swap>\n\t\t<Hair_Swap>0x535A66</Hair_Swap>\n\t\t<HairDk_Swap>0x30343A</HairDk_Swap>\n\t\t<Body1VL_Swap>0xE9ECEF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xC6D2D9</Body1Lt_Swap>\n\t\t<Body1_Swap>0xAAB8BD</Body1_Swap>\n\t\t<Body1Dk_Swap>0x69757D</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x46525B</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x8C9CAA</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xC2C9D1</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x8A98A8</Body2Lt_Swap>\n\t\t<Body2_Swap>0x5A6A7B</Body2_Swap>\n\t\t<Body2Dk_Swap>0x282736</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x1A1920</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x474170</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFAE6</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFED98B</SpecialLt_Swap>\n\t\t<Special_Swap>0xFEB341</Special_Swap>\n\t\t<SpecialDk_Swap>0xFD6B00</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xAA571A</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xF0D763</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xEEF4FA</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xE3E5E7</ClothLt_Swap>\n\t\t<Cloth_Swap>0xD1D6D7</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA6AEB4</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xDEE1E5</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x9599A1</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x5A5D66</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x353C3C</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x74748E</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Yellow,White,CommunityColors,OEL1,BattlePass03,Ranked,Space,Anniversary,BP6,BP12,EsportHelios,Black,ArtDeco,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xAAB8BD</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"CommunityColors\">\n\t\t<ColorSchemeID>21</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_CommunityColors_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_CommunityColor</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>22</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x5A6D9E</HairLt_Swap>\n\t\t<Hair_Swap>0x323366</Hair_Swap>\n\t\t<HairDk_Swap>0x1C1E27</HairDk_Swap>\n\t\t<Body1VL_Swap>0xCBEEE5</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xB89685</Body1Lt_Swap>\n\t\t<Body1_Swap>0x8A6453</Body1_Swap>\n\t\t<Body1Dk_Swap>0x49495F</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x282843</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x52708D</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xB4EBF1</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x5FA2D8</Body2Lt_Swap>\n\t\t<Body2_Swap>0x2C5E94</Body2_Swap>\n\t\t<Body2Dk_Swap>0x17337B</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x102252</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x244FBD</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF1FFBF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFDE38C</SpecialLt_Swap>\n\t\t<Special_Swap>0xFAC205</Special_Swap>\n\t\t<SpecialDk_Swap>0xF78009</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xBF4B1F</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE5E349</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xDFE9E7</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xC4B8B2</ClothLt_Swap>\n\t\t<Cloth_Swap>0xB4A29B</Cloth_Swap>\n\t\t<ClothDk_Swap>0x686C79</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xDAEBF7</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB6B1AC</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x857E7F</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x3C4256</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x939CAA</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Brown,Cyan,TeamBlue1,Grey,Ranked,Ranked2,Esport,BP6,CommunityColors2,TeamYellow1,EsportSeafoam,Summer2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x8A6453</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Holiday\">\n\t\t<ColorSchemeID>22</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Holiday_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Holiday</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>23</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFBFDFB</HairLt_Swap>\n\t\t<Hair_Swap>0xE6ECEC</Hair_Swap>\n\t\t<HairDk_Swap>0xBCD0D3</HairDk_Swap>\n\t\t<Body1VL_Swap>0x31A68B</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x12856B</Body1Lt_Swap>\n\t\t<Body1_Swap>0x006256</Body1_Swap>\n\t\t<Body1Dk_Swap>0x003C35</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x002220</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x007160</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xCCE8A2</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x9CD374</Body2Lt_Swap>\n\t\t<Body2_Swap>0x84B953</Body2_Swap>\n\t\t<Body2Dk_Swap>0x518E48</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x3D694F</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x57BE52</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFCFC9</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xDB4F3E</SpecialLt_Swap>\n\t\t<Special_Swap>0xB8302D</Special_Swap>\n\t\t<SpecialDk_Swap>0x800C29</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x56071B</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xB82D81</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xB3DBC9</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x8EC4A8</ClothLt_Swap>\n\t\t<Cloth_Swap>0x65A880</Cloth_Swap>\n\t\t<ClothDk_Swap>0x3C8059</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xEEF0EC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xD5DACF</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xB0BBA6</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x889E72</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xBDD4C9</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Green,StPaddy,GameFuel,BattlePass03,Spring,BP11,HolidayJolly,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x006256</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Valhallentines\">\n\t\t<ColorSchemeID>23</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Valhallentines_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Valentines</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>24</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xEC5F76</HairLt_Swap>\n\t\t<Hair_Swap>0xD02D59</Hair_Swap>\n\t\t<HairDk_Swap>0x831948</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFAFD</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFE2F9</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFFC6E9</Body1_Swap>\n\t\t<Body1Dk_Swap>0xFFADE7</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xF374CE</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xF1BFFF</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFCDE0</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFF85B4</Body2Lt_Swap>\n\t\t<Body2_Swap>0xE70612</Body2_Swap>\n\t\t<Body2Dk_Swap>0xA60027</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x7B0014</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xF33EA1</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFFFF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFE2F4</SpecialLt_Swap>\n\t\t<Special_Swap>0xE5F6F7</Special_Swap>\n\t\t<SpecialDk_Swap>0xEDD4FF</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xBA98D2</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE2FFE2</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFFFF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF6F5FA</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEDEAF5</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE8D8EE</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFAFD</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xF6F1FF</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xEBE5FA</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xFFC4FB</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xE5F0FA</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Red,Pink,TeamRed1,Sunset,BattlePass03,Spring,CommunityColors2,BattlePass02,EsportPink,Bifrost,BP10,BP7,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamRed1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0xF383C0</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"EsportRed\">\n\t\t<ColorSchemeID>24</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Esports2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Esport2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_Esport2Universal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<OrderID>25</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xA3313D</HairLt_Swap>\n\t\t<Hair_Swap>0x6C2433</Hair_Swap>\n\t\t<HairDk_Swap>0x431E2C</HairDk_Swap>\n\t\t<Body1VL_Swap>0x735D6E</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x514758</Body1Lt_Swap>\n\t\t<Body1_Swap>0x352831</Body1_Swap>\n\t\t<Body1Dk_Swap>0x160D0F</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x030102</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x5D181A</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xF85B48</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xCE2B2F</Body2Lt_Swap>\n\t\t<Body2_Swap>0x9A0316</Body2_Swap>\n\t\t<Body2Dk_Swap>0x610A15</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x360C12</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x962B2C</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFA379</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFF7E5B</SpecialLt_Swap>\n\t\t<Special_Swap>0xF83628</Special_Swap>\n\t\t<SpecialDk_Swap>0xBC1E1C</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x881720</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xD33D32</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xBEAFB5</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x9C8E99</ClothLt_Swap>\n\t\t<Cloth_Swap>0x756F82</Cloth_Swap>\n\t\t<ClothDk_Swap>0x655062</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF7F7F0</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xECE5B8</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xD4B86E</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xC38C59</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xDFAB6C</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Black,HomeTeam,Red,TeamRed1,Brawlhalloween,Brown,OEL1,100Mil,BP9,BP11,ArtDeco,EsportDigital,HomeTeamReunion,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamRed1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0x352831</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"OEL1\">\n\t\t<ColorSchemeID>25</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_OEL1_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP4</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>26</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x504551</HairLt_Swap>\n\t\t<Hair_Swap>0x2C2429</Hair_Swap>\n\t\t<HairDk_Swap>0x070305</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFFF6</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xECF5F5</Body1Lt_Swap>\n\t\t<Body1_Swap>0xD5D9EA</Body1_Swap>\n\t\t<Body1Dk_Swap>0xA29AB8</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x8C7791</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xC1ACD0</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xD46B79</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x9D425A</Body2Lt_Swap>\n\t\t<Body2_Swap>0x622E46</Body2_Swap>\n\t\t<Body2Dk_Swap>0x422844</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x2D1E35</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x5C395E</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFF5455</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xDB0D3D</SpecialLt_Swap>\n\t\t<Special_Swap>0x9E0739</Special_Swap>\n\t\t<SpecialDk_Swap>0x660A28</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x470C1A</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xB11549</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xEEFBF8</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xC1C5D9</ClothLt_Swap>\n\t\t<Cloth_Swap>0x999AB1</Cloth_Swap>\n\t\t<ClothDk_Swap>0x66607C</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xC2AFBC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x7B6F7E</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x3C363D</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x121212</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x323B49</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>White,Anniversary,Grey,Red,EsportRed,TeamRed1,BattlePass03,BP8,BP9,BP12,Blacklight</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xD5D9EA</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Summer\">\n\t\t<ColorSchemeID>26</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Summer_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BeachBallBrawl</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>27</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFF9E7</HairLt_Swap>\n\t\t<Hair_Swap>0xFFF1CB</Hair_Swap>\n\t\t<HairDk_Swap>0xF7DB86</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFFFB</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFFDB9</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFFE680</Body1_Swap>\n\t\t<Body1Dk_Swap>0xFF926C</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xFF5E46</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xFFD9D7</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFE4CC</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFFC28C</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFF926C</Body2_Swap>\n\t\t<Body2Dk_Swap>0xFF5E5E</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xE72158</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xFF9797</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xE6FDFF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xA8FBFF</SpecialLt_Swap>\n\t\t<Special_Swap>0x00F9F2</Special_Swap>\n\t\t<SpecialDk_Swap>0x00BFE1</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x00759B</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x6BFFC9</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFAF3</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAF3DA</ClothLt_Swap>\n\t\t<Cloth_Swap>0xF5E9C6</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE9DAC7</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFDFB</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFE4CC</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFFC28C</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xFF926C</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xFFE39F</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Yellow,Orange,EsportElectric,Spring,Cyan,TeamYellow1,BP9,Bifrost,EsportSeafoam</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xFFE680</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Ranked\">\n\t\t<ColorSchemeID>27</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Ranked_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Season1</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>28</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x5A6D9E</HairLt_Swap>\n\t\t<Hair_Swap>0x323366</Hair_Swap>\n\t\t<HairDk_Swap>0x1C1E27</HairDk_Swap>\n\t\t<Body1VL_Swap>0xC8CDD2</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x919498</Body1Lt_Swap>\n\t\t<Body1_Swap>0x636970</Body1_Swap>\n\t\t<Body1Dk_Swap>0x27272E</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x1A1920</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x415A70</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xC2DFFF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x4B74E5</Body2Lt_Swap>\n\t\t<Body2_Swap>0x2854D2</Body2_Swap>\n\t\t<Body2Dk_Swap>0x202B87</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x1D2562</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x5351F5</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xDBE9FF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x546680</SpecialLt_Swap>\n\t\t<Special_Swap>0x001E3F</Special_Swap>\n\t\t<SpecialDk_Swap>0x101315</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x010102</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x2A0880</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE0E4FC</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xBFC8E5</ClothLt_Swap>\n\t\t<Cloth_Swap>0x97A7BF</Cloth_Swap>\n\t\t<ClothDk_Swap>0x576D8A</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF8FBFC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xD2E7F0</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xC4DCFF</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x84A7CA</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xBBE6F0</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,TeamBlue1,CommunityColors,HomeTeam,Ranked2,GameFuel,Grey,BattlePass03,Esport,Anniversary,Purple,Space,Cyan,BattlePass01,100Mil,BP8,EsportHelios,BP11,BP12,EsportSeafoam,Summer2,HomeTeamReunion,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamBlue1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0x636970</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Brawlhalloween\">\n\t\t<ColorSchemeID>28</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Brawlhalloween_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Pumpkin</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>29</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFDD8A</HairLt_Swap>\n\t\t<Hair_Swap>0xFF9D27</Hair_Swap>\n\t\t<HairDk_Swap>0xFF741E</HairDk_Swap>\n\t\t<Body1VL_Swap>0x928A95</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x4B444F</Body1Lt_Swap>\n\t\t<Body1_Swap>0x27232C</Body1_Swap>\n\t\t<Body1Dk_Swap>0x1C1A20</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x0F091C</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x36234A</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xA585B8</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x664C80</Body2Lt_Swap>\n\t\t<Body2_Swap>0x483362</Body2_Swap>\n\t\t<Body2Dk_Swap>0x2F1851</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x22113F</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x4A1C62</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFDD8A</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFA9B29</SpecialLt_Swap>\n\t\t<Special_Swap>0xEE6B15</Special_Swap>\n\t\t<SpecialDk_Swap>0xD04400</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xA82703</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFF5819</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0x94859A</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x504556</ClothLt_Swap>\n\t\t<Cloth_Swap>0x282231</Cloth_Swap>\n\t\t<ClothDk_Swap>0x1E1A27</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xA497BF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x49425B</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x30253F</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x221838</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x513677</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Black,HomeTeam,EsportRed,BP6,100Mil,Esport,BP9,EsportHelios,BP11,BP12,ArtDeco,HomeTeamReunion,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x27232C</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"HomeTeam\">\n\t\t<ColorSchemeID>29</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_HomeTeam_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BacktoSchool</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>30</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x3F577C</HairLt_Swap>\n\t\t<Hair_Swap>0X273350</Hair_Swap>\n\t\t<HairDk_Swap>0X111624</HairDk_Swap>\n\t\t<Body1VL_Swap>0x8399C1</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x3F577C</Body1Lt_Swap>\n\t\t<Body1_Swap>0X273350</Body1_Swap>\n\t\t<Body1Dk_Swap>0X111624</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x030610</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x394F86</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xF79696</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xC92F48</Body2Lt_Swap>\n\t\t<Body2_Swap>0x620030</Body2_Swap>\n\t\t<Body2Dk_Swap>0x27000F</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x190009</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x9C0066</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFEFFDC</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFCEEC2</SpecialLt_Swap>\n\t\t<Special_Swap>0xE9C053</Special_Swap>\n\t\t<SpecialDk_Swap>0x71512B</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x543938</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE98453</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xB9C0CD</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x596474</ClothLt_Swap>\n\t\t<Cloth_Swap>0x3E4451</Cloth_Swap>\n\t\t<ClothDk_Swap>0x22252E</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFEFFDC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFCEEC2</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xE9C053</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x71512B</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xF7D67B</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Black,Ranked,Brawlhalloween,Ranked2,GameFuel,EsportRed,Blue,BattlePass02,BP9,BP8,BP11,ArtDeco,HomeTeamReunion,Brawlhalloween2,Esport</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x620030</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"StPaddy\">\n\t\t<ColorSchemeID>30</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_StPaddy_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Shamrock</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>31</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFA841</HairLt_Swap>\n\t\t<Hair_Swap>0xE07F31</Hair_Swap>\n\t\t<HairDk_Swap>0xC2521C</HairDk_Swap>\n\t\t<Body1VL_Swap>0xDAECE3</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x8FB69C</Body1Lt_Swap>\n\t\t<Body1_Swap>0x45663E</Body1_Swap>\n\t\t<Body1Dk_Swap>0x1E3C21</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x0D2E10</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x3B6D58</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFFFF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFCF8D9</Body2Lt_Swap>\n\t\t<Body2_Swap>0xF0E9B9</Body2_Swap>\n\t\t<Body2Dk_Swap>0xD4C78A</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xB49870</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xE7E9CE</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xDFFFC4</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x92FC65</SpecialLt_Swap>\n\t\t<Special_Swap>0x44D407</Special_Swap>\n\t\t<SpecialDk_Swap>0x2C9500</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x01720A</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x18E098</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFAFFF1</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xE1E9C5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xC6D2B4</Cloth_Swap>\n\t\t<ClothDk_Swap>0x9AAA87</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFEFEEA</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xF5E689</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xD9AB25</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x65300B</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xF7C82D</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Green,Holiday,GameFuel,BattlePass03,Spring,BP11,EsportElectric,HolidayJolly,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x45663E</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Ranked2\">\n\t\t<ColorSchemeID>31</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Ranked2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Season2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>32</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFEFEFF</HairLt_Swap>\n\t\t<Hair_Swap>0xF0F4FF</Hair_Swap>\n\t\t<HairDk_Swap>0xC9D5F8</HairDk_Swap>\n\t\t<Body1VL_Swap>0xC2CAE1</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x6A7699</Body1Lt_Swap>\n\t\t<Body1_Swap>0x404A68</Body1_Swap>\n\t\t<Body1Dk_Swap>0x19223C</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x070C19</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x344065</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFFE6</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFFFF99</Body2Lt_Swap>\n\t\t<Body2_Swap>0xF6D356</Body2_Swap>\n\t\t<Body2Dk_Swap>0xDC9F26</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xAB5B17</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xFBC14A</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xC2DFFF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x4B74E5</SpecialLt_Swap>\n\t\t<Special_Swap>0x2854D2</Special_Swap>\n\t\t<SpecialDk_Swap>0x202B87</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x1D2562</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x5351F5</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFAFBFF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xE8EDFF</ClothLt_Swap>\n\t\t<Cloth_Swap>0xC3CDEB</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA5AFCE</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFFE6</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFFF99</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xF6D356</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xDC9F26</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xFBC14A</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,TeamBlue1,HomeTeam,Ranked,CommunityColors,Yellow,GameFuel,Esport,BattlePass03,Space,Anniversary,BP11,HomeTeamReunion</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamBlue1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0xF6D356</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Crystalforged\">\n\t\t<ColorSchemeID>82</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Crystalforged_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Crystalforged</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>33</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x5DA2B2</HairLt_Swap>\n\t\t<Hair_Swap>0x3C5177</Hair_Swap>\n\t\t<HairDk_Swap>0x1E1E2C</HairDk_Swap>\n\t\t<Body1VL_Swap>0xC6FFDD</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x8FFDFF</Body1Lt_Swap>\n\t\t<Body1_Swap>0x7DCFFF</Body1_Swap>\n\t\t<Body1Dk_Swap>0x5773E9</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x3B297A</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x9AB6F8</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x829BD2</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x4B688D</Body2Lt_Swap>\n\t\t<Body2_Swap>0x303958</Body2_Swap>\n\t\t<Body2Dk_Swap>0x181F3C</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x181223</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x443A85</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xBBF4CD</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x88E8DC</SpecialLt_Swap>\n\t\t<Special_Swap>0x45B5D3</Special_Swap>\n\t\t<SpecialDk_Swap>0x396FDE</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x273FBF</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x6B78CD</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF0FFF4</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xE9FCE5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xD6F9E9</Cloth_Swap>\n\t\t<ClothDk_Swap>0xAEDCF4</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xEAFFD8</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xC4FAC8</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x73EDD6</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x3074A5</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x42B7C3</WeaponAcc_Swap>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Space\">\n\t\t<ColorSchemeID>32</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Space_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP5</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS5Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_DevOnly</UniversalIconFileName>\n\t\t<OrderID>34</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x48537D</HairLt_Swap>\n\t\t<Hair_Swap>0x252F4A</Hair_Swap>\n\t\t<HairDk_Swap>0x131329</HairDk_Swap>\n\t\t<Body1VL_Swap>0xDDBFB5</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x8C92AD</Body1Lt_Swap>\n\t\t<Body1_Swap>0x4A79AB</Body1_Swap>\n\t\t<Body1Dk_Swap>0x424A71</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x262846</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x566AAD</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFFFF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF5F2E9</Body2Lt_Swap>\n\t\t<Body2_Swap>0xE1DDD8</Body2_Swap>\n\t\t<Body2Dk_Swap>0xBFB4B4</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x948A90</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xEBD4CF</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xEEFFEA</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xCEFAF5</SpecialLt_Swap>\n\t\t<Special_Swap>0xAFD9EB</Special_Swap>\n\t\t<SpecialDk_Swap>0x85A7CA</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x6879A3</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xB7D5FF</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFFFF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF5F2E9</ClothLt_Swap>\n\t\t<Cloth_Swap>0xE1DDD8</Cloth_Swap>\n\t\t<ClothDk_Swap>0xBFB4B4</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFDFDE7</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xF6E6C6</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xD9BDA3</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x97807D</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xC69F9A</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,TeamBlue1,Anniversary,CommunityColors2,Cyan,Grey,BattlePass01,BattlePass03,Esport,Ranked2,Anniversary,Ranked,White,EsportHelios,BP10,EsportSeafoam</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamBlue1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0x4A79AB</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"CommunityColors2\">\n\t\t<ColorSchemeID>33</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_CommunityColors2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_CommunityColor2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>35</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFFDE8</HairLt_Swap>\n\t\t<Hair_Swap>0xFADBBE</Hair_Swap>\n\t\t<HairDk_Swap>0xDEA9AE</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFCBC5</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xC58A93</Body1Lt_Swap>\n\t\t<Body1_Swap>0x795963</Body1_Swap>\n\t\t<Body1Dk_Swap>0x433347</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x271B34</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xA37891</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFBFDFF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF2FFF6</Body2Lt_Swap>\n\t\t<Body2_Swap>0xCAF1FC</Body2_Swap>\n\t\t<Body2Dk_Swap>0x8AA3C2</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x607497</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xA9B1E1</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFE8F1</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF5A3B7</SpecialLt_Swap>\n\t\t<Special_Swap>0xD67E9F</Special_Swap>\n\t\t<SpecialDk_Swap>0xC16197</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x89388D</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xF05A8E</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF5FBFB</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xDDECFD</ClothLt_Swap>\n\t\t<Cloth_Swap>0xD4E1F3</Cloth_Swap>\n\t\t<ClothDk_Swap>0xAEB9CF</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFEF3E8</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xECC7A6</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xD5A291</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x9A6864</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xC2746C</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Brown,Pink,Spring,BP6,CommunityColors,Orange,Valhallentines,Space,EsportPink,Bifrost,BP10,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x795963</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"EsportElectric\">\n\t\t<ColorSchemeID>34</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Esports3_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Esport3</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_Esport3Universal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>36</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x316379</HairLt_Swap>\n\t\t<Hair_Swap>0x1F2B40</Hair_Swap>\n\t\t<HairDk_Swap>0x1F0D23</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFAFFEA</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFCFFB4</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFFE467</Body1_Swap>\n\t\t<Body1Dk_Swap>0xFFB151</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xF18447</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xEBE86E</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x6EEA98</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x39AC94</Body2Lt_Swap>\n\t\t<Body2_Swap>0x31838A</Body2_Swap>\n\t\t<Body2Dk_Swap>0x385C85</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x34304F</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x4275AE</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xEAFF7B</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x9FE75D</SpecialLt_Swap>\n\t\t<Special_Swap>0x42BE94</Special_Swap>\n\t\t<SpecialDk_Swap>0x3E9EB9</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x4A6EB4</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x42BADC</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFF8C8</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xEFFFA3</ClothLt_Swap>\n\t\t<Cloth_Swap>0xD4FFBE</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA5EEFF</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0x2D7486</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x1D4D6C</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x1A293C</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x150B13</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x392257</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Yellow,Summer,Green,Orange,Spring,BP7,Esport,TeamYellow1,Bifrost,Summer2,StPaddy,TeamBlue1,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xFFE467</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BP6\">\n\t\t<ColorSchemeID>35</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BP6_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP6</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS6Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_BattlePass</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>37</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x576D77</HairLt_Swap>\n\t\t<Hair_Swap>0x333243</Hair_Swap>\n\t\t<HairDk_Swap>0x201928</HairDk_Swap>\n\t\t<Body1VL_Swap>0xDDB28B</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xA37C6D</Body1Lt_Swap>\n\t\t<Body1_Swap>0x795963</Body1_Swap>\n\t\t<Body1Dk_Swap>0x433347</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x2E1934</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x5E4E6D</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x80AA98</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x547577</Body2Lt_Swap>\n\t\t<Body2_Swap>0x3B4A65</Body2_Swap>\n\t\t<Body2Dk_Swap>0x322C47</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x140512</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x504668</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFBC7</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xE7FF82</SpecialLt_Swap>\n\t\t<Special_Swap>0xAACE5A</Special_Swap>\n\t\t<SpecialDk_Swap>0x80A261</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x4F6841</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x98CD7A</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFBF8DD</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF5E3CF</ClothLt_Swap>\n\t\t<Cloth_Swap>0xD9CDC9</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA79B9C</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFFF9</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xF7FFBB</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xBCEE8C</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x7AA26D</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x97BDA9</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Brown,CommunityColors,CommunityColors2,Grey,Black,Brawlhalloween,GameFuel,BattlePass01,Green,EsportHelios,BP11,ArtDeco,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xAACE5A</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BP7\">\n\t\t<ColorSchemeID>36</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BP7_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP7</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS7Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_BattlePass</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>38</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x50436D</HairLt_Swap>\n\t\t<Hair_Swap>0x241A39</Hair_Swap>\n\t\t<HairDk_Swap>0x120E1B</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFEF1</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFFCAD</Body1Lt_Swap>\n\t\t<Body1_Swap>0xBBEB83</Body1_Swap>\n\t\t<Body1Dk_Swap>0x80C577</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x649384</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xBDF486</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xD5BDFF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xB48FD6</Body2Lt_Swap>\n\t\t<Body2_Swap>0x8B5C9B</Body2_Swap>\n\t\t<Body2Dk_Swap>0x503967</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x1C1C48</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x6A5290</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFDFFE7</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFCFFCC</SpecialLt_Swap>\n\t\t<Special_Swap>0xE2FF82</Special_Swap>\n\t\t<SpecialDk_Swap>0xBBD959</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x88A843</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xD1FF7C</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xEFF3FF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xCCCDF1</ClothLt_Swap>\n\t\t<Cloth_Swap>0xBFB8D1</Cloth_Swap>\n\t\t<ClothDk_Swap>0x8B85B1</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFDD9</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xF8FF4D</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xADEF00</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x55D100</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xA6F452</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blacklight,Brawlhalloween2,Green,Spring,EsportElectric,GameFuel,TeamYellow1,Bifrost,BP10,BP11,BattlePass01,Valhallentines,Valhallentines2,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xBBF12B</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"100Mil\">\n\t\t<ColorSchemeID>37</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_100Mil_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_100Mil</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_100MilGold</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<OrderID>39</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<HairLt_Swap>0x683F88</HairLt_Swap>\n\t\t<Hair_Swap>0x402860</Hair_Swap>\n\t\t<HairDk_Swap>0x1B1234</HairDk_Swap>\n\t\t<Body1VL_Swap>0x7C6B96</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x4B436A</Body1Lt_Swap>\n\t\t<Body1_Swap>0x342F48</Body1_Swap>\n\t\t<Body1Dk_Swap>0x1D192B</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x060508</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x3C2E5A</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x3D3D56</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x212130</Body2Lt_Swap>\n\t\t<Body2_Swap>0x15131C</Body2_Swap>\n\t\t<Body2Dk_Swap>0x0C0A0D</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x040008</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x1C1033</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xEE5BFF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xAB48EE</SpecialLt_Swap>\n\t\t<Special_Swap>0x852FF4</Special_Swap>\n\t\t<SpecialDk_Swap>0x6233E5</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x372CAF</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x7345F3</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xCABAEA</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xA096C7</ClothLt_Swap>\n\t\t<Cloth_Swap>0x8F80B3</Cloth_Swap>\n\t\t<ClothDk_Swap>0x585888</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xAA90FF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x7B5BF1</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x4B27BB</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x2D0F52</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x4E178B</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Purple,Black,GameFuel,BattlePass01,BattlePass02,Esport,EsportRed,Brawlhalloween,Ranked,Anniversary,BP8,BP9,BP11,BP12,ArtDeco,EsportDigital,HomeTeamReunion,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x852FF4</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"EsportPink\">\n\t\t<ColorSchemeID>38</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Esports4_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Esport4</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>40</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFF3BE</HairLt_Swap>\n\t\t<Hair_Swap>0xF9C694</Hair_Swap>\n\t\t<HairDk_Swap>0xF2976E</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFDEE2</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFBEC5</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFB9094</Body1_Swap>\n\t\t<Body1Dk_Swap>0xD87189</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xB74775</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xF8A2D5</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFEFB</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFFFEE7</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFFE3D6</Body2_Swap>\n\t\t<Body2Dk_Swap>0xF6CACA</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xD59DAB</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xFFD9E4</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFDF6</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFF8BD</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFCE7B</Special_Swap>\n\t\t<SpecialDk_Swap>0xFFA063</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xD66D3D</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFFE69D</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFEF4</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFFF7D6</ClothLt_Swap>\n\t\t<Cloth_Swap>0xF6DFB8</Cloth_Swap>\n\t\t<ClothDk_Swap>0xF1BC9B</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFDF1</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFEBBB</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xEDBC6B</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xC6823D</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xE99E6F</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Yellow,Pink,Valhallentines,Spring,CommunityColors2,TeamRed1,TeamYellow1,Bifrost,BP10,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamRed1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0xFB9094</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BP8\">\n\t\t<ColorSchemeID>39</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BP8_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_DarkHeart</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS8Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_DevOnly</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>41</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFFFFF</HairLt_Swap>\n\t\t<Hair_Swap>0xF5F3FF</Hair_Swap>\n\t\t<HairDk_Swap>0xB0B0E2</HairDk_Swap>\n\t\t<Body1VL_Swap>0x88B1DB</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x5F7FA7</Body1Lt_Swap>\n\t\t<Body1_Swap>0x484F6B</Body1_Swap>\n\t\t<Body1Dk_Swap>0x23263E</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x10091E</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x4C3A7B</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xEEEFF9</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xE6EAF6</Body2Lt_Swap>\n\t\t<Body2_Swap>0xBFC6DE</Body2_Swap>\n\t\t<Body2Dk_Swap>0x9393BE</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x776A91</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x433D7C</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFB4AA</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFF7387</SpecialLt_Swap>\n\t\t<Special_Swap>0xFE0174</Special_Swap>\n\t\t<SpecialDk_Swap>0xC70176</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x7B0048</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFB26A4</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0x958AB6</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x6D628F</ClothLt_Swap>\n\t\t<Cloth_Swap>0x52496F</Cloth_Swap>\n\t\t<ClothDk_Swap>0x221A41</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFCEF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFF5B6</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xDDC08C</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x977456</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xC28E64</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Purple,Cyan,BattlePass01,BattlePass02,100Mil,Ranked,OEL1,Sunset,HomeTeam,Bifrost,EsportSeafoam,EsportDigital,HomeTeamReunion,BP12,Blacklight</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x484F6B</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BP9\">\n\t\t<ColorSchemeID>40</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BP9_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP9</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS9Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_DevOnly</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>42</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x433434</HairLt_Swap>\n\t\t<Hair_Swap>0x1E1717</Hair_Swap>\n\t\t<HairDk_Swap>0x060404</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFF6641</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xBA3031</Body1Lt_Swap>\n\t\t<Body1_Swap>0x82172B</Body1_Swap>\n\t\t<Body1Dk_Swap>0x341629</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x080004</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x511A3F</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x586750</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x383B3C</Body2Lt_Swap>\n\t\t<Body2_Swap>0x32252B</Body2_Swap>\n\t\t<Body2Dk_Swap>0x15161B</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x060001</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x2D2539</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xD8FFF7</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xCFFFD1</SpecialLt_Swap>\n\t\t<Special_Swap>0xF5FFB3</Special_Swap>\n\t\t<SpecialDk_Swap>0xFFE19B</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xFFA083</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE3FFB9</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xEDFFB8</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF8D876</ClothLt_Swap>\n\t\t<Cloth_Swap>0xF9AE69</Cloth_Swap>\n\t\t<ClothDk_Swap>0xEE7651</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF5FF95</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFDE61</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xEC9A44</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xD34147</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xFF5C4F</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>TeamRed1,Black,EsportRed,HomeTeam,Brown,Red,GameFuel,Brawlhalloween,100Mil,OEL1,Summer,BP11,BP12,ArtDeco,HomeTeamReunion,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamRed1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0x82172B</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Bifrost\">\n\t\t<ColorSchemeID>41</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Bifrost_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Bifrost</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_BifrostGold</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<OrderID>43</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<HairLt_Swap>0xFFFAC1</HairLt_Swap>\n\t\t<Hair_Swap>0xE3FF8B</Hair_Swap>\n\t\t<HairDk_Swap>0xA8FFC3</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFBFF9C</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xCFFFAB</Body1Lt_Swap>\n\t\t<Body1_Swap>0x94FFF6</Body1_Swap>\n\t\t<Body1Dk_Swap>0x94BFFF</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x8F7BF7</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xD9BEFF</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x6FFFCF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x51E6FF</Body2Lt_Swap>\n\t\t<Body2_Swap>0x5193FF</Body2_Swap>\n\t\t<Body2Dk_Swap>0x6E51FF</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x7D00DD</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xBF52FF</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF8FFCC</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFEB99</SpecialLt_Swap>\n\t\t<Special_Swap>0xFF9189</Special_Swap>\n\t\t<SpecialDk_Swap>0xFF619B</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xD62CEC</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE087FF</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFCFFB9</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFFE5B9</ClothLt_Swap>\n\t\t<Cloth_Swap>0xFFBCAD</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE096DF</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xCDFFF2</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFF376</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFFC676</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xFF83E4</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xEDB3FF</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Green,Cyan,TeamBlue1,BattlePass02,BattlePass01,EsportElectric,EsportPink,Sunset,Purple,Pink,BP8,CommunityColors2,Valhallentines,Summer,BP7,Spring,BP10,EsportSeafoam,Summer2,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xADFFF6</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"EsportHelios\">\n\t\t<ColorSchemeID>42</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Esports5_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Esport5</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>44</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x413F3F</HairLt_Swap>\n\t\t<Hair_Swap>0x232222</Hair_Swap>\n\t\t<HairDk_Swap>0x0A0A0A</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFEFB</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xF2F4D4</Body1Lt_Swap>\n\t\t<Body1_Swap>0xD9D9B4</Body1_Swap>\n\t\t<Body1Dk_Swap>0xAFAF92</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x696A58</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xCCC787</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x7D7C7C</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x595757</Body2Lt_Swap>\n\t\t<Body2_Swap>0x413F3F</Body2_Swap>\n\t\t<Body2Dk_Swap>0x232222</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x0A0A0A</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x37342F</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFEDD74</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF7A319</SpecialLt_Swap>\n\t\t<Special_Swap>0xDF6908</Special_Swap>\n\t\t<SpecialDk_Swap>0xB45105</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x793704</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xDE8D00</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFE6E</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFFE041</ClothLt_Swap>\n\t\t<Cloth_Swap>0xFFD226</Cloth_Swap>\n\t\t<ClothDk_Swap>0xD98C00</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFFFC2</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xF6FB36</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFFD227</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xCF7B00</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xE6BA35</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Yellow,Orange,White,BattlePass03,Ranked,Space,Anniversary,BP6,BP12,Brawlhalloween,Black,Grey,ArtDeco,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xFFD227</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BP10\">\n\t\t<ColorSchemeID>43</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BP10_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP10</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS10Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_DevOnly</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>45</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xD7FAE6</HairLt_Swap>\n\t\t<Hair_Swap>0xB3E6F5</Hair_Swap>\n\t\t<HairDk_Swap>0xA6ADF4</HairDk_Swap>\n\t\t<Body1VL_Swap>0xECFFE2</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xD0FFEA</Body1Lt_Swap>\n\t\t<Body1_Swap>0xA6DDFF</Body1_Swap>\n\t\t<Body1Dk_Swap>0x87A2EA</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x7587D3</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xA79EE9</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFAF6</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFFEDF0</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFFCFEA</Body2_Swap>\n\t\t<Body2Dk_Swap>0xCCACF0</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x998EE1</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xE8B8F0</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFBFFF0</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xE2FFE6</SpecialLt_Swap>\n\t\t<Special_Swap>0xD0F5FF</Special_Swap>\n\t\t<SpecialDk_Swap>0x97C3E7</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x85A1E7</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xC4A8F1</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFF9FA</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFFE0DC</ClothLt_Swap>\n\t\t<Cloth_Swap>0xF9C8D5</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE497DD</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFCFFF0</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xCBFFE6</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x80C8DB</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x6689D2</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x7BCFDF</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>TeamBlue1,Pink,EsportPink,Blue,Cyan,White,CommunityColors2,Purple,BP7,Space,Bifrost,BattlePass01,BattlePass02,EsportSeafoam,Valhallentines,HomeTeamReunion,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<FallbackMyTeamColor>TeamBlue1</FallbackMyTeamColor>\n\t\t<IndicatorColor>0xA6DDFF</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BP11\">\n\t\t<ColorSchemeID>44</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BP11_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP11</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS11Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_BattlePass</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>46</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x4A1536</HairLt_Swap>\n\t\t<Hair_Swap>0x240F1C</Hair_Swap>\n\t\t<HairDk_Swap>0x00000D</HairDk_Swap>\n\t\t<Body1VL_Swap>0x527563</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x3F5350</Body1Lt_Swap>\n\t\t<Body1_Swap>0x2A3736</Body1_Swap>\n\t\t<Body1Dk_Swap>0x1A1A1A</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x080B0A</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x362941</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFAB8</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xE3FF71</Body2Lt_Swap>\n\t\t<Body2_Swap>0xB0FF61</Body2_Swap>\n\t\t<Body2Dk_Swap>0x77C567</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x8E813B</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xADCE71</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0x8D071D</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x67041E</SpecialLt_Swap>\n\t\t<Special_Swap>0x46042C</Special_Swap>\n\t\t<SpecialDk_Swap>0x34042D</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x0D0002</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x79215F</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xEEF4AA</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xB4CA92</ClothLt_Swap>\n\t\t<Cloth_Swap>0x7DA579</Cloth_Swap>\n\t\t<ClothDk_Swap>0x5B7A6D</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xDCFFAF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xEEFF19</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xC38619</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x506A33</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x9FA832</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Brawlhalloween,Spring,Esport,Black,HomeTeam,Ranked,Ranked2,Holiday,Green,StPaddy,BattlePass01,BP6,BP7,100Mil,BP9,BP12,EsportRed,GameFuel,ArtDeco,EsportDigital,HomeTeamReunion,Blacklight,Brawlhalloween2,HolidayJolly,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xB0FF61</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"ArtDeco\">\n\t\t<ColorSchemeID>45</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_ArtDeco_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_ArtDeco</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_ArtDecoUniversal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_TimedEvents</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>47</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<HairLt_Swap>0xFFE6E6</HairLt_Swap>\n\t\t<Hair_Swap>0xFFC269</Hair_Swap>\n\t\t<HairDk_Swap>0xC96E59</HairDk_Swap>\n\t\t<Body1VL_Swap>0x3A3A4C</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x29252E</Body1Lt_Swap>\n\t\t<Body1_Swap>0x1A171C</Body1_Swap>\n\t\t<Body1Dk_Swap>0x0D090C</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x070702</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x2E1D28</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x5A3E58</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x392D40</Body2Lt_Swap>\n\t\t<Body2_Swap>0x252029</Body2_Swap>\n\t\t<Body2Dk_Swap>0x171017</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x0D0813</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x30253D</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF3FFFA</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF5FFBF</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFCB69</Special_Swap>\n\t\t<SpecialDk_Swap>0xA05128</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x3C1420</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xC05E61</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFF1BE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF9CE96</ClothLt_Swap>\n\t\t<Cloth_Swap>0xBB9A7B</Cloth_Swap>\n\t\t<ClothDk_Swap>0x896355</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF1FFE2</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFF0AF</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFFC269</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xCF7953</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xC495A2</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Purple,Brown,Grey,Brawlhalloween,HomeTeam,GameFuel,EsportRed,BP6,100Mil,BP9,EsportHelios,BP11,BP12,Esport,Black,EsportDigital,HomeTeamReunion,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x252029</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"EsportSeafoam\">\n\t\t<ColorSchemeID>46</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_EsportSeafoam_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Esport6</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>48</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x686386</HairLt_Swap>\n\t\t<Hair_Swap>0x3A2B41</Hair_Swap>\n\t\t<HairDk_Swap>0x29182B</HairDk_Swap>\n\t\t<Body1VL_Swap>0x83AFB4</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x5B7C8F</Body1Lt_Swap>\n\t\t<Body1_Swap>0x3B4A65</Body1_Swap>\n\t\t<Body1Dk_Swap>0x332C47</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x281B30</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x4B345C</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFFF6</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF1FFD9</Body2Lt_Swap>\n\t\t<Body2_Swap>0xCEFFD7</Body2_Swap>\n\t\t<Body2Dk_Swap>0x8DD9C1</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x637D94</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xADD4DE</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF4B577</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF35B5B</SpecialLt_Swap>\n\t\t<Special_Swap>0xDE304A</Special_Swap>\n\t\t<SpecialDk_Swap>0x761236</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x532048</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x812361</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xEAFFD8</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xB2DBB4</ClothLt_Swap>\n\t\t<Cloth_Swap>0x97C3B5</Cloth_Swap>\n\t\t<ClothDk_Swap>0x47516A</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0x6B8197</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x464067</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x2B2037</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x210E24</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x4B2940</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Green,Purple,TeamBlue1,CommunityColors,BattlePass01,Esport,Space,Summer,Ranked,BP8,Bifrost,BP10,Cyan,Summer2,EsportDigital</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x97C3B5</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"EsportV7\">\n\t\t<ColorSchemeID>84</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_EsportV7_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_EsportV7</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>49</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xDEB97C</HairLt_Swap>\n\t\t<Hair_Swap>0xA27756</Hair_Swap>\n\t\t<HairDk_Swap>0x50322A</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFAD4</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xBDE8AC</Body1Lt_Swap>\n\t\t<Body1_Swap>0x9ACFAF</Body1_Swap>\n\t\t<Body1Dk_Swap>0x418280</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x223B4F</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x53A777</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x9C8B31</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x734726</Body2Lt_Swap>\n\t\t<Body2_Swap>0x473423</Body2_Swap>\n\t\t<Body2Dk_Swap>0x261A12</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x170A0E</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x3D221D</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFF678</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFB938</SpecialLt_Swap>\n\t\t<Special_Swap>0xEB8527</Special_Swap>\n\t\t<SpecialDk_Swap>0x7D4026</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x56202A</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xAC772A</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF9EFB7</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF1E083</ClothLt_Swap>\n\t\t<Cloth_Swap>0xE8B96F</Cloth_Swap>\n\t\t<ClothDk_Swap>0xC6783D</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xDCF07D</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xBFB54C</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x997944</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x4C3730</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x575C3E</WeaponAcc_Swap>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Guild\">\n\t\t<ColorSchemeID>81</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Guild_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Guild</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>50</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x2A523C</HairLt_Swap>\n\t\t<Hair_Swap>0x172330</Hair_Swap>\n\t\t<HairDk_Swap>0x0A131D</HairDk_Swap>\n\t\t<Body1VL_Swap>0xE2E67F</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x478858</Body1Lt_Swap>\n\t\t<Body1_Swap>0x09485C</Body1_Swap>\n\t\t<Body1Dk_Swap>0x18222D</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x09151D</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x256755</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x13CD9F</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x036D9B</Body2Lt_Swap>\n\t\t<Body2_Swap>0x1D2C50</Body2_Swap>\n\t\t<Body2Dk_Swap>0x191130</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x00030E</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x343079</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xE8EA6E</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xA5D651</SpecialLt_Swap>\n\t\t<Special_Swap>0x4C8945</Special_Swap>\n\t\t<SpecialDk_Swap>0x1D453C</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x18252C</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x3E8A7C</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFF5C7</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFEEA7A</ClothLt_Swap>\n\t\t<Cloth_Swap>0xD4E94D</Cloth_Swap>\n\t\t<ClothDk_Swap>0x547E36</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFEFFB2</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xDEF24C</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x9DCB11</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x286731</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x6FA962</WeaponAcc_Swap>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Summer2\">\n\t\t<ColorSchemeID>47</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Summer2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Summer2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_Summer2Universal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>51</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xF7F59F</HairLt_Swap>\n\t\t<Hair_Swap>0xEDCD6D</Hair_Swap>\n\t\t<HairDk_Swap>0xC78357</HairDk_Swap>\n\t\t<Body1VL_Swap>0xCCFFE1</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x7CFCFF</Body1Lt_Swap>\n\t\t<Body1_Swap>0x55D7FF</Body1_Swap>\n\t\t<Body1Dk_Swap>0x3486F4</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x303B9E</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x3BD2D6</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFFDD8</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFFF865</Body2Lt_Swap>\n\t\t<Body2_Swap>0xD4FF48</Body2_Swap>\n\t\t<Body2Dk_Swap>0x8CF670</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x62DE9B</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xAAFFE5</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFCFFF6</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xEFFF6E</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFEE36</Special_Swap>\n\t\t<SpecialDk_Swap>0xF79D00</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xE65B00</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFEC927</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFEFFF9</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFFFDDA</ClothLt_Swap>\n\t\t<Cloth_Swap>0xFFF4B8</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE3B593</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF5FFC8</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFBE712</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xF78D23</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xD54914</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xFF815B</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Green,Cyan,EsportElectric,Spring,TeamBlue1,Bifrost,EsportSeafoam,CommunityColors,Esport,Ranked,Bifrost</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x55D7FF</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"EsportDigital\">\n\t\t<ColorSchemeID>48</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_EsportDigital_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_EsportDigital</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<InfinityIconName>a_ColorIcon_EsportDigitalInfinity</InfinityIconName>\n\t\t<InfinityIconFileName>UI_Icons</InfinityIconFileName>\n\t\t<OrderID>52</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x61FFDC</HairLt_Swap>\n\t\t<Hair_Swap>0x26C2E2</Hair_Swap>\n\t\t<HairDk_Swap>0x455FC4</HairDk_Swap>\n\t\t<Body1VL_Swap>0x5B685E</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x454D47</Body1Lt_Swap>\n\t\t<Body1_Swap>0x363636</Body1_Swap>\n\t\t<Body1Dk_Swap>0x1F1F20</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x141414</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x354656</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFD5DA</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF778BB</Body2Lt_Swap>\n\t\t<Body2_Swap>0xF5018A</Body2_Swap>\n\t\t<Body2Dk_Swap>0xA215A5</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x63127A</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x8D6DC0</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xEBFFBC</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x9AFC34</SpecialLt_Swap>\n\t\t<Special_Swap>0x28DF89</Special_Swap>\n\t\t<SpecialDk_Swap>0x1DAB87</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x007565</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x64DBCD</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xECF2F6</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xC2D6D2</ClothLt_Swap>\n\t\t<Cloth_Swap>0x96A7AF</Cloth_Swap>\n\t\t<ClothDk_Swap>0x656E84</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0x61FFDC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x26C2E2</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x1F98CF</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x455FC4</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x4C95A0</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Black,GameFuel,100Mil,BattlePass01,BattlePass03,BP11,BP8,BP12,Esport,EsportRed,ArtDeco,EsportSeafoam,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x363636</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"CMYK\">\n\t\t<ColorSchemeID>85</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_CMYK_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_CMYK</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>53</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x4F0E62</HairLt_Swap>\n\t\t<Hair_Swap>0x131325</Hair_Swap>\n\t\t<HairDk_Swap>0x09090B</HairDk_Swap>\n\t\t<Body1VL_Swap>0x43314F</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x1B212F</Body1Lt_Swap>\n\t\t<Body1_Swap>0x17191F</Body1_Swap>\n\t\t<Body1Dk_Swap>0x0C0C14</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x05070B</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x341121</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFD260</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFF7C4A</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFF245C</Body2_Swap>\n\t\t<Body2Dk_Swap>0x9E194B</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x6F1751</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xC54C55</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xCFFFE9</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF1FFA6</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFF457</Special_Swap>\n\t\t<SpecialDk_Swap>0xFA8A78</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xF8186A</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFCA4B6</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFEB7</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xB7FFBF</ClothLt_Swap>\n\t\t<Cloth_Swap>0x3DFFF5</Cloth_Swap>\n\t\t<ClothDk_Swap>0x4EAADD</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xDDFFEF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xC3FFB6</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFFF679</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xF36637</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x7EB3AD</WeaponAcc_Swap>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xFF245C</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"HomeTeamReunion\">\n\t\t<ColorSchemeID>49</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_HomeTeamReunion_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BacktoSchool2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_BacktoSchool2Universal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>54</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xCF3E3E</HairLt_Swap>\n\t\t<Hair_Swap>0x52203F</Hair_Swap>\n\t\t<HairDk_Swap>0x2B0F34</HairDk_Swap>\n\t\t<Body1VL_Swap>0x39D7D8</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x0C65D0</Body1Lt_Swap>\n\t\t<Body1_Swap>0x003FB7</Body1_Swap>\n\t\t<Body1Dk_Swap>0x341C66</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x240E3A</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x7B2793</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x723A75</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x44258D</Body2Lt_Swap>\n\t\t<Body2_Swap>0x24216E</Body2_Swap>\n\t\t<Body2Dk_Swap>0x0F1740</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x080722</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x422B6E</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xDD8949</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xBF3D3B</SpecialLt_Swap>\n\t\t<Special_Swap>0x94243D</Special_Swap>\n\t\t<SpecialDk_Swap>0x5B1838</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x34182E</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x6F2B61</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0x3A79C7</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x3E5BA3</ClothLt_Swap>\n\t\t<Cloth_Swap>0x2E3075</Cloth_Swap>\n\t\t<ClothDk_Swap>0x261F39</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xDDFFD5</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFDB81</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFFA45E</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xB0626B</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xB885DB</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Black,Ranked,Brawlhalloween,Ranked2,EsportRed,Blue,BattlePass02,BP9,BP8,BP11,ArtDeco,Blue,BattlePass01,HomeTeam,100Mil,BP10,Blacklight</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x003FB7</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"BP12\">\n\t\t<ColorSchemeID>50</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_BP12_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_BP12</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_BPIconS12Color2</UniversalIconName>\n\t\t<UniversalIconFileName>UI_BattlePass</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>55</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x462692</HairLt_Swap>\n\t\t<Hair_Swap>0x161121</Hair_Swap>\n\t\t<HairDk_Swap>0x07081A</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFFFF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xE4EEFD</Body1Lt_Swap>\n\t\t<Body1_Swap>0xDBD8E8</Body1_Swap>\n\t\t<Body1Dk_Swap>0x8A8199</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x454150</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xA7B3D9</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x737792</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x434858</Body2Lt_Swap>\n\t\t<Body2_Swap>0x2F2F3B</Body2_Swap>\n\t\t<Body2Dk_Swap>0x242035</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x18132A</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x464074</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFF4793</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xD136C4</SpecialLt_Swap>\n\t\t<Special_Swap>0xA019E5</Special_Swap>\n\t\t<SpecialDk_Swap>0x5A01B3</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x3805A7</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xB1234C</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xAE90D6</ClothVL_Swap>\n\t\t<ClothLt_Swap>0x8A6791</ClothLt_Swap>\n\t\t<Cloth_Swap>0x504158</Cloth_Swap>\n\t\t<ClothDk_Swap>0x2A263B</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0x4FFFC9</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x31ABF1</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x2A3C9F</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x2F125F</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x6E3FB0</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Purple,Black,GameFuel,BattlePass01,BattlePass02,BattlePass03,Grey,100Mil,EsportHelios,Esport,Brawlhalloween,Ranked,Anniversary,BP8,BP9,BP11,ArtDeco,EsportDigital,White,OEL1,Blacklight,Brawlhalloween2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xDBD8E8</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Dragonfire\">\n\t\t<ColorSchemeID>83</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Dragonfire_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Dragonfire</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>56</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFB436</HairLt_Swap>\n\t\t<Hair_Swap>0xFF6736</Hair_Swap>\n\t\t<HairDk_Swap>0xA13049</HairDk_Swap>\n\t\t<Body1VL_Swap>0x5B113D</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x370D2A</Body1Lt_Swap>\n\t\t<Body1_Swap>0x230B1F</Body1_Swap>\n\t\t<Body1Dk_Swap>0x0D000F</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x00000B</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x33021B</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFF0B49</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xBE1851</Body2Lt_Swap>\n\t\t<Body2_Swap>0x7C0046</Body2_Swap>\n\t\t<Body2Dk_Swap>0x53003B</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x2B0F34</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x9B1633</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFA343</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF65242</SpecialLt_Swap>\n\t\t<Special_Swap>0xCC224E</Special_Swap>\n\t\t<SpecialDk_Swap>0x99004D</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x830B7B</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xBE2437</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xECADA0</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xC78582</ClothLt_Swap>\n\t\t<Cloth_Swap>0x966164</Cloth_Swap>\n\t\t<ClothDk_Swap>0x6C4C52</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF8EF99</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFCB68</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xE4984F</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xB1664C</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xF69F62</WeaponAcc_Swap>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"StainedGlass\">\n\t\t<ColorSchemeID>86</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_StainedGlass_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_StainedGlass</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>57</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFFF8D9</HairLt_Swap>\n\t\t<Hair_Swap>0xFFD8B0</Hair_Swap>\n\t\t<HairDk_Swap>0xAC648F</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFEFFF8</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFFAE6</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFFEFFA</Body1_Swap>\n\t\t<Body1Dk_Swap>0xE7CAEC</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xA385A8</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xFBE4FE</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xCD6877</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xA74A6A</Body2Lt_Swap>\n\t\t<Body2_Swap>0x7E3965</Body2_Swap>\n\t\t<Body2Dk_Swap>0x4F1F48</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x301A36</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x9B5673</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFF6CA</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFD5A0</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFB3E7</Special_Swap>\n\t\t<SpecialDk_Swap>0xADA5FF</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x907DEF</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xC6C3FA</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFCF7</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFFE9F2</ClothLt_Swap>\n\t\t<Cloth_Swap>0xF2D9E3</Cloth_Swap>\n\t\t<ClothDk_Swap>0xBD9EB3</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFAFFD2</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFBE991</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xF6C770</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x9B6746</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xEC96A5</WeaponAcc_Swap>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Blacklight\">\n\t\t<ColorSchemeID>51</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Blacklight_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Blacklight</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>58</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x3EA2E0</HairLt_Swap>\n\t\t<Hair_Swap>0x5348C7</Hair_Swap>\n\t\t<HairDk_Swap>0x412065</HairDk_Swap>\n\t\t<Body1VL_Swap>0x65769E</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x555576</Body1Lt_Swap>\n\t\t<Body1_Swap>0x262843</Body1_Swap>\n\t\t<Body1Dk_Swap>0x180F23</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x080010</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x074D5E</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x6BB8F1</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x5F7DDB</Body2Lt_Swap>\n\t\t<Body2_Swap>0x5C3DCA</Body2_Swap>\n\t\t<Body2Dk_Swap>0x2B277B</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x101141</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x216780</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFD96</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xDCFF4D</SpecialLt_Swap>\n\t\t<Special_Swap>0x94FF3E</Special_Swap>\n\t\t<SpecialDk_Swap>0x3EEF34</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x00AF58</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xB8FFDB</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xD9F9FF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xAFD4FD</ClothLt_Swap>\n\t\t<Cloth_Swap>0x98AEE2</Cloth_Swap>\n\t\t<ClothDk_Swap>0x7478A7</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFCFFEB</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xD5FFBF</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x91FF7B</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x42C277</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x60EDAB</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>BP7,Purple,Black,GameFuel,BattlePass01,BattlePass02,BattlePass03,100Mil,EsportHelios,Esport,Brawlhalloween,Brawlhalloween2,Ranked,Anniversary,BP8,BP9,BP11,ArtDeco,EsportDigital,OEL1,BP12,Blue,Green,HomeTeamReunion</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x262843</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Brawlhalloween2\">\n\t\t<ColorSchemeID>52</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Brawlhalloween2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Pumpkin2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_Pumpkin2Universal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>59</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0x58375A</HairLt_Swap>\n\t\t<Hair_Swap>0x30293B</Hair_Swap>\n\t\t<HairDk_Swap>0x212126</HairDk_Swap>\n\t\t<Body1VL_Swap>0xBA69BD</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x8B58AD</Body1Lt_Swap>\n\t\t<Body1_Swap>0x613782</Body1_Swap>\n\t\t<Body1Dk_Swap>0x3D2645</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x1B1728</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x5D4F87</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0x6F5A69</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x453548</Body2Lt_Swap>\n\t\t<Body2_Swap>0x212126</Body2_Swap>\n\t\t<Body2Dk_Swap>0x171519</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x0B090D</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x493434</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFBDD</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFF26D</SpecialLt_Swap>\n\t\t<Special_Swap>0xC6EF41</Special_Swap>\n\t\t<SpecialDk_Swap>0xA3DE15</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x6CB11F</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xC5FF85</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFF9BE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFFE195</ClothLt_Swap>\n\t\t<Cloth_Swap>0xFFBF70</Cloth_Swap>\n\t\t<ClothDk_Swap>0xC77536</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFE7A0</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFAC36</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xE77123</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x9E351B</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xC89641</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>BP7,Black,HomeTeam,EsportRed,BP6,100Mil,Esport,BP9,EsportHelios,BP11,BP12,ArtDeco,Brawlhalloween,Ranked,BattlePass01,Blacklight,GameFuel,Grey,EsportDigital</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x613782</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"HolidayJolly\">\n\t\t<ColorSchemeID>53</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_HolidayJolly_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_HolidayJolly</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_HolidayJollyUniversal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>60</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFF8743</HairLt_Swap>\n\t\t<Hair_Swap>0xE93030</Hair_Swap>\n\t\t<HairDk_Swap>0x721227</HairDk_Swap>\n\t\t<Body1VL_Swap>0xECF06B</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xA6C950</Body1Lt_Swap>\n\t\t<Body1_Swap>0x80A256</Body1_Swap>\n\t\t<Body1Dk_Swap>0x3A5947</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x012F33</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x1A6F75</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xE76424</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xCC2D16</Body2Lt_Swap>\n\t\t<Body2_Swap>0x990201</Body2_Swap>\n\t\t<Body2Dk_Swap>0x6C001F</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x480037</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x811E58</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFAFF9A</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFE98B</SpecialLt_Swap>\n\t\t<Special_Swap>0xF1C85D</Special_Swap>\n\t\t<SpecialDk_Swap>0xBF7134</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x8A4408</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xED9D4C</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFF797</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xC1DE70</ClothLt_Swap>\n\t\t<Cloth_Swap>0xB3BC56</Cloth_Swap>\n\t\t<ClothDk_Swap>0x565F35</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFCFFE0</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFF1A2</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xF5C858</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xA76E24</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xEAA46E</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Green,StPaddy,GameFuel,BattlePass03,Spring,BP11,Red,Holiday,StPaddy2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x80A256</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"Valhallentines2\">\n\t\t<ColorSchemeID>54</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_Heartfelt_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Valentines2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_Valentines2Universal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<UniversalIconOriginalDimension>80</UniversalIconOriginalDimension>\n\t\t<OrderID>61</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xFEE2D8</HairLt_Swap>\n\t\t<Hair_Swap>0xF3979B</Hair_Swap>\n\t\t<HairDk_Swap>0x996399</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFAFFF1</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xF0FDFF</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFCE5EE</Body1_Swap>\n\t\t<Body1Dk_Swap>0xDEC4E1</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xBAA2D1</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xC1CDED</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFEDDC</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFFC5BE</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFCA8AB</Body2_Swap>\n\t\t<Body2Dk_Swap>0xE77D96</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xC15E91</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xF0BDDE</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFD2C7</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFF8C98</SpecialLt_Swap>\n\t\t<Special_Swap>0xE86085</Special_Swap>\n\t\t<SpecialDk_Swap>0xB74174</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x952B66</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xCF8CCE</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFFCF6</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xF3FFF4</ClothLt_Swap>\n\t\t<Cloth_Swap>0xFDFBD3</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE1B19A</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFE1BB</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFF97A7</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFF597F</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xB63F75</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xD66FB0</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Red,Pink,TeamRed1,Sunset,BattlePass03,Spring,CommunityColors2,BattlePass02,EsportPink,Bifrost,BP10,BP7,Valhallentines</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xFFF0F5</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"StPaddy2\">\n\t\t<ColorSchemeID>55</ColorSchemeID>\n\t\t<DefaultUnlocked>false</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_StPaddy2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Shamrock2</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<UniversalIconName>a_ColorIcon_StPaddy2Universal</UniversalIconName>\n\t\t<UniversalIconFileName>UI_Icons</UniversalIconFileName>\n\t\t<OrderID>62</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>0</TeamColor>\n\t\t<HairLt_Swap>0xF1E6B3</HairLt_Swap>\n\t\t<Hair_Swap>0xDCC999</Hair_Swap>\n\t\t<HairDk_Swap>0x8D8C74</HairDk_Swap>\n\t\t<Body1VL_Swap>0xD4D650</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x8CA334</Body1Lt_Swap>\n\t\t<Body1_Swap>0x657E20</Body1_Swap>\n\t\t<Body1Dk_Swap>0x344516</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x272A0A</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x6A6E1C</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFF69F</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xEBDE5F</Body2Lt_Swap>\n\t\t<Body2_Swap>0xB6AD4E</Body2_Swap>\n\t\t<Body2Dk_Swap>0x736E27</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x4A491D</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xA9914B</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF5DF70</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF4B44B</SpecialLt_Swap>\n\t\t<Special_Swap>0xF2882C</Special_Swap>\n\t\t<SpecialDk_Swap>0xA0491B</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x5B2209</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xBB674C</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFFF7D1</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xE5E3AD</ClothLt_Swap>\n\t\t<Cloth_Swap>0xDCD399</Cloth_Swap>\n\t\t<ClothDk_Swap>0x87926A</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFF6DE</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFF4AA</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xF5CE83</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xBC7532</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xF3BC58</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Green,StPaddy,GameFuel,BattlePass03,Spring,BP11,Holiday,HolidayJolly,BP7,EsportElectric</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x657E20</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"NO_COLOR_SCHEME\">\n\t\t<ColorSchemeID>64</ColorSchemeID>\n\t\t<DefaultUnlocked>TRUE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_NO_COLOR_SCHEME_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_None</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<Rarity>None</Rarity>\n\t\t<TeamColor>False</TeamColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamRed1\">\n\t\t<ColorSchemeID>65</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamRed1_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamRed</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>63</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>1</TeamColor>\n\t\t<HairLt_Swap>0x963E25</HairLt_Swap>\n\t\t<Hair_Swap>0x601B09</Hair_Swap>\n\t\t<HairDk_Swap>0x33160B</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFBC4BB</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xF17872</Body1Lt_Swap>\n\t\t<Body1_Swap>0xCF1F31</Body1_Swap>\n\t\t<Body1Dk_Swap>0x8B274A</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x6D1030</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xEE3064</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xECCDD5</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xBD6B81</Body2Lt_Swap>\n\t\t<Body2_Swap>0x7E4457</Body2_Swap>\n\t\t<Body2Dk_Swap>0x543237</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x382024</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xA14E30</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xE6AABF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xC75295</SpecialLt_Swap>\n\t\t<Special_Swap>0x9B2477</Special_Swap>\n\t\t<SpecialDk_Swap>0x5C2170</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x381843</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xBD3434</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF3E4E1</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xEEBDB7</ClothLt_Swap>\n\t\t<Cloth_Swap>0xC68A91</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA35162</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xECE9E5</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB8B3B3</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x706868</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x322B27</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x937E7B</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Red,Orange,Purple,Brown,Pink,Sunset,Valhallentines,EsportRed,OEL1,EsportPink,BP9,Valhallentines2</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0xCF1F31</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamRed2\">\n\t\t<ColorSchemeID>66</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamRed2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamRed</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>64</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>1</TeamColor>\n\t\t<HairLt_Swap>0x96254A</HairLt_Swap>\n\t\t<Hair_Swap>0x600920</Hair_Swap>\n\t\t<HairDk_Swap>0x330B18</HairDk_Swap>\n\t\t<Body1VL_Swap>0xF79696</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xC92F48</Body1Lt_Swap>\n\t\t<Body1_Swap>0x620030</Body1_Swap>\n\t\t<Body1Dk_Swap>0x27000F</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x190009</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x870076</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xF79696</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xC92F48</Body2Lt_Swap>\n\t\t<Body2_Swap>0x620030</Body2_Swap>\n\t\t<Body2Dk_Swap>0x27000F</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x190009</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x870076</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF79696</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xC92F48</SpecialLt_Swap>\n\t\t<Special_Swap>0x620030</Special_Swap>\n\t\t<SpecialDk_Swap>0x27000F</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x1E030A</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x690268</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF3E4E1</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xEEBDB7</ClothLt_Swap>\n\t\t<Cloth_Swap>0xC68A91</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA35162</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFDBFC</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xCB8DBC</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x9C2946</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x5B0E2A</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xBB2969</WeaponAcc_Swap>\n\t\t<IndicatorColor>0x620030</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamRed3\">\n\t\t<ColorSchemeID>67</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamRed3_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamRed</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>65</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>1</TeamColor>\n\t\t<HairLt_Swap>0xEEC2D5</HairLt_Swap>\n\t\t<Hair_Swap>0xDB95BB</Hair_Swap>\n\t\t<HairDk_Swap>0xA1527D</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFD4E2</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFAAB0</Body1Lt_Swap>\n\t\t<Body1_Swap>0xF7747D</Body1_Swap>\n\t\t<Body1Dk_Swap>0xD41F5A</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xA11F49</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xF79F74</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFFD4E2</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFFAAB0</Body2Lt_Swap>\n\t\t<Body2_Swap>0xF7747D</Body2_Swap>\n\t\t<Body2Dk_Swap>0xD41F5A</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xA11F49</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xF79F74</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFD4E2</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFAAB0</SpecialLt_Swap>\n\t\t<Special_Swap>0xF7747D</Special_Swap>\n\t\t<SpecialDk_Swap>0xD41F5A</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x910A36</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xE07BDF</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF3E4E1</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xEEBDB7</ClothLt_Swap>\n\t\t<Cloth_Swap>0xC68A91</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA35162</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFE7EE</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFFBFD0</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xE994B5</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xC65E7A</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xFC88A1</WeaponAcc_Swap>\n\t\t<IndicatorColor>0xF7747D</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamRed4\">\n\t\t<ColorSchemeID>68</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamRed4_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Orange</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>66</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>1</TeamColor>\n\t\t<HairLt_Swap>0xD08133</HairLt_Swap>\n\t\t<Hair_Swap>0xAD5A09</Hair_Swap>\n\t\t<HairDk_Swap>0x4A2809</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFE7BF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFBC48</Body1Lt_Swap>\n\t\t<Body1_Swap>0xF58218</Body1_Swap>\n\t\t<Body1Dk_Swap>0xAA240D</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x771606</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xDB5530</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xEEDDD8</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xDB917D</Body2Lt_Swap>\n\t\t<Body2_Swap>0xB86258</Body2_Swap>\n\t\t<Body2Dk_Swap>0x722929</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x4F0D0D</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xC98563</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF5DAE7</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xD97F92</SpecialLt_Swap>\n\t\t<Special_Swap>0xCB295D</Special_Swap>\n\t\t<SpecialDk_Swap>0x80082E</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x58182C</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xDE5F47</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xF3E6D1</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAD592</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEAA6B</Cloth_Swap>\n\t\t<ClothDk_Swap>0xD07B63</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFFECDB</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xBFB9AE</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x79726C</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x563B2A</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x9A8479</WeaponAcc_Swap>\n\t\t<IndicatorColor>0xF58218</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamBlue1\">\n\t\t<ColorSchemeID>69</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamBlue1_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamBlue</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>67</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>2</TeamColor>\n\t\t<HairLt_Swap>0x4173AF</HairLt_Swap>\n\t\t<Hair_Swap>0x254467</Hair_Swap>\n\t\t<HairDk_Swap>0x0E253D</HairDk_Swap>\n\t\t<Body1VL_Swap>0xDAFCF8</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xA2EEE2</Body1Lt_Swap>\n\t\t<Body1_Swap>0x50CCD7</Body1_Swap>\n\t\t<Body1Dk_Swap>0x30809C</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x20596D</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x7DE7BB</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xE9FFFB</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xC2FFEF</Body2Lt_Swap>\n\t\t<Body2_Swap>0xAAEED1</Body2_Swap>\n\t\t<Body2Dk_Swap>0x7FC6B8</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x5CB1A1</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xA5E7DA</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xD7F7E9</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x83E7BE</SpecialLt_Swap>\n\t\t<Special_Swap>0x40D092</Special_Swap>\n\t\t<SpecialDk_Swap>0x29A68D</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x246B5D</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x50C5EC</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE3FAF7</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xC6F3EC</ClothLt_Swap>\n\t\t<Cloth_Swap>0xA4DDE2</Cloth_Swap>\n\t\t<ClothDk_Swap>0x7CAEBF</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xDAF7F4</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x9EBDBA</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x607577</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x2A4845</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x718B98</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Blue,Green,Cyan,CommunityColors,Ranked,Ranked2,BattlePass01,Space,Spring,Esport,Bifrost,BP10,EsportSeafoam,Summer2,EsportElectric</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamRed1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x50CCD7</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamBlue2\">\n\t\t<ColorSchemeID>70</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamBlue2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamBlue</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>68</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>2</TeamColor>\n\t\t<HairLt_Swap>0x8FBBEC</HairLt_Swap>\n\t\t<Hair_Swap>0x2C66E7</Hair_Swap>\n\t\t<HairDk_Swap>0x2C44D2</HairDk_Swap>\n\t\t<Body1VL_Swap>0xD4E8FF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x51A1FF</Body1Lt_Swap>\n\t\t<Body1_Swap>0x006EF7</Body1_Swap>\n\t\t<Body1Dk_Swap>0x0041D4</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x0E3462</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x6B88FF</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xD4E8FF</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x51A1FF</Body2Lt_Swap>\n\t\t<Body2_Swap>0x006EF7</Body2_Swap>\n\t\t<Body2Dk_Swap>0x0041D4</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x1D3038</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x6B88FF</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xD4E8FF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x51A1FF</SpecialLt_Swap>\n\t\t<Special_Swap>0x006EF7</Special_Swap>\n\t\t<SpecialDk_Swap>0x0041D4</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x2E7787</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x8CBCFF</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE0E4FC</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xBFC8E5</ClothLt_Swap>\n\t\t<Cloth_Swap>0x97A7BF</Cloth_Swap>\n\t\t<ClothDk_Swap>0x576D8A</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xDAEBF7</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x97C3E2</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x5C8BAD</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x315E7E</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x6291D2</WeaponAcc_Swap>\n\t\t<IndicatorColor>0x006EF7</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamBlue3\">\n\t\t<ColorSchemeID>71</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamBlue3_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamBlue</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>69</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>2</TeamColor>\n\t\t<HairLt_Swap>0x6FB0C6</HairLt_Swap>\n\t\t<Hair_Swap>0x2E558C</Hair_Swap>\n\t\t<HairDk_Swap>0x173579</HairDk_Swap>\n\t\t<Body1VL_Swap>0xB5D0EE</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0x17659C</Body1Lt_Swap>\n\t\t<Body1_Swap>0x003C66</Body1_Swap>\n\t\t<Body1Dk_Swap>0x002B4A</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x002138</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0x092DC4</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xB5D0EE</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0x17659C</Body2Lt_Swap>\n\t\t<Body2_Swap>0x003C66</Body2_Swap>\n\t\t<Body2Dk_Swap>0x002B4A</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x002138</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0x092DC4</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xB5D0EE</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0x17659C</SpecialLt_Swap>\n\t\t<Special_Swap>0x003C66</Special_Swap>\n\t\t<SpecialDk_Swap>0x002B4A</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x041B2C</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x006663</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE0E4FC</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xBFC8E5</ClothLt_Swap>\n\t\t<Cloth_Swap>0x97A7BF</Cloth_Swap>\n\t\t<ClothDk_Swap>0x576D8A</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xD9E0FF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0x9FB7EE</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x3F5FA8</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x1A3E66</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x4759C6</WeaponAcc_Swap>\n\t\t<IndicatorColor>0x003C66</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamBlue4\">\n\t\t<ColorSchemeID>72</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamBlue4_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_Purple</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>70</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>2</TeamColor>\n\t\t<HairLt_Swap>0xCBBBFF</HairLt_Swap>\n\t\t<Hair_Swap>0x7767E9</Hair_Swap>\n\t\t<HairDk_Swap>0x3129A1</HairDk_Swap>\n\t\t<Body1VL_Swap>0xECD9FF</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xCA93FF</Body1Lt_Swap>\n\t\t<Body1_Swap>0x874CD0</Body1_Swap>\n\t\t<Body1Dk_Swap>0x4E2680</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x312243</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xC559E2</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xDCDEF3</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xA7A9E7</Body2Lt_Swap>\n\t\t<Body2_Swap>0x6668B4</Body2_Swap>\n\t\t<Body2Dk_Swap>0x3C396D</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x2A293F</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xA57DCB</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xE7F9FF</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xB4F0FF</SpecialLt_Swap>\n\t\t<Special_Swap>0x5DD3E7</Special_Swap>\n\t\t<SpecialDk_Swap>0x0679A8</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x18536B</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0x8CA9FF</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE9DFF5</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xDBC7EE</ClothLt_Swap>\n\t\t<Cloth_Swap>0xB192D7</Cloth_Swap>\n\t\t<ClothDk_Swap>0x876AAD</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xEEECFF</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xADA9BB</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x656174</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x3F3858</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x717498</WeaponAcc_Swap>\n\t\t<IndicatorColor>0x874CD0</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamYellow1\">\n\t\t<ColorSchemeID>73</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamYellow1_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamYellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>71</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>3</TeamColor>\n\t\t<HairLt_Swap>0xE7DCB6</HairLt_Swap>\n\t\t<Hair_Swap>0xD4B759</Hair_Swap>\n\t\t<HairDk_Swap>0x836625</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFF8E8</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFE7A9</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFFD15B</Body1_Swap>\n\t\t<Body1Dk_Swap>0xD0852D</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x9C501F</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xD28E63</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFCED64</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFCD264</Body2Lt_Swap>\n\t\t<Body2_Swap>0xEDAF51</Body2_Swap>\n\t\t<Body2Dk_Swap>0xCF8336</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x935A23</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xF9B179</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFE9DD</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF1CC9E</SpecialLt_Swap>\n\t\t<Special_Swap>0xD59738</Special_Swap>\n\t\t<SpecialDk_Swap>0xA56013</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x914723</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xF3BC82</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFEFFEF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAF8C5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEE49D</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE5BD6F</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF4F0DD</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xBEBDB4</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x908E79</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x5E4E3B</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xAB977C</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Yellow,Brown,Orange,Green,Summer,Spring,BP7,CommunityColors,EsportElectric,EsportPink</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x9C501F</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamYellow2\">\n\t\t<ColorSchemeID>74</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamYellow2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamYellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>72</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>3</TeamColor>\n\t\t<HairLt_Swap>0xFEFEFE</HairLt_Swap>\n\t\t<Hair_Swap>0xFEE77E</Hair_Swap>\n\t\t<HairDk_Swap>0xF0B55E</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFFF9</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFFFE1</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFFFFB0</Body1_Swap>\n\t\t<Body1Dk_Swap>0xFDCD72</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xEFA05B</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xFEF087</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFEFEFE</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFEFEC3</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFEFE8D</Body2_Swap>\n\t\t<Body2Dk_Swap>0xFFDD87</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xF0A65C</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xFFE8AC</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFFF9</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFFFE1</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFFFB0</Special_Swap>\n\t\t<SpecialDk_Swap>0xF0A362</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xBC6634</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFDCD72</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFDFFEE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAF8C5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEE49D</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE4BC6E</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFEFE98</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFEF087</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFCCA72</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xE37F44</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xFED17B</WeaponAcc_Swap>\n\t\t<IndicatorColor>0xFFFFB0</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamYellow3\">\n\t\t<ColorSchemeID>75</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamYellow3_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamYellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>73</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>3</TeamColor>\n\t\t<HairLt_Swap>0xFCCA72</HairLt_Swap>\n\t\t<Hair_Swap>0xC7871B</Hair_Swap>\n\t\t<HairDk_Swap>0x8C5124</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFEFE98</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFCCA72</Body1Lt_Swap>\n\t\t<Body1_Swap>0xF0A362</Body1_Swap>\n\t\t<Body1Dk_Swap>0xBC6634</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x903C26</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xEFA05B</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFCCA72</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF0A362</Body2Lt_Swap>\n\t\t<Body2_Swap>0xBC6634</Body2_Swap>\n\t\t<Body2Dk_Swap>0x81431F</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x441D12</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xFEFE98</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFEFE98</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFCCA72</SpecialLt_Swap>\n\t\t<Special_Swap>0xF0A362</Special_Swap>\n\t\t<SpecialDk_Swap>0xBC6634</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x903C26</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xD54E37</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFDFFEE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAF8C5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEE49D</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE4BC6E</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF2DBA7</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB47D38</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x694110</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x2D2219</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xB67C13</WeaponAcc_Swap>\n\t\t<IndicatorColor>0xF0A362</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamYellow4\">\n\t\t<ColorSchemeID>76</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamYellow4_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamYellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>74</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>3</TeamColor>\n\t\t<HairLt_Swap>0xD0DCA9</HairLt_Swap>\n\t\t<Hair_Swap>0xB4CB59</Hair_Swap>\n\t\t<HairDk_Swap>0x7C8B26</HairDk_Swap>\n\t\t<Body1VL_Swap>0xEAEEE0</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xDEEAB9</Body1Lt_Swap>\n\t\t<Body1_Swap>0xCAE461</Body1_Swap>\n\t\t<Body1Dk_Swap>0x8BB84E</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x68803E</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xB6C73A</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xF3F5BB</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF0F56D</Body2Lt_Swap>\n\t\t<Body2_Swap>0xE2E84C</Body2_Swap>\n\t\t<Body2Dk_Swap>0xC7C52C</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xA29B26</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xEAE57C</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF8F6E6</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF8EF91</SpecialLt_Swap>\n\t\t<Special_Swap>0xE6D749</Special_Swap>\n\t\t<SpecialDk_Swap>0xB98E21</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x8F6418</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xD8E84A</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE9EEDE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xDDE9BA</ClothLt_Swap>\n\t\t<Cloth_Swap>0xCEDF95</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA7B071</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xEAEED4</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB1C89F</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x7BA45C</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x4D6630</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x94AF67</WeaponAcc_Swap>\n\t\t<IndicatorColor>0xCAE461</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamPurple1\">\n\t\t<ColorSchemeID>77</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamPurple1_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamYellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>75</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>4</TeamColor>\n\t\t<HairLt_Swap>0xE7DCB6</HairLt_Swap>\n\t\t<Hair_Swap>0xD4B759</Hair_Swap>\n\t\t<HairDk_Swap>0x836625</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFF8E8</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFE7A9</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFFD15B</Body1_Swap>\n\t\t<Body1Dk_Swap>0xD0852D</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x9C501F</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xD28E63</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFCED64</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFCD264</Body2Lt_Swap>\n\t\t<Body2_Swap>0xEDAF51</Body2_Swap>\n\t\t<Body2Dk_Swap>0xCF8336</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x935A23</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xF9B179</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFE9DD</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF1CC9E</SpecialLt_Swap>\n\t\t<Special_Swap>0xD59738</Special_Swap>\n\t\t<SpecialDk_Swap>0xA56013</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x914723</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xF3BC82</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFEFFEF</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAF8C5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEE49D</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE5BD6F</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF4F0DD</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xBEBDB4</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x908E79</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x5E4E3B</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xAB977C</WeaponAcc_Swap>\n\t\t<ExcludeOpponentTeamColor>Purple</ExcludeOpponentTeamColor>\n\t\t<FallbackOpponentTeamColor>TeamBlue1</FallbackOpponentTeamColor>\n\t\t<IndicatorColor>0x9C501F</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamPurple2\">\n\t\t<ColorSchemeID>78</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamPurple2_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamYellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>76</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>4</TeamColor>\n\t\t<HairLt_Swap>0xFEFEFE</HairLt_Swap>\n\t\t<Hair_Swap>0xFEE77E</Hair_Swap>\n\t\t<HairDk_Swap>0xF0B55E</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFFFFF9</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFFFFE1</Body1Lt_Swap>\n\t\t<Body1_Swap>0xFFFFB0</Body1_Swap>\n\t\t<Body1Dk_Swap>0xFDCD72</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0xEFA05B</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xFEF087</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFEFEFE</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xFEFEC3</Body2Lt_Swap>\n\t\t<Body2_Swap>0xFEFE8D</Body2_Swap>\n\t\t<Body2Dk_Swap>0xFFDD87</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xF0A65C</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xFFE8AC</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFFFFF9</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFFFFE1</SpecialLt_Swap>\n\t\t<Special_Swap>0xFFFFB0</Special_Swap>\n\t\t<SpecialDk_Swap>0xF0A362</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0xBC6634</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xFDCD72</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFDFFEE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAF8C5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEE49D</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE4BC6E</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xFEFE98</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xFEF087</WeaponLt_Swap>\n\t\t<Weapon_Swap>0xFCCA72</Weapon_Swap>\n\t\t<WeaponDk_Swap>0xE37F44</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xFED17B</WeaponAcc_Swap>\n\t\t<IndicatorColor>0xFFFFB0</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamPurple3\">\n\t\t<ColorSchemeID>79</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamPurple3_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamYellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>77</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>4</TeamColor>\n\t\t<HairLt_Swap>0xFCCA72</HairLt_Swap>\n\t\t<Hair_Swap>0xC7871B</Hair_Swap>\n\t\t<HairDk_Swap>0x8C5124</HairDk_Swap>\n\t\t<Body1VL_Swap>0xFEFE98</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xFCCA72</Body1Lt_Swap>\n\t\t<Body1_Swap>0xF0A362</Body1_Swap>\n\t\t<Body1Dk_Swap>0xBC6634</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x903C26</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xEFA05B</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xFCCA72</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF0A362</Body2Lt_Swap>\n\t\t<Body2_Swap>0xBC6634</Body2_Swap>\n\t\t<Body2Dk_Swap>0x81431F</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0x441D12</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xFEFE98</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xFEFE98</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xFCCA72</SpecialLt_Swap>\n\t\t<Special_Swap>0xF0A362</Special_Swap>\n\t\t<SpecialDk_Swap>0xBC6634</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x903C26</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xD54E37</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xFDFFEE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xFAF8C5</ClothLt_Swap>\n\t\t<Cloth_Swap>0xEEE49D</Cloth_Swap>\n\t\t<ClothDk_Swap>0xE4BC6E</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xF2DBA7</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB47D38</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x694110</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x2D2219</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0xB67C13</WeaponAcc_Swap>\n\t\t<IndicatorColor>0xF0A362</IndicatorColor>\n\t</ColorSchemeType>\n\t<ColorSchemeType ColorSchemeName=\"TeamPurple4\">\n\t\t<ColorSchemeID>80</ColorSchemeID>\n\t\t<DefaultUnlocked>FALSE</DefaultUnlocked>\n\t\t<DisplayNameKey>ColorSchemeType_TeamPurple4_DisplayName</DisplayNameKey>\n\t\t<IconName>a_ColorIcon_TeamYellow</IconName>\n\t\t<IconFileName>UI_Icons</IconFileName>\n\t\t<OrderID>78</OrderID>\n\t\t<Rarity>R</Rarity>\n\t\t<TeamColor>4</TeamColor>\n\t\t<HairLt_Swap>0xD0DCA9</HairLt_Swap>\n\t\t<Hair_Swap>0xB4CB59</Hair_Swap>\n\t\t<HairDk_Swap>0x7C8B26</HairDk_Swap>\n\t\t<Body1VL_Swap>0xEAEEE0</Body1VL_Swap>\n\t\t<Body1Lt_Swap>0xDEEAB9</Body1Lt_Swap>\n\t\t<Body1_Swap>0xCAE461</Body1_Swap>\n\t\t<Body1Dk_Swap>0x8BB84E</Body1Dk_Swap>\n\t\t<Body1VD_Swap>0x68803E</Body1VD_Swap>\n\t\t<Body1Acc_Swap>0xB6C73A</Body1Acc_Swap>\n\t\t<Body2VL_Swap>0xF3F5BB</Body2VL_Swap>\n\t\t<Body2Lt_Swap>0xF0F56D</Body2Lt_Swap>\n\t\t<Body2_Swap>0xE2E84C</Body2_Swap>\n\t\t<Body2Dk_Swap>0xC7C52C</Body2Dk_Swap>\n\t\t<Body2VD_Swap>0xA29B26</Body2VD_Swap>\n\t\t<Body2Acc_Swap>0xEAE57C</Body2Acc_Swap>\n\t\t<SpecialVL_Swap>0xF8F6E6</SpecialVL_Swap>\n\t\t<SpecialLt_Swap>0xF8EF91</SpecialLt_Swap>\n\t\t<Special_Swap>0xE6D749</Special_Swap>\n\t\t<SpecialDk_Swap>0xB98E21</SpecialDk_Swap>\n\t\t<SpecialVD_Swap>0x8F6418</SpecialVD_Swap>\n\t\t<SpecialAcc_Swap>0xD8E84A</SpecialAcc_Swap>\n\t\t<ClothVL_Swap>0xE9EEDE</ClothVL_Swap>\n\t\t<ClothLt_Swap>0xDDE9BA</ClothLt_Swap>\n\t\t<Cloth_Swap>0xCEDF95</Cloth_Swap>\n\t\t<ClothDk_Swap>0xA7B071</ClothDk_Swap>\n\t\t<WeaponVL_Swap>0xEAEED4</WeaponVL_Swap>\n\t\t<WeaponLt_Swap>0xB1C89F</WeaponLt_Swap>\n\t\t<Weapon_Swap>0x7BA45C</Weapon_Swap>\n\t\t<WeaponDk_Swap>0x4D6630</WeaponDk_Swap>\n\t\t<WeaponAcc_Swap>0x94AF67</WeaponAcc_Swap>\n\t\t<IndicatorColor>0xCAE461</IndicatorColor>\n\t</ColorSchemeType>\n</ColorSchemeTypes>";
const EMBEDDED_STRING_TABLE_TSV = "StringKey\tEnglish\nColorSchemeType_100Mil_DisplayName\tRaven's Honor\nColorSchemeType_Anniversary_DisplayName\tGala\nColorSchemeType_ArtDeco_DisplayName\tArt Deco\nColorSchemeType_BattlePass01_DisplayName\tSoul Fire\nColorSchemeType_BattlePass02_DisplayName\tSynthwave\nColorSchemeType_Bifrost_DisplayName\tBifrost\nColorSchemeType_Black_DisplayName\tBlack\nColorSchemeType_Blacklight_DisplayName\tBlacklight\nColorSchemeType_Blue_DisplayName\tBlue\nColorSchemeType_BP10_DisplayName\tKira-kira\nColorSchemeType_BP11_DisplayName\tAncient Curse\nColorSchemeType_BP12_DisplayName\tNeon Hanafuda\nColorSchemeType_BP3_DisplayName\tFrozen Forest\nColorSchemeType_BP6_DisplayName\tWillow Leaves\nColorSchemeType_BP7_DisplayName\tPact of Poison\nColorSchemeType_BP8_DisplayName\tDarkheart\nColorSchemeType_BP9_DisplayName\tArmageddon\nColorSchemeType_Brawlhalloween_DisplayName\tHaunting\nColorSchemeType_Brawlhalloween2_DisplayName\tGhoulish\nColorSchemeType_Brown_DisplayName\tBrown\nColorSchemeType_CommunityColors_DisplayName\tCommunity Colors\nColorSchemeType_CommunityColors2_DisplayName\tCommunity Colors v.2\nColorSchemeType_Cyan_DisplayName\tCyan\nColorSchemeType_EsportDigital_DisplayName\tRGB\nColorSchemeType_CMYK_DisplayName\tCMYK\nColorSchemeType_Esports_DisplayName\tEsports\nColorSchemeType_Esports2_DisplayName\tEsports v.2\nColorSchemeType_Esports3_DisplayName\tEsports v.3\nColorSchemeType_Esports4_DisplayName\tEsports v.4\nColorSchemeType_Esports5_DisplayName\tEsports v.5\nColorSchemeType_EsportSeafoam_DisplayName\tEsports v.6\nColorSchemeType_GameFuel_DisplayName\tCharged OG\nColorSchemeType_Green_DisplayName\tGreen\nColorSchemeType_Grey_DisplayName\tGrey\nColorSchemeType_Heartfelt_DisplayName\tHeartfelt\nColorSchemeType_Holiday_DisplayName\tWinter Holiday\nColorSchemeType_HolidayJolly_DisplayName\tHolly Jolly\nColorSchemeType_HomeTeam_DisplayName\tHome Team\nColorSchemeType_HomeTeamReunion_DisplayName\tHome Team Reunion\nColorSchemeType_NO_COLOR_SCHEME_DisplayName\tClassic Colors\nColorSchemeType_OEL1_DisplayName\tCoat of Lions\nColorSchemeType_Orange_DisplayName\tOrange\nColorSchemeType_Pastel_DisplayName\tVerdant Bloom\nColorSchemeType_Pink_DisplayName\tPink\nColorSchemeType_Purple_DisplayName\tPurple\nColorSchemeType_Ranked_DisplayName\tSkyforged\nColorSchemeType_Ranked2_DisplayName\tGoldforged\nColorSchemeType_Red_DisplayName\tRed\nColorSchemeType_Space_DisplayName\tStarlight\nColorSchemeType_StPaddy_DisplayName\tLucky Clover\nColorSchemeType_StPaddy2_DisplayName\tClover Patch\nColorSchemeType_Summer_DisplayName\tHeatwave\nColorSchemeType_Summer2_DisplayName\tPool Party\nColorSchemeType_Sunset_DisplayName\tSunset\nColorSchemeType_TeamBlue1_DisplayName\tTeam Blue\nColorSchemeType_TeamBlue2_DisplayName\tTeam Blue Dark\nColorSchemeType_TeamBlue3_DisplayName\tTeam Blue Light\nColorSchemeType_TeamBlue4_DisplayName\tTeam Blue Purple\nColorSchemeType_TeamPurple1_DisplayName\tTeam Purple\nColorSchemeType_TeamPurple2_DisplayName\tTeam Purple Dark\nColorSchemeType_TeamPurple3_DisplayName\tTeam Purple Light\nColorSchemeType_TeamPurple4_DisplayName\tTeam Purple Green\nColorSchemeType_TeamRed1_DisplayName\tTeam Red\nColorSchemeType_TeamRed2_DisplayName\tTeam Red Dark\nColorSchemeType_TeamRed3_DisplayName\tTeam Red Light\nColorSchemeType_TeamRed4_DisplayName\tTeam Red Orange\nColorSchemeType_TeamYellow1_DisplayName\tTeam Yellow\nColorSchemeType_TeamYellow2_DisplayName\tTeam Yellow Dark\nColorSchemeType_TeamYellow3_DisplayName\tTeam Yellow Light\nColorSchemeType_TeamYellow4_DisplayName\tTeam Yellow Green\nColorSchemeType_Valhallentines_DisplayName\tLovestruck\nColorSchemeType_White_DisplayName\tWhite\nColorSchemeType_Yellow_DisplayName\tYellow\nColorSchemeType_Guild_DisplayName\tGuild\nColorSchemeType_Crystalforged_DisplayName\tCrystalforged\nColorSchemeType_Dragonfire_DisplayName\tDragonfire\nColorSchemeType_StainedGlass_DisplayName\tStained Glass\nColorSchemeType_EsportV7_DisplayName\tEsports v.7\n";
const EMBEDDED_SVG_TEMPLATE = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg\n   width=\"2000\"\n   height=\"2000\"\n   viewBox=\"0 0 529.16665 529.16668\"\n   version=\"1.1\"\n   id=\"svg8\"\n   inkscape:version=\"1.4.2 (f4327f4, 2025-05-13)\"\n   sodipodi:docname=\"test.svg\"\n   xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"\n   xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"\n   xmlns=\"http://www.w3.org/2000/svg\"\n   xmlns:svg=\"http://www.w3.org/2000/svg\"\n   xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n   xmlns:cc=\"http://creativecommons.org/ns#\"\n   xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n  <defs\n     id=\"defs2\" />\n  <sodipodi:namedview\n     id=\"base\"\n     pagecolor=\"#ffffff\"\n     bordercolor=\"#666666\"\n     borderopacity=\"1.0\"\n     inkscape:pageopacity=\"0.0\"\n     inkscape:pageshadow=\"2\"\n     inkscape:zoom=\"0.28956021\"\n     inkscape:cx=\"324.63024\"\n     inkscape:cy=\"1013.6061\"\n     inkscape:document-units=\"px\"\n     inkscape:current-layer=\"layer1\"\n     showgrid=\"false\"\n     units=\"px\"\n     inkscape:window-width=\"1280\"\n     inkscape:window-height=\"657\"\n     inkscape:window-x=\"-8\"\n     inkscape:window-y=\"-8\"\n     inkscape:window-maximized=\"1\"\n     inkscape:showpageshadow=\"0\"\n     inkscape:pagecheckerboard=\"true\"\n     inkscape:deskcolor=\"#505050\"\n     inkscape:document-rotation=\"0\" />\n  <metadata\n     id=\"metadata5\">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about=\"\">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:groupmode=\"layer\"\n     id=\"layer2\"\n     inkscape:label=\"Layer 2\">\n    <rect\n       style=\"opacity:1;fill:#9b9b9b;fill-opacity:1;stroke:none;stroke-width:1.07176387;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"rectBackdrop\"\n       width=\"529.16669\"\n       height=\"529.16669\"\n       x=\"0\"\n       y=\"-232.16669\"\n       rx=\"21.575197\"\n       transform=\"translate(0,232.16667)\" />\n  </g>\n  <g\n     inkscape:label=\"Layer 1\"\n     inkscape:groupmode=\"layer\"\n     id=\"layer1\"\n     transform=\"translate(0,232.16667)\">\n    <rect\n       rx=\"10.066534\"\n       y=\"-111.51667\"\n       x=\"211.66667\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"HairLt_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"Hair_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"264.58334\"\n       y=\"-111.51667\"\n       rx=\"10.066534\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"HairDk_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"317.5\"\n       y=\"-111.51667\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"-58.599998\"\n       x=\"158.75\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"Body1VL_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"Body1Lt_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"211.66667\"\n       y=\"-58.599998\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"-58.599998\"\n       x=\"264.58334\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"Body1_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"Body1Dk_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"317.5\"\n       y=\"-58.599998\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"-58.599998\"\n       x=\"370.41666\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"Body1VD_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"Body1Acc_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"423.33334\"\n       y=\"-58.599998\"\n       rx=\"10.066534\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"Body2VL_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"158.75\"\n       y=\"-5.6833344\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"-5.6833344\"\n       x=\"211.66667\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"Body2Lt_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"Body2_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"264.58334\"\n       y=\"-5.6833344\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"-5.6833344\"\n       x=\"317.5\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"Body2Dk_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"Body2VD_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"370.41666\"\n       y=\"-5.6833344\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"-5.6833344\"\n       x=\"423.33334\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"Body2Acc_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"47.233334\"\n       x=\"158.75\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"SpecialVL_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"SpecialLt_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"211.66667\"\n       y=\"47.233334\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"47.233334\"\n       x=\"264.58334\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"Special_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"SpecialDk_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"317.5\"\n       y=\"47.233334\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"47.233334\"\n       x=\"370.41666\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"SpecialVD_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"SpecialAcc_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"423.33334\"\n       y=\"47.233334\"\n       rx=\"10.066534\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"ClothVL_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"158.75\"\n       y=\"100.15\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"100.15\"\n       x=\"211.66667\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"ClothLt_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"Cloth_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"264.58334\"\n       y=\"100.15\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"100.15\"\n       x=\"317.5\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"ClothDk_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"153.06667\"\n       x=\"158.75\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"WeaponVL_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"WeaponLt_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"211.66667\"\n       y=\"153.06667\"\n       rx=\"10.066534\" />\n    <rect\n       rx=\"10.066534\"\n       y=\"153.06667\"\n       x=\"264.58334\"\n       height=\"50.006248\"\n       width=\"50.006248\"\n       id=\"Weapon_Swap\"\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       id=\"WeaponDk_Swap\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"317.5\"\n       y=\"153.06667\"\n       rx=\"10.066534\" />\n    <rect\n       style=\"opacity:1;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.47371918;stroke-miterlimit:100;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"\n       width=\"50.006248\"\n       height=\"50.006248\"\n       x=\"423.33331\"\n       y=\"153.06667\"\n       rx=\"10.066534\"\n       id=\"WeaponAcc_Swap\" />\n    <text\n       id=\"txtWeapon\"\n       y=\"185.59984\"\n       x=\"34.395832\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       xml:space=\"preserve\"><tspan\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\"\n         y=\"185.59984\"\n         x=\"34.395832\"\n         id=\"tspan899\"\n         sodipodi:role=\"line\">Weapon</tspan></text>\n    <text\n       xml:space=\"preserve\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       x=\"34.395832\"\n       y=\"132.68315\"\n       id=\"txtCloth\"><tspan\n         sodipodi:role=\"line\"\n         id=\"tspan895\"\n         x=\"34.395832\"\n         y=\"132.68315\"\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\">Cloth</tspan></text>\n    <text\n       id=\"txtSpecial\"\n       y=\"79.766495\"\n       x=\"34.395832\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       xml:space=\"preserve\"><tspan\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\"\n         y=\"79.766495\"\n         x=\"34.395832\"\n         id=\"tspan891\"\n         sodipodi:role=\"line\">Special</tspan></text>\n    <text\n       xml:space=\"preserve\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       x=\"34.395832\"\n       y=\"26.849825\"\n       id=\"txtBody2\"><tspan\n         sodipodi:role=\"line\"\n         id=\"tspan887\"\n         x=\"34.395832\"\n         y=\"26.849825\"\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\">Body<tspan\n   id=\"tspan885\"\n   style=\"font-size:31.75px\">2</tspan></tspan></text>\n    <text\n       id=\"txtBody1\"\n       y=\"-26.066845\"\n       x=\"34.395832\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       xml:space=\"preserve\"><tspan\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\"\n         y=\"-26.066845\"\n         x=\"34.395832\"\n         id=\"tspan877\"\n         sodipodi:role=\"line\">Body<tspan\n   id=\"tspan875\"\n   style=\"font-size:31.75px\">1</tspan></tspan></text>\n    <text\n       xml:space=\"preserve\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       x=\"34.395832\"\n       y=\"-78.983498\"\n       id=\"txtHair\"><tspan\n         sodipodi:role=\"line\"\n         id=\"tspan881\"\n         x=\"34.395832\"\n         y=\"-78.983498\"\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\">Hair</tspan></text>\n    <text\n       xml:space=\"preserve\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       x=\"431.27084\"\n       y=\"-131.90018\"\n       id=\"txtAccent\"><tspan\n         sodipodi:role=\"line\"\n         id=\"tspan923\"\n         x=\"431.27084\"\n         y=\"-131.90018\"\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\">Acc</tspan></text>\n    <text\n       id=\"txtVeryDark\"\n       y=\"-131.90018\"\n       x=\"381\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       xml:space=\"preserve\"><tspan\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\"\n         y=\"-131.90018\"\n         x=\"381\"\n         id=\"tspan915\"\n         sodipodi:role=\"line\">VD</tspan></text>\n    <text\n       xml:space=\"preserve\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       x=\"328.08334\"\n       y=\"-131.90018\"\n       id=\"txtDk\"><tspan\n         sodipodi:role=\"line\"\n         id=\"tspan919\"\n         x=\"328.08334\"\n         y=\"-131.90018\"\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\">Dk</tspan></text>\n    <text\n       xml:space=\"preserve\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       x=\"279.08249\"\n       y=\"-131.90018\"\n       id=\"txtNeutral\"><tspan\n         sodipodi:role=\"line\"\n         id=\"tspan911\"\n         x=\"279.08249\"\n         y=\"-131.90018\"\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\">N</tspan></text>\n    <text\n       id=\"txtLight\"\n       y=\"-131.90018\"\n       x=\"222.25\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       xml:space=\"preserve\"><tspan\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\"\n         y=\"-131.90018\"\n         x=\"222.25\"\n         id=\"tspan907\"\n         sodipodi:role=\"line\">Lt</tspan></text>\n    <text\n       xml:space=\"preserve\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       x=\"169.33333\"\n       y=\"-131.90018\"\n       id=\"txtVeryLight\"\n       inkscape:label=\"txtVeryLight\"><tspan\n         sodipodi:role=\"line\"\n         id=\"tspan871\"\n         x=\"169.33333\"\n         y=\"-131.90018\"\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:21.1667px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\">VL</tspan></text>\n    <text\n       xml:space=\"preserve\"\n       style=\"font-style:normal;font-weight:normal;font-size:38.3432px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.958579\"\n       x=\"79.375\"\n       y=\"-179.80034\"\n       id=\"txtTitle\"><tspan\n         sodipodi:role=\"line\"\n         id=\"tspan826\"\n         x=\"79.375\"\n         y=\"-179.80034\"\n         style=\"font-style:normal;font-variant:normal;font-weight:800;font-stretch:normal;font-size:42.3333px;font-family:'Bespoke Sans';-inkscape-font-specification:'Bespoke Sans Ultra-Bold';stroke-width:0.958579\">Aa</tspan></text>\n  </g>\n</svg>\n";

const BLACK_FALLBACK = 0x010101;

const GRID_COLUMNS = [
  { id: 'Hair',    label: 'Hair',    tip: 'Mostly used for hair and some cloth- and leather-like materials' },
  { id: 'Body1',   label: 'Body\u00A01',  tip: 'Main colours on a skin ("Primary")' },
  { id: 'Body2',   label: 'Body\u00A02',  tip: 'Main colours on a skin ("Secondary")' },
  { id: 'Special', label: 'Special', tip: 'Highlights, accents, some hairs ("Tertiary")' },
  { id: 'Cloth',   label: 'Cloth',   tip: 'Cloth- and leather-like materials, trousers, undergarments' },
  { id: 'Weapon',  label: 'Weapon',  tip: 'Metallic materials ("Metal")' },
];

const GRID_ROWS = [
  { suffix: 'VL',  label: 'Very\u00A0Light', tip: 'Hue Offset ±6°, Saturation < 25%, Brightness > 80%' },
  { suffix: 'Lt',  label: 'Light',      tip: 'Hue Offset ±3°, Saturation < 67%, Brightness > 50%' },
  { suffix: '',    label: 'Base',       tip: 'Saturation > 25%, Brightness > 20%' },
  { suffix: 'Dk',  label: 'Dark',       tip: 'Hue Offset ±3°, Saturation > 30%, Brightness < 60%' },
  { suffix: 'VD',  label: 'Very\u00A0Dark',  tip: 'Hue Offset ±6°, Saturation > 50%, Brightness < 40%' },
  { suffix: 'Acc', label: 'Accent',     tip: 'Hue Offset ±<30°, Saturation > 80%, Brightness > 50%' },
];

const GRID_CELLS = {
  Hair:    new Set(['Lt', '', 'Dk']),
  Body1:   new Set(['VL', 'Lt', '', 'Dk', 'VD', 'Acc']),
  Body2:   new Set(['VL', 'Lt', '', 'Dk', 'VD', 'Acc']),
  Special: new Set(['VL', 'Lt', '', 'Dk', 'VD', 'Acc']),
  Cloth:   new Set(['VL', 'Lt', '', 'Dk']),
  Weapon:  new Set(['VL', 'Lt', '', 'Dk', 'Acc']),
};

const GRID_CELLS_FULL = {};
for (const col of GRID_COLUMNS) GRID_CELLS_FULL[col.id] = new Set(['VL', 'Lt', '', 'Dk', 'VD', 'Acc']);

const SHADE_MAP = { VL: 2, Lt: 1, '': 0, Dk: -1, VD: -2, Acc: 3 };
const SUFFIX_BY_SHADE = { 2: 'VL', 1: 'Lt', 0: '', '-1': 'Dk', '-2': 'VD', 3: 'Acc' };

let shadeIntensity = 1;

function _scaleShadeMul(mul) {
  return 1 + (mul - 1) * shadeIntensity;
}

const SHADE_BANDS = {
  VL:  { satMax: 63,  valMin: 204 },
  Lt:  { satMax: 171, valMin: 128 },
  Dk:  { satMin: 77,  valMax: 153 },
  VD:  { satMin: 128, valMax: 102 },
  Acc: { satMin: 204, valMin: 128 },
};

function clampToShadeBand(shade, s, v) {
  const band = SHADE_BANDS[SUFFIX_BY_SHADE[shade]];
  if (!band) return [s, v];
  if (band.satMax !== undefined) s = Math.min(s, band.satMax);
  if (band.satMin !== undefined) s = Math.max(s, band.satMin);
  if (band.valMax !== undefined) v = Math.min(v, band.valMax);
  if (band.valMin !== undefined) v = Math.max(v, band.valMin);
  return [Math.min(Math.max(s, 0), 255), Math.min(Math.max(v, 0), 255)];
}

const COL_LABELS = { Hair: 'Hair', Body1: 'Body\u00A01', Body2: 'Body\u00A02', Special: 'Special', Cloth: 'Cloth', Weapon: 'Weapon' };
const SHADE_LABELS = { VL: 'Very\u00A0Light', Lt: 'Light', '': 'Base', Dk: 'Dark', VD: 'Very\u00A0Dark', Acc: 'Accent' };

const ICONS = {
  load:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 11v3h12v-3"/><path d="M8 2v8m-3-3l3 3 3-3"/></svg>`,
  randomise: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2l3 3-3 3"/><path d="M2 5h12"/><path d="M5 14l-3-3 3-3"/><path d="M14 11H2"/></svg>`,
  dice:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="2"/><circle cx="5" cy="5" r="0.7" fill="currentColor"/><circle cx="8" cy="8" r="0.7" fill="currentColor"/><circle cx="11" cy="11" r="0.7" fill="currentColor"/></svg>`,
  shade:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v2m0 9v2M1.5 8h2m9 0h2m-10-5L4 4.5m8.5 7l-1.5 1M3.5 11.5L5 13m6-10l1.5-1.5"/></svg>`,
  gradient:  `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="12" height="8" rx="2"/><path d="M4 8h8"/><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>`,
  save:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 15H3a1 1 0 01-1-1V2a1 1 0 011-1h7.5L14 4.5V14a1 1 0 01-1 1z"/><path d="M10 1v4H5"/><path d="M5.5 8.5h5v6h-5z"/></svg>`,
  trash:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h12"/><path d="M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4"/><path d="M3.5 4l.7 9.5a1 1 0 001 .5h5.6a1 1 0 001-.5l.7-9.5"/></svg>`,
  share:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="3" r="1.5"/><circle cx="4" cy="8" r="1.5"/><circle cx="12" cy="13" r="1.5"/><path d="M5.4 8.9l5.2 3.2M5.4 7.1l5.2-3.2"/></svg>`,
  copy:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M2 11V2.5A.5.5 0 012.5 2H11"/></svg>`,
  download:  `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12v2h12v-2"/><path d="M8 2v8m-3-3l3 3 3-3"/></svg>`,
  image:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="5.2" cy="6" r="1"/><path d="M3.5 11l3.2-3.2 2.1 2.1 1.5-1.5L12.5 11"/></svg>`,
  chevron:   `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>`,
  search:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>`,
  sun:       `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M8 1v2m0 10v2M1 8h2m10 0h2M3 3l1.5 1.5m7 7L13 13M3 13l1.5-1.5m7-7L13 3"/></svg>`,
  moon:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 9.1A5.5 5.5 0 116.9 2.5 4.5 4.5 0 0013.5 9.1z"/></svg>`,
  undo:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4L2.5 7.5 6 11"/><path d="M3 7.5h6a4 4 0 010 8h-1.5"/></svg>`,
  redo:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4l3.5 3.5L10 11"/><path d="M13 7.5H7a4 4 0 000 8h1.5"/></svg>`,
  lock:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2"/></svg>`,
  invert:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 2v12" /><path d="M8 2a6 6 0 010 12" fill="currentColor"/></svg>`,
  desat:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M4 12l8-8"/></svg>`,
  upload:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12v2h12v-2"/><path d="M8 10V2m-3 3l3-3 3 3"/></svg>`,
  target:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.6"/><path d="M8 1v2.4M8 12.6V15M1 8h2.4M12.6 8H15"/></svg>`,
  gear:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2.3"/><path d="M8 1.6v1.7m0 9.4v1.7M3.4 3.4l1.2 1.2m6.8 6.8l1.2 1.2M1.6 8h1.7m9.4 0h1.7M3.4 12.6l1.2-1.2m6.8-6.8l1.2-1.2"/></svg>`,
  folder:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4.5a1 1 0 011-1h3l1.3 1.6H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1z"/></svg>`,
  refresh:   `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 8a5.5 5.5 0 10-1.6 3.9"/><path d="M13.5 4v3.5H10"/></svg>`,
};

function icon(name) {
  const span = document.createElement('span');
  span.className = 'btn-icon';
  span.innerHTML = ICONS[name] || '';
  return span;
}

function degrees(radians) {
  return radians * (180 / Math.PI);
}

function rgbToHsv(r, g, b) {
  const rn = Math.max(0, Math.min(255, r)) / 255;
  const gn = Math.max(0, Math.min(255, g)) / 255;
  const bn = Math.max(0, Math.min(255, b)) / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h, s * 255, v * 255];
}

function hsvToRgb(h, s, v) {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.max(0, Math.min(255, s)) / 255;
  const vv = Math.max(0, Math.min(255, v)) / 255;

  const c = vv * ss;
  const x = c * (1 - Math.abs((hh / 60) % 2 - 1));
  const m = vv - c;

  let rp = 0, gp = 0, bp = 0;
  if (hh < 60)       { rp = c; gp = x; bp = 0; }
  else if (hh < 120) { rp = x; gp = c; bp = 0; }
  else if (hh < 180) { rp = 0; gp = c; bp = x; }
  else if (hh < 240) { rp = 0; gp = x; bp = c; }
  else if (hh < 300) { rp = x; gp = 0; bp = c; }
  else               { rp = c; gp = 0; bp = x; }

  return [
    Math.round((rp + m) * 255),
    Math.round((gp + m) * 255),
    Math.round((bp + m) * 255),
  ];
}

function shadeColour(colour, shade) {
  if (shade === 0) return colour;
  const hsv = rgbToHsv(colour >> 16, (colour >> 8) & 0xFF, colour & 0xFF);
  const isNeutral = hsv[1] < 8;
  if (shade === 3) {
    if (isNeutral) {
      hsv[1] = 0;
      hsv[2] = Math.max(hsv[2], 128);
    } else {
      hsv[0] = hsv[1] !== 0
        ? (hsv[0] + Math.floor(Math.random() * 60) - 30) % 360
        : Math.floor(Math.random() * 360);
      hsv[1] = Math.max(hsv[1], 192);
      hsv[2] = Math.max(hsv[2], 128);
    }
  } else {
    const valMul = [0.5, Math.SQRT2 / 2, 1, Math.SQRT2, 2].map(_scaleShadeMul);
    hsv[2] *= Math.min(valMul[shade + 2], 255);
  }
  if (hsv[0] < 0) hsv[0] += 360;
  hsv[1] = Math.min(hsv[1], 255);
  hsv[2] = Math.min(hsv[2], 255);
  if (isNeutral) {
    const band = SHADE_BANDS[SUFFIX_BY_SHADE[shade]];
    if (band) {
      if (band.valMax !== undefined) hsv[2] = Math.min(hsv[2], band.valMax);
      if (band.valMin !== undefined) hsv[2] = Math.max(hsv[2], band.valMin);
    }
  } else {
    [hsv[1], hsv[2]] = clampToShadeBand(shade, hsv[1], hsv[2]);
  }
  const rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);
  return (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0)
    ? BLACK_FALLBACK
    : (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
}

function randomColour() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 192) + 64;
  const v = Math.floor(Math.random() * 192) + 64;
  const [r, g, b] = hsvToRgb(h, s, v);
  return (r << 16) | (g << 8) | b;
}

function invertColour(c) {
  const r = 255 - ((c >> 16) & 0xFF);
  const g = 255 - ((c >> 8) & 0xFF);
  const b = 255 - (c & 0xFF);
  return (r === 0 && g === 0 && b === 0) ? BLACK_FALLBACK : (r << 16) | (g << 8) | b;
}

function desaturateColour(c) {
  const r = (c >> 16) & 0xFF, g = (c >> 8) & 0xFF, b = c & 0xFF;
  const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  return l === 0 ? BLACK_FALLBACK : (l << 16) | (l << 8) | l;
}

function rgbToCmyk(r, g, b) {
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const k = 1 - Math.max(r1, g1, b1);
  if (k === 1) return [0, 0, 0, 100];
  const c = (1 - r1 - k) / (1 - k);
  const m = (1 - g1 - k) / (1 - k);
  const y = (1 - b1 - k) / (1 - k);
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

function cmykToRgb(c, m, y, k) {
  const c1 = c / 100, m1 = m / 100, y1 = y / 100, k1 = k / 100;
  return [
    Math.round(255 * (1 - c1) * (1 - k1)),
    Math.round(255 * (1 - m1) * (1 - k1)),
    Math.round(255 * (1 - y1) * (1 - k1)),
  ];
}

function rgbToLab(r, g, b) {
  let rl = r / 255, gl = g / 255, bl = b / 255;
  rl = rl > 0.04045 ? Math.pow((rl + 0.055) / 1.055, 2.4) : rl / 12.92;
  gl = gl > 0.04045 ? Math.pow((gl + 0.055) / 1.055, 2.4) : gl / 12.92;
  bl = bl > 0.04045 ? Math.pow((bl + 0.055) / 1.055, 2.4) : bl / 12.92;
  let x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  let y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750);
  let z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883;
  const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  x = f(x); y = f(y); z = f(z);
  return [Math.round(116 * y - 16), Math.round(500 * (x - y)), Math.round(200 * (y - z))];
}

function labToRgb(L, a, bL) {
  let y2 = (L + 16) / 116;
  let x = a / 500 + y2;
  let z = y2 - bL / 200;
  const fi = (t) => t * t * t > 0.008856 ? t * t * t : (t - 16 / 116) / 7.787;
  x = fi(x) * 0.95047; y2 = fi(y2); z = fi(z) * 1.08883;
  let r =  x *  3.2404542 + y2 * -1.5371385 + z * -0.4985314;
  let g =  x * -0.9692660 + y2 *  1.8760108 + z *  0.0415560;
  let bl = x *  0.0556434 + y2 * -0.2040259 + z *  1.0572252;
  const gamma = (t) => t > 0.0031308 ? 1.055 * Math.pow(t, 1 / 2.4) - 0.055 : 12.92 * t;
  return [
    Math.round(Math.max(0, Math.min(1, gamma(r))) * 255),
    Math.round(Math.max(0, Math.min(1, gamma(g))) * 255),
    Math.round(Math.max(0, Math.min(1, gamma(bl))) * 255),
  ];
}

function intToHex(n) {
  return '#' + (n & 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
}

function propName(colId, suffix) {
  return suffix === '' ? `${colId}_Swap` : `${colId}${suffix}_Swap`;
}

function getColumnFromProp(prop) {
  return prop.replace(/(VL|Lt|Dk|VD|Acc)?_Swap$/, '');
}

let COLOR_PROP_INDEX_BY_ID = null;

function _resolveExactSwapLabel(el) {
  let node = el;
  let depth = 0;
  while (node && node.nodeType === 1 && depth < 8) {
    const id = node.id || (node.getAttribute && node.getAttribute('id'));
    if (id) {
      const idx = COLOR_PROP_INDEX_BY_ID.get(id.trim().toLowerCase());
      if (idx !== undefined) return idx;
    }
    node = node.parentElement;
    depth++;
  }
  return -1;
}

function getShadeFromProp(prop) {
  const col = getColumnFromProp(prop);
  return prop.replace(col, '').replace('_Swap', '');
}

function friendlyName(prop) {
  const col = getColumnFromProp(prop);
  const shade = getShadeFromProp(prop);
  return `${COL_LABELS[col]} · ${SHADE_LABELS[shade]}`;
}

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'dataset') { Object.assign(node.dataset, v); }
      else if (k === 'className') { node.className = v; }
      else if (k === 'textContent') { node.textContent = v; }
      else if (k === 'innerHTML') { node.innerHTML = v; }
      else if (typeof v === 'boolean') { if (v) node.setAttribute(k, ''); }
      else node.setAttribute(k, v);
    }
  }
  if (children) {
    for (const c of Array.isArray(children) ? children : [children]) {
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
  }
  return node;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = el('div', { className: `toast toast-${type}`, textContent: message });
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const COLOR_PROPS = [
  'HairLt_Swap', 'Hair_Swap', 'HairDk_Swap',
  'Body1VL_Swap', 'Body1Lt_Swap', 'Body1_Swap', 'Body1Dk_Swap', 'Body1VD_Swap', 'Body1Acc_Swap',
  'Body2VL_Swap', 'Body2Lt_Swap', 'Body2_Swap', 'Body2Dk_Swap', 'Body2VD_Swap', 'Body2Acc_Swap',
  'SpecialVL_Swap', 'SpecialLt_Swap', 'Special_Swap', 'SpecialDk_Swap', 'SpecialVD_Swap', 'SpecialAcc_Swap',
  'ClothVL_Swap', 'ClothLt_Swap', 'Cloth_Swap', 'ClothDk_Swap',
  'WeaponVL_Swap', 'WeaponLt_Swap', 'Weapon_Swap', 'WeaponDk_Swap', 'WeaponAcc_Swap',
];

const EXTENDED_COLOR_PROPS = [
  'HairVL_Swap', 'HairAcc_Swap', 'HairVD_Swap',
  'ClothVD_Swap', 'ClothAcc_Swap',
  'WeaponVD_Swap',
];

const ALL_COLOR_PROPS = COLOR_PROPS.concat(EXTENDED_COLOR_PROPS);

const DASH_SEED_COLORS = {
  HairLt_Swap: 0xFFFFFF, Hair_Swap: 0xF5F5F5, HairDk_Swap: 0xF3F3F3,
  Body1VL_Swap: 0xFDFCEC, Body1Lt_Swap: 0xFEEDAB, Body1_Swap: 0xFCE785, Body1Dk_Swap: 0xF9DB2F, Body1VD_Swap: 0xFCB422, Body1Acc_Swap: 0xFE8212,
  Body2VL_Swap: 0xF0F0F0, Body2Lt_Swap: 0xECECEC, Body2_Swap: 0xE0E0E0, Body2Dk_Swap: 0xDBDBDB, Body2VD_Swap: 0xDADADA, Body2Acc_Swap: 0xD4D4D4,
  SpecialVL_Swap: 0xFF9900, SpecialLt_Swap: 0xFF9933, Special_Swap: 0xFF6600, SpecialDk_Swap: 0xFF3300, SpecialVD_Swap: 0xFFCC00, SpecialAcc_Swap: 0xFFFF00,
  ClothVL_Swap: 0xD3D3D3, ClothLt_Swap: 0xCBCBCB, Cloth_Swap: 0xB1B1B1, ClothDk_Swap: 0xA6A6A6,
  WeaponVL_Swap: 0xFFFFFF, WeaponLt_Swap: 0xFFFFFF, Weapon_Swap: 0xFFFFFF, WeaponDk_Swap: 0xFFFFFF, WeaponAcc_Swap: 0x7D8B9F,
};

const COLOR_SEED_COLORS = {
  HairLt_Swap: 0xFFFAC1, Hair_Swap: 0xE3FF8B, HairDk_Swap: 0xA8FFC3,
  Body1VL_Swap: 0xFBFF9C, Body1Lt_Swap: 0xCFFFAB, Body1_Swap: 0x94FFF6, Body1Dk_Swap: 0x94BFFF, Body1VD_Swap: 0x8F7BF7, Body1Acc_Swap: 0xD9BEFF,
  Body2VL_Swap: 0x6FFFCF, Body2Lt_Swap: 0x51E6FF, Body2_Swap: 0x5193FF, Body2Dk_Swap: 0x6E51FF, Body2VD_Swap: 0x7D00DD, Body2Acc_Swap: 0xBF52FF,
  SpecialVL_Swap: 0xF8FFCC, SpecialLt_Swap: 0xFFEB99, Special_Swap: 0xFF9189, SpecialDk_Swap: 0xFF619B, SpecialVD_Swap: 0xD62CEC, SpecialAcc_Swap: 0xE087FF,
  ClothVL_Swap: 0xFCFFB9, ClothLt_Swap: 0xFFE5B9, Cloth_Swap: 0xFFBCAD, ClothDk_Swap: 0xE096DF,
  WeaponVL_Swap: 0xCDFFF2, WeaponLt_Swap: 0xFFF376, Weapon_Swap: 0xFFC676, WeaponDk_Swap: 0xFF83E4, WeaponAcc_Swap: 0xEDB3FF,
};

const GC_SEED_COLORS = {
  HairLt_Swap: 0xFDF5D7, Hair_Swap: 0xFEFFEF, HairDk_Swap: 0xF0E9FE,
  Body1VL_Swap: 0xFFC6EA, Body1Lt_Swap: 0xFBE9A3, Body1_Swap: 0xF3FFFD, Body1Dk_Swap: 0xE3FDFE, Body1VD_Swap: 0xFFF5CC, Body1Acc_Swap: 0xE3D6FE,
  Body2VL_Swap: 0xFFE8E2, Body2Lt_Swap: 0x66CCFF, Body2_Swap: 0xC0E2FD, Body2Dk_Swap: 0xFBD7A3, Body2VD_Swap: 0xCBB0E4, Body2Acc_Swap: 0xCDD6FE,
  SpecialVL_Swap: 0xBAFFF4, SpecialLt_Swap: 0xC1FDF7, Special_Swap: 0xD4F2FD, SpecialDk_Swap: 0xE3FCFD, SpecialVD_Swap: 0x3366CC, SpecialAcc_Swap: 0xF0F2FF,
  ClothVL_Swap: 0xA0CBFA, ClothLt_Swap: 0xC5E0F5, Cloth_Swap: 0xFFF7F4, ClothDk_Swap: 0xFBF9FF,
  WeaponVL_Swap: 0x333399, WeaponLt_Swap: 0xDCE2FE, Weapon_Swap: 0xFDFDFD, WeaponDk_Swap: 0xDAEEFE, WeaponAcc_Swap: 0xFDEDD5,
};

const LASTJUMP_SEED_COLORS = {
  HairLt_Swap: 0xB58E8C, Hair_Swap: 0x9F9696, HairDk_Swap: 0xB77A7A,
  Body1VL_Swap: 0x8E7A7A, Body1Lt_Swap: 0x625959, Body1_Swap: 0xB32D2D, Body1Dk_Swap: 0x7A3D3D, Body1VD_Swap: 0x7E3030, Body1Acc_Swap: 0x593C3C,
  Body2VL_Swap: 0xE0E0E0, Body2Lt_Swap: 0xCFCFCF, Body2_Swap: 0xC0C0C0, Body2Dk_Swap: 0xB9B9B9, Body2VD_Swap: 0xACACAC, Body2Acc_Swap: 0xA0A0A0,
  SpecialVL_Swap: 0xFF9900, SpecialLt_Swap: 0xFF9933, Special_Swap: 0xFF6600, SpecialDk_Swap: 0xFF0000, SpecialVD_Swap: 0xFFCC00, SpecialAcc_Swap: 0xFFFF00,
  ClothVL_Swap: 0x8E8E8E, ClothLt_Swap: 0x757575, Cloth_Swap: 0x515151, ClothDk_Swap: 0x513D3D,
  WeaponVL_Swap: 0xA5FFF4, WeaponLt_Swap: 0x30E0D1, Weapon_Swap: 0xFFFFFF, WeaponDk_Swap: 0x515151, WeaponAcc_Swap: 0x7D8B9F,
};

const SEED_PALETTES_BY_TYPE = {
  color: COLOR_SEED_COLORS,
  dash: DASH_SEED_COLORS,
  gc: GC_SEED_COLORS,
  lastjump: LASTJUMP_SEED_COLORS,
};
const SPRITE_TYPE_LABELS = { color: 'Color', dash: 'Dash', gc: 'Gravity Cancel', lastjump: 'Last Jump' };
const SPRITE_TYPE_LS_KEY = 'sprite_type';

const CUSTOM_SPRITE_TYPE_KEY_PREFIX = 'custom:';

function parseSpriteTypeXML(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Malformed XML');
  const root = doc.getElementsByTagName('ColorSchemeType')[0];
  if (!root) throw new Error('No <ColorSchemeType> element found');
  const palette = {};
  for (const p of COLOR_PROPS) {
    const el = root.getElementsByTagName(p)[0];
    if (!el?.textContent) throw new Error(`Missing value for ${p}`);
    let val = el.textContent.trim();
    if (val.startsWith('#')) val = val.slice(1);
    else if (val.startsWith('0x') || val.startsWith('0X')) val = val.slice(2);
    const v = parseInt(val, 16);
    if (isNaN(v)) throw new Error(`Invalid value for ${p}`);
    palette[p] = v;
  }
  for (const p of EXTENDED_COLOR_PROPS) {
    const el = root.getElementsByTagName(p)[0];
    if (!el?.textContent) continue;
    let val = el.textContent.trim();
    if (val.startsWith('#')) val = val.slice(1);
    else if (val.startsWith('0x') || val.startsWith('0X')) val = val.slice(2);
    const v = parseInt(val, 16);
    if (!isNaN(v)) palette[p] = v;
  }
  const nameAttr = root.getAttribute('ColorSchemeName');
  return { palette, name: nameAttr && nameAttr.trim() ? nameAttr.trim() : null };
}

async function loadCustomSpriteTypes() {
  if (!isDesktopApp()) return;
  for (const key of Object.keys(SEED_PALETTES_BY_TYPE)) {
    if (key.startsWith(CUSTOM_SPRITE_TYPE_KEY_PREFIX)) {
      delete SEED_PALETTES_BY_TYPE[key];
      delete SPRITE_TYPE_LABELS[key];
    }
  }
  let entries = [];
  try {
    entries = await window.pywebview.api.list_custom_sprite_types();
  } catch (e) {  }

  const failures = [];
  for (const entry of entries) {
    const key = CUSTOM_SPRITE_TYPE_KEY_PREFIX + entry.filename;
    if (entry.error) { failures.push(`${entry.filename} (${entry.error})`); continue; }
    try {
      const { palette, name } = parseSpriteTypeXML(entry.xml);
      SEED_PALETTES_BY_TYPE[key] = palette;
      SPRITE_TYPE_LABELS[key] = name || entry.name;
    } catch (e) {
      failures.push(`${entry.filename} (${e.message})`);
    }
  }
  if (failures.length) {
    showToast(`Skipped ${failures.length} sprite type file(s): ${failures.join(', ')}`, 'error');
  }
  refreshSpriteTypeDropdown();
}

async function saveCurrentAsSpriteType() {
  if (!isDesktopApp()) { showToast('Custom sprite types only work in the desktop app', 'error'); return; }
  const defaultName = scheme.ColorSchemeName || 'MySpriteType';
  const name = window.prompt('Sprite type name:', defaultName);
  if (!name || !name.trim()) return;

  try {
    const xmlText = scheme.generateXML(activeColorProps());
    const result = await window.pywebview.api.save_sprite_type_xml(xmlText, name.trim());
    await loadCustomSpriteTypes();
    const key = CUSTOM_SPRITE_TYPE_KEY_PREFIX + result.filename;
    if (SEED_PALETTES_BY_TYPE[key]) {
      activeSpriteType = key;
      localStorage.setItem(SPRITE_TYPE_LS_KEY, key);
      refreshSpriteTypeDropdown();
    }
    showToast(`Saved sprite type "${result.filename}"`, 'info');
  } catch (e) {
    showToast(`Could not save sprite type: ${e.message || e}`, 'error');
  }
}

function refreshSpriteTypeDropdown() {
  if (!spriteTypeSharedDD) return;
  spriteTypeSharedDD.setItems([{
    label: 'Sprite Type',
    items: Object.keys(SEED_PALETTES_BY_TYPE)
      .filter((t) => t !== 'color')
      .map((t) => ({ value: t, label: SPRITE_TYPE_LABELS[t] })),
  }]);
  syncSpriteTypeSelectors();
}

function syncSpriteTypeSelectors() {
  if (spriteTypeColorBtn) spriteTypeColorBtn.classList.toggle('btn-primary', activeSpriteType === 'color');
  if (spriteTypeSharedDD) spriteTypeSharedDD.setValue(activeSpriteType === 'color' ? null : activeSpriteType);
  document.body.classList.toggle('is-color-sprite-type', activeSpriteType === 'color');
}

let activeSpriteType = localStorage.getItem(SPRITE_TYPE_LS_KEY) || 'color';
if (!SEED_PALETTES_BY_TYPE[activeSpriteType]) activeSpriteType = 'color';

function getActiveSeedColors() { return SEED_PALETTES_BY_TYPE[activeSpriteType]; }

function isExtendedSpriteType() { return activeSpriteType !== 'color'; }

function activeColorProps() {
  return isExtendedSpriteType() ? COLOR_PROPS.concat(EXTENDED_COLOR_PROPS) : COLOR_PROPS;
}

function gridCellsFor(colId) {
  return (isExtendedSpriteType() ? GRID_CELLS_FULL : GRID_CELLS)[colId];
}

COLOR_PROP_INDEX_BY_ID = new Map();
ALL_COLOR_PROPS.forEach((p, i) => {
  COLOR_PROP_INDEX_BY_ID.set(p.toLowerCase(), i);
  COLOR_PROP_INDEX_BY_ID.set(p.replace(/_Swap$/, '').toLowerCase(), i);
});

class ColorSchemeType {
  constructor() {
    this.HairLt_Swap = 0xFF8080; this.Hair_Swap = 0xFF0000; this.HairDk_Swap = 0x800000;
    this.Body1VL_Swap = 0xFFE0C0; this.Body1Lt_Swap = 0xFFC080; this.Body1_Swap = 0xFF8000;
    this.Body1Dk_Swap = 0x804000; this.Body1VD_Swap = 0x402000; this.Body1Acc_Swap = 0xFFC000;
    this.Body2VL_Swap = 0xFFFFC0; this.Body2Lt_Swap = 0xFFFF80; this.Body2_Swap = 0xFFFF00;
    this.Body2Dk_Swap = 0x808000; this.Body2VD_Swap = 0x404000; this.Body2Acc_Swap = 0xC0FF00;
    this.SpecialVL_Swap = 0xC0FFC0; this.SpecialLt_Swap = 0x80FF80; this.Special_Swap = 0x00FF00;
    this.SpecialDk_Swap = 0x008000; this.SpecialVD_Swap = 0x004000; this.SpecialAcc_Swap = 0x00FFC0;
    this.ClothVL_Swap = 0xC0C0FF; this.ClothLt_Swap = 0x8080FF; this.Cloth_Swap = 0x0000FF; this.ClothDk_Swap = 0x000080;
    this.WeaponVL_Swap = 0xFFC0FF; this.WeaponLt_Swap = 0xFF80FF; this.Weapon_Swap = 0xFF00FF;
    this.WeaponDk_Swap = 0x800080; this.WeaponAcc_Swap = 0xFF0080;

    this.HairVL_Swap = 0xFFC0C0; this.HairAcc_Swap = 0xFF4040; this.HairVD_Swap = 0x400000;
    this.ClothVD_Swap = 0x000040; this.ClothAcc_Swap = 0x4040FF;
    this.WeaponVD_Swap = 0x400040;
  }

  _hex6(n) { return (n & 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase(); }

  generateXML(props = COLOR_PROPS) {
    let xml = '<ColorSchemeType>\n';
    for (const p of props) xml += `\t<${p}>0x${this._hex6(this[p])}</${p}>\n`;
    return xml + '</ColorSchemeType>';
  }

  generateINI(props = COLOR_PROPS) {
    return props.map(p => `${p.replace(/_Swap$/, '')}=#${this._hex6(this[p])}`).join('\n');
  }

  generateSVG() {
    const doc = new DOMParser().parseFromString(EMBEDDED_SVG_TEMPLATE, 'image/svg+xml');
    for (const p of COLOR_PROPS) {
      const node = doc.getElementById(p);
      if (!node) continue;
      const hex = `#${this._hex6(this[p])}`;
      const style = node.getAttribute('style') || '';
      node.setAttribute('style', style.replace(/fill:#[0-9a-fA-F]{6}/, `fill:${hex}`));
    }
    return new XMLSerializer().serializeToString(doc);
  }

  loadXML(xml, locked) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('Malformed XML');
    const root = doc.getElementsByTagName('ColorSchemeType')[0];
    if (!root) throw new Error('ColorSchemeType not found in XML');
    for (const p of COLOR_PROPS) {
      if (locked && locked.has(getColumnFromProp(p))) continue;
      const el = root.getElementsByTagName(p)[0];
      if (!el?.textContent) throw new Error(`Missing value for ${p}`);
      let val = el.textContent.trim();
      if (val.startsWith('#')) val = val.slice(1);
      else if (val.startsWith('0x') || val.startsWith('0X')) val = val.slice(2);
      const v = parseInt(val, 16);
      if (isNaN(v)) throw new Error(`Invalid value for ${p}`);
      this[p] = v;
    }
    for (const p of EXTENDED_COLOR_PROPS) {
      if (locked && locked.has(getColumnFromProp(p))) continue;
      const el = root.getElementsByTagName(p)[0];
      if (!el?.textContent) continue;
      let val = el.textContent.trim();
      if (val.startsWith('#')) val = val.slice(1);
      else if (val.startsWith('0x') || val.startsWith('0X')) val = val.slice(2);
      const v = parseInt(val, 16);
      if (!isNaN(v)) this[p] = v;
    }
  }

  loadINI(ini, locked) {
    const map = {};
    for (const line of ini.split(/\r?\n/).filter(l => l.trim())) {
      const eq = line.indexOf('=');
      if (eq === -1) throw new Error(`Invalid line: ${line}`);
      map[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
    for (const p of COLOR_PROPS) {
      if (locked && locked.has(getColumnFromProp(p))) continue;
      const key = p.replace(/_Swap$/, '');
      if (!(key in map)) throw new Error(`Missing value for ${key}`);
      let val = map[key];
      if (val.startsWith('#')) val = val.slice(1);
      else if (val.startsWith('0x') || val.startsWith('0X')) val = val.slice(2);
      const v = parseInt(val, 16);
      if (isNaN(v)) throw new Error(`Invalid value for ${key}`);
      this[p] = v;
    }
  }

  loadPcode(pcode, locked) {
    const values = [];
    const re = /pushuint\s+(\d+)/g;
    let m;
    while ((m = re.exec(pcode))) values.push(parseInt(m[1], 10));
    if (values.length < 35) {
      throw new Error(`Expected 35 pushuint values in the colour array, found ${values.length}`);
    }
    const PCODE_SLOT_INDEXES = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      16, 17, 18, 19, 20, 21, 26, 27, 28, 29, 30, 31, 32, 33, 34,
    ];
    COLOR_PROPS.forEach((p, i) => {
      if (locked && locked.has(getColumnFromProp(p))) return;
      const v = values[PCODE_SLOT_INDEXES[i]];
      if (v === undefined) throw new Error(`Missing value for ${p}`);
      this[p] = v;
    });
  }

  loadJSON(json, locked) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    const colors = (data && typeof data.colors === 'object' && data.colors)
      ? data.colors
      : (data && typeof data.palette === 'object' && data.palette)
        ? data.palette
        : data;
    if (!colors || typeof colors !== 'object') throw new Error('No colour data found in JSON');
    for (const p of COLOR_PROPS) {
      if (locked && locked.has(getColumnFromProp(p))) continue;
      const key = p.replace(/_Swap$/, '');
      if (!(key in colors)) throw new Error(`Missing value for ${key}`);
      let val = String(colors[key]).trim();
      if (val.startsWith('#')) val = val.slice(1);
      else if (val.startsWith('0x') || val.startsWith('0X')) val = val.slice(2);
      const v = parseInt(val, 16);
      if (isNaN(v)) throw new Error(`Invalid value for ${key}`);
      this[p] = v;
    }
  }

  loadSVG(svgText, locked) {
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('Invalid SVG file');
    const readFill = (node) => {
      const style = node.getAttribute('style') || '';
      const m = style.match(/fill:\s*#?([0-9a-fA-F]{6})/);
      if (m) return m[1];
      const attr = node.getAttribute('fill');
      if (attr && /^#?[0-9a-fA-F]{6}$/.test(attr)) return attr.replace('#', '');
      return null;
    };
    for (const p of COLOR_PROPS) {
      if (locked && locked.has(getColumnFromProp(p))) continue;
      let node = doc.getElementById(p);
      if (!node) node = doc.querySelector(`[data-swap="${p}"]`);
      if (!node) throw new Error(`Missing element for ${p}`);
      const hex = readFill(node);
      if (!hex) throw new Error(`No fill colour found for ${p}`);
      const v = parseInt(hex, 16);
      if (isNaN(v)) throw new Error(`Invalid value for ${p}`);
      this[p] = v;
    }
  }

  loadHexString(hex) {
    if (hex.length !== 180) throw new Error('Invalid hex string length');
    COLOR_PROPS.forEach((p, i) => {
      const v = parseInt(hex.slice(i * 6, i * 6 + 6), 16);
      if (isNaN(v)) throw new Error(`Invalid value for ${p}`);
      this[p] = v;
    });
  }

  toHexString() {
    return COLOR_PROPS.map(p => this._hex6(this[p])).join('');
  }
}

class GameColorSchemeType extends ColorSchemeType {
  constructor() {
    super();
    for (const p of COLOR_PROPS) this[p] = 0;
    this.ColorSchemeName = '';
    this.ColorSchemeID = 0;
    this.DisplayNameKey = '';
    this.OrderID = 0;
    this.TeamColor = 0;
  }

  loadFullXML(outerHTML, nameAttr) {
    const doc = new DOMParser().parseFromString(outerHTML, 'text/xml');
    const root = doc.getElementsByTagName('ColorSchemeType')[0];
    if (!root) throw new Error('ColorSchemeType not found');

    this.ColorSchemeName = nameAttr || '';
    const text = (tag) => root.getElementsByTagName(tag)[0]?.textContent || '';
    this.ColorSchemeID = parseInt(text('ColorSchemeID')) || 0;
    this.DisplayNameKey = text('DisplayNameKey');
    this.OrderID = parseInt(text('OrderID')) || 0;
    this.TeamColor = parseInt(text('TeamColor')) || 0;

    for (const p of COLOR_PROPS) {
      const v = parseInt(text(p), 16);
      if (!isNaN(v)) this[p] = v;
    }
  }
}

class Dropdown {
  constructor(container, opts = {}) {
    this._container = container;
    this._placeholder = opts.placeholder || 'Select…';
    this._searchable = opts.searchable ?? false;
    this._defaultIconHtml = opts.defaultIconHtml || '';
    this._onChange = opts.onChange || null;
    this._open = false;
    this._value = null;
    this._items = [];
    this._filtered = [];
    this._disabled = null;
    this._build();
    this._onOutsideClick = (e) => {
      if (!this._container.contains(e.target)) this.close();
    };
  }

  setItems(groups) {
    this._items = [];
    for (const g of groups) {
      for (const it of g.items) {
        this._items.push({ value: it.value, label: it.label, iconHtml: it.iconHtml || '', group: g.label });
      }
    }
    this._filtered = this._items;
    this._renderList();
  }

  setValue(val) {
    const item = this._items.find(i => i.value === val);
    this._value = val;
    this._btnText.textContent = item ? item.label : this._placeholder;
    this._btnIcon.innerHTML = item?.iconHtml || this._defaultIconHtml || '';
    this._btnIcon.classList.toggle('has-icon', !!(item?.iconHtml || this._defaultIconHtml));
    this._highlightActive();
  }

  getValue() { return this._value; }

  reset() {
    this._value = null;
    this._btnText.textContent = this._placeholder;
    this._btnIcon.innerHTML = this._defaultIconHtml || '';
    this._btnIcon.classList.toggle('has-icon', !!this._defaultIconHtml);
    this._highlightActive();
  }

  onChange(fn) { this._onChange = fn; }

  setDisabledValues(s) { this._disabled = s; this._renderList(); }

  open() {
    if (this._open) return;
    this._open = true;
    this._menu.classList.add('open');
    this._container.classList.add('dropdown-active');
    document.addEventListener('pointerdown', this._onOutsideClick, true);
    if (this._searchable && this._searchInput) {
      this._searchInput.value = '';
      this._filter('');
      this._searchInput.focus();
    }
    this._highlightActive();
    this._scrollToActive();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._menu.classList.remove('open');
    this._container.classList.remove('dropdown-active');
    document.removeEventListener('pointerdown', this._onOutsideClick, true);
  }

  toggle() { this._open ? this.close() : this.open(); }

  _build() {
    this._container.classList.add('dropdown');

    this._btn = el('button', { className: 'dropdown-btn', type: 'button' });
    this._btnIcon = el('span', { className: 'dropdown-btn-icon' });
    this._btnIcon.innerHTML = this._defaultIconHtml || '';
    this._btnIcon.classList.toggle('has-icon', !!this._defaultIconHtml);
    this._btnText = el('span', { className: 'dropdown-btn-text', textContent: this._placeholder });
    const arrow = el('span', { className: 'dropdown-arrow', innerHTML: ICONS.chevron });
    this._btn.append(this._btnIcon, this._btnText, arrow);
    this._btn.addEventListener('click', () => this.toggle());

    this._menu = el('div', { className: 'dropdown-menu' });

    if (this._searchable) {
      const searchWrap = el('div', { className: 'dropdown-search' });
      const searchIcon = el('span', { className: 'dropdown-search-icon', innerHTML: ICONS.search });
      this._searchInput = el('input', { type: 'text', className: 'dropdown-search-input', placeholder: 'Search…' });
      this._searchInput.addEventListener('input', () => this._filter(this._searchInput.value));
      searchWrap.append(searchIcon, this._searchInput);
      this._menu.appendChild(searchWrap);
    }

    this._list = el('div', { className: 'dropdown-list' });
    this._menu.appendChild(this._list);

    this._container.append(this._btn, this._menu);
  }

  _filter(query) {
    const q = query.toLowerCase().trim();
    this._filtered = q ? this._items.filter(i => i.label.toLowerCase().includes(q)) : this._items;
    this._renderList();
  }

  _renderList() {
    this._list.innerHTML = '';
    let lastGroup = null;
    for (const item of this._filtered) {
      if (item.group !== lastGroup) {
        lastGroup = item.group;
        this._list.appendChild(el('div', { className: 'dropdown-group-header', textContent: item.group }));
      }
      const isDisabled = this._disabled && this._disabled.has(item.value);
      const btn = el('button', {
        className: 'dropdown-item' + (item.value === this._value ? ' active' : '') + (isDisabled ? ' disabled' : ''),
        type: 'button',
        dataset: { value: item.value },
      });

      const content = el('span', { className: 'dropdown-item-content' });
      if (item.iconHtml) {
        content.appendChild(el('span', { className: 'dropdown-item-icon', innerHTML: item.iconHtml }));
      }
      content.appendChild(el('span', { className: 'dropdown-item-label', textContent: item.label }));
      btn.appendChild(content);

      if (isDisabled) {
        btn.style.opacity = '0.45';
        btn.style.pointerEvents = 'none';
      } else {
        btn.addEventListener('click', () => this._select(item));
      }
      this._list.appendChild(btn);
    }
  }

  _select(item) {
    this._value = item.value;
    this._btnText.textContent = item.label;
    this._btnIcon.innerHTML = item.iconHtml || this._defaultIconHtml || '';
    this._btnIcon.classList.toggle('has-icon', !!(item.iconHtml || this._defaultIconHtml));
    this.close();
    if (this._onChange) this._onChange(item.value, item);
  }

  _highlightActive() {
    for (const el of this._list.querySelectorAll('.dropdown-item')) {
      el.classList.toggle('active', el.dataset.value === String(this._value));
    }
  }

  _scrollToActive() {
    const active = this._list.querySelector('.dropdown-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }
}

class Editor {
  constructor(textarea, theme = 'dark') {
    this._changeCb = null;
    this._suppressing = false;
    this._format = 'xml';
    this._pendingText = null;
    this._setTimer = 0;
    this._chipMarks = [];

    this._cm = CodeMirror.fromTextArea(textarea, {
      lineNumbers: true,
      lineWrapping: true,
      theme: theme === 'dark' ? 'material-darker' : 'default',
      mode: 'xml',
      tabSize: 2,
      viewportMargin: Infinity,
    });

    this._cm.on('change', () => {
      if (!this._suppressing && this._changeCb) this._changeCb(this._cm.getValue());
    });
  }

  onChange(fn) { this._changeCb = fn; }

  getValue() { return this._pendingText ?? this._cm.getValue(); }

  setValue(text) {
    this._pendingText = text;
    clearTimeout(this._setTimer);
    this._setTimer = setTimeout(() => this._flush(), 80);
  }

  _flush() {
    if (this._pendingText == null) return;
    this._suppressing = true;
    this._cm.setValue(this._pendingText);
    this._suppressing = false;
    this._pendingText = null;
    this._updateChips();
  }

  setTheme(theme) {
    this._cm.setOption('theme', theme === 'dark' ? 'material-darker' : 'default');
  }

  refresh() {
    requestAnimationFrame(() => this._cm.refresh());
  }

  _updateChips() {
    for (const m of this._chipMarks) m.clear();
    this._chipMarks = [];

    const hexRe = /(?:0x|#)([0-9A-Fa-f]{6})\b/g;
    this._cm.eachLine((lineHandle) => {
      const lineNo = this._cm.getLineNumber(lineHandle);
      const text = lineHandle.text;
      let match;
      hexRe.lastIndex = 0;
      while ((match = hexRe.exec(text)) !== null) {
        const color = '#' + match[1];
        const widget = document.createElement('span');
        widget.className = 'cm-color-chip';
        widget.style.backgroundColor = color;
        const bm = this._cm.setBookmark(
          { line: lineNo, ch: match.index },
          { widget, insertLeft: true }
        );
        this._chipMarks.push(bm);
      }
    });
  }

}

class ColorGrid {
  constructor(container) {
    this._container = container;
    this._selectCb = null;
    this._activeProp = null;
    this._cells = {};
    this._lockStates = {};
    this._fillRowCb = null;
    this._rowPickCb = null;
    this._rowHueCb = null;
    this._multiSelectMode = false;
    this._multiSelected = new Set();
    this._multiSelectChangeCb = null;
    this._build();
  }

  onSelect(fn) { this._selectCb = fn; }

  onMultiSelectChange(fn) { this._multiSelectChangeCb = fn; }

  isMultiSelectMode() { return this._multiSelectMode; }

  setMultiSelectMode(on) {
    this._multiSelectMode = !!on;
    this._container.classList.toggle('grid-multiselect', this._multiSelectMode);
    if (!this._multiSelectMode) this.clearMultiSelected();
  }

  getMultiSelected() { return new Set(this._multiSelected); }

  clearMultiSelected() {
    for (const p of this._multiSelected) {
      const c = this._cells[p];
      if (c) c.classList.remove('multi-selected');
    }
    this._multiSelected.clear();
    if (this._multiSelectChangeCb) this._multiSelectChangeCb(0);
  }

  _toggleMultiSelect(prop, cell) {
    if (this._multiSelected.has(prop)) {
      this._multiSelected.delete(prop);
      cell.classList.remove('multi-selected');
    } else {
      this._multiSelected.add(prop);
      cell.classList.add('multi-selected');
    }
    if (this._multiSelectChangeCb) this._multiSelectChangeCb(this._multiSelected.size);
  }

  onFillRow(fn) { this._fillRowCb = fn; }

  onRowPickRequest(fn) { this._rowPickCb = fn; }

  onRowHueShift(fn) { this._rowHueCb = fn; }

  getActiveProp() { return this._activeProp; }

  updateFromScheme(scheme) {
    for (const p of Object.keys(this._cells)) {
      const cell = this._cells[p];
      if (!cell) continue;
      const hex = intToHex(scheme[p]);
      cell.style.backgroundColor = hex;
      cell.dataset.hex = hex;
      const overlay = cell.querySelector('.grid-cell-hex');
      if (overlay) overlay.textContent = hex;
    }
  }

  getLockedColumns() {
    const s = new Set();
    for (const [col, locked] of Object.entries(this._lockStates)) {
      if (locked) s.add(col);
    }
    return s;
  }

  rebuild() {
    const oldLocks = { ...this._lockStates };
    const oldActive = this._activeProp;
    const oldMultiSelected = new Set(this._multiSelected);
    this._build();
    for (const [col, locked] of Object.entries(oldLocks)) {
      if (!locked) continue;
      this._lockStates[col] = true;
      const cb = this._container.querySelector(`.grid-lock[data-col="${col}"]`);
      if (cb) cb.checked = true;
    }
    if (oldActive && this._cells[oldActive]) this._setActive(oldActive);
    if (this._multiSelectMode) {
      this._container.classList.add('grid-multiselect');
      for (const prop of oldMultiSelected) {
        const cell = this._cells[prop];
        if (cell) { this._multiSelected.add(prop); cell.classList.add('multi-selected'); }
      }
    }
  }

  select(prop) {
    this._setActive(prop);
  }

  _build() {
    this._container.classList.add('color-grid');
    this._container.innerHTML = '';

    const table = el('div', { className: 'grid-table' });

    const headerRow = el('div', { className: 'grid-row grid-header' });
    headerRow.appendChild(el('div', { className: 'grid-corner' }));
    for (const row of GRID_ROWS) {
      const head = el('div', { className: 'grid-col-head' });
      const label = el('span', { className: 'grid-col-label', textContent: row.label, title: row.tip });
      head.appendChild(label);
      headerRow.appendChild(head);
    }
    table.appendChild(headerRow);

    for (const col of GRID_COLUMNS) {
      const rowEl = el('div', { className: 'grid-row' });

      const rowLabelWrap = el('div', { className: 'grid-row-label-wrap' });
      const lockCb = el('input', { type: 'checkbox', className: 'grid-lock', title: `Lock ${col.label}`, dataset: { col: col.id } });
      lockCb.addEventListener('change', () => { this._lockStates[col.id] = lockCb.checked; });
      this._lockStates[col.id] = false;
      const rowLabel = el('span', { className: 'grid-row-label', textContent: col.label, title: col.tip });
      const rowPickBtn = el('button', {
        type: 'button',
        className: 'grid-row-pick-btn',
        title: `Copy the row "${col.label}" from a saved in-game scheme`,
        innerHTML: ICONS.load,
      });
      rowPickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this._rowPickCb) this._rowPickCb(col.id);
      });
      rowLabelWrap.append(lockCb, rowLabel, rowPickBtn);
      rowEl.appendChild(rowLabelWrap);

      for (const row of GRID_ROWS) {
        if (gridCellsFor(col.id).has(row.suffix)) {
          const prop = propName(col.id, row.suffix);
          const cell = el('div', {
            className: 'grid-cell',
            title: friendlyName(prop) + ' (double-click: colour the row · Shift+double-click: metallic row)',
            dataset: { prop },
          });
          const overlay = el('span', { className: 'grid-cell-hex' });
          cell.appendChild(overlay);
          cell.addEventListener('click', () => {
            if (this._multiSelectMode) this._toggleMultiSelect(prop, cell);
            else this._setActive(prop);
          });
          cell.addEventListener('dblclick', (e) => {
            e.preventDefault();
            if (this._fillRowCb) this._fillRowCb(col.id, prop, e.shiftKey);
          });
          rowEl.appendChild(cell);
          this._cells[prop] = cell;
        } else {
          rowEl.appendChild(el('div', { className: 'grid-cell grid-cell-empty' }));
        }
      }
      table.appendChild(rowEl);
    }

    this._container.appendChild(table);
    this._table = table;
    this._setupResize();
  }

  _setupResize() {
    const ro = new ResizeObserver(() => this._fitCells());
    ro.observe(this._container);
    requestAnimationFrame(() => this._fitCells());
  }

  _fitCells() {
    const rect = this._container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) return;

    const headerEl = this._table.querySelector('.grid-header');
    const headerH = headerEl ? headerEl.getBoundingClientRect().height + 3 : 32;

    const isMobile = window.matchMedia('(max-width: 680px)').matches;
    const labelCol = isMobile ? 62 : 92;
    const GAP = 3;
    const COLS = 6;
    const ROWS = 6;

    const fromW = (w - labelCol - (COLS + 1) * GAP) / COLS;
    const fromH = (h - headerH - (ROWS) * GAP) / ROWS;
    const cellSize = Math.max(20, Math.floor(Math.min(fromW, fromH)));

    this._table.style.setProperty('--cell-size', cellSize + 'px');
  }

  _setActive(prop) {
    const oldCell = this._container.querySelector('.grid-cell.active');
    if (oldCell) oldCell.classList.remove('active');

    this._activeProp = prop;
    const cell = this._cells[prop];
    if (cell) cell.classList.add('active');
    if (this._selectCb) this._selectCb(prop);
  }
}

const SZ      = 170;
const STRIP_W = 14;
const TRK_W   = 160;
const TRK_H   = 10;

class ColorPicker {
  constructor(container) {
    this._container = container;
    this._h = 0; this._s = 255; this._v = 255;
    this._oldHex = 0xFF0000;
    this._changeCb = null;
    this._canvasMode = 'hue-cube';
    this._sliderMode = 'hsb';
    this._dragging = null;
    this._sliders = {};
    this._modelCache = { cmyk: null, lab: null };
    this._transformBtns = {};
    this._transformInterceptCb = null;
    this._multiSelectToggleCb = null;
    this._multiSelectBtn = null;
    this._build();
    this._switchCanvas(this._canvasMode);
    this._switchSliders(this._sliderMode);
  }

  onChange(fn)  { this._changeCb = fn; }
  setTheme()    {  }

  getColor() {
    const [r, g, b] = hsvToRgb(this._h, this._s, this._v);
    return (r << 16) | (g << 8) | b;
  }

  setColor(hexInt, { updateOld = false } = {}) {
    const r = (hexInt >> 16) & 0xFF, g = (hexInt >> 8) & 0xFF, b = hexInt & 0xFF;
    [this._h, this._s, this._v] = rgbToHsv(r, g, b);
    if (updateOld) this._oldHex = hexInt;
    this._fullSync();
  }

  _build() {
    this._container.classList.add('pk');
    this._container.innerHTML = '';

    const CMODES = [
      ['hue-cube', 'Hue'],
      ['bri-cube', 'Bright'],
      ['wheel',    'Wheel'],
      ['grey',     'Grey'],
    ];
    const ctabs = el('div', { className: 'pk-tabs' });
    for (const [id, lbl] of CMODES) {
      const b = el('button', { className: 'pk-tab', type: 'button', textContent: lbl, dataset: { m: id } });
      b.addEventListener('pointerdown', () => this._switchCanvas(id));
      ctabs.appendChild(b);
    }
    this._container.appendChild(ctabs);

    this._area = el('div', { className: 'pk-area' });
    this._container.appendChild(this._area);

    const sw = el('div', { className: 'pk-swatches' });
    this._oldSw = el('div', { className: 'pk-sw pk-sw-old', title: 'Previous' });
    this._newSw = el('div', { className: 'pk-sw pk-sw-new', title: 'Current' });
    sw.append(this._oldSw, this._newSw);
    this._container.appendChild(sw);

    const SMODES = [['hsb','HSB'],['rgb','RGB'],['cmyk','CMYK'],['lab','LAB'],['hex','Hex']];
    const stabs = el('div', { className: 'pk-tabs pk-tabs-sm' });
    for (const [id, lbl] of SMODES) {
      const b = el('button', { className: 'pk-tab', type: 'button', textContent: lbl, dataset: { s: id } });
      b.addEventListener('pointerdown', () => this._switchSliders(id));
      stabs.appendChild(b);
    }
    this._container.appendChild(stabs);

    this._sliderBox = el('div', { className: 'pk-sliders' });
    this._container.appendChild(this._sliderBox);

    const hr = el('div', { className: 'pk-hex-row' });
    const hl = el('span', { className: 'pk-lbl', textContent: '#' });
    this._hexIn = el('input', {
      type: 'text', className: 'pk-field pk-hex-field',
      maxlength: '6', spellcheck: 'false', autocomplete: 'off',
    });
    this._hexIn.addEventListener('change', () => this._onHexInput());
    const copyBtn = el('button', {
      type: 'button', className: 'pk-hex-btn', title: 'Copy hex',
      innerHTML: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 10.5v-7A1 1 0 013.5 2.5h7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    });
    copyBtn.addEventListener('click', () => this._copyHex());
    const pasteBtn = el('button', {
      type: 'button', className: 'pk-hex-btn', title: 'Paste hex',
      innerHTML: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="8" height="11" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6.2 2h3.6a.6.6 0 01.6.6v1a.6.6 0 01-.6.6H6.2a.6.6 0 01-.6-.6v-1a.6.6 0 01.6-.6z" fill="currentColor"/></svg>',
    });
    pasteBtn.addEventListener('click', () => this._pasteHex());
    hr.append(hl, this._hexIn, copyBtn, pasteBtn);
    this._container.appendChild(hr);

    const trTitle = el('div', { className: 'pk-quick-title-row' });
    trTitle.appendChild(el('span', { className: 'pk-quick-title', textContent: 'Quick Transform' }));
    this._multiSelectBtn = el('button', {
      type: 'button',
      className: 'pk-multiselect-btn',
      textContent: 'Select multiple',
      title: 'Toggle multi-select: pick several swatches and adjust them all at once',
    });
    this._multiSelectBtn.addEventListener('click', () => {
      if (this._multiSelectToggleCb) this._multiSelectToggleCb();
    });
    trTitle.appendChild(this._multiSelectBtn);
    this._container.appendChild(trTitle);

    const tr = el('div', { className: 'pk-transform' });

    const iconSvg = (name) => {
      const map = {
        hMinus: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 8h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        hPlus: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 8h3M6.5 6.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        hue: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        sMinus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 12l5-8 5 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M5.5 10.5h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        sPlus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 12l5-8 5 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M5.5 10.5h3M7 9v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        sat: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 12l5-8 5 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
        bMinus: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2.2v1.4M8 12.4v1.4M2.2 8h1.4M12.4 8h1.4M4 4l1 1M11 11l1 1M4 12l1-1M11 5l1-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
        bPlus: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2.2v1.4M8 12.4v1.4M2.2 8h1.4M12.4 8h1.4M4 4l1 1M11 11l1 1M4 12l1-1M11 5l1-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M6.6 8h2.8M8 6.6v2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
        bri: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2.2v1.4M8 12.4v1.4M2.2 8h1.4M12.4 8h1.4M4 4l1 1M11 11l1 1M4 12l1-1M11 5l1-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
        invert: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2v12" stroke="currentColor" stroke-width="1.5"/><path d="M8 2a6 6 0 010 12" fill="currentColor"/></svg>',
        old: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 7.5A4.5 4.5 0 118 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3.5 3.5v4h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        comp: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2.5v11" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="3" r="1.2" fill="currentColor"/><circle cx="8" cy="13" r="1.2" fill="currentColor"/></svg>',
      };
      return map[name] || '';
    };

    const mkAction = (id, iconName, title, fn, cls = '') => {
      const b = el('button', {
        className: `pk-tbtn ${cls}`.trim(),
        type: 'button',
        title,
        dataset: { tid: id },
      });
      b.appendChild(el('span', { className: 'pk-ticon', innerHTML: iconSvg(iconName) }));
      b.addEventListener('click', fn);
      this._transformBtns[id] = b;
      return b;
    };

    const mkRow = (leftId, leftLabel, leftTip, leftFn, rightId, rightLabel, rightTip, rightFn) => {
      const row = el('div', { className: 'pk-trow pk-trow-2' });
      row.append(
        mkAction(leftId, leftLabel, leftTip, leftFn, 'pk-tbtn-action'),
        mkAction(rightId, rightLabel, rightTip, rightFn, 'pk-tbtn-action')
      );
      tr.appendChild(row);
    };

    mkRow('h-', 'hMinus', 'Hue -15° (selected swatches)', () => this._transformAction('hue', -15), 'h+', 'hPlus', 'Hue +15° (selected swatches)', () => this._transformAction('hue', 15));
    mkRow('s-', 'sMinus', 'Saturation -20 (selected swatches)', () => this._transformAction('sat', -20), 's+', 'sPlus', 'Saturation +20 (selected swatches)', () => this._transformAction('sat', 20));
    mkRow('b-', 'bMinus', 'Brightness -20 (selected swatches)', () => this._transformAction('bri', -20), 'b+', 'bPlus', 'Brightness +20 (selected swatches)', () => this._transformAction('bri', 20));

    const bottom = el('div', { className: 'pk-trow pk-trow-bottom' });
    bottom.append(
      mkAction('inv', 'invert', 'Invert', () => this._transformAction('invert', 0)),
      mkAction('old', 'old', 'Restore previous', () => this._restoreOld()),
      mkAction('cmp', 'comp', 'Complement (Hue +180°)', () => this._transformAction('complement', 180))
    );
    tr.appendChild(bottom);

    this._container.appendChild(tr);
  }

  _switchCanvas(mode) {
    this._canvasMode = mode;
    this._dragging = null;
    for (const t of this._container.querySelectorAll('.pk-tab[data-m]'))
      t.classList.toggle('active', t.dataset.m === mode);
    this._area.innerHTML = '';
    this._plane = this._planeCtx = this._planePtr = null;
    this._strip = this._stripCtx = this._stripPtr = null;

    if (mode === 'hue-cube')  this._mkHueCube();
    else if (mode === 'bri-cube') this._mkBriCube();
    else if (mode === 'wheel') this._mkWheel();
    else if (mode === 'grey')  this._mkGrey();

    this._drawCanvas();
  }

  _mkHueCube() {
    const row = el('div', { className: 'pk-row' });
    const pw = el('div', { className: 'pk-plane-w' });
    this._plane = el('canvas', { width: SZ, height: SZ, className: 'pk-cv' });
    this._planeCtx = this._plane.getContext('2d', { willReadFrequently: false });
    this._planePtr = el('div', { className: 'pk-dot' });
    pw.append(this._plane, this._planePtr);
    this._ptrBind(pw, 'plane', (x, y) => {
      this._s = Math.round(x / (SZ - 1) * 255);
      this._v = Math.round((1 - y / (SZ - 1)) * 255);
    });
    const sw = el('div', { className: 'pk-strip-w' });
    this._strip = el('canvas', { width: STRIP_W, height: SZ, className: 'pk-cv pk-cv-strip' });
    this._stripCtx = this._strip.getContext('2d');
    this._stripPtr = el('div', { className: 'pk-bar' });
    sw.append(this._strip, this._stripPtr);
    this._ptrBind(sw, 'strip', null, (y) => { this._h = (y / (SZ - 1)) * 360; });
    row.append(pw, sw);
    this._area.appendChild(row);
  }

  _mkBriCube() {
    const row = el('div', { className: 'pk-row' });
    const pw = el('div', { className: 'pk-plane-w' });
    this._plane = el('canvas', { width: SZ, height: SZ, className: 'pk-cv' });
    this._planeCtx = this._plane.getContext('2d', { willReadFrequently: false });
    this._planePtr = el('div', { className: 'pk-dot' });
    pw.append(this._plane, this._planePtr);
    this._ptrBind(pw, 'plane', (x, y) => {
      this._h = (x / (SZ - 1)) * 360;
      this._s = Math.round((1 - y / (SZ - 1)) * 255);
    });
    const sw = el('div', { className: 'pk-strip-w' });
    this._strip = el('canvas', { width: STRIP_W, height: SZ, className: 'pk-cv pk-cv-strip' });
    this._stripCtx = this._strip.getContext('2d');
    this._stripPtr = el('div', { className: 'pk-bar' });
    sw.append(this._strip, this._stripPtr);
    this._ptrBind(sw, 'strip', null, (y) => { this._v = Math.round((1 - y / (SZ - 1)) * 255); });
    row.append(pw, sw);
    this._area.appendChild(row);
  }

  _mkWheel() {
    const wrap = el('div', { className: 'pk-wheel-w' });
    this._plane = el('canvas', { width: SZ, height: SZ, className: 'pk-cv pk-cv-round' });
    this._planeCtx = this._plane.getContext('2d', { willReadFrequently: false });
    this._planePtr = el('div', { className: 'pk-dot' });
    this._stripPtr = el('div', { className: 'pk-dot pk-dot-ring' });
    wrap.append(this._plane, this._planePtr, this._stripPtr);

    this._wheelRing = this._renderHueRing();
    const cx = SZ / 2, outerR = cx, innerR = outerR * 0.70;
    this._wInnerR = innerR;
    this._wSqSz = Math.floor(innerR * 1.32);
    this._wSqOff = Math.round(cx - this._wSqSz / 2);

    let drag = null;
    wrap.addEventListener('pointerdown', (e) => {
      wrap.setPointerCapture(e.pointerId);
      const r = this._plane.getBoundingClientRect();
      const sc = SZ / r.width;
      const dx = (e.clientX - r.left) * sc - cx, dy = (e.clientY - r.top) * sc - cx;
      drag = (Math.hypot(dx, dy) >= innerR - 4) ? 'ring' : 'sq';
      this._wheelMove(e, drag);
    });
    wrap.addEventListener('pointermove', (e) => { if (drag) this._wheelMove(e, drag); });
    wrap.addEventListener('pointerup',   ()  => { drag = null; });

    this._area.appendChild(wrap);
  }

  _renderHueRing() {
    const oc = document.createElement('canvas');
    oc.width = SZ; oc.height = SZ;
    const ctx = oc.getContext('2d');
    const img = ctx.createImageData(SZ, SZ);
    const d = img.data;
    const c = SZ / 2, outerR = c, innerR = c * 0.70;
    for (let py = 0; py < SZ; py++) {
      for (let px = 0; px < SZ; px++) {
        const dx = px - c, dy = py - c;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= innerR - 0.5 && dist <= outerR + 0.5) {
          const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
          const [r, g, b] = hsvToRgb(angle, 255, 255);
          const i = (py * SZ + px) << 2;
          let a = 255;
          if (dist < innerR) a = Math.round((1 - (innerR - dist)) * 255);
          else if (dist > outerR) a = Math.round((1 - (dist - outerR)) * 255);
          d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    return oc;
  }

  _wheelMove(e, part) {
    const r = this._plane.getBoundingClientRect();
    const sc = SZ / r.width;
    const c = SZ / 2;
    if (part === 'ring') {
      const dx = (e.clientX - r.left) * sc - c, dy = (e.clientY - r.top) * sc - c;
      this._h = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    } else {
      const off = this._wSqOff, sz = this._wSqSz;
      const lx = Math.max(0, Math.min(sz, (e.clientX - r.left) * sc - off));
      const ly = Math.max(0, Math.min(sz, (e.clientY - r.top) * sc  - off));
      this._s = Math.round((lx / sz) * 255);
      this._v = Math.round((1 - ly / sz) * 255);
    }
    this._afterDrag();
  }

  _mkGrey() {
    const wrap = el('div', { className: 'pk-grey-w' });
    this._strip = el('canvas', { width: SZ, height: 20, className: 'pk-cv pk-grey-cv' });
    this._stripCtx = this._strip.getContext('2d');
    this._stripPtr = el('div', { className: 'pk-bar pk-bar-v' });
    wrap.append(this._strip, this._stripPtr);

    let drag = false;
    wrap.addEventListener('pointerdown', (e) => {
      drag = true; wrap.setPointerCapture(e.pointerId); this._greyMove(e);
    });
    wrap.addEventListener('pointermove', (e) => { if (drag) this._greyMove(e); });
    wrap.addEventListener('pointerup',   ()  => { drag = false; });
    this._area.appendChild(wrap);
  }

  _greyMove(e) {
    const r = this._strip.getBoundingClientRect();
    const x = Math.max(0, Math.min(SZ - 1, (e.clientX - r.left) / r.width * SZ));
    this._h = 0; this._s = 0; this._v = Math.round(x / (SZ - 1) * 255);
    this._afterDrag();
  }

  _drawCanvas() {
    const m = this._canvasMode;
    if (m === 'hue-cube')  this._drawHueCube();
    else if (m === 'bri-cube') this._drawBriCube();
    else if (m === 'wheel') this._drawWheel();
    else if (m === 'grey')  this._drawGrey();
  }

  _drawHueCube() {
    const ctx = this._planeCtx; if (!ctx) return;
    const [r, g, b] = hsvToRgb(this._h, 255, 255);
    const gH = ctx.createLinearGradient(0, 0, SZ, 0);
    gH.addColorStop(0, '#fff'); gH.addColorStop(1, `rgb(${r},${g},${b})`);
    ctx.fillStyle = gH; ctx.fillRect(0, 0, SZ, SZ);
    const gV = ctx.createLinearGradient(0, 0, 0, SZ);
    gV.addColorStop(0, 'rgba(0,0,0,0)'); gV.addColorStop(1, '#000');
    ctx.fillStyle = gV; ctx.fillRect(0, 0, SZ, SZ);

    this._drawHueStrip();

    if (this._planePtr) {
      this._planePtr.style.left = (this._s / 255 * 100) + '%';
      this._planePtr.style.top  = ((1 - this._v / 255) * 100) + '%';
    }
    if (this._stripPtr) this._stripPtr.style.top = (this._h / 360 * 100) + '%';
  }

  _drawBriCube() {
    const ctx = this._planeCtx; if (!ctx) return;
    const img = ctx.createImageData(SZ, SZ);
    const d = img.data;
    for (let y = 0; y < SZ; y++) {
      const sat = Math.round((1 - y / (SZ - 1)) * 255);
      for (let x = 0; x < SZ; x++) {
        const hue = (x / (SZ - 1)) * 360;
        const [r, g, b] = hsvToRgb(hue, sat, this._v);
        const i = (y * SZ + x) << 2;
        d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    const sc = this._stripCtx; if (!sc) return;
    const [cr, cg, cb] = hsvToRgb(this._h, this._s, 255);
    const gV = sc.createLinearGradient(0, 0, 0, SZ);
    gV.addColorStop(0, `rgb(${cr},${cg},${cb})`); gV.addColorStop(1, '#000');
    sc.fillStyle = gV; sc.fillRect(0, 0, STRIP_W, SZ);

    if (this._planePtr) {
      this._planePtr.style.left = (this._h / 360 * 100) + '%';
      this._planePtr.style.top  = ((1 - this._s / 255) * 100) + '%';
    }
    if (this._stripPtr) this._stripPtr.style.top = ((1 - this._v / 255) * 100) + '%';
  }

  _drawWheel() {
    const ctx = this._planeCtx; if (!ctx) return;
    const c = SZ / 2;
    ctx.clearRect(0, 0, SZ, SZ);

    ctx.drawImage(this._wheelRing, 0, 0);

    const sz = this._wSqSz, off = this._wSqOff;
    const [hr, hg, hb] = hsvToRgb(this._h, 255, 255);
    const gH = ctx.createLinearGradient(off, 0, off + sz, 0);
    gH.addColorStop(0, '#fff');
    gH.addColorStop(1, `rgb(${hr},${hg},${hb})`);
    ctx.fillStyle = gH;
    ctx.fillRect(off, off, sz, sz);
    const gV = ctx.createLinearGradient(0, off, 0, off + sz);
    gV.addColorStop(0, 'rgba(0,0,0,0)');
    gV.addColorStop(1, '#000');
    ctx.fillStyle = gV;
    ctx.fillRect(off, off, sz, sz);

    const ringR = (c + this._wInnerR) / 2;
    const rRad = this._h * Math.PI / 180;
    if (this._stripPtr) {
      this._stripPtr.style.left = ((c + Math.cos(rRad) * ringR) / SZ * 100) + '%';
      this._stripPtr.style.top  = ((c + Math.sin(rRad) * ringR) / SZ * 100) + '%';
    }
    if (this._planePtr) {
      this._planePtr.style.left = ((off + (this._s / 255) * sz) / SZ * 100) + '%';
      this._planePtr.style.top  = ((off + (1 - this._v / 255) * sz) / SZ * 100) + '%';
    }
  }

  _drawGrey() {
    const ctx = this._stripCtx; if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, SZ, 0);
    g.addColorStop(0, '#000'); g.addColorStop(1, '#fff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, SZ, 20);
    if (this._stripPtr) this._stripPtr.style.left = (this._v / 255 * 100) + '%';
  }

  _drawHueStrip() {
    const ctx = this._stripCtx; if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, 0, SZ);
    ['#f00','#ff0','#0f0','#0ff','#00f','#f0f','#f00'].forEach((c, i) => g.addColorStop(i / 6, c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, STRIP_W, SZ);
  }

  _ptrBind(wrap, tag, planeSetter, stripSetter) {
    let active = false;
    const isPlane = tag === 'plane';
    wrap.addEventListener('pointerdown', (e) => {
      active = true; wrap.setPointerCapture(e.pointerId);
      isPlane ? this._planeMove(e, planeSetter) : this._stripMove(e, stripSetter);
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!active) return;
      isPlane ? this._planeMove(e, planeSetter) : this._stripMove(e, stripSetter);
    });
    wrap.addEventListener('pointerup', () => { active = false; });
  }

  _planeMove(e, setter) {
    const r = this._plane.getBoundingClientRect();
    const x = Math.max(0, Math.min(SZ - 1, (e.clientX - r.left) / r.width * SZ));
    const y = Math.max(0, Math.min(SZ - 1, (e.clientY - r.top) / r.height * SZ));
    setter(x, y);
    this._afterDrag();
  }

  _stripMove(e, setter) {
    const r = this._strip.getBoundingClientRect();
    const y = Math.max(0, Math.min(SZ - 1, (e.clientY - r.top) / r.height * SZ));
    setter(y);
    this._afterDrag();
  }

  _afterDrag() {
    this._clearModelCache();
    this._drawCanvas();
    this._syncSliders();
    this._syncHex();
    this._syncSwatches();
    this._emit();
  }

  _switchSliders(mode) {
    this._sliderMode = mode;
    for (const t of this._container.querySelectorAll('.pk-tab[data-s]'))
      t.classList.toggle('active', t.dataset.s === mode);
    this._buildSliders();
    this._syncSliders();
  }

  _buildSliders() {
    this._sliderBox.innerHTML = '';
    this._sliders = {};

    const DEFS = {
      hsb:  [['H', 0, 360, ''], ['S', 0, 255, ''], ['B', 0, 255, '']],
      rgb:  [['R', 0, 255, ''], ['G', 0, 255, ''], ['B', 0, 255, '']],
      cmyk: [['C', 0, 100, '%'], ['M', 0, 100, '%'], ['Y', 0, 100, '%'], ['K', 0, 100, '%']],
      lab:  [['L', 0, 100, ''], ['a', -128, 127, ''], ['b', -128, 127, '']],
      hex:  [['R', 0, 255, ''], ['G', 0, 255, ''], ['B', 0, 255, '']],
    };
    const rows = DEFS[this._sliderMode] || DEFS.rgb;
    const isHex = this._sliderMode === 'hex';

    for (const [label, min, max, unit] of rows) {
      const row = el('div', { className: 'pk-srow' });

      const lbl = el('span', { className: 'pk-lbl', textContent: label });

      const tw = el('div', { className: 'pk-track-w' });
      const track = el('canvas', { className: 'pk-track', width: TRK_W, height: TRK_H });
      const tctx = track.getContext('2d');
      const thumb = el('div', { className: 'pk-thumb' });
      tw.append(track, thumb);

      const inp = el('input', {
        type: isHex ? 'text' : 'number',
        className: 'pk-field' + (isHex ? ' pk-hex-field' : ''),
        min: String(min), max: String(max), step: '1',
      });
      if (isHex) inp.maxLength = 2;
      inp.addEventListener('change', () => this._onSliderInput());
      inp.addEventListener('input', () => {
        if (!isHex && inp.value !== '' && !isNaN(inp.value)) this._onSliderInput();
      });

      const uSpan = unit ? el('span', { className: 'pk-unit', textContent: unit }) : null;
      row.append(lbl, tw, inp);
      if (uSpan) row.appendChild(uSpan);
      this._sliderBox.appendChild(row);

      this._sliders[label] = { track, tctx, thumb, input: inp, min, max, tw };

      let dragging = false;
      const apply = (e) => {
        const rect = tw.getBoundingClientRect();
        const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const val = Math.round(min + frac * (max - min));
        inp.value = isHex ? val.toString(16).toUpperCase().padStart(2, '0') : val;
        this._onSliderInput();
      };
      tw.addEventListener('pointerdown', (e) => {
        dragging = true; tw.setPointerCapture(e.pointerId); apply(e);
      });
      tw.addEventListener('pointermove', (e) => { if (dragging) apply(e); });
      tw.addEventListener('pointerup', () => { dragging = false; });
    }
  }

  _syncSliders() {
    const [r, g, b] = hsvToRgb(this._h, this._s, this._v);
    const mode = this._sliderMode;
    const isHex = mode === 'hex';

    let vals;
    if (mode === 'hsb')      vals = { H: Math.round(this._h), S: Math.round(this._s), B: Math.round(this._v) };
    else if (mode === 'rgb' || isHex) vals = { R: r, G: g, B: b };
    else if (mode === 'cmyk') {
      if (this._modelCache.cmyk) vals = { ...this._modelCache.cmyk };
      else {
        const [c, m, y, k] = rgbToCmyk(r, g, b);
        vals = { C: c, M: m, Y: y, K: k };
      }
    }
    else if (mode === 'lab')  {
      if (this._modelCache.lab) vals = { ...this._modelCache.lab };
      else {
        const [L, a, bL] = rgbToLab(r, g, b);
        vals = { L, a, b: bL };
      }
    }

    for (const [key, sl] of Object.entries(this._sliders)) {
      const v = vals[key] ?? 0;
      sl.input.value = isHex
        ? Math.max(0, Math.min(255, v)).toString(16).toUpperCase().padStart(2, '0')
        : v;
      const frac = (v - sl.min) / (sl.max - sl.min);
      sl.thumb.style.left = (Math.max(0, Math.min(1, frac)) * 100) + '%';
      this._paintTrack(key, sl);
    }
  }

  _paintTrack(key, sl) {
    const ctx = sl.tctx, w = TRK_W, h = TRK_H;
    const [cr, cg, cb] = hsvToRgb(this._h, this._s, this._v);
    const mode = this._sliderMode;
    const N = 24;
    const grad = ctx.createLinearGradient(0, 0, w, 0);

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      let pr, pg, pb;
      if (mode === 'hsb') {
        if (key === 'H')      [pr, pg, pb] = hsvToRgb(t * 360, this._s, this._v);
        else if (key === 'S') [pr, pg, pb] = hsvToRgb(this._h, t * 255, this._v);
        else                  [pr, pg, pb] = hsvToRgb(this._h, this._s, t * 255);
      } else if (mode === 'rgb' || mode === 'hex') {
        pr = key === 'R' ? Math.round(t * 255) : cr;
        pg = key === 'G' ? Math.round(t * 255) : cg;
        pb = key === 'B' ? Math.round(t * 255) : cb;
      } else if (mode === 'cmyk') {
        const [oc, om, oy, ok] = rgbToCmyk(cr, cg, cb);
        let nc = oc, nm = om, ny = oy, nk = ok;
        if (key === 'C') nc = Math.round(t * 100);
        else if (key === 'M') nm = Math.round(t * 100);
        else if (key === 'Y') ny = Math.round(t * 100);
        else nk = Math.round(t * 100);
        [pr, pg, pb] = cmykToRgb(nc, nm, ny, nk);
      } else if (mode === 'lab') {
        const [oL, oa, ob] = rgbToLab(cr, cg, cb);
        let nL = oL, na = oa, nb = ob;
        if (key === 'L') nL = Math.round(t * 100);
        else if (key === 'a') na = Math.round(-128 + t * 255);
        else nb = Math.round(-128 + t * 255);
        [pr, pg, pb] = labToRgb(nL, na, nb);
      }
      pr = Math.max(0, Math.min(255, pr));
      pg = Math.max(0, Math.min(255, pg));
      pb = Math.max(0, Math.min(255, pb));
      grad.addColorStop(t, `rgb(${pr},${pg},${pb})`);
    }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 3);
    ctx.fill();
  }

  _onSliderInput() {
    const mode = this._sliderMode;
    const isHex = mode === 'hex';
    const v = (key) => {
      const sl = this._sliders[key]; if (!sl) return 0;
      return isHex ? (parseInt(sl.input.value, 16) || 0)
                    : (parseFloat(sl.input.value) || 0);
    };

    if (mode === 'hsb') {
      this._clearModelCache();
      this._h = this._clamp(v('H'), 0, 360);
      this._s = this._clamp(v('S'), 0, 255);
      this._v = this._clamp(v('B'), 0, 255);
    } else if (mode === 'rgb' || isHex) {
      this._clearModelCache();
      [this._h, this._s, this._v] = rgbToHsv(
        this._clamp(v('R'), 0, 255), this._clamp(v('G'), 0, 255), this._clamp(v('B'), 0, 255));
    } else if (mode === 'cmyk') {
      const c = this._clamp(v('C'), 0, 100);
      const m = this._clamp(v('M'), 0, 100);
      const y = this._clamp(v('Y'), 0, 100);
      const k = this._clamp(v('K'), 0, 100);
      this._modelCache.cmyk = { C: c, M: m, Y: y, K: k };
      this._modelCache.lab = null;
      const [r, g, b] = cmykToRgb(c, m, y, k);
      [this._h, this._s, this._v] = rgbToHsv(r, g, b);
    } else if (mode === 'lab') {
      const L = this._clamp(v('L'), 0, 100);
      const a = this._clamp(v('a'), -128, 127);
      const b = this._clamp(v('b'), -128, 127);
      this._modelCache.lab = { L, a, b };
      this._modelCache.cmyk = null;
      const [r, g, bl] = labToRgb(L, a, b);
      [this._h, this._s, this._v] = rgbToHsv(r, g, bl);
    }

    this._drawCanvas();
    this._syncSliders();
    this._syncHex();
    this._syncSwatches();
    this._emit();
  }

  _syncHex()      { this._hexIn.value = intToHex(this.getColor()).slice(1); }
  _syncSwatches() {
    this._newSw.style.backgroundColor = intToHex(this.getColor());
    this._oldSw.style.backgroundColor = intToHex(this._oldHex);
    this._syncTransforms();
  }

  _previewTransform(id) {
    const [r, g, b] = hsvToRgb(this._h, this._s, this._v);
    if (id === 'h-cur' || id === 's-cur' || id === 'b-cur') return (r << 16) | (g << 8) | b;
    if (id === 'old') return this._oldHex;
    if (id === 'inv') return ((255 - r) << 16) | ((255 - g) << 8) | (255 - b);

    let h = this._h, s = this._s, v = this._v;
    if (id === 'h-') h = (h - 15 + 360) % 360;
    else if (id === 'h+') h = (h + 15) % 360;
    else if (id === 's-') s = this._clamp(s - 20, 0, 255);
    else if (id === 's+') s = this._clamp(s + 20, 0, 255);
    else if (id === 'b-') v = this._clamp(v - 20, 0, 255);
    else if (id === 'b+') v = this._clamp(v + 20, 0, 255);
    else if (id === 'cmp') h = (h + 180) % 360;

    const [tr, tg, tb] = hsvToRgb(h, s, v);
    return (tr << 16) | (tg << 8) | tb;
  }

  _transformForeground(col) {
    const r = (col >> 16) & 0xFF;
    const g = (col >> 8) & 0xFF;
    const b = col & 0xFF;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.58 ? '#0d121a' : '#f5f9ff';
  }

  _syncTransforms() {
    for (const [id, btn] of Object.entries(this._transformBtns)) {
      const col = this._previewTransform(id);
      btn.style.backgroundColor = intToHex(col);
      btn.style.color = this._transformForeground(col);
    }
  }

  _onHexInput() {
    const v = this._hexIn.value.trim().replace(/^#/, '');
    if (/^[0-9A-Fa-f]{6}$/.test(v)) {
      this._clearModelCache();
      const n = parseInt(v, 16);
      [this._h, this._s, this._v] = rgbToHsv((n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF);
      this._drawCanvas();
      this._syncSliders();
      this._syncSwatches();
      this._emit();
    }
  }

  async _copyHex() {
    const hex = '#' + this._hexIn.value.trim().replace(/^#/, '').toUpperCase();
    try {
      await navigator.clipboard.writeText(hex);
      showToast(`Copied ${hex}`, 'info');
    } catch (e) {
      showToast('Failed to copy hex', 'error');
    }
  }

  async _pasteHex() {
    try {
      const text = (await navigator.clipboard.readText()).trim().replace(/^#/, '');
      if (!/^[0-9A-Fa-f]{6}$/.test(text)) {
        showToast('Clipboard has no valid hex colour', 'error');
        return;
      }
      this._hexIn.value = text.toUpperCase();
      this._onHexInput();
    } catch (e) {
      showToast('Failed to read clipboard', 'error');
    }
  }

  _fullSync() {
    this._clearModelCache();
    this._drawCanvas();
    this._syncSliders();
    this._syncHex();
    this._syncSwatches();
    this._syncTransforms();
  }

  _applyHSVAdjust(dH, dS, dV) {
    this._h = (this._h + dH + 360) % 360;
    this._s = this._clamp(this._s + dS, 0, 255);
    this._v = this._clamp(this._v + dV, 0, 255);
    this._afterDrag();
  }

  onTransformIntercept(fn) { this._transformInterceptCb = fn; }

  onMultiSelectToggle(fn) { this._multiSelectToggleCb = fn; }

  setMultiSelectButtonState(active, count = 0) {
    if (!this._multiSelectBtn) return;
    this._multiSelectBtn.classList.toggle('pk-multiselect-btn-active', active);
    this._multiSelectBtn.textContent = active
      ? (count > 0 ? `Selected (${count}) — Done` : 'Selecting… click swatches')
      : 'Select multiple';
  }

  _transformAction(type, delta) {
    if (this._transformInterceptCb && this._transformInterceptCb(type, delta)) return;
    if (type === 'hue') this._applyHSVAdjust(delta, 0, 0);
    else if (type === 'sat') this._applyHSVAdjust(0, delta, 0);
    else if (type === 'bri') this._applyHSVAdjust(0, 0, delta);
    else if (type === 'invert') this._applyInvert();
    else if (type === 'complement') this._applyHSVAdjust(180, 0, 0);
  }

  _applyInvert() {
    const [r, g, b] = hsvToRgb(this._h, this._s, this._v);
    [this._h, this._s, this._v] = rgbToHsv(255 - r, 255 - g, 255 - b);
    this._afterDrag();
  }

  _restoreOld() {
    const n = this._oldHex;
    [this._h, this._s, this._v] = rgbToHsv((n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF);
    this._afterDrag();
  }

  _emit() { if (this._changeCb) this._changeCb(this.getColor()); }
  _clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }
  _clearModelCache() { this._modelCache.cmyk = null; this._modelCache.lab = null; }
}

const HISTORY_MAX_PAST = 100;
const HISTORY_MAX_STATES = HISTORY_MAX_PAST + 1;
const HISTORY_DEBOUNCE_MS = 140;
const SWAP_SHADE_ORDER = ['VL', 'Lt', '', 'Dk', 'VD', 'Acc'];

let theme   = localStorage.getItem('theme') || 'dark';
const CUSTOM_BG_LS_KEY   = 'customBgImage';
const CUSTOM_TEXT_LS_KEY = 'customTextColor';
const CUSTOM_TEXT2_LS_KEY = 'customTextColor2';
const CUSTOM_FONT_LS_KEY = 'customFont';
const CUSTOM_FXLESS_LS_KEY = 'customFxLess';
let format  = 'xml';
let scheme  = new ColorSchemeType();
let gameSchemes = [];
let stringTable = {};

let grid, picker, editor, gameDD, orgDD, spriteTypeColorBtn, spriteTypeSharedDD;
let historyStripEl, undoBtn, redoBtn, historyDeleteBtn;
let historyStates = [];
let historyIndex = -1;
let historyDebounceTimer = 0;
let swapSelectionFirstCol = null;
let cellSwapSelectionFirstProp = null;
let clipboardColour = null;
let gradientSelectionFirstProp = null;
let spriteColors = [];
let spriteBaseImageData = null;
let spriteLabelArray = null;
let spriteBlackMask = null;
let spriteBlackDilateCache = null;
let spriteFillLabelArray = null;
let spriteSkinMask = null;
let spriteMarkSkinMode = false;

let spriteFrames = [];
let spriteFrameIndex = 0;
let spriteAnimTimer = null;
let spriteAnimFPS = 8;
let spriteAnimPlaying = false;

let spriteZoom = 1;
let spritePanX = 0;
let spritePanY = 0;
const SPRITE_ZOOM_MIN = 1;
const SPRITE_ZOOM_MAX = 8;

let spriteIsSVG = false;
let spriteSVGShapes = [];
let spriteSVGLabelOf = null;
let spriteSVGExactMatchSet = new Set();
let spriteSVGGradientOf = null;
let spriteSVGSkinSet = null;
let spriteSVGExactCount = 0;

const DEFAULT_DROPDOWN_ICON = '<span class="history-mini">'
  + '<span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span>'
  + '<span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span>'
  + '<span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#1E2A3D"></span><span class="history-mini-cell" style="background-color:#1E2A3D"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span>'
  + '<span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#1E2A3D"></span><span class="history-mini-cell" style="background-color:#1E2A3D"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span>'
  + '<span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#4D95A8"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span>'
  + '<span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span><span class="history-mini-cell" style="background-color:#7AC7D9"></span>'
  + '</span>';

const ORG_COLOR_SCHEMES = [
  { label: "SiB", hex: ["434A66", "1E222B", "010206", "FFFFFF", "FEFEFF", "F5F6FB", "C1C1E5", "8A8CC5", "8A7DD4", "9EE1FD", "53BFE3", "2E468E", "111E55", "0F183C", "0F0C27", "92C9FF", "50E4FF", "14C7F9", "1E547F", "223659", "111243", "F5F6FB", "E1E8FF", "C3C3DB", "6E6EA4", "C1C1E5", "8985A6", "2F3541", "141416", "15BBF7"] },
  { label: "Obsidian", hex: ["424242", "181818", "000000", "8C8C8C", "414141", "1D1D1D", "0A0A0A", "000000", "2B2B2B", "515151", "262626", "101010", "050505", "000000", "191919", "2C2C2C", "212121", "151515", "040404", "000000", "151515", "6B6B6B", "494949", "313131", "141414", "878787", "3F3F3F", "1D1D1D", "000000", "474747"] },
  { label: "Rose", hex: ["822B45", "5C0118", "41000D", "CC9AAC", "802A44", "2B000B", "1E0006", "160003", "5C0118", "160003", "120104", "0D0103", "070001", "010102", "282E35", "FFD2D2", "D0012B", "5C0118", "2B000B", "1E030A", "690050", "FFFFFF", "F5F8FA", "EAF1F5", "D8E3EE", "FDFDFD", "AAA1A3", "5E4E51", "1E030A", "CACACA"] },
  { label: "Acid Monochrome", hex: ["EDEDED", "CACACA", "878787", "3C3C3C", "272727", "181818", "0B0B0B", "060606", "232323", "494949", "333333", "232323", "131313", "0B0B0B", "2B2B2B", "FBFBFB", "F5F5F5", "CFCFCF", "646464", "212121", "7C7C7C", "EFEFEF", "D4D4D4", "A0A0A0", "6D6D6D", "CCCCCC", "808080", "181818", "111111", "808080"] },
  { label: "Acid Pink", hex: ["3F3F46", "18181B", "050505", "5A5A60", "404044", "27272A", "141416", "09090B", "1F1F22", "FFE6F2", "FFB3D9", "FF66B2", "CC0077", "660033", "FF1493", "FFFFFF", "FF99CC", "FF3399", "B30059", "4D0026", "FF66B2", "71717A", "52525B", "3F3F46", "27272A", "606065", "3A3A40", "1F1F22", "0F0F12", "FF69B4"] },
  { label: "Acid Org", hex: ["4A4A4F", "2D312B", "050505", "5A5A60", "404044", "27272A", "141416", "09090B", "1F1F22", "EAFFE5", "DDFFB3", "ABFF66", "36CC00", "0C6600", "72FF14", "FFFFFF", "B4FF99", "8FFF33", "30B300", "054D00", "9CFF66", "82828C", "62626F", "6A6A6C", "343437", "606065", "3A3A40", "1F1F22", "0F0F12", "93FF6B"] },
  { label: "Royald Gold", hex: ["535560", "2C2B31", "07070A", "FEFEFF", "FEFEFF", "F0F4FF", "C9D5F8", "808AAF", "C1C1BF", "636569", "373A3F", "222527", "161A1C", "010102", "282E35", "FEFEEA", "F5E689", "D9AB25", "65300B", "471A00", "F7C82D", "797F8C", "585E69", "41454D", "202A33", "FEFEEA", "F5E689", "D9AB25", "65300B", "F7C82D"] }
];

document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(theme);
  applyCustomBackground(localStorage.getItem(CUSTOM_BG_LS_KEY) || null);
  applyCustomTextColor(localStorage.getItem(CUSTOM_TEXT_LS_KEY) || null);
  setupTextColor2Control();
  applyCustomTextColor2(localStorage.getItem(CUSTOM_TEXT2_LS_KEY) || null);
  applyCustomFont(localStorage.getItem(CUSTOM_FONT_LS_KEY) || null);
  applyFxLess(localStorage.getItem(CUSTOM_FXLESS_LS_KEY) === '1');

  picker = new ColorPicker(document.getElementById('picker-panel'));
  grid   = new ColorGrid(document.getElementById('grid-panel'));
  editor = new Editor(document.getElementById('editor-textarea'), theme);

  gameDD  = new Dropdown(document.getElementById('game-dd'), {
    placeholder: 'Game Colour Schemes',
    searchable: true,
    defaultIconHtml: DEFAULT_DROPDOWN_ICON,
  });
  orgDD = new Dropdown(document.getElementById('org-dd'), {
    placeholder: 'Org Colors',
    searchable: false,
    defaultIconHtml: DEFAULT_DROPDOWN_ICON,
  });
  orgDD.setItems([{
    label: 'Org Colors',
    items: ORG_COLOR_SCHEMES.map((s, i) => ({
      value: 'org:' + i,
      label: s.label,
      iconHtml: _miniGridHtmlFromHex(s.hex.join('')),
    })),
  }]);
  spriteTypeColorBtn = document.getElementById('sprite-type-color-btn');
  spriteTypeColorBtn.addEventListener('click', () => setSpriteType('color'));
  spriteTypeSharedDD = new Dropdown(document.getElementById('sprite-type-shared-dd'), {
    placeholder: 'Other Sprite Type',
    searchable: false,
  });
  spriteTypeSharedDD.onChange((value) => { if (value) setSpriteType(value); });
  refreshSpriteTypeDropdown();
  loadCustomSpriteTypes();

  grid.onSelect((prop) => {
    if (gradientSelectionFirstProp) {
      _handleGradientSelection(prop);
      return;
    }
    if (cellSwapSelectionFirstProp) {
      _handleCellSwapSelection(prop);
      return;
    }
    _handleSwapSelection(getColumnFromProp(prop));
    picker.setColor(scheme[prop], { updateOld: true });
  });

  grid.onFillRow((colId, prop, metallic) => {
    if (grid.getLockedColumns().has(colId)) {
      showToast('Unlock this row before double-click filling it', 'error');
      return;
    }
    if (metallic) metallicFillRow(colId, scheme[prop]);
    else smartFillRow(colId, scheme[prop]);
  });

  grid.onRowHueShift((colId, deltaH) => shiftColumnHue(colId, deltaH));

  picker.onChange((hexInt) => {
    const prop = grid.getActiveProp();
    if (!prop) return;
    scheme[prop] = hexInt;
    clearSchemeSelections();
    refreshAll({ recordHistory: true, debounceHistory: true });
  });

  grid.onMultiSelectChange((count) => {
    picker.setMultiSelectButtonState(grid.isMultiSelectMode(), count);
  });

  picker.onMultiSelectToggle(() => {
    const turningOn = !grid.isMultiSelectMode();
    grid.setMultiSelectMode(turningOn);
    picker.setMultiSelectButtonState(turningOn, 0);
    showToast(
      turningOn
        ? 'Multi-select: check the swatches you want to adjust together'
        : 'Multi-select off',
      'info'
    );
  });

  picker.onTransformIntercept((type, delta) => {
    const selected = grid.getMultiSelected();
    if (selected.size === 0) return false;
    for (const prop of selected) {
      const hexInt = scheme[prop];
      const r = (hexInt >> 16) & 0xFF, g = (hexInt >> 8) & 0xFF, b = hexInt & 0xFF;
      let [h, s, v] = rgbToHsv(r, g, b);
      if (type === 'hue' || type === 'complement') {
        h = (h + (type === 'complement' ? 180 : delta) + 360) % 360;
      } else if (type === 'sat') {
        s = Math.max(0, Math.min(255, Math.round(s + delta)));
      } else if (type === 'bri') {
        v = Math.max(0, Math.min(255, Math.round(v + delta)));
      } else if (type === 'invert') {
        [h, s, v] = rgbToHsv(255 - r, 255 - g, 255 - b);
      }
      const [nr, ng, nb] = hsvToRgb(h, s, v);
      scheme[prop] = (nr << 16) | (ng << 8) | nb;
    }
    refreshAll({ recordHistory: true, debounceHistory: true });
    showToast(`Applied to ${selected.size} colour${selected.size === 1 ? '' : 's'}`, 'info');
    return true;
  });

  const spriteCanvasEl = document.getElementById('sprite-canvas');
  if (spriteCanvasEl) {
    spriteCanvasEl.addEventListener('click', (e) => {
      if (_spriteConsumeDragClick()) return;
      const rect = spriteCanvasEl.getBoundingClientRect();
      const scaleX = spriteCanvasEl.width  / rect.width;
      const scaleY = spriteCanvasEl.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top)  * scaleY);

      if (spriteMarkSkinMode) {
        const ok = _markSkinRegionAt(x, y, spriteCanvasEl);
        if (ok) {
          renderSpriteFromLabels();
          showToast('Marked as skin — this area will keep its original colours', 'info');
        } else {
          showToast('Nothing to mark at that point', 'error');
        }
        return;
      }

      if (spriteLabelArray && x >= 0 && y >= 0 && x < spriteCanvasEl.width && y < spriteCanvasEl.height) {
        const lbl = spriteLabelArray[y * spriteCanvasEl.width + x];
        if (lbl >= 0) {
          grid.select(ALL_COLOR_PROPS[lbl]);
          return;
        }
      }

      if (!spriteLabelArray) {
        showToast('Upload a sprite first', 'error');
        return;
      }
      showToast('That area is not assigned to any palette colour', 'error');
    });
  }

  const spriteSvgEl = document.getElementById('sprite-svg');
  if (spriteSvgEl) {
    spriteSvgEl.addEventListener('click', (e) => {
      if (_spriteConsumeDragClick()) return;
      if (!spriteSVGLabelOf) {
        showToast('Upload a sprite first', 'error');
        return;
      }
      if (spriteMarkSkinMode) {
        if (!spriteSVGShapes.some((s) => s.el === e.target)) {
          showToast('That shape has no colour to mark', 'error');
          return;
        }
        spriteSVGSkinSet.add(e.target);
        renderSpriteSVGFromLabels();
        showToast('Marked as skin — this shape will keep its original colour', 'info');
        return;
      }
      const lbl = spriteSVGLabelOf.get(e.target);
      if (lbl != null && lbl >= 0) {
        const gradLbl = _resolveGradientClickLabel(e.target, e.clientX, e.clientY);
        grid.select(ALL_COLOR_PROPS[gradLbl != null ? gradLbl : lbl]);
        return;
      }
      showToast('That area is not assigned to any palette colour', 'error');
    });
  }

  _initSpriteZoom();

  let rowPickTarget = null;

  grid.onRowPickRequest((colId) => {
    rowPickTarget = colId;
    gameDD.open();
  });

  gameDD.onChange((_, item) => {
    const gs = gameSchemes.find(g => g.DisplayNameKey === item.value);
    if (!gs) return;

    if (rowPickTarget) {
      const colId = rowPickTarget;
      rowPickTarget = null;
      for (const suffix of gridCellsFor(colId)) {
        const p = propName(colId, suffix);
        scheme[p] = gs[p];
      }
      gameDD.reset();
      clearSchemeSelections();
      refreshAll({ recordHistory: true });
      showToast(`"${COL_LABELS[colId]}" copied from "${item.label}"`, 'info');
      return;
    }

    if (orgDD) orgDD.reset();
    const locked = grid.getLockedColumns();
    for (const p of COLOR_PROPS) {
      if (!locked.has(getColumnFromProp(p))) scheme[p] = gs[p];
    }
    refreshAll({ recordHistory: true });
    showToast(`Loaded "${item.label}"`, 'info');
  });

  orgDD.onChange((value, item) => {
    const idx = parseInt(String(value).replace('org:', ''), 10);
    const org = ORG_COLOR_SCHEMES[idx];
    if (!org) return;
    const locked = grid.getLockedColumns();
    COLOR_PROPS.forEach((p, i) => {
      if (!locked.has(getColumnFromProp(p))) scheme[p] = parseInt(org.hex[i], 16);
    });
    gameDD.reset();
    refreshAll({ recordHistory: true });
    showToast(`Loaded "${item.label}"`, 'info');
  });

  const btnIcons = {
    'btn-undo': 'undo', 'btn-redo': 'redo',
    'btn-randomise': 'dice', 'btn-shade': 'shade', 'btn-gradient': 'gradient',
    'btn-genimg': 'image', 'btn-share': 'share', 'btn-copy': 'copy', 'btn-download': 'download', 'btn-download-xml': 'download', 'btn-download-wcolor': 'download',
    'btn-invert': 'invert',
    'btn-sprite-upload': 'upload', 'btn-sprite-recolor-upload': 'upload', 'btn-sprite-copy-png': 'copy', 'btn-sprite-clear': 'trash',
    'btn-template-map': 'load', 'btn-template-clear': 'trash',
    'btn-history-delete': 'trash',
  };
  for (const [id, name] of Object.entries(btnIcons)) {
    const span = document.getElementById(id)?.querySelector('.btn-icon');
    if (span) span.innerHTML = ICONS[name] || '';
  }
  const desatIconSpan = document.querySelector('.toolbar-desat-icon');
  if (desatIconSpan) desatIconSpan.innerHTML = ICONS['desat'] || '';
  const swapIconSpan = document.querySelector('.toolbar-swap-icon');
  if (swapIconSpan) swapIconSpan.innerHTML = ICONS['randomise'] || '';

  bind('btn-randomise', randomise);
  bind('btn-swap',      beginComponentSwap);
  bind('btn-swap-cell', beginCellSwap);
  bind('btn-shade',     autoShade);
  bind('btn-hue-minus', () => {
    const colId = _requireSelectedColId();
    if (colId) shiftColumnHue(colId, -15);
  });
  bind('btn-hue-plus', () => {
    const colId = _requireSelectedColId();
    if (colId) shiftColumnHue(colId, 15);
  });
  bind('btn-tint-row', () => {
    const colId = _requireSelectedColId();
    if (!colId) return;
    const hexStr = document.getElementById('tint-row-color')?.value || '#808080';
    const r = parseInt(hexStr.slice(1, 3), 16), g = parseInt(hexStr.slice(3, 5), 16), b = parseInt(hexStr.slice(5, 7), 16);
    const [hue] = rgbToHsv(r, g, b);
    tintColumnHue(colId, hue);
  });
  bind('btn-bright-minus', () => {
    const colId = _requireSelectedColId();
    if (colId) darkenColumn(colId, -18);
  });
  bind('btn-bright-plus', () => {
    const colId = _requireSelectedColId();
    if (colId) darkenColumn(colId, 18);
  });
  bind('btn-gradient',  beginGradientSelection);
  bind('btn-invert',    effectInvert);
  bind('btn-desat-all', effectDesaturate);
  bind('btn-desat-col', () => {
    const colId = _requireSelectedColId();
    if (colId) effectDesaturateColumn(colId);
  });
  bind('btn-genimg',    openImageModal);
  bind('btn-share',     share);
  bind('btn-copy',      copyEditor);
  bind('btn-download',  downloadFile);
  bind('btn-download-xml', downloadXMLFile);
  bind('btn-download-wcolor', downloadWcolorFile);
  bind('btn-install',   installToBrawlhalla);
  bind('btn-uninstall', uninstallFromBrawlhalla);
  bind('btn-reset-all', resetAllBrawlhallaColours);
  bind('btn-update-color-values', updateColorValues);

  window.addEventListener('pywebviewready', populateInstallTargetSelect);
  window.addEventListener('pywebviewready', populateUninstallTargetSelect);
  window.addEventListener('pywebviewready', loadCustomSpriteTypes);
  window.addEventListener('azu-content-updated', (ev) => {
    const n = (ev.detail && ev.detail.updated) || 0;
    if (n) showToast(`PreRenders updated (${n} new or changed file${n === 1 ? '' : 's'})`, 'info');
    loadCustomSpriteTypes();
    if (document.getElementById('prerenders-modal')?.classList.contains('open')) openPreRendersGallery();
  });
  populateInstallTargetSelect();
  populateUninstallTargetSelect();

  bind('btn-undo',      undoHistory);
  bind('btn-redo',      redoHistory);

  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    const isUndo = key === 'z' && !e.shiftKey;
    const isRedo = key === 'y' || (key === 'z' && e.shiftKey);
    if (!isUndo && !isRedo) return;

    const target = e.target;
    const tag = target && target.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (target && target.isContentEditable);
    if (isTyping) return;

    e.preventDefault();
    if (isUndo) undoHistory();
    else redoHistory();
  });

  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    const isCopy = key === 'c';
    const isPaste = key === 'v';
    if (!isCopy && !isPaste) return;

    const target = e.target;
    const tag = target && target.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (target && target.isContentEditable);
    if (isTyping) return;

    const prop = grid.getActiveProp();
    if (!prop) return;

    if (isCopy) {
      clipboardColour = scheme[prop];
      e.preventDefault();
      showToast(`Copied ${friendlyName(prop)}`, 'info');
      return;
    }

    if (clipboardColour == null) return;
    const colId = getColumnFromProp(prop);
    if (grid.getLockedColumns().has(colId)) {
      showToast('Unlock this row before pasting', 'error');
      return;
    }
    e.preventDefault();
    clearSchemeSelections();
    scheme[prop] = clipboardColour;
    refreshAll({ recordHistory: true });
    picker.setColor(scheme[prop], { updateOld: true });
    showToast(`Pasted onto ${friendlyName(prop)}`, 'info');
  });
  const brawlhallaPathBtn = document.getElementById('btn-brawlhalla-path');
  if (brawlhallaPathBtn) {
    brawlhallaPathBtn.innerHTML = '';
    brawlhallaPathBtn.appendChild(icon('folder'));
  }
  bind('btn-brawlhalla-path', openBrawlhallaPathModal);
  document.getElementById('brawlhalla-path-modal-backdrop').addEventListener('click', closeBrawlhallaPathModal);
  document.getElementById('brawlhalla-path-browse').addEventListener('click', browseBrawlhallaPath);
  document.getElementById('brawlhalla-path-save').addEventListener('click', saveBrawlhallaPath);
  document.getElementById('brawlhalla-path-clear').addEventListener('click', clearBrawlhallaPath);
  checkBrawlhallaPathOnStartup();

  const devModeBtn = document.getElementById('dev-mode-unlock-btn');
  const devModeInput = document.getElementById('dev-mode-code-input');
  if (devModeBtn) devModeBtn.addEventListener('click', unlockDevMode);
  if (devModeInput) {
    devModeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') unlockDevMode();
    });
  }

  const customizeBtn = document.getElementById('btn-customize');
  if (customizeBtn) {
    customizeBtn.innerHTML = '';
    customizeBtn.appendChild(icon('gear'));
  }
  bind('btn-customize', openCustomizeModal);
  document.getElementById('customize-modal-backdrop').addEventListener('click', closeCustomizeModal);
  document.getElementById('customize-close').addEventListener('click', closeCustomizeModal);

  document.getElementById('customize-dark-toggle').addEventListener('change', (e) => {
    applyTheme(e.target.checked ? 'dark' : 'light');
  });

  document.getElementById('customize-fxless-toggle').addEventListener('change', (e) => {
    applyFxLess(e.target.checked);
    try { localStorage.setItem(CUSTOM_FXLESS_LS_KEY, e.target.checked ? '1' : '0'); } catch (_) {}
  });

  document.getElementById('customize-bg-input').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      applyCustomBackground(dataUrl);
      saveCustomBackground(dataUrl);
      showToast('Background image applied', 'success');
    };
    reader.onerror = () => showToast("Couldn't read that image", 'error');
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  document.getElementById('customize-bg-clear').addEventListener('click', () => {
    applyCustomBackground(null);
    saveCustomBackground(null);
  });

  document.getElementById('customize-text-color').addEventListener('input', (e) => {
    applyCustomTextColor(e.target.value);
    saveCustomTextColor(e.target.value);
  });

  document.getElementById('customize-text-color-reset').addEventListener('click', () => {
    applyCustomTextColor(null);
    saveCustomTextColor(null);
    applyCustomTextColor2(null);
    saveCustomTextColor2(null);
    const colorInput = document.getElementById('customize-text-color');
    if (colorInput) colorInput.value = (theme === 'dark') ? '#e9f2f0' : '#08080f';
  });

  document.getElementById('customize-font-select').addEventListener('change', (e) => {
    applyCustomFont(e.target.value || null);
    saveCustomFont(e.target.value || null);
  });

  document.getElementById('customize-font-reset').addEventListener('click', () => {
    applyCustomFont(null);
    saveCustomFont(null);
  });

  document.getElementById('btn-cvd-apply').addEventListener('click', () => {
    const mode = document.getElementById('cvd-select')?.value;
    if (mode) effectColorblind(mode);
  });

  const spriteTypesSaveBtn = document.getElementById('btn-sprite-types-save');
  if (spriteTypesSaveBtn) { spriteTypesSaveBtn.innerHTML = ''; spriteTypesSaveBtn.appendChild(icon('save')); }
  const spriteTypesFolderBtn = document.getElementById('btn-sprite-types-folder');
  if (spriteTypesFolderBtn) { spriteTypesFolderBtn.innerHTML = ''; spriteTypesFolderBtn.appendChild(icon('folder')); }
  const spriteTypesReloadBtn = document.getElementById('btn-sprite-types-reload');
  if (spriteTypesReloadBtn) { spriteTypesReloadBtn.innerHTML = ''; spriteTypesReloadBtn.appendChild(icon('refresh')); }
  bind('btn-sprite-types-save', saveCurrentAsSpriteType);
  bind('btn-sprite-types-folder', async () => {
    if (!isDesktopApp()) { showToast('Custom sprite types only work in the desktop app', 'error'); return; }
    await window.pywebview.api.open_sprite_types_folder();
  });
  bind('btn-sprite-types-reload', async () => {
    if (!isDesktopApp()) return;
    await loadCustomSpriteTypes();
    showToast('Custom sprite types reloaded', 'info');
  });

  const shadeIntensityInput = document.getElementById('shade-intensity');
  const shadeIntensityLabel = document.getElementById('shade-intensity-value');
  const _shadeIntensityLabelText = (v) => {
    if (v <= 0.05) return 'Flat (0%)';
    if (v < 1) return `Lite (${Math.round(v * 100)}%)`;
    if (v === 1) return 'Normal (100%)';
    return `Strong (${Math.round(v * 100)}%)`;
  };
  if (shadeIntensityInput) {
    shadeIntensityInput.addEventListener('input', () => {
      shadeIntensity = parseFloat(shadeIntensityInput.value);
      if (shadeIntensityLabel) shadeIntensityLabel.textContent = _shadeIntensityLabelText(shadeIntensity);
    });
  }

  initHistoryUI();
  initSpriteUI();
  initTemplateUI();

  document.getElementById('image-close').addEventListener('click', closeImageModal);
  document.getElementById('image-copy').addEventListener('click', copyImagePNG);
  document.getElementById('image-modal-backdrop').addEventListener('click', closeImageModal);

  bind('btn-paste-code', openPasteCodeModal);
  document.getElementById('paste-code-cancel').addEventListener('click', closePasteCodeModal);
  document.getElementById('paste-code-modal-backdrop').addEventListener('click', closePasteCodeModal);
  document.getElementById('paste-code-apply').addEventListener('click', applyPastedCode);

  await loadGameSchemes();
  const loadedFromURL = loadFromURL();
  if (!loadedFromURL) loadDefaultScheme();
  updateShareMetaPreview();

  const firstProp = propName(GRID_COLUMNS[0].id, '');
  grid.select(firstProp);
  refreshAll({ recordHistory: true });
  editor.refresh();

  initTabsUI();
});

function bind(id, fn) {
  const node = document.getElementById(id);
  if (node) node.addEventListener('click', fn);
}

function clearSchemeSelections() {
  gameDD.reset();
  if (orgDD) orgDD.reset();
}

function _columnLabel(colId) {
  return GRID_COLUMNS.find(c => c.id === colId)?.label || colId;
}

function _selectedColId() {
  const prop = grid.getActiveProp();
  return prop ? getColumnFromProp(prop) : null;
}

function _requireSelectedColId() {
  const colId = _selectedColId();
  if (!colId) showToast('First select a cell in the row you want to modify', 'error');
  return colId;
}

function _setSwapButtonState(active) {
  const btn = document.getElementById('btn-swap');
  if (!btn) return;
  btn.classList.toggle('btn-primary', active);
}

function beginComponentSwap() {
  if (swapSelectionFirstCol) {
    swapSelectionFirstCol = null;
    _setSwapButtonState(false);
    showToast('Component swap cancelled', 'info');
    return;
  }
  if (cellSwapSelectionFirstProp) {
    cellSwapSelectionFirstProp = null;
    _setCellSwapButtonState(false);
  }
  swapSelectionFirstCol = '__pending__';
  _setSwapButtonState(true);
  showToast('Swap mode: click a colour in the first component', 'info');
}

function _captureComponent(colId) {
  const out = {};
  for (const shade of SWAP_SHADE_ORDER) {
    if (!gridCellsFor(colId).has(shade)) continue;
    out[shade] = scheme[propName(colId, shade)];
  }
  return out;
}

function _mapComponentSnapshotToColumn(snapshot, sourceCol, targetCol) {
  const srcShades = SWAP_SHADE_ORDER.filter(s => gridCellsFor(sourceCol).has(s));
  const dstShades = SWAP_SHADE_ORDER.filter(s => gridCellsFor(targetCol).has(s));
  const mapped = {};
  if (srcShades.length === 0 || dstShades.length === 0) return mapped;

  const has = (shade) => Object.prototype.hasOwnProperty.call(snapshot, shade);
  const set = (shade, val) => { mapped[propName(targetCol, shade)] = val; };

  for (const shade of dstShades) {
    if (has(shade)) set(shade, snapshot[shade]);
  }

  if (srcShades.length >= dstShades.length) return mapped;

  if (dstShades.includes('VL') && !has('VL') && has('Lt')) {
    set('VL', shadeColour(snapshot.Lt, 1));
  }
  if (dstShades.includes('VD') && !has('VD') && has('Dk')) {
    set('VD', shadeColour(snapshot.Dk, -1));
  }

  if (dstShades.includes('Acc')) {
    const base = has('') ? snapshot[''] : null;
    if (base != null) set('Acc', shadeColour(base, SHADE_MAP.Acc));
  }

  return mapped;
}

function _swapComponents(colA, colB) {
  if (colA === colB) return;
  clearSchemeSelections();
  const locked = grid.getLockedColumns();
  if (locked.has(colA) || locked.has(colB)) {
    showToast('Unlock both components before swapping', 'error');
    return;
  }

  const aSnap = _captureComponent(colA);
  const bSnap = _captureComponent(colB);
  const bToA = _mapComponentSnapshotToColumn(bSnap, colB, colA);
  const aToB = _mapComponentSnapshotToColumn(aSnap, colA, colB);

  for (const [p, v] of Object.entries(bToA)) scheme[p] = v;
  for (const [p, v] of Object.entries(aToB)) scheme[p] = v;

  refreshAll({ recordHistory: true });
  showToast(`Swapped ${_columnLabel(colA)} ↔ ${_columnLabel(colB)}`, 'info');
}

function _handleSwapSelection(colId) {
  if (!swapSelectionFirstCol) return;

  if (swapSelectionFirstCol === '__pending__') {
    swapSelectionFirstCol = colId;
    showToast(`First selected: ${_columnLabel(colId)}. Now click the second component.`, 'info');
    return;
  }

  if (swapSelectionFirstCol === colId) {
    showToast('Pick a different second component', 'error');
    return;
  }

  const first = swapSelectionFirstCol;
  swapSelectionFirstCol = null;
  _setSwapButtonState(false);
  _swapComponents(first, colId);
}

function _setCellSwapButtonState(active) {
  const btn = document.getElementById('btn-swap-cell');
  if (!btn) return;
  btn.classList.toggle('btn-primary', active);
}

function beginCellSwap() {
  if (cellSwapSelectionFirstProp) {
    cellSwapSelectionFirstProp = null;
    _setCellSwapButtonState(false);
    showToast('Cell swap cancelled', 'info');
    return;
  }
  if (swapSelectionFirstCol) {
    swapSelectionFirstCol = null;
    _setSwapButtonState(false);
  }
  cellSwapSelectionFirstProp = '__pending__';
  _setCellSwapButtonState(true);
  showToast('Swap Cell mode: click the first colour', 'info');
}

function _handleCellSwapSelection(prop) {
  if (!cellSwapSelectionFirstProp) return;

  if (cellSwapSelectionFirstProp === '__pending__') {
    cellSwapSelectionFirstProp = prop;
    showToast(`First cell marked: ${friendlyName(prop)}. Now click the second cell.`, 'info');
    return;
  }

  const firstProp = cellSwapSelectionFirstProp;
  cellSwapSelectionFirstProp = null;
  _setCellSwapButtonState(false);

  if (prop === firstProp) {
    showToast('Pick a different second cell', 'error');
    return;
  }

  const locked = grid.getLockedColumns();
  if (locked.has(getColumnFromProp(firstProp)) || locked.has(getColumnFromProp(prop))) {
    showToast('Unlock both rows before swapping', 'error');
    return;
  }

  clearSchemeSelections();
  const tmp = scheme[firstProp];
  scheme[firstProp] = scheme[prop];
  scheme[prop] = tmp;
  refreshAll({ recordHistory: true });
  showToast(`Swapped ${friendlyName(firstProp)} ↔ ${friendlyName(prop)}`, 'info');
}

function _setGradientButtonState(active) {
  const btn = document.getElementById('btn-gradient');
  if (!btn) return;
  btn.classList.toggle('btn-primary', active);
}

function beginGradientSelection() {
  if (gradientSelectionFirstProp) {
    gradientSelectionFirstProp = null;
    _setGradientButtonState(false);
    showToast('Gradiente cancelado', 'info');
    return;
  }
  gradientSelectionFirstProp = '__pending__';
  _setGradientButtonState(true);
  showToast('Gradient mode: click the starting cell', 'info');
}

function _handleGradientSelection(prop) {
  if (!gradientSelectionFirstProp) return;

  if (gradientSelectionFirstProp === '__pending__') {
    gradientSelectionFirstProp = prop;
    showToast('Starting cell marked. Now click the ending cell.', 'info');
    return;
  }

  const firstProp = gradientSelectionFirstProp;
  gradientSelectionFirstProp = null;
  _setGradientButtonState(false);

  if (prop === firstProp) {
    showToast('Choose a different cell as the end point', 'error');
    return;
  }

  const colId = getColumnFromProp(firstProp);
  if (getColumnFromProp(prop) !== colId) {
    showToast('Both cells must be in the same row', 'error');
    return;
  }

  const orderedShades = ['VL', 'Lt', '', 'Dk', 'VD'];
  const shades = orderedShades.filter(s => gridCellsFor(colId).has(s));
  const firstSuffix = getShadeFromProp(firstProp);
  const lastSuffix = getShadeFromProp(prop);
  const i1 = shades.indexOf(firstSuffix);
  const i2 = shades.indexOf(lastSuffix);

  if (i1 === -1 || i2 === -1) {
    showToast("Those cells are not part of this row's shade gradient", 'error');
    return;
  }

  const lo = Math.min(i1, i2), hi = Math.max(i1, i2);
  if (hi - lo < 2) {
    showToast('Pick two cells with at least one cell in between', 'error');
    return;
  }

  const startProp = propName(colId, shades[lo]);
  const endProp = propName(colId, shades[hi]);

  const toLab = (c) => rgbToLab((c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF);
  const fromLab = (L, a, b) => {
    const [r, g, bl] = labToRgb(L, a, b);
    if (r === 0 && g === 0 && bl === 0) return BLACK_FALLBACK;
    return (r << 16) | (g << 8) | bl;
  };

  const [L1, a1, b1] = toLab(scheme[startProp]);
  const [L2, a2, b2] = toLab(scheme[endProp]);

  clearSchemeSelections();
  for (let i = lo + 1; i < hi; i++) {
    const t = (i - lo) / (hi - lo);
    const L = L1 + (L2 - L1) * t;
    const a = a1 + (a2 - a1) * t;
    const b = b1 + (b2 - b1) * t;
    scheme[propName(colId, shades[i])] = fromLab(L, a, b);
  }

  refreshAll({ recordHistory: true });
  showToast(`Gradient applied between the 2 selected cells — ${_columnLabel(colId).replace('\u00A0', ' ')}`, 'info');
}

function initHistoryUI() {
  historyStripEl = document.getElementById('history-strip');
  undoBtn = document.getElementById('btn-undo');
  redoBtn = document.getElementById('btn-redo');
  historyDeleteBtn = document.getElementById('btn-history-delete');
  bind('btn-history-delete', () => deleteHistoryState());
  updateHistoryControls();
}

function initSpriteUI() {
  const fileInput = document.getElementById('sprite-file-input');
  const uploadBtn = document.getElementById('btn-sprite-upload');
  const preview = document.getElementById('sprite-preview');
  if (!fileInput || !uploadBtn || !preview) return;

  uploadBtn.addEventListener('click', () => openPreRendersGallery());
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length) loadSpriteFiles(fileInput.files);
    fileInput.value = '';
  });

  const preRendersAddBtn = document.getElementById('btn-prerenders-add');
  const preRendersAddInput = document.getElementById('prerenders-add-input');
  if (preRendersAddBtn && preRendersAddInput) {
    preRendersAddBtn.addEventListener('click', () => preRendersAddInput.click());
    preRendersAddInput.addEventListener('change', () => {
      if (preRendersAddInput.files && preRendersAddInput.files.length) addFilesToPreRenders(preRendersAddInput.files);
      preRendersAddInput.value = '';
    });
  }
  document.getElementById('prerenders-close')?.addEventListener('click', closePreRendersModal);
  document.getElementById('prerenders-modal-backdrop')?.addEventListener('click', closePreRendersModal);

  const animToggleBtn = document.getElementById('btn-sprite-anim-toggle');
  if (animToggleBtn) animToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); _toggleSpriteAnimation(); });
  const animFpsSel = document.getElementById('sprite-anim-fps');
  if (animFpsSel) {
    animFpsSel.addEventListener('click', (e) => e.stopPropagation());
    animFpsSel.addEventListener('change', () => {
      spriteAnimFPS = parseInt(animFpsSel.value, 10) || 8;
      if (spriteAnimPlaying) _startSpriteAnimation();
    });
  }

  preview.addEventListener('click', () => {
    if (preview.classList.contains('is-empty')) fileInput.click();
  });

  bind('btn-sprite-batch-zip-download', downloadBatchZip);

  const zipColorsBtn = document.getElementById('btn-sprite-zip-colors');
  const zipColorsInput = document.getElementById('sprite-zip-colors-input');
  if (zipColorsBtn && zipColorsInput) {
    zipColorsBtn.addEventListener('click', () => zipColorsInput.click());
    zipColorsInput.addEventListener('change', () => {
      const picked = zipColorsInput.files ? Array.from(zipColorsInput.files) : [];
      if (picked.length) {
        if (picked.length === 1 && /\.zip$/i.test(picked[0].name)) _lastSpriteZipFile = picked[0];
        _dispatchAnalyzeInput(picked);
      }
      zipColorsInput.value = '';
    });
  }
  document.getElementById('sprite-colors-close')?.addEventListener('click', closeSpriteColorsModal);
  document.getElementById('sprite-colors-modal-backdrop')?.addEventListener('click', closeSpriteColorsModal);
  document.getElementById('sprite-colors-copy')?.addEventListener('click', copySpriteColorsList);

  const previewZipBtn = document.getElementById('btn-sprite-preview-zip');
  const previewZipInput = document.getElementById('sprite-preview-zip-input');
  if (previewZipBtn && previewZipInput) {
    previewZipBtn.addEventListener('click', () => {
      if (_lastSWFPreviewFiles && _lastSWFPreviewFiles.length) { previewSWFFiles(_lastSWFPreviewFiles, _lastSWFPreviewFiles.length === 1 && /\.zip$/i.test(_lastSWFPreviewFiles[0].name), undefined, true); return; }
      if (_lastSpriteZipFile) { previewAndArmSVGZip(_lastSpriteZipFile); return; }
      previewZipInput.click();
    });
    previewZipInput.addEventListener('change', () => {
      const picked = previewZipInput.files ? Array.from(previewZipInput.files) : [];
      if (picked.length) {
        if (picked.length === 1 && /\.zip$/i.test(picked[0].name)) _lastSpriteZipFile = picked[0];
        _dispatchPreviewInput(picked);
      }
      previewZipInput.value = '';
    });
  }
  document.getElementById('sprite-zip-preview-close')?.addEventListener('click', closeSpriteZipPreviewModal);
  document.getElementById('sprite-zip-preview-modal-backdrop')?.addEventListener('click', closeSpriteZipPreviewModal);

  bind('btn-swf-shapes-batch-download', downloadSWFShapesBatchZip);
  bind('btn-swf-shapes-bulk-export', bulkExportSWFShapesToSWF);

  document.getElementById('btn-zip-preview-select-all')?.addEventListener('click', () => {
    for (const cb of _zipPreviewVisibleCheckboxes()) {
      cb.checked = true;
      if (cb.dataset.fullPath) _swfShapeSelected[cb.dataset.fullPath] = true;
    }
  });
  document.getElementById('btn-zip-preview-select-none')?.addEventListener('click', () => {
    for (const cb of _zipPreviewVisibleCheckboxes()) {
      cb.checked = false;
      if (cb.dataset.fullPath) _swfShapeSelected[cb.dataset.fullPath] = false;
    }
  });

  document.getElementById('zip-preview-search')?.addEventListener('input', (e) => {
    _zipPreviewApplyFilter(e.target.value);
  });

  document.getElementById('btn-sprite-zip-manual-mode')?.addEventListener('click', (e) => {
    _zipPreviewManualMode = !_zipPreviewManualMode;
    e.currentTarget.textContent = _zipPreviewManualMode ? 'Manual mode: on' : 'Manual mode: off';
    e.currentTarget.classList.toggle('btn-primary', _zipPreviewManualMode);
    const grid = document.getElementById('sprite-zip-preview-grid');
    grid?.classList.toggle('manual-mode', _zipPreviewManualMode);
    for (const cell of grid ? grid.querySelectorAll('.zip-preview-clickable') : []) {
      cell.title = _zipPreviewManualMode ? 'Click to hand-edit a colour on this sprite' : 'Click to edit this sprite';
    }
  });

  bind('btn-zip-preview-clear', clearSpriteZipPreview);

  bind('btn-sprite-clear', clearSprite);
  bind('btn-sprite-mark-skin', () => _setMarkSkinMode(!spriteMarkSkinMode));
  bind('btn-sprite-clear-skin', clearSkinMarks);
  bind('btn-sprite-download-svg', downloadSpriteSVG);
  bind('btn-sprite-copy-png', copySpriteAsPNG);

  const recolorInput = document.getElementById('sprite-recolor-file-input');
  const recolorBtn = document.getElementById('btn-sprite-recolor-upload');
  if (recolorBtn && recolorInput) {
    recolorBtn.addEventListener('click', () => recolorInput.click());
    recolorInput.addEventListener('change', () => {
      const f = recolorInput.files && recolorInput.files[0];
      if (f) {
        if (spriteIsSVG || _isSVGFile(f)) loadRecoloredSpriteSVGFile(f);
        else loadRecoloredSpriteFile(f);
      }
      recolorInput.value = '';
    });
  }

  const outlineSel = document.getElementById('sprite-outline-width');
  if (outlineSel) outlineSel.addEventListener('change', renderSpriteFromLabels);

  ['dragover', 'dragenter'].forEach(evt => preview.addEventListener(evt, (e) => {
    e.preventDefault();
    preview.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach(evt => preview.addEventListener(evt, (e) => {
    e.preventDefault();
    preview.classList.remove('dragover');
  }));
  preview.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length) loadSpriteFiles(files);
  });
}

function _readImageFile(file) {
  if (window.createImageBitmap) {
    return createImageBitmap(file, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' })
      .then((bitmap) => {
        bitmap.naturalWidth = bitmap.width;
        bitmap.naturalHeight = bitmap.height;
        return bitmap;
      });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function quantizeSpriteColors(imageData, maxColors = 48, bucketStep = 16) {
  const data = imageData.data;
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r / bucketStep) | 0) + '_' + ((g / bucketStep) | 0) + '_' + ((b / bucketStep) | 0);
    let bucket = buckets.get(key);
    if (!bucket) { bucket = { r: 0, g: 0, b: 0, count: 0 }; buckets.set(key, bucket); }
    bucket.r += r; bucket.g += g; bucket.b += b; bucket.count++;
  }
  const colors = [];
  for (const bucket of buckets.values()) {
    colors.push({
      r: Math.round(bucket.r / bucket.count),
      g: Math.round(bucket.g / bucket.count),
      b: Math.round(bucket.b / bucket.count),
      count: bucket.count,
    });
  }
  colors.sort((a, b) => b.count - a.count);
  return colors.slice(0, maxColors);
}

let _bifrostSeedRgbCache = {};
function _getBifrostSeedRgb() {
  if (_bifrostSeedRgbCache[activeSpriteType]) return _bifrostSeedRgbCache[activeSpriteType];
  const seedColors = getActiveSeedColors();
  const rgb = ALL_COLOR_PROPS.map((p) => {
    const v = seedColors[p];
    if (v === undefined) return [-9999, -9999, -9999];
    return [(v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
  });
  _bifrostSeedRgbCache[activeSpriteType] = rgb;
  return rgb;
}

function _buildLabelsForImageData(imageData) {
  const data = imageData.data;
  const seedRgb = _getBifrostSeedRgb();

  const QUANT_STEP = 8;
  const MAX_DIST2 = 30 * 30;
  const MIN_MARGIN_RATIO = 2.0;
  const bucketLabel = new Map();
  const W = imageData.width, H = imageData.height;
  const labels = new Int32Array(W * H);

  for (let p = 0, i = 0; p < W * H; p++, i += 4) {
    if (data[i + 3] < 16) { labels[p] = -1; continue; }
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r / QUANT_STEP) | 0) + '_' + ((g / QUANT_STEP) | 0) + '_' + ((b / QUANT_STEP) | 0);
    let lbl = bucketLabel.get(key);
    if (lbl === undefined) {
      let best = -1, bestDist = Infinity, secondDist = Infinity;
      for (let s = 0; s < seedRgb.length; s++) {
        const [sr, sg, sb] = seedRgb[s];
        const dr = r - sr, dg = g - sg, db = b - sb;
        const d = dr * dr + dg * dg + db * db;
        if (d < bestDist) { secondDist = bestDist; bestDist = d; best = s; }
        else if (d < secondDist) { secondDist = d; }
      }
      const closeEnough = bestDist <= MAX_DIST2;
      const clearlyBest = secondDist >= bestDist * MIN_MARGIN_RATIO;
      lbl = (closeEnough && clearlyBest) ? best : -1;
      bucketLabel.set(key, lbl);
    }
    labels[p] = lbl;
  }
  const blackMask = _computeBlackMask(imageData);
  const fillLabelArray = _computeFillLabels(imageData, labels, blackMask, W, H);
  return { labelArray: labels, blackMask, fillLabelArray };
}

function buildSpriteLabels() {
  const canvas = document.getElementById('sprite-canvas');
  if (!canvas || canvas.style.display === 'none' || !canvas.width || !canvas.height) {
    spriteBaseImageData = null;
    spriteLabelArray = null;
    return;
  }
  const sctx = canvas.getContext('2d');
  spriteBaseImageData = sctx.getImageData(0, 0, canvas.width, canvas.height);
  const { labelArray, blackMask, fillLabelArray } = _buildLabelsForImageData(spriteBaseImageData);
  spriteLabelArray = labelArray;
  spriteBlackMask = blackMask;
  spriteBlackDilateCache = null;
  spriteFillLabelArray = fillLabelArray;
  spriteSkinMask = new Uint8Array(canvas.width * canvas.height);
}

function _markSkinRegionAt(x, y, canvas) {
  if (!spriteBaseImageData || !spriteSkinMask) return false;
  const W = canvas.width, H = canvas.height;
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  const data = spriteBaseImageData.data;
  const start = y * W + x;
  const si = start * 4;
  if (data[si + 3] < 16) return false;
  const TOL2 = 40 * 40;
  const r0 = data[si], g0 = data[si + 1], b0 = data[si + 2];
  const visited = new Uint8Array(W * H);
  const stack = [start];
  visited[start] = 1;
  let marked = 0;
  while (stack.length) {
    const p = stack.pop();
    const i = p * 4;
    if (data[i + 3] < 16) continue;
    const dr = data[i] - r0, dg = data[i + 1] - g0, db = data[i + 2] - b0;
    if (dr * dr + dg * dg + db * db > TOL2) continue;
    spriteSkinMask[p] = 1;
    marked++;
    const px = p % W, py = (p / W) | 0;
    if (px > 0) { const q = p - 1; if (!visited[q]) { visited[q] = 1; stack.push(q); } }
    if (px < W - 1) { const q = p + 1; if (!visited[q]) { visited[q] = 1; stack.push(q); } }
    if (py > 0) { const q = p - W; if (!visited[q]) { visited[q] = 1; stack.push(q); } }
    if (py < H - 1) { const q = p + W; if (!visited[q]) { visited[q] = 1; stack.push(q); } }
  }
  return marked > 0;
}

function _computeFillLabels(imageData, labels, blackMask, W, H) {
  const data = imageData.data;
  const fill = new Int32Array(labels.length).fill(-1);
  const MAX_NOISE_SIZE = 60;
  const N = W * H;
  const visited = new Uint8Array(N);
  const isNoiseCandidate = (p) => {
    if (labels[p] !== -1 || blackMask[p]) return false;
    const i = p * 4;
    return data[i + 3] >= 16;
  };
  const stack = new Int32Array(N);
  const comp = new Int32Array(MAX_NOISE_SIZE + 1);

  for (let start = 0; start < N; start++) {
    if (visited[start] || !isNoiseCandidate(start)) continue;

    let sp = 0, cn = 0, overflow = false;
    stack[sp++] = start; visited[start] = 1;
    while (sp > 0) {
      const p = stack[--sp];
      if (!overflow) {
        if (cn < MAX_NOISE_SIZE) comp[cn++] = p; else overflow = true;
      }
      const x = p % W, y = (p / W) | 0;
      if (x > 0) { const q = p - 1; if (!visited[q] && isNoiseCandidate(q)) { visited[q] = 1; stack[sp++] = q; } }
      if (x < W - 1) { const q = p + 1; if (!visited[q] && isNoiseCandidate(q)) { visited[q] = 1; stack[sp++] = q; } }
      if (y > 0) { const q = p - W; if (!visited[q] && isNoiseCandidate(q)) { visited[q] = 1; stack[sp++] = q; } }
      if (y < H - 1) { const q = p + W; if (!visited[q] && isNoiseCandidate(q)) { visited[q] = 1; stack[sp++] = q; } }
    }
    if (overflow) continue;

    const counts = new Map();
    for (let k = 0; k < cn; k++) {
      const p = comp[k];
      const x = p % W, y = (p / W) | 0;
      const neigh = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1];
      for (const q of neigh) {
        if (q < 0) continue;
        const lbl = labels[q];
        if (lbl < 0) continue;
        counts.set(lbl, (counts.get(lbl) || 0) + 1);
      }
    }
    if (counts.size) {
      let best = -1, bestC = 0;
      for (const [lbl, c] of counts) { if (c > bestC) { bestC = c; best = lbl; } }
      for (let k = 0; k < cn; k++) fill[comp[k]] = best;
    }
  }
  return fill;
}

function _computeBlackMask(imageData) {
  const data = imageData.data;
  const W = imageData.width, H = imageData.height;
  const mask = new Uint8Array(W * H);
  const THRESH = 20;
  for (let p = 0, i = 0; p < W * H; p++, i += 4) {
    if (data[i + 3] < 16) continue;
    if (data[i] <= THRESH && data[i + 1] <= THRESH && data[i + 2] <= THRESH) mask[p] = 1;
  }
  return mask;
}

function _dilateMask(mask, W, H, radius) {
  if (radius <= 0) return mask;
  const temp = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const rowOff = y * W;
    for (let x = 0; x < W; x++) {
      let v = 0;
      const lo = Math.max(0, x - radius), hi = Math.min(W - 1, x + radius);
      for (let xx = lo; xx <= hi; xx++) { if (mask[rowOff + xx]) { v = 1; break; } }
      temp[rowOff + x] = v;
    }
  }
  const out = new Uint8Array(W * H);
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      let v = 0;
      const lo = Math.max(0, y - radius), hi = Math.min(H - 1, y + radius);
      for (let yy = lo; yy <= hi; yy++) { if (temp[yy * W + x]) { v = 1; break; } }
      out[y * W + x] = v;
    }
  }
  return out;
}

function _getDilatedBlackMask(radius, W, H) {
  if (radius <= 0) return null;
  if (spriteBlackDilateCache && spriteBlackDilateCache.radius === radius) return spriteBlackDilateCache.mask;
  const mask = _dilateMask(spriteBlackMask, W, H, radius);
  spriteBlackDilateCache = { radius, mask };
  return mask;
}

function renderSpriteFromLabels() {
  if (spriteIsSVG) { renderSpriteSVGFromLabels(); return; }
  if (!spriteBaseImageData || !spriteLabelArray) return;
  const canvas = document.getElementById('sprite-canvas');
  if (!canvas) return;
  if (canvas.width !== spriteBaseImageData.width || canvas.height !== spriteBaseImageData.height) {
    canvas.width = spriteBaseImageData.width;
    canvas.height = spriteBaseImageData.height;
  }
  const out = new ImageData(
    new Uint8ClampedArray(spriteBaseImageData.data),
    spriteBaseImageData.width,
    spriteBaseImageData.height,
  );
  const data = out.data;
  const targets = ALL_COLOR_PROPS.map((p) => scheme[p]);
  const fillLabels = spriteFillLabelArray;
  const skinMask = spriteSkinMask;
  for (let p = 0; p < spriteLabelArray.length; p++) {
    if (skinMask && skinMask[p]) continue;
    let lbl = spriteLabelArray[p];
    if (lbl < 0 && fillLabels) lbl = fillLabels[p];
    if (lbl < 0) continue;
    const hexInt = targets[lbl];
    const i = p * 4;
    data[i] = (hexInt >> 16) & 0xFF;
    data[i + 1] = (hexInt >> 8) & 0xFF;
    data[i + 2] = hexInt & 0xFF;
  }

  const outlineSel = document.getElementById('sprite-outline-width');
  const radius = outlineSel ? parseInt(outlineSel.value, 10) || 0 : 0;
  if (radius > 0 && spriteBlackMask) {
    const W = out.width, H = out.height;
    const dilated = _getDilatedBlackMask(radius, W, H);
    const baseData = spriteBaseImageData.data;
    for (let p = 0, i = 0; p < dilated.length; p++, i += 4) {
      if (!dilated[p] || baseData[i + 3] < 16) continue;
      data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
    }
  }

  canvas.getContext('2d').putImageData(out, 0, 0);
}

function _isSVGFile(file) {
  return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name || '');
}

function _applyLabelColorsToScheme(imageData, labelArray, fillLabelArray) {
  const data = imageData.data;
  const sums = ALL_COLOR_PROPS.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
  for (let p = 0, i = 0; p < labelArray.length; p++, i += 4) {
    if (data[i + 3] < 16) continue;
    const lbl = labelArray[p];
    if (lbl < 0) continue;
    const s = sums[lbl];
    s.r += data[i]; s.g += data[i + 1]; s.b += data[i + 2]; s.count++;
  }
  const locked = grid.getLockedColumns();
  let applied = 0;
  ALL_COLOR_PROPS.forEach((prop, idx) => {
    if (locked.has(getColumnFromProp(prop))) return;
    const s = sums[idx];
    if (!s.count) return;
    const r = Math.round(s.r / s.count), g = Math.round(s.g / s.count), b = Math.round(s.b / s.count);
    scheme[prop] = (r << 16) | (g << 8) | b;
    applied++;
  });
  return applied;
}

function _naturalFileCompare(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

function loadSpriteFiles(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (!files.length) return;
  if (files.length === 1) { loadSpriteFile(files[0]); return; }

  const svgFiles = files.filter((f) => _isSVGFile(f)).sort(_naturalFileCompare);
  const rasterFiles = files.filter((f) => f.type.startsWith('image/') && !_isSVGFile(f)).sort(_naturalFileCompare);

  if (svgFiles.length && rasterFiles.length) {
    showToast('Select only SVGs or only raster images for an animation — mixing is not supported', 'error');
    return;
  }

  if (svgFiles.length > 1) { loadSpriteSVGFrames(svgFiles); return; }
  if (svgFiles.length === 1) { loadSpriteFile(svgFiles[0]); return; }

  if (!rasterFiles.length) {
    showToast('Select valid images (PNG/JPG) or several SVGs for an animation', 'error');
    return;
  }
  if (rasterFiles.length === 1) { loadSpriteFile(rasterFiles[0]); return; }

  loadSpriteFrames(rasterFiles);
}

function loadSpriteFrames(files) {
  _stopSpriteAnimation();
  spriteIsSVG = false;
  const svgEl = document.getElementById('sprite-svg');
  if (svgEl) { svgEl.style.display = 'none'; svgEl.innerHTML = ''; }
  const dlSvgBtn = document.getElementById('btn-sprite-download-svg');
  if (dlSvgBtn) dlSvgBtn.style.display = 'none';

  Promise.all(files.map((f) => _readImageFile(f).then((img) => ({ file: f, img }))))
    .then((loaded) => {
      const maxW = Math.max(...loaded.map(({ img }) => img.naturalWidth));
      const maxH = Math.max(...loaded.map(({ img }) => img.naturalHeight));
      const frames = loaded.map(({ file, img }) => {
        const off = document.createElement('canvas');
        off.width = maxW; off.height = maxH;
        const octx = off.getContext('2d');
        octx.imageSmoothingEnabled = false;
        octx.clearRect(0, 0, maxW, maxH);
        const dx = Math.floor((maxW - img.naturalWidth) / 2);
        const dy = Math.floor((maxH - img.naturalHeight) / 2);
        octx.drawImage(img, dx, dy);
        const imageData = octx.getImageData(0, 0, maxW, maxH);
        const { labelArray, blackMask, fillLabelArray } = _buildLabelsForImageData(imageData);
        return {
          name: file.name,
          imageData,
          labelArray,
          fillLabelArray,
          blackMask,
          skinMask: new Uint8Array(maxW * maxH),
        };
      });

      spriteFrames = frames;
      spriteFrameIndex = 0;

      const canvas = document.getElementById('sprite-canvas');
      const emptyEl = document.getElementById('sprite-empty');
      if (canvas) canvas.style.display = 'block';
      if (emptyEl) emptyEl.style.display = 'none';
      const previewEl = document.getElementById('sprite-preview');
      if (previewEl) previewEl.classList.remove('is-empty');

      const firstImg = loaded[0].img;
      const first = frames[0];
      const maxDim = 2000;
      const scale = Math.min(1, maxDim / Math.max(firstImg.naturalWidth, firstImg.naturalHeight));
      const qw = Math.max(1, Math.round(firstImg.naturalWidth * scale));
      const qh = Math.max(1, Math.round(firstImg.naturalHeight * scale));
      const qCanvas = document.createElement('canvas');
      qCanvas.width = qw; qCanvas.height = qh;
      const qctx = qCanvas.getContext('2d');
      qctx.imageSmoothingEnabled = false;
      qctx.drawImage(firstImg, 0, 0, qw, qh);
      spriteColors = quantizeSpriteColors(qctx.getImageData(0, 0, qw, qh));

      const recolorBtn = document.getElementById('btn-sprite-recolor-upload');
      const clearBtn = document.getElementById('btn-sprite-clear');
      const copyPngBtn = document.getElementById('btn-sprite-copy-png');
      if (clearBtn) clearBtn.disabled = false;
      if (copyPngBtn) copyPngBtn.disabled = false;
      _setSpriteMarkSkinButtonsEnabled(true);

      let autoMapped = 0;
      if (activeSpriteType !== 'color') {
        autoMapped = _applyLabelColorsToScheme(first.imageData, first.labelArray, first.fillLabelArray);
        if (autoMapped) clearSchemeSelections();
      }

      if (recolorBtn) recolorBtn.disabled = !first.labelArray;

      _resetSpriteZoom();
      _setSpriteZoomControlsEnabled(true);
      _setSpriteAnimControlsVisible(true);

      const statusEl = document.getElementById('sprite-status');
      if (autoMapped) {
        _showSpriteFrame(0);
        refreshAll({ recordHistory: true });
        if (statusEl) statusEl.textContent = `${frames.length} frames — ${spriteColors.length} colours detected — ${autoMapped}/${activeColorProps().length} auto-mapped into the palette`;
        showToast(`Animation loaded (${frames.length} frames) — ${autoMapped} colours auto-mapped to the palette`, 'info');
      } else {
        _showSpriteFrame(0);
        if (statusEl) statusEl.textContent = `${frames.length} frames — ${spriteColors.length} colours detected`;
        showToast(`Animation loaded — ${frames.length} frames`, 'info');
      }

      _startSpriteAnimation();
    }).catch(() => showToast('Could not read the images', 'error'));
}

function _showSpriteFrame(idx) {
  if (!spriteFrames.length) return;
  spriteFrameIndex = ((idx % spriteFrames.length) + spriteFrames.length) % spriteFrames.length;
  const f = spriteFrames[spriteFrameIndex];
  if (spriteIsSVG) {
    _applySVGFrameToDOM(f.srcRoot, f.normViewBox);
    _collectSpriteSVGShapes();
    buildSpriteSVGLabels();
    renderSpriteSVGFromLabels();
  } else {
    spriteBaseImageData = f.imageData;
    spriteLabelArray = f.labelArray;
    spriteFillLabelArray = f.fillLabelArray;
    spriteBlackMask = f.blackMask;
    spriteBlackDilateCache = null;
    spriteSkinMask = f.skinMask;
    renderSpriteFromLabels();
  }
  const frameEl = document.getElementById('sprite-anim-frame');
  if (frameEl) frameEl.textContent = `${spriteFrameIndex + 1}/${spriteFrames.length}`;
}

function _setSpriteAnimControlsVisible(visible) {
  const el = document.getElementById('sprite-anim-controls');
  if (el) el.style.display = visible ? '' : 'none';
}

function _updateSpriteAnimPlayButton() {
  const btn = document.getElementById('btn-sprite-anim-toggle');
  if (btn) { btn.textContent = spriteAnimPlaying ? '⏸' : '▶'; btn.title = spriteAnimPlaying ? 'Pause animation' : 'Play animation'; }
}

function _startSpriteAnimation() {
  if (spriteAnimTimer) { clearInterval(spriteAnimTimer); spriteAnimTimer = null; }
  if (spriteFrames.length < 2) return;
  spriteAnimPlaying = true;
  _updateSpriteAnimPlayButton();
  spriteAnimTimer = setInterval(() => _showSpriteFrame(spriteFrameIndex + 1), Math.max(20, Math.round(1000 / spriteAnimFPS)));
}

function _pauseSpriteAnimation() {
  if (spriteAnimTimer) { clearInterval(spriteAnimTimer); spriteAnimTimer = null; }
  spriteAnimPlaying = false;
  _updateSpriteAnimPlayButton();
}

function _toggleSpriteAnimation() {
  if (spriteAnimPlaying) _pauseSpriteAnimation(); else _startSpriteAnimation();
}

function _stopSpriteAnimation() {
  if (spriteAnimTimer) { clearInterval(spriteAnimTimer); spriteAnimTimer = null; }
  spriteAnimPlaying = false;
  spriteFrames = [];
  spriteFrameIndex = 0;
  _setSpriteAnimControlsVisible(false);
  _updateSpriteAnimPlayButton();
}

function loadSpriteFile(file) {
  if (!file) return;
  _stopSpriteAnimation();
  if (_isSVGFile(file)) { loadSpriteSVGFile(file); return; }
  if (!file.type.startsWith('image/')) {
    showToast('Select a valid image file', 'error');
    return;
  }
  spriteIsSVG = false;
  const svgEl = document.getElementById('sprite-svg');
  if (svgEl) { svgEl.style.display = 'none'; svgEl.innerHTML = ''; }
  const dlSvgBtn = document.getElementById('btn-sprite-download-svg');
  if (dlSvgBtn) dlSvgBtn.style.display = 'none';

  _readImageFile(file).then((img) => {
    const canvas = document.getElementById('sprite-canvas');
    const emptyEl = document.getElementById('sprite-empty');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const pctx = canvas.getContext('2d');
    pctx.imageSmoothingEnabled = false;
    pctx.clearRect(0, 0, canvas.width, canvas.height);
    pctx.drawImage(img, 0, 0);
    canvas.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    const previewEl = document.getElementById('sprite-preview');
    if (previewEl) previewEl.classList.remove('is-empty');

    const maxDim = 2000;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const qw = Math.max(1, Math.round(img.naturalWidth * scale));
    const qh = Math.max(1, Math.round(img.naturalHeight * scale));
    const qCanvas = document.createElement('canvas');
    qCanvas.width = qw; qCanvas.height = qh;
    const qctx = qCanvas.getContext('2d');
    qctx.imageSmoothingEnabled = false;
    qctx.drawImage(img, 0, 0, qw, qh);
    const imageData = qctx.getImageData(0, 0, qw, qh);
    spriteColors = quantizeSpriteColors(imageData);

    const recolorBtn = document.getElementById('btn-sprite-recolor-upload');
    const clearBtn = document.getElementById('btn-sprite-clear');
    const copyPngBtn = document.getElementById('btn-sprite-copy-png');
    if (clearBtn) clearBtn.disabled = false;
    if (copyPngBtn) copyPngBtn.disabled = false;
    _setSpriteMarkSkinButtonsEnabled(true);

    const statusEl = document.getElementById('sprite-status');
    if (statusEl) statusEl.textContent = `${spriteColors.length} colours detected in the sprite`;

    buildSpriteLabels();

    let autoMapped = 0;
    if (activeSpriteType !== 'color' && spriteLabelArray && spriteBaseImageData) {
      autoMapped = _applyLabelColorsToScheme(spriteBaseImageData, spriteLabelArray, spriteFillLabelArray);
      if (autoMapped) clearSchemeSelections();
    }

    if (recolorBtn) recolorBtn.disabled = !spriteLabelArray;

    _resetSpriteZoom();
    _setSpriteZoomControlsEnabled(true);

    if (autoMapped) {
      refreshAll({ recordHistory: true });
      if (statusEl) statusEl.textContent = `${spriteColors.length} colours detected — ${autoMapped}/${activeColorProps().length} auto-mapped into the palette`;
      showToast(`Sprite loaded — ${autoMapped} colours auto-mapped to the palette`, 'info');
    } else {
      renderSpriteFromLabels();
      showToast('Sprite loaded', 'info');
    }
  }).catch(() => showToast('Could not read the image', 'error'));
}

function _svgFrameViewBoxRect(srcRoot) {
  const vb = srcRoot.getAttribute('viewBox');
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
    }
  }
  const parseLen = (s) => parseFloat(String(s || '').trim()) || 100;
  return { x: 0, y: 0, w: parseLen(srcRoot.getAttribute('width')), h: parseLen(srcRoot.getAttribute('height')) };
}

function _applySVGFrameToDOM(srcRoot, forcedViewBox) {
  const svgEl = document.getElementById('sprite-svg');
  if (!svgEl) return;
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
  for (const child of Array.from(srcRoot.childNodes)) {
    svgEl.appendChild(document.importNode(child, true));
  }
  if (forcedViewBox) {
    svgEl.setAttribute('viewBox', forcedViewBox);
    return;
  }
  const vb = srcRoot.getAttribute('viewBox');
  if (vb) {
    svgEl.setAttribute('viewBox', vb);
  } else {
    const parseLen = (s) => parseFloat(String(s || '').trim()) || 100;
    const vbW = parseLen(srcRoot.getAttribute('width'));
    const vbH = parseLen(srcRoot.getAttribute('height'));
    svgEl.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  }
}

function _collectSpriteSVGShapes() {
  const svgEl = document.getElementById('sprite-svg');
  if (!svgEl) return;

  const SHAPE_TAGS = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline'];
  spriteSVGShapes = [];
  const counts = new Map();
  const gradientDefs = new Map();
  for (const grad of svgEl.querySelectorAll('linearGradient, radialGradient')) {
    const gradId = grad.getAttribute('id');
    const isRadial = grad.tagName.toLowerCase() === 'radialgradient';
    const units = grad.getAttribute('gradientUnits') || 'objectBoundingBox';
    const geom = isRadial
      ? {
          cx: _parseGradNum(grad.getAttribute('cx'), 0.5),
          cy: _parseGradNum(grad.getAttribute('cy'), 0.5),
          r: _parseGradNum(grad.getAttribute('r'), 0.5),
        }
      : {
          x1: _parseGradNum(grad.getAttribute('x1'), 0),
          y1: _parseGradNum(grad.getAttribute('y1'), 0),
          x2: _parseGradNum(grad.getAttribute('x2'), 1),
          y2: _parseGradNum(grad.getAttribute('y2'), 0),
        };
    const stops = [];
    for (const stop of grad.getElementsByTagName('stop')) {
      let fill = null;
      const style = stop.getAttribute('style');
      if (style) {
        const m = style.match(/stop-color:\s*([^;]+)/i);
        if (m) fill = m[1].trim();
      }
      if (fill == null) fill = stop.getAttribute('stop-color');
      if (fill == null) continue;
      fill = fill.trim();
      if (fill === 'none') continue;
      const hex = _parseCssColorToHex(fill);
      if (hex == null) continue;
      const offset = _parseGradNum(stop.getAttribute('offset'), stops.length ? 1 : 0);
      spriteSVGShapes.push({ el: stop, hex, isStop: true });
      counts.set(hex, (counts.get(hex) || 0) + 1);
      stops.push({ el: stop, hex, offset });
    }
    if (gradId && stops.length) gradientDefs.set(gradId, { type: isRadial ? 'radial' : 'linear', units, geom, stops });
  }

  spriteSVGGradientOf = new Map();
  for (const tag of SHAPE_TAGS) {
    for (const el of svgEl.getElementsByTagName(tag)) {
      let fill = el.style?.fill || el.getAttribute('fill');
      let node = el.parentElement;
      while (fill == null && node && node !== svgEl.parentElement) {
        fill = node.style?.fill || node.getAttribute('fill');
        node = node.parentElement;
      }
      if (fill == null) fill = '#000000';
      fill = fill.trim();
      if (fill === 'none') continue;

      if (fill.startsWith('url(')) {
        const idMatch = /url\(\s*["']?#([^"')]+)["']?\s*\)/i.exec(fill);
        const gradId = idMatch ? idMatch[1] : null;
        const info = gradId ? gradientDefs.get(gradId) : undefined;
        if (!info) continue;
        spriteSVGShapes.push({ el, hex: info.stops[0].hex, isGradientRef: true });
        counts.set(info.stops[0].hex, (counts.get(info.stops[0].hex) || 0) + 1);
        spriteSVGGradientOf.set(el, info);
        continue;
      }

      const hex = _parseCssColorToHex(fill);
      if (hex == null) continue;
      spriteSVGShapes.push({ el, hex });
      counts.set(hex, (counts.get(hex) || 0) + 1);
    }
  }

  spriteColors = [...counts.entries()]
    .map(([hex, count]) => ({ r: (hex >> 16) & 0xFF, g: (hex >> 8) & 0xFF, b: hex & 0xFF, count }))
    .sort((a, b) => b.count - a.count);
}

function loadSpriteSVGFile(file) {
  file.text().then((text) => _loadSpriteSVGFromText(text))
    .catch(() => showToast('Could not read the SVG', 'error'));
}

function _loadSpriteSVGFromText(text) {
  _endZipManualEditSession();
  _zipManualEditFullPath = null;
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Invalid SVG file');
  const srcRoot = doc.documentElement;

    const svgEl = document.getElementById('sprite-svg');
    const canvas = document.getElementById('sprite-canvas');
    const emptyEl = document.getElementById('sprite-empty');
    const previewEl = document.getElementById('sprite-preview');
    if (!svgEl) return;

    _applySVGFrameToDOM(srcRoot);

    canvas.style.display = 'none';
    svgEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (previewEl) previewEl.classList.remove('is-empty');

    spriteIsSVG = true;

    _collectSpriteSVGShapes();

    const recolorBtn = document.getElementById('btn-sprite-recolor-upload');
    const clearBtn = document.getElementById('btn-sprite-clear');
    const dlSvgBtn = document.getElementById('btn-sprite-download-svg');
    const copyPngBtn = document.getElementById('btn-sprite-copy-png');
    if (recolorBtn) recolorBtn.disabled = spriteSVGShapes.length === 0;
    if (clearBtn) clearBtn.disabled = false;
    if (dlSvgBtn) { dlSvgBtn.style.display = ''; dlSvgBtn.disabled = spriteSVGShapes.length === 0; }
    if (copyPngBtn) copyPngBtn.disabled = false;
    _setSpriteMarkSkinButtonsEnabled(true);

    const statusEl = document.getElementById('sprite-status');

    buildSpriteSVGLabels();
    renderSpriteSVGFromLabels();

    const exactNote = spriteSVGExactCount
      ? ` — ${spriteSVGExactCount}/${spriteSVGShapes.length} mapped by exact id`
      : '';
    if (statusEl) statusEl.textContent = `${spriteColors.length} exact colours detected in the SVG (${spriteSVGShapes.length} shapes)${exactNote}`;

    _resetSpriteZoom();
    _setSpriteZoomControlsEnabled(true);
    _setSpriteAnimControlsVisible(false);
    showToast('SVG cargado', 'info');
}

function loadSpriteSVGFrames(files) {
  _stopSpriteAnimation();
  _endZipManualEditSession();
  _zipManualEditFullPath = null;

  Promise.all(files.map((f) => f.text().then((text) => ({ name: f.name, text }))))
    .then((loaded) => {
      const parsed = loaded.map(({ name, text }) => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        if (doc.getElementsByTagName('parsererror').length) throw new Error(`Invalid SVG: ${name}`);
        return { name, srcRoot: doc.documentElement };
      });

      const rects = parsed.map((p) => _svgFrameViewBoxRect(p.srcRoot));
      const maxW = Math.max(...rects.map((r) => r.w));
      const maxH = Math.max(...rects.map((r) => r.h));
      parsed.forEach((p, i) => {
        const r = rects[i];
        const nx = r.x - (maxW - r.w) / 2;
        const ny = r.y - (maxH - r.h) / 2;
        p.normViewBox = `${nx} ${ny} ${maxW} ${maxH}`;
      });

      spriteIsSVG = true;
      spriteFrames = parsed;
      spriteFrameIndex = 0;

      const svgEl = document.getElementById('sprite-svg');
      const canvas = document.getElementById('sprite-canvas');
      const emptyEl = document.getElementById('sprite-empty');
      const previewEl = document.getElementById('sprite-preview');
      if (canvas) canvas.style.display = 'none';
      if (svgEl) svgEl.style.display = 'block';
      if (emptyEl) emptyEl.style.display = 'none';
      if (previewEl) previewEl.classList.remove('is-empty');

      _applySVGFrameToDOM(parsed[0].srcRoot, parsed[0].normViewBox);
      _collectSpriteSVGShapes();
      buildSpriteSVGLabels();

      const recolorBtn = document.getElementById('btn-sprite-recolor-upload');
      const clearBtn = document.getElementById('btn-sprite-clear');
      const dlSvgBtn = document.getElementById('btn-sprite-download-svg');
      const copyPngBtn = document.getElementById('btn-sprite-copy-png');
      if (recolorBtn) recolorBtn.disabled = spriteSVGShapes.length === 0;
      if (clearBtn) clearBtn.disabled = false;
      if (dlSvgBtn) { dlSvgBtn.style.display = ''; dlSvgBtn.disabled = spriteSVGShapes.length === 0; }
      if (copyPngBtn) copyPngBtn.disabled = false;
      _setSpriteMarkSkinButtonsEnabled(true);

      renderSpriteSVGFromLabels();

      _resetSpriteZoom();
      _setSpriteZoomControlsEnabled(true);
      _setSpriteAnimControlsVisible(true);

      const statusEl = document.getElementById('sprite-status');
      const exactNote = spriteSVGExactCount
        ? ` — ${spriteSVGExactCount}/${spriteSVGShapes.length} mapped by exact id`
        : '';
      if (statusEl) statusEl.textContent = `${parsed.length} frames — ${spriteColors.length} exact colours detected in the current frame (${spriteSVGShapes.length} shapes)${exactNote}`;

      const frameEl = document.getElementById('sprite-anim-frame');
      if (frameEl) frameEl.textContent = `1/${parsed.length}`;

      showToast(`SVG animation loaded — ${parsed.length} frames`, 'info');
      _startSpriteAnimation();
    }).catch((err) => showToast((err && err.message) || 'Could not read the SVGs', 'error'));
}

function _parseGradNum(str, fallback) {
  if (str == null) return fallback;
  const s = String(str).trim();
  if (s === '') return fallback;
  if (s.endsWith('%')) return parseFloat(s) / 100;
  const n = parseFloat(s);
  return Number.isNaN(n) ? fallback : n;
}

function _gradientT(info, x, y) {
  if (info.type === 'radial') {
    const dx = x - info.geom.cx, dy = y - info.geom.cy;
    return info.geom.r > 0 ? Math.hypot(dx, dy) / info.geom.r : 0;
  }
  const { x1, y1, x2, y2 } = info.geom;
  const dxg = x2 - x1, dyg = y2 - y1;
  const len2 = dxg * dxg + dyg * dyg;
  if (len2 === 0) return 0;
  return ((x - x1) * dxg + (y - y1) * dyg) / len2;
}

function _resolveGradientClickLabel(shapeEl, clientX, clientY) {
  const info = spriteSVGGradientOf && spriteSVGGradientOf.get(shapeEl);
  if (!info || info.stops.length < 2) return null;

  let t;

  if (info.units === 'userSpaceOnUse') {
    let local;
    try {
      const ctm = shapeEl.getScreenCTM();
      if (!ctm) return null;
      const svgRoot = document.getElementById('sprite-svg');
      const pt = svgRoot.createSVGPoint();
      pt.x = clientX; pt.y = clientY;
      local = pt.matrixTransform(ctm.inverse());
    } catch (e) { return null; }
    t = _gradientT(info, local.x, local.y);
  } else {
    let rect;
    try { rect = shapeEl.getBoundingClientRect(); } catch (e) { return null; }
    if (!rect || !rect.width || !rect.height) return null;
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    t = _gradientT(info, nx, ny);
  }

  let best = info.stops[0], bestDist = Infinity;
  for (const s of info.stops) {
    const d = Math.abs(s.offset - t);
    if (d < bestDist) { bestDist = d; best = s; }
  }
  const lbl = spriteSVGLabelOf.get(best.el);
  return (lbl != null && lbl >= 0) ? lbl : null;
}

const _NAMED_CSS_COLORS = {
  white: 0xffffff, black: 0x000000, red: 0xff0000, green: 0x008000,
  blue: 0x0000ff, yellow: 0xffff00, gray: 0x808080, grey: 0x808080,
  silver: 0xc0c0c0, transparent: null,
};

function _parseCssColorToHex(str) {
  const s = str.trim().toLowerCase();
  let m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) {
    const [r, g, b] = m[1].split('').map((c) => parseInt(c + c, 16));
    return (r << 16) | (g << 8) | b;
  }
  m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) return parseInt(m[1], 16);
  m = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(s);
  if (m) return (parseInt(m[1], 10) << 16) | (parseInt(m[2], 10) << 8) | parseInt(m[3], 10);
  m = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i.exec(s);
  if (m) {
    if (parseFloat(m[4]) <= 0) return null;
    return (parseInt(m[1], 10) << 16) | (parseInt(m[2], 10) << 8) | parseInt(m[3], 10);
  }
  if (Object.prototype.hasOwnProperty.call(_NAMED_CSS_COLORS, s)) return _NAMED_CSS_COLORS[s];
  return null;
}

function buildSpriteSVGLabels() {
  if (activeSpriteType === 'color') _buildSpriteSVGLabelsColor();
  else _buildSpriteSVGLabelsExtended();
}

const SVG_STRICT_MAX_DIST2 = 4 * 4;
const SVG_STRICT_MIN_MARGIN_RATIO = 1.6;

function _buildSpriteSVGLabelsColor() {
  if (!spriteSVGShapes.length) { spriteSVGLabelOf = null; spriteSVGExactCount = 0; spriteSVGExactMatchSet = new Set(); return; }
  const seedRgb = _getBifrostSeedRgb();
  spriteSVGLabelOf = new Map();
  spriteSVGExactCount = 0;
  spriteSVGExactMatchSet = new Set();
  for (const shape of spriteSVGShapes) {
    const exactIdx = _resolveExactSwapLabel(shape.el);
    if (exactIdx !== -1) {
      spriteSVGLabelOf.set(shape.el, exactIdx);
      spriteSVGExactMatchSet.add(shape.el);
      spriteSVGExactCount++;
      continue;
    }

    const r = (shape.hex >> 16) & 0xFF, g = (shape.hex >> 8) & 0xFF, b = shape.hex & 0xFF;
    if (r <= 20 && g <= 20 && b <= 20) { spriteSVGLabelOf.set(shape.el, -1); continue; }

    let best = -1, bestDist = Infinity, secondDist = Infinity;
    for (let s = 0; s < seedRgb.length; s++) {
      const [sr, sg, sb] = seedRgb[s];
      const dr = r - sr, dg = g - sg, db = b - sb;
      const d = dr * dr + dg * dg + db * db;
      if (d < bestDist) { secondDist = bestDist; bestDist = d; best = s; }
      else if (d < secondDist) { secondDist = d; }
    }
    const closeEnough = bestDist <= SVG_STRICT_MAX_DIST2;
    const clearlyBest = secondDist >= bestDist * SVG_STRICT_MIN_MARGIN_RATIO;
    spriteSVGLabelOf.set(shape.el, (closeEnough && clearlyBest) ? best : -1);
  }
  spriteSVGSkinSet = new Set();
}

function _buildSpriteSVGLabelsExtended() {
  if (!spriteSVGShapes.length) { spriteSVGLabelOf = null; spriteSVGExactCount = 0; spriteSVGExactMatchSet = new Set(); return; }
  const seedRgb = _getBifrostSeedRgb();
  spriteSVGLabelOf = new Map();
  spriteSVGExactCount = 0;
  spriteSVGExactMatchSet = new Set();
  for (const shape of spriteSVGShapes) {
    const exactIdx = _resolveExactSwapLabel(shape.el);
    if (exactIdx !== -1) {
      spriteSVGLabelOf.set(shape.el, exactIdx);
      spriteSVGExactMatchSet.add(shape.el);
      spriteSVGExactCount++;
      continue;
    }

    const r = (shape.hex >> 16) & 0xFF, g = (shape.hex >> 8) & 0xFF, b = shape.hex & 0xFF;
    if (r <= 20 && g <= 20 && b <= 20) {
      spriteSVGLabelOf.set(shape.el, -1);
      continue;
    }

    let best = -1, bestDist = Infinity;
    for (let s = 0; s < seedRgb.length; s++) {
      const [sr, sg, sb] = seedRgb[s];
      const dr = r - sr, dg = g - sg, db = b - sb;
      const d = dr * dr + dg * dg + db * db;
      if (d < bestDist) { bestDist = d; best = s; }
    }
    spriteSVGLabelOf.set(shape.el, best);
  }
  spriteSVGSkinSet = new Set();
}

function renderSpriteSVGFromLabels() {
  if (!spriteIsSVG || !spriteSVGLabelOf) return;
  const targets = ALL_COLOR_PROPS.map((p) => scheme[p]);
  const zipOverrides = _zipManualEditFullPath ? _spriteZipManualOverrides[_zipManualEditFullPath] : null;
  for (const shape of spriteSVGShapes) {
    if (shape.isGradientRef) continue;
    let hexInt;
    if (spriteSVGSkinSet && spriteSVGSkinSet.has(shape.el)) {
      hexInt = shape.hex;
    } else {
      const lbl = spriteSVGLabelOf.get(shape.el);
      if (lbl == null || lbl < 0) continue;
      hexInt = targets[lbl];
    }
    const autoHexStr = '#' + hexInt.toString(16).padStart(6, '0');
    const hexStr = (zipOverrides && zipOverrides[autoHexStr]) ? zipOverrides[autoHexStr] : autoHexStr;
    if (shape.isStop) {
      const style = shape.el.getAttribute('style');
      if (style && /stop-color\s*:/i.test(style)) {
        shape.el.setAttribute('style', style.replace(/stop-color:\s*[^;]+/i, `stop-color:${hexStr}`));
      } else {
        shape.el.setAttribute('stop-color', hexStr);
      }
    } else if (shape.el.style && shape.el.style.fill) {
      shape.el.style.fill = hexStr;
    } else {
      shape.el.setAttribute('fill', hexStr);
    }
  }
}

function downloadSpriteSVG() {
  const svgEl = document.getElementById('sprite-svg');
  if (!svgEl || !spriteIsSVG) return;
  const filename = promptFilename('sprite-recolored', 'svg');
  if (!filename) return;
  const clone = svgEl.cloneNode(true);
  clone.removeAttribute('id');
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const text = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([text], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function _rasterizeSVGToPNGBlob(svgEl, size = 1024) {
  return new Promise((resolve, reject) => {
    const clone = svgEl.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const vbAttr = svgEl.getAttribute('viewBox');
    const vb = vbAttr ? vbAttr.trim().split(/[\s,]+/).map(Number) : null;
    let w = size, h = size;
    if (vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
      if (vb[2] >= vb[3]) { w = size; h = Math.max(1, Math.round(size * vb[3] / vb[2])); }
      else { h = size; w = Math.max(1, Math.round(size * vb[2] / vb[3])); }
    }
    clone.setAttribute('width', w);
    clone.setAttribute('height', h);
    const svgText = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG rasterise failed')); };
    img.src = url;
  });
}

async function copySpriteAsPNG() {
  const canvas = document.getElementById('sprite-canvas');
  const svgEl = document.getElementById('sprite-svg');
  try {
    let blob;
    if (spriteIsSVG && svgEl) {
      blob = await _rasterizeSVGToPNGBlob(svgEl);
    } else if (canvas) {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    }
    if (!blob) throw new Error('Nothing to copy');

    if (window.ClipboardItem && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('Sprite copied as PNG', 'info');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sprite.png';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Clipboard not supported — PNG downloaded instead', 'info');
  } catch (e) {
    showToast('Could not copy the sprite', 'error');
  }
}

function _collectSVGColoursInOrder(rootEl) {
  const SHAPE_TAGS = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline'];
  const out = [];

  const gradFirstHex = new Map();
  for (const grad of rootEl.querySelectorAll('linearGradient, radialGradient')) {
    const gradId = grad.getAttribute('id');
    let first = true;
    for (const stop of grad.getElementsByTagName('stop')) {
      let fill = null;
      const style = stop.getAttribute('style');
      if (style) {
        const m = style.match(/stop-color:\s*([^;]+)/i);
        if (m) fill = m[1].trim();
      }
      if (fill == null) fill = stop.getAttribute('stop-color');
      if (fill == null) continue;
      fill = fill.trim();
      if (fill === 'none') continue;
      const hex = _parseCssColorToHex(fill);
      if (hex == null) continue;
      out.push(hex);
      if (first && gradId) { gradFirstHex.set(gradId, hex); first = false; }
    }
  }

  for (const tag of SHAPE_TAGS) {
    for (const el of rootEl.getElementsByTagName(tag)) {
      let fill = el.style?.fill || el.getAttribute('fill');
      if (fill == null) fill = '#000000';
      fill = fill.trim();
      if (fill === 'none') continue;

      if (fill.startsWith('url(')) {
        const idMatch = /url\(\s*["']?#([^"')]+)["']?\s*\)/i.exec(fill);
        const gradId = idMatch ? idMatch[1] : null;
        const hex = gradId ? gradFirstHex.get(gradId) : undefined;
        if (hex == null) continue;
        out.push(hex);
        continue;
      }

      const hex = _parseCssColorToHex(fill);
      if (hex == null) continue;
      out.push(hex);
    }
  }
  return out;
}

function loadRecoloredSpriteSVGFile(file) {
  if (!spriteIsSVG || !spriteSVGShapes.length || !spriteSVGLabelOf) {
    showToast('Upload the original SVG sprite first', 'error');
    return;
  }
  file.text().then((text) => {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('Invalid SVG file');
    const newColours = _collectSVGColoursInOrder(doc.documentElement);
    if (newColours.length !== spriteSVGShapes.length) {
      showToast(`The recoloured SVG doesn't match the structure (${newColours.length} colours vs ${spriteSVGShapes.length} expected)`, 'error');
      return;
    }

    const sums = ALL_COLOR_PROPS.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
    spriteSVGShapes.forEach((shape, i) => {
      const lbl = spriteSVGLabelOf.get(shape.el);
      if (lbl == null || lbl < 0) return;
      const hex = newColours[i];
      const s = sums[lbl];
      s.r += (hex >> 16) & 0xFF; s.g += (hex >> 8) & 0xFF; s.b += hex & 0xFF; s.count++;
    });

    const locked = grid.getLockedColumns();
    let applied = 0;
    ALL_COLOR_PROPS.forEach((prop, idx) => {
      if (locked.has(getColumnFromProp(prop))) return;
      const s = sums[idx];
      if (!s.count) return;
      const r = Math.round(s.r / s.count), g = Math.round(s.g / s.count), b = Math.round(s.b / s.count);
      scheme[prop] = (r << 16) | (g << 8) | b;
      applied++;
    });

    clearSchemeSelections();
    refreshAll({ recordHistory: true });

    const statusEl = document.getElementById('sprite-status');
    if (statusEl) statusEl.textContent = `Scheme extracted from the recoloured SVG: ${applied} colours applied.`;
    showToast(`Palette extracted from the recoloured SVG (${applied} colours)`, 'info');
  }).catch(() => showToast('Could not read the SVG', 'error'));
}

function loadRecoloredSpriteFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Select a valid image file', 'error');
    return;
  }
  if (!spriteLabelArray || !spriteBaseImageData) {
    showToast('Upload and match the original sprite first', 'error');
    return;
  }
  const W = spriteBaseImageData.width, H = spriteBaseImageData.height;
  _readImageFile(file).then((img) => {
    const tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = H;
    const tctx = tmp.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    if (img.naturalWidth !== W || img.naturalHeight !== H) {
      tctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, W, H);
    } else {
      tctx.drawImage(img, 0, 0);
    }
    const imageData = tctx.getImageData(0, 0, W, H);
    const applied = _applyLabelColorsToScheme(imageData, spriteLabelArray, spriteFillLabelArray);

    clearSchemeSelections();
    refreshAll({ recordHistory: true });

    const statusEl = document.getElementById('sprite-status');
    const resized = (img.naturalWidth !== W || img.naturalHeight !== H);
    const resizeNote = resized ? ` (resized from ${img.naturalWidth}x${img.naturalHeight} to ${W}x${H})` : '';
    if (statusEl) statusEl.textContent = `Scheme extracted from the recoloured sprite: ${applied} colours applied.${resizeNote}`;
    showToast(`Palette extracted from the recoloured sprite (${applied} colours)${resizeNote}`, 'info');
  }).catch(() => showToast('Could not read the image', 'error'));
}

function _recolorSVGTextWithCurrentScheme(text, manualOverrides) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  if (doc.getElementsByTagName('parsererror').length) return null;
  const root = doc.documentElement;

  const SHAPE_TAGS = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline'];
  const shapes = [];
  const gradientRepHex = new Map();
  for (const grad of root.querySelectorAll('linearGradient, radialGradient')) {
    const gradId = grad.getAttribute('id');
    for (const stop of grad.getElementsByTagName('stop')) {
      let fill = null;
      const style = stop.getAttribute('style');
      if (style) {
        const m = style.match(/stop-color:\s*([^;]+)/i);
        if (m) fill = m[1].trim();
      }
      if (fill == null) fill = stop.getAttribute('stop-color');
      if (fill == null) continue;
      fill = fill.trim();
      if (fill === 'none') continue;
      const hex = _parseCssColorToHex(fill);
      if (hex == null) continue;
      shapes.push({ el: stop, hex, isStop: true });
      if (gradId && !gradientRepHex.has(gradId)) gradientRepHex.set(gradId, hex);
    }
  }
  for (const tag of SHAPE_TAGS) {
    for (const el of root.getElementsByTagName(tag)) {
      let fill = el.style?.fill || el.getAttribute('fill');
      let node = el.parentElement;
      while (fill == null && node && node !== root.parentElement) {
        fill = node.style?.fill || node.getAttribute('fill');
        node = node.parentElement;
      }
      if (fill == null) fill = '#000000';
      fill = fill.trim();
      if (fill === 'none') continue;
      if (fill.startsWith('url(')) continue;
      const hex = _parseCssColorToHex(fill);
      if (hex == null) continue;
      shapes.push({ el, hex });
    }
  }
  if (!shapes.length) return new XMLSerializer().serializeToString(root);

  const seedRgb = _getBifrostSeedRgb();
  const targets = ALL_COLOR_PROPS.map((p) => scheme[p]);

  for (const shape of shapes) {
    let lbl = _resolveExactSwapLabel(shape.el);
    if (lbl === -1) {
      const r = (shape.hex >> 16) & 0xFF, g = (shape.hex >> 8) & 0xFF, b = shape.hex & 0xFF;
      if (r <= 20 && g <= 20 && b <= 20) {
        lbl = -1;
      } else {
        let best = -1, bestDist = Infinity;
        for (let s = 0; s < seedRgb.length; s++) {
          const [sr, sg, sb] = seedRgb[s];
          const dr = r - sr, dg = g - sg, db = b - sb;
          const d = dr * dr + dg * dg + db * db;
          if (d < bestDist) { bestDist = d; best = s; }
        }
        lbl = best;
      }
    }
    if (lbl < 0) continue;
    const hexInt = targets[lbl];
    const autoHexStr = '#' + hexInt.toString(16).padStart(6, '0');
    const hexStr = (manualOverrides && manualOverrides[autoHexStr]) ? manualOverrides[autoHexStr] : autoHexStr;
    if (shape.isStop) {
      const style = shape.el.getAttribute('style');
      if (style && /stop-color\s*:/i.test(style)) {
        shape.el.setAttribute('style', style.replace(/stop-color:\s*[^;]+/i, `stop-color:${hexStr}`));
      } else {
        shape.el.setAttribute('stop-color', hexStr);
      }
    } else if (shape.el.style && shape.el.style.fill) {
      shape.el.style.fill = hexStr;
    } else {
      shape.el.setAttribute('fill', hexStr);
    }
  }
  return new XMLSerializer().serializeToString(root);
}

let _spriteZipManualOverrides = {};
let _zipPreviewManualMode = false;
let _zipPreviewItemsByPath = {};
let _zipManualEditFullPath = null;
let _zipManualEditSnapshot = null;

async function previewAndArmSVGZip(file) {
  if (typeof JSZip === 'undefined') {
    showToast('JSZip could not be loaded (check your internet connection)', 'error');
    return;
  }
  _endZipManualEditSession();
  const myRequestId = ++_zipPreviewRequestId;
  try {
    showToast('Reading ZIP…', 'info');
    const inZip = await JSZip.loadAsync(file);
    const allEntries = Object.values(inZip.files).filter((f) => !f.dir);
    const svgEntries = allEntries
      .filter((f) => /\.svg$/i.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    if (!svgEntries.length) {
      showToast('The ZIP does not contain valid SVGs', 'error');
      return;
    }

    const outZip = new JSZip();
    for (const entry of allEntries) {
      if (!/\.svg$/i.test(entry.name)) {
        const bytes = await entry.async('uint8array');
        outZip.file(entry.name, bytes);
      }
    }

    const items = [];    let failCount = 0;
    for (const entry of svgEntries) {
      const text = await entry.async('text');
      const baseName = entry.name.split('/').pop();
      const auto = _recolorSVGTextWithCurrentScheme(text);
      if (auto == null) {
        failCount++;
        items.push({ name: baseName, fullPath: entry.name, svg: null, original: null, auto: null });
        outZip.file(entry.name, text);
        continue;
      }
      const overridesForThis = _spriteZipManualOverrides[entry.name];
      const recoloured = overridesForThis ? _recolorSVGTextWithCurrentScheme(text, overridesForThis) : auto;
      const changed = recoloured !== text;
      if (!(entry.name in _swfShapeSelected)) _swfShapeSelected[entry.name] = true;
      items.push({ name: baseName, fullPath: entry.name, svg: recoloured, original: text, auto, changed });
      outZip.file(entry.name, recoloured);
    }

    if (myRequestId !== _zipPreviewRequestId) return;
    _zipPreviewIsSWF = false;
    openSpriteZipPreviewModal(items, failCount, file.name || 'sprites');

    const svgCount = items.length - failCount;
    if (svgCount) {
      const blob = await outZip.generateAsync({ type: 'blob' });
      _pendingBatchZipBlob = blob;
      _pendingBatchZipSourceName = file.name || 'sprites';
      const dlBtn = document.getElementById('btn-sprite-batch-zip-download');
      if (dlBtn) dlBtn.style.display = '';
      const statusEl = document.getElementById('sprite-status');
      const failNote = failCount ? `, ${failCount} skipped (not a valid SVG)` : '';
      if (statusEl) statusEl.textContent = `${svgCount} sprites recoloured${failNote}. Ready to download.`;
    }
  } catch (e) {
    console.error(e);
    showToast('Could not process the ZIP', 'error');
  }
}

function openSpriteZipPreviewModal(items, failCount, sourceName) {
  const title = document.getElementById('sprite-zip-preview-modal-title');
  if (title) {
    const failNote = failCount ? `, ${failCount} invalid` : '';
    const noun = _zipPreviewIsSWF ? 'shapes' : 'sprites';
    title.textContent = `${sourceName} — ${items.length} ${noun}${failNote}`;
  }

  _zipPreviewItemsByPath = {};
  for (const it of items) {
    if (it.fullPath) _zipPreviewItemsByPath[it.fullPath] = it;
  }

  _zipPreviewSearchQuery = '';
  const searchInput = document.getElementById('zip-preview-search');
  if (searchInput) searchInput.value = '';

  const manualModeBtn = document.getElementById('btn-sprite-zip-manual-mode');
  if (manualModeBtn) manualModeBtn.style.display = '';
  const selectToolbar = document.getElementById('zip-preview-select-toolbar');
  if (selectToolbar) selectToolbar.style.display = 'inline-flex';

  const grid = document.getElementById('sprite-zip-preview-grid');
  if (grid) {
    grid.classList.toggle('manual-mode', _zipPreviewManualMode);
    grid.classList.toggle('swf-mode', _zipPreviewIsSWF);
    grid.innerHTML = '';
    _zipPreviewCheckboxOrder = [];
    _zipPreviewLastCbIndex = null;
    for (const item of items) {
      const cell = document.createElement('div');
      cell.className = 'zip-preview-item';
      if (item.fullPath) cell.dataset.fullPath = item.fullPath;

      const thumb = document.createElement('div');
      thumb.className = 'zip-preview-thumb';
      if (item.svg) {
        thumb.innerHTML = item.svg;
        const svgEl = thumb.querySelector('svg');
        if (svgEl && !svgEl.getAttribute('viewBox')) {
          const parseLen = (s) => parseFloat(String(s || '').trim()) || 100;
          const vbW = parseLen(svgEl.getAttribute('width'));
          const vbH = parseLen(svgEl.getAttribute('height'));
          svgEl.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
        }
        cell.classList.add('zip-preview-clickable');
        cell.title = _zipPreviewManualMode ? 'Click to hand-edit a colour on this sprite' : 'Click to edit this sprite';
        let cellCb = null;
        cell.addEventListener('mousedown', (e) => {
          if (e.shiftKey) e.preventDefault();
        });
        cell.addEventListener('click', (e) => {
          if (e.shiftKey && cellCb) {
            e.preventDefault();
            cellCb.checked = !cellCb.checked;
            _zipPreviewApplyRangeSelect(cellCb, true);
            return;
          }
          try {
            _loadSpriteSVGFromText(item.original != null ? item.original : item.svg);
          } catch (e) {
            showToast('Could not load that SVG into the editor', 'error');
            return;
          }
          if (_zipPreviewManualMode && item.fullPath) {
            _zipManualEditFullPath = item.fullPath;
            _zipManualEditSnapshot = { ...scheme };
            renderSpriteSVGFromLabels();
          }
          closeSpriteZipPreviewModal();
          const section = document.getElementById('section-sprite');
          if (section) {
            section.classList.remove('is-collapsed');
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          if (_zipPreviewManualMode) {
            showToast('Manual mode: colour changes you make here apply only to this sprite', 'info');
          }
        });
        if (item.fullPath && _spriteZipManualOverrides[item.fullPath] && Object.keys(_spriteZipManualOverrides[item.fullPath]).length) {
          const badge = document.createElement('span');
          badge.className = 'zip-preview-override-badge';
          badge.title = 'Manually edited colour';
          thumb.appendChild(badge);
        }
        if (item.fullPath) {
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'zip-preview-select-cb';
          cb.checked = _swfShapeSelected[item.fullPath] !== false;
          cb.title = _zipPreviewIsSWF
            ? 'Include this shape in the SWF shapes export (shift-click anywhere on the sprite to select a range)'
            : 'Include this sprite in the downloaded ZIP (shift-click anywhere on the sprite to select a range)';
          cb.dataset.fullPath = item.fullPath;
          cellCb = cb;
          cb.addEventListener('mousedown', (e) => {
            if (e.shiftKey) e.preventDefault();
          });
          cb.addEventListener('click', (e) => {
            e.stopPropagation();
            _zipPreviewApplyRangeSelect(cb, e.shiftKey);
          });
          _zipPreviewCheckboxOrder.push(cb);
          thumb.appendChild(cb);
          if (!item.changed) {
            cell.classList.add('zip-preview-unchanged');
            const note = document.createElement('span');
            note.className = 'zip-preview-unchanged-note';
            note.textContent = 'No colour change';
            thumb.appendChild(note);
          }
        }
      } else {
        thumb.classList.add('zip-preview-error');
        thumb.textContent = 'Invalid SVG';
      }
      cell.appendChild(thumb);

      const name = document.createElement('span');
      name.className = 'zip-preview-name';
      name.textContent = item.name;
      name.title = item.name;
      cell.appendChild(name);

      grid.appendChild(cell);
    }
  }
  document.getElementById('sprite-zip-preview-modal')?.classList.add('open');
}

function closeSpriteZipPreviewModal() {
  document.getElementById('sprite-zip-preview-modal')?.classList.remove('open');
}

let _preRendersItemsByKey = {};

async function openPreRendersGallery() {
  if (!isDesktopApp()) { showToast('PreRenders only works in the desktop app', 'error'); return; }
  let items = [];
  try {
    items = await window.pywebview.api.list_prerenders(activeSpriteType);
  } catch (e) {
    showToast(`Could not load PreRenders: ${e.message || e}`, 'error');
    return;
  }
  renderPreRendersModal(items);
}

function renderPreRendersModal(items) {
  const title = document.getElementById('prerenders-modal-title');
  if (title) {
    const label = SPRITE_TYPE_LABELS[activeSpriteType] || activeSpriteType;
    title.textContent = `PreRenders — ${label} (${items.length})`;
  }

  _preRendersItemsByKey = {};
  const grid = document.getElementById('prerenders-grid');
  if (grid) {
    grid.innerHTML = '';
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'zip-preview-empty-note';
      empty.textContent = 'No sprites saved here yet for this sprite type — use "+ Add" to save one.';
      grid.appendChild(empty);
    }
    for (const item of items) {
      _preRendersItemsByKey[`${item.spriteType}/${item.filename}`] = item;

      const cell = document.createElement('div');
      cell.className = 'zip-preview-item zip-preview-clickable';
      cell.title = 'Click to load this sprite into the editor';
      cell.addEventListener('click', () => loadPreRenderIntoEditor(item));

      const thumb = document.createElement('div');
      thumb.className = 'zip-preview-thumb';
      const img = document.createElement('img');
      img.src = item.dataUrl;
      img.alt = item.filename;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.objectFit = 'contain';
      thumb.appendChild(img);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'prerenders-delete-btn';
      delBtn.title = 'Delete this PreRender';
      delBtn.textContent = '\u00d7';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deletePreRender(item);
      });
      thumb.appendChild(delBtn);
      cell.appendChild(thumb);

      const name = document.createElement('span');
      name.className = 'zip-preview-name';
      name.textContent = item.filename;
      name.title = item.filename;
      cell.appendChild(name);

      grid.appendChild(cell);
    }
  }
  document.getElementById('prerenders-modal')?.classList.add('open');
}

function closePreRendersModal() {
  document.getElementById('prerenders-modal')?.classList.remove('open');
}

async function loadPreRenderIntoEditor(item) {
  try {
    const res = await fetch(item.dataUrl);
    const blob = await res.blob();
    loadSpriteFile(new File([blob], item.filename, { type: blob.type }));
  } catch (e) {
    showToast('Could not load that PreRender into the editor', 'error');
    return;
  }
  closePreRendersModal();
  const section = document.getElementById('section-sprite');
  if (section) {
    section.classList.remove('is-collapsed');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function addFilesToPreRenders(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (!files.length) return;
  let saved = 0;
  for (const file of files) {
    try {
      const dataUrl = await _fileToDataURL(file);
      await window.pywebview.api.save_prerender(dataUrl, file.name, activeSpriteType);
      saved++;
    } catch (e) {
      showToast(`Could not save "${file.name}": ${e.message || e}`, 'error');
    }
  }
  if (saved) showToast(`Saved ${saved} sprite${saved === 1 ? '' : 's'} to PreRenders`, 'info');
  openPreRendersGallery();
}

async function deletePreRender(item) {
  try {
    await window.pywebview.api.delete_prerender(item.spriteType, item.filename);
  } catch (e) {
    showToast(`Could not delete "${item.filename}": ${e.message || e}`, 'error');
    return;
  }
  openPreRendersGallery();
}

function _fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function clearSpriteZipPreview() {
  _endZipManualEditSession();
  _zipPreviewRequestId++;
  _zipPreviewItemsByPath = {};
  _zipPreviewIsSWF = false;
  _swfShapeSelected = {};
  _swfSelectionSignature = null;
  _shapePickerRemembered = {};
  _zipPreviewCheckboxOrder = [];
  _zipPreviewLastCbIndex = null;
  _lastSWFPreviewFiles = null;
  _lastSpriteZipFile = null;

  const grid = document.getElementById('sprite-zip-preview-grid');
  if (grid) grid.innerHTML = '';
  const title = document.getElementById('sprite-zip-preview-modal-title');
  if (title) title.textContent = 'ZIP Preview';
  const selectToolbar = document.getElementById('zip-preview-select-toolbar');
  if (selectToolbar) selectToolbar.style.display = 'none';
  const dlBtn = document.getElementById('btn-swf-shapes-batch-download');
  if (dlBtn) dlBtn.style.display = 'none';

  showToast('Preview cleared — pick a new file to preview', 'info');
}

function _endZipManualEditSession() {
  const fullPath = _zipManualEditFullPath;
  const snapshot = _zipManualEditSnapshot;
  _zipManualEditSnapshot = null;
  if (!fullPath || !snapshot) return;

  let changed = false;
  const overrides = _spriteZipManualOverrides[fullPath] || {};
  for (const prop of COLOR_PROPS) {
    if (scheme[prop] === snapshot[prop]) continue;
    const autoHex = '#' + snapshot[prop].toString(16).padStart(6, '0');
    const newHex = '#' + scheme[prop].toString(16).padStart(6, '0');
    overrides[autoHex] = newHex;
    scheme[prop] = snapshot[prop];
    changed = true;
  }

  if (changed) {
    _spriteZipManualOverrides[fullPath] = overrides;
    refreshAll({ recordHistory: false });
    const item = _zipPreviewItemsByPath[fullPath];
    if (item) _refreshZipPreviewThumb(item);
    showToast('Change saved for that sprite only — palette restored', 'info');
  }
}

function _refreshZipPreviewThumb(item) {
  const grid = document.getElementById('sprite-zip-preview-grid');
  if (!grid || !item.fullPath) return;
  const cell = grid.querySelector(`[data-full-path="${CSS.escape(item.fullPath)}"]`);
  if (!cell) return;

  const overrides = _spriteZipManualOverrides[item.fullPath];
  const svgText = (overrides ? _recolorSVGTextWithCurrentScheme(item.original, overrides) : item.auto) || item.auto;
  item.svg = svgText;

  const thumb = cell.querySelector('.zip-preview-thumb');
  if (thumb) {
    thumb.innerHTML = svgText;
    const svgEl = thumb.querySelector('svg');
    if (svgEl && !svgEl.getAttribute('viewBox')) {
      const parseLen = (s) => parseFloat(String(s || '').trim()) || 100;
      svgEl.setAttribute('viewBox', `0 0 ${parseLen(svgEl.getAttribute('width'))} ${parseLen(svgEl.getAttribute('height'))}`);
    }
    const hasOverride = overrides && Object.keys(overrides).length > 0;
    if (hasOverride) {
      const badge = document.createElement('span');
      badge.className = 'zip-preview-override-badge';
      badge.title = 'Manually edited colour';
      thumb.appendChild(badge);
    }
  }
}

function _pickItemsFromList(title, names, hint, preChecked) {
  return new Promise((resolve) => {
    if (!names || names.length <= 1) { resolve(names ? names.slice() : []); return; }
    const modal = document.getElementById('shape-picker-modal');
    const listEl = document.getElementById('shape-picker-list');
    if (!modal || !listEl) { resolve(names.slice()); return; }

    const titleEl = document.getElementById('shape-picker-modal-title');
    if (titleEl) titleEl.textContent = title;
    const hintEl = document.getElementById('shape-picker-modal-hint');
    if (hintEl) hintEl.textContent = hint || '';
    const searchEl = document.getElementById('shape-picker-search');
    if (searchEl) searchEl.value = '';

    listEl.innerHTML = '';
    let lastClickedRow = null;
    const rows = names.map((name) => {
      const row = document.createElement('label');
      row.className = 'shape-picker-row';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = preChecked ? preChecked.has(name) : true;
      cb.value = name;
      const span = document.createElement('span');
      span.textContent = name;
      row.appendChild(cb);
      row.appendChild(span);
      listEl.appendChild(row);
      const entry = { row, cb, name };

      cb.addEventListener('mousedown', (e) => {
        if (e.shiftKey) e.preventDefault();
      });
      cb.addEventListener('click', (e) => {
        if (e.shiftKey && lastClickedRow && lastClickedRow !== entry) {
          const visible = rows.filter((r) => r.row.style.display !== 'none');
          const thisPos = visible.indexOf(entry);
          const anchorPos = visible.indexOf(lastClickedRow);
          if (thisPos !== -1 && anchorPos !== -1) {
            const start = Math.min(thisPos, anchorPos);
            const end = Math.max(thisPos, anchorPos);
            const checked = cb.checked;
            for (let i = start; i <= end; i++) visible[i].cb.checked = checked;
          }
        }
        lastClickedRow = entry;
      });
      return entry;
    });

    const onSearch = () => {
      const q = searchEl.value.trim().toLowerCase();
      for (const r of rows) r.row.style.display = (!q || r.name.toLowerCase().includes(q)) ? '' : 'none';
    };
    searchEl?.addEventListener('input', onSearch);

    const selectAllBtn = document.getElementById('shape-picker-select-all');
    const selectNoneBtn = document.getElementById('shape-picker-select-none');
    const cancelBtn = document.getElementById('shape-picker-cancel');
    const continueBtn = document.getElementById('shape-picker-continue');
    const backdrop = document.getElementById('shape-picker-modal-backdrop');

    const onSelectAll = () => rows.forEach((r) => { if (r.row.style.display !== 'none') r.cb.checked = true; });
    const onSelectNone = () => rows.forEach((r) => { if (r.row.style.display !== 'none') r.cb.checked = false; });
    const finish = (result) => {
      modal.classList.remove('open');
      searchEl?.removeEventListener('input', onSearch);
      selectAllBtn?.removeEventListener('click', onSelectAll);
      selectNoneBtn?.removeEventListener('click', onSelectNone);
      cancelBtn?.removeEventListener('click', onCancel);
      continueBtn?.removeEventListener('click', onContinue);
      backdrop?.removeEventListener('click', onCancel);
      resolve(result);
    };
    const onCancel = () => finish(null);
    const onContinue = () => {
      const picked = rows.filter((r) => r.cb.checked).map((r) => r.name);
      if (!picked.length) { showToast('Pick at least one file', 'error'); return; }
      finish(picked);
    };

    selectAllBtn?.addEventListener('click', onSelectAll);
    selectNoneBtn?.addEventListener('click', onSelectNone);
    cancelBtn?.addEventListener('click', onCancel);
    continueBtn?.addEventListener('click', onContinue);
    backdrop?.addEventListener('click', onCancel);

    modal.classList.add('open');
    searchEl?.focus();
  });
}

async function _dispatchSpriteZipInput(files) {
  if (!files || !files.length) return;
  const isSingleZip = files.length === 1 && /\.zip$/i.test(files[0].name);

  if (isSingleZip) {
    _lastSpriteZipFile = files[0];
    if (typeof JSZip === 'undefined') {
      showToast('JSZip could not be loaded (check your internet connection)', 'error');
      return;
    }
    try {
      const zip = await JSZip.loadAsync(files[0]);
      const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
      const hasSWF = names.some((n) => /\.swf$/i.test(n));
      const hasSVG = names.some((n) => /\.svg$/i.test(n));
      if (hasSWF) {
        _lastSWFPreviewFiles = files;
        previewSWFFiles(files, true, undefined, true);
      } else if (hasSVG) {
        _lastSWFPreviewFiles = null;
        previewAndArmSVGZip(files[0]);
      } else {
        showToast('The ZIP contains no .svg or .swf files', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Could not read the ZIP', 'error');
    }
    return;
  }

  const allSWF = files.every((f) => /\.swf$/i.test(f.name));
  if (allSWF) {
    _lastSWFPreviewFiles = files;
    previewSWFFiles(files, false, undefined, true);
    return;
  }

  showToast('Pick a .zip of SVG sprites, a .zip of .swf files, or one/more .swf files directly', 'error');
}

async function _dispatchPreviewInput(files) {
  return _dispatchSpriteZipInput(files);
}

async function _buildRecoloredSVGZipBlob(file) {
  const inZip = await JSZip.loadAsync(file);
  const outZip = new JSZip();
  const entries = Object.values(inZip.files).filter((f) => !f.dir);
  let svgCount = 0, failCount = 0;

  let skippedCount = 0;
  for (const entry of entries) {
    const isSvg = /\.svg$/i.test(entry.name);
    if (!isSvg) {
      const bytes = await entry.async('uint8array');
      outZip.file(entry.name, bytes);
      continue;
    }
    const text = await entry.async('text');
    if (_swfShapeSelected[entry.name] === false) {
      outZip.file(entry.name, text);
      skippedCount++;
      continue;
    }
    const recoloured = _recolorSVGTextWithCurrentScheme(text, _spriteZipManualOverrides[entry.name]);
    if (recoloured == null) {
      failCount++;
      outZip.file(entry.name, text);
      continue;
    }
    outZip.file(entry.name, recoloured);
    svgCount++;
  }

  if (!svgCount && !skippedCount) return null;
  const blob = await outZip.generateAsync({ type: 'blob' });
  return { blob, svgCount, failCount, skippedCount };
}

function _collectSVGColorsInto(doc, counts) {
  const root = doc.documentElement;
  const gradientDefs = new Map();
  for (const grad of root.querySelectorAll('linearGradient, radialGradient')) {
    const gradId = grad.getAttribute('id');
    let firstHex = null;
    for (const stop of grad.getElementsByTagName('stop')) {
      let fill = null;
      const style = stop.getAttribute('style');
      if (style) {
        const m = style.match(/stop-color:\s*([^;]+)/i);
        if (m) fill = m[1].trim();
      }
      if (fill == null) fill = stop.getAttribute('stop-color');
      if (fill == null) continue;
      fill = fill.trim();
      if (fill === 'none') continue;
      const hex = _parseCssColorToHex(fill);
      if (hex == null) continue;
      counts.set(hex, (counts.get(hex) || 0) + 1);
      if (firstHex == null) firstHex = hex;
    }
    if (gradId && firstHex != null) gradientDefs.set(gradId, firstHex);
  }

  const SHAPE_TAGS = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline'];
  for (const tag of SHAPE_TAGS) {
    for (const el of root.getElementsByTagName(tag)) {
      let fill = el.getAttribute('fill');
      let node = el.parentElement;
      while (fill == null && node && node !== root.parentElement) {
        fill = node.getAttribute('fill');
        node = node.parentElement;
      }
      if (fill == null) fill = '#000000';
      fill = fill.trim();
      if (fill === 'none') continue;

      if (fill.startsWith('url(')) {
        const idMatch = /url\(\s*["']?#([^"')]+)["']?\s*\)/i.exec(fill);
        const gradId = idMatch ? idMatch[1] : null;
        const hex = gradId ? gradientDefs.get(gradId) : undefined;
        if (hex == null) continue;
        counts.set(hex, (counts.get(hex) || 0) + 1);
        continue;
      }

      const hex = _parseCssColorToHex(fill);
      if (hex == null) continue;
      counts.set(hex, (counts.get(hex) || 0) + 1);
    }
  }
}

function _finishColorAnalysis(counts, okCount, failCount, opts) {
  const { label, failNoteSuffix = 'skipped', emptyMessage = 'No colour was detected', rebuildZip = null } = opts;
  if (!counts.size) {
    showToast(emptyMessage, 'error');
    return;
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const rawDistinctCount = sorted.length;

  const mergeMap = new Map();
  let merged;
  if (rawDistinctCount > 36) {
    merged = _mergeSimilarColors(sorted, COLOR_MERGE_TOLERANCE, mergeMap);
  } else {
    merged = sorted;
    for (const [hex] of sorted) mergeMap.set(hex, hex);
  }
  _lastAnalyzedZip = rebuildZip;
  _lastZipColorMap = mergeMap;

  const quantizeMap = new Map();
  const final = _quantizeColorsToTarget(merged, activeColorProps().length, quantizeMap);
  _lastSpriteColorsAnalysis = final;

  const mapped = _mapColorsToPaletteSwatches(final);

  const failNote = failCount ? ` (${failCount} ${failNoteSuffix})` : '';
  const reduceNote = final.length < merged.length
    ? ` (editable palette summarised to ${final.length} of ${merged.length} real colours)`
    : '';
  const rebuildNote = rebuildZip ? `, recoloured ZIP keeps all ${merged.length}` : '';
  const statusEl = document.getElementById('sprite-status');
  if (statusEl) statusEl.textContent = `${label}: ${merged.length} real colours across ${okCount} sprites${failNote}${reduceNote} — ${mapped} loaded into the palette${rebuildNote}`;

  openSpriteColorsModal(final, okCount, failCount, rawDistinctCount);
  showToast(`${merged.length} real colours across ${okCount} sprites${reduceNote}${rebuildZip ? ' — the recoloured ZIP doesn\'t drop any' : ''}`, 'info');
}

async function analyzeSVGZipColors(file) {
  if (typeof JSZip === 'undefined') {
    showToast('JSZip could not be loaded (check your internet connection)', 'error');
    return;
  }
  try {
    showToast('Reading ZIP…', 'info');
    const inZip = await JSZip.loadAsync(file);
    const allEntries = Object.values(inZip.files).filter((f) => !f.dir);
    let entries = allEntries.filter((f) => /\.svg$/i.test(f.name));

    console.log(`[analyzeSVGZipColors] unique paths in the ZIP: ${allEntries.length} total, ${entries.length} .svg`);
    console.log('[analyzeSVGZipColors] first 20 .svg paths read:', entries.slice(0, 20).map((f) => f.name));
    if (!entries.length) {
      showToast('The ZIP does not contain valid SVGs', 'error');
      return;
    }

    const names = entries.map((f) => f.name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    const picked = await _pickItemsFromList('Which sprites do you want to analyze?', names, `${names.length} .svg file(s) found in ${file.name}`);
    if (!picked) return;
    const pickedSet = new Set(picked);
    entries = entries.filter((f) => pickedSet.has(f.name));

    const counts = new Map();
    let okCount = 0, failCount = 0;
    for (const entry of entries) {
      try {
        const text = await entry.async('text');
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        if (doc.getElementsByTagName('parsererror').length) { failCount++; continue; }
        _collectSVGColorsInto(doc, counts);
        okCount++;
      } catch (e) { failCount++; }
    }

    _finishColorAnalysis(counts, okCount, failCount, {
      label: 'Analyze ZIP',
      failNoteSuffix: 'skipped, not a valid SVG',
      emptyMessage: 'No colour was detected in the ZIP\'s SVGs',
      rebuildZip: inZip,
    });
  } catch (e) {
    console.error(e);
    showToast('Could not process the ZIP', 'error');
  }
}

async function analyzeSWFShapes(files, isZip, allowedNames) {
  if (isZip && typeof JSZip === 'undefined') {
    showToast('JSZip could not be loaded (check your internet connection)', 'error');
    return;
  }
  try {
    let entries;
    if (isZip) {
      showToast('Reading ZIP…', 'info');
      const inZip = await JSZip.loadAsync(files[0]);
      const swfFiles = Object.values(inZip.files)
        .filter((f) => !f.dir && /\.swf$/i.test(f.name) && (!allowedNames || allowedNames.has(f.name)))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      entries = swfFiles.map((f) => ({ name: f.name, getBytes: () => f.async('uint8array') }));
    } else {
      entries = files.map((f) => ({ name: f.name, getBytes: async () => new Uint8Array(await f.arrayBuffer()) }));
    }

    if (!entries.length) {
      showToast('No .swf files found', 'error');
      return;
    }

    const shapeItems = [];
    let decodeFailCount = 0;
    for (const entry of entries) {
      let shapes = null;
      try {
        const bytes = await entry.getBytes();
        shapes = await _swfFileToShapeSVGs(bytes);
      } catch (e) { console.warn(e); }
      if (!shapes || !shapes.length) { decodeFailCount++; continue; }
      shapes.forEach(({ originalSvg, name }, i) => {
        const label = name ? `${entry.name} — ${name}` : (shapes.length > 1 ? `${entry.name} — shape ${i + 1}` : entry.name);
        shapeItems.push({ label, originalSvg });
      });
    }

    if (!shapeItems.length) {
      showToast('No previewable shapes found in that SWF' + (isZip ? ' ZIP' : ''), 'error');
      return;
    }

    const picked = await _pickItemsFromList('Which shapes do you want to analyze?', shapeItems.map((it) => it.label), `${shapeItems.length} shape(s) decoded`);
    if (!picked) return;
    const pickedSet = new Set(picked);
    const selected = shapeItems.filter((it) => pickedSet.has(it.label));

    const counts = new Map();
    let okCount = 0, failCount = decodeFailCount;
    for (const it of selected) {
      try {
        const doc = new DOMParser().parseFromString(it.originalSvg, 'image/svg+xml');
        if (doc.getElementsByTagName('parsererror').length) { failCount++; continue; }
        _collectSVGColorsInto(doc, counts);
        okCount++;
      } catch (e) { failCount++; }
    }

    _finishColorAnalysis(counts, okCount, failCount, {
      label: 'Analyze SWF',
      failNoteSuffix: 'skipped, could not decode',
      emptyMessage: 'No colour was detected in that SWF' + (isZip ? ' ZIP' : ''),
      rebuildZip: null,
    });
  } catch (e) {
    console.error(e);
    showToast('Could not process the SWF file(s)', 'error');
  }
}

async function _dispatchAnalyzeInput(files) {
  if (!files.length) return;
  const isSingleZip = files.length === 1 && /\.zip$/i.test(files[0].name);

  if (isSingleZip) {
    _lastSpriteZipFile = files[0];
    if (typeof JSZip === 'undefined') {
      showToast('JSZip could not be loaded (check your internet connection)', 'error');
      return;
    }
    try {
      const zip = await JSZip.loadAsync(files[0]);
      const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
      const swfNames = names.filter((n) => /\.swf$/i.test(n));
      const hasSVG = names.some((n) => /\.svg$/i.test(n));
      if (swfNames.length) {
        const picked = await _pickItemsFromList('Which .swf files do you want to analyze?', swfNames.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })), `${swfNames.length} .swf file(s) found in ${files[0].name}`);
        if (!picked) return;
        analyzeSWFShapes(files, true, new Set(picked));
      } else if (hasSVG) {
        analyzeSVGZipColors(files[0]);
      } else {
        showToast('The ZIP contains no .svg or .swf files', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Could not read the ZIP', 'error');
    }
    return;
  }

  const allSWF = files.every((f) => /\.swf$/i.test(f.name));
  if (allSWF) {
    if (files.length > 1) {
      const picked = await _pickItemsFromList('Which .swf files do you want to analyze?', files.map((f) => f.name));
      if (!picked) return;
      files = files.filter((f) => picked.includes(f.name));
    }
    analyzeSWFShapes(files, false);
    return;
  }

  showToast('Pick a .zip of SVG sprites, a .zip of .swf files, or one/more .swf files directly', 'error');
}

let _lastAnalyzedZip = null;
let _lastZipColorMap = null;

function _recolorSVGDoc(doc, colorMap) {
  const root = doc.documentElement;
  let changed = 0;

  for (const grad of root.querySelectorAll('linearGradient, radialGradient')) {
    for (const stop of grad.getElementsByTagName('stop')) {
      const style = stop.getAttribute('style');
      let fill = null, viaStyle = false;
      if (style) {
        const m = style.match(/stop-color:\s*([^;]+)/i);
        if (m) { fill = m[1].trim(); viaStyle = true; }
      }
      if (fill == null) fill = stop.getAttribute('stop-color');
      if (fill == null) continue;
      fill = fill.trim();
      if (fill === 'none') continue;
      const hex = _parseCssColorToHex(fill);
      if (hex == null || !colorMap.has(hex)) continue;
      const newHex = colorMap.get(hex);
      if (newHex === hex) continue;
      const newColor = '#' + newHex.toString(16).padStart(6, '0').toUpperCase();
      if (viaStyle) {
        stop.setAttribute('style', style.replace(/stop-color:\s*[^;]+/i, `stop-color:${newColor}`));
      } else {
        stop.setAttribute('stop-color', newColor);
      }
      changed++;
    }
  }

  const SHAPE_TAGS = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline'];
  for (const tag of SHAPE_TAGS) {
    for (const el of root.getElementsByTagName(tag)) {
      let fill = el.getAttribute('fill');
      let node = el.parentElement;
      while (fill == null && node && node !== root.parentElement) {
        fill = node.getAttribute('fill');
        node = node.parentElement;
      }
      if (fill == null) continue;
      fill = fill.trim();
      if (fill === 'none' || fill.startsWith('url(')) continue;

      const hex = _parseCssColorToHex(fill);
      if (hex == null || !colorMap.has(hex)) continue;
      const newHex = colorMap.get(hex);
      if (newHex === hex) continue;
      const newColor = '#' + newHex.toString(16).padStart(6, '0').toUpperCase();
      el.setAttribute('fill', newColor);
      changed++;
    }
  }
  return changed;
}

async function downloadRecoloredZip() {
  if (!_lastAnalyzedZip || !_lastZipColorMap) {
    showToast('Run "Analyze ZIP" first', 'error');
    return;
  }
  showToast('Recolouring sprites…', 'info');
  try {
    const outZip = new JSZip();
    const entries = Object.values(_lastAnalyzedZip.files);
    let recoloredFiles = 0, totalColorChanges = 0;
    for (const entry of entries) {
      if (entry.dir) continue;
      if (/\.svg$/i.test(entry.name)) {
        const text = await entry.async('text');
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        if (doc.getElementsByTagName('parsererror').length) {
          outZip.file(entry.name, text);
          continue;
        }
        const changed = _recolorSVGDoc(doc, _lastZipColorMap);
        if (changed) { recoloredFiles++; totalColorChanges += changed; }
        outZip.file(entry.name, new XMLSerializer().serializeToString(doc));
      } else {
        outZip.file(entry.name, await entry.async('uint8array'));
      }
    }
    const blob = await outZip.generateAsync({ type: 'blob' });
    const filename = promptFilename('recolored-sprites', 'zip');
    if (!filename) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(`Recoloured ZIP: ${recoloredFiles} sprites, ${totalColorChanges} colour values changed`, 'info');
  } catch (e) {
    console.error(e);
    showToast('Could not generate the recoloured ZIP', 'error');
  }
}

function _hexColorDistance(hexA, hexB) {
  const rA = (hexA >> 16) & 0xff, gA = (hexA >> 8) & 0xff, bA = hexA & 0xff;
  const rB = (hexB >> 16) & 0xff, gB = (hexB >> 8) & 0xff, bB = hexB & 0xff;
  const rMean = (rA + rB) / 2;
  const dr = rA - rB, dg = gA - gB, db = bA - bB;
  return Math.sqrt((2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db);
}

const COLOR_MERGE_TOLERANCE = 18;

function _mergeSimilarColors(sortedHexCounts, tolerance = COLOR_MERGE_TOLERANCE, mapOut = null) {
  const clusters = [];
  for (const [hex, count] of sortedHexCounts) {
    let target = null;
    for (const c of clusters) {
      if (_hexColorDistance(hex, c.hex) <= tolerance) { target = c; break; }
    }
    if (target) {
      target.count += count;
      if (mapOut) mapOut.set(hex, target.hex);
    } else {
      clusters.push({ hex, count });
      if (mapOut) mapOut.set(hex, hex);
    }
  }
  return clusters.map((c) => [c.hex, c.count]).sort((a, b) => b[1] - a[1]);
}

function _quantizeColorsToTarget(sortedHexCounts, targetCount, mapOut = null) {
  if (sortedHexCounts.length <= targetCount) {
    if (mapOut) for (const [hex] of sortedHexCounts) mapOut.set(hex, hex);
    return sortedHexCounts;
  }

  let boxes = [sortedHexCounts.map(([hex, count]) => ({
    hex, r: (hex >> 16) & 0xff, g: (hex >> 8) & 0xff, b: hex & 0xff, count,
  }))];

  const boxWeight = (box) => box.reduce((s, c) => s + c.count, 0);
  const boxRanges = (box) => {
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
    for (const c of box) {
      if (c.r < rMin) rMin = c.r; if (c.r > rMax) rMax = c.r;
      if (c.g < gMin) gMin = c.g; if (c.g > gMax) gMax = c.g;
      if (c.b < bMin) bMin = c.b; if (c.b > bMax) bMax = c.b;
    }
    return { rRange: rMax - rMin, gRange: gMax - gMin, bRange: bMax - bMin };
  };

  while (boxes.length < targetCount) {
    let bestIdx = -1, bestScore = -1;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].length < 2) continue;
      const { rRange, gRange, bRange } = boxRanges(boxes[i]);
      const score = Math.max(rRange, gRange, bRange) * boxWeight(boxes[i]);
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
    if (bestIdx === -1) break;

    const box = boxes[bestIdx];
    const { rRange, gRange, bRange } = boxRanges(box);
    const channel = rRange >= gRange && rRange >= bRange ? 'r' : (gRange >= bRange ? 'g' : 'b');
    box.sort((a, b) => a[channel] - b[channel]);

    const total = boxWeight(box);
    let acc = 0, splitPos = 1;
    for (let i = 0; i < box.length; i++) {
      acc += box[i].count;
      if (acc >= total / 2) { splitPos = i + 1; break; }
    }
    splitPos = Math.max(1, Math.min(splitPos, box.length - 1));
    boxes.splice(bestIdx, 1, box.slice(0, splitPos), box.slice(splitPos));
  }

  return boxes.map((box) => {
    const total = boxWeight(box);
    let r = 0, g = 0, b = 0;
    for (const c of box) { r += c.r * c.count; g += c.g * c.count; b += c.b * c.count; }
    const hex = (Math.round(r / total) << 16) | (Math.round(g / total) << 8) | Math.round(b / total);
    if (mapOut) for (const c of box) mapOut.set(c.hex, hex);
    return [hex, total];
  }).sort((a, b) => b[1] - a[1]);
}

function _mapColorsToPaletteSwatches(sortedHexCounts) {
  if (!sortedHexCounts.length) return 0;
  const props = activeColorProps();
  const count = Math.min(sortedHexCounts.length, props.length);

  clearSchemeSelections();
  for (let i = 0; i < count; i++) {
    scheme[props[i]] = sortedHexCounts[i][0];
  }
  refreshAll({ recordHistory: true });
  return count;
}

let _lastSpriteColorsAnalysis = [];

function openSpriteColorsModal(sorted, okCount, failCount, rawCount) {
  const title = document.getElementById('sprite-colors-modal-title');
  const mergeNote = rawCount && rawCount > sorted.length ? ` (${rawCount} raw colours before reduction)` : '';
  if (title) title.textContent = `${sorted.length} distinct colours${mergeNote} — ${okCount} sprites analyzed${failCount ? `, ${failCount} skipped` : ''}`;

  const list = document.getElementById('sprite-colors-list');
  if (list) {
    list.innerHTML = '';
    for (const [hex, count] of sorted) {
      const hexStr = '#' + hex.toString(16).padStart(6, '0');
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;font-family:monospace;font-size:12px';
      row.innerHTML = `
        <span style="width:18px;height:18px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);flex:none;background:${hexStr}"></span>
        <span style="flex:none">${hexStr}</span>
        <span style="opacity:0.7">× ${count}</span>
      `;
      list.appendChild(row);
    }
  }
  document.getElementById('sprite-colors-modal')?.classList.add('open');
  _ensureRecolorZipButton();
}

function _ensureRecolorZipButton() {
  if (document.getElementById('sprite-colors-download-zip')) return;
  const copyBtn = document.getElementById('sprite-colors-copy');
  if (!copyBtn || !copyBtn.parentElement) return;
  const btn = document.createElement('button');
  btn.id = 'sprite-colors-download-zip';
  btn.type = 'button';
  btn.className = copyBtn.className;
  btn.textContent = 'Download recolored ZIP';
  btn.title = 'Downloads the ZIP again with every sprite recoloured according to the merge/quantization above';
  btn.addEventListener('click', downloadRecoloredZip);
  copyBtn.parentElement.insertBefore(btn, copyBtn.nextSibling);
}

function closeSpriteColorsModal() {
  document.getElementById('sprite-colors-modal')?.classList.remove('open');
}

function copySpriteColorsList() {
  if (!_lastSpriteColorsAnalysis.length) { showToast('Nothing to copy yet', 'error'); return; }
  const text = _lastSpriteColorsAnalysis
    .map(([hex, count]) => `#${hex.toString(16).padStart(6, '0')}  x${count}`)
    .join('\n');
  navigator.clipboard.writeText(text)
    .then(() => showToast('Colour list copied', 'info'))
    .catch(() => showToast('Could not copy', 'error'));
}

let _pendingBatchZipBlob = null;
let _pendingBatchZipSourceName = 'sprites';

let _lastSpriteZipFile = null;

async function downloadBatchZip() {
  if (_lastSpriteZipFile && typeof JSZip !== 'undefined') {
    try {
      showToast('Re-rendering sprites with the current palette…', 'info');
      const result = await _buildRecoloredSVGZipBlob(_lastSpriteZipFile);
      if (result) {
        _pendingBatchZipBlob = result.blob;
        _pendingBatchZipSourceName = _lastSpriteZipFile.name || _pendingBatchZipSourceName || 'sprites';
        if (result.skippedCount) {
          showToast(`${result.skippedCount} unchecked sprite(s) kept un-recoloured in the ZIP`, 'info');
        }
      }
    } catch (e) {
      console.warn('Could not re-render the batch ZIP with the current palette, using the last generated one:', e);
    }
  }
  if (!_pendingBatchZipBlob) {
    showToast('No ZIP has been processed yet', 'error');
    return;
  }
  const base = _pendingBatchZipSourceName.replace(/\.zip$/i, '') + '-recolored';
  const filename = promptFilename(base, 'zip');
  if (!filename) return;
  const url = URL.createObjectURL(_pendingBatchZipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SWF_SHAPE_TAG_CODES = new Set([2, 22, 32, 83, 46, 84]);

async function _inflateZlib(bytes) {
  if (typeof DecompressionStream === 'undefined') return null;
  const ds = new DecompressionStream('deflate');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

function _readSWFTags(data) {
  const tags = [];
  let pos = 0;
  while (pos + 2 <= data.length) {
    const tagCodeAndLength = data[pos] | (data[pos + 1] << 8);
    const code = tagCodeAndLength >> 6;
    let length = tagCodeAndLength & 0x3f;
    let headerLen = 2;
    if (length === 0x3f) {
      if (pos + 6 > data.length) break;
      length = (data[pos + 2] | (data[pos + 3] << 8) | (data[pos + 4] << 16) | (data[pos + 5] << 24)) >>> 0;
      headerLen = 6;
    }
    const tagTotal = headerLen + length;
    if (pos + tagTotal > data.length) break;
    if (code === 0 && length === 0) break;
    tags.push({ code, raw: data.subarray(pos, pos + tagTotal) });
    pos += tagTotal;
  }
  return tags;
}

class SWFBitReader {
  constructor(bytes, startByteOffset) {
    this.bytes = bytes;
    this.pos = startByteOffset;
    this._curByte = 0;
    this.bitCount = 0;
  }
  readUB(n) {
    let value = 0;
    for (let i = 0; i < n; i++) {
      if (this.bitCount === 0) this._curByte = this.bytes[this.pos];
      const bit = (this._curByte >> (7 - this.bitCount)) & 1;
      value = value * 2 + bit;
      this.bitCount++;
      if (this.bitCount === 8) { this.bitCount = 0; this.pos++; }
    }
    return value >>> 0;
  }
  readSB(n) {
    if (n === 0) return 0;
    let v = this.readUB(n);
    if (v & (1 << (n - 1))) v -= (1 << n);
    return v;
  }
  align() { if (this.bitCount !== 0) { this.bitCount = 0; this.pos++; } }
  readUI8() { this.align(); return this.bytes[this.pos++]; }
  readUI16() { this.align(); const v = this.bytes[this.pos] | (this.bytes[this.pos + 1] << 8); this.pos += 2; return v; }
  skipBytes(n) { this.align(); this.pos += n; }
}

function _swfSkipMatrix(br) {
  if (br.readUB(1)) { const n = br.readUB(5); br.readSB(n); br.readSB(n); }
  if (br.readUB(1)) { const n = br.readUB(5); br.readSB(n); br.readSB(n); }
  const nt = br.readUB(5);
  if (nt) { br.readSB(nt); br.readSB(nt); }
}

function _swfReadRect(br) {
  const nbits = br.readUB(5);
  const xMin = br.readSB(nbits), xMax = br.readSB(nbits);
  const yMin = br.readSB(nbits), yMax = br.readSB(nbits);
  return { xMin, xMax, yMin, yMax };
}

function _swfReadColor(br, colorSize) {
  const r = br.readUI8(), g = br.readUI8(), b = br.readUI8();
  const a = colorSize === 4 ? br.readUI8() : 255;
  return { r, g, b, a };
}

function _swfParseSingleFillStyleFull(br, version, fillStyles) {
  const type = br.readUI8();
  const colorSize = version >= 3 ? 4 : 3;
  if (type === 0x00) {
    fillStyles.push({ type: 'solid', color: _swfReadColor(br, colorSize) });
  } else if (type === 0x10 || type === 0x12 || type === 0x13) {
    _swfSkipMatrix(br);
    br.align();
    const flagsByte = br.readUI8();
    const numGradients = flagsByte & 0x0F;
    const stops = [];
    for (let g = 0; g < numGradients; g++) {
      const ratio = br.readUI8();
      const color = _swfReadColor(br, colorSize);
      stops.push({ ratio, color });
    }
    if (type === 0x13) br.skipBytes(2);
    fillStyles.push({ type: 'gradient', stops });
  } else if (type >= 0x40 && type <= 0x43) {
    br.readUI16();
    _swfSkipMatrix(br);
    fillStyles.push({ type: 'bitmap' });
  } else {
    throw new Error('Unknown SWF fill style type 0x' + type.toString(16));
  }
}

function _swfParseFillStyleArrayFull(br, version, fillStyles) {
  let count = br.readUI8();
  if (version >= 2 && count === 0xFF) count = br.readUI16();
  for (let i = 0; i < count; i++) _swfParseSingleFillStyleFull(br, version, fillStyles);
}

function _swfParseLineStyleArrayFull(br, version, lineStyles) {
  let count = br.readUI8();
  if (version >= 2 && count === 0xFF) count = br.readUI16();
  const colorSize = version >= 3 ? 4 : 3;
  for (let i = 0; i < count; i++) {
    const width = br.readUI16();
    const color = _swfReadColor(br, colorSize);
    lineStyles.push({ width, color });
  }
}

function _swfParseLineStyle2ArrayFull(br, lineStyles) {
  let count = br.readUI8();
  if (count === 0xFF) count = br.readUI16();
  for (let i = 0; i < count; i++) {
    const width = br.readUI16();
    const b1 = br.readUI8();
    const hasFillFlag = (b1 >> 3) & 1;
    const joinStyle = (b1 >> 4) & 0x3;
    br.readUI8();
    if (joinStyle === 2) br.readUI16();
    if (hasFillFlag) {
      const tmp = [];
      _swfParseSingleFillStyleFull(br, 4, tmp);
      const fs = tmp[0];
      const firstColor = fs && fs.type === 'solid' ? fs.color
        : (fs && fs.type === 'gradient' && fs.stops[0]) ? fs.stops[0].color
        : { r: 0, g: 0, b: 0, a: 255 };
      lineStyles.push({ width, color: firstColor });
    } else {
      lineStyles.push({ width, color: _swfReadColor(br, 4) });
    }
  }
}

function _swfParseShapeRecordsFull(br, version, numFillBits, numLineBits, fillStyles, lineStyles) {
  const edges = [];
  let x = 0, y = 0;
  let fill0 = 0, fill1 = 0, line = 0;
  let fillOffset = 0, lineOffset = 0;
  for (;;) {
    const typeFlag = br.readUB(1);
    if (typeFlag === 0) {
      const stateNewStyles = br.readUB(1);
      const stateLineStyle = br.readUB(1);
      const stateFillStyle1 = br.readUB(1);
      const stateFillStyle0 = br.readUB(1);
      const stateMoveTo = br.readUB(1);
      if (!stateNewStyles && !stateLineStyle && !stateFillStyle1 && !stateFillStyle0 && !stateMoveTo) break;
      if (stateMoveTo) {
        const mb = br.readUB(5);
        x = br.readSB(mb);
        y = br.readSB(mb);
      }
      if (stateFillStyle0) { const local = br.readUB(numFillBits); fill0 = local === 0 ? 0 : local + fillOffset; }
      if (stateFillStyle1) { const local = br.readUB(numFillBits); fill1 = local === 0 ? 0 : local + fillOffset; }
      if (stateLineStyle) { const local = br.readUB(numLineBits); line = local === 0 ? 0 : local + lineOffset; }
      if (stateNewStyles) {
        fillOffset = fillStyles.length;
        lineOffset = lineStyles.length;
        br.align();
        _swfParseFillStyleArrayFull(br, version, fillStyles);
        if (version === 4) _swfParseLineStyle2ArrayFull(br, lineStyles);
        else _swfParseLineStyleArrayFull(br, version, lineStyles);
        numFillBits = br.readUB(4);
        numLineBits = br.readUB(4);
        fill0 = 0; fill1 = 0; line = 0;
      }
    } else {
      const straightFlag = br.readUB(1);
      const numBits = br.readUB(4) + 2;
      if (straightFlag) {
        let dx = 0, dy = 0;
        const generalLineFlag = br.readUB(1);
        if (generalLineFlag) { dx = br.readSB(numBits); dy = br.readSB(numBits); }
        else {
          const vertLineFlag = br.readUB(1);
          if (vertLineFlag) dy = br.readSB(numBits); else dx = br.readSB(numBits);
        }
        const nx = x + dx, ny = y + dy;
        if (fill0 || fill1 || line) edges.push({ type: 'line', x1: x, y1: y, x2: nx, y2: ny, fill0, fill1, line });
        x = nx; y = ny;
      } else {
        const cdx = br.readSB(numBits), cdy = br.readSB(numBits);
        const adx = br.readSB(numBits), ady = br.readSB(numBits);
        const cx = x + cdx, cy = y + cdy;
        const nx = cx + adx, ny = cy + ady;
        if (fill0 || fill1 || line) edges.push({ type: 'quad', x1: x, y1: y, cx, cy, x2: nx, y2: ny, fill0, fill1, line });
        x = nx; y = ny;
      }
    }
  }
  return edges;
}

function _swfBuildFillPaths(edges) {
  const byStyle = new Map();
  const push = (styleIndex, seg) => {
    if (!styleIndex) return;
    if (!byStyle.has(styleIndex)) byStyle.set(styleIndex, []);
    byStyle.get(styleIndex).push(seg);
  };
  for (const e of edges) {
    if (e.fill1) {
      push(e.fill1, e.type === 'line'
        ? { x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 }
        : { x1: e.x1, y1: e.y1, cx: e.cx, cy: e.cy, x2: e.x2, y2: e.y2 });
    }
    if (e.fill0) {
      push(e.fill0, e.type === 'line'
        ? { x1: e.x2, y1: e.y2, x2: e.x1, y2: e.y1 }
        : { x1: e.x2, y1: e.y2, cx: e.cx, cy: e.cy, x2: e.x1, y2: e.y1 });
    }
  }
  const result = [];
  for (const [styleIndex, segs] of byStyle) {
    const d = _swfAssembleSegmentsToPathD(segs);
    if (d) result.push({ styleIndex, d });
  }
  return result;
}

function _swfAssembleSegmentsToPathD(segs) {
  const key = (x, y) => x + ',' + y;
  const byStart = new Map();
  for (const s of segs) {
    const k = key(s.x1, s.y1);
    if (!byStart.has(k)) byStart.set(k, []);
    byStart.get(k).push(s);
  }
  const used = new Set();
  const parts = [];
  for (const s of segs) {
    if (used.has(s)) continue;
    const startKey = key(s.x1, s.y1);
    let piece = `M ${s.x1 / 20} ${s.y1 / 20} `;
    let cur = s;
    let guard = 0;
    while (cur && !used.has(cur) && guard++ < 20000) {
      used.add(cur);
      piece += cur.cx !== undefined
        ? `Q ${cur.cx / 20} ${cur.cy / 20} ${cur.x2 / 20} ${cur.y2 / 20} `
        : `L ${cur.x2 / 20} ${cur.y2 / 20} `;
      const nk = key(cur.x2, cur.y2);
      if (nk === startKey) { piece += 'Z '; cur = null; break; }
      const candidates = byStart.get(nk);
      let next = null;
      if (candidates) { for (const c of candidates) { if (!used.has(c)) { next = c; break; } } }
      cur = next;
    }
    parts.push(piece.trim());
  }
  return parts.join(' ') || null;
}

function _swfBuildLinePathsByStyle(edges) {
  const byStyle = new Map();
  for (const e of edges) {
    if (!e.line) continue;
    if (!byStyle.has(e.line)) byStyle.set(e.line, []);
    byStyle.get(e.line).push(e.type === 'line'
      ? `M ${e.x1 / 20} ${e.y1 / 20} L ${e.x2 / 20} ${e.y2 / 20}`
      : `M ${e.x1 / 20} ${e.y1 / 20} Q ${e.cx / 20} ${e.cy / 20} ${e.x2 / 20} ${e.y2 / 20}`);
  }
  const result = [];
  for (const [styleIndex, parts] of byStyle) result.push({ styleIndex, d: parts.join(' ') });
  return result;
}

function _swfShapeTagToSVG(raw, tagCode) {
  const version = { 2: 1, 22: 2, 32: 3, 83: 4 }[tagCode];
  if (!version) return null;
  const tagCodeAndLength = raw[0] | (raw[1] << 8);
  const headerLen = (tagCodeAndLength & 0x3f) === 0x3f ? 6 : 2;
  const br = new SWFBitReader(raw, headerLen);
  const shapeId = br.readUI16();
  const bounds = _swfReadRect(br);
  if (version === 4) {
    _swfReadRect(br);
    br.readUB(5); br.readUB(1); br.readUB(1); br.readUB(1);
  }
  br.align();

  const fillStyles = [];
  const lineStyles = [];
  _swfParseFillStyleArrayFull(br, version, fillStyles);
  if (version === 4) _swfParseLineStyle2ArrayFull(br, lineStyles);
  else _swfParseLineStyleArrayFull(br, version, lineStyles);
  const numFillBits = br.readUB(4);
  const numLineBits = br.readUB(4);
  const edges = _swfParseShapeRecordsFull(br, version, numFillBits, numLineBits, fillStyles, lineStyles);

  const cloneStyle = (s) => (s.type === 'gradient'
    ? { ...s, stops: s.stops.map((st) => ({ ratio: st.ratio, color: { ...st.color } })) }
    : { ...s, color: s.color ? { ...s.color } : s.color });
  const origFillStyles = fillStyles.map(cloneStyle);
  const origLineStyles = lineStyles.map(cloneStyle);

  const seedRgb = _getBifrostSeedRgb();
  let changed = false;
  const remap = (c) => {
    if (c.r <= 20 && c.g <= 20 && c.b <= 20) return c;
    let best = -1, bestDist = Infinity;
    for (let s = 0; s < seedRgb.length; s++) {
      const [sr, sg, sb] = seedRgb[s];
      const dr = c.r - sr, dg = c.g - sg, db = c.b - sb;
      const d = dr * dr + dg * dg + db * db;
      if (d < bestDist) { bestDist = d; best = s; }
    }
    if (best === -1) return c;
    const target = scheme[ALL_COLOR_PROPS[best]];
    if (target === undefined) return c;
    const nr = (target >> 16) & 0xFF, ng = (target >> 8) & 0xFF, nb = target & 0xFF;
    if (nr !== c.r || ng !== c.g || nb !== c.b) changed = true;
    return { r: nr, g: ng, b: nb, a: c.a };
  };
  for (const fs of fillStyles) {
    if (fs.type === 'solid') fs.color = remap(fs.color);
    else if (fs.type === 'gradient') fs.stops = fs.stops.map((st) => ({ ratio: st.ratio, color: remap(st.color) }));
  }
  for (const ls of lineStyles) {
    if (ls.color) ls.color = remap(ls.color);
  }

  let minX = bounds.xMin / 20, minY = bounds.yMin / 20;
  let w = (bounds.xMax - bounds.xMin) / 20, h = (bounds.yMax - bounds.yMin) / 20;
  if (!(w > 0) || !(h > 0)) {
    let ex0 = Infinity, ey0 = Infinity, ex1 = -Infinity, ey1 = -Infinity;
    for (const e of edges) {
      for (const p of [[e.x1, e.y1], [e.x2, e.y2]]) {
        if (p[0] < ex0) ex0 = p[0]; if (p[1] < ey0) ey0 = p[1];
        if (p[0] > ex1) ex1 = p[0]; if (p[1] > ey1) ey1 = p[1];
      }
    }
    if (ex1 > ex0 && ey1 > ey0) { minX = ex0 / 20; minY = ey0 / 20; w = (ex1 - ex0) / 20; h = (ey1 - ey0) / 20; }
    else { minX = 0; minY = 0; w = 100; h = 100; }
  }

  const fillPaths = [..._swfBuildFillPaths(edges)];
  const linePaths = [..._swfBuildLinePathsByStyle(edges)];

  const render = (fStyles, lStyles) => {
    const toHex = (c) => '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');
    const defs = [];
    let gradId = 0;
    const fillMarkup = [];
    for (const { styleIndex, d } of fillPaths) {
      if (!d) continue;
      const fs = fStyles[styleIndex - 1];
      if (!fs) continue;
      let fillAttr, opacityAttr = '';
      if (fs.type === 'solid') {
        fillAttr = toHex(fs.color);
        if (fs.color.a < 255) opacityAttr = ` fill-opacity="${(fs.color.a / 255).toFixed(3)}"`;
      } else if (fs.type === 'gradient' && fs.stops.length) {
        const id = `swfg${gradId++}`;
        const stopsMarkup = fs.stops.map((st) =>
          `<stop offset="${(st.ratio / 255).toFixed(3)}" stop-color="${toHex(st.color)}"${st.color.a < 255 ? ` stop-opacity="${(st.color.a / 255).toFixed(3)}"` : ''}/>`
        ).join('');
        defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${minX}" y1="${minY + h / 2}" x2="${minX + w}" y2="${minY + h / 2}">${stopsMarkup}</linearGradient>`);
        fillAttr = `url(#${id})`;
      } else {
        fillAttr = '#808080';
      }
      fillMarkup.push(`<path d="${d}" fill="${fillAttr}"${opacityAttr} fill-rule="nonzero"/>`);
    }

    const lineMarkup = [];
    for (const { styleIndex, d } of linePaths) {
      if (!d) continue;
      const ls = lStyles[styleIndex - 1];
      if (!ls) continue;
      const strokeWidth = Math.max(ls.width / 20, 0.5);
      lineMarkup.push(`<path d="${d}" fill="none" stroke="${toHex(ls.color)}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`);
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}" width="${w}" height="${h}">` +
      (defs.length ? `<defs>${defs.join('')}</defs>` : '') +
      `<g>${fillMarkup.join('')}${lineMarkup.join('')}</g></svg>`;
  };

  const svg = render(fillStyles, lineStyles);
  const originalSvg = render(origFillStyles, origLineStyles);
  return { svg, originalSvg, changed, shapeId };
}

function _swfParseCharacterNames(tags) {
  const names = new Map();
  const readOne = (raw, headerLen) => {
    try {
      let pos = headerLen;
      const count = raw[pos] | (raw[pos + 1] << 8);
      pos += 2;
      for (let i = 0; i < count && pos < raw.length; i++) {
        const id = raw[pos] | (raw[pos + 1] << 8);
        pos += 2;
        const start = pos;
        while (pos < raw.length && raw[pos] !== 0) pos++;
        if (pos >= raw.length) break;
        const name = new TextDecoder('utf-8').decode(raw.subarray(start, pos));
        pos++;
        if (name && !names.has(id)) names.set(id, name);
      }
    } catch (e) {  }
  };
  for (const tag of tags) {
    if (tag.code !== 76 && tag.code !== 56) continue;
    const tagCodeAndLength = tag.raw[0] | (tag.raw[1] << 8);
    const headerLen = (tagCodeAndLength & 0x3f) === 0x3f ? 6 : 2;
    readOne(tag.raw, headerLen);
  }
  return names;
}

function _swfParseShapeToSpriteMap(tags) {
  const shapeToSprite = new Map();
  for (const tag of tags) {
    if (tag.code !== 39) continue;
    try {
      const outerHeaderLen = ((tag.raw[0] | (tag.raw[1] << 8)) & 0x3f) === 0x3f ? 6 : 2;
      let pos = outerHeaderLen;
      const spriteId = tag.raw[pos] | (tag.raw[pos + 1] << 8);
      pos += 4;
      const nested = _readSWFTags(tag.raw.subarray(pos));
      for (const nt of nested) {
        try {
          const nHeaderLen = ((nt.raw[0] | (nt.raw[1] << 8)) & 0x3f) === 0x3f ? 6 : 2;
          let npos = nHeaderLen;
          let characterId = null;
          if (nt.code === 4) {
            characterId = nt.raw[npos] | (nt.raw[npos + 1] << 8);
          } else if (nt.code === 26) {
            const flags = nt.raw[npos]; npos += 1;
            npos += 2;
            if (flags & 0x02) characterId = nt.raw[npos] | (nt.raw[npos + 1] << 8);
          } else if (nt.code === 70) {
            const flags0 = nt.raw[npos], flags1 = nt.raw[npos + 1]; npos += 2;
            npos += 2;
            const hasCharacter = (flags1 & 0x02) !== 0;
            const hasClassName = (flags0 & 0x08) !== 0;
            const hasImage = (flags0 & 0x10) !== 0;
            if (hasClassName || (hasImage && hasCharacter)) {
              while (npos < nt.raw.length && nt.raw[npos] !== 0) npos++;
              npos++;
            }
            if (hasCharacter) characterId = nt.raw[npos] | (nt.raw[npos + 1] << 8);
          }
          if (characterId != null && !shapeToSprite.has(characterId)) shapeToSprite.set(characterId, spriteId);
        } catch (e) {  }
      }
    } catch (e) {  }
  }
  return shapeToSprite;
}

async function _swfFileToShapeSVGs(fileBytes) {
  const { tags } = await _swfDecodeToTags(fileBytes);
  const characterNames = _swfParseCharacterNames(tags);
  const shapeToSprite = _swfParseShapeToSpriteMap(tags);
  const results = [];
  for (const tag of tags) {
    if (!SWF_SHAPE_TAG_CODES.has(tag.code)) continue;
    if (tag.code === 46 || tag.code === 84) continue;
    try {
      const result = _swfShapeTagToSVG(tag.raw, tag.code);
      if (result) {
        const name = characterNames.get(result.shapeId)
          || (shapeToSprite.has(result.shapeId) ? characterNames.get(shapeToSprite.get(result.shapeId)) : null)
          || null;
        results.push({ ...result, name });
      }
    } catch (e) {
      console.warn('Could not render one SWF shape for preview:', e);
    }
  }
  return results;
}

let _zipPreviewIsSWF = false;

let _zipPreviewRequestId = 0;

let _swfShapeSelected = {};

let _swfSelectionSignature = null;

function _filesSignature(files) {
  return (files || []).map((f) => `${f.name}:${f.size}:${f.lastModified}`).join('|');
}

let _shapePickerRemembered = {};

let _zipPreviewCheckboxOrder = [];
let _zipPreviewSearchQuery = '';

function _zipPreviewApplyFilter(query) {
  _zipPreviewSearchQuery = String(query || '').trim().toLowerCase();
  const grid = document.getElementById('sprite-zip-preview-grid');
  if (!grid) return;
  for (const cell of grid.querySelectorAll('.zip-preview-item')) {
    const name = cell.querySelector('.zip-preview-name')?.textContent || '';
    const match = !_zipPreviewSearchQuery || name.toLowerCase().includes(_zipPreviewSearchQuery);
    cell.classList.toggle('zip-preview-filtered-out', !match);
    cell.style.display = match ? '' : 'none';
  }
}

function _zipPreviewVisibleCheckboxes() {
  return Array.from(document.querySelectorAll(
    '#sprite-zip-preview-grid .zip-preview-item:not(.zip-preview-filtered-out) .zip-preview-select-cb'
  ));
}

let _zipPreviewLastCbIndex = null;

function _zipPreviewApplyRangeSelect(cb, isShift) {
  const thisIndex = _zipPreviewCheckboxOrder.indexOf(cb);
  if (isShift && _zipPreviewLastCbIndex != null) {
    const start = Math.min(_zipPreviewLastCbIndex, thisIndex);
    const end = Math.max(_zipPreviewLastCbIndex, thisIndex);
    const checked = cb.checked;
    for (let i = start; i <= end; i++) {
      const other = _zipPreviewCheckboxOrder[i];
      other.checked = checked;
      if (other.dataset.fullPath) _swfShapeSelected[other.dataset.fullPath] = checked;
    }
  } else if (cb.dataset.fullPath) {
    _swfShapeSelected[cb.dataset.fullPath] = cb.checked;
  }
  _zipPreviewLastCbIndex = thisIndex;
}

let _pendingSWFShapesZipSourceName = 'swf-shapes';

async function _swfEntriesFromFiles(files, isZip, allowedNames) {
  if (isZip) {
    const inZip = await JSZip.loadAsync(files[0]);
    const swfFiles = Object.values(inZip.files)
      .filter((f) => !f.dir && /\.swf$/i.test(f.name) && (!allowedNames || allowedNames.has(f.name)))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    return swfFiles.map((f) => ({ name: f.name, getBytes: () => f.async('uint8array') }));
  }
  return files.map((f) => ({ name: f.name, getBytes: async () => new Uint8Array(await f.arrayBuffer()) }));
}

async function previewSWFFiles(files, isZip, allowedNames, askShapes) {
  if (isZip && typeof JSZip === 'undefined') {
    showToast('JSZip could not be loaded (check your internet connection)', 'error');
    return;
  }
  _endZipManualEditSession();
  const myRequestId = ++_zipPreviewRequestId;
  const _sig = _filesSignature(files);
  if (_sig !== _swfSelectionSignature) {
    _swfShapeSelected = {};
    _swfSelectionSignature = _sig;
  }
  try {
    let entries;
    if (isZip) {
      showToast('Reading ZIP…', 'info');
      entries = await _swfEntriesFromFiles(files, true, allowedNames);
    } else {
      entries = await _swfEntriesFromFiles(files, false);
    }

    if (!entries.length) {
      showToast('No .swf files found', 'error');
      return;
    }

    let items = [];
    let failCount = 0;
    for (const entry of entries) {
      let shapes = null;
      try {
        const bytes = await entry.getBytes();
        shapes = await _swfFileToShapeSVGs(bytes);
      } catch (e) {
        console.warn(e);
      }
      if (!shapes || !shapes.length) {
        failCount++;
        items.push({ name: entry.name, fullPath: entry.name, svg: null, original: null, auto: null, changed: false });
        continue;
      }
      shapes.forEach(({ svg, changed, name, shapeId }, i) => {
        const idLabel = shapeId != null ? shapeId : i + 1;
        const label = name ? `${entry.name} — ${name}` : (shapes.length > 1 ? `${entry.name} — shape ${idLabel}` : entry.name);
        const fullPath = `${entry.name}#${shapeId != null ? shapeId : i}`;
        items.push({ name: label, fullPath, svg, original: null, auto: svg, changed });
      });
    }

    if (!items.some((it) => it.svg)) {
      showToast('No previewable shapes found in that SWF' + (isZip ? ' ZIP' : ''), 'error');
      return;
    }
    if (myRequestId !== _zipPreviewRequestId) return;

    if (askShapes) {
      const pickableNames = items.filter((it) => it.svg).map((it) => it.name);
      const remembered = _shapePickerRemembered[_sig];
      if (remembered) {
        items = items.filter((it) => !it.svg || remembered.has(it.name));
      } else {
        const picked = await _pickItemsFromList('Which shapes do you want to change?', pickableNames, `${pickableNames.length} shape(s) decoded`);
        if (myRequestId !== _zipPreviewRequestId) return;
        if (!picked) return;
        _shapePickerRemembered[_sig] = new Set(picked);
        items = items.filter((it) => !it.svg || new Set(picked).has(it.name));
      }
    }

    let changedCount = 0;
    for (const it of items) {
      if (it.changed) {
        changedCount++;
        if (!(it.fullPath in _swfShapeSelected)) _swfShapeSelected[it.fullPath] = true;
      }
    }

    const hiddenCount = items.filter((it) => it.svg && _swfShapeSelected[it.fullPath] === false).length;
    items = items.filter((it) => !it.svg || _swfShapeSelected[it.fullPath] !== false);

    _zipPreviewIsSWF = true;
    _pendingSWFShapesZipSourceName = (isZip ? files[0].name : 'swf-shapes') || 'swf-shapes';
    const dlBtn = document.getElementById('btn-swf-shapes-batch-download');
    if (dlBtn) dlBtn.style.display = changedCount ? '' : 'none';
    const bulkExportBtn = document.getElementById('btn-swf-shapes-bulk-export');
    if (bulkExportBtn) bulkExportBtn.style.display = (changedCount && isDesktopApp()) ? '' : 'none';
    const statusEl = document.getElementById('sprite-status');
    if (statusEl) {
      const failNote = failCount ? `, ${failCount} skipped` : '';
      const hiddenNote = hiddenCount ? `, ${hiddenCount} hidden (previously unchecked — "Clear" to bring them back)` : '';
      statusEl.textContent = `SWF Shapes: ${items.length} shape(s) decoded, ${changedCount} changed colour${failNote}${hiddenNote}. Uncheck any you don't want, then "Download SWF shapes".`;
    }

    openSpriteZipPreviewModal(items, failCount, (isZip ? files[0].name : 'SWF shapes') || 'SWF shapes');
  } catch (e) {
    console.error(e);
    showToast('Could not process the SWF file(s)', 'error');
  }
}

let _lastSWFPreviewFiles = null;

async function _swfDecodeToTags(fileBytes) {
  if (fileBytes.length < 8) throw new Error('File is too small to be a valid SWF');
  const sig = String.fromCharCode(fileBytes[0], fileBytes[1], fileBytes[2]);
  if (sig !== 'FWS' && sig !== 'CWS' && sig !== 'ZWS') {
    throw new Error('Not a recognised SWF (missing FWS/CWS/ZWS signature)');
  }
  if (sig === 'ZWS') {
    throw new Error('LZMA-compressed SWF ("ZWS") is not supported');
  }
  const version = fileBytes[3];
  let body;
  if (sig === 'FWS') {
    body = fileBytes.subarray(8);
  } else {
    const inflated = await _inflateZlib(fileBytes.subarray(8));
    if (!inflated) throw new Error('This browser cannot decompress CWS SWFs (DecompressionStream unavailable)');
    body = inflated;
  }

  if (body.length < 1) throw new Error('SWF body is empty/truncated');
  const nbits = (body[0] >> 3) & 0x1f;
  const rectBytes = Math.ceil((5 + 4 * nbits) / 8);
  const headerPrefixLen = rectBytes + 4;
  if (body.length < headerPrefixLen) throw new Error('SWF header is truncated');
  const headerPrefix = body.subarray(0, headerPrefixLen);
  const tagsData = body.subarray(headerPrefixLen);

  const tags = _readSWFTags(tagsData);
  return { version, headerPrefix, tags };
}

async function _reRenderSWFShapesFresh(wanted) {
  const wantIdsByFile = new Map();
  for (const it of wanted) {
    const m = /^(.*)#(\d+)$/.exec(it.fullPath);
    if (!m) continue;
    if (!wantIdsByFile.has(m[1])) wantIdsByFile.set(m[1], new Set());
    wantIdsByFile.get(m[1]).add(Number(m[2]));
  }
  if (!_lastSWFPreviewFiles || !_lastSWFPreviewFiles.length) return null;
  try {
    showToast('Re-rendering shapes with the current palette…', 'info');
    const isZip = _lastSWFPreviewFiles.length === 1 && /\.zip$/i.test(_lastSWFPreviewFiles[0].name);
    const entries = await _swfEntriesFromFiles(_lastSWFPreviewFiles, isZip);
    const freshSvgs = {};
    for (const entry of entries) {
      const wantIds = wantIdsByFile.get(entry.name);
      if (!wantIds) continue;
      const bytes = await entry.getBytes();
      const shapes = await _swfFileToShapeSVGs(bytes);
      for (const s of shapes) {
        if (s.svg && wantIds.has(s.shapeId)) freshSvgs[`${entry.name}#${s.shapeId}`] = s.svg;
      }
    }
    return freshSvgs;
  } catch (e) {
    console.warn('Could not re-render SWF shapes with the current palette, using the last preview instead:', e);
    return null;
  }
}

async function downloadSWFShapesBatchZip() {
  if (!_zipPreviewIsSWF || !Object.keys(_zipPreviewItemsByPath).length) {
    showToast('No SWF batch has been processed yet', 'error');
    return;
  }
  const wanted = Object.values(_zipPreviewItemsByPath)
    .filter((it) => it.svg && _swfShapeSelected[it.fullPath] !== false);
  if (!wanted.length) {
    showToast('No shapes are selected to export', 'error');
    return;
  }
  if (typeof JSZip === 'undefined') {
    showToast('JSZip could not be loaded (check your internet connection)', 'error');
    return;
  }

  const freshSvgs = await _reRenderSWFShapesFresh(wanted);

  const outZip = new JSZip();
  const usedNames = new Set();
  for (const it of wanted) {
    let base = it.fullPath.replace(/^.*\.swf#(\d+)$/i, '$1').replace(/[\\/]/g, '_');
    if (!/\.svg$/i.test(base)) base += '.svg';
    let name = base, n = 2;
    while (usedNames.has(name)) { name = base.replace(/\.svg$/i, `_${n++}.svg`); }
    usedNames.add(name);
    const svgOut = (freshSvgs && freshSvgs[it.fullPath]) || it.svg;
    outZip.file(name, svgOut);
  }

  outZip.generateAsync({ type: 'blob' }).then((blob) => {
    const base = (_pendingSWFShapesZipSourceName || 'swf-shapes').replace(/\.zip$/i, '').replace(/\.swf$/i, '') + '-changed-shapes';
    const filename = promptFilename(base, 'zip');
    if (!filename) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }).catch((e) => {
    console.error(e);
    showToast('Could not build the SWF shapes .zip', 'error');
  });
}

async function bulkExportSWFShapesToSWF() {
  if (!isDesktopApp()) {
    showToast('Export to SWF only works from the Azu Modification desktop app', 'error');
    return;
  }
  if (!_zipPreviewIsSWF || !Object.keys(_zipPreviewItemsByPath).length) {
    showToast('No SWF batch has been processed yet', 'error');
    return;
  }
  const wanted = Object.values(_zipPreviewItemsByPath)
    .filter((it) => it.svg && _swfShapeSelected[it.fullPath] !== false);
  if (!wanted.length) {
    showToast('No shapes are selected to export', 'error');
    return;
  }

  const freshSvgs = await _reRenderSWFShapesFresh(wanted);

  const shapes = [];
  for (const it of wanted) {
    const m = /#(\d+)$/.exec(it.fullPath);
    if (!m) continue;
    shapes.push({ characterId: Number(m[1]), svg: (freshSvgs && freshSvgs[it.fullPath]) || it.svg });
  }
  if (!shapes.length) {
    showToast('None of the selected shapes have a CharacterID to match against a target .swf', 'error');
    return;
  }

  let overlayShown = false;
  window.updateBulkExportProgress = (done, total) => {
    if (!overlayShown) {
      showProgressOverlay('Exporting to SWF…', `Shape ${done} of ${total}…`, true);
      overlayShown = true;
    }
    setProgressOverlayPercent(total ? (done / total) * 100 : 0);
    const subtitleEl = document.getElementById('progress-modal-subtitle');
    if (subtitleEl) subtitleEl.textContent = done >= total ? 'Finishing up…' : `Shape ${done} of ${total}…`;
  };

  try {
    const result = await window.pywebview.api.bulk_export_shapes_to_swf(shapes);
    if (result && result.message !== 'cancelled') {
      showToast(result.message, result.success ? 'info' : 'error');
    }
  } catch (e) {
    showToast(`Export to SWF failed: ${e.message || e}`, 'error');
  } finally {
    hideProgressOverlay();
    delete window.updateBulkExportProgress;
  }
}

function _applySpriteZoomTransform() {
  const layer = document.getElementById('sprite-zoom-layer');
  const levelEl = document.getElementById('sprite-zoom-level');
  const outBtn = document.getElementById('btn-sprite-zoom-out');
  const inBtn = document.getElementById('btn-sprite-zoom-in');
  const resetBtn = document.getElementById('btn-sprite-zoom-reset');
  if (layer) {
    layer.style.transform = `translate(${spritePanX}px, ${spritePanY}px) scale(${spriteZoom})`;
    layer.classList.toggle('is-zoomed', spriteZoom > 1);
  }
  if (levelEl) levelEl.textContent = `${Math.round(spriteZoom * 100)}%`;
  if (outBtn) outBtn.disabled = spriteZoom <= SPRITE_ZOOM_MIN;
  if (inBtn) inBtn.disabled = spriteZoom >= SPRITE_ZOOM_MAX;
  if (resetBtn) resetBtn.disabled = spriteZoom === 1 && spritePanX === 0 && spritePanY === 0;
}

function _resetSpriteZoom() {
  spriteZoom = 1;
  spritePanX = 0;
  spritePanY = 0;
  _applySpriteZoomTransform();
}

function _spriteZoomBy(factor) {
  const next = Math.min(SPRITE_ZOOM_MAX, Math.max(SPRITE_ZOOM_MIN, spriteZoom * factor));
  spriteZoom = next;
  if (spriteZoom === SPRITE_ZOOM_MIN) { spritePanX = 0; spritePanY = 0; }
  _applySpriteZoomTransform();
}

let _spriteDragWasPan = false;
function _spriteConsumeDragClick() {
  if (!_spriteDragWasPan) return false;
  _spriteDragWasPan = false;
  return true;
}

function _initSpriteZoom() {
  const previewEl = document.getElementById('sprite-preview');
  const layer = document.getElementById('sprite-zoom-layer');
  if (!previewEl || !layer) return;

  previewEl.addEventListener('wheel', (e) => {
    if (previewEl.classList.contains('is-empty')) return;
    e.preventDefault();
    _spriteZoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
  }, { passive: false });

  previewEl.addEventListener('dblclick', () => _resetSpriteZoom());

  let dragging = false;
  let dragMoved = false;
  let dragPointerId = null;
  let startX = 0, startY = 0, startPanX = 0, startPanY = 0;
  const DRAG_THRESHOLD = 4;

  layer.addEventListener('pointerdown', (e) => {
    if (spriteZoom <= 1 || spriteMarkSkinMode) return;
    dragging = true;
    dragMoved = false;
    dragPointerId = e.pointerId;
    startX = e.clientX; startY = e.clientY;
    startPanX = spritePanX; startPanY = spritePanY;
    layer.classList.add('is-panning');
  });

  layer.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!dragMoved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragMoved = true;
      layer.setPointerCapture(dragPointerId);
    }
    if (dragMoved) {
      spritePanX = startPanX + dx;
      spritePanY = startPanY + dy;
      _applySpriteZoomTransform();
    }
  });

  const endDrag = () => {
    if (dragging && dragMoved) _spriteDragWasPan = true;
    dragging = false;
    layer.classList.remove('is-panning');
  };
  layer.addEventListener('pointerup', endDrag);
  layer.addEventListener('pointercancel', endDrag);

  const zoomInBtn = document.getElementById('btn-sprite-zoom-in');
  const zoomOutBtn = document.getElementById('btn-sprite-zoom-out');
  const zoomResetBtn = document.getElementById('btn-sprite-zoom-reset');
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => _spriteZoomBy(1.25));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => _spriteZoomBy(1 / 1.25));
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => _resetSpriteZoom());

  _applySpriteZoomTransform();
}

function _setSpriteZoomControlsEnabled(enabled) {
  const outBtn = document.getElementById('btn-sprite-zoom-out');
  const inBtn = document.getElementById('btn-sprite-zoom-in');
  const resetBtn = document.getElementById('btn-sprite-zoom-reset');
  if (inBtn) inBtn.disabled = !enabled;
  if (!enabled) {
    if (outBtn) outBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
  }
}

function clearSprite() {
  _stopSpriteAnimation();
  _endZipManualEditSession();
  _zipManualEditFullPath = null;
  spriteColors = [];
  spriteBaseImageData = null;
  spriteLabelArray = null;
  spriteBlackMask = null;
  spriteBlackDilateCache = null;
  spriteFillLabelArray = null;
  spriteSkinMask = null;
  spriteIsSVG = false;
  spriteSVGShapes = [];
  spriteSVGLabelOf = null;
  spriteSVGExactMatchSet = new Set();
  spriteSVGGradientOf = null;
  spriteSVGSkinSet = null;
  _setMarkSkinMode(false);
  const canvas = document.getElementById('sprite-canvas');
  const svgEl = document.getElementById('sprite-svg');
  const emptyEl = document.getElementById('sprite-empty');
  const statusEl = document.getElementById('sprite-status');
  if (canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }
  if (svgEl) { svgEl.innerHTML = ''; svgEl.style.display = 'none'; }
  if (emptyEl) emptyEl.style.display = '';
  const previewEl = document.getElementById('sprite-preview');
  if (previewEl) previewEl.classList.add('is-empty');
  if (statusEl) statusEl.textContent = '';
  const recolorBtn = document.getElementById('btn-sprite-recolor-upload');
  const clearBtn = document.getElementById('btn-sprite-clear');
  const dlSvgBtn = document.getElementById('btn-sprite-download-svg');
  const copyPngBtn = document.getElementById('btn-sprite-copy-png');
  if (recolorBtn) recolorBtn.disabled = true;
  if (clearBtn) clearBtn.disabled = true;
  if (dlSvgBtn) { dlSvgBtn.disabled = true; dlSvgBtn.style.display = 'none'; }
  if (copyPngBtn) copyPngBtn.disabled = true;
  _setSpriteMarkSkinButtonsEnabled(false);
  _resetSpriteZoom();
  _setSpriteZoomControlsEnabled(false);
}

function _setSpriteMarkSkinButtonsEnabled(enabled) {
  const markBtn = document.getElementById('btn-sprite-mark-skin');
  const clearSkinBtn = document.getElementById('btn-sprite-clear-skin');
  if (markBtn) markBtn.disabled = !enabled;
  if (clearSkinBtn) clearSkinBtn.disabled = !enabled;
}

function _setMarkSkinMode(active) {
  spriteMarkSkinMode = active;
  const markBtn = document.getElementById('btn-sprite-mark-skin');
  if (markBtn) markBtn.classList.toggle('btn-primary', active);
}

function clearSkinMarks() {
  if (spriteIsSVG) {
    if (!spriteSVGSkinSet || spriteSVGSkinSet.size === 0) { showToast('No skin marks to clear', 'info'); return; }
    spriteSVGSkinSet.clear();
    renderSpriteSVGFromLabels();
  } else {
    if (!spriteSkinMask || !spriteSkinMask.some((v) => v)) { showToast('No skin marks to clear', 'info'); return; }
    spriteSkinMask.fill(0);
    renderSpriteFromLabels();
  }
  showToast('Skin marks cleared', 'info');
}

const TEMPLATE_COL_FRACTIONS = [0.35, 0.464, 0.578, 0.692, 0.806, 0.92];
const TEMPLATE_ROW_FRACTIONS = { Hair: 0.23, Body1: 0.344, Body2: 0.458, Special: 0.572, Cloth: 0.686, Weapon: 0.8 };

function _computeGridCellFractions() {
  const fractions = {};
  for (const col of GRID_COLUMNS) {
    const fy = TEMPLATE_ROW_FRACTIONS[col.id];
    if (fy === undefined) continue;
    GRID_ROWS.forEach((row, i) => {
      if (!gridCellsFor(col.id).has(row.suffix)) return;
      fractions[propName(col.id, row.suffix)] = [TEMPLATE_COL_FRACTIONS[i], fy];
    });
  }
  return fractions;
}

const TEMPLATE_CELL_FRACTIONS = _computeGridCellFractions();

function _sampleTemplateNeighborhood(data, w, h, cx, cy, radius = 3) {
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const i = (y * w + x) * 4;
      if (data[i + 3] < 200) continue;
      rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; count++;
    }
  }
  if (!count) return null;
  return (Math.round(rSum / count) << 16) | (Math.round(gSum / count) << 8) | Math.round(bSum / count);
}

function sampleTemplateImage(imageData, W, H) {
  const data = imageData.data;
  const result = {};
  for (const [prop, [fx, fy]] of Object.entries(TEMPLATE_CELL_FRACTIONS)) {
    const cx = Math.round(fx * W);
    const cy = Math.round(fy * H);
    const hexInt = _sampleTemplateNeighborhood(data, W, H, cx, cy, Math.max(2, Math.round(0.02 * Math.min(W, H))));
    if (hexInt !== null) result[prop] = hexInt;
  }
  return result;
}

let templateImageItem = null;

function initTemplateUI() {
  const fileInput = document.getElementById('template-file-input');
  const dropzone = document.getElementById('template-dropzone');
  if (!fileInput || !dropzone) return;

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) loadPaletteTemplateFile(fileInput.files[0]);
    fileInput.value = '';
  });

  bind('btn-template-map', mapFromTemplate);
  bind('btn-template-clear', clearPaletteTemplate);

  ['dragover', 'dragenter'].forEach(evt => dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach(evt => dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  }));
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) loadPaletteTemplateFile(file);
  });
}

function loadPaletteTemplateFile(file) {
  if (!file) return;
  const name = (file.name || '').toLowerCase();
  const isSvg = name.endsWith('.svg') || file.type === 'image/svg+xml';
  const isSchemeFile = !isSvg && /\.(json|xml|ini|txt|palette|wcolor)$/.test(name);

  if (isSvg || isSchemeFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target.result || '');
      const locked = grid.getLockedColumns();
      try {
        if (isSvg || /<svg[\s>]/i.test(text)) {
          scheme.loadSVG(text, locked);
        } else if (name.endsWith('.json') || /^\s*[{[]/.test(text)) {
          scheme.loadJSON(text, locked);
        } else if (name.endsWith('.xml') || /<ColorSchemeType[\s>]/.test(text)) {
          scheme.loadXML(text, locked);
        } else if (/pushuint\s+\d+/.test(text) && /\bnewarray\b/.test(text)) {
          scheme.loadPcode(text, locked);
        } else {
          scheme.loadINI(text, locked);
        }
        clearSchemeSelections();
        refreshAll({ recordHistory: true });
        const fnameEl = document.getElementById('template-fname');
        if (fnameEl) fnameEl.textContent = file.name;
        const statusEl = document.getElementById('template-status');
        if (statusEl) statusEl.textContent = `Loaded "${file.name}".`;
        showToast(`Imported "${file.name}"`, 'info');
      } catch (err) {
        showToast(`Import failed: ${err.message}`, 'error');
      }
    };
    reader.onerror = () => showToast('Could not read file', 'error');
    reader.readAsText(file);
    return;
  }

  if (!file.type.startsWith('image/')) {
    showToast('Select a valid image file', 'error');
    return;
  }
  _readImageFile(file).then((img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const tctx = canvas.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    tctx.drawImage(img, 0, 0);
    const imageData = tctx.getImageData(0, 0, canvas.width, canvas.height);
    templateImageItem = { imageData, width: canvas.width, height: canvas.height };

    const fnameEl = document.getElementById('template-fname');
    if (fnameEl) fnameEl.textContent = file.name;
    const mapBtn = document.getElementById('btn-template-map');
    const clearBtn = document.getElementById('btn-template-clear');
    if (mapBtn) mapBtn.disabled = false;
    if (clearBtn) clearBtn.disabled = false;
    const statusEl = document.getElementById('template-status');
    if (statusEl) statusEl.textContent = 'Template loaded — press "Map from template" to apply.';

    showToast('Palette template loaded', 'info');
  }).catch(() => showToast('Could not read the image', 'error'));
}

function mapFromTemplate() {
  if (!templateImageItem) {
    showToast('Upload a palette template first', 'error');
    return;
  }
  const { imageData, width, height } = templateImageItem;
  const sampled = sampleTemplateImage(imageData, width, height);
  const locked = grid.getLockedColumns();
  let applied = 0;
  for (const [prop, hexInt] of Object.entries(sampled)) {
    if (locked.has(getColumnFromProp(prop))) continue;
    scheme[prop] = hexInt;
    applied++;
  }
  clearSchemeSelections();
  refreshAll({ recordHistory: true });

  const totalSlots = Object.keys(TEMPLATE_CELL_FRACTIONS).length;
  const statusEl = document.getElementById('template-status');
  if (statusEl) statusEl.textContent = `Template mapped: ${applied}/${totalSlots} colours applied.`;
  showToast('Palette loaded from the template', 'info');
}

function clearPaletteTemplate() {
  templateImageItem = null;
  const fnameEl = document.getElementById('template-fname');
  if (fnameEl) fnameEl.textContent = '';
  const statusEl = document.getElementById('template-status');
  if (statusEl) statusEl.textContent = '';
  const mapBtn = document.getElementById('btn-template-map');
  const clearBtn = document.getElementById('btn-template-clear');
  if (mapBtn) mapBtn.disabled = true;
  if (clearBtn) clearBtn.disabled = true;
  const fileInput = document.getElementById('template-file-input');
  if (fileInput) fileInput.value = '';
}

function _colorFromHexState(hex, prop) {
  const idx = COLOR_PROPS.indexOf(prop);
  if (idx === -1) return '#000000';
  const v = (hex || '').slice(idx * 6, idx * 6 + 6);
  return /^[0-9A-Fa-f]{6}$/.test(v) ? ('#' + v) : '#000000';
}

function _miniGridHtmlFromHex(hex) {
  const cells = [];
  for (const col of GRID_COLUMNS) {
    for (const row of GRID_ROWS) {
      if (gridCellsFor(col.id).has(row.suffix)) {
        cells.push(`<span class="history-mini-cell" style="background-color:${_colorFromHexState(hex, propName(col.id, row.suffix))}"></span>`);
      } else {
        cells.push('<span class="history-mini-cell empty"></span>');
      }
    }
  }
  return `<span class="history-mini">${cells.join('')}</span>`;
}

function _buildHistoryMiniGrid(hex) {
  const mini = document.createElement('div');
  mini.className = 'history-mini';

  for (const col of GRID_COLUMNS) {
    for (const row of GRID_ROWS) {
      const cell = document.createElement('span');
      cell.className = 'history-mini-cell';
      if (gridCellsFor(col.id).has(row.suffix)) {
        cell.style.backgroundColor = _colorFromHexState(hex, propName(col.id, row.suffix));
      } else {
        cell.classList.add('empty');
      }
      mini.appendChild(cell);
    }
  }

  return mini;
}

function _clearHistoryDebounce() {
  if (!historyDebounceTimer) return;
  clearTimeout(historyDebounceTimer);
  historyDebounceTimer = 0;
}

function _pushHistoryDebounced() {
  _clearHistoryDebounce();
  historyDebounceTimer = setTimeout(() => {
    historyDebounceTimer = 0;
    pushHistoryState();
  }, HISTORY_DEBOUNCE_MS);
}

function updateHistoryControls() {
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex < 0 || historyIndex >= historyStates.length - 1;
  if (historyDeleteBtn) historyDeleteBtn.disabled = historyIndex < 0 || historyStates.length <= 1;
}

function renderHistoryTimeline() {
  if (!historyStripEl) return;
  historyStripEl.innerHTML = '';

  for (let i = 0; i < historyStates.length; i++) {
    const stateBtn = document.createElement('button');
    stateBtn.type = 'button';
    stateBtn.className = 'history-state' + (i === historyIndex ? ' active' : '');
    stateBtn.setAttribute('role', 'listitem');
    stateBtn.title = `State ${i + 1} of ${historyStates.length}`;
    stateBtn.appendChild(_buildHistoryMiniGrid(historyStates[i]));
    stateBtn.addEventListener('click', () => setHistoryIndex(i));
    historyStripEl.appendChild(stateBtn);
  }

  const active = historyStripEl.querySelector('.history-state.active');
  if (historyIndex === 0) {
    historyStripEl.scrollLeft = 0;
  } else if (historyIndex === historyStates.length - 1) {
    historyStripEl.scrollLeft = historyStripEl.scrollWidth;
  } else if (active) {
    active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  updateHistoryControls();
}

function pushHistoryState() {
  const hex = scheme.toHexString();
  if (historyIndex >= 0 && historyStates[historyIndex] === hex) {
    renderHistoryTimeline();
    return;
  }

  if (historyIndex < historyStates.length - 1) {
    historyStates = historyStates.slice(0, historyIndex + 1);
  }

  historyStates.push(hex);
  historyIndex = historyStates.length - 1;

  if (historyStates.length > HISTORY_MAX_STATES) {
    const overflow = historyStates.length - HISTORY_MAX_STATES;
    historyStates.splice(0, overflow);
    historyIndex = Math.max(0, historyIndex - overflow);
  }

  renderHistoryTimeline();
}

function setHistoryIndex(nextIndex) {
  if (nextIndex < 0 || nextIndex >= historyStates.length || nextIndex === historyIndex) return;
  try {
    _clearHistoryDebounce();
    historyIndex = nextIndex;
    scheme.loadHexString(historyStates[historyIndex]);
    refreshAll();
    renderHistoryTimeline();
  } catch (e) {
    showToast('Failed to restore history state', 'error');
  }
}

function undoHistory() {
  if (historyIndex <= 0) return;
  _clearHistoryDebounce();
  setHistoryIndex(historyIndex - 1);
}

function redoHistory() {
  if (historyIndex < 0 || historyIndex >= historyStates.length - 1) return;
  _clearHistoryDebounce();
  setHistoryIndex(historyIndex + 1);
}

function deleteHistoryState(index = historyIndex) {
  if (index < 0 || index >= historyStates.length) return;
  if (historyStates.length <= 1) {
    showToast('Cannot delete the only history state', 'error');
    return;
  }

  _clearHistoryDebounce();
  historyStates.splice(index, 1);

  if (index < historyIndex) {
    historyIndex -= 1;
  } else if (index === historyIndex) {
    historyIndex = Math.min(historyIndex, historyStates.length - 1);
  }

  try {
    scheme.loadHexString(historyStates[historyIndex]);
    refreshAll();
  } catch (e) {
    showToast('Failed to restore history state', 'error');
  }
  renderHistoryTimeline();
  showToast('History state deleted', 'info');
}

function refreshAll({ recordHistory = false, debounceHistory = false } = {}) {
  grid.updateFromScheme(scheme);
  renderSpriteFromLabels();
  editor.setValue(format === 'xml' ? scheme.generateXML(activeColorProps()) : scheme.generateINI(activeColorProps()));
  const prop = grid.getActiveProp();
  if (prop) picker.setColor(scheme[prop]);
  if (recordHistory) {
    if (debounceHistory) _pushHistoryDebounced();
    else {
      _clearHistoryDebounce();
      pushHistoryState();
    }
  }
  else updateHistoryControls();
}

let tabs = [];
let activeTabId = null;
let _tabCounter = 0;

function _newTabId() { return 'tab-' + (++_tabCounter); }

function captureTabState() {
  return {
    format, scheme,
    historyStates, historyIndex,
    swapSelectionFirstCol, cellSwapSelectionFirstProp, clipboardColour, gradientSelectionFirstProp,
    activeSpriteType,
    spriteColors, spriteBaseImageData, spriteLabelArray, spriteBlackMask, spriteBlackDilateCache,
    spriteFillLabelArray, spriteSkinMask,
    spriteFrames, spriteFrameIndex, spriteAnimFPS, spriteAnimWasPlaying: spriteAnimPlaying,
    spriteIsSVG, spriteSVGShapes, spriteSVGLabelOf, spriteSVGExactMatchSet, spriteSVGGradientOf, spriteSVGSkinSet, spriteSVGExactCount,
    spriteSVGChildNodes: spriteIsSVG ? Array.from(document.getElementById('sprite-svg')?.childNodes || []) : null,
    spriteSVGViewBox: spriteIsSVG ? document.getElementById('sprite-svg')?.getAttribute('viewBox') : null,
    spriteZoom, spritePanX, spritePanY,
    lastSpriteColorsAnalysis: _lastSpriteColorsAnalysis,
    templateImageItem,
    templateFname: document.getElementById('template-fname')?.textContent || '',
  };
}

function makeBlankTabState() {
  const s = new ColorSchemeType();
  const seed = SEED_PALETTES_BY_TYPE['color'] || getActiveSeedColors();
  if (seed) for (const p of COLOR_PROPS) s[p] = seed[p];
  return {
    format: 'xml', scheme: s,
    historyStates: [s.toHexString()], historyIndex: 0,
    swapSelectionFirstCol: null, cellSwapSelectionFirstProp: null, clipboardColour: null, gradientSelectionFirstProp: null,
    activeSpriteType: 'color',
    spriteColors: [], spriteBaseImageData: null, spriteLabelArray: null, spriteBlackMask: null, spriteBlackDilateCache: null,
    spriteFillLabelArray: null, spriteSkinMask: null,
    spriteFrames: [], spriteFrameIndex: 0, spriteAnimFPS: 8, spriteAnimWasPlaying: false,
    spriteIsSVG: false, spriteSVGShapes: [], spriteSVGLabelOf: null, spriteSVGExactMatchSet: new Set(), spriteSVGGradientOf: null, spriteSVGSkinSet: null, spriteSVGExactCount: 0,
    spriteSVGChildNodes: null, spriteSVGViewBox: null,
    spriteZoom: 1, spritePanX: 0, spritePanY: 0,
    lastSpriteColorsAnalysis: [],
    templateImageItem: null,
    templateFname: '',
  };
}

function applyTabState(state) {
  format = state.format;
  scheme = state.scheme;
  historyStates = state.historyStates;
  historyIndex = state.historyIndex;
  _clearHistoryDebounce();
  swapSelectionFirstCol = state.swapSelectionFirstCol;
  cellSwapSelectionFirstProp = state.cellSwapSelectionFirstProp;
  clipboardColour = state.clipboardColour;
  gradientSelectionFirstProp = state.gradientSelectionFirstProp;
  clearSchemeSelections();

  activeSpriteType = state.activeSpriteType;
  if (grid) grid.rebuild();
  syncSpriteTypeSelectors();

  const _targetHasSprite = state.spriteIsSVG
    ? (state.spriteSVGShapes || []).length > 0
    : !!state.spriteBaseImageData;
  if (!_targetHasSprite) clearSprite();
  else _setMarkSkinMode(false);
  spriteColors = state.spriteColors;
  spriteBaseImageData = state.spriteBaseImageData;
  spriteLabelArray = state.spriteLabelArray;
  spriteBlackMask = state.spriteBlackMask;
  spriteBlackDilateCache = state.spriteBlackDilateCache;
  spriteFillLabelArray = state.spriteFillLabelArray;
  spriteSkinMask = state.spriteSkinMask;
  spriteFrames = state.spriteFrames || [];
  spriteFrameIndex = state.spriteFrameIndex || 0;
  spriteAnimFPS = state.spriteAnimFPS || 8;
  const animFpsSel = document.getElementById('sprite-anim-fps');
  if (animFpsSel) animFpsSel.value = String(spriteAnimFPS);
  spriteIsSVG = state.spriteIsSVG;
  spriteSVGShapes = state.spriteSVGShapes;
  spriteSVGLabelOf = state.spriteSVGLabelOf;
  spriteSVGExactMatchSet = state.spriteSVGExactMatchSet || new Set();
  spriteSVGGradientOf = state.spriteSVGGradientOf;
  spriteSVGSkinSet = state.spriteSVGSkinSet;
  spriteSVGExactCount = state.spriteSVGExactCount;
  spriteZoom = state.spriteZoom;
  spritePanX = state.spritePanX;
  spritePanY = state.spritePanY;
  _lastSpriteColorsAnalysis = state.lastSpriteColorsAnalysis;
  templateImageItem = state.templateImageItem;

  const hasSprite = spriteIsSVG ? spriteSVGShapes.length > 0 : !!spriteBaseImageData;
  if (hasSprite) {
    const previewEl = document.getElementById('sprite-preview');
    const canvas = document.getElementById('sprite-canvas');
    const svgEl = document.getElementById('sprite-svg');
    const emptyEl = document.getElementById('sprite-empty');
    if (previewEl) previewEl.classList.remove('is-empty');
    if (emptyEl) emptyEl.style.display = 'none';
    if (spriteIsSVG) {
      if (svgEl && state.spriteSVGChildNodes) {
        while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
        for (const node of state.spriteSVGChildNodes) svgEl.appendChild(node);
        if (state.spriteSVGViewBox) svgEl.setAttribute('viewBox', state.spriteSVGViewBox);
      }
      if (svgEl) svgEl.style.display = 'block';
      if (canvas) canvas.style.display = 'none';
    } else {
      if (canvas) canvas.style.display = 'block';
      if (svgEl) svgEl.style.display = 'none';
    }
    const recolorBtn = document.getElementById('btn-sprite-recolor-upload');
    const clearBtn = document.getElementById('btn-sprite-clear');
    const dlSvgBtn = document.getElementById('btn-sprite-download-svg');
    const copyPngBtn = document.getElementById('btn-sprite-copy-png');
    if (recolorBtn) recolorBtn.disabled = spriteIsSVG ? spriteSVGShapes.length === 0 : !spriteLabelArray;
    if (clearBtn) clearBtn.disabled = false;
    if (dlSvgBtn) { dlSvgBtn.style.display = spriteIsSVG ? '' : 'none'; dlSvgBtn.disabled = !spriteIsSVG || spriteSVGShapes.length === 0; }
    if (copyPngBtn) copyPngBtn.disabled = false;
    _setSpriteMarkSkinButtonsEnabled(true);
    _setSpriteZoomControlsEnabled(true);
    if (spriteFrames.length > 1) {
      _setSpriteAnimControlsVisible(true);
      const frameEl = document.getElementById('sprite-anim-frame');
      if (frameEl) frameEl.textContent = `${spriteFrameIndex + 1}/${spriteFrames.length}`;
      _updateSpriteAnimPlayButton();
      if (state.spriteAnimWasPlaying) _startSpriteAnimation();
      else renderSpriteFromLabels();
    } else {
      _setSpriteAnimControlsVisible(false);
      renderSpriteFromLabels();
    }
  }
  _applySpriteZoomTransform();

  const mapBtn = document.getElementById('btn-template-map');
  const clearTplBtn = document.getElementById('btn-template-clear');
  if (mapBtn) mapBtn.disabled = !templateImageItem;
  if (clearTplBtn) clearTplBtn.disabled = !templateImageItem;
  const fnameEl = document.getElementById('template-fname');
  if (fnameEl) fnameEl.textContent = state.templateFname || '';

  refreshAll();
  renderHistoryTimeline();
}

function initTabsUI() {
  const firstId = _newTabId();
  tabs = [{ id: firstId, name: 'Tab 1', state: captureTabState() }];
  activeTabId = firstId;
  renderTabsBar();
}

function renderTabsBar() {
  const bar = document.getElementById('tabs-bar');
  if (!bar) return;
  bar.innerHTML = '';

  tabs.forEach((tab) => {
    const el = document.createElement('div');
    el.className = 'app-tab' + (tab.id === activeTabId ? ' active' : '');
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-selected', tab.id === activeTabId ? 'true' : 'false');
    el.title = tab.name;

    const nameEl = document.createElement('span');
    nameEl.className = 'app-tab-name';
    nameEl.textContent = tab.name;
    nameEl.addEventListener('dblclick', (e) => { e.stopPropagation(); renameTab(tab.id); });
    el.appendChild(nameEl);

    if (tabs.length > 1) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'app-tab-close';
      closeBtn.setAttribute('aria-label', `Close ${tab.name}`);
      closeBtn.textContent = '\u00d7';
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeTab(tab.id); });
      el.appendChild(closeBtn);
    }

    el.addEventListener('click', () => switchTab(tab.id));
    bar.appendChild(el);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'app-tab-add';
  addBtn.setAttribute('aria-label', 'New tab');
  addBtn.title = 'New tab (independent colours, sprite, and signature)';
  addBtn.textContent = '+';
  addBtn.addEventListener('click', () => addTab());
  bar.appendChild(addBtn);
}

function switchTab(id) {
  if (id === activeTabId) return;
  _pauseSpriteAnimation();
  const current = tabs.find((t) => t.id === activeTabId);
  if (current) current.state = captureTabState();
  const target = tabs.find((t) => t.id === id);
  if (!target) return;
  activeTabId = id;
  applyTabState(target.state);
  renderTabsBar();
}

function addTab() {
  _pauseSpriteAnimation();
  const current = tabs.find((t) => t.id === activeTabId);
  if (current) current.state = captureTabState();
  const id = _newTabId();
  const tab = { id, name: `Tab ${tabs.length + 1}`, state: makeBlankTabState() };
  tabs.push(tab);
  activeTabId = id;
  applyTabState(tab.state);
  renderTabsBar();
  showToast('New tab created', 'info');
}

function closeTab(id) {
  if (tabs.length <= 1) return;
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const wasActive = id === activeTabId;
  tabs.splice(idx, 1);
  if (wasActive) {
    const next = tabs[Math.max(0, idx - 1)];
    activeTabId = next.id;
    applyTabState(next.state);
  }
  renderTabsBar();
}

function renameTab(id) {
  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;
  const name = prompt('Tab name:', tab.name);
  if (name && name.trim()) {
    tab.name = name.trim().slice(0, 24);
    renderTabsBar();
  }
}

function applyTheme(t) {
  theme = t;
  document.documentElement.dataset.theme = t;
  localStorage.setItem('theme', t);

  const darkToggle = document.getElementById('customize-dark-toggle');
  if (darkToggle) darkToggle.checked = (t === 'dark');
  if (editor) editor.setTheme(t);
  if (picker) picker.setTheme(t);
}

// "Reduced effects": toggles body.fx-less (styles.css) to tone down glow, neon line, shadows and looping animations.
function applyFxLess(on) {
  document.body.classList.toggle('fx-less', !!on);
  const cb = document.getElementById('customize-fxless-toggle');
  if (cb) cb.checked = !!on;
}

function applyCustomBackground(dataUrl) {
  const preview = document.getElementById('customize-bg-preview');
  if (dataUrl) {
    document.documentElement.style.setProperty('--custom-bg-image', `url("${dataUrl}")`);
    document.body.classList.add('has-custom-bg');
    if (preview) preview.style.backgroundImage = `url("${dataUrl}")`;
  } else {
    document.documentElement.style.removeProperty('--custom-bg-image');
    document.body.classList.remove('has-custom-bg');
    if (preview) preview.style.backgroundImage = 'none';
  }
}

function saveCustomBackground(dataUrl) {
  try {
    if (dataUrl) localStorage.setItem(CUSTOM_BG_LS_KEY, dataUrl);
    else localStorage.removeItem(CUSTOM_BG_LS_KEY);
  } catch (e) {
    showToast("Couldn't save that image (too large for storage)", 'error');
  }
}

function applyCustomTextColor(hex) {
  const colorInput = document.getElementById('customize-text-color');
  if (hex) {
    document.documentElement.style.setProperty('--text', hex);
    document.documentElement.style.setProperty('--text-1', hex);
    if (colorInput) colorInput.value = hex;
  } else {
    document.documentElement.style.removeProperty('--text');
    document.documentElement.style.removeProperty('--text-1');
  }
}

function saveCustomTextColor(hex) {
  if (hex) localStorage.setItem(CUSTOM_TEXT_LS_KEY, hex);
  else localStorage.removeItem(CUSTOM_TEXT_LS_KEY);
}

// Second text colour: drives the 2-colour gradient of the UI effects (--text-2 in styles.css).
// Both colours are always applied (colour 2 falls back to TEXT2_DEFAULT_HEX).
const TEXT2_DEFAULT_HEX = '#4aa8ff';

function setupTextColor2Control() {
  const first = document.getElementById('customize-text-color');
  let input = document.getElementById('customize-text-color-2');
  if (!input) {
    if (!first) return;
    input = document.createElement('input');
    input.type = 'color';
    input.id = 'customize-text-color-2';
    input.value = TEXT2_DEFAULT_HEX;
    input.title = 'Colour 2';
    input.setAttribute('aria-label', 'Text colour 2');
    first.insertAdjacentElement('afterend', input);
  }
  if (input.dataset.bound) return;
  input.dataset.bound = '1';
  input.addEventListener('input', (e) => {
    applyCustomTextColor2(e.target.value);
    saveCustomTextColor2(e.target.value);
  });
}

function applyCustomTextColor2(hex) {
  const value = hex || TEXT2_DEFAULT_HEX;
  const colorInput = document.getElementById('customize-text-color-2');
  document.documentElement.style.setProperty('--text-2', value);
  if (colorInput) colorInput.value = value;
}

function saveCustomTextColor2(hex) {
  if (hex) localStorage.setItem(CUSTOM_TEXT2_LS_KEY, hex);
  else localStorage.removeItem(CUSTOM_TEXT2_LS_KEY);
}

function applyCustomFont(stack) {
  const select = document.getElementById('customize-font-select');
  if (stack) {
    document.documentElement.style.setProperty('--app-font', stack);
    if (select) select.value = stack;
  } else {
    document.documentElement.style.removeProperty('--app-font');
    if (select) select.value = '';
  }
}

function saveCustomFont(stack) {
  if (stack) localStorage.setItem(CUSTOM_FONT_LS_KEY, stack);
  else localStorage.removeItem(CUSTOM_FONT_LS_KEY);
}

function openCustomizeModal() {
  document.getElementById('customize-modal').classList.add('open');
}

function closeCustomizeModal() {
  document.getElementById('customize-modal').classList.remove('open');
}

async function loadGameSchemes() {
  try {
    const xmlText = EMBEDDED_COLOR_SCHEME_XML;
    const tsvText = EMBEDDED_STRING_TABLE_TSV;

    for (const line of tsvText.split('\n').slice(1)) {
      const cols = line.split('\t');
      if (cols.length >= 2) stringTable[cols[0].trim()] = cols[1].trim();
    }

    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    const nodes = doc.getElementsByTagName('ColorSchemeType');
    const SKIP = new Set(['Template', 'NO_COLOR_SCHEME']);
    for (const node of nodes) {
      const name = node.getAttribute('ColorSchemeName') || '';
      if (SKIP.has(name)) continue;
      const gs = new GameColorSchemeType();
      gs.loadFullXML(new XMLSerializer().serializeToString(node), name);
      gameSchemes.push(gs);
    }

    const PUSHBYTE_ORDER = {
      Blue: 1, Yellow: 2, Green: 3, Brown: 4, Purple: 5, Orange: 6, Cyan: 7,
      Sunset: 8, Grey: 9, Pink: 10, Red: 11, Valhallentines: 12,
      Valhallentines2: 13, StPaddy: 14, StPaddy2: 15, Spring: 16,
      GameFuel: 18, '100Mil': 19, Bifrost: 20, ArtDeco: 21, Summer: 23,
      Summer2: 24, HomeTeam: 25, HomeTeamReunion: 26, Brawlhalloween: 27,
      Brawlhalloween2: 28, Anniversary: 29, Holiday: 30, HolidayJolly: 31,
      BattlePass01: 32, BattlePass02: 33, BattlePass03: 34, OEL1: 35,
      Space: 36, BP6: 37, BP7: 38, BP8: 39, BP9: 40, BP10: 41, BP11: 42,
      BP12: 43, Dragonfire: 44, StainedGlass: 45, White: 46, Black: 47,
      Ranked: 48, Ranked2: 49, Crystalforged: 50, EsportDigital: 51,
      CMYK: 52, Blacklight: 53, CommunityColors: 54, CommunityColors2: 55,
      Esport: 56, EsportRed: 57, EsportElectric: 58, EsportPink: 59,
      EsportHelios: 60, EsportSeafoam: 61, EsportV7: 62, Guild: 63,
    };
    const pushbyteOf = (g) => PUSHBYTE_ORDER[g.ColorSchemeName] ?? (1000 + g.OrderID);
    const standard = gameSchemes.filter(g => g.TeamColor === 0);
    const team     = gameSchemes.filter(g => g.TeamColor > 0);
    standard.sort((a, b) => pushbyteOf(a) - pushbyteOf(b));
    team.sort((a, b) => a.ColorSchemeID - b.ColorSchemeID);

    const mapItems = (arr) => arr.map(gs => ({
      value: gs.DisplayNameKey,
      label: stringTable[gs.DisplayNameKey] || gs.DisplayNameKey.replace(/ColorSchemeType_|_DisplayName/g, ' ').trim(),
      iconHtml: _miniGridHtmlFromHex(gs.toHexString()),
    }));
    gameDD.setItems([
      { label: 'Standard Colour Schemes', items: mapItems(standard) },
      ...(team.length ? [{ label: 'Team Colour Schemes', items: mapItems(team) }] : []),
    ]);
  } catch (err) {
    showToast('Failed to load game colour schemes', 'error');
    console.error(err);
  }
}

function randomise() {
  clearSchemeSelections();
  const locked = grid.getLockedColumns();
  for (const col of GRID_COLUMNS) {
    if (locked.has(col.id)) continue;
    const baseProp = propName(col.id, '');
    scheme[baseProp] = randomColour();
    for (const suffix of gridCellsFor(col.id)) {
      if (suffix === '') continue;
      const shade = SHADE_MAP[suffix];
      scheme[propName(col.id, suffix)] = shadeColour(scheme[baseProp], shade);
    }
  }
  refreshAll({ recordHistory: true });
  showToast('Randomised colours', 'info');
}

function autoShade() {
  const colId = _requireSelectedColId();
  if (!colId) return;

  const activeProp = grid.getActiveProp();
  const seedSuffix = activeProp ? getShadeFromProp(activeProp) : '';
  const seedShade = SHADE_MAP[seedSuffix] ?? 0;
  const seedColour = scheme[propName(colId, seedSuffix)] ?? scheme[propName(colId, '')];

  const seedHsv = rgbToHsv((seedColour >> 16) & 0xFF, (seedColour >> 8) & 0xFF, seedColour & 0xFF);
  const valMul = [0.5, Math.SQRT2 / 2, 1, Math.SQRT2, 2].map(_scaleShadeMul);
  const seedMul = (seedShade === 3) ? 1 : valMul[seedShade + 2];
  const impliedBaseV = Math.min(seedMul ? seedHsv[2] / seedMul : seedHsv[2], 255);
  const [ibR, ibG, ibB] = hsvToRgb(seedHsv[0], seedHsv[1], impliedBaseV);
  const impliedBase = (ibR << 16) | (ibG << 8) | ibB;

  clearSchemeSelections();
  for (const suffix of gridCellsFor(colId)) {
    if (suffix === seedSuffix) continue;
    scheme[propName(colId, suffix)] = shadeColour(impliedBase, SHADE_MAP[suffix]);
  }
  refreshAll({ recordHistory: true });
  const seedLabel = GRID_ROWS.find(r => r.suffix === seedSuffix)?.label || 'Base';
  showToast(`Auto-shaded from ${seedLabel.replace('\u00A0', ' ')} — ${_columnLabel(colId).replace('\u00A0', ' ')}`, 'info');
}

function smartShadeColour(colour, shade, refHue) {
  if (shade === 0) return colour;
  const hsv = rgbToHsv((colour >> 16) & 0xFF, (colour >> 8) & 0xFF, colour & 0xFF);
  const MIN_SAT = 55;
  const isNeutral = hsv[1] < 8;

  if (shade === 3) {
    if (isNeutral) {
      const [s2, v2] = clampToShadeBand(3, 0, Math.max(hsv[2], 128));
      const rgb = hsvToRgb(0, s2, v2);
      return (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) ? BLACK_FALLBACK : (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
    }
    const accHue = (refHue + Math.floor(Math.random() * 60) - 30 + 360) % 360;
    let [accS, accV] = clampToShadeBand(3, Math.max(hsv[1], 200), Math.max(hsv[2], 160));
    const [r, g, b] = hsvToRgb(accHue, accS, accV);
    return (r === 0 && g === 0 && b === 0) ? BLACK_FALLBACK : (r << 16) | (g << 8) | b;
  }

  const satMul = [2, Math.SQRT2, 1, Math.SQRT2 / 2, 0.5].map(_scaleShadeMul);
  const valMul = [0.5, Math.SQRT2 / 2, 1, Math.SQRT2, 2].map(_scaleShadeMul);
  let h = (hsv[0] > 180 || hsv[0] === 0) ? (hsv[0] - 3 * shade) % 360 : (hsv[0] + 3 * shade) % 360;
  let s = hsv[1] * satMul[shade + 2];
  let v = Math.min(hsv[2] * valMul[shade + 2], 255);
  if (h < 0) h += 360;
  s = Math.min(s, 255);

  if (isNeutral) {
    s = 0;
    const band = SHADE_BANDS[SUFFIX_BY_SHADE[shade]];
    if (band) {
      if (band.valMax !== undefined) v = Math.min(v, band.valMax);
      if (band.valMin !== undefined) v = Math.max(v, band.valMin);
    }
  } else {
    if (s < MIN_SAT) {
      h = refHue;
      s = MIN_SAT;
    }
    [s, v] = clampToShadeBand(shade, s, v);
  }

  const rgb = hsvToRgb(h, s, v);
  return (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) ? BLACK_FALLBACK : (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
}

function _dominantSpriteHue() {
  if (!spriteColors.length) return null;
  let best = null;
  for (const c of spriteColors) {
    const [h, s] = rgbToHsv(c.r, c.g, c.b);
    if (s < 40) continue;
    if (!best || c.count > best.count) best = { h, count: c.count };
  }
  return best ? best.h : null;
}

function _paletteDominantHue(excludeColId) {
  let sinSum = 0, cosSum = 0, wSum = 0;
  for (const col of GRID_COLUMNS) {
    if (col.id === excludeColId) continue;
    const base = scheme[propName(col.id, '')];
    const [h, s] = rgbToHsv((base >> 16) & 0xFF, (base >> 8) & 0xFF, base & 0xFF);
    if (s < 40) continue;
    sinSum += Math.sin(h * Math.PI / 180) * s;
    cosSum += Math.cos(h * Math.PI / 180) * s;
    wSum += s;
  }
  if (wSum === 0) return null;
  return ((Math.atan2(sinSum, cosSum) * 180 / Math.PI) + 360) % 360;
}

function smartFillRow(colId, seedColour) {
  const [seedHue, seedSat] = rgbToHsv((seedColour >> 16) & 0xFF, (seedColour >> 8) & 0xFF, seedColour & 0xFF);
  const SAT_THRESHOLD = 40;
  const refHue = seedSat >= SAT_THRESHOLD
    ? seedHue
    : (_dominantSpriteHue() ?? _paletteDominantHue(colId) ?? seedHue);

  clearSchemeSelections();
  scheme[propName(colId, '')] = seedColour;
  for (const suffix of gridCellsFor(colId)) {
    if (suffix === '') continue;
    scheme[propName(colId, suffix)] = smartShadeColour(seedColour, SHADE_MAP[suffix], refHue);
  }
  refreshAll({ recordHistory: true });
  const col = GRID_COLUMNS.find(c => c.id === colId);
  showToast(`Fila "${col ? col.label.replace('\u00A0', ' ') : colId}" coloreada en degradado`, 'info');
}

function metallicShadeColour(seedColour, shade, refHue) {
  if (shade === 0) return seedColour;
  const hsv = rgbToHsv((seedColour >> 16) & 0xFF, (seedColour >> 8) & 0xFF, seedColour & 0xFF);
  const isNeutral = hsv[1] < 8;
  const hue = isNeutral ? 0 : refHue;

  if (shade === 3) {
    if (isNeutral) {
      const [s2, v2] = clampToShadeBand(3, 0, 255);
      const rgb = hsvToRgb(0, s2, v2);
      return (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) ? BLACK_FALLBACK : (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
    }
    let [accS, accV] = clampToShadeBand(3, Math.max(hsv[1], 220), 255);
    const [r, g, b] = hsvToRgb(refHue, accS, accV);
    return (r === 0 && g === 0 && b === 0) ? BLACK_FALLBACK : (r << 16) | (g << 8) | b;
  }

  const metalSatMul = [1.3, 1.05, 1, 0.35, 0.08].map(_scaleShadeMul);
  const metalValMul = [0.35, 0.7, 1, 1.55, 2.3].map(_scaleShadeMul);
  const idx = shade + 2;
  let s = isNeutral ? 0 : Math.min(hsv[1] * metalSatMul[idx], 255);
  let v = Math.min(hsv[2] * metalValMul[idx], 255);
  if (isNeutral) {
    const band = SHADE_BANDS[SUFFIX_BY_SHADE[shade]];
    if (band) {
      if (band.valMax !== undefined) v = Math.min(v, band.valMax);
      if (band.valMin !== undefined) v = Math.max(v, band.valMin);
    }
  } else {
    [s, v] = clampToShadeBand(shade, s, v);
  }

  const rgb = hsvToRgb(hue, s, v);
  return (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) ? BLACK_FALLBACK : (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
}

function metallicFillRow(colId, seedColour) {
  const [refHue] = rgbToHsv((seedColour >> 16) & 0xFF, (seedColour >> 8) & 0xFF, seedColour & 0xFF);

  clearSchemeSelections();
  scheme[propName(colId, '')] = seedColour;
  for (const suffix of gridCellsFor(colId)) {
    if (suffix === '') continue;
    scheme[propName(colId, suffix)] = metallicShadeColour(seedColour, SHADE_MAP[suffix], refHue);
  }
  refreshAll({ recordHistory: true });
  const col = GRID_COLUMNS.find(c => c.id === colId);
  showToast(`Fila "${col ? col.label.replace('\u00A0', ' ') : colId}" in metallic`, 'info');
}

const TINT_SAT_TARGET = { VL: 40, Lt: 110, '': 140, Dk: 150, VD: 180, Acc: 225 };
function tintColumnHue(colId, targetHue) {
  clearSchemeSelections();
  for (const suffix of gridCellsFor(colId)) {
    const prop = propName(colId, suffix);
    const c = scheme[prop];
    const hsv = rgbToHsv((c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF);
    let s = TINT_SAT_TARGET[suffix] ?? 140;
    let v = hsv[2];
    [s, v] = clampToShadeBand(SHADE_MAP[suffix], s, v);
    const rgb = hsvToRgb(targetHue, s, v);
    scheme[prop] = (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0)
      ? BLACK_FALLBACK
      : (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
  }
  refreshAll({ recordHistory: true });
  const col = GRID_COLUMNS.find(c => c.id === colId);
  showToast(`Tinted "${col ? col.label.replace('\u00A0', ' ') : colId}" row`, 'info');
}

function shiftColumnHue(colId, deltaH) {
  clearSchemeSelections();
  for (const suffix of gridCellsFor(colId)) {
    const prop = propName(colId, suffix);
    const c = scheme[prop];
    const hsv = rgbToHsv((c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF);
    let h = (hsv[0] + deltaH) % 360;
    if (h < 0) h += 360;
    let [s, v] = clampToShadeBand(SHADE_MAP[suffix], hsv[1], hsv[2]);
    const rgb = hsvToRgb(h, s, v);
    scheme[prop] = (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0)
      ? BLACK_FALLBACK
      : (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
  }
  refreshAll({ recordHistory: true });
  const col = GRID_COLUMNS.find(c => c.id === colId);
  showToast(`Shifted "${col ? col.label.replace('\u00A0', ' ') : colId}" row hue ${deltaH > 0 ? '+' : ''}${deltaH}°`, 'info');
}

function darkenColumn(colId, deltaV) {
  clearSchemeSelections();
  const scaledDeltaV = deltaV * shadeIntensity * 2.55;
  for (const suffix of gridCellsFor(colId)) {
    const prop = propName(colId, suffix);
    const c = scheme[prop];
    const hsv = rgbToHsv((c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF);
    const v = Math.max(0, Math.min(255, hsv[2] + scaledDeltaV));
    const rgb = hsvToRgb(hsv[0], hsv[1], v);
    scheme[prop] = (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0)
      ? BLACK_FALLBACK
      : (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
  }
  refreshAll({ recordHistory: true });
  const col = GRID_COLUMNS.find(c => c.id === colId);
  const label = col ? col.label.replace('\u00A0', ' ') : colId;
  showToast(`${scaledDeltaV < 0 ? 'Darkened' : 'Lightened'} "${label}" row`, 'info');
}

function _applyEffect(fn, label) {
  clearSchemeSelections();
  const locked = grid.getLockedColumns();
  for (const p of COLOR_PROPS) {
    if (locked.has(getColumnFromProp(p))) continue;
    scheme[p] = fn(scheme[p]);
  }
  refreshAll({ recordHistory: true });
  showToast(label, 'info');
}

function effectInvert() {
  clearSchemeSelections();
  const locked = grid.getLockedColumns();
  const next = {};

  for (const col of GRID_COLUMNS) {
    if (locked.has(col.id)) continue;

    const shades = ['VL', 'Lt', '', 'Dk', 'VD'].filter(s => gridCellsFor(col.id).has(s));
    for (let i = 0; i < shades.length; i++) {
      const target = propName(col.id, shades[i]);
      const source = propName(col.id, shades[shades.length - 1 - i]);
      next[target] = invertColour(scheme[source]);
    }

    if (gridCellsFor(col.id).has('Acc')) {
      const acc = propName(col.id, 'Acc');
      next[acc] = invertColour(scheme[acc]);
    }
  }

  for (const [p, v] of Object.entries(next)) scheme[p] = v;
  refreshAll({ recordHistory: true });
  showToast('Inverted colours', 'info');
}

function effectDesaturate() {
  _applyEffect(desaturateColour, 'Desaturated to greyscale');
}

function effectDesaturateColumn(colId) {
  clearSchemeSelections();
  for (const suffix of gridCellsFor(colId)) {
    const prop = propName(colId, suffix);
    scheme[prop] = desaturateColour(scheme[prop]);
  }
  refreshAll({ recordHistory: true });
  const col = GRID_COLUMNS.find(c => c.id === colId);
  showToast(`Desaturated "${col ? col.label.replace('\u00A0', ' ') : colId}" to greyscale`, 'info');
}

const CVD_SIM_MATRICES = {
  protanopia:    [0.567, 0.433, 0.000,  0.558, 0.442, 0.000,  0.000, 0.242, 0.758],
  deuteranopia:  [0.625, 0.375, 0.000,  0.700, 0.300, 0.000,  0.000, 0.300, 0.700],
  tritanopia:    [0.950, 0.050, 0.000,  0.000, 0.433, 0.567,  0.000, 0.475, 0.525],
};

const CVD_CORRECTION_MATRICES = {
  protanopia:   [0, 0, 0,  0.7, 1, 0,  0.7, 0, 1],
  deuteranopia: [0, 0, 0,  0.7, 1, 0,  0.7, 0, 1],
  tritanopia:   [1, 0, 0.7,  0, 1, 0.7,  0, 0, 0],
};

const CVD_LABELS = {
  protanopia:    'Protanopia',
  deuteranopia:  'Deuteranopia',
  tritanopia:    'Tritanopia',
  achromatopsia: 'Achromatopsia',
};

function _applyMatrix3(m, r, g, b) {
  return [
    m[0] * r + m[1] * g + m[2] * b,
    m[3] * r + m[4] * g + m[5] * b,
    m[6] * r + m[7] * g + m[8] * b,
  ];
}

function daltonizeColour(c, mode) {
  const r = (c >> 16) & 0xFF, g = (c >> 8) & 0xFF, b = c & 0xFF;

  if (mode === 'achromatopsia') {
    const [h, s, v] = rgbToHsv(r, g, b);
    const stretched = Math.max(0, Math.min(255, 127.5 + (v - 127.5) * 1.6));
    const [nr, ng, nb] = hsvToRgb(h, s, stretched);
    return (nr === 0 && ng === 0 && nb === 0) ? BLACK_FALLBACK : (nr << 16) + (ng << 8) + nb;
  }

  const simM = CVD_SIM_MATRICES[mode];
  const corrM = CVD_CORRECTION_MATRICES[mode];
  if (!simM || !corrM) return c;

  const [sr, sg, sb] = _applyMatrix3(simM, r, g, b);
  const errR = r - sr, errG = g - sg, errB = b - sb;
  const [dr, dg, db] = _applyMatrix3(corrM, errR, errG, errB);

  const nr = Math.max(0, Math.min(255, Math.round(r + dr)));
  const ng = Math.max(0, Math.min(255, Math.round(g + dg)));
  const nb = Math.max(0, Math.min(255, Math.round(b + db)));
  return (nr === 0 && ng === 0 && nb === 0) ? BLACK_FALLBACK : (nr << 16) + (ng << 8) + nb;
}

function effectColorblind(mode) {
  if (!CVD_LABELS[mode]) return;
  _applyEffect((c) => daltonizeColour(c, mode), `Applied ${CVD_LABELS[mode]} colour correction`);
}

function share() {
  const hexStr = scheme.toHexString();
  const base = window.location.origin + window.location.pathname;
  const url  = `${base}?colour=${encodeURIComponent(btoa(hexStr))}`;
  navigator.clipboard.writeText(url)
    .then(() => showToast('Share link copied!', 'info'))
    .catch(() => showToast('Failed to copy link', 'error'));
}

function copyEditor() {
  navigator.clipboard.writeText(editor.getValue())
    .then(() => showToast('Copied to clipboard', 'info'))
    .catch(() => showToast('Failed to copy', 'error'));
}

function promptFilename(defaultBase, ext) {
  const input = window.prompt('File name:', defaultBase);
  if (input === null) return null;
  let base = input.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\.+$/, '');
  if (!base) base = defaultBase;
  const suffix = '.' + ext;
  return base.toLowerCase().endsWith(suffix.toLowerCase()) ? base : base + suffix;
}

function downloadFile() {
  const filename = promptFilename('ColourScheme', 'svg');
  if (!filename) return;
  const blob = new Blob([scheme.generateSVG()], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('File installed', 'info');
}

function importSchemeFile(file) {
  const name = (file.name || '').toLowerCase();
  const isSvg = name.endsWith('.svg') || file.type === 'image/svg+xml';
  const isImage = !isSvg && (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/.test(name));

  if (isImage) {
    _readImageFile(file).then((img) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const tctx = canvas.getContext('2d');
      tctx.imageSmoothingEnabled = false;
      tctx.drawImage(img, 0, 0);
      const imageData = tctx.getImageData(0, 0, canvas.width, canvas.height);

      const sampled = sampleTemplateImage(imageData, canvas.width, canvas.height);
      const locked = grid.getLockedColumns();
      let applied = 0;
      for (const [prop, hexInt] of Object.entries(sampled)) {
        if (locked.has(getColumnFromProp(prop))) continue;
        scheme[prop] = hexInt;
        applied++;
      }
      const totalSlots = Object.keys(TEMPLATE_CELL_FRACTIONS).length;
      if (!applied) {
        showToast('No colours could be sampled from that image — is it a palette template PNG?', 'error');
        return;
      }
      clearSchemeSelections();
      refreshAll({ recordHistory: true });
      showToast(`Imported "${file.name}" (${applied}/${totalSlots} colours mapped)`, 'info');
    }).catch(() => showToast('Could not read the image', 'error'));
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = String(e.target.result || '');
    const locked = grid.getLockedColumns();
    try {
      if (name.endsWith('.svg') || /<svg[\s>]/i.test(text)) {
        scheme.loadSVG(text, locked);
      } else if (name.endsWith('.json') || /^\s*[{[]/.test(text)) {
        scheme.loadJSON(text, locked);
      } else if (name.endsWith('.xml') || /<ColorSchemeType[\s>]/.test(text)) {
        scheme.loadXML(text, locked);
      } else if (/pushuint\s+\d+/.test(text) && /\bnewarray\b/.test(text)) {
        scheme.loadPcode(text, locked);
      } else {
        scheme.loadINI(text, locked);
      }
      refreshAll({ recordHistory: true });
      showToast(`Imported "${file.name}"`, 'info');
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'error');
    }
  };
  reader.onerror = () => showToast('Could not read file', 'error');
  reader.readAsText(file);
}

function downloadXMLFile() {
  const filename = promptFilename('ColourScheme', 'xml');
  if (!filename) return;
  const blob = new Blob([scheme.generateXML(activeColorProps())], { type: 'application/xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('XML exported', 'info');
}

function downloadWcolorFile() {
  const filename = promptFilename('ColourScheme', 'wcolor');
  if (!filename) return;
  const blob = new Blob([scheme.generateINI(activeColorProps())], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('.wcolor exported', 'info');
}

const FALLBACK_PUSHBYTE_OPTIONS = [
  { pushbyte: 32, name: 'Soul Fire' },
  { pushbyte: 33, name: 'Synthwave' },
];

function isDesktopApp() {
  return !!(window.pywebview && window.pywebview.api && window.pywebview.api.install_scheme);
}

function getActiveProfile() {
  const toggle = document.getElementById('gamebanana-profile-toggle');
  return (toggle && toggle.checked) ? 'gamebanana' : null;
}

async function populateInstallTargetSelect() {
  const select = document.getElementById('install-target-select');
  const wrap = document.getElementById('install-actions');
  if (!select || !wrap) return;
  if (!isDesktopApp()) return;

  let options = FALLBACK_PUSHBYTE_OPTIONS;
  try {
    options = await window.pywebview.api.get_pushbyte_options();
  } catch (e) {  }

  let teamOptions = [];
  try {
    teamOptions = await window.pywebview.api.get_team_slot_options();
  } catch (e) {  }

  select.innerHTML = '';
  options.forEach(({ pushbyte, name }) => {
    const opt = document.createElement('option');
    opt.value = String(pushbyte);
    opt.textContent = `${pushbyte}. ${name}`;
    select.appendChild(opt);
  });

  if (teamOptions.length) {
    const group = document.createElement('optgroup');
    group.label = 'Team Colours';
    teamOptions.forEach(({ slot, label }) => {
      const opt = document.createElement('option');
      opt.value = `team:${slot}`;
      opt.textContent = label;
      group.appendChild(opt);
    });
    select.appendChild(group);
  }

  wrap.style.display = '';

  const openFolderBtn = document.getElementById('btn-open-gamebanana-folder');
  const toggle = document.getElementById('gamebanana-profile-toggle');
  if (openFolderBtn && toggle && !toggle.dataset.wired) {
    toggle.dataset.wired = '1';
    toggle.addEventListener('change', () => {
      openFolderBtn.style.display = toggle.checked ? '' : 'none';
      populateUninstallTargetSelect();
    });
    openFolderBtn.style.display = toggle.checked ? '' : 'none';
    openFolderBtn.addEventListener('click', async () => {
      try {
        await window.pywebview.api.open_gamebanana_build_folder();
      } catch (e) {
        showToast(`Could not open the folder: ${e.message || e}`, 'error');
      }
    });
  }
}

async function installToBrawlhalla() {
  if (!isDesktopApp()) {
    showToast('Install only works from the Azu Modification desktop app', 'error');
    return;
  }
  const select = document.getElementById('install-target-select');
  const rawValue = select ? select.value : '';
  if (!rawValue) {
    showToast('Pick which existing colour this replaces first', 'error');
    return;
  }
  const isTeamSlot = rawValue.startsWith('team:');
  const teamSlot = isTeamSlot ? rawValue.slice(5) : null;
  const pushbyteNum = isTeamSlot ? null : parseInt(rawValue, 10);
  if (!isTeamSlot && !pushbyteNum) {
    showToast('Pick which existing colour this replaces first', 'error');
    return;
  }
  const defaultName = scheme.ColorSchemeName || 'ColourScheme';
  const name = window.prompt('Scheme name:', defaultName);
  if (!name) return;

  const profile = getActiveProfile();
  showToast(
    profile === 'gamebanana'
      ? `Installing "${name}" en el build de GameBanana… this can take a moment`
      : `Installing "${name}"… this can take a moment`,
    'info'
  );
  try {
    const xmlText = scheme.generateXML();
    const result = isTeamSlot
      ? await window.pywebview.api.install_team_scheme(
          xmlText, name.trim(), teamSlot, true, null, null, profile
        )
      : await window.pywebview.api.install_scheme(
          xmlText, name.trim(), pushbyteNum, true, null, null, profile
        );
    showToast(result.message, result.success ? 'info' : 'error');
    populateUninstallTargetSelect();
  } catch (e) {
    showToast(`Install failed: ${e.message || e}`, 'error');
  }
}

function isUninstallCapable() {
  return !!(window.pywebview && window.pywebview.api && window.pywebview.api.uninstall_scheme);
}

async function populateUninstallTargetSelect() {
  const select = document.getElementById('uninstall-target-select');
  const wrap = document.getElementById('uninstall-actions');
  if (!select || !wrap) return;
  if (!isUninstallCapable()) return;

  let schemes = [];
  try {
    schemes = await window.pywebview.api.list_installed_schemes(getActiveProfile());
  } catch (e) {  }

  let teamSchemes = [];
  try {
    teamSchemes = await window.pywebview.api.list_installed_team_schemes(getActiveProfile());
  } catch (e) {  }

  select.innerHTML = '';
  if (!schemes.length && !teamSchemes.length) {
    wrap.style.display = 'none';
    return;
  }
  schemes.forEach((entry) => {
    const opt = document.createElement('option');
    opt.value = entry.name;
    const target = entry.old_name ? ` (replaces ${entry.old_name})` : '';
    opt.textContent = `${entry.name}${target}`;
    select.appendChild(opt);
  });
  if (teamSchemes.length) {
    const group = document.createElement('optgroup');
    group.label = 'Team Colours';
    teamSchemes.forEach((entry) => {
      const opt = document.createElement('option');
      opt.value = `team:${entry.slot}`;
      opt.textContent = `${entry.scheme_name} (${entry.label})`;
      group.appendChild(opt);
    });
    select.appendChild(group);
  }
  wrap.style.display = '';
}

async function uninstallFromBrawlhalla() {
  if (!isUninstallCapable()) {
    showToast('Removing colours only works from the Azu Modification desktop app', 'error');
    return;
  }
  const select = document.getElementById('uninstall-target-select');
  const rawValue = select ? select.value : '';
  if (!rawValue) {
    showToast('Pick which installed colour to remove first', 'error');
    return;
  }
  const isTeamSlot = rawValue.startsWith('team:');
  const teamSlot = isTeamSlot ? rawValue.slice(5) : null;
  const displayName = isTeamSlot
    ? (select.options[select.selectedIndex] ? select.options[select.selectedIndex].textContent : teamSlot)
    : rawValue;
  if (!window.confirm(`Remove "${displayName}" from Brawlhalla? This can't be undone.`)) return;

  showToast(`Removing "${displayName}"… this can take a moment`, 'info');
  try {
    const result = isTeamSlot
      ? await window.pywebview.api.uninstall_team_scheme(teamSlot, true, null, null, getActiveProfile())
      : await window.pywebview.api.uninstall_scheme(rawValue, true, null, null, getActiveProfile());
    showToast(result.message, result.success ? 'info' : 'error');
    populateUninstallTargetSelect();
  } catch (e) {
    showToast(`Remove failed: ${e.message || e}`, 'error');
  }
}

async function resetAllBrawlhallaColours() {
  if (!isUninstallCapable()) {
    showToast('Resetting only works from the Azu Modification desktop app', 'error');
    return;
  }
  if (!window.confirm('Reset ALL installed colours and restore the original swf? This can\'t be undone.')) return;

  showToast('Resetting all colours… this can take a moment', 'info');
  try {
    const result = await window.pywebview.api.reset_all_schemes(null, null, getActiveProfile());
    showToast(result.message, result.success ? 'info' : 'error');
    populateUninstallTargetSelect();
  } catch (e) {
    showToast(`Reset failed: ${e.message || e}`, 'error');
  }
}

function isUpdateColorValuesCapable() {
  return !!(window.pywebview && window.pywebview.api && window.pywebview.api.update_color_values);
}

function showProgressOverlay(title, subtitle, withPercent) {
  const overlay = document.getElementById('progress-modal');
  if (!overlay) return;
  const titleEl = document.getElementById('progress-modal-title');
  const subtitleEl = document.getElementById('progress-modal-subtitle');
  if (titleEl) titleEl.textContent = title || 'Working…';
  if (subtitleEl) subtitleEl.textContent = subtitle || "This can take a few minutes. Please don't close the app.";
  const spinner = overlay.querySelector('.progress-spinner');
  const barWrap = document.getElementById('progress-modal-bar-wrap');
  const percentEl = document.getElementById('progress-modal-percent');
  if (spinner) spinner.style.display = withPercent ? 'none' : '';
  if (barWrap) barWrap.style.display = withPercent ? '' : 'none';
  if (percentEl) percentEl.style.display = withPercent ? '' : 'none';
  if (withPercent) setProgressOverlayPercent(0);
  overlay.classList.add('open');
}

function setProgressOverlayPercent(pct) {
  const bar = document.getElementById('progress-modal-bar');
  const percentEl = document.getElementById('progress-modal-percent');
  const clamped = Math.max(0, Math.min(100, Math.round(pct || 0)));
  if (bar) bar.style.width = `${clamped}%`;
  if (percentEl) percentEl.textContent = `${clamped}%`;
}

function hideProgressOverlay() {
  const overlay = document.getElementById('progress-modal');
  if (overlay) overlay.classList.remove('open');
}

async function updateColorValues() {
  if (!isUpdateColorValuesCapable()) {
    showToast('Updating color values only works from the Azu Modification desktop app', 'error');
    return;
  }
  if (!window.confirm(
    'This decompiles BrawlhallaAir.swf, updates AppAllInOne.py with the new identifiers, ' +
    'and relinks your already-installed UI_MainMenu.swf. Your installed colours are kept. ' +
    'This can take a few minutes. Continue?'
  )) return;

  showToast('Updating colour values… this can take a few minutes', 'info');
  showProgressOverlay('Updating color values…', "Decompiling BrawlhallaAir.swf and relinking. This can take a few minutes — please don't close the app.");
  try {
    const result = await window.pywebview.api.update_color_values(null, null, null, getActiveProfile());
    showToast(result.message, result.success ? 'info' : 'error');
    populateUninstallTargetSelect();
  } catch (e) {
    showToast(`Update Color Values failed: ${e.message || e}`, 'error');
  } finally {
    hideProgressOverlay();
  }
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const b64 = params.get('colour') || params.get('color');
  if (!b64) return false;
  try {
    const hex = atob(decodeURIComponent(b64));
    scheme.loadHexString(hex);
    clearSchemeSelections();
    refreshAll({ recordHistory: true });
    showToast('Loaded from shared link', 'info');
    return true;
  } catch (e) {
    showToast('Invalid shared link', 'error');
    return false;
  }
}

function loadDefaultScheme() {
  const seedColors = getActiveSeedColors();
  for (const p of COLOR_PROPS) scheme[p] = seedColors[p];
  if (isExtendedSpriteType()) {
    scheme.HairVL_Swap  = seedColors.Hair_Swap;
    scheme.HairAcc_Swap = seedColors.Hair_Swap;
    scheme.HairVD_Swap  = seedColors.Hair_Swap;
    scheme.ClothVD_Swap  = seedColors.Cloth_Swap;
    scheme.ClothAcc_Swap = seedColors.Cloth_Swap;
    scheme.WeaponVD_Swap = seedColors.Weapon_Swap;
  }
  clearSchemeSelections();
  refreshAll({ recordHistory: true });
  return true;
}

function setSpriteType(type) {
  if (!SEED_PALETTES_BY_TYPE[type] || type === activeSpriteType) return;
  activeSpriteType = type;
  localStorage.setItem(SPRITE_TYPE_LS_KEY, type);
  if (grid) grid.rebuild();
  syncSpriteTypeSelectors();
  loadDefaultScheme();
  showToast(`Sprite type: ${SPRITE_TYPE_LABELS[type]}`, 'info');
}

function openImageModal() {
  const modal = document.getElementById('image-modal');
  modal.classList.add('open');
  renderSchemeImage().catch(() => showToast('Could not render preview image', 'error'));
}

function closeImageModal() {
  document.getElementById('image-modal').classList.remove('open');
}

async function refreshBrawlhallaPathStatus() {
  const statusEl = document.getElementById('brawlhalla-path-status');
  const input = document.getElementById('brawlhalla-path-input');
  if (!statusEl || !input) return;
  if (!isDesktopApp()) {
    statusEl.textContent = 'Only available in the Azu Modification desktop app.';
    return;
  }
  try {
    const { path, source } = await window.pywebview.api.get_brawlhalla_status();
    if (source === 'saved') {
      statusEl.textContent = `Using the folder you set: ${path}`;
      input.value = path;
    } else if (source === 'auto') {
      statusEl.textContent = `Auto-detected: ${path} (not saved — pick or type your own to lock it in)`;
      input.value = path;
    } else {
      statusEl.textContent = "Couldn't auto-detect Brawlhalla. Browse to it or paste the path below.";
      input.value = '';
    }
  } catch (e) {
    statusEl.textContent = `Couldn't check the current folder: ${e.message || e}`;
  }
}

function openBrawlhallaPathModal() {
  document.getElementById('brawlhalla-path-modal').classList.add('open');
  refreshBrawlhallaPathStatus();
  refreshDevModeStatus();
}

async function refreshDevModeStatus() {
  const status = document.getElementById('dev-mode-status');
  const input = document.getElementById('dev-mode-code-input');
  const btn = document.getElementById('dev-mode-unlock-btn');
  if (!status) return;
  if (!isDesktopApp()) {
    status.textContent = '';
    return;
  }
  try {
    const unlocked = await window.pywebview.api.get_dev_mode_status();
    if (unlocked) {
      status.textContent = 'Developer mode: unlocked (all colours available).';
      if (input) input.style.display = 'none';
      if (btn) btn.style.display = 'none';
    } else {
      status.textContent = 'Enter the developer code to unlock every colour.';
      if (input) input.style.display = '';
      if (btn) btn.style.display = '';
    }
  } catch (e) {
    status.textContent = '';
  }
}

async function unlockDevMode() {
  if (!isDesktopApp()) return;
  const input = document.getElementById('dev-mode-code-input');
  const code = input ? input.value.trim() : '';
  if (!code) return;
  try {
    const result = await window.pywebview.api.unlock_dev_mode(code);
    showToast(result.message, result.success ? 'info' : 'error');
    if (result.success) {
      if (input) input.value = '';
      await refreshDevModeStatus();
      if (typeof populateInstallTargetSelect === 'function') populateInstallTargetSelect();
    }
  } catch (e) {
    showToast(`Unlock failed: ${e.message || e}`, 'error');
  }
}

function closeBrawlhallaPathModal() {
  document.getElementById('brawlhalla-path-modal').classList.remove('open');
}

async function browseBrawlhallaPath() {
  if (!isDesktopApp()) return;
  try {
    const result = await window.pywebview.api.browse_brawlhalla_folder();
    if (result.message === 'cancelled') return;
    showToast(result.message, result.success ? 'info' : 'error');
    if (result.success) closeBrawlhallaPathModal();
    else refreshBrawlhallaPathStatus();
  } catch (e) {
    showToast(`Browse failed: ${e.message || e}`, 'error');
  }
}

async function saveBrawlhallaPath() {
  if (!isDesktopApp()) return;
  const input = document.getElementById('brawlhalla-path-input');
  const raw = input ? input.value.trim() : '';
  try {
    const result = await window.pywebview.api.set_brawlhalla_folder(raw);
    showToast(result.message, result.success ? 'info' : 'error');
    if (result.success) closeBrawlhallaPathModal();
  } catch (e) {
    showToast(`Save failed: ${e.message || e}`, 'error');
  }
}

async function clearBrawlhallaPath() {
  if (!isDesktopApp()) return;
  try {
    await window.pywebview.api.clear_brawlhalla_folder();
    showToast('Back to auto-detecting the Brawlhalla folder.', 'info');
    refreshBrawlhallaPathStatus();
  } catch (e) {
    showToast(`Couldn't reset: ${e.message || e}`, 'error');
  }
}

async function checkBrawlhallaPathOnStartup() {
  if (!isDesktopApp()) return;
  try {
    const { source } = await window.pywebview.api.get_brawlhalla_status();
    if (source === 'none') openBrawlhallaPathModal();
  } catch (e) {  }
}

function openPasteCodeModal() {
  const modal = document.getElementById('paste-code-modal');
  const ta = document.getElementById('paste-code-textarea');
  ta.value = '';
  modal.classList.add('open');
  setTimeout(() => ta.focus(), 0);
}

function closePasteCodeModal() {
  document.getElementById('paste-code-modal').classList.remove('open');
}

function applyPastedCode() {
  const text = document.getElementById('paste-code-textarea').value;
  if (!text || !text.trim()) {
    showToast('Paste some colour scheme code first', 'error');
    return;
  }
  const locked = grid.getLockedColumns();
  try {
    if (/<svg[\s>]/i.test(text)) {
      scheme.loadSVG(text, locked);
    } else if (/^\s*[{[]/.test(text)) {
      scheme.loadJSON(text, locked);
    } else if (/<ColorSchemeType[\s>]/.test(text)) {
      scheme.loadXML(text, locked);
    } else if (/pushuint\s+\d+/.test(text) && /\bnewarray\b/.test(text)) {
      scheme.loadPcode(text, locked);
    } else {
      scheme.loadINI(text, locked);
    }
    clearSchemeSelections();
    refreshAll({ recordHistory: true });
    closePasteCodeModal();
    showToast('Colour scheme applied from pasted code', 'info');
  } catch (err) {
    showToast(`Could not apply pasted code: ${err.message}`, 'error');
  }
}

function _roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

let _schemeImageTemplatePromise = null;
function _loadSchemeImageTemplate() {
  if (!_schemeImageTemplatePromise) {
    _schemeImageTemplatePromise = new Promise((resolve, reject) => {
      const el = document.getElementById('keres-svg-template');
      if (!el) {
        reject(new Error('No se encontro #keres-svg-template en index.html'));
        return;
      }
      resolve(el.textContent);
    });
  }
  return _schemeImageTemplatePromise;
}

async function _buildSchemeImageSVG() {
  const templateText = await _loadSchemeImageTemplate();
  const doc = new DOMParser().parseFromString(templateText, 'image/svg+xml');
  for (const p of COLOR_PROPS) {
    const node = doc.getElementById(p);
    if (!node) continue;
    const hex = `#${scheme._hex6(scheme[p])}`;
    const style = node.getAttribute('style') || '';
    node.setAttribute('style', style.replace(/fill:#[0-9a-fA-F]{6}/, `fill:${hex}`));
  }
  return new XMLSerializer().serializeToString(doc);
}

function _drawSVGStringToCanvas(ctx, svgText, x, y, w, h) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG rasterise failed')); };
    img.src = url;
  });
}

async function renderSchemeImage(canvas = null) {
  canvas = canvas || document.getElementById('image-preview-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#070e1b');
  bg.addColorStop(1, '#081427');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#0a1324';
  _roundedRect(ctx, 26, 22, W - 52, H - 44, 20);
  ctx.fill();

  const padding = 52;
  const svgText = await _buildSchemeImageSVG();
  await _drawSVGStringToCanvas(ctx, svgText, padding, padding, W - padding * 2, H - padding * 2);
}

async function updateShareMetaPreview() {
  const ogUrl = document.getElementById('meta-og-url');
  if (ogUrl) ogUrl.setAttribute('content', window.location.href);

  const params = new URLSearchParams(window.location.search);
  const hasShare = !!(params.get('colour') || params.get('color'));
  if (!hasShare) return;

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = 1200;
  previewCanvas.height = 675;
  try {
    await renderSchemeImage(previewCanvas);
  } catch {
    return;
  }

  let dataUrl = '';
  try {
    dataUrl = previewCanvas.toDataURL('image/png');
  } catch {
    return;
  }

  const ogImage = document.getElementById('meta-og-image');
  const twImage = document.getElementById('meta-twitter-image');
  if (ogImage) ogImage.setAttribute('content', dataUrl);
  if (twImage) twImage.setAttribute('content', dataUrl);
}

async function copyImagePNG() {
  const canvas = document.getElementById('image-preview-canvas');
  if (!canvas) return;
  try {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Failed to create PNG');

    if (window.ClipboardItem && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('PNG copied to clipboard', 'info');
      return;
    }

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ColourScheme.png';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Clipboard unsupported — PNG downloaded instead', 'info');
  } catch (e) {
    showToast('Failed to copy PNG', 'error');
  }
}

(function initDonatePopover() {
  const wrap = document.getElementById('donate-wrap');
  const btn = document.getElementById('btn-donate');
  const popover = document.getElementById('donate-popover');
  if (!wrap || !btn || !popover) return;

  function closePopover() {
    wrap.classList.remove('open');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) closePopover();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopover();
  });
})();
