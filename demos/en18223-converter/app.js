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
var valueTypeForId = (id) => /^https?:\/\//.test(id) ? "xsd:anyURI" : "xsd:string";
function isBareRef(node) {
  if (!isNode(node) || !node["@id"]) return false;
  const types = node["@type"] || [];
  if (`${DPP}documentUrl` in node || types.includes(`${DPP}DocumentReference`)) return false;
  return Object.keys(node).every(skipKey);
}
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
    if (values.every(isBareRef)) {
      return {
        ...base,
        objectType: "MultiValuedDataElement",
        valueDataType: valueTypeForId(values[0]["@id"]),
        value: values.map((n) => n["@id"])
      };
    }
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
  if (isBareRef(node)) {
    return { objectType: "SingleValuedDataElement", valueDataType: valueTypeForId(node["@id"]), value: node["@id"] };
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

// demos/en18223-converter/contexts.json
var contexts_default = {
  "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld": {
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
      _comment: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_architecture: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_classification: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_composition: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_environmental_footprint: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_gs1_alignment: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_gs1us_mapping: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_itip_ai8026: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_recyclability: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_recycled_content_structured: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_robustness: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_soc: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _comment_spareparts: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _notes: {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      _scenario: "rdfs:comment",
      masterDataAvailableFor: {
        "@id": "dpp:masterDataAvailableFor",
        "@container": "@set"
      },
      manufacturingDate: {
        "@id": "gs1:manufacturingDate",
        "@type": "xsd:date"
      },
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
      netWeight: {
        "@id": "gs1:netWeight",
        "@type": "@id"
      },
      AccessLevel: "dpp:AccessLevel",
      DocumentType: "dpp:DocumentType",
      GranularityLevel: "dpp:GranularityLevel",
      HazardClass: "dpp:HazardClass",
      OperationalScope: "dpp:OperationalScope",
      OperatorRole: "dpp:OperatorRole",
      ProductCategory: "dpp:ProductCategory",
      QuantitativeValue: "gs1:QuantitativeValue",
      ExtendedProducerResponsibility: "dpp:ExtendedProducerResponsibility",
      extendedProducerResponsibility: {
        "@id": "dpp:extendedProducerResponsibility",
        "@type": "@id",
        "@container": "@set"
      },
      eprRegistrationNumber: "dpp:eprRegistrationNumber",
      eprScheme: {
        "@id": "dpp:eprScheme",
        "@type": "@id"
      },
      eprJurisdiction: {
        "@id": "dpp:eprJurisdiction",
        "@type": "@id"
      },
      eprComplianceUrl: {
        "@id": "dpp:eprComplianceUrl",
        "@type": "xsd:anyURI"
      },
      eprWasteStream: "dpp:eprWasteStream",
      Biodegradability: "dpp:Biodegradability",
      biodegradability: {
        "@id": "dpp:biodegradability",
        "@type": "@id"
      },
      biodegradationPercentage: {
        "@id": "dpp:biodegradationPercentage",
        "@type": "@id"
      },
      biodegradabilityTestMethod: {
        "@id": "dpp:biodegradabilityTestMethod",
        "@type": "@vocab",
        "@context": {
          ISO14593: "dpp:ISO14593",
          OECD301B: "dpp:OECD301B",
          OECD301D: "dpp:OECD301D",
          OECD301F: "dpp:OECD301F",
          OECD310: "dpp:OECD310"
        }
      },
      Compostability: "dpp:Compostability",
      compostability: {
        "@id": "dpp:compostability",
        "@type": "@id"
      },
      compostabilityType: {
        "@id": "dpp:compostabilityType",
        "@type": "@vocab",
        "@context": {
          IndustrialCompostable: "dpp:IndustrialCompostable",
          HomeCompostable: "dpp:HomeCompostable",
          NotCompostable: "dpp:NotCompostable"
        }
      },
      compostabilityStandard: {
        "@id": "dpp:compostabilityStandard",
        "@type": "xsd:anyURI"
      },
      bioBasedFraction: {
        "@id": "dpp:bioBasedFraction",
        "@type": "xsd:decimal"
      },
      DepositReturnScheme: "dpp:DepositReturnScheme",
      depositReturnScheme: {
        "@id": "dpp:depositReturnScheme",
        "@type": "@id"
      },
      depositAmount: {
        "@id": "dpp:depositAmount",
        "@type": "@id"
      },
      depositSchemeOperator: {
        "@id": "dpp:depositSchemeOperator",
        "@type": "@id"
      },
      depositRedemptionChannelUrl: {
        "@id": "dpp:depositRedemptionChannelUrl",
        "@type": "xsd:anyURI"
      },
      CarbonFootprintDeclaration: "dpp:CarbonFootprintDeclaration",
      carbonFootprintDeclaration: {
        "@id": "dpp:carbonFootprintDeclaration",
        "@type": "@id"
      },
      carbonFootprintRawMaterial: {
        "@id": "dpp:carbonFootprintRawMaterial",
        "@type": "@id"
      },
      carbonFootprintProduction: {
        "@id": "dpp:carbonFootprintProduction",
        "@type": "@id"
      },
      carbonFootprintDistribution: {
        "@id": "dpp:carbonFootprintDistribution",
        "@type": "@id"
      },
      carbonFootprintUse: {
        "@id": "dpp:carbonFootprintUse",
        "@type": "@id"
      },
      carbonFootprintEndOfLife: {
        "@id": "dpp:carbonFootprintEndOfLife",
        "@type": "@id"
      },
      carbonFootprintMethodology: {
        "@id": "dpp:carbonFootprintMethodology",
        "@type": "xsd:anyURI"
      },
      RecyclabilityAssessment: "dpp:RecyclabilityAssessment",
      recyclabilityAssessment: {
        "@id": "dpp:recyclabilityAssessment",
        "@type": "@id"
      },
      recyclabilityScore: {
        "@id": "dpp:recyclabilityScore",
        "@type": "xsd:decimal"
      },
      recyclabilityRate: {
        "@id": "dpp:recyclabilityRate",
        "@type": "xsd:decimal"
      },
      recyclabilityMethodology: {
        "@id": "dpp:recyclabilityMethodology",
        "@type": "xsd:anyURI"
      },
      EnergyEfficiency: "dpp:EnergyEfficiency",
      energyEfficiency: {
        "@id": "dpp:energyEfficiency",
        "@type": "@id"
      },
      energyEfficiencyClass: {
        "@id": "dpp:energyEfficiencyClass",
        "@type": "@vocab",
        "@context": {
          A: "dpp:EnergyClassA",
          B: "dpp:EnergyClassB",
          C: "dpp:EnergyClassC",
          D: "dpp:EnergyClassD",
          E: "dpp:EnergyClassE",
          F: "dpp:EnergyClassF",
          G: "dpp:EnergyClassG"
        }
      },
      annualEnergyConsumption: {
        "@id": "dpp:annualEnergyConsumption",
        "@type": "@id"
      },
      powerConsumptionOn: {
        "@id": "dpp:powerConsumptionOn",
        "@type": "@id"
      },
      powerConsumptionStandby: {
        "@id": "dpp:powerConsumptionStandby",
        "@type": "@id"
      },
      powerConsumptionOff: {
        "@id": "dpp:powerConsumptionOff",
        "@type": "@id"
      },
      eprelRegistrationNumber: "dpp:eprelRegistrationNumber",
      eprelProductUrl: {
        "@id": "dpp:eprelProductUrl",
        "@type": "xsd:anyURI"
      },
      EndOfLifeProgram: "dpp:EndOfLifeProgram",
      endOfLifeProgram: {
        "@id": "dpp:endOfLifeProgram",
        "@type": "@id"
      },
      takeBackUrl: {
        "@id": "dpp:takeBackUrl",
        "@type": "xsd:anyURI"
      },
      takeBackIncentive: "dpp:takeBackIncentive",
      collectionPointDirectoryUrl: {
        "@id": "dpp:collectionPointDirectoryUrl",
        "@type": "xsd:anyURI"
      },
      dismantlingGuideUrl: {
        "@id": "dpp:dismantlingGuideUrl",
        "@type": "xsd:anyURI"
      },
      hazardSignalWord: {
        "@id": "dpp:hazardSignalWord",
        "@type": "@vocab",
        "@context": {
          Danger: "dpp:HazardDanger",
          Warning: "dpp:HazardWarning"
        }
      },
      hazardPictogramCode: {
        "@id": "dpp:hazardPictogramCode",
        "@container": "@set"
      },
      hazardStatement: {
        "@id": "dpp:hazardStatement",
        "@container": "@set"
      },
      precautionaryStatement: {
        "@id": "dpp:precautionaryStatement",
        "@container": "@set"
      },
      repairInformationPortalUrl: {
        "@id": "dpp:repairInformationPortalUrl",
        "@type": "xsd:anyURI"
      },
      RepairProvider: "dpp:RepairProvider",
      repairProvider: {
        "@id": "dpp:repairProvider",
        "@type": "@id",
        "@container": "@set"
      },
      repairProviderName: "dpp:repairProviderName",
      repairProviderUrl: {
        "@id": "dpp:repairProviderUrl",
        "@type": "xsd:anyURI"
      },
      dueDiligenceRegulationContext: {
        "@id": "dpp:dueDiligenceRegulationContext",
        "@type": "@id"
      },
      supplyChainTransparencyUrl: {
        "@id": "dpp:supplyChainTransparencyUrl",
        "@type": "xsd:anyURI"
      },
      forcedLabourFreeAssertion: {
        "@id": "dpp:forcedLabourFreeAssertion",
        "@type": "xsd:boolean"
      },
      isStrategicRawMaterial: {
        "@id": "dpp:isStrategicRawMaterial",
        "@type": "xsd:boolean"
      },
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
      dictionaryReference: {
        "@id": "dpp:dictionaryReference",
        "@type": "@id"
      },
      valueDataType: "dpp:valueDataType",
      dataElement: {
        "@id": "dpp:dataElement",
        "@container": "@set"
      },
      multiLanguageValue: {
        "@id": "dpp:multiLanguageValue",
        "@container": "@set"
      },
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
  },
  "https://ref.openepcis.io/extensions/common/core/gs1-shortcuts-context.jsonld": {
    "@context": {
      "@version": 1.1,
      gs1: "https://ref.gs1.org/voc/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      BATTERY_DIRECTIVE: "gs1:RegulationTypeCode-BATTERY_DIRECTIVE",
      DEFORESTATION_REGULATION: "gs1:RegulationTypeCode-DEFORESTATION_REGULATION",
      ROHS_DIRECTIVE: "gs1:RegulationTypeCode-ROHS_DIRECTIVE",
      WEEE_DIRECTIVE: "gs1:RegulationTypeCode-WEEE_DIRECTIVE",
      REACH: "gs1:RegulationTypeCode-REACH",
      CE_MARKING: "gs1:RegulationTypeCode-CE_MARKING",
      CE: "gs1:RegulationTypeCode-CE",
      E_MARK: "gs1:RegulationTypeCode-E_MARK",
      ECODESIGN_DIRECTIVE: "gs1:RegulationTypeCode-ECODESIGN_DIRECTIVE",
      LVD_DIRECTIVE: "gs1:RegulationTypeCode-LVD_DIRECTIVE",
      EMC_DIRECTIVE: "gs1:RegulationTypeCode-EMC_DIRECTIVE",
      MACHINERY_DIRECTIVE: "gs1:RegulationTypeCode-MACHINERY_DIRECTIVE",
      PACKAGING_WASTE_DIRECTIVE: "gs1:RegulationTypeCode-PACKAGING_WASTE_DIRECTIVE",
      FOOD_CONTACT_MATERIAL: "gs1:RegulationTypeCode-FOOD_CONTACT_MATERIAL",
      MEDICAL_DEVICE_REGULATION: "gs1:RegulationTypeCode-MEDICAL_DEVICE_REGULATION",
      BIOCIDE_REGULATION: "gs1:RegulationTypeCode-BIOCIDE_REGULATION",
      COSMETICS_REGULATION: "gs1:RegulationTypeCode-COSMETICS_REGULATION",
      TOYS_DIRECTIVE: "gs1:RegulationTypeCode-TOYS_DIRECTIVE",
      PPE_REGULATION: "gs1:RegulationTypeCode-PPE_REGULATION",
      CONSTRUCTION_PRODUCTS_REGULATION: "gs1:RegulationTypeCode-CONSTRUCTION_PRODUCTS_REGULATION",
      INFANT_FORMULA_LABELLING: "gs1:RegulationTypeCode-INFANT_FORMULA_LABELLING",
      AEROSOL_REVERSE_EPSILON: "gs1:RegulationTypeCode-AEROSOL_REVERSE_EPSILON",
      UVA: "gs1:RegulationTypeCode-UVA",
      regulationType: {
        "@id": "gs1:regulationType",
        "@type": "@id"
      },
      regulatoryAct: "gs1:regulatoryAct",
      isRegulationCompliant: {
        "@id": "gs1:isRegulationCompliant",
        "@type": "xsd:boolean"
      },
      regulatoryInformation: {
        "@id": "gs1:regulatoryInformation",
        "@type": "@id"
      }
    }
  },
  "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld": {
    "@context": [
      "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
      {
        "@version": 1.1,
        gs1: "https://ref.gs1.org/voc/",
        battery: "https://ref.openepcis.io/extensions/eu/battery/",
        dpp: "https://ref.openepcis.io/extensions/common/core/",
        schema: "https://schema.org/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        cv: "http://data.europa.eu/m8g/",
        cccev: "http://data.europa.eu/m8g/",
        id: "@id",
        type: "@type",
        Product: "gs1:Product",
        productName: "gs1:productName",
        gtin: "gs1:gtin",
        countryOfOrigin: "gs1:countryOfOrigin",
        manufacturer: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        manufacturingDate: {
          "@id": "gs1:manufacturingDate",
          "@type": "xsd:date"
        },
        netWeight: {
          "@id": "gs1:netWeight",
          "@type": "@id"
        },
        grossWeight: {
          "@id": "gs1:grossWeight",
          "@type": "@id"
        },
        hasBattery: {
          "@id": "battery:hasBattery",
          "@type": "@id"
        },
        AdditionalProductClassificationDetails: "gs1:AdditionalProductClassificationDetails",
        additionalProductClassification: {
          "@id": "gs1:additionalProductClassification",
          "@type": "@id"
        },
        additionalProductClassificationCode: "gs1:additionalProductClassificationCode",
        additionalProductClassificationCodeDescription: "gs1:additionalProductClassificationCodeDescription",
        additionalProductClassificationSystemCode: "gs1:additionalProductClassificationSystemCode",
        RegulatoryInformation: "gs1:RegulatoryInformation",
        "RegulationTypeCode-BATTERY_DIRECTIVE": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE",
        "RegulationTypeCode-CE": "gs1:RegulationTypeCode-CE",
        regulatoryInformation: "gs1:regulatoryInformation",
        regulationType: "gs1:regulationType",
        regulatoryAct: "gs1:regulatoryAct",
        regulatoryActStatus: "gs1:regulatoryActStatus",
        regulatoryPermitIdentification: "gs1:regulatoryPermitIdentification",
        isRegulationCompliant: "gs1:isRegulationCompliant",
        regulatoryInformationProvider: "gs1:regulatoryInformationProvider",
        Battery: "battery:Battery",
        BatteryChemistry: "battery:BatteryChemistry",
        TechnicalSpecification: "battery:TechnicalSpecification",
        BatteryMaterial: "battery:BatteryMaterial",
        RecycledContent: "battery:RecycledContent",
        EndOfLifeInfo: "battery:EndOfLifeInfo",
        HazardousSubstance: "battery:HazardousSubstance",
        DismantlingDocument: "battery:DismantlingDocument",
        Label: "battery:Label",
        SupplyChainDueDiligence: "battery:SupplyChainDueDiligence",
        PowerCapabilityAtSoC: "battery:PowerCapabilityAtSoC",
        TemperatureRange: "battery:TemperatureRange",
        NegativeEvent: "battery:NegativeEvent",
        CarbonFootprintDeclaration: "battery:CarbonFootprintDeclaration",
        ThirdPartyVerification: "battery:ThirdPartyVerification",
        MaterialRecoveryTarget: "battery:MaterialRecoveryTarget",
        QuantitativeValue: "gs1:QuantitativeValue",
        BatteryCategory: "battery:BatteryCategory",
        BatteryStatus: "battery:BatteryStatus",
        CellType: "battery:CellType",
        ComponentLocation: "battery:ComponentLocation",
        MaterialCategory: "battery:MaterialCategory",
        HazardClass: "battery:HazardClass",
        DismantlingDocumentType: "battery:DismantlingDocumentType",
        LabelSubject: "battery:LabelSubject",
        OperatorRole: "dpp:OperatorRole",
        IncidentSeverity: "battery:IncidentSeverity",
        NegativeEventType: "battery:NegativeEventType",
        ComplianceStatus: "battery:ComplianceStatus",
        CarbonFootprintClass: "battery:CarbonFootprintClass",
        ResponsibleSourcingStandard: "battery:ResponsibleSourcingStandard",
        AccessLevel: "battery:AccessLevel",
        PublicAccess: "battery:PublicAccess",
        AuthorizedAccess: "battery:AuthorizedAccess",
        AuthoritiesOnly: "battery:AuthoritiesOnly",
        batteryCategory: {
          "@id": "schema:category",
          "@type": "@vocab",
          "@context": {
            LMTBattery: "battery:LMTBattery",
            EVBattery: "battery:EVBattery",
            IndustrialBattery: "battery:IndustrialBattery",
            StationaryBattery: "battery:StationaryBattery",
            PortableBattery: "battery:PortableBattery",
            SLIBattery: "battery:SLIBattery"
          }
        },
        batteryStatus: {
          "@id": "schema:status",
          "@type": "@vocab",
          "@context": {
            Original: "battery:Original",
            Repurposed: "battery:Repurposed",
            Reused: "battery:Reused",
            Remanufactured: "battery:Remanufactured",
            Waste: "battery:Waste"
          }
        },
        batteryModel: "schema:model",
        batteryModelIdentifier: "battery:batteryModelIdentifier",
        batterySerialNumber: "gs1:hasSerialNumber",
        facilityIdentifier: "battery:facilityIdentifier",
        manufacturingPlace: {
          "@id": "battery:manufacturingPlace",
          "@type": "@id"
        },
        cellType: {
          "@id": "battery:cellType",
          "@type": "@vocab",
          "@context": {
            CylindricalCell: "battery:CylindricalCell",
            PrismaticCell: "battery:PrismaticCell",
            PouchCell: "battery:PouchCell",
            BladeCell: "battery:BladeCell",
            CoinCell: "battery:CoinCell"
          }
        },
        numberOfCells: {
          "@id": "battery:numberOfCells",
          "@type": "xsd:integer"
        },
        numberOfModules: {
          "@id": "battery:numberOfModules",
          "@type": "xsd:integer"
        },
        puttingIntoService: {
          "@id": "battery:puttingIntoService",
          "@type": "xsd:date"
        },
        batteryPassportIdentifier: {
          "@id": "battery:batteryPassportIdentifier",
          "@type": "@id"
        },
        schemaVersion: "schema:schemaVersion",
        dppStatus: {
          "@id": "dpp:passportStatus"
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
        batteryChemistry: {
          "@id": "battery:batteryChemistry",
          "@type": "@id"
        },
        shortName: "schema:name",
        fullName: "schema:name",
        cathodeActiveMaterial: "battery:cathodeActiveMaterial",
        anodeActiveMaterial: "battery:anodeActiveMaterial",
        electrolyteType: "battery:electrolyteType",
        electrolyteComposition: "battery:electrolyteComposition",
        technicalSpecifications: {
          "@id": "battery:technicalSpecifications",
          "@type": "@id"
        },
        ratedCapacity: {
          "@id": "battery:ratedCapacity",
          "@type": "@id"
        },
        ratedEnergy: {
          "@id": "battery:ratedEnergy",
          "@type": "@id"
        },
        nominalVoltage: {
          "@id": "battery:nominalVoltage",
          "@type": "@id"
        },
        minimumVoltage: {
          "@id": "battery:minimumVoltage",
          "@type": "@id"
        },
        maximumVoltage: {
          "@id": "battery:maximumVoltage",
          "@type": "@id"
        },
        ratedMaximumPower: {
          "@id": "battery:ratedMaximumPower",
          "@type": "@id"
        },
        maximumChargingPower: {
          "@id": "battery:maximumChargingPower",
          "@type": "@id"
        },
        maximumDischargingPower: {
          "@id": "battery:maximumDischargingPower",
          "@type": "@id"
        },
        maximumChargingCurrent: {
          "@id": "battery:maximumChargingCurrent",
          "@type": "@id"
        },
        maximumDischargingCurrent: {
          "@id": "battery:maximumDischargingCurrent",
          "@type": "@id"
        },
        expectedCycleLife: {
          "@id": "battery:expectedCycleLife",
          "@type": "xsd:integer"
        },
        expectedLifetimeYears: {
          "@id": "battery:expectedLifetimeYears",
          "@type": "xsd:integer"
        },
        expectedLifetimeEnergyThroughput: {
          "@id": "battery:expectedLifetimeEnergyThroughput",
          "@type": "@id"
        },
        expectedLifetimeCapacityThroughput: {
          "@id": "battery:expectedLifetimeCapacityThroughput",
          "@type": "@id"
        },
        roundTripEfficiency: {
          "@id": "battery:roundTripEfficiency",
          "@type": "xsd:decimal"
        },
        roundTripEfficiencyAt50PercentCycleLife: {
          "@id": "battery:roundTripEfficiencyAt50PercentCycleLife",
          "@type": "xsd:decimal"
        },
        depthOfDischargeInCycleLifeTest: {
          "@id": "battery:depthOfDischargeInCycleLifeTest",
          "@type": "xsd:decimal"
        },
        capacityFadeThreshold: {
          "@id": "battery:capacityFadeThreshold",
          "@type": "xsd:decimal"
        },
        resistanceIncreaseThreshold: {
          "@id": "battery:resistanceIncreaseThreshold",
          "@type": "xsd:decimal"
        },
        initialInternalResistance: {
          "@id": "battery:initialInternalResistance",
          "@type": "@id"
        },
        initialSelfDischarge: {
          "@id": "battery:initialSelfDischarge",
          "@type": "xsd:decimal"
        },
        capacityThresholdForExhaustion: {
          "@id": "battery:capacityThresholdForExhaustion",
          "@type": "xsd:decimal"
        },
        lifetimeReferenceTest: {
          "@id": "battery:lifetimeReferenceTest",
          "@type": "@id"
        },
        powerCapabilityRatio: {
          "@id": "battery:powerCapabilityRatio",
          "@type": "xsd:decimal"
        },
        cRate: {
          "@id": "battery:cRate",
          "@type": "xsd:decimal"
        },
        cRateLifeCycleTest: {
          "@id": "battery:cRateLifeCycleTest",
          "@type": "xsd:decimal"
        },
        originalPowerCapability: {
          "@id": "battery:originalPowerCapability",
          "@type": "@id"
        },
        stateOfChargeLevel: {
          "@id": "battery:stateOfChargeLevel",
          "@type": "xsd:decimal"
        },
        powerCapability: {
          "@id": "battery:powerCapability",
          "@type": "@id"
        },
        powerCapabilityAt80SoC: {
          "@id": "battery:powerCapabilityAt80SoC",
          "@type": "@id"
        },
        powerCapabilityAt20SoC: {
          "@id": "battery:powerCapabilityAt20SoC",
          "@type": "@id"
        },
        temperatureRangeStorage: {
          "@id": "battery:temperatureRangeStorage",
          "@type": "@id"
        },
        temperatureRangeCharging: {
          "@id": "battery:temperatureRangeCharging",
          "@type": "@id"
        },
        temperatureRangeDischarging: {
          "@id": "battery:temperatureRangeDischarging",
          "@type": "@id"
        },
        temperatureRangeIdleState: {
          "@id": "battery:temperatureRangeIdleState",
          "@type": "@id"
        },
        minimumTemperature: {
          "@id": "battery:minimumTemperature",
          "@type": "@id"
        },
        maximumTemperature: {
          "@id": "battery:maximumTemperature",
          "@type": "@id"
        },
        lifecycleStage: "battery:lifecycleStage",
        materialComposition: {
          "@id": "battery:materialComposition",
          "@type": "@id"
        },
        materialName: "schema:name",
        casNumber: "battery:casNumber",
        ecNumber: "battery:ecNumber",
        componentLocation: {
          "@id": "battery:componentLocation",
          "@type": "@vocab",
          "@context": {
            Cathode: "battery:Cathode",
            Anode: "battery:Anode",
            Electrolyte: "battery:Electrolyte",
            Separator: "battery:Separator",
            Casing: "battery:Casing",
            CurrentCollector: "battery:CurrentCollector",
            BMS: "battery:BMS"
          }
        },
        materialCategory: {
          "@id": "schema:category",
          "@type": "@vocab",
          "@context": {
            ActiveMaterial: "battery:ActiveMaterial",
            Binder: "battery:Binder",
            Conductor: "battery:Conductor",
            Additive: "battery:Additive",
            StructuralMaterial: "battery:StructuralMaterial"
          }
        },
        massPercentage: {
          "@id": "schema:weightPercentage",
          "@type": "xsd:decimal"
        },
        isCriticalRawMaterial: {
          "@id": "battery:isCriticalRawMaterial",
          "@type": "xsd:boolean"
        },
        isSubstanceOfConcern: {
          "@id": "battery:isSubstanceOfConcern",
          "@type": "xsd:boolean"
        },
        materialSourceCountry: "gs1:countryOfOrigin",
        materialSupplier: "battery:materialSupplier",
        renewableContentShare: {
          "@id": "battery:renewableContentShare",
          "@type": "xsd:decimal"
        },
        criticalRawMaterialsStatement: "battery:criticalRawMaterialsStatement",
        recycledContent: {
          "@id": "battery:recycledContent",
          "@type": "@id"
        },
        lithiumRecycledShare: {
          "@id": "battery:lithiumRecycledShare",
          "@type": "xsd:decimal"
        },
        lithiumPreConsumerShare: {
          "@id": "battery:lithiumPreConsumerShare",
          "@type": "xsd:decimal"
        },
        lithiumPostConsumerShare: {
          "@id": "battery:lithiumPostConsumerShare",
          "@type": "xsd:decimal"
        },
        cobaltRecycledShare: {
          "@id": "battery:cobaltRecycledShare",
          "@type": "xsd:decimal"
        },
        cobaltPreConsumerShare: {
          "@id": "battery:cobaltPreConsumerShare",
          "@type": "xsd:decimal"
        },
        cobaltPostConsumerShare: {
          "@id": "battery:cobaltPostConsumerShare",
          "@type": "xsd:decimal"
        },
        nickelRecycledShare: {
          "@id": "battery:nickelRecycledShare",
          "@type": "xsd:decimal"
        },
        nickelPreConsumerShare: {
          "@id": "battery:nickelPreConsumerShare",
          "@type": "xsd:decimal"
        },
        leadPreConsumerShare: {
          "@id": "battery:leadPreConsumerShare",
          "@type": "xsd:decimal"
        },
        leadPostConsumerShare: {
          "@id": "battery:leadPostConsumerShare",
          "@type": "xsd:decimal"
        },
        regulatoryIdentifier: {
          "@id": "gs1:regulatoryIdentifier",
          "@type": "@id"
        },
        regulatoryIdentifierType: {
          "@id": "gs1:regulatoryIdentifierType",
          "@type": "@id"
        },
        regulatoryReferenceNumber: "gs1:regulatoryReferenceNumber",
        nickelPostConsumerShare: {
          "@id": "battery:nickelPostConsumerShare",
          "@type": "xsd:decimal"
        },
        leadRecycledShare: {
          "@id": "battery:leadRecycledShare",
          "@type": "xsd:decimal"
        },
        endOfLifeInfo: {
          "@id": "battery:endOfLifeInfo",
          "@type": "@id"
        },
        recyclabilityRate: {
          "@id": "battery:recyclabilityRate",
          "@type": "xsd:decimal"
        },
        materialRecoveryTargets: {
          "@id": "battery:materialRecoveryTargets",
          "@type": "@id"
        },
        recoveryMaterial: "battery:recoveryMaterial",
        recoveryRate: {
          "@id": "battery:recoveryRate",
          "@type": "xsd:decimal"
        },
        dismantlingInstructions: {
          "@id": "battery:dismantlingInstructions",
          "@type": "@id"
        },
        safetyInstructionsForDismantling: {
          "@id": "battery:safetyInstructionsForDismantling",
          "@type": "@id"
        },
        dismantlingTime: {
          "@id": "battery:dismantlingTime",
          "@type": "@id"
        },
        extinguishingAgent: "battery:extinguishingAgent",
        wastePrevention: {
          "@id": "battery:wastePrevention",
          "@type": "@id"
        },
        separateCollection: {
          "@id": "battery:separateCollection",
          "@type": "@id"
        },
        informationOnCollection: {
          "@id": "battery:informationOnCollection",
          "@type": "@id"
        },
        renewableContent: {
          "@id": "battery:renewableContent",
          "@type": "xsd:decimal"
        },
        safetyInstructions: {
          "@id": "battery:safetyInstructions",
          "@type": "@id"
        },
        dismantlingDocuments: {
          "@id": "battery:dismantlingDocuments",
          "@type": "@id"
        },
        documentType: {
          "@id": "battery:documentType",
          "@type": "@vocab",
          "@context": {
            BillOfMaterial: "battery:BillOfMaterial",
            Model3D: "battery:Model3D",
            DismantlingManual: "battery:DismantlingManual",
            RemovalManual: "battery:RemovalManual",
            SafetyDataSheet: "battery:SafetyDataSheet",
            OtherManual: "battery:OtherManual",
            Drawing: "battery:Drawing"
          }
        },
        documentUrl: {
          "@id": "battery:documentUrl",
          "@type": "@id"
        },
        mimeType: "battery:mimeType",
        languageCode: "battery:languageCode",
        hazardousSubstances: {
          "@id": "battery:hazardousSubstances",
          "@type": "@id"
        },
        hazardClass: {
          "@id": "battery:hazardClass",
          "@type": "@vocab",
          "@context": {
            AcuteToxicity: "battery:AcuteToxicity",
            SkinCorrosionOrIrritation: "battery:SkinCorrosionOrIrritation",
            EyeDamageOrIrritation: "battery:EyeDamageOrIrritation",
            RespiratoryOrSkinSensitization: "battery:RespiratoryOrSkinSensitization",
            GermCellMutagenicity: "battery:GermCellMutagenicity",
            Carcinogenicity: "battery:Carcinogenicity",
            ReproductiveToxicity: "battery:ReproductiveToxicity",
            SpecificTargetOrganToxicity: "battery:SpecificTargetOrganToxicity",
            AspirationHazard: "battery:AspirationHazard",
            HazardousToAquaticEnvironment: "battery:HazardousToAquaticEnvironment"
          }
        },
        substanceName: "schema:name",
        substanceCasNumber: "battery:substanceCasNumber",
        substanceEcNumber: "battery:substanceEcNumber",
        concentration: {
          "@id": "battery:concentration",
          "@type": "xsd:decimal"
        },
        hazardImpact: "battery:hazardImpact",
        substanceLocation: {
          "@id": "battery:substanceLocation",
          "@type": "@vocab",
          "@context": {
            Cathode: "battery:Cathode",
            Anode: "battery:Anode",
            Electrolyte: "battery:Electrolyte",
            Separator: "battery:Separator",
            Casing: "battery:Casing",
            CurrentCollector: "battery:CurrentCollector",
            BMS: "battery:BMS"
          }
        },
        operatorInformation: {
          "@id": "battery:operatorInformation",
          "@type": "@id"
        },
        operatorIdentifier: "battery:operatorIdentifier",
        manufacturerInformation: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        manufacturerIdentifier: "battery:manufacturerIdentifier",
        operatorRole: {
          "@id": "battery:operatorRole",
          "@type": "@vocab",
          "@context": {
            Manufacturer: "dpp:Manufacturer",
            Importer: "dpp:Importer",
            Distributor: "dpp:Distributor",
            Fulfilment: "dpp:FulfilmentServiceProvider",
            AuthorisedRepresentative: "dpp:AuthorisedRepresentative"
          }
        },
        sparePartSources: {
          "@id": "battery:sparePartSources",
          "@type": "@id"
        },
        spareParts: "battery:spareParts",
        supplierContact: {
          "@id": "battery:supplierContact",
          "@type": "@id"
        },
        labels: {
          "@id": "battery:labels",
          "@type": "@id"
        },
        labelSymbol: {
          "@id": "battery:labelSymbol",
          "@type": "@id"
        },
        labelMeaning: "battery:labelMeaning",
        labelSubject: {
          "@id": "battery:labelSubject",
          "@type": "@vocab",
          "@context": {
            SeparateCollection: "battery:SeparateCollection",
            CadmiumContent: "battery:CadmiumContent",
            LeadContent: "battery:LeadContent",
            MercuryContent: "battery:MercuryContent",
            CarbonFootprintLabel: "battery:CarbonFootprintLabel",
            ExtinguishingAgentLabel: "battery:ExtinguishingAgentLabel",
            CapacityLabel: "battery:CapacityLabel",
            QRCodeLabel: "battery:QRCodeLabel"
          }
        },
        separateCollectionSymbolUrl: {
          "@id": "battery:separateCollectionSymbolUrl",
          "@type": "@id"
        },
        cadmiumSymbolRequired: {
          "@id": "battery:cadmiumSymbolRequired",
          "@type": "xsd:boolean"
        },
        leadSymbolRequired: {
          "@id": "battery:leadSymbolRequired",
          "@type": "xsd:boolean"
        },
        ceMarkingIndicator: {
          "@id": "battery:ceMarkingIndicator",
          "@type": "xsd:boolean"
        },
        euDeclarationOfConformity: {
          "@id": "battery:euDeclarationOfConformity",
          "@type": "@id"
        },
        declarationOfConformity: {
          "@id": "battery:declarationOfConformity",
          "@type": "@id"
        },
        euDeclarationOfConformityId: "battery:euDeclarationOfConformityId",
        notifiedBody: {
          "@id": "battery:notifiedBody",
          "@type": "@id"
        },
        notifiedBodyNumber: "battery:notifiedBodyNumber",
        notifiedBodyName: "battery:notifiedBodyName",
        resultOfTestReport: {
          "@id": "battery:resultOfTestReport",
          "@type": "@id"
        },
        testReportNumber: "battery:testReportNumber",
        complianceStatus: {
          "@id": "battery:complianceStatus",
          "@type": "@vocab",
          "@context": {
            Compliant: "battery:Compliant",
            NonCompliant: "battery:NonCompliant",
            Pending: "battery:Pending",
            ConditionallyCompliant: "battery:ConditionallyCompliant"
          }
        },
        carbonFootprintDeclaration: {
          "@id": "battery:carbonFootprintDeclaration",
          "@type": "@id"
        },
        carbonFootprintTotal: {
          "@id": "battery:carbonFootprintTotal",
          "@type": "@id"
        },
        carbonFootprintRawMaterialExtraction: {
          "@id": "battery:carbonFootprintRawMaterialExtraction",
          "@type": "@id"
        },
        carbonFootprintProduction: {
          "@id": "battery:carbonFootprintProduction",
          "@type": "@id"
        },
        carbonFootprintDistribution: {
          "@id": "battery:carbonFootprintDistribution",
          "@type": "@id"
        },
        carbonFootprintRecycling: {
          "@id": "battery:carbonFootprintRecycling",
          "@type": "@id"
        },
        absoluteCarbonFootprint: {
          "@id": "battery:absoluteCarbonFootprint",
          "@type": "@id"
        },
        carbonFootprintPerformanceClass: {
          "@id": "battery:carbonFootprintPerformanceClass",
          "@type": "@vocab",
          "@context": {
            CFClassA: "battery:CFClassA",
            CFClassB: "battery:CFClassB",
            CFClassC: "battery:CFClassC",
            CFClassD: "battery:CFClassD",
            CFClassE: "battery:CFClassE"
          }
        },
        carbonFootprintStudyUrl: {
          "@id": "battery:carbonFootprintStudyUrl",
          "@type": "@id"
        },
        functionalUnit: "battery:functionalUnit",
        calculationStandard: "battery:calculationStandard",
        carbonFootprintDeclarationId: "battery:carbonFootprintDeclarationId",
        carbonFootprintGeographicScope: "battery:carbonFootprintGeographicScope",
        thirdPartyVerification: {
          "@id": "battery:thirdPartyVerification",
          "@type": "@id"
        },
        verificationBody: {
          "@id": "battery:verificationBody",
          "@type": "@id"
        },
        verificationBodyName: "battery:verificationBodyName",
        verificationDate: {
          "@id": "battery:verificationDate",
          "@type": "xsd:date"
        },
        verificationCertificateUrl: {
          "@id": "battery:verificationCertificateUrl",
          "@type": "@id"
        },
        verificationStandard: "battery:verificationStandard",
        supplyChainDueDiligence: {
          "@id": "battery:supplyChainDueDiligence",
          "@type": "@id"
        },
        dueDiligenceReportUrl: {
          "@id": "battery:dueDiligenceReportUrl",
          "@type": "@id"
        },
        dueDiligencePolicyUrl: {
          "@id": "battery:dueDiligencePolicyUrl",
          "@type": "@id"
        },
        thirdPartyAssurancesUrl: {
          "@id": "battery:thirdPartyAssurancesUrl",
          "@type": "@id"
        },
        riskAssessmentSummary: "battery:riskAssessmentSummary",
        supplyChainMappingAvailable: {
          "@id": "battery:supplyChainMappingAvailable",
          "@type": "xsd:boolean"
        },
        conflictMineralFree: {
          "@id": "battery:conflictMineralFree",
          "@type": "xsd:boolean"
        },
        responsibleSourcingStandard: {
          "@id": "battery:responsibleSourcingStandard",
          "@type": "@vocab",
          "@context": {
            OECDGuidelines: "battery:OECDGuidelines",
            RMI: "battery:RMI",
            IRMA: "battery:IRMA",
            CopperMark: "battery:CopperMark",
            AluminiumStewardship: "battery:AluminiumStewardship",
            CobaltIndustryResponsibleAssessment: "battery:CobaltIndustryResponsibleAssessment"
          }
        },
        auditDate: {
          "@id": "schema:auditDate",
          "@type": "xsd:date"
        },
        auditBody: "battery:auditBody",
        supplyChainIndex: {
          "@id": "battery:supplyChainIndex",
          "@type": "xsd:decimal"
        },
        transportationSafetyClass: "battery:transportationSafetyClass",
        dangerousGoodsPackingInstructions: "battery:dangerousGoodsPackingInstructions",
        shippingName: "battery:shippingName",
        repurposingPotential: "battery:repurposingPotential",
        repurposingGuidelines: {
          "@id": "battery:repurposingGuidelines",
          "@type": "@id"
        },
        previousApplications: "battery:previousApplications",
        repurposingDate: {
          "@id": "battery:repurposingDate",
          "@type": "xsd:date"
        },
        repurposingEntity: {
          "@id": "battery:repurposingEntity",
          "@type": "@id"
        },
        warrantyConditions: {
          "@id": "battery:warrantyConditions",
          "@type": "@id"
        },
        extendedWarrantyAvailable: {
          "@id": "battery:extendedWarrantyAvailable",
          "@type": "xsd:boolean"
        },
        serviceContactPoint: {
          "@id": "schema:contactPoint",
          "@type": "@id"
        },
        authorizedServiceCenters: {
          "@id": "battery:authorizedServiceCenters",
          "@type": "@id"
        },
        dataQualityAssessment: "battery:dataQualityAssessment",
        lastDataUpdate: {
          "@id": "battery:lastDataUpdate",
          "@type": "xsd:dateTime"
        },
        dataProviderCertification: "battery:dataProviderCertification",
        stateOfHealth: {
          "@id": "battery:stateOfHealth",
          "@type": "@id"
        },
        stateOfCharge: {
          "@id": "battery:stateOfCharge",
          "@type": "@id"
        },
        stateOfCertifiedEnergy: {
          "@id": "battery:stateOfCertifiedEnergy",
          "@type": "@id"
        },
        cycleCount: {
          "@id": "battery:cycleCount",
          "@type": "@id"
        },
        remainingCapacity: {
          "@id": "battery:remainingCapacity",
          "@type": "@id"
        },
        remainingEnergy: {
          "@id": "battery:remainingEnergy",
          "@type": "@id"
        },
        capacityFade: {
          "@id": "battery:capacityFade",
          "@type": "@id"
        },
        powerFade: {
          "@id": "battery:powerFade",
          "@type": "@id"
        },
        internalResistance: {
          "@id": "battery:internalResistance",
          "@type": "@id"
        },
        internalResistanceIncrease: {
          "@id": "battery:internalResistanceIncrease",
          "@type": "@id"
        },
        energyThroughput: {
          "@id": "battery:energyThroughput",
          "@type": "@id"
        },
        capacityThroughput: {
          "@id": "battery:capacityThroughput",
          "@type": "@id"
        },
        remainingRoundTripEfficiency: {
          "@id": "battery:remainingRoundTripEfficiency",
          "@type": "@id"
        },
        roundTripEfficiencyFade: {
          "@id": "battery:roundTripEfficiencyFade",
          "@type": "@id"
        },
        selfDischargeRate: {
          "@id": "battery:selfDischargeRate",
          "@type": "@id"
        },
        evolutionOfSelfDischarge: {
          "@id": "battery:evolutionOfSelfDischarge",
          "@type": "@id"
        },
        exposureDurationMinutes: {
          "@id": "battery:exposureDurationMinutes",
          "@type": "xsd:integer"
        },
        measurementMethod: "schema:measurementMethod",
        note: "battery:note",
        initialCapacity: {
          "@id": "battery:initialCapacity",
          "@type": "@id"
        },
        initialEnergy: {
          "@id": "battery:initialEnergy",
          "@type": "@id"
        },
        certifiedUsableEnergy: {
          "@id": "battery:certifiedUsableEnergy",
          "@type": "@id"
        },
        remainingUsableEnergy: {
          "@id": "battery:remainingUsableEnergy",
          "@type": "@id"
        },
        soceMeasurementId: "battery:soceMeasurementId",
        exhaustionThreshold: {
          "@id": "battery:exhaustionThreshold",
          "@type": "xsd:decimal"
        },
        expectedRemainingCycles: {
          "@id": "battery:expectedRemainingCycles",
          "@type": "xsd:integer"
        },
        expectedRemainingLifetimeMonths: {
          "@id": "battery:expectedRemainingLifetimeMonths",
          "@type": "xsd:integer"
        },
        nextScheduledMeasurement: {
          "@id": "battery:nextScheduledMeasurement",
          "@type": "xsd:date"
        },
        measurementCertificateUrl: {
          "@id": "battery:measurementCertificateUrl",
          "@type": "@id"
        },
        exceedanceThreshold: {
          "@id": "battery:exceedanceThreshold",
          "@type": "xsd:decimal"
        },
        temperatureExcursionId: "battery:temperatureExcursionId",
        exposureStartTime: {
          "@id": "schema:startDate",
          "@type": "xsd:dateTime"
        },
        exposureEndTime: {
          "@id": "battery:exposureEndTime",
          "@type": "xsd:dateTime"
        },
        transportConditions: "battery:transportConditions",
        estimatedImpact: "battery:estimatedImpact",
        temperatureExcursionReportUrl: {
          "@id": "battery:temperatureExcursionReportUrl",
          "@type": "@id"
        },
        eventType: {
          "@id": "battery:eventType",
          "@type": "@vocab",
          "@context": {
            Accident: "battery:Accident",
            PhysicalDamage: "battery:PhysicalDamage",
            ThermalEvent: "battery:ThermalEvent",
            ElectricalFault: "battery:ElectricalFault",
            WaterIngress: "battery:WaterIngress",
            Overcharge: "battery:Overcharge",
            DeepDischarge: "battery:DeepDischarge",
            ShortCircuit: "battery:ShortCircuit"
          }
        },
        eventDescription: "schema:description",
        eventDate: {
          "@id": "battery:eventDate",
          "@type": "xsd:dateTime"
        },
        eventLocation: {
          "@id": "battery:eventLocation",
          "@type": "@id"
        },
        incidentId: "battery:incidentId",
        incidentSeverity: {
          "@id": "battery:incidentSeverity",
          "@type": "@vocab",
          "@context": {
            Minor: "battery:Minor",
            Moderate: "battery:Moderate",
            Major: "battery:Major",
            Critical: "battery:Critical"
          }
        },
        incidentReportUrl: {
          "@id": "battery:incidentReportUrl",
          "@type": "@id"
        },
        inspectorId: "battery:inspectorId",
        recommendedAction: "battery:recommendedAction",
        remainingPowerCapability: {
          "@id": "battery:remainingPowerCapability",
          "@type": "@id"
        },
        value: {
          "@id": "gs1:value",
          "@type": "xsd:decimal"
        },
        unitCode: "gs1:unitCode"
      }
    ]
  },
  "https://ref.openepcis.io/extensions/eu/battery/battery-context-batterypass-bridge.jsonld": {
    "@context": {
      "@version": 1.1,
      gs1: "https://ref.gs1.org/voc/",
      battery: "https://ref.openepcis.io/extensions/eu/battery/",
      dpp: "https://ref.openepcis.io/extensions/common/core/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      "bp-general": "urn:samm:io.BatteryPass.GeneralProductInformation:1.3.0#",
      "bp-perf": "urn:samm:io.BatteryPass.Performance:1.3.0#",
      "bp-carbon": "urn:samm:io.BatteryPass.CarbonFootprint:1.3.0#",
      "bp-material": "urn:samm:io.BatteryPass.MaterialComposition:1.3.0#",
      "bp-circular": "urn:samm:io.BatteryPass.Circularity:1.3.0#",
      "bp-scdd": "urn:samm:io.BatteryPass.SupplyChainDueDiligence:1.3.0#",
      "bp-labels": "urn:samm:io.BatteryPass.Labels:1.3.0#",
      "bp-dpp": "urn:samm:io.BatteryPass.DPPInformation:1.3.0#",
      dppSchemaVersion: {
        "@id": "schema:schemaVersion"
      },
      dppStatus: {
        "@id": "schema:status",
        "@type": "@id"
      },
      dppGranularity: {
        "@id": "dpp:reportingGranularity",
        "@type": "@id"
      },
      dateTimeOfLatestUpdate: {
        "@id": "dpp:lastUpdated",
        "@type": "xsd:dateTime"
      },
      productIdentifier: {
        "@id": "battery:batteryPassportIdentifier"
      },
      batteryPassportIdentifier: {
        "@id": "battery:batteryPassportIdentifier"
      },
      batteryModelIdentifier: {
        "@id": "battery:batteryModelIdentifier"
      },
      batterySerialNumber: {
        "@id": "gs1:hasSerialNumber"
      },
      facilityIdentifier: {
        "@id": "battery:facilityIdentifier"
      },
      economicOperatorIdentifier: {
        "@id": "battery:operatorIdentifier"
      },
      economicOperatorInformation: {
        "@id": "battery:operatorInformation",
        "@type": "@id"
      },
      manufacturerIdentifier: {
        "@id": "battery:manufacturerIdentifier"
      },
      manufacturerInformation: {
        "@id": "gs1:manufacturer",
        "@type": "@id"
      },
      batteryCategory: {
        "@id": "schema:category",
        "@type": "@id",
        "@context": {
          lmt: "battery:LMTBattery",
          ev: "battery:EVBattery",
          industrial: "battery:IndustrialBattery",
          stationary: "battery:StationaryBattery"
        }
      },
      manufacturingDate: {
        "@id": "gs1:manufacturingDate",
        "@type": "xsd:dateTime"
      },
      batteryStatus: {
        "@id": "schema:status",
        "@type": "@id",
        "@context": {
          Original: "battery:Original",
          Repurposed: "battery:Repurposed",
          Reused: "battery:Reused",
          Remanufactured: "battery:Remanufactured",
          Waste: "battery:Waste"
        }
      },
      batteryMass: {
        "@id": "gs1:netWeight",
        "@type": "@id"
      },
      manufacturingPlace: {
        "@id": "battery:manufacturingPlace",
        "@type": "@id"
      },
      operatorInformation: {
        "@id": "battery:operatorInformation",
        "@type": "@id"
      },
      puttingIntoService: {
        "@id": "battery:puttingIntoService",
        "@type": "xsd:dateTime"
      },
      warrentyPeriod: {
        "@id": "gs1:warranty",
        "@type": "@id"
      },
      contactName: {
        "@id": "gs1:organizationName"
      },
      postalAddress: {
        "@id": "gs1:address",
        "@type": "@id"
      },
      identifier: {
        "@id": "gs1:partyGLN"
      },
      emailAddress: {
        "@id": "gs1:contactPoint"
      },
      webAddress: {
        "@id": "gs1:seeAlso",
        "@type": "@id"
      },
      addressCountry: {
        "@id": "gs1:countryCode"
      },
      postalCode: {
        "@id": "gs1:postalCode"
      },
      streetAddress: {
        "@id": "gs1:streetAddress"
      },
      batteryTechnicalProperties: {
        "@id": "battery:technicalSpecifications",
        "@type": "@id"
      },
      batteryCondition: {
        "@id": "battery:technicalSpecifications",
        "@type": "@id"
      },
      ratedCapacity: {
        "@id": "battery:ratedCapacity",
        "@type": "@id"
      },
      ratedEnergy: {
        "@id": "battery:ratedEnergy",
        "@type": "@id"
      },
      nominalVoltage: {
        "@id": "battery:nominalVoltage",
        "@type": "@id"
      },
      minimumVoltage: {
        "@id": "battery:minimumVoltage",
        "@type": "@id"
      },
      maximumVoltage: {
        "@id": "battery:maximumVoltage",
        "@type": "@id"
      },
      ratedMaximumPower: {
        "@id": "battery:ratedMaximumPower",
        "@type": "@id"
      },
      expectedNumberOfCycles: {
        "@id": "battery:expectedCycleLife",
        "@type": "xsd:integer"
      },
      initialSelfDischarge: {
        "@id": "battery:initialSelfDischarge",
        "@type": "xsd:decimal"
      },
      roundtripEfficiency: {
        "@id": "battery:roundTripEfficiency",
        "@type": "xsd:decimal"
      },
      initialInternalResistance: {
        "@id": "battery:initialInternalResistance",
        "@type": "@id"
      },
      expectedLifetime: {
        "@id": "battery:expectedLifetimeYears",
        "@type": "xsd:integer"
      },
      cRate: {
        "@id": "battery:cRate",
        "@type": "xsd:decimal"
      },
      powerCapabilityRatio: {
        "@id": "battery:powerCapabilityRatio",
        "@type": "xsd:decimal"
      },
      capacityThresholdForExhaustion: {
        "@id": "battery:capacityThresholdForExhaustion",
        "@type": "xsd:decimal"
      },
      lifetimeReferenceTest: {
        "@id": "battery:lifetimeReferenceTest",
        "@type": "@id"
      },
      cRateLifeCycleTest: {
        "@id": "battery:cRateLifeCycleTest",
        "@type": "xsd:decimal"
      },
      temperatureRangeIdleState: {
        "@id": "battery:temperatureRangeIdleState",
        "@type": "@id"
      },
      roundTripEfficiencyAt50PercentCycleLife: {
        "@id": "battery:roundTripEfficiencyAt50PercentCycleLife",
        "@type": "xsd:decimal"
      },
      roundTripEfficiencyFade: {
        "@id": "battery:roundTripEfficiencyFade",
        "@type": "@id"
      },
      powerFade: {
        "@id": "battery:powerFade",
        "@type": "@id"
      },
      originalPowerCapability: {
        "@id": "battery:originalPowerCapability",
        "@type": "@id"
      },
      remainingPowerCapability: {
        "@id": "battery:remainingPowerCapability",
        "@type": "@id"
      },
      energyThroughput: {
        "@id": "battery:energyThroughput",
        "@type": "@id"
      },
      capacityThroughput: {
        "@id": "battery:capacityThroughput",
        "@type": "@id"
      },
      numberOfFullCycles: {
        "@id": "battery:cycleCount",
        "@type": "@id"
      },
      stateOfCertifiedEnergy: {
        "@id": "battery:stateOfCertifiedEnergy",
        "@type": "@id"
      },
      capacityFade: {
        "@id": "battery:capacityFade",
        "@type": "@id"
      },
      remainingEnergy: {
        "@id": "battery:remainingEnergy",
        "@type": "@id"
      },
      remainingCapacity: {
        "@id": "battery:remainingCapacity",
        "@type": "@id"
      },
      stateOfCharge: {
        "@id": "battery:stateOfCharge",
        "@type": "@id"
      },
      internalResistanceIncrease: {
        "@id": "battery:internalResistanceIncrease",
        "@type": "@id"
      },
      evolutionOfSelfDischarge: {
        "@id": "battery:evolutionOfSelfDischarge",
        "@type": "@id"
      },
      currentSelfDischargingRate: {
        "@id": "battery:selfDischargeRate",
        "@type": "@id"
      },
      remainingRoundTripEnergyEfficiency: {
        "@id": "battery:remainingRoundTripEfficiency",
        "@type": "@id"
      },
      lastUpdate: {
        "@id": "battery:lastDataUpdate",
        "@type": "xsd:dateTime"
      },
      negativeEvents: {
        "@id": "battery:NegativeEvent",
        "@container": "@list"
      },
      negativeEvent: {
        "@id": "schema:description"
      },
      temperatureInformation: {
        "@id": "battery:temperatureRangeIdleState",
        "@type": "@id"
      },
      timeExtremeHighTemp: {
        "@id": "gs1:Temperature"
      },
      timeExtremeLowTemp: {
        "@id": "gs1:Temperature"
      },
      timeExtremeHighTempCharging: {
        "@id": "gs1:Temperature"
      },
      timeExtremeLowTempCharging: {
        "@id": "gs1:Temperature"
      },
      minimum: {
        "@id": "battery:minimumTemperature",
        "@type": "@id"
      },
      maximum: {
        "@id": "battery:maximumTemperature",
        "@type": "@id"
      },
      atSoC: {
        "@id": "battery:stateOfChargeLevel",
        "@type": "xsd:decimal"
      },
      powerCapabilityAt: {
        "@id": "battery:powerCapability",
        "@type": "@id"
      },
      ohmicResistance: {
        "@id": "gs1:value",
        "@type": "xsd:decimal"
      },
      batteryComponent: {
        "@id": "battery:componentLocation",
        "@type": "@id",
        "@context": {
          pack: "battery:Casing",
          module: "battery:Casing",
          cell: "battery:Casing"
        }
      },
      batteryCarbonFootprint: {
        "@id": "battery:carbonFootprintTotal",
        "@type": "@id"
      },
      carbonFootprintPerLifecycleStage: {
        "@id": "battery:carbonFootprintDeclaration",
        "@type": "@id"
      },
      lifecycleStage: {
        "@id": "battery:lifecycleStage"
      },
      carbonFootprint: {
        "@id": "gs1:value",
        "@type": "xsd:decimal"
      },
      carbonFootprintPerformanceClass: {
        "@id": "battery:carbonFootprintPerformanceClass",
        "@type": "@id",
        "@context": {
          A: "battery:CFClassA",
          B: "battery:CFClassB",
          C: "battery:CFClassC",
          D: "battery:CFClassD",
          E: "battery:CFClassE"
        }
      },
      carbonFootprintStudy: {
        "@id": "battery:carbonFootprintStudyUrl",
        "@type": "@id"
      },
      absoluteCarbonFootprint: {
        "@id": "battery:absoluteCarbonFootprint",
        "@type": "@id"
      },
      batteryChemistry: {
        "@id": "battery:batteryChemistry",
        "@type": "@id"
      },
      shortName: {
        "@id": "schema:name"
      },
      clearName: {
        "@id": "schema:name"
      },
      batteryMaterials: {
        "@id": "battery:materialComposition",
        "@container": "@list"
      },
      batteryMaterialLocation: {
        "@id": "battery:componentLocation",
        "@type": "@id"
      },
      batteryMaterialIdentifier: {
        "@id": "battery:casNumber"
      },
      batteryMaterialName: {
        "@id": "schema:name"
      },
      batteryMaterialMass: {
        "@id": "schema:weightPercentage",
        "@type": "xsd:decimal"
      },
      isCriticalRawMaterial: {
        "@id": "battery:isCriticalRawMaterial",
        "@type": "xsd:boolean"
      },
      componentName: {
        "@id": "battery:componentLocation",
        "@type": "@id",
        "@context": {
          Cathode: "battery:Cathode",
          Anode: "battery:Anode",
          Electrolyte: "battery:Electrolyte",
          Separator: "battery:Separator",
          Casing: "battery:Casing"
        }
      },
      componentId: {
        "@id": "gs1:gtin"
      },
      hazardousSubstances: {
        "@id": "battery:hazardousSubstances",
        "@container": "@list"
      },
      hazardousSubstanceClass: {
        "@id": "battery:hazardClass",
        "@type": "@id",
        "@context": {
          AcuteToxicity: "battery:AcuteToxicity",
          SkinCorrosionOrIrritation: "battery:SkinCorrosionOrIrritation",
          EyeDamageOrIrritation: "battery:EyeDamageOrIrritation",
          RespiratoryOrSkinSensitization: "battery:RespiratoryOrSkinSensitization",
          GermCellMutagenicity: "battery:GermCellMutagenicity",
          Carcinogenicity: "battery:Carcinogenicity",
          ReproductiveToxicity: "battery:ReproductiveToxicity",
          SpecificTargetOrganToxicity: "battery:SpecificTargetOrganToxicity",
          AspirationHazard: "battery:AspirationHazard",
          HazardousToAquaticEnvironment: "battery:HazardousToAquaticEnvironment"
        }
      },
      hazardousSubstanceName: {
        "@id": "schema:name"
      },
      hazardousSubstanceConcentration: {
        "@id": "battery:concentration",
        "@type": "xsd:decimal"
      },
      hazardousSubstanceImpact: {
        "@id": "battery:hazardImpact"
      },
      hazardousSubstanceLocation: {
        "@id": "battery:substanceLocation",
        "@type": "@id"
      },
      hazardousSubstanceIdentifier: {
        "@id": "battery:substanceCasNumber"
      },
      dismantlingAndRemovalInformation: {
        "@id": "battery:dismantlingDocuments",
        "@container": "@list"
      },
      documentType: {
        "@id": "battery:documentType",
        "@type": "@id",
        "@context": {
          BillOfMaterial: "battery:BillOfMaterial",
          Model3D: "battery:Model3D",
          DismantlingManual: "battery:DismantlingManual",
          RemovalManual: "battery:RemovalManual",
          OtherManual: "battery:OtherManual",
          Drawing: "battery:Drawing"
        }
      },
      mimeType: {
        "@id": "battery:mimeType"
      },
      documentURL: {
        "@id": "battery:documentUrl",
        "@type": "@id"
      },
      sparePartSources: {
        "@id": "battery:sparePartSources",
        "@container": "@list"
      },
      nameOfSupplier: {
        "@id": "gs1:organizationName"
      },
      addressOfSupplier: {
        "@id": "gs1:address",
        "@type": "@id"
      },
      emailAddressOfSupplier: {
        "@id": "gs1:email"
      },
      supplierWebAddress: {
        "@id": "gs1:seeAlso",
        "@type": "@id"
      },
      components: {
        "@id": "battery:spareParts"
      },
      partName: {
        "@id": "gs1:productName"
      },
      partNumber: {
        "@id": "gs1:gtin"
      },
      recycledContent: {
        "@id": "battery:recycledContent",
        "@container": "@list"
      },
      recycledMaterial: {
        "@id": "battery:recoveryMaterial"
      },
      preConsumerShare: {
        "@id": "battery:lithiumPreConsumerShare",
        "@type": "xsd:decimal"
      },
      postConsumerShare: {
        "@id": "battery:lithiumPostConsumerShare",
        "@type": "xsd:decimal"
      },
      safetyMeasures: {
        "@id": "battery:endOfLifeInfo",
        "@type": "@id"
      },
      safetyInstructions: {
        "@id": "battery:safetyInstructions",
        "@type": "@id"
      },
      extinguishingAgents: {
        "@id": "battery:extinguishingAgent"
      },
      endOfLifeInformation: {
        "@id": "battery:endOfLifeInfo",
        "@type": "@id"
      },
      wastePrevention: {
        "@id": "battery:wastePrevention",
        "@type": "@id"
      },
      separateCollection: {
        "@id": "battery:separateCollection",
        "@type": "@id"
      },
      informationOnCollection: {
        "@id": "battery:informationOnCollection",
        "@type": "@id"
      },
      renewableContent: {
        "@id": "battery:renewableContent",
        "@type": "xsd:decimal"
      },
      supplyChainDueDiligenceReport: {
        "@id": "battery:dueDiligenceReportUrl",
        "@type": "@id"
      },
      thirdPartyAussurances: {
        "@id": "battery:thirdPartyAssurancesUrl",
        "@type": "@id"
      },
      supplyChainIndicies: {
        "@id": "battery:supplyChainIndex",
        "@type": "xsd:decimal"
      },
      batteryIdentifier: {
        "@id": "battery:batteryPassportIdentifier"
      },
      warrantyPeriod: {
        "@id": "battery:warrantyPeriod",
        "@type": "@id"
      },
      criticalRawMaterials: {
        "@id": "battery:criticalRawMaterials",
        "@container": "@set"
      },
      materialsUsedInCathode: {
        "@id": "battery:materialsUsedInCathode",
        "@container": "@set"
      },
      impactOfSubstancesOnEnvironment: "battery:impactOfSubstancesOnEnvironment",
      separateCollectionSymbol: {
        "@id": "battery:separateCollectionSymbol",
        "@type": "@id"
      },
      symbolsForCadmiumAndLead: {
        "@id": "battery:symbolsForCadmiumAndLead",
        "@type": "@id"
      },
      carbonFootprintLabel: {
        "@id": "battery:carbonFootprintLabel",
        "@type": "@id"
      },
      meaningOfLabelsAndSymbols: "battery:meaningOfLabelsAndSymbols",
      euDeclarationOfConformity: {
        "@id": "battery:euDeclarationOfConformity",
        "@type": "@id"
      },
      resultsOfTestReportsProvingCompliance: {
        "@id": "battery:resultsOfTestReportsProvingCompliance",
        "@type": "@id"
      },
      batteryCarbonFootprintPerFunctionalUnit: {
        "@id": "battery:carbonFootprintPerFunctionalUnit",
        "@type": "@id"
      },
      contributionOfRawMaterialAcquisitionAndPreProcessingLifecycleStage: {
        "@id": "battery:contributionRawMaterial",
        "@type": "@id"
      },
      contributionOfMainProductProductionLifecycleStage: {
        "@id": "battery:contributionProduction",
        "@type": "@id"
      },
      contributionOfDistributionLifecycleStage: {
        "@id": "battery:contributionDistribution",
        "@type": "@id"
      },
      contributionOfEndOfLifeAndRecyclingLifecycleStage: {
        "@id": "battery:contributionEndOfLife",
        "@type": "@id"
      },
      webLinkToPublicCarbonFootprintStudy: {
        "@id": "battery:webLinkCarbonFootprintStudy",
        "@type": "@id"
      },
      informationOfDueDiligenceReport: "battery:informationOfDueDiligenceReport",
      dismantlingInformationManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack: {
        "@id": "battery:dismantlingManuals",
        "@type": "@id"
      },
      partNumbersForComponents: {
        "@id": "battery:partNumbersForComponents",
        "@container": "@set"
      },
      informationOnSourcesOfSpareParts: "battery:informationOnSourcesOfSpareParts",
      preConsumerRecycledNickelShare: {
        "@id": "battery:preConsumerRecycledNickelShare",
        "@type": "xsd:decimal"
      },
      preConsumerRecycledCobaltShare: {
        "@id": "battery:preConsumerRecycledCobaltShare",
        "@type": "xsd:decimal"
      },
      preConsumerRecycledLithiumShare: {
        "@id": "battery:preConsumerRecycledLithiumShare",
        "@type": "xsd:decimal"
      },
      postConsumerRecycledNickelShare: {
        "@id": "battery:postConsumerRecycledNickelShare",
        "@type": "xsd:decimal"
      },
      postConsumerRecycledCobaltShare: {
        "@id": "battery:postConsumerRecycledCobaltShare",
        "@type": "xsd:decimal"
      },
      postConsumerRecycledLithiumShare: {
        "@id": "battery:postConsumerRecycledLithiumShare",
        "@type": "xsd:decimal"
      },
      recycledLeadShare: {
        "@id": "battery:recycledLeadShare",
        "@type": "xsd:decimal"
      },
      informationOnTheRoleOfEndUsersInContributingToWastePrevention: "battery:roleOfEndUsersInWastePrevention",
      informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries: "battery:roleOfEndUsersInSeparateCollection",
      informationOnBatteryCollection: "battery:informationOnBatteryCollection",
      maximumPermittedBatteryPower: {
        "@id": "battery:maximumPermittedBatteryPower",
        "@type": "@id"
      },
      initialRoundTripEnergyEfficiency: {
        "@id": "battery:initialRoundTripEnergyEfficiency",
        "@type": "xsd:decimal"
      },
      roundTripEnergyEfficiencyAt50PercentOfCycleLife: {
        "@id": "battery:roundTripEfficiencyAt50PercentCycleLife",
        "@type": "xsd:decimal"
      },
      energyRoundTripEfficiencyFade: {
        "@id": "battery:roundTripEfficiencyFade",
        "@type": "xsd:decimal"
      },
      evolutionOfSelfDischargeRates: {
        "@id": "battery:evolutionOfSelfDischarge",
        "@type": "@id"
      },
      initialInternalResistanceOfBatteryCellAndPack: {
        "@id": "battery:initialInternalResistance",
        "@type": "@id"
      },
      internalResistanceIncreaseOfPack: {
        "@id": "battery:internalResistanceIncrease",
        "@type": "@id"
      },
      expectedLifetimeInCalendarYears: {
        "@id": "battery:expectedLifetimeYears",
        "@type": "@id"
      },
      expectedLifetimeNumberOfChargeDischargeCycles: {
        "@id": "battery:expectedNumberOfCycles",
        "@type": "@id"
      },
      numberOfFullChargingAndDischargingCycles: {
        "@id": "battery:numberOfFullCycles",
        "@type": "@id"
      },
      cycleLifeReferenceTest: "battery:lifetimeReferenceTest",
      cRateOfRelevantCycleLifeTest: "battery:cRateLifeCycleTest",
      temperatureRangeIdleStateLowerBoundary: {
        "@id": "battery:temperatureRangeIdleLower",
        "@type": "@id"
      },
      temperatureRangeIdleStateUpperBoundary: {
        "@id": "battery:temperatureRangeIdleUpper",
        "@type": "@id"
      },
      timeSpentInExtremeTemperaturesAboveBoundary: {
        "@id": "battery:timeExtremeHighTemp",
        "@type": "@id"
      },
      timeSpentInExtremeTemperaturesBelowBoundary: {
        "@id": "battery:timeExtremeLowTemp",
        "@type": "@id"
      },
      timeSpentChargingDuringExtremeTemperaturesAboveBoundary: {
        "@id": "battery:timeExtremeHighTempCharging",
        "@type": "@id"
      },
      timeSpentChargingDuringExtremeTemperaturesBelowBoundary: {
        "@id": "battery:timeExtremeLowTempCharging",
        "@type": "@id"
      },
      numberOfDeepDischargeEvents: {
        "@id": "battery:numberOfDeepDischargeEvents",
        "@type": "xsd:integer"
      },
      informationOnAccidents: "battery:informationOnAccidents"
    }
  },
  "https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld": {
    _comment: "OpenEPCIS Textile DPP Context v0.9.0. GS1-aligned vocabulary for EU Sustainable Textiles Strategy and ESPR. GS1-Extensions: textile=https://ref.openepcis.io/extensions/eu/textile/. Uses GS1 Web Vocabulary patterns: gs1:textileMaterial, gs1:certification, gs1:referencedFile.",
    "@context": [
      "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
      {
        "@version": 1.1,
        gs1: "https://ref.gs1.org/voc/",
        dpp: "https://ref.openepcis.io/extensions/common/core/",
        textile: "https://ref.openepcis.io/extensions/eu/textile/",
        schema: "https://schema.org/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        id: "@id",
        type: "@type",
        Product: "gs1:Product",
        productName: "gs1:productName",
        gtin: "gs1:gtin",
        TextileMaterialDetails: "gs1:TextileMaterialDetails",
        textileMaterial: {
          "@id": "gs1:textileMaterial",
          "@type": "@id",
          "@container": "@set"
        },
        textileMaterialContent: {
          "@id": "gs1:textileMaterialContent",
          "@type": "@id"
        },
        textileMaterialDescription: {
          "@id": "gs1:textileMaterialDescription",
          "@container": "@language"
        },
        TextileApparel: "textile:TextileApparel",
        TextileFootwear: "textile:TextileFootwear",
        Clothing: "gs1:Clothing",
        WearableProduct: "gs1:WearableProduct",
        CareInstruction: "textile:CareInstruction",
        DurabilityInfo: "textile:DurabilityInfo",
        TakeBackProgram: "textile:TakeBackProgram",
        MicroplasticInfo: "textile:MicroplasticInfo",
        RobustnessAssessment: "textile:RobustnessAssessment",
        SpiralityTestResult: "textile:SpiralityTestResult",
        DimensionalChangeTestResult: "textile:DimensionalChangeTestResult",
        VisualInspectionResult: "textile:VisualInspectionResult",
        RecyclabilityAssessment: "textile:RecyclabilityAssessment",
        SortingFactors: "textile:SortingFactors",
        TechnicalRecyclability: "textile:TechnicalRecyclability",
        RecycledContentDeclaration: "textile:RecycledContentDeclaration",
        EnvironmentalFootprint: "textile:EnvironmentalFootprint",
        LCIACategory: "textile:LCIACategory",
        SubstanceOfConcern: "textile:SubstanceOfConcern",
        QuantitativeValue: "gs1:QuantitativeValue",
        value: {
          "@id": "gs1:value",
          "@type": "xsd:decimal"
        },
        unitCode: "gs1:unitCode",
        TextileCategory: "textile:TextileCategory",
        FabricType: "textile:FabricType",
        ApparelSubcategory: "textile:ApparelSubcategory",
        FiberType: "textile:FiberType",
        CareSymbolCode: "textile:CareSymbolCode",
        MicroplasticRiskLevel: "textile:MicroplasticRiskLevel",
        DurabilityClass: "textile:DurabilityClass",
        RecyclingTechnology: "textile:RecyclingTechnology",
        WasteOriginType: "textile:WasteOriginType",
        RecycledSourceType: "textile:RecycledSourceType",
        ChainOfCustodyMethod: "textile:ChainOfCustodyMethod",
        FootprintDataType: "textile:FootprintDataType",
        LCIACategoryCode: "textile:LCIACategoryCode",
        SubstanceOfConcernType: "textile:SubstanceOfConcernType",
        CLPHazardCategory: "textile:CLPHazardCategory",
        TestStandard: "textile:TestStandard",
        CertificationDetails: "gs1:CertificationDetails",
        certificationAgency: "gs1:certificationAgency",
        certificationValue: "gs1:certificationValue",
        certificationStandard: "gs1:certificationStandard",
        textileCategory: {
          "@id": "schema:category",
          "@type": "@vocab",
          "@context": {
            Apparel: "textile:Apparel",
            Footwear: "textile:Footwear",
            HomeTextiles: "textile:HomeTextiles",
            TechnicalTextiles: "textile:TechnicalTextiles",
            Accessories: "textile:Accessories"
          }
        },
        fiberOrigin: "textile:fiberOrigin",
        fiberCertification: {
          "@id": "textile:fiberCertification",
          "@type": "@id"
        },
        fabricType: {
          "@id": "textile:fabricType",
          "@type": "@vocab",
          "@context": {
            Knitted: "textile:Knitted",
            Denim: "textile:Denim",
            WovenNonDenim: "textile:WovenNonDenim"
          }
        },
        apparelSubcategory: {
          "@id": "textile:apparelSubcategory",
          "@type": "@vocab",
          "@context": {
            TShirts: "textile:TShirts",
            ShirtsBlouses: "textile:ShirtsBlouses",
            Sweaters: "textile:Sweaters",
            JacketsCoats: "textile:JacketsCoats",
            PantsShorts: "textile:PantsShorts",
            DressesSkirts: "textile:DressesSkirts",
            LeggingsStockingsSocks: "textile:LeggingsStockingsSocks",
            Underwear: "textile:Underwear",
            Swimwear: "textile:Swimwear",
            TextileAccessories: "textile:TextileAccessories"
          }
        },
        careInstructions: {
          "@id": "textile:careInstructions",
          "@type": "@id"
        },
        washingSymbol: {
          "@id": "textile:washingSymbol",
          "@type": "@vocab",
          "@context": {
            Wash30: "textile:Wash30",
            Wash40: "textile:Wash40",
            Wash60: "textile:Wash60",
            WashHandOnly: "textile:WashHandOnly",
            DoNotWash: "textile:DoNotWash",
            WashGentle: "textile:WashGentle",
            BleachAllowed: "textile:BleachAllowed",
            NonChlorineBleach: "textile:NonChlorineBleach",
            DoNotBleach: "textile:DoNotBleach",
            TumbleDryLow: "textile:TumbleDryLow",
            TumbleDryMedium: "textile:TumbleDryMedium",
            TumbleDryHigh: "textile:TumbleDryHigh",
            DoNotTumbleDry: "textile:DoNotTumbleDry",
            LineDry: "textile:LineDry",
            DryFlat: "textile:DryFlat",
            DripDry: "textile:DripDry",
            IronLow: "textile:IronLow",
            IronMedium: "textile:IronMedium",
            IronHigh: "textile:IronHigh",
            DoNotIron: "textile:DoNotIron",
            NoSteam: "textile:NoSteam",
            DryCleanAny: "textile:DryCleanAny",
            DryCleanPCE: "textile:DryCleanPCE",
            DryCleanHydrocarbon: "textile:DryCleanHydrocarbon",
            DoNotDryClean: "textile:DoNotDryClean",
            WetClean: "textile:WetClean"
          }
        },
        bleachingSymbol: {
          "@id": "textile:bleachingSymbol",
          "@type": "@vocab",
          "@context": {
            Wash30: "textile:Wash30",
            Wash40: "textile:Wash40",
            Wash60: "textile:Wash60",
            WashHandOnly: "textile:WashHandOnly",
            DoNotWash: "textile:DoNotWash",
            WashGentle: "textile:WashGentle",
            BleachAllowed: "textile:BleachAllowed",
            NonChlorineBleach: "textile:NonChlorineBleach",
            DoNotBleach: "textile:DoNotBleach",
            TumbleDryLow: "textile:TumbleDryLow",
            TumbleDryMedium: "textile:TumbleDryMedium",
            TumbleDryHigh: "textile:TumbleDryHigh",
            DoNotTumbleDry: "textile:DoNotTumbleDry",
            LineDry: "textile:LineDry",
            DryFlat: "textile:DryFlat",
            DripDry: "textile:DripDry",
            IronLow: "textile:IronLow",
            IronMedium: "textile:IronMedium",
            IronHigh: "textile:IronHigh",
            DoNotIron: "textile:DoNotIron",
            NoSteam: "textile:NoSteam",
            DryCleanAny: "textile:DryCleanAny",
            DryCleanPCE: "textile:DryCleanPCE",
            DryCleanHydrocarbon: "textile:DryCleanHydrocarbon",
            DoNotDryClean: "textile:DoNotDryClean",
            WetClean: "textile:WetClean"
          }
        },
        dryingSymbol: {
          "@id": "textile:dryingSymbol",
          "@type": "@vocab",
          "@context": {
            Wash30: "textile:Wash30",
            Wash40: "textile:Wash40",
            Wash60: "textile:Wash60",
            WashHandOnly: "textile:WashHandOnly",
            DoNotWash: "textile:DoNotWash",
            WashGentle: "textile:WashGentle",
            BleachAllowed: "textile:BleachAllowed",
            NonChlorineBleach: "textile:NonChlorineBleach",
            DoNotBleach: "textile:DoNotBleach",
            TumbleDryLow: "textile:TumbleDryLow",
            TumbleDryMedium: "textile:TumbleDryMedium",
            TumbleDryHigh: "textile:TumbleDryHigh",
            DoNotTumbleDry: "textile:DoNotTumbleDry",
            LineDry: "textile:LineDry",
            DryFlat: "textile:DryFlat",
            DripDry: "textile:DripDry",
            IronLow: "textile:IronLow",
            IronMedium: "textile:IronMedium",
            IronHigh: "textile:IronHigh",
            DoNotIron: "textile:DoNotIron",
            NoSteam: "textile:NoSteam",
            DryCleanAny: "textile:DryCleanAny",
            DryCleanPCE: "textile:DryCleanPCE",
            DryCleanHydrocarbon: "textile:DryCleanHydrocarbon",
            DoNotDryClean: "textile:DoNotDryClean",
            WetClean: "textile:WetClean"
          }
        },
        ironingSymbol: {
          "@id": "textile:ironingSymbol",
          "@type": "@vocab",
          "@context": {
            Wash30: "textile:Wash30",
            Wash40: "textile:Wash40",
            Wash60: "textile:Wash60",
            WashHandOnly: "textile:WashHandOnly",
            DoNotWash: "textile:DoNotWash",
            WashGentle: "textile:WashGentle",
            BleachAllowed: "textile:BleachAllowed",
            NonChlorineBleach: "textile:NonChlorineBleach",
            DoNotBleach: "textile:DoNotBleach",
            TumbleDryLow: "textile:TumbleDryLow",
            TumbleDryMedium: "textile:TumbleDryMedium",
            TumbleDryHigh: "textile:TumbleDryHigh",
            DoNotTumbleDry: "textile:DoNotTumbleDry",
            LineDry: "textile:LineDry",
            DryFlat: "textile:DryFlat",
            DripDry: "textile:DripDry",
            IronLow: "textile:IronLow",
            IronMedium: "textile:IronMedium",
            IronHigh: "textile:IronHigh",
            DoNotIron: "textile:DoNotIron",
            NoSteam: "textile:NoSteam",
            DryCleanAny: "textile:DryCleanAny",
            DryCleanPCE: "textile:DryCleanPCE",
            DryCleanHydrocarbon: "textile:DryCleanHydrocarbon",
            DoNotDryClean: "textile:DoNotDryClean",
            WetClean: "textile:WetClean"
          }
        },
        dryCleaningSymbol: {
          "@id": "textile:dryCleaningSymbol",
          "@type": "@vocab",
          "@context": {
            Wash30: "textile:Wash30",
            Wash40: "textile:Wash40",
            Wash60: "textile:Wash60",
            WashHandOnly: "textile:WashHandOnly",
            DoNotWash: "textile:DoNotWash",
            WashGentle: "textile:WashGentle",
            BleachAllowed: "textile:BleachAllowed",
            NonChlorineBleach: "textile:NonChlorineBleach",
            DoNotBleach: "textile:DoNotBleach",
            TumbleDryLow: "textile:TumbleDryLow",
            TumbleDryMedium: "textile:TumbleDryMedium",
            TumbleDryHigh: "textile:TumbleDryHigh",
            DoNotTumbleDry: "textile:DoNotTumbleDry",
            LineDry: "textile:LineDry",
            DryFlat: "textile:DryFlat",
            DripDry: "textile:DripDry",
            IronLow: "textile:IronLow",
            IronMedium: "textile:IronMedium",
            IronHigh: "textile:IronHigh",
            DoNotIron: "textile:DoNotIron",
            NoSteam: "textile:NoSteam",
            DryCleanAny: "textile:DryCleanAny",
            DryCleanPCE: "textile:DryCleanPCE",
            DryCleanHydrocarbon: "textile:DryCleanHydrocarbon",
            DoNotDryClean: "textile:DoNotDryClean",
            WetClean: "textile:WetClean"
          }
        },
        additionalCareInstructions: "textile:additionalCareInstructions",
        durabilityInfo: {
          "@id": "textile:durabilityInfo",
          "@type": "@id"
        },
        expectedWashCycles: {
          "@id": "textile:expectedWashCycles",
          "@type": "xsd:integer"
        },
        durabilityClass: {
          "@id": "textile:durabilityClass",
          "@type": "@vocab",
          "@context": {
            DurabilityA: "textile:DurabilityA",
            DurabilityB: "textile:DurabilityB",
            DurabilityC: "textile:DurabilityC",
            DurabilityD: "textile:DurabilityD",
            DurabilityE: "textile:DurabilityE"
          }
        },
        pillingResistance: {
          "@id": "textile:pillingResistance",
          "@type": "xsd:integer"
        },
        colorFastness: {
          "@id": "textile:colorFastness",
          "@type": "xsd:integer"
        },
        dimensionalStability: {
          "@id": "textile:dimensionalStability",
          "@type": "xsd:decimal"
        },
        abrasionResistance: {
          "@id": "textile:abrasionResistance",
          "@type": "xsd:integer"
        },
        tensileStrength: {
          "@id": "textile:tensileStrength",
          "@type": "@id"
        },
        tearStrength: {
          "@id": "textile:tearStrength",
          "@type": "@id"
        },
        expectedLifetimeYears: {
          "@id": "textile:expectedLifetimeYears",
          "@type": "xsd:integer"
        },
        microplasticInfo: {
          "@id": "textile:microplasticInfo",
          "@type": "@id"
        },
        microplasticRiskLevel: {
          "@id": "textile:microplasticRiskLevel",
          "@type": "@vocab",
          "@context": {
            LowShedding: "textile:LowShedding",
            MediumShedding: "textile:MediumShedding",
            HighShedding: "textile:HighShedding"
          }
        },
        sheddingRate: {
          "@id": "textile:sheddingRate",
          "@type": "@id"
        },
        syntheticFiberContent: {
          "@id": "textile:syntheticFiberContent",
          "@type": "xsd:decimal"
        },
        microplasticMitigationMeasures: "textile:microplasticMitigationMeasures",
        takeBackProgram: {
          "@id": "textile:takeBackProgram",
          "@type": "@id"
        },
        hasTakeBackProgram: {
          "@id": "textile:hasTakeBackProgram",
          "@type": "xsd:boolean"
        },
        takeBackUrl: {
          "@id": "textile:takeBackUrl",
          "@type": "@id"
        },
        takeBackIncentive: "textile:takeBackIncentive",
        endOfLifeDestination: "textile:endOfLifeDestination",
        recyclingInstructions: "gs1:consumerRecyclingInstructions",
        repairServices: {
          "@id": "textile:repairServices",
          "@type": "@id",
          "@container": "@set"
        },
        isRepairable: {
          "@id": "textile:isRepairable",
          "@type": "xsd:boolean"
        },
        repairGuideUrl: {
          "@id": "textile:repairGuideUrl",
          "@type": "@id"
        },
        sparePartsAvailable: {
          "@id": "textile:sparePartsAvailable",
          "@type": "xsd:boolean"
        },
        sparePartsUrl: {
          "@id": "textile:sparePartsUrl",
          "@type": "@id"
        },
        isRecycledFiber: {
          "@id": "textile:isRecycledFiber",
          "@type": "xsd:boolean"
        },
        recycledContentSource: "textile:recycledContentSource",
        textileChemicals: {
          "@id": "textile:textileChemicals",
          "@type": "@id",
          "@container": "@set"
        },
        chemicalName: "schema:name",
        chemicalPurpose: "textile:chemicalPurpose",
        isMRSLCompliant: {
          "@id": "textile:isMRSLCompliant",
          "@type": "xsd:boolean"
        },
        pfasFree: {
          "@id": "textile:pfasFree",
          "@type": "xsd:boolean"
        },
        garmentType: "textile:garmentType",
        targetGender: "gs1:targetConsumerGender",
        sizeRange: "textile:sizeRange",
        seasonCollection: "textile:seasonCollection",
        robustnessTestFabricType: {
          "@id": "textile:robustnessTestFabricType",
          "@type": "@vocab",
          "@context": {
            Knitted: "textile:Knitted",
            Denim: "textile:Denim",
            WovenNonDenim: "textile:WovenNonDenim"
          }
        },
        waterUsage: {
          "@id": "textile:waterUsage",
          "@type": "@id"
        },
        energyUsage: {
          "@id": "textile:energyUsage",
          "@type": "@id"
        },
        productionWastePercentage: {
          "@id": "textile:productionWastePercentage",
          "@type": "xsd:decimal"
        },
        biodegradable: {
          "@id": "textile:biodegradable",
          "@type": "xsd:boolean"
        },
        spinningFacility: {
          "@id": "textile:spinningFacility",
          "@type": "@id"
        },
        weavingFacility: {
          "@id": "textile:weavingFacility",
          "@type": "@id"
        },
        dyeingFacility: {
          "@id": "textile:dyeingFacility",
          "@type": "@id"
        },
        cutAndSewFacility: {
          "@id": "textile:cutAndSewFacility",
          "@type": "@id"
        },
        finishingFacility: {
          "@id": "textile:finishingFacility",
          "@type": "@id"
        },
        robustnessAssessment: {
          "@id": "textile:robustnessAssessment",
          "@type": "@id"
        },
        robustnessScore: {
          "@id": "textile:robustnessScore",
          "@type": "xsd:decimal"
        },
        cleaningCyclesBeforeTest: {
          "@id": "textile:cleaningCyclesBeforeTest",
          "@type": "xsd:integer"
        },
        spiralityTest: {
          "@id": "textile:spiralityTest",
          "@type": "@id"
        },
        dimensionalChangeTest: {
          "@id": "textile:dimensionalChangeTest",
          "@type": "@id"
        },
        visualInspection: {
          "@id": "textile:visualInspection",
          "@type": "@id"
        },
        spiralityScore: {
          "@id": "textile:spiralityScore",
          "@type": "xsd:integer"
        },
        spiralityPercentage: {
          "@id": "textile:spiralityPercentage",
          "@type": "xsd:decimal"
        },
        spiralityTestMethod: "textile:spiralityTestMethod",
        dimensionalChangeScore: {
          "@id": "textile:dimensionalChangeScore",
          "@type": "xsd:integer"
        },
        dimensionalChangePercentage: {
          "@id": "textile:dimensionalChangePercentage",
          "@type": "xsd:decimal"
        },
        dimensionalChangeTestMethod: "textile:dimensionalChangeTestMethod",
        visualInspectionScore: {
          "@id": "textile:visualInspectionScore",
          "@type": "xsd:integer"
        },
        colourChangeRating: {
          "@id": "textile:colourChangeRating",
          "@type": "xsd:integer"
        },
        fabricAppearanceRating: {
          "@id": "textile:fabricAppearanceRating",
          "@type": "xsd:integer"
        },
        seamAppearanceRating: {
          "@id": "textile:seamAppearanceRating",
          "@type": "xsd:integer"
        },
        nonTextilePartsRating: {
          "@id": "textile:nonTextilePartsRating",
          "@type": "xsd:integer"
        },
        visualInspectionTestMethod: "textile:visualInspectionTestMethod",
        recyclabilityAssessment: {
          "@id": "textile:recyclabilityAssessment",
          "@type": "@id"
        },
        recyclabilityScore: {
          "@id": "textile:recyclabilityScore",
          "@type": "xsd:decimal"
        },
        isRecyclable: {
          "@id": "textile:isRecyclable",
          "@type": "xsd:boolean"
        },
        elastaneContentPercent: {
          "@id": "textile:elastaneContentPercent",
          "@type": "xsd:decimal"
        },
        sortingFactors: {
          "@id": "textile:sortingFactors",
          "@type": "@id"
        },
        technicalRecyclability: {
          "@id": "textile:technicalRecyclability",
          "@type": "@id"
        },
        sameInnerOuterComposition: {
          "@id": "textile:sameInnerOuterComposition",
          "@type": "xsd:boolean"
        },
        freeFromPrintings: {
          "@id": "textile:freeFromPrintings",
          "@type": "xsd:boolean"
        },
        freeFromCoatings: {
          "@id": "textile:freeFromCoatings",
          "@type": "xsd:boolean"
        },
        freeFromSequins: {
          "@id": "textile:freeFromSequins",
          "@type": "xsd:boolean"
        },
        freeFromDyes: {
          "@id": "textile:freeFromDyes",
          "@type": "xsd:boolean"
        },
        isMonoMaterial: {
          "@id": "textile:isMonoMaterial",
          "@type": "xsd:boolean"
        },
        technicalRecyclabilityScore: {
          "@id": "textile:technicalRecyclabilityScore",
          "@type": "xsd:decimal"
        },
        applicableRecyclingTechnology: {
          "@id": "textile:applicableRecyclingTechnology",
          "@type": "@vocab",
          "@context": {
            MechanicalRecycling: "textile:MechanicalRecycling",
            ChemicalRecyclingCotton: "textile:ChemicalRecyclingCotton",
            ThermoChemicalRecycling: "textile:ThermoChemicalRecycling",
            ChemicalRecyclingPA6: "textile:ChemicalRecyclingPA6",
            ThermoMechanicalRecycling: "textile:ThermoMechanicalRecycling"
          }
        },
        recycledContentDeclaration: {
          "@id": "textile:recycledContentDeclaration",
          "@type": "@id",
          "@container": "@set"
        },
        secondaryMaterialFraction: {
          "@id": "textile:secondaryMaterialFraction",
          "@type": "xsd:decimal"
        },
        wasteOriginType: {
          "@id": "textile:wasteOriginType",
          "@type": "@vocab",
          "@context": {
            PostConsumer: "textile:PostConsumer",
            PostIndustrial: "textile:PostIndustrial"
          }
        },
        recycledSourceType: {
          "@id": "textile:recycledSourceType",
          "@type": "@vocab",
          "@context": {
            FiberToFiber: "textile:FiberToFiber",
            OpenLoop: "textile:OpenLoop"
          }
        },
        chainOfCustodyMethod: {
          "@id": "textile:chainOfCustodyMethod",
          "@type": "@vocab",
          "@context": {
            MassBalance: "textile:MassBalance",
            Segregation: "textile:Segregation",
            IdentityPreserved: "textile:IdentityPreserved",
            Certified: "textile:Certified"
          }
        },
        meetsTargetThreshold: {
          "@id": "textile:meetsTargetThreshold",
          "@type": "xsd:boolean"
        },
        verificationCertification: {
          "@id": "textile:verificationCertification",
          "@type": "@id"
        },
        environmentalFootprint: {
          "@id": "textile:environmentalFootprint",
          "@type": "@id"
        },
        carbonFootprintManufacturing: {
          "@id": "textile:carbonFootprintManufacturing",
          "@type": "xsd:decimal"
        },
        pefSingleScore: {
          "@id": "textile:pefSingleScore",
          "@type": "xsd:decimal"
        },
        benchmarkPerformance: {
          "@id": "textile:benchmarkPerformance",
          "@type": "xsd:decimal"
        },
        dataTypeIndicator: {
          "@id": "textile:dataTypeIndicator",
          "@type": "@vocab",
          "@context": {
            PrimaryData: "textile:PrimaryData",
            SecondaryData: "textile:SecondaryData",
            MixedData: "textile:MixedData"
          }
        },
        pefcrReference: "textile:pefcrReference",
        lciaCategories: {
          "@id": "textile:lciaCategories",
          "@type": "@id",
          "@container": "@set"
        },
        lciaCategoryCode: {
          "@id": "textile:lciaCategoryCode",
          "@type": "@vocab",
          "@context": {
            GWP: "textile:GWP",
            WaterUse: "textile:WaterUse",
            Eutrophication: "textile:Eutrophication",
            Acidification: "textile:Acidification",
            Ecotoxicity: "textile:Ecotoxicity",
            HumanToxicity: "textile:HumanToxicity"
          }
        },
        lciaValue: {
          "@id": "textile:lciaValue",
          "@type": "xsd:decimal"
        },
        lciaUnit: "textile:lciaUnit",
        substancesOfConcern: {
          "@id": "textile:substancesOfConcern",
          "@type": "@id",
          "@container": "@set"
        },
        socType: {
          "@id": "textile:socType",
          "@type": "@vocab",
          "@context": {
            SoCTypeA: "textile:SoCTypeA",
            SoCTypeB: "textile:SoCTypeB",
            SoCTypeC: "textile:SoCTypeC",
            SoCTypeD: "textile:SoCTypeD"
          }
        },
        iupacName: "schema:iupacName",
        casNumber: "dpp:casNumber",
        ecNumber: "textile:ecNumber",
        substanceConcentration: {
          "@id": "textile:substanceConcentration",
          "@type": "xsd:decimal"
        },
        concentrationRange: "textile:concentrationRange",
        maxConcentration: {
          "@id": "textile:maxConcentration",
          "@type": "xsd:decimal"
        },
        locationInProduct: "textile:locationInProduct",
        safeUseInstructions: "textile:safeUseInstructions",
        endOfLifeHandling: "textile:endOfLifeHandling",
        clpHazardCategory: {
          "@id": "textile:clpHazardCategory",
          "@type": "@vocab",
          "@context": {
            CMR: "textile:CMR",
            EndocrineDisruptor: "textile:EndocrineDisruptor",
            PMT: "textile:PMT",
            Sensitizer: "textile:Sensitizer",
            AquaticToxicity: "textile:AquaticToxicity"
          }
        },
        testStandard: {
          "@id": "textile:testStandard",
          "@type": "@vocab",
          "@context": {
            ISO6330: "textile:ISO6330",
            ISO16322_3: "textile:ISO16322_3",
            ISO3759: "textile:ISO3759",
            ISO15487: "textile:ISO15487",
            ISO105: "textile:ISO105",
            ISO12945: "textile:ISO12945",
            ISO12947: "textile:ISO12947"
          }
        }
      }
    ]
  },
  "https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld": {
    "@context": [
      "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
      {
        "@version": 1.1,
        electronics: "https://ref.openepcis.io/extensions/eu/electronics/",
        dpp: "https://ref.openepcis.io/extensions/common/core/",
        gs1: "https://ref.gs1.org/voc/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        id: "@id",
        type: "@type",
        ComponentType: "electronics:ComponentType",
        DeviceCategory: "electronics:DeviceCategory",
        EURepairabilityClass: "electronics:EURepairabilityClass",
        EnergyEfficiencyClass: "electronics:EnergyEfficiencyClass",
        RepairCriterionType: "electronics:RepairCriterionType",
        ReplacementDifficulty: "electronics:ReplacementDifficulty",
        WEEECategory: "electronics:WEEECategory",
        RepairabilityIndex: "electronics:RepairabilityIndex",
        RepairCriterion: "electronics:RepairCriterion",
        SoftwareSupport: "electronics:SoftwareSupport",
        EnergyEfficiency: "electronics:EnergyEfficiency",
        ComponentBOM: "electronics:ComponentBOM",
        WEEECompliance: "electronics:WEEECompliance",
        RoHSCompliance: "electronics:RoHSCompliance",
        DisplaySpecification: "electronics:DisplaySpecification",
        deviceCategory: {
          "@id": "schema:category",
          "@type": "@vocab",
          "@context": {
            Smartphone: "electronics:Smartphone",
            Tablet: "electronics:Tablet",
            Laptop: "electronics:Laptop",
            Desktop: "electronics:Desktop",
            Server: "electronics:Server",
            Display: "electronics:Display",
            Television: "electronics:Television",
            WashingMachine: "electronics:WashingMachine",
            Refrigerator: "electronics:Refrigerator",
            Dishwasher: "electronics:Dishwasher",
            VacuumCleaner: "electronics:VacuumCleaner",
            SmallAppliance: "electronics:SmallAppliance",
            NetworkEquipment: "electronics:NetworkEquipment",
            DataStorage: "electronics:DataStorage",
            Printer: "electronics:Printer",
            Wearable: "electronics:Wearable"
          }
        },
        modelIdentifier: "electronics:modelIdentifier",
        commercialName: "schema:name",
        repairabilityIndex: {
          "@id": "electronics:repairabilityIndex",
          "@type": "@id"
        },
        totalScore: {
          "@id": "electronics:totalScore",
          "@type": "xsd:decimal"
        },
        displayScore: {
          "@id": "electronics:displayScore",
          "@type": "xsd:decimal"
        },
        repairabilityClass: {
          "@id": "electronics:repairabilityClass",
          "@type": "@vocab",
          "@context": {
            RepairClassA: "electronics:RepairClassA",
            RepairClassB: "electronics:RepairClassB",
            RepairClassC: "electronics:RepairClassC",
            RepairClassD: "electronics:RepairClassD",
            RepairClassE: "electronics:RepairClassE"
          }
        },
        repairCriteria: {
          "@id": "electronics:repairCriteria",
          "@type": "@id",
          "@container": "@set"
        },
        criterionType: {
          "@id": "electronics:criterionType",
          "@type": "@vocab",
          "@context": {
            Documentation: "electronics:Documentation",
            Disassembly: "electronics:Disassembly",
            SparePartsAvailability: "electronics:SparePartsAvailability",
            SparePartsPricing: "electronics:SparePartsPricing",
            ProductSpecific: "electronics:ProductSpecific"
          }
        },
        criterionScore: {
          "@id": "electronics:criterionScore",
          "@type": "xsd:decimal"
        },
        criterionMaxScore: {
          "@id": "electronics:criterionMaxScore",
          "@type": "xsd:decimal"
        },
        criterionDetails: "electronics:criterionDetails",
        assessmentDate: {
          "@id": "electronics:assessmentDate",
          "@type": "xsd:date"
        },
        assessmentBody: {
          "@id": "electronics:assessmentBody",
          "@type": "@id"
        },
        repairabilityLabelUrl: {
          "@id": "electronics:repairabilityLabelUrl",
          "@type": "@id"
        },
        softwareSupport: {
          "@id": "electronics:softwareSupport",
          "@type": "@id"
        },
        operatingSystem: "schema:operatingSystem",
        osVersion: "electronics:osVersion",
        firmwareVersion: "electronics:firmwareVersion",
        securityUpdateEndDate: {
          "@id": "electronics:securityUpdateEndDate",
          "@type": "xsd:date"
        },
        featureUpdateEndDate: {
          "@id": "electronics:featureUpdateEndDate",
          "@type": "xsd:date"
        },
        securitySupportYears: {
          "@id": "electronics:securitySupportYears",
          "@type": "@id"
        },
        featureSupportYears: {
          "@id": "electronics:featureSupportYears",
          "@type": "@id"
        },
        updateChannel: {
          "@id": "electronics:updateChannel",
          "@type": "@id"
        },
        latestUpdateDate: {
          "@id": "electronics:latestUpdateDate",
          "@type": "xsd:date"
        },
        energyEfficiency: {
          "@id": "electronics:energyEfficiency",
          "@type": "@id"
        },
        energyEfficiencyClass: {
          "@id": "electronics:energyEfficiencyClass",
          "@type": "@vocab",
          "@context": {
            EnergyClassA: "electronics:EnergyClassA",
            EnergyClassB: "electronics:EnergyClassB",
            EnergyClassC: "electronics:EnergyClassC",
            EnergyClassD: "electronics:EnergyClassD",
            EnergyClassE: "electronics:EnergyClassE",
            EnergyClassF: "electronics:EnergyClassF",
            EnergyClassG: "electronics:EnergyClassG"
          }
        },
        annualEnergyConsumption: {
          "@id": "electronics:annualEnergyConsumption",
          "@type": "@id"
        },
        powerConsumptionOn: {
          "@id": "electronics:powerConsumptionOn",
          "@type": "@id"
        },
        powerConsumptionStandby: {
          "@id": "electronics:powerConsumptionStandby",
          "@type": "@id"
        },
        powerConsumptionOff: {
          "@id": "electronics:powerConsumptionOff",
          "@type": "@id"
        },
        eprelRegistrationNumber: "electronics:eprelRegistrationNumber",
        energyLabelUrl: {
          "@id": "electronics:energyLabelUrl",
          "@type": "@id"
        },
        eprelProductUrl: {
          "@id": "electronics:eprelProductUrl",
          "@type": "@id"
        },
        billOfMaterials: {
          "@id": "electronics:billOfMaterials",
          "@type": "@id"
        },
        components: {
          "@id": "electronics:components",
          "@type": "@id",
          "@container": "@set"
        },
        componentType: {
          "@id": "electronics:componentType",
          "@type": "@vocab",
          "@context": {
            BatteryComponent: "electronics:BatteryComponent",
            DisplayComponent: "electronics:DisplayComponent",
            ProcessorComponent: "electronics:ProcessorComponent",
            MemoryComponent: "electronics:MemoryComponent",
            StorageComponent: "electronics:StorageComponent",
            MotherboardComponent: "electronics:MotherboardComponent",
            PowerSupplyComponent: "electronics:PowerSupplyComponent",
            CoolingSystemComponent: "electronics:CoolingSystemComponent",
            CameraComponent: "electronics:CameraComponent",
            SpeakerComponent: "electronics:SpeakerComponent",
            MicrophoneComponent: "electronics:MicrophoneComponent",
            KeyboardComponent: "electronics:KeyboardComponent",
            TrackpadComponent: "electronics:TrackpadComponent",
            ConnectorComponent: "electronics:ConnectorComponent",
            EnclosureComponent: "electronics:EnclosureComponent"
          }
        },
        componentName: "schema:name",
        componentManufacturer: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        componentPartNumber: "electronics:componentPartNumber",
        isReplaceable: {
          "@id": "electronics:isReplaceable",
          "@type": "xsd:boolean"
        },
        replacementDifficulty: {
          "@id": "electronics:replacementDifficulty",
          "@type": "@vocab",
          "@context": {
            UserReplaceable: "electronics:UserReplaceable",
            ToolRequired: "electronics:ToolRequired",
            ProfessionalOnly: "electronics:ProfessionalOnly",
            NotReplaceable: "electronics:NotReplaceable"
          }
        },
        componentPassport: {
          "@id": "electronics:componentPassport",
          "@type": "@id"
        },
        sparePartAvailabilityYears: {
          "@id": "electronics:sparePartAvailabilityYears",
          "@type": "@id"
        },
        sparePartPrice: {
          "@id": "electronics:sparePartPrice",
          "@type": "@id"
        },
        weeeCompliance: {
          "@id": "electronics:weeeCompliance",
          "@type": "@id"
        },
        weeeCategory: {
          "@id": "schema:category",
          "@type": "@vocab",
          "@context": {
            WEEE1_TemperatureExchange: "electronics:WEEE1_TemperatureExchange",
            WEEE2_ScreensMonitors: "electronics:WEEE2_ScreensMonitors",
            WEEE3_Lamps: "electronics:WEEE3_Lamps",
            WEEE4_LargeEquipment: "electronics:WEEE4_LargeEquipment",
            WEEE5_SmallEquipment: "electronics:WEEE5_SmallEquipment",
            WEEE6_SmallIT: "electronics:WEEE6_SmallIT"
          }
        },
        weeeRegistrationNumber: "electronics:weeeRegistrationNumber",
        weeeRegistrationCountry: "electronics:weeeRegistrationCountry",
        collectionSchemeUrl: {
          "@id": "electronics:collectionSchemeUrl",
          "@type": "@id"
        },
        recyclabilityRate: {
          "@id": "electronics:recyclabilityRate",
          "@type": "xsd:decimal"
        },
        recoverabilityRate: {
          "@id": "electronics:recoverabilityRate",
          "@type": "xsd:decimal"
        },
        rohsCompliance: {
          "@id": "electronics:rohsCompliance",
          "@type": "@id"
        },
        rohsCompliant: {
          "@id": "electronics:rohsCompliant",
          "@type": "xsd:boolean"
        },
        rohsExemptions: "electronics:rohsExemptions",
        rohsDeclarationUrl: {
          "@id": "electronics:rohsDeclarationUrl",
          "@type": "@id"
        },
        displaySpecification: {
          "@id": "electronics:displaySpecification",
          "@type": "@id"
        },
        screenDiagonal: {
          "@id": "electronics:screenDiagonal",
          "@type": "@id"
        },
        screenResolutionWidth: {
          "@id": "electronics:screenResolutionWidth",
          "@type": "xsd:integer"
        },
        screenResolutionHeight: {
          "@id": "electronics:screenResolutionHeight",
          "@type": "xsd:integer"
        },
        displayTechnology: "electronics:displayTechnology",
        refreshRate: {
          "@id": "electronics:refreshRate",
          "@type": "@id"
        },
        peakBrightness: {
          "@id": "electronics:peakBrightness",
          "@type": "@id"
        },
        softwareUpdateEvent: {
          "@id": "electronics:softwareUpdateEvent",
          "@type": "@id"
        },
        previousVersion: "electronics:previousVersion",
        newVersion: "electronics:newVersion",
        updateType: "electronics:updateType",
        updateSource: "electronics:updateSource",
        materialDeclaration: {
          "@id": "electronics:materialDeclaration",
          "@type": "@id"
        },
        iec62474DslVersion: "electronics:iec62474DslVersion",
        materialDeclarationDate: {
          "@id": "electronics:materialDeclarationDate",
          "@type": "xsd:date"
        },
        Product: "gs1:Product",
        QuantitativeValue: "gs1:QuantitativeValue",
        value: {
          "@id": "gs1:value",
          "@type": "xsd:decimal"
        },
        unitCode: "gs1:unitCode",
        PriceSpecification: "gs1:PriceSpecification",
        price: {
          "@id": "gs1:price",
          "@type": "xsd:decimal"
        },
        priceCurrency: "gs1:priceCurrency",
        Organization: "gs1:Organization",
        organizationName: "gs1:organizationName",
        gln: "gs1:gln",
        gtin: "gs1:gtin",
        productName: "gs1:productName",
        brand: {
          "@id": "gs1:brand",
          "@type": "@id"
        },
        productionDate: {
          "@id": "gs1:productionDate",
          "@type": "xsd:date"
        },
        countryOfOrigin: "gs1:countryOfOrigin",
        manufacturer: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        netWeight: {
          "@id": "gs1:netWeight",
          "@type": "@id"
        },
        grossWeight: {
          "@id": "gs1:grossWeight",
          "@type": "@id"
        }
      }
    ]
  },
  "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld": {
    "@context": [
      "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
      {
        "@version": 1.1,
        eudr: "https://ref.openepcis.io/extensions/eu/eudr/",
        dpp: "https://ref.openepcis.io/extensions/common/core/",
        gs1: "https://ref.gs1.org/voc/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        id: "@id",
        type: "@type",
        ActorRole: "eudr:ActorRole",
        QuantitativeValue: "gs1:QuantitativeValue",
        CommodityType: "eudr:CommodityType",
        DueDiligenceStatement: "eudr:DueDiligenceStatement",
        OriginDetails: "eudr:OriginDetails",
        RiskAssessment: "eudr:RiskAssessment",
        RiskLevel: "eudr:RiskLevel",
        TimberProductType: "eudr:TimberProductType",
        Product: "gs1:Product",
        Place: "gs1:Place",
        GeoShape: "gs1:GeoShape",
        Country: "gs1:Country",
        Organization: "gs1:Organization",
        PostalAddress: "gs1:PostalAddress",
        Message: "gs1:Message",
        RegulatoryNotification: "gs1:RegulatoryNotification",
        RegulatoryIdentifier: "gs1:RegulatoryIdentifier",
        Transaction: "gs1:Transaction",
        productName: "gs1:productName",
        locationGLN: "gs1:locationGLN",
        physicalLocationName: "gs1:physicalLocationName",
        gtin: "gs1:gtin",
        serialNumber: "gs1:serialNumber",
        organizationName: "gs1:organizationName",
        partyGLN: "gs1:partyGLN",
        gln: "gs1:gln",
        netWeight: {
          "@id": "gs1:netWeight",
          "@type": "@id"
        },
        grossWeight: {
          "@id": "gs1:grossWeight",
          "@type": "@id"
        },
        manufacturer: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        address: {
          "@id": "gs1:address",
          "@type": "@id"
        },
        streetAddress: "gs1:streetAddress",
        addressLocality: "gs1:addressLocality",
        postalCode: "gs1:postalCode",
        addressCountry: "gs1:addressCountry",
        regulatoryInformation: {
          "@id": "gs1:regulatoryInformation",
          "@type": "@id"
        },
        RegulatoryInformation: "gs1:RegulatoryInformation",
        regulationType: {
          "@id": "gs1:regulationType",
          "@type": "@vocab",
          "@context": {
            DEFORESTATION_REGULATION: "gs1:regulationType-DEFORESTATION_REGULATION"
          }
        },
        regulatoryAct: "gs1:regulatoryAct",
        isTradeItemRegulationCompliant: "gs1:isTradeItemRegulationCompliant",
        regulatoryIdentifier: {
          "@id": "gs1:regulatoryIdentifier",
          "@type": "@id"
        },
        regulatoryIdentifierType: {
          "@id": "gs1:regulatoryIdentifierType",
          "@type": "@vocab",
          "@context": {
            DUE_DILIGENCE_STATEMENT: "gs1:regulatoryIdentifierType-DUE_DILIGENCE_STATEMENT"
          }
        },
        regulatoryReferenceNumber: "gs1:regulatoryReferenceNumber",
        regulatoryVerificationNumber: "gs1:regulatoryVerificationNumber",
        regulatoryInformationProvider: {
          "@id": "gs1:regulatoryInformationProvider",
          "@type": "@id"
        },
        regulatoryReferenceApplicabilityStartDate: {
          "@id": "gs1:regulatoryReferenceApplicabilityStartDate",
          "@type": "xsd:date"
        },
        regulatoryReferenceApplicabilityEndDate: {
          "@id": "gs1:regulatoryReferenceApplicabilityEndDate",
          "@type": "xsd:date"
        },
        applicableProducts: {
          "@id": "gs1:applicableProducts",
          "@type": "@id"
        },
        applicableTransactions: {
          "@id": "gs1:applicableTransactions",
          "@type": "@id"
        },
        transactionID: "gs1:transactionID",
        transactionType: {
          "@id": "gs1:transactionType",
          "@type": "@vocab",
          "@context": {
            AAK: "gs1:TransactionType-AAK",
            AID: "gs1:TransactionType-AID",
            ALO: "gs1:TransactionType-ALO",
            AUJ: "gs1:TransactionType-AUJ",
            AXO: "gs1:TransactionType-AXO",
            BM: "gs1:TransactionType-BM",
            BN: "gs1:TransactionType-BN",
            IV: "gs1:TransactionType-IV",
            MH: "gs1:TransactionType-MH",
            ON: "gs1:TransactionType-ON",
            VN: "gs1:TransactionType-VN"
          }
        },
        transactionDate: {
          "@id": "gs1:transactionDate",
          "@type": "xsd:date"
        },
        messageSender: {
          "@id": "gs1:messageSender",
          "@type": "@id"
        },
        messageRecipient: {
          "@id": "gs1:messageRecipient",
          "@type": "@id"
        },
        hasBatchLotNumber: "gs1:hasBatchLotNumber",
        hasSerialNumber: "gs1:hasSerialNumber",
        geo: {
          "@id": "gs1:geo",
          "@type": "@id"
        },
        polygon: "gs1:polygon",
        countryOfOrigin: {
          "@id": "gs1:countryOfOrigin",
          "@type": "@id"
        },
        Operator: "eudr:Operator",
        Producer: "eudr:Producer",
        Trader: "eudr:Trader",
        DownstreamOperator: "eudr:DownstreamOperator",
        commodityType: {
          "@id": "eudr:commodityType",
          "@type": "@vocab",
          "@context": {
            Cattle: "eudr:Cattle",
            Cocoa: "eudr:Cocoa",
            Coffee: "eudr:Coffee",
            OilPalm: "eudr:OilPalm",
            Rubber: "eudr:Rubber",
            Soya: "eudr:Soya",
            Wood: "eudr:Wood"
          }
        },
        timberProductType: {
          "@id": "eudr:timberProductType",
          "@type": "@vocab",
          "@context": {
            RoundWood: "eudr:RoundWood",
            SawnWood: "eudr:SawnWood",
            Plywood: "eudr:Plywood",
            Veneer: "eudr:Veneer",
            WoodPellets: "eudr:WoodPellets",
            WoodChips: "eudr:WoodChips",
            Pulp: "eudr:Pulp",
            Paper: "eudr:Paper",
            Furniture: "eudr:Furniture",
            Charcoal: "eudr:Charcoal",
            PrintedMatter: "eudr:PrintedMatter"
          }
        },
        riskLevel: {
          "@id": "eudr:riskLevel",
          "@type": "@vocab",
          "@context": {
            Negligible: "eudr:Negligible",
            Low: "eudr:Low",
            Standard: "eudr:Standard",
            High: "eudr:High"
          }
        },
        countryRiskCategory: {
          "@id": "eudr:countryRiskCategory",
          "@type": "@vocab",
          "@context": {
            Negligible: "eudr:Negligible",
            Low: "eudr:Low",
            Standard: "eudr:Standard",
            High: "eudr:High"
          }
        },
        speciesScientificName: "eudr:speciesScientificName",
        speciesCommonName: "eudr:speciesCommonName",
        additionalOrganizationID: {
          "@id": "eudr:additionalOrganizationID",
          "@type": "@id"
        },
        organizationID: "eudr:organizationID",
        organizationID_Type: "eudr:organizationIDType",
        certification: {
          "@id": "gs1:certification",
          "@type": "@id",
          "@container": "@set"
        },
        certificationAgency: "gs1:certificationAgency",
        certificationStandard: "gs1:certificationStandard",
        certificationURI: {
          "@id": "gs1:certificationURI",
          "@type": "@id"
        },
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
        },
        transformationLocation: {
          "@id": "eudr:transformationLocation",
          "@type": "@id"
        },
        derivedFrom: {
          "@id": "eudr:derivedFrom",
          "@type": "@id",
          "@container": "@set"
        },
        originDetails: {
          "@id": "eudr:originDetails",
          "@type": "@id"
        },
        originList: {
          "@id": "eudr:originList",
          "@type": "@id",
          "@container": "@set"
        },
        countryList: {
          "@id": "eudr:countryList",
          "@container": "@set"
        },
        countryCode: "gs1:countryCode",
        geofence: "eudr:geofence",
        geolocation: "eudr:geolocation",
        areaSize: {
          "@id": "eudr:areaSize",
          "@type": "@id"
        },
        producerIdentification: {
          "@id": "eudr:producerIdentification",
          "@type": "@id"
        },
        unitCode: "gs1:unitCode",
        value: {
          "@id": "gs1:value",
          "@type": "xsd:decimal"
        },
        deforestationFreeDate: {
          "@id": "eudr:deforestationFreeDate",
          "@type": "xsd:date"
        },
        legallyHarvested: {
          "@id": "eudr:legallyHarvested",
          "@type": "xsd:boolean"
        },
        verificationMethod: "eudr:verificationMethod",
        landUseHistory: "eudr:landUseHistory",
        forestManagementUnit: "eudr:forestManagementUnit",
        fscCertification: {
          "@id": "eudr:fscCertification",
          "@type": "@id"
        },
        harvestDate: {
          "@id": "gs1:harvestDate",
          "@type": "xsd:date"
        },
        harvestDateStart: {
          "@id": "gs1:harvestDateStart",
          "@type": "xsd:date"
        },
        harvestDateEnd: {
          "@id": "gs1:harvestDateEnd",
          "@type": "xsd:date"
        },
        transformationDate: {
          "@id": "eudr:transformationDate",
          "@type": "xsd:date"
        },
        volumeCubicMeters: {
          "@id": "eudr:volumeCubicMeters",
          "@type": "xsd:decimal"
        },
        areaHectares: {
          "@id": "eudr:areaHectares",
          "@type": "xsd:decimal"
        },
        dueDiligenceStatement: {
          "@id": "eudr:dueDiligenceStatement",
          "@type": "@id"
        },
        euisReferenceNumber: "gs1:regulatoryReferenceNumber",
        statementDate: {
          "@id": "eudr:statementDate",
          "@type": "xsd:date"
        },
        riskAssessment: {
          "@id": "eudr:riskAssessment",
          "@type": "@id"
        },
        riskAssessmentDate: {
          "@id": "eudr:riskAssessmentDate",
          "@type": "xsd:date"
        },
        mitigationMeasures: "eudr:mitigationMeasures",
        ExemptionType: "eudr:ExemptionType",
        ExemptionDeclaration: "eudr:ExemptionDeclaration",
        PermanentExemption: "eudr:PermanentExemption",
        TemporaryExemption: "eudr:TemporaryExemption",
        exemptionDeclaration: {
          "@id": "eudr:exemptionDeclaration",
          "@type": "@id"
        },
        exemptionType: {
          "@id": "eudr:exemptionType",
          "@type": "@vocab",
          "@context": {
            PermanentExemption: "eudr:PermanentExemption",
            TemporaryExemption: "eudr:TemporaryExemption"
          }
        },
        exemptionReasonCode: "eudr:exemptionReasonCode",
        exemptionScope: "eudr:exemptionScope",
        exemptionScopeReference: "eudr:exemptionScopeReference",
        exemptionEffectiveFrom: {
          "@id": "eudr:exemptionEffectiveFrom",
          "@type": "xsd:date"
        },
        exemptionEffectiveUntil: {
          "@id": "eudr:exemptionEffectiveUntil",
          "@type": "xsd:date"
        },
        exemptionAuthority: {
          "@id": "eudr:exemptionAuthority",
          "@type": "@id"
        }
      }
    ]
  },
  "https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld": {
    _comment: "OpenEPCIS PPWR Vocabulary v0.1.0, EU Regulation 2025/40. Module is intentionally thin; nearly every PPWR data point reuses the lifted dpp: cross-cutting terms (ExtendedProducerResponsibility, Compostability, Biodegradability, DepositReturnScheme, bioBasedFraction, RecycledContent, HazardousSubstance) plus untp: (Facility, Material, Claim) and gs1: (Packaging, regulatoryInformation). Only packaging-specific terms (Packaging, packagingTier, recyclabilityGrade, harmonisedSymbol) live in the ppwr: namespace.",
    "@context": [
      "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
      {
        "@version": 1.1,
        ppwr: "https://ref.openepcis.io/extensions/eu/ppwr/",
        dpp: "https://ref.openepcis.io/extensions/common/core/",
        gs1: "https://ref.gs1.org/voc/",
        schema: "https://schema.org/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        id: "@id",
        type: "@type",
        manufacturer: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        regulatoryInformation: {
          "@id": "gs1:regulatoryInformation",
          "@type": "@id",
          "@container": "@set"
        },
        RegulatoryInformation: "gs1:RegulatoryInformation",
        regulationType: {
          "@id": "gs1:regulationType",
          "@type": "@id"
        },
        regulatoryAct: "gs1:regulatoryAct",
        isRegulationCompliant: {
          "@id": "dpp:isRegulationCompliant",
          "@type": "xsd:boolean"
        },
        Packaging: "ppwr:Packaging",
        packagingTier: {
          "@id": "ppwr:packagingTier",
          "@type": "@vocab",
          "@context": {
            Sales: "ppwr:Sales",
            Grouped: "ppwr:Grouped",
            Transport: "ppwr:Transport"
          }
        },
        recyclabilityGrade: {
          "@id": "ppwr:recyclabilityGrade",
          "@type": "@vocab",
          "@context": {
            A: "ppwr:GradeA",
            B: "ppwr:GradeB",
            C: "ppwr:GradeC"
          }
        },
        harmonisedSymbol: {
          "@id": "ppwr:harmonisedSymbol",
          "@type": "xsd:anyURI"
        }
      }
    ]
  },
  "https://ref.openepcis.io/extensions/eu/cpr/cpr-context.jsonld": {
    _comment: "OpenEPCIS CPR Vocabulary v0.1.0, EU Construction Products Regulation 2024/3110. Module is intentionally thin; nearly every cross-cutting CPR data point reuses the lifted dpp: vocabulary plus untp: and gs1:. Only construction-specific terms (ConstructionProduct, declarationOfPerformanceUrl, essentialCharacteristic, reactionToFireClass, constructionProductType) live in the cpr: namespace.",
    "@context": [
      "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
      {
        "@version": 1.1,
        cpr: "https://ref.openepcis.io/extensions/eu/cpr/",
        dpp: "https://ref.openepcis.io/extensions/common/core/",
        gs1: "https://ref.gs1.org/voc/",
        schema: "https://schema.org/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        id: "@id",
        type: "@type",
        manufacturer: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        regulatoryInformation: {
          "@id": "gs1:regulatoryInformation",
          "@type": "@id",
          "@container": "@set"
        },
        RegulatoryInformation: "gs1:RegulatoryInformation",
        regulationType: {
          "@id": "gs1:regulationType",
          "@type": "@id"
        },
        regulatoryAct: "gs1:regulatoryAct",
        isRegulationCompliant: {
          "@id": "dpp:isRegulationCompliant",
          "@type": "xsd:boolean"
        },
        ConstructionProduct: "cpr:ConstructionProduct",
        constructionProductType: {
          "@id": "cpr:constructionProductType",
          "@type": "@vocab",
          "@context": {
            Cement: "cpr:Cement",
            Aggregate: "cpr:Aggregate",
            Insulation: "cpr:Insulation",
            WindowAndDoor: "cpr:WindowAndDoor",
            Membrane: "cpr:Membrane",
            StructuralTimber: "cpr:StructuralTimber",
            Reinforcement: "cpr:Reinforcement",
            Mortar: "cpr:Mortar",
            Concrete: "cpr:Concrete",
            CladdingPanel: "cpr:CladdingPanel",
            OtherConstructionProduct: "cpr:OtherConstructionProduct"
          }
        },
        reactionToFireClass: {
          "@id": "cpr:reactionToFireClass",
          "@type": "@vocab",
          "@context": {
            A1: "cpr:FireClassA1",
            A2: "cpr:FireClassA2",
            B: "cpr:FireClassB",
            C: "cpr:FireClassC",
            D: "cpr:FireClassD",
            E: "cpr:FireClassE",
            F: "cpr:FireClassF"
          }
        },
        declarationOfPerformanceUrl: {
          "@id": "cpr:declarationOfPerformanceUrl",
          "@type": "xsd:anyURI"
        },
        EssentialCharacteristic: "cpr:EssentialCharacteristic",
        essentialCharacteristic: {
          "@id": "cpr:essentialCharacteristic",
          "@type": "@id",
          "@container": "@set"
        },
        characteristicName: "cpr:characteristicName",
        characteristicValue: {
          "@id": "cpr:characteristicValue",
          "@type": "@id"
        },
        harmonisedStandard: {
          "@id": "cpr:harmonisedStandard",
          "@type": "xsd:anyURI"
        }
      }
    ]
  },
  "https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld": {
    "@context": [
      "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
      {
        "@version": 1.1,
        detergent: "https://ref.openepcis.io/extensions/eu/detergent/",
        dpp: "https://ref.openepcis.io/extensions/common/core/",
        gs1: "https://ref.gs1.org/voc/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        id: "@id",
        type: "@type",
        DetergentProduct: "detergent:DetergentProduct",
        Ingredient: "detergent:Ingredient",
        SurfactantBiodegradability: "detergent:SurfactantBiodegradability",
        MicroorganismInfo: "detergent:MicroorganismInfo",
        FragranceAllergen: "detergent:FragranceAllergen",
        Product: "gs1:Product",
        Organization: "gs1:Organization",
        PostalAddress: "gs1:PostalAddress",
        QuantitativeValue: "gs1:QuantitativeValue",
        HazardousSubstance: "dpp:HazardousSubstance",
        DocumentReference: "dpp:DocumentReference",
        OperatorInformation: "dpp:OperatorInformation",
        casNumber: "dpp:casNumber",
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
        productName: "gs1:productName",
        gtin: "gs1:gtin",
        organizationName: "gs1:organizationName",
        partyGLN: "gs1:partyGLN",
        gln: "gs1:gln",
        manufacturer: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        address: {
          "@id": "gs1:address",
          "@type": "@id"
        },
        streetAddress: "gs1:streetAddress",
        addressLocality: "gs1:addressLocality",
        postalCode: "gs1:postalCode",
        addressCountry: "gs1:addressCountry",
        countryOfOrigin: {
          "@id": "gs1:countryOfOrigin",
          "@type": "@id"
        },
        netWeight: {
          "@id": "gs1:netWeight",
          "@type": "@id"
        },
        netContent: {
          "@id": "gs1:netContent",
          "@type": "@id"
        },
        detergentCategory: {
          "@id": "schema:category",
          "@type": "@vocab",
          "@context": {
            LaundryDetergent: "detergent:LaundryDetergent",
            DishwasherDetergent: "detergent:DishwasherDetergent",
            HandDishwashingDetergent: "detergent:HandDishwashingDetergent",
            AllPurposeCleaner: "detergent:AllPurposeCleaner",
            IndustrialDetergent: "detergent:IndustrialDetergent",
            InstitutionalDetergent: "detergent:InstitutionalDetergent",
            Surfactant: "detergent:Surfactant"
          }
        },
        productForm: {
          "@id": "detergent:productForm",
          "@type": "@vocab",
          "@context": {
            Liquid: "detergent:Liquid",
            Powder: "detergent:Powder",
            Gel: "detergent:Gel",
            Capsule: "detergent:Capsule",
            Tablet: "detergent:Tablet",
            Sheet: "detergent:Sheet",
            Paste: "detergent:Paste",
            Spray: "detergent:Spray"
          }
        },
        signalWord: {
          "@id": "detergent:signalWord",
          "@type": "@vocab",
          "@context": {
            Danger: "detergent:Danger",
            Warning: "detergent:Warning"
          }
        },
        ingredientFunction: {
          "@id": "detergent:ingredientFunction",
          "@type": "@vocab",
          "@context": {
            SurfactantFunction: "detergent:SurfactantFunction",
            Builder: "detergent:Builder",
            Bleach: "detergent:Bleach",
            Enzyme: "detergent:Enzyme",
            Preservative: "detergent:Preservative",
            Fragrance: "detergent:Fragrance",
            Colorant: "detergent:Colorant",
            Solvent: "detergent:Solvent",
            pHAdjuster: "detergent:pHAdjuster",
            Thickener: "detergent:Thickener",
            FoamRegulator: "detergent:FoamRegulator",
            AntiRedeposition: "detergent:AntiRedeposition",
            Filler: "detergent:Filler"
          }
        },
        surfactantType: {
          "@id": "detergent:surfactantType",
          "@type": "@vocab",
          "@context": {
            Anionic: "detergent:Anionic",
            NonIonic: "detergent:NonIonic",
            Cationic: "detergent:Cationic",
            Amphoteric: "detergent:Amphoteric"
          }
        },
        testMethod: {
          "@id": "detergent:testMethod",
          "@type": "@vocab",
          "@context": {
            ISO14593: "detergent:ISO14593",
            OECD301B: "detergent:OECD301B",
            OECD301D: "detergent:OECD301D",
            OECD301F: "detergent:OECD301F",
            OECD310: "detergent:OECD310"
          }
        },
        intendedUse: "detergent:intendedUse",
        ingredientList: {
          "@id": "detergent:ingredientList",
          "@type": "@id",
          "@container": "@set"
        },
        surfactantBiodegradability: {
          "@id": "detergent:surfactantBiodegradability",
          "@type": "@id",
          "@container": "@set"
        },
        fragranceAllergens: {
          "@id": "detergent:fragranceAllergens",
          "@type": "@id",
          "@container": "@set"
        },
        microorganisms: {
          "@id": "detergent:microorganisms",
          "@type": "@id",
          "@container": "@set"
        },
        hazardousSubstances: {
          "@id": "detergent:hazardousSubstances",
          "@type": "@id",
          "@container": "@set"
        },
        hazardPictograms: {
          "@id": "detergent:hazardPictograms",
          "@container": "@set"
        },
        hStatements: {
          "@id": "detergent:hStatements",
          "@container": "@set"
        },
        pStatements: {
          "@id": "detergent:pStatements",
          "@container": "@set"
        },
        phosphorusContentPercent: {
          "@id": "detergent:phosphorusContentPercent",
          "@type": "xsd:decimal"
        },
        phosphateCompliant: {
          "@id": "detergent:phosphateCompliant",
          "@type": "xsd:boolean"
        },
        filmBiodegradable: {
          "@id": "detergent:filmBiodegradable",
          "@type": "xsd:boolean"
        },
        filmBiodegradabilityPercentage: {
          "@id": "detergent:filmBiodegradabilityPercentage",
          "@type": "xsd:decimal"
        },
        recommendedDosage: {
          "@id": "detergent:recommendedDosage",
          "@type": "@id"
        },
        dosageInstructions: "detergent:dosageInstructions",
        safetyDataSheet: {
          "@id": "detergent:safetyDataSheet",
          "@type": "@id"
        },
        biodegradabilityTestReport: {
          "@id": "detergent:biodegradabilityTestReport",
          "@type": "@id"
        },
        inciName: "schema:name",
        weightPercentRange: "detergent:weightPercentRange",
        isSurfactant: {
          "@id": "detergent:isSurfactant",
          "@type": "xsd:boolean"
        },
        biodegradationPercentage: {
          "@id": "detergent:biodegradationPercentage",
          "@type": "xsd:decimal"
        },
        testDurationDays: {
          "@id": "detergent:testDurationDays",
          "@type": "xsd:integer"
        },
        passesUltimateBiodegradability: {
          "@id": "detergent:passesUltimateBiodegradability",
          "@type": "xsd:boolean"
        },
        allergenName: "gs1:allergenSpecificationName",
        allergenCasNumber: "detergent:allergenCasNumber",
        allergenConcentration: {
          "@id": "detergent:allergenConcentration",
          "@type": "xsd:decimal"
        },
        speciesName: "schema:name",
        strainDesignation: "detergent:strainDesignation",
        endProductCharacteristics: "detergent:endProductCharacteristics",
        value: {
          "@id": "gs1:value",
          "@type": "xsd:decimal"
        },
        unitCode: "gs1:unitCode"
      }
    ]
  },
  "https://ref.openepcis.io/extensions/us/fsma204/fsma204-context.jsonld": {
    "@context": [
      "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
      {
        "@version": 1.1,
        fsma: "https://ref.openepcis.io/extensions/us/fsma204/",
        gs1: "https://ref.gs1.org/voc/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        id: "@id",
        type: "@type",
        FoodTraceabilityList: "fsma:FoodTraceabilityList",
        Product: "gs1:Product",
        Organization: "gs1:Organization",
        Country: "gs1:Country",
        gtin: "gs1:gtin",
        partyGLN: "gs1:partyGLN",
        organizationName: "gs1:organizationName",
        manufacturer: {
          "@id": "gs1:manufacturer",
          "@type": "@id"
        },
        netWeight: {
          "@id": "gs1:netWeight",
          "@type": "@id"
        },
        countryOfOrigin: {
          "@id": "gs1:countryOfOrigin",
          "@type": "@id"
        },
        functionalName: "gs1:functionalName",
        importClassificationTypeCode: "gs1:importClassificationTypeCode",
        importClassificationValue: "gs1:importClassificationValue",
        gpcCategoryCode: "gs1:gpcCategoryCode",
        foodTraceabilityListCategory: {
          "@id": "fsma:foodTraceabilityListCategory",
          "@type": "@vocab",
          "@context": {
            LeafyGreens: "fsma:LeafyGreens",
            LeafyGreensFreshCut: "fsma:LeafyGreensFreshCut",
            CheesePasteurizedFreshSoft: "fsma:CheesePasteurizedFreshSoft",
            CheesePasteurizedSoftRipenedOrSemiSoft: "fsma:CheesePasteurizedSoftRipenedOrSemiSoft",
            CheeseUnpasteurizedOtherThanHard: "fsma:CheeseUnpasteurizedOtherThanHard",
            ShellEggs: "fsma:ShellEggs",
            Sprouts: "fsma:Sprouts",
            Cucumbers: "fsma:Cucumbers",
            Melons: "fsma:Melons",
            Peppers: "fsma:Peppers",
            Tomatoes: "fsma:Tomatoes",
            FruitsFreshCut: "fsma:FruitsFreshCut",
            VegetablesOtherThanLeafyGreensFreshCut: "fsma:VegetablesOtherThanLeafyGreensFreshCut",
            HerbsFresh: "fsma:HerbsFresh",
            TropicalTreeFruits: "fsma:TropicalTreeFruits",
            FinfishHistamineProducing: "fsma:FinfishHistamineProducing",
            FinfishCiguatoxinAssociated: "fsma:FinfishCiguatoxinAssociated",
            FinfishOther: "fsma:FinfishOther",
            SmokedFinfish: "fsma:SmokedFinfish",
            Crustaceans: "fsma:Crustaceans",
            MolluscanShellfish: "fsma:MolluscanShellfish",
            ReadyToEatDeliSalads: "fsma:ReadyToEatDeliSalads",
            NutButters: "fsma:NutButters"
          }
        }
      }
    ]
  }
};

// demos/en18223-converter/samples.json
var samples_default = [
  {
    group: "EU Battery",
    label: "battery-product (item)",
    doc: {
      _comment_gs1_alignment: [
        "This example demonstrates GS1-aligned Digital Product Passport modeling.",
        "Key GS1 patterns used:",
        "- GS1 Digital Link URI for product identification (https://id.dev.epcis.cloud/01/{GTIN}/21/{serial})",
        "- Product as base type with battery:Battery extension",
        "- GS1 properties: gtin, productName, manufacturer, netWeight, gs1:warranty",
        "- QuantitativeValue for all measurements with unitCode",
        "- gs1:regulatoryInformation for compliance with gs1:RegulationTypeCode-BATTERY_DIRECTIVE",
        "- gs1:referencedFile for documents",
        "- Battery-specific extensions only where GS1 Web Vocabulary lacks equivalent terms",
        "See EXTENSION-GOVERNANCE.md for rationale on each extension term."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld",
        {
          gs1: "https://ref.gs1.org/voc/",
          xsd: "http://www.w3.org/2001/XMLSchema#"
        }
      ],
      id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001",
      type: [
        "Product",
        "Battery"
      ],
      gtin: "09521002005004",
      "gs1:serialNumber": "BAT2024-001",
      productName: [
        {
          "@value": "EcoCell Industrial Battery Module IM-500",
          "@language": "en"
        },
        {
          "@value": "EcoCell Industrie-Batteriemodul IM-500",
          "@language": "de"
        },
        {
          "@value": "Module de batterie industrielle EcoCell IM-500",
          "@language": "fr"
        },
        {
          "@value": "M\xF3dulo de bater\xEDa industrial EcoCell IM-500",
          "@language": "es"
        },
        {
          "@value": "EcoCell industri\xEBle batterijmodule IM-500",
          "@language": "nl"
        },
        {
          "@value": "EcoCell industribatterimodul IM-500",
          "@language": "da"
        },
        {
          "@value": "Przemys\u0142owy modu\u0142 akumulatora EcoCell IM-500",
          "@language": "pl"
        },
        {
          "@value": "EcoCell industribatterimodul IM-500",
          "@language": "sv"
        },
        {
          "@value": "EcoCell industribatterimodul IM-500",
          "@language": "no"
        },
        {
          "@value": "EcoCell teollisuusakkumoduuli IM-500",
          "@language": "fi"
        },
        {
          "@value": "Modulo batteria industriale EcoCell IM-500",
          "@language": "it"
        }
      ],
      "gs1:productDescription": [
        {
          "@value": "High-capacity lithium iron phosphate battery module for industrial energy storage. Designed for long cycle life and safety.",
          "@language": "en"
        },
        {
          "@value": "Hochkapazit\xE4ts-LFP-Batteriemodul f\xFCr industrielle Energiespeicherung. Entwickelt f\xFCr lange Zyklenlebensdauer und Sicherheit.",
          "@language": "de"
        },
        {
          "@value": "Module de batterie LFP haute capacit\xE9 pour le stockage d'\xE9nergie industriel. Con\xE7u pour une longue dur\xE9e de vie cyclique et la s\xE9curit\xE9.",
          "@language": "fr"
        },
        {
          "@value": "M\xF3dulo de bater\xEDa LFP de alta capacidad para almacenamiento energ\xE9tico industrial. Dise\xF1ado para una larga vida \xFAtil de ciclos y seguridad.",
          "@language": "es"
        },
        {
          "@value": "Lithium-ijzerfosfaat-batterijmodule met hoge capaciteit voor industri\xEBle energieopslag. Ontworpen voor een lange cyclusduur en veiligheid.",
          "@language": "nl"
        },
        {
          "@value": "LFP-batterimodul med h\xF8j kapacitet til industriel energilagring. Designet til lang cyklus-levetid og sikkerhed.",
          "@language": "da"
        },
        {
          "@value": "Modu\u0142 akumulatora litowo-\u017Celazowo-fosforanowego (LFP) o du\u017Cej pojemno\u015Bci do magazynowania energii w przemy\u015Ble. Zaprojektowany z my\u015Bl\u0105 o d\u0142ugiej \u017Cywotno\u015Bci cyklicznej i bezpiecze\u0144stwie.",
          "@language": "pl"
        },
        {
          "@value": "LFP-batterimodul med h\xF6g kapacitet f\xF6r industriell energilagring. Konstruerad f\xF6r l\xE5ng cykellivsl\xE4ngd och s\xE4kerhet.",
          "@language": "sv"
        },
        {
          "@value": "LFP-batterimodul med h\xF8y kapasitet for industriell energilagring. Designet for lang syklus-levetid og sikkerhet.",
          "@language": "no"
        },
        {
          "@value": "Suurkapasiteettinen LFP-akkumoduuli teolliseen energiavarastointiin. Suunniteltu pitk\xE4n k\xE4ytt\xF6i\xE4n ja turvallisuuden ehdoilla.",
          "@language": "fi"
        },
        {
          "@value": "Modulo batteria LFP ad alta capacit\xE0 per lo stoccaggio energetico industriale. Progettato per una lunga durata ciclica e sicurezza.",
          "@language": "it"
        }
      ],
      batteryCategory: "IndustrialBattery",
      _comment_classification: "Alternative GS1 pattern for battery category using gs1:additionalProductClassification",
      "gs1:additionalProductClassification": {
        type: "gs1:AdditionalProductClassificationDetails",
        "gs1:additionalProductClassificationCode": "industrial",
        "gs1:additionalProductClassificationCodeDescription": {
          "@value": "Industrial Battery - Battery designed for industrial applications with capacity > 2 kWh",
          "@language": "en"
        },
        "gs1:additionalProductClassificationSystemCode": "BATTERY_REGULATION_2023_1542"
      },
      batteryStatus: "Original",
      batteryModel: {
        "@value": "IM-500",
        "@language": "en"
      },
      cellType: "PrismaticCell",
      numberOfCells: 16,
      numberOfModules: 1,
      manufacturer: {
        id: "https://id.dev.epcis.cloud/417/9521234000006",
        type: "Organization",
        "gs1:organizationName": "EcoCell GmbH",
        "gs1:gln": "9521234000006",
        "gs1:address": {
          id: "https://id.dev.epcis.cloud/417/9521234000006#address",
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Batteriestra\xDFe 42",
          "gs1:addressLocality": "Stuttgart",
          "gs1:postalCode": "70173",
          "gs1:countryCode": "DE"
        },
        "gs1:contactPoint": {
          type: "gs1:ContactPoint",
          "gs1:email": "info@ecocell-batteries.example.com",
          "gs1:url": {
            id: "https://www.ecocell-batteries.example.com"
          }
        }
      },
      manufacturingPlace: {
        id: "https://id.dev.epcis.cloud/414/9521234000013",
        type: "gs1:Place",
        "gs1:gln": "9521234000013",
        "gs1:address": {
          type: "gs1:PostalAddress",
          "gs1:addressLocality": "Stuttgart",
          "gs1:countryCode": "DE"
        }
      },
      operatorInformation: {
        id: "https://id.dev.epcis.cloud/417/9521234000006#operator",
        type: "dpp:OperatorInformation",
        "gs1:gln": "9521234000006",
        "gs1:organizationName": "EcoCell GmbH",
        operatorRole: "Manufacturer",
        "gs1:address": {
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Batteriestra\xDFe 42",
          "gs1:addressLocality": "Stuttgart",
          "gs1:postalCode": "70173",
          "gs1:countryCode": "DE"
        },
        "gs1:contactPoint": {
          type: "gs1:ContactPoint",
          "gs1:email": "compliance@ecocell-batteries.example.com",
          "gs1:telephone": "+49-711-555-0100"
        }
      },
      countryOfOrigin: "DE",
      manufacturingDate: "2024-03-15",
      netWeight: {
        type: "QuantitativeValue",
        value: 125.5,
        unitCode: "KGM"
      },
      grossWeight: {
        type: "QuantitativeValue",
        value: 132,
        unitCode: "KGM"
      },
      batteryChemistry: {
        id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#chemistry",
        type: "BatteryChemistry",
        shortName: "LFP",
        fullName: {
          "@value": "Lithium Iron Phosphate",
          "@language": "en"
        },
        cathodeActiveMaterial: "LiFePO4",
        anodeActiveMaterial: "Graphite",
        electrolyteType: {
          "@value": "Liquid organic carbonate-based",
          "@language": "en"
        }
      },
      technicalSpecifications: {
        id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#specs",
        type: "TechnicalSpecification",
        ratedCapacity: {
          type: "QuantitativeValue",
          value: 280,
          unitCode: "AMH"
        },
        ratedEnergy: {
          type: "QuantitativeValue",
          value: 14.3,
          unitCode: "KWH"
        },
        nominalVoltage: {
          type: "QuantitativeValue",
          value: 51.2,
          unitCode: "VLT"
        },
        minimumVoltage: {
          type: "QuantitativeValue",
          value: 40,
          unitCode: "VLT"
        },
        maximumVoltage: {
          type: "QuantitativeValue",
          value: 58.4,
          unitCode: "VLT"
        },
        ratedMaximumPower: {
          type: "QuantitativeValue",
          value: 7.5,
          unitCode: "KWT"
        },
        maximumChargingPower: {
          type: "QuantitativeValue",
          value: 7.5,
          unitCode: "KWT"
        },
        maximumDischargingPower: {
          type: "QuantitativeValue",
          value: 7.5,
          unitCode: "KWT"
        },
        maximumChargingCurrent: {
          type: "QuantitativeValue",
          value: 140,
          unitCode: "AMP"
        },
        maximumDischargingCurrent: {
          type: "QuantitativeValue",
          value: 140,
          unitCode: "AMP"
        },
        originalPowerCapability: [
          {
            id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#power-80",
            type: "PowerCapabilityAtSoC",
            stateOfChargeLevel: 80,
            powerCapability: {
              type: "QuantitativeValue",
              value: 7.2,
              unitCode: "KWT"
            }
          },
          {
            id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#power-20",
            type: "PowerCapabilityAtSoC",
            stateOfChargeLevel: 20,
            powerCapability: {
              type: "QuantitativeValue",
              value: 6.8,
              unitCode: "KWT"
            }
          }
        ],
        initialInternalResistance: {
          type: "QuantitativeValue",
          value: 2.1,
          unitCode: "OHM"
        },
        initialSelfDischarge: 1.5,
        expectedCycleLife: 6e3,
        expectedLifetimeYears: 15,
        expectedLifetimeEnergyThroughput: {
          type: "QuantitativeValue",
          value: 85800,
          unitCode: "KWH"
        },
        expectedLifetimeCapacityThroughput: {
          type: "QuantitativeValue",
          value: 168e4,
          unitCode: "AMH"
        },
        depthOfDischargeInCycleLifeTest: 80,
        capacityFadeThreshold: 20,
        resistanceIncreaseThreshold: 50,
        roundTripEfficiency: 96,
        capacityThresholdForExhaustion: 70,
        lifetimeReferenceTest: "https://www.iec.ch/standards/62660-1",
        powerCapabilityRatio: 0.52,
        cRate: 0.5,
        cRateLifeCycleTest: 0.33,
        roundTripEfficiencyAt50PercentCycleLife: 94,
        temperatureRangeStorage: {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#temp-storage",
          type: "TemperatureRange",
          minimumTemperature: {
            type: "QuantitativeValue",
            value: -20,
            unitCode: "CEL"
          },
          maximumTemperature: {
            type: "QuantitativeValue",
            value: 45,
            unitCode: "CEL"
          }
        },
        temperatureRangeCharging: {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#temp-charging",
          type: "TemperatureRange",
          minimumTemperature: {
            type: "QuantitativeValue",
            value: 0,
            unitCode: "CEL"
          },
          maximumTemperature: {
            type: "QuantitativeValue",
            value: 45,
            unitCode: "CEL"
          }
        },
        temperatureRangeDischarging: {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#temp-discharging",
          type: "TemperatureRange",
          minimumTemperature: {
            type: "QuantitativeValue",
            value: -20,
            unitCode: "CEL"
          },
          maximumTemperature: {
            type: "QuantitativeValue",
            value: 55,
            unitCode: "CEL"
          }
        },
        temperatureRangeIdleState: {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#temp-idle",
          type: "TemperatureRange",
          minimumTemperature: {
            type: "QuantitativeValue",
            value: -30,
            unitCode: "CEL"
          },
          maximumTemperature: {
            type: "QuantitativeValue",
            value: 60,
            unitCode: "CEL"
          }
        }
      },
      materialComposition: [
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#mat-li",
          type: "BatteryMaterial",
          materialName: {
            "@value": "Lithium",
            "@language": "en"
          },
          casNumber: "7439-93-2",
          ecNumber: "231-102-5",
          componentLocation: "Cathode",
          materialCategory: "ActiveMaterial",
          massPercentage: 4.2,
          isCriticalRawMaterial: true,
          isSubstanceOfConcern: false,
          materialSourceCountry: "CL"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#mat-fe",
          type: "BatteryMaterial",
          materialName: {
            "@value": "Iron",
            "@language": "en"
          },
          casNumber: "7439-89-6",
          ecNumber: "231-096-4",
          componentLocation: "Cathode",
          materialCategory: "ActiveMaterial",
          massPercentage: 21.5,
          isCriticalRawMaterial: false,
          isSubstanceOfConcern: false
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#mat-c",
          type: "BatteryMaterial",
          materialName: {
            "@value": "Graphite",
            "@language": "en"
          },
          casNumber: "7782-42-5",
          ecNumber: "231-955-3",
          componentLocation: "Anode",
          materialCategory: "ActiveMaterial",
          massPercentage: 18.3,
          isCriticalRawMaterial: true,
          isSubstanceOfConcern: false,
          renewableContentShare: 0
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#mat-p",
          type: "BatteryMaterial",
          materialName: {
            "@value": "Phosphorus",
            "@language": "en"
          },
          casNumber: "7723-14-0",
          ecNumber: "231-768-7",
          componentLocation: "Cathode",
          materialCategory: "ActiveMaterial",
          massPercentage: 9.8,
          isCriticalRawMaterial: true,
          isSubstanceOfConcern: false
        }
      ],
      hazardousSubstances: [
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#haz-electrolyte",
          type: "HazardousSubstance",
          substanceName: {
            "@value": "Lithium hexafluorophosphate (LiPF6)",
            "@language": "en"
          },
          substanceCasNumber: "21324-40-3",
          substanceEcNumber: "244-334-7",
          hazardClass: "AcuteToxicity",
          concentration: 12.5,
          hazardImpact: {
            "@value": "Toxic if swallowed; causes skin irritation; causes serious eye damage",
            "@language": "en"
          },
          substanceLocation: "Electrolyte"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#haz-solvent",
          type: "HazardousSubstance",
          substanceName: {
            "@value": "Ethylene carbonate",
            "@language": "en"
          },
          substanceCasNumber: "96-49-1",
          substanceEcNumber: "202-510-0",
          hazardClass: "EyeDamageOrIrritation",
          concentration: 8.2,
          hazardImpact: {
            "@value": "Causes serious eye irritation",
            "@language": "en"
          },
          substanceLocation: "Electrolyte"
        }
      ],
      recycledContent: {
        id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#recycled",
        type: "RecycledContent",
        lithiumRecycledShare: 12,
        lithiumPreConsumerShare: 5,
        lithiumPostConsumerShare: 7,
        cobaltRecycledShare: 0,
        cobaltPreConsumerShare: 0,
        cobaltPostConsumerShare: 0,
        nickelRecycledShare: 0,
        nickelPreConsumerShare: 0,
        nickelPostConsumerShare: 0,
        leadRecycledShare: 0,
        leadPreConsumerShare: 0,
        leadPostConsumerShare: 0
      },
      carbonFootprintDeclaration: {
        id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#cfp",
        type: "CarbonFootprintDeclaration",
        carbonFootprintTotal: {
          type: "QuantitativeValue",
          value: 45.2,
          unitCode: "KGM"
        },
        carbonFootprintRawMaterialExtraction: {
          type: "QuantitativeValue",
          value: 18.5,
          unitCode: "KGM"
        },
        carbonFootprintProduction: {
          type: "QuantitativeValue",
          value: 15.3,
          unitCode: "KGM"
        },
        carbonFootprintDistribution: {
          type: "QuantitativeValue",
          value: 2.8,
          unitCode: "KGM"
        },
        carbonFootprintRecycling: {
          type: "QuantitativeValue",
          value: 8.6,
          unitCode: "KGM"
        },
        carbonFootprintPerformanceClass: "CFClassB",
        carbonFootprintStudyUrl: "https://www.ecocell-batteries.example.com/docs/IM-500-cfp-study.pdf",
        functionalUnit: "1 kWh of total energy throughput over battery lifetime",
        calculationStandard: "ISO 14067:2018",
        carbonFootprintDeclarationId: "CFP-2024-ECOCELL-IM500-001",
        carbonFootprintGeographicScope: "EU production, global material sourcing",
        thirdPartyVerification: {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#cfp-verification",
          type: "ThirdPartyVerification",
          verificationBodyName: "T\xDCV Rheinland",
          verificationDate: "2024-02-28",
          verificationCertificateUrl: "https://www.ecocell-batteries.example.com/docs/cfp-verification-cert.pdf",
          verificationStandard: "ISO 14064-3:2019"
        }
      },
      "gs1:warranty": {
        type: "gs1:WarrantyPromise",
        "gs1:durationOfWarranty": "P8Y",
        "gs1:warrantyScope": "Full replacement warranty for manufacturing defects"
      },
      warrantyConditions: "https://www.ecocell-batteries.example.com/warranty/terms",
      extendedWarrantyAvailable: true,
      serviceContactPoint: {
        type: "gs1:ContactPoint",
        "gs1:email": "service@ecocell-batteries.example.com",
        "gs1:telephone": "+49-711-555-0300",
        "gs1:url": {
          id: "https://service.ecocell-batteries.example.com"
        }
      },
      authorizedServiceCenters: "https://www.ecocell-batteries.example.com/service-centers",
      transportationSafetyClass: "UN3481",
      dangerousGoodsPackingInstructions: {
        "@value": "PI966 Section II - Lithium ion batteries packed with equipment",
        "@language": "en"
      },
      shippingName: {
        "@value": "LITHIUM ION BATTERIES PACKED WITH EQUIPMENT",
        "@language": "en"
      },
      repurposingPotential: {
        "@value": "High - suitable for stationary energy storage after EV use",
        "@language": "en"
      },
      repurposingGuidelines: "https://www.ecocell-batteries.example.com/docs/repurposing-guide.pdf",
      dataQualityAssessment: "A",
      lastDataUpdate: "2024-03-20T14:30:00Z",
      dataProviderCertification: "ISO 27001 certified data management",
      criticalRawMaterialsStatement: {
        "@value": "Contains lithium (4.2%), graphite (18.3%), and phosphorus (9.8%) which are on the EU Critical Raw Materials list.",
        "@language": "en"
      },
      ceMarkingIndicator: true,
      euDeclarationOfConformity: {
        type: "cccev:Evidence",
        euDeclarationOfConformityId: "DoC-2024-ECOCELL-IM500",
        declarationOfConformity: "https://www.ecocell-batteries.example.com/docs/IM-500-eu-doc.pdf",
        notifiedBody: {
          type: "cv:PublicOrganisation",
          notifiedBodyNumber: "0123",
          notifiedBodyName: "T\xDCV S\xDCD"
        }
      },
      resultOfTestReport: "https://www.ecocell-batteries.example.com/docs/IM-500-test-report.pdf",
      testReportNumber: "TR-2024-ECOCELL-IM500-001",
      complianceStatus: "Compliant",
      separateCollectionSymbolUrl: "https://www.ecocell-batteries.example.com/labels/weee-symbol.svg",
      cadmiumSymbolRequired: false,
      leadSymbolRequired: false,
      labels: [
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#label-weee",
          type: "Label",
          labelSubject: "SeparateCollection",
          labelSymbol: "https://www.ecocell-batteries.example.com/labels/weee-symbol.svg",
          labelMeaning: {
            "@value": "Do not dispose of with household waste. Return to designated collection points.",
            "@language": "en"
          }
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#label-cfp",
          type: "Label",
          labelSubject: "CarbonFootprintLabel",
          labelSymbol: "https://www.ecocell-batteries.example.com/labels/cfp-class-b.svg",
          labelMeaning: {
            "@value": "Carbon Footprint Performance Class B: 45.2 kg CO2e/kWh",
            "@language": "en"
          }
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#label-fire",
          type: "Label",
          labelSubject: "ExtinguishingAgentLabel",
          labelSymbol: "https://www.ecocell-batteries.example.com/labels/class-d-fire.svg",
          labelMeaning: {
            "@value": "In case of fire, use Class D fire extinguisher or dry sand. Do not use water.",
            "@language": "en"
          }
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#label-qr",
          type: "Label",
          labelSubject: "QRCodeLabel",
          labelMeaning: {
            "@value": "Scan QR code to access battery passport",
            "@language": "en"
          }
        }
      ],
      "gs1:regulatoryInformation": [
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#reg-battery",
          type: "gs1:RegulatoryInformation",
          "gs1:regulationType": {
            id: "gs1:RegulationTypeCode-BATTERY_DIRECTIVE"
          },
          "gs1:regulatoryAct": "EU 2023/1542",
          "gs1:regulatoryActStatus": "ACTIVE",
          "gs1:regulatoryPermitIdentification": "EU-TEC-2024-ECOCELL-IM500",
          "gs1:isRegulationCompliant": true
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#reg-ce",
          type: "gs1:RegulatoryInformation",
          "gs1:regulationType": {
            id: "gs1:RegulationTypeCode-CE"
          },
          "gs1:regulatoryAct": "CE Marking",
          "gs1:isRegulationCompliant": true
        }
      ],
      supplyChainDueDiligence: {
        id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#due-diligence",
        type: "SupplyChainDueDiligence",
        dueDiligenceReportUrl: "https://www.ecocell-batteries.example.com/docs/supply-chain-due-diligence-2024.pdf",
        dueDiligencePolicyUrl: "https://www.ecocell-batteries.example.com/policies/supply-chain-due-diligence",
        thirdPartyAssurancesUrl: "https://www.ecocell-batteries.example.com/docs/third-party-audit-2024.pdf",
        riskAssessmentSummary: {
          "@value": "Low to medium risk profile. Key risks identified in lithium sourcing from Chile mitigated through certified suppliers.",
          "@language": "en"
        },
        supplyChainMappingAvailable: true,
        conflictMineralFree: true,
        responsibleSourcingStandard: "OECDGuidelines",
        auditDate: "2024-01-15",
        auditBody: "PwC Germany",
        supplyChainIndex: 78.5
      },
      sparePartSources: [
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#spare-1",
          type: "Organization",
          "gs1:organizationName": "EcoCell Service GmbH",
          spareParts: {
            "@value": "BMS Module, Cell Connectors, Cooling System Components, Terminal Covers",
            "@language": "en"
          },
          "gs1:address": {
            type: "gs1:PostalAddress",
            "gs1:streetAddress": "Serviceweg 10",
            "gs1:addressLocality": "Stuttgart",
            "gs1:postalCode": "70174",
            "gs1:countryCode": "DE"
          },
          supplierContact: {
            type: "gs1:ContactPoint",
            "gs1:email": "spareparts@ecocell-batteries.example.com",
            "gs1:telephone": "+49-711-555-0200",
            "gs1:url": {
              id: "https://parts.ecocell-batteries.example.com"
            }
          }
        }
      ],
      dismantlingDocuments: [
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#dismantle-bom",
          type: "DismantlingDocument",
          documentType: "BillOfMaterial",
          documentUrl: "https://www.ecocell-batteries.example.com/docs/IM-500-bom.pdf",
          mimeType: "application/pdf",
          languageCode: "en"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#dismantle-3d",
          type: "DismantlingDocument",
          documentType: "Model3D",
          documentUrl: "https://www.ecocell-batteries.example.com/docs/IM-500-3d-model.step",
          mimeType: "model/step",
          languageCode: "en"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#dismantle-manual",
          type: "DismantlingDocument",
          documentType: "DismantlingManual",
          documentUrl: "https://www.ecocell-batteries.example.com/docs/IM-500-dismantling.pdf",
          mimeType: "application/pdf",
          languageCode: "en"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#dismantle-sds",
          type: "DismantlingDocument",
          documentType: "SafetyDataSheet",
          documentUrl: "https://www.ecocell-batteries.example.com/docs/IM-500-sds.pdf",
          mimeType: "application/pdf",
          languageCode: "de"
        }
      ],
      endOfLifeInfo: {
        id: "https://id.dev.epcis.cloud/01/09521002005004/21/BAT2024-001#eol",
        type: "EndOfLifeInfo",
        recyclabilityRate: 95,
        materialRecoveryTargets: [
          {
            type: "MaterialRecoveryTarget",
            recoveryMaterial: "Lithium",
            recoveryRate: 70
          },
          {
            type: "MaterialRecoveryTarget",
            recoveryMaterial: "Cobalt",
            recoveryRate: 95
          },
          {
            type: "MaterialRecoveryTarget",
            recoveryMaterial: "Nickel",
            recoveryRate: 95
          },
          {
            type: "MaterialRecoveryTarget",
            recoveryMaterial: "Copper",
            recoveryRate: 95
          }
        ],
        dismantlingInstructions: {
          id: "https://www.ecocell-batteries.example.com/docs/IM-500-dismantling.pdf"
        },
        safetyInstructionsForDismantling: "https://www.ecocell-batteries.example.com/docs/IM-500-dismantling-safety.pdf",
        dismantlingTime: {
          type: "QuantitativeValue",
          value: 45,
          unitCode: "MIN"
        },
        extinguishingAgent: {
          "@value": "Class D fire extinguisher or dry sand",
          "@language": "en"
        },
        wastePrevention: "https://www.ecocell-batteries.example.com/sustainability/waste-prevention",
        separateCollection: "https://www.ecocell-batteries.example.com/recycling/separate-collection",
        informationOnCollection: "https://www.ecocell-batteries.example.com/recycling/collection-points",
        safetyInstructions: "https://www.ecocell-batteries.example.com/docs/IM-500-safety.pdf",
        renewableContent: 3.2
      },
      "gs1:referencedFile": [
        {
          id: "https://www.ecocell-batteries.example.com/docs/IM-500-eu-doc.pdf",
          type: "gs1:ReferencedFileDetails",
          "gs1:referencedFileType": {
            id: "gs1:ReferencedFileTypeCode-DOCUMENT"
          },
          "gs1:contentDescription": "EU Declaration of Conformity (EU 2023/1542)",
          "gs1:fileLanguageCode": "en"
        },
        {
          id: "https://www.ecocell-batteries.example.com/docs/IM-500-test-report.pdf",
          type: "gs1:ReferencedFileDetails",
          "gs1:referencedFileType": {
            id: "gs1:ReferencedFileTypeCode-CERTIFICATION"
          },
          "gs1:contentDescription": "EU Type Examination Test Report",
          "gs1:fileLanguageCode": "en"
        },
        {
          id: "https://www.ecocell-batteries.example.com/docs/IM-500-manual.pdf",
          type: "gs1:ReferencedFileDetails",
          "gs1:referencedFileType": {
            id: "gs1:ReferencedFileTypeCode-USER_MANUAL"
          },
          "gs1:fileLanguageCode": "en"
        },
        {
          id: "https://www.ecocell-batteries.example.com/docs/IM-500-cfp-study.pdf",
          type: "gs1:ReferencedFileDetails",
          "gs1:referencedFileType": {
            id: "gs1:ReferencedFileTypeCode-CERTIFICATION"
          },
          "gs1:contentDescription": "Carbon Footprint Study (ISO 14067)",
          "gs1:fileLanguageCode": "en"
        }
      ]
    }
  },
  {
    group: "EU Battery",
    label: "portable-ebike-battery (item)",
    doc: {
      _comment_gs1_alignment: [
        "Portable / LMT (Light Means of Transport) battery DPP example:",
        "counterpart to the existing EV battery (battery-product.jsonld).",
        "Demonstrates the LightMeansOfTransportBattery category, NMC622",
        "chemistry, lower nominal voltage and capacity, and a second-life",
        "battery status hint (Original; eligible for stationary reuse).",
        "Pattern aligned with EU Battery Regulation 2023/1542 Annex XIII.",
        "GS1 demo prefix 952 (7-digit GCP: 9521234)."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld",
        {
          gs1: "https://ref.gs1.org/voc/",
          xsd: "http://www.w3.org/2001/XMLSchema#"
        }
      ],
      id: "https://id.dev.epcis.cloud/01/09521003000442/21/EB2026-00821",
      type: [
        "Product",
        "Battery"
      ],
      gtin: "09521003000442",
      "gs1:serialNumber": "EB2026-00821",
      productName: [
        {
          "@value": "VeloPower e-bike battery pack VP-48V-14Ah",
          "@language": "en"
        },
        {
          "@value": "VeloPower E-Bike-Akku VP-48V-14Ah",
          "@language": "de"
        },
        {
          "@value": "Batterie de v\xE9lo \xE9lectrique VeloPower VP-48V-14Ah",
          "@language": "fr"
        },
        {
          "@value": "Bater\xEDa para e-bike VeloPower VP-48V-14Ah",
          "@language": "es"
        },
        {
          "@value": "VeloPower e-bike accu VP-48V-14Ah",
          "@language": "nl"
        },
        {
          "@value": "VeloPower elcykel-batteripakke VP-48V-14Ah",
          "@language": "da"
        },
        {
          "@value": "Akumulator do roweru elektrycznego VeloPower VP-48V-14Ah",
          "@language": "pl"
        },
        {
          "@value": "VeloPower elcykelbatteri VP-48V-14Ah",
          "@language": "sv"
        },
        {
          "@value": "VeloPower el-sykkelbatteri VP-48V-14Ah",
          "@language": "no"
        },
        {
          "@value": "VeloPower s\xE4hk\xF6py\xF6r\xE4n akku VP-48V-14Ah",
          "@language": "fi"
        },
        {
          "@value": "Batteria per e-bike VeloPower VP-48V-14Ah",
          "@language": "it"
        }
      ],
      "gs1:productDescription": [
        {
          "@value": "48 V / 14 Ah LMT (Light Means of Transport) NMC622 battery pack, eligible for stationary second-life reuse.",
          "@language": "en"
        },
        {
          "@value": "48-V/14-Ah-Akku f\xFCr leichte Elektrofahrzeuge (LMT) auf NMC622-Basis, geeignet f\xFCr die station\xE4re Zweitnutzung.",
          "@language": "de"
        },
        {
          "@value": "Batterie 48 V / 14 Ah pour v\xE9hicules de mobilit\xE9 l\xE9g\xE8re (LMT) en chimie NMC622, \xE9ligible \xE0 un usage stationnaire en seconde vie.",
          "@language": "fr"
        },
        {
          "@value": "Bater\xEDa 48 V / 14 Ah para veh\xEDculos ligeros (LMT) con qu\xEDmica NMC622, apta para reutilizaci\xF3n estacionaria en segunda vida.",
          "@language": "es"
        },
        {
          "@value": "48 V / 14 Ah accu voor lichte elektrische voertuigen (LMT) op NMC622-basis, geschikt voor stationair hergebruik in second life.",
          "@language": "nl"
        },
        {
          "@value": "48 V / 14 Ah batteripakke til lette transportmidler (LMT) baseret p\xE5 NMC622, egnet til station\xE6r second-life-genbrug.",
          "@language": "da"
        },
        {
          "@value": "Akumulator 48 V / 14 Ah do lekkich pojazd\xF3w elektrycznych (LMT) w chemii NMC622, kwalifikuj\u0105cy si\u0119 do stacjonarnego ponownego u\u017Cycia w drugim cyklu \u017Cycia.",
          "@language": "pl"
        },
        {
          "@value": "48 V / 14 Ah batteripaket f\xF6r l\xE4tta elfordon (LMT) i NMC622-kemi, l\xE4mpligt f\xF6r station\xE4r \xE5teranv\xE4ndning i andra liv.",
          "@language": "sv"
        },
        {
          "@value": "48 V / 14 Ah batteripakke for lette elektriske kj\xF8ret\xF8y (LMT) i NMC622-kjemi, egnet for stasjon\xE6r gjenbruk i annen levetid.",
          "@language": "no"
        },
        {
          "@value": "48 V / 14 Ah:n akku kevyisiin s\xE4hk\xF6isiin liikkumisv\xE4lineisiin (LMT), NMC622-kemia, soveltuu kiinte\xE4\xE4n toisen elinkaaren uudelleenk\xE4ytt\xF6\xF6n.",
          "@language": "fi"
        },
        {
          "@value": "Pacco batteria 48 V / 14 Ah per mezzi di mobilit\xE0 leggera (LMT) in chimica NMC622, idoneo al riutilizzo stazionario in seconda vita.",
          "@language": "it"
        }
      ],
      batteryCategory: "LightMeansOfTransportBattery",
      batteryStatus: "Original",
      batteryModel: {
        "@value": "VP-48V-14Ah",
        "@language": "en"
      },
      cellType: "CylindricalCell",
      numberOfCells: 65,
      numberOfModules: 1,
      manufacturer: {
        id: "https://id.dev.epcis.cloud/417/9521987000063",
        type: "Organization",
        "gs1:organizationName": "VeloPower GmbH",
        "gs1:gln": "9521987000063",
        "gs1:address": {
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Velomotorstra\xDFe 18",
          "gs1:addressLocality": "Friedrichshafen",
          "gs1:postalCode": "88045",
          "gs1:countryCode": "DE"
        }
      },
      manufacturingPlace: {
        id: "https://id.dev.epcis.cloud/414/9521987000070",
        type: "gs1:Place",
        "gs1:gln": "9521987000070",
        "gs1:address": {
          type: "gs1:PostalAddress",
          "gs1:addressLocality": "Friedrichshafen",
          "gs1:countryCode": "DE"
        }
      },
      operatorInformation: {
        type: "dpp:OperatorInformation",
        "gs1:gln": "9521987000063",
        "gs1:organizationName": "VeloPower GmbH",
        operatorRole: "Manufacturer"
      },
      "gs1:netWeight": {
        type: "QuantitativeValue",
        value: 3.6,
        unitCode: "KGM"
      },
      batteryChemistry: {
        type: "BatteryChemistry",
        shortName: "NMC622",
        fullName: {
          "@value": "Lithium Nickel Manganese Cobalt Oxide (NMC 6:2:2)",
          "@language": "en"
        },
        cathodeActiveMaterial: "LiNi0.6Mn0.2Co0.2O2",
        anodeActiveMaterial: "Graphite",
        electrolyteType: {
          "@value": "Liquid organic carbonate-based",
          "@language": "en"
        }
      },
      technicalSpecifications: {
        type: "TechnicalSpecification",
        ratedCapacity: {
          type: "QuantitativeValue",
          value: 14,
          unitCode: "AMH"
        },
        ratedEnergy: {
          type: "QuantitativeValue",
          value: 0.672,
          unitCode: "KWH"
        },
        nominalVoltage: {
          type: "QuantitativeValue",
          value: 48,
          unitCode: "VLT"
        },
        minimumVoltage: {
          type: "QuantitativeValue",
          value: 36,
          unitCode: "VLT"
        },
        maximumVoltage: {
          type: "QuantitativeValue",
          value: 54.6,
          unitCode: "VLT"
        },
        ratedMaximumPower: {
          type: "QuantitativeValue",
          value: 0.5,
          unitCode: "KWT"
        },
        expectedCycleLife: {
          type: "QuantitativeValue",
          value: 800,
          unitCode: "C62"
        }
      },
      recycledContent: {
        type: "RecycledContent",
        lithiumRecycledShare: 4,
        lithiumPreConsumerShare: 1,
        lithiumPostConsumerShare: 3,
        cobaltRecycledShare: 12,
        cobaltPreConsumerShare: 4,
        cobaltPostConsumerShare: 8,
        nickelRecycledShare: 8,
        nickelPreConsumerShare: 3,
        nickelPostConsumerShare: 5
      },
      carbonFootprintDeclaration: {
        type: "CarbonFootprintDeclaration",
        carbonFootprintTotal: {
          type: "QuantitativeValue",
          value: 38.4,
          unitCode: "KGM"
        },
        carbonFootprintRawMaterialExtraction: {
          type: "QuantitativeValue",
          value: 21.6,
          unitCode: "KGM"
        },
        carbonFootprintProduction: {
          type: "QuantitativeValue",
          value: 11.2,
          unitCode: "KGM"
        },
        carbonFootprintDistribution: {
          type: "QuantitativeValue",
          value: 2.6,
          unitCode: "KGM"
        },
        carbonFootprintRecycling: {
          type: "QuantitativeValue",
          value: 3,
          unitCode: "KGM"
        },
        carbonFootprintPerformanceClass: "CFClassB",
        carbonFootprintDeclarationId: "CFP-2026-VELO-VP48-001",
        carbonFootprintGeographicScope: "EU production, mixed material sourcing"
      },
      hazardousSubstances: [
        {
          type: "HazardousSubstance",
          substanceName: {
            "@value": "Cobalt (cathode active material constituent)",
            "@language": "en"
          },
          substanceCasNumber: "7440-48-4",
          substanceEcNumber: "231-158-0",
          hazardClass: "Carcinogenicity",
          concentration: 4.8,
          substanceLocation: "Cathode"
        },
        {
          type: "HazardousSubstance",
          substanceName: {
            "@value": "Lithium hexafluorophosphate (LiPF6)",
            "@language": "en"
          },
          substanceCasNumber: "21324-40-3",
          substanceEcNumber: "244-334-7",
          hazardClass: "AcuteToxicity",
          concentration: 0.9,
          substanceLocation: "Electrolyte"
        }
      ],
      "gs1:warranty": {
        type: "gs1:WarrantyPromise",
        "gs1:durationOfWarranty": "P2Y",
        "gs1:warrantyScopeDescription": {
          "@value": "Manufacturer warranty: 2 years or 500 charge cycles, whichever comes first. Cell-level capacity fade guaranteed below 20% within the warranty period.",
          "@language": "en"
        }
      },
      endOfLifeInfo: {
        type: "EndOfLifeInfo",
        recyclabilityRate: 78,
        materialRecoveryTargets: [
          {
            type: "MaterialRecoveryTarget",
            recoveryMaterial: "Lithium",
            recoveryRate: 50
          },
          {
            type: "MaterialRecoveryTarget",
            recoveryMaterial: "Cobalt",
            recoveryRate: 90
          },
          {
            type: "MaterialRecoveryTarget",
            recoveryMaterial: "Nickel",
            recoveryRate: 90
          },
          {
            type: "MaterialRecoveryTarget",
            recoveryMaterial: "Copper",
            recoveryRate: 95
          }
        ]
      },
      dismantlingDocuments: [
        {
          type: "DismantlingDocument",
          documentType: "DismantlingInstructions",
          documentUrl: "https://www.velopower.example.com/docs/VP-48V-14Ah-dismantling.pdf",
          mimeType: "application/pdf",
          languageCode: "en"
        }
      ],
      "gs1:regulatoryInformation": [
        {
          type: "gs1:RegulatoryInformation",
          "gs1:regulationType": {
            id: "gs1:RegulationTypeCode-BATTERY_DIRECTIVE"
          },
          "gs1:regulatoryAct": "EU 2023/1542",
          "gs1:isRegulationCompliant": true
        }
      ]
    }
  },
  {
    group: "EU Electronics",
    label: "display-product (item)",
    doc: {
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld"
      ],
      type: "Product",
      id: "https://id.gs1.org/01/09506000356785/21/DSP-2025-001",
      gtin: "09506000356785",
      productName: "EcoView Professional 32 HDR",
      commercialName: "EcoView Pro 32",
      modelIdentifier: "EV-PRO32-HDR-4K",
      deviceCategory: "Display",
      manufacturer: {
        type: "Organization",
        organizationName: "Nordic Display Solutions AB",
        gln: "9521234000006"
      },
      manufacturingDate: "2025-01-18",
      countryOfOrigin: "SE",
      netWeight: {
        type: "QuantitativeValue",
        value: 7.2,
        unitCode: "KGM"
      },
      displaySpecification: {
        type: "DisplaySpecification",
        screenDiagonal: {
          type: "QuantitativeValue",
          value: 31.5,
          unitCode: "INH"
        },
        screenResolutionWidth: 3840,
        screenResolutionHeight: 2160,
        displayTechnology: "IPS LCD",
        refreshRate: {
          type: "QuantitativeValue",
          value: 144,
          unitCode: "HTZ"
        },
        peakBrightness: {
          type: "QuantitativeValue",
          value: 600,
          unitCode: "CDM2"
        }
      },
      energyEfficiency: {
        type: "EnergyEfficiency",
        energyEfficiencyClass: "EnergyClassC",
        annualEnergyConsumption: {
          type: "QuantitativeValue",
          value: 85,
          unitCode: "KWH"
        },
        powerConsumptionOn: {
          type: "QuantitativeValue",
          value: 55,
          unitCode: "WTT"
        },
        powerConsumptionStandby: {
          type: "QuantitativeValue",
          value: 0.3,
          unitCode: "WTT"
        },
        powerConsumptionOff: {
          type: "QuantitativeValue",
          value: 0.1,
          unitCode: "WTT"
        },
        eprelRegistrationNumber: "EPREL-2025-MON-67890",
        eprelProductUrl: "https://eprel.ec.europa.eu/screen/product/electronicdisplays/67890",
        energyLabelUrl: "https://www.nordic-displays.example.com/products/ecoview-pro-32/energy-label.png"
      },
      repairabilityIndex: {
        type: "RepairabilityIndex",
        totalScore: 68,
        displayScore: 6.8,
        repairabilityClass: "RepairClassB",
        assessmentDate: "2025-01-12",
        repairCriteria: [
          {
            type: "RepairCriterion",
            criterionType: "Documentation",
            criterionScore: 15,
            criterionMaxScore: 20,
            criterionDetails: "Service manual available, basic troubleshooting guide"
          },
          {
            type: "RepairCriterion",
            criterionType: "Disassembly",
            criterionScore: 14,
            criterionMaxScore: 20,
            criterionDetails: "Standard screws, modular stand, 12 steps to access power board"
          },
          {
            type: "RepairCriterion",
            criterionType: "SparePartsAvailability",
            criterionScore: 15,
            criterionMaxScore: 20,
            criterionDetails: "Power board, control board available for 7 years"
          },
          {
            type: "RepairCriterion",
            criterionType: "SparePartsPricing",
            criterionScore: 12,
            criterionMaxScore: 20,
            criterionDetails: "Power board: 18% of device price, Panel: not available separately"
          },
          {
            type: "RepairCriterion",
            criterionType: "ProductSpecific",
            criterionScore: 12,
            criterionMaxScore: 20,
            criterionDetails: "Firmware updates via USB, factory reset capability"
          }
        ]
      },
      softwareSupport: {
        type: "SoftwareSupport",
        firmwareVersion: "V2.1.5",
        securityUpdateEndDate: "2030-01-18",
        featureUpdateEndDate: "2028-01-18",
        updateChannel: "https://www.nordic-displays.example.com/support/firmware/ecoview-pro-32",
        latestUpdateDate: "2025-01-22"
      },
      billOfMaterials: {
        type: "ComponentBOM",
        components: [
          {
            type: "Product",
            componentType: "DisplayComponent",
            componentName: "31.5-inch IPS LCD Panel",
            componentPartNumber: "PNL-315IPS-4K",
            isReplaceable: false,
            replacementDifficulty: "NotReplaceable"
          },
          {
            type: "Product",
            componentType: "PowerSupplyComponent",
            componentName: "Internal Power Supply Board",
            componentPartNumber: "PSB-EV32-120W",
            isReplaceable: true,
            replacementDifficulty: "ProfessionalOnly",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 75,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "MotherboardComponent",
            componentName: "Main Control Board",
            componentPartNumber: "MCB-EV32-V2",
            isReplaceable: true,
            replacementDifficulty: "ProfessionalOnly",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 120,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "EnclosureComponent",
            componentName: "Monitor Stand with Ergonomic Adjustment",
            componentPartNumber: "STD-EV32-ERGO",
            isReplaceable: true,
            replacementDifficulty: "UserReplaceable",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 10,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 65,
              priceCurrency: "EUR"
            }
          }
        ]
      },
      weeeCompliance: {
        type: "WEEECompliance",
        weeeCategory: "WEEE2_ScreensMonitors",
        weeeRegistrationNumber: "SE-2024-EE-34567",
        weeeRegistrationCountry: "SE",
        collectionSchemeUrl: "https://www.nordic-displays.example.com/sustainability/recycling",
        recyclabilityRate: 0.88,
        recoverabilityRate: 0.93
      },
      rohsCompliance: {
        type: "RoHSCompliance",
        rohsCompliant: true,
        rohsDeclarationUrl: "https://www.nordic-displays.example.com/compliance/rohs/ecoview-pro-32"
      },
      circularityPerformance: {
        type: "CircularityPerformance",
        recyclableContent: 0.88,
        materialCircularityIndicator: 0.55,
        utilityFactor: 1.2,
        endOfLifeInstructions: "https://www.nordic-displays.example.com/sustainability/end-of-life"
      },
      recycledContentDetails: {
        type: "RecycledContent",
        recycledContent: 0.28,
        preConsumerRecycledContent: 0.12,
        postConsumerRecycledContent: 0.16
      },
      emissionsPerformance: {
        type: "EmissionsPerformance",
        carbonFootprintTotal: 185,
        declaredUnit: "kg CO2e/unit",
        operationalScope: "CradleToGate",
        primarySourcedRatio: 0.72
      },
      operatorInformation: {
        type: "OperatorInformation",
        operatorRole: "Manufacturer",
        gln: "9521234000006",
        economicOperatorId: "EU-EOID-SE-2024-345678",
        vatIdentificationNumber: "SE123456789001"
      }
    }
  },
  {
    group: "EU Electronics",
    label: "laptop-product (item)",
    doc: {
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld"
      ],
      type: "Product",
      id: "https://id.gs1.org/01/09506000467894/21/LPT-2025-001",
      gtin: "09506000467894",
      productName: "GreenBook Pro 15 2025",
      commercialName: "GreenBook Pro 15",
      modelIdentifier: "GB-PRO15-2025-I7",
      deviceCategory: "Laptop",
      manufacturer: {
        type: "Organization",
        organizationName: "GreenTech Computers SAS",
        gln: "9521234000006"
      },
      manufacturingDate: "2025-01-22",
      countryOfOrigin: "FR",
      netWeight: {
        type: "QuantitativeValue",
        value: 1.85,
        unitCode: "KGM"
      },
      displaySpecification: {
        type: "DisplaySpecification",
        screenDiagonal: {
          type: "QuantitativeValue",
          value: 15.6,
          unitCode: "INH"
        },
        screenResolutionWidth: 2880,
        screenResolutionHeight: 1800,
        displayTechnology: "OLED",
        refreshRate: {
          type: "QuantitativeValue",
          value: 90,
          unitCode: "HTZ"
        },
        peakBrightness: {
          type: "QuantitativeValue",
          value: 500,
          unitCode: "CDM2"
        }
      },
      energyEfficiency: {
        type: "EnergyEfficiency",
        energyEfficiencyClass: "EnergyClassB",
        annualEnergyConsumption: {
          type: "QuantitativeValue",
          value: 32,
          unitCode: "KWH"
        },
        powerConsumptionOn: {
          type: "QuantitativeValue",
          value: 45,
          unitCode: "WTT"
        },
        powerConsumptionStandby: {
          type: "QuantitativeValue",
          value: 0.8,
          unitCode: "WTT"
        },
        powerConsumptionOff: {
          type: "QuantitativeValue",
          value: 0.2,
          unitCode: "WTT"
        },
        eprelRegistrationNumber: "EPREL-2025-NB-23456",
        eprelProductUrl: "https://eprel.ec.europa.eu/screen/product/notebooks/23456",
        energyLabelUrl: "https://www.greentech-computers.example.com/products/greenbook-pro-15/energy-label.png"
      },
      repairabilityIndex: {
        type: "RepairabilityIndex",
        totalScore: 76.5,
        displayScore: 7.7,
        repairabilityClass: "RepairClassB",
        assessmentDate: "2025-01-18",
        repairabilityLabelUrl: "https://www.greentech-computers.example.com/products/greenbook-pro-15/repairability-label.png",
        repairCriteria: [
          {
            type: "RepairCriterion",
            criterionType: "Documentation",
            criterionScore: 17.5,
            criterionMaxScore: 20,
            criterionDetails: "Complete service manual with teardown videos in 12 languages"
          },
          {
            type: "RepairCriterion",
            criterionType: "Disassembly",
            criterionScore: 16,
            criterionMaxScore: 20,
            criterionDetails: "Single screw type, modular internals, battery accessible in 3 steps"
          },
          {
            type: "RepairCriterion",
            criterionType: "SparePartsAvailability",
            criterionScore: 15,
            criterionMaxScore: 20,
            criterionDetails: "Major components available for 7 years through authorized partners"
          },
          {
            type: "RepairCriterion",
            criterionType: "SparePartsPricing",
            criterionScore: 13,
            criterionMaxScore: 20,
            criterionDetails: "Battery: 12%, SSD: 8%, RAM: 5%, Display: 28% of device price"
          },
          {
            type: "RepairCriterion",
            criterionType: "ProductSpecific",
            criterionScore: 15,
            criterionMaxScore: 20,
            criterionDetails: "6 years OS updates, user-upgradeable RAM and SSD, data recovery mode"
          }
        ]
      },
      softwareSupport: {
        type: "SoftwareSupport",
        operatingSystem: "Windows 11 Pro",
        osVersion: "24H2",
        firmwareVersion: "BIOS 1.8.0 / EC 2.3.1",
        securityUpdateEndDate: "2031-01-22",
        featureUpdateEndDate: "2031-01-22",
        securitySupportYears: {
          type: "QuantitativeValue",
          value: 6,
          unitCode: "ANN"
        },
        featureSupportYears: {
          type: "QuantitativeValue",
          value: 6,
          unitCode: "ANN"
        },
        updateChannel: "https://support.greentech-computers.example.com/drivers/greenbook-pro-15",
        latestUpdateDate: "2025-01-28"
      },
      billOfMaterials: {
        type: "ComponentBOM",
        components: [
          {
            type: "Product",
            componentType: "BatteryComponent",
            componentName: "Lithium-Polymer Battery 72Wh",
            componentPartNumber: "BAT-GB15-72WH",
            isReplaceable: true,
            replacementDifficulty: "ToolRequired",
            componentPassport: "https://id.gs1.org/01/09506000467900/21/BAT-2025-001",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 149,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "DisplayComponent",
            componentName: "15.6-inch OLED Display Assembly",
            componentPartNumber: "DSP-GB15-OLED",
            isReplaceable: true,
            replacementDifficulty: "ProfessionalOnly",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 5,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 350,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "MemoryComponent",
            componentName: "DDR5 SO-DIMM 16GB (upgradeable)",
            componentPartNumber: "MEM-DDR5-16G-SO",
            isReplaceable: true,
            replacementDifficulty: "UserReplaceable",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 89,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "StorageComponent",
            componentName: "NVMe SSD 512GB (upgradeable)",
            componentPartNumber: "SSD-NVME-512G",
            isReplaceable: true,
            replacementDifficulty: "UserReplaceable",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 95,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "KeyboardComponent",
            componentName: "Backlit Keyboard FR Layout",
            componentPartNumber: "KB-GB15-FR-BL",
            isReplaceable: true,
            replacementDifficulty: "ToolRequired",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 85,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "TrackpadComponent",
            componentName: "Glass Trackpad with Haptic Feedback",
            componentPartNumber: "TP-GB15-GLASS",
            isReplaceable: true,
            replacementDifficulty: "ProfessionalOnly",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 75,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "PowerSupplyComponent",
            componentName: "100W USB-C Power Adapter",
            componentPartNumber: "PSU-GB15-100W-C",
            isReplaceable: true,
            replacementDifficulty: "UserReplaceable",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 10,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 79,
              priceCurrency: "EUR"
            }
          }
        ]
      },
      weeeCompliance: {
        type: "WEEECompliance",
        weeeCategory: "WEEE2_ScreensMonitors",
        weeeRegistrationNumber: "FR-2024-EE-45678",
        weeeRegistrationCountry: "FR",
        collectionSchemeUrl: "https://www.greentech-computers.example.com/sustainability/recycling",
        recyclabilityRate: 0.86,
        recoverabilityRate: 0.91
      },
      rohsCompliance: {
        type: "RoHSCompliance",
        rohsCompliant: true,
        rohsDeclarationUrl: "https://www.greentech-computers.example.com/compliance/rohs/greenbook-pro-15"
      },
      circularityPerformance: {
        type: "CircularityPerformance",
        recyclableContent: 0.86,
        materialCircularityIndicator: 0.68,
        utilityFactor: 1.25,
        endOfLifeInstructions: "https://www.greentech-computers.example.com/sustainability/end-of-life/greenbook-pro-15"
      },
      recycledContentDetails: {
        type: "RecycledContent",
        recycledContent: 0.38,
        preConsumerRecycledContent: 0.15,
        postConsumerRecycledContent: 0.23
      },
      emissionsPerformance: {
        type: "EmissionsPerformance",
        carbonFootprintTotal: 320,
        declaredUnit: "kg CO2e/unit",
        operationalScope: "CradleToGate",
        primarySourcedRatio: 0.82,
        carbonFootprintStudyUrl: "https://www.greentech-computers.example.com/sustainability/carbon-footprint/greenbook-pro-15-lca.pdf"
      },
      materialComposition: [
        {
          type: "MaterialComposition",
          materialName: "Recycled Aluminum (chassis)",
          massFraction: 0.42,
          sourceCountry: "NO",
          isCriticalRawMaterial: false
        },
        {
          type: "MaterialComposition",
          materialName: "Recycled Plastics (keyboard surround)",
          massFraction: 0.08,
          sourceCountry: "DE",
          isCriticalRawMaterial: false
        },
        {
          type: "MaterialComposition",
          materialName: "Lithium (battery)",
          massFraction: 0.015,
          sourceCountry: "CL",
          isCriticalRawMaterial: true
        },
        {
          type: "MaterialComposition",
          materialName: "Cobalt (battery)",
          massFraction: 8e-3,
          sourceCountry: "CD",
          isCriticalRawMaterial: true
        }
      ],
      operatorInformation: {
        type: "OperatorInformation",
        operatorRole: "Manufacturer",
        gln: "9521234000006",
        economicOperatorId: "EU-EOID-FR-2024-567890",
        vatIdentificationNumber: "FR12345678901"
      },
      facilityInformation: {
        type: "FacilityInformation",
        gln: "3012345000017",
        name: "GreenTech Manufacturing Facility Lyon",
        facilityType: "Assembly",
        address: {
          type: "PostalAddress",
          streetAddress: "Zone Industrielle de Vaise, Rue du Progr\xE8s 45",
          addressLocality: "Lyon",
          postalCode: "69009",
          addressCountry: "FR"
        }
      },
      dueDiligenceReport: {
        type: "DueDiligenceReport",
        reportUrl: "https://www.greentech-computers.example.com/sustainability/due-diligence/2024-report.pdf",
        reportDate: "2024-12-15",
        thirdPartyAssurancesUrl: "https://www.greentech-computers.example.com/sustainability/due-diligence/third-party-audit.pdf"
      }
    }
  },
  {
    group: "EU Electronics",
    label: "server-product (item)",
    doc: {
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld"
      ],
      type: "Product",
      id: "https://id.gs1.org/01/09506000245676/21/SRV-2025-001",
      gtin: "09506000245676",
      productName: "DataCenter Pro Server X5",
      commercialName: "DataCenter Pro X5",
      modelIdentifier: "DCPX5-2U-64C",
      deviceCategory: "Server",
      manufacturer: {
        type: "Organization",
        organizationName: "EuroServer Systems B.V.",
        gln: "9521234000006"
      },
      manufacturingDate: "2025-01-20",
      countryOfOrigin: "NL",
      netWeight: {
        type: "QuantitativeValue",
        value: 28.5,
        unitCode: "KGM"
      },
      grossWeight: {
        type: "QuantitativeValue",
        value: 35.2,
        unitCode: "KGM"
      },
      repairabilityIndex: {
        type: "RepairabilityIndex",
        totalScore: 85,
        displayScore: 8.5,
        repairabilityClass: "RepairClassA",
        assessmentDate: "2025-01-15",
        repairCriteria: [
          {
            type: "RepairCriterion",
            criterionType: "Documentation",
            criterionScore: 18,
            criterionMaxScore: 20,
            criterionDetails: "Comprehensive service manuals, maintenance guides, and API documentation"
          },
          {
            type: "RepairCriterion",
            criterionType: "Disassembly",
            criterionScore: 19,
            criterionMaxScore: 20,
            criterionDetails: "Tool-less hot-swap design for all major components"
          },
          {
            type: "RepairCriterion",
            criterionType: "SparePartsAvailability",
            criterionScore: 17,
            criterionMaxScore: 20,
            criterionDetails: "All spare parts available for 10 years, 24-hour delivery SLA"
          },
          {
            type: "RepairCriterion",
            criterionType: "SparePartsPricing",
            criterionScore: 15,
            criterionMaxScore: 20,
            criterionDetails: "Component pricing published, volume discounts available"
          },
          {
            type: "RepairCriterion",
            criterionType: "ProductSpecific",
            criterionScore: 16,
            criterionMaxScore: 20,
            criterionDetails: "10 years firmware support, remote diagnostics, modular expansion"
          }
        ]
      },
      softwareSupport: {
        type: "SoftwareSupport",
        operatingSystem: "Linux (RHEL/Ubuntu Server)",
        firmwareVersion: "BIOS 2.5.1 / BMC 4.2.0",
        securityUpdateEndDate: "2035-01-20",
        featureUpdateEndDate: "2032-01-20",
        securitySupportYears: {
          type: "QuantitativeValue",
          value: 10,
          unitCode: "ANN"
        },
        updateChannel: "https://support.euroserver.example.com/firmware/dcpx5",
        latestUpdateDate: "2025-01-28"
      },
      energyEfficiency: {
        type: "EnergyEfficiency",
        energyEfficiencyClass: "EnergyClassA",
        annualEnergyConsumption: {
          type: "QuantitativeValue",
          value: 8760,
          unitCode: "KWH"
        },
        powerConsumptionOn: {
          type: "QuantitativeValue",
          value: 1200,
          unitCode: "WTT"
        },
        powerConsumptionStandby: {
          type: "QuantitativeValue",
          value: 45,
          unitCode: "WTT"
        },
        eprelRegistrationNumber: "EPREL-2025-SRV-12345",
        eprelProductUrl: "https://eprel.ec.europa.eu/screen/product/servers/12345"
      },
      billOfMaterials: {
        type: "ComponentBOM",
        components: [
          {
            type: "Product",
            componentType: "ProcessorComponent",
            componentName: "64-Core Server Processor (2x)",
            componentPartNumber: "CPU-64C-SP5",
            isReplaceable: true,
            replacementDifficulty: "ProfessionalOnly",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            }
          },
          {
            type: "Product",
            componentType: "MemoryComponent",
            componentName: "DDR5 ECC Memory Module 64GB",
            componentPartNumber: "MEM-DDR5-64G-ECC",
            isReplaceable: true,
            replacementDifficulty: "UserReplaceable",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 10,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 450,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "StorageComponent",
            componentName: "NVMe SSD 3.84TB Enterprise",
            componentPartNumber: "SSD-NVME-3840G-ENT",
            isReplaceable: true,
            replacementDifficulty: "UserReplaceable",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 650,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "PowerSupplyComponent",
            componentName: "1600W Platinum PSU (redundant)",
            componentPartNumber: "PSU-1600W-PLAT",
            isReplaceable: true,
            replacementDifficulty: "UserReplaceable",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 10,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 380,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "CoolingSystemComponent",
            componentName: "Hot-swap Cooling Fan Module",
            componentPartNumber: "FAN-HS-80MM",
            isReplaceable: true,
            replacementDifficulty: "UserReplaceable",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 10,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 85,
              priceCurrency: "EUR"
            }
          }
        ]
      },
      weeeCompliance: {
        type: "WEEECompliance",
        weeeCategory: "WEEE4_LargeEquipment",
        weeeRegistrationNumber: "NL-2024-EE-56789",
        weeeRegistrationCountry: "NL",
        collectionSchemeUrl: "https://www.euroserver.example.com/sustainability/recycling",
        recyclabilityRate: 0.92,
        recoverabilityRate: 0.96
      },
      rohsCompliance: {
        type: "RoHSCompliance",
        rohsCompliant: true,
        rohsExemptions: "7(a), 7(c)-I",
        rohsDeclarationUrl: "https://www.euroserver.example.com/compliance/rohs/dcpx5"
      },
      circularityPerformance: {
        type: "CircularityPerformance",
        recyclableContent: 0.92,
        materialCircularityIndicator: 0.78,
        utilityFactor: 1.4,
        endOfLifeInstructions: "https://www.euroserver.example.com/sustainability/end-of-life/dcpx5"
      },
      recycledContentDetails: {
        type: "RecycledContent",
        recycledContent: 0.42,
        preConsumerRecycledContent: 0.18,
        postConsumerRecycledContent: 0.24
      },
      emissionsPerformance: {
        type: "EmissionsPerformance",
        carbonFootprintTotal: 1250,
        declaredUnit: "kg CO2e/unit",
        operationalScope: "CradleToGate",
        primarySourcedRatio: 0.85,
        carbonFootprintStudyUrl: "https://www.euroserver.example.com/sustainability/carbon-footprint/dcpx5-study.pdf"
      },
      materialComposition: [
        {
          type: "MaterialComposition",
          materialName: "Steel (chassis)",
          massFraction: 0.45,
          sourceCountry: "DE",
          isCriticalRawMaterial: false
        },
        {
          type: "MaterialComposition",
          materialName: "Aluminum (heat sinks)",
          massFraction: 0.18,
          sourceCountry: "NO",
          isCriticalRawMaterial: false
        },
        {
          type: "MaterialComposition",
          materialName: "Copper (PCBs, cables)",
          massFraction: 0.12,
          sourceCountry: "CL",
          isCriticalRawMaterial: false
        },
        {
          type: "MaterialComposition",
          materialName: "Rare Earth Elements (magnets)",
          massFraction: 2e-3,
          sourceCountry: "AU",
          isCriticalRawMaterial: true
        }
      ],
      operatorInformation: {
        type: "OperatorInformation",
        operatorRole: "Manufacturer",
        gln: "9521234000006",
        economicOperatorId: "EU-EOID-NL-2024-789012",
        vatIdentificationNumber: "NL123456789B01"
      },
      facilityInformation: {
        type: "FacilityInformation",
        gln: "8712345000011",
        name: "EuroServer Manufacturing Facility Amsterdam",
        facilityType: "Assembly",
        address: {
          type: "PostalAddress",
          streetAddress: "Industrieweg 123",
          addressLocality: "Amsterdam",
          postalCode: "1099 AA",
          addressCountry: "NL"
        }
      }
    }
  },
  {
    group: "EU Electronics",
    label: "smartphone-product (item)",
    doc: {
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld"
      ],
      type: "Product",
      id: "https://id.gs1.org/01/09506000134352/21/ABC123456",
      gtin: "09506000134352",
      productName: "EcoPhone Pro 2025",
      commercialName: "EcoPhone Pro",
      modelIdentifier: "EP-2025-PRO-256",
      deviceCategory: "Smartphone",
      manufacturer: {
        type: "Organization",
        organizationName: "EcoTech Electronics GmbH",
        gln: "9521234000006"
      },
      manufacturingDate: "2025-01-15",
      countryOfOrigin: "DE",
      netWeight: {
        type: "QuantitativeValue",
        value: 185,
        unitCode: "GRM"
      },
      repairabilityIndex: {
        type: "RepairabilityIndex",
        totalScore: 72.5,
        displayScore: 7.3,
        repairabilityClass: "RepairClassB",
        assessmentDate: "2025-01-10",
        repairabilityLabelUrl: "https://example.com/labels/ecophone-pro-2025-repairability.png",
        repairCriteria: [
          {
            type: "RepairCriterion",
            criterionType: "Documentation",
            criterionScore: 16.5,
            criterionMaxScore: 20,
            criterionDetails: "Complete repair manuals available in 8 languages, including video tutorials"
          },
          {
            type: "RepairCriterion",
            criterionType: "Disassembly",
            criterionScore: 14,
            criterionMaxScore: 20,
            criterionDetails: "Uses standard screws, modular design, 8 steps to replace display"
          },
          {
            type: "RepairCriterion",
            criterionType: "SparePartsAvailability",
            criterionScore: 15,
            criterionMaxScore: 20,
            criterionDetails: "All spare parts available for 7 years, delivery within 5 business days"
          },
          {
            type: "RepairCriterion",
            criterionType: "SparePartsPricing",
            criterionScore: 12,
            criterionMaxScore: 20,
            criterionDetails: "Battery: 15% of device price, Display: 25%, Logic board: 40%"
          },
          {
            type: "RepairCriterion",
            criterionType: "ProductSpecific",
            criterionScore: 15,
            criterionMaxScore: 20,
            criterionDetails: "5 years OS updates, 7 years security updates, software reset capability"
          }
        ]
      },
      softwareSupport: {
        type: "SoftwareSupport",
        operatingSystem: "Android",
        osVersion: "15.0",
        firmwareVersion: "EP2025.1.2.45",
        securityUpdateEndDate: "2032-01-15",
        featureUpdateEndDate: "2030-01-15",
        securitySupportYears: {
          type: "QuantitativeValue",
          value: 7,
          unitCode: "ANN"
        },
        featureSupportYears: {
          type: "QuantitativeValue",
          value: 5,
          unitCode: "ANN"
        },
        updateChannel: "https://updates.ecotech-electronics.example.com/ecophone-pro",
        latestUpdateDate: "2025-01-25"
      },
      displaySpecification: {
        type: "DisplaySpecification",
        screenDiagonal: {
          type: "QuantitativeValue",
          value: 6.7,
          unitCode: "INH"
        },
        screenResolutionWidth: 1440,
        screenResolutionHeight: 3200,
        displayTechnology: "AMOLED",
        refreshRate: {
          type: "QuantitativeValue",
          value: 120,
          unitCode: "HTZ"
        },
        peakBrightness: {
          type: "QuantitativeValue",
          value: 1800,
          unitCode: "CDM2"
        }
      },
      billOfMaterials: {
        type: "ComponentBOM",
        components: [
          {
            type: "Product",
            componentType: "BatteryComponent",
            componentName: "Lithium-Ion Battery 5000mAh",
            componentPartNumber: "BAT-EP2025-5000",
            isReplaceable: true,
            replacementDifficulty: "ToolRequired",
            componentPassport: "https://id.gs1.org/01/09506000134369/21/BAT789012",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 89,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "DisplayComponent",
            componentName: "6.7-inch AMOLED Display Assembly",
            componentPartNumber: "DSP-EP2025-67AM",
            isReplaceable: true,
            replacementDifficulty: "ToolRequired",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 149,
              priceCurrency: "EUR"
            }
          },
          {
            type: "Product",
            componentType: "CameraComponent",
            componentName: "Triple Camera Module",
            componentPartNumber: "CAM-EP2025-TRIPLE",
            isReplaceable: true,
            replacementDifficulty: "ProfessionalOnly",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 5,
              unitCode: "ANN"
            }
          },
          {
            type: "Product",
            componentType: "ConnectorComponent",
            componentName: "USB-C Charging Port",
            componentPartNumber: "USB-EP2025-C",
            isReplaceable: true,
            replacementDifficulty: "ProfessionalOnly",
            sparePartAvailabilityYears: {
              type: "QuantitativeValue",
              value: 7,
              unitCode: "ANN"
            },
            sparePartPrice: {
              type: "PriceSpecification",
              price: 35,
              priceCurrency: "EUR"
            }
          }
        ]
      },
      weeeCompliance: {
        type: "WEEECompliance",
        weeeCategory: "WEEE6_SmallIT",
        weeeRegistrationNumber: "DE-2024-EE-12345",
        weeeRegistrationCountry: "DE",
        collectionSchemeUrl: "https://www.ecotech-electronics.example.com/recycling",
        recyclabilityRate: 0.85,
        recoverabilityRate: 0.92
      },
      rohsCompliance: {
        type: "RoHSCompliance",
        rohsCompliant: true,
        rohsDeclarationUrl: "https://www.ecotech-electronics.example.com/compliance/rohs/ecophone-pro-2025"
      },
      energyEfficiency: {
        type: "EnergyEfficiency",
        powerConsumptionStandby: {
          type: "QuantitativeValue",
          value: 0.3,
          unitCode: "WTT"
        }
      },
      circularityPerformance: {
        type: "CircularityPerformance",
        recyclableContent: 0.85,
        materialCircularityIndicator: 0.62,
        utilityFactor: 1.15
      },
      recycledContentDetails: {
        type: "RecycledContent",
        recycledContent: 0.35,
        preConsumerRecycledContent: 0.1,
        postConsumerRecycledContent: 0.25
      },
      emissionsPerformance: {
        type: "EmissionsPerformance",
        carbonFootprintTotal: 52.5,
        declaredUnit: "kg CO2e/unit",
        operationalScope: "CradleToGate",
        primarySourcedRatio: 0.78
      },
      operatorInformation: {
        type: "OperatorInformation",
        operatorRole: "Manufacturer",
        gln: "9521234000006",
        economicOperatorId: "EU-EOID-DE-2024-123456",
        vatIdentificationNumber: "DE123456789"
      }
    }
  },
  {
    group: "EU Textile",
    label: "footwear-product (item)",
    doc: {
      _comment_gs1_alignment: [
        "This example demonstrates GS1-aligned Digital Product Passport for footwear.",
        "Footwear presents unique DPP challenges: mixed materials (textile, leather, rubber),",
        "different certifications per component, and specific durability metrics.",
        "Key GS1 patterns used:",
        "- GS1 Digital Link URI for product identification",
        "- gs1:textileMaterial for composition (even for non-textile materials in footwear context)",
        "- gs1:certification with gs1:CertificationDetails for multi-standard certifications",
        "- textile: extensions for care, durability, and circularity"
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld",
        {
          gs1: "https://ref.gs1.org/voc/",
          xsd: "http://www.w3.org/2001/XMLSchema#"
        }
      ],
      id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521",
      type: [
        "Footwear",
        "TextileFootwear"
      ],
      gtin: "09521000002159",
      "gs1:serialNumber": "TR-2024-08521",
      productName: [
        {
          "@value": "EcoStride Trail Running Shoe, Forest Green",
          "@language": "en"
        },
        {
          "@value": "EcoStride Trail-Laufschuh, Waldgr\xFCn",
          "@language": "de"
        },
        {
          "@value": "Chaussure de trail EcoStride, Vert for\xEAt",
          "@language": "fr"
        },
        {
          "@value": "Zapatilla de trail EcoStride, Verde bosque",
          "@language": "es"
        },
        {
          "@value": "EcoStride trailschoen, Bosgroen",
          "@language": "nl"
        },
        {
          "@value": "EcoStride traill\xF8besko, Skovgr\xF8n",
          "@language": "da"
        },
        {
          "@value": "But do bieg\xF3w terenowych EcoStride, Le\u015Bna ziele\u0144",
          "@language": "pl"
        },
        {
          "@value": "EcoStride trailrunningsko, Skogsgr\xF6n",
          "@language": "sv"
        },
        {
          "@value": "EcoStride traillesko, Skoggr\xF8nn",
          "@language": "no"
        },
        {
          "@value": "EcoStride polkujuoksukenk\xE4, Mets\xE4nvihre\xE4",
          "@language": "fi"
        },
        {
          "@value": "Scarpa da trail running EcoStride, Verde foresta",
          "@language": "it"
        }
      ],
      "gs1:productDescription": [
        {
          "@value": "Lightweight trail running shoe with recycled upper mesh, chrome-free leather accents, and bio-based rubber outsole. Designed for trail performance and circular end-of-life.",
          "@language": "en"
        },
        {
          "@value": "Leichter Trail-Laufschuh mit recyceltem Obermaterial, chromfreien Lederapplikationen und biobasierter Gummisohle. Konzipiert f\xFCr Trail-Performance und kreislauff\xE4higes Lebensende.",
          "@language": "de"
        },
        {
          "@value": "Chaussure de trail l\xE9g\xE8re avec tige en maille recycl\xE9e, empi\xE8cements en cuir sans chrome et semelle en caoutchouc biosourc\xE9. Con\xE7ue pour la performance en trail et la circularit\xE9 en fin de vie.",
          "@language": "fr"
        },
        {
          "@value": "Zapatilla de trail ligera con malla superior reciclada, refuerzos de cuero sin cromo y suela de caucho de base biol\xF3gica. Pensada para el rendimiento en pista y la circularidad al final de su vida \xFAtil.",
          "@language": "es"
        },
        {
          "@value": "Lichtgewicht trailschoen met gerecyclede bovenmesh, chroomvrije leren accenten en biobased rubberen buitenzool. Ontworpen voor trailprestaties en circulariteit aan het einde van de levensduur.",
          "@language": "nl"
        },
        {
          "@value": "Letv\xE6gts traill\xF8besko med overdel af genbrugsmesh, kromfri l\xE6derdetaljer og bio-baseret gummis\xE5l. Designet til trailpr\xE6station og cirkul\xE6r end-of-life.",
          "@language": "da"
        },
        {
          "@value": "Lekki but do biegania w terenie z g\xF3r\u0105 z siatki z recyklingu, akcentami ze sk\xF3ry bezchromowej i podeszw\u0105 z gumy biopochodnej. Zaprojektowany pod k\u0105tem trailowej wydajno\u015Bci i obiegu zamkni\u0119tego.",
          "@language": "pl"
        },
        {
          "@value": "L\xE4ttviktig trailrunningsko med ovandel av \xE5tervunnen mesh, kromfria l\xE4derdetaljer och biobaserad gummiyttersula. Konstruerad f\xF6r trailprestanda och cirkul\xE4r livsl\xE4ngd.",
          "@language": "sv"
        },
        {
          "@value": "Lett traillesko med overdel av resirkulert mesh, kromfrie l\xE6rdetaljer og biobasert gummis\xE5le. Designet for trailytelse og sirkul\xE6r livssyklus.",
          "@language": "no"
        },
        {
          "@value": "Kevyt polkujuoksukenk\xE4, jonka p\xE4\xE4llinen on kierr\xE4tetty\xE4 mesh-kangasta, krominvapaita nahkayksityiskohtia ja biopohjainen kumipohja. Suunniteltu polkujuoksun suorituskykyyn ja kiertotaloudelle.",
          "@language": "fi"
        },
        {
          "@value": "Scarpa da trail running leggera con tomaia in mesh riciclato, dettagli in pelle senza cromo e suola in gomma a base biologica. Progettata per le prestazioni sul trail e la circolarit\xE0 a fine vita.",
          "@language": "it"
        }
      ],
      textileCategory: "Footwear",
      garmentType: "Trail Running Shoe",
      targetGender: "Unisex",
      sizeRange: "36-48 EU",
      seasonCollection: "SS2025",
      fabricType: "Knitted",
      "gs1:manufacturer": {
        id: "https://id.dev.epcis.cloud/417/9521234000006",
        type: "gs1:Organization",
        "gs1:organizationName": "GreenStep Footwear AG",
        "gs1:gln": "9521234000006",
        "gs1:address": {
          id: "https://id.dev.epcis.cloud/417/9521234000006#address",
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Via della Sostenibilita 100",
          "gs1:addressLocality": "Montebelluna",
          "gs1:postalCode": "31044",
          "gs1:countryCode": "IT"
        },
        "gs1:contactPoint": {
          type: "gs1:ContactPoint",
          "gs1:email": "info@greenstep.example.com",
          "gs1:url": {
            id: "https://www.greenstep.example.com"
          }
        }
      },
      "dpp:operatorInformation": {
        id: "https://id.dev.epcis.cloud/417/9521234000006#operator",
        type: "dpp:OperatorInformation",
        "gs1:gln": "9521234000006",
        "gs1:organizationName": "GreenStep Footwear AG",
        "dpp:operatorRole": {
          id: "dpp:Manufacturer"
        },
        "gs1:address": {
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Via della Sostenibilita 100",
          "gs1:addressLocality": "Montebelluna",
          "gs1:postalCode": "31044",
          "gs1:countryCode": "IT"
        }
      },
      "gs1:countryOfOrigin": "IT",
      "gs1:manufacturingDate": "2024-11-20",
      "gs1:netWeight": {
        type: "QuantitativeValue",
        value: 0.54,
        unitCode: "KGM"
      },
      _comment_composition: "Footwear typically has distinct upper, midsole, and outsole compositions",
      textileMaterial: [
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 45,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Recycled Polyester Mesh (Upper)",
            "@language": "en"
          }
        },
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 15,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Chrome-Free Leather (Accents)",
            "@language": "en"
          }
        },
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 25,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Bio-based EVA (Midsole)",
            "@language": "en"
          }
        },
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 10,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Natural Rubber (Outsole)",
            "@language": "en"
          }
        },
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 5,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Recycled Polyester (Laces)",
            "@language": "en"
          }
        }
      ],
      careInstructions: {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#care",
        type: "CareInstruction",
        washingSymbol: "WashHandOnly",
        bleachingSymbol: "DoNotBleach",
        dryingSymbol: "LineDry",
        ironingSymbol: "DoNotIron",
        dryCleaningSymbol: "DoNotDryClean",
        additionalCareInstructions: {
          "@value": "Remove insoles before cleaning. Brush off dirt when dry. Spot clean with damp cloth and mild soap. Do not machine wash or tumble dry. Air dry away from direct heat.",
          "@language": "en"
        }
      },
      durabilityInfo: {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#durability",
        type: "DurabilityInfo",
        durabilityClass: "DurabilityB",
        abrasionResistance: 25e3,
        expectedLifetimeYears: 3,
        _comment: "For footwear, we use km rating instead of wash cycles",
        additionalCareInstructions: {
          "@value": "Expected lifespan: 800-1000 km of trail running",
          "@language": "en"
        }
      },
      microplasticInfo: {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#microplastic",
        type: "MicroplasticInfo",
        microplasticRiskLevel: "LowShedding",
        syntheticFiberContent: 50,
        microplasticMitigationMeasures: {
          "@value": "Upper mesh features tight weave construction. All synthetic materials are solution-dyed to reduce chemical treatments. Hand wash only instruction reduces microfiber release compared to machine washing.",
          "@language": "en"
        }
      },
      _comment_robustness: "Robustness score per EU Preparatory Study 3rd Milestone (0-10)",
      robustnessAssessment: {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#robustness",
        type: "RobustnessAssessment",
        robustnessScore: 7,
        cleaningCyclesBeforeTest: 5,
        robustnessTestFabricType: "Knitted",
        spiralityTest: {
          type: "SpiralityTestResult",
          spiralityScore: 2,
          spiralityPercentage: 5.8,
          spiralityTestMethod: "ISO 16322-3"
        },
        dimensionalChangeTest: {
          type: "DimensionalChangeTestResult",
          dimensionalChangeScore: 2,
          dimensionalChangePercentage: 5.2,
          dimensionalChangeTestMethod: "ISO 3759"
        },
        visualInspection: {
          type: "VisualInspectionResult",
          visualInspectionScore: 3,
          colourChangeRating: 4,
          fabricAppearanceRating: 4,
          seamAppearanceRating: 4,
          nonTextilePartsRating: 5,
          visualInspectionTestMethod: "ISO 15487"
        }
      },
      _comment_recyclability: "Recyclability score per EU Preparatory Study 3rd Milestone (0-10)",
      recyclabilityAssessment: {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#recyclability",
        type: "RecyclabilityAssessment",
        recyclabilityScore: 4,
        isRecyclable: true,
        elastaneContentPercent: 0,
        sortingFactors: {
          type: "SortingFactors",
          sameInnerOuterComposition: false,
          freeFromPrintings: true,
          freeFromCoatings: false,
          freeFromSequins: true
        },
        technicalRecyclability: {
          type: "TechnicalRecyclability",
          technicalRecyclabilityScore: 2,
          applicableRecyclingTechnology: "MechanicalRecycling"
        }
      },
      recycledContentDeclaration: [
        {
          id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#rc-rpet",
          type: "RecycledContentDeclaration",
          secondaryMaterialFraction: 50,
          wasteOriginType: "PostConsumer",
          recycledSourceType: "OpenLoop",
          chainOfCustodyMethod: "Certified",
          meetsTargetThreshold: true,
          verificationCertification: {
            type: "gs1:CertificationDetails",
            "gs1:certificationAgency": "Textile Exchange",
            "gs1:certificationStandard": "Global Recycled Standard (GRS)",
            "gs1:certificationIdentification": "GRS-2024-GREENSTEP-001"
          }
        }
      ],
      environmentalFootprint: {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#footprint",
        type: "EnvironmentalFootprint",
        carbonFootprintManufacturing: 8.2,
        pefSingleScore: 28.7,
        benchmarkPerformance: -22,
        dataTypeIndicator: "MixedData",
        pefcrReference: "PEFCR Apparel & Footwear v1.3",
        lciaCategories: [
          {
            type: "LCIACategory",
            lciaCategoryCode: "GWP",
            lciaValue: 8.2,
            lciaUnit: "kg CO2-eq"
          },
          {
            type: "LCIACategory",
            lciaCategoryCode: "WaterUse",
            lciaValue: 0.5,
            lciaUnit: "m3 world-eq"
          }
        ]
      },
      "dpp:recycledContent": {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#recycled",
        type: "dpp:RecycledContent",
        "dpp:totalRecycledShare": 50,
        "dpp:preConsumerShare": 10,
        "dpp:postConsumerShare": 40
      },
      "dpp:carbonFootprintTotal": 8.2,
      "dpp:carbonFootprintUnit": "kg CO2e per pair",
      "dpp:carbonFootprintStudyUrl": "https://www.greenstep.example.com/sustainability/cfp-ecostride.pdf",
      waterUsage: {
        type: "QuantitativeValue",
        value: 35,
        unitCode: "LTR"
      },
      energyUsage: {
        type: "QuantitativeValue",
        value: 12,
        unitCode: "KWH"
      },
      productionWastePercentage: 12,
      pfasFree: true,
      biodegradable: false,
      hasTakeBackProgram: true,
      takeBackProgram: {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#takeback",
        type: "TakeBackProgram",
        takeBackUrl: "https://www.greenstep.example.com/recycle",
        takeBackIncentive: {
          "@value": "Return worn shoes to any GreenStep retailer and receive 20 EUR credit toward your next purchase",
          "@language": "en"
        },
        endOfLifeDestination: {
          "@value": "Shoes are disassembled: rubber outsoles ground for athletic surfaces, uppers recycled into insulation, leather components processed for leather goods industry",
          "@language": "en"
        }
      },
      recyclingInstructions: {
        "@value": "Do not dispose in household waste. Return to GreenStep retailer or designated shoe collection point. Shoes will be disassembled for material recovery.",
        "@language": "en"
      },
      "gs1:consumerRecyclingInstructions": {
        "@value": "This footwear can be recycled through the GreenStep take-back program. Return to any participating retailer.",
        "@language": "en"
      },
      isRepairable: true,
      repairGuideUrl: "https://www.greenstep.example.com/repair/ecostride-guide",
      sparePartsAvailable: true,
      sparePartsUrl: "https://www.greenstep.example.com/spareparts",
      "dpp:repairabilityInfo": {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#repairability",
        type: "dpp:RepairabilityInfo",
        "dpp:repairabilityScore": 6.5,
        "dpp:repairabilityClass": "C",
        "dpp:sparePartsAvailability": {
          type: "QuantitativeValue",
          value: 5,
          unitCode: "ANN"
        },
        "dpp:diyRepairPossible": true,
        "dpp:professionalRepairNetwork": "https://www.greenstep.example.com/repair/partners"
      },
      _comment_spareparts: "Spare parts available: replacement insoles, laces, heel counters",
      "gs1:certification": [
        {
          id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#cert-grs",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "Textile Exchange",
          "gs1:certificationStandard": "Global Recycled Standard (GRS)",
          "gs1:certificationIdentification": "GRS-2024-GREENSTEP-001",
          "gs1:certificationStartDate": "2024-06-01",
          "gs1:certificationEndDate": "2025-05-31"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#cert-lwg",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "Leather Working Group",
          "gs1:certificationStandard": "LWG Gold Rated",
          "gs1:certificationIdentification": "LWG-2024-GREENSTEP-002",
          _comment: "Leather component certified chrome-free and from LWG Gold-rated tannery"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#cert-oekotex",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "OEKO-TEX Association",
          "gs1:certificationStandard": "OEKO-TEX Standard 100 Class I",
          "gs1:certificationIdentification": "SH025 654321 TESTEX",
          _comment: "Class I certification - safe for baby contact (highest safety class)"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#cert-fsc",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "Forest Stewardship Council",
          "gs1:certificationStandard": "FSC 100%",
          "gs1:certificationIdentification": "FSC-C123456",
          _comment: "Natural rubber from FSC-certified plantations"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#cert-bcorp",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "B Lab",
          "gs1:certificationStandard": "B Corporation",
          "gs1:certificationIdentification": "B-Corp-GREENSTEP-2024",
          _comment: "Company-level certification for social and environmental performance"
        }
      ],
      cutAndSewFacility: {
        id: "https://id.dev.epcis.cloud/414/4098765000010",
        type: "dpp:FacilityInformation",
        gln: "4098765000010",
        name: "GreenStep Montebelluna Factory",
        "dpp:facilityType": "Footwear Assembly",
        address: {
          type: "gs1:PostalAddress",
          "gs1:addressLocality": "Montebelluna",
          "gs1:countryCode": "IT"
        },
        "dpp:facilityCertifications": [
          {
            type: "gs1:CertificationDetails",
            "gs1:certificationStandard": "ISO 14001:2015",
            "gs1:certificationIdentification": "EMS-IT-2024-789"
          },
          {
            type: "gs1:CertificationDetails",
            "gs1:certificationStandard": "ISO 45001:2018",
            "gs1:certificationIdentification": "OHS-IT-2024-012"
          },
          {
            type: "gs1:CertificationDetails",
            "gs1:certificationStandard": "SA8000",
            "gs1:certificationIdentification": "SA-IT-2024-345"
          }
        ]
      },
      "gs1:warranty": {
        type: "gs1:WarrantyPromise",
        "gs1:durationOfWarranty": "P2Y",
        "gs1:warrantyScope": "Covers manufacturing defects including delamination, stitching failures, and premature sole separation. Does not cover normal wear patterns or misuse."
      },
      "dpp:documents": [
        {
          id: "https://www.greenstep.example.com/docs/ecostride-user-guide.pdf",
          type: "dpp:DocumentReference",
          "dpp:documentType": {
            id: "dpp:Manual"
          },
          "dpp:documentUrl": "https://www.greenstep.example.com/docs/ecostride-user-guide.pdf",
          "schema:name": "EcoStride Care & Maintenance Guide",
          "dpp:mimeType": "application/pdf",
          "dpp:languageCode": "en"
        },
        {
          id: "https://www.greenstep.example.com/docs/transparency-report-2024.pdf",
          type: "dpp:DocumentReference",
          "dpp:documentType": {
            id: "dpp:DueDiligenceDocument"
          },
          "dpp:documentUrl": "https://www.greenstep.example.com/docs/transparency-report-2024.pdf",
          "schema:name": "Supply Chain Transparency Report 2024",
          "dpp:mimeType": "application/pdf",
          "dpp:languageCode": "en",
          "dpp:issueDate": "2024-03-15"
        }
      ],
      "gs1:referencedFile": [
        {
          id: "https://www.greenstep.example.com/docs/ecostride-user-guide.pdf",
          type: "gs1:ReferencedFileDetails",
          "gs1:referencedFileType": {
            id: "gs1:ReferencedFileTypeCode-USER_MANUAL"
          },
          "gs1:contentDescription": "Care & Maintenance Guide",
          "gs1:fileLanguageCode": "en"
        },
        {
          id: "https://www.greenstep.example.com/docs/ecostride-certifications.pdf",
          type: "gs1:ReferencedFileDetails",
          "gs1:referencedFileType": {
            id: "gs1:ReferencedFileTypeCode-CERTIFICATION"
          },
          "gs1:contentDescription": "Product Certifications (GRS, LWG, OEKO-TEX, FSC)",
          "gs1:fileLanguageCode": "en"
        }
      ],
      "dpp:accessRights": {
        id: "https://id.dev.epcis.cloud/01/09521000002159/21/TR-2024-08521#access",
        type: "dpp:AccessRights",
        "dpp:accessLevel": {
          id: "dpp:Public"
        }
      },
      "dpp:passportIdentifier": "https://dpp.greenstep.example.com/passport/TR-2024-08521",
      "dpp:passportVersion": "1.0",
      "dpp:passportIssueDate": "2024-11-25",
      "dpp:passportStatus": "Active",
      "dpp:productCategory": {
        id: "dpp:Textiles"
      },
      "dpp:lastDataUpdate": "2024-12-01T09:00:00Z",
      "dpp:dataQualityAssessment": "A"
    }
  },
  {
    group: "EU Textile",
    label: "garment-product (item)",
    doc: {
      _comment_gs1_alignment: [
        "This example demonstrates GS1-aligned Digital Product Passport modeling for textiles.",
        "Key GS1 patterns used:",
        "- GS1 Digital Link URI for product identification (https://id.dev.epcis.cloud/01/{GTIN}/21/{serial})",
        "- gs1:Product as base type (textile specificity comes from textile:TextileApparel / textile:TextileFootwear dual-typing plus textile: extension properties)",
        "- GS1 properties: gs1:gtin, gs1:productName, gs1:manufacturer, gs1:netWeight",
        "- gs1:textileMaterial with gs1:TextileMaterialDetails for fiber composition (GS1 native)",
        "- gs1:certification with gs1:CertificationDetails for certifications",
        "- gs1:QuantitativeValue for all measurements with unitCode",
        "- Textile-specific extensions for care symbols, durability, microplastics",
        "See EXTENSION-GOVERNANCE.md for rationale on each extension term."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld",
        {
          gs1: "https://ref.gs1.org/voc/",
          xsd: "http://www.w3.org/2001/XMLSchema#"
        }
      ],
      id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142",
      type: [
        "Clothing",
        "TextileApparel"
      ],
      gtin: "09521000001428",
      "gs1:serialNumber": "WJ-2024-00142",
      productName: [
        {
          "@value": "Alpine Pro Winter Jacket, Navy",
          "@language": "en"
        },
        {
          "@value": "Alpine Pro Winterjacke, Marineblau",
          "@language": "de"
        },
        {
          "@value": "Veste d'hiver Alpine Pro, Bleu marine",
          "@language": "fr"
        },
        {
          "@value": "Chaqueta de invierno Alpine Pro, Azul marino",
          "@language": "es"
        },
        {
          "@value": "Alpine Pro winterjas, Marineblauw",
          "@language": "nl"
        },
        {
          "@value": "Alpine Pro vinterjakke, Marinebl\xE5",
          "@language": "da"
        },
        {
          "@value": "Kurtka zimowa Alpine Pro, Granatowa",
          "@language": "pl"
        },
        {
          "@value": "Alpine Pro vinterjacka, Marinbl\xE5",
          "@language": "sv"
        },
        {
          "@value": "Alpine Pro vinterjakke, Marinebl\xE5",
          "@language": "no"
        },
        {
          "@value": "Alpine Pro talvitakki, Laivastonsininen",
          "@language": "fi"
        },
        {
          "@value": "Giacca invernale Alpine Pro, Blu navy",
          "@language": "it"
        }
      ],
      "gs1:productDescription": [
        {
          "@value": "Water-resistant insulated winter jacket with recycled polyester shell and responsibly sourced down filling. Designed for durability and warmth in alpine conditions.",
          "@language": "en"
        },
        {
          "@value": "Wasserabweisende, isolierte Winterjacke mit Au\xDFenstoff aus recyceltem Polyester und verantwortungsvoll gewonnener Daunenf\xFCllung. Entwickelt f\xFCr Langlebigkeit und W\xE4rme im alpinen Einsatz.",
          "@language": "de"
        },
        {
          "@value": "Veste d'hiver isol\xE9e et d\xE9perlante, coque en polyester recycl\xE9 et garnissage en duvet issu de fili\xE8res responsables. Con\xE7ue pour la durabilit\xE9 et la chaleur en haute montagne.",
          "@language": "fr"
        },
        {
          "@value": "Chaqueta de invierno aislante e impermeable con tejido exterior de poli\xE9ster reciclado y relleno de plum\xF3n de origen responsable. Dise\xF1ada para ofrecer calidez y resistencia en condiciones alpinas.",
          "@language": "es"
        },
        {
          "@value": "Waterafstotende, ge\xEFsoleerde winterjas met buitenstof van gerecycled polyester en verantwoord gewonnen donsvulling. Gemaakt voor duurzaamheid en warmte in alpiene omstandigheden.",
          "@language": "nl"
        },
        {
          "@value": "Vandafvisende, isoleret vinterjakke med yderstof af genbrugspolyester og ansvarligt indhentet dunfyld. Designet til varme og holdbarhed under alpine forhold.",
          "@language": "da"
        },
        {
          "@value": "Wodoodporna, ocieplana kurtka zimowa z poszyciem z poliestru z recyklingu i wype\u0142nieniem z odpowiedzialnie pozyskiwanego puchu. Zaprojektowana z my\u015Bl\u0105 o trwa\u0142o\u015Bci i cieple w warunkach alpejskich.",
          "@language": "pl"
        },
        {
          "@value": "Vattenavvisande, isolerad vinterjacka med yttertyg av \xE5tervunnen polyester och ansvarsfullt framtagen dunfyllning. Konstruerad f\xF6r v\xE4rme och h\xE5llbarhet under alpina f\xF6rh\xE5llanden.",
          "@language": "sv"
        },
        {
          "@value": "Vannavst\xF8tende, isolert vinterjakke med yttermateriale i resirkulert polyester og ansvarlig hentet dunfyll. Designet for varme og slitestyrke i alpine forhold.",
          "@language": "no"
        },
        {
          "@value": "Vedenpit\xE4v\xE4, eristetty talvitakki, jonka p\xE4\xE4llikangas on kierr\xE4tetty\xE4 polyesteri\xE4 ja t\xE4yte vastuullisesti hankittua untuvaa. Suunniteltu kest\xE4vyyteen ja l\xE4mp\xF6\xF6n alppiolosuhteissa.",
          "@language": "fi"
        },
        {
          "@value": "Giacca invernale isolante e impermeabile con tessuto esterno in poliestere riciclato e imbottitura in piuma di provenienza responsabile. Progettata per garantire calore e durata in condizioni alpine.",
          "@language": "it"
        }
      ],
      textileCategory: "Apparel",
      garmentType: "Winter Jacket",
      targetGender: "Unisex",
      sizeRange: "XS-3XL",
      seasonCollection: "FW2024",
      fabricType: "WovenNonDenim",
      apparelSubcategory: "JacketsCoats",
      "gs1:manufacturer": {
        id: "https://id.dev.epcis.cloud/417/9521000000018",
        type: "gs1:Organization",
        "gs1:organizationName": "EcoWear GmbH",
        "gs1:gln": "9521000000018",
        "gs1:address": {
          id: "https://id.dev.epcis.cloud/417/9521000000018#address",
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Textilstra\xDFe 25",
          "gs1:addressLocality": "Munich",
          "gs1:postalCode": "80331",
          "gs1:countryCode": "DE"
        },
        "gs1:contactPoint": {
          type: "gs1:ContactPoint",
          "gs1:email": "info@ecowear.example.com",
          "gs1:url": {
            id: "https://www.ecowear.example.com"
          }
        }
      },
      "dpp:operatorInformation": {
        id: "https://id.dev.epcis.cloud/417/9521000000018#operator",
        type: "dpp:OperatorInformation",
        "gs1:gln": "9521000000018",
        "gs1:organizationName": "EcoWear GmbH",
        "dpp:operatorRole": {
          id: "dpp:Manufacturer"
        },
        "gs1:address": {
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Textilstra\xDFe 25",
          "gs1:addressLocality": "Munich",
          "gs1:postalCode": "80331",
          "gs1:countryCode": "DE"
        },
        "gs1:contactPoint": {
          type: "gs1:ContactPoint",
          "gs1:email": "sustainability@ecowear.example.com",
          "gs1:telephone": "+49-89-555-0100"
        }
      },
      "gs1:countryOfOrigin": "PT",
      "gs1:manufacturingDate": "2024-09-15",
      "gs1:netWeight": {
        type: "QuantitativeValue",
        value: 0.85,
        unitCode: "KGM"
      },
      _comment_composition: "GS1-native fiber composition (gs1:textileMaterial + gs1:TextileMaterialDetails + gs1:textileMaterialContent + gs1:textileMaterialDescription). Textile-specific traceability fields (fiberOrigin, isRecycledFiber, recycledContentSource, fiberCertification) are attached inline on each gs1:TextileMaterialDetails entry.",
      textileMaterial: [
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 55,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Recycled Polyester (Shell)",
            "@language": "en"
          },
          fiberOrigin: "TW",
          isRecycledFiber: true,
          recycledContentSource: "Post-consumer PET bottles",
          fiberCertification: {
            type: "CertificationDetails",
            certificationAgency: "Textile Exchange",
            certificationStandard: "Global Recycled Standard (GRS)",
            certificationValue: "GRS-2024-TW-12345"
          }
        },
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 25,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Down (Insulation - RDS Certified)",
            "@language": "en"
          },
          fiberOrigin: "HU",
          isRecycledFiber: false,
          fiberCertification: {
            type: "CertificationDetails",
            certificationAgency: "Textile Exchange",
            certificationStandard: "Responsible Down Standard (RDS)",
            certificationValue: "RDS-2024-HU-67890"
          }
        },
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 15,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Polyamide (Lining)",
            "@language": "en"
          },
          fiberOrigin: "IT",
          isRecycledFiber: false
        },
        {
          type: "TextileMaterialDetails",
          textileMaterialContent: {
            type: "QuantitativeValue",
            value: 5,
            unitCode: "P1"
          },
          textileMaterialDescription: {
            "@value": "Elastane (Cuffs)",
            "@language": "en"
          },
          fiberOrigin: "DE",
          isRecycledFiber: false
        }
      ],
      careInstructions: {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#care",
        type: "CareInstruction",
        washingSymbol: "Wash30",
        bleachingSymbol: "DoNotBleach",
        dryingSymbol: "TumbleDryLow",
        ironingSymbol: "DoNotIron",
        dryCleaningSymbol: "DryCleanHydrocarbon",
        additionalCareInstructions: {
          "@value": "Close zippers before washing. Use down-specific detergent. Add tennis balls to dryer to restore loft.",
          "@language": "en"
        }
      },
      durabilityInfo: {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#durability",
        type: "DurabilityInfo",
        expectedWashCycles: 150,
        durabilityClass: "DurabilityB",
        pillingResistance: 4,
        colorFastness: 4,
        dimensionalStability: 2,
        abrasionResistance: 4e4,
        tensileStrength: {
          type: "QuantitativeValue",
          value: 800,
          unitCode: "NEW"
        },
        tearStrength: {
          type: "QuantitativeValue",
          value: 35,
          unitCode: "NEW"
        },
        expectedLifetimeYears: 8
      },
      microplasticInfo: {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#microplastic",
        type: "MicroplasticInfo",
        microplasticRiskLevel: "MediumShedding",
        sheddingRate: {
          type: "QuantitativeValue",
          value: 120,
          unitCode: "MGM"
        },
        syntheticFiberContent: 75,
        microplasticMitigationMeasures: {
          "@value": "Tightly woven fabric reduces fiber release. Recommend using microfiber-catching laundry bag.",
          "@language": "en"
        }
      },
      _comment_robustness: "Robustness score per EU Preparatory Study 3rd Milestone (0-10)",
      robustnessAssessment: {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#robustness",
        type: "RobustnessAssessment",
        robustnessScore: 8,
        cleaningCyclesBeforeTest: 5,
        robustnessTestFabricType: "WovenNonDenim",
        spiralityTest: {
          type: "SpiralityTestResult",
          spiralityScore: 3,
          spiralityPercentage: 4.2,
          spiralityTestMethod: "ISO 16322-3",
          testStandard: "ISO16322_3"
        },
        dimensionalChangeTest: {
          type: "DimensionalChangeTestResult",
          dimensionalChangeScore: 2,
          dimensionalChangePercentage: 3.2,
          dimensionalChangeTestMethod: "ISO 3759",
          testStandard: "ISO3759"
        },
        visualInspection: {
          type: "VisualInspectionResult",
          visualInspectionScore: 3,
          colourChangeRating: 4,
          fabricAppearanceRating: 4,
          seamAppearanceRating: 5,
          nonTextilePartsRating: 4,
          visualInspectionTestMethod: "ISO 15487",
          testStandard: "ISO15487"
        }
      },
      _comment_recyclability: "Recyclability score per EU Preparatory Study 3rd Milestone (0-10)",
      recyclabilityAssessment: {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#recyclability",
        type: "RecyclabilityAssessment",
        recyclabilityScore: 6.5,
        isRecyclable: true,
        elastaneContentPercent: 5,
        sortingFactors: {
          type: "SortingFactors",
          sameInnerOuterComposition: false,
          freeFromPrintings: true,
          freeFromCoatings: false,
          freeFromSequins: true
        },
        technicalRecyclability: {
          type: "TechnicalRecyclability",
          technicalRecyclabilityScore: 4,
          applicableRecyclingTechnology: "ThermoChemicalRecycling"
        }
      },
      _comment_recycled_content_structured: "Structured recycled content declaration per EU Preparatory Study 3rd Milestone",
      recycledContentDeclaration: [
        {
          id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#rc-rpet",
          type: "RecycledContentDeclaration",
          secondaryMaterialFraction: 50,
          wasteOriginType: "PostConsumer",
          recycledSourceType: "OpenLoop",
          chainOfCustodyMethod: "Certified",
          meetsTargetThreshold: true,
          verificationCertification: {
            type: "gs1:CertificationDetails",
            "gs1:certificationAgency": "Textile Exchange",
            "gs1:certificationStandard": "Global Recycled Standard (GRS)",
            "gs1:certificationIdentification": "GRS-2024-ECOWEAR-001"
          }
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#rc-precon",
          type: "RecycledContentDeclaration",
          secondaryMaterialFraction: 5,
          wasteOriginType: "PostIndustrial",
          recycledSourceType: "FiberToFiber",
          chainOfCustodyMethod: "MassBalance",
          meetsTargetThreshold: true
        }
      ],
      _comment_environmental_footprint: "Environmental footprint per PEFCR Apparel & Footwear",
      environmentalFootprint: {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#footprint",
        type: "EnvironmentalFootprint",
        carbonFootprintManufacturing: 18.5,
        pefSingleScore: 42.3,
        benchmarkPerformance: -15.2,
        dataTypeIndicator: "MixedData",
        pefcrReference: "PEFCR Apparel & Footwear v1.3",
        lciaCategories: [
          {
            type: "LCIACategory",
            lciaCategoryCode: "GWP",
            lciaValue: 18.5,
            lciaUnit: "kg CO2-eq"
          },
          {
            type: "LCIACategory",
            lciaCategoryCode: "WaterUse",
            lciaValue: 2.8,
            lciaUnit: "m3 world-eq"
          }
        ]
      },
      _comment_soc: "Substances of Concern per ESPR Article 7(5) 4-type classification",
      substancesOfConcern: [
        {
          id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#soc-dye",
          type: "SubstanceOfConcern",
          socType: "SoCTypeB",
          chemicalName: "Disperse Blue 291",
          iupacName: "3-(2-Cyano-4,6-dinitrophenylazo)-N-ethyl-N-(2-acetoxyethyl)aniline",
          casNumber: "56548-64-2",
          clpHazardCategory: "Sensitizer",
          substanceConcentration: 8e-3,
          locationInProduct: "Shell fabric dye",
          safeUseInstructions: "Wash before first wear. Suitable for skin contact per OEKO-TEX Standard 100 Class II.",
          endOfLifeHandling: "No special handling required at detected concentration."
        }
      ],
      "dpp:recycledContent": {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#recycled",
        type: "dpp:RecycledContent",
        "dpp:totalRecycledShare": 55,
        "dpp:preConsumerShare": 5,
        "dpp:postConsumerShare": 50
      },
      "dpp:carbonFootprintTotal": 18.5,
      "dpp:carbonFootprintUnit": "kg CO2e per garment",
      "dpp:carbonFootprintStudyUrl": "https://www.ecowear.example.com/sustainability/cfp-alpine-pro.pdf",
      waterUsage: {
        type: "QuantitativeValue",
        value: 2500,
        unitCode: "LTR"
      },
      energyUsage: {
        type: "QuantitativeValue",
        value: 45,
        unitCode: "KWH"
      },
      productionWastePercentage: 8.5,
      pfasFree: true,
      biodegradable: false,
      hasTakeBackProgram: true,
      takeBackProgram: {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#takeback",
        type: "TakeBackProgram",
        takeBackUrl: "https://www.ecowear.example.com/takeback",
        takeBackIncentive: {
          "@value": "15% discount voucher on next purchase when returning end-of-life products to any EcoWear store",
          "@language": "en"
        },
        endOfLifeDestination: {
          "@value": "Products sorted for: resale (good condition), fiber-to-fiber recycling (damaged), or energy recovery (non-recyclable)",
          "@language": "en"
        }
      },
      recyclingInstructions: {
        "@value": "Remove all metal components (zippers, snaps) before textile recycling. Down can be recovered separately.",
        "@language": "en"
      },
      "gs1:consumerRecyclingInstructions": {
        "@value": "This product can be returned to any EcoWear store for recycling. Do not dispose of in household waste.",
        "@language": "en"
      },
      isRepairable: true,
      repairGuideUrl: "https://www.ecowear.example.com/repair/alpine-pro-guide",
      sparePartsAvailable: true,
      sparePartsUrl: "https://www.ecowear.example.com/spareparts/alpine-pro",
      repairServices: [
        {
          id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#repair-service",
          type: "Organization",
          "gs1:organizationName": "EcoWear Repair Service",
          "gs1:address": {
            type: "gs1:PostalAddress",
            "gs1:streetAddress": "Reparaturweg 5",
            "gs1:addressLocality": "Munich",
            "gs1:postalCode": "80333",
            "gs1:countryCode": "DE"
          },
          "gs1:contactPoint": {
            type: "gs1:ContactPoint",
            "gs1:email": "repair@ecowear.example.com",
            "gs1:url": {
              id: "https://repair.ecowear.example.com"
            }
          }
        }
      ],
      "dpp:repairabilityInfo": {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#repairability",
        type: "dpp:RepairabilityInfo",
        "dpp:repairabilityScore": 7.2,
        "dpp:repairabilityClass": "B",
        "dpp:sparePartsAvailability": {
          type: "QuantitativeValue",
          value: 10,
          unitCode: "ANN"
        },
        "dpp:diyRepairPossible": true,
        "dpp:professionalRepairNetwork": "https://repair.ecowear.example.com/find-service"
      },
      "gs1:certification": [
        {
          id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#cert-grs",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "Textile Exchange",
          "gs1:certificationStandard": "Global Recycled Standard (GRS)",
          "gs1:certificationIdentification": "GRS-2024-ECOWEAR-001",
          "gs1:certificationStartDate": "2024-01-15",
          "gs1:certificationEndDate": "2025-01-14"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#cert-oekotex",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "OEKO-TEX Association",
          "gs1:certificationStandard": "OEKO-TEX Standard 100",
          "gs1:certificationIdentification": "SH025 123456 TESTEX",
          "gs1:certificationStartDate": "2024-03-01",
          "gs1:certificationEndDate": "2025-02-28"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#cert-bluesign",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "bluesign technologies ag",
          "gs1:certificationStandard": "bluesign PRODUCT",
          "gs1:certificationIdentification": "BS-2024-ECOWEAR-AP"
        },
        {
          id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#cert-rds",
          type: "gs1:CertificationDetails",
          "gs1:certificationAgency": "Textile Exchange",
          "gs1:certificationStandard": "Responsible Down Standard (RDS)",
          "gs1:certificationIdentification": "RDS-2024-ECOWEAR-002"
        }
      ],
      cutAndSewFacility: {
        id: "https://id.dev.epcis.cloud/414/9521234000020",
        type: "dpp:FacilityInformation",
        gln: "9521234000020",
        name: "Porto Textile Manufacturing",
        "dpp:facilityType": "Cut and Sew",
        address: {
          type: "gs1:PostalAddress",
          "gs1:addressLocality": "Porto",
          "gs1:countryCode": "PT"
        },
        "dpp:facilityCertifications": [
          {
            type: "gs1:CertificationDetails",
            "gs1:certificationStandard": "ISO 14001:2015",
            "gs1:certificationIdentification": "EMS-PT-2024-123"
          },
          {
            type: "gs1:CertificationDetails",
            "gs1:certificationStandard": "SA8000",
            "gs1:certificationIdentification": "SA-PT-2024-456"
          }
        ]
      },
      dyeingFacility: {
        id: "https://id.dev.epcis.cloud/414/9521234000037",
        type: "dpp:FacilityInformation",
        gln: "9521234000037",
        name: "Eco Dyeing Italy",
        "dpp:facilityType": "Dyeing and Finishing",
        address: {
          type: "gs1:PostalAddress",
          "gs1:addressLocality": "Como",
          "gs1:countryCode": "IT"
        },
        "dpp:facilityCertifications": [
          {
            type: "gs1:CertificationDetails",
            "gs1:certificationStandard": "ZDHC MRSL v3.1",
            "gs1:certificationIdentification": "ZDHC-IT-2024-789"
          }
        ]
      },
      "gs1:warranty": {
        type: "gs1:WarrantyPromise",
        "gs1:durationOfWarranty": "P2Y",
        "gs1:warrantyScope": "Covers manufacturing defects. Does not cover normal wear, improper care, or accidental damage."
      },
      "dpp:documents": [
        {
          id: "https://www.ecowear.example.com/docs/alpine-pro-user-guide.pdf",
          type: "dpp:DocumentReference",
          "dpp:documentType": {
            id: "dpp:Manual"
          },
          "dpp:documentUrl": "https://www.ecowear.example.com/docs/alpine-pro-user-guide.pdf",
          "schema:name": "Alpine Pro User & Care Guide",
          "dpp:mimeType": "application/pdf",
          "dpp:languageCode": "en"
        },
        {
          id: "https://www.ecowear.example.com/docs/supply-chain-transparency-2024.pdf",
          type: "dpp:DocumentReference",
          "dpp:documentType": {
            id: "dpp:DueDiligenceDocument"
          },
          "dpp:documentUrl": "https://www.ecowear.example.com/docs/supply-chain-transparency-2024.pdf",
          "schema:name": "Supply Chain Transparency Report 2024",
          "dpp:mimeType": "application/pdf",
          "dpp:languageCode": "en",
          "dpp:issueDate": "2024-04-01"
        }
      ],
      "gs1:referencedFile": [
        {
          id: "https://www.ecowear.example.com/docs/alpine-pro-user-guide.pdf",
          type: "gs1:ReferencedFileDetails",
          "gs1:referencedFileType": {
            id: "gs1:ReferencedFileTypeCode-USER_MANUAL"
          },
          "gs1:contentDescription": "User and Care Guide",
          "gs1:fileLanguageCode": "en"
        },
        {
          id: "https://www.ecowear.example.com/docs/alpine-pro-certifications.pdf",
          type: "gs1:ReferencedFileDetails",
          "gs1:referencedFileType": {
            id: "gs1:ReferencedFileTypeCode-CERTIFICATION"
          },
          "gs1:contentDescription": "Product Certifications (GRS, OEKO-TEX, bluesign, RDS)",
          "gs1:fileLanguageCode": "en"
        }
      ],
      "dpp:accessRights": {
        id: "https://id.dev.epcis.cloud/01/09521000001428/21/WJ-2024-00142#access",
        type: "dpp:AccessRights",
        "dpp:accessLevel": {
          id: "dpp:Public"
        }
      },
      "dpp:passportIdentifier": "https://dpp.ecowear.example.com/passport/WJ-2024-00142",
      "dpp:passportVersion": "1.0",
      "dpp:passportIssueDate": "2024-09-20",
      "dpp:passportStatus": "Active",
      "dpp:productCategory": {
        id: "dpp:Textiles"
      },
      "dpp:lastDataUpdate": "2024-10-15T10:30:00Z",
      "dpp:dataQualityAssessment": "A"
    }
  },
  {
    group: "EU Textile",
    label: "garment-set-itip (item)",
    doc: {
      _comment_gs1_alignment: [
        "This example demonstrates ITIP (Individual Trade Item Piece) identification for a multi-piece trade item.",
        "A two-piece suit is sold under a single GTIN but consists of two physical pieces (jacket + trousers).",
        "Pattern aligned with GS1 GSMP Work Request WR 25-212 (Community Review).",
        "Key GS1 patterns used:",
        "- GS1 Digital Link URI for the parent trade item (the suit set)",
        "- dpp:tradeItemPieceCount on the parent product (2 pieces)",
        "- dpp:IndividualTradeItemPiece for each constituent piece, each with its own AI 8026 identifier",
        "- GS1 AI 8026 encodes GTIN + total piece count + this piece's number",
        "- All pieces share the same GTIN; individual identification is via piece number",
        "Reference: WR 25-212 (https://xchange.gs1.org/cr/gsmp)"
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld",
        {
          gs1: "https://ref.gs1.org/voc/",
          xsd: "http://www.w3.org/2001/XMLSchema#"
        }
      ],
      id: "https://id.dev.epcis.cloud/01/09521000004207/21/SUIT-2026-00042",
      type: [
        "Clothing",
        "TextileApparel"
      ],
      gtin: "09521000004207",
      "gs1:serialNumber": "SUIT-2026-00042",
      productName: [
        {
          "@value": "Classic Business Suit, Charcoal (2-piece)",
          "@language": "en"
        },
        {
          "@value": "Klassischer Business-Anzug, Anthrazit (zweiteilig)",
          "@language": "de"
        },
        {
          "@value": "Costume d'affaires classique, Anthracite (2 pi\xE8ces)",
          "@language": "fr"
        },
        {
          "@value": "Traje cl\xE1sico de oficina, Antracita (2 piezas)",
          "@language": "es"
        },
        {
          "@value": "Klassiek zakelijk kostuum, Antraciet (tweedelig)",
          "@language": "nl"
        },
        {
          "@value": "Klassisk forretningsjakkes\xE6t, Koksgr\xE5 (todelt)",
          "@language": "da"
        },
        {
          "@value": "Klasyczny garnitur biznesowy, Grafitowy (2-cz\u0119\u015Bciowy)",
          "@language": "pl"
        },
        {
          "@value": "Klassisk aff\xE4rskostym, Antracit (tv\xE5delad)",
          "@language": "sv"
        },
        {
          "@value": "Klassisk forretningsdress, Antrasitt (todelt)",
          "@language": "no"
        },
        {
          "@value": "Klassinen liikemiehen puku, Antrasiitti (kaksiosainen)",
          "@language": "fi"
        },
        {
          "@value": "Abito classico da uomo, Antracite (2 pezzi)",
          "@language": "it"
        }
      ],
      "gs1:productDescription": [
        {
          "@value": "Two-piece tailored wool suit with subtle pinstripe, single-breasted notch-lapel jacket and matching flat-front trousers. Jacket and trousers are linked via GS1 AI 8026 (ITIP) so the set is tracked as one trade item.",
          "@language": "en"
        },
        {
          "@value": "Zweiteiliger, taillierter Wollanzug mit dezentem Nadelstreifen, einreihiger Sakko mit Kerblapen und passende Hose ohne Bundfalten. Sakko und Hose sind \xFCber GS1 AI 8026 (ITIP) verkn\xFCpft, sodass das Set als eine Handelseinheit erfasst wird.",
          "@language": "de"
        },
        {
          "@value": "Costume deux pi\xE8ces ajust\xE9 en laine \xE0 fines rayures discr\xE8tes, veste \xE0 boutonnage simple \xE0 revers crant\xE9s et pantalon \xE0 pinces plates assorti. La veste et le pantalon sont li\xE9s via GS1 AI 8026 (ITIP), de sorte que l'ensemble est suivi comme une seule unit\xE9 commerciale.",
          "@language": "fr"
        },
        {
          "@value": "Traje sastre de lana de dos piezas con sutil raya diplom\xE1tica, chaqueta cruzada de solapa de pico y pantal\xF3n de pinzas a juego. La chaqueta y el pantal\xF3n est\xE1n vinculados mediante GS1 AI 8026 (ITIP), por lo que el conjunto se rastrea como una sola unidad comercial.",
          "@language": "es"
        },
        {
          "@value": "Tweedelig getailleerd wollen kostuum met subtiele krijtstreep, enkelrijige jas met kerflapel en bijpassende pantalon zonder plooien. Jas en pantalon zijn gekoppeld via GS1 AI 8026 (ITIP), zodat de set als \xE9\xE9n handelsartikel wordt gevolgd.",
          "@language": "nl"
        },
        {
          "@value": "Todelt skr\xE6ddersyet uldjakkes\xE6t med diskret n\xE5lestribe, enkeltradet jakke med klassisk revers og matchende lige bukser. Jakke og bukser er forbundet via GS1 AI 8026 (ITIP), s\xE5 s\xE6ttet spores som \xE9n handelsenhed.",
          "@language": "da"
        },
        {
          "@value": "Dwucz\u0119\u015Bciowy we\u0142niany garnitur szyty na miar\u0119 z dyskretn\u0105 cienk\u0105 pr\u0105\u017Ckow\u0105 faktur\u0105, jednorz\u0119dowa marynarka z klapami i pasuj\u0105ce spodnie bez zak\u0142adek. Marynarka i spodnie s\u0105 powi\u0105zane przez GS1 AI 8026 (ITIP), dzi\u0119ki czemu komplet jest \u015Bledzony jako jedna jednostka handlowa.",
          "@language": "pl"
        },
        {
          "@value": "Tv\xE5delad skr\xE4ddarsydd ullkostym med diskret kritrand, enkelkn\xE4ppt kavaj med hackad rev\xE4r och matchande raka byxor. Kavaj och byxor \xE4r l\xE4nkade via GS1 AI 8026 (ITIP) s\xE5 att upps\xE4ttningen sp\xE5ras som en handelsenhet.",
          "@language": "sv"
        },
        {
          "@value": "Todelt skreddersydd ulldress med diskret n\xE5lestripe, enkeltspent jakke med hakk-revers og matchende rette bukser. Jakke og bukse er knyttet sammen via GS1 AI 8026 (ITIP) slik at settet spores som \xE9n handelsenhet.",
          "@language": "no"
        },
        {
          "@value": "Kaksiosainen r\xE4\xE4t\xE4l\xF6ity villapuku, jossa hillitty raitakuvio, yksirivinen lovik\xE4\xE4nteinen pikkutakki ja yhteensopivat suorat housut. Pikkutakki ja housut on linkitetty GS1 AI 8026 (ITIP) -tunnisteella, joten setti j\xE4ljitet\xE4\xE4n yhten\xE4 kauppanimikkeen\xE4.",
          "@language": "fi"
        },
        {
          "@value": "Abito sartoriale due pezzi in lana con discreto gessato, giacca monopetto a revers a lancia e pantaloni dritti coordinati. Giacca e pantaloni sono collegati tramite GS1 AI 8026 (ITIP), cos\xEC l'insieme viene tracciato come un'unica unit\xE0 commerciale.",
          "@language": "it"
        }
      ],
      textileCategory: "Apparel",
      garmentType: "Business Suit",
      targetGender: "Men",
      sizeRange: "46-58",
      seasonCollection: "SS2026",
      fabricType: "WovenNonDenim",
      apparelSubcategory: "Suits",
      "dpp:tradeItemPieceCount": 2,
      "dpp:tradeItemPieces": [
        {
          id: "https://id.dev.epcis.cloud/8026/0952100000420750200010",
          type: "dpp:IndividualTradeItemPiece",
          "dpp:tradeItemPieceNumber": 1,
          "dpp:tradeItemPieceDescription": "Jacket",
          "dpp:tradeItemPieceOf": "https://id.dev.epcis.cloud/01/09521000004207/21/SUIT-2026-00042",
          _comment_itip_ai8026: "AI 8026 = GTIN (14 digits) + total pieces (2 digits) + piece number (2 digits). Example: 09521000004207 + 02 + 01 for piece 1 of 2."
        },
        {
          id: "https://id.dev.epcis.cloud/8026/0952100000420750200020",
          type: "dpp:IndividualTradeItemPiece",
          "dpp:tradeItemPieceNumber": 2,
          "dpp:tradeItemPieceDescription": "Trousers",
          "dpp:tradeItemPieceOf": "https://id.dev.epcis.cloud/01/09521000004207/21/SUIT-2026-00042",
          _comment_itip_ai8026: "AI 8026 for piece 2 of 2: 09521000004207 + 02 + 02."
        }
      ],
      "gs1:manufacturer": {
        id: "https://id.dev.epcis.cloud/417/9521000000018",
        type: "Organization",
        organizationName: "EcoWear GmbH",
        gln: "9521000000018",
        "gs1:address": {
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Textilstra\xDFe 25",
          "gs1:addressLocality": "Munich",
          "gs1:postalCode": "80331",
          "gs1:addressCountry": "DE"
        }
      },
      "gs1:netWeight": {
        type: "QuantitativeValue",
        value: "1.4",
        unitCode: "KGM"
      },
      textileMaterial: [
        {
          type: "TextileMaterialDetails",
          "gs1:textileFibreName": "Wool",
          "gs1:textileFibrePercentage": 80
        },
        {
          type: "TextileMaterialDetails",
          "gs1:textileFibreName": "Polyester",
          "gs1:textileFibrePercentage": 20
        }
      ],
      "gs1:regulatoryInformation": [
        {
          type: "gs1:RegulatoryInformation",
          "gs1:regulationType": {
            id: "gs1:RegulationTypeCode-TEXTILE_FIBRE_REGULATION"
          },
          "gs1:regulatoryAct": "EU 1007/2011",
          "gs1:isRegulationCompliant": true
        }
      ],
      _notes: [
        "Pattern status: Reference pattern aligned with GS1 GSMP Work Request WR 25-212 (Community Review). May evolve per eBallot outcome.",
        "Why ITIP: Apparel sets (suits, uniforms, matching sets), flat-pack furniture with multiple cartons, and bundled electronics (tablet + keyboard + stylus) all benefit from piece-level traceability without requiring separate GTINs per piece. AI 8026 provides a compact, scannable identifier per piece while preserving the single-GTIN commercial model.",
        "DPP implication: For products requiring a Digital Product Passport, ITIP identification enables piece-level lifecycle tracking (e.g., the jacket of a suit can be repaired independently of the trousers) while the DPP itself is scoped at the trade-item level. This matches the apparel use case the Apparel DPP Sub-team is scoping for Q2 2027 requirements gathering."
      ]
    }
  },
  {
    group: "EU Textile",
    label: "hometextile-bedlinen (item)",
    doc: {
      _comment_gs1_alignment: [
        "Home-textile DPP example: a two-piece organic-cotton duvet cover and",
        "pillowcase set, sold as a single SKU. Demonstrates:",
        "- gs1:textileMaterial on a non-apparel textile (hometextile sub-category)",
        "- GOTS organic-cotton certification",
        "- Lifecycle care + durability info per ESPR Annex V",
        "- A circular take-back program (brand resale + fibre recycling) per",
        "  Sustainable Textiles Strategy take-back pillar",
        "GS1 demo prefix 952 (7-digit GCP: 9521234)."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld",
        {
          gs1: "https://ref.gs1.org/voc/",
          xsd: "http://www.w3.org/2001/XMLSchema#"
        }
      ],
      id: "https://id.dev.epcis.cloud/01/09521001001380/21/BL-2026-04201",
      type: [
        "Product",
        "TextileApparel"
      ],
      gtin: "09521001001380",
      "gs1:serialNumber": "BL-2026-04201",
      productName: [
        {
          "@value": "Casa Lina Organic Cotton Bed Linen Set, duvet cover + pillowcase, 200\xD7220 cm",
          "@language": "en"
        },
        {
          "@value": "Casa Lina Bio-Baumwoll-Bettw\xE4sche-Set, Bettbezug + Kissenbezug, 200\xD7220 cm",
          "@language": "de"
        },
        {
          "@value": "Parure de lit Casa Lina en coton bio, housse de couette + taie d'oreiller, 200\xD7220 cm",
          "@language": "fr"
        },
        {
          "@value": "Juego de cama Casa Lina de algod\xF3n org\xE1nico, funda n\xF3rdica + funda de almohada, 200\xD7220 cm",
          "@language": "es"
        },
        {
          "@value": "Casa Lina dekbedovertrekset van biologisch katoen, dekbedovertrek + kussensloop, 200\xD7220 cm",
          "@language": "nl"
        },
        {
          "@value": "Casa Lina senget\xF8jss\xE6t i \xF8kologisk bomuld, dynebetr\xE6k + pudebetr\xE6k, 200\xD7220 cm",
          "@language": "da"
        },
        {
          "@value": "Po\u015Bciel Casa Lina z bawe\u0142ny organicznej, poszwa na ko\u0142dr\u0119 + poszewka na poduszk\u0119, 200\xD7220 cm",
          "@language": "pl"
        },
        {
          "@value": "Casa Lina s\xE4ngkl\xE4desset i ekologisk bomull, p\xE5slakan + \xF6rngott, 200\xD7220 cm",
          "@language": "sv"
        },
        {
          "@value": "Casa Lina senget\xF8ysett i \xF8kologisk bomull, dynetrekk + putetrekk, 200\xD7220 cm",
          "@language": "no"
        },
        {
          "@value": "Casa Lina luomupuuvillaiset vuodevaatteet, pussilakana + tyynyliina, 200\xD7220 cm",
          "@language": "fi"
        },
        {
          "@value": "Set di biancheria da letto Casa Lina in cotone biologico, copripiumone + federa, 200\xD7220 cm",
          "@language": "it"
        }
      ],
      "gs1:productDescription": [
        {
          "@value": "Two-piece bed linen set in 100% GOTS-certified organic cotton percale, woven for high durability and laundered to OEKO-TEX Class I (skin contact). Designed for repair and return at end of life.",
          "@language": "en"
        },
        {
          "@value": "Zweiteiliges Bettw\xE4sche-Set aus 100 % GOTS-zertifiziertem Bio-Baumwoll-Perkal, robust gewebt und nach OEKO-TEX Klasse I (Hautkontakt) gewaschen. Konzipiert f\xFCr Reparatur und R\xFCcknahme am Lebensende.",
          "@language": "de"
        },
        {
          "@value": "Parure de lit deux pi\xE8ces en percale de coton bio certifi\xE9 GOTS \xE0 100 %, tiss\xE9e pour une grande durabilit\xE9 et lav\xE9e selon la norme OEKO-TEX Classe I (contact peau). Con\xE7ue pour la r\xE9paration et la reprise en fin de vie.",
          "@language": "fr"
        },
        {
          "@value": "Juego de cama de dos piezas en percal de algod\xF3n org\xE1nico 100 % certificado GOTS, tejido para gran durabilidad y lavado seg\xFAn OEKO-TEX Clase I (contacto con la piel). Dise\xF1ado para la reparaci\xF3n y la devoluci\xF3n al final de su vida \xFAtil.",
          "@language": "es"
        },
        {
          "@value": "Tweedelig beddengoedset in 100% GOTS-gecertificeerd biologisch katoenen percal, geweven voor hoge duurzaamheid en gewassen volgens OEKO-TEX klasse I (huidcontact). Ontworpen voor reparatie en retourname aan het einde van de levensduur.",
          "@language": "nl"
        },
        {
          "@value": "Todelt senget\xF8jss\xE6t i 100 % GOTS-certificeret \xF8kologisk bomuldspercale, v\xE6vet til h\xF8j holdbarhed og vasket efter OEKO-TEX klasse I (hudkontakt). Designet til reparation og tilbagetagning ved end-of-life.",
          "@language": "da"
        },
        {
          "@value": "Dwucz\u0119\u015Bciowy zestaw po\u015Bcieli z 100% perkalu z bawe\u0142ny organicznej z certyfikatem GOTS, utkany dla wysokiej trwa\u0142o\u015Bci i wyprany zgodnie z OEKO-TEX klasy I (kontakt ze sk\xF3r\u0105). Zaprojektowany pod k\u0105tem napraw i zwrot\xF3w po zako\u0144czeniu u\u017Cytkowania.",
          "@language": "pl"
        },
        {
          "@value": "Tv\xE5delat s\xE4ngkl\xE4desset i 100 % GOTS-certifierad ekologisk bomullspercale, v\xE4vt f\xF6r h\xF6g h\xE5llbarhet och tv\xE4ttat enligt OEKO-TEX klass I (hudkontakt). Konstruerat f\xF6r reparation och \xE5tertagning vid slutet av livsl\xE4ngden.",
          "@language": "sv"
        },
        {
          "@value": "Todelt senget\xF8ysett i 100 % GOTS-sertifisert \xF8kologisk bomullspercale, vevd for h\xF8y slitestyrke og vasket etter OEKO-TEX klasse I (hudkontakt). Designet for reparasjon og retur ved slutten av levetiden.",
          "@language": "no"
        },
        {
          "@value": "Kaksiosainen vuodevaatesetti 100-prosenttisesta GOTS-sertifioidusta luomupuuvillapercaalista, kest\xE4v\xE4ksi kudottu ja OEKO-TEX-luokan I (ihokosketus) mukaisesti pesty. Suunniteltu korjattavaksi ja palautettavaksi k\xE4yt\xF6n p\xE4\xE4tytty\xE4.",
          "@language": "fi"
        },
        {
          "@value": "Set di biancheria da letto due pezzi in percalle di cotone biologico certificato GOTS al 100 %, tessuto per elevata durata e lavato secondo OEKO-TEX Classe I (contatto pelle). Progettato per la riparazione e la presa indietro a fine vita.",
          "@language": "it"
        }
      ],
      textileCategory: "HomeTextile",
      fabricType: "WovenNonDenim",
      targetGender: "Unisex",
      seasonCollection: "SS2026",
      "gs1:manufacturer": {
        id: "https://id.dev.epcis.cloud/417/9521987000056",
        type: "gs1:Organization",
        "gs1:organizationName": "Casa Lina GmbH",
        "gs1:gln": "9521987000056",
        "gs1:address": {
          type: "gs1:PostalAddress",
          "gs1:streetAddress": "Webergasse 11",
          "gs1:addressLocality": "Wuppertal",
          "gs1:postalCode": "42103",
          "gs1:countryCode": "DE"
        }
      },
      "gs1:netWeight": {
        type: "gs1:QuantitativeValue",
        "gs1:value": 1.45,
        "gs1:unitCode": "KGM"
      },
      "gs1:textileMaterial": [
        {
          type: "gs1:TextileMaterialDetails",
          "gs1:textileFibreContentPercentage": 100,
          "gs1:textileFibreCommonName": "Organic cotton",
          "gs1:textileFibreScientificName": "Gossypium hirsutum",
          "gs1:countryOfOrigin": {
            id: "https://ref.gs1.org/voc/Country-IN",
            type: "gs1:Country"
          }
        }
      ],
      careInstructions: {
        type: "CareInstruction",
        washingSymbol: "Wash60",
        bleachingSymbol: "DoNotBleach",
        dryingSymbol: "TumbleDryLow",
        ironingSymbol: "IronMedium",
        dryCleaningSymbol: "DoNotDryClean",
        additionalCareInstructions: {
          "@value": "Wash at 60 \xB0C for hygienic re-use; tumble dry low; iron at medium heat. Do not bleach.",
          "@language": "en"
        }
      },
      durabilityInfo: {
        type: "DurabilityInfo",
        expectedWashCycles: 200,
        durabilityClass: "DurabilityA",
        pillingResistance: 5,
        colorFastness: 4,
        dimensionalStability: 2,
        tensileStrength: {
          type: "QuantitativeValue",
          value: 480,
          unitCode: "NEW"
        },
        expectedLifetimeYears: 5
      },
      hasTakeBackProgram: true,
      takeBackProgram: {
        type: "TakeBackProgram",
        takeBackUrl: "https://www.casa-lina.example.com/takeback",
        takeBackIncentive: {
          "@value": "10% discount voucher when returning the set in any Casa Lina retail location",
          "@language": "en"
        },
        endOfLifeDestination: {
          "@value": "Returned linens are sorted: good-condition \u2192 reuse channel; worn \u2192 fibre-to-fibre recycling at GreenFibre Leipzig.",
          "@language": "en"
        }
      },
      "gs1:certification": [
        {
          type: "gs1:CertificationDetails",
          "gs1:certificationSubject": "Organic cotton fibre supply chain",
          "gs1:certificationAgency": "Global Organic Textile Standard",
          "gs1:certificationStandard": "GOTS v7.0",
          "gs1:certificationIdentification": "GOTS-DE-2026-LINA-0042",
          "gs1:certificationURI": "https://www.global-standard.org/find-certified-suppliers"
        },
        {
          type: "gs1:CertificationDetails",
          "gs1:certificationSubject": "Hazardous-substance compliance",
          "gs1:certificationAgency": "OEKO-TEX",
          "gs1:certificationStandard": "OEKO-TEX Standard 100 Class I",
          "gs1:certificationIdentification": "OEKO-TEX-100-2026-IN-2841",
          "gs1:certificationURI": "https://www.oeko-tex.com/en/our-standards/oeko-tex-standard-100"
        }
      ],
      environmentalFootprint: {
        type: "EnvironmentalFootprint",
        carbonFootprintManufacturing: 6.4,
        pefcrReference: "PEFCR Apparel & Footwear v2.0 (2023)"
      },
      "gs1:regulatoryInformation": [
        {
          type: "gs1:RegulatoryInformation",
          "gs1:regulationType": {
            id: "gs1:RegulationTypeCode-TEXTILE"
          },
          "gs1:regulatoryAct": "EU ESPR 2024/1781",
          "gs1:isRegulationCompliant": true
        }
      ]
    }
  },
  {
    group: "EU Deforestation (EUDR)",
    label: "timber-derived (item)",
    doc: {
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
      ],
      id: "https://id.gs1.org/01/09521234000037/21/TABLE-2025-001",
      type: "Product",
      gtin: "09521234000037",
      serialNumber: "TABLE-2025-001",
      productName: "Solid Oak Dining Table",
      "gs1:productDescription": "Handcrafted solid oak dining table made from certified deforestation-free European oak timber.",
      commodityType: "Wood",
      timberProductType: "Furniture",
      customsCommodityCode: "94036010",
      customsCommodityCodeType: "CN8",
      speciesScientificName: "Quercus robur",
      speciesCommonName: "European Oak",
      netWeight: {
        type: "gs1:QuantitativeValue",
        "gs1:value": 45,
        "gs1:unitCode": "KGM"
      },
      derivedFrom: [
        {
          id: "https://id.gs1.org/01/09521234000020/21/LOG-2025-001"
        },
        {
          id: "https://id.gs1.org/01/09521234000020/21/LOG-2025-002"
        }
      ],
      transformationDate: "2025-02-15",
      transformationLocation: {
        id: "https://id.gs1.org/414/9521234000105",
        type: "Place",
        physicalLocationName: "Oak Craft Furniture Workshop",
        gln: "9521234000105",
        address: {
          type: "PostalAddress",
          addressLocality: "Potsdam",
          addressCountry: "DE"
        }
      },
      countryOfOrigin: {
        type: "Country",
        "gs1:countryCode": "DE"
      },
      deforestationFreeDate: "2025-01-15",
      legallyHarvested: true,
      manufacturer: {
        id: "https://id.gs1.org/417/9521234000105",
        type: "Organization",
        organizationName: "Oak Craft Furniture GmbH",
        gln: "9521234000105"
      },
      "dpp:operatorInformation": {
        type: "dpp:OperatorInformation",
        "dpp:operatorRole": "Manufacturer",
        gln: "9521234000105",
        organizationName: "Oak Craft Furniture GmbH",
        "dpp:eoriNumber": "DE987654321098765",
        address: {
          type: "PostalAddress",
          streetAddress: "M\xF6belweg 7",
          addressLocality: "Potsdam",
          postalCode: "14467",
          addressCountry: "DE"
        }
      },
      dueDiligenceStatement: {
        type: "DueDiligenceStatement",
        euisReferenceNumber: "EUIS-2025-DE-00023456",
        statementDate: "2025-02-18",
        "dpp:reportUrl": {
          id: "https://example.com/eudr/due-diligence/TABLE-2025-001.pdf"
        },
        riskAssessment: {
          type: "RiskAssessment",
          riskLevel: "Negligible",
          riskAssessmentDate: "2025-02-17",
          verificationMethod: "Supply chain documentation review - source timber already verified via EUIS-2025-DE-00012345",
          countryRiskCategory: "Low",
          mitigationMeasures: "Full traceability to source logs maintained. FSC chain of custody certification."
        }
      },
      fscCertification: {
        id: "https://fsc.org/en/certificate/FSC-C789012"
      },
      hasBatchLotNumber: "FURN-2025-02-001",
      "dpp:lastDataUpdate": "2025-02-18T10:00:00Z",
      "dpp:dataQualityAssessment": "A"
    }
  },
  {
    group: "EU Deforestation (EUDR)",
    label: "timber-product (item)",
    doc: {
      "@context": [
        "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
      ],
      type: "Product",
      id: "https://id.gs1.org/01/09521234000020/21/LOG-2025-001",
      _comment: "Product master data using standard GS1 vocabulary. EUDR-specific properties (species, harvest) use eudr: extensions. Uses GS1 demo prefix 952 (7-digit GCP: 9521234).",
      productName: [
        {
          "@value": "European Oak Round Wood - Grade A",
          "@language": "en"
        }
      ],
      gtin: "09521234000020",
      "gs1:regulatedProductName": [
        {
          "@value": "Round wood of oak (Quercus spp.)",
          "@language": "en"
        }
      ],
      "gs1:productDescription": [
        {
          "@value": "Premium European Oak logs harvested from certified sustainable forest in Brandenburg, Germany. FSC certified.",
          "@language": "en"
        }
      ],
      countryOfOrigin: [
        {
          type: "Country",
          "gs1:countryCode": "DE"
        }
      ],
      netWeight: {
        type: "gs1:QuantitativeValue",
        "gs1:value": 850,
        "gs1:unitCode": "KGM"
      },
      customsCommodityCode: "4403",
      customsCommodityCodeType: "HS6",
      speciesScientificName: "Quercus robur",
      speciesCommonName: "European Oak",
      commodityType: "Wood",
      timberProductType: "RoundWood"
    }
  },
  {
    group: "EU Packaging (PPWR)",
    label: "beverage-bottle-lot-01 (batch)",
    doc: {
      _comment: [
        "PPWR DPP example: BATCH-LEVEL (AI 10) variant of beverage-bottle.jsonld. Same 0.5 L PET bottle, scoped to batch/lot LOT-01 via the GS1 Digital Link key /01/{gtin}/10/{lot}. Demonstrates per-lot master data: the lot inherits the full GTIN-level PPWR attribute set and adds hasBatchLotNumber.",
        "GS1 demo prefix 952 (7-digit GCP: 9521234). Registered at /01/09521004005019/10/LOT-01."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld"
      ],
      id: "https://id.dev.epcis.cloud/01/09521004005019/10/LOT-01",
      type: "Packaging",
      gtin: "09521004005019",
      hasBatchLotNumber: "LOT-01",
      productName: [
        {
          "@value": "Mountain Spring Mineral Water, 500 mL PET bottle",
          "@language": "en"
        },
        {
          "@value": "Mountain Spring Mineralwasser, 500-ml-PET-Flasche",
          "@language": "de"
        },
        {
          "@value": "Eau min\xE9rale Mountain Spring, bouteille PET de 500 ml",
          "@language": "fr"
        },
        {
          "@value": "Agua mineral Mountain Spring, botella PET de 500 ml",
          "@language": "es"
        },
        {
          "@value": "Mountain Spring mineraalwater, PET-fles van 500 ml",
          "@language": "nl"
        },
        {
          "@value": "Mountain Spring mineralvand, 500 ml PET-flaske",
          "@language": "da"
        },
        {
          "@value": "Woda mineralna Mountain Spring, butelka PET 500 ml",
          "@language": "pl"
        },
        {
          "@value": "Mountain Spring mineralvatten, 500 ml PET-flaska",
          "@language": "sv"
        },
        {
          "@value": "Mountain Spring mineralvann, 500 ml PET-flaske",
          "@language": "no"
        },
        {
          "@value": "Mountain Spring -kivenn\xE4isvesi, 500 ml:n PET-pullo",
          "@language": "fi"
        },
        {
          "@value": "Acqua minerale Mountain Spring, bottiglia PET da 500 ml",
          "@language": "it"
        }
      ],
      packagingTier: "Sales",
      recyclabilityGrade: "A",
      harmonisedSymbol: "https://ec.europa.eu/eli/reg/2025/40/annex/IX/symbol/separate-collection-pet",
      manufacturingDate: "2026-04-15",
      manufacturer: {
        id: "https://id.dev.epcis.cloud/417/9521234000020",
        type: "Organization",
        organizationName: "AlpenQuell GmbH",
        partyGLN: "9521234000020"
      },
      extendedProducerResponsibility: [
        {
          type: "ExtendedProducerResponsibility",
          eprRegistrationNumber: "DE-VPC-58092100",
          eprWasteStream: "packaging",
          eprJurisdiction: {
            id: "https://ref.gs1.org/voc/Country-DE",
            type: "Country"
          },
          eprScheme: {
            id: "https://id.dev.epcis.cloud/417/4030101000001",
            type: "Organization",
            organizationName: "Der Gr\xFCne Punkt, Duales System Deutschland GmbH"
          },
          eprComplianceUrl: "https://ldb.zsvr.de/marken/58092100"
        }
      ],
      depositReturnScheme: {
        type: "DepositReturnScheme",
        depositAmount: {
          type: "QuantitativeValue",
          value: 0.25,
          unitCode: "EUR"
        },
        depositSchemeOperator: {
          id: "https://id.dev.epcis.cloud/417/4030101000018",
          type: "Organization",
          organizationName: "Deutsche Pfandsystem GmbH"
        },
        depositRedemptionChannelUrl: "https://www.dpg-pfandsystem.de/find-redemption-point"
      },
      recycledContent: {
        type: "RecycledContent",
        recycledContent: {
          type: "QuantitativeValue",
          value: 0.5,
          unitCode: "P1"
        },
        postConsumerRecycledContent: {
          type: "QuantitativeValue",
          value: 0.5,
          unitCode: "P1"
        },
        preConsumerRecycledContent: {
          type: "QuantitativeValue",
          value: 0,
          unitCode: "P1"
        }
      },
      materialComposition: [
        {
          type: "MaterialComposition",
          materialName: "PET (polyethylene terephthalate)",
          massFraction: 1,
          casNumber: "25038-59-9"
        }
      ],
      regulatoryInformation: [
        {
          type: "RegulatoryInformation",
          regulationType: {
            id: "gs1:RegulationTypeCode-PACKAGING_REGULATION"
          },
          regulatoryAct: "EU 2025/40",
          isRegulationCompliant: true
        }
      ],
      productDescription: [
        {
          "@value": "50% post-consumer rPET bottle with Grade A recyclability, deposit-return scheme membership, and harmonised separate-collection PET symbol. Batch LOT-01.",
          "@language": "en"
        },
        {
          "@value": "Flasche aus 50 % Post-Consumer-rPET, Recyclingf\xE4higkeit Klasse A, Pfand-R\xFCcknahme-System und harmonisiertes PET-Sammelsymbol. Charge LOT-01.",
          "@language": "de"
        },
        {
          "@value": "Bouteille en rPET post-consommation \xE0 50 %, recyclabilit\xE9 Grade A, adh\xE9sion au syst\xE8me de consigne et symbole harmonis\xE9 de collecte s\xE9lective PET. Lot LOT-01.",
          "@language": "fr"
        },
        {
          "@value": "Botella con 50 % de rPET post-consumo, reciclabilidad Grado A, sistema de devoluci\xF3n de envases (dep\xF3sito) y s\xEDmbolo armonizado de recogida selectiva PET. Lote LOT-01.",
          "@language": "es"
        },
        {
          "@value": "Fles van 50% post-consumer rPET, recycleerbaarheid klasse A, deelname aan statiegeldsysteem en geharmoniseerd PET-inzamelsymbool. Charge LOT-01.",
          "@language": "nl"
        },
        {
          "@value": "Flaske af 50 % post-consumer rPET, genanvendelighed grad A, tilmeldt pant-retur-system og harmoniseret separat indsamlings-PET-symbol. Parti LOT-01.",
          "@language": "da"
        },
        {
          "@value": "Butelka z 50 % rPET pokonsumenckiego, recykling klasy A, cz\u0142onkostwo w systemie kaucji-zwrotu i zharmonizowany symbol selektywnej zbi\xF3rki PET. Partia LOT-01.",
          "@language": "pl"
        },
        {
          "@value": "Flaska av 50 % post-consumer-rPET, \xE5tervinningsbarhet klass A, ansluten till pantsystem och harmoniserad PET-insamlingssymbol. Parti LOT-01.",
          "@language": "sv"
        },
        {
          "@value": "Flaske av 50 % post-consumer rPET, gjenvinnbarhet klasse A, tilknyttet pantesystem og harmonisert PET-innsamlingssymbol. Parti LOT-01.",
          "@language": "no"
        },
        {
          "@value": "Pullo, jossa on 50 % kierr\xE4tetty\xE4 rPET-muovia, kierr\xE4tett\xE4vyysluokka A, panttij\xE4rjestelm\xE4n j\xE4senyys ja harmonisoitu PET-erillisker\xE4ysmerkki. Er\xE4 LOT-01.",
          "@language": "fi"
        },
        {
          "@value": "Bottiglia con 50 % di rPET post-consumo, riciclabilit\xE0 Grado A, adesione al sistema di reso del vuoto e simbolo armonizzato di raccolta differenziata PET. Lotto LOT-01.",
          "@language": "it"
        }
      ]
    }
  },
  {
    group: "EU Packaging (PPWR)",
    label: "beverage-bottle (model)",
    doc: {
      _comment: [
        "PPWR DPP example: a 0.5 L PET beverage bottle with 50% post-consumer rPET, recyclability Grade A, deposit-return scheme participation, and the standard separate-collection harmonised symbol. Demonstrates that nearly all PPWR data points reuse common dpp:/gs1:/untp: vocabulary; only packagingTier and recyclabilityGrade come from the ppwr: namespace.",
        "GS1 demo prefix 952 (7-digit GCP: 9521234)."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld"
      ],
      id: "https://id.dev.epcis.cloud/01/09521004005019",
      type: "Packaging",
      gtin: "09521004005019",
      productName: [
        {
          "@value": "Mountain Spring Mineral Water, 500 mL PET bottle",
          "@language": "en"
        },
        {
          "@value": "Mountain Spring Mineralwasser, 500-ml-PET-Flasche",
          "@language": "de"
        },
        {
          "@value": "Eau min\xE9rale Mountain Spring, bouteille PET de 500 ml",
          "@language": "fr"
        },
        {
          "@value": "Agua mineral Mountain Spring, botella PET de 500 ml",
          "@language": "es"
        },
        {
          "@value": "Mountain Spring mineraalwater, PET-fles van 500 ml",
          "@language": "nl"
        },
        {
          "@value": "Mountain Spring mineralvand, 500 ml PET-flaske",
          "@language": "da"
        },
        {
          "@value": "Woda mineralna Mountain Spring, butelka PET 500 ml",
          "@language": "pl"
        },
        {
          "@value": "Mountain Spring mineralvatten, 500 ml PET-flaska",
          "@language": "sv"
        },
        {
          "@value": "Mountain Spring mineralvann, 500 ml PET-flaske",
          "@language": "no"
        },
        {
          "@value": "Mountain Spring -kivenn\xE4isvesi, 500 ml:n PET-pullo",
          "@language": "fi"
        },
        {
          "@value": "Acqua minerale Mountain Spring, bottiglia PET da 500 ml",
          "@language": "it"
        }
      ],
      packagingTier: "Sales",
      recyclabilityGrade: "A",
      harmonisedSymbol: "https://ec.europa.eu/eli/reg/2025/40/annex/IX/symbol/separate-collection-pet",
      manufacturingDate: "2026-04-15",
      manufacturer: {
        id: "https://id.dev.epcis.cloud/417/9521234000020",
        type: "Organization",
        organizationName: "AlpenQuell GmbH",
        partyGLN: "9521234000020"
      },
      extendedProducerResponsibility: [
        {
          type: "ExtendedProducerResponsibility",
          eprRegistrationNumber: "DE-VPC-58092100",
          eprWasteStream: "packaging",
          eprJurisdiction: {
            id: "https://ref.gs1.org/voc/Country-DE",
            type: "Country"
          },
          eprScheme: {
            id: "https://id.dev.epcis.cloud/417/4030101000001",
            type: "Organization",
            organizationName: "Der Gr\xFCne Punkt, Duales System Deutschland GmbH"
          },
          eprComplianceUrl: "https://ldb.zsvr.de/marken/58092100"
        }
      ],
      depositReturnScheme: {
        type: "DepositReturnScheme",
        depositAmount: {
          type: "QuantitativeValue",
          value: 0.25,
          unitCode: "EUR"
        },
        depositSchemeOperator: {
          id: "https://id.dev.epcis.cloud/417/4030101000018",
          type: "Organization",
          organizationName: "Deutsche Pfandsystem GmbH"
        },
        depositRedemptionChannelUrl: "https://www.dpg-pfandsystem.de/find-redemption-point"
      },
      recycledContent: {
        type: "RecycledContent",
        recycledContent: {
          type: "QuantitativeValue",
          value: 0.5,
          unitCode: "P1"
        },
        postConsumerRecycledContent: {
          type: "QuantitativeValue",
          value: 0.5,
          unitCode: "P1"
        },
        preConsumerRecycledContent: {
          type: "QuantitativeValue",
          value: 0,
          unitCode: "P1"
        }
      },
      materialComposition: [
        {
          type: "MaterialComposition",
          materialName: "PET (polyethylene terephthalate)",
          massFraction: 1,
          casNumber: "25038-59-9"
        }
      ],
      regulatoryInformation: [
        {
          type: "RegulatoryInformation",
          regulationType: {
            id: "gs1:RegulationTypeCode-PACKAGING_REGULATION"
          },
          regulatoryAct: "EU 2025/40",
          isRegulationCompliant: true
        }
      ],
      productDescription: [
        {
          "@value": "50% post-consumer rPET bottle with Grade A recyclability, deposit-return scheme membership, and harmonised separate-collection PET symbol.",
          "@language": "en"
        },
        {
          "@value": "Flasche aus 50 % Post-Consumer-rPET, Recyclingf\xE4higkeit Klasse A, Pfand-R\xFCcknahme-System und harmonisiertes PET-Sammelsymbol.",
          "@language": "de"
        },
        {
          "@value": "Bouteille en rPET post-consommation \xE0 50 %, recyclabilit\xE9 Grade A, adh\xE9sion au syst\xE8me de consigne et symbole harmonis\xE9 de collecte s\xE9lective PET.",
          "@language": "fr"
        },
        {
          "@value": "Botella con 50 % de rPET post-consumo, reciclabilidad Grado A, sistema de devoluci\xF3n de envases (dep\xF3sito) y s\xEDmbolo armonizado de recogida selectiva PET.",
          "@language": "es"
        },
        {
          "@value": "Fles van 50% post-consumer rPET, recycleerbaarheid klasse A, deelname aan statiegeldsysteem en geharmoniseerd PET-inzamelsymbool.",
          "@language": "nl"
        },
        {
          "@value": "Flaske af 50 % post-consumer rPET, genanvendelighed grad A, tilmeldt pant-retur-system og harmoniseret separat indsamlings-PET-symbol.",
          "@language": "da"
        },
        {
          "@value": "Butelka z 50 % rPET pokonsumenckiego, recykling klasy A, cz\u0142onkostwo w systemie kaucji-zwrotu i zharmonizowany symbol selektywnej zbi\xF3rki PET.",
          "@language": "pl"
        },
        {
          "@value": "Flaska av 50 % post-consumer-rPET, \xE5tervinningsbarhet klass A, ansluten till pantsystem och harmoniserad PET-insamlingssymbol.",
          "@language": "sv"
        },
        {
          "@value": "Flaske av 50 % post-consumer rPET, gjenvinnbarhet klasse A, tilknyttet pantesystem og harmonisert PET-innsamlingssymbol.",
          "@language": "no"
        },
        {
          "@value": "Pullo, jossa on 50 % kierr\xE4tetty\xE4 rPET-muovia, kierr\xE4tett\xE4vyysluokka A, panttij\xE4rjestelm\xE4n j\xE4senyys ja harmonisoitu PET-erillisker\xE4ysmerkki.",
          "@language": "fi"
        },
        {
          "@value": "Bottiglia con 50 % di rPET post-consumo, riciclabilit\xE0 Grado A, adesione al sistema di reso del vuoto e simbolo armonizzato di raccolta differenziata PET.",
          "@language": "it"
        }
      ]
    }
  },
  {
    group: "EU Packaging (PPWR)",
    label: "ecommerce-carton (model)",
    doc: {
      _comment: [
        "PPWR DPP example: a corrugated cardboard e-commerce shipping carton.",
        "Demonstrates the Grouped/Transport packaging tier (vs Sales for the",
        "beverage bottle), a Grade A recyclability claim against the cellulose-",
        "fibre stream, high post-consumer recycled-content (PCR cellulose),",
        "and the separate-collection-paper harmonised symbol.",
        "GS1 demo prefix 952 (7-digit GCP: 9521234)."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld"
      ],
      id: "https://id.dev.epcis.cloud/01/09521006003013",
      type: "Packaging",
      gtin: "09521006003013",
      productName: [
        {
          "@value": "EcoFlow corrugated shipping carton, 30\xD720\xD715 cm",
          "@language": "en"
        },
        {
          "@value": "EcoFlow Wellpapp-Versandkarton, 30\xD720\xD715 cm",
          "@language": "de"
        },
        {
          "@value": "Carton d'exp\xE9dition ondul\xE9 EcoFlow, 30\xD720\xD715 cm",
          "@language": "fr"
        },
        {
          "@value": "Caja de env\xEDo en cart\xF3n corrugado EcoFlow, 30\xD720\xD715 cm",
          "@language": "es"
        },
        {
          "@value": "EcoFlow golfkartonnen verzenddoos, 30\xD720\xD715 cm",
          "@language": "nl"
        },
        {
          "@value": "EcoFlow b\xF8lgepap-forsendelseskasse, 30\xD720\xD715 cm",
          "@language": "da"
        },
        {
          "@value": "Pude\u0142ko wysy\u0142kowe z tektury falistej EcoFlow, 30\xD720\xD715 cm",
          "@language": "pl"
        },
        {
          "@value": "EcoFlow wellpappsl\xE5da, 30\xD720\xD715 cm",
          "@language": "sv"
        },
        {
          "@value": "EcoFlow wellpappkartong, 30\xD720\xD715 cm",
          "@language": "no"
        },
        {
          "@value": "EcoFlow aaltopahvil\xE4hetyslaatikko, 30\xD720\xD715 cm",
          "@language": "fi"
        },
        {
          "@value": "Scatola di spedizione EcoFlow in cartone ondulato, 30\xD720\xD715 cm",
          "@language": "it"
        }
      ],
      packagingTier: "Grouped",
      recyclabilityGrade: "A",
      harmonisedSymbol: "https://ec.europa.eu/eli/reg/2025/40/annex/IX/symbol/separate-collection-paper",
      manufacturingDate: "2026-03-08",
      manufacturer: {
        id: "https://id.dev.epcis.cloud/417/9521987000049",
        type: "Organization",
        organizationName: "EcoFlow Karton GmbH",
        partyGLN: "9521987000049"
      },
      extendedProducerResponsibility: [
        {
          type: "ExtendedProducerResponsibility",
          eprRegistrationNumber: "DE-VPC-78410055",
          eprWasteStream: "packaging",
          eprJurisdiction: {
            id: "https://ref.gs1.org/voc/Country-DE",
            type: "Country"
          },
          eprScheme: {
            id: "https://id.dev.epcis.cloud/417/4030101000001",
            type: "Organization",
            organizationName: "Der Gr\xFCne Punkt, Duales System Deutschland GmbH"
          }
        }
      ],
      recycledContent: {
        type: "RecycledContent",
        recycledContent: {
          type: "QuantitativeValue",
          value: 0.95,
          unitCode: "P1"
        },
        postConsumerRecycledContent: {
          type: "QuantitativeValue",
          value: 0.8,
          unitCode: "P1"
        },
        preConsumerRecycledContent: {
          type: "QuantitativeValue",
          value: 0.15,
          unitCode: "P1"
        }
      },
      materialComposition: [
        {
          type: "MaterialComposition",
          materialName: "Recycled corrugated cardboard (kraftliner + fluting)",
          massFraction: 0.97
        },
        {
          type: "MaterialComposition",
          materialName: "Starch-based adhesive",
          massFraction: 0.03
        }
      ],
      regulatoryInformation: [
        {
          type: "RegulatoryInformation",
          regulationType: {
            id: "gs1:RegulationTypeCode-PACKAGING_REGULATION"
          },
          regulatoryAct: "EU 2025/40",
          isRegulationCompliant: true
        }
      ],
      productDescription: [
        {
          "@value": "Grouped/Transport tier carton, 95% recycled cardboard (80% post-consumer + 15% pre-consumer), Grade A recyclability.",
          "@language": "en"
        },
        {
          "@value": "Karton der Verpackungsebene Gruppen-/Transportverpackung, 95 % recycelte Pappe (80 % post-consumer + 15 % pre-consumer), Recyclingf\xE4higkeit Klasse A.",
          "@language": "de"
        },
        {
          "@value": "Carton de niveau emballage group\xE9/transport, 95 % de carton recycl\xE9 (80 % post-consommation + 15 % pr\xE9-consommation), recyclabilit\xE9 Grade A.",
          "@language": "fr"
        },
        {
          "@value": "Caja de nivel embalaje agrupado/transporte, 95 % de cart\xF3n reciclado (80 % post-consumo + 15 % pre-consumo), reciclabilidad Grado A.",
          "@language": "es"
        },
        {
          "@value": "Doos van verpakkingsniveau gegroepeerd/transport, 95 % gerecycled karton (80 % post-consumer + 15 % pre-consumer), recycleerbaarheid klasse A.",
          "@language": "nl"
        },
        {
          "@value": "Karton i emballageniveauet samle-/transportemballage, 95 % genanvendt pap (80 % post-consumer + 15 % pre-consumer), genanvendelighed grad A.",
          "@language": "da"
        },
        {
          "@value": "Pude\u0142ko poziomu opakowania zbiorczego/transportowego, 95 % tektury z recyklingu (80 % pokonsumenckiej + 15 % przedkonsumenckiej), recykling klasy A.",
          "@language": "pl"
        },
        {
          "@value": "Kartong i f\xF6rpackningsniv\xE5 gruppf\xF6rpackning/transport, 95 % \xE5tervunnen kartong (80 % post-consumer + 15 % pre-consumer), \xE5tervinningsbarhet klass A.",
          "@language": "sv"
        },
        {
          "@value": "Kartong i emballasjeniv\xE5 gruppe-/transport, 95 % resirkulert papp (80 % post-consumer + 15 % pre-consumer), gjenvinnbarhet klasse A.",
          "@language": "no"
        },
        {
          "@value": "Pakkaustason ryhm\xE4-/kuljetuspakkauskartonki, 95 % kierr\xE4tyspahvia (80 % kulutuksen j\xE4lkeen + 15 % ennen kulutusta), kierr\xE4tett\xE4vyysluokka A.",
          "@language": "fi"
        },
        {
          "@value": "Cartone di livello imballaggio raggruppato/da trasporto, 95 % di cartone riciclato (80 % post-consumo + 15 % pre-consumo), riciclabilit\xE0 Grado A.",
          "@language": "it"
        }
      ]
    }
  },
  {
    group: "EU Packaging (PPWR)",
    label: "multi-layer-pouch (model)",
    doc: {
      _comment: [
        "PPWR DPP example: a multi-layer PET/aluminium/PE laminate snack-food pouch.",
        "Demonstrates Grade C (lowest acceptable from 2030, phased out by 2038), no",
        "recycled content, PFAS-free declaration via dpp:HazardousSubstance, sales-tier",
        "primary packaging, no deposit-return scheme participation. The harmonised",
        "symbol points at the 'mixed-materials' / 'household-waste' Annex IX entry.",
        "GS1 demo prefix 952 (7-digit GCP: 9521234)."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld"
      ],
      id: "https://id.dev.epcis.cloud/01/09521005000808",
      type: "Packaging",
      gtin: "09521005000808",
      productName: [
        {
          "@value": "Crispy Snack Pouch, 80 g multi-layer foil",
          "@language": "en"
        },
        {
          "@value": "Crispy Snack-Beutel, 80 g Mehrschichtfolie",
          "@language": "de"
        },
        {
          "@value": "Sachet de snack Crispy, film multicouche de 80 g",
          "@language": "fr"
        },
        {
          "@value": "Bolsa de snack Crispy, film multicapa de 80 g",
          "@language": "es"
        },
        {
          "@value": "Crispy snackzakje, meerlaagsfolie van 80 g",
          "@language": "nl"
        },
        {
          "@value": "Crispy snackpose, 80 g flerlagsfolie",
          "@language": "da"
        },
        {
          "@value": "Torebka przek\u0105ski Crispy, folia wielowarstwowa 80 g",
          "@language": "pl"
        },
        {
          "@value": "Crispy snackp\xE5se, 80 g flerlagsfolie",
          "@language": "sv"
        },
        {
          "@value": "Crispy snackpose, 80 g flerlagsfolie",
          "@language": "no"
        },
        {
          "@value": "Crispy-naposteltavapussi, 80 g monikerroskalvo",
          "@language": "fi"
        },
        {
          "@value": "Bustina snack Crispy, pellicola multistrato da 80 g",
          "@language": "it"
        }
      ],
      packagingTier: "Sales",
      recyclabilityGrade: "C",
      harmonisedSymbol: "https://ec.europa.eu/eli/reg/2025/40/annex/IX/symbol/mixed-materials-household-waste",
      manufacturingDate: "2026-03-20",
      manufacturer: {
        id: "https://id.dev.epcis.cloud/417/9521234000037",
        type: "Organization",
        organizationName: "Knusprig GmbH",
        partyGLN: "9521234000037"
      },
      extendedProducerResponsibility: [
        {
          type: "ExtendedProducerResponsibility",
          eprRegistrationNumber: "DE-VPC-58092345",
          eprWasteStream: "packaging",
          eprJurisdiction: {
            id: "https://ref.gs1.org/voc/Country-DE",
            type: "Country"
          },
          eprScheme: {
            id: "https://id.dev.epcis.cloud/417/4030101000001",
            type: "Organization",
            organizationName: "Der Gr\xFCne Punkt, Duales System Deutschland GmbH"
          }
        }
      ],
      materialComposition: [
        {
          type: "MaterialComposition",
          materialName: "PET outer layer",
          massFraction: 0.45
        },
        {
          type: "MaterialComposition",
          materialName: "Aluminium barrier layer",
          massFraction: 0.1,
          isCriticalRawMaterial: true
        },
        {
          type: "MaterialComposition",
          materialName: "PE inner layer",
          massFraction: 0.45,
          casNumber: "9002-88-4"
        }
      ],
      hazardousSubstances: [
        {
          type: "HazardousSubstance",
          substanceName: "PFAS (per- and polyfluoroalkyl substances)",
          hazardImpact: "absent",
          _comment: "PPWR Article 5 PFAS restriction declaration: packaging contains no intentionally added PFAS. concentration omitted because below detection threshold."
        }
      ],
      regulatoryInformation: [
        {
          type: "RegulatoryInformation",
          regulationType: {
            id: "gs1:RegulationTypeCode-PACKAGING_REGULATION"
          },
          regulatoryAct: "EU 2025/40",
          isRegulationCompliant: true
        }
      ],
      productDescription: [
        {
          "@value": "PET/Aluminium/PE laminate pouch, Grade C recyclability (scheduled phase-out by 2038), PFAS-free declaration.",
          "@language": "en"
        },
        {
          "@value": "Beutel aus PET/Aluminium/PE-Laminat, Recyclingf\xE4higkeit Klasse C (geplanter Ausstieg bis 2038), PFAS-frei-Erkl\xE4rung.",
          "@language": "de"
        },
        {
          "@value": "Sachet en stratifi\xE9 PET/aluminium/PE, recyclabilit\xE9 Grade C (\xE9limination programm\xE9e d'ici 2038), d\xE9claration sans PFAS.",
          "@language": "fr"
        },
        {
          "@value": "Bolsa de laminado PET/aluminio/PE, reciclabilidad Grado C (eliminaci\xF3n gradual prevista para 2038), declaraci\xF3n libre de PFAS.",
          "@language": "es"
        },
        {
          "@value": "Zakje van PET/aluminium/PE-laminaat, recycleerbaarheid klasse C (uitfasering gepland tegen 2038), PFAS-vrij verklaard.",
          "@language": "nl"
        },
        {
          "@value": "Pose af PET/aluminium/PE-laminat, genanvendelighed grad C (planlagt udfasning inden 2038), PFAS-fri-erkl\xE6ring.",
          "@language": "da"
        },
        {
          "@value": "Torebka z laminatu PET/aluminium/PE, recykling klasy C (planowane wycofanie do 2038 r.), deklaracja PFAS-free.",
          "@language": "pl"
        },
        {
          "@value": "P\xE5se i PET/aluminium/PE-laminat, \xE5tervinningsbarhet klass C (planerad utfasning till 2038), PFAS-fri-deklaration.",
          "@language": "sv"
        },
        {
          "@value": "Pose i PET/aluminium/PE-laminat, gjenvinnbarhet klasse C (planlagt utfasing innen 2038), PFAS-fri erkl\xE6ring.",
          "@language": "no"
        },
        {
          "@value": "PET/alumiini/PE-laminaattipussi, kierr\xE4tett\xE4vyysluokka C (suunniteltu poistuminen vuoteen 2038 menness\xE4), PFAS-vapaaksi todistettu.",
          "@language": "fi"
        },
        {
          "@value": "Bustina in laminato PET/Alluminio/PE, riciclabilit\xE0 Grado C (eliminazione progressiva prevista entro il 2038), dichiarazione senza PFAS.",
          "@language": "it"
        }
      ]
    }
  },
  {
    group: "EU Construction (CPR)",
    label: "cement-bag (model)",
    doc: {
      _comment: [
        "CPR DPP example: a 25 kg bag of CEM I 52.5 N portland cement.",
        "Demonstrates the standard CPR data set: declarationOfPerformanceUrl,",
        "essentialCharacteristic for compressive strength (per EN 197-1),",
        "reactionToFireClass A1 (cement is non-combustible), 35% recycled",
        "content via dpp:RecycledContent (BFS / blast-furnace slag), and",
        "carbon footprint via dpp:CarbonFootprintDeclaration with lifecycle",
        "stages. GS1 demo prefix 952 (7-digit GCP: 9521234)."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/cpr/cpr-context.jsonld"
      ],
      id: "https://id.gs1.org/01/09521234600015",
      type: "ConstructionProduct",
      gtin: "09521234600015",
      productName: {
        "@value": "BetonStrong CEM I 52.5 N, 25 kg bag",
        "@language": "en"
      },
      constructionProductType: "Cement",
      reactionToFireClass: "A1",
      declarationOfPerformanceUrl: "https://manufacturer.example/dop/CEM-I-52-5-N-2026-001.pdf",
      manufacturer: {
        id: "https://id.gs1.org/417/9521234000044",
        type: "Organization",
        organizationName: "Bauwerk Cement GmbH",
        partyGLN: "9521234000044"
      },
      essentialCharacteristic: [
        {
          type: "EssentialCharacteristic",
          characteristicName: "Compressive Strength (28 days)",
          characteristicValue: {
            type: "QuantitativeValue",
            value: 52.5,
            unitCode: "N20"
          },
          harmonisedStandard: "https://standards.cencenelec.eu/dyn/www/f?p=205:110::::::FSP_PROJECT,FSP_ORG_ID:30253,5839"
        },
        {
          type: "EssentialCharacteristic",
          characteristicName: "Initial Setting Time",
          characteristicValue: {
            type: "QuantitativeValue",
            value: 75,
            unitCode: "MIN"
          },
          harmonisedStandard: "https://standards.cencenelec.eu/dyn/www/f?p=205:110::::::FSP_PROJECT,FSP_ORG_ID:30253,5839"
        }
      ],
      recycledContent: {
        type: "RecycledContent",
        recycledContent: {
          type: "QuantitativeValue",
          value: 0.35,
          unitCode: "P1"
        },
        preConsumerRecycledContent: {
          type: "QuantitativeValue",
          value: 0.35,
          unitCode: "P1"
        }
      },
      materialComposition: [
        {
          type: "MaterialComposition",
          materialName: "Portland clinker",
          massFraction: 0.65
        },
        {
          type: "MaterialComposition",
          materialName: "Granulated blast-furnace slag (GBFS)",
          massFraction: 0.3
        },
        {
          type: "MaterialComposition",
          materialName: "Gypsum",
          massFraction: 0.05
        }
      ],
      carbonFootprintDeclaration: {
        type: "CarbonFootprintDeclaration",
        carbonFootprintTotal: {
          type: "QuantitativeValue",
          value: 14.2,
          unitCode: "KGM"
        },
        carbonFootprintRawMaterial: {
          type: "QuantitativeValue",
          value: 8.1,
          unitCode: "KGM"
        },
        carbonFootprintProduction: {
          type: "QuantitativeValue",
          value: 5.4,
          unitCode: "KGM"
        },
        carbonFootprintDistribution: {
          type: "QuantitativeValue",
          value: 0.7,
          unitCode: "KGM"
        },
        carbonFootprintMethodology: "https://www.iso.org/standard/71206.html",
        declaredUnit: "1 kg of cement"
      },
      regulatoryInformation: [
        {
          type: "RegulatoryInformation",
          regulationType: {
            id: "gs1:RegulationTypeCode-CONSTRUCTION_PRODUCTS_REGULATION"
          },
          regulatoryAct: "EU 2024/3110",
          isRegulationCompliant: true
        }
      ]
    }
  },
  {
    group: "EU Construction (CPR)",
    label: "insulation-panel (model)",
    doc: {
      _comment: [
        "CPR DPP example: a 1200\xD7600\xD7100 mm mineral-wool insulation panel.",
        "Demonstrates a non-cement product: thermal conductivity and reaction-",
        "to-fire (A1, mineral wool is non-combustible) as essential characteristics",
        "per EN 13162. 30% recycled glass cullet via dpp:RecycledContent, no",
        "hazardous substances, end-of-life take-back via dpp:EndOfLifeProgram.",
        "GS1 demo prefix 952 (7-digit GCP: 9521234)."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/cpr/cpr-context.jsonld"
      ],
      id: "https://id.gs1.org/01/09521234600022",
      type: "ConstructionProduct",
      gtin: "09521234600022",
      productName: {
        "@value": "ThermoWool Plus 100, 1200\xD7600\xD7100 mm mineral wool panel",
        "@language": "en"
      },
      constructionProductType: "Insulation",
      reactionToFireClass: "A1",
      declarationOfPerformanceUrl: "https://manufacturer.example/dop/ThermoWool-Plus-100-2026-001.pdf",
      manufacturer: {
        id: "https://id.gs1.org/417/9521234000051",
        type: "Organization",
        organizationName: "IsolierTech AG",
        partyGLN: "9521234000051"
      },
      essentialCharacteristic: [
        {
          type: "EssentialCharacteristic",
          characteristicName: "Thermal Conductivity \u03BBD",
          characteristicValue: {
            type: "QuantitativeValue",
            value: 0.034,
            unitCode: "F94"
          },
          harmonisedStandard: "https://standards.cencenelec.eu/dyn/www/f?p=205:110::::::FSP_PROJECT,FSP_ORG_ID:30562,5839"
        },
        {
          type: "EssentialCharacteristic",
          characteristicName: "Density",
          characteristicValue: {
            type: "QuantitativeValue",
            value: 60,
            unitCode: "KMQ"
          },
          harmonisedStandard: "https://standards.cencenelec.eu/dyn/www/f?p=205:110::::::FSP_PROJECT,FSP_ORG_ID:30562,5839"
        }
      ],
      recycledContent: {
        type: "RecycledContent",
        recycledContent: {
          type: "QuantitativeValue",
          value: 0.3,
          unitCode: "P1"
        },
        postConsumerRecycledContent: {
          type: "QuantitativeValue",
          value: 0.3,
          unitCode: "P1"
        }
      },
      materialComposition: [
        {
          type: "MaterialComposition",
          materialName: "Mineral wool (rock + recycled glass cullet)",
          massFraction: 0.97
        },
        {
          type: "MaterialComposition",
          materialName: "Phenolic resin binder",
          massFraction: 0.03
        }
      ],
      endOfLifeProgram: {
        type: "EndOfLifeProgram",
        takeBackUrl: "https://isoliertech.example/take-back",
        takeBackIncentive: "Free pick-up for site quantities >500 kg",
        collectionPointDirectoryUrl: "https://isoliertech.example/collection-points",
        dismantlingGuideUrl: "https://isoliertech.example/dismantling-guide-thermowool"
      },
      regulatoryInformation: [
        {
          type: "RegulatoryInformation",
          regulationType: {
            id: "gs1:RegulationTypeCode-CONSTRUCTION_PRODUCTS_REGULATION"
          },
          regulatoryAct: "EU 2024/3110",
          isRegulationCompliant: true
        }
      ]
    }
  },
  {
    group: "EU Detergent",
    label: "dishwasher-detergent (model)",
    doc: {
      _comment: [
        "Dishwasher capsule DPP example per EU 2026/405.",
        "Shows: capsule form with film biodegradability, builders/bleach/enzyme ingredients,",
        "no fragrance allergens, phosphorus declaration, CLP hazard."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld",
        {
          gs1: "https://ref.gs1.org/voc/",
          xsd: "http://www.w3.org/2001/XMLSchema#"
        }
      ],
      id: "https://id.gs1.org/01/09521234200024",
      type: [
        "Product",
        "DetergentProduct"
      ],
      gtin: "09521234200024",
      productName: {
        "@value": "EcoClean PowerTabs All-in-1 Dishwasher Capsules",
        "@language": "en"
      },
      "gs1:productDescription": {
        "@value": "All-in-one dishwasher capsules with water-soluble biodegradable film. Contains detergent, rinse aid, and salt function. Fragrance-free.",
        "@language": "en"
      },
      detergentCategory: "DishwasherDetergent",
      productForm: "Capsule",
      intendedUse: "Automatic dishwashing machines, 1 capsule per cycle",
      customsCommodityCode: "34022090",
      customsCommodityCodeType: "CN8",
      "gs1:manufacturer": {
        id: "https://id.gs1.org/417/9521234000006",
        type: "Organization",
        organizationName: "EcoClean Industries GmbH",
        gln: "9521234000006",
        address: {
          type: "PostalAddress",
          "gs1:streetAddress": "Industriestra\xDFe 42",
          "gs1:addressLocality": "Hamburg",
          "gs1:postalCode": "20457",
          "gs1:countryCode": "DE"
        }
      },
      "dpp:operatorInformation": {
        id: "https://id.gs1.org/417/9521234000006#operator",
        type: "OperatorInformation",
        gln: "9521234000006",
        organizationName: "EcoClean Industries GmbH",
        "dpp:operatorRole": {
          id: "dpp:Manufacturer"
        }
      },
      "gs1:countryOfOrigin": "DE",
      "gs1:netContent": {
        type: "QuantitativeValue",
        value: 30,
        unitCode: "H87"
      },
      ingredientList: [
        {
          id: "https://id.gs1.org/01/09521234200024#ing-percarbonate",
          type: "Ingredient",
          inciName: "Sodium Percarbonate",
          ingredientFunction: "Bleach",
          weightPercentRange: "15-30%",
          casNumber: "15630-89-4",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200024#ing-carbonate",
          type: "Ingredient",
          inciName: "Sodium Carbonate",
          ingredientFunction: "Builder",
          weightPercentRange: "15-30%",
          casNumber: "497-19-8",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200024#ing-citrate",
          type: "Ingredient",
          inciName: "Sodium Citrate",
          ingredientFunction: "Builder",
          weightPercentRange: "5-15%",
          casNumber: "68-04-2",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200024#ing-nonionic",
          type: "Ingredient",
          inciName: "C12-15 Pareth-7",
          ingredientFunction: "SurfactantFunction",
          weightPercentRange: "<5%",
          casNumber: "68131-39-5",
          isSurfactant: true
        },
        {
          id: "https://id.gs1.org/01/09521234200024#ing-protease",
          type: "Ingredient",
          inciName: "Subtilisin",
          ingredientFunction: "Enzyme",
          weightPercentRange: "<5%",
          casNumber: "9014-01-1",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200024#ing-amylase",
          type: "Ingredient",
          inciName: "Alpha-Amylase",
          ingredientFunction: "Enzyme",
          weightPercentRange: "<5%",
          casNumber: "9000-90-2",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200024#ing-taed",
          type: "Ingredient",
          inciName: "TAED",
          ingredientFunction: "Bleach",
          weightPercentRange: "<5%",
          casNumber: "10543-57-4",
          isSurfactant: false
        }
      ],
      surfactantBiodegradability: [
        {
          id: "https://id.gs1.org/01/09521234200024#biodeg-nonionic",
          type: "SurfactantBiodegradability",
          surfactantType: "NonIonic",
          biodegradationPercentage: 89.1,
          testMethod: "OECD301F",
          testDurationDays: 28,
          passesUltimateBiodegradability: true
        }
      ],
      filmBiodegradable: true,
      filmBiodegradabilityPercentage: 94.7,
      signalWord: "Danger",
      hazardPictograms: [
        "GHS05",
        "GHS07"
      ],
      hStatements: [
        "H318",
        "H315",
        "H412"
      ],
      pStatements: [
        "P101",
        "P102",
        "P280",
        "P305+P351+P338",
        "P310",
        "P102"
      ],
      phosphorusContentPercent: 0.3,
      phosphateCompliant: true,
      dosageInstructions: {
        "@value": "Place 1 capsule in the main dispenser compartment. Do not unwrap. Do not handle with wet hands. Suitable for all dishwasher types.",
        "@language": "en"
      },
      safetyDataSheet: {
        id: "https://www.ecoclean.example.com/sds/dishwasher-capsules-sds.pdf",
        type: "DocumentReference",
        "dpp:documentType": {
          id: "dpp:SafetyDataSheet"
        },
        "dpp:documentUrl": "https://www.ecoclean.example.com/sds/dishwasher-capsules-sds.pdf",
        "schema:name": "Safety Data Sheet - EcoClean PowerTabs All-in-1",
        "dpp:mimeType": "application/pdf",
        "dpp:languageCode": "en"
      },
      "dpp:passportIdentifier": "https://dpp.ecoclean.example.com/passport/09521234200020",
      "dpp:passportVersion": "1.0",
      "dpp:passportIssueDate": "2026-09-01",
      "dpp:passportStatus": "Active",
      "dpp:productCategory": {
        id: "dpp:Detergents"
      },
      "dpp:lastDataUpdate": "2026-09-01T10:00:00Z"
    }
  },
  {
    group: "EU Detergent",
    label: "laundry-detergent (model)",
    doc: {
      _comment: [
        "Consumer liquid laundry detergent DPP example per EU 2026/405.",
        "Model-based DPP: same manufacturer + identical formulation = one DPP.",
        "GS1 demo prefix 952 (7-digit GCP: 9521234).",
        "Shows: full INCI ingredient list, surfactant biodegradability, CLP hazard classification,",
        "fragrance allergen disclosure, phosphorus declaration, recommended dosage."
      ],
      "@context": [
        "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        "https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld",
        {
          gs1: "https://ref.gs1.org/voc/",
          xsd: "http://www.w3.org/2001/XMLSchema#"
        }
      ],
      id: "https://id.gs1.org/01/09521234200017",
      type: [
        "Product",
        "DetergentProduct"
      ],
      gtin: "09521234200017",
      productName: {
        "@value": "EcoClean Pro Liquid Laundry Detergent - Sensitive",
        "@language": "en"
      },
      "gs1:productDescription": {
        "@value": "Concentrated liquid laundry detergent for sensitive skin. Dermatologically tested, phosphate-free formula with plant-based surfactants.",
        "@language": "en"
      },
      detergentCategory: "LaundryDetergent",
      productForm: "Liquid",
      intendedUse: "Machine and hand washing of textiles at 20-60\xB0C",
      customsCommodityCode: "34022090",
      customsCommodityCodeType: "CN8",
      "gs1:manufacturer": {
        id: "https://id.gs1.org/417/9521234000006",
        type: "Organization",
        organizationName: "EcoClean Industries GmbH",
        gln: "9521234000006",
        address: {
          type: "PostalAddress",
          "gs1:streetAddress": "Industriestra\xDFe 42",
          "gs1:addressLocality": "Hamburg",
          "gs1:postalCode": "20457",
          "gs1:countryCode": "DE"
        }
      },
      "dpp:operatorInformation": {
        id: "https://id.gs1.org/417/9521234000006#operator",
        type: "OperatorInformation",
        gln: "9521234000006",
        organizationName: "EcoClean Industries GmbH",
        "dpp:operatorRole": {
          id: "dpp:Manufacturer"
        },
        "gs1:address": {
          type: "PostalAddress",
          "gs1:streetAddress": "Industriestra\xDFe 42",
          "gs1:addressLocality": "Hamburg",
          "gs1:postalCode": "20457",
          "gs1:countryCode": "DE"
        }
      },
      "gs1:countryOfOrigin": "DE",
      "gs1:netContent": {
        type: "QuantitativeValue",
        value: 1500,
        unitCode: "MLT"
      },
      ingredientList: [
        {
          id: "https://id.gs1.org/01/09521234200017#ing-water",
          type: "Ingredient",
          inciName: "Aqua",
          ingredientFunction: "Solvent",
          weightPercentRange: ">=30%",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200017#ing-las",
          type: "Ingredient",
          inciName: "Sodium Dodecylbenzenesulfonate",
          ingredientFunction: "SurfactantFunction",
          weightPercentRange: "5-15%",
          casNumber: "25155-30-0",
          isSurfactant: true
        },
        {
          id: "https://id.gs1.org/01/09521234200017#ing-aeo",
          type: "Ingredient",
          inciName: "Laureth-7",
          ingredientFunction: "SurfactantFunction",
          weightPercentRange: "5-15%",
          casNumber: "3055-97-8",
          isSurfactant: true
        },
        {
          id: "https://id.gs1.org/01/09521234200017#ing-citrate",
          type: "Ingredient",
          inciName: "Sodium Citrate",
          ingredientFunction: "Builder",
          weightPercentRange: "5-15%",
          casNumber: "68-04-2",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200017#ing-glycerin",
          type: "Ingredient",
          inciName: "Glycerin",
          ingredientFunction: "Solvent",
          weightPercentRange: "<5%",
          casNumber: "56-81-5",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200017#ing-protease",
          type: "Ingredient",
          inciName: "Subtilisin",
          ingredientFunction: "Enzyme",
          weightPercentRange: "<5%",
          casNumber: "9014-01-1",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200017#ing-amylase",
          type: "Ingredient",
          inciName: "Alpha-Amylase",
          ingredientFunction: "Enzyme",
          weightPercentRange: "<5%",
          casNumber: "9000-90-2",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200017#ing-preservative",
          type: "Ingredient",
          inciName: "Methylisothiazolinone",
          ingredientFunction: "Preservative",
          weightPercentRange: "<5%",
          casNumber: "2682-20-4",
          isSurfactant: false
        },
        {
          id: "https://id.gs1.org/01/09521234200017#ing-parfum",
          type: "Ingredient",
          inciName: "Parfum",
          ingredientFunction: "Fragrance",
          weightPercentRange: "<5%",
          isSurfactant: false
        }
      ],
      surfactantBiodegradability: [
        {
          id: "https://id.gs1.org/01/09521234200017#biodeg-anionic",
          type: "SurfactantBiodegradability",
          surfactantType: "Anionic",
          biodegradationPercentage: 82.5,
          testMethod: "OECD301B",
          testDurationDays: 28,
          passesUltimateBiodegradability: true
        },
        {
          id: "https://id.gs1.org/01/09521234200017#biodeg-nonionic",
          type: "SurfactantBiodegradability",
          surfactantType: "NonIonic",
          biodegradationPercentage: 76.3,
          testMethod: "OECD301B",
          testDurationDays: 28,
          passesUltimateBiodegradability: true
        }
      ],
      fragranceAllergens: [
        {
          id: "https://id.gs1.org/01/09521234200017#allergen-linalool",
          type: "FragranceAllergen",
          allergenName: "Linalool",
          allergenCasNumber: "78-70-6",
          allergenConcentration: 0.15
        },
        {
          id: "https://id.gs1.org/01/09521234200017#allergen-limonene",
          type: "FragranceAllergen",
          allergenName: "Limonene",
          allergenCasNumber: "5989-27-5",
          allergenConcentration: 0.08
        }
      ],
      signalWord: "Warning",
      hazardPictograms: [
        "GHS07"
      ],
      hStatements: [
        "H315",
        "H319"
      ],
      pStatements: [
        "P101",
        "P102",
        "P280",
        "P302+P352",
        "P305+P351+P338"
      ],
      phosphorusContentPercent: 0,
      phosphateCompliant: true,
      recommendedDosage: {
        id: "https://id.gs1.org/01/09521234200017#dosage",
        type: "QuantitativeValue",
        value: 35,
        unitCode: "MLT"
      },
      dosageInstructions: {
        "@value": "Medium water hardness: 35 ml per 4.5 kg load. Hard water: 50 ml. Heavily soiled: add 15 ml. Pre-treat stains directly.",
        "@language": "en"
      },
      safetyDataSheet: {
        id: "https://www.ecoclean.example.com/sds/laundry-sensitive-sds.pdf",
        type: "DocumentReference",
        "dpp:documentType": {
          id: "dpp:SafetyDataSheet"
        },
        "dpp:documentUrl": "https://www.ecoclean.example.com/sds/laundry-sensitive-sds.pdf",
        "schema:name": "Safety Data Sheet - EcoClean Pro Liquid Laundry Detergent Sensitive",
        "dpp:mimeType": "application/pdf",
        "dpp:languageCode": "en"
      },
      biodegradabilityTestReport: {
        id: "https://www.ecoclean.example.com/reports/biodeg-test-2026-001.pdf",
        type: "DocumentReference",
        "dpp:documentType": {
          id: "dpp:TestReport"
        },
        "dpp:documentUrl": "https://www.ecoclean.example.com/reports/biodeg-test-2026-001.pdf",
        "schema:name": "Surfactant Biodegradability Test Report",
        "dpp:mimeType": "application/pdf",
        "dpp:languageCode": "en"
      },
      "dpp:passportIdentifier": "https://dpp.ecoclean.example.com/passport/09521234200013",
      "dpp:passportVersion": "1.0",
      "dpp:passportIssueDate": "2026-09-01",
      "dpp:passportStatus": "Active",
      "dpp:productCategory": {
        id: "dpp:Detergents"
      },
      "dpp:lastDataUpdate": "2026-09-01T10:00:00Z"
    }
  },
  {
    group: "US FSMA 204",
    label: "ftl-product (model)",
    doc: {
      "@context": [
        "https://ref.openepcis.io/extensions/us/fsma204/fsma204-context.jsonld"
      ],
      type: "Product",
      id: "https://id.gs1.org/01/00860009999923",
      _comment_gs1us_mapping: [
        "Trade-item master data for a food on the Food Traceability List.",
        "Per GS1 US 'Application of GS1 System of Standards to Support FSMA 204' R3.0,",
        "the TLC itself is NOT stored on the master-data record; it is created per lot at the",
        "Initial Packing / First-Land-Based-Receiver / Transformation CTE and encoded in EPCIS",
        "events as https://id.gs1.org/01/{GTIN}/10/{Batch/Lot}.",
        "Master data only needs to carry GTIN-level descriptors (gs1:functionalName,",
        "gs1:importClassificationTypeCode + gs1:importClassificationValue,",
        "gs1:gpcCategoryCode) plus any FDA-categorisation such as fsma:foodTraceabilityListCategory."
      ],
      gtin: "00860009999923",
      functionalName: "Romaine lettuce, fresh-cut, whole heads",
      importClassificationTypeCode: "HTSUS",
      importClassificationValue: "0705.11.2000",
      gpcCategoryCode: "10006423",
      foodTraceabilityListCategory: "LeafyGreensFreshCut",
      netWeight: {
        type: "gs1:QuantitativeValue",
        "gs1:value": 11.34,
        "gs1:unitCode": "KGM"
      },
      countryOfOrigin: {
        type: "gs1:Country",
        "gs1:countryCode": "US"
      },
      manufacturer: {
        id: "https://id.gs1.org/417/0860009999060",
        type: "Organization",
        organizationName: "Sunrise Valley Farm LLC",
        partyGLN: "0860009999060"
      }
    }
  }
];

// demos/en18223-converter/app.ts
var range = new Map(Object.entries(range_index_default));
var CONTEXTS = contexts_default;
var documentLoader = async (url) => {
  if (CONTEXTS[url]) return { contextUrl: void 0, documentUrl: url, document: CONTEXTS[url] };
  const res = await fetch(url, { headers: { Accept: "application/ld+json, application/json" } });
  if (!res.ok) throw new Error(`could not load context ${url}: ${res.status}`);
  return { contextUrl: void 0, documentUrl: url, document: await res.json() };
};
var SAMPLES = samples_default;
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
    const specs = Array.isArray(out.contentSpecificationIds) ? out.contentSpecificationIds.length : 0;
    setStatus(`Derived: ${n} top-level elements \xB7 granularity "${out.granularity}" \xB7 ${specs} content specification(s)`, "ok");
  } catch (e) {
    outputEl().textContent = "";
    setStatus(`Error: ${e.message}`, "err");
  }
}
function loadSample(idx) {
  const s = SAMPLES[idx];
  if (s) inputEl().value = JSON.stringify(s.doc, null, 2);
}
function init() {
  const select = $("sample");
  let currentGroup = "";
  let optgroup = null;
  SAMPLES.forEach((s, i) => {
    if (s.group !== currentGroup) {
      optgroup = document.createElement("optgroup");
      optgroup.label = s.group;
      select.appendChild(optgroup);
      currentGroup = s.group;
    }
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = s.label;
    optgroup.appendChild(opt);
  });
  select.addEventListener("change", () => loadSample(Number(select.value)));
  $("derive").addEventListener("click", () => void derive());
  if (SAMPLES.length) {
    loadSample(0);
    void derive();
  }
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
