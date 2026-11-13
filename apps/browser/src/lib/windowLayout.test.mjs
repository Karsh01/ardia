import assert from "node:assert/strict";
import { test } from "node:test";
const { PAGE_FRAME, pageFrameInsetOf, pageFrameOf } = await import("./windowLayout.ts");

const off = { borderlessMode: false, zeroInFullScreen: false, fullScreen: false, zeroWhenTabsHidden: false, tabsHidden: false };

test("with neither option the page frame slider still applies", () => {
  assert.equal(pageFrameInsetOf(PAGE_FRAME.default, off), PAGE_FRAME.default);
  assert.equal(pageFrameInsetOf(PAGE_FRAME.default, { ...off, zeroInFullScreen: true, zeroWhenTabsHidden: true }), PAGE_FRAME.default);
  assert.equal(pageFrameInsetOf(12, { ...off, fullScreen: true, tabsHidden: true }), 12);
});

test("full screen with Zero in full screen on is edge to edge", () => {
  assert.equal(pageFrameInsetOf(PAGE_FRAME.default, { ...off, zeroInFullScreen: true, fullScreen: true }), 0);
  assert.equal(pageFrameInsetOf(5, { ...off, zeroInFullScreen: true, fullScreen: true }), 0);
});

test("full screen with Zero in full screen off keeps the slider", () => {
  assert.equal(pageFrameInsetOf(PAGE_FRAME.default, { ...off, fullScreen: true }), PAGE_FRAME.default);
  assert.equal(pageFrameInsetOf(5, { ...off, fullScreen: true }), 5);
});

test("full screen and tabs hidden with Zero in full screen when tabs are hidden on is edge to edge", () => {
  assert.equal(pageFrameInsetOf(PAGE_FRAME.default, { ...off, zeroWhenTabsHidden: true, fullScreen: true, tabsHidden: true }), 0);
  assert.equal(pageFrameInsetOf(5, { ...off, zeroWhenTabsHidden: true, fullScreen: true, tabsHidden: true }), 0);
});

test("tabs hidden alone with Zero in full screen when tabs are hidden on keeps the slider", () => {
  assert.equal(pageFrameInsetOf(PAGE_FRAME.default, { ...off, zeroWhenTabsHidden: true, tabsHidden: true }), PAGE_FRAME.default);
  assert.equal(pageFrameInsetOf(5, { ...off, zeroWhenTabsHidden: true, tabsHidden: true }), 5);
});

test("full screen alone with Zero in full screen when tabs are hidden on keeps the slider", () => {
  assert.equal(pageFrameInsetOf(PAGE_FRAME.default, { ...off, zeroWhenTabsHidden: true, fullScreen: true }), PAGE_FRAME.default);
  assert.equal(pageFrameInsetOf(5, { ...off, zeroWhenTabsHidden: true, fullScreen: true }), 5);
});

test("borderless mode zeros the inset whatever the other options are", () => {
  assert.equal(pageFrameInsetOf(PAGE_FRAME.default, { ...off, borderlessMode: true }), 0);
  assert.equal(pageFrameInsetOf(9, { ...off, borderlessMode: true, fullScreen: true, tabsHidden: true }), 0);
});

test("every frame is edge to edge and square, and the peek is attached to the window edge", () => {
  for (const inset of [0, 9, 12]) {
    const frame = pageFrameOf(inset, 19, 12);
    assert.deepEqual([frame.inset, frame.radius], [0, 0]);
    assert.deepEqual(frame.peek, { left: 0, top: 0, bottom: 0, radius: 0 });
  }
});
