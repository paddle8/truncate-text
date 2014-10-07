import { split, trim } from "./truncate/string";
import { words } from "./truncate/words";
import { measure } from "dom-ruler/text";
import { layout as layoutOf } from "dom-ruler/layout";

var truncate = function (fragment, options) {
  options.ellipsis = options.ellipsis || '&hellip;';
  options.block = options.block || fragment;
  options.lineBreak = options.lineBreak || 'normal';

  var width = layoutOf(fragment).width;
  options.width = width;
  options.template = fragment;

  var metrics = words(fragment.innerHTML, options);
  var lines = metrics.lines;

  // Compute the size of the ellipsis
  var ellipsisWidth = measure(options.ellipsis, { template: fragment, escape: false }).width;

  if (lines.length > options.lines) {
    var noTokens = 0;
    var line;
    for (var i = 0, len = options.lines; i < len; i++) {
      line = lines[i];
      noTokens += line.length;
    }

    var tokens = metrics.words.slice(0, noTokens);
    var lastToken = line[line.length - 1];
    while (lastToken.left + lastToken.width + ellipsisWidth > width) {
      tokens.pop();
      line.pop();
      lastToken = line[line.length - 1];
    }
    fragment.innerHTML = trim(tokens.join('')) + options.ellipsis;
  }
};

export var truncate = truncate;
