# @deps/traverse

A Traverser library for object.

## Features

- Enter/Leave
- Support any type of node
- No Dependencies
- Written by TypeScript 

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @deps/traverse

## Usage

```js
import { createTraverser } from "@deps/traverse";
const traverser = createTraverser();
const object = {
    "depth": 1,
    "child": {
        "depth": 2
    }
};
const results = [];
const traverseResult = traverser.visit(actualContent, {
    enter({ node }) {
        results.push(["enter", node]);
    },
    leave({ node }) {
        results.push(["leave", node]);
    }
});
console.log(traverseResult === object); // => true
console.log(results);
/*
[
    [
        "enter",
        {
            "depth": 1,
            "child": {
                "depth": 2
            }
        }
    ],
    [
        "enter",
        {
            "depth": 2
        }
    ],
    [
        "leave",
        {
            "depth": 2
        }
    ],
    [
        "leave",
        {
            "depth": 1,
            "child": {
                "depth": 2
            }
        }
    ]
]
*/
```

## Options

```ts 
export declare type createTraverserOptions = {
    /**
     * Define what is Node?
     * If the predicate function return true, the traverse recognize the value is a Node.
     * Any object is a Node by default.
     * Default: () => true
     */
    nodePredicate?: TraverserNodePredicate;
};
```

```js
import { createTraverser } from "@deps/traverse";
const traverser = createTraverser({
    nodePredicate(node){
        // Node should have "type" property
        return "type" in node;
    }
});
const AST = {
 "type": "Program",
 "body": [
   {
     "type": "VariableDeclaration",
     "declarations": [
       {
         "type": "VariableDeclarator",
         "id": {
           "type": "Identifier",
           "name": "a"
         },
         "init": {
           "type": "Literal",
           "value": 1,
           "raw": "1"
         }
       }
     ],
     "kind": "var"
   }
 ],
 "sourceType": "module"
};

const results = [];
traverser.visit(AST, {
    enter({ node }) {
        results.push(["enter", node.type]);
    },
    leave({ node }) {
        results.push(["leave", node.type]);
    }
});

assert.deepStrictEqual(results, [
    [ 'enter', 'Program' ],
    [ 'enter', 'VariableDeclaration' ],
    [ 'enter', 'VariableDeclarator' ],
    [ 'enter', 'Identifier' ],
    [ 'leave', 'Identifier' ],
    [ 'enter', 'Literal' ],
    [ 'leave', 'Literal' ],
    [ 'leave', 'VariableDeclarator' ],
    [ 'leave', 'VariableDeclaration' ],
    [ 'leave', 'Program' ]
]);
```

## Changelog

See [Releases page](https://github.com/azu/traverse/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/traverse/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu

This module is based on `estree-walker`.

- [Rich-Harris/estree-walker: Traverse an ESTree-compliant AST](https://github.com/Rich-Harris/estree-walker)
