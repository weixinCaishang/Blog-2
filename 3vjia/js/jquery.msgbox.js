
window.OPlugs=window.OPlugs || {};

OPlugs.dom = {getById: function(id) {
        return document.getElementById(id);
    },get: function(e) {
        return (typeof (e) == "string") ? document.getElementById(e) : e;
    },createElementIn: function(tagName, elem, insertFirst, attrs) {
        var _e = (elem = OPlugs.dom.get(elem) || document.body).ownerDocument.createElement(tagName || "div"), k;
        if (typeof (attrs) == 'object') {
            for (k in attrs) {
                if (k == "class") {
                    _e.className = attrs[k];
                } else if (k == "style") {
                    _e.style.cssText = attrs[k];
                } else {
                    _e[k] = attrs[k];
                }
            }
        }
        insertFirst ? elem.insertBefore(_e, elem.firstChild) : elem.appendChild(_e);
        return _e;
    },getStyle: function(el, property) {
        el = OPlugs.dom.get(el);
        if (!el || el.nodeType == 9) {
            return null;
        }
        var w3cMode = document.defaultView && document.defaultView.getComputedStyle, computed = !w3cMode ? null : document.defaultView.getComputedStyle(el, ''), value = "";
        switch (property) {
            case "float":
                property = w3cMode ? "cssFloat" : "styleFloat";
                break;
            case "opacity":
                if (!w3cMode) {
                    var val = 100;
                    try {
                        val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
                    } catch (e) {
                        try {
                            val = el.filters('alpha').opacity;
                        } catch (e) {
                        }
                    }
                    return val / 100;
                } else {
                    return parseFloat((computed || el.style)[property]);
                }
                break;
            case "backgroundPositionX":
                if (w3cMode) {
                    property = "backgroundPosition";
                    return ((computed || el.style)[property]).split(" ")[0];
                }
                break;
            case "backgroundPositionY":
                if (w3cMode) {
                    property = "backgroundPosition";
                    return ((computed || el.style)[property]).split(" ")[1];
                }
                break;
        }
        if (w3cMode) {
            return (computed || el.style)[property];
        } else {
            return (el.currentStyle[property] || el.style[property]);
        }
    },setStyle: function(el, properties, value) {
        if (!(el = OPlugs.dom.get(el)) || el.nodeType != 1) {
            return false;
        }
        var tmp, bRtn = true, w3cMode = (tmp = document.defaultView) && tmp.getComputedStyle, rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
        if (typeof (properties) == 'string') {
            tmp = properties;
            properties = {};
            properties[tmp] = value;
        }
        for (var prop in properties) {
            value = properties[prop];
            if (prop == 'float') {
                prop = w3cMode ? "cssFloat" : "styleFloat";
            } else if (prop == 'opacity') {
                if (!w3cMode) {
                    prop = 'filter';
                    value = value >= 1 ? '' : ('alpha(opacity=' + Math.round(value * 100) + ')');
                }
            } else if (prop == 'backgroundPositionX' || prop == 'backgroundPositionY') {
                tmp = prop.slice(-1) == 'X' ? 'Y' : 'X';
                if (w3cMode) {
                    var v = OPlugs.dom.getStyle(el, "backgroundPosition" + tmp);
                    prop = 'backgroundPosition';
                    typeof (value) == 'number' && (value = value + 'px');
                    value = tmp == 'Y' ? (value + " " + (v || "top")) : ((v || 'left') + " " + value);
                }
            }
            if (typeof el.style[prop] != "undefined") {
                el.style[prop] = value + (typeof value === "number" && !rexclude.test(prop) ? 'px' : '');
                bRtn = bRtn && true;
            } else {
                bRtn = bRtn && false;
            }
        }
        return bRtn;
    },getScrollTop: function(doc) {
        var _doc = doc || document;
        return Math.max(_doc.documentElement.scrollTop, _doc.body.scrollTop);
    },getClientHeight: function(doc) {
        var _doc = doc || document;
        return _doc.compatMode == "CSS1Compat" ? _doc.documentElement.clientHeight : _doc.body.clientHeight;
    }
};

OPlugs.string = {RegExps: {trim: /^\s+|\s+$/g,ltrim: /^\s+/,rtrim: /\s+$/,nl2br: /\n/g,s2nb: /[\x20]{2}/g,URIencode: /[\x09\x0A\x0D\x20\x21-\x29\x2B\x2C\x2F\x3A-\x3F\x5B-\x5E\x60\x7B-\x7E]/g,escHTML: {re_amp: /&/g,re_lt: /</g,re_gt: />/g,re_apos: /\x27/g,re_quot: /\x22/g},escString: {bsls: /\\/g,sls: /\//g,nl: /\n/g,rt: /\r/g,tab: /\t/g},restXHTML: {re_amp: /&amp;/g,re_lt: /&lt;/g,re_gt: /&gt;/g,re_apos: /&(?:apos|#0?39);/g,re_quot: /&quot;/g},write: /\{(\d{1,2})(?:\:([xodQqb]))?\}/g,isURL: /^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i,cut: /[\x00-\xFF]/,getRealLen: {r0: /[^\x00-\xFF]/g,r1: /[\x00-\xFF]/g},format: /\{([\d\w\.]+)\}/g},commonReplace: function(s, p, r) {
        return s.replace(p, r);
    },format: function(str) {
        var args = Array.prototype.slice.call(arguments), v;
        str = String(args.shift());
        if (args.length == 1 && typeof (args[0]) == 'object') {
            args = args[0];
        }
        OPlugs.string.RegExps.format.lastIndex = 0;
        return str.replace(OPlugs.string.RegExps.format, function(m, n) {
            v = OPlugs.object.route(args, n);
            return v === undefined ? m : v;
        });
    }};


OPlugs.object = {
	routeRE: /([\d\w_]+)/g,
	route: function(obj, path) {
        obj = obj || {};
        path = String(path);
        var r = OPlugs.object.routeRE, m;
        r.lastIndex = 0;
        while ((m = r.exec(path)) !== null) {
            obj = obj[m[0]];
            if (obj === undefined || obj === null) {
                break;
            }
        }
        return obj;
    }};


OPlugs.timeout = 1800;
var ua = OPlugs.userAgent = {}, agent = navigator.userAgent;
ua.ie = 9 - ((agent.indexOf('Trident/5.0') > -1) ? 0 : 1) - (window.XDomainRequest ? 0 : 1) - (window.XMLHttpRequest ? 0 : 1);



if (typeof (OPlugs.msgbox) == 'undefined') {
    OPlugs.msgbox = {};
}
OPlugs.msgbox._timer = null;
OPlugs.msgbox.loadingAnimationPath = OPlugs.msgbox.loadingAnimationPath || ("loading.gif");
OPlugs.msgbox.show = function(msgHtml, type, timeout,func, opts) {
    if (typeof (opts) == 'number') {
        opts = {topPosition: opts};
    }
    opts = opts || {};
    var _s = OPlugs.msgbox,
	 template = '<span class="oplug_msgbox_layer" style="display:none;z-index:10000;" id="mode_tips_v2"><span class="gtl_ico_{type}"></span>{loadIcon}{msgHtml}<span class="gtl_end"></span></span>', loading = '<span class="gtl_ico_loading"></span>', typeClass = [0, 0, 0, 0, "succ", "fail", "clear"], mBox, tips;
    _s._loadCss && _s._loadCss(opts.cssPath);
    mBox = OPlugs.dom.get("q_Msgbox") || OPlugs.dom.createElementIn("div", document.body, false, {className: "oplug_msgbox_layer_wrap"});
    mBox.id = "q_Msgbox";
    mBox.style.display = "";
    mBox.innerHTML = OPlugs.string.format(template, {type: typeClass[type] || "hits",msgHtml: msgHtml || "",loadIcon: type == 6 ? loading : ""});
    _s._setPosition(mBox, timeout, opts.topPosition, func);
};
//
OPlugs.msgbox.showInfo = function (msgHtml, func) { this.show(msgHtml, 1, OPlugs.timeout, func); }
OPlugs.msgbox.showOK = function (msgHtml, func) { this.show(msgHtml, 4, OPlugs.timeout, func); }
OPlugs.msgbox.showFailed = function (msgHtml, func) { this.show(msgHtml, 5, OPlugs.timeout, func); }
OPlugs.msgbox.showWait = function (msgHtml) { if (msgHtml) this.show(msgHtml, 6); else this.show("处理中，请稍后... ：）", 6); }
//
OPlugs.msgbox._setPosition = function(tips, timeout, topPosition,func) {
    //timeout = timeout || null;
    var _s = OPlugs.msgbox, bt = OPlugs.dom.getScrollTop(), ch = OPlugs.dom.getClientHeight(), t = Math.floor(ch / 2) - 40;
    OPlugs.dom.setStyle(tips, "top", ((document.compatMode == "BackCompat" || OPlugs.userAgent.ie < 7) ? bt : 0) + ((typeof (topPosition) == "number") ? topPosition : t) + "px");
    clearTimeout(_s._timer);
    tips.firstChild.style.display = "";
    timeout && (_s._timer = setTimeout(_s.hide, timeout));
    OPlugs.func = func;
};
OPlugs.msgbox.hide = function(timeout) {
    var _s = OPlugs.msgbox;
    if (timeout) {
        clearTimeout(_s._timer);
        _s._timer = setTimeout(_s._hide, timeout);
    } else {
        _s._hide();
    }
};
OPlugs.msgbox._hide = function() {
    var _mBox = OPlugs.dom.get("q_Msgbox"), _s = OPlugs.msgbox;
    clearTimeout(_s._timer);
    if (_mBox) {
        var _tips = _mBox.firstChild;
        OPlugs.dom.setStyle(_mBox, "display", "none");
        OPlugs.func && OPlugs.func();
    }
}; 

$(function () {
    $.extend($, {
        msgBoxObj: OPlugs.msgbox
    });
});
/*! jquery.msgProcess.min.js 跟msgbox.js搭配使用  msgbox.js压缩报错，故合并进来*/
!function (jqObj) { jqObj.extend(jqObj, { msgProcess: function (jsonText, funcOk, funcNoOk) { function doesMsgBoxExsit() { return $.msgBoxObj && $.msgBoxObj.showOK && $.msgBoxObj.showOK instanceof Function } function invokeFunc(a) { a && a instanceof Function ? a(msgObj) : 6 == msgObj.Status ? alert('你应当获取验证码的Image标签，为其的src绑定地址；如：$("#image").attr("src", "验证码生成地址"') : "string" == typeof msgObj.BackUrl && msgObj.BackUrl && (window.top == window ? window.location = msgObj.BackUrl : window.top.location = msgObj.BackUrl) } var msgObj = null; if ("string" == typeof jsonText) try { msgObj = eval(jsonText) } catch (e) { try { msgObj = eval("(" + jsonText + ")") } catch (e1) { alert("格式错误：必须为json格式字符串~！") } } else jsonText.Status && (msgObj = jsonText); switch (msgObj.Status) { case 1: doesMsgBoxExsit() && $.msgBoxObj.showOK(msgObj.MSG, function () { invokeFunc(funcOk) }); break; case 2: doesMsgBoxExsit() && $.msgBoxObj.showFailed(msgObj.MSG, function () { invokeFunc(funcNoOk) }); break; case 3: doesMsgBoxExsit() && $.msgBoxObj.showInfo(msgObj.MSG, function () { invokeFunc() }); break; case 4: doesMsgBoxExsit() && $.msgBoxObj.showInfo(msgObj.MSG, function () { invokeFunc() }); break; case 5: doesMsgBoxExsit() && $.msgBoxObj.showFailed(msgObj.MSG); break; case 6: doesMsgBoxExsit() && $.msgBoxObj.showFailed(msgObj.MSG, function () { invokeFunc(funcNoOk) }) } } }) }(window.$);
