(()=>{"use strict";var e,t={3399:(e,t,a)=>{var n=a(2284),r=a(9394);function o(e,t){var a="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!a){if(Array.isArray(e)||(a=function(e,t){if(e){if("string"==typeof e)return i(e,t);var a={}.toString.call(e).slice(8,-1);return"Object"===a&&e.constructor&&(a=e.constructor.name),"Map"===a||"Set"===a?Array.from(e):"Arguments"===a||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a)?i(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length){a&&(e=a);var n=0,r=function(){};return{s:r,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,s=!0,c=!1;return{s:function(){a=a.call(e)},n:function(){var e=a.next();return s=e.done,e},e:function(e){c=!0,o=e},f:function(){try{s||null==a.return||a.return()}finally{if(c)throw o}}}}function i(e,t){(null==t||t>e.length)&&(t=e.length);for(var a=0,n=Array(t);a<t;a++)n[a]=e[a];return n}function s(e,t,a){var n=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];e.classList.add("show");var r=e.getAttribute("data-confirmation-type"),o=c(e.getAttribute("data-success")),i=c(e.getAttribute("data-error")),s=c(e.getAttribute("data-redirect-url"));a&&"redirect"===r&&(s&&s.length>0?window.location.replace(s):window.location.replace("/"));var l="success",d="error";t&&0!==t.length||e.classList.remove("show",l,d),a&&(e.classList.remove(d),e.classList.add(l)),a||(e.classList.remove(l),e.classList.add(d)),e.innerHTML=n?a?o:i:t}function c(e){return e&&"string"!==!(0,n.A)(e)&&0!==e.length?decodeURIComponent(e.replace(/\+/g," ")):e}window.addEventListener("DOMContentLoaded",(function(){var e,t=o(document.querySelectorAll(".eb-form-submit-button"));try{var a=function(){var t=e.value;t.onclick=function(e){e.preventDefault();var a=t.getAttribute("data-id"),i=(t.getAttribute("data-form-id"),"eb-field-wrapper"),c="eb-validation-error",l="eb-form-validation",d="g-recaptcha-response",u=document.querySelector(".".concat(a));if(u){var f,v=u.getElementsByClassName("eb-form")[0],m=u.getElementsByClassName("form-nonce"),b=new FormData(v),p=new FormData;p.append("action","eb_form_submit"),p.append("form_id",a),p.append("nonce",null===(f=m[0])||void 0===f?void 0:f.value);var g={};(0,r.A)(v.elements).forEach((function(e){e.name&&(g[e.name]="")})),(0,r.A)(b.entries()).forEach((function(e){g[e[0]].length>0&&e[1].length>0&&Object.keys(g).includes(e[0])?"string"==typeof g[e[0]]?g[e[0]]=[g[e[0]],e[1]]:"object"===(0,n.A)(g[e[0]])&&(g[e[0]]=[].concat((0,r.A)(g[e[0]]),[e[1]])):g[e[0]]=e[1]})),delete g["form-nonce"];var y=!0;if(Object.keys(g).includes(d)&&0===g[d].length){var h=u.querySelector('[name="'.concat(d,'"]'));if(h){var L=h.closest(".".concat(i));L&&(L.classList.add(c),$errorHtml='<div class="'.concat(l,"\">reCAPTCHA isn't verified!</div>"))}y=!1}if(y)return t.classList.add("loading"),p.append("form_data",JSON.stringify(g)),fetch(EssentialBlocksLocalize.ajax_url,{method:"POST",body:p}).then((function(e){return e.text()})).then((function(e){var a=JSON.parse(e);t.classList.remove("loading"),function(e,t,a){var n,r=o(e.querySelectorAll(".".concat(t)));try{for(r.s();!(n=r.n()).done;)n.value.classList.remove(a)}catch(e){r.e(e)}finally{r.f()}}(u,i,c);var r=u.getElementsByClassName("eb_form_submit_response")[0];a.success&&("string"==typeof a.data&&s(r,a.data,!0),v.reset(),t.classList.add("success")),!a.success&&a.data&&(t.classList.remove("success"),"string"==typeof a.data?s(r,a.data,!1,!1):"object"===(0,n.A)(a.data)&&(a.data.message&&"string"==typeof a.data.message&&s(r,a.data.message,!1,!1),a.data.validation&&"object"===(0,n.A)(a.data.validation)&&Object.keys(a.data.validation).map((function(e){var t;e===d&&(t=u,grecaptcha.reset(t));var n=u.querySelector('[name="'.concat(e,'"]')).closest(".".concat(i));n.classList.add(c);var r=n.querySelector(".".concat(l));r&&(r.innerHTML=a.data.validation[e])}))))})).catch((function(e){return console.log(e)}))}}};for(t.s();!(e=t.n()).done;)a()}catch(e){t.e(e)}finally{t.f()}var i,c=o(document.getElementsByClassName("eb-form-wrapper"));try{for(c.s();!(i=c.n()).done;){var l,d=o(i.value.getElementsByClassName("eb-field-input"));try{var u=function(){var e,t=l.value;t.value&&(null===(e=t.nextSibling)||void 0===e||e.classList.add("active")),t.addEventListener("focus",(function(e){var a,n;null!==(a=t.nextSibling)&&void 0!==a&&a.classList.contains("active")||null===(n=t.nextSibling)||void 0===n||n.classList.add("active")})),t.addEventListener("blur",(function(){var e;t.value||null===(e=t.nextSibling)||void 0===e||e.classList.remove("active")}))};for(d.s();!(l=d.n()).done;)u()}catch(e){d.e(e)}finally{d.f()}}}catch(e){c.e(e)}finally{c.f()}}))}},a={};function n(e){var r=a[e];if(void 0!==r)return r.exports;var o=a[e]={exports:{}};return t[e](o,o.exports,n),o.exports}n.m=t,e=[],n.O=(t,a,r,o)=>{if(!a){var i=1/0;for(d=0;d<e.length;d++){a=e[d][0],r=e[d][1],o=e[d][2];for(var s=!0,c=0;c<a.length;c++)(!1&o||i>=o)&&Object.keys(n.O).every((e=>n.O[e](a[c])))?a.splice(c--,1):(s=!1,o<i&&(i=o));if(s){e.splice(d--,1);var l=r();void 0!==l&&(t=l)}}return t}o=o||0;for(var d=e.length;d>0&&e[d-1][2]>o;d--)e[d]=e[d-1];e[d]=[a,r,o]},n.d=(e,t)=>{for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.j=385,(()=>{var e={385:0};n.O.j=t=>0===e[t];var t=(t,a)=>{var r,o,i=a[0],s=a[1],c=a[2],l=0;if(i.some((t=>0!==e[t]))){for(r in s)n.o(s,r)&&(n.m[r]=s[r]);if(c)var d=c(n)}for(t&&t(a);l<i.length;l++)o=i[l],n.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return n.O(d)},a=self.webpackChunkessential_blocks=self.webpackChunkessential_blocks||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))})();var r=n.O(void 0,[935],(()=>n(3399)));r=n.O(r)})();