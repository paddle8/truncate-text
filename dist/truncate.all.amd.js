define("dom-ruler/layout", 
  ["dom-ruler/styles","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var pluckStyles = __dependency1__.pluckStyles;
    var detectBoxSizing = __dependency1__.detectBoxSizing;

    /**
      Normalizes margins to return 'auto' or a number
     */
    var normalizeMargin = function (margin) {
      if (margin !== 'auto') {
        return parseInt(margin, 10);
      }
      return margin;
    };

    var windowLayout = function (window) {
      var width = window.innerWidth;
      var height = window.innerHeight;

      // IE<8 doesn't support window.innerWidth / window.outerWidth
      return {
        width:     width,
        height:    height,
        boxSizing: null,
        content:   { width: width, height: height },
        borders:   { width: width, height: height },
        margins:   {
          width:  window.outerWidth,
          height: window.outerHeight
        }
      };
    };

    var documentLayout = function (document) {
      var width = Math.max(
        document.body.scrollWidth, document.documentElement.scrollWidth,
        document.body.offsetWidth, document.documentElement.offsetWidth,
        document.body.clientWidth, document.documentElement.clientWidth
      );
      var height = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );

      // The document has no chrome
      return {
        width:    width,
        height:   height,
        boxSizing: null,
        content: { width: width, height: height },
        borders: { width: width, height: height },
        margins: { width: width, height: height }
      };
    };

    /**
      Computes the layout of an element that matches
      the inspector properties of the DOM element.
     */
    function layoutOf(element) {
      // Handle window
      if ((window.Window && element instanceof Window) || // Standards
          element === window) {                           // Safari 5.1
        return windowLayout(element);
      }

      // Handle document
      if ((window.Document && element instanceof Document) || // Standards
          element === document) {                             // old IE
        return documentLayout(element);
      }

      var boxSizing = detectBoxSizing(element);
      var content = {
        width:  element.offsetWidth,
        height: element.offsetHeight
      };
      var styles = pluckStyles(element);
      var layout = {
        width:     null,
        height:    null,
        boxSizing: boxSizing,
        content:   {},
        padding:   {},
        borders:   {},
        margins:   {}
      };
      var padding = {
        top:    parseInt(styles.paddingTop,        10),
        right:  parseInt(styles.paddingRight,      10),
        bottom: parseInt(styles.paddingBottom,     10),
        left:   parseInt(styles.paddingLeft,       10)
      };
      var borders = {
        top:    parseInt(styles.borderTopWidth,    10),
        right:  parseInt(styles.borderRightWidth,  10),
        bottom: parseInt(styles.borderBottomWidth, 10),
        left:   parseInt(styles.borderLeftWidth,   10)
      };
      var margins = {
        top:    normalizeMargin(styles.marginTop),
        right:  normalizeMargin(styles.marginRight),
        bottom: normalizeMargin(styles.marginBottom),
        left:   normalizeMargin(styles.marginLeft)
      };

      // Normalize the width and height so
      // they refer to the content
      content.width  -= borders.right + borders.left +
                        padding.right + padding.left;
      content.height -= borders.top + borders.bottom +
                        padding.top + padding.bottom;
      layout.content = content;

      padding.width  = content.width +
                       padding.left + padding.right;
      padding.height = content.height +
                       padding.top + padding.bottom;
      layout.padding = padding;

      borders.width  = padding.width +
                       borders.left + borders.right;
      borders.height = padding.height +
                       borders.top + borders.bottom;
      layout.borders = borders;

      // Provide the "true" width and height
      // of the box in terms of the current box model
      switch (boxSizing) {
      case 'border-box':
        layout.width  = borders.width;
        layout.height = borders.height;
        break;
      case 'padding-box':
        layout.width  = padding.width;
        layout.height = padding.height;
        break;
      default:
        layout.width  = content.width;
        layout.height = content.height;
      }

      if (margins.left !== 'auto' && margins.right !== 'auto') {
        margins.width = borders.width +
                        margins.left + margins.right;
      } else {
        margins.width = 'auto';
      }

      if (margins.top !== 'auto' && margins.bottom !== 'auto') {
        margins.height = borders.height +
                         margins.top + margins.bottom;
      } else {
        margins.height = 'auto';
      }
      layout.margins = margins;

      return layout;
    }

    var layout = layoutOf;
    __exports__.layout = layout;
  });
;define("dom-ruler/styles", 
  ["dom-ruler/utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var pluck = __dependency1__.pluck;
    var merge = __dependency1__.merge;

    // A list of all of the style properties
    // to copy over to our example element
    var LAYOUT_STYLES = [
      'maxWidth',
      'maxHeight',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
      'borderLeftStyle',
      'borderRightStyle',
      'borderTopStyle',
      'borderBottomStyle',
      'borderLeftWidth',
      'borderRightWidth',
      'borderTopWidth',
      'borderBottomWidth',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'fontVariant',
      'lineHeight',
      'whiteSpace',
      'letterSpacing',
      'wordWrap',
      'boxSizing',
      'MozBoxSizing',
      'textTransform',
      'textRendering',
      // Font feature settings
      'webkitFontFeatureSettings',
      'mozFontFeatureSettings',
      'msFontFeatureSettings',
      'oFontFeatureSettings',
      'fontFeatureSettings'
    ];

    var DEFAULT_BOX_SIZING;

    // Retrieve the computed style of the element
    var pluckStyles = function (element) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        return document.defaultView.getComputedStyle(element, null);
      }
      return element.currentStyle;
    };

    var copyStyles = function (element, targetElement) {
      var styles = pluck(pluckStyles(element), LAYOUT_STYLES);
      merge(targetElement.style, styles);
    };

    /**
      Detect the browser's default box sizing.
      This should detect old IE quirks and then
      provide the correct box model when detecting
      per-element box-sizing.

      @private
     */
    var detectDefaultBoxSizing = function () {
      var tester = document.createElement('div');
      var boxSizing;

      document.body.appendChild(tester);
      tester.style.cssText = 'width:24px; padding:10px; border:2px solid #000;' +
                             'box-sizing:content-box; -moz-box-sizing:content-box;';

      switch (tester.offsetWidth) {
      case 24:
        boxSizing = 'border-box';
        break;
      case 44:
        boxSizing = 'padding-box';
        break;
      case 48:
        boxSizing = 'content-box';
        break;
      }

      document.body.removeChild(tester);
      return boxSizing;
    };

    var detectBoxSizing = function (element) {
      // Detect the browser's default box sizing model
      if (DEFAULT_BOX_SIZING == null) {
        DEFAULT_BOX_SIZING = detectDefaultBoxSizing();
      }

      var styles = pluckStyles(element);
      return styles.boxSizing       ||
             styles.webkitBoxSizing ||
             styles.MozBoxSizing    ||
             styles.msBoxSizing     ||
             styles.oBoxSizing      ||
             DEFAULT_BOX_SIZING;
    };


    __exports__.pluckStyles = pluckStyles;
    __exports__.copyStyles = copyStyles;
    __exports__.detectBoxSizing = detectBoxSizing;
  });
;define("dom-ruler/utils", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // modified from
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    var keys = Object.keys || (function () {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
          hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
          dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
          ],
          dontEnumsLength = dontEnums.length;

      return function keys(obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [], i;
        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());

    var slice = Array.prototype.slice;

    var merge = function (target) {
      var mixins = slice.call(arguments, 1);
      for (var i = 0, len = mixins.length; i < len; i++) {
        var mixin = mixins[i] || {};
        var mixinKeys = keys(mixin);
        for (var j = 0, jLen = mixinKeys.length; j < jLen; j++) {
          var key = mixinKeys[j];
          target[key] = mixin[key];
        }
      }
      return target;
    };

    var pluck = function (object, array) {
      var pluckedProperties = {};
      for (var i = 0, len = array.length; i < len; i++) {
        var property = array[i];
        pluckedProperties[property] = object[property];
      }
      return pluckedProperties;
    };

    __exports__.keys = keys;
    __exports__.merge = merge;
    __exports__.pluck = pluck;
  });
;define("dom-ruler/text", 
  ["dom-ruler/styles","dom-ruler/utils","dom-ruler/layout","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var pluckStyles = __dependency1__.pluckStyles;
    var copyStyles = __dependency1__.copyStyles;
    var merge = __dependency2__.merge;
    var layout = __dependency3__.layout;

    var metricsCalculationElement = null;

    /**
      Prepare for measuring the layout of a string.
     */
    function prepareTextMeasurement(exampleElement, additionalStyles) {
      var element = metricsCalculationElement;
      additionalStyles = additionalStyles || {};

      if (metricsCalculationElement == null) {
        var parent = document.createElement('div');
        parent.style.cssText = "position:absolute; left:-10010px; top:-10px;" +
                               "width:10000px; height:0px; overflow:hidden;" +
                               "visibility:hidden;";

        element = metricsCalculationElement = document.createElement('div');

        parent.appendChild(metricsCalculationElement);
        document.body.insertBefore(parent, null);
      }

      var styles = pluckStyles(exampleElement);
      copyStyles(exampleElement, element);

      // Explicitly set the `font` property for Mozilla
      var font = "";
      if (styles.font === "") {
        if (styles.fontStyle)   { font += styles.fontStyle   + " "; }
        if (styles.fontVariant) { font += styles.fontVariant + " "; }
        if (styles.fontWeight)  { font += styles.fontWeight  + " "; }
        if (styles.fontSize)    { font += styles.fontSize    + " "; }
        else                    { font += "10px";                   }
        if (styles.lineHeight)  { font += "/" + styles.lineHeight;  }

        font += " ";
        if (styles.fontFamily)  { font += styles.fontFamily; }
        else                    { font += "sans-serif";      }

        element.style.font = font;
      }

      merge(element.style, {
        position: "absolute",
        top:    "0px",
        right:  "auto",
        bottom: "auto",
        left:   "0px",
        width:  "auto",
        height: "auto"
      }, additionalStyles);
      
      return element;
    }

    /**
      Cleanup properties used by `measureString`
      setup in `prepareStringMeasurement`.
     */
    function teardownTextMeasurement() {
      // Remove any leftover styling from string measurements
      if (metricsCalculationElement) {
        metricsCalculationElement.innerHTML = "";
        metricsCalculationElement.className = "";
        metricsCalculationElement.setAttribute('style', '');
      }
    }

    function measureText(string, escape) {
      var element = metricsCalculationElement;
      if (!escape) {
        element.innerHTML = string;

      // Escape the string by entering it as
      // a text node to the DOM element
      } else if (typeof element.innerText !== "undefined") {
        element.innerText = string;
      } else {
        element.textContent = string;
      }

      // Trigger a repaint so the height and width are correct
      // Webkit / Blink needs this to trigger a reflow
      element.style.overflow = 'visible';
      element.style.overflow = 'hidden';

      return layout(element);
    }

    /**
      Measures a string given the styles applied
      when setting up string measurements.

      @param string {String} The string to measure
      @param options {Object} A hash of values (whether to escape the value or not)
      @return {Object} The layout of the string passed in.
     */
    function measure(string, styles, options) {
      if (options == null) {
        options = styles;
        styles = {};
      }
      merge({ escape: true, template: null, lines: false }, options);

      if (options.template == null) {
        throw new Error("A template element is required to measure text.");
      }

      prepareTextMeasurement(options.template, styles);

      var element = metricsCalculationElement;
      var metrics = measureText(string, options.escape);

      var fontSize = parseInt(pluckStyles(element).fontSize, 10);
      var adjustment = fontSize - measureText("1", false).content.height;
      metrics.height += adjustment;

      teardownTextMeasurement();

      return metrics;
    }

    __exports__.prepareTextMeasurement = prepareTextMeasurement;
    __exports__.measureText = measureText;
    __exports__.teardownTextMeasurement = teardownTextMeasurement;
    __exports__.measure = measure;
  });
define("truncate", 
  ["truncate/string","truncate/words","dom-ruler/text","dom-ruler/utils","dom-ruler/layout","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var split = __dependency1__.split;
    var trim = __dependency1__.trim;
    var words = __dependency2__.words;
    var measure = __dependency3__.measure;
    var merge = __dependency4__.merge;
    var layoutOf = __dependency5__.layout;

    var truncate = function (fragment, options) {
      options = merge({
        ellipsis: '&hellip;',
        block: fragment,
        lineBreak: 'normal'
      }, options);

      var contentWidth = layoutOf(options.block).content.width;

      var width = layoutOf(options.block).content.width;
      var metrics = words(fragment.innerHTML, merge({ width: width, template: fragment }, options));
      var lines = metrics.lines;

      // Compute the size of the ellipsis
      var ellipsisWidth = measure(options.ellipsis, { template: fragment, escape: false }).width;

      var blockHTML = options.block.innerHTML;
      var fragmentHTML = fragment.outerHTML;
      blockHTML = blockHTML.slice(blockHTML.indexOf(fragmentHTML) + fragmentHTML.length);

      var blockLines = words(blockHTML, merge({ width: width, template: options.block }, options));
      var firstLine = blockLines.lines[0];
      var lastBlockToken = firstLine[firstLine.length - 1];
      var blockWidth = lastBlockToken.width + lastBlockToken.left;

      if (lines.length >= options.lines) {
        var noTokens = 0;
        var line;
        for (var i = 0, len = options.lines; i < len; i++) {
          line = lines[i];
          noTokens += line.length;
        }

        var tokens = metrics.words.slice(0, noTokens);
        var lastToken = line[line.length - 1];

        // Check to see if a full fragment needs to be truncated
        if (lastToken.left + lastToken.width + blockWidth <= contentWidth && options.lines === lines.length) {
          return;
        }

        while (lastToken.left + lastToken.width + ellipsisWidth + blockWidth > contentWidth) {
          tokens.pop();
          line.pop();
          lastToken = line[line.length - 1];
          if (lastToken == null) {
            break;
          }
        }
        fragment.innerHTML = trim(tokens.join('')) + options.ellipsis;
      }
    };

    var truncate = truncate;
    __exports__.truncate = truncate;
  });
;define("truncate/string", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // LineBreak-7.0.0.txt
    // Date: 2014-02-28, 23:15:00 GMT [KW, LI]
    var STRICT_BREAK_RE = /[\t \-\xA0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2011\u202F\u2060\uFEFF]/;
    var NORMAL_BREAK_RE = /[\t \-\xA0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2011\u202F\u2060\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u30FC\u31F0-\u31FF\uFEFF\uFF67-\uFF70]/;
    var CJK_NORMAL_BREAK_RE = /[\t \-\xA0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2010\u2011\u2013\u202F\u2060\u301C\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u30A0\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u30FC\u31F0-\u31FF\uFEFF\uFF67-\uFF70]/;
    var LOOSE_BREAK_RE = /[\t \-\xA0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2011\u202F\u2060\u3005\u303B\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u309D\u309E\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u30FC-\u30FE\u31F0-\u31FF\uFEFF\uFF67-\uFF70]/;
    var CJK_LOOSE_BREAK_RE = /[\t !%\-:;\?\xA0\xA2\xB0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2010\u2011\u2013\u202F\u2030\u2032\u2033\u203C\u2047-\u2049\u2060\u2103\u2116\u3005\u301C\u303B\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u309D\u309E\u30A0\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u30FB-\u30FE\u31F0-\u31FF\uFEFF\uFF01\uFF05\uFF1A\uFF1B\uFF1F\uFF65\uFF67-\uFF70\uFFE0]/;

    var trim = function (string) {
      if (typeof String.prototype.trim !== 'function') {
        return string.replace(/^\s+|\s+$/g, '');
      } else {
        return string.trim();
      }
    };

    var split = function (string, options) {
      var isChinese = options.lang === 'zh';
      var isJapanese = options.lang === 'ja';
      var regex;

      switch (options.lineBreak) {
      case 'strict':
        regex = STRICT_BREAK_RE;
      case 'normal':
        if (isChinese || isJapanese) {
          regex = CJK_NORMAL_BREAK_RE;
        } else {
          regex = NORMAL_BREAK_RE;
        }
        break;
      case 'loose':
        if (isChinese || isJapanese) {
          regex = CJK_LOOSE_BREAK_RE;
        } else {
          regex = LOOSE_BREAK_RE;
        }
        break;
      }

      string = trim(string);
      var tokens = [];
      while (string.length) {
        var index = string.search(regex);
        if (index > -1) {
          tokens.push(string.slice(0, index + 1));
          string = string.slice(index + 1);
        } else {
          tokens.push(string);
          string = '';
        }
      }

      return tokens;
    }

    __exports__.split = split;
    __exports__.trim = trim;
  });
;define("truncate/words", 
  ["truncate/string","dom-ruler/text","dom-ruler/layout","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var split = __dependency1__.split;
    var prepareTextMeasurement = __dependency2__.prepareTextMeasurement;
    var measureText = __dependency2__.measureText;
    var teardownTextMeasurement = __dependency2__.teardownTextMeasurement;
    var layoutOf = __dependency3__.layout;

    function words (string, options) {
      // Split the text where the line may break
      var text = split(string, { lineBreak: options.lineBreak, lang: options.lang });
      var html = [];
      for (var i = 0, len = text.length; i < len; i++) {
        html[i] = '<span>' + text[i] + '</span>';
      }

      // Prepare the test element
      var element = prepareTextMeasurement(options.template, { width: options.width + 'px' });

      // Compute the location of each <span>, resulting in line metrics
      measureText(html.join(''), false);

      var lines = [];
      var words = element.getElementsByTagName('span');
      var layout;
      var word;
      var lastWord;
      var line = [];

      for (i = 0, len = words.length; i < len; i++) {
        word = words[i];
        layout = layoutOf(word);
        word = {
          top: word.offsetTop,
          left: word.offsetLeft,
          width: layout.width,
          height: layout.height
        };

        if (lastWord == null || word.top === lastWord.top) {
          line.push(word);
        } else {
          lines.push(line);
          line = [word];
        }
        lastWord = word;
      }

      if (line.length) {
        lines.push(line);    
      }

      // Teardown the test element
      teardownTextMeasurement();

      return {
        words: text,
        lines: lines
      };
    };

    __exports__.words = words;
  });