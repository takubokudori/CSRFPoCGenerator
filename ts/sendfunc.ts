interface sendfunc {
    generate(): boolean;

    generateHTML(title, bodyhtml): string;

    send(): boolean;

    sendFunc(): boolean;
}

class formfunc implements sendfunc {
    generate(): boolean {
        return false;
    }

    generateHTML(title, bodyhtml): string {
        return "";
    }

    send(): boolean {
        return false;
    }

    sendFunc(): boolean {
        return false;
    }

}

const forfunc = {
    generate: function () {
        let ezhtml = "";
        const req = getRequest();
        if (req === false) return false;
        ezhtml += '<form target="dummyfrm" name="evilform" action="' + req['url'] + '" method="' + req['method'] + '" enctype="' + req['enctype'] + '">\n';
        const params = req['params'];
        for (let i = 0; i < params.length; i++) {
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
        let content = `${getHTMLheader(title)}
<body${(isAutoSubmit()) ? ' onload="csrfSubmit();' : ''}>
${bodyhtml}${(!isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : ''}
${this.sendFunction()}
<p>${title}</p>
${getHTMLfooter()}
`;
        let content = getHTMLheader(title);
        content += '<body';
        if (isAutoSubmit()) content += ' onload="csrfSubmit();"';
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
        const req = getRequest();
        document.getElementById("stat").innerHTML += "<p>Request sent.</p><p>" + escapeHTML(req['url']) + "</p><p>" + escapeHTML(req['params']) + "</p><hr />";
        const submit = HTMLFormElement.prototype["submit"].bind(document.evilform);
        submit();
    },

    sendFunction: function () {
        let content = '<sc' + 'ript>\n';
        content += 'function csrfSubmit(){\n';
        content += 'let submit = HTMLFormElement.prototype["submit"].bind(document.evilform);\n';
        content += 'submit();\n';
        content += '}\n';
        content += '</sc' + 'ript>\n';
        return content;
    }

};

function getHTMLheader(title = "CSRF PoC") {
    let content = `<!DOCTYPE html>

<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
</head>
`;
    return content;
}

function getHTMLfooter() {
    let content = '</html>\n';
    return content;
}
