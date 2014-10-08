{{HEADER}}
import { trim } from "./utils";

var STRICT_BREAK_RE = /{{STRICT}}/;
var NORMAL_BREAK_RE = /{{NORMAL}}/;
var CJK_NORMAL_BREAK_RE = /{{CJK_NORMAL}}/;
var LOOSE_BREAK_RE = /{{LOOSE}}/;
var CJK_LOOSE_BREAK_RE = /{{CJK_LOOSE}}/;

var splitOnSoftWrapOpportunities = function (string, options) {
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

export {
  splitOnSoftWrapOpportunities
};
