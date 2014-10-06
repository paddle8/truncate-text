// LineBreak-7.0.0.txt
// Date: 2014-02-28, 23:15:00 GMT [KW, LI]
var STRICT_BREAK_RE = /[\t \xA0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2011\u202F\u2060\uFEFF]/;
var NORMAL_BREAK_RE = /[\t \xA0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2011\u202F\u2060\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u30FC\u31F0-\u31FF\uFEFF\uFF67-\uFF70]/;
var CJK_NORMAL_BREAK_RE = /[\t \xA0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2010\u2011\u2013\u202F\u2060\u301C\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u30A0\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u30FC\u31F0-\u31FF\uFEFF\uFF67-\uFF70]/;
var LOOSE_BREAK_RE = /[\t \xA0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2011\u202F\u2060\u3005\u303B\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u309D\u309E\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u30FC-\u30FE\u31F0-\u31FF\uFEFF\uFF67-\uFF70]/;
var CJK_LOOSE_BREAK_RE = /[\t !%:;\?\xA0\xA2\xB0\u034F\u035C-\u0362\u0F08\u0F0C\u0F12\u0FD9\u0FDA\u180E\u2007\u200B\u2010\u2011\u2013\u202F\u2030\u2032\u2033\u203C\u2047-\u2049\u2060\u2103\u2116\u3005\u301C\u303B\u3041\u3043\u3045\u3047\u3049\u3063\u3083\u3085\u3087\u308E\u3095\u3096\u309D\u309E\u30A0\u30A1\u30A3\u30A5\u30A7\u30A9\u30C3\u30E3\u30E5\u30E7\u30EE\u30F5\u30F6\u30FB-\u30FE\u31F0-\u31FF\uFEFF\uFF01\uFF05\uFF1A\uFF1B\uFF1F\uFF65\uFF67-\uFF70\uFFE0]/;

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
  split
};
