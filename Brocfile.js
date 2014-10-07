var compileES6 = require('broccoli-es6-concatenator');
var mergeTrees = require('broccoli-merge-trees');
var uglifyJs = require('broccoli-uglify-js');
var moveFile = require('broccoli-file-mover');
var concat = require('broccoli-concat');
var pickFiles = require('broccoli-static-compiler');

var lib = compileES6(mergeTrees(['lib', 'bower_components/loader.js']), {
  loaderFile: 'loader.js',
  ignoredModules: ['dom-ruler/layout', 'dom-ruler/text'],
  inputFiles: [
    '**/*.js'
  ],
  wrapInEval: false,
  outputFile: '/truncate.js'
});

var vendor = pickFiles('bower_components/dom-ruler/dist', {
  srcDir: '/',
  files: ['dom-ruler.amd.js'],
  destDir: '/'
});

var standalone = concat(mergeTrees([lib, vendor]), {
  inputFiles: ['**/*.js'],
  outputFile: '/truncate.all.js',
  wrapInEval: false
});

var amd = compileES6('lib', {
  inputFiles: [
    '**/*.js'
  ],
  ignoredModules: ['dom-ruler/layout', 'dom-ruler/text'],
  wrapInEval: false,
  outputFile: '/truncate.amd.js'
});

var standaloneAmd = concat(mergeTrees([amd, vendor]), {
  inputFiles: ['**/*.js'],
  outputFile: '/truncate.all.amd.js',
  wrapInEval: false
});

var uglify = function (tree, filename) {
  var minFilename = filename.split('.');
  minFilename.pop();
  minFilename.push('min', 'js');
  return uglifyJs(moveFile(tree, {
    srcFile: '/' + filename,
    destFile: '/' + minFilename.join('.')
  }));
};

module.exports = mergeTrees([
  lib,
  uglify(lib, 'truncate.js'),
  standalone,
  uglify(standalone, 'truncate.all.js'),
  amd,
  uglify(amd, 'truncate.amd.js'),
  standaloneAmd,
  uglify(standaloneAmd, 'truncate.all.amd.js')
]);
