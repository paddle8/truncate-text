import { split, trim } from "./string";
import {
  prepareTextMeasurement,
  measureText,
  teardownTextMeasurement,
  measure
} from "dom-ruler/text";
import { layout as layoutOf } from "dom-ruler/layout";

var truncate = function (fragment, options) {
  options.ellipsis = options.ellipsis || '&hellip;';

  // Split the text where the line may break
  var text = split(fragment.innerHTML, { lineBreak: 'strict', lang: options.lang });
  var html = [];
  for (var i = 0, len = text.length; i < len; i++) {
    html[i] = '<span>' + text[i] + '</span>';
  }

  // Prepare the test element
  var width = layoutOf(fragment).width;
  var element = prepareTextMeasurement(fragment, { width: width + 'px' });

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

  // Compute the size of the ellipsis
  var ellipsisWidth = measure(options.ellipsis, { template: fragment, escape: false }).width;

  if (lines.length > options.lines) {
    var noTokens = 0;
    for (i = 0, len = options.lines; i < len; i++) {
      line = lines[i];
      noTokens += line.length;
    }

    var tokens = text.slice(0, noTokens);
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
