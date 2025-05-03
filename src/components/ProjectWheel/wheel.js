// components/ProjectWheel/wheel.js

/**
 * Initializes the interactive wheel functionality with limited continuous rotation
 * mapped to the top arc of the scroll handle.
 */
export function initializeWheel() {
  document.addEventListener("DOMContentLoaded", () => {
      // Get all required elements
      const wheelBox = document.getElementById("wheelBox");
      const projectWheel = document.getElementById("projectWheel");
      const scrollHandle = document.getElementById("scrollHandle");
      const scrollTrack = document.getElementById("scrollTrack");
      const wheelContainer = document.querySelector(".project-wheel-container");

      // Basic check if elements exist
      if (!wheelBox || !projectWheel || !scrollHandle || !scrollTrack || !wheelContainer) {
          console.error("One or more wheel components could not be found in the DOM.");
          return; // Stop execution if elements are missing
      }

      // --- Configuration ---
      const BOTTOM_THRESHOLD = 10; // Pixels from bottom to consider "reached bottom"
      const WHEEL_SENSITIVITY = 0.1; // Adjust sensitivity of rotation based on mouse wheel delta
      /**
       * <<< Maximum Wheel Rotation Configuration >>>
       * Set the total maximum degrees the wheel can rotate when scrolling at the bottom.
       * The handle will travel its 180-degree top arc over this rotation amount.
       */
      const MAX_WHEEL_ROTATION = 1440; // Example: 2 full rotations (720 degrees)

      // --- State Variables ---
      let reachedBottom = false;
      let wheelRotation = 0; // Current rotation, clamped between 0 and MAX_WHEEL_ROTATION
      let lastScrollY = window.scrollY;
      let trackRadius = 0; // Initialize and calculate later

      // --- Helper Functions ---

      // Calculate track radius
      const calculateTrackRadius = () => {
          trackRadius = scrollTrack.offsetWidth / 2;
          // Initial handle position needs to be set *after* radius is known
          updateHandlePosition();
      };

      // Calculate the maximum possible scroll position
      const getMaxScroll = () => {
          return Math.max(
              document.body.scrollHeight, document.documentElement.scrollHeight,
              document.body.offsetHeight, document.documentElement.offsetHeight,
              document.body.clientHeight, document.documentElement.clientHeight
          ) - window.innerHeight;
      };

      // Update handle position based on the current wheel rotation progress
      const updateHandlePosition = () => {
          if (trackRadius === 0) return; // Don't calculate if radius is unknown

          // Calculate rotation progress relative to the maximum allowed rotation
          // Clamp progress between 0 and 1
          const progress = Math.max(0, Math.min(1, wheelRotation / MAX_WHEEL_ROTATION));

          // Map the progress [0, 1] to the handle's angle along the TOP 180-degree arc.
          // We'll map it from the leftmost point (-PI radians) to the rightmost point (0 radians), passing through the top (-PI/2).
          const startAngle = -Math.PI; // Start at the left (9 o'clock)
          const sweepAngle = Math.PI; // Sweep 180 degrees clockwise (PI radians)
          const handleAngleRadians = startAngle + progress * sweepAngle;

          // Calculate handle position using trigonometry
          const x = Math.cos(handleAngleRadians) * trackRadius;
          const y = Math.sin(handleAngleRadians) * trackRadius;

          // Apply the transform to the handle
          // Add a small tolerance check to avoid floating point issues at exact start/end
          const tolerance = 0.01;
          if (progress < tolerance) {
              // Snap to start position (left)
               scrollHandle.style.transform = `translate(${-trackRadius}px, 0px)`;
          } else if (progress > 1 - tolerance) {
              // Snap to end position (right)
               scrollHandle.style.transform = `translate(${trackRadius}px, 0px)`;
          } else {
              // Position along the arc
               scrollHandle.style.transform = `translate(${x}px, ${y}px)`;
          }
      };

      // Apply rotation to the main wheel element
      const applyWheelRotation = () => {
          // Use the clamped wheelRotation value
          projectWheel.style.transform = `translate(-50%, -50%) rotate(${wheelRotation}deg)`;
      };


      // --- Main Scroll Handler ---
      function handleScroll() {
          const scrollPos = window.scrollY;
          const maxScroll = getMaxScroll();
          const hasReachedBottom = maxScroll - scrollPos <= BOTTOM_THRESHOLD;

          if (hasReachedBottom && scrollPos > 0) {
              // --- AT PAGE BOTTOM ---
              if (!reachedBottom) {
                  reachedBottom = true;
                  wheelBox.style.transform = "translateX(-50%) translateY(0)";
                  // Ensure wheel and handle are positioned correctly based on current rotation when entering state
                  applyWheelRotation();
                  updateHandlePosition();
                  document.body.classList.add('wheel-scroll-active');
              }
          } else {
              // --- SCROLLING NORMALLY (NOT AT BOTTOM) ---
              if (reachedBottom) {
                  reachedBottom = false;
                  document.body.classList.remove('wheel-scroll-active');
                  // NOTE: wheelRotation value is preserved internally.
              }

              // Calculate wheelBox reveal based on scroll position (same as before)
              const revealStartPoint = maxScroll - windowHeight;
              const revealEndPoint = maxScroll;
              const revealDuration = revealEndPoint - revealStartPoint;
              let scrollProgress = 0;
              if (revealDuration > 0 && scrollPos > revealStartPoint) {
                  scrollProgress = Math.min(1, (scrollPos - revealStartPoint) / revealDuration);
              } else if (scrollPos <= revealStartPoint) {
                  scrollProgress = 0;
              } else {
                  scrollProgress = 1;
              }
              const translateY = (1 - scrollProgress) * 50;
              wheelBox.style.transform = `translateX(-50%) translateY(${translateY}vh)`;

              // --- Visual Reset While Scrolling Up ---
              // Reset visual rotation of the wheel itself when scrolling away from the bottom.
              projectWheel.style.transform = "translate(-50%, -50%) rotate(0deg)";
              // Reset handle position based on the *current* clamped wheelRotation value
              // This ensures if you scroll up partially, the handle reflects the state
              updateHandlePosition(); // Update handle based on potentially non-zero wheelRotation
          }
          lastScrollY = scrollPos;
      }

      // --- Mouse Wheel Handler (for rotation at bottom) ---
      function handleMouseWheel(e) {
          if (reachedBottom) {
              e.preventDefault();
              const delta = e.deltaY;

              // Calculate the potential new rotation
              let potentialRotation = wheelRotation + delta * WHEEL_SENSITIVITY;

              // --- Clamp Rotation and Stop at Limits ---
              // Check if the rotation is *already* at a limit and the scroll direction would exceed it
              if (wheelRotation >= MAX_WHEEL_ROTATION && delta > 0) {
                  // Already at max, scrolling down: Do nothing
                  return;
              }
              if (wheelRotation <= 0 && delta < 0) {
                  // Already at min, scrolling up: Do nothing
                  return;
              }

              // Clamp the potential rotation within the allowed range [0, MAX_WHEEL_ROTATION]
              wheelRotation = Math.max(0, Math.min(MAX_WHEEL_ROTATION, potentialRotation));

              // Apply the rotation transform to the wheel element
              applyWheelRotation();

              // Update the handle position based on the new clamped rotation
              updateHandlePosition();
          }
      }

      // --- Event Listeners Setup ---

      // Initial calculations and positioning
      // Calculate radius first, then set initial scroll/handle positions
      calculateTrackRadius();
      handleScroll(); // Run once on load

      // Recalculate on resize
      window.addEventListener("resize", () => {
          calculateTrackRadius(); // Recalculate radius
          handleScroll(); // Re-evaluate position and state
      });

      // Listen for page scroll events
      window.addEventListener("scroll", handleScroll, { passive: true });

      // Listen for mouse wheel events for rotation control
      window.addEventListener("wheel", handleMouseWheel, { passive: false });

      // Add hover effects for the project slices (no changes needed)
      const projectSlices = document.querySelectorAll(".project-slice");
      projectSlices.forEach((slice) => {
          slice.addEventListener("mouseenter", () => slice.classList.add("slice-hover"));
          slice.addEventListener("mouseleave", () => slice.classList.remove("slice-hover"));
      });

  }); // End DOMContentLoaded
}

// --- Initial CSS Suggestion ---
// Make sure your initial CSS for the handle matches the new starting point (left side)
/*
#scrollHandle {
  position: absolute;
  width: 20px; // Example size
  height: 20px; // Example size
  background-color: blue;
  border-radius: 50%;
  top: 50%; // Center vertically within track
  left: 50%; // Center horizontally within track
  // Initial transform places it at the leftmost point (-radius, 0) relative to track center
  transform: translate(-[trackRadius]px, 0px); // You might need to set this initially via JS after radius calculation if radius isn't fixed
  transform-origin: center center;
}
*/
