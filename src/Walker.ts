export type TraverseVisitor<Node extends {}> = ({
                                                    node,
                                                    parent,
                                                    context,
                                                    prop,
                                                    index
                                                }: {
    node: Node;
    parent: Node | null;
    context: TraverseContext<Node>;
    prop?: string;
    index?: number;
}) => void;
export type TraverseContext<Node extends {}> = {
    skip: () => void;
    remove: () => void;
    replace: (node: Node) => void;
};
export type TraverseContextState<Node extends {}> = {
    shouldSkip?: boolean;
    shouldRemove?: boolean;
    replacementNode?: Node;
};

const createContexts = <Node extends {}>() => {
    const state: TraverseContextState<Node> = {};
    const context: TraverseContext<Node> = {
        skip() {
            state.shouldSkip = true;
        },
        remove() {
            state.shouldRemove = true;
        },
        replace(node: Node) {
            state.replacementNode = node;
        }
    };
    return {
        state,
        context
    };
};
export type TraverserNodePredicate = (node: any) => boolean;
export type createTraverserOptions = {
    /**
     * Define what is Node?
     * If the predicate function return true, the traverse recognize the value is a Node.
     * Any object is a Node by default.
     * Default: () => true
     */
    nodePredicate?: TraverserNodePredicate;
}
export const createTraverser = (options: createTraverserOptions) => {
    const nodePredicate: TraverserNodePredicate = options.nodePredicate || function() {
        return true;
    };
    const replace = <Node extends {}>(parent: any, prop: string | undefined, index: number | undefined, node: Node) => {
        if (parent && prop) {
            if (index !== undefined) {
                parent[prop][index] = node;
            } else {
                parent[prop] = node;
            }
        }
    };

    const remove = (parent: any, prop: string | undefined, index: number | undefined) => {
        if (parent && prop) {
            if (index !== undefined) {
                parent[prop].splice(index, 1);
            } else {
                delete parent[prop];
            }
        }
    };
    const visit = <Node extends {}>({
                                        node,
                                        parent,
                                        prop,
                                        index,
                                        enter,
                                        leave
                                    }: {
        node: Node;
        parent: Node | null;
        prop?: string;
        index?: number;
        enter?: TraverseVisitor<Node>;
        leave?: TraverseVisitor<Node>;
    }): Node | null => {
        if (node) {
            const { context, state } = createContexts<Node>();
            if (enter) {
                enter({
                    node,
                    parent,
                    context,
                    prop,
                    index
                });
                if (state.replacementNode) {
                    replace(parent, prop, index, state.replacementNode);
                }
                if (state.shouldRemove) {
                    remove(parent, prop, index);
                }
                if (state.shouldSkip) {
                    return node;
                }
                if (state.shouldRemove) {
                    return null;
                }
            }

            const keys = Object.keys(node);
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index];
                const value: any = (node as any)[key];

                if (typeof value !== "object") {
                    continue;
                } else if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i += 1) {
                        if (value[i] !== null && nodePredicate(value[i])) {
                            if (
                                !visit({
                                    node: value[i],
                                    parent: node,
                                    enter,
                                    leave,
                                    prop: key,
                                    index: i
                                })
                            ) {
                                // removed
                                i--;
                            }
                        }
                    }
                } else if (value !== null && nodePredicate(value)) {
                    visit({
                        node: value,
                        parent: node,
                        enter,
                        leave,
                        prop: key,
                        index: undefined
                    });
                }
            }

            if (leave) {
                const { context, state } = createContexts<Node>();
                leave({ context, node, parent, prop, index });
                if (state.replacementNode) {
                    replace(parent, prop, index, state.replacementNode);
                }

                if (state.shouldRemove) {
                    remove(parent, prop, index);
                }

                if (state.shouldRemove) {
                    return null;
                }
            }
        }

        return node;
    };

    return {
        visit<Node extends {}>(node: Node, {
            enter,
            leave
        }: {
            enter?: TraverseVisitor<Node>;
            leave?: TraverseVisitor<Node>;
        }) {
            return visit<Node>({ node, parent: null, enter, leave });
        }
    };
};
