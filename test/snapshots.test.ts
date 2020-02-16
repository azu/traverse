import fs from "fs";
import path from "path";
import assert from "assert";
import { createTraverser } from "../src/traverse";

const fixturesDir = path.join(__dirname, "snapshots");
describe("snapshots testing", function() {
    fs.readdirSync(fixturesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            const normalizedTestName = dirent.name;
            it(`test ${normalizedTestName}`, function() {
                const fixtureDir = path.join(fixturesDir, normalizedTestName);
                const actualFilePath = path.join(fixtureDir, "input.json");
                const actualContent = JSON.parse(fs.readFileSync(actualFilePath, "utf-8"));
                const optionsFilePath = path.join(fixtureDir, "options.ts");
                const options = fs.existsSync(optionsFilePath) ? require(optionsFilePath).options : {};
                const results: [string, any][] = [];
                const traverser = createTraverser(options);
                const traverseResult = traverser.visit(actualContent, {
                    enter({ node }) {
                        results.push(["enter", node]);
                    },
                    leave({ node }) {
                        results.push(["leave", node]);
                    }
                });
                const expectedFilePath = path.join(fixtureDir, "output.json");
                // Usage: update snapshots
                // UPDATE_SNAPSHOT=1 npm test
                if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(expectedFilePath, JSON.stringify(results, null, 4));
                    this.skip(); // skip when updating snapshots
                    return;
                }
                // compare input and output
                const expected = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
                assert.deepStrictEqual(results, expected);
                // result is
                assert.deepStrictEqual(traverseResult, actualContent);
            });
        });
});
