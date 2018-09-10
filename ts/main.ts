// let form;

class form {
    static form;

    static getSendMethod(): string {
        return this.form.sendmethod.value;
    }

    static isAutoSubmit() {
        return this.form.autosubmit.checked;
    }

    static isSpecifiable() {
        return this.form.specifiable.checked;
    }

    static getHTTPRequest(): string {
        return this.form.httprequest.value;
    }

    static getURL(): string {
        return this.form.url.value;
    }

    static getMethod(): string {
        return this.form.method.value;
    }

    static getVersion(): string {
        return this.form.version.value;
    }

    static getHeader(): string {
        return this.form.header.value;
    }

    static getEnctype(): string {
        const et = this.form.enctype.value;
        if (et === "other") return this.form.enctypeother.value;
        return et;
    }

    static getBoundary(): string {
        return this.form.boundary.value;
    }

    static getBody(): string {
        return this.form.body.value;
    }

    static getTitle(): string {
        return this.form.title.value;
    }

    static get sendmethod(): string {
        return form.getSendMethod();
    }

    static get autosubmit() {
        return form.isAutoSubmit();
    }

    static get specifiable() {
        return form.isSpecifiable();
    }

    static get httprequest(): string {
        return form.getHTTPRequest();
    }

    static get url(): string {
        return form.getURL();
    }

    static get method(): string {
        return form.getMethod();
    }

    static get version(): string {
        return form.getVersion();
    }

    static get header(): string {
        return this.getHeader();
    }

    static get enctype(): string {
        return this.getEnctype();
    }

    static get boundary(): string {
        return this.getBoundary();
    }

    static get body(): string {
        return form.getBody();
    }

    static get title(): string {
        return form.getTitle();
    }

}

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
    const sm = form.getSendMethod();
    eval('func=' + sm + ';');
}


function triggerAuto(): void {
    const as = form.isAutoSubmit();
    if (as) {
        document.getElementById("div-specifiable").style.visibility = "hidden";
    } else {
        document.getElementById("div-specifiable").style.visibility = "visible";
    }
}

function triggerEnctype() {
    const enctype = form.getEnctype();
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
    analyzeLine();
    analyzeHeader();
    analyzeBody();
    const success = func.generate(http);
    if (success && isSubmit) func.send();
}

function getRequest(): {} {
    const url = form.getURL();
    if (url === "") {
        errorMsg("URL is empty!");
        return false;
    }
    const method = form.getMethod();
    if (method === "") {
        errorMsg("method is empty!");
        return false;
    }
    const enctype = form.getEnctype();
    if (enctype === "") {
        errorMsg("enctype is empty!");
        return false;
    }
    const params = form.getBody();
    const boundary = form.boundary;
    return {
        'url': url,
        'method': method,
        'enctype': enctype,
        'params': params,
        'boundary': boundary
    };
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
    let pm: string[] = form.body.split(/\r\n|\n/);

    let k;
    for (let i = pm.length - 1; i >= 0; i--) {
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
    const req = form.httprequest;
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
        if (enctypes[http.header['Content-Type'][0]]) form.form.enctype.value = http.header['Content-Type'][0];
        else {
            form.form.enctype.value = "other";
            form.form.enctypeother.value = http.header['Content-Type'][0];
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
    const title = form.title;
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
