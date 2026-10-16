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
	   2. Savanna Sky Dial & Circadian Sun Filter
	   ========================================================================== */
	function applySkyMode(mode, userInitiated) {
		if (!['dawn', 'day', 'dusk', 'night'].includes(mode)) mode = 'day';
		document.documentElement.setAttribute('data-sky', mode);
		try {
			localStorage.setItem('jambo_sky_mode', mode);
		} catch (e) {}

		document.querySelectorAll('[data-sky-set]').forEach(function (btn) {
			const active = btn.getAttribute('data-sky-set') === mode;
			btn.classList.toggle('is-active', active);
		});

		document.querySelectorAll('[data-circadian-pick]').forEach(function (card) {
			card.classList.toggle('is-selected', card.getAttribute('data-circadian-pick') === mode);
		});

		if (userInitiated) {
			awardStamp('sky_watcher');
		}
	}

	// Initialize active button from current html[data-sky]
	const initialSky = document.documentElement.getAttribute('data-sky') || 'day';
	applySkyMode(initialSky, false);

	document.querySelectorAll('[data-sky-set]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			applySkyMode(btn.getAttribute('data-sky-set'), true);
		});
	});

	// Clicking a 24-Hour Circadian Card shifts sky mode AND filters #sightings by that light
	document.querySelectorAll('[data-circadian-pick]').forEach(function (card) {
		card.addEventListener('click', function () {
			const skyKey = card.getAttribute('data-circadian-pick');
			const lightLabel = card.getAttribute('data-circadian-label');
			applySkyMode(skyKey, true);

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
