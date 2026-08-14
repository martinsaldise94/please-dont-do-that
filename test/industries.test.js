import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize, matchTerms } from "../core/scorer/industry-signals.js";

test("normalize lowercases and strips accents", () => {
  assert.equal(normalize("Punción Seca"), "puncion seca");
  assert.equal(normalize("CIÁTICA"), "ciatica");
});

test("matchTerms finds single-word terms case-insensitively", () => {
  const found = matchTerms("We treat Sciatica daily.", [
    "sciatica",
    "whiplash",
  ]);
  assert.deepEqual(found, ["sciatica"]);
});

test("matchTerms finds multi-word phrases", () => {
  const found = matchTerms("We offer dry needling and manual therapy.", [
    "dry needling",
    "manual therapy",
    "shockwave",
  ]);
  assert.deepEqual(found, ["dry needling", "manual therapy"]);
});

test("matchTerms matches across accents in either direction", () => {
  assert.deepEqual(matchTerms("Tratamos la ciatica.", ["ciática"]), [
    "ciática",
  ]);
  assert.deepEqual(matchTerms("Tratamos la ciática.", ["ciatica"]), [
    "ciatica",
  ]);
});

test("matchTerms respects word boundaries", () => {
  assert.deepEqual(matchTerms("Our therapist is here.", ["the"]), []);
  assert.deepEqual(matchTerms("Registered with the HCPC.", ["HCPC"]), ["HCPC"]);
});

test("matchTerms returns terms in declaration order, not text order", () => {
  const found = matchTerms("whiplash then sciatica", ["sciatica", "whiplash"]);
  assert.deepEqual(found, ["sciatica", "whiplash"]);
});

test("matchTerms counts a repeated term once", () => {
  const found = matchTerms("sciatica sciatica sciatica", ["sciatica"]);
  assert.deepEqual(found, ["sciatica"]);
});
