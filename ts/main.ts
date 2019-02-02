// let form;

class form {
    static form;

    static getSendMethod(): string {
        return this.form.sendmethod.value;
    }

    static isTransitionSubmit() {
        return this.form.transitionsubmit.checked;
    }

    static isAutoSubmit() {
        return this.form.autosubmit.checked;
    }

    static isSpecifiable() {
        return this.form.specifiable.checked;
    }

    static isFromCharCode() {
        return this.form.fcc.checked;
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

    static get fcc() {
        return form.isFromCharCode();
    }

    static get sendmethod(): string {
        return form.getSendMethod();
    }

    static get autosubmit() {
        return form.isAutoSubmit();
    }

    static get transitionsubmit() {
        return form.isTransitionSubmit();
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

function errorMsg(msg): void {
    if (typeof msg !== 'string') return msg;
    document.getElementById("errormsg").textContent = msg;
}

function setEvilHTMLContent(ezhtml): void {
    document.getElementById("evilzone").innerHTML = ezhtml;
}

function setEvilTextContent(ezhtml, isScript = false) {
    if (isScript) ezhtml = "<" + "script>\n" + ezhtml + "</" + "script>\n";
    document.getElementById("nowhtml").innerText = ezhtml;
}

function triggerFunc(): void {
    const sm = form.getSendMethod();
    chVisible(document.getElementById("div-xhrfeatures"), sm === "xhrfunc");
    chVisible(document.getElementById("div-formfeatures"), sm === "formfunc");
    eval('func=' + sm + ';');
}


function triggerAuto(): void {
    const as = form.isAutoSubmit();
    chVisible(document.getElementById("div-specifiable"), !form.isAutoSubmit());
}

function triggerEnctype() {
    const enctype = form.form.enctype.value; // get raw enctype
    chVisible(document.getElementById("div-boundary"), enctype === "multipart/form-data");
    chVisible(document.getElementById("span-enctypeother"), enctype === "other");
    return enctype;
}

function chVisible(elem, isVisible: boolean = false, isDisplayStyle: boolean = false): void {
    if (isDisplayStyle) {
        if (!isVisible) elem.style.visibility = "hidden";
        else elem.style.visibility = "visible";
    } else {
        if (!isVisible) elem.style.display = "none";
        else elem.style.display = "inline";
    }
}

function switchVisible(elem, isDisplayStyle: boolean = false): void {
    if (isDisplayStyle) {
        if (elem.style.visibility === 'hidden') elem.style.visibility = "visible";
        else elem.style.visibility = "hidden";
    } else {
        if (elem.style.display === 'none') elem.style.display = "inline";
        else elem.style.display = "none";
    }
}

function generatePoC(isSubmit): void {
    http = new HTTPRequest();
    analyzeLine();
    analyzeHeader();
    analyzeBody();
    const success = func.generate(http);
    if (success && isSubmit) func.send(http);
}

const validProtocol = {
    'http': 1,
    'https': 1,
    'ftp': 1
};

function validateURL(url): boolean {
    if (typeof url !== 'string') return false;
    const idx = url.indexOf(':');
    return (typeof validProtocol[url.substring(0, idx)]) !== 'undefined';

}

function detectBoundary(): void {
    let pm: string[] = form.body.split(/\r\n|\n/);

    let k;
    for (let i = pm.length - 1; i >= 0; i--) {
        k = pm[i].match(/^--[0-9a-zA-Z-]+--$/g);
        if (k != null && k.length === 1) {
            form.form.boundary.value = k[0].slice(2, k.length - 3);
            return;
        }
    }
    errorMsg("failed to detect boundary!Is params perfect format?");
}

function sendPoC(): void {
    func.send(http);
}

function analyzeLine(): void {
    http.analyzeLine(HTTPRequest.buildLine({
        'url': form.getURL(),
        'method': form.getMethod(),
        'version': form.getVersion()
    }));
}

function analyzeHeader(): void {
    http.analyzeHeader(form.header);
}

function analyzeBody(): void {
    http.analyzeHTTPBody(form.body);
}

function analyzeRequest(): void {
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

function generateEditBody(http: HTTPRequest): string {
    const b = http.body;
    let content = "";
    for (let i = 0; i < b.length; i++) {
        content += HTMLRender.inputSet(b[i][0], b[i][1], i, 'body') + "<br />";
    }
    document.getElementById("edit-body").innerHTML = content;
    return content;
}

function executeDownload(name, content, mimeType): void {
    const blob = new Blob([content], {type: mimeType});

    const a = document.createElement('a');
    a.download = name;
    a.target = '_blank';
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, name)
    } else if (window.URL && window.URL.createObjectURL) {
        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        // @ts-ignore
        if (window.webkitURL && window.webkitURL.createObject) {
            // @ts-ignore
            a.href = window.webkitURL.createObjectURL(blob);
            a.click();
        } else {
            // @ts-ignore
            window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
        }
    }
}

function downloadHTML(): void {
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
function URLencode(str): string {
    if (typeof str !== 'string') return str;
    return encodeURIComponent(str.replace(/\r?\n/g, "\r\n"));
}

/**
 * @return {string}
 */
function URLdecode(str): string {
    if (typeof str !== 'string') return str;
    return decodeURIComponent(str.replace(/\+/g, '%20'));
}
