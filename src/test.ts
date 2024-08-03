/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { stringify_unknown } from "./core.js";
import { fileDestination } from "./native.js";
import { test } from "node:test";
import { rm, readFile, mkdir } from "node:fs/promises";
import { ok } from "node:assert";

function delay(time: number) {
  return new Promise((r) => {
    setTimeout(r, time * 1000);
  });
}

test("fileDestination", async () => {
  // Recursive prevents throwing error when dir already exists
  await mkdir("./test", { recursive: true });
  await rm("./test/fd.log");
  let dest = fileDestination("./test/fd.log");
  dest({
    timestamp: new Date(),
    level: "log",
    scope: "test",
    message: ["========================", "start"],
  });
  dest({
    timestamp: new Date(),
    level: "log",
    scope: "test",
    message: [],
  });
  dest({
    timestamp: new Date(),
    level: "log",
    scope: "test",
    message: ["Helo world!"],
  });
  dest({
    timestamp: new Date(),
    level: "log",
    scope: "test",
    message: [
      new Error("example error"),
      "hi",
      {
        test: {
          a: Symbol("a symbol"),
          b: "hi",
          c: new Error("e"),
          d: 7,
          e: undefined,
          f: null,
        },
      },
    ],
  });
  dest({
    timestamp: new Date(),
    level: "log",
    scope: "test",
    message: "abcdefghijkl".split(""),
  });
  dest({
    timestamp: new Date(),
    level: "log",
    scope: "test",
    message: [
      "x",
      [1, 2, 3],
      [[4, 5, 6, 61], 7],
      [
        [1, 2],
        [3, 4],
        [5, 6, 62],
      ],
    ],
  });
  dest({
    timestamp: new Date(),
    level: "log",
    scope: "test",
    message: [{}, {}, {}],
  });
  await delay(1);
  let contents = await readFile("./test/fd.log");
  test("Logged output was written to file", () => {
    let expected_strings = [
      "========================",
      "start",
      "example error",
      "Symbol",
      "a symbol",
      "undefined",
      "null",
      "61",
      "62",
    ];
    let failed=false;
    let indexes = expected_strings.map((str) => {
      let index = contents.indexOf(str);
      if(index==-1){
        console.error("string not found: ",str);
        failed=true;
      }
      return index;
    });
    if(failed){
      throw new Error("At least one logged value was not found in output")
    }
    let correct_order=indexes.every((v,i,a)=>{
      if(i===a.length-1){
        return true;
      }
      return v<=(a[i+1]);
    })
    if(!correct_order)
    throw new Error("Order of messages was incorrect")
  });
});

export {};
