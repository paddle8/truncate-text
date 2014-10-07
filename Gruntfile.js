var exec = require('child_process').exec;
var curl = require('node-curl');
var fs = require('fs');
var regenerate = require('regenerate');

var parseLine = function (line) {
  if (line.indexOf('#') < 1) {
    return null;
  }
  var category = line.match(/# ([A-Z][a-z&])/)[1];
  var fields = line.replace(/#.*/, '').trim().split(';');
  return {
    codePoint: fields[0],
    Line_Break: fields[1],
    category: category
  };
}

var addCodePoint = function (regenerate, codePoint) {
  if (codePoint.indexOf('..') > 0) {
    var range = codePoint.split('..');
    regenerate.addRange(parseInt(range[0], 16), parseInt(range[1], 16));
  } else {
    regenerate.add(parseInt(codePoint, 16));
  }
}

module.exports = function (grunt) {
  grunt.registerTask('default', 'Build the library', function () {
    grunt.log.write("Building dist/");
    exec("rm -rf dist");
    exec("broccoli build dist");
  });

  grunt.registerTask('update-character-map', 'Pull character map from unicode.org', function () {
    var done = this.async();
    grunt.log.write("Fetching LineBreak.txt from unicode.org\n");
    curl('http://www.unicode.org/Public/UNIDATA/LineBreak.txt', function (err) {
      grunt.log.write("Fetched LineBreak.txt\n");
      grunt.log.write("Parsing code points\n");
      var lines = this.body.split('\n');
      var softWrapOpportunities = regenerate(0x0020, 0x0009, 0x002D); // Spaces, Tabs, and Hyphens
      var Line_Break = {
        CJ: regenerate(),
        IN: regenerate(),
      };
      var Category = {
        Sc: regenerate()
      };
      var header = [];

      lines.forEach(function (line) {
        if (header.length < 2) {
          header.push(line.replace('#', '//'));
        }
        line = parseLine(line);
        if (line) {
          switch (line.Line_Break) {
          case 'CJ':
            addCodePoint(Line_Break.CJ, line.codePoint);
            break;
          case 'In':
            addCodePoint(Line_Break.In, line.codePoint);
            break;
          case 'WJ':
          case 'ZW':
          case 'GL':
            addCodePoint(softWrapOpportunities, line.codePoint);
            break;
          }
          if (line.Category === 'Sc') {
            addCodePoint(Category.Sc, line.codePoint);
          }
        }
      });
      grunt.log.write("Parsed code points. Creating regexes...\n");

      var normalBreak = softWrapOpportunities.clone();
      // Breaks before Japanese small kana or
      // the Katakana-Hirigana prolonged sound mark
      normalBreak.add(Line_Break.CJ.toArray());

      // If the content language is Chinese or Japanese,
      // then additionally allow
      var cjkNormalBreak = normalBreak.clone();
      // breaks before hyphens
      cjkNormalBreak.add(0x2010, 0x2013, 0x301C, 0x30A0);


      var looseBreak = normalBreak.clone();
      var cjkLooseBreak = cjkNormalBreak.clone();

      // breaks before iteration marks
      looseBreak.add(0x3005, 0x303B, 0x309D, 0x309E, 0x30FD, 0x30FE);
      cjkLooseBreak.add(0x3005, 0x303B, 0x309D, 0x309E, 0x30FD, 0x30FE);

      // breaks between inseparable characters
      looseBreak.add(Line_Break.IN.toArray());
      cjkLooseBreak.add(Line_Break.IN.toArray());

      // breaks before certain centered punctuation marks:
      cjkLooseBreak.add(0x003A, 0x003B, 0x30FB, 0xFF1A, 0xFF1B, 0xFF65, 0x0021, 0x003F, 0x203C, 0x2047, 0x2048, 0x2049, 0xFF01, 0xFF1F);

      // breaks before suffixes:
      cjkLooseBreak.add(0x0025, 0x00A2, 0x00B0, 0x2030, 0x2032, 0x2033, 0x2103, 0xFF05, 0xFFE0);

      // breaks after prefixes:
      // № U+2116
      cjkLooseBreak.add(0x2116);
      // and all currency symbols (Unicode general category Sc) other than ¢ U+00A2 and ￠ U+FFE0
      cjkLooseBreak.add(Category.Sc.remove(0x00A2, 0xFFE0).toArray());


      grunt.log.write("Parsed code points");
      fs.readFile('./blueprints/string.js', function (err, data) {
        fs.writeFile("./lib/truncate/string.js", data.toString()
                                                     .replace("{{HEADER}}", header.join('\n'))
                                                     .replace("{{STRICT}}", softWrapOpportunities.toString())
                                                     .replace("{{NORMAL}}", normalBreak.toString())
                                                     .replace("{{CJK_NORMAL}}", cjkNormalBreak.toString())
                                                     .replace("{{LOOSE}}", looseBreak.toString())
                                                     .replace("{{CJK_LOOSE}}", cjkLooseBreak.toString()));
        done();
      });
    });
  });
};
