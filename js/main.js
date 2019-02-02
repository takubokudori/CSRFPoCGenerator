// let form;
var form = /** @class */ (function () {
    function form() {
    }
    form.getSendMethod = function () {
        return this.form.sendmethod.value;
    };
    form.isTransitionSubmit = function () {
        return this.form.transitionsubmit.checked;
    };
    form.isAutoSubmit = function () {
        return this.form.autosubmit.checked;
    };
    form.isSpecifiable = function () {
        return this.form.specifiable.checked;
    };
    form.isFromCharCode = function () {
        return this.form.fcc.checked;
    };
    form.getHTTPRequest = function () {
        return this.form.httprequest.value;
    };
    form.getURL = function () {
        return this.form.url.value;
    };
    form.getMethod = function () {
        return this.form.method.value;
    };
    form.getVersion = function () {
        return this.form.version.value;
    };
    form.getHeader = function () {
        return this.form.header.value;
    };
    form.getEnctype = function () {
        var et = this.form.enctype.value;
        if (et === "other")
            return this.form.enctypeother.value;
        return et;
    };
    form.getBoundary = function () {
        return this.form.boundary.value;
    };
    form.getBody = function () {
        return this.form.body.value;
    };
    form.getTitle = function () {
        return this.form.title.value;
    };
    Object.defineProperty(form, "fcc", {
        get: function () {
            return form.isFromCharCode();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "sendmethod", {
        get: function () {
            return form.getSendMethod();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "autosubmit", {
        get: function () {
            return form.isAutoSubmit();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "transitionsubmit", {
        get: function () {
            return form.isTransitionSubmit();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "specifiable", {
        get: function () {
            return form.isSpecifiable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "httprequest", {
        get: function () {
            return form.getHTTPRequest();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "url", {
        get: function () {
            return form.getURL();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "method", {
        get: function () {
            return form.getMethod();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "version", {
        get: function () {
            return form.getVersion();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "header", {
        get: function () {
            return this.getHeader();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "enctype", {
        get: function () {
            return this.getEnctype();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "boundary", {
        get: function () {
            return this.getBoundary();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "body", {
        get: function () {
            return form.getBody();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(form, "title", {
        get: function () {
            return form.getTitle();
        },
        enumerable: true,
        configurable: true
    });
    return form;
}());
var http;
var func;
var enctypes = {
    "application/x-www-form-urlencoded": 1,
    "multipart/form-data": 2,
    "application/json": 2,
    "text/plain": 2
};
function errorMsg(msg) {
    if (typeof msg !== 'string')
        return msg;
    document.getElementById("errormsg").textContent = msg;
}
function setEvilHTMLContent(ezhtml) {
    document.getElementById("evilzone").innerHTML = ezhtml;
}
function setEvilTextContent(ezhtml, isScript) {
    if (isScript === void 0) { isScript = false; }
    if (isScript)
        ezhtml = "<" + "script>\n" + ezhtml + "</" + "script>\n";
    document.getElementById("nowhtml").innerText = ezhtml;
}
function triggerFunc() {
    var sm = form.getSendMethod();
    eval('func=' + sm + ';');
}
function triggerAuto() {
    var as = form.isAutoSubmit();
    chVisible(document.getElementById("div-specifiable"), !form.isAutoSubmit());
}
function triggerEnctype() {
    var enctype = form.form.enctype.value; // get raw enctype
    chVisible(document.getElementById("div-boundary"), enctype === "multipart/form-data");
    chVisible(document.getElementById("span-enctypeother"), enctype === "other");
    return enctype;
}
function chVisible(elem, isVisible, isDisplayStyle) {
    if (isVisible === void 0) { isVisible = false; }
    if (isDisplayStyle === void 0) { isDisplayStyle = false; }
    if (isDisplayStyle) {
        if (!isVisible)
            elem.style.visibility = "hidden";
        else
            elem.style.visibility = "visible";
    }
    else {
        if (!isVisible)
            elem.style.display = "none";
        else
            elem.style.display = "inline";
    }
}
function switchVisible(elem, isDisplayStyle) {
    if (isDisplayStyle === void 0) { isDisplayStyle = false; }
    if (isDisplayStyle) {
        if (elem.style.visibility === 'hidden')
            elem.style.visibility = "visible";
        else
            elem.style.visibility = "hidden";
    }
    else {
        if (elem.style.display === 'none')
            elem.style.display = "inline";
        else
            elem.style.display = "none";
    }
}
function generatePoC(isSubmit) {
    http = new HTTPRequest();
    analyzeLine();
    analyzeHeader();
    analyzeBody();
    var success = func.generate(http);
    if (success && isSubmit)
        func.send(http);
}
var validProtocol = {
    'http': 1,
    'https': 1,
    'ftp': 1
};
function validateURL(url) {
    if (typeof url !== 'string')
        return false;
    var idx = url.indexOf(':');
    return (typeof validProtocol[url.substring(0, idx)]) !== 'undefined';
}
function detectBoundary() {
    var pm = form.body.split(/\r\n|\n/);
    var k;
    for (var i = pm.length - 1; i >= 0; i--) {
        k = pm[i].match(/^--[0-9a-zA-Z-]+--$/g);
        if (k != null && k.length === 1) {
            form.form.boundary.value = k[0].slice(2, k.length - 3);
            return;
        }
    }
    errorMsg("failed to detect boundary!Is params perfect format?");
}
function sendPoC() {
    func.send(http);
}
function analyzeLine() {
    http.analyzeLine(HTTPRequest.buildLine({
        'url': form.getURL(),
        'method': form.getMethod(),
        'version': form.getVersion()
    }));
}
function analyzeHeader() {
    http.analyzeHeader(form.header);
}
function analyzeBody() {
    http.analyzeHTTPBody(form.body);
}
function analyzeRequest() {
    var req = form.httprequest;
    if (req === "") {
        errorMsg("Raw HTTP request is empty!");
        return;
    }
    http = new HTTPRequest(req);
    if (!http.success) {
        errorMsg("failed to parse HTTP request!");
        return;
    }
    form.form.url.value = http.line['url'];
    form.form.method.value = http.line['method'];
    form.form.version.value = http.line['version'];
    form.form.body.value = http.rawBody;
    form.form.header.value = http.rawHeader;
    if (typeof http.header['Content-Type'] !== 'undefined') {
        if (enctypes[http.header['Content-Type'][0]])
            form.form.enctype.value = http.header['Content-Type'][0];
        else {
            form.form.enctype.value = "other";
            form.form.enctypeother.value = http.header['Content-Type'][0];
        }
        if (triggerEnctype() === "multipart/form-data")
            detectBoundary();
    }
    generateEditBody(http);
    errorMsg("");
}
function switchLine() {
    switchVisible(document.getElementById('raw-line'));
    switchVisible(document.getElementById('edit-line'));
}
function switchHeader() {
    switchVisible(document.getElementById('raw-header'));
    switchVisible(document.getElementById('edit-header'));
}
function switchBody() {
    switchVisible(document.getElementById('raw-body'));
    switchVisible(document.getElementById('edit-body'));
}
function generateEditBody(http) {
    var b = http.body;
    var content = "";
    for (var i = 0; i < b.length; i++) {
        content += HTMLRender.inputSet(b[i][0], b[i][1], i, 'body') + "<br />";
    }
    document.getElementById("edit-body").innerHTML = content;
    return content;
}
function executeDownload(name, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var a = document.createElement('a');
    a.download = name;
    a.target = '_blank';
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, name);
    }
    else if (window.URL && window.URL.createObjectURL) {
        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    else {
        // @ts-ignore
        if (window.webkitURL && window.webkitURL.createObject) {
            // @ts-ignore
            a.href = window.webkitURL.createObjectURL(blob);
            a.click();
        }
        else {
            // @ts-ignore
            window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
        }
    }
}
function downloadHTML() {
    var nh = document.getElementById("nowhtml");
    if (nh.textContent === "") {
        errorMsg("No downloadable HTML! generate form!");
        return;
    }
    var title = form.title;
    var content = func.generateHTML(title, nh.innerText);
    var mimeType = 'text/plain';
    var name = "poc.html";
    executeDownload(name, content, mimeType);
}
/**
 * @return {string}
 */
function URLencode(str) {
    if (typeof str !== 'string')
        return str;
    return encodeURIComponent(str.replace(/\r?\n/g, "\r\n"));
}
/**
 * @return {string}
 */
function URLdecode(str) {
    if (typeof str !== 'string')
        return str;
    return decodeURIComponent(str.replace(/\+/g, '%20'));
}
//# sourceMappingURL=main.js.map