export function initializeWheel() {
    console.log("Wheel: Module loaded.");

    const init = () => {
        console.log("Wheel: Initializing...");
        const wheelBox = document.getElementById("wheelBox");
        const projectWheel = document.getElementById("projectWheel");
        const slices = document.querySelectorAll(".project-slice-container");
        const footer = document.querySelector("footer");

        if (!wheelBox || !projectWheel || slices.length === 0) {
            console.error("Wheel elements missing in init.", { wheelBox, projectWheel, slices: slices.length });
            return;
        } else {
            console.log("Wheel initialized. Slices:", slices.length);
        }

        // --- Alignment Logic ---
        function alignWheelToFooter() {
            if (footer) {
                const footerHeight = footer.offsetHeight;
                wheelBox.style.bottom = `${footerHeight}px`;
            } else {
                wheelBox.style.bottom = '0px';
            }
        }

        // Run on load and resize
        alignWheelToFooter();
        window.addEventListener("resize", alignWheelToFooter);

        let isLocked = false;
        let wheelRotation = 0;
        const ROTATION_SENSITIVITY = -0.25;

        // Calculate Limits
        const N = slices.length;
        // Start: 0
        // End: (N-1) * 120 + offset... 
        // Logic: 0 is P1 centered.
        // We want to scroll DOWN to go to P2, P3...
        // P(i) is centered when rotation = -i * 120.
        // Max (min val) rotation = -(N-1) * 120.
        // Adding a buffer or exact limit? 
        // Previous logic: targetLastAngle = 30.
        // Let's stick to simple: 0 to -(N-1)*120.
        // If we want slightly more, we can add a buffer.
        // currentAngle = original + rotation.

        const minRotation = -(N - 1) * 120;

        // --- Positioning & Visibility Logic ---
        function updateSlicePositions() {
            const ANGLE_PER_SECTION = 120;
            // activeIndex: which slice index is currently at 0 (or closest to it).
            // rotation = -activeIndex * 120
            // activeIndex = -rotation / 120
            const activeIndex = -wheelRotation / ANGLE_PER_SECTION;

            slices.forEach((slice, index) => {
                const originalAngle = parseFloat(slice.getAttribute("data-original-angle"));
                const currentAngle = originalAngle + wheelRotation;

                // Visibility Logic:
                // Show approx [index-2 to index+1] around active.
                const isVisible = (activeIndex >= index - 2.1) && (activeIndex <= index + 1.1);

                // Z-Index: Active High.
                const dist = Math.abs(activeIndex - index);
                const zIndex = 100 - Math.round(dist * 10);

                if (isVisible) {
                    slice.classList.remove("hidden");
                    slice.style.zIndex = zIndex;
                } else {
                    slice.classList.add("hidden");
                    slice.style.zIndex = 0;
                }

                slice.style.transform = `rotate(${currentAngle}deg)`;
            });
        }

        function handleScroll() {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPos = window.scrollY;
            const revealDist = window.innerHeight * 1.5;
            const distFromBottom = maxScroll - scrollPos;

            // Simple Reveal Logic
            if (distFromBottom < revealDist) {
                const progress = 1 - (distFromBottom / revealDist);
                const clampedProgress = Math.min(1, Math.max(0, progress));

                // Move from 100vh (hidden) to 0vh (visible)
                const startY = 100;
                const endY = 0;
                const currentY = startY - (clampedProgress * (startY - endY));

                if (!isLocked) {
                    wheelBox.style.transform = `translateX(-50%) translateY(${currentY}vh)`;
                }
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true });

        window.addEventListener("wheel", (e) => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPos = window.scrollY;
            const distFromBottom = maxScroll - scrollPos;
            const THRESHOLD = 10; // px from bottom

            // Lock Condition: At bottom, scrolling DOWN.
            if (!isLocked && distFromBottom <= THRESHOLD && e.deltaY > 0) {
                isLocked = true;
                document.body.style.overflow = "hidden"; // Lock page scroll
                console.log("Wheel: Locked");
            }

            if (isLocked) {
                // Unlock Condition: Scrolling UP and Wheel is at Start (0).
                if (e.deltaY < 0 && wheelRotation >= 0) {
                    isLocked = false;
                    wheelRotation = 0;
                    document.body.style.overflow = ""; // Unlock page scroll
                    console.log("Wheel: Unlocked");
                    updateSlicePositions();
                    return;
                }

                // If Locked, consume event for Wheel Rotation
                e.preventDefault();
                wheelRotation += e.deltaY * ROTATION_SENSITIVITY;

                // Clamp Rotation
                if (wheelRotation > 0) wheelRotation = 0;
                if (wheelRotation < minRotation) wheelRotation = minRotation;

                updateSlicePositions();
            }
        }, { passive: false });

        // Initial Update
        updateSlicePositions();
        handleScroll();
    };

    // Robust Initialization Trigger
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        // DOM already ready
        init();
    }
}
