(function(){
  "use strict";

  // fflate (MIT License) embedded for ZIP handling
  const fflate = (() => {
    const scope = {};
    var self = scope;
    var window = scope;
    var globalThis = scope;
    var global = scope;
    var module;
    var exports;
    var define;
    !function(f){typeof module!='undefined'&&typeof exports=='object'?module.exports=f():typeof define!='undefined'&&define.amd?define(f):(typeof self!='undefined'?self:this).fflate=f()}(function(){var _e={};"use strict";var t=(typeof module!='undefined'&&typeof exports=='object'?function(_f){"use strict";var e,t=";var __w=require('worker_threads');__w.parentPort.on('message',function(m){onmessage({data:m})}),postMessage=function(m,t){__w.parentPort.postMessage(m,t)},close=process.exit;self=global";try{e=require("worker_threads").Worker}catch(e){}exports.default=e?function(r,n,o,a,s){var u=!1,i=new e(r+t,{eval:!0}).on("error",(function(e){return s(e,null)})).on("message",(function(e){return s(null,e)})).on("exit",(function(e){e&&!u&&s(Error("exited with code "+e),null)}));return i.postMessage(o,a),i.terminate=function(){return u=!0,e.prototype.terminate.call(i)},i}:function(e,t,r,n,o){setImmediate((function(){return o(Error("async operations unsupported - update to Node 12+ (or Node 10-11 with the --experimental-worker CLI flag)"),null)}));var a=function(){};return{terminate:a,postMessage:a}};return _f}:function(_f){"use strict";var e={};_f.default=function(r,t,s,a,n){var o=new Worker(e[t]||(e[t]=URL.createObjectURL(new Blob([r+';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'],{type:"text/javascript"}))));return o.onmessage=function(e){var r=e.data,t=r.$e$;if(t){var s=Error(t[0]);s.code=t[1],s.stack=t[2],n(s,null)}else n(null,r)},o.postMessage(s,a),o};return _f})({}),n=Uint8Array,r=Uint16Array,e=Int32Array,i=new n([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),o=new n([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),s=new n([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),a=function(t,n){for(var i=new r(31),o=0;o<31;++o)i[o]=n+=1<<t[o-1];var s=new e(i[30]);for(o=1;o<30;++o)for(var a=i[o];a<i[o+1];++a)s[a]=a-i[o]<<5|o;return{b:i,r:s}},u=a(i,2),h=u.b,f=u.r;h[28]=258,f[258]=28;for(var c=a(o,0),l=c.b,p=c.r,v=new r(32768),d=0;d<32768;++d){var g=(43690&d)>>1|(21845&d)<<1;v[d]=((65280&(g=(61680&(g=(52428&g)>>2|(13107&g)<<2))>>4|(3855&g)<<4))>>8|(255&g)<<8)>>1}var y=function(t,n,e){for(var i=t.length,o=0,s=new r(n);o<i;++o)t[o]&&++s[t[o]-1];var a,u=new r(n);for(o=1;o<n;++o)u[o]=u[o-1]+s[o-1]<<1;if(e){a=new r(1<<n);var h=15-n;for(o=0;o<i;++o)if(t[o])for(var f=o<<4|t[o],c=n-t[o],l=u[t[o]-1]++<<c,p=l|(1<<c)-1;l<=p;++l)a[v[l]>>h]=f}else for(a=new r(i),o=0;o<i;++o)t[o]&&(a[o]=v[u[t[o]-1]++]>>15-t[o]);return a},m=new n(288);for(d=0;d<144;++d)m[d]=8;for(d=144;d<256;++d)m[d]=9;for(d=256;d<280;++d)m[d]=7;for(d=280;d<288;++d)m[d]=8;var b=new n(32);for(d=0;d<32;++d)b[d]=5;var w=y(m,9,0),x=y(m,9,1),z=y(b,5,0),k=y(b,5,1),M=function(t){for(var n=t[0],r=1;r<t.length;++r)t[r]>n&&(n=t[r]);return n},A=function(t,n,r){var e=n/8|0;return(t[e]|t[e+1]<<8)>>(7&n)&r},S=function(t,n){var r=n/8|0;return(t[r]|t[r+1]<<8|t[r+2]<<16)>>(7&n)},T=function(t){return(t+7)/8|0},D=function(t,r,e){(null==r||r<0)&&(r=0),(null==e||e>t.length)&&(e=t.length);var i=new n(e-r);return i.set(t.subarray(r,e)),i};_e.FlateErrorCode={UnexpectedEOF:0,InvalidBlockType:1,InvalidLengthLiteral:2,InvalidDistance:3,StreamFinished:4,NoStreamHandler:5,InvalidHeader:6,NoCallback:7,InvalidUTF8:8,ExtraFieldTooLong:9,InvalidDate:10,FilenameTooLong:11,StreamFinishing:12,InvalidZipData:13,UnknownCompressionMethod:14};var C=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],I=function(t,n,r){var e=Error(n||C[t]);if(e.code=t,Error.captureStackTrace&&Error.captureStackTrace(e,I),!r)throw e;return e},U=function(t,r,e,a){var u=t.length,f=a?a.length:0;if(!u||r.f&&!r.l)return e||new n(0);var c=!e||2!=r.i,p=r.i;e||(e=new n(3*u));var v=function(t){var r=e.length;if(t>r){var i=new n(Math.max(2*r,t));i.set(e),e=i}},d=r.f||0,g=r.p||0,m=r.b||0,b=r.l,w=r.d,z=r.m,C=r.n,U=8*u;do{if(!b){d=A(t,g,1);var F=A(t,g+1,3);if(g+=3,!F){var E=t[(Y=T(g)+4)-4]|t[Y-3]<<8,Z=Y+E;if(Z>u){p&&I(0);break}c&&v(m+E),e.set(t.subarray(Y,Z),m),r.b=m+=E,r.p=g=8*Z,r.f=d;continue}if(1==F)b=x,w=k,z=9,C=5;else if(2==F){var O=A(t,g,31)+257,G=A(t,g+10,15)+4,L=O+A(t,g+5,31)+1;g+=14;for(var q=new n(L),H=new n(19),j=0;j<G;++j)H[s[j]]=A(t,g+3*j,7);g+=3*G;var N=M(H),P=(1<<N)-1,B=y(H,N,1);for(j=0;j<L;){var Y,J=B[A(t,g,P)];if(g+=15&J,(Y=J>>4)<16)q[j++]=Y;else{var K=0,Q=0;for(16==Y?(Q=3+A(t,g,3),g+=2,K=q[j-1]):17==Y?(Q=3+A(t,g,7),g+=3):18==Y&&(Q=11+A(t,g,127),g+=7);Q--;)q[j++]=K}}var R=q.subarray(0,O),V=q.subarray(O);z=M(R),C=M(V),b=y(R,z,1),w=y(V,C,1)}else I(1);if(g>U){p&&I(0);break}}c&&v(m+131072);for(var W=(1<<z)-1,X=(1<<C)-1,$=g;;$=g){var _=(K=b[S(t,g)&W])>>4;if((g+=15&K)>U){p&&I(0);break}if(K||I(2),_<256)e[m++]=_;else{if(256==_){$=g,b=null;break}var tt=_-254;_>264&&(tt=A(t,g,(1<<(et=i[j=_-257]))-1)+h[j],g+=et);var nt=w[S(t,g)&X],rt=nt>>4;if(nt||I(3),g+=15&nt,V=l[rt],rt>3){var et=o[rt];V+=S(t,g)&(1<<et)-1,g+=et}if(g>U){p&&I(0);break}c&&v(m+131072);var it=m+tt;if(m<V){var ot=f-V,st=Math.min(V,it);for(ot+m<0&&I(3);m<st;++m)e[m]=a[ot+m]}for(;m<it;m+=4)e[m]=e[m-V],e[m+1]=e[m+1-V],e[m+2]=e[m+2-V],e[m+3]=e[m+3-V];m=it}}r.l=b,r.p=$,r.b=m,r.f=d,b&&(d=1,r.m=z,r.d=w,r.n=C)}while(!d);return m==e.length?e:D(e,0,m)},F=function(t,n,r){var e=n/8|0;t[e]|=r<<=7&n,t[e+1]|=r>>8},E=function(t,n,r){var e=n/8|0;t[e]|=r<<=7&n,t[e+1]|=r>>8,t[e+2]|=r>>16},Z=function(t,e){for(var i=[],o=0;o<t.length;++o)t[o]&&i.push({s:o,f:t[o]});var s=i.length,a=i.slice();if(!s)return{t:N,l:0};if(1==s){var u=new n(i[0].s+1);return u[i[0].s]=1,{t:u,l:1}}i.sort((function(t,n){return t.f-n.f})),i.push({s:-1,f:25001});var h=i[0],f=i[1],c=0,l=1,p=2;for(i[0]={s:-1,f:h.f+f.f,l:h,r:f};l!=s-1;)h=i[i[c].f<i[p].f?c++:p++],f=i[c!=l&&i[c].f<i[p].f?c++:p++],i[l++]={s:-1,f:h.f+f.f,l:h,r:f};var v=a[0].s;for(o=1;o<s;++o)a[o].s>v&&(v=a[o].s);var d=new r(v+1),g=O(i[l-1],d,0);if(g>e){o=0;var y=0,m=g-e,b=1<<m;for(a.sort((function(t,n){return d[n.s]-d[t.s]||t.f-n.f}));o<s;++o){var w=a[o].s;if(!(d[w]>e))break;y+=b-(1<<g-d[w]),d[w]=e}for(y>>=m;y>0;){var x=a[o].s;d[x]<e?y-=1<<e-d[x]++-1:++o}for(;o>=0&&y;--o){var z=a[o].s;d[z]==e&&(--d[z],++y)}g=e}return{t:new n(d),l:g}},O=function(t,n,r){return-1==t.s?Math.max(O(t.l,n,r+1),O(t.r,n,r+1)):n[t.s]=r},G=function(t){for(var n=t.length;n&&!t[--n];);for(var e=new r(++n),i=0,o=t[0],s=1,a=function(t){e[i++]=t},u=1;u<=n;++u)if(t[u]==o&&u!=n)++s;else{if(!o&&s>2){for(;s>138;s-=138)a(32754);s>2&&(a(s>10?s-11<<5|28690:s-3<<5|12305),s=0)}else if(s>3){for(a(o),--s;s>6;s-=6)a(8304);s>2&&(a(s-3<<5|8208),s=0)}for(;s--;)a(o);s=1,o=t[u]}return{c:e.subarray(0,i),n:n}},L=function(t,n){for(var r=0,e=0;e<n.length;++e)r+=t[e]*n[e];return r},q=function(t,n,r){var e=r.length,i=T(n+2);t[i]=255&e,t[i+1]=e>>8,t[i+2]=255^t[i],t[i+3]=255^t[i+1];for(var o=0;o<e;++o)t[i+o+4]=r[o];return 8*(i+4+e)},H=function(t,n,e,a,u,h,f,c,l,p,v){F(n,v++,e),++u[256];for(var d=Z(u,15),g=d.t,x=d.l,k=Z(h,15),M=k.t,A=k.l,S=G(g),T=S.c,D=S.n,C=G(M),I=C.c,U=C.n,O=new r(19),H=0;H<T.length;++H)++O[31&T[H]];for(H=0;H<I.length;++H)++O[31&I[H]];for(var j=Z(O,7),N=j.t,P=j.l,B=19;B>4&&!N[s[B-1]];--B);var Y,J,K,Q,R=p+5<<3,V=L(u,m)+L(h,b)+f,W=L(u,g)+L(h,M)+f+14+3*B+L(O,N)+2*O[16]+3*O[17]+7*O[18];if(l>=0&&R<=V&&R<=W)return q(n,v,t.subarray(l,l+p));if(F(n,v,1+(W<V)),v+=2,W<V){Y=y(g,x,0),J=g,K=y(M,A,0),Q=M;var X=y(N,P,0);for(F(n,v,D-257),F(n,v+5,U-1),F(n,v+10,B-4),v+=14,H=0;H<B;++H)F(n,v+3*H,N[s[H]]);v+=3*B;for(var $=[T,I],_=0;_<2;++_){var tt=$[_];for(H=0;H<tt.length;++H)F(n,v,X[rt=31&tt[H]]),v+=N[rt],rt>15&&(F(n,v,tt[H]>>5&127),v+=tt[H]>>12)}}else Y=w,J=m,K=z,Q=b;for(H=0;H<c;++H){var nt=a[H];if(nt>255){var rt;E(n,v,Y[257+(rt=nt>>18&31)]),v+=J[rt+257],rt>7&&(F(n,v,nt>>23&31),v+=i[rt]);var et=31&nt;E(n,v,K[et]),v+=Q[et],et>3&&(E(n,v,nt>>5&8191),v+=o[et])}else E(n,v,Y[nt]),v+=J[nt]}return E(n,v,Y[256]),v+J[256]},j=new e([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),N=new n(0),P=function(t,s,a,u,h,c){var l=c.z||t.length,v=new n(u+l+5*(1+Math.ceil(l/7e3))+h),d=v.subarray(u,v.length-h),g=c.l,y=7&(c.r||0);if(s){y&&(d[0]=c.r>>3);for(var m=j[s-1],b=m>>13,w=8191&m,x=(1<<a)-1,z=c.p||new r(32768),k=c.h||new r(x+1),M=Math.ceil(a/3),A=2*M,S=function(n){return(t[n]^t[n+1]<<M^t[n+2]<<A)&x},C=new e(25e3),I=new r(288),U=new r(32),F=0,E=0,Z=c.i||0,O=0,G=c.w||0,L=0;Z+2<l;++Z){var N=S(Z),P=32767&Z,B=k[N];if(z[P]=B,k[N]=P,G<=Z){var Y=l-Z;if((F>7e3||O>24576)&&(Y>423||!g)){y=H(t,d,0,C,I,U,E,O,L,Z-L,y),O=F=E=0,L=Z;for(var J=0;J<286;++J)I[J]=0;for(J=0;J<30;++J)U[J]=0}var K=2,Q=0,R=w,V=P-B&32767;if(Y>2&&N==S(Z-V))for(var W=Math.min(b,Y)-1,X=Math.min(32767,Z),$=Math.min(258,Y);V<=X&&--R&&P!=B;){if(t[Z+K]==t[Z+K-V]){for(var _=0;_<$&&t[Z+_]==t[Z+_-V];++_);if(_>K){if(K=_,Q=V,_>W)break;var tt=Math.min(V,_-2),nt=0;for(J=0;J<tt;++J){var rt=Z-V+J&32767,et=rt-z[rt]&32767;et>nt&&(nt=et,B=rt)}}}V+=(P=B)-(B=z[P])&32767}if(Q){C[O++]=268435456|f[K]<<18|p[Q];var it=31&f[K],ot=31&p[Q];E+=i[it]+o[ot],++I[257+it],++U[ot],G=Z+K,++F}else C[O++]=t[Z],++I[t[Z]]}}for(Z=Math.max(Z,G);Z<l;++Z)C[O++]=t[Z],++I[t[Z]];y=H(t,d,g,C,I,U,E,O,L,Z-L,y),g||(c.r=7&y|d[y/8|0]<<3,y-=7,c.h=k,c.p=z,c.i=Z,c.w=G)}else{for(Z=c.w||0;Z<l+g;Z+=65535){var st=Z+65535;st>=l&&(d[y/8|0]=g,st=l),y=q(d,y+1,t.subarray(Z,st))}c.i=l}return D(v,0,u+T(y)+h)},B=function(){for(var t=new Int32Array(256),n=0;n<256;++n){for(var r=n,e=9;--e;)r=(1&r&&-306674912)^r>>>1;t[n]=r}return t}(),Y=function(){var t=-1;return{p:function(n){for(var r=t,e=0;e<n.length;++e)r=B[255&r^n[e]]^r>>>8;t=r},d:function(){return~t}}},J=function(){var t=1,n=0;return{p:function(r){for(var e=t,i=n,o=0|r.length,s=0;s!=o;){for(var a=Math.min(s+2655,o);s<a;++s)i+=e+=r[s];e=(65535&e)+15*(e>>16),i=(65535&i)+15*(i>>16)}t=e,n=i},d:function(){return(255&(t%=65521))<<24|(65280&t)<<8|(255&(n%=65521))<<8|n>>8}}},K=function(t,r,e,i,o){if(!o&&(o={l:1},r.dictionary)){var s=r.dictionary.subarray(-32768),a=new n(s.length+t.length);a.set(s),a.set(t,s.length),t=a,o.w=s.length}return P(t,null==r.level?6:r.level,null==r.mem?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(t.length)))):12+r.mem,e,i,o)},Q=function(t,n){var r={};for(var e in t)r[e]=t[e];for(var e in n)r[e]=n[e];return r},R=function(t,n,r){for(var e=t(),i=""+t,o=i.slice(i.indexOf("[")+1,i.lastIndexOf("]")).replace(/\s+/g,"").split(","),s=0;s<e.length;++s){var a=e[s],u=o[s];if("function"==typeof a){n+=";"+u+"=";var h=""+a;if(a.prototype)if(-1!=h.indexOf("[native code]")){var f=h.indexOf(" ",8)+1;n+=h.slice(f,h.indexOf("(",f))}else for(var c in n+=h,a.prototype)n+=";"+u+".prototype."+c+"="+a.prototype[c];else n+=h}else r[u]=a}return n},V=[],W=function(t){var n=[];for(var r in t)t[r].buffer&&n.push((t[r]=new t[r].constructor(t[r])).buffer);return n},X=function(n,r,e,i){if(!V[e]){for(var o="",s={},a=n.length-1,u=0;u<a;++u)o=R(n[u],o,s);V[e]={c:R(n[a],o,s),e:s}}var h=Q({},V[e].e);return t.default(V[e].c+";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage="+r+"}",e,h,W(h),i)},$=function(){return[n,r,e,i,o,s,h,l,x,k,v,C,y,M,A,S,T,D,I,U,Tt,it,ot]},_=function(){return[n,r,e,i,o,s,f,p,w,m,z,b,v,j,N,y,F,E,Z,O,G,L,q,H,T,D,P,K,kt,it]},tt=function(){return[pt,gt,lt,Y,B]},nt=function(){return[vt,dt]},rt=function(){return[yt,lt,J]},et=function(){return[mt]},it=function(t){return postMessage(t,[t.buffer])},ot=function(t){return t&&{out:t.size&&new n(t.size),dictionary:t.dictionary}},st=function(t,n,r,e,i,o){var s=X(r,e,i,(function(t,n){s.terminate(),o(t,n)}));return s.postMessage([t,n],n.consume?[t.buffer]:[]),function(){s.terminate()}},at=function(t){return t.ondata=function(t,n){return postMessage([t,n],[t.buffer])},function(n){return t.push(n.data[0],n.data[1])}},ut=function(t,n,r,e,i,o){var s,a=X(t,e,i,(function(t,r){t?(a.terminate(),n.ondata.call(n,t)):Array.isArray(r)?(r[1]&&a.terminate(),n.ondata.call(n,t,r[0],r[1])):o(r)}));a.postMessage(r),n.push=function(t,r){n.ondata||I(5),s&&n.ondata(I(4,0,1),null,!!r),a.postMessage([t,s=r],[t.buffer])},n.terminate=function(){a.terminate()}},ht=function(t,n){return t[n]|t[n+1]<<8},ft=function(t,n){return(t[n]|t[n+1]<<8|t[n+2]<<16|t[n+3]<<24)>>>0},ct=function(t,n){return ft(t,n)+4294967296*ft(t,n+4)},lt=function(t,n,r){for(;r;++n)t[n]=r,r>>>=8},pt=function(t,n){var r=n.filename;if(t[0]=31,t[1]=139,t[2]=8,t[8]=n.level<2?4:9==n.level?2:0,t[9]=3,0!=n.mtime&&lt(t,4,Math.floor(new Date(n.mtime||Date.now())/1e3)),r){t[3]=8;for(var e=0;e<=r.length;++e)t[e+10]=r.charCodeAt(e)}},vt=function(t){31==t[0]&&139==t[1]&&8==t[2]||I(6,"invalid gzip data");var n=t[3],r=10;4&n&&(r+=2+(t[10]|t[11]<<8));for(var e=(n>>3&1)+(n>>4&1);e>0;e-=!t[r++]);return r+(2&n)},dt=function(t){var n=t.length;return(t[n-4]|t[n-3]<<8|t[n-2]<<16|t[n-1]<<24)>>>0},gt=function(t){return 10+(t.filename?t.filename.length+1:0)},yt=function(t,n){var r=n.level,e=0==r?0:r<6?1:9==r?3:2;if(t[0]=120,t[1]=e<<6|(n.dictionary&&32),t[1]|=31-(t[0]<<8|t[1])%31,n.dictionary){var i=J();i.p(n.dictionary),lt(t,2,i.d())}},mt=function(t,n){return(8!=(15&t[0])||t[0]>>4>7||(t[0]<<8|t[1])%31)&&I(6,"invalid zlib data"),(t[1]>>5&1)==+!n&&I(6,"invalid zlib data: "+(32&t[1]?"need":"unexpected")+" dictionary"),2+(t[1]>>3&4)};function bt(t,n){return"function"==typeof t&&(n=t,t={}),this.ondata=n,t}var wt=function(){function t(t,r){if("function"==typeof t&&(r=t,t={}),this.ondata=r,this.o=t||{},this.s={l:0,i:32768,w:32768,z:32768},this.b=new n(98304),this.o.dictionary){var e=this.o.dictionary.subarray(-32768);this.b.set(e,32768-e.length),this.s.i=32768-e.length}}return t.prototype.p=function(t,n){this.ondata(K(t,this.o,0,0,this.s),n)},t.prototype.push=function(t,r){this.ondata||I(5),this.s.l&&I(4);var e=t.length+this.s.z;if(e>this.b.length){if(e>2*this.b.length-32768){var i=new n(-32768&e);i.set(this.b.subarray(0,this.s.z)),this.b=i}var o=this.b.length-this.s.z;o&&(this.b.set(t.subarray(0,o),this.s.z),this.s.z=this.b.length,this.p(this.b,!1)),this.b.set(this.b.subarray(-32768)),this.b.set(t.subarray(o),32768),this.s.z=t.length-o+32768,this.s.i=32766,this.s.w=32768}else this.b.set(t,this.s.z),this.s.z+=t.length;this.s.l=1&r,(this.s.z>this.s.w+8191||r)&&(this.p(this.b,r||!1),this.s.w=this.s.i,this.s.i-=2)},t}();_e.Deflate=wt;var xt=function(){return function(t,n){ut([_,function(){return[at,wt]}],this,bt.call(this,t,n),(function(t){var n=new wt(t.data);onmessage=at(n)}),6)}}();function zt(t,n,r){return r||(r=n,n={}),"function"!=typeof r&&I(7),st(t,n,[_],(function(t){return it(kt(t.data[0],t.data[1]))}),0,r)}function kt(t,n){return K(t,n||{},0,0)}_e.AsyncDeflate=xt,_e.deflate=zt,_e.deflateSync=kt;var Mt=function(){function t(t,r){"function"==typeof t&&(r=t,t={}),this.ondata=r;var e=t&&t.dictionary&&t.dictionary.subarray(-32768);this.s={i:0,b:e?e.length:0},this.o=new n(32768),this.p=new n(0),e&&this.o.set(e)}return t.prototype.e=function(t){if(this.ondata||I(5),this.d&&I(4),this.p.length){if(t.length){var r=new n(this.p.length+t.length);r.set(this.p),r.set(t,this.p.length),this.p=r}}else this.p=t},t.prototype.c=function(t){this.s.i=+(this.d=t||!1);var n=this.s.b,r=U(this.p,this.s,this.o);this.ondata(D(r,n,this.s.b),this.d),this.o=D(r,this.s.b-32768),this.s.b=this.o.length,this.p=D(this.p,this.s.p/8|0),this.s.p&=7},t.prototype.push=function(t,n){this.e(t),this.c(n)},t}();_e.Inflate=Mt;var At=function(){return function(t,n){ut([$,function(){return[at,Mt]}],this,bt.call(this,t,n),(function(t){var n=new Mt(t.data);onmessage=at(n)}),7)}}();function St(t,n,r){return r||(r=n,n={}),"function"!=typeof r&&I(7),st(t,n,[$],(function(t){return it(Tt(t.data[0],ot(t.data[1])))}),1,r)}function Tt(t,n){return U(t,{i:2},n&&n.out,n&&n.dictionary)}_e.AsyncInflate=At,_e.inflate=St,_e.inflateSync=Tt;var Dt=function(){function t(t,n){this.c=Y(),this.l=0,this.v=1,wt.call(this,t,n)}return t.prototype.push=function(t,n){this.c.p(t),this.l+=t.length,wt.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){var r=K(t,this.o,this.v&&gt(this.o),n&&8,this.s);this.v&&(pt(r,this.o),this.v=0),n&&(lt(r,r.length-8,this.c.d()),lt(r,r.length-4,this.l)),this.ondata(r,n)},t}();_e.Gzip=Dt,_e.Compress=Dt;var Ct=function(){return function(t,n){ut([_,tt,function(){return[at,wt,Dt]}],this,bt.call(this,t,n),(function(t){var n=new Dt(t.data);onmessage=at(n)}),8)}}();function It(t,n,r){return r||(r=n,n={}),"function"!=typeof r&&I(7),st(t,n,[_,tt,function(){return[Ut]}],(function(t){return it(Ut(t.data[0],t.data[1]))}),2,r)}function Ut(t,n){n||(n={});var r=Y(),e=t.length;r.p(t);var i=K(t,n,gt(n),8),o=i.length;return pt(i,n),lt(i,o-8,r.d()),lt(i,o-4,e),i}_e.AsyncGzip=Ct,_e.AsyncCompress=Ct,_e.gzip=It,_e.compress=It,_e.gzipSync=Ut,_e.compressSync=Ut;var Ft=function(){function t(t,n){this.v=1,this.r=0,Mt.call(this,t,n)}return t.prototype.push=function(t,r){if(Mt.prototype.e.call(this,t),this.r+=t.length,this.v){var e=this.p.subarray(this.v-1),i=e.length>3?vt(e):4;if(i>e.length){if(!r)return}else this.v>1&&this.onmember&&this.onmember(this.r-e.length);this.p=e.subarray(i),this.v=0}Mt.prototype.c.call(this,r),this.s.f&&!this.s.l&&(this.v=T(this.s.p)+9,this.s={i:0},this.o=new n(0),this.p.length&&this.push(new n(0),r))},t}();_e.Gunzip=Ft;var Et=function(){return function(t,n){var r=this;ut([$,nt,function(){return[at,Mt,Ft]}],this,bt.call(this,t,n),(function(t){var n=new Ft(t.data);n.onmember=function(t){return postMessage(t)},onmessage=at(n)}),9,(function(t){return r.onmember&&r.onmember(t)}))}}();function Zt(t,n,r){return r||(r=n,n={}),"function"!=typeof r&&I(7),st(t,n,[$,nt,function(){return[Ot]}],(function(t){return it(Ot(t.data[0],t.data[1]))}),3,r)}function Ot(t,r){var e=vt(t);return e+8>t.length&&I(6,"invalid gzip data"),U(t.subarray(e,-8),{i:2},r&&r.out||new n(dt(t)),r&&r.dictionary)}_e.AsyncGunzip=Et,_e.gunzip=Zt,_e.gunzipSync=Ot;var Gt=function(){function t(t,n){this.c=J(),this.v=1,wt.call(this,t,n)}return t.prototype.push=function(t,n){this.c.p(t),wt.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){var r=K(t,this.o,this.v&&(this.o.dictionary?6:2),n&&4,this.s);this.v&&(yt(r,this.o),this.v=0),n&&lt(r,r.length-4,this.c.d()),this.ondata(r,n)},t}();_e.Zlib=Gt;var Lt=function(){return function(t,n){ut([_,rt,function(){return[at,wt,Gt]}],this,bt.call(this,t,n),(function(t){var n=new Gt(t.data);onmessage=at(n)}),10)}}();function qt(t,n,r){return r||(r=n,n={}),"function"!=typeof r&&I(7),st(t,n,[_,rt,function(){return[Ht]}],(function(t){return it(Ht(t.data[0],t.data[1]))}),4,r)}function Ht(t,n){n||(n={});var r=J();r.p(t);var e=K(t,n,n.dictionary?6:2,4);return yt(e,n),lt(e,e.length-4,r.d()),e}_e.AsyncZlib=Lt,_e.zlib=qt,_e.zlibSync=Ht;var jt=function(){function t(t,n){Mt.call(this,t,n),this.v=t&&t.dictionary?2:1}return t.prototype.push=function(t,n){if(Mt.prototype.e.call(this,t),this.v){if(this.p.length<6&&!n)return;this.p=this.p.subarray(mt(this.p,this.v-1)),this.v=0}n&&(this.p.length<4&&I(6,"invalid zlib data"),this.p=this.p.subarray(0,-4)),Mt.prototype.c.call(this,n)},t}();_e.Unzlib=jt;var Nt=function(){return function(t,n){ut([$,et,function(){return[at,Mt,jt]}],this,bt.call(this,t,n),(function(t){var n=new jt(t.data);onmessage=at(n)}),11)}}();function Pt(t,n,r){return r||(r=n,n={}),"function"!=typeof r&&I(7),st(t,n,[$,et,function(){return[Bt]}],(function(t){return it(Bt(t.data[0],ot(t.data[1])))}),5,r)}function Bt(t,n){return U(t.subarray(mt(t,n&&n.dictionary),-4),{i:2},n&&n.out,n&&n.dictionary)}_e.AsyncUnzlib=Nt,_e.unzlib=Pt,_e.unzlibSync=Bt;var Yt=function(){function t(t,n){this.G=Ft,this.I=Mt,this.Z=jt,this.o=bt.call(this,t,n)||{}}return t.prototype.push=function(t,r){if(this.ondata||I(5),this.s)this.s.push(t,r);else{if(this.p&&this.p.length){var e=new n(this.p.length+t.length);e.set(this.p),e.set(t,this.p.length)}else this.p=t;if(this.p.length>2){var i=this,o=function(){i.ondata.apply(i,arguments)};this.s=31==this.p[0]&&139==this.p[1]&&8==this.p[2]?new this.G(this.o,o):8!=(15&this.p[0])||this.p[0]>>4>7||(this.p[0]<<8|this.p[1])%31?new this.I(this.o,o):new this.Z(this.o,o),this.s.push(this.p,r),this.p=null}}},t}();_e.Decompress=Yt;var Jt=function(){function t(t,n){this.G=Et,this.I=At,this.Z=Nt,Yt.call(this,t,n)}return t.prototype.push=function(t,n){Yt.prototype.push.call(this,t,n)},t}();function Kt(t,n,r){return r||(r=n,n={}),"function"!=typeof r&&I(7),31==t[0]&&139==t[1]&&8==t[2]?Zt(t,n,r):8!=(15&t[0])||t[0]>>4>7||(t[0]<<8|t[1])%31?St(t,n,r):Pt(t,n,r)}function Qt(t,n){return 31==t[0]&&139==t[1]&&8==t[2]?Ot(t,n):8!=(15&t[0])||t[0]>>4>7||(t[0]<<8|t[1])%31?Tt(t,n):Bt(t,n)}_e.AsyncDecompress=Jt,_e.decompress=Kt,_e.decompressSync=Qt;var Rt=function(t,r,e,i){for(var o in t){var s=t[o],a=r+o,u=i;Array.isArray(s)&&(u=Q(i,s[1]),s=s[0]),s instanceof n?e[a]=[s,u]:(e[a+="/"]=[new n(0),u],Rt(s,a,e,i))}},Vt="undefined"!=typeof TextEncoder&&new TextEncoder,Wt="undefined"!=typeof TextDecoder&&new TextDecoder,Xt=0;try{Wt.decode(N,{stream:!0}),Xt=1}catch(t){}var $t=function(t){for(var n="",r=0;;){var e=t[r++],i=(e>127)+(e>223)+(e>239);if(r+i>t.length)return{s:n,r:D(t,r-1)};i?3==i?(e=((15&e)<<18|(63&t[r++])<<12|(63&t[r++])<<6|63&t[r++])-65536,n+=String.fromCharCode(55296|e>>10,56320|1023&e)):n+=String.fromCharCode(1&i?(31&e)<<6|63&t[r++]:(15&e)<<12|(63&t[r++])<<6|63&t[r++]):n+=String.fromCharCode(e)}},_t=function(){function t(t){this.ondata=t,Xt?this.t=new TextDecoder:this.p=N}return t.prototype.push=function(t,r){if(this.ondata||I(5),r=!!r,this.t)return this.ondata(this.t.decode(t,{stream:!0}),r),void(r&&(this.t.decode().length&&I(8),this.t=null));this.p||I(4);var e=new n(this.p.length+t.length);e.set(this.p),e.set(t,this.p.length);var i=$t(e),o=i.s,s=i.r;r?(s.length&&I(8),this.p=null):this.p=s,this.ondata(o,r)},t}();_e.DecodeUTF8=_t;var tn=function(){function t(t){this.ondata=t}return t.prototype.push=function(t,n){this.ondata||I(5),this.d&&I(4),this.ondata(nn(t),this.d=n||!1)},t}();function nn(t,r){if(r){for(var e=new n(t.length),i=0;i<t.length;++i)e[i]=t.charCodeAt(i);return e}if(Vt)return Vt.encode(t);var o=t.length,s=new n(t.length+(t.length>>1)),a=0,u=function(t){s[a++]=t};for(i=0;i<o;++i){if(a+5>s.length){var h=new n(a+8+(o-i<<1));h.set(s),s=h}var f=t.charCodeAt(i);f<128||r?u(f):f<2048?(u(192|f>>6),u(128|63&f)):f>55295&&f<57344?(u(240|(f=65536+(1047552&f)|1023&t.charCodeAt(++i))>>18),u(128|f>>12&63),u(128|f>>6&63),u(128|63&f)):(u(224|f>>12),u(128|f>>6&63),u(128|63&f))}return D(s,0,a)}function rn(t,n){if(n){for(var r="",e=0;e<t.length;e+=16384)r+=String.fromCharCode.apply(null,t.subarray(e,e+16384));return r}if(Wt)return Wt.decode(t);var i=$t(t),o=i.s;return(r=i.r).length&&I(8),o}_e.EncodeUTF8=tn,_e.strToU8=nn,_e.strFromU8=rn;var en=function(t){return 1==t?3:t<6?2:9==t?1:0},on=function(t,n){return n+30+ht(t,n+26)+ht(t,n+28)},sn=function(t,n,r){var e=ht(t,n+28),i=rn(t.subarray(n+46,n+46+e),!(2048&ht(t,n+8))),o=n+46+e,s=ft(t,n+20),a=r&&4294967295==s?an(t,o):[s,ft(t,n+24),ft(t,n+42)],u=a[0],h=a[1],f=a[2];return[ht(t,n+10),u,h,i,o+ht(t,n+30)+ht(t,n+32),f]},an=function(t,n){for(;1!=ht(t,n);n+=4+ht(t,n+2));return[ct(t,n+12),ct(t,n+4),ct(t,n+20)]},un=function(t){var n=0;if(t)for(var r in t){var e=t[r].length;e>65535&&I(9),n+=e+4}return n},hn=function(t,n,r,e,i,o,s,a){var u=e.length,h=r.extra,f=a&&a.length,c=un(h);lt(t,n,null!=s?33639248:67324752),n+=4,null!=s&&(t[n++]=20,t[n++]=r.os),t[n]=20,n+=2,t[n++]=r.flag<<1|(o<0&&8),t[n++]=i&&8,t[n++]=255&r.compression,t[n++]=r.compression>>8;var l=new Date(null==r.mtime?Date.now():r.mtime),p=l.getFullYear()-1980;if((p<0||p>119)&&I(10),lt(t,n,p<<25|l.getMonth()+1<<21|l.getDate()<<16|l.getHours()<<11|l.getMinutes()<<5|l.getSeconds()>>1),n+=4,-1!=o&&(lt(t,n,r.crc),lt(t,n+4,o<0?-o-2:o),lt(t,n+8,r.size)),lt(t,n+12,u),lt(t,n+14,c),n+=16,null!=s&&(lt(t,n,f),lt(t,n+6,r.attrs),lt(t,n+10,s),n+=14),t.set(e,n),n+=u,c)for(var v in h){var d=h[v],g=d.length;lt(t,n,+v),lt(t,n+2,g),t.set(d,n+4),n+=4+g}return f&&(t.set(a,n),n+=f),n},fn=function(t,n,r,e,i){lt(t,n,101010256),lt(t,n+8,r),lt(t,n+10,r),lt(t,n+12,e),lt(t,n+16,i)},cn=function(){function t(t){this.filename=t,this.c=Y(),this.size=0,this.compression=0}return t.prototype.process=function(t,n){this.ondata(null,t,n)},t.prototype.push=function(t,n){this.ondata||I(5),this.c.p(t),this.size+=t.length,n&&(this.crc=this.c.d()),this.process(t,n||!1)},t}();_e.ZipPassThrough=cn;var ln=function(){function t(t,n){var r=this;n||(n={}),cn.call(this,t),this.d=new wt(n,(function(t,n){r.ondata(null,t,n)})),this.compression=8,this.flag=en(n.level)}return t.prototype.process=function(t,n){try{this.d.push(t,n)}catch(t){this.ondata(t,null,n)}},t.prototype.push=function(t,n){cn.prototype.push.call(this,t,n)},t}();_e.ZipDeflate=ln;var pn=function(){function t(t,n){var r=this;n||(n={}),cn.call(this,t),this.d=new xt(n,(function(t,n,e){r.ondata(t,n,e)})),this.compression=8,this.flag=en(n.level),this.terminate=this.d.terminate}return t.prototype.process=function(t,n){this.d.push(t,n)},t.prototype.push=function(t,n){cn.prototype.push.call(this,t,n)},t}();_e.AsyncZipDeflate=pn;var vn=function(){function t(t){this.ondata=t,this.u=[],this.d=1}return t.prototype.add=function(t){var r=this;if(this.ondata||I(5),2&this.d)this.ondata(I(4+8*(1&this.d),0,1),null,!1);else{var e=nn(t.filename),i=e.length,o=t.comment,s=o&&nn(o),a=i!=t.filename.length||s&&o.length!=s.length,u=i+un(t.extra)+30;i>65535&&this.ondata(I(11,0,1),null,!1);var h=new n(u);hn(h,0,t,e,a,-1);var f=[h],c=function(){for(var t=0,n=f;t<n.length;t++)r.ondata(null,n[t],!1);f=[]},l=this.d;this.d=0;var p=this.u.length,v=Q(t,{f:e,u:a,o:s,t:function(){t.terminate&&t.terminate()},r:function(){if(c(),l){var t=r.u[p+1];t?t.r():r.d=1}l=1}}),d=0;t.ondata=function(e,i,o){if(e)r.ondata(e,i,o),r.terminate();else if(d+=i.length,f.push(i),o){var s=new n(16);lt(s,0,134695760),lt(s,4,t.crc),lt(s,8,d),lt(s,12,t.size),f.push(s),v.c=d,v.b=u+d+16,v.crc=t.crc,v.size=t.size,l&&v.r(),l=1}else l&&c()},this.u.push(v)}},t.prototype.end=function(){var t=this;2&this.d?this.ondata(I(4+8*(1&this.d),0,1),null,!0):(this.d?this.e():this.u.push({r:function(){1&t.d&&(t.u.splice(-1,1),t.e())},t:function(){}}),this.d=3)},t.prototype.e=function(){for(var t=0,r=0,e=0,i=0,o=this.u;i<o.length;i++)e+=46+(h=o[i]).f.length+un(h.extra)+(h.o?h.o.length:0);for(var s=new n(e+22),a=0,u=this.u;a<u.length;a++){var h;hn(s,t,h=u[a],h.f,h.u,-h.c-2,r,h.o),t+=46+h.f.length+un(h.extra)+(h.o?h.o.length:0),r+=h.b}fn(s,t,this.u.length,e,r),this.ondata(null,s,!0),this.d=2},t.prototype.terminate=function(){for(var t=0,n=this.u;t<n.length;t++)n[t].t();this.d=2},t}();function dn(t,r,e){e||(e=r,r={}),"function"!=typeof e&&I(7);var i={};Rt(t,"",i,r);var o=Object.keys(i),s=o.length,a=0,u=0,h=s,f=Array(s),c=[],l=function(){for(var t=0;t<c.length;++t)c[t]()},p=function(t,n){xn((function(){e(t,n)}))};xn((function(){p=e}));var v=function(){var t=new n(u+22),r=a,e=u-a;u=0;for(var i=0;i<h;++i){var o=f[i];try{var s=o.c.length;hn(t,u,o,o.f,o.u,s);var c=30+o.f.length+un(o.extra),l=u+c;t.set(o.c,l),hn(t,a,o,o.f,o.u,s,u,o.m),a+=16+c+(o.m?o.m.length:0),u=l+s}catch(t){return p(t,null)}}fn(t,a,f.length,e,r),p(null,t)};s||v();for(var d=function(t){var n=o[t],r=i[n],e=r[0],h=r[1],d=Y(),g=e.length;d.p(e);var y=nn(n),m=y.length,b=h.comment,w=b&&nn(b),x=w&&w.length,z=un(h.extra),k=0==h.level?0:8,M=function(r,e){if(r)l(),p(r,null);else{var i=e.length;f[t]=Q(h,{size:g,crc:d.d(),c:e,f:y,m:w,u:m!=n.length||w&&b.length!=x,compression:k}),a+=30+m+z+i,u+=76+2*(m+z)+(x||0)+i,--s||v()}};if(m>65535&&M(I(11,0,1),null),k)if(g<16e4)try{M(null,kt(e,h))}catch(t){M(t,null)}else c.push(zt(e,h,M));else M(null,e)},g=0;g<h;++g)d(g);return l}function gn(t,r){r||(r={});var e={},i=[];Rt(t,"",e,r);var o=0,s=0;for(var a in e){var u=e[a],h=u[0],f=u[1],c=0==f.level?0:8,l=(M=nn(a)).length,p=f.comment,v=p&&nn(p),d=v&&v.length,g=un(f.extra);l>65535&&I(11);var y=c?kt(h,f):h,m=y.length,b=Y();b.p(h),i.push(Q(f,{size:h.length,crc:b.d(),c:y,f:M,m:v,u:l!=a.length||v&&p.length!=d,o:o,compression:c})),o+=30+l+g+m,s+=76+2*(l+g)+(d||0)+m}for(var w=new n(s+22),x=o,z=s-o,k=0;k<i.length;++k){var M;hn(w,(M=i[k]).o,M,M.f,M.u,M.c.length);var A=30+M.f.length+un(M.extra);w.set(M.c,M.o+A),hn(w,o,M,M.f,M.u,M.c.length,M.o,M.m),o+=16+A+(M.m?M.m.length:0)}return fn(w,o,i.length,z,x),w}_e.Zip=vn,_e.zip=dn,_e.zipSync=gn;var yn=function(){function t(){}return t.prototype.push=function(t,n){this.ondata(null,t,n)},t.compression=0,t}();_e.UnzipPassThrough=yn;var mn=function(){function t(){var t=this;this.i=new Mt((function(n,r){t.ondata(null,n,r)}))}return t.prototype.push=function(t,n){try{this.i.push(t,n)}catch(t){this.ondata(t,null,n)}},t.compression=8,t}();_e.UnzipInflate=mn;var bn=function(){function t(t,n){var r=this;n<32e4?this.i=new Mt((function(t,n){r.ondata(null,t,n)})):(this.i=new At((function(t,n,e){r.ondata(t,n,e)})),this.terminate=this.i.terminate)}return t.prototype.push=function(t,n){this.i.terminate&&(t=D(t,0)),this.i.push(t,n)},t.compression=8,t}();_e.AsyncUnzipInflate=bn;var wn=function(){function t(t){this.onfile=t,this.k=[],this.o={0:yn},this.p=N}return t.prototype.push=function(t,r){var e=this;if(this.onfile||I(5),this.p||I(4),this.c>0){var i=Math.min(this.c,t.length),o=t.subarray(0,i);if(this.c-=i,this.d?this.d.push(o,!this.c):this.k[0].push(o),(t=t.subarray(i)).length)return this.push(t,r)}else{var s=0,a=0,u=void 0,h=void 0;this.p.length?t.length?((h=new n(this.p.length+t.length)).set(this.p),h.set(t,this.p.length)):h=this.p:h=t;for(var f=h.length,c=this.c,l=c&&this.d,p=function(){var t,n=ft(h,a);if(67324752==n){s=1,u=a,v.d=null,v.c=0;var r=ht(h,a+6),i=ht(h,a+8),o=2048&r,l=8&r,p=ht(h,a+26),d=ht(h,a+28);if(f>a+30+p+d){var g=[];v.k.unshift(g),s=2;var y,m=ft(h,a+18),b=ft(h,a+22),w=rn(h.subarray(a+30,a+=30+p),!o);4294967295==m?(t=l?[-2]:an(h,a),m=t[0],b=t[1]):l&&(m=-1),a+=d,v.c=m;var x={name:w,compression:i,start:function(){if(x.ondata||I(5),m){var t=e.o[i];t||x.ondata(I(14,"unknown compression type "+i,1),null,!1),(y=m<0?new t(w):new t(w,m,b)).ondata=function(t,n,r){x.ondata(t,n,r)};for(var n=0,r=g;n<r.length;n++)y.push(r[n],!1);e.k[0]==g&&e.c?e.d=y:y.push(N,!0)}else x.ondata(null,N,!0)},terminate:function(){y&&y.terminate&&y.terminate()}};m>=0&&(x.size=m,x.originalSize=b),v.onfile(x)}return"break"}if(c){if(134695760==n)return u=a+=12+(-2==c&&8),s=3,v.c=0,"break";if(33639248==n)return u=a-=4,s=3,v.c=0,"break"}},v=this;a<f-4&&"break"!==p();++a);if(this.p=N,c<0){var d=h.subarray(0,s?u-12-(-2==c&&8)-(134695760==ft(h,u-16)&&4):a);l?l.push(d,!!s):this.k[+(2==s)].push(d)}if(2&s)return this.push(h.subarray(a),r);this.p=h.subarray(a)}r&&(this.c&&I(13),this.p=null)},t.prototype.register=function(t){this.o[t.compression]=t},t}();_e.Unzip=wn;var xn="function"==typeof queueMicrotask?queueMicrotask:"function"==typeof setTimeout?setTimeout:function(t){t()};function zn(t,r,e){e||(e=r,r={}),"function"!=typeof e&&I(7);var i=[],o=function(){for(var t=0;t<i.length;++t)i[t]()},s={},a=function(t,n){xn((function(){e(t,n)}))};xn((function(){a=e}));for(var u=t.length-22;101010256!=ft(t,u);--u)if(!u||t.length-u>65558)return a(I(13,0,1),null),o;var h=ht(t,u+8);if(h){var f=h,c=ft(t,u+16),l=4294967295==c||65535==f;if(l){var p=ft(t,u-12);(l=101075792==ft(t,p))&&(f=h=ft(t,p+32),c=ft(t,p+48))}for(var v=r&&r.filter,d=function(r){var e=sn(t,c,l),u=e[0],f=e[1],p=e[2],d=e[3],g=e[4],y=on(t,e[5]);c=g;var m=function(t,n){t?(o(),a(t,null)):(n&&(s[d]=n),--h||a(null,s))};if(!v||v({name:d,size:f,originalSize:p,compression:u}))if(u)if(8==u){var b=t.subarray(y,y+f);if(f<32e4)try{m(null,Tt(b,{out:new n(p)}))}catch(t){m(t,null)}else i.push(St(b,{size:p},m))}else m(I(14,"unknown compression type "+u,1),null);else m(null,D(t,y,y+f));else m(null,null)},g=0;g<f;++g)d()}else a(null,{});return o}function kn(t,r){for(var e={},i=t.length-22;101010256!=ft(t,i);--i)(!i||t.length-i>65558)&&I(13);var o=ht(t,i+8);if(!o)return{};var s=ft(t,i+16),a=4294967295==s||65535==o;if(a){var u=ft(t,i-12);(a=101075792==ft(t,u))&&(o=ft(t,u+32),s=ft(t,u+48))}for(var h=r&&r.filter,f=0;f<o;++f){var c=sn(t,s,a),l=c[0],p=c[1],v=c[2],d=c[3],g=c[4],y=on(t,c[5]);s=g,h&&!h({name:d,size:p,originalSize:v,compression:l})||(l?8==l?e[d]=Tt(t.subarray(y,y+p),{out:new n(v)}):I(14,"unknown compression type "+l):e[d]=D(t,y,y+p))}return e}_e.unzip=zn,_e.unzipSync=kn;return _e});
    return scope.fflate || (module && module.exports);
  })();
  const STORAGE_KEY = 'mini_exceler_autosave_v1';
  const ROW_COUNT = 120;
  const COL_COUNT = 40;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const XP_DEBOUNCE_MS = 500;
  const FORMAT_XP_THRESHOLD = 3;

  const FORMAT_PRESETS = {
    general: { numFmtId: 0, pattern: 'General' },
    number: { numFmtId: 2, pattern: '0.00' },
    currency: { numFmtId: 164, pattern: '\u00a5#,##0.00' },
    percent: { numFmtId: 10, pattern: '0.00%' }
  };

  const DEFAULT_STYLE = {
    bold: false,
    italic: false,
    underline: false,
    textColor: '#f8fafc',
    fillColor: 'transparent',
    horizontalAlign: 'left',
    verticalAlign: 'middle',
    fontSize: 14
  };

  const SUPPORTED_FUNCTIONS = new Set([
    'SUM','AVERAGE','MIN','MAX','COUNT','COUNTA','IF','ROUND','ROUNDUP','ROUNDDOWN','ABS','INT','MOD','POWER','SQRT','CONCAT','TEXT','LEN','SUBTOTAL'
  ]);

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function colToLetter(index){
    let n = index + 1;
    let letters = '';
    while (n > 0){
      const rem = (n - 1) % 26;
      letters = String.fromCharCode(65 + rem) + letters;
      n = Math.floor((n - 1) / 26);
    }
    return letters;
  }

  function letterToCol(str){
    let result = 0;
    for (let i = 0; i < str.length; i++){
      result = result * 26 + (str.charCodeAt(i) - 64);
    }
    return result - 1;
  }

  function cellKey(col, row){
    return colToLetter(col) + (row + 1);
  }

  function parseCellRef(ref){
    const match = /^([A-Za-z]+)(\d+)$/.exec(ref);
    if (!match) return null;
    return {
      col: letterToCol(match[1].toUpperCase()),
      row: parseInt(match[2], 10) - 1
    };
  }

  function normalizeRange(a, b){
    const startCol = Math.min(a.col, b.col);
    const endCol = Math.max(a.col, b.col);
    const startRow = Math.min(a.row, b.row);
    const endRow = Math.max(a.row, b.row);
    return { startCol, endCol, startRow, endRow };
  }

  function cloneCell(cell){
    if (!cell) return null;
    return {
      value: cell.value,
      formula: cell.formula,
      type: cell.type,
      format: cell.format,
      style: Object.assign({}, cell.style),
      computed: cell.computed ? Object.assign({}, cell.computed) : null
    };
  }

  function createEmptyCell(){
    return {
      value: '',
      formula: null,
      type: 'text',
      format: 'general',
      style: Object.assign({}, DEFAULT_STYLE),
      computed: { display: '', raw: '', type: 'blank' }
    };
  }

  function expandRange(range){
    const cells = [];
    for (let r = range.startRow; r <= range.endRow; r++){
      for (let c = range.startCol; c <= range.endCol; c++){
        cells.push(cellKey(c, r));
      }
    }
    return cells;
  }

  function evaluateNumber(value){
    const num = Number(value);
    return Number.isFinite(num) ? num : NaN;
  }

  function escapeXml(value){
    return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatDisplay(value, cell){
    if (value == null) return '';
    if (typeof value === 'number' && Number.isFinite(value)){
      switch (cell.format){
        case 'number':
          return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        case 'currency':
          return value.toLocaleString(undefined, { style: 'currency', currency: 'JPY' });
        case 'percent':
          return (value * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
        default:
          return String(value);
      }
    }
    if (typeof value === 'boolean'){
      return value ? 'TRUE' : 'FALSE';
    }
    return String(value);
  }
  function create(root, awardXp){
    if (!root) throw new Error('MiniExp exceler requires a root element');

    const state = {
      cells: new Map(),
      rows: ROW_COUNT,
      cols: COL_COUNT,
      selection: { startRow: 0, startCol: 0, endRow: 0, endCol: 0 },
      clipboard: null,
      undoStack: [],
      redoStack: [],
      dirty: false,
      filename: '新しいブック.xlsx',
      sessionXp: 0,
      lastEditXpAt: 0,
      formatOps: 0,
      warning: '',
      running: false,
      autoSaveTimer: null,
      isSelecting: false
    };

    const elements = {};
    const cellElements = new Map();

    function award(type, amount){
      if (typeof awardXp === 'function'){
        if (type === 'edit'){
          const now = Date.now();
          if (now - state.lastEditXpAt < XP_DEBOUNCE_MS) return;
          state.lastEditXpAt = now;
        }
        awardXp(amount, { type });
        state.sessionXp += amount;
        updateStatusBar();
      }
    }

    function pushUndo(delta){
      state.undoStack.push(delta);
      if (state.undoStack.length > 50){
        state.undoStack.shift();
      }
      state.redoStack.length = 0;
    }

    function createDelta(changes){
      const before = new Map();
      const after = new Map();
      changes.forEach((change, key) => {
        before.set(key, change.before ? cloneCell(change.before) : null);
        after.set(key, change.after ? cloneCell(change.after) : null);
      });
      return { before, after };
    }

    function applyDelta(delta, direction){
      const entries = direction === 'undo' ? delta.before : delta.after;
      entries.forEach((value, key) => {
        if (value){
          state.cells.set(key, cloneCell(value));
        } else {
          state.cells.delete(key);
        }
        updateCellElement(key);
      });
      recalcAll();
      state.dirty = true;
      updateNameAndFormula();
      autoSaveLater();
    }

    function clearSelection(){
      const { startRow, startCol, endRow, endCol } = state.selection;
      for (let r = startRow; r <= endRow; r++){
        for (let c = startCol; c <= endCol; c++){
          const ref = cellKey(c, r);
          const el = cellElements.get(ref);
          if (el){
            el.classList.remove('exceler-selected', 'exceler-anchor');
          }
        }
      }
    }

    function applySelection(sel){
      clearSelection();
      state.selection = sel;
      const { startRow, startCol, endRow, endCol } = sel;
      for (let r = startRow; r <= endRow; r++){
        for (let c = startCol; c <= endCol; c++){
          const ref = cellKey(c, r);
          const el = cellElements.get(ref);
          if (el){
            el.classList.add('exceler-selected');
            if (r === startRow && c === startCol) el.classList.add('exceler-anchor');
          }
        }
      }
      updateNameAndFormula();
    }

    function updateNameAndFormula(){
      const { startRow, startCol } = state.selection;
      const ref = cellKey(startCol, startRow);
      elements.nameBox.value = ref;
      const cell = state.cells.get(ref);
      if (cell){
        if (cell.formula){
          elements.formulaInput.value = '=' + cell.formula;
        } else {
          elements.formulaInput.value = cell.value ?? '';
        }
      } else {
        elements.formulaInput.value = '';
      }
      updateStatusBar();
    }

    function updateStatusBar(){
      const { startRow, startCol } = state.selection;
      const ref = cellKey(startCol, startRow);
      const cell = state.cells.get(ref);
      let info = ref;
      if (cell){
        info += ' | ' + (cell.format || 'general');
        if (cell.computed){
          info += ' | ' + cell.computed.type;
        }
      }
      elements.statusInfo.textContent = info;
      elements.statusXp.textContent = `Session EXP: ${state.sessionXp}`;
      elements.statusWarn.textContent = state.warning || '';
      elements.statusWarn.style.display = state.warning ? 'block' : 'none';
    }

    function createHeader(){
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.padding = '16px 20px';
      header.style.background = 'linear-gradient(90deg, rgba(30,64,175,0.65), rgba(15,23,42,0.85))';
      header.style.color = '#e0f2fe';
      header.style.borderBottom = '1px solid rgba(148,163,184,0.35)';

      const titleWrap = document.createElement('div');
      titleWrap.style.display = 'flex';
      titleWrap.style.flexDirection = 'column';
      titleWrap.style.gap = '4px';

      const title = document.createElement('h2');
      title.textContent = '表計算エクセラー';
      title.style.margin = '0';
      title.style.fontSize = '20px';
      title.style.letterSpacing = '0.03em';

      const subtitle = document.createElement('div');
      subtitle.textContent = state.filename;
      subtitle.style.fontSize = '13px';
      subtitle.style.opacity = '0.85';

      titleWrap.appendChild(title);
      titleWrap.appendChild(subtitle);

      const buttonRow = document.createElement('div');
      buttonRow.style.display = 'flex';
      buttonRow.style.gap = '10px';

      buttonRow.appendChild(createButton('新規', handleNewWorkbook));
      buttonRow.appendChild(createButton('インポート', openImportDialog));
      buttonRow.appendChild(createButton('エクスポート', handleExport));
      const warnBtn = createButton('互換性', showCompatibilityModal);
      warnBtn.style.background = 'rgba(248,113,113,0.15)';
      warnBtn.style.color = '#fecaca';
      warnBtn.style.borderColor = 'rgba(248,113,113,0.25)';
      buttonRow.appendChild(warnBtn);

      header.appendChild(titleWrap);
      header.appendChild(buttonRow);

      elements.subtitle = subtitle;
      return header;
    }

    function createButton(label, onClick){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.padding = '8px 16px';
      btn.style.borderRadius = '8px';
      btn.style.border = '1px solid rgba(148,163,184,0.25)';
      btn.style.background = 'rgba(30,64,175,0.2)';
      btn.style.color = '#e0f2fe';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '600';
      btn.addEventListener('click', onClick);
      return btn;
    }

    function createToolButton(label, onClick){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.padding = '8px 12px';
      btn.style.borderRadius = '8px';
      btn.style.border = '1px solid rgba(148,163,184,0.2)';
      btn.style.background = 'rgba(30,41,59,0.6)';
      btn.style.color = '#e2e8f0';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '12px';
      btn.addEventListener('click', onClick);
      return btn;
    }

    function createToggleButton(label, styleKey){
      const btn = createToolButton(label, () => {
        toggleFormat(styleKey);
      });
      btn.dataset.styleKey = styleKey;
      return btn;
    }

    function createToolbar(){
      const toolbar = document.createElement('div');
      toolbar.style.display = 'grid';
      toolbar.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
      toolbar.style.gap = '10px';
      toolbar.style.padding = '16px 20px';
      toolbar.style.background = 'rgba(15,23,42,0.75)';
      toolbar.style.borderBottom = '1px solid rgba(148,163,184,0.2)';

      const undoBtn = createToolButton('↺ 元に戻す', handleUndo);
      const redoBtn = createToolButton('↻ やり直し', handleRedo);
      const boldBtn = createToggleButton('B', 'bold');
      boldBtn.style.fontWeight = '700';
      const italicBtn = createToggleButton('I', 'italic');
      italicBtn.style.fontStyle = 'italic';
      const underlineBtn = createToggleButton('U', 'underline');
      underlineBtn.style.textDecoration = 'underline';

      const fontSize = document.createElement('input');
      fontSize.type = 'number';
      fontSize.min = '8';
      fontSize.max = '32';
      fontSize.value = '14';
      fontSize.title = 'フォントサイズ';
      fontSize.style.background = 'rgba(30,41,59,0.6)';
      fontSize.style.border = '1px solid rgba(148,163,184,0.25)';
      fontSize.style.color = '#e2e8f0';
      fontSize.style.borderRadius = '8px';
      fontSize.style.padding = '8px 10px';
      fontSize.addEventListener('change', () => applyFormat({ fontSize: clamp(parseInt(fontSize.value, 10) || 14, 8, 32) }));

      const textColor = document.createElement('input');
      textColor.type = 'color';
      textColor.value = '#f8fafc';
      textColor.addEventListener('input', () => applyFormat({ textColor: textColor.value }));

      const fillColor = document.createElement('input');
      fillColor.type = 'color';
      fillColor.value = '#0f172a';
      fillColor.addEventListener('input', () => applyFormat({ fillColor: fillColor.value }));

      const alignLeft = createToolButton('⟸ 左寄せ', () => applyFormat({ horizontalAlign: 'left' }));
      const alignCenter = createToolButton('⇔ 中央', () => applyFormat({ horizontalAlign: 'center' }));
      const alignRight = createToolButton('⟹ 右寄せ', () => applyFormat({ horizontalAlign: 'right' }));
      const alignTop = createToolButton('⇑ 上', () => applyFormat({ verticalAlign: 'top' }));
      const alignMiddle = createToolButton('⇕ 中央', () => applyFormat({ verticalAlign: 'middle' }));
      const alignBottom = createToolButton('⇓ 下', () => applyFormat({ verticalAlign: 'bottom' }));

      const formatSelect = document.createElement('select');
      formatSelect.style.background = 'rgba(30,41,59,0.6)';
      formatSelect.style.border = '1px solid rgba(148,163,184,0.25)';
      formatSelect.style.color = '#e2e8f0';
      formatSelect.style.borderRadius = '8px';
      formatSelect.style.padding = '8px 10px';
      [['general','標準'],['number','数値'],['currency','通貨'],['percent','パーセント']].forEach(([value,label]) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        formatSelect.appendChild(opt);
      });
      formatSelect.addEventListener('change', () => applyFormat({ format: formatSelect.value }));

      toolbar.appendChild(undoBtn);
      toolbar.appendChild(redoBtn);
      toolbar.appendChild(boldBtn);
      toolbar.appendChild(italicBtn);
      toolbar.appendChild(underlineBtn);
      toolbar.appendChild(fontSize);
      toolbar.appendChild(textColor);
      toolbar.appendChild(fillColor);
      toolbar.appendChild(alignLeft);
      toolbar.appendChild(alignCenter);
      toolbar.appendChild(alignRight);
      toolbar.appendChild(alignTop);
      toolbar.appendChild(alignMiddle);
      toolbar.appendChild(alignBottom);
      toolbar.appendChild(formatSelect);

      elements.boldBtn = boldBtn;
      elements.italicBtn = italicBtn;
      elements.underlineBtn = underlineBtn;
      elements.formatSelect = formatSelect;

      return toolbar;
    }

    function createFormulaBar(){
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.gap = '12px';
      wrap.style.padding = '12px 20px';
      wrap.style.alignItems = 'center';
      wrap.style.background = 'rgba(15,23,42,0.65)';
      wrap.style.borderBottom = '1px solid rgba(148,163,184,0.18)';

      const nameBox = document.createElement('input');
      nameBox.type = 'text';
      nameBox.readOnly = true;
      nameBox.style.width = '80px';
      nameBox.style.background = 'rgba(30,41,59,0.6)';
      nameBox.style.border = '1px solid rgba(148,163,184,0.25)';
      nameBox.style.color = '#e2e8f0';
      nameBox.style.borderRadius = '8px';
      nameBox.style.padding = '8px';

      const formulaInput = document.createElement('input');
      formulaInput.type = 'text';
      formulaInput.placeholder = '数式を入力 (例: =SUM(A1:B3))';
      formulaInput.style.flex = '1';
      formulaInput.style.background = 'rgba(30,41,59,0.6)';
      formulaInput.style.border = '1px solid rgba(148,163,184,0.25)';
      formulaInput.style.color = '#e2e8f0';
      formulaInput.style.borderRadius = '8px';
      formulaInput.style.padding = '8px 12px';
      formulaInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter'){
          commitFormula(formulaInput.value);
          event.preventDefault();
        } else if (event.key === 'Escape'){
          updateNameAndFormula();
          event.preventDefault();
        }
      });

      wrap.appendChild(nameBox);
      wrap.appendChild(formulaInput);

      elements.nameBox = nameBox;
      elements.formulaInput = formulaInput;
      return wrap;
    }

    function createGrid(){
      const viewport = document.createElement('div');
      viewport.style.flex = '1';
      viewport.style.overflow = 'auto';
      viewport.style.position = 'relative';
      viewport.style.background = 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12), rgba(15,23,42,0.92))';

      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = `80px repeat(${COL_COUNT}, minmax(100px, 1fr))`;
      grid.style.gridAutoRows = '28px';
      grid.style.minWidth = '100%';

      for (let r = -1; r < ROW_COUNT; r++){
        for (let c = -1; c < COL_COUNT; c++){
          const cell = document.createElement('div');
          cell.style.borderRight = '1px solid rgba(148,163,184,0.12)';
          cell.style.borderBottom = '1px solid rgba(148,163,184,0.12)';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.padding = '0 8px';
          cell.style.fontFamily = '"Segoe UI", "Hiragino Sans", sans-serif';
          cell.style.fontSize = '14px';
          cell.style.color = '#e2e8f0';
          cell.style.background = (r === -1 || c === -1) ? 'rgba(15,23,42,0.9)' : 'rgba(15,23,42,0.55)';
          cell.style.fontWeight = (r === -1 || c === -1) ? '600' : '400';
          cell.style.userSelect = 'none';
          cell.style.position = 'relative';

          if (r === -1 && c === -1){
            cell.textContent = '';
          } else if (r === -1){
            cell.textContent = colToLetter(c);
            cell.style.justifyContent = 'center';
          } else if (c === -1){
            cell.textContent = String(r + 1);
            cell.style.justifyContent = 'center';
          } else {
            const ref = cellKey(c, r);
            cell.dataset.ref = ref;
            cell.tabIndex = -1;
            cell.style.cursor = 'cell';
            cell.addEventListener('mousedown', (event) => {
              event.preventDefault();
              startSelection(r, c);
            });
            cell.addEventListener('mousemove', (event) => {
              if (event.buttons === 1 && state.isSelecting){
                extendSelection(r, c);
              }
            });
            cell.addEventListener('mouseup', () => {
              state.isSelecting = false;
            });
            cell.addEventListener('dblclick', () => startInlineEdit(ref));
            cell.addEventListener('keydown', handleCellKeyDown);
            cellElements.set(ref, cell);
          }
          grid.appendChild(cell);
        }
      }

      viewport.addEventListener('mousedown', () => {
        state.isSelecting = true;
      });
      viewport.addEventListener('mouseup', () => {
        state.isSelecting = false;
      });

      elements.grid = grid;
      elements.viewport = viewport;
      viewport.appendChild(grid);
      return viewport;
    }

    function createStatusBar(){
      const bar = document.createElement('div');
      bar.style.display = 'flex';
      bar.style.justifyContent = 'space-between';
      bar.style.alignItems = 'center';
      bar.style.padding = '10px 20px';
      bar.style.background = 'rgba(15,23,42,0.88)';
      bar.style.borderTop = '1px solid rgba(148,163,184,0.2)';
      bar.style.fontSize = '12px';
      bar.style.color = '#cbd5f5';

      const info = document.createElement('div');
      const warn = document.createElement('div');
      warn.style.color = '#fca5a5';
      warn.style.fontWeight = '600';
      warn.style.display = 'none';
      const xp = document.createElement('div');

      bar.appendChild(info);
      bar.appendChild(warn);
      bar.appendChild(xp);

      elements.statusInfo = info;
      elements.statusWarn = warn;
      elements.statusXp = xp;
      return bar;
    }

    function buildLayout(){
      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.background = '#0f172a';
      wrapper.style.borderRadius = '18px';
      wrapper.style.boxShadow = '0 32px 80px rgba(15,23,42,0.45)';
      wrapper.style.overflow = 'hidden';

      wrapper.appendChild(createHeader());
      wrapper.appendChild(createToolbar());
      wrapper.appendChild(createFormulaBar());
      wrapper.appendChild(createGrid());
      wrapper.appendChild(createStatusBar());

      elements.wrapper = wrapper;
      root.appendChild(wrapper);
    }

    function startSelection(row, col){
      state.isSelecting = true;
      applySelection({ startRow: row, startCol: col, endRow: row, endCol: col });
      focusCell(cellKey(col, row));
    }

    function extendSelection(row, col){
      const anchor = { row: state.selection.startRow, col: state.selection.startCol };
      const normalized = normalizeRange(anchor, { row, col });
      applySelection({ startRow: normalized.startRow, startCol: normalized.startCol, endRow: normalized.endRow, endCol: normalized.endCol });
    }

    function focusCell(ref){
      const el = cellElements.get(ref);
      if (el){
        el.focus({ preventScroll: true });
        scrollIntoView(el);
      }
    }

    function scrollIntoView(el){
      const rect = el.getBoundingClientRect();
      const parent = elements.viewport.getBoundingClientRect();
      if (rect.left < parent.left) elements.viewport.scrollLeft -= (parent.left - rect.left) + 10;
      if (rect.right > parent.right) elements.viewport.scrollLeft += (rect.right - parent.right) + 10;
      if (rect.top < parent.top) elements.viewport.scrollTop -= (parent.top - rect.top) + 10;
      if (rect.bottom > parent.bottom) elements.viewport.scrollTop += (rect.bottom - parent.bottom) + 10;
    }

    function handleCellKeyDown(event){
      const { key } = event;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab','Enter'].includes(key)){
        event.preventDefault();
        navigateSelection(key, event.shiftKey);
        return;
      }
      if (key === 'Delete' || key === 'Backspace'){
        event.preventDefault();
        clearSelectedCells();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'c'){
        event.preventDefault();
        copySelection();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'v'){
        event.preventDefault();
        pasteClipboard();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'z'){
        event.preventDefault();
        handleUndo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'y'){
        event.preventDefault();
        handleRedo();
        return;
      }
      if (key.length === 1 && !event.ctrlKey && !event.metaKey){
        event.preventDefault();
        startInlineEdit(cellKey(state.selection.startCol, state.selection.startRow), key);
      }
    }

    function navigateSelection(key){
      let row = state.selection.startRow;
      let col = state.selection.startCol;
      if (key === 'ArrowUp') row = Math.max(0, row - 1);
      if (key === 'ArrowDown' || key === 'Enter') row = Math.min(state.rows - 1, row + 1);
      if (key === 'ArrowLeft') col = Math.max(0, col - 1);
      if (key === 'ArrowRight' || key === 'Tab') col = Math.min(state.cols - 1, col + 1);
      applySelection({ startRow: row, startCol: col, endRow: row, endCol: col });
      focusCell(cellKey(col, row));
    }

    function startInlineEdit(ref, initialChar){
      const cellEl = cellElements.get(ref);
      if (!cellEl) return;
      const editor = document.createElement('textarea');
      editor.style.position = 'absolute';
      editor.style.zIndex = '30';
      editor.style.top = cellEl.offsetTop + 'px';
      editor.style.left = cellEl.offsetLeft + 'px';
      editor.style.width = cellEl.clientWidth + 'px';
      editor.style.height = cellEl.clientHeight + 'px';
      editor.style.fontSize = cellEl.style.fontSize;
      editor.style.fontFamily = cellEl.style.fontFamily;
      editor.style.color = '#0f172a';
      editor.style.background = '#f8fafc';
      editor.style.border = '2px solid #3b82f6';
      editor.style.boxSizing = 'border-box';
      const cell = state.cells.get(ref);
      editor.value = cell ? (cell.formula ? '=' + cell.formula : (cell.value ?? '')) : '';
      if (initialChar){
        editor.value = initialChar;
      }
      elements.viewport.appendChild(editor);
      editor.focus();
      editor.setSelectionRange(editor.value.length, editor.value.length);

      const commit = () => {
        commitFormula(editor.value);
        elements.viewport.removeChild(editor);
        focusCell(ref);
      };
      const cancel = () => {
        elements.viewport.removeChild(editor);
        focusCell(ref);
      };
      editor.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey){
          event.preventDefault();
          commit();
        } else if (event.key === 'Escape'){
          event.preventDefault();
          cancel();
        }
      });
      editor.addEventListener('blur', commit);
    }

    function commitFormula(text){
      const { startRow, startCol } = state.selection;
      const ref = cellKey(startCol, startRow);
      const beforeCell = cloneCell(state.cells.get(ref));
      const trimmed = (text || '').trim();
      if (!trimmed){
        state.cells.delete(ref);
        updateCellElement(ref);
        recalcAll();
        const diff = new Map([[ref, { before: beforeCell, after: null }]]);
        pushUndo(createDelta(diff));
        updateNameAndFormula();
        autoSaveLater();
        return;
      }
      const current = cloneCell(state.cells.get(ref) || createEmptyCell());
      if (trimmed.startsWith('=')){
        current.formula = trimmed.slice(1);
        current.value = '';
      } else {
        current.formula = null;
        current.value = trimmed;
      }
      state.cells.set(ref, current);
      updateCellElement(ref);
      recalcAll();
      const diff = new Map([[ref, { before: beforeCell, after: cloneCell(current) }]]);
      pushUndo(createDelta(diff));
      state.dirty = true;
      award('edit', 1);
      updateNameAndFormula();
      autoSaveLater();
    }
    function clearSelectedCells(){
      const { startRow, startCol, endRow, endCol } = state.selection;
      const diff = new Map();
      for (let r = startRow; r <= endRow; r++){
        for (let c = startCol; c <= endCol; c++){
          const ref = cellKey(c, r);
          if (state.cells.has(ref)){
            const beforeCell = cloneCell(state.cells.get(ref));
            state.cells.delete(ref);
            updateCellElement(ref);
            diff.set(ref, { before: beforeCell, after: null });
          }
        }
      }
      if (diff.size){
        recalcAll();
        pushUndo(createDelta(diff));
        state.dirty = true;
        award('edit', 1);
        updateNameAndFormula();
        autoSaveLater();
      }
    }

    function copySelection(){
      const { startRow, startCol, endRow, endCol } = state.selection;
      const rows = [];
      for (let r = startRow; r <= endRow; r++){
        const line = [];
        for (let c = startCol; c <= endCol; c++){
          const ref = cellKey(c, r);
          const cell = state.cells.get(ref);
          line.push(cell ? (cell.formula ? '=' + cell.formula : (cell.value ?? '')) : '');
        }
        rows.push(line);
      }
      const text = rows.map(row => row.join('\t')).join('\n');
      state.clipboard = rows;
      if (navigator.clipboard?.writeText){
        navigator.clipboard.writeText(text).catch(() => {});
      }
    }

    function pasteClipboard(){
      if (state.clipboard){
        pasteRows(state.clipboard);
        return;
      }
      if (navigator.clipboard?.readText){
        navigator.clipboard.readText().then(text => {
          const rows = text.split(/\r?\n/).map(line => line.split('\t'));
          state.clipboard = rows;
          pasteRows(rows);
        }).catch(() => {});
      }
    }

    function pasteRows(rows){
      const { startRow, startCol } = state.selection;
      const diff = new Map();
      rows.forEach((row, rIndex) => {
        row.forEach((value, cIndex) => {
          const targetRow = startRow + rIndex;
          const targetCol = startCol + cIndex;
          if (targetRow >= state.rows || targetCol >= state.cols) return;
          const ref = cellKey(targetCol, targetRow);
          const beforeCell = cloneCell(state.cells.get(ref));
          const trimmed = (value || '').trim();
          if (!trimmed){
            if (state.cells.has(ref)){
              state.cells.delete(ref);
              updateCellElement(ref);
              diff.set(ref, { before: beforeCell, after: null });
            }
            return;
          }
          const cell = cloneCell(state.cells.get(ref) || createEmptyCell());
          if (trimmed.startsWith('=')){
            cell.formula = trimmed.slice(1);
            cell.value = '';
          } else {
            cell.formula = null;
            cell.value = trimmed;
          }
          state.cells.set(ref, cell);
          updateCellElement(ref);
          diff.set(ref, { before: beforeCell, after: cloneCell(cell) });
        });
      });
      if (diff.size){
        recalcAll();
        pushUndo(createDelta(diff));
        state.dirty = true;
        award('edit', 1);
        updateNameAndFormula();
        autoSaveLater();
      }
    }

    function applyFormat(styleChanges){
      const { startRow, startCol, endRow, endCol } = state.selection;
      const diff = new Map();
      for (let r = startRow; r <= endRow; r++){
        for (let c = startCol; c <= endCol; c++){
          const ref = cellKey(c, r);
          const beforeCell = cloneCell(state.cells.get(ref));
          const cell = cloneCell(state.cells.get(ref) || createEmptyCell());
          cell.style = Object.assign({}, DEFAULT_STYLE, cell.style, styleChanges);
          if (styleChanges.format){
            cell.format = styleChanges.format;
          }
          state.cells.set(ref, cell);
          updateCellElement(ref);
          diff.set(ref, { before: beforeCell, after: cloneCell(cell) });
        }
      }
      if (diff.size){
        recalcAll();
        pushUndo(createDelta(diff));
        state.dirty = true;
        state.formatOps += 1;
        if (state.formatOps >= FORMAT_XP_THRESHOLD){
          award('format', 2);
          state.formatOps = 0;
        }
        autoSaveLater();
      }
    }

    function toggleFormat(styleKey){
      const { startRow, startCol, endRow, endCol } = state.selection;
      const diff = new Map();
      for (let r = startRow; r <= endRow; r++){
        for (let c = startCol; c <= endCol; c++){
          const ref = cellKey(c, r);
          const beforeCell = cloneCell(state.cells.get(ref));
          const cell = cloneCell(state.cells.get(ref) || createEmptyCell());
          cell.style = Object.assign({}, DEFAULT_STYLE, cell.style);
          cell.style[styleKey] = !cell.style[styleKey];
          state.cells.set(ref, cell);
          updateCellElement(ref);
          diff.set(ref, { before: beforeCell, after: cloneCell(cell) });
        }
      }
      if (diff.size){
        recalcAll();
        pushUndo(createDelta(diff));
        state.dirty = true;
        state.formatOps += 1;
        if (state.formatOps >= FORMAT_XP_THRESHOLD){
          award('format', 2);
          state.formatOps = 0;
        }
        autoSaveLater();
      }
    }

    function updateCellElement(ref){
      const cell = state.cells.get(ref);
      const el = cellElements.get(ref);
      if (!el) return;
      if (!cell){
        el.textContent = '';
        el.style.fontWeight = DEFAULT_STYLE.bold ? '600' : '400';
        el.style.fontStyle = DEFAULT_STYLE.italic ? 'italic' : 'normal';
        el.style.textDecoration = DEFAULT_STYLE.underline ? 'underline' : 'none';
        el.style.color = DEFAULT_STYLE.textColor;
        el.style.background = 'rgba(15,23,42,0.55)';
        el.style.justifyContent = 'flex-start';
        el.style.alignItems = 'center';
        return;
      }
      const computed = cell.computed || { display: cell.value || '', raw: cell.value || '', type: 'text' };
      el.textContent = computed.display ?? '';
      el.style.fontWeight = cell.style.bold ? '700' : '400';
      el.style.fontStyle = cell.style.italic ? 'italic' : 'normal';
      el.style.textDecoration = cell.style.underline ? 'underline' : 'none';
      el.style.color = cell.style.textColor || DEFAULT_STYLE.textColor;
      el.style.background = cell.style.fillColor === 'transparent' ? 'rgba(15,23,42,0.55)' : cell.style.fillColor;
      el.style.justifyContent = cell.style.horizontalAlign === 'center' ? 'center' : cell.style.horizontalAlign === 'right' ? 'flex-end' : 'flex-start';
      if (cell.style.verticalAlign === 'top') el.style.alignItems = 'flex-start';
      else if (cell.style.verticalAlign === 'bottom') el.style.alignItems = 'flex-end';
      else el.style.alignItems = 'center';
    }

    function recalcAll(){
      const cache = new Map();
      const visiting = new Set();

      function compute(ref){
        const key = ref.toUpperCase();
        if (cache.has(key)) return cache.get(key);
        if (visiting.has(key)){
          cache.set(key, '#CYCLE!');
          return '#CYCLE!';
        }
        visiting.add(key);
        const cell = state.cells.get(key);
        let raw = '';
        if (cell){
          if (cell.formula){
            try {
              raw = evaluateFormula(key, cell.formula, compute, cache, visiting);
            } catch (err){
              raw = '#ERROR!';
            }
          } else if (cell.value !== undefined && cell.value !== null && cell.value !== ''){
            const text = String(cell.value);
            if (text.trim() === ''){
              raw = '';
            } else if (!Number.isNaN(Number(text))){
              raw = Number(text);
            } else if (text.trim().toUpperCase() === 'TRUE' || text.trim().toUpperCase() === 'FALSE'){
              raw = text.trim().toUpperCase() === 'TRUE';
            } else {
              raw = text;
            }
          } else {
            raw = '';
          }
        } else {
          raw = '';
        }
        visiting.delete(key);
        cache.set(key, raw);
        return raw;
      }

      state.cells.forEach((cell, key) => {
        const raw = compute(key);
        let display = '';
        let type = 'blank';
        if (typeof raw === 'string' && raw.startsWith('#')){
          display = raw;
          type = 'error';
        } else if (typeof raw === 'number'){
          display = formatDisplay(raw, cell);
          type = 'number';
        } else if (typeof raw === 'boolean'){
          display = raw ? 'TRUE' : 'FALSE';
          type = 'boolean';
        } else if (raw != null && raw !== ''){
          display = String(raw);
          type = typeof raw === 'string' ? 'text' : typeof raw;
        } else {
          display = '';
          type = 'blank';
        }
        cell.computed = { display, raw, type };
        updateCellElement(key);
      });
      updateStatusBar();
    }

    function evaluateFormula(ref, expression, compute, cache, visiting){
      const tokens = tokenizeFormula(expression);
      const parser = createFormulaParser(tokens);
      const ast = parser.parseExpression();
      if (!parser.atEnd()){
        throw new Error('式の解析に失敗しました');
      }
      return evaluateNode(ast);

      function evaluateNode(node){
        switch (node.type){
          case 'number':
          case 'string':
          case 'boolean':
            return node.value;
          case 'cell':
            return getCellValue(node.ref);
          case 'range':
            return getRangeValues(node);
          case 'unary':
            const val = evaluateNode(node.argument);
            if (isError(val)) return val;
            if (node.op === '+') return toNumber(val);
            if (node.op === '-') return -toNumber(val);
            return 0;
          case 'binary':
            return evaluateBinary(node);
          case 'function':
            return evaluateFunction(node.name, node.args.map(evaluateNode));
          default:
            return 0;
        }
      }

      function evaluateBinary(node){
        const left = evaluateNode(node.left);
        if (isError(left)) return left;
        const right = evaluateNode(node.right);
        if (isError(right)) return right;
        switch (node.op){
          case '+': return toNumber(left) + toNumber(right);
          case '-': return toNumber(left) - toNumber(right);
          case '*': return toNumber(left) * toNumber(right);
          case '/':
            if (toNumber(right) === 0) return '#DIV/0!';
            return toNumber(left) / toNumber(right);
          case '^':
            return Math.pow(toNumber(left), toNumber(right));
          case '=': return normalizeValue(left) === normalizeValue(right);
          case '<>': return normalizeValue(left) !== normalizeValue(right);
          case '>': return toComparable(left) > toComparable(right);
          case '<': return toComparable(left) < toComparable(right);
          case '>=': return toComparable(left) >= toComparable(right);
          case '<=': return toComparable(left) <= toComparable(right);
          default:
            return 0;
        }
      }

      function evaluateFunction(name, args){
        const upper = name.toUpperCase();
        if (!SUPPORTED_FUNCTIONS.has(upper)){
          return '#NAME?';
        }
        const flatArgs = args.flatMap(arg => Array.isArray(arg) ? arg : [arg]);
        switch (upper){
          case 'SUM':
            return flatArgs.reduce((acc, val) => isNumber(val) ? acc + Number(val) : acc, 0);
          case 'AVERAGE': {
            const nums = flatArgs.filter(isNumber);
            if (!nums.length) return '#DIV/0!';
            return nums.reduce((a,b) => a + Number(b), 0) / nums.length;
          }
          case 'MIN': {
            const nums = flatArgs.filter(isNumber);
            if (!nums.length) return 0;
            return Math.min(...nums.map(Number));
          }
          case 'MAX': {
            const nums = flatArgs.filter(isNumber);
            if (!nums.length) return 0;
            return Math.max(...nums.map(Number));
          }
          case 'COUNT':
            return flatArgs.filter(isNumber).length;
          case 'COUNTA':
            return flatArgs.filter(v => v !== null && v !== undefined && v !== '').length;
          case 'IF': {
            const cond = args[0];
            const trueVal = args[1];
            const falseVal = args[2];
            const result = Array.isArray(cond) ? cond[0] : cond;
            return truthy(result) ? (Array.isArray(trueVal) ? trueVal[0] : trueVal) : (Array.isArray(falseVal) ? falseVal?.[0] : falseVal);
          }
          case 'ROUND':
            return roundTo(args[0], args[1]);
          case 'ROUNDUP':
            return roundTo(args[0], args[1], Math.ceil);
          case 'ROUNDDOWN':
            return roundTo(args[0], args[1], Math.floor);
          case 'ABS':
            return Math.abs(toNumber(args[0] ?? 0));
          case 'INT':
            return Math.trunc(toNumber(args[0] ?? 0));
          case 'MOD': {
            const dividend = toNumber(args[0] ?? 0);
            const divisor = toNumber(args[1] ?? 0);
            if (divisor === 0) return '#DIV/0!';
            return dividend % divisor;
          }
          case 'POWER':
            return Math.pow(toNumber(args[0] ?? 0), toNumber(args[1] ?? 0));
          case 'SQRT':
            return Math.sqrt(Math.max(0, toNumber(args[0] ?? 0)));
          case 'CONCAT':
            return flatArgs.map(v => v == null ? '' : String(v)).join('');
          case 'TEXT':
            return formatText(args[0], args[1]);
          case 'LEN':
            return String(Array.isArray(args[0]) ? args[0][0] ?? '' : args[0] ?? '').length;
          case 'SUBTOTAL':
            return subtotal(args);
          default:
            return '#NAME?';
        }
      }

      function subtotal(args){
        const code = Math.floor(toNumber(args[0] ?? 0));
        const values = args.slice(1).flatMap(v => Array.isArray(v) ? v : [v]).filter(v => !isError(v));
        switch (code){
          case 1: // AVERAGE
            return evaluateFunction('AVERAGE', [values]);
          case 2: // COUNT
            return evaluateFunction('COUNT', [values]);
          case 3: // COUNTA
            return evaluateFunction('COUNTA', [values]);
          case 4: // MAX
            return evaluateFunction('MAX', [values]);
          case 5: // MIN
            return evaluateFunction('MIN', [values]);
          case 6: // PRODUCT
            return values.filter(isNumber).reduce((acc, val) => acc * Number(val), 1);
          case 7: // STDEV (sample)
            return stdev(values.filter(isNumber), true);
          case 8: // STDEVP (population)
            return stdev(values.filter(isNumber), false);
          case 9: // SUM
            return evaluateFunction('SUM', [values]);
          default:
            return '#VALUE!';
        }
      }

      function stdev(nums, sample){
        if (!nums.length) return '#DIV/0!';
        const arr = nums.map(Number);
        const mean = arr.reduce((a,b) => a + b, 0) / arr.length;
        const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (sample ? (arr.length - 1 || 1) : arr.length);
        return Math.sqrt(variance);
      }

      function getCellValue(cellRef){
        const normalized = cellRef.toUpperCase();
        if (normalized === ref.toUpperCase()){
          // Self reference detection handled earlier, return 0 to avoid NaN
          return 0;
        }
        if (cache.has(normalized)){
          return cache.get(normalized);
        }
        const pos = parseCellRef(normalized);
        if (!pos) return 0;
        if (pos.row < 0 || pos.col < 0 || pos.row >= state.rows || pos.col >= state.cols) return 0;
        const value = compute(normalized);
        if (typeof value === 'string' && value.startsWith('#')){
          return value;
        }
        return value ?? 0;
      }

      function getRangeValues(range){
        const normalized = normalizeRange({ row: range.startRow, col: range.startCol }, { row: range.endRow, col: range.endCol });
        const cells = expandRange(normalized);
        return cells.map(getCellValue);
      }

      function isNumber(value){
        return typeof value === 'number' && Number.isFinite(value);
      }

      function toNumber(value){
        if (Array.isArray(value)) return toNumber(value[0]);
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (typeof value === 'string'){
          if (value.startsWith('#')) return NaN;
          const num = Number(value.replace(/%$/, ''));
          if (!Number.isNaN(num)){
            return value.endsWith('%') ? num / 100 : num;
          }
        }
        return 0;
      }

      function toComparable(value){
        if (typeof value === 'string') return value;
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (Array.isArray(value)) return toComparable(value[0]);
        return Number(value) || 0;
      }

      function truthy(value){
        if (Array.isArray(value)) return truthy(value[0]);
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'string') return value.trim() !== '' && value !== '0' && value.toUpperCase() !== 'FALSE';
        return false;
      }

      function roundTo(value, digits = 0, fn = Math.round){
        const num = toNumber(Array.isArray(value) ? value[0] : value);
        const dp = Math.max(0, Math.floor(toNumber(digits)));
        const factor = Math.pow(10, dp);
        return fn(num * factor) / factor;
      }

      function formatText(value, pattern){
        const val = Array.isArray(value) ? value[0] : value;
        const fmt = Array.isArray(pattern) ? pattern[0] : pattern;
        if (fmt == null) return String(val ?? '');
        const fmtStr = String(fmt);
        if (typeof val === 'number'){
          if (fmtStr === '0') return Math.round(val).toString();
          if (fmtStr === '0.00') return val.toFixed(2);
          if (fmtStr === '0%') return Math.round(val * 100) + '%';
          if (fmtStr === '0.00%') return (val * 100).toFixed(2) + '%';
        }
        if (fmtStr.toLowerCase() === 'yyyy-mm-dd'){
          try {
            const date = new Date(val);
            if (!Number.isNaN(date.getTime())){
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, '0');
              const d = String(date.getDate()).padStart(2, '0');
              return `${y}-${m}-${d}`;
            }
          } catch {}
        }
        return String(val ?? '');
      }

      function normalizeValue(value){
        if (Array.isArray(value)) return normalizeValue(value[0]);
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'string'){
          if (value === 'TRUE') return 1;
          if (value === 'FALSE') return 0;
          return value;
        }
        return value;
      }

      function isError(value){
        if (Array.isArray(value)) return value.some(isError);
        return typeof value === 'string' && value.startsWith('#');
      }
    }

    function tokenizeFormula(expr){
      const tokens = [];
      let i = 0;
      while (i < expr.length){
        const ch = expr[i];
        if (/\s/.test(ch)){ i++; continue; }
        if (ch === '"'){
          let j = i + 1;
          let str = '';
          while (j < expr.length){
            if (expr[j] === '"' && expr[j+1] === '"'){ str += '"'; j += 2; continue; }
            if (expr[j] === '"') break;
            str += expr[j++];
          }
          if (expr[j] !== '"') throw new Error('文字列リテラルが閉じられていません');
          tokens.push({ type: 'string', value: str });
          i = j + 1;
          continue;
        }
        if (/[0-9.]/.test(ch)){
          let j = i;
          while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
          tokens.push({ type: 'number', value: parseFloat(expr.slice(i, j)) });
          i = j;
          continue;
        }
        if (/[A-Za-z_]/.test(ch)){
          let j = i;
          while (j < expr.length && /[A-Za-z0-9_]/.test(expr[j])) j++;
          const ident = expr.slice(i, j);
          if (/^[A-Za-z]+\d+$/.test(ident)){
            tokens.push({ type: 'cell', value: ident.toUpperCase() });
          } else {
            tokens.push({ type: 'identifier', value: ident });
          }
          i = j;
          continue;
        }
        if (ch === '>' || ch === '<' || ch === '='){
          if ((ch === '>' || ch === '<') && expr[i+1] === '='){
            tokens.push({ type: 'operator', value: ch + '=' });
            i += 2;
            continue;
          }
          if ((ch === '>' && expr[i+1] === '<') || (ch === '<' && expr[i+1] === '>')){
            tokens.push({ type: 'operator', value: '<>' });
            i += 2;
            continue;
          }
          tokens.push({ type: 'operator', value: ch });
          i++;
          continue;
        }
        if ('+-*/^(),:'.includes(ch)){
          tokens.push({ type: ch === ',' ? 'comma' : ch === ':' ? 'colon' : 'operator', value: ch });
          i++;
          continue;
        }
        throw new Error('未知のトークン: ' + ch);
      }
      return tokens;
    }

    function createFormulaParser(tokens){
      let index = 0;
      function peek(){ return tokens[index]; }
      function consume(){ return tokens[index++]; }
      function match(type, value){
        const token = tokens[index];
        if (!token) return false;
        if (token.type === type && (value === undefined || token.value === value)){
          index++;
          return token;
        }
        return false;
      }
      function parseExpression(){ return parseComparison(); }
      function parseComparison(){
        let node = parseAdditive();
        while (true){
          const token = peek();
          if (!token || token.type !== 'operator' || !['=','<>','>','<','>=','<='].includes(token.value)) break;
          consume();
          const right = parseAdditive();
          node = { type: 'binary', op: token.value, left: node, right };
        }
        return node;
      }
      function parseAdditive(){
        let node = parseMultiplicative();
        while (true){
          const token = peek();
          if (!token || token.type !== 'operator' || !['+','-'].includes(token.value)) break;
          consume();
          const right = parseMultiplicative();
          node = { type: 'binary', op: token.value, left: node, right };
        }
        return node;
      }
      function parseMultiplicative(){
        let node = parsePower();
        while (true){
          const token = peek();
          if (!token || token.type !== 'operator' || !['*','/'].includes(token.value)) break;
          consume();
          const right = parsePower();
          node = { type: 'binary', op: token.value, left: node, right };
        }
        return node;
      }
      function parsePower(){
        let node = parseUnary();
        while (true){
          const token = peek();
          if (!token || token.type !== 'operator' || token.value !== '^') break;
          consume();
          const right = parseUnary();
          node = { type: 'binary', op: '^', left: node, right };
        }
        return node;
      }
      function parseUnary(){
        const token = peek();
        if (token && token.type === 'operator' && (token.value === '+' || token.value === '-')){
          consume();
          return { type: 'unary', op: token.value, argument: parseUnary() };
        }
        return parsePrimary();
      }
      function parsePrimary(){
        const token = consume();
        if (!token) throw new Error('式が不完全です');
        if (token.type === 'number') return { type: 'number', value: token.value };
        if (token.type === 'string') return { type: 'string', value: token.value };
        if (token.type === 'identifier'){
          const upper = token.value.toUpperCase();
          if (upper === 'TRUE' || upper === 'FALSE'){
            return { type: 'boolean', value: upper === 'TRUE' };
          }
          if (match('operator', '(')){
            const args = [];
            if (!match('operator', ')')){
              do {
                args.push(parseExpression());
              } while (match('comma'));
              if (!match('operator', ')')){
                throw new Error(') が必要です');
              }
            }
            return { type: 'function', name: token.value, args };
          }
          throw new Error('未知の識別子: ' + token.value);
        }
        if (token.type === 'cell'){
          if (match('colon')){
            const end = consume();
            if (!end || end.type !== 'cell') throw new Error('範囲の終端が不正です');
            return { type: 'range', startRow: parseCellRef(token.value).row, startCol: parseCellRef(token.value).col, endRow: parseCellRef(end.value).row, endCol: parseCellRef(end.value).col };
          }
          return { type: 'cell', ref: token.value };
        }
        if (token.type === 'operator' && token.value === '('){
          const inner = parseExpression();
          if (!match('operator', ')')) throw new Error(') が必要です');
          return inner;
        }
        throw new Error('解析できないトークン');
      }
      function atEnd(){ return index >= tokens.length; }
      return { parseExpression, atEnd };
    }

    function storableCells(){
      const result = {};
      state.cells.forEach((cell, key) => {
        result[key] = {
          value: cell.value,
          formula: cell.formula,
          format: cell.format,
          style: Object.assign({}, cell.style)
        };
      });
      return result;
    }

    function handleUndo(){
      const delta = state.undoStack.pop();
      if (!delta) return;
      state.redoStack.push(delta);
      applyDelta(delta, 'undo');
    }

    function handleRedo(){
      const delta = state.redoStack.pop();
      if (!delta) return;
      state.undoStack.push(delta);
      applyDelta(delta, 'redo');
    }

    function handleNewWorkbook(){
      if (state.dirty && !confirm('未保存の変更があります。続行しますか？')) return;
      state.cells.clear();
      state.filename = '新しいブック.xlsx';
      state.warning = '新規ブックは互換性制限があります。図形/マクロ/複数シートは未対応です。';
      elements.subtitle.textContent = state.filename;
      cellElements.forEach((_el, key) => updateCellElement(key));
      recalcAll();
      state.undoStack = [];
      state.redoStack = [];
      autoSaveLater();
    }

    function openImportDialog(){
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx';
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE){
          alert('ファイルが大きすぎます (5MB まで)');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            loadWorkbook(new Uint8Array(reader.result));
            state.filename = file.name;
            elements.subtitle.textContent = state.filename;
            state.warning = '互換性注意: 図形・マクロ・複数シート・外部参照は読み込まれていません。';
            award('import', 10);
            alert('互換性注意: 未対応の機能は破棄されます。');
          } catch (err){
            console.error(err);
            alert('読み込みに失敗しました: ' + err.message);
          }
        };
        reader.readAsArrayBuffer(file);
      });
      input.click();
    }

    function loadWorkbook(buffer){
      const files = fflate.unzipSync(buffer);
      const sharedStrings = [];
      if (files['xl/sharedStrings.xml']){
        const xml = fflate.strFromU8(files['xl/sharedStrings.xml']);
        const matches = xml.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
        matches.forEach(item => {
          const text = item.replace(/<\/?t[^>]*>/g, '');
          sharedStrings.push(text
            .replace(/&lt;/g,'<')
            .replace(/&gt;/g,'>')
            .replace(/&amp;/g,'&')
            .replace(/&quot;/g,'\"')
            .replace(/&apos;/g,"'")
          );
        });
      }
      let sheetXml = null;
      Object.keys(files).forEach(name => {
        if (name.startsWith('xl/worksheets/sheet')){
          sheetXml = fflate.strFromU8(files[name]);
          return;
        }
      });
      if (!sheetXml) throw new Error('シートが見つかりません');
      const parser = new DOMParser();
      const doc = parser.parseFromString(sheetXml, 'application/xml');
      const rows = doc.getElementsByTagName('row');
      state.cells.clear();
      for (let i = 0; i < rows.length; i++){
        const row = rows[i];
        const cells = row.getElementsByTagName('c');
        for (let j = 0; j < cells.length; j++){
          const c = cells[j];
          const ref = c.getAttribute('r');
          if (!ref) continue;
          const cell = createEmptyCell();
          const type = c.getAttribute('t');
          const formula = c.getElementsByTagName('f')[0];
          const valueEl = c.getElementsByTagName('v')[0];
          if (formula){
            cell.formula = formula.textContent || '';
          }
          if (type === 's'){
            const idx = parseInt(valueEl?.textContent || '0', 10);
            cell.value = sharedStrings[idx] || '';
          } else if (type === 'b'){
            cell.value = valueEl?.textContent === '1' ? 'TRUE' : 'FALSE';
          } else if (type === 'str'){
            cell.value = valueEl?.textContent || '';
          } else if (type === 'inlineStr'){
            const inline = c.getElementsByTagName('t')[0];
            cell.value = inline?.textContent || '';
          } else if (valueEl){
            const raw = valueEl.textContent || '';
            const num = Number(raw);
            if (!Number.isNaN(num)){
              cell.value = raw;
            } else {
              cell.value = raw;
            }
          }
          state.cells.set(ref, cell);
        }
      }
      cellElements.forEach((_el, key) => updateCellElement(key));
      recalcAll();
      state.undoStack = [];
      state.redoStack = [];
      autoSaveLater();
    }

    function handleExport(){
      alert('互換性注意: 図形・マクロ・複数シート・書式の一部は保存されません。');
      try {
        const zip = buildWorkbook();
        const blob = new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.filename || 'ワークシート.xlsx';
        a.click();
        URL.revokeObjectURL(url);
        award('export', 12);
      } catch (err){
        console.error(err);
        alert('書き出しに失敗しました: ' + err.message);
      }
    }

    function buildWorkbook(){
      const sharedStrings = [];
      const sharedIndex = new Map();
      function ensureShared(value){
        if (sharedIndex.has(value)) return sharedIndex.get(value);
        const idx = sharedStrings.length;
        sharedStrings.push(value);
        sharedIndex.set(value, idx);
        return idx;
      }

      let rowsXml = '';
      for (let r = 0; r < state.rows; r++){
        let rowXml = `<row r="${r+1}">`;
        for (let c = 0; c < state.cols; c++){
          const ref = cellKey(c, r);
          const cell = state.cells.get(ref);
          if (!cell) continue;
          let cellXml = `<c r="${ref}"`;
          let valueText = '';
          if (cell.formula){
            cellXml += '>';
            cellXml += `<f>${escapeXml(cell.formula)}</f>`;
            const computed = cell.computed?.raw;
            if (typeof computed === 'number'){
              cellXml += `<v>${computed}</v>`;
            } else if (typeof computed === 'string' && !computed.startsWith('#')){
              const idx = ensureShared(computed);
              cellXml += `<v>${idx}</v>`;
              cellXml = cellXml.replace('<c', '<c t="s"');
            }
            cellXml += '</c>';
          } else if (cell.value != null && cell.value !== ''){
            const lowered = String(cell.value).toUpperCase();
            if (lowered === 'TRUE' || lowered === 'FALSE'){
              cellXml += ' t="b">';
              cellXml += `<v>${lowered === 'TRUE' ? '1' : '0'}</v>`;
              cellXml += '</c>';
            } else if (!Number.isNaN(Number(cell.value))){
              cellXml += '>';
              cellXml += `<v>${Number(cell.value)}</v>`;
              cellXml += '</c>';
            } else {
              const idx = ensureShared(String(cell.value));
              cellXml += ' t="s">';
              cellXml += `<v>${idx}</v>`;
              cellXml += '</c>';
            }
          } else {
            continue;
          }
          rowXml += cellXml;
        }
        rowXml += '</row>';
        rowsXml += rowXml;
      }
      const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`+
        `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`+
        `<sheetData>${rowsXml}</sheetData></worksheet>`;

      const sharedXml = sharedStrings.length ?
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">` +
        sharedStrings.map(str => `<si><t>${escapeXml(str)}</t></si>`).join('') + '</sst>' : null;

      const files = {
        '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\n  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${sharedXml ? '\n  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' : ''}\n</Types>`,
        '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\n</Relationships>`,
        'docProps/app.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">\n  <Application>MiniExp Exceler</Application>\n</Properties>`,
        'docProps/core.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">\n  <dc:title>${escapeXml(state.filename)}</dc:title>\n  <dc:creator>MiniExp</dc:creator>\n  <cp:lastModifiedBy>MiniExp</cp:lastModifiedBy>\n  <dcterms:created xsi:type="dcterms:W3CDTF" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${new Date().toISOString()}</dcterms:created>\n</cp:coreProperties>`,
        'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>${sharedXml ? '\n  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>' : ''}\n</Relationships>`,
        'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n  <sheets>\n    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>\n  </sheets>\n</workbook>`,
        'xl/worksheets/sheet1.xml': sheetXml
      };
      if (sharedXml){
        files['xl/sharedStrings.xml'] = sharedXml;
      }
      return fflate.zipSync(files);
    }

    function showCompatibilityModal(){
      const message = '互換性について\n- 1シートのみ対応\n- 図形・マクロ・ピボット・外部リンクは未対応\n- 条件付き書式・結合セルは保持されません';
      alert(message);
    }

    function autoSaveLater(){
      if (state.autoSaveTimer){
        clearTimeout(state.autoSaveTimer);
      }
      state.autoSaveTimer = setTimeout(() => {
        savePersistent();
      }, 2000);
    }

    function savePersistent(){
      try {
        const payload = {
          filename: state.filename,
          warning: state.warning,
          cells: storableCells(),
          selection: state.selection
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {}
    }

    function restorePersistent(){
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const payload = JSON.parse(raw);
        if (!payload || typeof payload !== 'object') return;
        state.filename = typeof payload.filename === 'string' ? payload.filename : state.filename;
        state.warning = typeof payload.warning === 'string' ? payload.warning : state.warning;
        elements.subtitle.textContent = state.filename;
        state.cells.clear();
        if (payload.cells && typeof payload.cells === 'object'){
          Object.keys(payload.cells).forEach(ref => {
            const data = payload.cells[ref];
            const cell = createEmptyCell();
            cell.value = data.value;
            cell.formula = data.formula;
            cell.format = data.format || 'general';
            cell.style = Object.assign({}, DEFAULT_STYLE, data.style || {});
            state.cells.set(ref, cell);
          });
        }
        cellElements.forEach((_el, key) => updateCellElement(key));
        recalcAll();
        if (payload.selection){
          applySelection(payload.selection);
        }
      } catch {}
    }

    function getScore(){
      return state.sessionXp;
    }

    function start(){
      if (state.running) return;
      state.running = true;
      buildLayout();
      restorePersistent();
      applySelection(state.selection);
      award('open', 8);
    }

    function stop(){
      state.running = false;
      if (state.autoSaveTimer){
        clearTimeout(state.autoSaveTimer);
        state.autoSaveTimer = null;
      }
      savePersistent();
    }

    function destroy(){
      stop();
      if (elements.wrapper && elements.wrapper.parentNode){
        elements.wrapper.parentNode.removeChild(elements.wrapper);
      }
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame?.({
    id: 'exceler',
    name: '表計算エクセラー',
    entry: 'games/exceler.js',
    version: '0.1.0',
    category: 'ユーティリティ',
    description: 'XLSX 読み書き対応の軽量スプレッドシート。簡易関数と書式設定をサポート',
    create
  });
})();
