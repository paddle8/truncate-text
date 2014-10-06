import { split } from "./string";

var truncate = function (block, fragment, options) {
  // Split the text where the line may break
  var text = split(fragment.innerHTML, { lineBreak: 'strict', lang: options.lang });
  var html = [];
  for (var i = 0, len = text.length; i < len; i++) {
    html[i] = '<span>' + text[i] + '</span>';
  }

  // Prepare the test element
  // Compute the location of each <span>, resulting in line metrics
  var lines = [];
  // Teardown the test element

  if (lines.length > options.lines) {
    var noTokens = 0;
    for (i = 0, len = options.lines; i < len; i++) {
      noTokens += lines.length;
    }

    var tokens = text.slice(0, noTokens);
  }
}

export var truncate = truncate;
