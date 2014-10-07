import { split } from "./string";
import {
  prepareTextMeasurement,
  measureText,
  teardownTextMeasurement
} from "dom-ruler/text";
import { layout } from "dom-ruler/layout";


var truncate = function (block, fragment, options) {
  // Split the text where the line may break
  var text = split(fragment.innerHTML, { lineBreak: 'strict', lang: options.lang });
  var html = [];
  for (var i = 0, len = text.length; i < len; i++) {
    html[i] = '<span>' + text[i] + '</span>';
  }

  // Prepare the test element
  var element = prepareTextMeasurement(fragment);
  // Compute the location of each <span>, resulting in line metrics
  measureText(html.join(''), false);

  var lines = [];
  var words = element.getElementsByTagName('span');
  var word;
  var layout;
  var lastWord;
  var line = [];

  for (i = 0, len = words.length; i < len; i++) {
    word = words[i];
    layout = layout(word);
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
  }

  // Teardown the test element
  teardownTextMeasurement();

  if (lines.length > options.lines) {
    var noTokens = 0;
    for (i = 0, len = options.lines; i < len; i++) {
      noTokens += lines.length;
    }

    var tokens = text.slice(0, noTokens);
  }
};

export var truncate = truncate;
