// Ambient module declaration (this file is a script, not a module — no
// top-level import/export — so `declare module` applies globally).
// @types/three is not installed in this app; these declarations let the
// names imported in src/components/Silk.tsx work both as values and as types
// without changing any runtime behavior.

declare module 'three' {
  export class Color {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export class Mesh {
    [key: string]: any;
  }
  export class ShaderMaterial {
    [key: string]: any;
  }
  export interface IUniform<T = any> {
    value: T;
  }
  const three: any;
  export default three;
}
