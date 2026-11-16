let activeCleanup = null;

export function initializeWheel() {
    const cleanup = () => {
        if (typeof activeCleanup === "function") {
            activeCleanup();
            activeCleanup = null;
        }
        document.body.style.overflow = "";
    };

    const init = () => {
        cleanup();

        const wheelBox = document.getElementById("wheelBox");
        const projectWheel = document.getElementById("projectWheel");
        const slices = document.querySelectorAll(".project-slice-container");
        const footer = document.querySelector("footer");

        if (!wheelBox || !projectWheel || slices.length === 0) {
            return;
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

        alignWheelToFooter();
        window.addEventListener("resize", alignWheelToFooter);

        let isLocked = false;
        let wheelRotation = 0;
        const ROTATION_SENSITIVITY = -0.25;
        const N = slices.length;
        const minRotation = -(N - 1) * 120;

        // --- Positioning & Visibility Logic ---
        function updateSlicePositions() {
            const ANGLE_PER_SECTION = 120;
            const activeIndex = -wheelRotation / ANGLE_PER_SECTION;

            slices.forEach((slice, index) => {
                const originalAngle = parseFloat(slice.getAttribute("data-original-angle"));
                const currentAngle = originalAngle + wheelRotation;
                const isVisible = (activeIndex >= index - 2.1) && (activeIndex <= index + 1.1);
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

            if (distFromBottom < revealDist) {
                const progress = 1 - (distFromBottom / revealDist);
                const clampedProgress = Math.min(1, Math.max(0, progress));
                const currentY = 100 - (clampedProgress * 100);

                if (!isLocked) {
                    wheelBox.style.transform = `translateX(-50%) translateY(${currentY}vh)`;
                }
            }
        }

        function handleWheel(e) {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPos = window.scrollY;
            const distFromBottom = maxScroll - scrollPos;
            const THRESHOLD = 10;

            if (!isLocked && distFromBottom <= THRESHOLD && e.deltaY > 0) {
                isLocked = true;
                document.body.style.overflow = "hidden";
            }

            if (isLocked) {
                if (e.deltaY < 0 && wheelRotation >= 0) {
                    isLocked = false;
                    wheelRotation = 0;
                    document.body.style.overflow = "";
                    updateSlicePositions();
                    return;
                }

                e.preventDefault();
                wheelRotation += e.deltaY * ROTATION_SENSITIVITY;

                if (wheelRotation > 0) wheelRotation = 0;
                if (wheelRotation < minRotation) wheelRotation = minRotation;

                updateSlicePositions();
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("wheel", handleWheel, { passive: false });

        activeCleanup = () => {
            window.removeEventListener("resize", alignWheelToFooter);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", handleWheel);
            document.body.style.overflow = "";
        };

        updateSlicePositions();
        handleScroll();
    };

    document.addEventListener("astro:page-load", init);
    document.addEventListener("astro:before-swap", cleanup);
}
