import { createTraverser } from "../src/traverse";
import * as assert from "assert";

describe("@deps/traverse", () => {
    it("should replace node", () => {
        const traverser = createTraverser({
            nodePredicate: node => "type" in node
        });
        const AST = {
            type: "Program",
            body: [
                {
                    type: "VariableDeclaration",
                    declarations: [
                        {
                            type: "VariableDeclarator",
                            id: {
                                type: "Identifier",
                                name: "a"
                            },
                            init: {
                                type: "Literal",
                                value: 1,
                                raw: "1"
                            }
                        }
                    ],
                    kind: "var"
                }
            ],
            sourceType: "module"
        };

        const replacedResult = traverser.visit<any>(AST, {
            enter({ node, context }) {
                if (node.type === "VariableDeclarator") {
                    context.replace({
                        ...node,
                        id: {
                            ...node.id,
                            name: "dummy"
                        }
                    });
                }
            }
        });

        assert.deepStrictEqual(replacedResult, {
            type: "Program",
            body: [
                {
                    type: "VariableDeclaration",
                    declarations: [
                        {
                            type: "VariableDeclarator",
                            id: {
                                type: "Identifier",
                                name: "dummy"
                            },
                            init: {
                                type: "Literal",
                                value: 1,
                                raw: "1"
                            }
                        }
                    ],
                    kind: "var"
                }
            ],
            sourceType: "module"
        });
    });
    it("should dump type", () => {
        const traverser = createTraverser({
            nodePredicate(node) {
                // Node should have "type" property
                return "type" in node;
            }
        });
        const AST = {
            type: "Program",
            body: [
                {
                    type: "VariableDeclaration",
                    declarations: [
                        {
                            type: "VariableDeclarator",
                            id: {
                                type: "Identifier",
                                name: "a"
                            },
                            init: {
                                type: "Literal",
                                value: 1,
                                raw: "1"
                            }
                        }
                    ],
                    kind: "var"
                }
            ],
            sourceType: "module"
        };

        const results: [string, string][] = [];
        traverser.visit(AST, {
            enter({ node }) {
                results.push(["enter", node.type]);
            },
            leave({ node }) {
                results.push(["leave", node.type]);
            }
        });

        assert.deepStrictEqual(results, [
            ["enter", "Program"],
            ["enter", "VariableDeclaration"],
            ["enter", "VariableDeclarator"],
            ["enter", "Identifier"],
            ["leave", "Identifier"],
            ["enter", "Literal"],
            ["leave", "Literal"],
            ["leave", "VariableDeclarator"],
            ["leave", "VariableDeclaration"],
            ["leave", "Program"]
        ]);
    });
});
