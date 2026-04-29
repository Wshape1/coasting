export function SimpleGrid() {
  return (
    <group>
      {/* Fine grid lines */}
      <gridHelper args={[10, 50, '#6b7280', '#6b7280']} />
      {/* Section grid lines (on top, more visible) */}
      <gridHelper args={[10, 10, '#9ca3af', '#9ca3af']} position={[0, 0.001, 0]} />
    </group>
  );
}
