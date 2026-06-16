import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const bin = fileURLToPath(new URL("../bin/pdtd.js", import.meta.url));

function runCli(args) {
  try {
    const stdout = execFileSync(process.execPath, [bin, ...args], {
      encoding: "utf8",
    });
    return { code: 0, stdout, stderr: "" };
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? "",
      stderr: err.stderr?.toString() ?? "",
    };
  }
}

test("--version prints the package version", () => {
  const { code, stdout } = runCli(["--version"]);
  assert.equal(code, 0);
  assert.match(stdout.trim(), /^\d+\.\d+\.\d+$/);
});

test("--help prints usage and the available commands", () => {
  const { code, stdout } = runCli(["--help"]);
  assert.equal(code, 0);
  assert.match(stdout, /Usage:/);
  assert.match(stdout, /scan/);
  assert.match(stdout, /roast/);
});

test("no arguments shows help and exits 0", () => {
  const { code, stdout } = runCli([]);
  assert.equal(code, 0);
  assert.match(stdout, /Usage:/);
});

test("an unknown command exits non-zero", () => {
  const { code, stderr } = runCli(["frobnicate"]);
  assert.notEqual(code, 0);
  assert.match(stderr, /Unknown command/);
});

test("scan is recognized but not implemented yet", () => {
  const { code, stderr } = runCli(["scan", "."]);
  assert.notEqual(code, 0);
  assert.match(stderr, /not implemented/);
});
