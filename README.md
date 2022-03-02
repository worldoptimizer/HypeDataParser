# Hype Data Parser

![HypeDataParser.jpg](https://playground.maxziebell.de/Hype/DataParser/HypeDataParser.jpg)

<sup>The cover artwork is not hosted in this repository and &copy;opyrighted by Max Ziebell</sup>

Helper to parse strings into JavaScript data formats. Currently, this helper supports the following methods:

---

### HypeDataParser.csvToArray (csv, options)

Parse a CSV file into an **array of rows** containing each a nested **array of cells**. This function accepts a CSV text string.

---

### HypeDataParser.csvToArrayByKey (csv, key, options)

Parse a CSV file by the specified key and returns an **array of cells** contained in that column. This function accepts a CSV text string or the data structure returned by HypeDataParser.csvToArray.

---

### HypeDataParser.csvToObject (csv, options)

Parse a CSV file into an **array of rows** of nested **objects with named cells (key and value) **


---

### HypeDataParser.csvToObjectByKey (csv, key, options)

Parse a CSV file into an **object** grouped by the specified key, containing each an **array of rows** of nested **objects with named cells (key and value)**. If a specific object key only has a single member, the object is directly listed without being nested in an array. The behavior of this function can be modified by specifying the value of `options.objectByKeyMode`:

* `auto` (default) - this setting parses each nested key into a direct object, but converts it into a list if multiple elements by the key are found
* `list`- this setting always forces a nested array listing. Hence, even single entries by the specified key will result in a nested array
* `reduce`- this function never creates a nested list and multiple entries by a specified key overwrite each other and the last occurrence prevails


---

## Documentation

There is a [JSDoc](https://en.wikipedia.org/wiki/JSDoc) based documentation of the functions at https://doxdox.org/worldoptimizer/HypeDataParser

Content Delivery Network (CDN)
--

Latest version can be linked into your project using the following in the head section of your project:

```html
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeDataParser/HypeDataParser.min.js"></script>
```
Optionally you can also link a SRI version or specific releases. 
Read more about that on the JsDelivr (CDN) page for this extension at https://www.jsdelivr.com/package/gh/worldoptimizer/HypeDataParser

Learn how to use the latest extension version and how to combine extensions into one file at
https://github.com/worldoptimizer/HypeCookBook/wiki/Including-external-files-and-Hype-extensions
