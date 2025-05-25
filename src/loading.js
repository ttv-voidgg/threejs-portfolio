window.onload = function () {
    (function () {

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
        const particleCount = 100;
        const particles = [];

        // Create color palette
        const cyan = { r: 0, g: 255, b: 239 };
        const pink = { r: 255, g: 70, b: 162 };

        const colors = [
            { r: cyan.r, g: cyan.g, b: cyan.b, a: 0.8 },
            { r: Math.round((cyan.r * 2 + pink.r) / 3), g: Math.round((cyan.g * 2 + pink.g) / 3), b: Math.round((cyan.b * 2 + pink.b) / 3), a: 0.7 },
            { r: Math.round((cyan.r + pink.r) / 2), g: Math.round((cyan.g + pink.g) / 2), b: Math.round((cyan.b + pink.b) / 2), a: 0.7 },
            { r: Math.round((cyan.r + pink.r * 2) / 3), g: Math.round((cyan.g + pink.g * 2) / 3), b: Math.round((cyan.b + pink.b * 2) / 3), a: 0.6 },
            { r: pink.r, g: pink.g, b: pink.b, a: 0.8 }
        ];

        let mouseX = canvas.width / 2;
        let mouseY = canvas.height / 2;
        let mouseSpeed = 0;
        let lastMouseX = mouseX;
        let lastMouseY = mouseY;

        canvas.addEventListener('mousemove', function (e) {
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.1, 5);

            lastMouseX = mouseX;
            lastMouseY = mouseY;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const centerYOffset = -150;

        for (let i = 0; i < particleCount; i++) {
            const angle = i * 0.35;
            const radius = 2 + (i / particleCount) * 15;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 1 + Math.random() * 3;

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
                trail: [],
                maxTrail: 5 + Math.floor(Math.random() * 5),
                pulse: 0,
                pulseSpeed: 0.02 + Math.random() * 0.02
            });
        }

        let animationFrame;
        let startTime = Date.now();

        function animate() {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 1000;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.pulse += p.pulseSpeed;
                const pulseFactor = Math.sin(p.pulse) * 0.5 + 0.5;

                const timeOffset = elapsed * p.speed;
                const wobble = Math.sin(timeOffset * 2) * 0.3;

                const newAngle = p.angle + timeOffset;
                const distanceFactor = 1 + wobble;

                const targetX = canvas.width / 2 + Math.cos(newAngle) * p.radius * distanceFactor * (i / 8);
                const targetY = canvas.height / 2 + centerYOffset + Math.sin(newAngle) * p.radius * distanceFactor * (i / 8);

                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 200;

                let mouseInfluence = 0;
                if (distance < maxDistance) {
                    mouseInfluence = (1 - distance / maxDistance) * 0.2 * mouseSpeed;
                }

                p.x += (targetX - p.x) * 0.05;
                p.y += (targetY - p.y) * 0.05;

                p.x += dx * mouseInfluence;
                p.y += dy * mouseInfluence;

                p.trail.unshift({ x: p.x, y: p.y });
                if (p.trail.length > p.maxTrail) {
                    p.trail.pop();
                }

                if (p.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(p.trail[0].x, p.trail[0].y);

                    for (let t = 1; t < p.trail.length; t++) {
                        const point = p.trail[t];
                        ctx.lineTo(point.x, point.y);

                        const alpha = p.color.a * (1 - t / p.trail.length);
                        ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
                        ctx.lineWidth = p.size * (1 - t / p.trail.length) * 0.5;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(point.x, point.y);
                    }
                }

                const size = p.originalSize * (0.8 + pulseFactor * 0.4);

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

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`;
                ctx.fill();
            }

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
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

        animate();

        window.addEventListener('resize', function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(1, '#0a0a0a');
        });

        function enterSite() {
            const audio = document.getElementById('bg-music');
            const loadingScreen = document.getElementById('loading-screen');

            audio.volume = 0.02;
            audio.play();

            loadingScreen.style.transition = 'opacity 1s ease';
            loadingScreen.style.opacity = '0';

            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1000);
        }

        // 🔥 These were previously missing:
        const audio = document.getElementById('bg-music');
        const button = document.querySelector('#loading-screen .button div div');
        const muteToggle = document.getElementById('mute-toggle');
        const muteIcon = document.getElementById('mute-icon');

        if (button) {
            button.textContent = 'Enter';
            button.addEventListener("click", enterSite);
        }

        if (muteToggle && muteIcon) {
            muteToggle.addEventListener('click', function () {
                audio.muted = !audio.muted;
                muteIcon.src = audio.muted ? '/images/graphics/mute.png' : '/images/graphics/unmute.png';
            });
        }

    })();
};
