/*!
Hype Data Parser 1.0.3
copyright (c) 2022 Max Ziebell, (https://maxziebell.de). MIT-license
Based on csvToArray from Daniel Tillin 2011-2013
http://code.google.com/p/csv-to-array/
*/

/*
* Version-History
* 1.0.0	Initial release under MIT-license
* 1.0.1 Added minified version
* 1.0.2 Fixed minor typographic error Seperator to Separator
* 1.0.3 Refactored head to removeHead, added forced removeHead false on csvToObject
*/
if("HypeDataParser" in window === false) window['HypeDataParser'] = (function () {

	var _extensionName = 'Hype Data Parser';

    /**
	 * This function parses a CSV string into an array structur
     * Given a second paramter options of type object, default options can be overriden
	 *      * fieldSeparator defaults to ','
     *      * rowSeparator defaults to '\n'
     *      * quot defaults to '"'
     *      * removeHead defaults to false and allows ignoring the first row
     *      * trim defaults to false
     * 
	 * @param {String} text This is the text to consider as CSV
	 * @param {Object} options This object can be used to override defaults
     * @return {Array} Returns an array of rows with nested arrays of field data
	 */
     csvToArray = function (text, options) {
        var defaultOptions = {
            'fieldSeparator': ';',
            'rowSeparator': '\n',
            'quot': '"',
            'removeHead': false,
            'trim': false
        }
        var o = typeof(options) == 'object'? Object.assign(defaultOptions, o) : defaultOptions;
        var a = [['']];

        for (var r = f = p = q = 0; p < text.length; p++) {
            switch (c = text.charAt(p)) {
        
                case o.quot:
                    if (q && text.charAt(p + 1) == o.quot) {
                        a[r][f] += o.quot;
                        ++p;
                    } else {
                        q ^= 1;
                    }
                    break;
                
                case o.fieldSeparator:
                    if (!q) {
                        if (o.trim) {
                            a[r][f] = a[r][f].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                        }
                        a[r][++f] = '';
                    } else {
                        a[r][f] += c;
                    }
                    break;
                
                case o.rowSeparator.charAt(0):
                    if (!q && (!o.rowSeparator.charAt(1) || (o.rowSeparator.charAt(1) && o.rowSeparator.charAt(1) == text.charAt(p + 1)))) {
                        if (o.trim) {
                            a[r][f] = a[r][f].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                        }
                        a[++r] = [''];
                        a[r][f = 0] = '';
                        if (o.rowSeparator.charAt(1)) {
                            ++p;
                        }
                    } else {
                        a[r][f] += c;
                    }
                    break;
                
                default:
                    a[r][f] += c;
                    break;
            }
        }

        if (o.removeHead) {
            a.shift()
        }

        if (a[a.length - 1].length < a[0].length) {
            a.pop()
        }

        return a;
    }

    /**
	 * This function uses csvToArray (see function description), but converts 
     * the basic array into an object with keys based on the header.
     * Because that is the case the removeHead option cannot be overriden and a header
     * should be present in the CSV for this to work properly.
     * 
	 * @param {String} text This is the text to consider as CSV
	 * @param {Object} options This object can be used to override defaults
     * @return {Array} Returns an array of rows with nested objects containing named fields
	 */
    function csvToObject(text, options){
        var rows = csvToArray(text, Object.assign(options, {
            removeHead: false
        }));
        var headers = rows.shift();
        var data = [];
        
        rows.forEach(function(row){
            var obj = {}
            row.forEach(function(cell, i){
                obj[ headers[i] ] = cell;
            });
            data.push(obj);
        });
        
        return data;
    }

	/**
	 * @typedef {Object} HypeDataParser
	 * @property {String} version Version of the extension
	 * @property {Function} csvToArray Convert a CSV string into an array
	 * @property {Function} csvToObject Convert a CSV string into an object
	 */
	 var HypeDataParser = {
		version: '1.0.3',
		csvToArray: csvToArray,
        csvToObject: csvToObject,
	};

	/** 
	 * Reveal Public interface to window['HypeDataParser']
	 * return {HypeDataParser}
	 */
	return HypeDataParser;
})();
