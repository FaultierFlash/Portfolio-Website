export function processProjects(projects) {
  // Just sort them (optional, maybe by date?)
  // Let's assume passed order is correct or sort by title if needed.
  // For now, simple pass-through or simple sort.
  // Use the order provided by the backend (Sanity)
  const sorted = [...projects];

  const ANGLE_PER_SECTION = 120; // 1/3 of the wheel
  const START_OFFSET = -30; // P1 Center at -30 deg => Left Edge at -90 (Horizontal Left)

  return sorted.map((project, index) => {
    const startAngle = START_OFFSET + (index * ANGLE_PER_SECTION);
    return {
      type: "project",
      startAngle: startAngle,
      endAngle: startAngle + ANGLE_PER_SECTION,
      midAngle: startAngle + ANGLE_PER_SECTION / 2,
      anglePerSection: ANGLE_PER_SECTION,
      ...project
    };
  });
}