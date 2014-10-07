import { split } from "./string";
import {
  prepareTextMeasurement,
  measureText,
  teardownTextMeasurement
} from "dom-ruler/text";
import { layout as layoutOf } from "dom-ruler/layout";

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
  var parentLayout = layoutOf(element).padding;
  var words = element.getElementsByTagName('span');
  var layout;
  var word;
  var lastWord;
  var line = [];

  for (i = 0, len = words.length; i < len; i++) {
    word = words[i];
    layout = layoutOf(word);
    word = {
      top: word.offsetTop - parentLayout.top,
      left: word.offsetLeft - parentLayout.left,
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

export { words };

