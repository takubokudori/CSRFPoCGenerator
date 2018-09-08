let form;
let http;
let func;
const enctypes = {
    "application/x-www-form-urlencoded": 1, // 1->selected
    "multipart/form-data": 2,
    "application/json": 2,
    "text/plain": 2
};

function errorMsg(msg) {
    if (typeof msg !== 'string') return msg;
    document.getElementById("errormsg").textContent = msg;
}

function setEvilHTMLcontent(ezhtml) {
    document.getElementById("evilzone").innerHTML = ezhtml;
}

function setEvilTextContent(ezhtml, isScript = false) {
    if (isScript) ezhtml = "<" + "script>\n" + ezhtml + "</" + "script>\n";
    document.getElementById("nowhtml").innerText = ezhtml;
}

function triggerFunc(): void {
    const sm = form.sendmethod.value;
    eval('func=' + sm + ';');
}


function triggerAuto(): void {
    const as = form.autosubmit.checked;
    if (as) {
        document.getElementById("div-specifiable").style.visibility = "hidden";
    } else {
        document.getElementById("div-specifiable").style.visibility = "visible";
    }
}

function triggerEnctype() {
    const enctype = form.enctype.value;
    if (enctype === "multipart/form-data") {
        document.getElementById("div-boundary").style.visibility = "visible";
    } else {
        document.getElementById("div-boundary").style.visibility = "hidden";
    }
    if (enctype === "other") {
        document.getElementById("span-enctypeother").style.visibility = "visible";
    } else {
        document.getElementById("span-enctypeother").style.visibility = "hidden";
    }
    return enctype;
}

function generatePoC(isSubmit): void {
    http = new HTTPRequest();
    const success = func.generate();
    if (success && isSubmit) func.send();
}

function getRequest(): {} {
    const url = getURL();
    if (url === "") {
        errorMsg("URL is empty!");
        return false;
    }
    const method = getMethod();
    if (method === "") {
        errorMsg("method is empty!");
        return false;
    }
    const enctype = getEnctype();
    if (enctype === "") {
        errorMsg("enctype is empty!");
        return false;
    }
    const params = getParams();
    const boundary = form.boundary.value;
    return {
        'url': url,
        'method': method,
        'enctype': enctype,
        'params': params,
        'boundary': boundary
    };
}

function getURL(): string {
    return form.url.value;
}

function getMethod(): string {
    return form.method.value;
}

function getVersion(): string {
    return form.version.value;
}

function getEnctype(): string {
    const et = form.enctype.value;
    if (et === "other") return form.enctypeother.value;
    return et;
}

function isAutoSubmit() {
    return form.autosubmit.checked;
}

function isSpecifiable() {
    return form.specifiable.checked;
}

const validProtocol = {
    'http': 1,
    'https': 1,
    'ftp': 1
};

function validateURL(url) {
    if (typeof url !== 'string') return false;
    const idx = url.indexOf(':');
    return (typeof validProtocol[url.substring(0, idx)]) !== 'undefined';

}

function detectBoundary() {
    let pm: string[] = getParamsRaw().split(/\r\n|\n/);

    let k;
    for (let i = pm.length - 1; i >= 0; i--) {
        k = pm[i].match(/^--[0-9a-zA-Z-]+--$/g);
        if (k != null && k.length === 1) {
            form.boundary.value = k[0].slice(2, k.length - 3);
            return;
        }
    }
    errorMsg("failed to detect boundary!Is params perfect format?");
}

function getParamsRaw(): string {
    return form.params.value;
}

function getParams() {
    const params = getParamsRaw();
    if (params === "") return false;
    const param = params.split("&");
    const dict = [];
    for (let i = 0; i < param.length; i++) {
        const t = param[i].split("=");
        dict.push(t);
    }
    return dict;
}

function sendPoC() {
    func.send();
}

function analyzeLine() {
    http.analyzeLine(HTTPRequest.buildLine({
        'url': getURL(),
        'method': getMethod(),
        'version': getVersion()
    }));
}

function analyzeHeader() {
    http.analyzeHeader("");
}

function analyzeBody() {
    http.analyzeHTTPBody(getParamsRaw());
}

function analyzeRequest() {
    const req = form.httprequest.value;
    if (req === "") {
        errorMsg("Raw HTTP request is empty!");
        return;
    }
    http = new HTTPRequest(req);
    if (!http.success) {
        errorMsg("failed to parse HTTP request!");
        return;
    }
    form.url.value = http.line['url'];
    form.method.value = http.line['method'];
    form.params.value = http.rawBody;
    form.header.value = http.rawHeader;
    if (typeof http.header['Content-Type'] !== 'undefined') {
        if (enctypes[http.header['Content-Type'][0]]) form.enctype.value = http.header['Content-Type'][0];
        else {
            form.enctype.value = "other";
            form.enctypeother.value = http.header['Content-Type'][0];
        }
        if (triggerEnctype() === "multipart/form-data") detectBoundary();
    }
    document.getElementById("param-operation").innerHTML = http.renderOperationHTML();
}

function executeDownload(name, content, mimeType) {
    const blob = new Blob([content], {type: mimeType});

    const a = document.createElement('a');
    a.download = name;
    a.target = '_blank';
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, name)
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
    const nh = document.getElementById("nowhtml");
    if (nh.textContent === "") {
        errorMsg("No downloadable HTML! generate form!");
        return;
    }
    const title = form.title.value;
    const content = func.generateHTML(title, nh.innerText);

    const mimeType = 'text/plain';
    const name = "poc.html";
    executeDownload(name, content, mimeType);
}

/**
 * @return {string}
 */
function URLencode(str) {
    if (typeof str !== 'string') return str;
    return encodeURIComponent(str.replace(/\r?\n/g, "\r\n"));
}

/**
 * @return {string}
 */
function URLdecode(str) {
    if (typeof str !== 'string') return str;
    return decodeURIComponent(str.replace(/\+/g, '%20'));
}
