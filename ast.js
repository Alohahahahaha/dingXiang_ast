/*
@Author: Aloha
@Time: 2025/6/13 15:13
@ProjectName: dingXiang_ast
@FileName: ast.py
@Software: PyCharm
*/

const files = require('fs');
const types = require("@babel/types");
const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const NodePath = require("@babel/traverse").NodePath;


class DingXiang {
    constructor(file_path) {
        this.ast = parser.parse(files.readFileSync(file_path, "utf-8"));
        this.stringPool = {};
        this.params = []
    }

    save_file() {
        const {code: newCode} = generator(this.ast);
        files.writeFileSync(
            './decode.js',
            newCode,
            "utf-8"
        );
    }

    oen() {
        let fn, sfn, func, strFunc, initFunc, ulw, initFuncName = 'g';
        traverse(this.ast, {
            CallExpression: (path) => {
                let {parentPath, node} = path;
                if (!types.isUnaryExpression(parentPath.node)) return;
                if (parentPath.node.operator !== '!') return;
                let {callee, arguments: args} = node;
                if (!types.isFunctionExpression(callee)) return;
                if (args.length < 4) return;
                if (!types.isArrayExpression(args[0])) return;
                const params = callee.params;
                for (let i = 0; i < params.length; i++) {
                    const param = params[i];
                    const arg = args[i];

                    if (!types.isIdentifier(param)) continue;
                    if (!types.isArrayExpression(arg)) continue;

                    ulw = arg.elements.map(el => {
                        if (types.isUnaryExpression(el)) {
                            let fo = generator(el).code;
                            return fo === '!0' ? true : false
                        }
                        return el.value
                    });

                    this.stringPool[param.name] = ulw;
                    this.params.push(param.name)
                }
                let udc = callee.body.body[0];
                parentPath.replaceWith(udc)
            }
        })
    }

    keb() {
        traverse(this.ast, {
            MemberExpression: (path) => {
                let {parentPath, node} = path;
                let {object, property} = node;
                if (!types.isIdentifier(object)) return;
                if (!this.params.includes(object.name)) return;
                if (!types.isNumericLiteral(property)) return;
                let str = this.stringPool[object.name][property.value];
                if (typeof str === 'string' || str === '') {
                    path.replaceWith(types.stringLiteral(str))
                } else if (typeof str === 'boolean') {
                    path.replaceWith(types.booleanLiteral(str))
                } else {
                    path.replaceWith(types.numericLiteral(str))
                }
            }
        })
    }

    rms() {
        traverse(this.ast, {
            CallExpression: (path) => {
                let {callee, arguments: args} = path.node;
                if (!types.isMemberExpression(callee)) return;
                if (args.length > 2) return;
                if (!types.isStringLiteral(args[0])) return;
                let {object, property} = callee;
                if (!types.isArrayExpression(object)) return;
                if (!types.isIdentifier(property)) return;
                let myx;
                let ydp = object.elements.map(r => {
                    if (!types.isIdentifier(r)) return r;
                    let gex = path.getFunctionParent();
                    let osb = gex.scope.getBinding(r.name);
                    myx = osb.path.node.init;
                    return myx
                });
                path.node.callee.object = types.arrayExpression(ydp);
                let usn = eval(generator(path.node).code);
                path.replaceWith(types.stringLiteral(usn))
            }
        })
    }

    hrc() {
        function oej(str) {
            return str.replace(/[\b\f\n\r\t\v\\"]/g, (match) => {
                return '\\' + {
                    '\b': 'b',
                    '\f': 'f',
                    '\n': 'n',
                    '\r': 'r',
                    '\t': 't',
                    '\v': 'v',
                    '\\': '\\',
                    '"': '"'
                }[match];
            });
        }

        traverse(this.ast, {
            CallExpression: (path) => {
                let {callee, arguments: args} = path.node;
                if (!types.isIdentifier(callee)) return;
                if (args.length === 0) return;
                if (!types.isStringLiteral(args[0])) return;
                let ova = callee.name;
                let iso = path.getFunctionParent();
                let jsa = iso.scope.getBinding(ova);
                if (!types.isFunctionDeclaration(jsa.path.node)) return;
                let raw = oej(args[0].value);
                let quote = raw.includes('"') ? "'" : '"';
                let lon = `${quote}${raw}${quote}`;
                let vtl = generator(jsa.path.node).code;
                let tdp = args.length === 2 ? vtl + '\n' + ova + `(${lon}, ${generator(args[1]).code})` : vtl + '\n' + ova + `(${lon})`;
                let str;
                try {
                    str = eval(tdp);
                } catch (e) {
                    // let errorMessage = e.message || e.toString();
                    // let hwx = errorMessage.match(/\s*([$\w]+)\s+is not defined/)[1];
                    // let ubq = path.getFunctionParent();
                    // let pqb = ubq.scope.getBinding(hwx);
                    // let rsp = types.isUnaryExpression(pqb.path.node.init) ? 'void 0' : pqb.path.node.init.value;
                    // let jeb = 'var ' + hwx + ` = ${rsp}` + '\n' + tdp;
                    // str = eval(jeb);
                    console.log(e);
                    return;
                }
                if (typeof str === 'function') {
                    let ims = parser.parseExpression(str.toString());
                    path.replaceWith(ims)
                } else {
                    path.replaceWith(types.stringLiteral(str))
                }
            }
        })
    }

    start() {
        this.oen();
        this.keb();
        this.rms();
        this.hrc();
        this.save_file();
    }

}

console.time('处理完毕，耗时');

let dx_ast = new DingXiang('./fullcode.js');
dx_ast.start();


console.timeEnd('处理完毕，耗时');

