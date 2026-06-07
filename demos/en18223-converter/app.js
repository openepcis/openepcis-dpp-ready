var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/IdentifierIssuer.js
var require_IdentifierIssuer = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/IdentifierIssuer.js"(exports, module) {
    "use strict";
    module.exports = class IdentifierIssuer {
      /**
       * Creates a new IdentifierIssuer. A IdentifierIssuer issues unique
       * identifiers, keeping track of any previously issued identifiers.
       *
       * @param {string} prefix - The prefix to use ('<prefix><counter>').
       * @param {Map} [existing] - An existing Map to use.
       * @param {number} [counter] - The counter to use.
       */
      constructor(prefix, existing = /* @__PURE__ */ new Map(), counter = 0) {
        this.prefix = prefix;
        this._existing = existing;
        this.counter = counter;
      }
      /**
       * Copies this IdentifierIssuer.
       *
       * @returns {object} - A copy of this IdentifierIssuer.
       */
      clone() {
        const { prefix, _existing, counter } = this;
        return new IdentifierIssuer(prefix, new Map(_existing), counter);
      }
      /**
       * Gets the new identifier for the given old identifier, where if no old
       * identifier is given a new identifier will be generated.
       *
       * @param {string} [old] - The old identifier to get the new identifier for.
       *
       * @returns {string} - The new identifier.
       */
      getId(old) {
        const existing = old && this._existing.get(old);
        if (existing) {
          return existing;
        }
        const identifier = this.prefix + this.counter;
        this.counter++;
        if (old) {
          this._existing.set(old, identifier);
        }
        return identifier;
      }
      /**
       * Returns true if the given old identifer has already been assigned a new
       * identifier.
       *
       * @param {string} old - The old identifier to check.
       *
       * @returns {boolean} - True if the old identifier has been assigned a new
       *   identifier, false if not.
       */
      hasId(old) {
        return this._existing.has(old);
      }
      /**
       * Returns all of the IDs that have been issued new IDs in the order in
       * which they were issued new IDs.
       *
       * @returns {Array} - The list of old IDs that has been issued new IDs in
       *   order.
       */
      getOldIds() {
        return [...this._existing.keys()];
      }
    };
  }
});

// node_modules/.pnpm/setimmediate@1.0.5/node_modules/setimmediate/setImmediate.js
var require_setImmediate = __commonJS({
  "node_modules/.pnpm/setimmediate@1.0.5/node_modules/setimmediate/setImmediate.js"(exports) {
    (function(global2, undefined2) {
      "use strict";
      if (global2.setImmediate) {
        return;
      }
      var nextHandle = 1;
      var tasksByHandle = {};
      var currentlyRunningATask = false;
      var doc = global2.document;
      var registerImmediate;
      function setImmediate2(callback) {
        if (typeof callback !== "function") {
          callback = new Function("" + callback);
        }
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
        }
        var task = { callback, args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
      }
      function clearImmediate(handle) {
        delete tasksByHandle[handle];
      }
      function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
          case 0:
            callback();
            break;
          case 1:
            callback(args[0]);
            break;
          case 2:
            callback(args[0], args[1]);
            break;
          case 3:
            callback(args[0], args[1], args[2]);
            break;
          default:
            callback.apply(undefined2, args);
            break;
        }
      }
      function runIfPresent(handle) {
        if (currentlyRunningATask) {
          setTimeout(runIfPresent, 0, handle);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunningATask = true;
            try {
              run(task);
            } finally {
              clearImmediate(handle);
              currentlyRunningATask = false;
            }
          }
        }
      }
      function installNextTickImplementation() {
        registerImmediate = function(handle) {
          process.nextTick(function() {
            runIfPresent(handle);
          });
        };
      }
      function canUsePostMessage() {
        if (global2.postMessage && !global2.importScripts) {
          var postMessageIsAsynchronous = true;
          var oldOnMessage = global2.onmessage;
          global2.onmessage = function() {
            postMessageIsAsynchronous = false;
          };
          global2.postMessage("", "*");
          global2.onmessage = oldOnMessage;
          return postMessageIsAsynchronous;
        }
      }
      function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
          if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
            runIfPresent(+event.data.slice(messagePrefix.length));
          }
        };
        if (global2.addEventListener) {
          global2.addEventListener("message", onGlobalMessage, false);
        } else {
          global2.attachEvent("onmessage", onGlobalMessage);
        }
        registerImmediate = function(handle) {
          global2.postMessage(messagePrefix + handle, "*");
        };
      }
      function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
          var handle = event.data;
          runIfPresent(handle);
        };
        registerImmediate = function(handle) {
          channel.port2.postMessage(handle);
        };
      }
      function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
          var script = doc.createElement("script");
          script.onreadystatechange = function() {
            runIfPresent(handle);
            script.onreadystatechange = null;
            html.removeChild(script);
            script = null;
          };
          html.appendChild(script);
        };
      }
      function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
          setTimeout(runIfPresent, 0, handle);
        };
      }
      var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
      attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
      if ({}.toString.call(global2.process) === "[object process]") {
        installNextTickImplementation();
      } else if (canUsePostMessage()) {
        installPostMessageImplementation();
      } else if (global2.MessageChannel) {
        installMessageChannelImplementation();
      } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation();
      } else {
        installSetTimeoutImplementation();
      }
      attachTo.setImmediate = setImmediate2;
      attachTo.clearImmediate = clearImmediate;
    })(typeof self === "undefined" ? typeof global === "undefined" ? exports : global : self);
  }
});

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/platform-browser.js
var require_platform_browser = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/platform-browser.js"(exports) {
    "use strict";
    require_setImmediate();
    exports.setImmediate = setImmediate;
    exports.crypto = globalThis.crypto;
    var byteToHex = [];
    for (let n = 0; n <= 255; ++n) {
      byteToHex.push(n.toString(16).padStart(2, "0"));
    }
    exports.bufferToHex = function bufferToHex(buffer) {
      let hex = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; ++i) {
        hex += byteToHex[bytes[i]];
      }
      return hex;
    };
  }
});

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/MessageDigest-webcrypto.js
var require_MessageDigest_webcrypto = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/MessageDigest-webcrypto.js"(exports, module) {
    "use strict";
    var { bufferToHex, crypto } = require_platform_browser();
    var algorithmMap = /* @__PURE__ */ new Map([
      ["sha256", "SHA-256"],
      ["SHA256", "SHA-256"],
      ["SHA-256", "SHA-256"],
      ["sha384", "SHA-384"],
      ["SHA384", "SHA-384"],
      ["SHA-384", "SHA-384"],
      ["sha512", "SHA-512"],
      ["SHA512", "SHA-512"],
      ["SHA-512", "SHA-512"]
    ]);
    module.exports = class MessageDigest {
      /**
       * Creates a new WebCrypto API MessageDigest.
       *
       * @param {string} algorithm - The algorithm to use.
       */
      constructor(algorithm) {
        if (!(crypto && crypto.subtle)) {
          throw new Error("crypto.subtle not found.");
        }
        if (!algorithmMap.has(algorithm)) {
          throw new Error(`Unsupported algorithm "${algorithm}".`);
        }
        this.algorithm = algorithmMap.get(algorithm);
        this._content = "";
      }
      update(msg) {
        this._content += msg;
      }
      async digest() {
        const data = new TextEncoder().encode(this._content);
        const buffer = await crypto.subtle.digest(this.algorithm, data);
        return bufferToHex(buffer);
      }
    };
  }
});

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/Permuter.js
var require_Permuter = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/Permuter.js"(exports, module) {
    "use strict";
    module.exports = class Permuter {
      /**
       * A Permuter iterates over all possible permutations of the given array
       * of elements.
       *
       * @param {Array} list - The array of elements to iterate over.
       */
      constructor(list) {
        this.current = list.sort();
        this.done = false;
        this.dir = /* @__PURE__ */ new Map();
        for (let i = 0; i < list.length; ++i) {
          this.dir.set(list[i], true);
        }
      }
      /**
       * Returns true if there is another permutation.
       *
       * @returns {boolean} - True if there is another permutation, false if not.
       */
      hasNext() {
        return !this.done;
      }
      /**
       * Gets the next permutation. Call hasNext() to ensure there is another one
       * first.
       *
       * @returns {any} - The next permutation.
       */
      next() {
        const { current, dir } = this;
        const rval = current.slice();
        let k = null;
        let pos = 0;
        const length = current.length;
        for (let i = 0; i < length; ++i) {
          const element = current[i];
          const left = dir.get(element);
          if ((k === null || element > k) && (left && i > 0 && element > current[i - 1] || !left && i < length - 1 && element > current[i + 1])) {
            k = element;
            pos = i;
          }
        }
        if (k === null) {
          this.done = true;
        } else {
          const swap = dir.get(k) ? pos - 1 : pos + 1;
          current[pos] = current[swap];
          current[swap] = k;
          for (const element of current) {
            if (element > k) {
              dir.set(element, !dir.get(element));
            }
          }
        }
        return rval;
      }
    };
  }
});

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/NQuads.js
var require_NQuads = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/NQuads.js"(exports, module) {
    "use strict";
    var RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
    var RDF_LANGSTRING = RDF + "langString";
    var XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
    var TYPE_NAMED_NODE = "NamedNode";
    var TYPE_BLANK_NODE = "BlankNode";
    var TYPE_LITERAL = "Literal";
    var TYPE_DEFAULT_GRAPH = "DefaultGraph";
    var REGEX = {};
    (() => {
      const PN_CHARS_BASE = "A-Za-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD";
      const PN_CHARS_U = PN_CHARS_BASE + "_";
      const PN_CHARS = PN_CHARS_U + "0-9-\xB7\u0300-\u036F\u203F-\u2040";
      const BLANK_NODE_LABEL = "_:((?:[" + PN_CHARS_U + "0-9])(?:(?:[" + PN_CHARS + ".])*(?:[" + PN_CHARS + "]))?)";
      const UCHAR4 = "\\\\u[0-9A-Fa-f]{4}";
      const UCHAR8 = "\\\\U[0-9A-Fa-f]{8}";
      const IRI = '(?:<((?:[^\0- <>"{}|^`\\\\]|' + UCHAR4 + "|" + UCHAR8 + ")*)>)";
      const bnode = BLANK_NODE_LABEL;
      const plain = '"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"';
      const datatype = "(?:\\^\\^" + IRI + ")";
      const language = "(?:@([a-zA-Z]+(?:-[a-zA-Z0-9]+)*))";
      const literal = "(?:" + plain + "(?:" + datatype + "|" + language + ")?)";
      const ws = "[ \\t]+";
      const wso = "[ \\t]*";
      const subject = "(?:" + IRI + "|" + bnode + ")" + ws;
      const property = IRI + ws;
      const object = "(?:" + IRI + "|" + bnode + "|" + literal + ")" + wso;
      const graphName = "(?:\\.|(?:(?:" + IRI + "|" + bnode + ")" + wso + "\\.))";
      REGEX.eoln = /(?:\r\n)|(?:\n)|(?:\r)/g;
      REGEX.empty = new RegExp("^" + wso + "$");
      REGEX.quad = new RegExp(
        "^" + wso + subject + property + object + graphName + wso + "$"
      );
    })();
    module.exports = class NQuads {
      /**
       * Parses RDF in the form of N-Quads.
       *
       * @param {string} input - The N-Quads input to parse.
       *
       * @returns {Array} - An RDF dataset (an array of quads per
       *   https://rdf.js.org/).
       */
      static parse(input) {
        const dataset = [];
        const graphs = {};
        const lines = input.split(REGEX.eoln);
        let lineNumber = 0;
        for (const line of lines) {
          lineNumber++;
          if (REGEX.empty.test(line)) {
            continue;
          }
          const match = line.match(REGEX.quad);
          if (match === null) {
            throw new Error("N-Quads parse error on line " + lineNumber + ".");
          }
          const quad = { subject: null, predicate: null, object: null, graph: null };
          if (match[1] !== void 0) {
            quad.subject = {
              termType: TYPE_NAMED_NODE,
              value: _iriUnescape(match[1])
            };
          } else {
            quad.subject = {
              termType: TYPE_BLANK_NODE,
              value: match[2]
            };
          }
          quad.predicate = {
            termType: TYPE_NAMED_NODE,
            value: _iriUnescape(match[3])
          };
          if (match[4] !== void 0) {
            quad.object = {
              termType: TYPE_NAMED_NODE,
              value: _iriUnescape(match[4])
            };
          } else if (match[5] !== void 0) {
            quad.object = {
              termType: TYPE_BLANK_NODE,
              value: match[5]
            };
          } else {
            quad.object = {
              termType: TYPE_LITERAL,
              value: void 0,
              datatype: {
                termType: TYPE_NAMED_NODE
              }
            };
            if (match[7] !== void 0) {
              quad.object.datatype.value = _iriUnescape(match[7]);
            } else if (match[8] !== void 0) {
              quad.object.datatype.value = RDF_LANGSTRING;
              quad.object.language = match[8];
            } else {
              quad.object.datatype.value = XSD_STRING;
            }
            quad.object.value = _stringLiteralUnescape(match[6]);
          }
          if (match[9] !== void 0) {
            quad.graph = {
              termType: TYPE_NAMED_NODE,
              value: _iriUnescape(match[9])
            };
          } else if (match[10] !== void 0) {
            quad.graph = {
              termType: TYPE_BLANK_NODE,
              value: match[10]
            };
          } else {
            quad.graph = {
              termType: TYPE_DEFAULT_GRAPH,
              value: ""
            };
          }
          if (!(quad.graph.value in graphs)) {
            graphs[quad.graph.value] = [quad];
            dataset.push(quad);
          } else {
            let unique = true;
            const quads = graphs[quad.graph.value];
            for (const q of quads) {
              if (_compareTriples(q, quad)) {
                unique = false;
                break;
              }
            }
            if (unique) {
              quads.push(quad);
              dataset.push(quad);
            }
          }
        }
        return dataset;
      }
      /**
       * Converts an RDF dataset to N-Quads.
       *
       * @param {Array} dataset - The Array of quads RDF dataset to convert.
       *
       * @returns {string} - The N-Quads string.
       */
      static serialize(dataset) {
        const quads = [];
        for (const quad of dataset) {
          quads.push(NQuads.serializeQuad(quad));
        }
        return quads.sort().join("");
      }
      /**
       * Converts RDF quad components to an N-Quad string (a single quad).
       *
       * @param {object} s - N-Quad subject component.
       * @param {object} p - N-Quad predicate component.
       * @param {object} o - N-Quad object component.
       * @param {object} g - N-Quad graph component.
       *
       * @returns {string} - The N-Quad.
       */
      static serializeQuadComponents(s, p, o, g) {
        let nquad = "";
        if (s.termType === TYPE_NAMED_NODE) {
          nquad += `<${_iriEscape(s.value)}>`;
        } else {
          nquad += `_:${s.value}`;
        }
        if (p.termType === TYPE_NAMED_NODE) {
          nquad += ` <${_iriEscape(p.value)}> `;
        } else {
          nquad += ` _:${p.value} `;
        }
        if (o.termType === TYPE_NAMED_NODE) {
          nquad += `<${_iriEscape(o.value)}>`;
        } else if (o.termType === TYPE_BLANK_NODE) {
          nquad += `_:${o.value}`;
        } else {
          nquad += `"${_stringLiteralEscape(o.value)}"`;
          if (o.datatype.value === RDF_LANGSTRING) {
            if (o.language) {
              nquad += `@${o.language}`;
            }
          } else if (o.datatype.value !== XSD_STRING) {
            nquad += `^^<${_iriEscape(o.datatype.value)}>`;
          }
        }
        if (g.termType === TYPE_NAMED_NODE) {
          nquad += ` <${_iriEscape(g.value)}>`;
        } else if (g.termType === TYPE_BLANK_NODE) {
          nquad += ` _:${g.value}`;
        }
        nquad += " .\n";
        return nquad;
      }
      /**
       * Converts an RDF quad to an N-Quad string (a single quad).
       *
       * @param {object} quad - The RDF quad convert.
       *
       * @returns {string} - The N-Quad string.
       */
      static serializeQuad(quad) {
        return NQuads.serializeQuadComponents(
          quad.subject,
          quad.predicate,
          quad.object,
          quad.graph
        );
      }
    };
    function _compareTriples(t1, t2) {
      if (!(t1.subject.termType === t2.subject.termType && t1.object.termType === t2.object.termType)) {
        return false;
      }
      if (!(t1.subject.value === t2.subject.value && t1.predicate.value === t2.predicate.value && t1.object.value === t2.object.value)) {
        return false;
      }
      if (t1.object.termType !== TYPE_LITERAL) {
        return true;
      }
      return t1.object.datatype.termType === t2.object.datatype.termType && t1.object.language === t2.object.language && t1.object.datatype.value === t2.object.datatype.value;
    }
    var _stringLiteralEscapeRegex = /[\u0000-\u001F\u007F"\\]/g;
    var _stringLiteralEscapeMap = [];
    for (let n = 0; n <= 127; ++n) {
      if (_stringLiteralEscapeRegex.test(String.fromCharCode(n))) {
        _stringLiteralEscapeMap[n] = "\\u" + n.toString(16).toUpperCase().padStart(4, "0");
        _stringLiteralEscapeRegex.lastIndex = 0;
      }
    }
    _stringLiteralEscapeMap["\b".codePointAt(0)] = "\\b";
    _stringLiteralEscapeMap["	".codePointAt(0)] = "\\t";
    _stringLiteralEscapeMap["\n".codePointAt(0)] = "\\n";
    _stringLiteralEscapeMap["\f".codePointAt(0)] = "\\f";
    _stringLiteralEscapeMap["\r".codePointAt(0)] = "\\r";
    _stringLiteralEscapeMap['"'.codePointAt(0)] = '\\"';
    _stringLiteralEscapeMap["\\".codePointAt(0)] = "\\\\";
    function _stringLiteralEscape(s) {
      if (!_stringLiteralEscapeRegex.test(s)) {
        return s;
      }
      return s.replace(_stringLiteralEscapeRegex, function(match) {
        return _stringLiteralEscapeMap[match.codePointAt(0)];
      });
    }
    var _stringLiteralUnescapeRegex = /(?:\\([btnfr"'\\]))|(?:\\u([0-9A-Fa-f]{4}))|(?:\\U([0-9A-Fa-f]{8}))/g;
    function _stringLiteralUnescape(s) {
      if (!_stringLiteralUnescapeRegex.test(s)) {
        return s;
      }
      return s.replace(_stringLiteralUnescapeRegex, function(match, code, u, U) {
        if (code) {
          switch (code) {
            case "b":
              return "\b";
            case "t":
              return "	";
            case "n":
              return "\n";
            case "f":
              return "\f";
            case "r":
              return "\r";
            case '"':
              return '"';
            case "'":
              return "'";
            case "\\":
              return "\\";
          }
        }
        if (u) {
          return String.fromCharCode(parseInt(u, 16));
        }
        if (U) {
          return String.fromCodePoint(parseInt(U, 16));
        }
      });
    }
    var _iriEscapeRegex = /[\u0000-\u0020<>"{}|^`\\]/g;
    var _iriEscapeRegexMap = [];
    for (let n = 0; n <= 127; ++n) {
      if (_iriEscapeRegex.test(String.fromCharCode(n))) {
        _iriEscapeRegexMap[n] = "\\u" + n.toString(16).toUpperCase().padStart(4, "0");
        _iriEscapeRegex.lastIndex = 0;
      }
    }
    function _iriEscape(s) {
      if (!_iriEscapeRegex.test(s)) {
        return s;
      }
      return s.replace(_iriEscapeRegex, function(match) {
        return _iriEscapeRegexMap[match.codePointAt(0)];
      });
    }
    var _iriUnescapeRegex = /(?:\\u([0-9A-Fa-f]{4}))|(?:\\U([0-9A-Fa-f]{8}))/g;
    function _iriUnescape(s) {
      if (!_iriUnescapeRegex.test(s)) {
        return s;
      }
      return s.replace(_iriUnescapeRegex, function(match, u, U) {
        if (u) {
          return String.fromCharCode(parseInt(u, 16));
        }
        if (U) {
          return String.fromCodePoint(parseInt(U, 16));
        }
      });
    }
  }
});

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/RDFC10.js
var require_RDFC10 = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/RDFC10.js"(exports, module) {
    "use strict";
    var IdentifierIssuer = require_IdentifierIssuer();
    var MessageDigest = require_MessageDigest_webcrypto();
    var Permuter = require_Permuter();
    var NQuads = require_NQuads();
    var { setImmediate: setImmediate2 } = require_platform_browser();
    module.exports = class RDFC10 {
      constructor({
        createMessageDigest = null,
        messageDigestAlgorithm = "sha256",
        canonicalIdMap = /* @__PURE__ */ new Map(),
        maxWorkFactor = 1,
        maxDeepIterations = -1,
        signal = null
      } = {}) {
        this.name = "RDFC-1.0";
        this.blankNodeInfo = /* @__PURE__ */ new Map();
        this.canonicalIssuer = new IdentifierIssuer("c14n", canonicalIdMap);
        this.createMessageDigest = createMessageDigest || (() => new MessageDigest(messageDigestAlgorithm));
        this.maxWorkFactor = maxWorkFactor;
        this.maxDeepIterations = maxDeepIterations;
        this.remainingDeepIterations = 0;
        this.signal = signal;
        this.quads = null;
      }
      // 4.4) Normalization Algorithm
      async main(dataset) {
        this.quads = dataset;
        for (const quad of dataset) {
          this._addBlankNodeQuadInfo({ quad, component: quad.subject });
          this._addBlankNodeQuadInfo({ quad, component: quad.object });
          this._addBlankNodeQuadInfo({ quad, component: quad.graph });
        }
        const hashToBlankNodes = /* @__PURE__ */ new Map();
        const nonNormalized = [...this.blankNodeInfo.keys()];
        let i = 0;
        for (const id of nonNormalized) {
          if (++i % 100 === 0) {
            await this._yield();
          }
          await this._hashAndTrackBlankNode({ id, hashToBlankNodes });
        }
        const hashes = [...hashToBlankNodes.keys()].sort();
        const nonUnique = [];
        for (const hash of hashes) {
          const idList = hashToBlankNodes.get(hash);
          if (idList.length > 1) {
            nonUnique.push(idList);
            continue;
          }
          const id = idList[0];
          this.canonicalIssuer.getId(id);
        }
        if (this.maxDeepIterations < 0) {
          if (this.maxWorkFactor === 0) {
            this.maxDeepIterations = 0;
          } else if (this.maxWorkFactor === Infinity) {
            this.maxDeepIterations = Infinity;
          } else {
            const nonUniqueCount = nonUnique.reduce((count, v) => count + v.length, 0);
            this.maxDeepIterations = nonUniqueCount ** this.maxWorkFactor;
          }
        }
        if (this.maxDeepIterations > Number.MAX_SAFE_INTEGER) {
          this.maxDeepIterations = Infinity;
        }
        this.remainingDeepIterations = this.maxDeepIterations;
        for (const idList of nonUnique) {
          const hashPathList = [];
          for (const id of idList) {
            if (this.canonicalIssuer.hasId(id)) {
              continue;
            }
            const issuer = new IdentifierIssuer("b");
            issuer.getId(id);
            const result = await this.hashNDegreeQuads(id, issuer);
            hashPathList.push(result);
          }
          hashPathList.sort(_stringHashCompare);
          for (const result of hashPathList) {
            const oldIds = result.issuer.getOldIds();
            for (const id of oldIds) {
              this.canonicalIssuer.getId(id);
            }
          }
        }
        const normalized = [];
        for (const quad of this.quads) {
          const nQuad = NQuads.serializeQuadComponents(
            this._componentWithCanonicalId(quad.subject),
            quad.predicate,
            this._componentWithCanonicalId(quad.object),
            this._componentWithCanonicalId(quad.graph)
          );
          normalized.push(nQuad);
        }
        normalized.sort();
        return normalized.join("");
      }
      // 4.6) Hash First Degree Quads
      async hashFirstDegreeQuads(id) {
        const nquads = [];
        const info = this.blankNodeInfo.get(id);
        const quads = info.quads;
        for (const quad of quads) {
          nquads.push(NQuads.serializeQuadComponents(
            this.modifyFirstDegreeComponent(id, quad.subject, "subject"),
            quad.predicate,
            this.modifyFirstDegreeComponent(id, quad.object, "object"),
            this.modifyFirstDegreeComponent(id, quad.graph, "graph")
          ));
        }
        nquads.sort();
        const md = this.createMessageDigest();
        for (const nquad of nquads) {
          md.update(nquad);
        }
        info.hash = await md.digest();
        return info.hash;
      }
      // 4.7) Hash Related Blank Node
      async hashRelatedBlankNode(related, quad, issuer, position) {
        const md = this.createMessageDigest();
        md.update(position);
        if (position !== "g") {
          md.update(this.getRelatedPredicate(quad));
        }
        let id;
        if (this.canonicalIssuer.hasId(related)) {
          id = "_:" + this.canonicalIssuer.getId(related);
        } else if (issuer.hasId(related)) {
          id = "_:" + issuer.getId(related);
        } else {
          id = this.blankNodeInfo.get(related).hash;
        }
        md.update(id);
        return md.digest();
      }
      // 4.8) Hash N-Degree Quads
      async hashNDegreeQuads(id, issuer) {
        if (this.remainingDeepIterations === 0) {
          throw new Error(
            `Maximum deep iterations exceeded (${this.maxDeepIterations}).`
          );
        }
        this.remainingDeepIterations--;
        const md = this.createMessageDigest();
        const hashToRelated = await this.createHashToRelated(id, issuer);
        const hashes = [...hashToRelated.keys()].sort();
        for (const hash of hashes) {
          md.update(hash);
          let chosenPath = "";
          let chosenIssuer;
          const permuter = new Permuter(hashToRelated.get(hash));
          let i = 0;
          while (permuter.hasNext()) {
            const permutation = permuter.next();
            if (++i % 3 === 0) {
              if (this.signal && this.signal.aborted) {
                throw new Error(`Abort signal received: "${this.signal.reason}".`);
              }
              await this._yield();
            }
            let issuerCopy = issuer.clone();
            let path = "";
            const recursionList = [];
            let nextPermutation = false;
            for (const related of permutation) {
              if (this.canonicalIssuer.hasId(related)) {
                path += "_:" + this.canonicalIssuer.getId(related);
              } else {
                if (!issuerCopy.hasId(related)) {
                  recursionList.push(related);
                }
                path += "_:" + issuerCopy.getId(related);
              }
              if (chosenPath.length !== 0 && path > chosenPath) {
                nextPermutation = true;
                break;
              }
            }
            if (nextPermutation) {
              continue;
            }
            for (const related of recursionList) {
              const result = await this.hashNDegreeQuads(related, issuerCopy);
              path += "_:" + issuerCopy.getId(related);
              path += `<${result.hash}>`;
              issuerCopy = result.issuer;
              if (chosenPath.length !== 0 && path > chosenPath) {
                nextPermutation = true;
                break;
              }
            }
            if (nextPermutation) {
              continue;
            }
            if (chosenPath.length === 0 || path < chosenPath) {
              chosenPath = path;
              chosenIssuer = issuerCopy;
            }
          }
          md.update(chosenPath);
          issuer = chosenIssuer;
        }
        return { hash: await md.digest(), issuer };
      }
      // helper for modifying component during Hash First Degree Quads
      modifyFirstDegreeComponent(id, component) {
        if (component.termType !== "BlankNode") {
          return component;
        }
        return {
          termType: "BlankNode",
          value: component.value === id ? "a" : "z"
        };
      }
      // helper for getting a related predicate
      getRelatedPredicate(quad) {
        return `<${quad.predicate.value}>`;
      }
      // helper for creating hash to related blank nodes map
      async createHashToRelated(id, issuer) {
        const hashToRelated = /* @__PURE__ */ new Map();
        const quads = this.blankNodeInfo.get(id).quads;
        let i = 0;
        for (const quad of quads) {
          if (++i % 100 === 0) {
            await this._yield();
          }
          await Promise.all([
            this._addRelatedBlankNodeHash({
              quad,
              component: quad.subject,
              position: "s",
              id,
              issuer,
              hashToRelated
            }),
            this._addRelatedBlankNodeHash({
              quad,
              component: quad.object,
              position: "o",
              id,
              issuer,
              hashToRelated
            }),
            this._addRelatedBlankNodeHash({
              quad,
              component: quad.graph,
              position: "g",
              id,
              issuer,
              hashToRelated
            })
          ]);
        }
        return hashToRelated;
      }
      async _hashAndTrackBlankNode({ id, hashToBlankNodes }) {
        const hash = await this.hashFirstDegreeQuads(id);
        const idList = hashToBlankNodes.get(hash);
        if (!idList) {
          hashToBlankNodes.set(hash, [id]);
        } else {
          idList.push(id);
        }
      }
      _addBlankNodeQuadInfo({ quad, component }) {
        if (component.termType !== "BlankNode") {
          return;
        }
        const id = component.value;
        const info = this.blankNodeInfo.get(id);
        if (info) {
          info.quads.add(quad);
        } else {
          this.blankNodeInfo.set(id, { quads: /* @__PURE__ */ new Set([quad]), hash: null });
        }
      }
      async _addRelatedBlankNodeHash({ quad, component, position, id, issuer, hashToRelated }) {
        if (!(component.termType === "BlankNode" && component.value !== id)) {
          return;
        }
        const related = component.value;
        const hash = await this.hashRelatedBlankNode(
          related,
          quad,
          issuer,
          position
        );
        const entries = hashToRelated.get(hash);
        if (entries) {
          entries.push(related);
        } else {
          hashToRelated.set(hash, [related]);
        }
      }
      // canonical ids for 7.1
      _componentWithCanonicalId(component) {
        if (component.termType === "BlankNode" && !component.value.startsWith(this.canonicalIssuer.prefix)) {
          return {
            termType: "BlankNode",
            value: this.canonicalIssuer.getId(component.value)
          };
        }
        return component;
      }
      async _yield() {
        return new Promise((resolve) => setImmediate2(resolve));
      }
    };
    function _stringHashCompare(a, b) {
      return a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0;
    }
  }
});

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/RDFC10Sync.js
var require_RDFC10Sync = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/RDFC10Sync.js"(exports, module) {
    "use strict";
    var IdentifierIssuer = require_IdentifierIssuer();
    var MessageDigest = require_MessageDigest_webcrypto();
    var Permuter = require_Permuter();
    var NQuads = require_NQuads();
    module.exports = class RDFC10Sync {
      constructor({
        createMessageDigest = null,
        messageDigestAlgorithm = "sha256",
        canonicalIdMap = /* @__PURE__ */ new Map(),
        maxWorkFactor = 1,
        maxDeepIterations = -1,
        timeout = 0
      } = {}) {
        this.name = "RDFC-1.0";
        this.blankNodeInfo = /* @__PURE__ */ new Map();
        this.canonicalIssuer = new IdentifierIssuer("c14n", canonicalIdMap);
        this.createMessageDigest = createMessageDigest || (() => new MessageDigest(messageDigestAlgorithm));
        this.maxWorkFactor = maxWorkFactor;
        this.maxDeepIterations = maxDeepIterations;
        this.remainingDeepIterations = 0;
        this.timeout = timeout;
        if (timeout > 0) {
          this.startTime = Date.now();
        }
        this.quads = null;
      }
      // 4.4) Normalization Algorithm
      main(dataset) {
        this.quads = dataset;
        for (const quad of dataset) {
          this._addBlankNodeQuadInfo({ quad, component: quad.subject });
          this._addBlankNodeQuadInfo({ quad, component: quad.object });
          this._addBlankNodeQuadInfo({ quad, component: quad.graph });
        }
        const hashToBlankNodes = /* @__PURE__ */ new Map();
        const nonNormalized = [...this.blankNodeInfo.keys()];
        for (const id of nonNormalized) {
          this._hashAndTrackBlankNode({ id, hashToBlankNodes });
        }
        const hashes = [...hashToBlankNodes.keys()].sort();
        const nonUnique = [];
        for (const hash of hashes) {
          const idList = hashToBlankNodes.get(hash);
          if (idList.length > 1) {
            nonUnique.push(idList);
            continue;
          }
          const id = idList[0];
          this.canonicalIssuer.getId(id);
        }
        if (this.maxDeepIterations < 0) {
          if (this.maxWorkFactor === 0) {
            this.maxDeepIterations = 0;
          } else if (this.maxWorkFactor === Infinity) {
            this.maxDeepIterations = Infinity;
          } else {
            const nonUniqueCount = nonUnique.reduce((count, v) => count + v.length, 0);
            this.maxDeepIterations = nonUniqueCount ** this.maxWorkFactor;
          }
        }
        if (this.maxDeepIterations > Number.MAX_SAFE_INTEGER) {
          this.maxDeepIterations = Infinity;
        }
        this.remainingDeepIterations = this.maxDeepIterations;
        for (const idList of nonUnique) {
          const hashPathList = [];
          for (const id of idList) {
            if (this.canonicalIssuer.hasId(id)) {
              continue;
            }
            const issuer = new IdentifierIssuer("b");
            issuer.getId(id);
            const result = this.hashNDegreeQuads(id, issuer);
            hashPathList.push(result);
          }
          hashPathList.sort(_stringHashCompare);
          for (const result of hashPathList) {
            const oldIds = result.issuer.getOldIds();
            for (const id of oldIds) {
              this.canonicalIssuer.getId(id);
            }
          }
        }
        const normalized = [];
        for (const quad of this.quads) {
          const nQuad = NQuads.serializeQuadComponents(
            this._componentWithCanonicalId(quad.subject),
            quad.predicate,
            this._componentWithCanonicalId(quad.object),
            this._componentWithCanonicalId(quad.graph)
          );
          normalized.push(nQuad);
        }
        normalized.sort();
        return normalized.join("");
      }
      // 4.6) Hash First Degree Quads
      hashFirstDegreeQuads(id) {
        const nquads = [];
        const info = this.blankNodeInfo.get(id);
        const quads = info.quads;
        for (const quad of quads) {
          nquads.push(NQuads.serializeQuadComponents(
            this.modifyFirstDegreeComponent(id, quad.subject, "subject"),
            quad.predicate,
            this.modifyFirstDegreeComponent(id, quad.object, "object"),
            this.modifyFirstDegreeComponent(id, quad.graph, "graph")
          ));
        }
        nquads.sort();
        const md = this.createMessageDigest();
        for (const nquad of nquads) {
          md.update(nquad);
        }
        info.hash = md.digest();
        return info.hash;
      }
      // 4.7) Hash Related Blank Node
      hashRelatedBlankNode(related, quad, issuer, position) {
        const md = this.createMessageDigest();
        md.update(position);
        if (position !== "g") {
          md.update(this.getRelatedPredicate(quad));
        }
        let id;
        if (this.canonicalIssuer.hasId(related)) {
          id = "_:" + this.canonicalIssuer.getId(related);
        } else if (issuer.hasId(related)) {
          id = "_:" + issuer.getId(related);
        } else {
          id = this.blankNodeInfo.get(related).hash;
        }
        md.update(id);
        return md.digest();
      }
      // 4.8) Hash N-Degree Quads
      hashNDegreeQuads(id, issuer) {
        if (this.remainingDeepIterations === 0) {
          throw new Error(
            `Maximum deep iterations exceeded (${this.maxDeepIterations}).`
          );
        }
        this.remainingDeepIterations--;
        const md = this.createMessageDigest();
        const hashToRelated = this.createHashToRelated(id, issuer);
        const hashes = [...hashToRelated.keys()].sort();
        for (const hash of hashes) {
          md.update(hash);
          let chosenPath = "";
          let chosenIssuer;
          const permuter = new Permuter(hashToRelated.get(hash));
          let i = 0;
          while (permuter.hasNext()) {
            const permutation = permuter.next();
            if (++i % 3 === 0) {
              if (this.timeout > 0 && Date.now() - this.startTime > this.timeout) {
                throw new Error("Canonize timeout.");
              }
            }
            let issuerCopy = issuer.clone();
            let path = "";
            const recursionList = [];
            let nextPermutation = false;
            for (const related of permutation) {
              if (this.canonicalIssuer.hasId(related)) {
                path += "_:" + this.canonicalIssuer.getId(related);
              } else {
                if (!issuerCopy.hasId(related)) {
                  recursionList.push(related);
                }
                path += "_:" + issuerCopy.getId(related);
              }
              if (chosenPath.length !== 0 && path > chosenPath) {
                nextPermutation = true;
                break;
              }
            }
            if (nextPermutation) {
              continue;
            }
            for (const related of recursionList) {
              const result = this.hashNDegreeQuads(related, issuerCopy);
              path += "_:" + issuerCopy.getId(related);
              path += `<${result.hash}>`;
              issuerCopy = result.issuer;
              if (chosenPath.length !== 0 && path > chosenPath) {
                nextPermutation = true;
                break;
              }
            }
            if (nextPermutation) {
              continue;
            }
            if (chosenPath.length === 0 || path < chosenPath) {
              chosenPath = path;
              chosenIssuer = issuerCopy;
            }
          }
          md.update(chosenPath);
          issuer = chosenIssuer;
        }
        return { hash: md.digest(), issuer };
      }
      // helper for modifying component during Hash First Degree Quads
      modifyFirstDegreeComponent(id, component) {
        if (component.termType !== "BlankNode") {
          return component;
        }
        return {
          termType: "BlankNode",
          value: component.value === id ? "a" : "z"
        };
      }
      // helper for getting a related predicate
      getRelatedPredicate(quad) {
        return `<${quad.predicate.value}>`;
      }
      // helper for creating hash to related blank nodes map
      createHashToRelated(id, issuer) {
        const hashToRelated = /* @__PURE__ */ new Map();
        const quads = this.blankNodeInfo.get(id).quads;
        for (const quad of quads) {
          this._addRelatedBlankNodeHash({
            quad,
            component: quad.subject,
            position: "s",
            id,
            issuer,
            hashToRelated
          });
          this._addRelatedBlankNodeHash({
            quad,
            component: quad.object,
            position: "o",
            id,
            issuer,
            hashToRelated
          });
          this._addRelatedBlankNodeHash({
            quad,
            component: quad.graph,
            position: "g",
            id,
            issuer,
            hashToRelated
          });
        }
        return hashToRelated;
      }
      _hashAndTrackBlankNode({ id, hashToBlankNodes }) {
        const hash = this.hashFirstDegreeQuads(id);
        const idList = hashToBlankNodes.get(hash);
        if (!idList) {
          hashToBlankNodes.set(hash, [id]);
        } else {
          idList.push(id);
        }
      }
      _addBlankNodeQuadInfo({ quad, component }) {
        if (component.termType !== "BlankNode") {
          return;
        }
        const id = component.value;
        const info = this.blankNodeInfo.get(id);
        if (info) {
          info.quads.add(quad);
        } else {
          this.blankNodeInfo.set(id, { quads: /* @__PURE__ */ new Set([quad]), hash: null });
        }
      }
      _addRelatedBlankNodeHash({ quad, component, position, id, issuer, hashToRelated }) {
        if (!(component.termType === "BlankNode" && component.value !== id)) {
          return;
        }
        const related = component.value;
        const hash = this.hashRelatedBlankNode(
          related,
          quad,
          issuer,
          position
        );
        const entries = hashToRelated.get(hash);
        if (entries) {
          entries.push(related);
        } else {
          hashToRelated.set(hash, [related]);
        }
      }
      // canonical ids for 7.1
      _componentWithCanonicalId(component) {
        if (component.termType === "BlankNode" && !component.value.startsWith(this.canonicalIssuer.prefix)) {
          return {
            termType: "BlankNode",
            value: this.canonicalIssuer.getId(component.value)
          };
        }
        return component;
      }
    };
    function _stringHashCompare(a, b) {
      return a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0;
    }
  }
});

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/lib/index.js"(exports) {
    "use strict";
    var RDFC10 = require_RDFC10();
    var RDFC10Sync = require_RDFC10Sync();
    function _inputToDataset(input, options) {
      if (options.inputFormat) {
        if (options.inputFormat === "application/n-quads") {
          if (typeof input !== "string") {
            throw new Error("N-Quads input must be a string.");
          }
          return exports.NQuads.parse(input);
        }
        throw new Error(
          `Unknown canonicalization input format: "${options.inputFormat}".`
        );
      }
      return input;
    }
    function _checkOutputFormat(options) {
      if (options.format) {
        if (options.format !== "application/n-quads") {
          throw new Error(
            `Unknown canonicalization output format: "${options.format}".`
          );
        }
      }
    }
    function _traceURDNA2015() {
      if (!!globalThis.RDF_CANONIZE_TRACE_URDNA2015) {
        console.trace("[rdf-canonize] URDNA2015 is deprecated, use RDFC-1.0");
      }
    }
    exports.NQuads = require_NQuads();
    exports.IdentifierIssuer = require_IdentifierIssuer();
    exports.canonize = async function(input, options = {}) {
      const dataset = _inputToDataset(input, options);
      _checkOutputFormat(options);
      if (!("algorithm" in options)) {
        throw new Error("No RDF Dataset Canonicalization algorithm specified.");
      }
      if (options.algorithm === "RDFC-1.0") {
        return new RDFC10(options).main(dataset);
      }
      if (options.algorithm === "URDNA2015" && !options.rejectURDNA2015) {
        _traceURDNA2015();
        return new RDFC10(options).main(dataset);
      }
      throw new Error(
        "Invalid RDF Dataset Canonicalization algorithm: " + options.algorithm
      );
    };
    exports._canonizeSync = function(input, options = {}) {
      const dataset = _inputToDataset(input, options);
      _checkOutputFormat(options);
      if (!("algorithm" in options)) {
        throw new Error("No RDF Dataset Canonicalization algorithm specified.");
      }
      if (options.algorithm === "RDFC-1.0") {
        return new RDFC10Sync(options).main(dataset);
      }
      if (options.algorithm === "URDNA2015" && !options.rejectURDNA2015) {
        _traceURDNA2015();
        return new RDFC10Sync(options).main(dataset);
      }
      throw new Error(
        "Invalid RDF Dataset Canonicalization algorithm: " + options.algorithm
      );
    };
  }
});

// node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/index.js
var require_rdf_canonize = __commonJS({
  "node_modules/.pnpm/rdf-canonize@5.0.0/node_modules/rdf-canonize/index.js"(exports, module) {
    module.exports = require_lib();
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/types.js
var require_types = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/types.js"(exports, module) {
    "use strict";
    var api = {};
    module.exports = api;
    api.isArray = Array.isArray;
    api.isBoolean = (v) => typeof v === "boolean" || Object.prototype.toString.call(v) === "[object Boolean]";
    api.isDouble = (v) => api.isNumber(v) && (String(v).indexOf(".") !== -1 || Math.abs(v) >= 1e21);
    api.isEmptyObject = (v) => api.isObject(v) && Object.keys(v).length === 0;
    api.isNumber = (v) => typeof v === "number" || Object.prototype.toString.call(v) === "[object Number]";
    api.isNumeric = (v) => !isNaN(parseFloat(v)) && isFinite(v);
    api.isObject = (v) => Object.prototype.toString.call(v) === "[object Object]";
    api.isString = (v) => typeof v === "string" || Object.prototype.toString.call(v) === "[object String]";
    api.isUndefined = (v) => typeof v === "undefined";
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/graphTypes.js
var require_graphTypes = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/graphTypes.js"(exports, module) {
    "use strict";
    var types = require_types();
    var api = {};
    module.exports = api;
    api.isSubject = (v) => {
      if (types.isObject(v) && !("@value" in v || "@set" in v || "@list" in v)) {
        const keyCount = Object.keys(v).length;
        return keyCount > 1 || !("@id" in v);
      }
      return false;
    };
    api.isSubjectReference = (v) => (
      // Note: A value is a subject reference if all of these hold true:
      // 1. It is an Object.
      // 2. It has a single key: @id.
      types.isObject(v) && Object.keys(v).length === 1 && "@id" in v
    );
    api.isValue = (v) => (
      // Note: A value is a @value if all of these hold true:
      // 1. It is an Object.
      // 2. It has the @value property.
      types.isObject(v) && "@value" in v
    );
    api.isList = (v) => (
      // Note: A value is a @list if all of these hold true:
      // 1. It is an Object.
      // 2. It has the @list property.
      types.isObject(v) && "@list" in v
    );
    api.isGraph = (v) => {
      return types.isObject(v) && "@graph" in v && Object.keys(v).filter((key) => key !== "@id" && key !== "@index").length === 1;
    };
    api.isSimpleGraph = (v) => {
      return api.isGraph(v) && !("@id" in v);
    };
    api.isBlankNode = (v) => {
      if (types.isObject(v)) {
        if ("@id" in v) {
          const id = v["@id"];
          return !types.isString(id) || id.indexOf("_:") === 0;
        }
        return Object.keys(v).length === 0 || !("@value" in v || "@set" in v || "@list" in v);
      }
      return false;
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/JsonLdError.js
var require_JsonLdError = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/JsonLdError.js"(exports, module) {
    "use strict";
    module.exports = class JsonLdError extends Error {
      /**
       * Creates a JSON-LD Error.
       *
       * @param msg the error message.
       * @param type the error type.
       * @param details the error details.
       */
      constructor(message = "An unspecified JSON-LD error occurred.", name = "jsonld.Error", details = {}) {
        super(message);
        this.name = name;
        this.message = message;
        this.details = details;
      }
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/util.js
var require_util = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/util.js"(exports, module) {
    "use strict";
    var graphTypes = require_graphTypes();
    var types = require_types();
    var IdentifierIssuer = require_rdf_canonize().IdentifierIssuer;
    var JsonLdError = require_JsonLdError();
    var REGEX_BCP47 = /^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/;
    var REGEX_LINK_HEADERS = /(?:<[^>]*?>|"[^"]*?"|[^,])+/g;
    var REGEX_LINK_HEADER = /\s*<([^>]*?)>\s*(?:;\s*(.*))?/;
    var REGEX_LINK_HEADER_PARAMS = /(.*?)=(?:(?:"([^"]*?)")|([^"]*?))\s*(?:(?:;\s*)|$)/g;
    var REGEX_KEYWORD = /^@[a-zA-Z]+$/;
    var DEFAULTS = {
      headers: {
        accept: "application/ld+json, application/json"
      }
    };
    var api = {};
    module.exports = api;
    api.IdentifierIssuer = IdentifierIssuer;
    api.REGEX_BCP47 = REGEX_BCP47;
    api.REGEX_KEYWORD = REGEX_KEYWORD;
    api.clone = function(value) {
      if (value && typeof value === "object") {
        let rval;
        if (types.isArray(value)) {
          rval = [];
          for (let i = 0; i < value.length; ++i) {
            rval[i] = api.clone(value[i]);
          }
        } else if (value instanceof Map) {
          rval = /* @__PURE__ */ new Map();
          for (const [k, v] of value) {
            rval.set(k, api.clone(v));
          }
        } else if (value instanceof Set) {
          rval = /* @__PURE__ */ new Set();
          for (const v of value) {
            rval.add(api.clone(v));
          }
        } else if (types.isObject(value)) {
          rval = {};
          for (const key in value) {
            rval[key] = api.clone(value[key]);
          }
        } else {
          rval = value.toString();
        }
        return rval;
      }
      return value;
    };
    api.asArray = function(value) {
      return Array.isArray(value) ? value : [value];
    };
    api.buildHeaders = (headers = {}) => {
      const hasAccept = Object.keys(headers).some(
        (h) => h.toLowerCase() === "accept"
      );
      if (hasAccept) {
        throw new RangeError(
          'Accept header may not be specified; only "' + DEFAULTS.headers.accept + '" is supported.'
        );
      }
      return Object.assign({ Accept: DEFAULTS.headers.accept }, headers);
    };
    api.parseLinkHeader = (header) => {
      const rval = {};
      const entries = header.match(REGEX_LINK_HEADERS);
      for (let i = 0; i < entries.length; ++i) {
        let match = entries[i].match(REGEX_LINK_HEADER);
        if (!match) {
          continue;
        }
        const result = { target: match[1] };
        const params = match[2];
        while (match = REGEX_LINK_HEADER_PARAMS.exec(params)) {
          result[match[1]] = match[2] === void 0 ? match[3] : match[2];
        }
        const rel = result.rel || "";
        if (Array.isArray(rval[rel])) {
          rval[rel].push(result);
        } else if (rval.hasOwnProperty(rel)) {
          rval[rel] = [rval[rel], result];
        } else {
          rval[rel] = result;
        }
      }
      return rval;
    };
    api.validateTypeValue = (v, isFrame) => {
      if (types.isString(v)) {
        return;
      }
      if (types.isArray(v) && v.every((vv) => types.isString(vv))) {
        return;
      }
      if (isFrame && types.isObject(v)) {
        switch (Object.keys(v).length) {
          case 0:
            return;
          case 1:
            if ("@default" in v && api.asArray(v["@default"]).every((vv) => types.isString(vv))) {
              return;
            }
        }
      }
      throw new JsonLdError(
        'Invalid JSON-LD syntax; "@type" value must a string, an array of strings, an empty object, or a default object.',
        "jsonld.SyntaxError",
        { code: "invalid type value", value: v }
      );
    };
    api.hasProperty = (subject, property) => {
      if (subject.hasOwnProperty(property)) {
        const value = subject[property];
        return !types.isArray(value) || value.length > 0;
      }
      return false;
    };
    api.hasValue = (subject, property, value) => {
      if (api.hasProperty(subject, property)) {
        let val = subject[property];
        const isList = graphTypes.isList(val);
        if (types.isArray(val) || isList) {
          if (isList) {
            val = val["@list"];
          }
          for (let i = 0; i < val.length; ++i) {
            if (api.compareValues(value, val[i])) {
              return true;
            }
          }
        } else if (!types.isArray(value)) {
          return api.compareValues(value, val);
        }
      }
      return false;
    };
    api.addValue = (subject, property, value, options) => {
      options = options || {};
      if (!("propertyIsArray" in options)) {
        options.propertyIsArray = false;
      }
      if (!("valueIsArray" in options)) {
        options.valueIsArray = false;
      }
      if (!("allowDuplicate" in options)) {
        options.allowDuplicate = true;
      }
      if (!("prependValue" in options)) {
        options.prependValue = false;
      }
      if (options.valueIsArray) {
        subject[property] = value;
      } else if (types.isArray(value)) {
        if (value.length === 0 && options.propertyIsArray && !subject.hasOwnProperty(property)) {
          subject[property] = [];
        }
        if (options.prependValue) {
          value = value.concat(subject[property]);
          subject[property] = [];
        }
        for (let i = 0; i < value.length; ++i) {
          api.addValue(subject, property, value[i], options);
        }
      } else if (subject.hasOwnProperty(property)) {
        const hasValue = !options.allowDuplicate && api.hasValue(subject, property, value);
        if (!types.isArray(subject[property]) && (!hasValue || options.propertyIsArray)) {
          subject[property] = [subject[property]];
        }
        if (!hasValue) {
          if (options.prependValue) {
            subject[property].unshift(value);
          } else {
            subject[property].push(value);
          }
        }
      } else {
        subject[property] = options.propertyIsArray ? [value] : value;
      }
    };
    api.getValues = (subject, property) => [].concat(subject[property] || []);
    api.removeProperty = (subject, property) => {
      delete subject[property];
    };
    api.removeValue = (subject, property, value, options) => {
      options = options || {};
      if (!("propertyIsArray" in options)) {
        options.propertyIsArray = false;
      }
      const values = api.getValues(subject, property).filter(
        (e) => !api.compareValues(e, value)
      );
      if (values.length === 0) {
        api.removeProperty(subject, property);
      } else if (values.length === 1 && !options.propertyIsArray) {
        subject[property] = values[0];
      } else {
        subject[property] = values;
      }
    };
    api.relabelBlankNodes = (input, options) => {
      options = options || {};
      const issuer = options.issuer || new IdentifierIssuer("_:b");
      return _labelBlankNodes(issuer, input);
    };
    api.compareValues = (v1, v2) => {
      if (v1 === v2) {
        return true;
      }
      if (graphTypes.isValue(v1) && graphTypes.isValue(v2) && v1["@value"] === v2["@value"] && v1["@type"] === v2["@type"] && v1["@language"] === v2["@language"] && v1["@index"] === v2["@index"]) {
        return true;
      }
      if (types.isObject(v1) && "@id" in v1 && types.isObject(v2) && "@id" in v2) {
        return v1["@id"] === v2["@id"];
      }
      return false;
    };
    api.compareShortestLeast = (a, b) => {
      if (a.length < b.length) {
        return -1;
      }
      if (b.length < a.length) {
        return 1;
      }
      if (a === b) {
        return 0;
      }
      return a < b ? -1 : 1;
    };
    function _labelBlankNodes(issuer, element) {
      if (types.isArray(element)) {
        for (let i = 0; i < element.length; ++i) {
          element[i] = _labelBlankNodes(issuer, element[i]);
        }
      } else if (graphTypes.isList(element)) {
        element["@list"] = _labelBlankNodes(issuer, element["@list"]);
      } else if (types.isObject(element)) {
        if (graphTypes.isBlankNode(element)) {
          element["@id"] = issuer.getId(element["@id"]);
        }
        const keys = Object.keys(element).sort();
        for (let ki = 0; ki < keys.length; ++ki) {
          const key = keys[ki];
          if (key !== "@id") {
            element[key] = _labelBlankNodes(issuer, element[key]);
          }
        }
      }
      return element;
    }
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/constants.js
var require_constants = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/constants.js"(exports, module) {
    "use strict";
    var RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
    var XSD2 = "http://www.w3.org/2001/XMLSchema#";
    module.exports = {
      // TODO: Deprecated and will be removed later. Use LINK_HEADER_CONTEXT.
      LINK_HEADER_REL: "http://www.w3.org/ns/json-ld#context",
      LINK_HEADER_CONTEXT: "http://www.w3.org/ns/json-ld#context",
      RDF,
      RDF_LIST: RDF + "List",
      RDF_FIRST: RDF + "first",
      RDF_REST: RDF + "rest",
      RDF_NIL: RDF + "nil",
      RDF_TYPE: RDF + "type",
      RDF_PLAIN_LITERAL: RDF + "PlainLiteral",
      RDF_XML_LITERAL: RDF + "XMLLiteral",
      RDF_JSON_LITERAL: RDF + "JSON",
      RDF_OBJECT: RDF + "object",
      RDF_LANGSTRING: RDF + "langString",
      XSD: XSD2,
      XSD_BOOLEAN: XSD2 + "boolean",
      XSD_DOUBLE: XSD2 + "double",
      XSD_INTEGER: XSD2 + "integer",
      XSD_STRING: XSD2 + "string"
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/RequestQueue.js
var require_RequestQueue = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/RequestQueue.js"(exports, module) {
    "use strict";
    module.exports = class RequestQueue {
      /**
       * Creates a simple queue for requesting documents.
       */
      constructor() {
        this._requests = {};
      }
      wrapLoader(loader) {
        const self2 = this;
        self2._loader = loader;
        return function() {
          return self2.add.apply(self2, arguments);
        };
      }
      async add(url) {
        let promise = this._requests[url];
        if (promise) {
          return Promise.resolve(promise);
        }
        promise = this._requests[url] = this._loader(url);
        try {
          return await promise;
        } finally {
          delete this._requests[url];
        }
      }
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/url.js
var require_url = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/url.js"(exports, module) {
    "use strict";
    var types = require_types();
    var api = {};
    module.exports = api;
    api.parsers = {
      simple: {
        // RFC 3986 basic parts
        keys: [
          "href",
          "scheme",
          "authority",
          "path",
          "query",
          "fragment"
        ],
        /* eslint-disable-next-line max-len */
        regex: /^(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/
      },
      full: {
        keys: [
          "href",
          "protocol",
          "scheme",
          "authority",
          "auth",
          "user",
          "password",
          "hostname",
          "port",
          "path",
          "directory",
          "file",
          "query",
          "fragment"
        ],
        /* eslint-disable-next-line max-len */
        regex: /^(([a-zA-Z][a-zA-Z0-9+-.]*):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?(?:(((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/
      }
    };
    api.parse = (str, parser) => {
      const parsed = {};
      const o = api.parsers[parser || "full"];
      const m = o.regex.exec(str);
      let i = o.keys.length;
      while (i--) {
        parsed[o.keys[i]] = m[i] === void 0 ? null : m[i];
      }
      if (parsed.scheme === "https" && parsed.port === "443" || parsed.scheme === "http" && parsed.port === "80") {
        parsed.href = parsed.href.replace(":" + parsed.port, "");
        parsed.authority = parsed.authority.replace(":" + parsed.port, "");
        parsed.port = null;
      }
      parsed.normalizedPath = api.removeDotSegments(parsed.path);
      return parsed;
    };
    api.prependBase = (base, iri) => {
      if (base === null) {
        return iri;
      }
      if (api.isAbsolute(iri)) {
        return iri;
      }
      if (!base || types.isString(base)) {
        base = api.parse(base || "");
      }
      const rel = api.parse(iri);
      const transform = {
        protocol: base.protocol || ""
      };
      if (rel.authority !== null) {
        transform.authority = rel.authority;
        transform.path = rel.path;
        transform.query = rel.query;
      } else {
        transform.authority = base.authority;
        if (rel.path === "") {
          transform.path = base.path;
          if (rel.query !== null) {
            transform.query = rel.query;
          } else {
            transform.query = base.query;
          }
        } else {
          if (rel.path.indexOf("/") === 0) {
            transform.path = rel.path;
          } else {
            let path = base.path;
            path = path.substr(0, path.lastIndexOf("/") + 1);
            if ((path.length > 0 || base.authority) && path.substr(-1) !== "/") {
              path += "/";
            }
            path += rel.path;
            transform.path = path;
          }
          transform.query = rel.query;
        }
      }
      if (rel.path !== "") {
        transform.path = api.removeDotSegments(transform.path);
      }
      let rval = transform.protocol;
      if (transform.authority !== null) {
        rval += "//" + transform.authority;
      }
      rval += transform.path;
      if (transform.query !== null) {
        rval += "?" + transform.query;
      }
      if (rel.fragment !== null) {
        rval += "#" + rel.fragment;
      }
      if (rval === "") {
        rval = "./";
      }
      return rval;
    };
    api.removeBase = (base, iri) => {
      if (base === null) {
        return iri;
      }
      if (!base || types.isString(base)) {
        base = api.parse(base || "");
      }
      let root = "";
      if (base.href !== "") {
        root += (base.protocol || "") + "//" + (base.authority || "");
      } else if (iri.indexOf("//")) {
        root += "//";
      }
      if (iri.indexOf(root) !== 0) {
        return iri;
      }
      const rel = api.parse(iri.substr(root.length));
      const baseSegments = base.normalizedPath.split("/");
      const iriSegments = rel.normalizedPath.split("/");
      const last = rel.fragment || rel.query ? 0 : 1;
      while (baseSegments.length > 0 && iriSegments.length > last) {
        if (baseSegments[0] !== iriSegments[0]) {
          break;
        }
        baseSegments.shift();
        iriSegments.shift();
      }
      let rval = "";
      if (baseSegments.length > 0) {
        baseSegments.pop();
        for (let i = 0; i < baseSegments.length; ++i) {
          rval += "../";
        }
      }
      rval += iriSegments.join("/");
      if (rel.query !== null) {
        rval += "?" + rel.query;
      }
      if (rel.fragment !== null) {
        rval += "#" + rel.fragment;
      }
      if (rval === "") {
        rval = "./";
      }
      return rval;
    };
    api.removeDotSegments = (path) => {
      if (path.length === 0) {
        return "";
      }
      const input = path.split("/");
      const output = [];
      while (input.length > 0) {
        const next = input.shift();
        const done = input.length === 0;
        if (next === ".") {
          if (done) {
            output.push("");
          }
          continue;
        }
        if (next === "..") {
          output.pop();
          if (done) {
            output.push("");
          }
          continue;
        }
        output.push(next);
      }
      if (path[0] === "/" && output.length > 0 && output[0] !== "") {
        output.unshift("");
      }
      if (output.length === 1 && output[0] === "") {
        return "/";
      }
      return output.join("/");
    };
    var isAbsoluteRegex = /^([A-Za-z][A-Za-z0-9+-.]*|_):[^\s]*$/;
    api.isAbsolute = (v) => types.isString(v) && isAbsoluteRegex.test(v);
    api.isRelative = (v) => types.isString(v);
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/documentLoaders/xhr.js
var require_xhr = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/documentLoaders/xhr.js"(exports, module) {
    "use strict";
    var { parseLinkHeader, buildHeaders } = require_util();
    var { LINK_HEADER_CONTEXT } = require_constants();
    var JsonLdError = require_JsonLdError();
    var RequestQueue = require_RequestQueue();
    var { prependBase } = require_url();
    var REGEX_LINK_HEADER = /(^|(\r\n))link:/i;
    module.exports = ({
      secure,
      headers = {},
      xhr
    } = { headers: {} }) => {
      headers = buildHeaders(headers);
      const queue = new RequestQueue();
      return queue.wrapLoader(loader);
      async function loader(url) {
        if (url.indexOf("http:") !== 0 && url.indexOf("https:") !== 0) {
          throw new JsonLdError(
            'URL could not be dereferenced; only "http" and "https" URLs are supported.',
            "jsonld.InvalidUrl",
            { code: "loading document failed", url }
          );
        }
        if (secure && url.indexOf("https") !== 0) {
          throw new JsonLdError(
            `URL could not be dereferenced; secure mode is enabled and the URL's scheme is not "https".`,
            "jsonld.InvalidUrl",
            { code: "loading document failed", url }
          );
        }
        let req;
        try {
          req = await _get(xhr, url, headers);
        } catch (e) {
          throw new JsonLdError(
            "URL could not be dereferenced, an error occurred.",
            "jsonld.LoadDocumentError",
            { code: "loading document failed", url, cause: e }
          );
        }
        if (req.status >= 400) {
          throw new JsonLdError(
            "URL could not be dereferenced: " + req.statusText,
            "jsonld.LoadDocumentError",
            {
              code: "loading document failed",
              url,
              httpStatusCode: req.status
            }
          );
        }
        let doc = { contextUrl: null, documentUrl: url, document: req.response };
        let alternate = null;
        const contentType = req.getResponseHeader("Content-Type");
        let linkHeader;
        if (REGEX_LINK_HEADER.test(req.getAllResponseHeaders())) {
          linkHeader = req.getResponseHeader("Link");
        }
        if (linkHeader && contentType !== "application/ld+json") {
          const linkHeaders = parseLinkHeader(linkHeader);
          const linkedContext = linkHeaders[LINK_HEADER_CONTEXT];
          if (Array.isArray(linkedContext)) {
            throw new JsonLdError(
              "URL could not be dereferenced, it has more than one associated HTTP Link Header.",
              "jsonld.InvalidUrl",
              { code: "multiple context link headers", url }
            );
          }
          if (linkedContext) {
            doc.contextUrl = linkedContext.target;
          }
          alternate = linkHeaders.alternate;
          if (alternate && alternate.type == "application/ld+json" && !(contentType || "").match(/^application\/(\w*\+)?json$/)) {
            doc = await loader(prependBase(url, alternate.target));
          }
        }
        return doc;
      }
    };
    function _get(xhr, url, headers) {
      xhr = xhr || XMLHttpRequest;
      const req = new xhr();
      return new Promise((resolve, reject) => {
        req.onload = () => resolve(req);
        req.onerror = (err) => reject(err);
        req.open("GET", url, true);
        for (const k in headers) {
          req.setRequestHeader(k, headers[k]);
        }
        req.send();
      });
    }
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/platform-browser.js
var require_platform_browser2 = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/platform-browser.js"(exports, module) {
    "use strict";
    var xhrLoader = require_xhr();
    var api = {};
    module.exports = api;
    api.setupDocumentLoaders = function(jsonld2) {
      if (typeof XMLHttpRequest !== "undefined") {
        jsonld2.documentLoaders.xhr = xhrLoader;
        jsonld2.useDocumentLoader("xhr");
      }
    };
    api.setupGlobals = function(jsonld2) {
      if (typeof globalThis.JsonLdProcessor === "undefined") {
        Object.defineProperty(globalThis, "JsonLdProcessor", {
          writable: true,
          enumerable: false,
          configurable: true,
          value: jsonld2.JsonLdProcessor
        });
      }
    };
  }
});

// node_modules/.pnpm/yallist@4.0.0/node_modules/yallist/iterator.js
var require_iterator = __commonJS({
  "node_modules/.pnpm/yallist@4.0.0/node_modules/yallist/iterator.js"(exports, module) {
    "use strict";
    module.exports = function(Yallist) {
      Yallist.prototype[Symbol.iterator] = function* () {
        for (let walker = this.head; walker; walker = walker.next) {
          yield walker.value;
        }
      };
    };
  }
});

// node_modules/.pnpm/yallist@4.0.0/node_modules/yallist/yallist.js
var require_yallist = __commonJS({
  "node_modules/.pnpm/yallist@4.0.0/node_modules/yallist/yallist.js"(exports, module) {
    "use strict";
    module.exports = Yallist;
    Yallist.Node = Node;
    Yallist.create = Yallist;
    function Yallist(list) {
      var self2 = this;
      if (!(self2 instanceof Yallist)) {
        self2 = new Yallist();
      }
      self2.tail = null;
      self2.head = null;
      self2.length = 0;
      if (list && typeof list.forEach === "function") {
        list.forEach(function(item) {
          self2.push(item);
        });
      } else if (arguments.length > 0) {
        for (var i = 0, l = arguments.length; i < l; i++) {
          self2.push(arguments[i]);
        }
      }
      return self2;
    }
    Yallist.prototype.removeNode = function(node) {
      if (node.list !== this) {
        throw new Error("removing node which does not belong to this list");
      }
      var next = node.next;
      var prev = node.prev;
      if (next) {
        next.prev = prev;
      }
      if (prev) {
        prev.next = next;
      }
      if (node === this.head) {
        this.head = next;
      }
      if (node === this.tail) {
        this.tail = prev;
      }
      node.list.length--;
      node.next = null;
      node.prev = null;
      node.list = null;
      return next;
    };
    Yallist.prototype.unshiftNode = function(node) {
      if (node === this.head) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var head = this.head;
      node.list = this;
      node.next = head;
      if (head) {
        head.prev = node;
      }
      this.head = node;
      if (!this.tail) {
        this.tail = node;
      }
      this.length++;
    };
    Yallist.prototype.pushNode = function(node) {
      if (node === this.tail) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var tail = this.tail;
      node.list = this;
      node.prev = tail;
      if (tail) {
        tail.next = node;
      }
      this.tail = node;
      if (!this.head) {
        this.head = node;
      }
      this.length++;
    };
    Yallist.prototype.push = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        push(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.unshift = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        unshift(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.pop = function() {
      if (!this.tail) {
        return void 0;
      }
      var res = this.tail.value;
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.shift = function() {
      if (!this.head) {
        return void 0;
      }
      var res = this.head.value;
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.forEach = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.head, i = 0; walker !== null; i++) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.next;
      }
    };
    Yallist.prototype.forEachReverse = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.prev;
      }
    };
    Yallist.prototype.get = function(n) {
      for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
        walker = walker.next;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.getReverse = function(n) {
      for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
        walker = walker.prev;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.map = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.head; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.next;
      }
      return res;
    };
    Yallist.prototype.mapReverse = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.tail; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.prev;
      }
      return res;
    };
    Yallist.prototype.reduce = function(fn, initial) {
      var acc;
      var walker = this.head;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.head) {
        walker = this.head.next;
        acc = this.head.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = 0; walker !== null; i++) {
        acc = fn(acc, walker.value, i);
        walker = walker.next;
      }
      return acc;
    };
    Yallist.prototype.reduceReverse = function(fn, initial) {
      var acc;
      var walker = this.tail;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.tail) {
        walker = this.tail.prev;
        acc = this.tail.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = this.length - 1; walker !== null; i--) {
        acc = fn(acc, walker.value, i);
        walker = walker.prev;
      }
      return acc;
    };
    Yallist.prototype.toArray = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.head; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.next;
      }
      return arr;
    };
    Yallist.prototype.toArrayReverse = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.tail; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.prev;
      }
      return arr;
    };
    Yallist.prototype.slice = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
        walker = walker.next;
      }
      for (; walker !== null && i < to; i++, walker = walker.next) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.sliceReverse = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
        walker = walker.prev;
      }
      for (; walker !== null && i > from; i--, walker = walker.prev) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
      if (start > this.length) {
        start = this.length - 1;
      }
      if (start < 0) {
        start = this.length + start;
      }
      for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
        walker = walker.next;
      }
      var ret = [];
      for (var i = 0; walker && i < deleteCount; i++) {
        ret.push(walker.value);
        walker = this.removeNode(walker);
      }
      if (walker === null) {
        walker = this.tail;
      }
      if (walker !== this.head && walker !== this.tail) {
        walker = walker.prev;
      }
      for (var i = 0; i < nodes.length; i++) {
        walker = insert(this, walker, nodes[i]);
      }
      return ret;
    };
    Yallist.prototype.reverse = function() {
      var head = this.head;
      var tail = this.tail;
      for (var walker = head; walker !== null; walker = walker.prev) {
        var p = walker.prev;
        walker.prev = walker.next;
        walker.next = p;
      }
      this.head = tail;
      this.tail = head;
      return this;
    };
    function insert(self2, node, value) {
      var inserted = node === self2.head ? new Node(value, null, node, self2) : new Node(value, node, node.next, self2);
      if (inserted.next === null) {
        self2.tail = inserted;
      }
      if (inserted.prev === null) {
        self2.head = inserted;
      }
      self2.length++;
      return inserted;
    }
    function push(self2, item) {
      self2.tail = new Node(item, self2.tail, null, self2);
      if (!self2.head) {
        self2.head = self2.tail;
      }
      self2.length++;
    }
    function unshift(self2, item) {
      self2.head = new Node(item, null, self2.head, self2);
      if (!self2.tail) {
        self2.tail = self2.head;
      }
      self2.length++;
    }
    function Node(value, prev, next, list) {
      if (!(this instanceof Node)) {
        return new Node(value, prev, next, list);
      }
      this.list = list;
      this.value = value;
      if (prev) {
        prev.next = this;
        this.prev = prev;
      } else {
        this.prev = null;
      }
      if (next) {
        next.prev = this;
        this.next = next;
      } else {
        this.next = null;
      }
    }
    try {
      require_iterator()(Yallist);
    } catch (er) {
    }
  }
});

// node_modules/.pnpm/lru-cache@6.0.0/node_modules/lru-cache/index.js
var require_lru_cache = __commonJS({
  "node_modules/.pnpm/lru-cache@6.0.0/node_modules/lru-cache/index.js"(exports, module) {
    "use strict";
    var Yallist = require_yallist();
    var MAX = Symbol("max");
    var LENGTH = Symbol("length");
    var LENGTH_CALCULATOR = Symbol("lengthCalculator");
    var ALLOW_STALE = Symbol("allowStale");
    var MAX_AGE = Symbol("maxAge");
    var DISPOSE = Symbol("dispose");
    var NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
    var LRU_LIST = Symbol("lruList");
    var CACHE = Symbol("cache");
    var UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
    var naiveLength = () => 1;
    var LRUCache = class {
      constructor(options) {
        if (typeof options === "number")
          options = { max: options };
        if (!options)
          options = {};
        if (options.max && (typeof options.max !== "number" || options.max < 0))
          throw new TypeError("max must be a non-negative number");
        const max = this[MAX] = options.max || Infinity;
        const lc = options.length || naiveLength;
        this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
        this[ALLOW_STALE] = options.stale || false;
        if (options.maxAge && typeof options.maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        this[MAX_AGE] = options.maxAge || 0;
        this[DISPOSE] = options.dispose;
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
        this.reset();
      }
      // resize the cache when the max changes.
      set max(mL) {
        if (typeof mL !== "number" || mL < 0)
          throw new TypeError("max must be a non-negative number");
        this[MAX] = mL || Infinity;
        trim(this);
      }
      get max() {
        return this[MAX];
      }
      set allowStale(allowStale) {
        this[ALLOW_STALE] = !!allowStale;
      }
      get allowStale() {
        return this[ALLOW_STALE];
      }
      set maxAge(mA) {
        if (typeof mA !== "number")
          throw new TypeError("maxAge must be a non-negative number");
        this[MAX_AGE] = mA;
        trim(this);
      }
      get maxAge() {
        return this[MAX_AGE];
      }
      // resize the cache when the lengthCalculator changes.
      set lengthCalculator(lC) {
        if (typeof lC !== "function")
          lC = naiveLength;
        if (lC !== this[LENGTH_CALCULATOR]) {
          this[LENGTH_CALCULATOR] = lC;
          this[LENGTH] = 0;
          this[LRU_LIST].forEach((hit) => {
            hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
            this[LENGTH] += hit.length;
          });
        }
        trim(this);
      }
      get lengthCalculator() {
        return this[LENGTH_CALCULATOR];
      }
      get length() {
        return this[LENGTH];
      }
      get itemCount() {
        return this[LRU_LIST].length;
      }
      rforEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].tail; walker !== null; ) {
          const prev = walker.prev;
          forEachStep(this, fn, walker, thisp);
          walker = prev;
        }
      }
      forEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].head; walker !== null; ) {
          const next = walker.next;
          forEachStep(this, fn, walker, thisp);
          walker = next;
        }
      }
      keys() {
        return this[LRU_LIST].toArray().map((k) => k.key);
      }
      values() {
        return this[LRU_LIST].toArray().map((k) => k.value);
      }
      reset() {
        if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
          this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
        }
        this[CACHE] = /* @__PURE__ */ new Map();
        this[LRU_LIST] = new Yallist();
        this[LENGTH] = 0;
      }
      dump() {
        return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0)
        }).toArray().filter((h) => h);
      }
      dumpLru() {
        return this[LRU_LIST];
      }
      set(key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE];
        if (maxAge && typeof maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        const now = maxAge ? Date.now() : 0;
        const len = this[LENGTH_CALCULATOR](value, key);
        if (this[CACHE].has(key)) {
          if (len > this[MAX]) {
            del(this, this[CACHE].get(key));
            return false;
          }
          const node = this[CACHE].get(key);
          const item = node.value;
          if (this[DISPOSE]) {
            if (!this[NO_DISPOSE_ON_SET])
              this[DISPOSE](key, item.value);
          }
          item.now = now;
          item.maxAge = maxAge;
          item.value = value;
          this[LENGTH] += len - item.length;
          item.length = len;
          this.get(key);
          trim(this);
          return true;
        }
        const hit = new Entry(key, value, len, now, maxAge);
        if (hit.length > this[MAX]) {
          if (this[DISPOSE])
            this[DISPOSE](key, value);
          return false;
        }
        this[LENGTH] += hit.length;
        this[LRU_LIST].unshift(hit);
        this[CACHE].set(key, this[LRU_LIST].head);
        trim(this);
        return true;
      }
      has(key) {
        if (!this[CACHE].has(key)) return false;
        const hit = this[CACHE].get(key).value;
        return !isStale(this, hit);
      }
      get(key) {
        return get(this, key, true);
      }
      peek(key) {
        return get(this, key, false);
      }
      pop() {
        const node = this[LRU_LIST].tail;
        if (!node)
          return null;
        del(this, node);
        return node.value;
      }
      del(key) {
        del(this, this[CACHE].get(key));
      }
      load(arr) {
        this.reset();
        const now = Date.now();
        for (let l = arr.length - 1; l >= 0; l--) {
          const hit = arr[l];
          const expiresAt = hit.e || 0;
          if (expiresAt === 0)
            this.set(hit.k, hit.v);
          else {
            const maxAge = expiresAt - now;
            if (maxAge > 0) {
              this.set(hit.k, hit.v, maxAge);
            }
          }
        }
      }
      prune() {
        this[CACHE].forEach((value, key) => get(this, key, false));
      }
    };
    var get = (self2, key, doUse) => {
      const node = self2[CACHE].get(key);
      if (node) {
        const hit = node.value;
        if (isStale(self2, hit)) {
          del(self2, node);
          if (!self2[ALLOW_STALE])
            return void 0;
        } else {
          if (doUse) {
            if (self2[UPDATE_AGE_ON_GET])
              node.value.now = Date.now();
            self2[LRU_LIST].unshiftNode(node);
          }
        }
        return hit.value;
      }
    };
    var isStale = (self2, hit) => {
      if (!hit || !hit.maxAge && !self2[MAX_AGE])
        return false;
      const diff = Date.now() - hit.now;
      return hit.maxAge ? diff > hit.maxAge : self2[MAX_AGE] && diff > self2[MAX_AGE];
    };
    var trim = (self2) => {
      if (self2[LENGTH] > self2[MAX]) {
        for (let walker = self2[LRU_LIST].tail; self2[LENGTH] > self2[MAX] && walker !== null; ) {
          const prev = walker.prev;
          del(self2, walker);
          walker = prev;
        }
      }
    };
    var del = (self2, node) => {
      if (node) {
        const hit = node.value;
        if (self2[DISPOSE])
          self2[DISPOSE](hit.key, hit.value);
        self2[LENGTH] -= hit.length;
        self2[CACHE].delete(hit.key);
        self2[LRU_LIST].removeNode(node);
      }
    };
    var Entry = class {
      constructor(key, value, length, now, maxAge) {
        this.key = key;
        this.value = value;
        this.length = length;
        this.now = now;
        this.maxAge = maxAge || 0;
      }
    };
    var forEachStep = (self2, fn, node, thisp) => {
      let hit = node.value;
      if (isStale(self2, hit)) {
        del(self2, node);
        if (!self2[ALLOW_STALE])
          hit = void 0;
      }
      if (hit)
        fn.call(thisp, hit.value, hit.key, self2);
    };
    module.exports = LRUCache;
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/ResolvedContext.js
var require_ResolvedContext = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/ResolvedContext.js"(exports, module) {
    "use strict";
    var LRU = require_lru_cache();
    var MAX_ACTIVE_CONTEXTS = 10;
    module.exports = class ResolvedContext {
      /**
       * Creates a ResolvedContext.
       *
       * @param document the context document.
       */
      constructor({ document: document2 }) {
        this.document = document2;
        this.cache = new LRU({ max: MAX_ACTIVE_CONTEXTS });
      }
      getProcessed(activeCtx) {
        return this.cache.get(activeCtx);
      }
      setProcessed(activeCtx, processedCtx) {
        this.cache.set(activeCtx, processedCtx);
      }
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/ContextResolver.js
var require_ContextResolver = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/ContextResolver.js"(exports, module) {
    "use strict";
    var {
      isArray: _isArray,
      isObject: _isObject,
      isString: _isString
    } = require_types();
    var {
      asArray: _asArray
    } = require_util();
    var { prependBase } = require_url();
    var JsonLdError = require_JsonLdError();
    var ResolvedContext = require_ResolvedContext();
    var MAX_CONTEXT_URLS = 10;
    module.exports = class ContextResolver {
      /**
       * Creates a ContextResolver.
       *
       * @param sharedCache a shared LRU cache with `get` and `set` APIs.
       */
      constructor({ sharedCache }) {
        this.perOpCache = /* @__PURE__ */ new Map();
        this.sharedCache = sharedCache;
      }
      async resolve({
        activeCtx,
        context,
        documentLoader: documentLoader2,
        base,
        cycles = /* @__PURE__ */ new Set()
      }) {
        if (context && _isObject(context) && context["@context"]) {
          context = context["@context"];
        }
        context = _asArray(context);
        const allResolved = [];
        for (const ctx of context) {
          if (_isString(ctx)) {
            let resolved2 = this._get(ctx);
            if (!resolved2) {
              resolved2 = await this._resolveRemoteContext(
                { activeCtx, url: ctx, documentLoader: documentLoader2, base, cycles }
              );
            }
            if (_isArray(resolved2)) {
              allResolved.push(...resolved2);
            } else {
              allResolved.push(resolved2);
            }
            continue;
          }
          if (ctx === null) {
            allResolved.push(new ResolvedContext({ document: null }));
            continue;
          }
          if (!_isObject(ctx)) {
            _throwInvalidLocalContext(context);
          }
          const key = JSON.stringify(ctx);
          let resolved = this._get(key);
          if (!resolved) {
            resolved = new ResolvedContext({ document: ctx });
            this._cacheResolvedContext({ key, resolved, tag: "static" });
          }
          allResolved.push(resolved);
        }
        return allResolved;
      }
      _get(key) {
        let resolved = this.perOpCache.get(key);
        if (!resolved) {
          const tagMap = this.sharedCache.get(key);
          if (tagMap) {
            resolved = tagMap.get("static");
            if (resolved) {
              this.perOpCache.set(key, resolved);
            }
          }
        }
        return resolved;
      }
      _cacheResolvedContext({ key, resolved, tag }) {
        this.perOpCache.set(key, resolved);
        if (tag !== void 0) {
          let tagMap = this.sharedCache.get(key);
          if (!tagMap) {
            tagMap = /* @__PURE__ */ new Map();
            this.sharedCache.set(key, tagMap);
          }
          tagMap.set(tag, resolved);
        }
        return resolved;
      }
      async _resolveRemoteContext({ activeCtx, url, documentLoader: documentLoader2, base, cycles }) {
        url = prependBase(base, url);
        const { context, remoteDoc } = await this._fetchContext(
          { activeCtx, url, documentLoader: documentLoader2, cycles }
        );
        base = remoteDoc.documentUrl || url;
        _resolveContextUrls({ context, base });
        const resolved = await this.resolve(
          { activeCtx, context, documentLoader: documentLoader2, base, cycles }
        );
        this._cacheResolvedContext({ key: url, resolved, tag: remoteDoc.tag });
        return resolved;
      }
      async _fetchContext({ activeCtx, url, documentLoader: documentLoader2, cycles }) {
        if (cycles.size > MAX_CONTEXT_URLS) {
          throw new JsonLdError(
            "Maximum number of @context URLs exceeded.",
            "jsonld.ContextUrlError",
            {
              code: activeCtx.processingMode === "json-ld-1.0" ? "loading remote context failed" : "context overflow",
              max: MAX_CONTEXT_URLS
            }
          );
        }
        if (cycles.has(url)) {
          throw new JsonLdError(
            "Cyclical @context URLs detected.",
            "jsonld.ContextUrlError",
            {
              code: activeCtx.processingMode === "json-ld-1.0" ? "recursive context inclusion" : "context overflow",
              url
            }
          );
        }
        cycles.add(url);
        let context;
        let remoteDoc;
        try {
          remoteDoc = await documentLoader2(url);
          context = remoteDoc.document || null;
          if (_isString(context)) {
            context = JSON.parse(context);
          }
        } catch (e) {
          throw new JsonLdError(
            `Dereferencing a URL did not result in a valid JSON-LD object. Possible causes are an inaccessible URL perhaps due to a same-origin policy (ensure the server uses CORS if you are using client-side JavaScript), too many redirects, a non-JSON response, or more than one HTTP Link Header was provided for a remote context. URL: "${url}".`,
            "jsonld.InvalidUrl",
            { code: "loading remote context failed", url, cause: e }
          );
        }
        if (!_isObject(context)) {
          throw new JsonLdError(
            `Dereferencing a URL did not result in a JSON object. The response was valid JSON, but it was not a JSON object. URL: "${url}".`,
            "jsonld.InvalidUrl",
            { code: "invalid remote context", url }
          );
        }
        if (!("@context" in context)) {
          context = { "@context": {} };
        } else {
          context = { "@context": context["@context"] };
        }
        if (remoteDoc.contextUrl) {
          if (!_isArray(context["@context"])) {
            context["@context"] = [context["@context"]];
          }
          context["@context"].push(remoteDoc.contextUrl);
        }
        return { context, remoteDoc };
      }
    };
    function _throwInvalidLocalContext(ctx) {
      throw new JsonLdError(
        "Invalid JSON-LD syntax; @context must be an object.",
        "jsonld.SyntaxError",
        {
          code: "invalid local context",
          context: ctx
        }
      );
    }
    function _resolveContextUrls({ context, base }) {
      if (!context) {
        return;
      }
      const ctx = context["@context"];
      if (_isString(ctx)) {
        context["@context"] = prependBase(base, ctx);
        return;
      }
      if (_isArray(ctx)) {
        for (let i = 0; i < ctx.length; ++i) {
          const element = ctx[i];
          if (_isString(element)) {
            ctx[i] = prependBase(base, element);
            continue;
          }
          if (_isObject(element)) {
            _resolveContextUrls({ context: { "@context": element }, base });
          }
        }
        return;
      }
      if (!_isObject(ctx)) {
        return;
      }
      for (const term in ctx) {
        _resolveContextUrls({ context: ctx[term], base });
      }
    }
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/NQuads.js
var require_NQuads2 = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/NQuads.js"(exports, module) {
    "use strict";
    module.exports = require_rdf_canonize().NQuads;
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/events.js
var require_events = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/events.js"(exports, module) {
    "use strict";
    var JsonLdError = require_JsonLdError();
    var {
      isArray: _isArray
    } = require_types();
    var {
      asArray: _asArray
    } = require_util();
    var api = {};
    module.exports = api;
    api.defaultEventHandler = null;
    api.setupEventHandler = ({ options = {} }) => {
      const eventHandler = [].concat(
        options.safe ? api.safeEventHandler : [],
        options.eventHandler ? _asArray(options.eventHandler) : [],
        api.defaultEventHandler ? api.defaultEventHandler : []
      );
      return eventHandler.length === 0 ? null : eventHandler;
    };
    api.handleEvent = ({
      event,
      options
    }) => {
      _handle({ event, handlers: options.eventHandler });
    };
    function _handle({ event, handlers }) {
      let doNext = true;
      for (let i = 0; doNext && i < handlers.length; ++i) {
        doNext = false;
        const handler = handlers[i];
        if (_isArray(handler)) {
          doNext = _handle({ event, handlers: handler });
        } else if (typeof handler === "function") {
          handler({ event, next: () => {
            doNext = true;
          } });
        } else if (typeof handler === "object") {
          if (event.code in handler) {
            handler[event.code]({ event, next: () => {
              doNext = true;
            } });
          } else {
            doNext = true;
          }
        } else {
          throw new JsonLdError(
            "Invalid event handler.",
            "jsonld.InvalidEventHandler",
            { event }
          );
        }
      }
      return doNext;
    }
    var _notSafeEventCodes = /* @__PURE__ */ new Set([
      "empty object",
      "free-floating scalar",
      "invalid @language value",
      "invalid property",
      // NOTE: spec edge case
      "null @id value",
      "null @value value",
      "object with only @id",
      "object with only @language",
      "object with only @list",
      "object with only @value",
      "relative @id reference",
      "relative @type reference",
      "relative @vocab reference",
      "reserved @id value",
      "reserved @reverse value",
      "reserved term",
      // toRDF
      "blank node predicate",
      "relative graph reference",
      "relative object reference",
      "relative predicate reference",
      "relative subject reference",
      // toRDF / fromRDF
      "rdfDirection not set"
    ]);
    api.safeEventHandler = function safeEventHandler({ event, next }) {
      if (event.level === "warning" && _notSafeEventCodes.has(event.code)) {
        throw new JsonLdError(
          "Safe mode validation error.",
          "jsonld.ValidationError",
          { event }
        );
      }
      next();
    };
    api.logEventHandler = function logEventHandler({ event, next }) {
      console.log(`EVENT: ${event.message}`, { event });
      next();
    };
    api.logWarningEventHandler = function logWarningEventHandler({ event, next }) {
      if (event.level === "warning") {
        console.warn(`WARNING: ${event.message}`, { event });
      }
      next();
    };
    api.unhandledEventHandler = function unhandledEventHandler({ event }) {
      throw new JsonLdError(
        "No handler for event.",
        "jsonld.UnhandledEvent",
        { event }
      );
    };
    api.setDefaultEventHandler = function({ eventHandler } = {}) {
      api.defaultEventHandler = eventHandler ? _asArray(eventHandler) : null;
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/context.js
var require_context = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/context.js"(exports, module) {
    "use strict";
    var util = require_util();
    var JsonLdError = require_JsonLdError();
    var {
      isArray: _isArray,
      isObject: _isObject,
      isString: _isString,
      isUndefined: _isUndefined
    } = require_types();
    var {
      isAbsolute: _isAbsoluteIri,
      isRelative: _isRelativeIri,
      prependBase
    } = require_url();
    var {
      handleEvent: _handleEvent
    } = require_events();
    var {
      REGEX_BCP47,
      REGEX_KEYWORD,
      asArray: _asArray,
      compareShortestLeast: _compareShortestLeast
    } = require_util();
    var INITIAL_CONTEXT_CACHE = /* @__PURE__ */ new Map();
    var INITIAL_CONTEXT_CACHE_MAX_SIZE = 1e4;
    var api = {};
    module.exports = api;
    api.process = async ({
      activeCtx,
      localCtx,
      options,
      propagate = true,
      overrideProtected = false,
      cycles = /* @__PURE__ */ new Set()
    }) => {
      if (_isObject(localCtx) && "@context" in localCtx && _isArray(localCtx["@context"])) {
        localCtx = localCtx["@context"];
      }
      const ctxs = _asArray(localCtx);
      if (ctxs.length === 0) {
        return activeCtx;
      }
      const events = [];
      const eventCaptureHandler = [
        ({ event, next }) => {
          events.push(event);
          next();
        }
      ];
      if (options.eventHandler) {
        eventCaptureHandler.push(options.eventHandler);
      }
      const originalOptions = options;
      options = { ...options, eventHandler: eventCaptureHandler };
      const resolved = await options.contextResolver.resolve({
        activeCtx,
        context: localCtx,
        documentLoader: options.documentLoader,
        base: options.base
      });
      if (_isObject(resolved[0].document) && typeof resolved[0].document["@propagate"] === "boolean") {
        propagate = resolved[0].document["@propagate"];
      }
      let rval = activeCtx;
      if (!propagate && !rval.previousContext) {
        rval = rval.clone();
        rval.previousContext = activeCtx;
      }
      for (const resolvedContext of resolved) {
        let { document: ctx } = resolvedContext;
        activeCtx = rval;
        if (ctx === null) {
          if (!overrideProtected && Object.keys(activeCtx.protected).length !== 0) {
            throw new JsonLdError(
              "Tried to nullify a context with protected terms outside of a term definition.",
              "jsonld.SyntaxError",
              { code: "invalid context nullification" }
            );
          }
          rval = activeCtx = api.getInitialContext(options).clone();
          continue;
        }
        const processed = resolvedContext.getProcessed(activeCtx);
        if (processed) {
          if (originalOptions.eventHandler) {
            for (const event of processed.events) {
              _handleEvent({ event, options: originalOptions });
            }
          }
          rval = activeCtx = processed.context;
          continue;
        }
        if (_isObject(ctx) && "@context" in ctx) {
          ctx = ctx["@context"];
        }
        if (!_isObject(ctx)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; @context must be an object.",
            "jsonld.SyntaxError",
            { code: "invalid local context", context: ctx }
          );
        }
        rval = rval.clone();
        const defined = /* @__PURE__ */ new Map();
        if ("@version" in ctx) {
          if (ctx["@version"] !== 1.1) {
            throw new JsonLdError(
              "Unsupported JSON-LD version: " + ctx["@version"],
              "jsonld.UnsupportedVersion",
              { code: "invalid @version value", context: ctx }
            );
          }
          if (activeCtx.processingMode && activeCtx.processingMode === "json-ld-1.0") {
            throw new JsonLdError(
              "@version: " + ctx["@version"] + " not compatible with " + activeCtx.processingMode,
              "jsonld.ProcessingModeConflict",
              { code: "processing mode conflict", context: ctx }
            );
          }
          rval.processingMode = "json-ld-1.1";
          rval["@version"] = ctx["@version"];
          defined.set("@version", true);
        }
        rval.processingMode = rval.processingMode || activeCtx.processingMode;
        if ("@base" in ctx) {
          let base = ctx["@base"];
          if (base === null || _isAbsoluteIri(base)) {
          } else if (_isRelativeIri(base)) {
            base = prependBase(rval["@base"], base);
          } else {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; the value of "@base" in a @context must be an absolute IRI, a relative IRI, or null.',
              "jsonld.SyntaxError",
              { code: "invalid base IRI", context: ctx }
            );
          }
          rval["@base"] = base;
          defined.set("@base", true);
        }
        if ("@vocab" in ctx) {
          const value = ctx["@vocab"];
          if (value === null) {
            delete rval["@vocab"];
          } else if (!_isString(value)) {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; the value of "@vocab" in a @context must be a string or null.',
              "jsonld.SyntaxError",
              { code: "invalid vocab mapping", context: ctx }
            );
          } else if (!_isAbsoluteIri(value) && api.processingMode(rval, 1)) {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; the value of "@vocab" in a @context must be an absolute IRI.',
              "jsonld.SyntaxError",
              { code: "invalid vocab mapping", context: ctx }
            );
          } else {
            const vocab = _expandIri(
              rval,
              value,
              { vocab: true, base: true },
              void 0,
              void 0,
              options
            );
            if (!_isAbsoluteIri(vocab)) {
              if (options.eventHandler) {
                _handleEvent({
                  event: {
                    type: ["JsonLdEvent"],
                    code: "relative @vocab reference",
                    level: "warning",
                    message: "Relative @vocab reference found.",
                    details: {
                      vocab
                    }
                  },
                  options
                });
              }
            }
            rval["@vocab"] = vocab;
          }
          defined.set("@vocab", true);
        }
        if ("@language" in ctx) {
          const value = ctx["@language"];
          if (value === null) {
            delete rval["@language"];
          } else if (!_isString(value)) {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; the value of "@language" in a @context must be a string or null.',
              "jsonld.SyntaxError",
              { code: "invalid default language", context: ctx }
            );
          } else {
            if (!value.match(REGEX_BCP47)) {
              if (options.eventHandler) {
                _handleEvent({
                  event: {
                    type: ["JsonLdEvent"],
                    code: "invalid @language value",
                    level: "warning",
                    message: "@language value must be valid BCP47.",
                    details: {
                      language: value
                    }
                  },
                  options
                });
              }
            }
            rval["@language"] = value.toLowerCase();
          }
          defined.set("@language", true);
        }
        if ("@direction" in ctx) {
          const value = ctx["@direction"];
          if (activeCtx.processingMode === "json-ld-1.0") {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; @direction not compatible with " + activeCtx.processingMode,
              "jsonld.SyntaxError",
              { code: "invalid context member", context: ctx }
            );
          }
          if (value === null) {
            delete rval["@direction"];
          } else if (value !== "ltr" && value !== "rtl") {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; the value of "@direction" in a @context must be null, "ltr", or "rtl".',
              "jsonld.SyntaxError",
              { code: "invalid base direction", context: ctx }
            );
          } else {
            rval["@direction"] = value;
          }
          defined.set("@direction", true);
        }
        if ("@propagate" in ctx) {
          const value = ctx["@propagate"];
          if (activeCtx.processingMode === "json-ld-1.0") {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; @propagate not compatible with " + activeCtx.processingMode,
              "jsonld.SyntaxError",
              { code: "invalid context entry", context: ctx }
            );
          }
          if (typeof value !== "boolean") {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; @propagate value must be a boolean.",
              "jsonld.SyntaxError",
              { code: "invalid @propagate value", context: localCtx }
            );
          }
          defined.set("@propagate", true);
        }
        if ("@import" in ctx) {
          const value = ctx["@import"];
          if (activeCtx.processingMode === "json-ld-1.0") {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; @import not compatible with " + activeCtx.processingMode,
              "jsonld.SyntaxError",
              { code: "invalid context entry", context: ctx }
            );
          }
          if (!_isString(value)) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; @import must be a string.",
              "jsonld.SyntaxError",
              { code: "invalid @import value", context: localCtx }
            );
          }
          const resolvedImport = await options.contextResolver.resolve({
            activeCtx,
            context: value,
            documentLoader: options.documentLoader,
            base: options.base
          });
          if (resolvedImport.length !== 1) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; @import must reference a single context.",
              "jsonld.SyntaxError",
              { code: "invalid remote context", context: localCtx }
            );
          }
          const processedImport = resolvedImport[0].getProcessed(activeCtx);
          if (processedImport) {
            ctx = processedImport;
          } else {
            const importCtx = resolvedImport[0].document;
            if ("@import" in importCtx) {
              throw new JsonLdError(
                "Invalid JSON-LD syntax: imported context must not include @import.",
                "jsonld.SyntaxError",
                { code: "invalid context entry", context: localCtx }
              );
            }
            for (const key in importCtx) {
              if (!ctx.hasOwnProperty(key)) {
                ctx[key] = importCtx[key];
              }
            }
            resolvedImport[0].setProcessed(activeCtx, ctx);
          }
          defined.set("@import", true);
        }
        defined.set("@protected", ctx["@protected"] || false);
        for (const key in ctx) {
          api.createTermDefinition({
            activeCtx: rval,
            localCtx: ctx,
            term: key,
            defined,
            options,
            overrideProtected
          });
          if (_isObject(ctx[key]) && "@context" in ctx[key]) {
            const keyCtx = ctx[key]["@context"];
            let process2 = true;
            if (_isString(keyCtx)) {
              const url = prependBase(options.base, keyCtx);
              if (cycles.has(url)) {
                process2 = false;
              } else {
                cycles.add(url);
              }
            }
            if (process2) {
              try {
                await api.process({
                  activeCtx: rval.clone(),
                  localCtx: ctx[key]["@context"],
                  overrideProtected: true,
                  options,
                  cycles
                });
              } catch (e) {
                throw new JsonLdError(
                  "Invalid JSON-LD syntax; invalid scoped context.",
                  "jsonld.SyntaxError",
                  {
                    code: "invalid scoped context",
                    context: ctx[key]["@context"],
                    term: key
                  }
                );
              }
            }
          }
        }
        resolvedContext.setProcessed(activeCtx, {
          context: rval,
          events
        });
      }
      return rval;
    };
    api.createTermDefinition = ({
      activeCtx,
      localCtx,
      term,
      defined,
      options,
      overrideProtected = false
    }) => {
      if (defined.has(term)) {
        if (defined.get(term)) {
          return;
        }
        throw new JsonLdError(
          "Cyclical context definition detected.",
          "jsonld.CyclicalContext",
          { code: "cyclic IRI mapping", context: localCtx, term }
        );
      }
      defined.set(term, false);
      let value;
      if (localCtx.hasOwnProperty(term)) {
        value = localCtx[term];
      }
      if (term === "@type" && _isObject(value) && (value["@container"] || "@set") === "@set" && api.processingMode(activeCtx, 1.1)) {
        const validKeys2 = ["@container", "@id", "@protected"];
        const keys = Object.keys(value);
        if (keys.length === 0 || keys.some((k) => !validKeys2.includes(k))) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; keywords cannot be overridden.",
            "jsonld.SyntaxError",
            { code: "keyword redefinition", context: localCtx, term }
          );
        }
      } else if (api.isKeyword(term)) {
        throw new JsonLdError(
          "Invalid JSON-LD syntax; keywords cannot be overridden.",
          "jsonld.SyntaxError",
          { code: "keyword redefinition", context: localCtx, term }
        );
      } else if (term.match(REGEX_KEYWORD)) {
        if (options.eventHandler) {
          _handleEvent({
            event: {
              type: ["JsonLdEvent"],
              code: "reserved term",
              level: "warning",
              message: 'Terms beginning with "@" are reserved for future use and dropped.',
              details: {
                term
              }
            },
            options
          });
        }
        return;
      } else if (term === "") {
        throw new JsonLdError(
          "Invalid JSON-LD syntax; a term cannot be an empty string.",
          "jsonld.SyntaxError",
          { code: "invalid term definition", context: localCtx }
        );
      }
      const previousMapping = activeCtx.mappings.get(term);
      if (activeCtx.mappings.has(term)) {
        activeCtx.mappings.delete(term);
      }
      let simpleTerm = false;
      if (_isString(value) || value === null) {
        simpleTerm = true;
        value = { "@id": value };
      }
      if (!_isObject(value)) {
        throw new JsonLdError(
          "Invalid JSON-LD syntax; @context term values must be strings or objects.",
          "jsonld.SyntaxError",
          { code: "invalid term definition", context: localCtx }
        );
      }
      const mapping = {};
      activeCtx.mappings.set(term, mapping);
      mapping.reverse = false;
      const validKeys = ["@container", "@id", "@language", "@reverse", "@type"];
      if (api.processingMode(activeCtx, 1.1)) {
        validKeys.push(
          "@context",
          "@direction",
          "@index",
          "@nest",
          "@prefix",
          "@protected"
        );
      }
      for (const kw in value) {
        if (!validKeys.includes(kw)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; a term definition must not contain " + kw,
            "jsonld.SyntaxError",
            { code: "invalid term definition", context: localCtx }
          );
        }
      }
      const colon = term.indexOf(":");
      mapping._termHasColon = colon > 0;
      if ("@reverse" in value) {
        if ("@id" in value) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; a @reverse term definition must not contain @id.",
            "jsonld.SyntaxError",
            { code: "invalid reverse property", context: localCtx }
          );
        }
        if ("@nest" in value) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; a @reverse term definition must not contain @nest.",
            "jsonld.SyntaxError",
            { code: "invalid reverse property", context: localCtx }
          );
        }
        const reverse = value["@reverse"];
        if (!_isString(reverse)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; a @context @reverse value must be a string.",
            "jsonld.SyntaxError",
            { code: "invalid IRI mapping", context: localCtx }
          );
        }
        if (reverse.match(REGEX_KEYWORD)) {
          if (options.eventHandler) {
            _handleEvent({
              event: {
                type: ["JsonLdEvent"],
                code: "reserved @reverse value",
                level: "warning",
                message: '@reverse values beginning with "@" are reserved for future use and dropped.',
                details: {
                  reverse
                }
              },
              options
            });
          }
          if (previousMapping) {
            activeCtx.mappings.set(term, previousMapping);
          } else {
            activeCtx.mappings.delete(term);
          }
          return;
        }
        const id2 = _expandIri(
          activeCtx,
          reverse,
          { vocab: true, base: false },
          localCtx,
          defined,
          options
        );
        if (!_isAbsoluteIri(id2)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; a @context @reverse value must be an absolute IRI or a blank node identifier.",
            "jsonld.SyntaxError",
            { code: "invalid IRI mapping", context: localCtx }
          );
        }
        mapping["@id"] = id2;
        mapping.reverse = true;
      } else if ("@id" in value) {
        let id2 = value["@id"];
        if (id2 && !_isString(id2)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; a @context @id value must be an array of strings or a string.",
            "jsonld.SyntaxError",
            { code: "invalid IRI mapping", context: localCtx }
          );
        }
        if (id2 === null) {
          mapping["@id"] = null;
        } else if (!api.isKeyword(id2) && id2.match(REGEX_KEYWORD)) {
          if (options.eventHandler) {
            _handleEvent({
              event: {
                type: ["JsonLdEvent"],
                code: "reserved @id value",
                level: "warning",
                message: '@id values beginning with "@" are reserved for future use and dropped.',
                details: {
                  id: id2
                }
              },
              options
            });
          }
          if (previousMapping) {
            activeCtx.mappings.set(term, previousMapping);
          } else {
            activeCtx.mappings.delete(term);
          }
          return;
        } else if (id2 !== term) {
          id2 = _expandIri(
            activeCtx,
            id2,
            { vocab: true, base: false },
            localCtx,
            defined,
            options
          );
          if (!_isAbsoluteIri(id2) && !api.isKeyword(id2)) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; a @context @id value must be an absolute IRI, a blank node identifier, or a keyword.",
              "jsonld.SyntaxError",
              { code: "invalid IRI mapping", context: localCtx }
            );
          }
          if (term.match(/(?::[^:])|\//)) {
            const termDefined = new Map(defined).set(term, true);
            const termIri = _expandIri(
              activeCtx,
              term,
              { vocab: true, base: false },
              localCtx,
              termDefined,
              options
            );
            if (termIri !== id2) {
              throw new JsonLdError(
                "Invalid JSON-LD syntax; term in form of IRI must expand to definition.",
                "jsonld.SyntaxError",
                { code: "invalid IRI mapping", context: localCtx }
              );
            }
          }
          mapping["@id"] = id2;
          mapping._prefix = simpleTerm && !mapping._termHasColon && id2.match(/[:\/\?#\[\]@]$/) !== null;
        }
      }
      if (!("@id" in mapping)) {
        if (mapping._termHasColon) {
          const prefix = term.substr(0, colon);
          if (localCtx.hasOwnProperty(prefix)) {
            api.createTermDefinition({
              activeCtx,
              localCtx,
              term: prefix,
              defined,
              options
            });
          }
          if (activeCtx.mappings.has(prefix)) {
            const suffix = term.substr(colon + 1);
            mapping["@id"] = activeCtx.mappings.get(prefix)["@id"] + suffix;
          } else {
            mapping["@id"] = term;
          }
        } else if (term === "@type") {
          mapping["@id"] = term;
        } else {
          if (!("@vocab" in activeCtx)) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; @context terms must define an @id.",
              "jsonld.SyntaxError",
              { code: "invalid IRI mapping", context: localCtx, term }
            );
          }
          mapping["@id"] = activeCtx["@vocab"] + term;
        }
      }
      if (value["@protected"] === true || defined.get("@protected") === true && value["@protected"] !== false) {
        activeCtx.protected[term] = true;
        mapping.protected = true;
      }
      defined.set(term, true);
      if ("@type" in value) {
        let type = value["@type"];
        if (!_isString(type)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; an @context @type value must be a string.",
            "jsonld.SyntaxError",
            { code: "invalid type mapping", context: localCtx }
          );
        }
        if (type === "@json" || type === "@none") {
          if (api.processingMode(activeCtx, 1)) {
            throw new JsonLdError(
              `Invalid JSON-LD syntax; an @context @type value must not be "${type}" in JSON-LD 1.0 mode.`,
              "jsonld.SyntaxError",
              { code: "invalid type mapping", context: localCtx }
            );
          }
        } else if (type !== "@id" && type !== "@vocab") {
          type = _expandIri(
            activeCtx,
            type,
            { vocab: true, base: false },
            localCtx,
            defined,
            options
          );
          if (!_isAbsoluteIri(type)) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; an @context @type value must be an absolute IRI.",
              "jsonld.SyntaxError",
              { code: "invalid type mapping", context: localCtx }
            );
          }
          if (type.indexOf("_:") === 0) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; an @context @type value must be an IRI, not a blank node identifier.",
              "jsonld.SyntaxError",
              { code: "invalid type mapping", context: localCtx }
            );
          }
        }
        mapping["@type"] = type;
      }
      if ("@container" in value) {
        const container = _isString(value["@container"]) ? [value["@container"]] : value["@container"] || [];
        const validContainers = ["@list", "@set", "@index", "@language"];
        let isValid = true;
        const hasSet = container.includes("@set");
        if (api.processingMode(activeCtx, 1.1)) {
          validContainers.push("@graph", "@id", "@type");
          if (container.includes("@list")) {
            if (container.length !== 1) {
              throw new JsonLdError(
                "Invalid JSON-LD syntax; @context @container with @list must have no other values",
                "jsonld.SyntaxError",
                { code: "invalid container mapping", context: localCtx }
              );
            }
          } else if (container.includes("@graph")) {
            if (container.some((key) => key !== "@graph" && key !== "@id" && key !== "@index" && key !== "@set")) {
              throw new JsonLdError(
                "Invalid JSON-LD syntax; @context @container with @graph must have no other values other than @id, @index, and @set",
                "jsonld.SyntaxError",
                { code: "invalid container mapping", context: localCtx }
              );
            }
          } else {
            isValid &= container.length <= (hasSet ? 2 : 1);
          }
          if (container.includes("@type")) {
            mapping["@type"] = mapping["@type"] || "@id";
            if (!["@id", "@vocab"].includes(mapping["@type"])) {
              throw new JsonLdError(
                "Invalid JSON-LD syntax; container: @type requires @type to be @id or @vocab.",
                "jsonld.SyntaxError",
                { code: "invalid type mapping", context: localCtx }
              );
            }
          }
        } else {
          isValid &= !_isArray(value["@container"]);
          isValid &= container.length <= 1;
        }
        isValid &= container.every((c) => validContainers.includes(c));
        isValid &= !(hasSet && container.includes("@list"));
        if (!isValid) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; @context @container value must be one of the following: " + validContainers.join(", "),
            "jsonld.SyntaxError",
            { code: "invalid container mapping", context: localCtx }
          );
        }
        if (mapping.reverse && !container.every((c) => ["@index", "@set"].includes(c))) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; @context @container value for a @reverse type definition must be @index or @set.",
            "jsonld.SyntaxError",
            { code: "invalid reverse property", context: localCtx }
          );
        }
        mapping["@container"] = container;
      }
      if ("@index" in value) {
        if (!("@container" in value) || !mapping["@container"].includes("@index")) {
          throw new JsonLdError(
            `Invalid JSON-LD syntax; @index without @index in @container: "${value["@index"]}" on term "${term}".`,
            "jsonld.SyntaxError",
            { code: "invalid term definition", context: localCtx }
          );
        }
        if (!_isString(value["@index"]) || value["@index"].indexOf("@") === 0) {
          throw new JsonLdError(
            `Invalid JSON-LD syntax; @index must expand to an IRI: "${value["@index"]}" on term "${term}".`,
            "jsonld.SyntaxError",
            { code: "invalid term definition", context: localCtx }
          );
        }
        mapping["@index"] = value["@index"];
      }
      if ("@context" in value) {
        mapping["@context"] = value["@context"];
      }
      if ("@language" in value && !("@type" in value)) {
        let language = value["@language"];
        if (language !== null && !_isString(language)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; @context @language value must be a string or null.",
            "jsonld.SyntaxError",
            { code: "invalid language mapping", context: localCtx }
          );
        }
        if (language !== null) {
          language = language.toLowerCase();
        }
        mapping["@language"] = language;
      }
      if ("@prefix" in value) {
        if (term.match(/:|\//)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; @context @prefix used on a compact IRI term",
            "jsonld.SyntaxError",
            { code: "invalid term definition", context: localCtx }
          );
        }
        if (api.isKeyword(mapping["@id"])) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; keywords may not be used as prefixes",
            "jsonld.SyntaxError",
            { code: "invalid term definition", context: localCtx }
          );
        }
        if (typeof value["@prefix"] === "boolean") {
          mapping._prefix = value["@prefix"] === true;
        } else {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; @context value for @prefix must be boolean",
            "jsonld.SyntaxError",
            { code: "invalid @prefix value", context: localCtx }
          );
        }
      }
      if ("@direction" in value) {
        const direction = value["@direction"];
        if (direction !== null && direction !== "ltr" && direction !== "rtl") {
          throw new JsonLdError(
            'Invalid JSON-LD syntax; @direction value must be null, "ltr", or "rtl".',
            "jsonld.SyntaxError",
            { code: "invalid base direction", context: localCtx }
          );
        }
        mapping["@direction"] = direction;
      }
      if ("@nest" in value) {
        const nest = value["@nest"];
        if (!_isString(nest) || nest !== "@nest" && nest.indexOf("@") === 0) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; @context @nest value must be a string which is not a keyword other than @nest.",
            "jsonld.SyntaxError",
            { code: "invalid @nest value", context: localCtx }
          );
        }
        mapping["@nest"] = nest;
      }
      const id = mapping["@id"];
      if (id === "@context" || id === "@preserve") {
        throw new JsonLdError(
          "Invalid JSON-LD syntax; @context and @preserve cannot be aliased.",
          "jsonld.SyntaxError",
          { code: "invalid keyword alias", context: localCtx }
        );
      }
      if (previousMapping && previousMapping.protected && !overrideProtected) {
        activeCtx.protected[term] = true;
        mapping.protected = true;
        if (!_deepCompare(previousMapping, mapping)) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; tried to redefine a protected term.",
            "jsonld.SyntaxError",
            { code: "protected term redefinition", context: localCtx, term }
          );
        }
      }
    };
    api.expandIri = (activeCtx, value, relativeTo, options) => {
      return _expandIri(
        activeCtx,
        value,
        relativeTo,
        void 0,
        void 0,
        options
      );
    };
    function _expandIri(activeCtx, value, relativeTo, localCtx, defined, options) {
      if (value === null || !_isString(value) || api.isKeyword(value)) {
        return value;
      }
      if (value.match(REGEX_KEYWORD)) {
        return null;
      }
      if (localCtx && localCtx.hasOwnProperty(value) && defined.get(value) !== true) {
        api.createTermDefinition({
          activeCtx,
          localCtx,
          term: value,
          defined,
          options
        });
      }
      relativeTo = relativeTo || {};
      if (relativeTo.vocab) {
        const mapping = activeCtx.mappings.get(value);
        if (mapping === null) {
          return null;
        }
        if (_isObject(mapping) && "@id" in mapping) {
          return mapping["@id"];
        }
      }
      const colon = value.indexOf(":");
      if (colon > 0) {
        const prefix = value.substr(0, colon);
        const suffix = value.substr(colon + 1);
        if (prefix === "_" || suffix.indexOf("//") === 0) {
          return value;
        }
        if (localCtx && localCtx.hasOwnProperty(prefix)) {
          api.createTermDefinition({
            activeCtx,
            localCtx,
            term: prefix,
            defined,
            options
          });
        }
        const mapping = activeCtx.mappings.get(prefix);
        if (mapping && mapping._prefix) {
          return mapping["@id"] + suffix;
        }
        if (_isAbsoluteIri(value)) {
          return value;
        }
      }
      if (relativeTo.vocab && "@vocab" in activeCtx) {
        const prependedResult = activeCtx["@vocab"] + value;
        value = prependedResult;
      } else if (relativeTo.base) {
        let prependedResult;
        let base;
        if ("@base" in activeCtx) {
          if (activeCtx["@base"]) {
            base = prependBase(options.base, activeCtx["@base"]);
            prependedResult = prependBase(base, value);
          } else {
            base = activeCtx["@base"];
            prependedResult = value;
          }
        } else {
          base = options.base;
          prependedResult = prependBase(options.base, value);
        }
        value = prependedResult;
      }
      return value;
    }
    api.getInitialContext = (options) => {
      const key = JSON.stringify({ processingMode: options.processingMode });
      const cached = INITIAL_CONTEXT_CACHE.get(key);
      if (cached) {
        return cached;
      }
      const initialContext = {
        processingMode: options.processingMode,
        mappings: /* @__PURE__ */ new Map(),
        inverse: null,
        getInverse: _createInverseContext,
        clone: _cloneActiveContext,
        revertToPreviousContext: _revertToPreviousContext,
        protected: {}
      };
      if (INITIAL_CONTEXT_CACHE.size === INITIAL_CONTEXT_CACHE_MAX_SIZE) {
        INITIAL_CONTEXT_CACHE.clear();
      }
      INITIAL_CONTEXT_CACHE.set(key, initialContext);
      return initialContext;
      function _createInverseContext() {
        const activeCtx = this;
        if (activeCtx.inverse) {
          return activeCtx.inverse;
        }
        const inverse = activeCtx.inverse = {};
        const fastCurieMap = activeCtx.fastCurieMap = {};
        const irisToTerms = {};
        const defaultLanguage = (activeCtx["@language"] || "@none").toLowerCase();
        const defaultDirection = activeCtx["@direction"];
        const mappings = activeCtx.mappings;
        const terms = [...mappings.keys()].sort(_compareShortestLeast);
        for (const term of terms) {
          const mapping = mappings.get(term);
          if (mapping === null) {
            continue;
          }
          let container = mapping["@container"] || "@none";
          container = [].concat(container).sort().join("");
          if (mapping["@id"] === null) {
            continue;
          }
          const ids = _asArray(mapping["@id"]);
          for (const iri of ids) {
            let entry = inverse[iri];
            const isKeyword = api.isKeyword(iri);
            if (!entry) {
              inverse[iri] = entry = {};
              if (!isKeyword && !mapping._termHasColon) {
                irisToTerms[iri] = [term];
                const fastCurieEntry = { iri, terms: irisToTerms[iri] };
                if (iri[0] in fastCurieMap) {
                  fastCurieMap[iri[0]].push(fastCurieEntry);
                } else {
                  fastCurieMap[iri[0]] = [fastCurieEntry];
                }
              }
            } else if (!isKeyword && !mapping._termHasColon) {
              irisToTerms[iri].push(term);
            }
            if (!entry[container]) {
              entry[container] = {
                "@language": {},
                "@type": {},
                "@any": {}
              };
            }
            entry = entry[container];
            _addPreferredTerm(term, entry["@any"], "@none");
            if (mapping.reverse) {
              _addPreferredTerm(term, entry["@type"], "@reverse");
            } else if (mapping["@type"] === "@none") {
              _addPreferredTerm(term, entry["@any"], "@none");
              _addPreferredTerm(term, entry["@language"], "@none");
              _addPreferredTerm(term, entry["@type"], "@none");
            } else if ("@type" in mapping) {
              _addPreferredTerm(term, entry["@type"], mapping["@type"]);
            } else if ("@language" in mapping && "@direction" in mapping) {
              const language = mapping["@language"];
              const direction = mapping["@direction"];
              if (language && direction) {
                _addPreferredTerm(
                  term,
                  entry["@language"],
                  `${language}_${direction}`.toLowerCase()
                );
              } else if (language) {
                _addPreferredTerm(term, entry["@language"], language.toLowerCase());
              } else if (direction) {
                _addPreferredTerm(term, entry["@language"], `_${direction}`);
              } else {
                _addPreferredTerm(term, entry["@language"], "@null");
              }
            } else if ("@language" in mapping) {
              _addPreferredTerm(
                term,
                entry["@language"],
                (mapping["@language"] || "@null").toLowerCase()
              );
            } else if ("@direction" in mapping) {
              if (mapping["@direction"]) {
                _addPreferredTerm(
                  term,
                  entry["@language"],
                  `_${mapping["@direction"]}`
                );
              } else {
                _addPreferredTerm(term, entry["@language"], "@none");
              }
            } else if (defaultDirection) {
              _addPreferredTerm(term, entry["@language"], `_${defaultDirection}`);
              _addPreferredTerm(term, entry["@language"], "@none");
              _addPreferredTerm(term, entry["@type"], "@none");
            } else {
              _addPreferredTerm(term, entry["@language"], defaultLanguage);
              _addPreferredTerm(term, entry["@language"], "@none");
              _addPreferredTerm(term, entry["@type"], "@none");
            }
          }
        }
        for (const key2 in fastCurieMap) {
          _buildIriMap(fastCurieMap, key2, 1);
        }
        return inverse;
      }
      function _buildIriMap(iriMap, key2, idx) {
        const entries = iriMap[key2];
        const next = iriMap[key2] = {};
        let iri;
        let letter;
        for (const entry of entries) {
          iri = entry.iri;
          if (idx >= iri.length) {
            letter = "";
          } else {
            letter = iri[idx];
          }
          if (letter in next) {
            next[letter].push(entry);
          } else {
            next[letter] = [entry];
          }
        }
        for (const key3 in next) {
          if (key3 === "") {
            continue;
          }
          _buildIriMap(next, key3, idx + 1);
        }
      }
      function _addPreferredTerm(term, entry, typeOrLanguageValue) {
        if (!entry.hasOwnProperty(typeOrLanguageValue)) {
          entry[typeOrLanguageValue] = term;
        }
      }
      function _cloneActiveContext() {
        const child = {};
        child.mappings = util.clone(this.mappings);
        child.clone = this.clone;
        child.inverse = null;
        child.getInverse = this.getInverse;
        child.protected = util.clone(this.protected);
        if (this.previousContext) {
          child.previousContext = this.previousContext.clone();
        }
        child.revertToPreviousContext = this.revertToPreviousContext;
        if ("@base" in this) {
          child["@base"] = this["@base"];
        }
        if ("@language" in this) {
          child["@language"] = this["@language"];
        }
        if ("@vocab" in this) {
          child["@vocab"] = this["@vocab"];
        }
        return child;
      }
      function _revertToPreviousContext() {
        if (!this.previousContext) {
          return this;
        }
        return this.previousContext.clone();
      }
    };
    api.getContextValue = (ctx, key, type) => {
      if (key === null) {
        if (type === "@context") {
          return void 0;
        }
        return null;
      }
      if (ctx.mappings.has(key)) {
        const entry = ctx.mappings.get(key);
        if (_isUndefined(type)) {
          return entry;
        }
        if (entry.hasOwnProperty(type)) {
          return entry[type];
        }
      }
      if (type === "@language" && type in ctx) {
        return ctx[type];
      }
      if (type === "@direction" && type in ctx) {
        return ctx[type];
      }
      if (type === "@context") {
        return void 0;
      }
      return null;
    };
    api.processingMode = (activeCtx, version) => {
      if (version.toString() >= "1.1") {
        return !activeCtx.processingMode || activeCtx.processingMode >= "json-ld-" + version.toString();
      } else {
        return activeCtx.processingMode === "json-ld-1.0";
      }
    };
    api.isKeyword = (v) => {
      if (!_isString(v) || v[0] !== "@") {
        return false;
      }
      switch (v) {
        case "@base":
        case "@container":
        case "@context":
        case "@default":
        case "@direction":
        case "@embed":
        case "@explicit":
        case "@graph":
        case "@id":
        case "@included":
        case "@index":
        case "@json":
        case "@language":
        case "@list":
        case "@nest":
        case "@none":
        case "@omitDefault":
        case "@prefix":
        case "@preserve":
        case "@protected":
        case "@requireAll":
        case "@reverse":
        case "@set":
        case "@type":
        case "@value":
        case "@version":
        case "@vocab":
          return true;
      }
      return false;
    };
    function _deepCompare(x1, x2) {
      if (!(x1 && typeof x1 === "object") || !(x2 && typeof x2 === "object")) {
        return x1 === x2;
      }
      const x1Array = Array.isArray(x1);
      if (x1Array !== Array.isArray(x2)) {
        return false;
      }
      if (x1Array) {
        if (x1.length !== x2.length) {
          return false;
        }
        for (let i = 0; i < x1.length; ++i) {
          if (!_deepCompare(x1[i], x2[i])) {
            return false;
          }
        }
        return true;
      }
      const k1s = Object.keys(x1);
      const k2s = Object.keys(x2);
      if (k1s.length !== k2s.length) {
        return false;
      }
      for (const k1 in x1) {
        let v1 = x1[k1];
        let v2 = x2[k1];
        if (k1 === "@container") {
          if (Array.isArray(v1) && Array.isArray(v2)) {
            v1 = v1.slice().sort();
            v2 = v2.slice().sort();
          }
        }
        if (!_deepCompare(v1, v2)) {
          return false;
        }
      }
      return true;
    }
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/expand.js
var require_expand = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/expand.js"(exports, module) {
    "use strict";
    var JsonLdError = require_JsonLdError();
    var {
      isArray: _isArray,
      isObject: _isObject,
      isEmptyObject: _isEmptyObject,
      isString: _isString,
      isUndefined: _isUndefined
    } = require_types();
    var {
      isList: _isList,
      isValue: _isValue,
      isGraph: _isGraph,
      isSubject: _isSubject
    } = require_graphTypes();
    var {
      expandIri: _expandIri,
      getContextValue: _getContextValue,
      isKeyword: _isKeyword,
      process: _processContext,
      processingMode: _processingMode
    } = require_context();
    var {
      isAbsolute: _isAbsoluteIri
    } = require_url();
    var {
      REGEX_BCP47,
      REGEX_KEYWORD,
      addValue: _addValue,
      asArray: _asArray,
      getValues: _getValues,
      validateTypeValue: _validateTypeValue
    } = require_util();
    var {
      handleEvent: _handleEvent
    } = require_events();
    var api = {};
    module.exports = api;
    api.expand = async ({
      activeCtx,
      activeProperty = null,
      element,
      options = {},
      insideList = false,
      insideIndex = false,
      typeScopedContext = null
    }) => {
      if (element === null || element === void 0) {
        return null;
      }
      if (activeProperty === "@default") {
        options = Object.assign({}, options, { isFrame: false });
      }
      if (!_isArray(element) && !_isObject(element)) {
        if (!insideList && (activeProperty === null || _expandIri(
          activeCtx,
          activeProperty,
          { vocab: true },
          options
        ) === "@graph")) {
          if (options.eventHandler) {
            _handleEvent({
              event: {
                type: ["JsonLdEvent"],
                code: "free-floating scalar",
                level: "warning",
                message: "Dropping free-floating scalar not in a list.",
                details: {
                  value: element
                  //activeProperty
                  //insideList
                }
              },
              options
            });
          }
          return null;
        }
        return _expandValue({ activeCtx, activeProperty, value: element, options });
      }
      if (_isArray(element)) {
        let rval2 = [];
        const container = _getContextValue(
          activeCtx,
          activeProperty,
          "@container"
        ) || [];
        insideList = insideList || container.includes("@list");
        for (let i = 0; i < element.length; ++i) {
          let e = await api.expand({
            activeCtx,
            activeProperty,
            element: element[i],
            options,
            insideIndex,
            typeScopedContext
          });
          if (insideList && _isArray(e)) {
            e = { "@list": e };
          }
          if (e === null) {
            continue;
          }
          if (_isArray(e)) {
            rval2 = rval2.concat(e);
          } else {
            rval2.push(e);
          }
        }
        return rval2;
      }
      const expandedActiveProperty = _expandIri(
        activeCtx,
        activeProperty,
        { vocab: true },
        options
      );
      const propertyScopedCtx = _getContextValue(activeCtx, activeProperty, "@context");
      typeScopedContext = typeScopedContext || (activeCtx.previousContext ? activeCtx : null);
      let keys = Object.keys(element).sort();
      let mustRevert = !insideIndex;
      if (mustRevert && typeScopedContext && keys.length <= 2 && !keys.includes("@context")) {
        for (const key of keys) {
          const expandedProperty = _expandIri(
            typeScopedContext,
            key,
            { vocab: true },
            options
          );
          if (expandedProperty === "@value") {
            mustRevert = false;
            activeCtx = typeScopedContext;
            break;
          }
          if (expandedProperty === "@id" && keys.length === 1) {
            mustRevert = false;
            break;
          }
        }
      }
      if (mustRevert) {
        activeCtx = activeCtx.revertToPreviousContext();
      }
      if (!_isUndefined(propertyScopedCtx)) {
        activeCtx = await _processContext({
          activeCtx,
          localCtx: propertyScopedCtx,
          propagate: true,
          overrideProtected: true,
          options
        });
      }
      if ("@context" in element) {
        activeCtx = await _processContext(
          { activeCtx, localCtx: element["@context"], options }
        );
      }
      typeScopedContext = activeCtx;
      let typeKey = null;
      for (const key of keys) {
        const expandedProperty = _expandIri(activeCtx, key, { vocab: true }, options);
        if (expandedProperty === "@type") {
          typeKey = typeKey || key;
          const value = element[key];
          const types = Array.isArray(value) ? value.length > 1 ? value.slice().sort() : value : [value];
          for (const type of types) {
            const ctx = _getContextValue(typeScopedContext, type, "@context");
            if (!_isUndefined(ctx)) {
              activeCtx = await _processContext({
                activeCtx,
                localCtx: ctx,
                options,
                propagate: false
              });
            }
          }
        }
      }
      let rval = {};
      await _expandObject({
        activeCtx,
        activeProperty,
        expandedActiveProperty,
        element,
        expandedParent: rval,
        options,
        insideList,
        typeKey,
        typeScopedContext
      });
      keys = Object.keys(rval);
      let count = keys.length;
      if ("@value" in rval) {
        if ("@type" in rval && ("@language" in rval || "@direction" in rval)) {
          throw new JsonLdError(
            'Invalid JSON-LD syntax; an element containing "@value" may not contain both "@type" and either "@language" or "@direction".',
            "jsonld.SyntaxError",
            { code: "invalid value object", element: rval }
          );
        }
        let validCount = count - 1;
        if ("@type" in rval) {
          validCount -= 1;
        }
        if ("@index" in rval) {
          validCount -= 1;
        }
        if ("@language" in rval) {
          validCount -= 1;
        }
        if ("@direction" in rval) {
          validCount -= 1;
        }
        if (validCount !== 0) {
          throw new JsonLdError(
            'Invalid JSON-LD syntax; an element containing "@value" may only have an "@index" property and either "@type" or either or both "@language" or "@direction".',
            "jsonld.SyntaxError",
            { code: "invalid value object", element: rval }
          );
        }
        const values = rval["@value"] === null ? [] : _asArray(rval["@value"]);
        const types = _getValues(rval, "@type");
        if (_processingMode(activeCtx, 1.1) && types.includes("@json") && types.length === 1) {
        } else if (values.length === 0) {
          if (options.eventHandler) {
            _handleEvent({
              event: {
                type: ["JsonLdEvent"],
                code: "null @value value",
                level: "warning",
                message: "Dropping null @value value.",
                details: {
                  value: rval
                }
              },
              options
            });
          }
          rval = null;
        } else if (!values.every((v) => _isString(v) || _isEmptyObject(v)) && "@language" in rval) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; only strings may be language-tagged.",
            "jsonld.SyntaxError",
            { code: "invalid language-tagged value", element: rval }
          );
        } else if (!types.every((t) => _isAbsoluteIri(t) && !(_isString(t) && t.indexOf("_:") === 0) || _isEmptyObject(t))) {
          throw new JsonLdError(
            'Invalid JSON-LD syntax; an element containing "@value" and "@type" must have an absolute IRI for the value of "@type".',
            "jsonld.SyntaxError",
            { code: "invalid typed value", element: rval }
          );
        }
      } else if ("@type" in rval && !_isArray(rval["@type"])) {
        rval["@type"] = [rval["@type"]];
      } else if ("@set" in rval || "@list" in rval) {
        if (count > 1 && !(count === 2 && "@index" in rval)) {
          throw new JsonLdError(
            'Invalid JSON-LD syntax; if an element has the property "@set" or "@list", then it can have at most one other property that is "@index".',
            "jsonld.SyntaxError",
            { code: "invalid set or list object", element: rval }
          );
        }
        if ("@set" in rval) {
          rval = rval["@set"];
          keys = Object.keys(rval);
          count = keys.length;
        }
      } else if (count === 1 && "@language" in rval) {
        if (options.eventHandler) {
          _handleEvent({
            event: {
              type: ["JsonLdEvent"],
              code: "object with only @language",
              level: "warning",
              message: "Dropping object with only @language.",
              details: {
                value: rval
              }
            },
            options
          });
        }
        rval = null;
      }
      if (_isObject(rval) && !options.keepFreeFloatingNodes && !insideList && (activeProperty === null || expandedActiveProperty === "@graph" || (_getContextValue(activeCtx, activeProperty, "@container") || []).includes("@graph"))) {
        rval = _dropUnsafeObject({ value: rval, count, options });
      }
      return rval;
    };
    function _dropUnsafeObject({
      value,
      count,
      options
    }) {
      if (count === 0 || "@value" in value || "@list" in value || count === 1 && "@id" in value) {
        if (options.eventHandler) {
          let code;
          let message;
          if (count === 0) {
            code = "empty object";
            message = "Dropping empty object.";
          } else if ("@value" in value) {
            code = "object with only @value";
            message = "Dropping object with only @value.";
          } else if ("@list" in value) {
            code = "object with only @list";
            message = "Dropping object with only @list.";
          } else if (count === 1 && "@id" in value) {
            code = "object with only @id";
            message = "Dropping object with only @id.";
          }
          _handleEvent({
            event: {
              type: ["JsonLdEvent"],
              code,
              level: "warning",
              message,
              details: {
                value
              }
            },
            options
          });
        }
        return null;
      }
      return value;
    }
    async function _expandObject({
      activeCtx,
      activeProperty,
      expandedActiveProperty,
      element,
      expandedParent,
      options = {},
      insideList,
      typeKey,
      typeScopedContext
    }) {
      const keys = Object.keys(element).sort();
      const nests = [];
      let unexpandedValue;
      const isJsonType = element[typeKey] && _expandIri(
        activeCtx,
        _isArray(element[typeKey]) ? element[typeKey][0] : element[typeKey],
        { vocab: true },
        {
          ...options,
          typeExpansion: true
        }
      ) === "@json";
      for (const key of keys) {
        let value = element[key];
        let expandedValue;
        if (key === "@context") {
          continue;
        }
        const expandedProperty = _expandIri(activeCtx, key, { vocab: true }, options);
        if (expandedProperty === null || !(_isAbsoluteIri(expandedProperty) || _isKeyword(expandedProperty))) {
          if (options.eventHandler) {
            _handleEvent({
              event: {
                type: ["JsonLdEvent"],
                code: "invalid property",
                level: "warning",
                message: "Dropping property that did not expand into an absolute IRI or keyword.",
                details: {
                  property: key,
                  expandedProperty
                }
              },
              options
            });
          }
          continue;
        }
        if (_isKeyword(expandedProperty)) {
          if (expandedActiveProperty === "@reverse") {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; a keyword cannot be used as a @reverse property.",
              "jsonld.SyntaxError",
              { code: "invalid reverse property map", value }
            );
          }
          if (expandedProperty in expandedParent && expandedProperty !== "@included" && expandedProperty !== "@type") {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; colliding keywords detected.",
              "jsonld.SyntaxError",
              { code: "colliding keywords", keyword: expandedProperty }
            );
          }
        }
        if (expandedProperty === "@id") {
          if (!_isString(value)) {
            if (!options.isFrame) {
              throw new JsonLdError(
                'Invalid JSON-LD syntax; "@id" value must a string.',
                "jsonld.SyntaxError",
                { code: "invalid @id value", value }
              );
            }
            if (_isObject(value)) {
              if (!_isEmptyObject(value)) {
                throw new JsonLdError(
                  'Invalid JSON-LD syntax; "@id" value an empty object or array of strings, if framing',
                  "jsonld.SyntaxError",
                  { code: "invalid @id value", value }
                );
              }
            } else if (_isArray(value)) {
              if (!value.every((v) => _isString(v))) {
                throw new JsonLdError(
                  'Invalid JSON-LD syntax; "@id" value an empty object or array of strings, if framing',
                  "jsonld.SyntaxError",
                  { code: "invalid @id value", value }
                );
              }
            } else {
              throw new JsonLdError(
                'Invalid JSON-LD syntax; "@id" value an empty object or array of strings, if framing',
                "jsonld.SyntaxError",
                { code: "invalid @id value", value }
              );
            }
          }
          _addValue(
            expandedParent,
            "@id",
            _asArray(value).map((v) => {
              if (_isString(v)) {
                const ve = _expandIri(activeCtx, v, { base: true }, options);
                if (options.eventHandler) {
                  if (ve === null) {
                    if (v === null) {
                      _handleEvent({
                        event: {
                          type: ["JsonLdEvent"],
                          code: "null @id value",
                          level: "warning",
                          message: "Null @id found.",
                          details: {
                            id: v
                          }
                        },
                        options
                      });
                    } else {
                      _handleEvent({
                        event: {
                          type: ["JsonLdEvent"],
                          code: "reserved @id value",
                          level: "warning",
                          message: "Reserved @id found.",
                          details: {
                            id: v
                          }
                        },
                        options
                      });
                    }
                  } else if (!_isAbsoluteIri(ve)) {
                    _handleEvent({
                      event: {
                        type: ["JsonLdEvent"],
                        code: "relative @id reference",
                        level: "warning",
                        message: "Relative @id reference found.",
                        details: {
                          id: v,
                          expandedId: ve
                        }
                      },
                      options
                    });
                  }
                }
                return ve;
              }
              return v;
            }),
            { propertyIsArray: options.isFrame }
          );
          continue;
        }
        if (expandedProperty === "@type") {
          if (_isObject(value)) {
            value = Object.fromEntries(Object.entries(value).map(([k, v]) => [
              _expandIri(typeScopedContext, k, { vocab: true }),
              _asArray(v).map(
                (vv) => _expandIri(
                  typeScopedContext,
                  vv,
                  { base: true, vocab: true },
                  { ...options, typeExpansion: true }
                )
              )
            ]));
          }
          _validateTypeValue(value, options.isFrame);
          _addValue(
            expandedParent,
            "@type",
            _asArray(value).map((v) => {
              if (_isString(v)) {
                const ve = _expandIri(
                  typeScopedContext,
                  v,
                  { base: true, vocab: true },
                  { ...options, typeExpansion: true }
                );
                if (ve !== "@json" && !_isAbsoluteIri(ve)) {
                  if (options.eventHandler) {
                    _handleEvent({
                      event: {
                        type: ["JsonLdEvent"],
                        code: "relative @type reference",
                        level: "warning",
                        message: "Relative @type reference found.",
                        details: {
                          type: v
                        }
                      },
                      options
                    });
                  }
                }
                return ve;
              }
              return v;
            }),
            { propertyIsArray: !!options.isFrame }
          );
          continue;
        }
        if (expandedProperty === "@included" && _processingMode(activeCtx, 1.1)) {
          const includedResult = _asArray(await api.expand({
            activeCtx,
            activeProperty,
            element: value,
            options
          }));
          if (!includedResult.every((v) => _isSubject(v))) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; values of @included must expand to node objects.",
              "jsonld.SyntaxError",
              { code: "invalid @included value", value }
            );
          }
          _addValue(
            expandedParent,
            "@included",
            includedResult,
            { propertyIsArray: true }
          );
          continue;
        }
        if (expandedProperty === "@graph" && !(_isObject(value) || _isArray(value))) {
          throw new JsonLdError(
            'Invalid JSON-LD syntax; "@graph" value must not be an object or an array.',
            "jsonld.SyntaxError",
            { code: "invalid @graph value", value }
          );
        }
        if (expandedProperty === "@value") {
          unexpandedValue = value;
          if (isJsonType && _processingMode(activeCtx, 1.1)) {
            expandedParent["@value"] = value;
          } else {
            _addValue(
              expandedParent,
              "@value",
              value,
              { propertyIsArray: options.isFrame }
            );
          }
          continue;
        }
        if (expandedProperty === "@language") {
          if (value === null) {
            continue;
          }
          if (!_isString(value) && !options.isFrame) {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; "@language" value must be a string.',
              "jsonld.SyntaxError",
              { code: "invalid language-tagged string", value }
            );
          }
          value = _asArray(value).map((v) => _isString(v) ? v.toLowerCase() : v);
          for (const language of value) {
            if (_isString(language) && !language.match(REGEX_BCP47)) {
              if (options.eventHandler) {
                _handleEvent({
                  event: {
                    type: ["JsonLdEvent"],
                    code: "invalid @language value",
                    level: "warning",
                    message: "@language value must be valid BCP47.",
                    details: {
                      language
                    }
                  },
                  options
                });
              }
            }
          }
          _addValue(
            expandedParent,
            "@language",
            value,
            { propertyIsArray: options.isFrame }
          );
          continue;
        }
        if (expandedProperty === "@direction") {
          if (!_isString(value) && !options.isFrame) {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; "@direction" value must be a string.',
              "jsonld.SyntaxError",
              { code: "invalid base direction", value }
            );
          }
          value = _asArray(value);
          for (const dir of value) {
            if (_isString(dir) && dir !== "ltr" && dir !== "rtl") {
              throw new JsonLdError(
                'Invalid JSON-LD syntax; "@direction" must be "ltr" or "rtl".',
                "jsonld.SyntaxError",
                { code: "invalid base direction", value }
              );
            }
          }
          _addValue(
            expandedParent,
            "@direction",
            value,
            { propertyIsArray: options.isFrame }
          );
          continue;
        }
        if (expandedProperty === "@index") {
          if (!_isString(value)) {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; "@index" value must be a string.',
              "jsonld.SyntaxError",
              { code: "invalid @index value", value }
            );
          }
          _addValue(expandedParent, "@index", value);
          continue;
        }
        if (expandedProperty === "@reverse") {
          if (!_isObject(value)) {
            throw new JsonLdError(
              'Invalid JSON-LD syntax; "@reverse" value must be an object.',
              "jsonld.SyntaxError",
              { code: "invalid @reverse value", value }
            );
          }
          expandedValue = await api.expand({
            activeCtx,
            activeProperty: "@reverse",
            element: value,
            options
          });
          if ("@reverse" in expandedValue) {
            for (const property in expandedValue["@reverse"]) {
              _addValue(
                expandedParent,
                property,
                expandedValue["@reverse"][property],
                { propertyIsArray: true }
              );
            }
          }
          let reverseMap = expandedParent["@reverse"] || null;
          for (const property in expandedValue) {
            if (property === "@reverse") {
              continue;
            }
            if (reverseMap === null) {
              reverseMap = expandedParent["@reverse"] = {};
            }
            _addValue(reverseMap, property, [], { propertyIsArray: true });
            const items = expandedValue[property];
            for (let ii = 0; ii < items.length; ++ii) {
              const item = items[ii];
              if (_isValue(item) || _isList(item)) {
                throw new JsonLdError(
                  'Invalid JSON-LD syntax; "@reverse" value must not be a @value or an @list.',
                  "jsonld.SyntaxError",
                  { code: "invalid reverse property value", value: expandedValue }
                );
              }
              _addValue(reverseMap, property, item, { propertyIsArray: true });
            }
          }
          continue;
        }
        if (expandedProperty === "@nest") {
          nests.push(key);
          continue;
        }
        let termCtx = activeCtx;
        const ctx = _getContextValue(activeCtx, key, "@context");
        if (!_isUndefined(ctx)) {
          termCtx = await _processContext({
            activeCtx,
            localCtx: ctx,
            propagate: true,
            overrideProtected: true,
            options
          });
        }
        const container = _getContextValue(activeCtx, key, "@container") || [];
        if (container.includes("@language") && _isObject(value)) {
          const direction = _getContextValue(termCtx, key, "@direction");
          expandedValue = _expandLanguageMap(termCtx, value, direction, options);
        } else if (container.includes("@index") && _isObject(value)) {
          const asGraph = container.includes("@graph");
          const indexKey = _getContextValue(termCtx, key, "@index") || "@index";
          const propertyIndex = indexKey !== "@index" && _expandIri(activeCtx, indexKey, { vocab: true }, options);
          expandedValue = await _expandIndexMap({
            activeCtx: termCtx,
            options,
            activeProperty: key,
            value,
            asGraph,
            indexKey,
            propertyIndex
          });
        } else if (container.includes("@id") && _isObject(value)) {
          const asGraph = container.includes("@graph");
          expandedValue = await _expandIndexMap({
            activeCtx: termCtx,
            options,
            activeProperty: key,
            value,
            asGraph,
            indexKey: "@id"
          });
        } else if (container.includes("@type") && _isObject(value)) {
          expandedValue = await _expandIndexMap({
            // since container is `@type`, revert type scoped context when expanding
            activeCtx: termCtx.revertToPreviousContext(),
            options,
            activeProperty: key,
            value,
            asGraph: false,
            indexKey: "@type"
          });
        } else {
          const isList = expandedProperty === "@list";
          if (isList || expandedProperty === "@set") {
            let nextActiveProperty = activeProperty;
            if (isList && expandedActiveProperty === "@graph") {
              nextActiveProperty = null;
            }
            expandedValue = await api.expand({
              activeCtx: termCtx,
              activeProperty: nextActiveProperty,
              element: value,
              options,
              insideList: isList
            });
          } else if (_getContextValue(activeCtx, key, "@type") === "@json") {
            expandedValue = {
              "@type": "@json",
              "@value": value
            };
          } else {
            expandedValue = await api.expand({
              activeCtx: termCtx,
              activeProperty: key,
              element: value,
              options,
              insideList: false
            });
          }
        }
        if (expandedValue === null && expandedProperty !== "@value") {
          continue;
        }
        if (expandedProperty !== "@list" && !_isList(expandedValue) && container.includes("@list")) {
          expandedValue = { "@list": _asArray(expandedValue) };
        }
        if (container.includes("@graph") && !container.some((key2) => key2 === "@id" || key2 === "@index")) {
          expandedValue = _asArray(expandedValue);
          if (!options.isFrame) {
            expandedValue = expandedValue.filter((v) => {
              const count = Object.keys(v).length;
              return _dropUnsafeObject({ value: v, count, options }) !== null;
            });
          }
          if (expandedValue.length === 0) {
            continue;
          }
          expandedValue = expandedValue.map((v) => ({ "@graph": _asArray(v) }));
        }
        if (termCtx.mappings.has(key) && termCtx.mappings.get(key).reverse) {
          const reverseMap = expandedParent["@reverse"] = expandedParent["@reverse"] || {};
          expandedValue = _asArray(expandedValue);
          for (let ii = 0; ii < expandedValue.length; ++ii) {
            const item = expandedValue[ii];
            if (_isValue(item) || _isList(item)) {
              throw new JsonLdError(
                'Invalid JSON-LD syntax; "@reverse" value must not be a @value or an @list.',
                "jsonld.SyntaxError",
                { code: "invalid reverse property value", value: expandedValue }
              );
            }
            _addValue(reverseMap, expandedProperty, item, { propertyIsArray: true });
          }
          continue;
        }
        _addValue(expandedParent, expandedProperty, expandedValue, {
          propertyIsArray: true
        });
      }
      if ("@value" in expandedParent) {
        if (expandedParent["@type"] === "@json" && _processingMode(activeCtx, 1.1)) {
        } else if ((_isObject(unexpandedValue) || _isArray(unexpandedValue)) && !options.isFrame) {
          throw new JsonLdError(
            'Invalid JSON-LD syntax; "@value" value must not be an object or an array.',
            "jsonld.SyntaxError",
            { code: "invalid value object value", value: unexpandedValue }
          );
        }
      }
      for (const key of nests) {
        const nestedValues = _isArray(element[key]) ? element[key] : [element[key]];
        for (const nv of nestedValues) {
          if (!_isObject(nv) || Object.keys(nv).some((k) => _expandIri(activeCtx, k, { vocab: true }, options) === "@value")) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; nested value must be a node object.",
              "jsonld.SyntaxError",
              { code: "invalid @nest value", value: nv }
            );
          }
          await _expandObject({
            activeCtx,
            activeProperty,
            expandedActiveProperty,
            element: nv,
            expandedParent,
            options,
            insideList,
            typeScopedContext,
            typeKey
          });
        }
      }
    }
    function _expandValue({ activeCtx, activeProperty, value, options }) {
      if (value === null || value === void 0) {
        return null;
      }
      const expandedProperty = _expandIri(
        activeCtx,
        activeProperty,
        { vocab: true },
        options
      );
      if (expandedProperty === "@id") {
        return _expandIri(activeCtx, value, { base: true }, options);
      } else if (expandedProperty === "@type") {
        return _expandIri(
          activeCtx,
          value,
          { vocab: true, base: true },
          { ...options, typeExpansion: true }
        );
      }
      const type = _getContextValue(activeCtx, activeProperty, "@type");
      if ((type === "@id" || expandedProperty === "@graph") && _isString(value)) {
        const expandedValue = _expandIri(activeCtx, value, { base: true }, options);
        if (expandedValue === null && value.match(REGEX_KEYWORD)) {
          if (options.eventHandler) {
            _handleEvent({
              event: {
                type: ["JsonLdEvent"],
                code: "reserved @id value",
                level: "warning",
                message: "Reserved @id found.",
                details: {
                  id: activeProperty
                }
              },
              options
            });
          }
        }
        return { "@id": expandedValue };
      }
      if (type === "@vocab" && _isString(value)) {
        return {
          "@id": _expandIri(activeCtx, value, { vocab: true, base: true }, options)
        };
      }
      if (_isKeyword(expandedProperty)) {
        return value;
      }
      const rval = {};
      if (type && !["@id", "@vocab", "@none"].includes(type)) {
        rval["@type"] = type;
      } else if (_isString(value)) {
        const language = _getContextValue(activeCtx, activeProperty, "@language");
        if (language !== null) {
          rval["@language"] = language;
        }
        const direction = _getContextValue(activeCtx, activeProperty, "@direction");
        if (direction !== null) {
          rval["@direction"] = direction;
        }
      }
      if (!["boolean", "number", "string"].includes(typeof value)) {
        value = value.toString();
      }
      rval["@value"] = value;
      return rval;
    }
    function _expandLanguageMap(activeCtx, languageMap, direction, options) {
      const rval = [];
      const keys = Object.keys(languageMap).sort();
      for (const key of keys) {
        const expandedKey = _expandIri(activeCtx, key, { vocab: true }, options);
        let val = languageMap[key];
        if (!_isArray(val)) {
          val = [val];
        }
        for (const item of val) {
          if (item === null) {
            continue;
          }
          if (!_isString(item)) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; language map values must be strings.",
              "jsonld.SyntaxError",
              { code: "invalid language map value", languageMap }
            );
          }
          const val2 = { "@value": item };
          if (expandedKey !== "@none") {
            if (!key.match(REGEX_BCP47)) {
              if (options.eventHandler) {
                _handleEvent({
                  event: {
                    type: ["JsonLdEvent"],
                    code: "invalid @language value",
                    level: "warning",
                    message: "@language value must be valid BCP47.",
                    details: {
                      language: key
                    }
                  },
                  options
                });
              }
            }
            val2["@language"] = key.toLowerCase();
          }
          if (direction) {
            val2["@direction"] = direction;
          }
          rval.push(val2);
        }
      }
      return rval;
    }
    async function _expandIndexMap({
      activeCtx,
      options,
      activeProperty,
      value,
      asGraph,
      indexKey,
      propertyIndex
    }) {
      const rval = [];
      const keys = Object.keys(value).sort();
      const isTypeIndex = indexKey === "@type";
      for (let key of keys) {
        if (isTypeIndex) {
          const ctx = _getContextValue(activeCtx, key, "@context");
          if (!_isUndefined(ctx)) {
            activeCtx = await _processContext({
              activeCtx,
              localCtx: ctx,
              propagate: false,
              options
            });
          }
        }
        let val = value[key];
        if (!_isArray(val)) {
          val = [val];
        }
        val = await api.expand({
          activeCtx,
          activeProperty,
          element: val,
          options,
          insideList: false,
          insideIndex: true
        });
        let expandedKey;
        if (propertyIndex) {
          if (key === "@none") {
            expandedKey = "@none";
          } else {
            expandedKey = _expandValue(
              { activeCtx, activeProperty: indexKey, value: key, options }
            );
          }
        } else {
          expandedKey = _expandIri(activeCtx, key, { vocab: true }, options);
        }
        if (indexKey === "@id") {
          key = _expandIri(activeCtx, key, { base: true }, options);
        } else if (isTypeIndex) {
          key = expandedKey;
        }
        for (let item of val) {
          if (asGraph && !_isGraph(item)) {
            item = { "@graph": [item] };
          }
          if (indexKey === "@type") {
            if (expandedKey === "@none") {
            } else if (item["@type"]) {
              item["@type"] = [key].concat(item["@type"]);
            } else {
              item["@type"] = [key];
            }
          } else if (_isValue(item) && !["@language", "@type", "@index"].includes(indexKey)) {
            throw new JsonLdError(
              `Invalid JSON-LD syntax; Attempt to add illegal key to value object: "${indexKey}".`,
              "jsonld.SyntaxError",
              { code: "invalid value object", value: item }
            );
          } else if (propertyIndex) {
            if (expandedKey !== "@none") {
              _addValue(item, propertyIndex, expandedKey, {
                propertyIsArray: true,
                prependValue: true
              });
            }
          } else if (expandedKey !== "@none" && !(indexKey in item)) {
            item[indexKey] = key;
          }
          rval.push(item);
        }
      }
      return rval;
    }
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/nodeMap.js
var require_nodeMap = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/nodeMap.js"(exports, module) {
    "use strict";
    var { isKeyword } = require_context();
    var graphTypes = require_graphTypes();
    var types = require_types();
    var util = require_util();
    var JsonLdError = require_JsonLdError();
    var api = {};
    module.exports = api;
    api.createMergedNodeMap = (input, options) => {
      options = options || {};
      const issuer = options.issuer || new util.IdentifierIssuer("_:b");
      const graphs = { "@default": {} };
      api.createNodeMap(input, graphs, "@default", issuer);
      return api.mergeNodeMaps(graphs);
    };
    api.createNodeMap = (input, graphs, graph, issuer, name, list) => {
      if (types.isArray(input)) {
        for (const node of input) {
          api.createNodeMap(node, graphs, graph, issuer, void 0, list);
        }
        return;
      }
      if (!types.isObject(input)) {
        if (list) {
          list.push(input);
        }
        return;
      }
      if (graphTypes.isValue(input)) {
        if ("@type" in input) {
          let type = input["@type"];
          if (type.indexOf("_:") === 0) {
            input["@type"] = type = issuer.getId(type);
          }
        }
        if (list) {
          list.push(input);
        }
        return;
      } else if (list && graphTypes.isList(input)) {
        const _list = [];
        api.createNodeMap(input["@list"], graphs, graph, issuer, name, _list);
        list.push({ "@list": _list });
        return;
      }
      if ("@type" in input) {
        const types2 = input["@type"];
        for (const type of types2) {
          if (type.indexOf("_:") === 0) {
            issuer.getId(type);
          }
        }
      }
      if (types.isUndefined(name)) {
        name = graphTypes.isBlankNode(input) ? issuer.getId(input["@id"]) : input["@id"];
      }
      if (list) {
        list.push({ "@id": name });
      }
      const subjects = graphs[graph];
      const subject = subjects[name] = subjects[name] || {};
      subject["@id"] = name;
      const properties = Object.keys(input).sort();
      for (let property of properties) {
        if (property === "@id") {
          continue;
        }
        if (property === "@reverse") {
          const referencedNode = { "@id": name };
          const reverseMap = input["@reverse"];
          for (const reverseProperty in reverseMap) {
            const items = reverseMap[reverseProperty];
            for (const item of items) {
              let itemName = item["@id"];
              if (graphTypes.isBlankNode(item)) {
                itemName = issuer.getId(itemName);
              }
              api.createNodeMap(item, graphs, graph, issuer, itemName);
              util.addValue(
                subjects[itemName],
                reverseProperty,
                referencedNode,
                { propertyIsArray: true, allowDuplicate: false }
              );
            }
          }
          continue;
        }
        if (property === "@graph") {
          if (!(name in graphs)) {
            graphs[name] = {};
          }
          api.createNodeMap(input[property], graphs, name, issuer);
          continue;
        }
        if (property === "@included") {
          api.createNodeMap(input[property], graphs, graph, issuer);
          continue;
        }
        if (property !== "@type" && isKeyword(property)) {
          if (property === "@index" && property in subject && (input[property] !== subject[property] || input[property]["@id"] !== subject[property]["@id"])) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; conflicting @index property detected.",
              "jsonld.SyntaxError",
              { code: "conflicting indexes", subject }
            );
          }
          subject[property] = input[property];
          continue;
        }
        const objects = input[property];
        if (property.indexOf("_:") === 0) {
          property = issuer.getId(property);
        }
        if (objects.length === 0) {
          util.addValue(subject, property, [], { propertyIsArray: true });
          continue;
        }
        for (let o of objects) {
          if (property === "@type") {
            o = o.indexOf("_:") === 0 ? issuer.getId(o) : o;
          }
          if (graphTypes.isSubject(o) || graphTypes.isSubjectReference(o)) {
            if ("@id" in o && !o["@id"]) {
              continue;
            }
            const id = graphTypes.isBlankNode(o) ? issuer.getId(o["@id"]) : o["@id"];
            util.addValue(
              subject,
              property,
              { "@id": id },
              { propertyIsArray: true, allowDuplicate: false }
            );
            api.createNodeMap(o, graphs, graph, issuer, id);
          } else if (graphTypes.isValue(o)) {
            util.addValue(
              subject,
              property,
              o,
              { propertyIsArray: true, allowDuplicate: false }
            );
          } else if (graphTypes.isList(o)) {
            const _list = [];
            api.createNodeMap(o["@list"], graphs, graph, issuer, name, _list);
            o = { "@list": _list };
            util.addValue(
              subject,
              property,
              o,
              { propertyIsArray: true, allowDuplicate: false }
            );
          } else {
            api.createNodeMap(o, graphs, graph, issuer, name);
            util.addValue(
              subject,
              property,
              o,
              { propertyIsArray: true, allowDuplicate: false }
            );
          }
        }
      }
    };
    api.mergeNodeMapGraphs = (graphs) => {
      const merged = {};
      for (const name of Object.keys(graphs).sort()) {
        for (const id of Object.keys(graphs[name]).sort()) {
          const node = graphs[name][id];
          if (!(id in merged)) {
            merged[id] = { "@id": id };
          }
          const mergedNode = merged[id];
          for (const property of Object.keys(node).sort()) {
            if (isKeyword(property) && property !== "@type") {
              mergedNode[property] = util.clone(node[property]);
            } else {
              for (const value of node[property]) {
                util.addValue(
                  mergedNode,
                  property,
                  util.clone(value),
                  { propertyIsArray: true, allowDuplicate: false }
                );
              }
            }
          }
        }
      }
      return merged;
    };
    api.mergeNodeMaps = (graphs) => {
      const defaultGraph = graphs["@default"];
      const graphNames = Object.keys(graphs).sort();
      for (const graphName of graphNames) {
        if (graphName === "@default") {
          continue;
        }
        const nodeMap = graphs[graphName];
        let subject = defaultGraph[graphName];
        if (!subject) {
          defaultGraph[graphName] = subject = {
            "@id": graphName,
            "@graph": []
          };
        } else if (!("@graph" in subject)) {
          subject["@graph"] = [];
        }
        const graph = subject["@graph"];
        for (const id of Object.keys(nodeMap).sort()) {
          const node = nodeMap[id];
          if (!graphTypes.isSubjectReference(node)) {
            graph.push(node);
          }
        }
      }
      return defaultGraph;
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/flatten.js
var require_flatten = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/flatten.js"(exports, module) {
    "use strict";
    var {
      isSubjectReference: _isSubjectReference
    } = require_graphTypes();
    var {
      createMergedNodeMap: _createMergedNodeMap
    } = require_nodeMap();
    var api = {};
    module.exports = api;
    api.flatten = (input) => {
      const defaultGraph = _createMergedNodeMap(input);
      const flattened = [];
      const keys = Object.keys(defaultGraph).sort();
      for (let ki = 0; ki < keys.length; ++ki) {
        const node = defaultGraph[keys[ki]];
        if (!_isSubjectReference(node)) {
          flattened.push(node);
        }
      }
      return flattened;
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/fromRdf.js
var require_fromRdf = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/fromRdf.js"(exports, module) {
    "use strict";
    var JsonLdError = require_JsonLdError();
    var graphTypes = require_graphTypes();
    var types = require_types();
    var {
      REGEX_BCP47,
      addValue: _addValue
    } = require_util();
    var {
      handleEvent: _handleEvent
    } = require_events();
    var {
      // RDF,
      RDF_LIST,
      RDF_FIRST,
      RDF_REST,
      RDF_NIL,
      RDF_TYPE,
      // RDF_PLAIN_LITERAL,
      // RDF_XML_LITERAL,
      RDF_JSON_LITERAL,
      // RDF_OBJECT,
      // RDF_LANGSTRING,
      // XSD,
      XSD_BOOLEAN,
      XSD_DOUBLE,
      XSD_INTEGER,
      XSD_STRING
    } = require_constants();
    var api = {};
    module.exports = api;
    api.fromRDF = async (dataset, options) => {
      const {
        useRdfType = false,
        useNativeTypes = false,
        rdfDirection = null
      } = options;
      const defaultGraph = {};
      const graphMap = { "@default": defaultGraph };
      const referencedOnce = {};
      if (rdfDirection) {
        if (rdfDirection === "compound-literal") {
          throw new JsonLdError(
            "Unsupported rdfDirection value.",
            "jsonld.InvalidRdfDirection",
            { value: rdfDirection }
          );
        } else if (rdfDirection !== "i18n-datatype") {
          throw new JsonLdError(
            "Unknown rdfDirection value.",
            "jsonld.InvalidRdfDirection",
            { value: rdfDirection }
          );
        }
      }
      for (const quad of dataset) {
        const name = quad.graph.termType === "DefaultGraph" ? "@default" : quad.graph.value;
        if (!(name in graphMap)) {
          graphMap[name] = {};
        }
        if (name !== "@default" && !(name in defaultGraph)) {
          defaultGraph[name] = { "@id": name };
        }
        const nodeMap = graphMap[name];
        const s = _nodeId(quad.subject);
        const p = quad.predicate.value;
        const o = quad.object;
        if (!(s in nodeMap)) {
          nodeMap[s] = { "@id": s };
        }
        const node = nodeMap[s];
        const objectNodeId = _nodeId(o);
        const objectIsNode = !!objectNodeId;
        if (objectIsNode && !(objectNodeId in nodeMap)) {
          nodeMap[objectNodeId] = { "@id": objectNodeId };
        }
        if (p === RDF_TYPE && !useRdfType && objectIsNode) {
          _addValue(node, "@type", objectNodeId, { propertyIsArray: true });
          continue;
        }
        const value = _RDFToObject(o, useNativeTypes, rdfDirection, options);
        _addValue(node, p, value, { propertyIsArray: true });
        if (objectIsNode) {
          if (objectNodeId === RDF_NIL) {
            const object = nodeMap[objectNodeId];
            if (!("usages" in object)) {
              object.usages = [];
            }
            object.usages.push({
              node,
              property: p,
              value
            });
          } else if (objectNodeId in referencedOnce) {
            referencedOnce[objectNodeId] = false;
          } else {
            referencedOnce[objectNodeId] = {
              node,
              property: p,
              value
            };
          }
        }
      }
      for (const name in graphMap) {
        const graphObject = graphMap[name];
        if (!(RDF_NIL in graphObject)) {
          continue;
        }
        const nil = graphObject[RDF_NIL];
        if (!nil.usages) {
          continue;
        }
        for (let usage of nil.usages) {
          let node = usage.node;
          let property = usage.property;
          let head = usage.value;
          const list = [];
          const listNodes = [];
          let nodeKeyCount = Object.keys(node).length;
          while (property === RDF_REST && types.isObject(referencedOnce[node["@id"]]) && types.isArray(node[RDF_FIRST]) && node[RDF_FIRST].length === 1 && types.isArray(node[RDF_REST]) && node[RDF_REST].length === 1 && (nodeKeyCount === 3 || nodeKeyCount === 4 && types.isArray(node["@type"]) && node["@type"].length === 1 && node["@type"][0] === RDF_LIST)) {
            list.push(node[RDF_FIRST][0]);
            listNodes.push(node["@id"]);
            usage = referencedOnce[node["@id"]];
            node = usage.node;
            property = usage.property;
            head = usage.value;
            nodeKeyCount = Object.keys(node).length;
            if (!graphTypes.isBlankNode(node)) {
              break;
            }
          }
          delete head["@id"];
          head["@list"] = list.reverse();
          for (const listNode of listNodes) {
            delete graphObject[listNode];
          }
        }
        delete nil.usages;
      }
      const result = [];
      const subjects = Object.keys(defaultGraph).sort();
      for (const subject of subjects) {
        const node = defaultGraph[subject];
        if (subject in graphMap) {
          const graph = node["@graph"] = [];
          const graphObject = graphMap[subject];
          const graphSubjects = Object.keys(graphObject).sort();
          for (const graphSubject of graphSubjects) {
            const node2 = graphObject[graphSubject];
            if (!graphTypes.isSubjectReference(node2)) {
              graph.push(node2);
            }
          }
        }
        if (!graphTypes.isSubjectReference(node)) {
          result.push(node);
        }
      }
      return result;
    };
    function _RDFToObject(o, useNativeTypes, rdfDirection, options) {
      const nodeId = _nodeId(o);
      if (nodeId) {
        return { "@id": nodeId };
      }
      const rval = { "@value": o.value };
      if (o.language) {
        if (!o.language.match(REGEX_BCP47)) {
          if (options.eventHandler) {
            _handleEvent({
              event: {
                type: ["JsonLdEvent"],
                code: "invalid @language value",
                level: "warning",
                message: "@language value must be valid BCP47.",
                details: {
                  language: o.language
                }
              },
              options
            });
          }
        }
        rval["@language"] = o.language;
      } else {
        let type = o.datatype.value;
        if (!type) {
          type = XSD_STRING;
        }
        if (type === RDF_JSON_LITERAL) {
          type = "@json";
          try {
            rval["@value"] = JSON.parse(rval["@value"]);
          } catch (e) {
            throw new JsonLdError(
              "JSON literal could not be parsed.",
              "jsonld.InvalidJsonLiteral",
              { code: "invalid JSON literal", value: rval["@value"], cause: e }
            );
          }
        }
        if (useNativeTypes) {
          if (type === XSD_BOOLEAN) {
            if (rval["@value"] === "true" || rval["@value"] === "1") {
              rval["@value"] = true;
            } else if (rval["@value"] === "false" || rval["@value"] === "0") {
              rval["@value"] = false;
            } else {
              rval["@type"] = type;
            }
          } else if (type === XSD_INTEGER) {
            if (types.isNumeric(rval["@value"])) {
              const i = parseInt(rval["@value"], 10);
              if (i.toFixed(0) === rval["@value"]) {
                rval["@value"] = i;
              }
            } else {
              rval["@type"] = type;
            }
          } else if (type === XSD_DOUBLE) {
            if (types.isNumeric(rval["@value"])) {
              rval["@value"] = parseFloat(rval["@value"]);
            } else {
              rval["@type"] = type;
            }
          } else {
            rval["@type"] = type;
          }
        } else if (rdfDirection === "i18n-datatype" && type.startsWith("https://www.w3.org/ns/i18n#")) {
          const [, language, direction] = type.split(/[#_]/);
          if (language.length > 0) {
            rval["@language"] = language;
            if (!language.match(REGEX_BCP47)) {
              if (options.eventHandler) {
                _handleEvent({
                  event: {
                    type: ["JsonLdEvent"],
                    code: "invalid @language value",
                    level: "warning",
                    message: "@language value must be valid BCP47.",
                    details: {
                      language
                    }
                  },
                  options
                });
              }
            }
          }
          rval["@direction"] = direction;
        } else if (type !== XSD_STRING) {
          rval["@type"] = type;
        }
      }
      return rval;
    }
    function _nodeId(term) {
      if (term.termType === "NamedNode") {
        return term.value;
      } else if (term.termType === "BlankNode") {
        return "_:" + term.value;
      }
      return null;
    }
  }
});

// node_modules/.pnpm/canonicalize@2.1.0/node_modules/canonicalize/lib/canonicalize.js
var require_canonicalize = __commonJS({
  "node_modules/.pnpm/canonicalize@2.1.0/node_modules/canonicalize/lib/canonicalize.js"(exports, module) {
    "use strict";
    module.exports = function serialize(object) {
      if (typeof object === "number" && isNaN(object)) {
        throw new Error("NaN is not allowed");
      }
      if (typeof object === "number" && !isFinite(object)) {
        throw new Error("Infinity is not allowed");
      }
      if (object === null || typeof object !== "object") {
        return JSON.stringify(object);
      }
      if (object.toJSON instanceof Function) {
        return serialize(object.toJSON());
      }
      if (Array.isArray(object)) {
        const values2 = object.reduce((t, cv, ci) => {
          const comma = ci === 0 ? "" : ",";
          const value = cv === void 0 || typeof cv === "symbol" ? null : cv;
          return `${t}${comma}${serialize(value)}`;
        }, "");
        return `[${values2}]`;
      }
      const values = Object.keys(object).sort().reduce((t, cv) => {
        if (object[cv] === void 0 || typeof object[cv] === "symbol") {
          return t;
        }
        const comma = t.length === 0 ? "" : ",";
        return `${t}${comma}${serialize(cv)}:${serialize(object[cv])}`;
      }, "");
      return `{${values}}`;
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/toRdf.js
var require_toRdf = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/toRdf.js"(exports, module) {
    "use strict";
    var { createNodeMap } = require_nodeMap();
    var { isKeyword } = require_context();
    var graphTypes = require_graphTypes();
    var jsonCanonicalize = require_canonicalize();
    var JsonLdError = require_JsonLdError();
    var types = require_types();
    var util = require_util();
    var {
      handleEvent: _handleEvent
    } = require_events();
    var {
      // RDF,
      // RDF_LIST,
      RDF_FIRST,
      RDF_REST,
      RDF_NIL,
      RDF_TYPE,
      // RDF_PLAIN_LITERAL,
      // RDF_XML_LITERAL,
      RDF_JSON_LITERAL,
      // RDF_OBJECT,
      RDF_LANGSTRING,
      // XSD,
      XSD_BOOLEAN,
      XSD_DOUBLE,
      XSD_INTEGER,
      XSD_STRING
    } = require_constants();
    var {
      isAbsolute: _isAbsoluteIri
    } = require_url();
    var api = {};
    module.exports = api;
    api.toRDF = (input, options) => {
      const issuer = new util.IdentifierIssuer("_:b");
      const nodeMap = { "@default": {} };
      createNodeMap(input, nodeMap, "@default", issuer);
      const dataset = [];
      const graphNames = Object.keys(nodeMap).sort();
      for (const graphName of graphNames) {
        let graphTerm;
        if (graphName === "@default") {
          graphTerm = { termType: "DefaultGraph", value: "" };
        } else if (_isAbsoluteIri(graphName)) {
          graphTerm = _makeTerm(graphName);
        } else {
          if (options.eventHandler) {
            _handleEvent({
              event: {
                type: ["JsonLdEvent"],
                code: "relative graph reference",
                level: "warning",
                message: "Relative graph reference found.",
                details: {
                  graph: graphName
                }
              },
              options
            });
          }
          continue;
        }
        _graphToRDF(dataset, nodeMap[graphName], graphTerm, issuer, options);
      }
      return dataset;
    };
    function _graphToRDF(dataset, graph, graphTerm, issuer, options) {
      const ids = Object.keys(graph).sort();
      for (const id of ids) {
        const node = graph[id];
        const properties = Object.keys(node).sort();
        for (let property of properties) {
          const items = node[property];
          if (property === "@type") {
            property = RDF_TYPE;
          } else if (isKeyword(property)) {
            continue;
          }
          for (const item of items) {
            const subject = _makeTerm(id);
            if (!_isAbsoluteIri(id)) {
              if (options.eventHandler) {
                _handleEvent({
                  event: {
                    type: ["JsonLdEvent"],
                    code: "relative subject reference",
                    level: "warning",
                    message: "Relative subject reference found.",
                    details: {
                      subject: id
                    }
                  },
                  options
                });
              }
              continue;
            }
            const predicate = _makeTerm(property);
            if (!_isAbsoluteIri(property)) {
              if (options.eventHandler) {
                _handleEvent({
                  event: {
                    type: ["JsonLdEvent"],
                    code: "relative predicate reference",
                    level: "warning",
                    message: "Relative predicate reference found.",
                    details: {
                      predicate: property
                    }
                  },
                  options
                });
              }
              continue;
            }
            if (predicate.termType === "BlankNode" && !options.produceGeneralizedRdf) {
              if (options.eventHandler) {
                _handleEvent({
                  event: {
                    type: ["JsonLdEvent"],
                    code: "blank node predicate",
                    level: "warning",
                    message: "Dropping blank node predicate.",
                    details: {
                      // FIXME: add better issuer API to get reverse mapping
                      property: issuer.getOldIds().find((key) => issuer.getId(key) === property)
                    }
                  },
                  options
                });
              }
              continue;
            }
            const object = _objectToRDF(
              item,
              issuer,
              dataset,
              graphTerm,
              options.rdfDirection,
              options
            );
            if (object) {
              dataset.push({
                subject,
                predicate,
                object,
                graph: graphTerm
              });
            }
          }
        }
      }
    }
    function _listToRDF(list, issuer, dataset, graphTerm, rdfDirection, options) {
      const first = { termType: "NamedNode", value: RDF_FIRST };
      const rest = { termType: "NamedNode", value: RDF_REST };
      const nil = { termType: "NamedNode", value: RDF_NIL };
      const last = list.pop();
      const result = last ? {
        termType: "BlankNode",
        value: issuer.getId().slice(2)
      } : nil;
      let subject = result;
      for (const item of list) {
        const object = _objectToRDF(
          item,
          issuer,
          dataset,
          graphTerm,
          rdfDirection,
          options
        );
        const next = { termType: "BlankNode", value: issuer.getId().slice(2) };
        dataset.push({
          subject,
          predicate: first,
          object,
          graph: graphTerm
        });
        dataset.push({
          subject,
          predicate: rest,
          object: next,
          graph: graphTerm
        });
        subject = next;
      }
      if (last) {
        const object = _objectToRDF(
          last,
          issuer,
          dataset,
          graphTerm,
          rdfDirection,
          options
        );
        dataset.push({
          subject,
          predicate: first,
          object,
          graph: graphTerm
        });
        dataset.push({
          subject,
          predicate: rest,
          object: nil,
          graph: graphTerm
        });
      }
      return result;
    }
    function _objectToRDF(item, issuer, dataset, graphTerm, rdfDirection, options) {
      let object;
      if (graphTypes.isValue(item)) {
        object = {
          termType: "Literal",
          value: void 0,
          datatype: {
            termType: "NamedNode"
          }
        };
        let value = item["@value"];
        const datatype = item["@type"] || null;
        if (datatype === "@json") {
          object.value = jsonCanonicalize(value);
          object.datatype.value = RDF_JSON_LITERAL;
        } else if (types.isBoolean(value)) {
          object.value = value.toString();
          object.datatype.value = datatype || XSD_BOOLEAN;
        } else if (types.isDouble(value) || datatype === XSD_DOUBLE) {
          if (!types.isDouble(value)) {
            value = parseFloat(value);
          }
          object.value = value.toExponential(15).replace(/(\d)0*e\+?/, "$1E");
          object.datatype.value = datatype || XSD_DOUBLE;
        } else if (types.isNumber(value)) {
          object.value = value.toFixed(0);
          object.datatype.value = datatype || XSD_INTEGER;
        } else if ("@direction" in item && rdfDirection === "i18n-datatype") {
          const language = (item["@language"] || "").toLowerCase();
          const direction = item["@direction"];
          const datatype2 = `https://www.w3.org/ns/i18n#${language}_${direction}`;
          object.datatype.value = datatype2;
          object.value = value;
        } else if ("@direction" in item && rdfDirection === "compound-literal") {
          throw new JsonLdError(
            "Unsupported rdfDirection value.",
            "jsonld.InvalidRdfDirection",
            { value: rdfDirection }
          );
        } else if ("@direction" in item && rdfDirection) {
          throw new JsonLdError(
            "Unknown rdfDirection value.",
            "jsonld.InvalidRdfDirection",
            { value: rdfDirection }
          );
        } else if ("@language" in item) {
          if ("@direction" in item && !rdfDirection) {
            if (options.eventHandler) {
              _handleEvent({
                event: {
                  type: ["JsonLdEvent"],
                  code: "rdfDirection not set",
                  level: "warning",
                  message: "rdfDirection not set for @direction.",
                  details: {
                    object: object.value
                  }
                },
                options
              });
            }
          }
          object.value = value;
          object.datatype.value = datatype || RDF_LANGSTRING;
          object.language = item["@language"];
        } else {
          if ("@direction" in item && !rdfDirection) {
            if (options.eventHandler) {
              _handleEvent({
                event: {
                  type: ["JsonLdEvent"],
                  code: "rdfDirection not set",
                  level: "warning",
                  message: "rdfDirection not set for @direction.",
                  details: {
                    object: object.value
                  }
                },
                options
              });
            }
          }
          object.value = value;
          object.datatype.value = datatype || XSD_STRING;
        }
      } else if (graphTypes.isList(item)) {
        const _list = _listToRDF(
          item["@list"],
          issuer,
          dataset,
          graphTerm,
          rdfDirection,
          options
        );
        object = {
          termType: _list.termType,
          value: _list.value
        };
      } else {
        const id = types.isObject(item) ? item["@id"] : item;
        object = _makeTerm(id);
      }
      if (object.termType === "NamedNode" && !_isAbsoluteIri(object.value)) {
        if (options.eventHandler) {
          _handleEvent({
            event: {
              type: ["JsonLdEvent"],
              code: "relative object reference",
              level: "warning",
              message: "Relative object reference found.",
              details: {
                object: object.value
              }
            },
            options
          });
        }
        return null;
      }
      return object;
    }
    function _makeTerm(id) {
      if (id.startsWith("_:")) {
        return {
          termType: "BlankNode",
          value: id.slice(2)
        };
      }
      return {
        termType: "NamedNode",
        value: id
      };
    }
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/frame.js
var require_frame = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/frame.js"(exports, module) {
    "use strict";
    var { isKeyword } = require_context();
    var graphTypes = require_graphTypes();
    var types = require_types();
    var util = require_util();
    var url = require_url();
    var JsonLdError = require_JsonLdError();
    var {
      createNodeMap: _createNodeMap,
      mergeNodeMapGraphs: _mergeNodeMapGraphs
    } = require_nodeMap();
    var api = {};
    module.exports = api;
    api.frameMergedOrDefault = (input, frame, options) => {
      const state = {
        options,
        embedded: false,
        graph: "@default",
        graphMap: { "@default": {} },
        subjectStack: [],
        link: {},
        bnodeMap: {}
      };
      const issuer = new util.IdentifierIssuer("_:b");
      _createNodeMap(input, state.graphMap, "@default", issuer);
      if (options.merged) {
        state.graphMap["@merged"] = _mergeNodeMapGraphs(state.graphMap);
        state.graph = "@merged";
      }
      state.subjects = state.graphMap[state.graph];
      const framed = [];
      api.frame(state, Object.keys(state.subjects).sort(), frame, framed);
      if (options.pruneBlankNodeIdentifiers) {
        options.bnodesToClear = Object.keys(state.bnodeMap).filter((id) => state.bnodeMap[id].length === 1);
      }
      options.link = {};
      return _cleanupPreserve(framed, options);
    };
    api.frame = (state, subjects, frame, parent, property = null) => {
      _validateFrame(frame);
      frame = frame[0];
      const options = state.options;
      const flags = {
        embed: _getFrameFlag(frame, options, "embed"),
        explicit: _getFrameFlag(frame, options, "explicit"),
        requireAll: _getFrameFlag(frame, options, "requireAll")
      };
      if (!state.link.hasOwnProperty(state.graph)) {
        state.link[state.graph] = {};
      }
      const link = state.link[state.graph];
      const matches = _filterSubjects(state, subjects, frame, flags);
      const ids = Object.keys(matches).sort();
      for (const id of ids) {
        const subject = matches[id];
        if (property === null) {
          state.uniqueEmbeds = { [state.graph]: {} };
        } else {
          state.uniqueEmbeds[state.graph] = state.uniqueEmbeds[state.graph] || {};
        }
        if (flags.embed === "@link" && id in link) {
          _addFrameOutput(parent, property, link[id]);
          continue;
        }
        const output = { "@id": id };
        if (id.indexOf("_:") === 0) {
          util.addValue(state.bnodeMap, id, output, { propertyIsArray: true });
        }
        link[id] = output;
        if ((flags.embed === "@first" || flags.embed === "@last") && state.is11) {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; invalid value of @embed.",
            "jsonld.SyntaxError",
            { code: "invalid @embed value", frame }
          );
        }
        if (!state.embedded && state.uniqueEmbeds[state.graph].hasOwnProperty(id)) {
          continue;
        }
        if (state.embedded && (flags.embed === "@never" || _createsCircularReference(subject, state.graph, state.subjectStack))) {
          _addFrameOutput(parent, property, output);
          continue;
        }
        if (state.embedded && (flags.embed == "@first" || flags.embed == "@once") && state.uniqueEmbeds[state.graph].hasOwnProperty(id)) {
          _addFrameOutput(parent, property, output);
          continue;
        }
        if (flags.embed === "@last") {
          if (id in state.uniqueEmbeds[state.graph]) {
            _removeEmbed(state, id);
          }
        }
        state.uniqueEmbeds[state.graph][id] = { parent, property };
        state.subjectStack.push({ subject, graph: state.graph });
        if (id in state.graphMap) {
          let recurse = false;
          let subframe = null;
          if (!("@graph" in frame)) {
            recurse = state.graph !== "@merged";
            subframe = {};
          } else {
            subframe = frame["@graph"][0];
            recurse = !(id === "@merged" || id === "@default");
            if (!types.isObject(subframe)) {
              subframe = {};
            }
          }
          if (recurse) {
            api.frame(
              { ...state, graph: id, embedded: false },
              Object.keys(state.graphMap[id]).sort(),
              [subframe],
              output,
              "@graph"
            );
          }
        }
        if ("@included" in frame) {
          api.frame(
            { ...state, embedded: false },
            subjects,
            frame["@included"],
            output,
            "@included"
          );
        }
        for (const prop of Object.keys(subject).sort()) {
          if (isKeyword(prop)) {
            output[prop] = util.clone(subject[prop]);
            if (prop === "@type") {
              for (const type of subject["@type"]) {
                if (type.indexOf("_:") === 0) {
                  util.addValue(
                    state.bnodeMap,
                    type,
                    output,
                    { propertyIsArray: true }
                  );
                }
              }
            }
            continue;
          }
          if (flags.explicit && !(prop in frame)) {
            continue;
          }
          for (const o of subject[prop]) {
            const subframe = prop in frame ? frame[prop] : _createImplicitFrame(flags);
            if (graphTypes.isList(o)) {
              const subframe2 = frame[prop] && frame[prop][0] && frame[prop][0]["@list"] ? frame[prop][0]["@list"] : _createImplicitFrame(flags);
              const list = { "@list": [] };
              _addFrameOutput(output, prop, list);
              const src = o["@list"];
              for (const oo of src) {
                if (graphTypes.isSubjectReference(oo)) {
                  api.frame(
                    { ...state, embedded: true },
                    [oo["@id"]],
                    subframe2,
                    list,
                    "@list"
                  );
                } else {
                  _addFrameOutput(list, "@list", util.clone(oo));
                }
              }
            } else if (graphTypes.isSubjectReference(o)) {
              api.frame(
                { ...state, embedded: true },
                [o["@id"]],
                subframe,
                output,
                prop
              );
            } else if (_valueMatch(subframe[0], o)) {
              _addFrameOutput(output, prop, util.clone(o));
            }
          }
        }
        for (const prop of Object.keys(frame).sort()) {
          if (prop === "@type") {
            if (!types.isObject(frame[prop][0]) || !("@default" in frame[prop][0])) {
              continue;
            }
          } else if (isKeyword(prop)) {
            continue;
          }
          const next = frame[prop][0] || {};
          const omitDefaultOn = _getFrameFlag(next, options, "omitDefault");
          if (!omitDefaultOn && !(prop in output)) {
            let preserve = "@null";
            if ("@default" in next) {
              preserve = util.clone(next["@default"]);
            }
            if (!types.isArray(preserve)) {
              preserve = [preserve];
            }
            output[prop] = [{ "@preserve": preserve }];
          }
        }
        for (const reverseProp of Object.keys(frame["@reverse"] || {}).sort()) {
          const subframe = frame["@reverse"][reverseProp];
          for (const subject2 of Object.keys(state.subjects)) {
            const nodeValues = util.getValues(state.subjects[subject2], reverseProp);
            if (nodeValues.some((v) => v["@id"] === id)) {
              output["@reverse"] = output["@reverse"] || {};
              util.addValue(
                output["@reverse"],
                reverseProp,
                [],
                { propertyIsArray: true }
              );
              api.frame(
                { ...state, embedded: true },
                [subject2],
                subframe,
                output["@reverse"][reverseProp],
                property
              );
            }
          }
        }
        _addFrameOutput(parent, property, output);
        state.subjectStack.pop();
      }
    };
    api.cleanupNull = (input, options) => {
      if (types.isArray(input)) {
        const noNulls = input.map((v) => api.cleanupNull(v, options));
        return noNulls.filter((v) => v);
      }
      if (input === "@null") {
        return null;
      }
      if (types.isObject(input)) {
        if ("@id" in input) {
          const id = input["@id"];
          if (options.link.hasOwnProperty(id)) {
            const idx = options.link[id].indexOf(input);
            if (idx !== -1) {
              return options.link[id][idx];
            }
            options.link[id].push(input);
          } else {
            options.link[id] = [input];
          }
        }
        for (const key in input) {
          input[key] = api.cleanupNull(input[key], options);
        }
      }
      return input;
    };
    function _createImplicitFrame(flags) {
      const frame = {};
      for (const key in flags) {
        if (flags[key] !== void 0) {
          frame["@" + key] = [flags[key]];
        }
      }
      return [frame];
    }
    function _createsCircularReference(subjectToEmbed, graph, subjectStack) {
      for (let i = subjectStack.length - 1; i >= 0; --i) {
        const subject = subjectStack[i];
        if (subject.graph === graph && subject.subject["@id"] === subjectToEmbed["@id"]) {
          return true;
        }
      }
      return false;
    }
    function _getFrameFlag(frame, options, name) {
      const flag = "@" + name;
      let rval = flag in frame ? frame[flag][0] : options[name];
      if (name === "embed") {
        if (rval === true) {
          rval = "@once";
        } else if (rval === false) {
          rval = "@never";
        } else if (rval !== "@always" && rval !== "@never" && rval !== "@link" && rval !== "@first" && rval !== "@last" && rval !== "@once") {
          throw new JsonLdError(
            "Invalid JSON-LD syntax; invalid value of @embed.",
            "jsonld.SyntaxError",
            { code: "invalid @embed value", frame }
          );
        }
      }
      return rval;
    }
    function _validateFrame(frame) {
      if (!types.isArray(frame) || frame.length !== 1 || !types.isObject(frame[0])) {
        throw new JsonLdError(
          "Invalid JSON-LD syntax; a JSON-LD frame must be a single object.",
          "jsonld.SyntaxError",
          { frame }
        );
      }
      if ("@id" in frame[0]) {
        for (const id of util.asArray(frame[0]["@id"])) {
          if (!(types.isObject(id) || url.isAbsolute(id)) || types.isString(id) && id.indexOf("_:") === 0) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; invalid @id in frame.",
              "jsonld.SyntaxError",
              { code: "invalid frame", frame }
            );
          }
        }
      }
      if ("@type" in frame[0]) {
        for (const type of util.asArray(frame[0]["@type"])) {
          if (!(types.isObject(type) || url.isAbsolute(type) || type === "@json") || types.isString(type) && type.indexOf("_:") === 0) {
            throw new JsonLdError(
              "Invalid JSON-LD syntax; invalid @type in frame.",
              "jsonld.SyntaxError",
              { code: "invalid frame", frame }
            );
          }
        }
      }
    }
    function _filterSubjects(state, subjects, frame, flags) {
      const rval = {};
      for (const id of subjects) {
        const subject = state.graphMap[state.graph][id];
        if (_filterSubject(state, subject, frame, flags)) {
          rval[id] = subject;
        }
      }
      return rval;
    }
    function _filterSubject(state, subject, frame, flags) {
      let wildcard = true;
      let matchesSome = false;
      for (const key in frame) {
        let matchThis = false;
        const nodeValues = util.getValues(subject, key);
        const isEmpty = util.getValues(frame, key).length === 0;
        if (key === "@id") {
          if (types.isEmptyObject(frame["@id"][0] || {})) {
            matchThis = true;
          } else if (frame["@id"].length >= 0) {
            matchThis = frame["@id"].includes(nodeValues[0]);
          }
          if (!flags.requireAll) {
            return matchThis;
          }
        } else if (key === "@type") {
          wildcard = false;
          if (isEmpty) {
            if (nodeValues.length > 0) {
              return false;
            }
            matchThis = true;
          } else if (frame["@type"].length === 1 && types.isEmptyObject(frame["@type"][0])) {
            matchThis = nodeValues.length > 0;
          } else {
            for (const type of frame["@type"]) {
              if (types.isObject(type) && "@default" in type) {
                matchThis = true;
              } else {
                matchThis = matchThis || nodeValues.some((tt) => tt === type);
              }
            }
          }
          if (!flags.requireAll) {
            return matchThis;
          }
        } else if (isKeyword(key)) {
          continue;
        } else {
          const thisFrame = util.getValues(frame, key)[0];
          let hasDefault = false;
          if (thisFrame) {
            _validateFrame([thisFrame]);
            hasDefault = "@default" in thisFrame;
          }
          wildcard = false;
          if (nodeValues.length === 0 && hasDefault) {
            continue;
          }
          if (nodeValues.length > 0 && isEmpty) {
            return false;
          }
          if (thisFrame === void 0) {
            if (nodeValues.length > 0) {
              return false;
            }
            matchThis = true;
          } else {
            if (graphTypes.isList(thisFrame)) {
              const listValue = thisFrame["@list"][0];
              if (graphTypes.isList(nodeValues[0])) {
                const nodeListValues = nodeValues[0]["@list"];
                if (graphTypes.isValue(listValue)) {
                  matchThis = nodeListValues.some((lv) => _valueMatch(listValue, lv));
                } else if (graphTypes.isSubject(listValue) || graphTypes.isSubjectReference(listValue)) {
                  matchThis = nodeListValues.some((lv) => _nodeMatch(
                    state,
                    listValue,
                    lv,
                    flags
                  ));
                }
              }
            } else if (graphTypes.isValue(thisFrame)) {
              matchThis = nodeValues.some((nv) => _valueMatch(thisFrame, nv));
            } else if (graphTypes.isSubjectReference(thisFrame)) {
              matchThis = nodeValues.some((nv) => _nodeMatch(state, thisFrame, nv, flags));
            } else if (types.isObject(thisFrame)) {
              matchThis = nodeValues.length > 0;
            } else {
              matchThis = false;
            }
          }
        }
        if (!matchThis && flags.requireAll) {
          return false;
        }
        matchesSome = matchesSome || matchThis;
      }
      return wildcard || matchesSome;
    }
    function _removeEmbed(state, id) {
      const embeds = state.uniqueEmbeds[state.graph];
      const embed = embeds[id];
      const parent = embed.parent;
      const property = embed.property;
      const subject = { "@id": id };
      if (types.isArray(parent)) {
        for (let i = 0; i < parent.length; ++i) {
          if (util.compareValues(parent[i], subject)) {
            parent[i] = subject;
            break;
          }
        }
      } else {
        const useArray = types.isArray(parent[property]);
        util.removeValue(parent, property, subject, { propertyIsArray: useArray });
        util.addValue(parent, property, subject, { propertyIsArray: useArray });
      }
      const removeDependents = (id2) => {
        const ids = Object.keys(embeds);
        for (const next of ids) {
          if (next in embeds && types.isObject(embeds[next].parent) && embeds[next].parent["@id"] === id2) {
            delete embeds[next];
            removeDependents(next);
          }
        }
      };
      removeDependents(id);
    }
    function _cleanupPreserve(input, options) {
      if (types.isArray(input)) {
        return input.map((value) => _cleanupPreserve(value, options));
      }
      if (types.isObject(input)) {
        if ("@preserve" in input) {
          return input["@preserve"][0];
        }
        if (graphTypes.isValue(input)) {
          return input;
        }
        if (graphTypes.isList(input)) {
          input["@list"] = _cleanupPreserve(input["@list"], options);
          return input;
        }
        if ("@id" in input) {
          const id = input["@id"];
          if (options.link.hasOwnProperty(id)) {
            const idx = options.link[id].indexOf(input);
            if (idx !== -1) {
              return options.link[id][idx];
            }
            options.link[id].push(input);
          } else {
            options.link[id] = [input];
          }
        }
        for (const prop in input) {
          if (prop === "@id" && options.bnodesToClear.includes(input[prop])) {
            delete input["@id"];
            continue;
          }
          input[prop] = _cleanupPreserve(input[prop], options);
        }
      }
      return input;
    }
    function _addFrameOutput(parent, property, output) {
      if (types.isObject(parent)) {
        util.addValue(parent, property, output, { propertyIsArray: true });
      } else {
        parent.push(output);
      }
    }
    function _nodeMatch(state, pattern, value, flags) {
      if (!("@id" in value)) {
        return false;
      }
      const nodeObject = state.subjects[value["@id"]];
      return nodeObject && _filterSubject(state, nodeObject, pattern, flags);
    }
    function _valueMatch(pattern, value) {
      const v1 = value["@value"];
      const t1 = value["@type"];
      const l1 = value["@language"];
      const v2 = pattern["@value"] ? types.isArray(pattern["@value"]) ? pattern["@value"] : [pattern["@value"]] : [];
      const t2 = pattern["@type"] ? types.isArray(pattern["@type"]) ? pattern["@type"] : [pattern["@type"]] : [];
      const l2 = pattern["@language"] ? types.isArray(pattern["@language"]) ? pattern["@language"] : [pattern["@language"]] : [];
      if (v2.length === 0 && t2.length === 0 && l2.length === 0) {
        return true;
      }
      if (!(v2.includes(v1) || types.isEmptyObject(v2[0]))) {
        return false;
      }
      if (!(!t1 && t2.length === 0 || t2.includes(t1) || t1 && types.isEmptyObject(t2[0]))) {
        return false;
      }
      if (!(!l1 && l2.length === 0 || l2.includes(l1) || l1 && types.isEmptyObject(l2[0]))) {
        return false;
      }
      return true;
    }
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/compact.js
var require_compact = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/compact.js"(exports, module) {
    "use strict";
    var JsonLdError = require_JsonLdError();
    var {
      isArray: _isArray,
      isObject: _isObject,
      isString: _isString,
      isUndefined: _isUndefined
    } = require_types();
    var {
      isList: _isList,
      isValue: _isValue,
      isGraph: _isGraph,
      isSimpleGraph: _isSimpleGraph,
      isSubjectReference: _isSubjectReference
    } = require_graphTypes();
    var {
      expandIri: _expandIri,
      getContextValue: _getContextValue,
      isKeyword: _isKeyword,
      process: _processContext,
      processingMode: _processingMode
    } = require_context();
    var {
      removeBase: _removeBase,
      prependBase: _prependBase
    } = require_url();
    var {
      REGEX_KEYWORD,
      addValue: _addValue,
      asArray: _asArray,
      compareShortestLeast: _compareShortestLeast
    } = require_util();
    var api = {};
    module.exports = api;
    api.compact = async ({
      activeCtx,
      activeProperty = null,
      element,
      options = {}
    }) => {
      if (_isArray(element)) {
        let rval = [];
        for (let i = 0; i < element.length; ++i) {
          const compacted = await api.compact({
            activeCtx,
            activeProperty,
            element: element[i],
            options
          });
          if (compacted === null) {
            continue;
          }
          rval.push(compacted);
        }
        if (options.compactArrays && rval.length === 1) {
          const container = _getContextValue(
            activeCtx,
            activeProperty,
            "@container"
          ) || [];
          if (container.length === 0) {
            rval = rval[0];
          }
        }
        return rval;
      }
      const ctx = _getContextValue(activeCtx, activeProperty, "@context");
      if (!_isUndefined(ctx)) {
        activeCtx = await _processContext({
          activeCtx,
          localCtx: ctx,
          propagate: true,
          overrideProtected: true,
          options
        });
      }
      if (_isObject(element)) {
        if (options.link && "@id" in element && options.link.hasOwnProperty(element["@id"])) {
          const linked = options.link[element["@id"]];
          for (let i = 0; i < linked.length; ++i) {
            if (linked[i].expanded === element) {
              return linked[i].compacted;
            }
          }
        }
        if (_isValue(element) || _isSubjectReference(element)) {
          const rval2 = api.compactValue({ activeCtx, activeProperty, value: element, options });
          if (options.link && _isSubjectReference(element)) {
            if (!options.link.hasOwnProperty(element["@id"])) {
              options.link[element["@id"]] = [];
            }
            options.link[element["@id"]].push({ expanded: element, compacted: rval2 });
          }
          return rval2;
        }
        if (_isList(element)) {
          const container = _getContextValue(
            activeCtx,
            activeProperty,
            "@container"
          ) || [];
          if (container.includes("@list")) {
            return api.compact({
              activeCtx,
              activeProperty,
              element: element["@list"],
              options
            });
          }
        }
        const insideReverse = activeProperty === "@reverse";
        const rval = {};
        const inputCtx = activeCtx;
        if (!_isValue(element) && !_isSubjectReference(element)) {
          activeCtx = activeCtx.revertToPreviousContext();
        }
        const propertyScopedCtx = _getContextValue(inputCtx, activeProperty, "@context");
        if (!_isUndefined(propertyScopedCtx)) {
          activeCtx = await _processContext({
            activeCtx,
            localCtx: propertyScopedCtx,
            propagate: true,
            overrideProtected: true,
            options
          });
        }
        if (options.link && "@id" in element) {
          if (!options.link.hasOwnProperty(element["@id"])) {
            options.link[element["@id"]] = [];
          }
          options.link[element["@id"]].push({ expanded: element, compacted: rval });
        }
        let types = element["@type"] || [];
        if (types.length > 1) {
          types = Array.from(types).sort();
        }
        const typeContext = activeCtx;
        for (const type of types) {
          const compactedType = api.compactIri(
            { activeCtx: typeContext, iri: type, relativeTo: { vocab: true } }
          );
          const ctx2 = _getContextValue(inputCtx, compactedType, "@context");
          if (!_isUndefined(ctx2)) {
            activeCtx = await _processContext({
              activeCtx,
              localCtx: ctx2,
              options,
              propagate: false
            });
          }
        }
        const keys = Object.keys(element).sort();
        for (const expandedProperty of keys) {
          const expandedValue = element[expandedProperty];
          if (expandedProperty === "@id") {
            let compactedValue = _asArray(expandedValue).map(
              (expandedIri) => api.compactIri({
                activeCtx,
                iri: expandedIri,
                relativeTo: { vocab: false },
                base: options.base
              })
            );
            if (compactedValue.length === 1) {
              compactedValue = compactedValue[0];
            }
            const alias = api.compactIri(
              { activeCtx, iri: "@id", relativeTo: { vocab: true } }
            );
            rval[alias] = compactedValue;
            continue;
          }
          if (expandedProperty === "@type") {
            let compactedValue = _asArray(expandedValue).map(
              (expandedIri) => api.compactIri({
                activeCtx: inputCtx,
                iri: expandedIri,
                relativeTo: { vocab: true }
              })
            );
            if (compactedValue.length === 1) {
              compactedValue = compactedValue[0];
            }
            const alias = api.compactIri(
              { activeCtx, iri: "@type", relativeTo: { vocab: true } }
            );
            const container = _getContextValue(
              activeCtx,
              alias,
              "@container"
            ) || [];
            const typeAsSet = container.includes("@set") && _processingMode(activeCtx, 1.1);
            const isArray = typeAsSet || _isArray(compactedValue) && expandedValue.length === 0;
            _addValue(rval, alias, compactedValue, { propertyIsArray: isArray });
            continue;
          }
          if (expandedProperty === "@reverse") {
            const compactedValue = await api.compact({
              activeCtx,
              activeProperty: "@reverse",
              element: expandedValue,
              options
            });
            for (const compactedProperty in compactedValue) {
              if (activeCtx.mappings.has(compactedProperty) && activeCtx.mappings.get(compactedProperty).reverse) {
                const value = compactedValue[compactedProperty];
                const container = _getContextValue(
                  activeCtx,
                  compactedProperty,
                  "@container"
                ) || [];
                const useArray = container.includes("@set") || !options.compactArrays;
                _addValue(
                  rval,
                  compactedProperty,
                  value,
                  { propertyIsArray: useArray }
                );
                delete compactedValue[compactedProperty];
              }
            }
            if (Object.keys(compactedValue).length > 0) {
              const alias = api.compactIri({
                activeCtx,
                iri: expandedProperty,
                relativeTo: { vocab: true }
              });
              _addValue(rval, alias, compactedValue);
            }
            continue;
          }
          if (expandedProperty === "@preserve") {
            const compactedValue = await api.compact({
              activeCtx,
              activeProperty,
              element: expandedValue,
              options
            });
            if (!(_isArray(compactedValue) && compactedValue.length === 0)) {
              _addValue(rval, expandedProperty, compactedValue);
            }
            continue;
          }
          if (expandedProperty === "@index") {
            const container = _getContextValue(
              activeCtx,
              activeProperty,
              "@container"
            ) || [];
            if (container.includes("@index")) {
              continue;
            }
            const alias = api.compactIri({
              activeCtx,
              iri: expandedProperty,
              relativeTo: { vocab: true }
            });
            _addValue(rval, alias, expandedValue);
            continue;
          }
          if (expandedProperty !== "@graph" && expandedProperty !== "@list" && expandedProperty !== "@included" && _isKeyword(expandedProperty)) {
            const alias = api.compactIri({
              activeCtx,
              iri: expandedProperty,
              relativeTo: { vocab: true }
            });
            _addValue(rval, alias, expandedValue);
            continue;
          }
          if (!_isArray(expandedValue)) {
            throw new JsonLdError(
              "JSON-LD expansion error; expanded value must be an array.",
              "jsonld.SyntaxError"
            );
          }
          if (expandedValue.length === 0) {
            const itemActiveProperty = api.compactIri({
              activeCtx,
              iri: expandedProperty,
              value: expandedValue,
              relativeTo: { vocab: true },
              reverse: insideReverse
            });
            const nestProperty = activeCtx.mappings.has(itemActiveProperty) ? activeCtx.mappings.get(itemActiveProperty)["@nest"] : null;
            let nestResult = rval;
            if (nestProperty) {
              _checkNestProperty(activeCtx, nestProperty, options);
              if (!_isObject(rval[nestProperty])) {
                rval[nestProperty] = {};
              }
              nestResult = rval[nestProperty];
            }
            _addValue(
              nestResult,
              itemActiveProperty,
              expandedValue,
              {
                propertyIsArray: true
              }
            );
          }
          for (const expandedItem of expandedValue) {
            const itemActiveProperty = api.compactIri({
              activeCtx,
              iri: expandedProperty,
              value: expandedItem,
              relativeTo: { vocab: true },
              reverse: insideReverse
            });
            const nestProperty = activeCtx.mappings.has(itemActiveProperty) ? activeCtx.mappings.get(itemActiveProperty)["@nest"] : null;
            let nestResult = rval;
            if (nestProperty) {
              _checkNestProperty(activeCtx, nestProperty, options);
              if (!_isObject(rval[nestProperty])) {
                rval[nestProperty] = {};
              }
              nestResult = rval[nestProperty];
            }
            const container = _getContextValue(
              activeCtx,
              itemActiveProperty,
              "@container"
            ) || [];
            const isGraph = _isGraph(expandedItem);
            const isList = _isList(expandedItem);
            let inner;
            if (isList) {
              inner = expandedItem["@list"];
            } else if (isGraph) {
              inner = expandedItem["@graph"];
            }
            let compactedItem = await api.compact({
              activeCtx,
              activeProperty: itemActiveProperty,
              element: isList || isGraph ? inner : expandedItem,
              options
            });
            if (isList) {
              if (!_isArray(compactedItem)) {
                compactedItem = [compactedItem];
              }
              if (!container.includes("@list")) {
                compactedItem = {
                  [api.compactIri({
                    activeCtx,
                    iri: "@list",
                    relativeTo: { vocab: true }
                  })]: compactedItem
                };
                if ("@index" in expandedItem) {
                  compactedItem[api.compactIri({
                    activeCtx,
                    iri: "@index",
                    relativeTo: { vocab: true }
                  })] = expandedItem["@index"];
                }
              } else {
                _addValue(nestResult, itemActiveProperty, compactedItem, {
                  valueIsArray: true,
                  allowDuplicate: true
                });
                continue;
              }
            }
            if (isGraph) {
              if (container.includes("@graph") && (container.includes("@id") || container.includes("@index") && _isSimpleGraph(expandedItem))) {
                let mapObject;
                if (nestResult.hasOwnProperty(itemActiveProperty)) {
                  mapObject = nestResult[itemActiveProperty];
                } else {
                  nestResult[itemActiveProperty] = mapObject = {};
                }
                const key = (container.includes("@id") ? expandedItem["@id"] : expandedItem["@index"]) || api.compactIri({
                  activeCtx,
                  iri: "@none",
                  relativeTo: { vocab: true }
                });
                _addValue(
                  mapObject,
                  key,
                  compactedItem,
                  {
                    propertyIsArray: !options.compactArrays || container.includes("@set")
                  }
                );
              } else if (container.includes("@graph") && _isSimpleGraph(expandedItem)) {
                if (_isArray(compactedItem) && compactedItem.length > 1) {
                  compactedItem = { "@included": compactedItem };
                }
                _addValue(
                  nestResult,
                  itemActiveProperty,
                  compactedItem,
                  {
                    propertyIsArray: !options.compactArrays || container.includes("@set")
                  }
                );
              } else {
                if (_isArray(compactedItem) && compactedItem.length === 1 && options.compactArrays) {
                  compactedItem = compactedItem[0];
                }
                compactedItem = {
                  [api.compactIri({
                    activeCtx,
                    iri: "@graph",
                    relativeTo: { vocab: true }
                  })]: compactedItem
                };
                if ("@id" in expandedItem) {
                  compactedItem[api.compactIri({
                    activeCtx,
                    iri: "@id",
                    relativeTo: { vocab: true }
                  })] = expandedItem["@id"];
                }
                if ("@index" in expandedItem) {
                  compactedItem[api.compactIri({
                    activeCtx,
                    iri: "@index",
                    relativeTo: { vocab: true }
                  })] = expandedItem["@index"];
                }
                _addValue(
                  nestResult,
                  itemActiveProperty,
                  compactedItem,
                  {
                    propertyIsArray: !options.compactArrays || container.includes("@set")
                  }
                );
              }
            } else if (container.includes("@language") || container.includes("@index") || container.includes("@id") || container.includes("@type")) {
              let mapObject;
              if (nestResult.hasOwnProperty(itemActiveProperty)) {
                mapObject = nestResult[itemActiveProperty];
              } else {
                nestResult[itemActiveProperty] = mapObject = {};
              }
              let key;
              if (container.includes("@language")) {
                if (_isValue(compactedItem)) {
                  compactedItem = compactedItem["@value"];
                }
                key = expandedItem["@language"];
              } else if (container.includes("@index")) {
                const indexKey = _getContextValue(
                  activeCtx,
                  itemActiveProperty,
                  "@index"
                ) || "@index";
                const containerKey = api.compactIri(
                  { activeCtx, iri: indexKey, relativeTo: { vocab: true } }
                );
                if (indexKey === "@index") {
                  key = expandedItem["@index"];
                  delete compactedItem[containerKey];
                } else {
                  let others;
                  [key, ...others] = _asArray(compactedItem[indexKey] || []);
                  if (!_isString(key)) {
                    key = null;
                  } else {
                    switch (others.length) {
                      case 0:
                        delete compactedItem[indexKey];
                        break;
                      case 1:
                        compactedItem[indexKey] = others[0];
                        break;
                      default:
                        compactedItem[indexKey] = others;
                        break;
                    }
                  }
                }
              } else if (container.includes("@id")) {
                const idKey = api.compactIri({
                  activeCtx,
                  iri: "@id",
                  relativeTo: { vocab: true }
                });
                key = compactedItem[idKey];
                delete compactedItem[idKey];
              } else if (container.includes("@type")) {
                const typeKey = api.compactIri({
                  activeCtx,
                  iri: "@type",
                  relativeTo: { vocab: true }
                });
                let types2;
                [key, ...types2] = _asArray(compactedItem[typeKey] || []);
                switch (types2.length) {
                  case 0:
                    delete compactedItem[typeKey];
                    break;
                  case 1:
                    compactedItem[typeKey] = types2[0];
                    break;
                  default:
                    compactedItem[typeKey] = types2;
                    break;
                }
                if (Object.keys(compactedItem).length === 1 && "@id" in expandedItem) {
                  compactedItem = await api.compact({
                    activeCtx,
                    activeProperty: itemActiveProperty,
                    element: { "@id": expandedItem["@id"] },
                    options
                  });
                }
              }
              if (!key) {
                key = api.compactIri({
                  activeCtx,
                  iri: "@none",
                  relativeTo: { vocab: true }
                });
              }
              _addValue(
                mapObject,
                key,
                compactedItem,
                {
                  propertyIsArray: container.includes("@set")
                }
              );
            } else {
              const isArray = !options.compactArrays || container.includes("@set") || container.includes("@list") || _isArray(compactedItem) && compactedItem.length === 0 || expandedProperty === "@list" || expandedProperty === "@graph";
              _addValue(
                nestResult,
                itemActiveProperty,
                compactedItem,
                { propertyIsArray: isArray }
              );
            }
          }
        }
        return rval;
      }
      return element;
    };
    api.compactIri = ({
      activeCtx,
      iri,
      value = null,
      relativeTo = { vocab: false },
      reverse = false,
      base = null
    }) => {
      if (iri === null) {
        return iri;
      }
      if (activeCtx.isPropertyTermScoped && activeCtx.previousContext) {
        activeCtx = activeCtx.previousContext;
      }
      const inverseCtx = activeCtx.getInverse();
      if (_isKeyword(iri) && iri in inverseCtx && "@none" in inverseCtx[iri] && "@type" in inverseCtx[iri]["@none"] && "@none" in inverseCtx[iri]["@none"]["@type"]) {
        return inverseCtx[iri]["@none"]["@type"]["@none"];
      }
      if (relativeTo.vocab && iri in inverseCtx) {
        const defaultLanguage = activeCtx["@language"] || "@none";
        const containers = [];
        if (_isObject(value) && "@index" in value && !("@graph" in value)) {
          containers.push("@index", "@index@set");
        }
        if (_isObject(value) && "@preserve" in value) {
          value = value["@preserve"][0];
        }
        if (_isGraph(value)) {
          if ("@index" in value) {
            containers.push(
              "@graph@index",
              "@graph@index@set",
              "@index",
              "@index@set"
            );
          }
          if ("@id" in value) {
            containers.push(
              "@graph@id",
              "@graph@id@set"
            );
          }
          containers.push("@graph", "@graph@set", "@set");
          if (!("@index" in value)) {
            containers.push(
              "@graph@index",
              "@graph@index@set",
              "@index",
              "@index@set"
            );
          }
          if (!("@id" in value)) {
            containers.push("@graph@id", "@graph@id@set");
          }
        } else if (_isObject(value) && !_isValue(value)) {
          containers.push("@id", "@id@set", "@type", "@set@type");
        }
        let typeOrLanguage = "@language";
        let typeOrLanguageValue = "@null";
        if (reverse) {
          typeOrLanguage = "@type";
          typeOrLanguageValue = "@reverse";
          containers.push("@set");
        } else if (_isList(value)) {
          if (!("@index" in value)) {
            containers.push("@list");
          }
          const list = value["@list"];
          if (list.length === 0) {
            typeOrLanguage = "@any";
            typeOrLanguageValue = "@none";
          } else {
            let commonLanguage = list.length === 0 ? defaultLanguage : null;
            let commonType = null;
            for (let i = 0; i < list.length; ++i) {
              const item = list[i];
              let itemLanguage = "@none";
              let itemType = "@none";
              if (_isValue(item)) {
                if ("@direction" in item) {
                  const lang = (item["@language"] || "").toLowerCase();
                  const dir = item["@direction"];
                  itemLanguage = `${lang}_${dir}`;
                } else if ("@language" in item) {
                  itemLanguage = item["@language"].toLowerCase();
                } else if ("@type" in item) {
                  itemType = item["@type"];
                } else {
                  itemLanguage = "@null";
                }
              } else {
                itemType = "@id";
              }
              if (commonLanguage === null) {
                commonLanguage = itemLanguage;
              } else if (itemLanguage !== commonLanguage && _isValue(item)) {
                commonLanguage = "@none";
              }
              if (commonType === null) {
                commonType = itemType;
              } else if (itemType !== commonType) {
                commonType = "@none";
              }
              if (commonLanguage === "@none" && commonType === "@none") {
                break;
              }
            }
            commonLanguage = commonLanguage || "@none";
            commonType = commonType || "@none";
            if (commonType !== "@none") {
              typeOrLanguage = "@type";
              typeOrLanguageValue = commonType;
            } else {
              typeOrLanguageValue = commonLanguage;
            }
          }
        } else {
          if (_isValue(value)) {
            if ("@language" in value && !("@index" in value)) {
              containers.push("@language", "@language@set");
              typeOrLanguageValue = value["@language"];
              const dir = value["@direction"];
              if (dir) {
                typeOrLanguageValue = `${typeOrLanguageValue}_${dir}`;
              }
            } else if ("@direction" in value && !("@index" in value)) {
              typeOrLanguageValue = `_${value["@direction"]}`;
            } else if ("@type" in value) {
              typeOrLanguage = "@type";
              typeOrLanguageValue = value["@type"];
            }
          } else {
            typeOrLanguage = "@type";
            typeOrLanguageValue = "@id";
          }
          containers.push("@set");
        }
        containers.push("@none");
        if (_isObject(value) && !("@index" in value)) {
          containers.push("@index", "@index@set");
        }
        if (_isValue(value) && Object.keys(value).length === 1) {
          containers.push("@language", "@language@set");
        }
        const term = _selectTerm(
          activeCtx,
          iri,
          value,
          containers,
          typeOrLanguage,
          typeOrLanguageValue
        );
        if (term !== null) {
          return term;
        }
      }
      if (relativeTo.vocab) {
        if ("@vocab" in activeCtx) {
          const vocab = activeCtx["@vocab"];
          if (iri.indexOf(vocab) === 0 && iri !== vocab) {
            const suffix = iri.substr(vocab.length);
            if (!activeCtx.mappings.has(suffix)) {
              return suffix;
            }
          }
        }
      }
      let choice = null;
      const partialMatches = [];
      let iriMap = activeCtx.fastCurieMap;
      const maxPartialLength = iri.length - 1;
      for (let i = 0; i < maxPartialLength && iri[i] in iriMap; ++i) {
        iriMap = iriMap[iri[i]];
        if ("" in iriMap) {
          partialMatches.push(iriMap[""][0]);
        }
      }
      for (let i = partialMatches.length - 1; i >= 0; --i) {
        const entry = partialMatches[i];
        const terms = entry.terms;
        for (const term of terms) {
          const curie = term + ":" + iri.substr(entry.iri.length);
          const isUsableCurie = activeCtx.mappings.get(term)._prefix && (!activeCtx.mappings.has(curie) || value === null && activeCtx.mappings.get(curie)["@id"] === iri);
          if (isUsableCurie && (choice === null || _compareShortestLeast(curie, choice) < 0)) {
            choice = curie;
          }
        }
      }
      if (choice !== null) {
        return choice;
      }
      for (const [term, td] of activeCtx.mappings) {
        if (td && td._prefix && iri.startsWith(term + ":")) {
          throw new JsonLdError(
            `Absolute IRI "${iri}" confused with prefix "${term}".`,
            "jsonld.SyntaxError",
            { code: "IRI confused with prefix", context: activeCtx }
          );
        }
      }
      if (!relativeTo.vocab) {
        if ("@base" in activeCtx) {
          if (!activeCtx["@base"]) {
            return iri;
          } else {
            const _iri = _removeBase(_prependBase(base, activeCtx["@base"]), iri);
            return REGEX_KEYWORD.test(_iri) ? `./${_iri}` : _iri;
          }
        } else {
          return _removeBase(base, iri);
        }
      }
      return iri;
    };
    api.compactValue = ({ activeCtx, activeProperty, value, options }) => {
      if (_isValue(value)) {
        const type2 = _getContextValue(activeCtx, activeProperty, "@type");
        const language = _getContextValue(activeCtx, activeProperty, "@language");
        const direction = _getContextValue(activeCtx, activeProperty, "@direction");
        const container = _getContextValue(activeCtx, activeProperty, "@container") || [];
        const preserveIndex = "@index" in value && !container.includes("@index");
        if (!preserveIndex && type2 !== "@none") {
          if (value["@type"] === type2) {
            return value["@value"];
          }
          if ("@language" in value && value["@language"] === language && "@direction" in value && value["@direction"] === direction) {
            return value["@value"];
          }
          if ("@language" in value && value["@language"] === language) {
            return value["@value"];
          }
          if ("@direction" in value && value["@direction"] === direction) {
            return value["@value"];
          }
        }
        const keyCount = Object.keys(value).length;
        const isValueOnlyKey = keyCount === 1 || keyCount === 2 && "@index" in value && !preserveIndex;
        const hasDefaultLanguage = "@language" in activeCtx;
        const isValueString = _isString(value["@value"]);
        const hasNullMapping = activeCtx.mappings.has(activeProperty) && activeCtx.mappings.get(activeProperty)["@language"] === null;
        if (isValueOnlyKey && type2 !== "@none" && (!hasDefaultLanguage || !isValueString || hasNullMapping)) {
          return value["@value"];
        }
        const rval = {};
        if (preserveIndex) {
          rval[api.compactIri({
            activeCtx,
            iri: "@index",
            relativeTo: { vocab: true }
          })] = value["@index"];
        }
        if ("@type" in value) {
          rval[api.compactIri({
            activeCtx,
            iri: "@type",
            relativeTo: { vocab: true }
          })] = api.compactIri(
            { activeCtx, iri: value["@type"], relativeTo: { vocab: true } }
          );
        } else if ("@language" in value) {
          rval[api.compactIri({
            activeCtx,
            iri: "@language",
            relativeTo: { vocab: true }
          })] = value["@language"];
        }
        if ("@direction" in value) {
          rval[api.compactIri({
            activeCtx,
            iri: "@direction",
            relativeTo: { vocab: true }
          })] = value["@direction"];
        }
        rval[api.compactIri({
          activeCtx,
          iri: "@value",
          relativeTo: { vocab: true }
        })] = value["@value"];
        return rval;
      }
      const expandedProperty = _expandIri(
        activeCtx,
        activeProperty,
        { vocab: true },
        options
      );
      const type = _getContextValue(activeCtx, activeProperty, "@type");
      const compacted = api.compactIri({
        activeCtx,
        iri: value["@id"],
        relativeTo: { vocab: type === "@vocab" },
        base: options.base
      });
      if (type === "@id" || type === "@vocab" || expandedProperty === "@graph") {
        return compacted;
      }
      return {
        [api.compactIri({
          activeCtx,
          iri: "@id",
          relativeTo: { vocab: true }
        })]: compacted
      };
    };
    function _selectTerm(activeCtx, iri, value, containers, typeOrLanguage, typeOrLanguageValue) {
      if (typeOrLanguageValue === null) {
        typeOrLanguageValue = "@null";
      }
      const prefs = [];
      if ((typeOrLanguageValue === "@id" || typeOrLanguageValue === "@reverse") && _isObject(value) && "@id" in value) {
        if (typeOrLanguageValue === "@reverse") {
          prefs.push("@reverse");
        }
        const term = api.compactIri(
          { activeCtx, iri: value["@id"], relativeTo: { vocab: true } }
        );
        if (activeCtx.mappings.has(term) && activeCtx.mappings.get(term) && activeCtx.mappings.get(term)["@id"] === value["@id"]) {
          prefs.push.apply(prefs, ["@vocab", "@id"]);
        } else {
          prefs.push.apply(prefs, ["@id", "@vocab"]);
        }
      } else {
        prefs.push(typeOrLanguageValue);
        const langDir = prefs.find((el) => el.includes("_"));
        if (langDir) {
          prefs.push(langDir.replace(/^[^_]+_/, "_"));
        }
      }
      prefs.push("@none");
      const containerMap = activeCtx.inverse[iri];
      for (const container of containers) {
        if (!(container in containerMap)) {
          continue;
        }
        const typeOrLanguageValueMap = containerMap[container][typeOrLanguage];
        for (const pref of prefs) {
          if (!(pref in typeOrLanguageValueMap)) {
            continue;
          }
          return typeOrLanguageValueMap[pref];
        }
      }
      return null;
    }
    function _checkNestProperty(activeCtx, nestProperty, options) {
      if (_expandIri(activeCtx, nestProperty, { vocab: true }, options) !== "@nest") {
        throw new JsonLdError(
          "JSON-LD compact error; nested property must have an @nest value resolving to @nest.",
          "jsonld.SyntaxError",
          { code: "invalid @nest value" }
        );
      }
    }
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/JsonLdProcessor.js
var require_JsonLdProcessor = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/JsonLdProcessor.js"(exports, module) {
    "use strict";
    module.exports = (jsonld2) => {
      class JsonLdProcessor {
        toString() {
          return "[object JsonLdProcessor]";
        }
      }
      Object.defineProperty(JsonLdProcessor, "prototype", {
        writable: false,
        enumerable: false
      });
      Object.defineProperty(JsonLdProcessor.prototype, "constructor", {
        writable: true,
        enumerable: false,
        configurable: true,
        value: JsonLdProcessor
      });
      JsonLdProcessor.compact = function(input, ctx) {
        if (arguments.length < 2) {
          return Promise.reject(
            new TypeError("Could not compact, too few arguments.")
          );
        }
        return jsonld2.compact(input, ctx);
      };
      JsonLdProcessor.expand = function(input) {
        if (arguments.length < 1) {
          return Promise.reject(
            new TypeError("Could not expand, too few arguments.")
          );
        }
        return jsonld2.expand(input);
      };
      JsonLdProcessor.flatten = function(input) {
        if (arguments.length < 1) {
          return Promise.reject(
            new TypeError("Could not flatten, too few arguments.")
          );
        }
        return jsonld2.flatten(input);
      };
      return JsonLdProcessor;
    };
  }
});

// node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/jsonld.js
var require_jsonld = __commonJS({
  "node_modules/.pnpm/jsonld@9.0.0/node_modules/jsonld/lib/jsonld.js"(exports, module) {
    var canonize = require_rdf_canonize();
    var platform = require_platform_browser2();
    var util = require_util();
    var ContextResolver = require_ContextResolver();
    var IdentifierIssuer = util.IdentifierIssuer;
    var JsonLdError = require_JsonLdError();
    var LRU = require_lru_cache();
    var NQuads = require_NQuads2();
    var { expand: _expand } = require_expand();
    var { flatten: _flatten } = require_flatten();
    var { fromRDF: _fromRDF } = require_fromRdf();
    var { toRDF: _toRDF } = require_toRdf();
    var {
      frameMergedOrDefault: _frameMergedOrDefault,
      cleanupNull: _cleanupNull
    } = require_frame();
    var {
      isArray: _isArray,
      isObject: _isObject,
      isString: _isString
    } = require_types();
    var {
      isSubjectReference: _isSubjectReference
    } = require_graphTypes();
    var {
      expandIri: _expandIri,
      getInitialContext: _getInitialContext,
      process: _processContext,
      processingMode: _processingMode
    } = require_context();
    var {
      compact: _compact,
      compactIri: _compactIri
    } = require_compact();
    var {
      createNodeMap: _createNodeMap,
      createMergedNodeMap: _createMergedNodeMap,
      mergeNodeMaps: _mergeNodeMaps
    } = require_nodeMap();
    var {
      logEventHandler: _logEventHandler,
      logWarningEventHandler: _logWarningEventHandler,
      safeEventHandler: _safeEventHandler,
      setDefaultEventHandler: _setDefaultEventHandler,
      setupEventHandler: _setupEventHandler,
      strictEventHandler: _strictEventHandler,
      unhandledEventHandler: _unhandledEventHandler
    } = require_events();
    var wrapper = function(jsonld2) {
      const _rdfParsers = {};
      const RESOLVED_CONTEXT_CACHE_MAX_SIZE = 100;
      const _resolvedContextCache = new LRU({ max: RESOLVED_CONTEXT_CACHE_MAX_SIZE });
      jsonld2.compact = async function(input, ctx, options) {
        if (arguments.length < 2) {
          throw new TypeError("Could not compact, too few arguments.");
        }
        if (ctx === null) {
          throw new JsonLdError(
            "The compaction context must not be null.",
            "jsonld.CompactError",
            { code: "invalid local context" }
          );
        }
        if (input === null) {
          return null;
        }
        options = _setDefaults(options, {
          base: _isString(input) ? input : "",
          compactArrays: true,
          compactToRelative: true,
          graph: false,
          skipExpansion: false,
          link: false,
          issuer: new IdentifierIssuer("_:b"),
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        if (options.link) {
          options.skipExpansion = true;
        }
        if (!options.compactToRelative) {
          delete options.base;
        }
        let expanded;
        if (options.skipExpansion) {
          expanded = input;
        } else {
          expanded = await jsonld2.expand(input, options);
        }
        const activeCtx = await jsonld2.processContext(
          _getInitialContext(options),
          ctx,
          options
        );
        let compacted = await _compact({
          activeCtx,
          element: expanded,
          options
        });
        if (options.compactArrays && !options.graph && _isArray(compacted)) {
          if (compacted.length === 1) {
            compacted = compacted[0];
          } else if (compacted.length === 0) {
            compacted = {};
          }
        } else if (options.graph && _isObject(compacted)) {
          compacted = [compacted];
        }
        if (_isObject(ctx) && "@context" in ctx) {
          ctx = ctx["@context"];
        }
        ctx = util.clone(ctx);
        if (!_isArray(ctx)) {
          ctx = [ctx];
        }
        const tmp = ctx;
        ctx = [];
        for (let i = 0; i < tmp.length; ++i) {
          if (!_isObject(tmp[i]) || Object.keys(tmp[i]).length > 0) {
            ctx.push(tmp[i]);
          }
        }
        const hasContext = ctx.length > 0;
        if (ctx.length === 1) {
          ctx = ctx[0];
        }
        if (_isArray(compacted)) {
          const graphAlias = _compactIri({
            activeCtx,
            iri: "@graph",
            relativeTo: { vocab: true }
          });
          const graph = compacted;
          compacted = {};
          if (hasContext) {
            compacted["@context"] = ctx;
          }
          compacted[graphAlias] = graph;
        } else if (_isObject(compacted) && hasContext) {
          const graph = compacted;
          compacted = { "@context": ctx };
          for (const key in graph) {
            compacted[key] = graph[key];
          }
        }
        return compacted;
      };
      jsonld2.expand = async function(input, options) {
        if (arguments.length < 1) {
          throw new TypeError("Could not expand, too few arguments.");
        }
        options = _setDefaults(options, {
          keepFreeFloatingNodes: false,
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        const toResolve = {};
        const contextsToProcess = [];
        if ("expandContext" in options) {
          const expandContext = util.clone(options.expandContext);
          if (_isObject(expandContext) && "@context" in expandContext) {
            toResolve.expandContext = expandContext;
          } else {
            toResolve.expandContext = { "@context": expandContext };
          }
          contextsToProcess.push(toResolve.expandContext);
        }
        let defaultBase;
        if (!_isString(input)) {
          toResolve.input = util.clone(input);
        } else {
          const remoteDoc = await jsonld2.get(input, options);
          defaultBase = remoteDoc.documentUrl;
          toResolve.input = remoteDoc.document;
          if (remoteDoc.contextUrl) {
            toResolve.remoteContext = { "@context": remoteDoc.contextUrl };
            contextsToProcess.push(toResolve.remoteContext);
          }
        }
        if (!("base" in options)) {
          options.base = defaultBase || "";
        }
        let activeCtx = _getInitialContext(options);
        for (const localCtx of contextsToProcess) {
          activeCtx = await _processContext({ activeCtx, localCtx, options });
        }
        let expanded = await _expand({
          activeCtx,
          element: toResolve.input,
          options
        });
        if (_isObject(expanded) && "@graph" in expanded && Object.keys(expanded).length === 1) {
          expanded = expanded["@graph"];
        } else if (expanded === null) {
          expanded = [];
        }
        if (!_isArray(expanded)) {
          expanded = [expanded];
        }
        return expanded;
      };
      jsonld2.flatten = async function(input, ctx, options) {
        if (arguments.length < 1) {
          return new TypeError("Could not flatten, too few arguments.");
        }
        if (typeof ctx === "function") {
          ctx = null;
        } else {
          ctx = ctx || null;
        }
        options = _setDefaults(options, {
          base: _isString(input) ? input : "",
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        const expanded = await jsonld2.expand(input, options);
        const flattened = _flatten(expanded);
        if (ctx === null) {
          return flattened;
        }
        options.graph = true;
        options.skipExpansion = true;
        const compacted = await jsonld2.compact(flattened, ctx, options);
        return compacted;
      };
      jsonld2.frame = async function(input, frame, options) {
        if (arguments.length < 2) {
          throw new TypeError("Could not frame, too few arguments.");
        }
        options = _setDefaults(options, {
          base: _isString(input) ? input : "",
          embed: "@once",
          explicit: false,
          requireAll: false,
          omitDefault: false,
          bnodesToClear: [],
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        if (_isString(frame)) {
          const remoteDoc = await jsonld2.get(frame, options);
          frame = remoteDoc.document;
          if (remoteDoc.contextUrl) {
            let ctx = frame["@context"];
            if (!ctx) {
              ctx = remoteDoc.contextUrl;
            } else if (_isArray(ctx)) {
              ctx.push(remoteDoc.contextUrl);
            } else {
              ctx = [ctx, remoteDoc.contextUrl];
            }
            frame["@context"] = ctx;
          }
        }
        const frameContext = frame ? frame["@context"] || {} : {};
        const activeCtx = await jsonld2.processContext(
          _getInitialContext(options),
          frameContext,
          options
        );
        if (!options.hasOwnProperty("omitGraph")) {
          options.omitGraph = _processingMode(activeCtx, 1.1);
        }
        if (!options.hasOwnProperty("pruneBlankNodeIdentifiers")) {
          options.pruneBlankNodeIdentifiers = _processingMode(activeCtx, 1.1);
        }
        const expanded = await jsonld2.expand(input, options);
        const opts = { ...options };
        opts.isFrame = true;
        opts.keepFreeFloatingNodes = true;
        const expandedFrame = await jsonld2.expand(frame, opts);
        const frameKeys = Object.keys(frame).map((key) => _expandIri(activeCtx, key, { vocab: true }));
        opts.merged = !frameKeys.includes("@graph");
        opts.is11 = _processingMode(activeCtx, 1.1);
        const framed = _frameMergedOrDefault(expanded, expandedFrame, opts);
        opts.graph = !options.omitGraph;
        opts.skipExpansion = true;
        opts.link = {};
        opts.framing = true;
        let compacted = await jsonld2.compact(framed, frameContext, opts);
        opts.link = {};
        compacted = _cleanupNull(compacted, opts);
        return compacted;
      };
      jsonld2.link = async function(input, ctx, options) {
        const frame = {};
        if (ctx) {
          frame["@context"] = ctx;
        }
        frame["@embed"] = "@link";
        return jsonld2.frame(input, frame, options);
      };
      jsonld2.normalize = jsonld2.canonize = async function(input, options) {
        if (arguments.length < 1) {
          throw new TypeError("Could not canonize, too few arguments.");
        }
        options = _setDefaults(options, {
          skipExpansion: false,
          safe: true,
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        const canonizeOptions = Object.assign({}, {
          algorithm: "RDFC-1.0"
        }, options.canonizeOptions || null);
        if ("inputFormat" in options) {
          if (options.inputFormat !== "application/n-quads") {
            throw new JsonLdError(
              "Unknown canonicalization input format.",
              "jsonld.CanonizeError"
            );
          }
          const parsedInput = NQuads.parse(input);
          return canonize.canonize(parsedInput, canonizeOptions);
        }
        const opts = { ...options };
        delete opts.format;
        delete opts.canonizeOptions;
        opts.produceGeneralizedRdf = false;
        const dataset = await jsonld2.toRDF(input, opts);
        return canonize.canonize(dataset, canonizeOptions);
      };
      jsonld2.fromRDF = async function(dataset, options) {
        if (arguments.length < 1) {
          throw new TypeError("Could not convert from RDF, too few arguments.");
        }
        options = _setDefaults(options, {
          format: _isString(dataset) ? "application/n-quads" : void 0
        });
        const { format } = options;
        let { rdfParser } = options;
        if (format) {
          rdfParser = rdfParser || _rdfParsers[format];
          if (!rdfParser) {
            throw new JsonLdError(
              "Unknown input format.",
              "jsonld.UnknownFormat",
              { format }
            );
          }
        } else {
          rdfParser = () => dataset;
        }
        const parsedDataset = await rdfParser(dataset);
        return _fromRDF(parsedDataset, options);
      };
      jsonld2.toRDF = async function(input, options) {
        if (arguments.length < 1) {
          throw new TypeError("Could not convert to RDF, too few arguments.");
        }
        options = _setDefaults(options, {
          skipExpansion: false,
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        let expanded;
        if (options.skipExpansion) {
          expanded = input;
        } else {
          expanded = await jsonld2.expand(input, options);
        }
        const dataset = _toRDF(expanded, options);
        if (options.format) {
          if (options.format === "application/n-quads") {
            return NQuads.serialize(dataset);
          }
          throw new JsonLdError(
            "Unknown output format.",
            "jsonld.UnknownFormat",
            { format: options.format }
          );
        }
        return dataset;
      };
      jsonld2.createNodeMap = async function(input, options) {
        if (arguments.length < 1) {
          throw new TypeError("Could not create node map, too few arguments.");
        }
        options = _setDefaults(options, {
          base: _isString(input) ? input : "",
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        const expanded = await jsonld2.expand(input, options);
        return _createMergedNodeMap(expanded, options);
      };
      jsonld2.merge = async function(docs, ctx, options) {
        if (arguments.length < 1) {
          throw new TypeError("Could not merge, too few arguments.");
        }
        if (!_isArray(docs)) {
          throw new TypeError('Could not merge, "docs" must be an array.');
        }
        if (typeof ctx === "function") {
          ctx = null;
        } else {
          ctx = ctx || null;
        }
        options = _setDefaults(options, {
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        const expanded = await Promise.all(docs.map((doc) => {
          const opts = { ...options };
          return jsonld2.expand(doc, opts);
        }));
        let mergeNodes = true;
        if ("mergeNodes" in options) {
          mergeNodes = options.mergeNodes;
        }
        const issuer = options.issuer || new IdentifierIssuer("_:b");
        const graphs = { "@default": {} };
        for (let i = 0; i < expanded.length; ++i) {
          const doc = util.relabelBlankNodes(expanded[i], {
            issuer: new IdentifierIssuer("_:b" + i + "-")
          });
          const _graphs = mergeNodes || i === 0 ? graphs : { "@default": {} };
          _createNodeMap(doc, _graphs, "@default", issuer);
          if (_graphs !== graphs) {
            for (const graphName in _graphs) {
              const _nodeMap = _graphs[graphName];
              if (!(graphName in graphs)) {
                graphs[graphName] = _nodeMap;
                continue;
              }
              const nodeMap = graphs[graphName];
              for (const key in _nodeMap) {
                if (!(key in nodeMap)) {
                  nodeMap[key] = _nodeMap[key];
                }
              }
            }
          }
        }
        const defaultGraph = _mergeNodeMaps(graphs);
        const flattened = [];
        const keys = Object.keys(defaultGraph).sort();
        for (let ki = 0; ki < keys.length; ++ki) {
          const node = defaultGraph[keys[ki]];
          if (!_isSubjectReference(node)) {
            flattened.push(node);
          }
        }
        if (ctx === null) {
          return flattened;
        }
        options.graph = true;
        options.skipExpansion = true;
        const compacted = await jsonld2.compact(flattened, ctx, options);
        return compacted;
      };
      Object.defineProperty(jsonld2, "documentLoader", {
        get: () => jsonld2._documentLoader,
        set: (v) => jsonld2._documentLoader = v
      });
      jsonld2.documentLoader = async (url) => {
        throw new JsonLdError(
          "Could not retrieve a JSON-LD document from the URL. URL dereferencing not implemented.",
          "jsonld.LoadDocumentError",
          { code: "loading document failed", url }
        );
      };
      jsonld2.get = async function(url, options) {
        let load;
        if (typeof options.documentLoader === "function") {
          load = options.documentLoader;
        } else {
          load = jsonld2.documentLoader;
        }
        const remoteDoc = await load(url);
        try {
          if (!remoteDoc.document) {
            throw new JsonLdError(
              "No remote document found at the given URL.",
              "jsonld.NullRemoteDocument"
            );
          }
          if (_isString(remoteDoc.document)) {
            remoteDoc.document = JSON.parse(remoteDoc.document);
          }
        } catch (e) {
          throw new JsonLdError(
            "Could not retrieve a JSON-LD document from the URL.",
            "jsonld.LoadDocumentError",
            {
              code: "loading document failed",
              cause: e,
              remoteDoc
            }
          );
        }
        return remoteDoc;
      };
      jsonld2.processContext = async function(activeCtx, localCtx, options) {
        options = _setDefaults(options, {
          base: "",
          contextResolver: new ContextResolver(
            { sharedCache: _resolvedContextCache }
          )
        });
        if (localCtx === null) {
          return _getInitialContext(options);
        }
        localCtx = util.clone(localCtx);
        if (!(_isObject(localCtx) && "@context" in localCtx)) {
          localCtx = { "@context": localCtx };
        }
        return _processContext({ activeCtx, localCtx, options });
      };
      jsonld2.getContextValue = require_context().getContextValue;
      jsonld2.documentLoaders = {};
      jsonld2.useDocumentLoader = function(type) {
        if (!(type in jsonld2.documentLoaders)) {
          throw new JsonLdError(
            'Unknown document loader type: "' + type + '"',
            "jsonld.UnknownDocumentLoader",
            { type }
          );
        }
        jsonld2.documentLoader = jsonld2.documentLoaders[type].apply(
          jsonld2,
          Array.prototype.slice.call(arguments, 1)
        );
      };
      jsonld2.registerRDFParser = function(contentType, parser) {
        _rdfParsers[contentType] = parser;
      };
      jsonld2.unregisterRDFParser = function(contentType) {
        delete _rdfParsers[contentType];
      };
      jsonld2.registerRDFParser("application/n-quads", NQuads.parse);
      jsonld2.url = require_url();
      jsonld2.logEventHandler = _logEventHandler;
      jsonld2.logWarningEventHandler = _logWarningEventHandler;
      jsonld2.safeEventHandler = _safeEventHandler;
      jsonld2.setDefaultEventHandler = _setDefaultEventHandler;
      jsonld2.strictEventHandler = _strictEventHandler;
      jsonld2.unhandledEventHandler = _unhandledEventHandler;
      jsonld2.util = util;
      Object.assign(jsonld2, util);
      jsonld2.promises = jsonld2;
      jsonld2.RequestQueue = require_RequestQueue();
      jsonld2.JsonLdProcessor = require_JsonLdProcessor()(jsonld2);
      platform.setupGlobals(jsonld2);
      platform.setupDocumentLoaders(jsonld2);
      function _setDefaults(options, {
        documentLoader: documentLoader2 = jsonld2.documentLoader,
        ...defaults
      }) {
        if (options && "compactionMap" in options) {
          throw new JsonLdError(
            '"compactionMap" not supported.',
            "jsonld.OptionsError"
          );
        }
        if (options && "expansionMap" in options) {
          throw new JsonLdError(
            '"expansionMap" not supported.',
            "jsonld.OptionsError"
          );
        }
        return Object.assign(
          {},
          { documentLoader: documentLoader2 },
          defaults,
          options,
          { eventHandler: _setupEventHandler({ options }) }
        );
      }
      return jsonld2;
    };
    var factory = function() {
      return wrapper(function() {
        return factory();
      });
    };
    wrapper(factory);
    module.exports = factory;
  }
});

// scripts/en18223/derive-core.ts
var import_jsonld = __toESM(require_jsonld(), 1);
var DPP = "https://ref.openepcis.io/extensions/common/core/";
var GS1 = "https://ref.gs1.org/voc/";
var XSD = "http://www.w3.org/2001/XMLSchema#";
var RDFS = "http://www.w3.org/2000/01/rdf-schema#";
var localName = (iri) => {
  const i = Math.max(iri.lastIndexOf("/"), iri.lastIndexOf("#"));
  return i >= 0 ? iri.slice(i + 1) : iri;
};
var toPrefixed = (iri) => iri.startsWith(XSD) ? `xsd:${localName(iri)}` : iri;
function inferType(v) {
  if (typeof v === "boolean") return "xsd:boolean";
  if (typeof v === "number") return Number.isInteger(v) ? "xsd:integer" : "xsd:double";
  if (typeof v === "string") {
    if (/^\d{4}-\d\d-\d\dT/.test(v)) return "xsd:dateTime";
    if (/^\d{4}-\d\d-\d\d$/.test(v)) return "xsd:date";
    if (/^https?:\/\//.test(v)) return "xsd:anyURI";
  }
  return "xsd:string";
}
function literalType(valObj, propIri, range2) {
  if (valObj["@type"]) return toPrefixed(valObj["@type"]);
  const r = range2.get(propIri);
  if (r && r.startsWith(XSD)) return toPrefixed(r);
  return inferType(valObj["@value"]);
}
var isLiteral = (e) => e && typeof e === "object" && "@value" in e;
var hasProps = (e) => Object.keys(e).some((k) => k !== "@id" && k !== "@type" && k !== "@index");
var isNode = (e) => e && typeof e === "object" && !("@value" in e) && ("@id" in e || hasProps(e));
var skipKey = (key) => key === "@id" || key === "@type" || key === "@index" || key.startsWith(RDFS);
function buildElement(propIri, values, range2) {
  const base = { elementId: localName(propIri), dictionaryReference: propIri };
  if (values.length && values.every((e) => isLiteral(e) && e["@language"])) {
    return {
      ...base,
      objectType: "MultiLanguageDataElement",
      value: values.map((e) => ({ value: e["@value"], language: e["@language"] }))
    };
  }
  if (values.length === 1 && isLiteral(values[0])) {
    return {
      ...base,
      objectType: "SingleValuedDataElement",
      valueDataType: literalType(values[0], propIri, range2),
      value: values[0]["@value"]
    };
  }
  if (values.length > 1 && values.every(isLiteral)) {
    return {
      ...base,
      objectType: "MultiValuedDataElement",
      valueDataType: literalType(values[0], propIri, range2),
      value: values.map((e) => e["@value"])
    };
  }
  if (values.length === 1 && isNode(values[0])) {
    return { ...base, ...classifyNode(values[0], range2) };
  }
  if (values.length > 1 && values.every(isNode)) {
    return {
      ...base,
      objectType: "MultiValuedDataElement",
      value: values.map((n) => collectionElements(n, range2))
    };
  }
  if (values.length === 1 && values[0] && values[0]["@id"]) {
    return { ...base, objectType: "SingleValuedDataElement", valueDataType: "xsd:anyURI", value: values[0]["@id"] };
  }
  return { ...base, objectType: "SingleValuedDataElement", value: null };
}
function classifyNode(node, range2) {
  const types = node["@type"] || [];
  const hasDoc = `${DPP}documentUrl` in node || types.includes(`${DPP}DocumentReference`);
  if (hasDoc) {
    const first = (iri) => node[iri] && node[iri][0] ? node[iri][0]["@value"] ?? node[iri][0]["@id"] : void 0;
    const res = { objectType: "RelatedResource" };
    const title = first(`${DPP}documentTitle`) ?? first(`${DPP}title`);
    if (title) res.resourceTitle = title;
    const ct = first(`${DPP}mimeType`);
    if (ct) res.contentType = ct;
    const url = first(`${DPP}documentUrl`);
    if (url) res.url = url;
    const lang = first(`${DPP}languageCode`);
    if (lang) res.language = lang;
    return res;
  }
  return { objectType: "DataElementCollection", elements: collectionElements(node, range2) };
}
function collectionElements(node, range2) {
  const out = [];
  for (const key of Object.keys(node)) {
    if (skipKey(key)) continue;
    out.push(buildElement(key, node[key], range2));
  }
  return out;
}
function granularityFromDigitalLink(dl) {
  if (!dl) return "model";
  if (/\/21\//.test(dl)) return "item";
  if (/\/10\//.test(dl)) return "batch";
  return "model";
}
var firstVal = (node, iri) => node[iri] && node[iri][0] ? node[iri][0]["@value"] ?? node[iri][0]["@id"] : void 0;
var ENVELOPE = {
  [`${DPP}passportIdentifier`]: "digitalProductPassportId",
  [`${GS1}productID`]: "uniqueProductIdentifier",
  [`${DPP}granularityLevel`]: "granularity",
  [`${DPP}dppSchemaVersion`]: "dppSchemaVersion",
  [`${DPP}passportStatus`]: "dppStatus",
  [`${DPP}lastUpdated`]: "lastUpdated",
  [`${DPP}economicOperatorId`]: "economicOperatorId",
  [`${DPP}facilityId`]: "facilityId"
};
var CONTENT_SPEC = `${DPP}contentSpecificationId`;
var DPP_SCHEMA_VERSION = "EN 18223:2026";
var ENVELOPE_ORDER = [
  "digitalProductPassportId",
  "uniqueProductIdentifier",
  "granularity",
  "dppSchemaVersion",
  "dppStatus",
  "lastUpdated",
  "economicOperatorId",
  "facilityId",
  "contentSpecificationIds"
];
var namespaceOf = (iri) => {
  const i = Math.max(iri.lastIndexOf("/"), iri.lastIndexOf("#"));
  return i >= 0 ? iri.slice(0, i + 1) : iri;
};
function collectContentSpecs(elements, acc) {
  for (const el of elements) {
    if (el && el.dictionaryReference) acc.add(namespaceOf(el.dictionaryReference));
    if (el && Array.isArray(el.elements)) collectContentSpecs(el.elements, acc);
    if (el && Array.isArray(el.value)) {
      for (const v of el.value) if (Array.isArray(v)) collectContentSpecs(v, acc);
    }
  }
}
async function deriveEN18223(input, range2, documentLoader2) {
  const expanded = await import_jsonld.default.expand(input, { documentLoader: documentLoader2 });
  const node = Array.isArray(expanded) ? expanded[0] : expanded;
  if (!node) throw new Error("input expanded to nothing");
  const dpp = {};
  const dl = firstVal(node, `${GS1}productID`) ?? node["@id"];
  for (const [iri, key] of Object.entries(ENVELOPE)) {
    if (iri in node) dpp[key] = firstVal(node, iri);
  }
  if (!dpp.uniqueProductIdentifier && dl) dpp.uniqueProductIdentifier = dl;
  dpp.granularity = granularityFromDigitalLink(dpp.uniqueProductIdentifier);
  if (!dpp.digitalProductPassportId && dpp.uniqueProductIdentifier) dpp.digitalProductPassportId = dpp.uniqueProductIdentifier;
  if (!dpp.dppSchemaVersion) dpp.dppSchemaVersion = DPP_SCHEMA_VERSION;
  if (!dpp.dppStatus) dpp.dppStatus = "active";
  const elements = [];
  for (const key of Object.keys(node)) {
    if (skipKey(key) || key in ENVELOPE || key === CONTENT_SPEC) continue;
    elements.push(buildElement(key, node[key], range2));
  }
  const specs = /* @__PURE__ */ new Set();
  for (const e of node[CONTENT_SPEC] || []) {
    const v = e["@value"] ?? e["@id"];
    if (v) specs.add(v);
  }
  collectContentSpecs(elements, specs);
  if (specs.size) dpp.contentSpecificationIds = [...specs].sort();
  const ordered = {};
  for (const k of ENVELOPE_ORDER) if (k in dpp) ordered[k] = dpp[k];
  ordered.elements = elements;
  return ordered;
}

// demos/en18223-converter/range-index.json
var range_index_default = {
  "https://ref.openepcis.io/extensions/common/core/accessLevel": "https://ref.openepcis.io/extensions/common/core/AccessLevel",
  "https://ref.openepcis.io/extensions/common/core/accessRights": "https://ref.openepcis.io/extensions/common/core/AccessRights",
  "https://ref.openepcis.io/extensions/common/core/activityClassification": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/annualEnergyConsumption": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/authorizedParties": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/common/core/bioBasedFraction": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/biodegradabilityTestMethod": "https://ref.openepcis.io/extensions/common/core/BiodegradabilityTestMethod",
  "https://ref.openepcis.io/extensions/common/core/biodegradationPercentage": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprint": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintDeclaration": "https://ref.openepcis.io/extensions/common/core/CarbonFootprintDeclaration",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintDistribution": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintEndOfLife": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintMethodology": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintProduction": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintRawMaterial": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintStudyUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintTotal": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/carbonFootprintUse": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/casNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/circularityPerformance": "https://ref.openepcis.io/extensions/common/core/CircularityPerformance",
  "https://ref.openepcis.io/extensions/common/core/collectionPointDirectoryUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/complianceDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/common/core/complianceStatus": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/common/core/compostabilityStandard": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/compostabilityType": "https://ref.openepcis.io/extensions/common/core/CompostabilityType",
  "https://ref.openepcis.io/extensions/common/core/concentration": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/contentSpecificationId": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/crmListVersion": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/customsCommodityCode": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/customsCommodityCodeType": "https://ref.openepcis.io/extensions/common/core/CustomsCommodityCodeType",
  "https://ref.openepcis.io/extensions/common/core/dataElement": "https://ref.openepcis.io/extensions/common/core/DataElement",
  "https://ref.openepcis.io/extensions/common/core/dataProviderCertification": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/dataQualityAssessment": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/dataRetentionPeriod": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/declaredUnit": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/depositAmount": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/depositRedemptionChannelUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/depositReturnScheme": "https://ref.openepcis.io/extensions/common/core/DepositReturnScheme",
  "https://ref.openepcis.io/extensions/common/core/depositSchemeOperator": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/common/core/dictionaryReference": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/did": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/dismantlingGuideUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/dismantlingInstructions": "https://ref.openepcis.io/extensions/common/core/DocumentReference",
  "https://ref.openepcis.io/extensions/common/core/diyRepairPossible": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/common/core/documents": "https://ref.openepcis.io/extensions/common/core/DocumentReference",
  "https://ref.openepcis.io/extensions/common/core/documentType": "https://ref.openepcis.io/extensions/common/core/DocumentType",
  "https://ref.openepcis.io/extensions/common/core/documentUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/dppSchemaVersion": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/dueDiligenceRegulationContext": "https://ref.gs1.org/voc/RegulatoryInformation",
  "https://ref.openepcis.io/extensions/common/core/dueDiligenceReport": "https://ref.openepcis.io/extensions/common/core/DueDiligenceReport",
  "https://ref.openepcis.io/extensions/common/core/ecNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/economicOperatorId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/elementId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/emissionsPerformance": "https://ref.openepcis.io/extensions/common/core/EmissionsPerformance",
  "https://ref.openepcis.io/extensions/common/core/endOfLifeInstructions": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/endOfLifeProgram": "https://ref.openepcis.io/extensions/common/core/EndOfLifeProgram",
  "https://ref.openepcis.io/extensions/common/core/energyEfficiency": "https://ref.openepcis.io/extensions/common/core/EnergyEfficiency",
  "https://ref.openepcis.io/extensions/common/core/energyEfficiencyClass": "https://ref.openepcis.io/extensions/common/core/EnergyEfficiencyClass",
  "https://ref.openepcis.io/extensions/common/core/eoriNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/eprComplianceUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/eprelProductUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/eprelRegistrationNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/eprJurisdiction": "https://ref.gs1.org/voc/Country",
  "https://ref.openepcis.io/extensions/common/core/eprRegistrationNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/eprScheme": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/common/core/eprWasteStream": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/expectedLifespan": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/extendedProducerResponsibility": "https://ref.openepcis.io/extensions/common/core/ExtendedProducerResponsibility",
  "https://ref.openepcis.io/extensions/common/core/facilityCertifications": "https://ref.gs1.org/voc/CertificationDetails",
  "https://ref.openepcis.io/extensions/common/core/facilityId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/facilityInformation": "https://ref.openepcis.io/extensions/common/core/FacilityInformation",
  "https://ref.openepcis.io/extensions/common/core/facilityType": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/forcedLabourFreeAssertion": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/common/core/granularityLevel": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/guaranteedLifespan": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/hazardClass": "https://ref.openepcis.io/extensions/common/core/HazardClass",
  "https://ref.openepcis.io/extensions/common/core/hazardImpact": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/hazardousSubstances": "https://ref.openepcis.io/extensions/common/core/HazardousSubstance",
  "https://ref.openepcis.io/extensions/common/core/hazardPictogramCode": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/hazardSignalWord": "https://ref.openepcis.io/extensions/common/core/HazardSignalWord",
  "https://ref.openepcis.io/extensions/common/core/hazardStatement": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/identityCredentialUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/isCriticalRawMaterial": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/common/core/isRegulationCompliant": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/common/core/isStrategicRawMaterial": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/common/core/issueDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/common/core/language": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/languageCode": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/lastDataUpdate": "http://www.w3.org/2001/XMLSchema#dateTime",
  "https://ref.openepcis.io/extensions/common/core/lastUpdated": "http://www.w3.org/2001/XMLSchema#dateTime",
  "https://ref.openepcis.io/extensions/common/core/massFraction": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/materialCircularityIndicator": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/materialComposition": "https://ref.openepcis.io/extensions/common/core/MaterialComposition",
  "https://ref.openepcis.io/extensions/common/core/mimeType": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/multiLanguageValue": "https://ref.openepcis.io/extensions/common/core/MultiLanguageValue",
  "https://ref.openepcis.io/extensions/common/core/operationalScope": "https://ref.openepcis.io/extensions/common/core/OperationalScope",
  "https://ref.openepcis.io/extensions/common/core/operatorInformation": "https://ref.openepcis.io/extensions/common/core/OperatorInformation",
  "https://ref.openepcis.io/extensions/common/core/operatorRole": "https://ref.openepcis.io/extensions/common/core/OperatorRole",
  "https://ref.openepcis.io/extensions/common/core/passportExpiryDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/common/core/passportIdentifier": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/passportIssueDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/common/core/passportIssuer": "https://ref.openepcis.io/extensions/common/core/OperatorInformation",
  "https://ref.openepcis.io/extensions/common/core/passportStatus": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/passportVersion": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/performanceClass": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/performanceInfo": "https://ref.openepcis.io/extensions/common/core/PerformanceInfo",
  "https://ref.openepcis.io/extensions/common/core/postConsumerRecycledContent": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/powerConsumptionOff": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/powerConsumptionOn": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/powerConsumptionStandby": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/precautionaryStatement": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/preConsumerRecycledContent": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/previousPassportVersion": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/primarySourcedRatio": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/productCategory": "https://ref.openepcis.io/extensions/common/core/ProductCategory",
  "https://ref.openepcis.io/extensions/common/core/professionalRepairNetwork": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/recyclabilityAssessment": "https://ref.openepcis.io/extensions/common/core/RecyclabilityAssessment",
  "https://ref.openepcis.io/extensions/common/core/recyclabilityMethodology": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/recyclabilityRate": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/recyclabilityScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/recyclableContent": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/recycledContent": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/recycledContentDetails": "https://ref.openepcis.io/extensions/common/core/RecycledContent",
  "https://ref.openepcis.io/extensions/common/core/registrationNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/repairabilityClass": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/repairabilityInfo": "https://ref.openepcis.io/extensions/common/core/RepairabilityInfo",
  "https://ref.openepcis.io/extensions/common/core/repairabilityScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/repairInformationPortalUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/repairInstructions": "https://ref.openepcis.io/extensions/common/core/DocumentReference",
  "https://ref.openepcis.io/extensions/common/core/repairProvider": "https://ref.openepcis.io/extensions/common/core/RepairProvider",
  "https://ref.openepcis.io/extensions/common/core/repairProviderName": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/repairProviderUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/reportDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/common/core/reportingGranularity": "https://ref.openepcis.io/extensions/common/core/DPPGranularity",
  "https://ref.openepcis.io/extensions/common/core/reportUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/safeDisassemblyInstructions": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/safeUseInstructions": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/scipId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/separateCollectionInfo": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/softwareUpdatesAvailability": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/sparePartsAvailability": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/substanceLocation": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/substancesOfConcern": "https://ref.openepcis.io/extensions/common/core/SubstanceOfConcern",
  "https://ref.openepcis.io/extensions/common/core/supplyChainTransparencyUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/takeBackIncentive": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/takeBackUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/technicalLifetime": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/common/core/testedConditions": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/thirdPartyAssurancesUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/common/core/traceabilityPerformance": "https://ref.openepcis.io/extensions/common/core/TraceabilityPerformance",
  "https://ref.openepcis.io/extensions/common/core/tradeItemPieceCount": "http://www.w3.org/2001/XMLSchema#positiveInteger",
  "https://ref.openepcis.io/extensions/common/core/tradeItemPieceDescription": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/tradeItemPieceNumber": "http://www.w3.org/2001/XMLSchema#positiveInteger",
  "https://ref.openepcis.io/extensions/common/core/tradeItemPieceOf": "https://ref.gs1.org/voc/Product",
  "https://ref.openepcis.io/extensions/common/core/usageCycles": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/common/core/utilityFactor": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/valueDataType": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/common/core/verificationBody": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/common/core/verifiedRatio": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/common/core/wastePreventionInfo": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/absoluteCarbonFootprint": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/anodeActiveMaterial": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/atSoC": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/auditBody": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/authorizedServiceCenters": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/batteryChemistry": "https://ref.openepcis.io/extensions/eu/battery/BatteryChemistry",
  "https://ref.openepcis.io/extensions/eu/battery/batteryMass": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/batteryModelIdentifier": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/batteryPassportIdentifier": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/cadmiumSymbolRequired": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/battery/calculationStandard": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/capacityFade": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/capacityFadeThreshold": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/capacityThresholdForExhaustion": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/capacityThroughput": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintDeclaration": "https://ref.openepcis.io/extensions/eu/battery/CarbonFootprintDeclaration",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintDeclarationId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintDistribution": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintGeographicScope": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintPerformanceClass": "https://ref.openepcis.io/extensions/eu/battery/CarbonFootprintClass",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintProduction": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintRawMaterialExtraction": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintRecycling": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintStudyUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/carbonFootprintTotal": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/casNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/cathodeActiveMaterial": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/cellType": "https://ref.openepcis.io/extensions/eu/battery/CellType",
  "https://ref.openepcis.io/extensions/eu/battery/ceMarkingIndicator": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/battery/certifiedUsableEnergy": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/cobaltPostConsumerShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/cobaltPreConsumerShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/cobaltRecycledShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/complianceStatus": "https://ref.openepcis.io/extensions/eu/battery/ComplianceStatus",
  "https://ref.openepcis.io/extensions/eu/battery/componentLocation": "https://ref.openepcis.io/extensions/eu/battery/ComponentLocation",
  "https://ref.openepcis.io/extensions/eu/battery/concentration": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/conflictMineralFree": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/battery/cRate": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/cRateLifeCycleTest": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/criticalRawMaterialsStatement": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/currentSelfDischargingRate": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/cycleCount": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/dangerousGoodsPackingInstructions": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/dataProviderCertification": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/dataQualityAssessment": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/declarationOfConformity": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/depthOfDischargeInCycleLifeTest": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/dismantlingAndRemovalInformation": "https://ref.openepcis.io/extensions/common/core/DocumentReference",
  "https://ref.openepcis.io/extensions/eu/battery/dismantlingDocuments": "https://ref.openepcis.io/extensions/eu/battery/DismantlingDocument",
  "https://ref.openepcis.io/extensions/eu/battery/dismantlingInstructions": "http://www.w3.org/2000/01/rdf-schema#Resource",
  "https://ref.openepcis.io/extensions/eu/battery/dismantlingTime": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/documentType": "https://ref.openepcis.io/extensions/eu/battery/DismantlingDocumentType",
  "https://ref.openepcis.io/extensions/eu/battery/documentUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/dueDiligencePolicyUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/dueDiligenceReportUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/ecNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/electrolyteComposition": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/electrolyteType": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/endOfLifeInfo": "https://ref.openepcis.io/extensions/eu/battery/EndOfLifeInfo",
  "https://ref.openepcis.io/extensions/eu/battery/energyThroughput": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/estimatedImpact": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/euDeclarationOfConformity": "http://data.europa.eu/m8g/Evidence",
  "https://ref.openepcis.io/extensions/eu/battery/euDeclarationOfConformityId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/eventDate": "http://www.w3.org/2001/XMLSchema#dateTime",
  "https://ref.openepcis.io/extensions/eu/battery/eventLocation": "https://ref.gs1.org/voc/Place",
  "https://ref.openepcis.io/extensions/eu/battery/eventType": "https://ref.openepcis.io/extensions/eu/battery/NegativeEventType",
  "https://ref.openepcis.io/extensions/eu/battery/evolutionOfSelfDischarge": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/exceedanceThreshold": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/exhaustionThreshold": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/expectedCycleLife": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/expectedLifetime": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/expectedLifetimeCapacityThroughput": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/expectedLifetimeEnergyThroughput": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/expectedLifetimeYears": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/expectedNumberOfCycles": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/expectedRemainingCycles": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/expectedRemainingLifetimeMonths": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/exposureDurationMinutes": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/exposureEndTime": "http://www.w3.org/2001/XMLSchema#dateTime",
  "https://ref.openepcis.io/extensions/eu/battery/extendedWarrantyAvailable": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/battery/extinguishingAgent": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/facilityIdentifier": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/functionalUnit": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/hasBattery": "https://ref.gs1.org/voc/Product",
  "https://ref.openepcis.io/extensions/eu/battery/hazardClass": "https://ref.openepcis.io/extensions/eu/battery/HazardClass",
  "https://ref.openepcis.io/extensions/eu/battery/hazardImpact": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/hazardousSubstances": "https://ref.openepcis.io/extensions/eu/battery/HazardousSubstance",
  "https://ref.openepcis.io/extensions/eu/battery/incidentId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/incidentReportUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/incidentSeverity": "https://ref.openepcis.io/extensions/eu/battery/IncidentSeverity",
  "https://ref.openepcis.io/extensions/eu/battery/informationOnCollection": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/initialCapacity": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/initialEnergy": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/initialInternalResistance": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/initialSelfDischarge": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/inspectorId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/internalResistance": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/internalResistanceIncrease": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/isCriticalRawMaterial": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/battery/isSubstanceOfConcern": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/battery/labelMeaning": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/labels": "https://ref.openepcis.io/extensions/eu/battery/Label",
  "https://ref.openepcis.io/extensions/eu/battery/labelSubject": "https://ref.openepcis.io/extensions/eu/battery/LabelSubject",
  "https://ref.openepcis.io/extensions/eu/battery/labelSymbol": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/languageCode": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/lastDataUpdate": "http://www.w3.org/2001/XMLSchema#dateTime",
  "https://ref.openepcis.io/extensions/eu/battery/leadRecycledShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/leadSymbolRequired": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/battery/lifecycleStage": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/lifetimeReferenceTest": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/lithiumPostConsumerShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/lithiumPreConsumerShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/lithiumRecycledShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/manufacturerIdentifier": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/manufacturingPlace": "https://ref.openepcis.io/extensions/common/core/FacilityInformation",
  "https://ref.openepcis.io/extensions/eu/battery/materialComposition": "https://ref.openepcis.io/extensions/eu/battery/BatteryMaterial",
  "https://ref.openepcis.io/extensions/eu/battery/materialRecoveryTargets": "https://ref.openepcis.io/extensions/eu/battery/MaterialRecoveryTarget",
  "https://ref.openepcis.io/extensions/eu/battery/materialSupplier": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/maximumChargingCurrent": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/maximumChargingPower": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/maximumDischargingCurrent": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/maximumDischargingPower": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/maximumTemperature": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/maximumVoltage": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/measurementCertificateUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/mimeType": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/minimumTemperature": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/minimumVoltage": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/negativeEvents": "https://ref.openepcis.io/extensions/eu/battery/NegativeEvent",
  "https://ref.openepcis.io/extensions/eu/battery/nextScheduledMeasurement": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/battery/nickelPostConsumerShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/nickelPreConsumerShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/nickelRecycledShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/nominalVoltage": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/note": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/notifiedBody": "http://data.europa.eu/m8g/PublicOrganisation",
  "https://ref.openepcis.io/extensions/eu/battery/notifiedBodyName": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/notifiedBodyNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/numberOfCells": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/numberOfFullCycles": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/numberOfModules": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/battery/operatorIdentifier": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/operatorInformation": "https://ref.openepcis.io/extensions/common/core/OperatorInformation",
  "https://ref.openepcis.io/extensions/eu/battery/operatorRole": "https://ref.openepcis.io/extensions/common/core/OperatorRole",
  "https://ref.openepcis.io/extensions/eu/battery/originalPowerCapability": "https://ref.openepcis.io/extensions/eu/battery/PowerCapabilityAtSoC",
  "https://ref.openepcis.io/extensions/eu/battery/powerCapability": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/powerCapabilityAt20SoC": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/powerCapabilityAt80SoC": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/powerCapabilityRatio": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/powerFade": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/previousApplications": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/puttingIntoService": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/battery/ratedCapacity": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/ratedEnergy": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/ratedMaximumPower": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/recommendedAction": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/recoveryMaterial": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/recoveryRate": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/recyclabilityRate": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/recycledContent": "https://ref.openepcis.io/extensions/eu/battery/RecycledContent",
  "https://ref.openepcis.io/extensions/eu/battery/remainingCapacity": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/remainingEnergy": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/remainingPowerCapability": "https://ref.openepcis.io/extensions/eu/battery/PowerCapabilityAtSoC",
  "https://ref.openepcis.io/extensions/eu/battery/remainingRoundTripEfficiency": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/remainingUsableEnergy": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/renewableContent": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/renewableContentShare": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/repurposingDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/battery/repurposingEntity": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/eu/battery/repurposingGuidelines": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/repurposingPotential": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/resistanceIncreaseThreshold": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/responsibleSourcingStandard": "https://ref.openepcis.io/extensions/eu/battery/ResponsibleSourcingStandard",
  "https://ref.openepcis.io/extensions/eu/battery/resultOfTestReport": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/riskAssessmentSummary": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/roundTripEfficiency": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/roundTripEfficiencyAt50PercentCycleLife": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/roundTripEfficiencyFade": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/roundTripEnergyEfficiency": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/safetyInstructions": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/safetyInstructionsForDismantling": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/safetyMeasures": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/selfDischargeRate": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/separateCollection": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/separateCollectionSymbolUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/shippingName": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/soceMeasurementId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/spareParts": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/sparePartSources": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/eu/battery/stateOfCertifiedEnergy": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/stateOfCharge": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/stateOfChargeLevel": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/stateOfHealth": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/battery/substanceCasNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/substanceEcNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/substanceLocation": "https://ref.openepcis.io/extensions/eu/battery/ComponentLocation",
  "https://ref.openepcis.io/extensions/eu/battery/supplierContact": "https://ref.gs1.org/voc/ContactPoint",
  "https://ref.openepcis.io/extensions/eu/battery/supplyChainDueDiligence": "https://ref.openepcis.io/extensions/eu/battery/SupplyChainDueDiligence",
  "https://ref.openepcis.io/extensions/eu/battery/supplyChainIndex": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/battery/supplyChainMappingAvailable": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/battery/technicalSpecifications": "https://ref.openepcis.io/extensions/eu/battery/TechnicalSpecification",
  "https://ref.openepcis.io/extensions/eu/battery/temperatureExcursionId": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/temperatureExcursionReportUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/temperatureRangeCharging": "https://ref.openepcis.io/extensions/eu/battery/TemperatureRange",
  "https://ref.openepcis.io/extensions/eu/battery/temperatureRangeDischarging": "https://ref.openepcis.io/extensions/eu/battery/TemperatureRange",
  "https://ref.openepcis.io/extensions/eu/battery/temperatureRangeIdleState": "https://ref.openepcis.io/extensions/eu/battery/TemperatureRange",
  "https://ref.openepcis.io/extensions/eu/battery/temperatureRangeStorage": "https://ref.openepcis.io/extensions/eu/battery/TemperatureRange",
  "https://ref.openepcis.io/extensions/eu/battery/testReportNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/thirdPartyAssurancesUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/thirdPartyVerification": "https://ref.openepcis.io/extensions/eu/battery/ThirdPartyVerification",
  "https://ref.openepcis.io/extensions/eu/battery/transportationSafetyClass": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/transportConditions": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  "https://ref.openepcis.io/extensions/eu/battery/verificationBody": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/eu/battery/verificationBodyName": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/verificationCertificateUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/verificationDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/battery/verificationStandard": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/battery/warrantyConditions": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/battery/wastePrevention": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/cpr/characteristicName": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/cpr/characteristicValue": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/cpr/constructionProductType": "https://ref.openepcis.io/extensions/eu/cpr/ConstructionProductType",
  "https://ref.openepcis.io/extensions/eu/cpr/declarationOfPerformanceUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/cpr/essentialCharacteristic": "https://ref.openepcis.io/extensions/eu/cpr/EssentialCharacteristic",
  "https://ref.openepcis.io/extensions/eu/cpr/harmonisedStandard": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/cpr/reactionToFireClass": "https://ref.openepcis.io/extensions/eu/cpr/ReactionToFireClass",
  "https://ref.openepcis.io/extensions/eu/detergent/allergenCasNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/detergent/allergenConcentration": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/detergent/biodegradabilityTestReport": "https://ref.openepcis.io/extensions/common/core/DocumentReference",
  "https://ref.openepcis.io/extensions/eu/detergent/biodegradationPercentage": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/detergent/dosageInstructions": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/detergent/endProductCharacteristics": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/detergent/filmBiodegradabilityPercentage": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/detergent/filmBiodegradable": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/detergent/fragranceAllergens": "https://ref.openepcis.io/extensions/eu/detergent/FragranceAllergen",
  "https://ref.openepcis.io/extensions/eu/detergent/hazardousSubstances": "https://ref.openepcis.io/extensions/common/core/HazardousSubstance",
  "https://ref.openepcis.io/extensions/eu/detergent/hazardPictograms": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/detergent/hStatements": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/detergent/ingredientFunction": "https://ref.openepcis.io/extensions/eu/detergent/IngredientFunction",
  "https://ref.openepcis.io/extensions/eu/detergent/ingredientList": "https://ref.openepcis.io/extensions/eu/detergent/Ingredient",
  "https://ref.openepcis.io/extensions/eu/detergent/intendedUse": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/detergent/isSurfactant": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/detergent/microorganisms": "https://ref.openepcis.io/extensions/eu/detergent/MicroorganismInfo",
  "https://ref.openepcis.io/extensions/eu/detergent/passesUltimateBiodegradability": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/detergent/phosphateCompliant": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/detergent/phosphorusContentPercent": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/detergent/productForm": "https://ref.openepcis.io/extensions/eu/detergent/ProductForm",
  "https://ref.openepcis.io/extensions/eu/detergent/pStatements": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/detergent/recommendedDosage": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/detergent/safetyDataSheet": "https://ref.openepcis.io/extensions/common/core/DocumentReference",
  "https://ref.openepcis.io/extensions/eu/detergent/signalWord": "https://ref.openepcis.io/extensions/eu/detergent/SignalWord",
  "https://ref.openepcis.io/extensions/eu/detergent/strainDesignation": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/detergent/surfactantBiodegradability": "https://ref.openepcis.io/extensions/eu/detergent/SurfactantBiodegradability",
  "https://ref.openepcis.io/extensions/eu/detergent/surfactantType": "https://ref.openepcis.io/extensions/eu/detergent/SurfactantType",
  "https://ref.openepcis.io/extensions/eu/detergent/testDurationDays": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/detergent/testMethod": "https://ref.openepcis.io/extensions/eu/detergent/BiodegradabilityTestMethod",
  "https://ref.openepcis.io/extensions/eu/detergent/weightPercentRange": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/annualEnergyConsumption": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/assessmentBody": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/eu/electronics/assessmentDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/electronics/billOfMaterials": "https://ref.openepcis.io/extensions/eu/electronics/ComponentBOM",
  "https://ref.openepcis.io/extensions/eu/electronics/collectionSchemeUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/electronics/componentPartNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/componentPassport": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/electronics/components": "https://ref.gs1.org/voc/Product",
  "https://ref.openepcis.io/extensions/eu/electronics/componentType": "https://ref.openepcis.io/extensions/eu/electronics/ComponentType",
  "https://ref.openepcis.io/extensions/eu/electronics/criterionDetails": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/criterionMaxScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/electronics/criterionScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/electronics/criterionType": "https://ref.openepcis.io/extensions/eu/electronics/RepairCriterionType",
  "https://ref.openepcis.io/extensions/eu/electronics/displayScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/electronics/displaySpecification": "https://ref.openepcis.io/extensions/eu/electronics/DisplaySpecification",
  "https://ref.openepcis.io/extensions/eu/electronics/displayTechnology": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/energyEfficiency": "https://ref.openepcis.io/extensions/eu/electronics/EnergyEfficiency",
  "https://ref.openepcis.io/extensions/eu/electronics/energyEfficiencyClass": "https://ref.openepcis.io/extensions/eu/electronics/EnergyEfficiencyClass",
  "https://ref.openepcis.io/extensions/eu/electronics/energyLabelUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/electronics/eprelProductUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/electronics/eprelRegistrationNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/featureSupportYears": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/featureUpdateEndDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/electronics/firmwareVersion": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/iec62474DslVersion": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/isReplaceable": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/electronics/latestUpdateDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/electronics/materialDeclaration": "https://ref.openepcis.io/extensions/common/core/SubstanceOfConcern",
  "https://ref.openepcis.io/extensions/eu/electronics/materialDeclarationDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/electronics/modelIdentifier": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/newVersion": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/osVersion": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/peakBrightness": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/powerConsumptionOff": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/powerConsumptionOn": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/powerConsumptionStandby": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/previousVersion": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/recoverabilityRate": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/electronics/recyclabilityRate": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/electronics/refreshRate": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/repairabilityClass": "https://ref.openepcis.io/extensions/eu/electronics/EURepairabilityClass",
  "https://ref.openepcis.io/extensions/eu/electronics/repairabilityIndex": "https://ref.openepcis.io/extensions/eu/electronics/RepairabilityIndex",
  "https://ref.openepcis.io/extensions/eu/electronics/repairabilityLabelUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/electronics/repairCriteria": "https://ref.openepcis.io/extensions/eu/electronics/RepairCriterion",
  "https://ref.openepcis.io/extensions/eu/electronics/replacementDifficulty": "https://ref.openepcis.io/extensions/eu/electronics/ReplacementDifficulty",
  "https://ref.openepcis.io/extensions/eu/electronics/rohsCompliance": "https://ref.openepcis.io/extensions/eu/electronics/RoHSCompliance",
  "https://ref.openepcis.io/extensions/eu/electronics/rohsCompliant": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/electronics/rohsDeclarationUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/electronics/rohsExemptions": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/screenDiagonal": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/screenResolutionHeight": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/electronics/screenResolutionWidth": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/electronics/securitySupportYears": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/securityUpdateEndDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/electronics/softwareSupport": "https://ref.openepcis.io/extensions/eu/electronics/SoftwareSupport",
  "https://ref.openepcis.io/extensions/eu/electronics/sparePartAvailabilityYears": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/electronics/sparePartPrice": "https://ref.gs1.org/voc/PriceSpecification",
  "https://ref.openepcis.io/extensions/eu/electronics/totalScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/electronics/updateChannel": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/electronics/updateSource": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/updateType": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/weeeCompliance": "https://ref.openepcis.io/extensions/eu/electronics/WEEECompliance",
  "https://ref.openepcis.io/extensions/eu/electronics/weeeRegistrationCountry": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/electronics/weeeRegistrationNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/areaHectares": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/eudr/areaSize": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/eudr/commodityType": "https://ref.openepcis.io/extensions/eu/eudr/CommodityType",
  "https://ref.openepcis.io/extensions/eu/eudr/countryRiskCategory": "https://ref.openepcis.io/extensions/eu/eudr/RiskLevel",
  "https://ref.openepcis.io/extensions/eu/eudr/deforestationFreeDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/eudr/derivedFrom": "https://ref.gs1.org/voc/Product",
  "https://ref.openepcis.io/extensions/eu/eudr/dueDiligenceStatement": "https://ref.openepcis.io/extensions/eu/eudr/DueDiligenceStatement",
  "https://ref.openepcis.io/extensions/eu/eudr/exemptionAuthority": "https://ref.openepcis.io/extensions/common/core/OperatorInformation",
  "https://ref.openepcis.io/extensions/eu/eudr/exemptionDeclaration": "https://ref.openepcis.io/extensions/eu/eudr/ExemptionDeclaration",
  "https://ref.openepcis.io/extensions/eu/eudr/exemptionEffectiveFrom": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/eudr/exemptionEffectiveUntil": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/eudr/exemptionReasonCode": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/exemptionScope": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/exemptionScopeReference": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/exemptionType": "https://ref.openepcis.io/extensions/eu/eudr/ExemptionType",
  "https://ref.openepcis.io/extensions/eu/eudr/forestManagementUnit": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/fscCertification": "https://ref.gs1.org/voc/CertificationDetails",
  "https://ref.openepcis.io/extensions/eu/eudr/geofence": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/geolocation": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/eudr/landUseHistory": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/legallyHarvested": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/eudr/mitigationMeasures": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/originDetails": "https://ref.openepcis.io/extensions/eu/eudr/OriginDetails",
  "https://ref.openepcis.io/extensions/eu/eudr/originList": "https://ref.openepcis.io/extensions/eu/eudr/OriginDetails",
  "https://ref.openepcis.io/extensions/eu/eudr/producerIdentification": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/eu/eudr/riskAssessment": "https://ref.openepcis.io/extensions/eu/eudr/RiskAssessment",
  "https://ref.openepcis.io/extensions/eu/eudr/riskAssessmentDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/eudr/riskLevel": "https://ref.openepcis.io/extensions/eu/eudr/RiskLevel",
  "https://ref.openepcis.io/extensions/eu/eudr/speciesCommonName": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/speciesScientificName": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/statementDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/eudr/timberProductType": "https://ref.openepcis.io/extensions/eu/eudr/TimberProductType",
  "https://ref.openepcis.io/extensions/eu/eudr/transformationDate": "http://www.w3.org/2001/XMLSchema#date",
  "https://ref.openepcis.io/extensions/eu/eudr/transformationLocation": "https://ref.gs1.org/voc/Place",
  "https://ref.openepcis.io/extensions/eu/eudr/verificationMethod": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/eudr/volumeCubicMeters": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/ppwr/harmonisedSymbol": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/ppwr/packagingTier": "https://ref.openepcis.io/extensions/eu/ppwr/PackagingTier",
  "https://ref.openepcis.io/extensions/eu/ppwr/recyclabilityGrade": "https://ref.openepcis.io/extensions/eu/ppwr/RecyclabilityGrade",
  "https://ref.openepcis.io/extensions/eu/textile/abrasionResistance": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/additionalCareInstructions": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/apparelSubcategory": "https://ref.openepcis.io/extensions/eu/textile/ApparelSubcategory",
  "https://ref.openepcis.io/extensions/eu/textile/applicableRecyclingTechnology": "https://ref.openepcis.io/extensions/eu/textile/RecyclingTechnology",
  "https://ref.openepcis.io/extensions/eu/textile/benchmarkPerformance": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/biodegradable": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/bleachingSymbol": "https://ref.openepcis.io/extensions/eu/textile/CareSymbolCode",
  "https://ref.openepcis.io/extensions/eu/textile/carbonFootprintManufacturing": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/careInstructions": "https://ref.openepcis.io/extensions/eu/textile/CareInstruction",
  "https://ref.openepcis.io/extensions/eu/textile/chainOfCustodyMethod": "https://ref.openepcis.io/extensions/eu/textile/ChainOfCustodyMethod",
  "https://ref.openepcis.io/extensions/eu/textile/chemicalPurpose": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/cleaningCyclesBeforeTest": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/clpHazardCategory": "https://ref.openepcis.io/extensions/eu/textile/CLPHazardCategory",
  "https://ref.openepcis.io/extensions/eu/textile/colorFastness": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/colourChangeRating": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/concentrationRange": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/cutAndSewFacility": "https://ref.openepcis.io/extensions/common/core/FacilityInformation",
  "https://ref.openepcis.io/extensions/eu/textile/dataTypeIndicator": "https://ref.openepcis.io/extensions/eu/textile/FootprintDataType",
  "https://ref.openepcis.io/extensions/eu/textile/dimensionalChangePercentage": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/dimensionalChangeScore": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/dimensionalChangeTest": "https://ref.openepcis.io/extensions/eu/textile/DimensionalChangeTestResult",
  "https://ref.openepcis.io/extensions/eu/textile/dimensionalChangeTestMethod": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/dimensionalStability": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/dryCleaningSymbol": "https://ref.openepcis.io/extensions/eu/textile/CareSymbolCode",
  "https://ref.openepcis.io/extensions/eu/textile/dryingSymbol": "https://ref.openepcis.io/extensions/eu/textile/CareSymbolCode",
  "https://ref.openepcis.io/extensions/eu/textile/durabilityClass": "https://ref.openepcis.io/extensions/eu/textile/DurabilityClass",
  "https://ref.openepcis.io/extensions/eu/textile/durabilityInfo": "https://ref.openepcis.io/extensions/eu/textile/DurabilityInfo",
  "https://ref.openepcis.io/extensions/eu/textile/dyeingFacility": "https://ref.openepcis.io/extensions/common/core/FacilityInformation",
  "https://ref.openepcis.io/extensions/eu/textile/ecNumber": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/elastaneContentPercent": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/endOfLifeDestination": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/endOfLifeHandling": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/energyUsage": "https://ref.openepcis.io/extensions/common/core/EnergyKilowattHours",
  "https://ref.openepcis.io/extensions/eu/textile/environmentalFootprint": "https://ref.openepcis.io/extensions/eu/textile/EnvironmentalFootprint",
  "https://ref.openepcis.io/extensions/eu/textile/expectedLifetimeYears": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/expectedWashCycles": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/fabricAppearanceRating": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/fabricType": "https://ref.openepcis.io/extensions/eu/textile/FabricType",
  "https://ref.openepcis.io/extensions/eu/textile/fiberCertification": "https://ref.gs1.org/voc/CertificationDetails",
  "https://ref.openepcis.io/extensions/eu/textile/fiberOrigin": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/finishingFacility": "https://ref.openepcis.io/extensions/common/core/FacilityInformation",
  "https://ref.openepcis.io/extensions/eu/textile/freeFromCoatings": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/freeFromDyes": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/freeFromPrintings": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/freeFromSequins": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/garmentType": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/hasTakeBackProgram": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/ironingSymbol": "https://ref.openepcis.io/extensions/eu/textile/CareSymbolCode",
  "https://ref.openepcis.io/extensions/eu/textile/isMonoMaterial": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/isMRSLCompliant": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/isRecyclable": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/isRecycledFiber": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/isRepairable": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/lciaCategories": "https://ref.openepcis.io/extensions/eu/textile/LCIACategory",
  "https://ref.openepcis.io/extensions/eu/textile/lciaCategoryCode": "https://ref.openepcis.io/extensions/eu/textile/LCIACategoryCode",
  "https://ref.openepcis.io/extensions/eu/textile/lciaUnit": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/lciaValue": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/locationInProduct": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/maxConcentration": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/meetsTargetThreshold": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/microplasticInfo": "https://ref.openepcis.io/extensions/eu/textile/MicroplasticInfo",
  "https://ref.openepcis.io/extensions/eu/textile/microplasticMitigationMeasures": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/microplasticRiskLevel": "https://ref.openepcis.io/extensions/eu/textile/MicroplasticRiskLevel",
  "https://ref.openepcis.io/extensions/eu/textile/nonTextilePartsRating": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/pefcrReference": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/pefSingleScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/pfasFree": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/pillingResistance": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/productionWastePercentage": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/recyclabilityAssessment": "https://ref.openepcis.io/extensions/eu/textile/RecyclabilityAssessment",
  "https://ref.openepcis.io/extensions/eu/textile/recyclabilityScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/recycledContentDeclaration": "https://ref.openepcis.io/extensions/eu/textile/RecycledContentDeclaration",
  "https://ref.openepcis.io/extensions/eu/textile/recycledContentSource": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/recycledSourceType": "https://ref.openepcis.io/extensions/eu/textile/RecycledSourceType",
  "https://ref.openepcis.io/extensions/eu/textile/repairGuideUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/textile/repairServices": "https://ref.gs1.org/voc/Organization",
  "https://ref.openepcis.io/extensions/eu/textile/robustnessAssessment": "https://ref.openepcis.io/extensions/eu/textile/RobustnessAssessment",
  "https://ref.openepcis.io/extensions/eu/textile/robustnessScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/robustnessTestFabricType": "https://ref.openepcis.io/extensions/eu/textile/FabricType",
  "https://ref.openepcis.io/extensions/eu/textile/safeUseInstructions": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/sameInnerOuterComposition": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/seamAppearanceRating": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/seasonCollection": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/secondaryMaterialFraction": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/sheddingRate": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/textile/sizeRange": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/socType": "https://ref.openepcis.io/extensions/eu/textile/SubstanceOfConcernType",
  "https://ref.openepcis.io/extensions/eu/textile/sortingFactors": "https://ref.openepcis.io/extensions/eu/textile/SortingFactors",
  "https://ref.openepcis.io/extensions/eu/textile/sparePartsAvailable": "http://www.w3.org/2001/XMLSchema#boolean",
  "https://ref.openepcis.io/extensions/eu/textile/sparePartsUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/textile/spinningFacility": "https://ref.openepcis.io/extensions/common/core/FacilityInformation",
  "https://ref.openepcis.io/extensions/eu/textile/spiralityPercentage": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/spiralityScore": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/spiralityTest": "https://ref.openepcis.io/extensions/eu/textile/SpiralityTestResult",
  "https://ref.openepcis.io/extensions/eu/textile/spiralityTestMethod": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/substanceConcentration": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/substancesOfConcern": "https://ref.openepcis.io/extensions/eu/textile/SubstanceOfConcern",
  "https://ref.openepcis.io/extensions/eu/textile/syntheticFiberContent": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/takeBackIncentive": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/takeBackProgram": "https://ref.openepcis.io/extensions/eu/textile/TakeBackProgram",
  "https://ref.openepcis.io/extensions/eu/textile/takeBackUrl": "http://www.w3.org/2001/XMLSchema#anyURI",
  "https://ref.openepcis.io/extensions/eu/textile/tearStrength": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/textile/technicalRecyclability": "https://ref.openepcis.io/extensions/eu/textile/TechnicalRecyclability",
  "https://ref.openepcis.io/extensions/eu/textile/technicalRecyclabilityScore": "http://www.w3.org/2001/XMLSchema#decimal",
  "https://ref.openepcis.io/extensions/eu/textile/tensileStrength": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/textile/testStandard": "https://ref.openepcis.io/extensions/eu/textile/TestStandard",
  "https://ref.openepcis.io/extensions/eu/textile/textileChemicals": "https://ref.openepcis.io/extensions/common/core/HazardousSubstance",
  "https://ref.openepcis.io/extensions/eu/textile/verificationCertification": "https://ref.gs1.org/voc/CertificationDetails",
  "https://ref.openepcis.io/extensions/eu/textile/visualInspection": "https://ref.openepcis.io/extensions/eu/textile/VisualInspectionResult",
  "https://ref.openepcis.io/extensions/eu/textile/visualInspectionScore": "http://www.w3.org/2001/XMLSchema#integer",
  "https://ref.openepcis.io/extensions/eu/textile/visualInspectionTestMethod": "http://www.w3.org/2001/XMLSchema#string",
  "https://ref.openepcis.io/extensions/eu/textile/washingSymbol": "https://ref.openepcis.io/extensions/eu/textile/CareSymbolCode",
  "https://ref.openepcis.io/extensions/eu/textile/wasteOriginType": "https://ref.openepcis.io/extensions/eu/textile/WasteOriginType",
  "https://ref.openepcis.io/extensions/eu/textile/waterUsage": "https://ref.gs1.org/voc/QuantitativeValue",
  "https://ref.openepcis.io/extensions/eu/textile/weavingFacility": "https://ref.openepcis.io/extensions/common/core/FacilityInformation",
  "https://ref.openepcis.io/extensions/us/fsma204/foodTraceabilityListCategory": "https://ref.openepcis.io/extensions/us/fsma204/FoodTraceabilityList"
};

// extensions/common/core/context/dpp-core-context.jsonld
var dpp_core_context_default = {
  _comment: "OpenEPCIS DPP Core Context v0.9.6 - The Universal DPP Platform. Aligned with ESPR 2024/1781, GS1, and UNTP standards. All ratio/fraction values use 0-1 decimal scale. EPCIS Extension: GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/",
  "@context": {
    "@version": 1.1,
    dpp: "https://ref.openepcis.io/extensions/common/core/",
    gs1: "https://ref.gs1.org/voc/",
    xsd: "http://www.w3.org/2001/XMLSchema#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    schema: "https://schema.org/",
    id: "@id",
    type: "@type",
    identifier: "@id",
    _comment: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_architecture: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_classification: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_composition: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_environmental_footprint: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_gs1_alignment: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_gs1us_mapping: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_itip_ai8026: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_recyclability: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_recycled_content_structured: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_robustness: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_soc: { "@id": "rdfs:comment", "@container": "@set" },
    _comment_spareparts: { "@id": "rdfs:comment", "@container": "@set" },
    _notes: { "@id": "rdfs:comment", "@container": "@set" },
    _scenario: "rdfs:comment",
    masterDataAvailableFor: { "@id": "dpp:masterDataAvailableFor", "@container": "@set" },
    manufacturingDate: { "@id": "gs1:manufacturingDate", "@type": "xsd:date" },
    streetAddress: "gs1:streetAddress",
    addressLocality: "gs1:addressLocality",
    postalCode: "gs1:postalCode",
    addressCountry: "gs1:addressCountry",
    countryCode: "gs1:countryCode",
    locationGLN: "gs1:locationGLN",
    physicalLocationName: "gs1:physicalLocationName",
    serialNumber: "gs1:serialNumber",
    gtin: "gs1:gtin",
    productName: "gs1:productName",
    countryOfOrigin: "gs1:countryOfOrigin",
    netWeight: { "@id": "gs1:netWeight", "@type": "@id" },
    AccessLevel: "dpp:AccessLevel",
    DocumentType: "dpp:DocumentType",
    GranularityLevel: "dpp:GranularityLevel",
    HazardClass: "dpp:HazardClass",
    OperationalScope: "dpp:OperationalScope",
    OperatorRole: "dpp:OperatorRole",
    ProductCategory: "dpp:ProductCategory",
    QuantitativeValue: "gs1:QuantitativeValue",
    ExtendedProducerResponsibility: "dpp:ExtendedProducerResponsibility",
    extendedProducerResponsibility: { "@id": "dpp:extendedProducerResponsibility", "@type": "@id", "@container": "@set" },
    eprRegistrationNumber: "dpp:eprRegistrationNumber",
    eprScheme: { "@id": "dpp:eprScheme", "@type": "@id" },
    eprJurisdiction: { "@id": "dpp:eprJurisdiction", "@type": "@id" },
    eprComplianceUrl: { "@id": "dpp:eprComplianceUrl", "@type": "xsd:anyURI" },
    eprWasteStream: "dpp:eprWasteStream",
    Biodegradability: "dpp:Biodegradability",
    biodegradability: { "@id": "dpp:biodegradability", "@type": "@id" },
    biodegradationPercentage: { "@id": "dpp:biodegradationPercentage", "@type": "@id" },
    biodegradabilityTestMethod: { "@id": "dpp:biodegradabilityTestMethod", "@type": "@vocab", "@context": {
      ISO14593: "dpp:ISO14593",
      OECD301B: "dpp:OECD301B",
      OECD301D: "dpp:OECD301D",
      OECD301F: "dpp:OECD301F",
      OECD310: "dpp:OECD310"
    } },
    Compostability: "dpp:Compostability",
    compostability: { "@id": "dpp:compostability", "@type": "@id" },
    compostabilityType: { "@id": "dpp:compostabilityType", "@type": "@vocab", "@context": {
      IndustrialCompostable: "dpp:IndustrialCompostable",
      HomeCompostable: "dpp:HomeCompostable",
      NotCompostable: "dpp:NotCompostable"
    } },
    compostabilityStandard: { "@id": "dpp:compostabilityStandard", "@type": "xsd:anyURI" },
    bioBasedFraction: { "@id": "dpp:bioBasedFraction", "@type": "xsd:decimal" },
    DepositReturnScheme: "dpp:DepositReturnScheme",
    depositReturnScheme: { "@id": "dpp:depositReturnScheme", "@type": "@id" },
    depositAmount: { "@id": "dpp:depositAmount", "@type": "@id" },
    depositSchemeOperator: { "@id": "dpp:depositSchemeOperator", "@type": "@id" },
    depositRedemptionChannelUrl: { "@id": "dpp:depositRedemptionChannelUrl", "@type": "xsd:anyURI" },
    CarbonFootprintDeclaration: "dpp:CarbonFootprintDeclaration",
    carbonFootprintDeclaration: { "@id": "dpp:carbonFootprintDeclaration", "@type": "@id" },
    carbonFootprintRawMaterial: { "@id": "dpp:carbonFootprintRawMaterial", "@type": "@id" },
    carbonFootprintProduction: { "@id": "dpp:carbonFootprintProduction", "@type": "@id" },
    carbonFootprintDistribution: { "@id": "dpp:carbonFootprintDistribution", "@type": "@id" },
    carbonFootprintUse: { "@id": "dpp:carbonFootprintUse", "@type": "@id" },
    carbonFootprintEndOfLife: { "@id": "dpp:carbonFootprintEndOfLife", "@type": "@id" },
    carbonFootprintMethodology: { "@id": "dpp:carbonFootprintMethodology", "@type": "xsd:anyURI" },
    RecyclabilityAssessment: "dpp:RecyclabilityAssessment",
    recyclabilityAssessment: { "@id": "dpp:recyclabilityAssessment", "@type": "@id" },
    recyclabilityScore: { "@id": "dpp:recyclabilityScore", "@type": "xsd:decimal" },
    recyclabilityRate: { "@id": "dpp:recyclabilityRate", "@type": "xsd:decimal" },
    recyclabilityMethodology: { "@id": "dpp:recyclabilityMethodology", "@type": "xsd:anyURI" },
    EnergyEfficiency: "dpp:EnergyEfficiency",
    energyEfficiency: { "@id": "dpp:energyEfficiency", "@type": "@id" },
    energyEfficiencyClass: { "@id": "dpp:energyEfficiencyClass", "@type": "@vocab", "@context": {
      A: "dpp:EnergyClassA",
      B: "dpp:EnergyClassB",
      C: "dpp:EnergyClassC",
      D: "dpp:EnergyClassD",
      E: "dpp:EnergyClassE",
      F: "dpp:EnergyClassF",
      G: "dpp:EnergyClassG"
    } },
    annualEnergyConsumption: { "@id": "dpp:annualEnergyConsumption", "@type": "@id" },
    powerConsumptionOn: { "@id": "dpp:powerConsumptionOn", "@type": "@id" },
    powerConsumptionStandby: { "@id": "dpp:powerConsumptionStandby", "@type": "@id" },
    powerConsumptionOff: { "@id": "dpp:powerConsumptionOff", "@type": "@id" },
    eprelRegistrationNumber: "dpp:eprelRegistrationNumber",
    eprelProductUrl: { "@id": "dpp:eprelProductUrl", "@type": "xsd:anyURI" },
    EndOfLifeProgram: "dpp:EndOfLifeProgram",
    endOfLifeProgram: { "@id": "dpp:endOfLifeProgram", "@type": "@id" },
    takeBackUrl: { "@id": "dpp:takeBackUrl", "@type": "xsd:anyURI" },
    takeBackIncentive: "dpp:takeBackIncentive",
    collectionPointDirectoryUrl: { "@id": "dpp:collectionPointDirectoryUrl", "@type": "xsd:anyURI" },
    dismantlingGuideUrl: { "@id": "dpp:dismantlingGuideUrl", "@type": "xsd:anyURI" },
    hazardSignalWord: { "@id": "dpp:hazardSignalWord", "@type": "@vocab", "@context": {
      Danger: "dpp:HazardDanger",
      Warning: "dpp:HazardWarning"
    } },
    hazardPictogramCode: { "@id": "dpp:hazardPictogramCode", "@container": "@set" },
    hazardStatement: { "@id": "dpp:hazardStatement", "@container": "@set" },
    precautionaryStatement: { "@id": "dpp:precautionaryStatement", "@container": "@set" },
    repairInformationPortalUrl: { "@id": "dpp:repairInformationPortalUrl", "@type": "xsd:anyURI" },
    RepairProvider: "dpp:RepairProvider",
    repairProvider: { "@id": "dpp:repairProvider", "@type": "@id", "@container": "@set" },
    repairProviderName: "dpp:repairProviderName",
    repairProviderUrl: { "@id": "dpp:repairProviderUrl", "@type": "xsd:anyURI" },
    dueDiligenceRegulationContext: { "@id": "dpp:dueDiligenceRegulationContext", "@type": "@id" },
    supplyChainTransparencyUrl: { "@id": "dpp:supplyChainTransparencyUrl", "@type": "xsd:anyURI" },
    forcedLabourFreeAssertion: { "@id": "dpp:forcedLabourFreeAssertion", "@type": "xsd:boolean" },
    isStrategicRawMaterial: { "@id": "dpp:isStrategicRawMaterial", "@type": "xsd:boolean" },
    crmListVersion: "dpp:crmListVersion",
    value: {
      "@id": "gs1:value",
      "@type": "xsd:decimal"
    },
    unitCode: "gs1:unitCode",
    Organization: "gs1:Organization",
    partyGLN: "gs1:partyGLN",
    OperatorInformation: "dpp:OperatorInformation",
    DueDiligenceReport: "dpp:DueDiligenceReport",
    CircularityPerformance: "dpp:CircularityPerformance",
    CircularityInfo: "dpp:CircularityPerformance",
    EmissionsPerformance: "dpp:EmissionsPerformance",
    TraceabilityPerformance: "dpp:TraceabilityPerformance",
    HazardousSubstance: "dpp:HazardousSubstance",
    DocumentReference: "dpp:DocumentReference",
    RecycledContent: "dpp:RecycledContent",
    MaterialComposition: "dpp:MaterialComposition",
    FacilityInformation: "dpp:FacilityInformation",
    SubstanceOfConcern: "dpp:SubstanceOfConcern",
    PerformanceInfo: "dpp:PerformanceInfo",
    RepairabilityInfo: "dpp:RepairabilityInfo",
    AccessRights: "dpp:AccessRights",
    operatorInformation: {
      "@id": "dpp:operatorInformation",
      "@type": "@id"
    },
    operatorRole: {
      "@id": "dpp:operatorRole",
      "@type": "@vocab",
      "@context": {
        Manufacturer: "dpp:Manufacturer",
        Importer: "dpp:Importer",
        Distributor: "dpp:Distributor",
        Processor: "dpp:Processor",
        Trader: "dpp:Trader",
        AuthorisedRepresentative: "dpp:AuthorisedRepresentative",
        FulfilmentServiceProvider: "dpp:FulfilmentServiceProvider"
      }
    },
    gln: "gs1:gln",
    organizationName: "gs1:organizationName",
    registrationNumber: "dpp:registrationNumber",
    economicOperatorId: "dpp:economicOperatorId",
    eoriNumber: "dpp:eoriNumber",
    vatIdentificationNumber: "schema:vatID",
    dueDiligenceReport: {
      "@id": "dpp:dueDiligenceReport",
      "@type": "@id"
    },
    reportUrl: {
      "@id": "dpp:reportUrl",
      "@type": "@id"
    },
    thirdPartyAssurancesUrl: {
      "@id": "dpp:thirdPartyAssurancesUrl",
      "@type": "@id"
    },
    reportDate: {
      "@id": "dpp:reportDate",
      "@type": "xsd:date"
    },
    verificationBody: {
      "@id": "dpp:verificationBody",
      "@type": "@id"
    },
    hazardousSubstances: {
      "@id": "dpp:hazardousSubstances",
      "@type": "@id",
      "@container": "@set"
    },
    hazardClass: {
      "@id": "dpp:hazardClass",
      "@type": "@vocab",
      "@context": {
        AcuteToxicity: "dpp:AcuteToxicity",
        SkinCorrosionOrIrritation: "dpp:SkinCorrosionOrIrritation",
        EyeDamageOrIrritation: "dpp:EyeDamageOrIrritation",
        RespiratoryOrSkinSensitization: "dpp:RespiratoryOrSkinSensitization",
        GermCellMutagenicity: "dpp:GermCellMutagenicity",
        Carcinogenicity: "dpp:Carcinogenicity",
        ReproductiveToxicity: "dpp:ReproductiveToxicity",
        SpecificTargetOrganToxicity: "dpp:SpecificTargetOrganToxicity",
        AspirationHazard: "dpp:AspirationHazard",
        HazardousToAquaticEnvironment: "dpp:HazardousToAquaticEnvironment"
      }
    },
    substanceName: "schema:name",
    casNumber: "dpp:casNumber",
    concentration: {
      "@id": "dpp:concentration",
      "@type": "xsd:decimal"
    },
    hazardImpact: "dpp:hazardImpact",
    substancesOfConcern: {
      "@id": "dpp:substancesOfConcern",
      "@type": "@id",
      "@container": "@set"
    },
    ecNumber: "dpp:ecNumber",
    scipId: "dpp:scipId",
    substanceLocation: "dpp:substanceLocation",
    safeUseInstructions: "dpp:safeUseInstructions",
    safeDisassemblyInstructions: "dpp:safeDisassemblyInstructions",
    documents: {
      "@id": "dpp:documents",
      "@type": "@id",
      "@container": "@set"
    },
    documentType: {
      "@id": "dpp:documentType",
      "@type": "@vocab",
      "@context": {
        DueDiligenceDocument: "dpp:DueDiligenceDocument",
        Certificate: "dpp:Certificate",
        TestReport: "dpp:TestReport",
        Manual: "dpp:Manual",
        DeclarationOfConformity: "dpp:DeclarationOfConformity",
        SafetyDataSheet: "dpp:SafetyDataSheet",
        EnvironmentalReport: "dpp:EnvironmentalReport",
        ThirdPartyVerification: "dpp:ThirdPartyVerification"
      }
    },
    documentUrl: {
      "@id": "dpp:documentUrl",
      "@type": "@id"
    },
    documentTitle: "schema:name",
    mimeType: "dpp:mimeType",
    languageCode: "dpp:languageCode",
    issueDate: {
      "@id": "dpp:issueDate",
      "@type": "xsd:date"
    },
    validUntil: {
      "@id": "schema:validUntil",
      "@type": "xsd:date"
    },
    circularityPerformance: {
      "@id": "dpp:circularityPerformance",
      "@type": "@id"
    },
    recyclableContent: {
      "@id": "dpp:recyclableContent",
      "@type": "xsd:decimal"
    },
    utilityFactor: {
      "@id": "dpp:utilityFactor",
      "@type": "xsd:decimal"
    },
    materialCircularityIndicator: {
      "@id": "dpp:materialCircularityIndicator",
      "@type": "xsd:decimal"
    },
    endOfLifeInstructions: {
      "@id": "dpp:endOfLifeInstructions",
      "@type": "@id"
    },
    wastePreventionInfo: {
      "@id": "dpp:wastePreventionInfo",
      "@type": "@id"
    },
    separateCollectionInfo: {
      "@id": "dpp:separateCollectionInfo",
      "@type": "@id"
    },
    dismantlingInstructions: {
      "@id": "dpp:dismantlingInstructions",
      "@type": "@id"
    },
    recycledContentDetails: {
      "@id": "dpp:recycledContentDetails",
      "@type": "@id"
    },
    recycledContent: {
      "@id": "dpp:recycledContent",
      "@type": "xsd:decimal"
    },
    preConsumerRecycledContent: {
      "@id": "dpp:preConsumerRecycledContent",
      "@type": "xsd:decimal"
    },
    postConsumerRecycledContent: {
      "@id": "dpp:postConsumerRecycledContent",
      "@type": "xsd:decimal"
    },
    materialComposition: {
      "@id": "dpp:materialComposition",
      "@type": "@id",
      "@container": "@set"
    },
    materialName: "schema:name",
    massFraction: {
      "@id": "dpp:massFraction",
      "@type": "xsd:decimal"
    },
    sourceCountry: "gs1:countryOfOrigin",
    isCriticalRawMaterial: {
      "@id": "dpp:isCriticalRawMaterial",
      "@type": "xsd:boolean"
    },
    emissionsPerformance: {
      "@id": "dpp:emissionsPerformance",
      "@type": "@id"
    },
    carbonFootprint: {
      "@id": "dpp:carbonFootprint",
      "@type": "@id"
    },
    carbonFootprintTotal: {
      "@id": "dpp:carbonFootprintTotal",
      "@type": "xsd:decimal"
    },
    declaredUnit: "dpp:declaredUnit",
    carbonFootprintStudyUrl: {
      "@id": "dpp:carbonFootprintStudyUrl",
      "@type": "@id"
    },
    operationalScope: {
      "@id": "dpp:operationalScope",
      "@type": "@vocab",
      "@context": {
        CradleToGate: "dpp:CradleToGate",
        CradleToGrave: "dpp:CradleToGrave"
      }
    },
    primarySourcedRatio: {
      "@id": "dpp:primarySourcedRatio",
      "@type": "xsd:decimal"
    },
    traceabilityPerformance: {
      "@id": "dpp:traceabilityPerformance",
      "@type": "@id"
    },
    verifiedRatio: {
      "@id": "dpp:verifiedRatio",
      "@type": "xsd:decimal"
    },
    granularity: {
      "@id": "dpp:granularityLevel"
    },
    lastDataUpdate: {
      "@id": "dpp:lastDataUpdate",
      "@type": "xsd:dateTime"
    },
    dataQualityAssessment: "dpp:dataQualityAssessment",
    dataProviderCertification: "dpp:dataProviderCertification",
    regulatoryReferenceNumber: "gs1:regulatoryReferenceNumber",
    complianceDate: {
      "@id": "dpp:complianceDate",
      "@type": "xsd:date"
    },
    complianceStatus: {
      "@id": "dpp:complianceStatus",
      "@type": "xsd:boolean"
    },
    facilityInformation: {
      "@id": "dpp:facilityInformation",
      "@type": "@id"
    },
    facilityType: "dpp:facilityType",
    name: "gs1:name",
    address: {
      "@id": "gs1:address",
      "@type": "@id"
    },
    facilityCertifications: {
      "@id": "dpp:facilityCertifications",
      "@type": "@id",
      "@container": "@set"
    },
    performanceInfo: {
      "@id": "dpp:performanceInfo",
      "@type": "@id"
    },
    expectedLifespan: {
      "@id": "dpp:expectedLifespan",
      "@type": "@id"
    },
    guaranteedLifespan: {
      "@id": "dpp:guaranteedLifespan",
      "@type": "@id"
    },
    usageCycles: {
      "@id": "dpp:usageCycles",
      "@type": "xsd:integer"
    },
    technicalLifetime: {
      "@id": "dpp:technicalLifetime",
      "@type": "@id"
    },
    performanceClass: "dpp:performanceClass",
    testedConditions: "dpp:testedConditions",
    repairabilityInfo: {
      "@id": "dpp:repairabilityInfo",
      "@type": "@id"
    },
    repairabilityScore: {
      "@id": "dpp:repairabilityScore",
      "@type": "xsd:decimal"
    },
    repairabilityClass: "dpp:repairabilityClass",
    sparePartsAvailability: {
      "@id": "dpp:sparePartsAvailability",
      "@type": "@id"
    },
    sparePartsDeliveryTime: {
      "@id": "schema:deliveryTime",
      "@type": "@id"
    },
    repairInstructions: {
      "@id": "dpp:repairInstructions",
      "@type": "@id"
    },
    professionalRepairNetwork: {
      "@id": "dpp:professionalRepairNetwork",
      "@type": "@id"
    },
    diyRepairPossible: {
      "@id": "dpp:diyRepairPossible",
      "@type": "xsd:boolean"
    },
    softwareUpdatesAvailability: {
      "@id": "dpp:softwareUpdatesAvailability",
      "@type": "@id"
    },
    accessRights: {
      "@id": "dpp:accessRights",
      "@type": "@id"
    },
    accessLevel: {
      "@id": "dpp:accessLevel",
      "@type": "@vocab",
      "@context": {
        Public: "dpp:Public",
        AuthorizedOnly: "dpp:AuthorizedOnly",
        Restricted: "dpp:Restricted"
      }
    },
    authorizedParties: {
      "@id": "dpp:authorizedParties",
      "@type": "@id",
      "@container": "@set"
    },
    dataRetentionPeriod: {
      "@id": "dpp:dataRetentionPeriod",
      "@type": "@id"
    },
    productCategory: {
      "@id": "dpp:productCategory",
      "@type": "@vocab",
      "@context": {
        Batteries: "dpp:Batteries",
        Textiles: "dpp:Textiles",
        Electronics: "dpp:Electronics",
        Furniture: "dpp:Furniture",
        Tyres: "dpp:Tyres",
        ConstructionProducts: "dpp:ConstructionProducts",
        Chemicals: "dpp:Chemicals",
        Packaging: "dpp:Packaging",
        FoodContact: "dpp:FoodContact",
        IronSteel: "dpp:IronSteel",
        Aluminium: "dpp:Aluminium"
      }
    },
    productModel: "schema:ProductModel",
    uniqueProductIdentifier: {
      "@id": "gs1:productID",
      "@type": "@id"
    },
    digitalProductPassportId: {
      "@id": "dpp:passportIdentifier",
      "@type": "@id"
    },
    passportVersion: "dpp:passportVersion",
    passportIssueDate: {
      "@id": "dpp:passportIssueDate",
      "@type": "xsd:date"
    },
    PassportStatus: "dpp:PassportStatus",
    dppStatus: {
      "@id": "dpp:passportStatus"
    },
    DPPGranularity: "dpp:DPPGranularity",
    ModelLevel: "dpp:ModelLevel",
    ModelPerSiteLevel: "dpp:ModelPerSiteLevel",
    BatchLevel: "dpp:BatchLevel",
    ItemLevel: "dpp:ItemLevel",
    schemaVersion: "schema:schemaVersion",
    status: {
      "@id": "schema:status",
      "@type": "@vocab",
      "@context": {
        Draft: "dpp:Draft",
        Active: "dpp:Active",
        Inactive: "dpp:Inactive",
        Withdrawn: "dpp:Withdrawn",
        Archived: "dpp:Archived",
        Invalid: "dpp:Invalid",
        Suspended: "dpp:Suspended"
      }
    },
    reportingGranularity: {
      "@id": "dpp:reportingGranularity",
      "@type": "@vocab",
      "@context": {
        ModelLevel: "dpp:ModelLevel",
        ModelPerSiteLevel: "dpp:ModelPerSiteLevel",
        BatchLevel: "dpp:BatchLevel",
        ItemLevel: "dpp:ItemLevel"
      }
    },
    lastUpdated: {
      "@id": "dpp:lastUpdated",
      "@type": "xsd:dateTime"
    },
    dppSchemaVersion: "dpp:dppSchemaVersion",
    facilityId: "dpp:facilityId",
    contentSpecificationIds: {
      "@id": "dpp:contentSpecificationId",
      "@type": "@id",
      "@container": "@set"
    },
    DigitalProductPassport: "dpp:DigitalProductPassport",
    DataElement: "dpp:DataElement",
    DataElementCollection: "dpp:DataElementCollection",
    SingleValuedDataElement: "dpp:SingleValuedDataElement",
    MultiValuedDataElement: "dpp:MultiValuedDataElement",
    MultiLanguageDataElement: "dpp:MultiLanguageDataElement",
    MultiLanguageValue: "dpp:MultiLanguageValue",
    elementId: "dpp:elementId",
    dictionaryReference: { "@id": "dpp:dictionaryReference", "@type": "@id" },
    valueDataType: "dpp:valueDataType",
    dataElement: { "@id": "dpp:dataElement", "@container": "@set" },
    multiLanguageValue: { "@id": "dpp:multiLanguageValue", "@container": "@set" },
    passportExpiryDate: {
      "@id": "dpp:passportExpiryDate",
      "@type": "xsd:date"
    },
    passportIssuer: {
      "@id": "dpp:passportIssuer",
      "@type": "@id"
    },
    previousPassportVersion: {
      "@id": "dpp:previousPassportVersion",
      "@type": "@id"
    },
    activityClassification: "dpp:activityClassification",
    did: {
      "@id": "dpp:did",
      "@type": "@id"
    },
    identityCredentialUrl: {
      "@id": "dpp:identityCredentialUrl",
      "@type": "@id"
    },
    IndividualTradeItemPiece: "dpp:IndividualTradeItemPiece",
    tradeItemPieceCount: {
      "@id": "dpp:tradeItemPieceCount",
      "@type": "xsd:positiveInteger"
    },
    tradeItemPieceNumber: {
      "@id": "dpp:tradeItemPieceNumber",
      "@type": "xsd:positiveInteger"
    },
    tradeItemPieceOf: {
      "@id": "dpp:tradeItemPieceOf",
      "@type": "@id"
    },
    tradeItemPieceDescription: "dpp:tradeItemPieceDescription",
    tradeItemPieces: {
      "@id": "dpp:tradeItemPieces",
      "@type": "@id",
      "@container": "@set"
    },
    CustomsCommodityCodeType: "dpp:CustomsCommodityCodeType",
    customsCommodityCode: "dpp:customsCommodityCode",
    customsCommodityCodeType: {
      "@id": "dpp:customsCommodityCodeType",
      "@type": "@vocab",
      "@context": {
        HS6: "dpp:HS6",
        HS8: "dpp:HS8",
        CN8: "dpp:CN8",
        CN10: "dpp:CN10",
        HTSUS10: "dpp:HTSUS10"
      }
    },
    isRegulationCompliant: {
      "@id": "dpp:isRegulationCompliant",
      "@type": "xsd:boolean"
    }
  }
};

// extensions/common/core/examples/en18223-passport.compressed.jsonld
var en18223_passport_compressed_default = {
  _comment: "Good GS1 Web Vocabulary + GS1 Digital Link JSON-LD for a battery DPP. This is the EN 18223 'compressed' serialization (clauses 5.2.6-5.2.9): plain key-value data points. scripts/derive-en18223.ts derives the Annex A 'expanded' form (en18223-passport.expanded.json) and fills the envelope automatically from context and data: uniqueProductIdentifier from id, granularity from the Digital Link Application Identifiers (01/21 -> item), digitalProductPassportId defaulting to the identity, dppSchemaVersion = EN 18223:2026, dppStatus = active, and contentSpecificationIds from the dictionaryReference namespaces actually used. Only genuine product data is carried here; identifiers are GS1 Digital Links (01/21 product, 417 operator, 414 facility).",
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    { gs1: "https://ref.gs1.org/voc/", xsd: "http://www.w3.org/2001/XMLSchema#" }
  ],
  type: ["gs1:Product", "DigitalProductPassport"],
  id: "https://id.example.org/01/09506000134352/21/SN12345",
  lastUpdated: "2026-06-07T10:00:00Z",
  economicOperatorId: "https://id.example.org/417/4012345000009",
  facilityId: "https://id.example.org/414/4012345000016",
  "gs1:productName": [
    { "@value": "EcoCell Battery Module", "@language": "en-GB" },
    { "@value": "EcoCell Batteriemodul", "@language": "de-DE" }
  ],
  netWeight: { type: "gs1:QuantitativeValue", value: 12.5, unitCode: "KGM" },
  recycledContent: 0.35,
  preConsumerRecycledContent: 0.12,
  postConsumerRecycledContent: 0.23,
  repairInstructions: {
    type: "DocumentReference",
    documentUrl: "https://example.org/manual-en.pdf",
    mimeType: "application/pdf",
    languageCode: "en-GB"
  }
};

// demos/en18223-converter/app.ts
var range = new Map(Object.entries(range_index_default));
var CONTEXTS = {
  "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld": dpp_core_context_default
};
var documentLoader = async (url) => {
  if (CONTEXTS[url]) return { contextUrl: void 0, documentUrl: url, document: CONTEXTS[url] };
  const res = await fetch(url, { headers: { Accept: "application/ld+json, application/json" } });
  if (!res.ok) throw new Error(`could not load context ${url}: ${res.status}`);
  return { contextUrl: void 0, documentUrl: url, document: await res.json() };
};
var CORE = "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld";
var gs1 = { gs1: "https://ref.gs1.org/voc/", xsd: "http://www.w3.org/2001/XMLSchema#" };
var sampleModel = {
  "@context": [CORE, gs1],
  type: ["gs1:Product", "DigitalProductPassport"],
  id: "https://id.example.org/01/09506000134352",
  economicOperatorId: "https://id.example.org/417/4012345000009",
  "gs1:productName": [{ "@value": "EcoCell Battery Module IM-500", "@language": "en-GB" }],
  recycledContent: 0.16
};
var sampleBatch = {
  "@context": [CORE, gs1],
  type: ["gs1:Product", "DigitalProductPassport"],
  id: "https://id.example.org/01/09506000134352/10/LOT-2026-04",
  economicOperatorId: "https://id.example.org/417/4012345000009",
  facilityId: "https://id.example.org/414/4012345000016",
  recycledContent: 0.16,
  preConsumerRecycledContent: 0.04,
  postConsumerRecycledContent: 0.12
};
var SAMPLES = {
  "Battery, item-level (full)": en18223_passport_compressed_default,
  "Trade item, model-level": sampleModel,
  "Batch / lot-level": sampleBatch
};
var $ = (id) => document.getElementById(id);
var inputEl = () => $("input");
var outputEl = () => $("output");
var statusEl = () => $("status");
function setStatus(msg, kind = "") {
  const el = statusEl();
  el.textContent = msg;
  el.className = kind;
}
async function derive() {
  setStatus("Deriving\u2026");
  let input;
  try {
    input = JSON.parse(inputEl().value);
  } catch (e) {
    outputEl().textContent = "";
    setStatus(`Invalid JSON: ${e.message}`, "err");
    return;
  }
  try {
    const out = await deriveEN18223(input, range, documentLoader);
    outputEl().textContent = JSON.stringify(out, null, 2);
    const n = Array.isArray(out.elements) ? out.elements.length : 0;
    setStatus(`Derived: ${n} top-level elements \xB7 granularity "${out.granularity}" \xB7 dppStatus "${out.dppStatus}"`, "ok");
  } catch (e) {
    outputEl().textContent = "";
    setStatus(`Error: ${e.message}`, "err");
  }
}
function loadSample(name) {
  inputEl().value = JSON.stringify(SAMPLES[name], null, 2);
}
function init() {
  const select = $("sample");
  for (const name of Object.keys(SAMPLES)) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  }
  select.addEventListener("change", () => loadSample(select.value));
  $("derive").addEventListener("click", () => void derive());
  loadSample(Object.keys(SAMPLES)[0]);
  void derive();
}
init();
/*! Bundled license information:

rdf-canonize/lib/platform-browser.js:
  (*!
   * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
   *)

rdf-canonize/lib/MessageDigest-webcrypto.js:
rdf-canonize/lib/RDFC10.js:
rdf-canonize/lib/RDFC10Sync.js:
  (*!
   * Copyright (c) 2016-2023 Digital Bazaar, Inc. All rights reserved.
   *)

rdf-canonize/lib/Permuter.js:
rdf-canonize/lib/NQuads.js:
  (*!
   * Copyright (c) 2016-2022 Digital Bazaar, Inc. All rights reserved.
   *)

jsonld/lib/context.js:
  (* disallow aliasing @context and @preserve *)

jsonld/lib/frame.js:
  (* remove @preserve from results *)
  (**
   * Removes the @preserve keywords from expanded result of framing.
   *
   * @param input the framed, framed output.
   * @param options the framing options used.
   *
   * @return the resulting output.
   *)
  (* remove @preserve *)

jsonld/lib/jsonld.js:
  (**
   * A JavaScript implementation of the JSON-LD API.
   *
   * @author Dave Longley
   *
   * @license BSD 3-Clause License
   * Copyright (c) 2011-2022 Digital Bazaar, Inc.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   *
   * Redistributions in binary form must reproduce the above copyright
   * notice, this list of conditions and the following disclaimer in the
   * documentation and/or other materials provided with the distribution.
   *
   * Neither the name of the Digital Bazaar, Inc. nor the names of its
   * contributors may be used to endorse or promote products derived from
   * this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
   * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
   * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
   * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
   * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
   * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
   * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   *)
*/
