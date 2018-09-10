// let form;
var form = /** @class */ (function () {
    function form() {
    }
    form.getSendMethod = function () {
        return this.form.sendmethod.value;
    };
    form.isAutoSubmit = function () {
        return this.form.autosubmit.checked;
    };
    form.isSpecifiable = function () {
        return this.form.specifiable.checked;
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
function setEvilHTMLcontent(ezhtml) {
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
    if (as) {
        document.getElementById("div-specifiable").style.visibility = "hidden";
    }
    else {
        document.getElementById("div-specifiable").style.visibility = "visible";
    }
}
function triggerEnctype() {
    var enctype = form.getEnctype();
    if (enctype === "multipart/form-data") {
        document.getElementById("div-boundary").style.visibility = "visible";
    }
    else {
        document.getElementById("div-boundary").style.visibility = "hidden";
    }
    if (enctype === "other") {
        document.getElementById("span-enctypeother").style.visibility = "visible";
    }
    else {
        document.getElementById("span-enctypeother").style.visibility = "hidden";
    }
    return enctype;
}
function generatePoC(isSubmit) {
    http = new HTTPRequest();
    analyzeLine();
    analyzeHeader();
    analyzeBody();
    var success = func.generate(http);
    if (success && isSubmit)
        func.send();
}
function getRequest() {
    var url = form.getURL();
    if (url === "") {
        errorMsg("URL is empty!");
        return false;
    }
    var method = form.getMethod();
    if (method === "") {
        errorMsg("method is empty!");
        return false;
    }
    var enctype = form.getEnctype();
    if (enctype === "") {
        errorMsg("enctype is empty!");
        return false;
    }
    var params = form.getBody();
    var boundary = form.boundary;
    return {
        'url': url,
        'method': method,
        'enctype': enctype,
        'params': params,
        'boundary': boundary
    };
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
            form.boundary = k[0].slice(2, k.length - 3);
            return;
        }
    }
    errorMsg("failed to detect boundary!Is params perfect format?");
}
function sendPoC() {
    func.send();
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
    document.getElementById("param-operation").innerHTML = http.renderOperationHTML();
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
    // else if (window.webkitURL && window.webkitURL.createObject) {
    //     a.href = window.webkitURL.createObjectURL(blob);
    //     a.click();
    // }
    // else {
    //     window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
    // }
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