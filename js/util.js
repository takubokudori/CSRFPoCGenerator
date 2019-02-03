function escapeJavascript(str) {
    return str.replace(/['"\\\n\r]|(cript>)/g, function (match) {
        return {
            '\r': '\\r',
            '\n': '\\n',
            "'": '\\\'',
            '"': '\\\"',
            "\\": '\\\\',
            "cript>": 'cr\'+\'ipt>',
        }[match];
    });
}
function escapeJavascriptCRLF(str) {
    return str.replace(/[\n\r]/g, function (match) {
        return {
            '\r': '\\r',
            '\n': '\\n',
        }[match];
    });
}
function escapeHTML(str) {
    if (typeof str !== 'string')
        return str;
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
        }[match];
    });
}
function e(str) {
    return escapeHTML(str);
}
function fullEscapeHTML(str, withoutPrintable) {
    if (withoutPrintable === void 0) { withoutPrintable = false; }
    if (typeof str !== 'string')
        return str;
    var content = "";
    for (var i = 0; i < str.length; i++) {
        content += "&#x" + str.charCodeAt(i) + ";";
    }
    if (withoutPrintable) {
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            // ! #$% ()*+,-./0-9 ?@A-Z[\]^_`a-z...
            var b = (c === 0x21) || (0x23 <= c && c <= 0x25) || (0x27 <= c && 0x3B) || (0x3F <= c && c <= 0x7E);
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
    if (typeof str !== 'string')
        return str;
    var content = "String.fromCharCode(";
    for (var i = 0; i < str.length; i++) {
        if (i !== 0)
            content += ',';
        content += str.charCodeAt(i);
    }
    content += ")";
    return content;
}
function isValidURL(str) {
    return /^.+:\/\/.+$/.test(str);
}
//# sourceMappingURL=util.js.map