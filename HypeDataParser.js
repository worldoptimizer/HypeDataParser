/*!
Hype Data Parser 1.0.4
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
* 1.0.4 Refactored some more aspects of this CSV parser by Daniel Tillin
*/
if("HypeDataParser" in window === false) window['HypeDataParser'] = (function () {

	var _extensionName = 'Hype Data Parser';


	function count(str, c) { 
		var result = 0;
		for(var i = 0; i<str.length; i++) {
			if(str[i]==c)result++;
		}
		return result;
	};

	function getLineBreakChar(str) {
		const indexOfLF = str.indexOf('\n', 1);
		if (indexOfLF === -1) {
			if (str.indexOf('\r') !== -1) return '\r';
			return '\n';
		}
		if (str[indexOfLF - 1] === '\r') return '\r\n';
		return '\n';
	}

	/**
	 * This function parses a CSV string into an array structur
	 * Given a second paramter options of type object, default options can be overriden
	 *      * fSep defaults to ','
	 *      * rSep defaults to '\n'
	 *      * quot defaults to '"'
	 *      * head defaults to false and allows ignoring the first row
	 *      * trim defaults to false
	 * 
	 * @param {String} text This is the text to consider as CSV
	 * @param {Object} options This object can be used to override defaults
	 * @return {Array} Returns an array of rows with nested arrays of field data
	 */
	function csvToArray(csv, o) {
		var od = {
			'fSep': count(csv,';') > count(csv, ',')? ';' : ',',
			'rSep': getLineBreakChar(csv),
			'quot': '"',
			'head': false,
			'trim': false
		}
		if (o) {
			for (var i in od) {
				if (!o[i]) o[i] = od[i];
			}
		} else {
			o = od;
		}
		var a = [
			['']
		];
		for (var r = f = p = q = 0; p < csv.length; p++) {
			switch (c = csv.charAt(p)) {
				case o.quot:
					if (q && csv.charAt(p + 1) == o.quot) {
						a[r][f] += o.quot;
						++p;
					} else {
						q ^= 1;
					}
					break;
				case o.fSep:
					if (!q) {
						if (o.trim) {
							a[r][f] = a[r][f].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
						}
						a[r][++f] = '';
					} else {
						a[r][f] += c;
					}
					break;
				case o.rSep.charAt(0):
					if (!q && (!o.rSep.charAt(1) || (o.rSep.charAt(1) && o.rSep.charAt(1) == csv.charAt(p + 1)))) {
						if (o.trim) {
							a[r][f] = a[r][f].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
						}
						a[++r] = [''];
						a[r][f = 0] = '';
						if (o.rSep.charAt(1)) {
							++p;
						}
					} else {
						a[r][f] += c;
					}
					break;
				default:
					a[r][f] += c;
			}
		}
		if (o.head) {
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
	 * should be present in the CSV for text to work properly.
	 * 
	 * @param {String} text This is the text to consider as CSV
	 * @param {Object} options This object can be used to override defaults
	 * @return {Array} Returns an array of rows with nested objects containing named fields
	 */
	 function csvToObject(csv, o){

		var rows = csvToArray(csv, o)
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
		version: '1.0.4',
		csvToArray: csvToArray,
		csvToObject: csvToObject,
		getLineBreakChar: getLineBreakChar,
		count: count,
	};

	/** 
	 * Reveal Public interface to window['HypeDataParser']
	 * return {HypeDataParser}
	 */
	return HypeDataParser;
})();
