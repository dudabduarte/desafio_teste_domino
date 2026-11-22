import test from "node:test";
import { DOMINO_TESTS } from "../src/test-cases.js";
for (const scenario of DOMINO_TESTS) test(scenario.title, () => scenario.run());
