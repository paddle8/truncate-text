var compileES6 = require('broccoli-es6-concatenator');
var mergeTrees = require('broccoli-merge-trees');
var uglifyJs = require('broccoli-uglify-js');
var moveFile = require('broccoli-file-mover');
var concat = require('broccoli-concat');
var pickFiles = require('broccoli-static-compiler');

var lib = compileES6(mergeTrees(['lib', 'bower_components/loader.js']), {
  loaderFile: 'loader.js',
  ignoredModules: ['dom-ruler', 'dom-ruler/text', 'dom-ruler/utils'],
  inputFiles: [
    '**/*.js'
  ],
  wrapInEval: false,
  outputFile: '/truncate-text.js'
});

var amd = compileES6('lib', {
  inputFiles: [
    '**/*.js'
  ],
  ignoredModules: ['dom-ruler', 'dom-ruler/text', 'dom-ruler/utils'],
  wrapInEval: false,
  outputFile: '/truncate-text.amd.js'
});

var vendorAmd = pickFiles('bower_components/dom-ruler/dist', {
  srcDir: '/',
  files: ['dom-ruler.amd.js'],
  destDir: '/'
});

var vendor = pickFiles('bower_components/dom-ruler/dist', {
  srcDir: '/',
  files: ['dom-ruler.js'],
  destDir: '/'
});

var standalone = concat(mergeTrees([amd, vendor]), {
  inputFiles: ['**/*.js'],
  outputFile: '/truncate-text.all.js',
  wrapInEval: false
});

var standaloneAmd = concat(mergeTrees([amd, vendorAmd]), {
  inputFiles: ['**/*.js'],
  outputFile: '/truncate-text.all.amd.js',
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
  uglify(lib, 'truncate-text.js'),
  standalone,
  uglify(standalone, 'truncate-text.all.js'),
  amd,
  uglify(amd, 'truncate-text.amd.js'),
  standaloneAmd,
  uglify(standaloneAmd, 'truncate-text.all.amd.js')
]);
