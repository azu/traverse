import { createTraverserOptions } from "../../../src/Walker";

export const options: createTraverserOptions = {
    nodePredicate: (node) => {
        return "type" in node;
    }
};
