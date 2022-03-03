/*!
Hype Data Parser 1.1.0
copyright (c) 2022 Max Ziebell, (https://maxziebell.de). MIT-license
Based on csvToArray from Daniel Tillin 2011-2013
http://code.google.com/p/csv-to-array/
*/

/*
* Version-History
* 1.0.0	Initial release under MIT-license
* 1.0.1 Added minified version
* 1.0.2 Fixed minor typographic error Separator to Separator
* 1.0.3 Refactored head to removeHead, added forced removeHead false on csvToObject
* 1.0.4 Refactored some more aspects of this CSV parser by Daniel Tillin
* 1.0.5 Added CSV to object by key method
* 1.0.6 Added grouped option to CSV to object by key and csvToArrayByKey 
* 1.0.7 Fixed some regressions on defaults, thanks to @h_classen
* 1.0.8 Remove leading and trailing whitespaces on CSV string in csvToArray, 
        added filter option for csvToObject and csvToObjectByKey
* 1.0.9 Added aliases to all functions to support TSV format without needing to
        always specify the field separator (fSep) as tab each time
* 1.1.0 Added getTables to extract multiple tables from a single CSV/TSV string
        with the option to parse the tables directly as data, added includesTables

*/

if("HypeDataParser" in window === false) window['HypeDataParser'] = (function () {

	var _extensionName = 'Hype Data Parser';

	/**
	 * This function counts the times a char is found in a string
	 * 
	 * @param {String} str This is the text to be searched in
	 * @param {Char} c This is the single text character to search
	 * @return {Number} Returns a number of found matches
	 */
	function countChar(str, c) { 
		var result = 0;
		for(var i = 0; i<str.length; i++) {
			if(str[i]==c) result++;
		}
		return result;
	};

	/**
	 * This function determines the line endings used in a string
	 * 
	 * @param {String} str This is the text to inspect
	 * @return {Number} Returns the used line ending type
	 */
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
	 * This function splits a string containing multiple CSV/TSV tables
	 * and returns an object of string or if optionaly into a data format
	 * 
	 * @param {String} text This is the text (either TSV or CSV) containing the tables
	 * @param {Boolean} convert If this boolean is set to true table is directly converted else it is kept as a string
	 * @param {Object} options This object can be used to override defaults and is only used if conversion is enabled
	 * @return {Object} Returns an object with tables referenced by index and if provided also by sheet and table name
	 */
	function getTables(text, convert, options){
		var nl = getLineBreakChar(text);
		var tables = text.split(nl+nl);
		var data = {}
		tables.forEach(function(table, index){
			var tableInfo = table.split(new RegExp('^(.*):\\s(.*)'+nl));
			var tableData;
			if (tableInfo.length>1){
				var sheetName = tableInfo[1];
				var tableName = tableInfo[2];
				if (!data[sheetName]) data[sheetName] = {}
				tableData = convert? csvToArray(tableInfo[3], options) : tableInfo[3];
				data[sheetName][tableName] = tableData;
			}
			tableData = tableData || (convert? csvToArray(table, options) : table);
			if (tableData) data[index] =  tableData;
		});
		return data;
	}

	/**
	 * This function determines if a string most likely contains multiple tables (very simple check)
	 * 
	 * @param {String} str This is the text to inspect
	 * @return {Boolean} Returns if the provided text contains multiple tables
	 */
	function includesTables(text){
		var nl = getLineBreakChar(text);
		return text.indexOf(nl+nl) !== -1;
	}

	/**
	 * This function parses a CSV string into an array structur
	 * Given a second paramter options of type object, default options can be overriden
	 * 
	 * * `fSep` defaults to ';' or ',' (depending on what character is found more often)
	 * * `rSep` defaults to '\n', '\r' or '\r\n' (depending on auto detection mechanism)
	 * * `quot` defaults to '"'
	 * * `head` defaults to false and allows ignoring the first row
	 * * `trim` defaults to false
	 * 
	 * @param {String} csv This is the text to consider as CSV
	 * @param {Object} options This object can be used to override defaults
	 * @return {Array} Returns an array of rows with nested arrays of field data
	 */
	function csvToArray(csv, options) {
		if (!csv) return;
		
		options = options || {};
		
		options.trim = options.trim || options.trimWhitespace || false;
		options.head = options.head || options.removeHead || false;
		options.quot = options.quot || options.quote || '"';
		options.fSep = options.fSep || options.fieldSeparator || (countChar(csv,';') > countChar(csv, ',')? ';' : ',');
		options.rSep = options.rSep || options.rowSeparator || (getLineBreakChar(csv));
	
		csv = csv.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		
		var a = [['']];

		for (var r = f = p = q = 0; p < csv.length; p++) {
			switch (c = csv.charAt(p)) {
				case options.quot:
					if (q && csv.charAt(p + 1) == options.quot) {
						a[r][f] += options.quot;
						++p;
					} else {
						q ^= 1;
					}
					break;
				case options.fSep:
					if (!q) {
						if (options.trim) {
							a[r][f] = a[r][f].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
						}
						a[r][++f] = '';
					} else {
						a[r][f] += c;
					}
					break;
				case options.rSep.charAt(0):
					if (!q && (!options.rSep.charAt(1) || (options.rSep.charAt(1) && options.rSep.charAt(1) == csv.charAt(p + 1)))) {
						if (options.trim) {
							a[r][f] = a[r][f].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
						}
						a[++r] = [''];
						a[r][f = 0] = '';
						if (options.rSep.charAt(1)) {
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
		if (options.head) {
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
	 * @param {String} csv This is the text to consider as CSV
	 * @param {Object} options This object can be used to override defaults
	 * @return {Array} Returns an array of rows with nested objects containing named fields
	 */
	 function csvToObject(csv, options){
		if (!csv) return;
		options = options || {};

		var rows = csvToArray(csv, Object.assign(options, {
			head:false
		}));
		var headers = rows.shift();
		var data = [];
		
		rows.forEach(function(row){
			var obj = {}
			row.forEach(function(cell, i){
				obj[ headers[i] ] = cell;
			});
			if (typeof(options.filter)=='function') {
				if (options.filter(obj, data, headers)===false) return;
			}
			data.push(obj);
		});
		
		return data;
	}

	/**
	 * Parse a CSV file into an object grouped by the specified key, containing each an array of rows of nested objects with named cells (key and value). 
	 * If a specific object key only has a single member, the object is directly listed without being nested in an array. The behavior of this function 
	 * can be modified by specifying the value of `options.objectByKeyMode`:
	 *
	 * * `auto` (default) - this setting parses each nested key into a direct object, but converts it into a list if multiple elements by the key are found
	 * * `list` - this setting always forces a nested array listing. Hence, even single entries by the specified key will result in a nested array
	 * * `reduce` - this function never creates a nested list and multiple entries by a specified key overwrite each other and the last occurrence prevails
	 * 
	 * @param {String} csv This is the text to consider as CSV
	 * @param {String|Number} key Either the key as a name or the index as a number (0 based)
	 * @param {Object} options This object can be used to override defaults
	 * @return {Object} Returns an object with named keys with nested objects containing named fields
	 */
	function csvToObjectByKey(csv, key, options){
		if (!csv || !key) return;
		options = options || {};

		if (!Array.isArray(csv)) csv = csvToArray(csv, options);

		var rows = csv.slice(1);
		var headers = csv.slice(0, 1)[0];		
		var keyIndex = typeof key == 'number'? key : headers.indexOf(key);
		var data = {};
		
		if (keyIndex == -1) return;

		rows.forEach(function(row){
			var obj = {}
			row.forEach(function(cell, i){
				obj[ headers[i] ] = cell;
			});
			var currentKeyName = headers[keyIndex];
			var currentKeyValue = obj[currentKeyName];
			
			if (typeof(options.filter)=='function') {
				if (options.filter(obj, data, headers)===false) return;
			}

			switch (options.objectByKeyMode) {
				
				case 'reduce':
					data[currentKeyValue] = obj;
					break;
				
				case 'list': case 'array':
					if (!data[currentKeyValue]) data[currentKeyValue] = [];
					data[currentKeyValue].push(obj);
					break;

				default:
				case 'auto':
					if (!data[currentKeyValue]){
						data[currentKeyValue] = obj;
					} else {
						if (!Array.isArray(data[currentKeyValue])) data[currentKeyValue] = [data[currentKeyValue]];
						data[currentKeyValue].push(obj);
					}
					break;
			}
			
		});
		
		return data;
	}

	/**
	 * This function parses a CSV string into an array structur 
	 * while reducing the return to a shallow list with a single column of data
	 * 
	 * @param {String} csv This is the text to consider as CSV
	 * @param {String|Number} key Either the key as a name or the index as a number (0 based)
	 * @param {Object} options This object can be used to override defaults
	 * @return {Array} Returns an array data from the requested column
	 */
	function csvToArrayByKey(csv, key, options){
		if (!csv || !key) return;
		options = options || {};

		if (!Array.isArray(csv)) csv = csvToArray(csv, options);
		
		var rows = csv.slice(1);
		var headers = csv.slice(0, 1)[0];		
		var keyIndex = typeof key == 'number'? key : headers.indexOf(key);
		var data = [];
		
		if (keyIndex == -1) return;

		rows.forEach(function(row){
			data.push(row[keyIndex]);
		});

		return data;
	}

	/**
	 * This is an alias to the TSV version of the csvToArray method. 
	 * The only difference being that the field separator (fSep) is set to tab (\t). 
	 * **Please look at the documentation for csvToArray**
	 */
	function tsvToArray(tsv, options) {
		return csvToArray(tsv, Object.assign(options || {}, {fSep:'\t'}))
	}

	/**
	 * This is an alias to the TSV version of the csvToObject method. 
	 * The only difference being that the field separator (fSep) is set to tab (\t). 
	 * **Please look at the documentation for csvToObject**
	 */	
	function tsvToObject(tsv, options) {
		return csvToObject(tsv, Object.assign(options || {}, {fSep:'\t'}))
	}

	/**
	 * This is an alias to the TSV version of the csvToArrayByKey method. 
	 * The only difference being that the field separator (fSep) is set to tab (\t). 
	 * **Please look at the documentation for csvToArrayByKey**
	 */
	function tsvToArrayByKey(tsv, key, options) {
		return csvToArrayByKey(tsv, key, Object.assign(options || {}, {fSep:'\t'}))
	}

	/**
	 * This is an alias to the TSV version of the csvToObjectByKey method. 
	 * The only difference being that the field separator (fSep) is set to tab (\t). 
	 * **Please look at the documentation for csvToObjectByKey**
	 */
	function tsvToObjectByKey(tsv, key, options) {
		return csvToObjectByKey(tsv, key, Object.assign(options || {}, {fSep:'\t'}))
	}

	/**
	 * @typedef {Object} HypeDataParser
	 * @property {String} version Version of the extension
	 * @property {Function} csvToArray Convert a CSV string into an array rows with nested cells
	 * @property {Function} csvToArrayByKey Convert a CSV string into an array of cells
	 * @property {Function} csvToObject Convert a CSV string into an array of nested objects (cells as key, value)
	 * @property {Function} csvToObjectByKey Convert a CSV string into an object grouped by the specified key with array of nested objects (cells as key, value)
	 * @property {Function} tsvToArray Convert a TSV string into an array rows with nested cells
	 * @property {Function} tsvToArrayByKey Convert a TSV string into an array of cells
	 * @property {Function} tsvToObject Convert a TSV string into an array of nested objects (cells as key, value)
	 * @property {Function} tsvToObjectByKey Convert a TSV string into an object grouped by the specified key with array of nested objects (cells as key, value)
	 * @property {Function} getTables Returns all found tables in an object lookup with index keys. If provided sheet and table names are additionaly used in the lookup.
	 * @property {Function} includesTables Returns a boolean indicating if a CSV/TSV string most likely contains multiple tables (simple check)
	 * @property {Function} getLineBreakChar Returns the line break character used in a multiline string
	 * @property {Function} countChar Returns the number of occurances of a given char in a string
	*/
	 var HypeDataParser = {
		version: '1.1.0',

		csvToArray: csvToArray,
		csvToObject: csvToObject,
		csvToObjectByKey: csvToObjectByKey,
		csvToArrayByKey: csvToArrayByKey,
		
		tsvToArray: tsvToArray,
		tsvToObject: tsvToObject,
		tsvToArrayByKey: tsvToArrayByKey,
		tsvToObjectByKey: tsvToObjectByKey,
		
		getTables: getTables,
		includesTables: includesTables,

		getLineBreakChar: getLineBreakChar,
		countChar: countChar,
	};

	/** 
	 * Reveal Public interface to window['HypeDataParser']
	 * return {HypeDataParser}
	 */
	return HypeDataParser;
})();
