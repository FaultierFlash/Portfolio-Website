// components/ProjectWheel/wheel.js

/**
 * Initializes the interactive wheel functionality
 */
export function initializeWheel() {
    document.addEventListener("DOMContentLoaded", () => {
      // Get all required elements
      const wheelBox = document.getElementById("wheelBox");
      const projectWheel = document.getElementById("projectWheel");
      const scrollHandle = document.getElementById("scrollHandle");
      const scrollTrack = document.getElementById("scrollTrack");
      const wheelContainer = document.querySelector(".project-wheel-container");
  
      if (!wheelBox || !projectWheel || !scrollHandle || !scrollTrack || !wheelContainer) {
        return;
      }
  
      // Get the position of the wheel
      const getWheelPosition = () => {
        const rect = wheelContainer.getBoundingClientRect();
        return rect.top + window.scrollY;
      };
  
      // Initial wheel position
      let wheelTopPosition = getWheelPosition();
  
      // Update wheel position on resize
      window.addEventListener("resize", () => {
        wheelTopPosition = getWheelPosition();
      });
  
      // Wheel parameters
      const trackRadius = scrollTrack.offsetWidth / 2;
      const MAX_ROTATION = 720;
  
      // Track if we've reached the bottom
      let reachedBottom = false;
      let wheelRotation = 0;
      let lastScrollY = window.scrollY;
      let scrollDelta = 0;
  
      // Calculate the maximum possible scroll position
      const getMaxScroll = () => {
        return document.documentElement.scrollHeight - window.innerHeight;
      };
  
      // Function to handle scroll events
      function handleScroll(e) {
        // Current scroll position
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        const maxScroll = getMaxScroll();
  
        // Calculate when wheel should be fully visible (when we reach bottom of page)
        const BOTTOM_THRESHOLD = 5; // Pixels from bottom to consider "reached bottom"
        const hasReachedBottom = maxScroll - scrollPos <= BOTTOM_THRESHOLD;
  
        // If we've reached the bottom and wheel isn't yet visible, make it visible
        if (hasReachedBottom) {
          // We've reached the bottom, enable wheel spinning mode
          if (!reachedBottom) {
            reachedBottom = true;
            wheelBox.style.transform = "translateX(-50%) translateY(0)";
  
            // Make sure wheel is fully visible
            projectWheel.style.transform = "translate(-50%, -50%) rotate(0deg)";
            scrollHandle.style.transform = "translate(0, -" + trackRadius + "px)";
          }
  
          // Calculate scroll delta for wheel rotation when at bottom
          scrollDelta = lastScrollY - scrollPos;
          lastScrollY = scrollPos;
  
          // Update wheel rotation based on scroll delta
          if (reachedBottom) {
            // Each scroll delta contributes to rotation
            const ROTATION_SPEED = 2; // Adjust this value to control rotation speed
            wheelRotation += scrollDelta * ROTATION_SPEED;
  
            // Keep rotation within 0-360 range
            wheelRotation = wheelRotation % 360;
            if (wheelRotation < 0) wheelRotation += 360;
  
            // Apply rotation to wheel
            projectWheel.style.transform = `translate(-50%, -50%) rotate(${wheelRotation}deg)`;
  
            // Update handle position - reversed direction
            const rotationProgress = wheelRotation / 360;
            const radians = Math.PI / 2 - rotationProgress * 2 * Math.PI;
            const x = Math.cos(radians) * trackRadius;
            const y = Math.sin(radians) * trackRadius;
            scrollHandle.style.transform = `translate(${x}px, ${y}px)`;
  
            // Prevent default scroll when at bottom
            if (e && e.preventDefault) {
              e.preventDefault();
            }
          }
        } else {
          // Not at bottom yet, standard scrolling behavior
          reachedBottom = false;
  
          // Calculate how far the wheel should move up
          const wheelFullyVisibleAt = maxScroll;
          const wheelScrollProgress = Math.min(1, scrollPos / wheelFullyVisibleAt);
          const translateY = (1 - wheelScrollProgress) * 50;
  
          // Update wheel position based on scroll
          wheelBox.style.transform = `translateX(-50%) translateY(${translateY}%)`;
  
          // Reset wheel rotation
          projectWheel.style.transform = "translate(-50%, -50%) rotate(0deg)";
          scrollHandle.style.transform = "translate(0, -" + trackRadius + "px)";
  
          // Update last scroll position
          lastScrollY = scrollPos;
        }
      }
  
      // Initial positioning
      handleScroll();
  
      // Listen for scroll events
      window.addEventListener("scroll", handleScroll);
  
      // Handle wheel events to control rotation when at bottom
      window.addEventListener(
        "wheel",
        (e) => {
          if (reachedBottom) {
            e.preventDefault();
  
            // Use wheel delta to control rotation
            const delta = e.deltaY;
            const WHEEL_SENSITIVITY = 0.1; // Adjust sensitivity
  
            wheelRotation += delta * WHEEL_SENSITIVITY;
            wheelRotation = wheelRotation % 360;
            if (wheelRotation < 0) wheelRotation += 360;
  
            // Apply rotation to wheel
            projectWheel.style.transform = `translate(-50%, -50%) rotate(${wheelRotation}deg)`;
  
            // Update handle position - reversed direction
            const rotationProgress = wheelRotation / 360;
            const radians = Math.PI / 2 - rotationProgress * 2 * Math.PI;
            const x = Math.cos(radians) * trackRadius;
            const y = Math.sin(radians) * trackRadius;
            scrollHandle.style.transform = `translate(${x}px, ${y}px)`;
          }
        },
        { passive: false }
      );
  
      // Add hover effects for the project slices
      const projectSlices = document.querySelectorAll(".project-slice");
      projectSlices.forEach((slice) => {
        slice.addEventListener("mouseenter", () => {
          slice.classList.add("slice-hover");
        });
        slice.addEventListener("mouseleave", () => {
          slice.classList.remove("slice-hover");
        });
      });
    });
  }