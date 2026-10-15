// The home page's globe: a sphere of faint dots, with every sighting a
// glowing point in the colour of the hour it was seen. It turns slowly, and
// a sideways drag spins it; vertical drags still scroll the page on a phone.

import { mount } from '/assets/js/threejs.js';

mount('globe', function ({ THREE, scene, camera, canvas, pointer, colour, still }) {
	const radius = 1.6;
	const world = new THREE.Group();
	world.rotation.x = 0.35;
	scene.add(world);

	// A soft round dot, drawn once, so points aren't squares.
	const dot = document.createElement('canvas');
	dot.width = dot.height = 64;
	const ctx = dot.getContext('2d');
	const fade = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
	fade.addColorStop(0, 'rgba(255,255,255,1)');
	fade.addColorStop(0.35, 'rgba(255,255,255,0.85)');
	fade.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = fade;
	ctx.fillRect(0, 0, 64, 64);
	const sprite = new THREE.CanvasTexture(dot);

	// The planet: a dark core, and an even spread of dots on a Fibonacci spiral.
	world.add(new THREE.Mesh(
		new THREE.SphereGeometry(radius * 0.985, 48, 48),
		new THREE.MeshBasicMaterial({ color: colour('--three-primary', '#2a1715') }),
	));

	const grid = 2200;
	const gridPos = new Float32Array(grid * 3);
	const golden = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < grid; i++) {
		const y = 1 - (i / (grid - 1)) * 2;
		const r = Math.sqrt(1 - y * y);
		const t = golden * i;
		gridPos.set([Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius], i * 3);
	}
	const gridGeo = new THREE.BufferGeometry();
	gridGeo.setAttribute('position', new THREE.BufferAttribute(gridPos, 3));
	world.add(new THREE.Points(gridGeo, new THREE.PointsMaterial({
		color: colour('--three-grid', '#5a3a33'),
		size: 0.028,
		map: sprite,
		transparent: true,
		depthWrite: false,
	})));

	// The sightings, numbers only: [latitude, longitude, light].
	let data = [];
	try {
		data = JSON.parse(document.getElementById('globe-points').textContent) || [];
	} catch (err) {
		data = [];
	}
	const tones = ['--dawn', '--day', '--dusk', '--night', '--unknown'].map(function (name) {
		return colour(name, '#f07a4a');
	});
	const pos = new Float32Array(data.length * 3);
	const col = new Float32Array(data.length * 3);
	data.forEach(function (p, i) {
		const lat = (p[0] * Math.PI) / 180;
		const lng = (p[1] * Math.PI) / 180;
		const r = radius * 1.012;
		pos.set([r * Math.cos(lat) * Math.sin(lng), r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lng)], i * 3);
		const c = tones[p[2]] || tones[4];
		col.set([c.r, c.g, c.b], i * 3);
	});
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
	const glow = new THREE.PointsMaterial({
		size: 0.16,
		map: sprite,
		vertexColors: true,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
	world.add(new THREE.Points(geo, glow));

	// A thin halo of the accent, just outside the planet.
	const halo = new THREE.Mesh(
		new THREE.SphereGeometry(radius * 1.12, 48, 48),
		new THREE.MeshBasicMaterial({
			color: colour('--three-accent', '#f07a4a'),
			transparent: true,
			opacity: 0.07,
			side: THREE.BackSide,
			depthWrite: false,
		}),
	);
	scene.add(halo);

	camera.position.z = 5.2;

	// Drag to spin, carrying the flick's speed and letting it settle back to the drift.
	let spin = 0;
	let dragging = false;
	let lastX = 0;
	canvas.addEventListener('pointerdown', function (e) {
		dragging = true;
		lastX = e.clientX;
		canvas.setPointerCapture(e.pointerId);
	});
	canvas.addEventListener('pointermove', function (e) {
		if (!dragging) return;
		const dx = e.clientX - lastX;
		lastX = e.clientX;
		world.rotation.y += dx * 0.008;
		spin = dx * 0.0006;
	});
	['pointerup', 'pointercancel'].forEach(function (type) {
		canvas.addEventListener(type, function () {
			dragging = false;
		});
	});

	// Start with Africa facing the reader.
	world.rotation.y = -0.35;

	return function (time, delta) {
		if (!dragging) {
			spin *= 0.95;
			world.rotation.y += 0.06 * delta + spin;
		}
		world.rotation.x = 0.35 + pointer.y * 0.08;
		glow.size = 0.15 + Math.sin(time * 1.6) * 0.012;
	};
});
