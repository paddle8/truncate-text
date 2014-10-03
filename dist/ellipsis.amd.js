define("ellipsis", 
  ["exports"],
  function(__exports__) {
    "use strict";
    //import { merge } from "./utils";

    var elide = function (block, fragment, options) {
      options = merge({ ellipsis: "&hellip;", lines: 1 }, options || {});

      return Metrics.measureText(options.ellipsis, { whiteSpace: 'nowrap' }, { escape: false, template: fragment });
    }

    var elide = elide;
    __exports__.elide = elide;
  });