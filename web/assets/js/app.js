// Golden Hour: the header's frost, the banner slideshow and the photo strips.
// Everything here is an extra: without it the page still reads top to bottom.

(function () {
	const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// The header frosts once its sentinel scrolls away, with no scroll listener.
	const header = document.querySelector('[data-header]');
	const sentinel = document.querySelector('[data-sentinel]');
	if (header && sentinel && 'IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
		}).observe(sentinel);
	}

	// The banner: a cross-fade every eight seconds, paused on hover, focus or by its button.
	document.querySelectorAll('[data-hero]').forEach(function (hero) {
		const slides = hero.querySelectorAll('.hero__slide');
		const caps = hero.querySelectorAll('.hero__cap');
		const index = hero.querySelector('[data-hero-index]');
		const controls = hero.querySelector('.hero__controls');
		const pause = hero.querySelector('[data-hero-pause]');
		if (slides.length < 2) return;

		let current = 0;
		let timer = 0;
		let paused = still;
		let held = false;

		function show(n) {
			current = (n + slides.length) % slides.length;
			slides.forEach(function (el, i) {
				el.classList.toggle('is-active', i === current);
			});
			caps.forEach(function (el, i) {
				el.classList.toggle('is-active', i === current);
			});
			if (index) index.textContent = String(current + 1).padStart(2, '0');
		}

		function schedule() {
			clearTimeout(timer);
			if (!paused && !held) timer = setTimeout(next, 8000);
		}

		function next() {
			show(current + 1);
			schedule();
		}

		function setPaused(value) {
			paused = value;
			if (pause) {
				pause.setAttribute('aria-pressed', String(paused));
				pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
			}
			schedule();
		}

		hero.querySelector('[data-hero-prev]').addEventListener('click', function () {
			show(current - 1);
			schedule();
		});
		hero.querySelector('[data-hero-next]').addEventListener('click', next);
		if (pause) pause.addEventListener('click', function () {
			setPaused(!paused);
		});

		// Hovering or tabbing into the banner holds the slide still while it's read.
		hero.addEventListener('pointerenter', function () {
			held = true;
			schedule();
		});
		hero.addEventListener('pointerleave', function () {
			held = false;
			schedule();
		});
		hero.addEventListener('focusin', function () {
			held = true;
			schedule();
		});
		hero.addEventListener('focusout', function () {
			held = false;
			schedule();
		});

		// No point turning slides nobody can see.
		document.addEventListener('visibilitychange', function () {
			if (document.hidden) clearTimeout(timer);
			else schedule();
		});

		controls.hidden = false;
		setPaused(paused);
	});

	// Photo strips: native scroll-snap does the work; the buttons only step it.
	document.querySelectorAll('[data-strip]').forEach(function (strip) {
		const track = strip.querySelector('.strip__track');
		const controls = strip.querySelector('.strip__controls');
		if (!track || !controls) return;

		function step(direction) {
			const slide = track.querySelector('.strip__slide');
			const width = slide ? slide.getBoundingClientRect().width + 16 : track.clientWidth;
			track.scrollBy({ left: direction * width, behavior: still ? 'auto' : 'smooth' });
		}

		strip.querySelector('[data-strip-prev]').addEventListener('click', function () {
			step(-1);
		});
		strip.querySelector('[data-strip-next]').addEventListener('click', function () {
			step(1);
		});
		controls.hidden = false;
	});
})();
