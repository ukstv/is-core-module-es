import { test } from "uvu";
import * as assert from "uvu/assert";
import { isCore } from "./index.js";
import { readFile } from "node:fs/promises";

const TABLE_FILENAME = new URL("../data/core.json", import.meta.url);

test("core modules", () => {
  const coreModules = ["fs", "net", "http"];
  for (let m of coreModules) {
    assert.ok(isCore(m));
  }
});

test("not core modules", () => {
  const notCoreModules = ["seq", "../", "toString"];
  for (let m of notCoreModules) {
    assert.not.ok(isCore(m));
  }
});

test("core list", async () => {
  const table = await readFile(TABLE_FILENAME, "utf-8").then(JSON.parse);
  for (let m in table) {
    if (isCore(m)) {
      try {
        await import(m);
      } catch (e) {
        assert.unreachable(`Module ${m} not supported`);
      }
    } else {
      try {
        await import(m);
        assert.unreachable();
      } catch (e) {
        assert.ok(e);
      }
    }
  }
});

test("Object.prototype pollution", async () => {
  const table = await readFile(TABLE_FILENAME, "utf-8").then(JSON.parse);
  const nonKey = "not a core module";
  // @ts-ignore
  Object.prototype.fs = false;
  // @ts-ignore
  Object.prototype.path = ">= 999999999";
  // @ts-ignore
  Object.prototype.http = table.http;
  Object.prototype[nonKey] = true;
  assert.ok(isCore("fs"), "fs is a core module even if Object.prototype lies");
  assert.ok(
    isCore("path"),
    "path is a core module even if Object.prototype lies"
  );
  assert.ok(
    isCore("http"),
    "path is a core module even if Object.prototype matches data"
  );
  assert.not.ok(
    isCore(nonKey),
    `"${nonKey}" is not a core module even if Object.prototype lies`
  );
});

test.run();
