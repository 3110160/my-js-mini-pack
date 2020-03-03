## 探索webpack打包原理，实现简易版
[掘金资料](https://juejin.im/post/5e04c935e51d4557ea02c097#heading-10) 

>1. 解析入口文件，获取所有的依赖项 creatAssert
>2. creatGraph 生成依赖🌲
```js
{
  'src/index.js': {
    code: '"use strict";\n' +
      '\n' +
      'var _a = require("./demo/a.js");\n' +
      '\n' +
      'var _a2 = require("./a.js");\n' +
      '\n' +
      'var _b = require("./b.js");\n' +
      '\n' +
      'var fn = function fn(a, b, c) {\n' +
      '  return a + b * c;\n' +
      '};\n' +
      '\n' +
      'fn(1, 2, 3);\n' +
      '(0, _a.add)(1, 2);\n' +
      '(0, _b.add2)(1, 2);\n' +
      '(0, _a2.add)(1, 2);',
    dependencies: [ './demo/a.js', './a.js', './b.js' ],
    mapping: {
      './demo/a.js': 'src/demo/a.js',
      './a.js': 'src/a.js',
      './b.js': 'src/b.js'
    }
  },
  'src/demo/a.js': {
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.add = void 0;\n' +
      '\n' +
      'var _b = require("../b.js");\n' +
      '\n' +
      'var add = function add(a, b) {\n' +
      '  return a + b;\n' +
      '};\n' +
      '\n' +
      'exports.add = add;\n' +
      '(0, _b.add2)(1, 2);',
    dependencies: [ '../b.js' ],
    mapping: { '../b.js': 'src/b.js' }
  },
  'src/b.js': {
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.add2 = void 0;\n' +
      '\n' +
      'var add2 = function add2(a, b) {\n' +
      '  return a + b;\n' +
      '};\n' +
      '\n' +
      'exports.add2 = add2;',
    dependencies: [],
    mapping: {}
  },
  'src/a.js': {
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.add = void 0;\n' +
      '\n' +
      'var _b = require("./b.js");\n' +
      '\n' +
      'var add = function add(a, b) {\n' +
      '  return a + b;\n' +
      '};\n' +
      '\n' +
      'exports.add = add;\n' +
      '(0, _b.add2)(1, 2);',
    dependencies: [ './b.js' ],
    mapping: { './b.js': 'src/b.js' }
  }
}
```
>3. 将依赖树打包成一个bunld文件
```js
(function (modules) {
  function require(path) {
    const [fn, mapping] = modules[path];

    function localRequire(path) {
      return require(mapping[path]);
    }
    const module = {
      exports: {}
    };
    fn(localRequire, module, module.exports);
    return module.exports;
  }
  require('src/index.js');
})({
  'src/index.js': [
    function (require, module, exports) {
      "use strict";

      var _a = require("./demo/a.js");

      var _a2 = require("./a.js");

      var _b = require("./b.js");

      var fn = function fn(a, b, c) {
        return a + b * c;
      };

      console.log(fn(1, 2, 3));
      console.log((0, _a.add)(1, 2));
      console.log((0, _b.add2)(1, 2));
      console.log((0, _a2.add)(1, 2));
    },
    {
      "./demo/a.js": "src/demo/a.js",
      "./a.js": "src/a.js",
      "./b.js": "src/b.js"
    },
  ],
  'src/demo/a.js': [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.add = void 0;

      var _b = require("../b.js");

      var add = function add(a, b) {
        return a + b;
      };

      exports.add = add;
      (0, _b.add2)(1, 2);
    },
    {
      "../b.js": "src/b.js"
    },
  ],
  'src/b.js': [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.add2 = void 0;

      var add2 = function add2(a, b) {
        return a + b;
      };

      exports.add2 = add2;
    },
    {},
  ],
  'src/a.js': [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.add = void 0;

      var _b = require("./b.js");

      var add = function add(a, b) {
        return a + b;
      };

      exports.add = add;
      (0, _b.add2)(1, 2);
    },
    {
      "./b.js": "src/b.js"
    },
  ],
})
```