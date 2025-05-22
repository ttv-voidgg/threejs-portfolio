(function() {
    const canvas = document.getElementById('loading-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create gradient background
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#0a0a0a');

    // Particle settings
    const particleCount = 80;
    const particles = [];

    // Create color palette with your requested colors
    // Converting hex to RGB for more control over opacity
    const cyan = { r: 0, g: 255, b: 239 };    // #00FFEF
    const pink = { r: 255, g: 70, b: 162 };   // #FF46A2

    // Create a gradient between the two colors
    const colors = [
        { r: cyan.r, g: cyan.g, b: cyan.b, a: 0.8 },                                // Pure cyan
        { r: Math.round((cyan.r*2 + pink.r)/3), g: Math.round((cyan.g*2 + pink.g)/3), b: Math.round((cyan.b*2 + pink.b)/3), a: 0.7 },  // 2/3 cyan, 1/3 pink
        { r: Math.round((cyan.r + pink.r)/2), g: Math.round((cyan.g + pink.g)/2), b: Math.round((cyan.b + pink.b)/2), a: 0.7 },        // 1/2 cyan, 1/2 pink
        { r: Math.round((cyan.r + pink.r*2)/3), g: Math.round((cyan.g + pink.g*2)/3), b: Math.round((cyan.b + pink.b*2)/3), a: 0.6 },  // 1/3 cyan, 2/3 pink
        { r: pink.r, g: pink.g, b: pink.b, a: 0.8 }                                 // Pure pink
    ];

    // Mouse tracking
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let mouseSpeed = 0;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;

    canvas.addEventListener('mousemove', function(e) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        mouseSpeed = Math.min(Math.sqrt(dx*dx + dy*dy) * 0.1, 5);

        lastMouseX = mouseX;
        lastMouseY = mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const centerYOffset = -150; // move up by 100 pixels

    // Create particles in a more elegant pattern
    for (let i = 0; i < particleCount; i++) {
        // Create a spiral pattern
        const angle = i * 0.35; // More spread out
        const radius = 2 + (i / particleCount) * 15;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        // Random size but with more variation
        const size = 1 + Math.random() * 3;

        // Select color based on position in the spiral to create gradient effect
        const colorIndex = Math.floor((i / particleCount) * colors.length);
        const color = colors[colorIndex];

        particles.push({
            x: x,
            y: y,
            size: size,
            originalSize: size,
            color: color,
            speed: 0.02 + Math.random() * 0.03,
            angle: angle,
            radius: radius,
            originalX: x,
            originalY: y,
            // Add trail effect
            trail: [],
            maxTrail: 5 + Math.floor(Math.random() * 5),
            // Add pulse effect
            pulse: 0,
            pulseSpeed: 0.02 + Math.random() * 0.02
        });
    }

    // Animation variables
    let animationFrame;
    let startTime = Date.now();

    // Animation function
    function animate() {
        // Clear with gradient background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const currentTime = Date.now();
        const elapsed = (currentTime - startTime) / 1000;

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Update pulse
            p.pulse += p.pulseSpeed;
            const pulseFactor = Math.sin(p.pulse) * 0.5 + 0.5;

            // Calculate elegant movement
            const timeOffset = elapsed * p.speed;
            const wobble = Math.sin(timeOffset * 2) * 0.3;

            // Calculate new position with smooth orbit
            const newAngle = p.angle + timeOffset;
            const distanceFactor = 1 + wobble;

            // Target position in orbit
            const targetX = canvas.width / 2 + Math.cos(newAngle) * p.radius * distanceFactor * (i / 8);
            const targetY = canvas.height / 2 + centerYOffset + Math.sin(newAngle) * p.radius * distanceFactor * (i / 8);

            // Mouse influence - more subtle and elegant
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const maxDistance = 200;

            // More subtle mouse influence
            let mouseInfluence = 0;
            if (distance < maxDistance) {
                mouseInfluence = (1 - distance/maxDistance) * 0.2 * mouseSpeed;
            }

            // Smooth movement
            p.x += (targetX - p.x) * 0.05;
            p.y += (targetY - p.y) * 0.05;

            // Add mouse influence
            p.x += dx * mouseInfluence;
            p.y += dy * mouseInfluence;

            // Update trail
            p.trail.unshift({x: p.x, y: p.y});
            if (p.trail.length > p.maxTrail) {
                p.trail.pop();
            }

            // Draw trail
            if (p.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.trail[0].x, p.trail[0].y);

                for (let t = 1; t < p.trail.length; t++) {
                    const point = p.trail[t];
                    ctx.lineTo(point.x, point.y);

                    // Fade out trail
                    const alpha = p.color.a * (1 - t/p.trail.length);
                    ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
                    ctx.lineWidth = p.size * (1 - t/p.trail.length) * 0.5;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                }
            }

            // Draw particle with glow
            const size = p.originalSize * (0.8 + pulseFactor * 0.4);

            // Glow effect
            const glow = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, size * 2
            );

            glow.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`);
            glow.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Core of particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`;
            ctx.fill();
        }

        // Draw connecting lines between nearby particles
        // Use a gradient color for lines based on the two particles being connected
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx*dx + dy*dy);

                if (distance < 100) {
                    // Create a gradient line between the two particles
                    const lineGradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    lineGradient.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, 0.15)`);
                    lineGradient.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, 0.15)`);

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = lineGradient;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animationFrame = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Handle window resize - matching your existing code
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Update gradient on resize
        gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#0a0a0a');
    });

    function enterSite() {

        const audio = document.getElementById('bg-music');
        const loadingScreen = document.getElementById('loading-screen');

        audio.volume = 0.02; // Volume range is 0.0 (silent) to 1.0 (full volume)
        audio.play();

        // Apply fade-out transition
        loadingScreen.style.transition = 'opacity 1s ease';
        loadingScreen.style.opacity = '0';

        // Wait for the fade to finish before hiding it
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000); // matches the 1s transition

        // Reset any global styles
        document.documentElement.className = '';


        // Stop animation to free resources
        cancelAnimationFrame(animationFrame);
    }

    window.addEventListener('load', function() {

        const audio = document.getElementById('bg-music');
        const button = document.querySelector('#loading-screen .button div div');
        const muteToggle = document.getElementById('mute-toggle');
        const muteIcon = document.getElementById('mute-icon');

        if (button) {
            button.textContent = 'Enter';
        }

        muteToggle.addEventListener('click', function () {
            audio.muted = !audio.muted;
            muteIcon.src = audio.muted ? '/images/graphics/mute.png' : '/images/graphics/unmute.png';
        });

        button.addEventListener("click", enterSite);


    });
})();