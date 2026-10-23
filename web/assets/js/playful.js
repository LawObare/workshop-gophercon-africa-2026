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
	   2. Automated 4-Minute Savanna Sky Cycle & Starry Savanna Night Engine
	   ========================================================================== */
	const CYCLE_MS = 240000; // 4 minutes (240,000ms) for a full 24-hour savanna cycle
	const PHASE_LABELS = {
		dawn:  'ALFAJIRI // CRIMSON DAWN',
		day:   'MCHANA // SAVANNA BLUE SKY',
		dusk:  'MACHWEO // BLOOD-RED DUSK',
		night: 'USIKU // STARRY SAVANNA NIGHT'
	};
	const PHASE_CENTERS = {
		dawn: 0.125,
		day: 0.375,
		dusk: 0.625,
		night: 0.875
	};

	// Ensure .savanna-sky has the full upgraded structure (including star canvas,
	// SVG clouds, and acacia horizon) even if the server binary wasn't restarted.
	let skyStage = document.querySelector('[data-savanna-sky]');
	if (!skyStage) {
		skyStage = document.createElement('div');
		skyStage.className = 'savanna-sky';
		skyStage.setAttribute('aria-hidden', 'true');
		skyStage.setAttribute('data-savanna-sky', '');
		document.body.prepend(skyStage);
	}
	if (!skyStage.querySelector('[data-star-canvas]')) {
		skyStage.innerHTML = `
			<div class="savanna-sky__layer savanna-sky__layer--dawn" data-sky-layer="dawn">
				<div class="savanna-sky__sun savanna-sky__sun--dawn"></div>
			</div>
			<div class="savanna-sky__layer savanna-sky__layer--day" data-sky-layer="day">
				<div class="savanna-sky__sun savanna-sky__sun--day"></div>
				<div class="savanna-sky__clouds savanna-sky__clouds--near">
					<svg viewBox="0 0 1600 320" preserveAspectRatio="none">
						<g fill="rgba(255,255,255,0.72)">
							<path d="M120 150 Q145 110 190 118 Q225 85 275 108 Q320 98 345 132 Q380 135 375 162 L105 162 Z"/>
							<path d="M620 115 Q655 75 710 88 Q755 55 820 82 Q870 75 895 112 Q930 118 922 142 L600 142 Z" opacity="0.85"/>
							<path d="M1180 165 Q1210 128 1260 136 Q1300 105 1355 128 Q1395 122 1418 156 L1165 156 Z" opacity="0.75"/>
						</g>
					</svg>
				</div>
				<div class="savanna-sky__clouds savanna-sky__clouds--far">
					<svg viewBox="0 0 1600 320" preserveAspectRatio="none">
						<g fill="rgba(255,255,255,0.48)">
							<path d="M340 205 Q375 172 425 182 Q465 158 515 178 Q550 175 568 205 Z"/>
							<path d="M910 190 Q950 155 1005 168 Q1050 142 1105 166 Q1140 162 1160 190 Z"/>
						</g>
					</svg>
				</div>
			</div>
			<div class="savanna-sky__layer savanna-sky__layer--dusk" data-sky-layer="dusk">
				<div class="savanna-sky__sun savanna-sky__sun--dusk"></div>
			</div>
			<div class="savanna-sky__layer savanna-sky__layer--night" data-sky-layer="night">
				<canvas class="savanna-sky__starcanvas" data-star-canvas></canvas>
			</div>
			<div class="savanna-sky__horizon">
				<svg viewBox="0 0 1440 120" preserveAspectRatio="none">
					<path d="M0 120 L0 88 L140 76 L310 86 L520 68 L740 84 L980 66 L1230 82 L1440 72 L1440 120 Z" fill="currentColor" opacity="0.28"/>
					<path d="M0 120 L0 98 L260 90 L620 98 L1040 88 L1440 96 L1440 120 Z" fill="currentColor" opacity="0.65"/>
					<g transform="translate(110, 32)" fill="currentColor" opacity="0.72">
						<path d="M36 66 L38 38 L20 26 L25 26 L38 35 L40 23 L43 23 L41 35 L54 25 L59 25 L42 38 L44 66 Z"/>
						<ellipse cx="40" cy="21" rx="34" ry="4.5"/>
						<ellipse cx="24" cy="16" rx="18" ry="3.2"/>
						<ellipse cx="56" cy="17" rx="16" ry="3"/>
					</g>
					<g transform="translate(1240, 40)" fill="currentColor" opacity="0.72">
						<path d="M28 58 L29 34 L16 24 L20 24 L29 31 L31 21 L33 21 L31 31 L42 23 L46 23 L32 34 L33 58 Z"/>
						<ellipse cx="31" cy="19" rx="26" ry="3.8"/>
						<ellipse cx="19" cy="15" rx="13" ry="2.6"/>
						<ellipse cx="43" cy="15.5" rx="12" ry="2.5"/>
					</g>
				</svg>
			</div>
		`;
	}

	// Ensure .sky-cycle-hud has the quick-jump preview buttons if not already present
	const hudEl = document.querySelector('.sky-cycle-hud');
	if (hudEl && !hudEl.querySelector('.sky-cycle-hud__jumps')) {
		const jumps = document.createElement('div');
		jumps.className = 'sky-cycle-hud__jumps';
		jumps.setAttribute('role', 'group');
		jumps.innerHTML = `
			<button type="button" class="sky-cycle-hud__jump" data-sky-jump="dawn">Dawn</button>
			<button type="button" class="sky-cycle-hud__jump" data-sky-jump="day">Day</button>
			<button type="button" class="sky-cycle-hud__jump" data-sky-jump="dusk">Dusk</button>
			<button type="button" class="sky-cycle-hud__jump" data-sky-jump="night">Night</button>
		`;
		hudEl.appendChild(jumps);
	}

	const layerDawn = skyStage.querySelector('.savanna-sky__layer--dawn');
	const layerDay = skyStage.querySelector('.savanna-sky__layer--day');
	const layerDusk = skyStage.querySelector('.savanna-sky__layer--dusk');
	const layerNight = skyStage.querySelector('.savanna-sky__layer--night');
	const clockEl = document.querySelector('[data-sky-clock]');
	const phaseEl = document.querySelector('[data-sky-phase]');
	const progressEl = document.querySelector('[data-sky-progress]');

	// Persistent cycle offset so jumping to a phase or navigating keeps the 4-minute clock smooth
	let cycleOffsetMs = 0;
	try {
		const savedOffset = sessionStorage.getItem('jambo_cycle_offset_ms');
		if (savedOffset !== null) {
			cycleOffsetMs = Number(savedOffset) || 0;
		}
	} catch (e) {}

	function setSkyPhaseOffset(targetMode) {
		const center = PHASE_CENTERS[targetMode] ?? 0.125;
		const currentBase = (Date.now() % CYCLE_MS) / CYCLE_MS;
		let delta = center - currentBase;
		if (delta < 0) delta += 1;
		cycleOffsetMs = Math.round(delta * CYCLE_MS);
		try {
			sessionStorage.setItem('jambo_cycle_offset_ms', String(cycleOffsetMs));
		} catch (e) {}
		updateSkyFrame(performance.now());
	}

	// Smooth circular cosine weight for each of the 4 quadrants around `center` (width = 0.5 of cycle)
	function phaseWeight(progress, center) {
		let dist = Math.abs(progress - center);
		if (dist > 0.5) dist = 1 - dist;
		if (dist >= 0.28) return 0;
		return 0.5 * (1 + Math.cos((dist / 0.28) * Math.PI));
	}

	let lastMode = '';
	let currentNightOpacity = 0;

	function updateSkyFrame() {
		const progress = ((Date.now() + cycleOffsetMs) % CYCLE_MS) / CYCLE_MS; // 0.0 -> 1.0 over 4 minutes

		// Compute smooth continuous weights for all 4 layers (zero dead plateaus!)
		let wDawn = phaseWeight(progress, 0.125);
		let wDay = phaseWeight(progress, 0.375);
		let wDusk = phaseWeight(progress, 0.625);
		let wNight = phaseWeight(progress, 0.875);
		const sum = wDawn + wDay + wDusk + wNight || 1;
		wDawn /= sum;
		wDay /= sum;
		wDusk /= sum;
		wNight /= sum;

		if (layerDawn) layerDawn.style.opacity = wDawn.toFixed(3);
		if (layerDay) layerDay.style.opacity = wDay.toFixed(3);
		if (layerDusk) layerDusk.style.opacity = wDusk.toFixed(3);
		if (layerNight) layerNight.style.opacity = wNight.toFixed(3);
		currentNightOpacity = wNight;

		const mode = progress < 0.25 ? 'dawn' : progress < 0.5 ? 'day' : progress < 0.75 ? 'dusk' : 'night';

		if (mode !== lastMode) {
			lastMode = mode;
			document.documentElement.setAttribute('data-sky', mode);
			if (phaseEl) {
				phaseEl.textContent = PHASE_LABELS[mode] || PHASE_LABELS.day;
			}
			document.querySelectorAll('[data-sky-jump]').forEach(function (btn) {
				btn.classList.toggle('is-active', btn.getAttribute('data-sky-jump') === mode);
			});
			document.querySelectorAll('[data-circadian-pick]').forEach(function (card) {
				card.classList.toggle('is-selected', card.getAttribute('data-circadian-pick') === mode);
			});
		}

		// Map 0..1 cycle progress to 24h East African Time starting at 05:00 (Alfajiri Dawn)
		if (clockEl) {
			const totalMinutes = Math.floor(((progress * 24 + 5) % 24) * 60);
			const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
			const mm = String(totalMinutes % 60).padStart(2, '0');
			clockEl.textContent = hh + ':' + mm + ' EAT';
		}

		if (progressEl) {
			progressEl.style.transform = 'scaleX(' + Math.max(0.03, progress).toFixed(3) + ')';
		}
	}

	// Starry Savanna Night Canvas Engine (260 stars, Milky Way band, Crescent Moon, Shooting Stars)
	const starCanvas = skyStage.querySelector('[data-star-canvas]');
	if (starCanvas) {
		const sctx = starCanvas.getContext('2d');
		let sw = window.innerWidth;
		let sh = window.innerHeight;

		function resizeStars() {
			sw = window.innerWidth || 1280;
			sh = window.innerHeight || 800;
			starCanvas.width = sw;
			starCanvas.height = sh;
		}
		resizeStars();
		window.addEventListener('resize', resizeStars, { passive: true });

		const STAR_PALETTE = ['#ffffff', '#fff4dc', '#cfe2ff', '#ffd9a6', '#e8f1ff'];
		const stars = [];
		for (let i = 0; i < 260; i++) {
			// Concentrate extra stars along the diagonal Milky Way band
			const inMilkyWay = i < 95;
			const u = Math.random();
			const v = inMilkyWay
				? Math.max(0.02, Math.min(0.88, u * 0.72 + (Math.random() - 0.5) * 0.24))
				: Math.random() * 0.88;
			stars.push({
				u: u,
				v: v,
				r: i % 19 === 0 ? 2.1 : i % 7 === 0 ? 1.45 : 0.75 + Math.random() * 0.55,
				color: STAR_PALETTE[i % STAR_PALETTE.length],
				twinkleSpeed: 1.2 + Math.random() * 2.8,
				phase: Math.random() * Math.PI * 2,
				bright: i % 19 === 0
			});
		}

		// Pre-render crisp Crescent Moon onto an offscreen sprite so destination-out
		// carves a pure crescent without punching a dark hole into the sky glow.
		const moonSprite = document.createElement('canvas');
		moonSprite.width = moonSprite.height = 120;
		const mctx = moonSprite.getContext('2d');
		if (mctx) {
			mctx.beginPath();
			mctx.arc(60, 60, 32, 0, Math.PI * 2);
			mctx.fillStyle = '#fff6de';
			mctx.fill();
			mctx.globalCompositeOperation = 'destination-out';
			mctx.beginPath();
			mctx.arc(46, 52, 29, 0, Math.PI * 2);
			mctx.fill();
		}

		let meteor = { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 };

		function drawStarryNight(now) {
			if (!sctx || currentNightOpacity <= 0.01) return;
			const t = now * 0.001;
			sctx.clearRect(0, 0, sw, sh);

			// 1. Diagonal Equatorial Milky Way Glow Band
			sctx.save();
			sctx.translate(sw * 0.5, sh * 0.36);
			sctx.rotate(-0.38);
			const mwGrad = sctx.createRadialGradient(0, 0, 10, 0, 0, sw * 0.55);
			mwGrad.addColorStop(0, 'rgba(130, 168, 235, 0.16)');
			mwGrad.addColorStop(0.5, 'rgba(88, 124, 196, 0.07)');
			mwGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
			sctx.scale(1.6, 0.32);
			sctx.fillStyle = mwGrad;
			sctx.beginPath();
			sctx.arc(0, 0, sw * 0.55, 0, Math.PI * 2);
			sctx.fill();
			sctx.restore();

			// 2. Equatorial Crescent Moon in upper-right savanna sky
			const mx = sw * 0.82;
			const my = sh * 0.16;
			const mr = Math.min(sw, sh) * 0.028;
			const moonGlow = sctx.createRadialGradient(mx, my, mr * 0.3, mx, my, mr * 3.8);
			moonGlow.addColorStop(0, 'rgba(255, 244, 214, 0.24)');
			moonGlow.addColorStop(1, 'rgba(255, 244, 214, 0)');
			sctx.fillStyle = moonGlow;
			sctx.beginPath();
			sctx.arc(mx, my, mr * 3.8, 0, Math.PI * 2);
			sctx.fill();

			const spriteSize = mr * 3.6;
			sctx.drawImage(moonSprite, mx - spriteSize / 2, my - spriteSize / 2, spriteSize, spriteSize);

			// 3. 260 Twinkling Stars & Navigation Constellations
			for (let i = 0; i < stars.length; i++) {
				const st = stars[i];
				const sx = st.u * sw;
				const sy = st.v * sh;
				const alpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * st.twinkleSpeed + st.phase));
				sctx.globalAlpha = alpha;
				sctx.fillStyle = st.color;
				sctx.beginPath();
				sctx.arc(sx, sy, st.r, 0, Math.PI * 2);
				sctx.fill();

				if (st.bright) {
					sctx.globalAlpha = alpha * 0.35;
					sctx.strokeStyle = st.color;
					sctx.lineWidth = 0.8;
					sctx.beginPath();
					sctx.moveTo(sx - st.r * 3.2, sy);
					sctx.lineTo(sx + st.r * 3.2, sy);
					sctx.moveTo(sx, sy - st.r * 3.2);
					sctx.lineTo(sx, sy + st.r * 3.2);
					sctx.stroke();
				}
			}
			sctx.globalAlpha = 1;

			// 4. Occasional Savanna Shooting Star
			if (!meteor.active && Math.random() < 0.015) {
				meteor.active = true;
				meteor.x = sw * (0.2 + Math.random() * 0.6);
				meteor.y = sh * (0.06 + Math.random() * 0.25);
				meteor.vx = -9 - Math.random() * 6;
				meteor.vy = 4 + Math.random() * 3;
				meteor.life = 1.0;
			}
			if (meteor.active) {
				meteor.x += meteor.vx;
				meteor.y += meteor.vy;
				meteor.life -= 0.045;
				if (meteor.life <= 0) {
					meteor.active = false;
				} else {
					const tailGrad = sctx.createLinearGradient(
						meteor.x, meteor.y,
						meteor.x - meteor.vx * 6, meteor.y - meteor.vy * 6
					);
					tailGrad.addColorStop(0, 'rgba(255, 250, 235, ' + meteor.life.toFixed(2) + ')');
					tailGrad.addColorStop(1, 'rgba(255, 250, 235, 0)');
					sctx.strokeStyle = tailGrad;
					sctx.lineWidth = 1.6;
					sctx.beginPath();
					sctx.moveTo(meteor.x, meteor.y);
					sctx.lineTo(meteor.x - meteor.vx * 6, meteor.y - meteor.vy * 6);
					sctx.stroke();
				}
			}
		}

		// Initial draw so stars are ready immediately
		currentNightOpacity = 1;
		drawStarryNight(performance.now());
		updateSkyFrame();

		// Throttled 12.5fps (80ms) loop for sky opacity blending & night star twinkle
		setInterval(function () {
			const now = performance.now();
			updateSkyFrame();
			drawStarryNight(now);
		}, 80);
	} else {
		updateSkyFrame();
		setInterval(updateSkyFrame, 100);
	}

	// Quick-jump buttons in the Meridian HUD let the user preview any period immediately
	// while the 4-minute cycle continues smoothly from that point.
	document.querySelectorAll('[data-sky-jump]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			const targetMode = btn.getAttribute('data-sky-jump');
			setSkyPhaseOffset(targetMode);
			awardStamp('sky_watcher');
		});
	});

	// Clicking a 24-Hour Circadian Segment shifts to that sky period AND filters #sightings
	document.querySelectorAll('[data-circadian-pick]').forEach(function (card) {
		card.addEventListener('click', function () {
			const skyKey = card.getAttribute('data-circadian-pick');
			const lightLabel = card.getAttribute('data-circadian-label');
			setSkyPhaseOffset(skyKey);
			awardStamp('sky_watcher');

			document.querySelectorAll('[data-circadian-pick]').forEach(function (c) {
				c.classList.toggle('is-selected', c.getAttribute('data-circadian-pick') === skyKey);
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
			"Jambo! Try clicking Dawn, Day, Dusk, or Night in the top bar to watch the savanna sky transform.",
			"Did you know? Cheetahs hunt during Daylight and Golden Hour to avoid nocturnal lions and hyenas.",
			"Click any phase on the 24-Hour Savanna Sun Dial to filter sightings by that hour of the sun!",
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
	const quizEl = document.querySelector('[data-silhouette-game]');
	const quizDataEl = document.getElementById('safari-quiz-data');
	if (quizEl && quizDataEl) {
		let pool = [];
		try {
			pool = JSON.parse(quizDataEl.textContent) || [];
		} catch (e) {
			pool = [];
		}

		if (pool.length >= 4) {
			const frame = quizEl.querySelector('[data-quiz-frame]');
			const img = quizEl.querySelector('[data-quiz-img]');
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

			function loadRound(idx) {
				answered = false;
				currentIdx = idx % pool.length;
				const target = pool[currentIdx];

				frame.classList.add('is-masked');
				img.src = target.photoUrl;
				if (badge) badge.textContent = 'MYSTERY SPECIMEN';
				if (countryEl) countryEl.textContent = target.country || 'East Africa';
				if (lightEl) lightEl.textContent = target.light || 'Daylight';
				if (weatherEl) weatherEl.textContent = target.weather || 'Clear sky';
				if (promptEl) promptEl.textContent = 'Use the field clues and outline to identify this wild animal:';
				if (recordLink) {
					recordLink.href = target.url;
					recordLink.hidden = true;
				}

				// Pick 3 distractors
				const others = pool.filter(function (item) {
					return item.animal.toLowerCase() !== target.animal.toLowerCase();
				});
				const options = shuffle([target].concat(shuffle(others).slice(0, 3)));

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
						if (recordLink) recordLink.hidden = false;

						const isCorrect = opt.animal === target.animal;
						if (isCorrect) {
							streak++;
							btn.classList.add('is-correct');
							if (badge) badge.textContent = 'SPOTTED · ' + target.animal.toUpperCase();
							if (promptEl) promptEl.textContent = 'Sharp eyes! Observed by ' + target.observer + ' in ' + target.country + '.';
							awardStamp('silhouette_ranger');
						} else {
							streak = 0;
							btn.classList.add('is-wrong');
							if (badge) badge.textContent = target.animal.toUpperCase();
							if (promptEl) promptEl.textContent = 'Close! That silhouette belongs to the ' + target.animal + ' (' + target.scientific + ').';
							Array.from(choicesEl.children).forEach(function (c) {
								if (c.textContent === target.animal) c.classList.add('is-correct');
							});
						}
						if (streakEl) streakEl.textContent = String(streak);
					});
					choicesEl.appendChild(btn);
				});
			}

			if (revealBtn) {
				revealBtn.addEventListener('click', function () {
					const target = pool[currentIdx];
					answered = true;
					frame.classList.remove('is-masked');
					if (badge) badge.textContent = target.animal.toUpperCase();
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
			sampleBtn.addEventListener('click', function () {
				const existingCardImg = document.querySelector('.journal__list .specimen-plate__photo img, .journal__list .dispatch-card__photo img');
				if (existingCardImg && previewImg) {
					previewImg.crossOrigin = 'anonymous';
					previewImg.onload = function () {
						extractPaletteFromImage(previewImg, existingCardImg.alt || 'Catalogued Field Specimen');
					};
					previewImg.onerror = function () {
						renderPaletteSwatches(['#C85A28', '#E5A93C', '#385E38', '#8F754F', '#1E1914'], 'Savanna Golden Hour', 'Sample Field Specimen');
					};
					previewImg.src = existingCardImg.src;
					if (viewport) viewport.classList.add('has-photo');
					if (statusText) statusText.textContent = 'Sampled biome pigments and atmospheric light from catalogued field plate.';
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
})();
