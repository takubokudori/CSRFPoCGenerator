// analyze raw request
// store header etc.
class HTTPRequest {

    private rawLine_: string;
    private rawHeader_: string;
    private rawBody_: string;
    private line_: { [key: string]: string };
    private header_: any;
    private body_: [];
    private httpRequest_: string;
    private success_: boolean;

    static separate_(str: string, delimiter: string): string[] {
        if (typeof str !== 'string' || typeof delimiter !== 'string') return [];
        const idx: number = str.indexOf(delimiter);
        return [str.substring(0, idx), str.slice(idx + delimiter.length)];
    }

    constructor(httpRequest: string = "") {
        this.success_ = false;
        this.rawLine_ = "";
        this.rawHeader_ = "";
        this.rawBody_ = "";
        this.line_ = {};
        this.header_ = {};
        this.body_ = [];
        if (httpRequest === "") return; // empty request
        this.analyzeHTTPRequest(httpRequest);
    }

    analyzeHTTPRequest(httpRequest: string): boolean {
        this.success_ = false;
        this.httpRequest_ = httpRequest;
        let result: boolean;
        httpRequest = httpRequest.replace(/\r?\n/g, "\r\n"); // unified \n -> \r\n
        const http: string[] = HTTPRequest.separate_(httpRequest, "\r\n\r\n"); // [0]->request line & header, [1]->body
        let httpHeader: string[] = HTTPRequest.separate_(http[0], "\r\n"); // [0]->request line, [1]->header
        if (this.analyzeLine(httpHeader[0]) === false) return false; // failed to parse request line.
        if (this.analyzeHeader(httpHeader[1]) === false) return false; // failed to parse header.

        // body
        if (typeof this.header_['Content-Type'] !== 'undefined') result = this.analyzeHTTPBody(http[1], this.header_['Content-Type']);
        else if (this.line_['method'] === "GET") result = this.analyzeHTTPBody(HTTPRequest.separate_(this.line_['url'], "?")[1]);
        else result = this.analyzeHTTPBody(http[1]);
        if (result === false) return false; // failed to parse body.

        this.success_ = true;
        return true;
    }

    analyzeLine(line: string): boolean {
        const q = line.split(' ');
        if (q.length <= 1) return false;
        this.rawLine_ = line;

        this.line_ = {
            'method': q[0],
            'url': q[1],
            'version': q[2]
        };
        return true;
    }

    static buildLine(line: { [key: string]: string }): string {
        if (!line['method']) line['method'] = 'POST';
        if (!line['version']) line['version'] = 'HTTP/1.1';
        return `${line['method']} ${line['url']} ${line['version']}`;
    }

    static analyzeURL(url: string): { [key: string]: any } {
        const a = HTTPRequest.separate_(url, "?");
        return {
            'url': a[0],
            'querystring': HTTPRequest.analyzeParams(a[1])
        };
    }

    static analyzeHeaderOption(headerValue: string): any[] {
        let v = headerValue.split('; ');
        const ret = [];
        for (let i = 0; i < v.length; i++) {
            let k = v[i].split('=');
            if (k.length === 1) ret.push(k[0]); // string
            else ret.push(k); // array
        }
        return ret;
    }

    private static isForbiddenHeader(name: string): boolean {
        if (forbiddenHeader[name]) return true;
        for (let i = 0; i < forbiddenHeaderRegex.length; i++) {
            if (forbiddenHeaderRegex[i].test(name)) return true;
        }
        return false;
    }

    static analyzeHeader_(rawHeader: string): { [key: string]: any[] } {
        let header = rawHeader.split(/\r\n|\n/);
        const ret = {
            'custom': [], // custom headers
        };
        if (rawHeader === '') return ret;
        for (let i = 0; i < header.length; i++) {
            const h = HTTPRequest.separate_(header[i], ':');
            if (h.length === 2) {
                h[0] = h[0].trim(); // header name
                h[1] = h[1].trim(); // value
                if (!this.isForbiddenHeader(h[0])) ret['custom'].push(h); // custom header
                else { // forbidden header
                    if (h[0] === 'Referer') ret[h[0]] = h[1]; // Referer: http://localhost?a=b etc...
                    else ret[h[0]] = HTTPRequest.analyzeHeaderOption(h[1]);
                }
            }
        }
        return ret;
    }

    analyzeHeader(rawHeader: string): boolean {
        this.rawHeader_ = rawHeader;
        this.header_ = HTTPRequest.analyzeHeader_(rawHeader);
        return true;
    }

    static buildHeaderOption(headerValue: any[] | string): string {
        if (typeof headerValue === 'string') return headerValue;
        let ret = '';
        for (let i = 0; i < headerValue.length; i++) {
            if (ret !== '') ret += '; ';
            if (typeof headerValue[i] === 'string') {
                ret += headerValue[i];
            } else {
                ret += headerValue[i].join("=");
            }
        }
        return ret;

    }


    static buildHeader(header: { [key: string]: [] }): string {
        let ret = "";
        for (let i in header) {
            if (ret !== '') ret += '\n';
            if (i === 'custom') {
                let q = '';
                for (let j in header[i]) {
                    if (q !== '') q += '\n';
                    if (header[i].hasOwnProperty(j)) {
                        q += header[i][j][0] + ": " + this.buildHeaderOption(header[i][j][1]);
                    }
                }
                ret += q;
            } else {
                ret += i + ": " + this.buildHeaderOption(header[i]);
            }
        }
        return ret;
    }

    public analyzeHTTPBody(rawBody: string, contentType: string[] = []): boolean {
        let ret;
        if (contentType[0] === "multipart/form-data") {
            ret = HTTPRequest.analyzeMultipartParams(rawBody, HTTPRequest.getBoundary(contentType));
        } else {
            ret = HTTPRequest.analyzeParams(rawBody);
        }
        this.rawBody_ = rawBody;
        this.body_ = ret;
        return true;
    }


    public static getBoundary(contentType: string[]): string {
        let boundary = "";
        for (let i in contentType) {
            if (contentType.hasOwnProperty(i)) {
                if ((Array.isArray(contentType[i])) && contentType[i][0] === 'boundary') {
                    boundary = contentType[i][1];
                    break;
                }
            }
        }
        return boundary;
    }

    static analyzeMultipartParams(params: string, boundary: string) {
        let ret = [];
        let h;
        let paramArr = params.split('--' + boundary);
        for (let i = 0; i < paramArr.length; i++) {
            h = HTTPRequest.separate_(paramArr[i], "\r\n\r\n"); // [0]->header, [1]->params
            h[0] = HTTPRequest.analyzeHeader_(h[0]);
            ret.push([h[0], h[1]]);

        }
        return ret;
    }

    static analyzeParams(params: string): string[] {
        const param = params.split("&");
        const ret = [];
        if (params === '') return ret;
        for (const i in param) {
            ret.push(param[i].split("="));
        }
        return ret; // dict[0][0]=name dict[0][1]=value
    }

    public static buildBody(body: string[]): string {
        let ret = "";
        for (let i = 0; i < body.length; i++) {
            if (ret !== '') ret += "&";
            ret += body[0] + "=" + body[1];
        }
        return ret;

    }

    get rawHeader(): string {
        return this.rawHeader_;
    }

    get rawBody(): string {
        return this.rawBody_;
    }

    get rawLine(): string {
        return this.rawLine_;
    }

    get header(): {} {
        return this.header_;
    }

    get enctype(): [] {
        if (typeof this.header_['Content-Type'] === 'undefined') return [];
        return this.header_['Content-Type'];
    }

    get body(): [] {
        return this.body_;
    }

    get line(): {} {
        return this.line_;
    }

    get httpRequest() {
        return this.httpRequest_;
    }

    get success(): boolean {
        return this.success_;
    }

    renderOperationHTML() {
        let content = "";
        for (let i in this.body_) {
            content += HTMLRender.inputSet(this.body_[i][0], this.body_[i][1], i, 'b') + '<br />';
        }
        return content;
    }
}

const forbiddenHeader: { [key: string]: string } = {
    'Accept-Charset': '1',
    'Accept-Encoding': '1',
    'Access-Control-Request-Headers': '1',
    'Access-Control-Request-Method': '1',
    'Connection': '1',
    'Content-Length': '1',
    'Content-Type': '1',
    'Cookie': '1',
    'Cookie2': '1',
    'Date': '1',
    'DNT': '1',
    'Expect': '1',
    'Host': '1',
    'Keep-Alive': '1',
    'Origin': '1',
    'Proxy-': '1',
    'Sec-': '1',
    'Referer': '1',
    'TE': '1',
    'Trailer': '1',
    'Transfer-Encoding': '1',
    'Upgrade': '1',
    'Via': '1'
};

const forbiddenHeaderRegex = [
    /^Sec-.*$/,
    /^Proxy-.*$/
];

const HTMLRender = {
    inputSet: function (name: string, value: string, i, prefix: string = ''): string {
        let content = '';
        content += HTMLRender.select(`type[${i}]`, ['text', 'hidden', 'number', 'email']);
        content += HTMLRender.input(prefix + 'name[' + i + ']', name) + ":";
        content += HTMLRender.input(prefix + 'value[' + i + ']', value) + "\n";
        return content;
    },

    input: function (name: string, value: string, type: string = 'text', isEscape: boolean = true): string {
        if (isEscape) {
            name = escapeHTML(name);
            value = escapeHTML(value);
        }
        return `<input type="${type}" name="${name}" value="${value}" />`
    },

    select: function (name: string, optionValue: string[], isEscape: boolean = true, checkIdx: number = 0): string {
        let content: string = `<select name="${name}" >` + '\n';
        for (let i = 0; i < optionValue.length; i++) {
            let k: string = (isEscape ? escapeHTML(optionValue[i]) : optionValue[i]);
            content += HTMLRender.option(k, k, checkIdx === i) + '\n';
        }
        content += `</select>` + '\n';
        return content;
    },

    option: function (value: string, inner: string, isSelected: boolean = false): string {
        return `<option value=${value} ${(isSelected ? 'selected' : '')}>${inner}</option>`;
    }
};

