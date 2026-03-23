(function () {
    const canvas = document.getElementById('star-canvas');
    const ctx = canvas.getContext('2d');

    let stars = [];
    let shootingStars = [];
    let satellites = [];
    let supernovae = [];
    let lastTime = null;

    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        initStars();
    }

    function initStars() {
        stars = [];
        const count = Math.floor((canvas.width * canvas.height) / 2500);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.4 + 0.2,
                baseAlpha: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 0.015 + 0.004,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    function spawnSatellite() {
        // Pick a random edge to enter from
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        if (edge === 0) { x = Math.random() * canvas.width; y = -4; }
        else if (edge === 1) { x = canvas.width + 4; y = Math.random() * canvas.height; }
        else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + 4; }
        else { x = -4; y = Math.random() * canvas.height; }

        // Aim roughly toward the opposite side of the canvas
        const targetX = canvas.width - x + (Math.random() - 0.5) * canvas.width * 0.4;
        const targetY = canvas.height - y + (Math.random() - 0.5) * canvas.height * 0.4;
        const dist = Math.sqrt((targetX - x) ** 2 + (targetY - y) ** 2);
        const speed = Math.random() * 0.6 + 0.5;

        satellites.push({
            x, y,
            vx: (targetX - x) / dist * speed,
            vy: (targetY - y) / dist * speed,
            blinkPhase: Math.random() * Math.PI * 2,
            blinkSpeed: Math.random() * 0.04 + 0.015,
        });
    }

    function spawnSupernova() {
        supernovae.push({
            x:        Math.random() * canvas.width,
            y:        Math.random() * canvas.height,
            age:      0,
            duration: Math.random() * 4 + 7,   // 7–11 s total
            maxGlow:  Math.random() * 30 + 25,  // peak glow radius px
        });
    }

    function spawnShootingStar() {
        const angle = Math.PI / 5 + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 5 + 7;
        shootingStars.push({
            x: Math.random() * canvas.width * 0.8,
            y: Math.random() * canvas.height * 0.5,
            dx: Math.cos(angle),
            dy: Math.sin(angle),
            speed: speed,
            length: Math.random() * 120 + 80,
            life: 1.0,
            decay: Math.random() * 0.006 + 0.004,
        });
    }

    function draw(timestamp) {
        const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.1) : 0;
        lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Twinkling stars
        for (const s of stars) {
            s.phase += s.twinkleSpeed;
            const alpha = Math.max(0.05, Math.min(1, s.baseAlpha + Math.sin(s.phase) * 0.25));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 215, 200, ${alpha})`;
            ctx.fill();
        }

        // Shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const s = shootingStars[i];
            s.x += s.dx * s.speed;
            s.y += s.dy * s.speed;
            s.life -= s.decay;

            if (s.life <= 0 || s.x > canvas.width + 50 || s.y > canvas.height + 50) {
                shootingStars.splice(i, 1);
                continue;
            }

            const tailX = s.x - s.dx * s.length * s.life;
            const tailY = s.y - s.dy * s.length * s.life;

            const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
            grad.addColorStop(0, `rgba(220, 215, 200, 0)`);
            grad.addColorStop(1, `rgba(220, 215, 200, ${s.life * 0.9})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Bright head
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 250, 230, ${s.life})`;
            ctx.fill();
        }

        // Satellites
        for (let i = satellites.length - 1; i >= 0; i--) {
            const s = satellites[i];
            s.x += s.vx;
            s.y += s.vy;
            s.blinkPhase += s.blinkSpeed;

            if (s.x < -20 || s.x > canvas.width + 20 || s.y < -20 || s.y > canvas.height + 20) {
                satellites.splice(i, 1);
                continue;
            }

            const alpha = 0.45 + Math.sin(s.blinkPhase) * 0.35;
            ctx.fillStyle = `rgba(200, 215, 255, ${Math.max(0.05, alpha)})`;
            // Draw as a tiny plus/cross to suggest a satellite body
            ctx.fillRect(s.x - 2, s.y - 0.5, 4, 1);
            ctx.fillRect(s.x - 0.5, s.y - 2, 1, 4);
        }

        // Supernovae
        for (let i = supernovae.length - 1; i >= 0; i--) {
            const s = supernovae[i];
            s.age += dt;
            if (s.age >= s.duration) { supernovae.splice(i, 1); continue; }

            const t = s.age / s.duration;
            // Fast rise (first 8%), slow fade (remaining 92%)
            const b = t < 0.08 ? t / 0.08 : 1 - (t - 0.08) / 0.92;
            const glowR = 3 + b * s.maxGlow;

            // Outer halo — blue-white bloom
            const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
            halo.addColorStop(0,   `rgba(255, 255, 235, ${b * 0.95})`);
            halo.addColorStop(0.25,`rgba(200, 210, 255, ${b * 0.55})`);
            halo.addColorStop(0.6, `rgba(140, 160, 255, ${b * 0.20})`);
            halo.addColorStop(1,   `rgba(100, 120, 220, 0)`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = halo;
            ctx.fill();

            // Bright core
            ctx.beginPath();
            ctx.arc(s.x, s.y, Math.max(0.5, 2.5 * b), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 245, ${b})`;
            ctx.fill();

            // Expanding shockwave ring — visible only in first 30% of life
            if (t < 0.30) {
                const ringFrac  = t / 0.30;
                const ringR     = ringFrac * s.maxGlow * 2.2;
                const ringAlpha = (1 - ringFrac) * 0.45;
                ctx.beginPath();
                ctx.arc(s.x, s.y, ringR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(180, 200, 255, ${ringAlpha})`;
                ctx.lineWidth   = 1.2;
                ctx.stroke();
            }
        }

        // Spawn a shooting star roughly every 6-10 seconds (at ~60fps)
        if (Math.random() < 0.0022) {
            spawnShootingStar();
        }

        // Spawn a satellite roughly every 45-60 seconds
        if (Math.random() < 0.00035) {
            spawnSatellite();
        }

        // Spawn a supernova roughly every 2 minutes
        if (Math.random() < 0.00050) {
            spawnSupernova();
        }

        requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    resize();
    spawnSatellite();
    requestAnimationFrame(draw);
})();
