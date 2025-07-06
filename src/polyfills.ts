import { Buffer } from "buffer";

declare global {
  interface Window {
    Buffer: typeof Buffer;
    global: typeof globalThis;
    process: NodeJS.Process;
  }
}

const processPolyfill = {
  env: {},
  nextTick: (fn: Function, ...args: any[]) => {
    setTimeout(() => fn(...args), 0);
  },
  browser: true,
  version: "",
  versions: { node: "" },
  platform: "browser",
  title: "browser",
  cwd: () => "/",
  chdir: () => {},
  umask: () => 0,
  stdout: { write: () => {} },
  stderr: { write: () => {} },
  stdin: { read: () => null },
  argv: [],
  pid: 1,
  uptime: () => 0,
  hrtime: () => [0, 0],
};

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
  window.global = window;
  window.process = processPolyfill as unknown as NodeJS.Process;

  (globalThis as any).Buffer = Buffer;
  (globalThis as any).global = globalThis;
  (globalThis as any).process = processPolyfill;
}

if (typeof window !== "undefined" && !(window as any).setImmediate) {
  (window as any).setImmediate = (fn: Function, ...args: any[]) => {
    return setTimeout(() => fn(...args), 0);
  };

  (globalThis as any).setImmediate = (window as any).setImmediate;
}

if (typeof window !== "undefined" && !(window as any).clearImmediate) {
  (window as any).clearImmediate = (id: any) => {
    clearTimeout(id);
  };

  (globalThis as any).clearImmediate = (window as any).clearImmediate;
}

if (typeof window !== "undefined") {
  (window as any).util = {
    inspect: (obj: any) => {
      try {
        return JSON.stringify(obj, null, 2);
      } catch {
        return String(obj);
      }
    },
  };
}

export {};
