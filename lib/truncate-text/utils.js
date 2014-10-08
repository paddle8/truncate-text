var trim = function (string) {
  if (typeof String.prototype.trim !== 'function') {
    return string.replace(/^\s+|\s+$/g, '');
  } else {
    return string.trim();
  }
};

export { trim };
