"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Set initial size
    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 13);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    const group = new THREE.Group();
    scene.add(group);

    // Color definitions
    const COLOR_NEUTRAL = new THREE.Color(0x3a4048);
    const COLOR_GOOD = new THREE.Color(0x3ddc84);
    const COLOR_WARN = new THREE.Color(0xffd166);
    const COLOR_RISK = new THREE.Color(0xff5c5c);

    const NODE_COUNT = 34;
    interface NodeItem {
      mesh: THREE.Mesh;
      mat: THREE.MeshBasicMaterial;
      pos: THREE.Vector3;
      status: THREE.Color;
      scanned: boolean;
      dist: number;
    }
    const nodes: NodeItem[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.11, 12, 12);

    function randSpherePoint(radius: number) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(radius * (0.45 + Math.random() * 0.55));
      return v;
    }

    // Spawn nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: COLOR_NEUTRAL.clone() });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      const pos = randSpherePoint(4.6);
      mesh.position.copy(pos);
      group.add(mesh);

      const statusRoll = Math.random();
      const status =
        statusRoll < 0.72
          ? COLOR_GOOD
          : statusRoll < 0.9
          ? COLOR_WARN
          : COLOR_RISK;

      nodes.push({
        mesh,
        mat,
        pos,
        status,
        scanned: false,
        dist: pos.length(),
      });
    }

    // Build edges
    const edgePositions: number[] = [];
    for (let a = 0; a < nodes.length; a++) {
      const distances: { b: number; d: number }[] = [];
      for (let b = 0; b < nodes.length; b++) {
        if (a === b) continue;
        distances.push({ b: b, d: nodes[a].pos.distanceTo(nodes[b].pos) });
      }
      distances.sort((x, y) => x.d - y.d);
      const linkCount = 1 + Math.floor(Math.random() * 2);
      for (let k = 0; k < linkCount && k < distances.length; k++) {
        const bIdx = distances[k].b;
        edgePositions.push(nodes[a].pos.x, nodes[a].pos.y, nodes[a].pos.z);
        edgePositions.push(
          nodes[bIdx].pos.x,
          nodes[bIdx].pos.y,
          nodes[bIdx].pos.z
        );
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(edgePositions, 3)
    );
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x232932,
      transparent: true,
      opacity: 0.6,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edgeLines);

    // Scan Ring - uses primary accent color of the checkmark shield brand (Teal: 0x00F5D4)
    const ringGeo = new THREE.SphereGeometry(1, 24, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    const maxDist = 4.9;
    let scanRadius = 0;
    let scanning = true;
    let pauseTimer = 0;

    function resetScan() {
      scanRadius = 0;
      scanning = true;
      nodes.forEach((n) => {
        n.scanned = false;
        n.mat.color.copy(COLOR_NEUTRAL);
      });
    }

    const clock = new THREE.Clock();
    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (!reduceMotion) {
        group.rotation.y += dt * 0.14;
        group.rotation.x = Math.sin(clock.getElapsedTime() * 0.12) * 0.08;
      }

      if (scanning) {
        scanRadius += dt * (reduceMotion ? 1.4 : 2.6);
        ring.scale.setScalar(scanRadius);
        // Safely access opacity
        if (Array.isArray(ring.material)) {
          ring.material.forEach((m) => {
            m.opacity = Math.max(0, 0.4 - scanRadius / maxDist * 0.4);
          });
        } else if (ring.material) {
          ring.material.opacity = Math.max(
            0,
            0.4 - (scanRadius / maxDist) * 0.4
          );
        }

        nodes.forEach((n) => {
          if (!n.scanned && n.dist <= scanRadius) {
            n.scanned = true;
            n.mat.color.copy(n.status);
          }
        });
        if (scanRadius > maxDist + 0.6) {
          scanning = false;
          pauseTimer = 0;
        }
      } else {
        pauseTimer += dt;
        if (pauseTimer > 2.6) {
          resetScan();
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      // Clean up geometries
      nodeGeo.dispose();
      edgeGeo.dispose();
      ringGeo.dispose();

      // Clean up materials
      nodes.forEach((n) => n.mat.dispose());
      edgeMat.dispose();
      ringMat.dispose();

      // Clean up renderer
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="graph-canvas" />;
}
