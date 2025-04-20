// components/ProjectWheel/utils.js

/**
 * Sorts projects alphabetically by title
 * @param {Array} projects - Array of project objects
 * @returns {Array} Sorted projects
 */
export function sortProjects(projects) {
    return [...projects].sort((a, b) => a.title.localeCompare(b.title));
  }
  
  /**
   * Groups projects by their first letter
   * @param {Array} sortedProjects - Array of sorted project objects
   * @returns {Object} Object with letters as keys and arrays of projects as values
   */
  export function groupProjectsByLetter(sortedProjects) {
    return sortedProjects.reduce((acc, project) => {
      const firstLetter = project.title.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(project);
      return acc;
    }, {});
  }
  
  /**
   * Creates wheel items from grouped projects
   * @param {Object} groupedProjects - Object with letters as keys and arrays of projects as values
   * @param {number} anglePerSection - Angle per section in degrees
   * @returns {Array} Array of wheel items (dividers and projects)
   */
  export function createWheelItems(groupedProjects, anglePerSection) {
    const letters = Object.keys(groupedProjects).sort();
    const wheelItems = [];
    let currentAngle = 0;
  
    letters.forEach((letter) => {
      // Create section header with letter divider
      const letterDivider = {
        type: "divider",
        letter,
        angle: currentAngle,
      };
      wheelItems.push(letterDivider);
  
      // Add projects in this section
      groupedProjects[letter].forEach((project) => {
        wheelItems.push({
          type: "project",
          startAngle: currentAngle,
          endAngle: currentAngle + anglePerSection,
          midAngle: currentAngle + anglePerSection / 2,
          ...project,
        });
        currentAngle += anglePerSection;
      });
    });
  
    return wheelItems;
  }