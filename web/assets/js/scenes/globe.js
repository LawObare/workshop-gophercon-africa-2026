// The home page's 3D Earth globe: realistic continents, oceans, topographic
// relief, atmospheric limb glow, cartographic graticules, and glowing wildlife
// sighting markers coloured by the solar hour each animal was seen.

import { mount } from '/assets/js/threejs.js';

mount('globe', function ({ THREE, scene, camera, renderer, canvas, pointer, colour, still }) {
	const radius = 1.72;
	const world = new THREE.Group();
	// Tilt slightly to show East Africa & the equator clearly.
	let tiltX = 0.12;
	world.rotation.x = tiltX;
	// Orient so Africa (lng ~ 25°E) faces the camera (+Z) initially.
	const initialRotY = -Math.PI / 2 - (25 * Math.PI) / 180;
	world.rotation.y = initialRotY;
	scene.add(world);

	// Convert [lat, lng] in degrees to 3D position matching Three.js SphereGeometry UV mapping.
	function latLngToVec3(latDeg, lngDeg, r) {
		const phi = ((90 - latDeg) * Math.PI) / 180;
		const theta = ((lngDeg + 180) * Math.PI) / 180;
		return [
			-r * Math.sin(phi) * Math.cos(theta),
			r * Math.cos(phi),
			r * Math.sin(phi) * Math.sin(theta),
		];
	}

	// Build an instant procedural Earth texture as immediate fallback while the high-res NASA Blue Marble loads.
	function createFallbackEarthTexture() {
		const c = document.createElement('canvas');
		c.width = 1024;
		c.height = 512;
		const ctx = c.getContext('2d');

		// Deep ocean gradient
		const ocean = ctx.createLinearGradient(0, 0, 0, 512);
		ocean.addColorStop(0, '#0f2942');
		ocean.addColorStop(0.2, '#0c365c');
		ocean.addColorStop(0.5, '#0a416b');
		ocean.addColorStop(0.8, '#0c365c');
		ocean.addColorStop(1, '#0f2942');
		ctx.fillStyle = ocean;
		ctx.fillRect(0, 0, 1024, 512);

		// Polar ice caps
		ctx.fillStyle = 'rgba(232, 240, 248, 0.85)';
		ctx.fillRect(0, 0, 1024, 22);
		ctx.fillRect(0, 482, 1024, 30);

		// Helper to draw simplified continent polygons in [lng, lat] degrees
		function drawLand(coords, fill) {
			ctx.fillStyle = fill;
			ctx.beginPath();
			coords.forEach(function (pt, idx) {
				const x = ((pt[0] + 180) / 360) * 1024;
				const y = ((90 - pt[1]) / 180) * 512;
				if (idx === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			});
			ctx.closePath();
			ctx.fill();
		}

		// Simplified continent silhouettes for zero-latency initial frame
		// Africa
		drawLand([
			[-17, 15], [-13, 28], [-6, 36], [10, 37], [25, 32], [33, 30],
			[43, 12], [51, 12], [41, -2], [40, -15], [35, -25], [28, -33],
			[18, -35], [14, -22], [12, -6], [9, 4], [-8, 5], [-17, 15]
		], '#4f6d3a');
		// Sahara / North Africa ochre tint
		drawLand([
			[-16, 17], [-6, 35], [10, 36], [32, 30], [38, 18], [15, 14], [-16, 17]
		], '#9c7c48');
		// Madagascar
		drawLand([[44, -13], [50, -13], [49, -25], [44, -25]], '#4f6d3a');
		// Eurasia
		drawLand([
			[-9, 38], [-5, 48], [8, 58], [28, 71], [65, 72], [120, 73],
			[170, 66], [142, 45], [122, 32], [108, 18], [100, 2], [96, 16],
			[78, 8], [68, 24], [55, 22], [48, 30], [36, 14], [34, 31],
			[26, 40], [12, 44], [-9, 38]
		], '#556f3d');
		// North America
		drawLand([
			[-165, 65], [-130, 70], [-75, 72], [-55, 50], [-75, 35],
			[-82, 25], [-90, 18], [-80, 9], [-105, 20], [-124, 42], [-165, 65]
		], '#4d6a38');
		// South America
		drawLand([
			[-80, 10], [-60, 10], [-35, -6], [-42, -23], [-55, -35],
			[-68, -54], [-74, -45], [-71, -18], [-81, -4], [-80, 10]
		], '#456834');
		// Australia
		drawLand([
			[114, -22], [130, -12], [145, -15], [153, -28], [146, -38],
			[130, -33], [115, -34], [114, -22]
		], '#8d6c3f');

		const tex = new THREE.CanvasTexture(c);
		if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	}

	// Lighting: sunlit day side + soft ambient fill so both sides of Earth are visible
	scene.add(new THREE.AmbientLight(0xdbeafe, 1.35));
	const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 0.9);
	scene.add(hemiLight);

	const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.1);
	sunLight.position.set(4.5, 2.5, 4.5);
	scene.add(sunLight);

	const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.95);
	rimLight.position.set(-4.5, -2.0, -3.0);
	scene.add(rimLight);

	// The Earth sphere with Phong shading for ocean specular glints & topographic relief
	const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
	const earthMat = new THREE.MeshPhongMaterial({
		map: createFallbackEarthTexture(),
		specular: new THREE.Color('#2d5a7b'),
		shininess: 18,
		bumpScale: 0.04,
	});
	const earthMesh = new THREE.Mesh(earthGeo, earthMat);
	world.add(earthMesh);

	// Load high-resolution NASA Blue Marble texture, topography bump map, and water specular map
	const loader = new THREE.TextureLoader();
	loader.load('/assets/images/earth-blue-marble.jpg', function (tex) {
		if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
		earthMat.map = tex;
		earthMat.needsUpdate = true;
		if (still) renderer.render(scene, camera);
	});
	loader.load('/assets/images/earth-topology.png', function (bumpTex) {
		earthMat.bumpMap = bumpTex;
		earthMat.bumpScale = 0.045;
		earthMat.needsUpdate = true;
		if (still) renderer.render(scene, camera);
	});
	loader.load('/assets/images/earth-water.png', function (specTex) {
		earthMat.specularMap = specTex;
		earthMat.specular = new THREE.Color('#4a7c9b');
		earthMat.shininess = 24;
		earthMat.needsUpdate = true;
		if (still) renderer.render(scene, camera);
	});

	// Subtle latitude & longitude cartographic graticule lines around the Earth
	const graticuleGroup = new THREE.Group();
	const graticuleMat = new THREE.LineBasicMaterial({
		color: 0x93c5fd,
		transparent: true,
		opacity: 0.16,
		depthWrite: false,
	});
	const equatorMat = new THREE.LineBasicMaterial({
		color: colour('--three-accent', '#f07a4a'),
		transparent: true,
		opacity: 0.38,
		depthWrite: false,
	});
	const gratR = radius * 1.003;

	// Latitude rings every 30°
	[-60, -30, 0, 30, 60].forEach(function (latDeg) {
		const pts = [];
		for (let lngDeg = -180; lngDeg <= 180; lngDeg += 4) {
			const [x, y, z] = latLngToVec3(latDeg, lngDeg, gratR);
			pts.push(new THREE.Vector3(x, y, z));
		}
		const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
		graticuleGroup.add(new THREE.Line(lineGeo, latDeg === 0 ? equatorMat : graticuleMat));
	});

	// Longitude meridians every 30°
	for (let lngDeg = -180; lngDeg < 180; lngDeg += 30) {
		const pts = [];
		for (let latDeg = -90; latDeg <= 90; latDeg += 4) {
			const [x, y, z] = latLngToVec3(latDeg, lngDeg, gratR);
			pts.push(new THREE.Vector3(x, y, z));
		}
		const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
		graticuleGroup.add(new THREE.Line(lineGeo, graticuleMat));
	}
	world.add(graticuleGroup);

	// Soft round glow sprite for wildlife sighting pins
	const dot = document.createElement('canvas');
	dot.width = dot.height = 64;
	const ctx = dot.getContext('2d');
	const fade = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
	fade.addColorStop(0, 'rgba(255,255,255,1)');
	fade.addColorStop(0.3, 'rgba(255,255,255,0.92)');
	fade.addColorStop(0.65, 'rgba(255,255,255,0.35)');
	fade.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = fade;
	ctx.fillRect(0, 0, 64, 64);
	const sprite = new THREE.CanvasTexture(dot);

	// Plot wildlife sightings: [latitude, longitude, light]
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
		const [x, y, z] = latLngToVec3(p[0], p[1], radius * 1.014);
		pos.set([x, y, z], i * 3);
		const c = tones[p[2]] || tones[4];
		col.set([c.r, c.g, c.b], i * 3);
	});
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
	const glow = new THREE.PointsMaterial({
		size: 0.14,
		map: sprite,
		vertexColors: true,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
	world.add(new THREE.Points(geo, glow));

	// Inner atmospheric limb glow & outer halo so the Earth has a true blue atmosphere rim
	const innerAtmosphere = new THREE.Mesh(
		new THREE.SphereGeometry(radius * 1.025, 64, 64),
		new THREE.MeshBasicMaterial({
			color: 0x38bdf8,
			transparent: true,
			opacity: 0.11,
			side: THREE.BackSide,
			depthWrite: false,
		}),
	);
	scene.add(innerAtmosphere);

	const outerHalo = new THREE.Mesh(
		new THREE.SphereGeometry(radius * 1.11, 64, 64),
		new THREE.MeshBasicMaterial({
			color: 0x60a5fa,
			transparent: true,
			opacity: 0.08,
			side: THREE.BackSide,
			depthWrite: false,
		}),
	);
	scene.add(outerHalo);

	camera.position.z = 4.9;

	// Drag to spin horizontally and tilt vertically
	let spin = 0;
	let dragging = false;
	let lastX = 0;
	let lastY = 0;
	canvas.addEventListener('pointerdown', function (e) {
		dragging = true;
		lastX = e.clientX;
		lastY = e.clientY;
		canvas.setPointerCapture(e.pointerId);
	});
	canvas.addEventListener('pointermove', function (e) {
		if (!dragging) return;
		const dx = e.clientX - lastX;
		const dy = e.clientY - lastY;
		lastX = e.clientX;
		lastY = e.clientY;
		world.rotation.y += dx * 0.008;
		tiltX = Math.max(-0.85, Math.min(0.85, tiltX + dy * 0.006));
		spin = dx * 0.0005;
	});
	['pointerup', 'pointercancel'].forEach(function (type) {
		canvas.addEventListener(type, function () {
			dragging = false;
		});
	});

	return function (time, delta) {
		if (!dragging) {
			spin *= 0.95;
			world.rotation.y += 0.055 * delta + spin;
		}
		world.rotation.x = tiltX + pointer.y * 0.05;
		glow.size = 0.135 + Math.sin(time * 1.8) * 0.014;
	};
});

