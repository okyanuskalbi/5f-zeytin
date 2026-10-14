import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ToneMappingConfig } from '../types';
import { Eye, Sun, Sliders, RotateCw, Sparkles, Check } from 'lucide-react';

interface ThreeOliveBottleViewerProps {
  config: ToneMappingConfig;
  onUpdateConfig?: (newConfig: ToneMappingConfig) => void;
  interactiveControls?: boolean;
}

export const ThreeOliveBottleViewer: React.FC<ThreeOliveBottleViewerProps> = ({
  config,
  onUpdateConfig,
  interactiveControls = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const bottleGroupRef = useRef<THREE.Group | null>(null);
  const glassMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const oilMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const [compareMode, setCompareMode] = useState(false); // Before / After Tone Mapping
  const [isRotating, setIsRotating] = useState(true);
  const [hudOpen, setHudOpen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 3.8);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with Mandatory Tone Mapping & sRGB
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Set tone mapping according to config
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = config.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig (Key, Fill, Rim, Ambient)
    const ambientLight = new THREE.AmbientLight(0xfff7ed, config.ambientIntensity);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, config.keyLightIntensity);
    keyLight.position.set(2.5, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, config.fillLightIntensity);
    fillLight.position.set(-3, 1.5, 2);
    fillLightRef.current = fillLight;
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, config.rimLightIntensity);
    rimLight.position.set(0, 3, -3);
    rimLightRef.current = rimLight;
    scene.add(rimLight);

    // 6. Ground Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(3, 3);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(28, 28, 28, 0.45)');
    grad.addColorStop(0.5, 'rgba(28, 28, 28, 0.15)');
    grad.addColorStop(1, 'rgba(28, 28, 28, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(canvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;

    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.15;
    scene.add(shadowPlane);

    // 7. Procedural AFİNA Label Texture
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 1024;
    labelCanvas.height = 1024;
    const lctx = labelCanvas.getContext('2d')!;

    // Ivory background
    lctx.fillStyle = '#F5F1E7';
    lctx.fillRect(0, 0, 1024, 1024);

    // Gold borders
    lctx.strokeStyle = '#D4B483';
    lctx.lineWidth = 14;
    lctx.strokeRect(40, 40, 944, 944);
    lctx.lineWidth = 4;
    lctx.strokeRect(60, 60, 904, 904);

    // AFİNA Emblem
    lctx.fillStyle = '#243A29';
    lctx.font = 'bold 32px serif';
    lctx.textAlign = 'center';
    lctx.fillText('• 2 0 2 5 / 2 0 2 6  E R K E N  H A S A T •', 512, 170);

    // Main Brand Name
    lctx.font = '900 102px serif';
    lctx.fillStyle = '#243A29';
    lctx.fillText('AFİNA', 512, 330);

    // Subtitle
    lctx.font = 'bold 42px serif';
    lctx.fillStyle = '#D4B483';
    lctx.fillText('Z E Y T İ N', 512, 400);

    // Decorative Olive Branch Icon
    lctx.fillStyle = '#243A29';
    lctx.font = 'italic 34px sans-serif';
    lctx.fillText('“Köklerinden aldığı güçle büyüyor.”', 512, 480);

    // Gold divider line
    lctx.strokeStyle = '#D4B483';
    lctx.lineWidth = 6;
    lctx.beginPath();
    lctx.moveTo(250, 520);
    lctx.lineTo(774, 520);
    lctx.stroke();

    // Oil Specs
    lctx.fillStyle = '#1C1C1C';
    lctx.font = '600 36px sans-serif';
    lctx.fillText('SOĞUK SIKIM NATÜREL SIZMA', 512, 590);

    lctx.font = '400 30px sans-serif';
    lctx.fillStyle = '#555';
    lctx.fillText('Asitlik Oranı: Max %0.2 • Polifenol: 480+ mg/kg', 512, 650);
    lctx.fillText('Ekim Hasadı • 24°C Oksijensiz Kapalı Devre', 512, 710);

    // Volume badge
    lctx.fillStyle = '#243A29';
    lctx.fillRect(380, 780, 264, 80);
    lctx.fillStyle = '#F5F1E7';
    lctx.font = 'bold 38px sans-serif';
    lctx.fillText('500 ml e', 512, 836);

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    labelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // 8. Construct the AFİNA Olive Oil Bottle Group
    const bottleGroup = new THREE.Group();
    bottleGroupRef.current = bottleGroup;
    scene.add(bottleGroup);

    // (A) Glass Body
    // Shape using LatheGeometry for smooth cylindrical olive oil bottle profile
    const points: THREE.Vector2[] = [];
    // Base
    points.push(new THREE.Vector2(0, -1.1));
    points.push(new THREE.Vector2(0.48, -1.1));
    points.push(new THREE.Vector2(0.5, -1.05));
    // Main Body
    points.push(new THREE.Vector2(0.5, 0.45));
    // Shoulder curve to neck
    points.push(new THREE.Vector2(0.48, 0.65));
    points.push(new THREE.Vector2(0.35, 0.85));
    points.push(new THREE.Vector2(0.18, 1.0));
    // Neck
    points.push(new THREE.Vector2(0.18, 1.35));
    // Lip ring
    points.push(new THREE.Vector2(0.21, 1.37));
    points.push(new THREE.Vector2(0.21, 1.43));
    points.push(new THREE.Vector2(0.18, 1.45));
    points.push(new THREE.Vector2(0.14, 1.45));

    const bottleGeo = new THREE.LatheGeometry(points, 48);
    bottleGeo.computeVertexNormals();

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1b2d1d, // Deep dark olive green tint
      transmission: 0.94,
      opacity: 1,
      transparent: true,
      roughness: config.glassRoughness,
      ior: 1.52,
      thickness: 0.6,
      attenuationColor: new THREE.Color(0x324d27),
      attenuationDistance: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      depthWrite: false
    });
    glassMaterialRef.current = glassMat;
    const bottleMesh = new THREE.Mesh(bottleGeo, glassMat);
    bottleMesh.castShadow = true;
    bottleGroup.add(bottleMesh);

    // (B) Inner Golden-Green Olive Oil Liquid
    const oilPoints: THREE.Vector2[] = [];
    oilPoints.push(new THREE.Vector2(0, -1.08));
    oilPoints.push(new THREE.Vector2(0.46, -1.08));
    oilPoints.push(new THREE.Vector2(0.47, 0.45));
    oilPoints.push(new THREE.Vector2(0.33, 0.82));
    oilPoints.push(new THREE.Vector2(0.16, 0.98));
    oilPoints.push(new THREE.Vector2(0.16, 1.15)); // Fill level
    oilPoints.push(new THREE.Vector2(0, 1.15));

    const oilGeo = new THREE.LatheGeometry(oilPoints, 36);
    const oilMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.oilColor || '#8C9A27'),
      transmission: config.oilTransmission,
      roughness: 0.05,
      ior: 1.47,
      thickness: 1.2,
      attenuationColor: new THREE.Color(0x7c8c19),
      attenuationDistance: 0.45,
      clearcoat: 0.8
    });
    oilMaterialRef.current = oilMat;
    const oilMesh = new THREE.Mesh(oilGeo, oilMat);
    bottleGroup.add(oilMesh);

    // (C) Cylindrical Label Wrap
    const labelGeo = new THREE.CylinderGeometry(0.505, 0.505, 0.95, 48, 1, true, -Math.PI / 2.3, Math.PI / 1.15);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.75,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = -0.22;
    bottleGroup.add(labelMesh);

    // (D) Metallic Gold Foil / Cap
    const capGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.32, 32);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xD4B483, // Champagne gold
      metalness: 0.85,
      roughness: 0.22
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.y = 1.42;
    bottleGroup.add(capMesh);

    // Animation Loop with Smooth Exponential Damping
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (bottleGroupRef.current && isRotating) {
        bottleGroupRef.current.rotation.y += delta * 0.45;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      bottleGeo.dispose();
      glassMat.dispose();
      oilGeo.dispose();
      oilMat.dispose();
      labelGeo.dispose();
      labelMat.dispose();
      capGeo.dispose();
      capMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync config updates with live 3D renderer
  useEffect(() => {
    if (!rendererRef.current) return;
    const renderer = rendererRef.current;

    if (compareMode) {
      // Before Tone Mapping (NoToneMapping test)
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.toneMappingExposure = 1.0;
    } else {
      if (config.operator === 'AgX') {
        renderer.toneMapping = THREE.AgXToneMapping;
      } else if (config.operator === 'Reinhard') {
        renderer.toneMapping = THREE.ReinhardToneMapping;
      } else if (config.operator === 'Linear') {
        renderer.toneMapping = THREE.LinearToneMapping;
      } else {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
      }
      renderer.toneMappingExposure = config.exposure;
    }

    if (keyLightRef.current) keyLightRef.current.intensity = config.keyLightIntensity;
    if (fillLightRef.current) fillLightRef.current.intensity = config.fillLightIntensity;
    if (rimLightRef.current) rimLightRef.current.intensity = config.rimLightIntensity;
    if (ambientLightRef.current) ambientLightRef.current.intensity = config.ambientIntensity;
    if (glassMaterialRef.current) glassMaterialRef.current.roughness = config.glassRoughness;
    if (oilMaterialRef.current) {
      oilMaterialRef.current.transmission = config.oilTransmission;
      oilMaterialRef.current.color = new THREE.Color(config.oilColor || '#8C9A27');
    }
  }, [config, compareMode]);

  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#FAF7F0] to-[#EFECE2] border border-[#D4B483]/40 shadow-xl">
      {/* Three.js canvas container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Badge (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#243A29] text-[#F5F1E7] text-[11px] font-bold shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#D4B483]" />
          <span>AFİNA 3D Gerçek Zamanlı Tone Mapping</span>
        </div>
        <div className="text-[10px] text-[#243A29] bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#D4B483]/30">
          Mod: <strong className="font-semibold">{compareMode ? 'Ham (NoToneMapping)' : config.operator}</strong> • Pozlama: {config.exposure.toFixed(2)}
        </div>
      </div>

      {/* Interactive Controls Top Right (Toggle Rotation & Tone Mapping Comparison) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
            compareMode
              ? 'bg-amber-600 text-white animate-pulse'
              : 'bg-white/90 text-[#243A29] hover:bg-white border border-[#D4B483]/40'
          }`}
          title="Tone Mapping Öncesi/Sonrası Karşılaştır"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{compareMode ? 'Tone Mapping KAPALI' : 'Önce/Sonra Karşılaştır'}</span>
        </button>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className="p-2 rounded-xl bg-white/90 hover:bg-white text-[#243A29] border border-[#D4B483]/40 shadow-md transition-colors"
          title="Dönüşü Durdur / Başlat"
        >
          <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        </button>

        {interactiveControls && (
          <button
            onClick={() => setHudOpen(!hudOpen)}
            className={`p-2 rounded-xl border border-[#D4B483]/40 shadow-md transition-colors cursor-pointer ${
              hudOpen ? 'bg-[#243A29] text-white' : 'bg-white/90 text-[#243A29] hover:bg-white'
            }`}
            title="Işık & Tone Mapping Ayarlarını Aç"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom HUD: Collapsible Dock for Tone Mapping & Light Tweaks */}
      {interactiveControls && hudOpen && onUpdateConfig && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-[#D4B483]/50 rounded-2xl p-4 shadow-2xl animate-fade-in text-xs max-w-xl mx-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
            <span className="font-bold text-[#243A29] flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-[#D4B483]" />
              Işık, Pozlama ve Tone Mapping Kontrolleri
            </span>
            <button
              onClick={() => setHudOpen(false)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              Gizle
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Tone Mapping Operator */}
            <div>
              <label className="text-[10px] text-stone-500 font-bold block mb-1">Tone Mapping</label>
              <select
                value={config.operator}
                onChange={(e) => onUpdateConfig({ ...config, operator: e.target.value as any })}
                className="w-full text-xs p-1.5 bg-[#FAF7F0] border border-stone-200 rounded-lg outline-none font-semibold text-[#243A29]"
              >
                <option value="ACESFilmic">ACES Filmic (Önerilen)</option>
                <option value="AgX">AgX Filmik</option>
                <option value="Reinhard">Reinhard</option>
                <option value="Linear">Linear</option>
              </select>
            </div>

            {/* Exposure Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-stone-500 font-bold mb-1">
                <span>Pozlama</span>
                <span className="text-[#243A29]">{config.exposure.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.0"
                step="0.05"
                value={config.exposure}
                onChange={(e) => onUpdateConfig({ ...config, exposure: parseFloat(e.target.value) })}
                className="w-full accent-[#243A29]"
              />
            </div>

            {/* Key Light Intensity */}
            <div>
              <div className="flex justify-between text-[10px] text-stone-500 font-bold mb-1">
                <span>Ana Işık</span>
                <span className="text-[#243A29]">{config.keyLightIntensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={config.keyLightIntensity}
                onChange={(e) => onUpdateConfig({ ...config, keyLightIntensity: parseFloat(e.target.value) })}
                className="w-full accent-[#243A29]"
              />
            </div>

            {/* Oil Transmission */}
            <div>
              <div className="flex justify-between text-[10px] text-stone-500 font-bold mb-1">
                <span>Yağ Saydamlığı</span>
                <span className="text-[#243A29]">%{Math.round(config.oilTransmission * 100)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.02"
                value={config.oilTransmission}
                onChange={(e) => onUpdateConfig({ ...config, oilTransmission: parseFloat(e.target.value) })}
                className="w-full accent-[#243A29]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
