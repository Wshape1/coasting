// Shim for node:module — required by @react-three/drei v11 alpha's rolldown runtime
export function createRequire() {
  return (id: string) => {
    if (id === 'three') return { default: {} };
    return {};
  };
}
