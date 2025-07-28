import React, { useRef, useEffect } from 'react';
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  ShaderChunk,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  SphereGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

class ThreeBoilerplate {
  #config;
  canvas;
  camera;
  cameraMinAspect;
  cameraMaxAspect;
  cameraFov;
  maxPixelRatio;
  minPixelRatio;
  scene;
  renderer;
  #postprocessing;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render = this.#renderScene;
  onBeforeRender = () => {};
  onAfterRender = () => {};
  onAfterResize = () => {};
  #isIntersecting = false;
  #isAnimating = false;
  isDisposed = false;
  #intersectionObserver;
  #resizeObserver;
  #resizeTimeout;
  #clock = new Clock();
  #time = { elapsed: 0, delta: 0 };
  #animationFrameId;

  constructor(config) {
    this.#config = { ...config };
    this.#setupCamera();
    this.#setupScene();
    this.#setupRenderer();
    this.resize();
    this.#setupEventListeners();
  }

  #setupCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }

  #setupScene() {
    this.scene = new Scene();
  }

  #setupRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas;
    } else if (this.#config.id) {
      this.canvas = document.getElementById(this.#config.id);
    } else {
      console.error("Three: Missing canvas or id parameter");
    }
    this.canvas.style.display = "block";
    const rendererParams = {
      canvas: this.canvas,
      powerPreference: "high-performance",
      ...(this.#config.rendererOptions ?? {}),
    };
    this.renderer = new WebGLRenderer(rendererParams);
    this.renderer.outputColorSpace = SRGBColorSpace;
  }

  #setupEventListeners() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener("resize", this.#onResize.bind(this));
      if (this.#config.size === "parent" && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
        this.#resizeObserver.observe(this.canvas.parentNode);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener("visibilitychange", this.#onVisibilityChange.bind(this));
  }

  #cleanupEventListeners() {
    window.removeEventListener("resize", this.#onResize.bind(this));
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.#onVisibilityChange.bind(this));
  }

  #onIntersection(entries) {
    this.#isIntersecting = entries[0].isIntersecting;
    this.#isIntersecting ? this.#startAnimation() : this.#stopAnimation();
  }

  #onVisibilityChange() {
    if (this.#isIntersecting) {
      document.hidden ? this.#stopAnimation() : this.#startAnimation();
    }
  }

  #onResize() {
    if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
    this.#resizeTimeout = setTimeout(this.resize.bind(this), 100);
  }

  resize() {
    let newWidth, newHeight;
    if (this.#config.size instanceof Object) {
      newWidth = this.#config.size.width;
      newHeight = this.#config.size.height;
    } else if (this.#config.size === "parent" && this.canvas.parentNode) {
      newWidth = this.canvas.parentNode.offsetWidth;
      newHeight = this.canvas.parentNode.offsetHeight;
    } else {
      newWidth = window.innerWidth;
      newHeight = window.innerHeight;
    }
    this.size.width = newWidth;
    this.size.height = newHeight;
    this.size.ratio = newWidth / newHeight;
    this.#updateCamera();
    this.#updateRendererSize();
    this.onAfterResize(this.size);
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFov(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  #adjustFov(aspect) {
    const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / aspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(tanFov));
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovInRad = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fovInRad / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if (this.camera.isOrthographicCamera) {
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
    }
  }

  #updateRendererSize() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#postprocessing?.setSize(this.size.width, this.size.height);
    let pixelRatio = window.devicePixelRatio;
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
      pixelRatio = this.maxPixelRatio;
    } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
      pixelRatio = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }

  get postprocessing() {
    return this.#postprocessing;
  }

  set postprocessing(pp) {
    this.#postprocessing = pp;
    this.render = pp.render.bind(pp);
  }

  #startAnimation() {
    if (this.#isAnimating) return;
    const animate = () => {
      this.#animationFrameId = requestAnimationFrame(animate);
      this.#time.delta = this.#clock.getDelta();
      this.#time.elapsed += this.#time.delta;
      this.onBeforeRender(this.#time);
      this.render();
      this.onAfterRender(this.#time);
    };
    this.#isAnimating = true;
    this.#clock.start();
    animate();
  }

  #stopAnimation() {
    if (this.#isAnimating) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#isAnimating = false;
      this.#clock.stop();
    }
  }

  #renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse((object) => {
      if (object.isMesh && typeof object.material === "object" && object.material !== null) {
        Object.keys(object.material).forEach((key) => {
          const value = object.material[key];
          if (value !== null && typeof value === "object" && typeof value.dispose === "function") {
            value.dispose();
          }
        });
        object.material.dispose();
        object.geometry.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    this.#cleanupEventListeners();
    this.#stopAnimation();
    this.clear();
    this.#postprocessing?.dispose();
    this.renderer.dispose();
    this.isDisposed = true;
  }
}

const elementMap = new Map();
const pointerPosition = new Vector2();
let isListening = false;

function createPointerListener(config) {
  const listener = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    ...config,
  };

  (function(element, listener) {
    if (!elementMap.has(element)) {
      elementMap.set(element, listener);
      if (!isListening) {
        document.body.addEventListener("pointermove", onPointerMove);
        document.body.addEventListener("pointerleave", onPointerLeave);
        document.body.addEventListener("click", onPointerClick);
        isListening = true;
      }
    }
  })(config.domElement, listener);

  listener.dispose = () => {
    const element = config.domElement;
    elementMap.delete(element);
    if (elementMap.size === 0) {
      document.body.removeEventListener("pointermove", onPointerMove);
      document.body.removeEventListener("pointerleave", onPointerLeave);
      document.body.removeEventListener("click", onPointerClick);
      isListening = false;
    }
  };
  return listener;
}

function onPointerMove(event) {
  pointerPosition.x = event.clientX;
  pointerPosition.y = event.clientY;
  for (const [element, listener] of elementMap) {
    const rect = element.getBoundingClientRect();
    if (isPointerOverElement(rect)) {
      updatePointerPosition(listener, rect);
      if (!listener.hover) {
        listener.hover = true;
        listener.onEnter(listener);
      }
      listener.onMove(listener);
    } else if (listener.hover) {
      listener.hover = false;
      listener.onLeave(listener);
    }
  }
}

function onPointerClick(event) {
  pointerPosition.x = event.clientX;
  pointerPosition.y = event.clientY;
  for (const [element, listener] of elementMap) {
    const rect = element.getBoundingClientRect();
    updatePointerPosition(listener, rect);
    if (isPointerOverElement(rect)) listener.onClick(listener);
  }
}

function onPointerLeave() {
  for (const listener of elementMap.values()) {
    if (listener.hover) {
      listener.hover = false;
      listener.onLeave(listener);
    }
  }
}

function updatePointerPosition(listener, rect) {
  const { position, nPosition } = listener;
  position.x = pointerPosition.x - rect.left;
  position.y = pointerPosition.y - rect.top;
  nPosition.x = (position.x / rect.width) * 2 - 1;
  nPosition.y = (-position.y / rect.height) * 2 + 1;
}

function isPointerOverElement(rect) {
  const { x, y } = pointerPosition;
  const { left, top, width, height } = rect;
  return x >= left && x <= left + width && y >= top && y <= top + height;
}

const { randFloat, randFloatSpread } = MathUtils;
const controlSpherePos = new Vector3();
const currentSpherePos = new Vector3();
const otherSpherePos = new Vector3();
const controlSphereVel = new Vector3();
const currentSphereVel = new Vector3();
const otherSphereVel = new Vector3();
const differenceVec = new Vector3();
const collisionVec = new Vector3();
const velChangeA = new Vector3();
const velChangeB = new Vector3();

class SpherePhysicsEngine {
  constructor(config) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();
    this.initPositions();
    this.initSizes();
  }

  initPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const stride = 3 * i;
      positionData[stride] = randFloatSpread(2 * config.maxX);
      positionData[stride + 1] = randFloatSpread(2 * config.maxY);
      positionData[stride + 2] = randFloatSpread(2 * config.maxZ);
    }
  }

  initSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = randFloat(config.minSize, config.maxSize);
    }
  }

  update(time) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let startIndex = 0;
    if (config.controlSphere0) {
      startIndex = 1;
      controlSpherePos.fromArray(positionData, 0);
      controlSpherePos.lerp(center, 0.1).toArray(positionData, 0);
      controlSphereVel.set(0, 0, 0).toArray(velocityData, 0);
    }

    for (let idx = startIndex; idx < config.count; idx++) {
      const base = 3 * idx;
      currentSpherePos.fromArray(positionData, base);
      currentSphereVel.fromArray(velocityData, base);
      currentSphereVel.y -= time.delta * config.gravity * sizeData[idx];
      currentSphereVel.multiplyScalar(config.friction);
      currentSphereVel.clampLength(0, config.maxVelocity);
      currentSpherePos.add(currentSphereVel);
      currentSpherePos.toArray(positionData, base);
      currentSphereVel.toArray(velocityData, base);
    }

    for (let idx = startIndex; idx < config.count; idx++) {
      const base = 3 * idx;
      currentSpherePos.fromArray(positionData, base);
      currentSphereVel.fromArray(velocityData, base);
      const radius = sizeData[idx];
      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx;
        otherSpherePos.fromArray(positionData, otherBase);
        otherSphereVel.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[jdx];
        differenceVec.copy(otherSpherePos).sub(currentSpherePos);
        const dist = differenceVec.length();
        const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          collisionVec.copy(differenceVec).normalize().multiplyScalar(0.5 * overlap);
          velChangeA.copy(collisionVec).multiplyScalar(Math.max(currentSphereVel.length(), 1));
          velChangeB.copy(collisionVec).multiplyScalar(Math.max(otherSphereVel.length(), 1));
          currentSpherePos.sub(collisionVec);
          currentSphereVel.sub(velChangeA);
          currentSpherePos.toArray(positionData, base);
          currentSphereVel.toArray(velocityData, base);
          otherSpherePos.add(collisionVec);
          otherSphereVel.add(velChangeB);
          otherSpherePos.toArray(positionData, otherBase);
          otherSphereVel.toArray(velocityData, otherBase);
        }
      }

      if (config.controlSphere0) {
        differenceVec.copy(controlSpherePos).sub(currentSpherePos);
        const dist = differenceVec.length();
        const sumRadius0 = radius + sizeData[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          collisionVec.copy(differenceVec).normalize().multiplyScalar(diff);
          velChangeA.copy(collisionVec).multiplyScalar(Math.max(currentSphereVel.length(), 2));
          currentSpherePos.sub(collisionVec);
          currentSphereVel.sub(velChangeA);
        }
      }

      if (Math.abs(currentSpherePos.x) + radius > config.maxX) {
        currentSpherePos.x = Math.sign(currentSpherePos.x) * (config.maxX - radius);
        currentSphereVel.x = -currentSphereVel.x * config.wallBounce;
      }

      if (config.gravity === 0) {
        if (Math.abs(currentSpherePos.y) + radius > config.maxY) {
          currentSpherePos.y = Math.sign(currentSpherePos.y) * (config.maxY - radius);
          currentSphereVel.y = -currentSphereVel.y * config.wallBounce;
        }
      } else if (currentSpherePos.y - radius < -config.maxY) {
        currentSpherePos.y = -config.maxY + radius;
        currentSphereVel.y = -currentSphereVel.y * config.wallBounce;
      }
      
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(currentSpherePos.z) + radius > maxBoundary) {
        currentSpherePos.z = Math.sign(currentSpherePos.z) * (config.maxZ - radius);
        currentSphereVel.z = -currentSphereVel.z * config.wallBounce;
      }
      
      currentSpherePos.toArray(positionData, base);
      currentSphereVel.toArray(velocityData, base);
    }
  }
}

class GlassyMaterial extends MeshPhysicalMaterial {
  constructor(params) {
    super(params);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
    };
    this.defines.USE_UV = "";
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader = `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
        ${shader.fragmentShader}
      `;
      shader.fragmentShader = shader.fragmentShader.replace("void main() {", `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }
        void main() {
      `);
      const modifiedLightsFragment = ShaderChunk.lights_fragment_begin.replaceAll("RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );", `
        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
        RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
      `);
      shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_begin>", modifiedLightsFragment);
    };
  }
}

const defaultSphereSystemConfig = {
  count: 200,
  colors: [0, 0, 0],
  ambientColor: 16777215,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true
};

const tempObject = new Object3D();

class SphereSystem extends InstancedMesh {
  constructor(renderer, config = {}) {
    const finalConfig = { ...defaultSphereSystemConfig, ...config };
    const environment = new RoomEnvironment();
    const pmremGenerator = new PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromScene(environment).texture;
    const geometry = new SphereGeometry();
    const material = new GlassyMaterial({ envMap: envMap, ...finalConfig.materialParams });
    material.envMapRotation.x = -Math.PI / 2;
    super(geometry, material, finalConfig.count);
    this.config = finalConfig;
    this.physics = new SpherePhysicsEngine(finalConfig);
    this.initLights();
    this.setColors(finalConfig.colors);
  }

  initLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }

  setColors(colors) {
    if (Array.isArray(colors) && colors.length > 1) {
      const colorMapper = ((colorArray) => {
        let threeColors = [];
        
        function setColors(newColors) {
          threeColors = [];
          newColors.forEach((col) => {
            threeColors.push(new Color(col));
          });
        }
        setColors(colorArray);

        return {
          setColors,
          getColorAt: function(ratio, out = new Color()) {
            const scaled = Math.max(0, Math.min(1, ratio)) * (colorArray.length - 1);
            const idx = Math.floor(scaled);
            const start = threeColors[idx];
            if (idx >= colorArray.length - 1) return start.clone();
            const alpha = scaled - idx;
            const end = threeColors[idx + 1];
            out.r = start.r + alpha * (end.r - start.r);
            out.g = start.g + alpha * (end.g - start.g);
            out.b = start.b + alpha * (end.b - start.b);
            return out;
          },
        };
      })(colors);
      
      for (let idx = 0; idx < this.count; idx++) {
        this.setColorAt(idx, colorMapper.getColorAt(idx / this.count));
        if (idx === 0) {
          this.light.color.copy(colorMapper.getColorAt(idx / this.count));
        }
      }
      this.instanceColor.needsUpdate = true;
    }
  }

  update(time) {
    this.physics.update(time);
    for (let idx = 0; idx < this.count; idx++) {
      tempObject.position.fromArray(this.physics.positionData, 3 * idx);
      if (idx === 0 && this.config.followCursor === false) {
        tempObject.scale.setScalar(0);
      } else {
        tempObject.scale.setScalar(this.physics.sizeData[idx]);
      }
      tempObject.updateMatrix();
      this.setMatrixAt(idx, tempObject.matrix);
      if (idx === 0) this.light.position.copy(tempObject.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createBallpit(canvas, config = {}) {
  const three = new ThreeBoilerplate({
    canvas: canvas,
    size: "parent",
    rendererOptions: { antialias: true, alpha: true },
  });

  let sphereSystem;
  three.renderer.toneMapping = ACESFilmicToneMapping;
  three.camera.position.set(0, 0, 20);
  three.camera.lookAt(0, 0, 0);
  three.cameraMaxAspect = 1.5;
  three.resize();

  initialize(config);

  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const intersectPoint = new Vector3();
  let paused = false;

  const pointerListener = createPointerListener({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointerListener.nPosition, three.camera);
      three.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, intersectPoint);
      sphereSystem.physics.center.copy(intersectPoint);
      sphereSystem.config.controlSphere0 = true;
    },
    onLeave() {
      sphereSystem.config.controlSphere0 = false;
    },
  });

  function initialize(newConfig) {
    if (sphereSystem) {
      three.clear();
      three.scene.remove(sphereSystem);
    }
    sphereSystem = new SphereSystem(three.renderer, newConfig);
    three.scene.add(sphereSystem);
  }

  three.onBeforeRender = (time) => {
    if (!paused) sphereSystem.update(time);
  };

  three.onAfterResize = (size) => {
    sphereSystem.config.maxX = size.wWidth / 2;
    sphereSystem.config.maxY = size.wHeight / 2;
  };

  return {
    three: three,
    get spheres() {
      return sphereSystem;
    },
    setCount(count) {
      initialize({ ...sphereSystem.config, count: count });
    },
    togglePause() {
      paused = !paused;
    },
    dispose() {
      pointerListener.dispose();
      three.dispose();
    },
  };
}

const Ballpit = ({ className = '', followCursor = true, ...props }) => {
  const canvasRef = useRef(null);
  const spheresInstanceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    spheresInstanceRef.current = createBallpit(canvas, { followCursor, ...props });
    return () => {
      if (spheresInstanceRef.current) {
        spheresInstanceRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      className={className}
      ref={canvasRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Ballpit;