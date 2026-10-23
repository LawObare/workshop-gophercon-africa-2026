// Jambo Safari Camp — Interactive Sky Dial, Bush Radio Synthesizer,
// Field Passport Stamps, Silhouette Bushcraft Quiz, and Canvas Biome Lab.
(function () {
	const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ==========================================================================
	   1. Jambo Safari Passport & Collectible Ink Stamps
	   ========================================================================== */
	const STAMP_KEYS = ['sky_watcher', 'meerkat', 'chameleon', 'hippo', 'silhouette_ranger', 'field_biologist'];
	const STAMP_NAMES = {
		sky_watcher: 'Sky Watcher · Circadian Horizon',
		meerkat: 'Keen Binoculars · Savanna Sentry',
		chameleon: 'Jackson’s Chameleon · Canopy Master',
		hippo: 'Waterhole Tracker · Mara River',
		silhouette_ranger: 'Silhouette Ranger · Bush Tracker',
		field_biologist: 'Field Biologist · Optical Lab'
	};

	function getPassportState() {
		try {
			return JSON.parse(localStorage.getItem('jambo_passport_v2') || '{}');
		} catch (e) {
			return {};
		}
	}

	function savePassportState(state) {
		try {
			localStorage.setItem('jambo_passport_v2', JSON.stringify(state));
		} catch (e) {}
	}

	function syncPassportUI() {
		const state = getPassportState();
		let count = 0;
		STAMP_KEYS.forEach(function (k) {
			if (state[k]) count++;
		});

		document.querySelectorAll('[data-passport-badge]').forEach(function (el) {
			el.textContent = count + '/' + STAMP_KEYS.length;
		});

		const summary = document.querySelector('[data-passport-summary]');
		if (summary) {
			summary.textContent = count + ' of ' + STAMP_KEYS.length + ' expedition stamps collected';
		}

		document.querySelectorAll('[data-stamp-slot]').forEach(function (slot) {
			const key = slot.getAttribute('data-stamp-slot');
			slot.classList.toggle('is-stamped', Boolean(state[key]));
		});
	}

	function awardStamp(id, customTitle) {
		if (!STAMP_NAMES[id]) return;
		const state = getPassportState();
		const isNew = !state[id];
		state[id] = true;
		savePassportState(state);
		syncPassportUI();

		let count = 0;
		STAMP_KEYS.forEach(function (k) {
			if (state[k]) count++;
		});
		showStampToast(customTitle || STAMP_NAMES[id], count, isNew);
	}

	function showStampToast(name, count, isNew) {
		let hud = document.getElementById('wildlife-tracker-hud');
		if (!hud) {
			hud = document.createElement('div');
			hud.id = 'wildlife-tracker-hud';
			hud.className = 'wildlife-tracker';
			document.body.appendChild(hud);
		}

		hud.innerHTML = `
			<div class="wildlife-tracker__badge">${count}/6</div>
			<div>
				<p class="wildlife-tracker__title">${isNew ? 'PASSPORT STAMPED!' : 'STAMP VERIFIED'}</p>
				<p class="wildlife-tracker__desc">${name}</p>
			</div>
		`;
		hud.classList.add('is-visible');

		clearTimeout(hud._timer);
		hud._timer = setTimeout(function () {
			hud.classList.remove('is-visible');
		}, 3800);
	}

	// Passport Modal Open / Close / Reset
	const passportDialog = document.getElementById('safari-passport');
	if (passportDialog) {
		document.querySelectorAll('[data-passport-open]').forEach(function (btn) {
			btn.addEventListener('click', function () {
				syncPassportUI();
				if (typeof passportDialog.showModal === 'function') {
					passportDialog.showModal();
				}
			});
		});

		document.querySelectorAll('[data-passport-close]').forEach(function (btn) {
			btn.addEventListener('click', function () {
				passportDialog.close();
			});
		});

		passportDialog.addEventListener('click', function (e) {
			if (e.target === passportDialog) passportDialog.close();
		});

		const resetBtn = passportDialog.querySelector('[data-passport-reset]');
		if (resetBtn) {
			resetBtn.addEventListener('click', function () {
				savePassportState({});
				syncPassportUI();
			});
		}
	}

	syncPassportUI();

	/* ==========================================================================
	   2. Built-in Natural 4-Minute Savanna Daylight Cycle & Starry Night Sky
	   ========================================================================== */
	const SKY_PHASES = [
		{ key: 'dawn', swahili: 'ALFAJIRI', label: 'SAVANNA DAWN', startHour: 5, spanHours: 3 },
		{ key: 'day', swahili: 'MCHANA', label: 'SAVANNA DAY', startHour: 8, spanHours: 8 },
		{ key: 'dusk', swahili: 'MACHWEO', label: 'CRIMSON DUSK', startHour: 16, spanHours: 4 },
		{ key: 'night', swahili: 'USIKU', label: 'STARRY NIGHT', startHour: 20, spanHours: 9 }
	];
	const CYCLE_DURATION_MS = 240000; // 4-minute (240,000ms) continuous 24-hour savanna solar cycle

	const skyRoot = document.querySelector('[data-savanna-sky]');
	const skyLayers = {
		dawn: skyRoot ? skyRoot.querySelector('.savanna-sky__layer--dawn') : null,
		day: skyRoot ? skyRoot.querySelector('.savanna-sky__layer--day') : null,
		dusk: skyRoot ? skyRoot.querySelector('.savanna-sky__layer--dusk') : null,
		night: skyRoot ? skyRoot.querySelector('.savanna-sky__layer--night') : null
	};
	const cosmosEl = skyRoot ? skyRoot.querySelector('.savanna-sky__cosmos') : null;
	const sunEl = document.querySelector('[data-sky-sun]');
	const moonEl = document.querySelector('[data-sky-moon]');
	const phaseLabelEl = document.querySelector('[data-sky-phase-label]');
	const progressFillEl = document.querySelector('[data-sky-progress]');

	let lastPhaseKey = document.documentElement.getAttribute('data-sky') || 'day';
	let lastClockText = '';
	let transitionsObserved = 0;
	let currentCosmosAlpha = 0;
	let starTimerId = null;
	let pageLoaded = document.readyState === 'complete';
	if (!pageLoaded) {
		window.addEventListener('load', function () {
			pageLoaded = true;
			syncStarLoopState();
		}, { once: true });
	}

	function formatSolarClock(phaseObj, localProgress) {
		const totalMinutes = Math.floor((phaseObj.startHour + phaseObj.spanHours * localProgress) * 60) % (24 * 60);
		const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
		const mm = String(totalMinutes % 60).padStart(2, '0');
		return hh + ':' + mm + ' ' + phaseObj.swahili + ' · ' + phaseObj.label;
	}

	function updateContinuousSkyState() {
		if (document.hidden) return;

		const elapsed = Date.now() % CYCLE_DURATION_MS;
		const cycleProgress = elapsed / CYCLE_DURATION_MS; // 0..1 continuously over 4 minutes
		const exactIndex = cycleProgress * SKY_PHASES.length;
		const phaseIdx = Math.floor(exactIndex) % SKY_PHASES.length;
		const localProgress = exactIndex - Math.floor(exactIndex);
		const phaseObj = SKY_PHASES[phaseIdx];

		// 1. Update dominant data-sky attribute for document tokens when crossing a solar quadrant
		if (phaseObj.key !== lastPhaseKey) {
			lastPhaseKey = phaseObj.key;
			document.documentElement.setAttribute('data-sky', phaseObj.key);
			transitionsObserved++;
			if (transitionsObserved === 1) {
				const st = getPassportState();
				if (!st.sky_watcher) {
					st.sky_watcher = true;
					savePassportState(st);
					syncPassportUI();
				}
			}
			document.querySelectorAll('[data-circadian-pick]').forEach(function (card) {
				card.classList.toggle('is-current-sky', card.getAttribute('data-circadian-pick') === phaseObj.key);
			});
		} else if (document.documentElement.getAttribute('data-sky') !== phaseObj.key) {
			document.documentElement.setAttribute('data-sky', phaseObj.key);
		}

		// 2. Seamless cosine cross-blending between adjacent sky layers (centers at 0.125, 0.375, 0.625, 0.875)
		const shifted = (cycleProgress - 0.125 + 1) % 1;
		const segFloat = shifted * 4;
		const fromIdx = Math.floor(segFloat) % 4;
		const toIdx = (fromIdx + 1) % 4;
		const rawBlend = segFloat - Math.floor(segFloat);
		const smoothBlend = 0.5 - 0.5 * Math.cos(rawBlend * Math.PI);

		const fromKey = SKY_PHASES[fromIdx].key;
		const toKey = SKY_PHASES[toIdx].key;

		SKY_PHASES.forEach(function (p) {
			const layer = skyLayers[p.key];
			if (!layer) return;
			if (p.key === fromKey) {
				layer.style.zIndex = '1';
				layer.style.opacity = '1';
			} else if (p.key === toKey) {
				layer.style.zIndex = '2';
				layer.style.opacity = smoothBlend.toFixed(3);
			} else {
				layer.style.zIndex = '0';
				layer.style.opacity = '0';
			}
		});

		// 3. Continuous slow pace for the Sun across the screen (0.0 Dawn rise through Day to 0.75 Dusk set)
		// Uses composite-only translate3d() + scale() + opacity (zero main-thread layout or paint)
		if (sunEl) {
			if (cycleProgress <= 0.75) {
				const sunT = cycleProgress / 0.75; // 0..1 at a constant slow pace over 3 minutes
				const sunX = 4 + sunT * 92; // 4vw (east) -> 96vw (west)
				const arcSin = Math.sin(sunT * Math.PI);
				const sunY = 86 - arcSin * 72; // 86vh (horizon) -> 14vh (zenith) -> 86vh (horizon)
				const sunAlpha = Math.pow(Math.max(0, arcSin), 0.36);
				const sunScale = 1.24 - 0.28 * arcSin;

				sunEl.style.opacity = sunAlpha.toFixed(3);
				sunEl.style.transform =
					'translate3d(' + sunX.toFixed(2) + 'vw, ' + sunY.toFixed(2) + 'vh, 0) translate(-50%, -50%) scale(' + sunScale.toFixed(3) + ')';
			} else {
				sunEl.style.opacity = '0';
			}
		}

		// 4. Continuous slow pace for the Crescent Moon & Starry Cosmos (0.62 Dusk twilight -> Night -> 0.13 Dawn)
		const nightSpan = 0.51; // 0.62 .. 1.00 .. 0.13
		const nightOffset = (cycleProgress - 0.62 + 1) % 1;
		if (nightOffset <= nightSpan) {
			const moonT = nightOffset / nightSpan; // 0..1 at a constant slow pace across the night sky
			const moonArc = Math.sin(moonT * Math.PI);
			const moonX = 12 + moonT * 76; // 12vw -> 88vw
			const moonY = 74 - moonArc * 60; // 74vh -> 14vh -> 74vh
			const moonAlpha = Math.pow(Math.max(0, moonArc), 0.45) * 0.96;
			currentCosmosAlpha = Math.pow(Math.max(0, moonArc), 0.55);

			if (moonEl) {
				moonEl.style.opacity = moonAlpha.toFixed(3);
				moonEl.style.transform =
					'translate3d(' + moonX.toFixed(2) + 'vw, ' + moonY.toFixed(2) + 'vh, 0) translate(-50%, -50%)';
			}
			if (cosmosEl) {
				cosmosEl.style.opacity = currentCosmosAlpha.toFixed(3);
			}
		} else {
			currentCosmosAlpha = 0;
			if (moonEl) moonEl.style.opacity = '0';
			if (cosmosEl) cosmosEl.style.opacity = '0';
		}

		// 5. Update telemetry readout & progress bar
		const clockStr = formatSolarClock(phaseObj, localProgress);
		if (phaseLabelEl && clockStr !== lastClockText) {
			lastClockText = clockStr;
			phaseLabelEl.textContent = clockStr;
		}
		if (progressFillEl) {
			progressFillEl.style.width = (cycleProgress * 100).toFixed(1) + '%';
		}

		syncStarLoopState();
	}

	// Clicking a 24-Hour Circadian Card filters #sightings by that solar window (without overriding the natural sky cycle)
	document.querySelectorAll('[data-circadian-pick]').forEach(function (card) {
		card.addEventListener('click', function () {
			const lightLabel = card.getAttribute('data-circadian-label');
			document.querySelectorAll('[data-circadian-pick]').forEach(function (c) {
				c.classList.toggle('is-selected', c === card);
			});

			const filterForm = document.querySelector('form[data-filter="sightings-list"]');
			if (filterForm && lightLabel) {
				filterForm.querySelectorAll('input[name="light"]').forEach(function (box) {
					box.checked = box.value === lightLabel;
				});
				filterForm.dispatchEvent(new Event('input', { bubbles: true }));
			}

			const target = document.getElementById('sightings');
			if (target) {
				target.scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
			}
		});
	});

	// Migratory storks stamp trigger
	document.querySelectorAll('[data-stamp-trigger="dawn_tracker"]').forEach(function (el) {
		el.addEventListener('click', function () {
			awardStamp('sky_watcher');
		});
	});

	// Optimized Starry Savanna Night Sky Canvas:
	// - Static background starfield is pre-rendered once onto an offscreen canvas (`staticCanvas`)
	// - Only ~20 bright navigational beacon stars twinkle per tick (~15fps), and ONLY while the night cosmos is visible
	const skyCanvas = document.querySelector('[data-sky-canvas]');
	let renderStarFrame = null;

	function syncStarLoopState() {
		if (!renderStarFrame || still) return;
		const shouldRun = pageLoaded && currentCosmosAlpha > 0.01 && !document.hidden;
		if (shouldRun && !starTimerId) {
			renderStarFrame();
			starTimerId = setInterval(renderStarFrame, 66); // ~15fps lightweight twinkle only at dusk/night/dawn
		} else if (!shouldRun && starTimerId) {
			clearInterval(starTimerId);
			starTimerId = null;
		}
	}

	if (skyCanvas && skyCanvas.getContext) {
		const ctx = skyCanvas.getContext('2d');
		const staticCanvas = document.createElement('canvas');
		const staticCtx = staticCanvas.getContext('2d');
		let width = 0;
		let height = 0;
		const beaconStars = [];
		let shootingStar = null;

		const STAR_PALETTE = [
			'255, 253, 246', // Pure starlight ivory
			'212, 232, 255', // Rigel blue-white
			'255, 224, 178', // Savanna amber-gold
			'255, 206, 188', // Antares warm rose
			'232, 242, 255'  // Southern Cross crisp white-blue
		];

		function buildStars() {
			beaconStars.length = 0;
			staticCtx.clearRect(0, 0, width, height);

			const count = Math.min(240, Math.max(140, Math.floor((width * height) / 6500)));
			for (let i = 0; i < count; i++) {
				const inBand = i % 4 === 0;
				let nx = Math.random();
				let ny = Math.pow(Math.random(), 1.18) * 0.92;
				if (inBand) {
					nx = Math.min(0.98, Math.max(0.02, nx));
					ny = Math.min(0.88, Math.max(0.03, 0.62 - nx * 0.36 + (Math.random() - 0.5) * 0.24));
				}
				const x = nx * width;
				const y = ny * height;
				const rgb = STAR_PALETTE[i % STAR_PALETTE.length];

				if (i < 22) {
					// Bright twinkling navigational stars
					beaconStars.push({
						x: x,
						y: y,
						r: 1.35 + Math.random() * 0.85,
						baseAlpha: 0.72 + Math.random() * 0.26,
						speed: 0.8 + Math.random() * 1.8,
						phase: Math.random() * Math.PI * 2,
						rgb: rgb,
						hasSpikes: i < 10
					});
				} else {
					// Pre-rendered static background starfield (drawn once onto offscreen canvas)
					const r = 0.55 + Math.random() * 1.05;
					const alpha = 0.28 + Math.random() * 0.58;
					staticCtx.fillStyle = 'rgba(' + rgb + ', ' + alpha.toFixed(3) + ')';
					staticCtx.beginPath();
					staticCtx.arc(x, y, r, 0, Math.PI * 2);
					staticCtx.fill();
				}
			}
		}

		function resizeSkyCanvas() {
			width = window.innerWidth;
			height = window.innerHeight;
			skyCanvas.width = width;
			skyCanvas.height = height;
			staticCanvas.width = width;
			staticCanvas.height = height;
			buildStars();
			if (renderStarFrame && currentCosmosAlpha > 0.01) {
				renderStarFrame();
			}
		}

		renderStarFrame = function () {
			if (currentCosmosAlpha <= 0.01 || document.hidden) return;

			ctx.clearRect(0, 0, width, height);
			ctx.drawImage(staticCanvas, 0, 0);

			const t = performance.now() * 0.001;
			for (let i = 0; i < beaconStars.length; i++) {
				const s = beaconStars[i];
				const twinkle = still ? 1 : (0.62 + 0.38 * Math.sin(t * s.speed + s.phase));
				const alpha = Math.max(0.12, Math.min(1, s.baseAlpha * twinkle));

				ctx.fillStyle = 'rgba(' + s.rgb + ', ' + alpha.toFixed(3) + ')';
				ctx.beginPath();
				ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
				ctx.fill();

				if (s.hasSpikes && alpha > 0.62) {
					const spike = s.r * 3.4;
					ctx.strokeStyle = 'rgba(' + s.rgb + ', ' + (alpha * 0.34).toFixed(3) + ')';
					ctx.lineWidth = 0.65;
					ctx.beginPath();
					ctx.moveTo(s.x - spike, s.y);
					ctx.lineTo(s.x + spike, s.y);
					ctx.moveTo(s.x, s.y - spike);
					ctx.lineTo(s.x, s.y + spike);
					ctx.stroke();
				}
			}

			// Occasional shooting star streaking across the starry savanna night
			if (!still && currentCosmosAlpha > 0.55) {
				if (!shootingStar && Math.random() < 0.012) {
					shootingStar = {
						x: (0.2 + Math.random() * 0.65) * width,
						y: (0.06 + Math.random() * 0.32) * height,
						vx: -(14 + Math.random() * 10),
						vy: 5.5 + Math.random() * 5,
						life: 0,
						maxLife: 12 + Math.floor(Math.random() * 6)
					};
				}
				if (shootingStar) {
					shootingStar.x += shootingStar.vx;
					shootingStar.y += shootingStar.vy;
					shootingStar.life++;
					const p = shootingStar.life / shootingStar.maxLife;
					const fade = Math.sin(p * Math.PI);
					const tailX = shootingStar.x - shootingStar.vx * 3.2;
					const tailY = shootingStar.y - shootingStar.vy * 3.2;

					ctx.strokeStyle = 'rgba(255, 252, 240, ' + (0.85 * fade).toFixed(3) + ')';
					ctx.lineWidth = 1.3;
					ctx.beginPath();
					ctx.moveTo(shootingStar.x, shootingStar.y);
					ctx.lineTo(tailX, tailY);
					ctx.stroke();

					if (shootingStar.life >= shootingStar.maxLife) {
						shootingStar = null;
					}
				}
			}
		};

		let resizeTimer = null;
		window.addEventListener('resize', function () {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(resizeSkyCanvas, 150);
		});
		resizeSkyCanvas();
	}

	// Initialize current sky quadrant highlight and run continuous 200ms (5Hz) compositor-interpolated loop
	document.querySelectorAll('[data-circadian-pick]').forEach(function (card) {
		card.classList.toggle('is-current-sky', card.getAttribute('data-circadian-pick') === lastPhaseKey);
	});
	updateContinuousSkyState();
	setInterval(updateContinuousSkyState, still ? 1000 : 200);
	document.addEventListener('visibilitychange', function () {
		if (!document.hidden) {
			updateContinuousSkyState();
		}
		syncStarLoopState();
	});

	// Clicking a country in the 3D Globe list jumps to and filters #sightings by country
	document.querySelectorAll('[data-country-jump]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			const country = btn.getAttribute('data-country-jump');
			const filterForm = document.querySelector('form[data-filter="sightings-list"]');
			if (filterForm && country) {
				filterForm.querySelectorAll('input[name="country"]').forEach(function (box) {
					box.checked = box.value === country;
				});
				filterForm.dispatchEvent(new Event('input', { bubbles: true }));
			}
			const target = document.getElementById('sightings');
			if (target) {
				target.scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
			}
		});
	});

	/* ==========================================================================
	   3. Web Audio API "Bush Radio" Ambient Soundscape Synthesizer
	   ========================================================================== */
	let audioCtx = null;
	let soundPlaying = false;
	let windGain = null;
	let chirpTimer = null;

	function startBushRadio() {
		const AudioContextClass = window.AudioContext || window.webkitAudioContext;
		if (!AudioContextClass) return;
		if (!audioCtx) {
			audioCtx = new AudioContextClass();
		}
		if (audioCtx.state === 'suspended') {
			audioCtx.resume();
		}

		// Warm filtered savanna breeze using pink-ish noise buffer
		const bufferSize = audioCtx.sampleRate * 2;
		const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
		const output = noiseBuffer.getChannelData(0);
		let b0 = 0, b1 = 0, b2 = 0;
		for (let i = 0; i < bufferSize; i++) {
			const white = Math.random() * 2 - 1;
			b0 = 0.997 * b0 + white * 0.029;
			b1 = 0.985 * b1 + white * 0.032;
			b2 = 0.950 * b2 + white * 0.048;
			output[i] = (b0 + b1 + b2) * 0.25;
		}

		const whiteNoise = audioCtx.createBufferSource();
		whiteNoise.buffer = noiseBuffer;
		whiteNoise.loop = true;

		const filter = audioCtx.createBiquadFilter();
		filter.type = 'bandpass';
		filter.frequency.value = 340;
		filter.Q.value = 1.8;

		windGain = audioCtx.createGain();
		windGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
		windGain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.8);

		whiteNoise.connect(filter);
		filter.connect(windGain);
		windGain.connect(audioCtx.destination);
		whiteNoise.start();
		windGain._source = whiteNoise;

		// Periodic gentle bird call (day/dawn) or cricket pulse (dusk/night)
		function playNatureNote() {
			if (!soundPlaying || !audioCtx) return;
			const sky = document.documentElement.getAttribute('data-sky') || 'day';
			const now = audioCtx.currentTime;
			const osc = audioCtx.createOscillator();
			const g = audioCtx.createGain();

			if (sky === 'night' || sky === 'dusk') {
				// Soft nocturnal cricket trill
				osc.type = 'sine';
				osc.frequency.setValueAtTime(3600, now);
				osc.frequency.setValueAtTime(3750, now + 0.06);
				g.gain.setValueAtTime(0.0001, now);
				g.gain.linearRampToValueAtTime(0.012, now + 0.03);
				g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
				osc.connect(g);
				g.connect(audioCtx.destination);
				osc.start(now);
				osc.stop(now + 0.2);
			} else {
				// Gentle savanna weaver-bird flute note
				osc.type = 'sine';
				const base = 1150 + Math.random() * 480;
				osc.frequency.setValueAtTime(base, now);
				osc.frequency.exponentialRampToValueAtTime(base * 1.18, now + 0.09);
				osc.frequency.exponentialRampToValueAtTime(base * 0.92, now + 0.22);
				g.gain.setValueAtTime(0.0001, now);
				g.gain.linearRampToValueAtTime(0.018, now + 0.04);
				g.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
				osc.connect(g);
				g.connect(audioCtx.destination);
				osc.start(now);
				osc.stop(now + 0.28);
			}
		}

		playNatureNote();
		chirpTimer = setInterval(playNatureNote, 3200);
	}

	function stopBushRadio() {
		clearInterval(chirpTimer);
		if (windGain && audioCtx) {
			try {
				windGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
				setTimeout(function () {
					if (windGain && windGain._source) windGain._source.stop();
				}, 280);
			} catch (e) {}
		}
	}

	document.querySelectorAll('[data-sound-toggle]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			soundPlaying = !soundPlaying;
			btn.setAttribute('aria-pressed', String(soundPlaying));
			btn.classList.toggle('is-playing', soundPlaying);
			const label = btn.querySelector('[data-sound-label]');
			if (label) label.textContent = soundPlaying ? 'Bush Radio: On' : 'Bush Radio';
			if (soundPlaying) startBushRadio();
			else stopBushRadio();
		});
	});

	/* ==========================================================================
	   4. Field Scout & Safari Creature Easter Eggs
	   ========================================================================== */
	const scout = document.querySelector('[data-monkey]');
	if (scout) {
		const bubbleText = scout.querySelector('[data-monkey-text]');
		const eyes = scout.querySelectorAll('.monkey__eye');

		const fieldNotes = [
			"Jambo! Watch the savanna sky overhead cycle naturally through crimson dawn, sunlit day, fiery dusk, and starry night.",
			"Did you know? Cheetahs hunt during Daylight and Golden Hour to avoid nocturnal lions and hyenas.",
			"Click any phase on the 24-Hour Savanna Meridian to filter sightings recorded during that solar window!",
			"Head to Track & Spot to play 'Whose Silhouette in the Tall Grass?' with real field photos.",
			"Every sighting card carries a real country postmark, GPS coordinates, and Open-Meteo weather!",
			"Open your Safari Passport in the top bar to see how many of the 6 ink stamps you've earned."
		];

		if (!still && eyes.length) {
			window.addEventListener('pointermove', function (e) {
				const rect = scout.getBoundingClientRect();
				const dx = e.clientX - (rect.left + rect.width / 2);
				const dy = e.clientY - (rect.top + rect.height / 2);
				const angle = Math.atan2(dy, dx);
				const dist = Math.min(2.2, Math.hypot(dx, dy) / 90);
				const ex = Math.cos(angle) * dist;
				const ey = Math.sin(angle) * dist;
				eyes.forEach(function (eye) {
					eye.style.transform = `translate(${ex}px, ${ey}px)`;
				});
			});
		}

		scout.addEventListener('click', function (e) {
			e.stopPropagation();
			scout.classList.toggle('is-talking');
			if (bubbleText) {
				bubbleText.textContent = fieldNotes[Math.floor(Math.random() * fieldNotes.length)];
			}
			awardStamp('meerkat', 'Ranger Field Scout · Briefing Read');
		});

		document.addEventListener('click', function (e) {
			if (!scout.contains(e.target)) {
				scout.classList.remove('is-talking');
			}
		});
	}

	const chameleon = document.querySelector('[data-chameleon]');
	if (chameleon) {
		const colors = ['#285434', '#D96B27', '#D99316', '#9B3B2A', '#3B6E8C', '#6B8E23'];
		let colorIdx = 0;
		chameleon.addEventListener('click', function () {
			colorIdx = (colorIdx + 1) % colors.length;
			chameleon.style.setProperty('--chameleon-color', colors[colorIdx]);
			awardStamp('chameleon');
		});
	}

	document.querySelectorAll('[data-meerkat]').forEach(function (el) {
		el.addEventListener('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			awardStamp('meerkat');
		});
	});

	document.querySelectorAll('[data-hippo]').forEach(function (el) {
		el.addEventListener('click', function (e) {
			e.stopPropagation();
			awardStamp('hippo');
		});
	});

	/* ==========================================================================
	   5. "Whose Silhouette in the Tall Grass?" Interactive Quiz on /spot
	   ========================================================================== */
	function getAnimalSilhouettePaths(animalName, scientificName) {
		const text = ((animalName || '') + ' ' + (scientificName || '')).toLowerCase();

		// Giraffe
		if (text.includes('giraffe') || text.includes('giraffa')) {
			return `<path d="M150 250 L150 185 L138 175 L138 250 L128 250 L128 160 C128 145 142 138 165 132 L212 52 L206 42 L214 40 L218 47 L224 40 L230 44 L224 52 L242 58 C246 61 244 67 236 67 L222 65 L192 142 C202 150 206 164 204 182 L204 250 L194 250 L194 186 L182 186 L182 250 L172 250 L172 182 L158 184 L158 250 Z M204 155 Q218 175 214 208" />`;
		}
		// Elephant
		if (text.includes('elephant') || text.includes('loxodonta') || text.includes('elephas')) {
			return `<path d="M105 250 L105 192 C96 175 96 140 116 122 C136 106 178 104 205 116 C220 98 248 96 264 112 C278 126 282 150 282 178 C282 195 290 202 298 194 C303 189 308 194 302 204 C292 216 274 212 270 190 L266 168 C258 178 244 182 232 174 L232 250 L210 250 L210 194 L182 194 L182 250 L160 250 L160 192 L130 192 L130 250 Z M268 162 Q292 164 302 152 Q286 172 266 170 Z" />`;
		}
		// Rhinoceros
		if (text.includes('rhino') || text.includes('diceros') || text.includes('ceratotherium')) {
			return `<path d="M98 250 L102 195 C92 176 98 142 124 130 C152 118 196 120 222 132 L232 118 L238 124 L246 118 L248 128 C262 134 274 144 282 152 L296 126 C299 136 298 150 292 160 L308 142 C310 156 304 172 292 180 C276 188 256 186 242 178 L238 250 L216 250 L214 194 L176 194 L174 250 L152 250 L152 192 L122 194 L120 250 Z" />`;
		}
		// Lion
		if (text.includes('lion') || text.includes('panthera leo')) {
			return `<path d="M92 202 Q72 196 68 176 Q66 166 74 166 Q76 184 96 190 L108 154 C126 144 168 144 196 146 C206 122 228 108 252 112 C272 114 288 130 292 148 C296 164 284 182 266 188 C254 194 238 192 228 184 L224 250 L206 250 L204 192 L152 192 L146 250 L128 250 L130 196 L112 250 L96 250 Z" />`;
		}
		// Zebra / Equus
		if (text.includes('zebra') || text.includes('equus')) {
			return `<path d="M108 250 L114 188 Q96 198 90 218 Q86 200 104 176 C106 154 124 142 152 142 L198 142 L226 96 L222 82 L230 86 L236 80 L238 92 L264 112 C268 118 262 126 252 124 L232 118 L214 162 C218 174 218 186 214 198 L214 250 L198 250 L198 192 L154 192 L148 250 L132 250 L134 192 L122 250 Z" />`;
		}
		// Hippopotamus / Capybara / Wombat
		if (text.includes('hippo') || text.includes('capybara') || text.includes('wombat') || text.includes('hydrochoerus') || text.includes('vombatus')) {
			return `<path d="M96 250 L98 196 C88 176 96 142 126 132 C160 122 206 124 232 138 L238 126 L246 132 C266 132 288 140 296 156 C302 172 292 190 272 192 C256 194 242 188 232 182 L230 250 L208 250 L206 198 L166 198 L164 250 L142 250 L142 198 L118 198 L116 250 Z" />`;
		}
		// Buffalo / Bison / Wildebeest
		if (text.includes('buffalo') || text.includes('bison') || text.includes('wildebeest') || text.includes('syncerus') || text.includes('connochaetes')) {
			return `<path d="M102 250 L108 190 C98 168 108 138 134 132 C158 128 184 114 212 114 C232 114 246 124 256 136 C248 114 262 96 280 98 C268 106 264 120 272 132 C284 140 292 156 284 172 C276 184 258 186 244 176 L234 194 L232 250 L212 250 L210 194 L164 194 L158 250 L140 250 L142 194 L120 250 Z" />`;
		}
		// Impala / Antelope / Moose
		if (text.includes('impala') || text.includes('moose') || text.includes('aepyceros') || text.includes('alces')) {
			return `<path d="M116 250 L124 188 C118 168 128 148 152 146 L204 144 L224 102 C210 82 208 62 220 48 C216 64 220 82 232 96 L238 92 C230 76 232 58 244 46 C238 62 238 80 246 96 L268 106 C272 112 266 118 256 116 L238 114 L218 162 L218 250 L204 250 L204 186 L156 186 L148 250 L134 250 Z" />`;
		}
		// Warthog
		if (text.includes('warthog') || text.includes('phacochoerus')) {
			return `<path d="M108 182 L94 124 L100 120 L114 174 C128 152 166 144 206 148 C226 150 248 158 264 172 L278 154 C280 164 276 176 268 182 C260 190 242 190 226 184 L222 250 L206 250 L204 194 L162 194 L158 250 L142 250 L144 194 L124 250 L110 250 Z" />`;
		}
		// Flamingo / Shoebill
		if (text.includes('flamingo') || text.includes('shoebill') || text.includes('phoenicopterus') || text.includes('balaeniceps')) {
			return `<path d="M186 250 L186 172 C156 170 134 154 130 134 C136 122 164 116 202 124 C216 104 224 78 216 58 C210 46 218 36 232 40 C244 44 248 56 242 64 C236 56 228 52 224 58 C234 80 228 112 212 138 C218 150 214 164 202 170 L202 250 L194 250 L194 172 L192 172 L192 250 Z" />`;
		}
		// Penguin / Puffin
		if (text.includes('penguin') || text.includes('puffin') || text.includes('aptenodytes') || text.includes('pygoscelis') || text.includes('spheniscus') || text.includes('fratercula')) {
			return `<path d="M168 250 L172 222 C156 204 154 156 166 118 C172 94 184 74 202 74 C216 74 226 84 232 90 L254 94 C244 102 234 104 228 104 C238 134 242 176 230 216 L234 250 Z M164 134 Q142 166 150 194 Q162 174 168 148 Z" />`;
		}
		// Eagle / Owl / Macaw / Bird
		if (text.includes('eagle') || text.includes('owl') || text.includes('macaw') || text.includes('haliaeetus') || text.includes('bubo') || text.includes('ara ')) {
			return `<path d="M162 246 L176 206 C152 190 136 154 148 116 C156 88 176 70 198 70 C218 70 232 82 238 96 L252 102 C246 110 238 112 232 110 C244 140 240 180 220 206 L234 246 Z M148 124 Q102 98 76 118 Q106 148 146 158 Z M234 124 Q282 98 312 118 Q280 148 236 158 Z" />`;
		}
		// Whale / Orca / Beluga / Narwhal
		if (text.includes('whale') || text.includes('orca') || text.includes('beluga') || text.includes('narwhal') || text.includes('balaen') || text.includes('megaptera') || text.includes('physeter') || text.includes('orcinus') || text.includes('eschrichtius') || text.includes('delphinapterus') || text.includes('monodon')) {
			return `<path d="M64 196 C88 146 152 118 222 126 L238 96 C244 110 246 122 244 130 C278 138 306 156 322 176 L352 152 C348 172 338 186 326 192 L348 214 C330 212 314 202 306 192 C256 212 164 218 64 196 Z" />`;
		}
		// Dolphin / Shark
		if (text.includes('dolphin') || text.includes('shark') || text.includes('tursiops') || text.includes('delphinus') || text.includes('stenella') || text.includes('grampus') || text.includes('lagenorhynchus') || text.includes('inia') || text.includes('carcharodon') || text.includes('rhincodon')) {
			return `<path d="M74 204 C106 142 172 114 238 128 L258 88 C262 106 260 122 256 134 C288 146 312 168 326 188 L354 166 C346 186 336 198 324 202 L342 224 C324 218 312 208 304 198 C258 182 168 176 74 204 Z" />`;
		}
		// Crocodile / Alligator / Gharial / Komodo Dragon
		if (text.includes('crocodil') || text.includes('alligator') || text.includes('gharial') || text.includes('komodo') || text.includes('gavialis') || text.includes('varanus')) {
			return `<path d="M52 224 Q96 202 142 192 L152 184 L162 192 L172 184 L182 192 C214 188 248 186 276 190 L344 184 C348 190 342 196 328 198 L284 202 L338 208 C336 214 320 216 276 212 C244 218 206 220 168 218 L162 246 L146 246 L148 218 C114 220 82 224 52 224 Z" />`;
		}
		// Kangaroo
		if (text.includes('kangaroo') || text.includes('macropus')) {
			return `<path d="M82 246 Q124 238 156 208 C154 184 166 156 188 140 L212 96 L208 78 L218 86 L228 76 L228 92 L248 102 C250 108 242 114 232 112 L218 110 L206 148 L224 156 L220 164 L202 158 C206 178 202 198 190 212 L222 246 L196 246 L174 218 C144 238 112 248 82 246 Z" />`;
		}
		// Bear / Panda / Koala
		if (text.includes('bear') || text.includes('panda') || text.includes('koala') || text.includes('ursus') || text.includes('ailuropoda') || text.includes('ailurus') || text.includes('phascolarctos')) {
			return `<path d="M102 250 L106 194 C94 172 104 134 136 122 C166 112 204 116 232 130 L238 116 C244 114 250 118 250 126 C268 130 286 142 292 156 C296 168 286 180 268 182 C254 184 242 180 232 174 L230 250 L206 250 L204 196 L166 196 L164 250 L140 250 L140 196 L124 250 Z" />`;
		}
		// Gorilla / Chimpanzee / Orangutan / Lemur / Sloth
		if (text.includes('gorilla') || text.includes('chimpanzee') || text.includes('orangutan') || text.includes('lemur') || text.includes('sloth') || text.includes('pan ') || text.includes('pongo') || text.includes('bradypus') || text.includes('choloepus')) {
			return `<path d="M118 250 L124 192 C112 168 120 132 148 118 C174 104 208 108 228 126 C234 106 252 96 268 104 C282 112 286 134 276 150 C268 162 256 166 246 164 L254 250 L232 250 L224 184 L168 190 L164 250 L142 250 Z" />`;
		}
		// Turtle / Seal / Walrus / Sea Otter / Platypus
		if (text.includes('turtle') || text.includes('leatherback') || text.includes('seal') || text.includes('walrus') || text.includes('otter') || text.includes('platypus') || text.includes('chelonia') || text.includes('dermochelys') || text.includes('phoca') || text.includes('hydrurga') || text.includes('odobenus') || text.includes('enhydra') || text.includes('ornithorhynchus')) {
			return `<path d="M84 218 C108 176 158 154 214 162 C236 148 258 132 276 136 C292 140 298 156 288 172 C278 184 264 190 248 192 L282 218 C258 222 234 216 216 206 C172 218 124 222 84 218 Z" />`;
		}
		// Default Big Cat / Savanna Predator (Cheetah, Leopard, Jaguar, Puma, Tiger, Hyena, Wild Dog)
		return `<path d="M76 206 Q56 196 58 172 Q64 172 68 190 Q82 198 104 182 C112 158 134 146 166 146 L218 146 C228 128 244 116 262 118 C278 120 290 132 292 146 C294 158 282 168 266 168 C254 168 244 164 236 158 L226 188 L232 250 L214 250 L210 192 L152 192 L144 250 L126 250 L132 192 L108 250 L92 250 Z" />`;
	}

	const quizEl = document.querySelector('[data-silhouette-game]');
	const quizDataEl = document.getElementById('safari-quiz-data');
	if (quizEl && quizDataEl) {
		let pool = [];
		try {
			const parsed = JSON.parse(quizDataEl.textContent);
			pool = typeof parsed === 'string' ? JSON.parse(parsed) : (parsed || []);
		} catch (e) {
			pool = [];
		}

		if (Array.isArray(pool) && pool.length >= 4) {
			const frame = quizEl.querySelector('[data-quiz-frame]');
			const img = quizEl.querySelector('[data-quiz-img]');
			const outlineGroup = quizEl.querySelector('[data-quiz-outline]');
			const badge = quizEl.querySelector('[data-quiz-badge]');
			const countryEl = quizEl.querySelector('[data-quiz-country]');
			const lightEl = quizEl.querySelector('[data-quiz-light]');
			const weatherEl = quizEl.querySelector('[data-quiz-weather]');
			const promptEl = quizEl.querySelector('[data-quiz-prompt]');
			const choicesEl = quizEl.querySelector('[data-quiz-choices]');
			const streakEl = quizEl.querySelector('[data-quiz-streak]');
			const revealBtn = quizEl.querySelector('[data-quiz-reveal]');
			const nextBtn = quizEl.querySelector('[data-quiz-next]');
			const recordLink = quizEl.querySelector('[data-quiz-record]');

			let currentIdx = 0;
			let streak = 0;
			let answered = false;

			function shuffle(arr) {
				const a = arr.slice();
				for (let i = a.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					const tmp = a[i];
					a[i] = a[j];
					a[j] = tmp;
				}
				return a;
			}

			// Shuffle the quiz pool so every session feels fresh
			pool = shuffle(pool);

			function loadRound(idx) {
				answered = false;
				if (idx >= pool.length) {
					pool = shuffle(pool);
					idx = 0;
				}
				currentIdx = idx % pool.length;
				const target = pool[currentIdx];

				frame.classList.add('is-masked');
				frame.classList.remove('is-photo-fallback');

				if (outlineGroup) {
					outlineGroup.innerHTML = getAnimalSilhouettePaths(target.animal, target.scientific);
				}

				if (img) {
					if (target.photoUrl) {
						img.onload = function () {
							frame.classList.remove('is-photo-fallback');
						};
						img.onerror = function () {
							frame.classList.add('is-photo-fallback');
						};
						img.src = target.photoUrl;
					} else {
						frame.classList.add('is-photo-fallback');
						img.removeAttribute('src');
					}
				}

				if (badge) badge.textContent = 'UNCLASSIFIED NEGATIVE · ROUND ' + (currentIdx + 1) + '/' + pool.length;
				if (countryEl) countryEl.textContent = target.country || 'East Africa';
				if (lightEl) lightEl.textContent = target.light || 'Daylight';
				if (weatherEl) weatherEl.textContent = target.weather || 'Clear sky';
				if (promptEl) promptEl.textContent = 'Use the field clues and outline in the tall grass to identify this wild animal:';
				if (revealBtn) revealBtn.disabled = false;
				if (recordLink) {
					recordLink.href = target.url || '/spot';
					recordLink.hidden = true;
				}

				// Pick 3 distinct distractors
				const seenNames = new Set([target.animal.toLowerCase()]);
				const distractors = [];
				const shuffledOthers = shuffle(pool);
				for (let i = 0; i < shuffledOthers.length && distractors.length < 3; i++) {
					const candidate = shuffledOthers[i];
					const key = (candidate.animal || '').toLowerCase();
					if (key && !seenNames.has(key)) {
						seenNames.add(key);
						distractors.push(candidate);
					}
				}
				const options = shuffle([target].concat(distractors));

				choicesEl.innerHTML = '';
				options.forEach(function (opt) {
					const btn = document.createElement('button');
					btn.type = 'button';
					btn.className = 'silhouette-choice press';
					btn.textContent = opt.animal;
					btn.addEventListener('click', function () {
						if (answered) return;
						answered = true;
						frame.classList.remove('is-masked');
						if (revealBtn) revealBtn.disabled = true;
						if (recordLink) recordLink.hidden = false;

						const isCorrect = opt.animal.toLowerCase() === target.animal.toLowerCase();
						if (isCorrect) {
							streak++;
							btn.classList.add('is-correct');
							if (badge) badge.textContent = 'SPOTTED · ' + target.animal.toUpperCase();
							if (promptEl) promptEl.textContent = 'Sharp eyes! ' + target.animal + ' (' + target.scientific + ') observed by ' + target.observer + ' in ' + target.country + '.';
							awardStamp('silhouette_ranger');
						} else {
							streak = 0;
							btn.classList.add('is-wrong');
							if (badge) badge.textContent = target.animal.toUpperCase();
							if (promptEl) promptEl.textContent = 'Close! That outline belongs to the ' + target.animal + ' (' + target.scientific + ').';
							Array.from(choicesEl.children).forEach(function (c) {
								if (c.textContent.toLowerCase() === target.animal.toLowerCase()) {
									c.classList.add('is-correct');
								}
							});
						}
						if (streakEl) streakEl.textContent = String(streak);
					});
					choicesEl.appendChild(btn);
				});
			}

			if (revealBtn) {
				revealBtn.addEventListener('click', function () {
					if (answered) return;
					const target = pool[currentIdx];
					answered = true;
					streak = 0;
					if (streakEl) streakEl.textContent = '0';
					revealBtn.disabled = true;
					frame.classList.remove('is-masked');
					Array.from(choicesEl.children).forEach(function (c) {
						if (c.textContent.toLowerCase() === target.animal.toLowerCase()) {
							c.classList.add('is-correct');
						}
					});
					if (badge) badge.textContent = 'REVEALED · ' + target.animal.toUpperCase();
					if (promptEl) promptEl.textContent = 'Revealed: ' + target.animal + ' (' + target.scientific + '), spotted in ' + target.country + '.';
					if (recordLink) recordLink.hidden = false;
				});
			}

			if (nextBtn) {
				nextBtn.addEventListener('click', function () {
					loadRound(currentIdx + 1);
				});
			}

			loadRound(0);
		}
	}

	/* ==========================================================================
	   6. Real HTML5 Canvas Biome Palette & Light Analyzer on /spot
	   ========================================================================== */
	const dropzone = document.querySelector('[data-spot-dropzone]');
	const fileInput = document.querySelector('[data-spot-file]');
	const scanner = document.querySelector('[data-spot-scanner]');
	const previewImg = document.querySelector('[data-spot-preview]');
	const viewport = document.querySelector('[data-spot-viewport]');
	const statusText = document.querySelector('[data-spot-status]');
	const paletteBox = document.querySelector('[data-spot-palette]');
	const swatchesEl = document.querySelector('[data-spot-swatches]');
	const readingEl = document.querySelector('[data-spot-reading]');
	const sampleBtn = document.querySelector('[data-spot-sample]');

	function rgbToHex(r, g, b) {
		return '#' + [r, g, b].map(function (v) {
			return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
		}).join('').toUpperCase();
	}

	function extractPaletteFromImage(imgEl, labelName) {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const w = (canvas.width = 64);
		const h = (canvas.height = 64);

		try {
			ctx.drawImage(imgEl, 0, 0, w, h);
			const data = ctx.getImageData(0, 0, w, h).data;

			// Sample 5 distinct spatial regions (top-sky, upper-left, center-subject, lower-right, ground)
			const regions = [
				[0, 0, 64, 16],
				[6, 16, 28, 36],
				[20, 20, 44, 44],
				[36, 18, 58, 42],
				[0, 46, 64, 64]
			];

			let totalLuma = 0;
			let totalWarmth = 0;
			let pixelCount = 0;

			const hexes = regions.map(function (reg) {
				let r = 0, g = 0, b = 0, n = 0;
				for (let y = reg[1]; y < reg[3]; y++) {
					for (let x = reg[0]; x < reg[2]; x++) {
						const i = (y * w + x) * 4;
						r += data[i];
						g += data[i + 1];
						b += data[i + 2];
						n++;
					}
				}
				r /= n; g /= n; b /= n;
				totalLuma += 0.299 * r + 0.587 * g + 0.114 * b;
				totalWarmth += (r - b);
				pixelCount++;
				return rgbToHex(r, g, b);
			});

			const avgLuma = totalLuma / pixelCount;
			const avgWarmth = totalWarmth / pixelCount;

			let lightProfile = 'Savanna Daylight (Balanced Spectrum)';
			if (avgLuma < 75) {
				lightProfile = 'After Dark / Dense Canopy Shade';
			} else if (avgWarmth > 35) {
				lightProfile = 'Golden Hour / Warm Ochre Dusk';
			} else if (avgLuma > 175) {
				lightProfile = 'High Equatorial Sun / Salt Pan Glare';
			} else if (avgWarmth > 15) {
				lightProfile = 'First Light / Warm Morning Mist';
			}

			renderPaletteSwatches(hexes, lightProfile, labelName);
		} catch (err) {
			// Fallback if cross-origin image taint blocks getImageData
			renderPaletteSwatches(['#D46A2E', '#E6B34B', '#4E6B3C', '#8C6D46', '#26201B'], 'Golden Hour Savanna Spectrum', labelName);
		}
	}

	function renderPaletteSwatches(hexes, lightProfile, labelName) {
		if (!paletteBox || !swatchesEl || !readingEl) return;
		paletteBox.hidden = false;
		swatchesEl.innerHTML = '';

		hexes.forEach(function (hex) {
			const chip = document.createElement('button');
			chip.type = 'button';
			chip.className = 'swatch-pill press';
			chip.style.setProperty('--swatch', hex);
			chip.innerHTML = `<span class="swatch-pill__color"></span><code>${hex}</code>`;
			chip.title = 'Click to copy ' + hex;
			chip.addEventListener('click', function () {
				if (navigator.clipboard) navigator.clipboard.writeText(hex);
				const code = chip.querySelector('code');
				if (code) {
					const prev = code.textContent;
					code.textContent = 'COPIED';
					setTimeout(function () { code.textContent = prev; }, 900);
				}
			});
			swatchesEl.appendChild(chip);
		});

		readingEl.innerHTML = `
			<div><strong>Estimated Light:</strong> ${lightProfile}</div>
			<div><strong>Plate Source:</strong> ${labelName || 'Uploaded Field Specimen'}</div>
		`;

		awardStamp('field_biologist');
	}

	if (scanner && fileInput) {
		function handleFile(file) {
			if (!file || !file.type.startsWith('image/')) return;
			const reader = new FileReader();
			reader.onload = function (e) {
				if (previewImg) {
					previewImg.onload = function () {
						extractPaletteFromImage(previewImg, file.name);
					};
					previewImg.src = e.target.result;
				}
				if (viewport) viewport.classList.add('has-photo');
				if (statusText) statusText.textContent = 'Extracted 5 biome color swatches and light profile from ' + file.name + '.';
			};
			reader.readAsDataURL(file);
		}

		fileInput.addEventListener('change', function () {
			if (fileInput.files.length) handleFile(fileInput.files[0]);
		});

		if (dropzone) {
			dropzone.addEventListener('dragover', function (e) {
				e.preventDefault();
				scanner.classList.add('is-dragover');
			});
			dropzone.addEventListener('dragleave', function () {
				scanner.classList.remove('is-dragover');
			});
			dropzone.addEventListener('drop', function (e) {
				e.preventDefault();
				scanner.classList.remove('is-dragover');
				if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
			});
		}

		if (sampleBtn) {
			let sampleIdx = 0;
			sampleBtn.addEventListener('click', function () {
				const cards = Array.from(document.querySelectorAll('.journal__list .specimen-plate__photo img, .journal__list .dispatch-card__photo img'));
				const chosenImg = cards.length ? cards[sampleIdx % cards.length] : null;
				sampleIdx++;
				if (chosenImg && previewImg) {
					const srcUrl = chosenImg.src;
					const label = chosenImg.alt || 'Catalogued Field Specimen';
					previewImg.removeAttribute('crossorigin');
					previewImg.src = srcUrl;
					if (viewport) viewport.classList.add('has-photo');
					if (statusText) statusText.textContent = 'Sampled biome pigments and atmospheric light from catalogued field plate.';

					const probe = new Image();
					probe.crossOrigin = 'anonymous';
					probe.onload = function () {
						extractPaletteFromImage(probe, label);
					};
					probe.onerror = function () {
						renderPaletteSwatches(['#C85A28', '#E5A93C', '#385E38', '#8F754F', '#1E1914'], 'Savanna Golden Hour', label);
					};
					probe.src = srcUrl;
				}
			});
		}
	}

	// Filter chip instant search on Spot page
	const spotSearch = document.querySelector('[data-spot-search]');
	if (spotSearch) {
		spotSearch.addEventListener('input', function (e) {
			const term = e.target.value.toLowerCase().trim();
			document.querySelectorAll('[data-species-chip]').forEach(function (chip) {
				const text = chip.textContent.toLowerCase();
				chip.style.display = text.includes(term) ? '' : 'none';
			});
		});
	}

	// Pre-cache key 3D assets in browser cache storage on idle
	if ('caches' in window) {
		window.addEventListener('load', function () {
			caches.open('jambo-safari-v1').then(function (cache) {
				cache.addAll([
					'/assets/images/earth-blue-marble.jpg',
					'/assets/images/earth-topology.png',
					'/assets/images/earth-water.png',
					'/assets/images/logo.svg'
				]).catch(function () {});
			}).catch(function () {});
		});
	}
})();
