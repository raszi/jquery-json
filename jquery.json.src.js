/*jslint evil: true */
/*global jQuery */
/*!
 * jQuery JSON Plugin
 * version: 1.3.1 (2009-08-13)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris technically wrote this plugin, but it is based somewhat
 * on the JSON.org website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold. I really just cleaned it up.
 *
 * It is also based heavily on MochiKit's serializeJSON, which is
 * copyrighted 2005 by Bob Ippolito.
 */
/*
 * Changelog
 *
 * --- 1.3.1 ------------------------------------------------------------------
 * - use more jQuery functions
 * - use the native JSON parser
 * - fixed the Date conversion
 * - do not taint the namespace
 * - do not use RegExp.test() twice
 * - whitespace fixes
 * - jslinted (http://www.jslint.com/)
 * - imported to github
 * ----------------------------- KARASZI Istvan <jquery-json@spam.raszi.hu> ---
 *
 */
(function( $ ) {
    // Format integers to have at least two digits.
	var toIntegersAtLease = function( n ) {
        return (n < 10) ? "".concat("0", n) : n;
    };

	// the escapeable RegExp
    var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;

	// table of character substitutions
    var substitutions = {    
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	};

	// Escapes out the characters
	var escapeChars = function( a ) {
		var c = substitutions[a];

		// get the replace string from the substitutions (if we have it)
		if (typeof c == "string") {
			return c;
		}

		// calculate the replacement
		c = a.charCodeAt();
		return "".concat('\\u00', Math.floor(c / 16).toString(16), (c % 16).toString(16));
	};

	// Quotes string with the specified character
	var quoteString = function( string, s, e ) {
		if (arguments.length == 1) {
			s = '"'; e = '"';
		} else if (arguments.length == 2) {
			e = s;
		}

		return ''.concat(s, string, e);
	};

    // Places quotes around a value and escapes it if needed intelligently.
    var escapeValue = function( value ) {
		// make sure we have a string here
		var string = String(value);

		// return a quoted (escaped) string
		return quoteString.call(jQuery, string.replace(escapeable, escapeChars));
    };

	// converts date to JSON
	// 2009-08-13T08:54:25Z
	var convertDate = function( date ) {
		var ret = "".concat(
			date.getUTCFullYear(),
			"-",
			toIntegersAtLease.call(jQuery, date.getUTCMonth() + 1),
			"-",
			toIntegersAtLease.call(jQuery, date.getUTCDate()),
			"T",
			toIntegersAtLease.call(jQuery, date.getUTCHours()),
			":",
			toIntegersAtLease.call(jQuery, date.getUTCMinutes()),
			":",
			toIntegersAtLease.call(jQuery, date.getUTCSeconds()),
			"Z"
		);

		return quoteString.call(jQuery, ret);
    };

	// Converts the object to JSON
    $.toJSON = function( o, compact ) {
		// Check for native JSON implementation
		if (typeof JSON == "object" && typeof JSON.stringify == "function") {
			return JSON.stringify(o);
		}

        var type = typeof(o);

		// undefined values become "undefined"
        if (type == "undefined") {
            return "undefined";
		}

		// numbers and booleans remains the same (just converted to String)
        if (type == "number" || type == "boolean") {
            return String(o);
		}

		// null is a null
        if (o === null) {
            return "null";
		}

        // Is it a String?
        if (type == "string") {
            return escapeValue.call(jQuery, o);
        }

		// Is it a Date?
		if (o instanceof Date) {
			return convertDate.call(jQuery, o);
		}

        // Does it have a .toJSON function?
        if (type == "object" && typeof o.toJSON == "function") {
            return o.toJSON(compact);
		}

		var ret = [];

        // Is it an array?
		if ($.isArray(o)) {
			$.each(o, function() {
				ret.push($.toJSON(this, compact));
			});

			return quoteString.call(jQuery, ret.join((compact) ? "," : ", "), (compact) ? '[' : '[ ', (compact) ? ']' : ' ]');
		}

        // If it's a function, we have to warn somebody!
        if (type == "function") {
            throw new TypeError("Unable to convert object of type 'function' to json.");
        }

        // It's probably an object, then.
		$.each(o, function( k, v ) {
			var name;
			type = typeof(k);

			if (type == "number") {
				name = quoteString.call(jQuery, k);
			} else if (type == "string") {
				name = escapeValue.call(jQuery, k);
			} else {
				return true; // skip non-string or number keys
			}

			var val = $.toJSON(o[k], compact);

			if (typeof val  != "string") {
				// skip non-serializable values
				return true;
			}

			ret.push("".concat(name, (compact) ? ":" : ": ", val));
		});

		return quoteString.call(jQuery, ret.join((compact) ? "," : ", "), (compact) ? '{' : '{ ', (compact) ? '}' : ' }');
    };

	// converts to JSON with compact mode
    $.compactJSON = function( o ) {
        return $.toJSON(o, true);
    };

    // Evals JSON that we know to be safe.
    $.evalJSON = function( src, secure ) {
		// Check for native JSON implementation
		if (typeof JSON == "object" && typeof JSON.parse == "function") {
			return JSON.parse(src);
		}

		if (!secure) {
			return eval(quoteString.call(jQuery, src, '(', ')'));
		}

        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

        if (/^[\],:{}\s]*$/.test(filtered)) {
			return eval(quoteString.call(jQuery, src, '(', ')'));
		}

		throw new SyntaxError("Error parsing JSON, source is not valid.");
    };

    // Evals JSON in a way that is *more* secure.
    $.secureEvalJSON = function( src ) {
		$.evalJSON(src, true);
    };
})(jQuery);
