// @react-three/fiber builds its JSX.IntrinsicElements catalog from the real
// three types, which are not installed here, so the R3F primitives used in
// src/components/Silk.tsx are missing from the augmented JSX namespace.
// Under "jsx": "react-jsx" TS resolves intrinsics from react/jsx-runtime, so
// the augmentation must target that module. This is a module file (it has a
// top-level export), which is required for module augmentation.
import 'react/jsx-runtime';

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
    }
  }
}

export {};
