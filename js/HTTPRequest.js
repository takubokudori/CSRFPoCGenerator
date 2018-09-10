// analyze raw request
// store header etc.
var HTTPRequest = /** @class */ (function () {
    function HTTPRequest(httpRequest) {
        if (httpRequest === void 0) { httpRequest = ""; }
        this.success_ = false;
        this.rawLine_ = "";
        this.rawHeader_ = "";
        this.rawBody_ = "";
        this.line_ = {};
        this.header_ = {};
        this.body_ = [];
        if (httpRequest === "")
            return; // empty request
        this.analyzeHTTPRequest(httpRequest);
    }
    HTTPRequest.separate_ = function (str, delimiter) {
        if (typeof str !== 'string' || typeof delimiter !== 'string')
            return [];
        var idx = str.indexOf(delimiter);
        return [str.substring(0, idx), str.slice(idx + delimiter.length)];
    };
    HTTPRequest.prototype.analyzeHTTPRequest = function (httpRequest) {
        this.success_ = false;
        this.httpRequest_ = httpRequest;
        var result;
        httpRequest = httpRequest.replace(/\r?\n/g, "\r\n"); // unified \n -> \r\n
        var http = HTTPRequest.separate_(httpRequest, "\r\n\r\n"); // [0]->request line & header, [1]->body
        var httpHeader = HTTPRequest.separate_(http[0], "\r\n"); // [0]->request line, [1]->header
        if (this.analyzeLine(httpHeader[0]) === false)
            return false; // failed to parse request line.
        if (this.analyzeHeader(httpHeader[1]) === false)
            return false; // failed to parse header.
        // body
        if (typeof this.header_['Content-Type'] !== 'undefined')
            result = this.analyzeHTTPBody(http[1], this.header_['Content-Type']);
        else if (this.line_['method'] === "GET")
            result = this.analyzeHTTPBody(HTTPRequest.separate_(this.line_['url'], "?")[1]);
        else
            result = this.analyzeHTTPBody(http[1]);
        if (result === false)
            return false; // failed to parse body.
        this.success_ = true;
        return true;
    };
    HTTPRequest.prototype.analyzeLine = function (line) {
        var q = line.split(' ');
        if (q.length <= 1)
            return false;
        this.rawLine_ = line;
        this.line_ = {
            'method': q[0],
            'url': q[1],
            'version': q[2]
        };
        return true;
    };
    HTTPRequest.buildLine = function (line) {
        if (!line['method'])
            line['method'] = 'POST';
        if (!line['version'])
            line['version'] = 'HTTP/1.1';
        return line['method'] + " " + line['url'] + " " + line['version'];
    };
    HTTPRequest.analyzeURL = function (url) {
        var a = HTTPRequest.separate_(url, "?");
        return {
            'url': a[0],
            'querystring': HTTPRequest.analyzeParams(a[1])
        };
    };
    HTTPRequest.analyzeHeaderOption = function (headerValue) {
        var v = headerValue.split('; ');
        var ret = [];
        for (var i = 0; i < v.length; i++) {
            var k = v[i].split('=');
            if (k.length === 1)
                ret.push(k[0]); // string
            else
                ret.push(k); // array
        }
        return ret;
    };
    HTTPRequest.analyzeHeader_ = function (rawHeader) {
        var header = rawHeader.split(/\r\n|\n/);
        var ret = {
            'custom': [],
        };
        for (var i = 0; i < header.length; i++) {
            var h = HTTPRequest.separate_(header[i], ':');
            if (h.length === 2) {
                h[0] = h[0].trim(); // header name
                h[1] = h[1].trim(); // value
                if (!forbiddenHeader[h[0]])
                    ret['custom'].push(h); // custom header
                else { // forbidden header
                    if (h[0] === 'Referer')
                        ret[h[0]] = h[1]; // Referer: http://localhost?a=b etc...
                    else
                        ret[h[0]] = HTTPRequest.analyzeHeaderOption(h[1]);
                }
            }
        }
        return ret;
    };
    HTTPRequest.prototype.analyzeHeader = function (rawHeader) {
        this.rawHeader_ = rawHeader;
        this.header_ = HTTPRequest.analyzeHeader_(rawHeader);
        return true;
    };
    HTTPRequest.buildHeaderOption = function (headerValue) {
        if (typeof headerValue === 'string')
            return headerValue;
        var ret = '';
        for (var i = 0; i < headerValue.length; i++) {
            if (ret !== '')
                ret += '; ';
            if (typeof headerValue[i] === 'string') {
                ret += headerValue[i];
            }
            else {
                ret += headerValue[i].join("=");
            }
        }
        return ret;
    };
    HTTPRequest.buildHeader = function (header) {
        var ret = "";
        for (var i in header) {
            if (ret !== '')
                ret += '\n';
            if (i === 'custom') {
                var q = '';
                for (var j in header[i]) {
                    if (q !== '')
                        q += '\n';
                    if (header[i].hasOwnProperty(j)) {
                        q += header[i][j][0] + ": " + this.buildHeaderOption(header[i][j][1]);
                    }
                }
                ret += q;
            }
            else {
                ret += i + ": " + this.buildHeaderOption(header[i]);
            }
        }
        return ret;
    };
    HTTPRequest.prototype.analyzeHTTPBody = function (rawBody, contentType) {
        if (contentType === void 0) { contentType = []; }
        var ret;
        if (contentType[0] === "multipart/form-data") {
            ret = HTTPRequest.analyzeMultipartParams(rawBody, HTTPRequest.getBoundary(contentType));
        }
        else {
            ret = HTTPRequest.analyzeParams(rawBody);
        }
        this.rawBody_ = rawBody;
        this.body_ = ret;
        return true;
    };
    HTTPRequest.getBoundary = function (contentType) {
        var boundary = "";
        for (var i in contentType) {
            if (contentType.hasOwnProperty(i)) {
                if ((Array.isArray(contentType[i])) && contentType[i][0] === 'boundary') {
                    boundary = contentType[i][1];
                    break;
                }
            }
        }
        return boundary;
    };
    HTTPRequest.analyzeMultipartParams = function (params, boundary) {
        var ret = [];
        var h;
        var paramArr = params.split('--' + boundary);
        for (var i = 0; i < paramArr.length; i++) {
            h = HTTPRequest.separate_(paramArr[i], "\r\n\r\n"); // [0]->header, [1]->params
            h[0] = HTTPRequest.analyzeHeader_(h[0]);
            ret.push([h[0], h[1]]);
        }
        return ret;
    };
    HTTPRequest.analyzeParams = function (params) {
        var param = params.split("&");
        var dict = [];
        for (var i in param) {
            dict.push(param[i].split("="));
        }
        return dict; // dict[0][0]=name dict[0][1]=value
    };
    HTTPRequest.buildBody = function (body) {
        var ret = "";
        for (var i = 0; i < body.length; i++) {
            if (ret !== '')
                ret += "&";
            ret += body[0] + "=" + body[1];
        }
        return ret;
    };
    Object.defineProperty(HTTPRequest.prototype, "rawHeader", {
        get: function () {
            return this.rawHeader_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPRequest.prototype, "rawBody", {
        get: function () {
            return this.rawBody_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPRequest.prototype, "rawLine", {
        get: function () {
            return this.rawLine_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPRequest.prototype, "header", {
        get: function () {
            return this.header_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPRequest.prototype, "enctype", {
        get: function () {
            if (typeof this.header_['Content-Type'] === 'undefined')
                return [];
            return this.header_['Content-Type'];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPRequest.prototype, "body", {
        get: function () {
            return this.body_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPRequest.prototype, "line", {
        get: function () {
            return this.line_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPRequest.prototype, "httpRequest", {
        get: function () {
            return this.httpRequest_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HTTPRequest.prototype, "success", {
        get: function () {
            return this.success_;
        },
        enumerable: true,
        configurable: true
    });
    HTTPRequest.prototype.renderOperationHTML = function () {
        var content = "";
        for (var i in this.body_) {
            content += HTMLrender.inputSet(this.body_[i][0], this.body_[i][1], i, 'b') + '<br />';
        }
        return content;
    };
    return HTTPRequest;
}());
var forbiddenHeader = {
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
var HTMLrender = {
    inputSet: function (name, value, i, prefix) {
        if (prefix === void 0) { prefix = ''; }
        var content = '';
        content += HTMLrender.input(prefix + 'name[' + i + ']', name) + ":";
        content += HTMLrender.input(prefix + 'value[' + i + ']', value) + "\n";
        return content;
    },
    input: function (name, value, type, isEscape) {
        if (type === void 0) { type = 'text'; }
        if (isEscape === void 0) { isEscape = true; }
        if (isEscape) {
            name = escapeHTML(name);
            value = escapeHTML(value);
        }
        return "<input type=\"" + type + "\" name=\"" + name + "\" value=\"" + value + "\" />";
    }
};
//# sourceMappingURL=HTTPRequest.js.map