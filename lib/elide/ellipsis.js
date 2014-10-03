//import { merge } from "./utils";

var elide = function (block, fragment, options) {
  options = merge({ ellipsis: "&hellip;", lines: 1 }, options || {});

  return Metrics.measureText(options.ellipsis, { whiteSpace: 'nowrap' }, { escape: false, template: fragment });
}

export var elide = elide;
