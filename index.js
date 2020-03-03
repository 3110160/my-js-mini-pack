const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const {
  transformFromAst
} = require('@babel/core');
const traverse = require('@babel/traverse').default;
const config = require('./myjsminipack.config');
const {
  entry
} = config;


// 分析代码文件 生成 code 和 依赖数组
const createAssert = (filePath) => {
  // 步骤一：读取入口文件内容
  const content = fs.readFileSync(path.resolve(__dirname,filePath), 'utf-8');

  // 步骤二：使用 @babel/parser（JavaScript解析器）解析代码，生成 ast（抽象语法树）
  // 其中，sourceType 指示代码应解析的模式。
  // 可以是"script", "module"或 "unambiguous" 之一，
  // 其中  "unambiguous" 是让 @babel/parser 去猜测，如果使用 ES6 import 或 export 的话就是 "module" ，否则为 "script" 。
  // 这里使用 ES6 import 或 export ，所以就是 "module" 。
  const ast = babelParser.parse(content, {
    sourceType: 'module'
  })
  // console.log(ast)
  // 2. 获取入口文件内容
  // 我们已经知道了入口文件的 ast，可以通过 @babel/core 的 transformFromAst 方法，来解析入口文件内容
  // ast 使用 @babel/preset-env 插件(语法转换规则) 生成游览器兼容的es5
  const {
    code
  } = transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  })
  console.log(code);

  // 3. 分析代码中的依赖引用，获取依赖模块
  const dependencies = [];
  // 借助 @babel/traverse 
  traverse(ast, {
    // 遍历所有的 import 模块，并将相对路径放入 dependencies
    ImportDeclaration: ({
      node
    }) => {
      console.log(node)
      dependencies.push(node.source.value)
    }
  })

  return {
    code,
    dependencies
  }
};

// 递归分析所有文件 生成依赖🌲
const mainAssert = createAssert(entry);
const graph = {
  [entry]: mainAssert,
};

const createGraph = (filePath, assert) => {
  assert.mapping = {};
  // filePath 是相对路径
  // 通过 filePath 获取文件的 绝对路径
  const dirname = path.dirname(filePath);
  assert.dependencies.forEach(relativePath => {
    // 依赖的相对路径 映射到 绝对路径
    const absolutePath = path.join(dirname,relativePath)
    assert.mapping[relativePath]= absolutePath
    if(!graph[absolutePath]){
      graph[absolutePath] = createAssert(absolutePath);
      createGraph(absolutePath,graph[absolutePath])
    }
  });
}
createGraph(entry,mainAssert);

const bunld = (graph) =>{
  let modules  = '';
  Object.keys(graph).forEach(key=>{
    const mod =  graph[key];
    modules+=`'${key}':[
      function (require, module, exports) {
      ${mod.code}
    },
    ${JSON.stringify(mod.mapping)},
  ],`
  })
  const result = `
    (function(modules){
      function require(path){
        const [fn, mapping] = modules[path];
        function localRequire(path) {
          return require(mapping[path]);
        }
        const module = { exports : {} };
        fn(localRequire, module, module.exports);
        return module.exports;
      }
      require('${entry}');
    })({${modules}})
  `
    return result;
}

console.log(graph)
const res = bunld(graph)
console.log(res)
