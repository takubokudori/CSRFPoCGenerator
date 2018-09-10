function escapeJavascript(str: string): string {
    return str.replace(/['"\\\n\r]|(cript>)/g, function (match) {
        return {
            '\r': '\\r',
            '\n': '\\n',
            "'": '\\\'',
            '"': '\\\"',
            "\\": '\\\\',
            "cript>": 'cr\'+\'ipt>',
        }[match]
    });
}

function escapeJavascriptCRLF(str: string): string {
    return str.replace(/[\n\r]/g, function (match) {
        return {
            '\r': '\\r',
            '\n': '\\n',
        }[match]
    });
}

function escapeHTML(str: string): string {
    if (typeof str !== 'string') return str;
    return str.replace(/[&'`"<>\n\r]/g, function (match) {
        return {
            '\r': '&#x0D',
            '\n': '&#x0A',
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
        }[match]
    });
}

function e(str: string): string {
    return escapeHTML(str);
}

function fullEscapeHTML(str, withoutPrintable = false) {
    if (typeof str !== 'string') return str;
    let content = "";
    for (let i = 0; i < str.length; i++) {
        content += "&#x" + str.charCodeAt(i) + ";";
    }
    if (withoutPrintable) {
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            // ! #$% ()*+,-./0-9 ?@A-Z[\]^_`a-z...
            let b = (c === 0x21) || (0x23 <= c && c <= 0x25) || (0x27 <= c && 0x3B) || (0x3F <= c && c <= 0x7E);
            content += (b ? ("&#x" + str.charCodeAt(i) + ";") : str[i]);
        }
    }
    return content;
}

/**
 * "abc" -> "String.fromCharCode(97,98,99)"
 * for sending binary files.
 */
function toFromCharCodes(str) {
    if (typeof str !== 'string') return str;
    let content = "String.fromCharCode(";
    for (let i = 0; i < str.length; i++) {
        if (i !== 0) content += ',';
        content += str.charCodeAt(i);
    }
    content += ")";
    return content;
}
