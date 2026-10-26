/* Animações do portfólio — Fusão v3 (JS puro) */
(() => {
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, c = document) => [...c.querySelectorAll(s)];
    const ease = 'cubic-bezier(.2,.8,.2,1)';
    const back = 'cubic-bezier(.34,1.56,.64,1)';
    const anim = (el, kf, o) => reduz ? null : el.animate(kf, { fill: 'both', easing: ease, ...o });

    /* 1. Entrada da capa: elementos sobem em sequência (como uma timeline) */
    function entradaCapa() {
        const t = document.querySelector('.titulo-gigante');
        const txt = t.textContent.trim();
        t.setAttribute('aria-label', txt);
        t.innerHTML = [...txt].map(c => `<span class="letra" aria-hidden="true">${c}</span>`).join('');
        $('.letra', t).forEach((l, i) => anim(l, [
            { transform: 'translateY(110%) rotate(8deg)', opacity: 0 }, { transform: 'none', opacity: 1 }
        ], { duration: 900, delay: 900 + i * 90, easing: back }));

        anim(document.querySelector('.serra-tras'), [{ transform: 'translateY(60%)' }, { transform: 'none' }], { duration: 1100, delay: 100 });
        anim(document.querySelector('.serra'), [{ transform: 'translateY(60%)' }, { transform: 'none' }], { duration: 1100, delay: 250 });
        anim(document.querySelector('.mar'), [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0)' }], { duration: 900, delay: 450 });
        anim(document.querySelector('.areia'), [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 700, delay: 700 });
        anim(document.querySelector(".sol"), [{ transform: 'scale(.2) rotate(-120deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1400, delay: 300, easing: back });
        $('.palmeira').forEach((p, i) => {
            const flip = p.classList.contains('dir') ? 'scaleX(-1) ' : '';
            anim(p, [{ transform: flip + 'translateY(40%) rotate(-6deg)', opacity: 0 }, { transform: flip + 'none', opacity: 1 }], { duration: 1200, delay: 800 + i * 200 });
        });
        const sub = document.querySelector('.sub-mao');
        anim(sub, [{ opacity: 0, transform: 'rotate(2deg) translateX(-30px)' }, { opacity: 1, transform: 'rotate(2deg)' }], { duration: 800, delay: 1900 });
        const lin = document.querySelector('.sublinhado path');
        anim(lin, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 800, delay: 2300 });
        anim(document.querySelector('.meta'), [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 2600 });
        anim(document.querySelector('.nav-topo'), [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 2200 });
        $('.brilho').forEach((b, i) => anim(b, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 700, delay: 2000 + i * 200, easing: back }));
    }

    /* 2. Estrelas giratórias (rotação contínua) */
    function estrelas() {
        if (reduz) return;
        $('.sol .gira, .orbita-grande .gira').forEach(g => g.style.transformOrigin = 'center');
        const gs = $('.sol .gira, .orbita-grande .gira');
        const base = gs.map(g => g.getAttribute('transform'));
        const t0 = performance.now();
        (function loop(t) {
            const a = ((t - t0) / 60) % 360;
            gs.forEach((g, i) => {
                const m = base[i].match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\)/);
                g.setAttribute('transform', `translate(${m[1]} ${m[2]}) rotate(${a}) scale(${m[3]}) translate(-50 -50)`);
            });
            requestAnimationFrame(loop);
        })(t0);
    }

    /* 3. Revelar ao rolar */
    function reveal() {
        const io = new IntersectionObserver(es => es.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
        }), { threshold: .15 });
        $('.reveal').forEach(el => io.observe(el));
    }

    /* 4. Paralaxe da capa (rolagem + mouse) */
    function paralaxe() {
        if (reduz) return;
        const itens = $('[data-parallax]');
        let mx = 0, my = 0, tx = 0, ty = 0;
        addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
        (function loop() {
            tx += (mx - tx) * .06; ty += (my - ty) * .06;
            const y = scrollY;
            if (y < innerHeight * 1.2) itens.forEach(el => {
                const k = parseFloat(el.dataset.parallax);
                el.style.translate = `${tx * k * 600}px ${ty * k * 300 + y * k * 4}px`;
            });
            requestAnimationFrame(loop);
        })();
    }

    /* 5. Faixas de habilidades: movem sozinhas e aceleram com a rolagem */
    function faixas() {
        if (reduz) return;
        const ms = $('.marquee').map(m => ({ t: m.querySelector('.trilho'), dir: +m.dataset.dir, v: +m.dataset.speed, x: 0 }));
        ms.forEach(m => m.metade = 0);
        let ultimo = scrollY, boost = 0, antes = performance.now();
        (function loop(now) {
            const dt = (now - antes) / 1000; antes = now;
            boost += ((Math.abs(scrollY - ultimo) * 1.2) - boost) * .1; ultimo = scrollY;
            ms.forEach(m => {
                const w = m.t.scrollWidth / 2;
                m.x += m.dir * (m.v + boost * 40) * dt;
                if (m.dir < 0 && m.x <= -w) m.x += w;
                if (m.dir > 0 && m.x >= 0) m.x -= w;
                m.t.style.transform = `translateX(${m.x}px)`;
            });
            requestAnimationFrame(loop);
        })(antes);
    }

    /* 6. Ingressos inclinam seguindo o mouse */
    function tilt() {
        if (reduz) return;
        $('[data-tilt]').forEach(c => {
            const base = getComputedStyle(c).transform;
            c.addEventListener('pointermove', e => {
                const r = c.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
                c.style.transition = 'transform .08s';
                c.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-8px)`;
            });
            c.addEventListener('pointerleave', () => { c.style.transition = ''; c.style.transform = ''; });
        });
    }

    /* 7. Barra de progresso + nav fixa + contador de seção */
    function rolagem() {
        const barra = document.getElementById('progresso'), nav = document.getElementById('nav');
        const f = () => {
            const max = document.documentElement.scrollHeight - innerHeight;
            barra.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
            nav.classList.toggle('fixa', scrollY > 60);
        };
        addEventListener('scroll', f, { passive: true }); f();
    }

    /* 8. Canhotos do contato abrem em leque ao entrar na tela */
    function leque() {
        const l = document.querySelector('.leque'); if (!l || reduz) return;
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            $('.canhoto', l).forEach((c, i) => c.animate([
                { translate: '0 140px', opacity: 0 }, { translate: '0 0', opacity: 1 }
            ], { duration: 900, delay: i * 130, easing: back, fill: 'backwards' }));
            io.disconnect();
        }, { threshold: .3 });
        io.observe(l);
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!reduz) entradaCapa();
        estrelas(); reveal(); paralaxe(); faixas(); tilt(); rolagem(); leque();
    });
})();
