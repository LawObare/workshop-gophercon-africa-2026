// Jambo 3D Cartographic & Armillary Globe
// Self-contained high-precision 3D orthographic spherical projection engine on
// HTML5 Canvas. Renders true continental coastlines (with East African Rift
// landmarks), 3D latitude/longitude graticule rings, a tilted armillary bezel,
// and glowing 3D wildlife sighting pins coloured by solar hour.

(function () {
	const canvases = document.querySelectorAll('canvas.three-scene[data-scene="globe"]');
	if (!canvases.length) return;

	// Detailed continental coastline polygons [lat, lng]
	const CONTINENTS = [
		// Africa (high-detail perimeter)
		[
			[37.3, 9.8], [35.9, -5.4], [32.0, -9.3], [28.0, -12.9], [21.0, -17.0],
			[14.7, -17.5], [11.0, -15.5], [7.2, -12.2], [4.4, -7.7], [5.2, -3.5],
			[6.4, 3.4], [4.0, 9.2], [1.0, 9.4], [-4.8, 11.8], [-8.8, 13.2],
			[-12.5, 13.4], [-17.3, 11.8], [-22.9, 14.5], [-28.6, 16.5], [-34.3, 18.5],
			[-34.8, 20.0], [-33.9, 25.6], [-29.8, 31.0], [-25.9, 32.6], [-23.8, 35.5],
			[-19.8, 34.9], [-15.0, 40.7], [-10.5, 40.4], [-6.8, 39.3], [-4.0, 39.7],
			[-1.6, 41.6], [2.0, 45.3], [6.0, 49.0], [11.8, 51.3], [11.5, 43.4],
			[15.6, 39.5], [22.0, 36.9], [27.8, 33.8], [31.2, 32.3], [31.5, 25.2],
			[32.9, 22.0], [32.5, 15.2], [35.0, 11.0], [37.3, 9.8]
		],
		// Madagascar
		[
			[-12.0, 49.3], [-15.8, 50.2], [-20.0, 48.8], [-25.0, 47.0],
			[-25.5, 45.1], [-22.0, 43.3], [-16.2, 44.5], [-13.5, 47.8], [-12.0, 49.3]
		],
		// Eurasia + Arabian Peninsula
		[
			[36.1, -5.4], [38.7, -9.2], [43.3, -8.4], [48.4, -4.5], [51.0, 1.8],
			[54.0, 8.6], [57.7, 10.6], [62.0, 5.0], [70.0, 20.0], [71.0, 28.0],
			[68.0, 44.0], [70.0, 65.0], [73.0, 90.0], [71.0, 130.0], [65.0, 170.0],
			[55.0, 160.0], [43.0, 132.0], [38.0, 121.0], [31.0, 121.5], [22.5, 114.0],
			[18.0, 106.0], [10.3, 103.5], [1.3, 103.8], [14.0, 98.0], [22.0, 91.8],
			[16.0, 82.0], [8.1, 77.5], [19.0, 72.8], [24.8, 67.0], [25.3, 57.0],
			[29.9, 48.5], [24.0, 54.5], [22.5, 59.8], [16.9, 54.0], [12.8, 45.0],
			[20.2, 40.2], [28.0, 34.8], [31.5, 34.4], [36.8, 36.2], [41.0, 29.0],
			[38.0, 23.7], [40.5, 18.0], [44.4, 8.9], [43.3, 3.5], [36.1, -5.4]
		],
		// North America
		[
			[70.0, -160.0], [71.0, -130.0], [68.0, -90.0], [60.0, -64.0],
			[47.5, -52.7], [44.6, -63.6], [40.7, -74.0], [35.2, -75.5],
			[25.8, -80.2], [29.0, -90.0], [26.0, -97.2], [19.2, -96.1],
			[21.2, -86.8], [15.8, -88.0], [9.0, -79.5], [16.8, -99.9],
			[23.2, -106.4], [32.7, -117.2], [37.8, -122.4], [48.4, -124.7],
			[60.0, -141.0], [61.0, -165.0], [70.0, -160.0]
		],
		// South America
		[
			[11.0, -74.8], [10.5, -66.9], [6.8, -58.2], [1.5, -50.0],
			[-5.8, -35.2], [-13.0, -38.5], [-22.9, -43.2], [-34.6, -58.4],
			[-42.8, -64.5], [-54.8, -68.3], [-53.0, -73.0], [-41.5, -73.0],
			[-33.0, -71.6], [-18.5, -70.3], [-12.0, -77.0], [-5.0, -81.3],
			[0.0, -80.0], [7.0, -77.8], [11.0, -74.8]
		],
		// Australia
		[
			[-12.4, 130.8], [-12.0, 142.0], [-19.2, 146.8], [-27.5, 153.0],
			[-33.9, 151.2], [-38.1, 144.9], [-35.0, 138.6], [-32.0, 132.0],
			[-34.0, 115.0], [-31.9, 115.8], [-22.0, 114.0], [-18.0, 122.2],
			[-14.5, 126.0], [-12.4, 130.8]
		]
	];

	// East African & Southern Safari Landmarks plotted on the globe (well-spaced)
	const SAFARI_LANDMARKS = [
		{ name: 'NAIROBI · 01°S', lat: 1.2, lng: 37.5 },
		{ name: 'SERENGETI', lat: -6.5, lng: 33.8 },
		{ name: 'OKAVANGO', lat: -19.28, lng: 22.82 },
		{ name: 'KRUGER', lat: -25.5, lng: 31.55 }
	];

	// Parse sightings data: [lat, lng, lightIndex]
	let rawPoints = [];
	try {
		const el = document.getElementById('globe-points');
		if (el) rawPoints = JSON.parse(el.textContent) || [];
	} catch (e) {
		rawPoints = [];
	}

	const LIGHT_COLORS = [
		'#ff5238', // 0: Dawn (Crimson-coral)
		'#f5b638', // 1: Day (Solar gold)
		'#e83b17', // 2: Dusk (Fiery red-orange)
		'#68a2ff', // 3: Night (Equatorial starlight blue)
		'#a89b8c'  // 4: Unknown
	];

	// Precompute unit sphere coordinates for continental fill stipples
	const landDots = [];
	const golden = Math.PI * (3 - Math.sqrt(5));
	const totalSamples = 1800;
	for (let i = 0; i < totalSamples; i++) {
		const y = 1 - (i / (totalSamples - 1)) * 2;
		const r = Math.sqrt(1 - y * y);
		const t = golden * i;
		const vx = Math.cos(t) * r;
		const vy = y;
		const vz = Math.sin(t) * r;
		const lat = (Math.asin(vy) * 180) / Math.PI;
		const lng = (Math.atan2(vx, vz) * 180) / Math.PI;
		// Check rough bounding for Africa & major continents for subtle stipple texture
		if (
			(lat >= -34 && lat <= 36 && lng >= -17 && lng <= 50 && !(lat < 4 && lng < 8)) ||
			(lat >= 36 && lat <= 68 && lng >= -8 && lng <= 140) ||
			(lat >= -38 && lat <= -13 && lng >= 114 && lng <= 152) ||
			(lat >= -52 && lat <= 10 && lng >= -78 && lng <= -36) ||
			(lat >= 18 && lat <= 65 && lng >= -135 && lng <= -60)
		) {
			landDots.push({ x: vx, y: vy, z: vz });
		}
	}

	// Precompute 3D vectors for wildlife sightings
	const sightings3D = rawPoints.map(function (p, idx) {
		const lat = (p[0] * Math.PI) / 180;
		const lng = (p[1] * Math.PI) / 180;
		return {
			x: Math.cos(lat) * Math.sin(lng),
			y: Math.sin(lat),
			z: Math.cos(lat) * Math.cos(lng),
			color: LIGHT_COLORS[p[2]] || LIGHT_COLORS[4],
			phase: (idx * 0.37) % (Math.PI * 2),
			isMajor: idx % 4 === 0
		};
	});

	canvases.forEach(function (canvas) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.classList.add('is-live');

		// Start rotated so Africa & the 37°E Great Rift Meridian face the viewer
		let rotY = -0.58;
		let rotX = 0.16;
		let targetRotX = 0.16;
		let spinVel = 0;
		let dragging = false;
		let lastX = 0;
		let lastY = 0;

		canvas.addEventListener('pointerdown', function (e) {
			dragging = true;
			lastX = e.clientX;
			lastY = e.clientY;
			try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
		});

		canvas.addEventListener('pointermove', function (e) {
			if (!dragging) return;
			const dx = e.clientX - lastX;
			const dy = e.clientY - lastY;
			lastX = e.clientX;
			lastY = e.clientY;
			rotY += dx * 0.0075;
			targetRotX = Math.max(-0.55, Math.min(0.55, targetRotX + dy * 0.005));
			spinVel = dx * 0.0005;
		});

		['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
			canvas.addEventListener(ev, function () {
				dragging = false;
			});
		});

		// Rotate 3D unit vector (x, y, z) by rotY (longitude spin) and rotX (tilt)
		function project3D(vx, vy, vz, cosY, sinY, cosX, sinX) {
			// Y-axis rotation
			const x1 = vx * cosY + vz * sinY;
			const z1 = -vx * sinY + vz * cosY;
			// X-axis tilt
			const y2 = vy * cosX - z1 * sinX;
			const z2 = vy * sinX + z1 * cosX;
			return { x: x1, y: -y2, z: z2 };
		}

		function latLngToVec(latDeg, lngDeg) {
			const lat = (latDeg * Math.PI) / 180;
			const lng = (lngDeg * Math.PI) / 180;
			return {
				x: Math.cos(lat) * Math.sin(lng),
				y: Math.sin(lat),
				z: Math.cos(lat) * Math.cos(lng)
			};
		}

		let width = 440;
		let height = 440;
		let dpr = Math.min(window.devicePixelRatio || 1, 2);

		function updateSize() {
			const stage = canvas.parentElement;
			if (!stage) return;
			const rect = stage.getBoundingClientRect();
			const side = Math.max(260, Math.min(540, Math.floor(rect.width || 420)));
			width = side;
			height = side;
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
				canvas.width = Math.floor(width * dpr);
				canvas.height = Math.floor(height * dpr);
			}
		}

		updateSize();
		window.addEventListener('resize', updateSize, { passive: true });

		let lastTime = performance.now();

		function renderFrame(now) {
			const dt = Math.min(0.05, (now - lastTime) / 1000);
			lastTime = now;
			const t = now * 0.001;

			if (!dragging) {
				spinVel *= 0.94;
				rotY += 0.14 * dt + spinVel;
			}
			rotX += (targetRotX - rotX) * 0.12;

			const cosY = Math.cos(rotY);
			const sinY = Math.sin(rotY);
			const cosX = Math.cos(rotX);
			const sinX = Math.sin(rotX);

			ctx.save();
			ctx.scale(dpr, dpr);
			ctx.clearRect(0, 0, width, height);

			const cx = width / 2;
			const cy = height / 2;
			const R = width * 0.375;

			// 1. Outer Atmospheric Copper Halo
			const haloGrad = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.24);
			haloGrad.addColorStop(0, 'rgba(217, 94, 38, 0.22)');
			haloGrad.addColorStop(0.55, 'rgba(201, 130, 14, 0.08)');
			haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
			ctx.fillStyle = haloGrad;
			ctx.beginPath();
			ctx.arc(cx, cy, R * 1.24, 0, Math.PI * 2);
			ctx.fill();

			// 2. Terrestrial Sphere Core (Warm Obsidian-Bronze with sunlit limb)
			const globeGrad = ctx.createRadialGradient(
				cx - R * 0.28,
				cy - R * 0.28,
				R * 0.05,
				cx,
				cy,
				R
			);
			globeGrad.addColorStop(0, '#2c2219');
			globeGrad.addColorStop(0.55, '#19130e');
			globeGrad.addColorStop(0.92, '#100c09');
			globeGrad.addColorStop(1, '#261a11');

			ctx.beginPath();
			ctx.arc(cx, cy, R, 0, Math.PI * 2);
			ctx.fillStyle = globeGrad;
			ctx.fill();

			// Clip interior of sphere for graticules & continents
			ctx.save();
			ctx.beginPath();
			ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
			ctx.clip();

			// 3. Latitude Parallels (Equator 0°, Tropics ±23.4°, ±45°, ±66.5°)
			const parallels = [
				{ lat: 0, color: 'rgba(230, 118, 45, 0.65)', width: 1.3, dash: [] },
				{ lat: 23.4, color: 'rgba(201, 151, 82, 0.38)', width: 0.9, dash: [4, 4] },
				{ lat: -23.4, color: 'rgba(201, 151, 82, 0.38)', width: 0.9, dash: [4, 4] },
				{ lat: 45, color: 'rgba(150, 128, 102, 0.2)', width: 0.75, dash: [] },
				{ lat: -45, color: 'rgba(150, 128, 102, 0.2)', width: 0.75, dash: [] },
				{ lat: 66.5, color: 'rgba(150, 128, 102, 0.16)', width: 0.7, dash: [2, 3] },
				{ lat: -66.5, color: 'rgba(150, 128, 102, 0.16)', width: 0.7, dash: [2, 3] }
			];

			parallels.forEach(function (p) {
				ctx.beginPath();
				ctx.strokeStyle = p.color;
				ctx.lineWidth = p.width;
				ctx.setLineDash(p.dash);
				let penDown = false;
				for (let lng = -180; lng <= 180; lng += 5) {
					const v = latLngToVec(p.lat, lng);
					const pr = project3D(v.x, v.y, v.z, cosY, sinY, cosX, sinX);
					if (pr.z > 0) {
						const sx = cx + pr.x * R;
						const sy = cy + pr.y * R;
						if (!penDown) {
							ctx.moveTo(sx, sy);
							penDown = true;
						} else {
							ctx.lineTo(sx, sy);
						}
					} else {
						penDown = false;
					}
				}
				ctx.stroke();
			});
			ctx.setLineDash([]);

			// 4. Longitude Meridians (every 30° + highlighted 36.8°E Nairobi Meridian)
			for (let lng = -180; lng < 180; lng += 30) {
				ctx.beginPath();
				ctx.strokeStyle = 'rgba(150, 128, 102, 0.2)';
				ctx.lineWidth = 0.75;
				let penDown = false;
				for (let lat = -85; lat <= 85; lat += 5) {
					const v = latLngToVec(lat, lng);
					const pr = project3D(v.x, v.y, v.z, cosY, sinY, cosX, sinX);
					if (pr.z > 0) {
						const sx = cx + pr.x * R;
						const sy = cy + pr.y * R;
						if (!penDown) {
							ctx.moveTo(sx, sy);
							penDown = true;
						} else {
							ctx.lineTo(sx, sy);
						}
					} else {
						penDown = false;
					}
				}
				ctx.stroke();
			}

			// Highlighted 36.8°E East African Rift Meridian
			ctx.beginPath();
			ctx.strokeStyle = 'rgba(235, 92, 36, 0.65)';
			ctx.lineWidth = 1.25;
			let riftPen = false;
			for (let lat = -85; lat <= 85; lat += 4) {
				const v = latLngToVec(lat, 36.8);
				const pr = project3D(v.x, v.y, v.z, cosY, sinY, cosX, sinX);
				if (pr.z > 0) {
					const sx = cx + pr.x * R;
					const sy = cy + pr.y * R;
					if (!riftPen) {
						ctx.moveTo(sx, sy);
						riftPen = true;
					} else {
						ctx.lineTo(sx, sy);
					}
				} else {
					riftPen = false;
				}
			}
			ctx.stroke();

			// 5. Vector Continental Coastlines & Warm Savanna Ochre Fill
			CONTINENTS.forEach(function (poly, polyIdx) {
				ctx.beginPath();
				let visibleCount = 0;
				let started = false;
				for (let i = 0; i < poly.length; i++) {
					const v = latLngToVec(poly[i][0], poly[i][1]);
					const pr = project3D(v.x, v.y, v.z, cosY, sinY, cosX, sinX);
					// Clamp horizon slightly for smooth polygon wrapping
					if (pr.z > -0.12) {
						visibleCount++;
						const clampedZ = Math.max(0, pr.z);
						const scale = pr.z < 0 ? 1 / Math.hypot(pr.x, pr.y || 0.001) : 1;
						const sx = cx + pr.x * scale * R;
						const sy = cy + pr.y * scale * R;
						if (!started) {
							ctx.moveTo(sx, sy);
							started = true;
						} else {
							ctx.lineTo(sx, sy);
						}
					} else {
						started = false;
					}
				}
				if (visibleCount > 2) {
					// Highlight Africa (polyIdx === 0) with a richer terracotta-brass tint
					ctx.fillStyle = polyIdx === 0
						? 'rgba(209, 142, 62, 0.30)'
						: 'rgba(184, 138, 78, 0.19)';
					ctx.fill();
					ctx.strokeStyle = polyIdx === 0
						? 'rgba(242, 179, 92, 0.92)'
						: 'rgba(204, 158, 96, 0.62)';
					ctx.lineWidth = polyIdx === 0 ? 1.5 : 1.0;
					ctx.stroke();
				}
			});

			// 6. Continental Topographic Stipple Dots
			ctx.fillStyle = 'rgba(235, 185, 108, 0.48)';
			for (let i = 0; i < landDots.length; i++) {
				const d = landDots[i];
				const pr = project3D(d.x, d.y, d.z, cosY, sinY, cosX, sinX);
				if (pr.z > 0.08) {
					ctx.fillRect(cx + pr.x * R - 0.8, cy + pr.y * R - 0.8, 1.6, 1.6);
				}
			}

			// 7. East African Safari Landmark Crosshairs & Labels
			ctx.font = '600 8.5px "JetBrains Mono", monospace';
			SAFARI_LANDMARKS.forEach(function (lm) {
				const v = latLngToVec(lm.lat, lm.lng);
				const pr = project3D(v.x, v.y, v.z, cosY, sinY, cosX, sinX);
				if (pr.z > 0.25) {
					const sx = cx + pr.x * R;
					const sy = cy + pr.y * R;
					ctx.strokeStyle = 'rgba(255, 240, 212, 0.75)';
					ctx.lineWidth = 1;
					ctx.strokeRect(sx - 2.5, sy - 2.5, 5, 5);
					ctx.fillStyle = 'rgba(255, 242, 220, 0.88)';
					ctx.fillText(lm.name, sx + 6, sy + 3);
				}
			});

			ctx.restore(); // End sphere interior clip

			// 8. Crisp Brass Rim Bezel around Sphere
			ctx.beginPath();
			ctx.arc(cx, cy, R, 0, Math.PI * 2);
			ctx.strokeStyle = 'rgba(224, 162, 84, 0.78)';
			ctx.lineWidth = 1.6;
			ctx.stroke();

			// 9. Wildlife Sighting Beacons & 3D Radial Surveyor Pins
			for (let i = 0; i < sightings3D.length; i++) {
				const s = sightings3D[i];
				const pr = project3D(s.x, s.y, s.z, cosY, sinY, cosX, sinX);
				if (pr.z > 0.03) {
					const sx = cx + pr.x * R;
					const sy = cy + pr.y * R;
					const alpha = Math.min(1, pr.z * 1.4);

					// 3D radial surveyor spike rising from the surface on major clusters
					if (s.isMajor) {
						const tipScale = 1.07 + Math.sin(t * 2 + s.phase) * 0.015;
						const tx = cx + pr.x * R * tipScale;
						const ty = cy + pr.y * R * tipScale;
						ctx.beginPath();
						ctx.moveTo(sx, sy);
						ctx.lineTo(tx, ty);
						ctx.strokeStyle = s.color;
						ctx.globalAlpha = alpha * 0.65;
						ctx.lineWidth = 1;
						ctx.stroke();
					}

					// Glowing solar-hour beacon
					const pulse = 3.2 + Math.sin(t * 2.4 + s.phase) * 1.1;
					ctx.globalAlpha = alpha * 0.38;
					ctx.fillStyle = s.color;
					ctx.beginPath();
					ctx.arc(sx, sy, pulse * 1.8, 0, Math.PI * 2);
					ctx.fill();

					ctx.globalAlpha = alpha * 0.95;
					ctx.fillStyle = s.color;
					ctx.beginPath();
					ctx.arc(sx, sy, 2.4, 0, Math.PI * 2);
					ctx.fill();

					ctx.fillStyle = '#fff9f0';
					ctx.beginPath();
					ctx.arc(sx, sy, 1.0, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			ctx.globalAlpha = 1;

			// 10. Tilted Outer Armillary Ecliptic Ring (3D Foreground & Background Arcs)
			const orbitR = R * 1.13;
			const tilt = 0.36;
			ctx.beginPath();
			ctx.strokeStyle = 'rgba(209, 154, 78, 0.45)';
			ctx.lineWidth = 1.1;
			for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) {
				const ox = Math.cos(a + t * 0.15) * orbitR;
				const oy = Math.sin(a + t * 0.15) * Math.sin(tilt) * orbitR;
				if (a === 0) ctx.moveTo(cx + ox, cy + oy);
				else ctx.lineTo(cx + ox, cy + oy);
			}
			ctx.stroke();

			ctx.restore();
			requestAnimationFrame(renderFrame);
		}

		requestAnimationFrame(renderFrame);
	});
})();
