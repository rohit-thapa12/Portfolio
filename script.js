'use strict';

(function () {

    // Fallback: instantly show all reveals in browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(function (el) {
            el.classList.add('is-visible');
        });
        return;
    }

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // animate once, then stop watching
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px', // trigger slightly before fully in view
        }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
        observer.observe(el);
    });

}());

// Art carousel: prev/next buttons and slide counter
(function () {
    var track = document.querySelector('.art-track');
    if (!track) return;

    var slides  = track.querySelectorAll('.art-slot');
    var prev    = document.querySelector('.art-btn[data-dir="-1"]');
    var next    = document.querySelector('.art-btn[data-dir="1"]');
    var count   = document.querySelector('.art-count');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function step() {
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return slides[0].offsetWidth + gap;
    }

    function update() {
        var max = track.scrollWidth - track.clientWidth - 2;
        var i = Math.round(track.scrollLeft / step());
        if (track.scrollLeft >= max) i = slides.length - 1;
        count.textContent = (i + 1) + ' / ' + slides.length;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
    }

    [prev, next].forEach(function (btn) {
        btn.addEventListener('click', function () {
            track.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: reduced ? 'auto' : 'smooth' });
        });
    });

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}());

// Art carousel: drag with the mouse to swipe (touch already scrolls natively)
(function () {
    var track = document.querySelector('.art-track');
    if (!track) return;

    var slides  = track.querySelectorAll('.art-slot');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var down = false, startX = 0, startLeft = 0, lastX = 0, vel = 0;

    function step() {
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return slides[0].offsetWidth + gap;
    }

    track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = true;
        startX = lastX = e.clientX;
        startLeft = track.scrollLeft;
        vel = 0;
        track.classList.add('is-dragging');
    });

    window.addEventListener('pointermove', function (e) {
        if (!down) return;
        track.scrollLeft = startLeft - (e.clientX - startX);
        vel = e.clientX - lastX;
        lastX = e.clientX;
    });

    function release() {
        if (!down) return;
        down = false;
        track.classList.remove('is-dragging');

        // Snap to the nearest card, with a small push from how fast you flicked
        var max = track.scrollWidth - track.clientWidth;
        var i = Math.round((track.scrollLeft - vel * 8) / step());
        i = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: Math.min(i * step(), max), behavior: reduced ? 'auto' : 'smooth' });
    }

    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
}());
