(function () {
    const canvas     = document.getElementById('cv-canvas');
    if (!canvas) return;
    const ctx        = canvas.getContext('2d');
    const scrollArea = document.getElementById('cv-scroll-area');
    const stickyEl   = document.getElementById('cv-sticky');

    const START_YEAR = 2015;
    const END_YEAR   = 2027;
    const N_YEARS    = END_YEAR - START_YEAR;
    const BAR_H      = 30;
    const CARD_GAP   = 10;

    // Work milestones — above the timeline (horizontal) / right (vertical)
    const WORK_BARS = [
        { cardIdx: 2, label: 'Research Asst.',  startYear: 2020, endYear: 2021, color: '#b45309' },
        { cardIdx: 3, label: 'Science Teacher', startYear: 2021, endYear: 2023, color: '#dc2626' },
        { cardIdx: 6, label: 'PhD Researcher',  startYear: 2026, endYear: 2027, color: '#d97706' },
    ];

    // Education milestones — below the timeline (horizontal) / left (vertical)
    const EDU_BARS = [
        { cardIdx: 0, label: 'BA Philosophy', startYear: 2015, endYear: 2019, color: '#7c3aed' },
        { cardIdx: 1, label: 'MA Philosophy', startYear: 2019, endYear: 2020, color: '#2563eb' },
        { cardIdx: 4, label: 'BSc Physics',   startYear: 2021, endYear: 2023, color: '#0891b2' },
        { cardIdx: 5, label: 'MSc Physics',   startYear: 2023, endYear: 2025, color: '#1e40af' },
    ];

    // Layout variables — recomputed on resize
    let H_LEFT_M, H_AVAIL_W, H_TIMELINE_Y, H_BAR_GAP;
    let V_TOP_M,  V_AVAIL_H,  V_TIMELINE_X, V_BAR_GAP;

    function isVertical() { return canvas.width < 700; }

    function recomputeLayout() {
        H_LEFT_M     = canvas.width  * 0.10;
        H_AVAIL_W    = canvas.width  * 0.80;
        H_TIMELINE_Y = canvas.height * 0.50;
        H_BAR_GAP    = 36;   // gap between timeline and nearest bar edge

        V_TOP_M      = canvas.height * 0.06;
        V_AVAIL_H    = canvas.height * 0.88;
        V_TIMELINE_X = canvas.width  * 0.50;
        V_BAR_GAP    = 36;
    }

    function xYear(year) { return H_LEFT_M + (year - START_YEAR) / N_YEARS * H_AVAIL_W; }
    function yYear(year) { return V_TOP_M  + (year - START_YEAR) / N_YEARS * V_AVAIL_H; }

    // ── Scroll progress ───────────────────────────────────────────────────
    function getProgress() {
        const headerH    = parseFloat(getComputedStyle(document.documentElement).fontSize) * 3.5;
        const rect       = scrollArea.getBoundingClientRect();
        const scrollable = scrollArea.offsetHeight - stickyEl.offsetHeight;
        return Math.max(0, Math.min(1, -(rect.top - headerH) / scrollable));
    }

    // ── Colour helpers ────────────────────────────────────────────────────
    function hexRgba(hex, a) {
        const n = parseInt(hex.slice(1), 16);
        return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;
    }
    function adjustColor(hex, f) {
        const n = parseInt(hex.slice(1), 16);
        return `rgb(${Math.min(255,Math.round(((n>>16)&255)*f))},`
             + `${Math.min(255,Math.round(((n>>8)&255)*f))},`
             + `${Math.min(255,Math.round((n&255)*f))})`;
    }

    // ── Card sizing & positioning ─────────────────────────────────────────
    function cardWidth() {
        if (canvas.width < 400) return 108;
        if (canvas.width < 600) return 130;
        return 185;
    }

    function positionCards() {
        const CW   = cardWidth();
        const M    = 6;
        const vert = isVertical();

        if (!vert) {
            // Horizontal: work cards above bars, edu cards below bars
            const workCardBottomY = H_TIMELINE_Y - H_BAR_GAP - BAR_H - CARD_GAP;
            const eduCardTopY     = H_TIMELINE_Y + H_BAR_GAP + BAR_H + CARD_GAP;

            WORK_BARS.forEach(b => {
                const card = document.getElementById(`cv-card-${b.cardIdx}`);
                if (!card) return;
                const midX = (xYear(b.startYear) + xYear(b.endYear)) / 2;
                card.style.top       = `${workCardBottomY}px`;
                card.style.width     = `${CW}px`;
                card.style.left      = `${Math.max(M, Math.min(midX - CW / 2, canvas.width - CW - M))}px`;
                card.style.right     = 'auto';
                card.style.transform = 'translateY(-100%)';  // anchor bottom edge to workCardBottomY
            });
            EDU_BARS.forEach(b => {
                const card = document.getElementById(`cv-card-${b.cardIdx}`);
                if (!card) return;
                const midX = (xYear(b.startYear) + xYear(b.endYear)) / 2;
                card.style.top       = `${eduCardTopY}px`;
                card.style.width     = `${CW}px`;
                card.style.left      = `${Math.max(M, Math.min(midX - CW / 2, canvas.width - CW - M))}px`;
                card.style.right     = 'auto';
                card.style.transform = '';
            });
        } else {
            // Vertical: work cards right of bars, edu cards left of bars
            const workCardLeftX = Math.min(V_TIMELINE_X + V_BAR_GAP + BAR_H + CARD_GAP, canvas.width - CW - M);
            const eduCardRightX = V_TIMELINE_X - V_BAR_GAP - BAR_H - CARD_GAP;

            WORK_BARS.forEach(b => {
                const card = document.getElementById(`cv-card-${b.cardIdx}`);
                if (!card) return;
                const midY = (yYear(b.startYear) + yYear(b.endYear)) / 2;
                card.style.top       = `${midY}px`;
                card.style.width     = `${CW}px`;
                card.style.left      = `${workCardLeftX}px`;
                card.style.right     = 'auto';
                card.style.transform = 'translateY(-50%)';
            });
            EDU_BARS.forEach(b => {
                const card = document.getElementById(`cv-card-${b.cardIdx}`);
                if (!card) return;
                const midY = (yYear(b.startYear) + yYear(b.endYear)) / 2;
                const leftX = Math.max(M, eduCardRightX - CW);
                card.style.top       = `${midY}px`;
                card.style.width     = `${CW}px`;
                card.style.left      = `${leftX}px`;
                card.style.right     = 'auto';
                card.style.transform = 'translateY(-50%)';
            });
        }
    }

    // ── Horizontal: timeline axis ─────────────────────────────────────────
    function drawTimelineH(progress) {
        const x0    = xYear(START_YEAR);
        const x1    = xYear(END_YEAR);
        const shipX = x0 + progress * H_AVAIL_W;
        const TY    = H_TIMELINE_Y;

        ctx.beginPath(); ctx.moveTo(x0, TY); ctx.lineTo(x1, TY);
        ctx.strokeStyle = 'rgba(201,168,76,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();

        if (progress > 0) {
            ctx.beginPath(); ctx.moveTo(x0, TY); ctx.lineTo(shipX, TY);
            ctx.strokeStyle = 'rgba(201,168,76,0.60)'; ctx.lineWidth = 2; ctx.stroke();
        }

        const fs = Math.max(8, Math.round(canvas.width * 0.011));
        ctx.font = `${fs}px sans-serif`;
        for (let year = START_YEAR; year <= END_YEAR; year++) {
            const xx      = xYear(year);
            const reached = progress >= (year - START_YEAR) / N_YEARS - 0.001;
            const major   = (year % 2 === 1);
            const tickLen = major ? 7 : 4;
            ctx.beginPath(); ctx.moveTo(xx, TY - tickLen); ctx.lineTo(xx, TY + tickLen);
            ctx.strokeStyle = reached ? 'rgba(201,168,76,0.65)' : 'rgba(201,168,76,0.18)';
            ctx.lineWidth = 1; ctx.stroke();
            if (major) {
                ctx.fillStyle = reached ? 'rgba(201,168,76,0.75)' : 'rgba(201,168,76,0.22)';
                ctx.textAlign = 'center';
                // Year labels ABOVE the timeline — sit in the gap between bars and timeline
                ctx.fillText(String(year), xx, TY - tickLen - 3);
            }
        }

        // Section labels, rotated, in the left margin — well separated by large H_BAR_GAP
        const lfs = Math.max(9, Math.round(canvas.width * 0.013));
        ctx.font = `bold ${lfs}px sans-serif`;

        ctx.save();
        ctx.translate(H_LEFT_M * 0.35, TY - H_BAR_GAP - BAR_H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(220,140,60,0.38)';
        ctx.fillText('WORK', 0, lfs * 0.38);
        ctx.restore();

        ctx.save();
        ctx.translate(H_LEFT_M * 0.35, TY + H_BAR_GAP + BAR_H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(120,160,240,0.38)';
        ctx.fillText('EDUCATION', 0, lfs * 0.38);
        ctx.restore();
    }

    // ── Horizontal: individual bar ────────────────────────────────────────
    function drawBarH(b, progress, above) {
        const startFrac = (b.startYear - START_YEAR) / N_YEARS;
        const endFrac   = (b.endYear   - START_YEAR) / N_YEARS;
        const x0   = xYear(b.startYear);
        const x1   = xYear(b.endYear);
        const barW = x1 - x0;
        const barY = above ? H_TIMELINE_Y - H_BAR_GAP - BAR_H : H_TIMELINE_Y + H_BAR_GAP;

        ctx.strokeStyle = hexRgba(b.color, 0.18);
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, barY, barW, BAR_H);

        const fillFrac = Math.max(0, Math.min(1, (progress - startFrac) / (endFrac - startFrac)));
        const active   = progress >= startFrac && progress <= endFrac;
        const visited  = progress > endFrac;
        const fillW    = fillFrac * barW;

        if (fillW > 0) {
            const alpha = visited ? 0.32 : 0.52;
            const grad  = ctx.createLinearGradient(x0, 0, x0 + fillW, 0);
            grad.addColorStop(0, hexRgba(b.color, alpha));
            grad.addColorStop(1, hexRgba(adjustColor(b.color, 1.35), alpha));
            ctx.fillStyle = grad;
            ctx.fillRect(x0, barY, fillW, BAR_H);

            if (active) {
                const glowX  = x0 + fillW;
                const radius = BAR_H * 1.1;
                const glow   = ctx.createRadialGradient(glowX, barY + BAR_H / 2, 0, glowX, barY + BAR_H / 2, radius);
                glow.addColorStop(0, hexRgba(b.color, 0.70));
                glow.addColorStop(1, hexRgba(b.color, 0));
                ctx.save();
                ctx.beginPath(); ctx.rect(x0, barY, barW, BAR_H); ctx.clip();
                ctx.fillStyle = glow;
                ctx.fillRect(glowX - radius, barY, radius * 2, BAR_H);
                ctx.restore();
            }
        }

        if (fillFrac > 0.05) {
            const lfs  = Math.max(8, Math.round(canvas.width * 0.011));
            const minW = lfs * b.label.length * 0.58 + 10;
            if (barW > minW) {
                ctx.font      = `${lfs}px sans-serif`;
                ctx.fillStyle = hexRgba('#e8e6e1', visited ? 0.50 : 0.88);
                ctx.textAlign = 'center';
                ctx.fillText(b.label, x0 + barW / 2, barY + BAR_H / 2 + lfs * 0.38);
            }
        }
    }

    // ── Vertical: timeline axis ───────────────────────────────────────────
    function drawTimelineV(progress) {
        const y0    = yYear(START_YEAR);
        const y1    = yYear(END_YEAR);
        const shipY = y0 + progress * V_AVAIL_H;
        const TX    = V_TIMELINE_X;

        ctx.beginPath(); ctx.moveTo(TX, y0); ctx.lineTo(TX, y1);
        ctx.strokeStyle = 'rgba(201,168,76,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();

        if (progress > 0) {
            ctx.beginPath(); ctx.moveTo(TX, y0); ctx.lineTo(TX, shipY);
            ctx.strokeStyle = 'rgba(201,168,76,0.60)'; ctx.lineWidth = 2; ctx.stroke();
        }

        const fs = Math.max(8, Math.round(canvas.width * 0.030));
        ctx.font = `${fs}px sans-serif`;
        for (let year = START_YEAR; year <= END_YEAR; year++) {
            const yy      = yYear(year);
            const reached = progress >= (year - START_YEAR) / N_YEARS - 0.001;
            const major   = (year % 2 === 1);
            const tickLen = major ? 6 : 3;
            ctx.beginPath(); ctx.moveTo(TX - tickLen, yy); ctx.lineTo(TX + tickLen, yy);
            ctx.strokeStyle = reached ? 'rgba(201,168,76,0.65)' : 'rgba(201,168,76,0.18)';
            ctx.lineWidth = 1; ctx.stroke();
            if (major) {
                ctx.fillStyle = reached ? 'rgba(201,168,76,0.75)' : 'rgba(201,168,76,0.22)';
                // Year labels to the LEFT of the timeline, in the gap between edu bars and timeline
                ctx.textAlign = 'right';
                ctx.fillText(String(year), TX - tickLen - 3, yy + fs * 0.38);
            }
        }

        // Section labels above each bar column
        const lfs = Math.max(8, Math.round(canvas.width * 0.034));
        ctx.font = `bold ${lfs}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(220,140,60,0.38)';
        ctx.fillText('WORK', TX + V_BAR_GAP + BAR_H / 2, V_TOP_M * 0.55);
        ctx.fillStyle = 'rgba(120,160,240,0.38)';
        ctx.fillText('EDU', TX - V_BAR_GAP - BAR_H / 2, V_TOP_M * 0.55);
    }

    // ── Vertical: individual bar ──────────────────────────────────────────
    function drawBarV(b, progress, right) {
        const startFrac = (b.startYear - START_YEAR) / N_YEARS;
        const endFrac   = (b.endYear   - START_YEAR) / N_YEARS;
        const y0     = yYear(b.startYear);
        const y1     = yYear(b.endYear);
        const barLen = y1 - y0;
        const barX   = right ? V_TIMELINE_X + V_BAR_GAP : V_TIMELINE_X - V_BAR_GAP - BAR_H;

        ctx.strokeStyle = hexRgba(b.color, 0.18);
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, y0, BAR_H, barLen);

        const fillFrac = Math.max(0, Math.min(1, (progress - startFrac) / (endFrac - startFrac)));
        const active   = progress >= startFrac && progress <= endFrac;
        const visited  = progress > endFrac;
        const fillLen  = fillFrac * barLen;

        if (fillLen > 0) {
            const alpha = visited ? 0.32 : 0.52;
            const grad  = ctx.createLinearGradient(0, y0, 0, y0 + fillLen);
            grad.addColorStop(0, hexRgba(b.color, alpha));
            grad.addColorStop(1, hexRgba(adjustColor(b.color, 1.35), alpha));
            ctx.fillStyle = grad;
            ctx.fillRect(barX, y0, BAR_H, fillLen);

            if (active) {
                const glowY  = y0 + fillLen;
                const radius = BAR_H * 1.1;
                const glow   = ctx.createRadialGradient(barX + BAR_H / 2, glowY, 0, barX + BAR_H / 2, glowY, radius);
                glow.addColorStop(0, hexRgba(b.color, 0.70));
                glow.addColorStop(1, hexRgba(b.color, 0));
                ctx.save();
                ctx.beginPath(); ctx.rect(barX, y0, BAR_H, barLen); ctx.clip();
                ctx.fillStyle = glow;
                ctx.fillRect(barX, glowY - radius, BAR_H, radius * 2);
                ctx.restore();
            }
        }
    }

    // ── Spaceship ─────────────────────────────────────────────────────────
    function drawShip(x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        const flame = ctx.createLinearGradient(-52, 0, -18, 0);
        flame.addColorStop(0,   'rgba(255,60,0,0)');
        flame.addColorStop(0.4, 'rgba(255,130,10,0.45)');
        flame.addColorStop(1,   'rgba(255,185,40,0.9)');
        ctx.beginPath();
        ctx.moveTo(-18,-4.5); ctx.lineTo(-52,-1); ctx.lineTo(-52,1); ctx.lineTo(-18,4.5); ctx.closePath();
        ctx.fillStyle = flame; ctx.fill();

        const flare = ctx.createLinearGradient(-62, 0, -18, 0);
        flare.addColorStop(0, 'rgba(255,220,120,0)');
        flare.addColorStop(1, 'rgba(255,220,120,0.55)');
        ctx.beginPath();
        ctx.moveTo(-18,-1.5); ctx.lineTo(-62,0); ctx.lineTo(-18,1.5); ctx.closePath();
        ctx.fillStyle = flare; ctx.fill();

        const wingGrad = ctx.createLinearGradient(0,-22,0,-5);
        wingGrad.addColorStop(0,'#5a5850'); wingGrad.addColorStop(1,'#7c7870');
        ctx.beginPath();
        ctx.moveTo(0,-5); ctx.lineTo(-12,-22); ctx.lineTo(-20,-6); ctx.lineTo(-8,-5); ctx.closePath();
        ctx.fillStyle = wingGrad; ctx.fill();
        ctx.strokeStyle = 'rgba(120,115,105,0.6)'; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0,5); ctx.lineTo(-12,22); ctx.lineTo(-20,6); ctx.lineTo(-8,5); ctx.closePath();
        ctx.fillStyle = wingGrad; ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-12,-5); ctx.lineTo(-20,-5); ctx.lineTo(-20,5); ctx.lineTo(-12,5); ctx.closePath();
        ctx.fillStyle = '#4a4845'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(-19,0,3.5,5,0,0,Math.PI*2);
        ctx.fillStyle = 'rgba(255,150,25,0.8)'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(-19,0,1.5,2.5,0,0,Math.PI*2);
        ctx.fillStyle = 'rgba(255,240,180,0.95)'; ctx.fill();

        const hull = ctx.createLinearGradient(0,-5,0,5);
        hull.addColorStop(0,'#d4d0c8'); hull.addColorStop(0.4,'#b8b4ac'); hull.addColorStop(1,'#888480');
        ctx.beginPath();
        ctx.moveTo(24,0); ctx.lineTo(16,-5); ctx.lineTo(-8,-5);
        ctx.lineTo(-12,-5); ctx.lineTo(-12,5); ctx.lineTo(-8,5); ctx.lineTo(16,5); ctx.closePath();
        ctx.fillStyle = hull; ctx.fill();
        ctx.strokeStyle = 'rgba(90,88,82,0.4)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(8,-5); ctx.lineTo(8,5); ctx.moveTo(-4,-5); ctx.lineTo(-4,5); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(24,0); ctx.lineTo(16,-5); ctx.lineTo(16,5); ctx.closePath();
        ctx.fillStyle = '#a8a49c'; ctx.fill();

        ctx.beginPath(); ctx.ellipse(13,-1,7.5,3.8,0.15,0,Math.PI*2);
        ctx.fillStyle = 'rgba(100,200,255,0.72)'; ctx.fill();
        ctx.strokeStyle = 'rgba(180,225,255,0.5)'; ctx.lineWidth = 0.6; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(11,-2.8,3.5,1.2,0.25,0,Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fill();

        ctx.restore();
    }

    // ── Card visibility ───────────────────────────────────────────────────
    function updateCards(progress) {
        const vert = isVertical();
        [...WORK_BARS, ...EDU_BARS].forEach(b => {
            const card = document.getElementById(`cv-card-${b.cardIdx}`);
            if (!card) return;
            const startFrac = (b.startYear - START_YEAR) / N_YEARS;
            const endFrac   = (b.endYear   - START_YEAR) / N_YEARS;
            // Horizontal: stay visible once the ship has entered the bar
            // Vertical: show only while ship is within the bar (avoids overlap on small screens)
            const active = vert
                ? (progress >= startFrac && progress <= endFrac)
                : (progress >= startFrac);
            card.classList.toggle('active', active);
        });
    }

    // ── Main loop ─────────────────────────────────────────────────────────
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const progress = getProgress();
        const vert     = isVertical();

        if (vert) {
            drawTimelineV(progress);
            WORK_BARS.forEach(b => drawBarV(b, progress, true));
            EDU_BARS.forEach(b  => drawBarV(b, progress, false));
            drawShip(V_TIMELINE_X, yYear(START_YEAR) + progress * V_AVAIL_H, Math.PI / 2);
        } else {
            drawTimelineH(progress);
            WORK_BARS.forEach(b => drawBarH(b, progress, true));
            EDU_BARS.forEach(b  => drawBarH(b, progress, false));
            drawShip(xYear(START_YEAR) + progress * H_AVAIL_W, H_TIMELINE_Y, 0);
        }

        updateCards(progress);
        requestAnimationFrame(draw);
    }

    // ── Init & resize ─────────────────────────────────────────────────────
    function resize() {
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        recomputeLayout();
        positionCards();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(stickyEl);
    resize();
    requestAnimationFrame(draw);
})();
