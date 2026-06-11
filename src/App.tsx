import React, { useEffect, useRef, useState } from 'react'

type Stat = {
  bundle: number
  weight: number
  dom: number
  resources: number
  js: number
  css: number
  img: number
  cache: number
  memory: number
  load: number
  rps: number
  pl: number
}

const limits = {
  weight: [512_000, 1_048_576],
  dom: [1_000, 2_000],
  resources: [50, 100],
  js: [153_600, 307_200],
  css: [51_200, 102_400],
  img: [307_200, 716_800],
  cache: [0.6, 0.4]
}

const color = (v: number, [g, y]: number[], inv = false) =>
  inv
    ? v >= g
      ? 'border-green-500/30 bg-green-500/20'
      : v >= y
      ? 'border-yellow-500/30 bg-yellow-500/20'
      : 'border-red-500/30 bg-red-500/20'
    : v <= g
    ? 'border-green-500/30 bg-green-500/20'
    : v <= y
    ? 'border-yellow-500/30 bg-yellow-500/20'
    : 'border-red-500/30 bg-red-500/20'

export default function App() {
  const [stats, setStats] = useState<Stat>({
    bundle: 0,
    weight: 0,
    dom: 0,
    resources: 0,
    js: 0,
    css: 0,
    img: 0,
    cache: 0,
    memory: 0,
    load: 0,
    rps: 0,
    pl: 0
  })
  // affiche le dashboard sans attendre le chargement complet des ressources
  const [ready, setReady] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    let frameId = 0
    let resizeTimeout = 0

    // charge three.js uniquement quand la visualisation devient utile
    const initScene = async () => {
      const THREE = await import('three')
      if (disposed) return

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1_000)
      camera.position.z = 30
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setSize(canvas.clientWidth || 640, canvas.clientHeight || 480)
      // limite la résolution du canvas pour réduire le coût gpu
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      const ambient = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambient)
      const dir = new THREE.DirectionalLight(0xffffff, 0.8)
      dir.position.set(25, 25, 25)
      scene.add(dir)

      // réduit le nombre d'objets 3d affichés
      for (let i = 0; i < 8; i++) {
        const mat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff, shininess: 80 })
        const geo = new THREE.BoxGeometry(1 + Math.random(), 1 + Math.random(), 1 + Math.random())
        const cube = new THREE.Mesh(geo, mat)
        cube.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50)
        scene.add(cube)
      }

      let lastFrame = 0
      // limite le rendu 3d pour réduire le coût cpu/gpu
      const animate = (time = 0) => {
        frameId = requestAnimationFrame(animate)
        if (document.hidden || time - lastFrame < 1000 / 15) return
        lastFrame = time
        let i = 0
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.rotation.x += 0.006 * ((i % 3) + 1)
            object.rotation.y += 0.009 * ((i % 4) + 1)
          }
          i++
        })
        renderer.render(scene, camera)
      }

      const onResize = () => {
        window.clearTimeout(resizeTimeout)
        resizeTimeout = window.setTimeout(() => {
          if (!canvas.clientWidth || !canvas.clientHeight) return
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
          renderer.setSize(canvas.clientWidth, canvas.clientHeight)
        }, 200)
      }

      const renderOnVisibilityChange = () => {
        if (document.hidden) return
        if (!canvas.clientWidth || !canvas.clientHeight) return
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(canvas.clientWidth, canvas.clientHeight)
        renderer.render(scene, camera)
      }

      window.addEventListener('resize', onResize)
      document.addEventListener('visibilitychange', renderOnVisibilityChange)
      animate()

      return () => {
        window.removeEventListener('resize', onResize)
        document.removeEventListener('visibilitychange', renderOnVisibilityChange)
        renderer.dispose()
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose()
            const materials = Array.isArray(object.material) ? object.material : [object.material]
            materials.forEach((material) => material.dispose())
          }
        })
      }
    }

    let disposeScene: (() => void) | undefined
    let observer: IntersectionObserver | undefined
    const startScene = () => {
      initScene().then((dispose) => {
        if (disposed) {
          dispose?.()
          return
        }
        disposeScene = dispose
      })
    }

    // démarre la scène seulement quand le canvas approche de l'écran
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer?.disconnect()
        startScene()
      }, { rootMargin: '200px' })
      observer.observe(canvas)
    } else {
      startScene()
    }

    return () => {
      disposed = true
      observer?.disconnect()
      cancelAnimationFrame(frameId)
      window.clearTimeout(resizeTimeout)
      disposeScene?.()
    }
  }, [])

  useEffect(() => {
    const startTime = performance.now();

    const computeStats = () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      if (!nav) return;

      const totalWeight = nav.transferSize + resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const jsWeight = resources.filter(r => r.initiatorType === 'script').reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const cssWeight = resources.filter(r => r.initiatorType === 'link').reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const imgWeight = resources
        .filter(
          r =>
            r.initiatorType === 'img' ||
            r.initiatorType === 'css' ||
            /\.(jpg|jpeg|png|gif|webp)$/i.test(r.name)
        )
        .reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalEncoded = nav.encodedBodySize + resources.reduce((sum, r) => sum + (r.encodedBodySize || 0), 0);
      const cacheRatio = totalEncoded ? 1 - totalWeight / totalEncoded : 0;

      setStats(s => ({
        ...s,
        bundle: nav.transferSize,
        weight: totalWeight,
        dom: document.getElementsByTagName('*').length,
        resources: resources.length,
        js: jsWeight,
        css: cssWeight || s.css,
        img: imgWeight || s.img,
        cache: cacheRatio,
        pl: Math.round(performance.now() - startTime)
      }));
      setReady(true);
    };

    if (document.readyState === 'complete') {
      computeStats();
    } else {
      window.addEventListener('load', computeStats, { once: true });
    }

    // Ajout du rafraîchissement périodique
    const interval = setInterval(computeStats, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const po = new PerformanceObserver(list => {
      const res = list.getEntries() as PerformanceResourceTiming[]
      const added = res.reduce((a, b) => a + (b.transferSize || 0), 0)
      const jsAdd = res.filter(r => r.initiatorType === 'script').reduce((a, b) => a + (b.transferSize || 0), 0)
      const cssAdd = res.filter(r => r.initiatorType === 'link' || /\.css$/i.test(r.name)).reduce((a, b) => a + (b.transferSize || 0), 0) 
      const isImg = (r: PerformanceResourceTiming) => r.initiatorType === 'img' || r.initiatorType === 'css' || /\.(avif|jpe?g|png|gif|webp|svg)$/i.test(r.name);
      const imgAdd = res.filter(isImg).reduce((a, b) => a + (b.transferSize || 0), 0);
      const encAdd = res.reduce((a, b) => a + (b.encodedBodySize || 0), 0)
      setStats(s => {
        const weight = s.weight + added
        const enc = (1 - s.cache) * s.weight + encAdd
        const cache = enc ? 1 - weight / enc : s.cache
        return { ...s, weight, js: s.js + jsAdd, css: s.css + cssAdd, img: s.img + imgAdd, cache }
      })
    })
    po.observe({ type: 'resource', buffered: true })
    return () => po.disconnect()
  }, [])

  useEffect(() => {
    if (intervalRef.current) return

    // limite le polling serveur aux métriques utiles
    intervalRef.current = window.setInterval(async () => {
      try {
        const { memory, load, rps } = await fetch('http://localhost:5001/api/server', {
          cache: 'no-store'
        }).then(r => r.json())

        setStats(s => ({
          ...s,
          memory: Math.ceil(memory / 1_048_576),
          load,
          rps
        }))
      } catch (err) {
        console.warn('Erreur lors du fetch des stats serveur', err)
      }
    }, 5_000)

    return () => clearInterval(intervalRef.current)
  }, [])

  if (!ready)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-center">
          <div className="animate-spin h-24 w-24 rounded-full border-b-2 border-white mx-auto mb-6" />
          <p className="text-white text-xl font-semibold">Chargement…</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* remplace l'image de fond par un effet css sans requête réseau */}
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.45),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.35),_transparent_30%)]" />
      <div className="relative z-10 container mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6 animate-pulse">
            EcoTraining Platform
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">Plateforme d'entraînement avancée pour l'optimisation web et l'éco-conception</p>
        </header>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          <Card icon="db" title="Poids HTML" value={`${(stats.bundle / 1_024).toFixed(0)} kB`} tone={color(stats.bundle, limits.weight)} tip="transferSize du document" />
          <Card icon="net" title="Poids page" value={`${(stats.weight / 1_024).toFixed(0)} kB`} tone={color(stats.weight, limits.weight)} tip="somme transferSize" />
          <Card icon="dom" title="DOM" value={stats.dom} tone={color(stats.dom, limits.dom)} tip="nombre de nœuds" />
          <Card icon="req" title="Ressources" value={stats.resources} tone={color(stats.resources, limits.resources)} tip="entries PerformanceResourceTiming" />
          <Card icon="js" title="JS" value={`${(stats.js / 1_024).toFixed(0)} kB`} tone={color(stats.js, limits.js)} />
          <Card icon="css" title="CSS" value={`${(stats.css / 1024).toFixed(1)} kB`} tone={color(stats.css, limits.css)} />
          <Card icon="img" title="Images" value={`${(stats.img / 1_024).toFixed(0)} kB`} tone={color(stats.img, limits.img)} />
          <Card icon="%" title="Cache hit" value={`${Math.round(stats.cache * 100)} %`} tone={color(stats.cache, limits.cache, true)} />
          <Card icon="ram" title="RAM serveur" value={`${stats.memory} MB`} tone="bg-white/10 border-white/20" />
          <Card icon="cpu" title="CPU" value={stats.load} tone="bg-white/10 border-white/20" />
          <Card icon="rps" title="RPS" value={stats.rps} tone="bg-white/10 border-white/20" />
          <Card icon="ms" title="Load page" value={`${stats.pl} ms`} tone="bg-white/10 border-white/20" />
        </section>
        <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-yellow-400 text-2xl font-bold" aria-hidden="true">3d</span>
            <h2 className="text-2xl font-bold text-white">Visualisation 3D</h2>
          </div>
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="rounded-xl border border-white/20 shadow-2xl w-full h-96" />
          </div>
          <p className="text-slate-300 text-center mt-4">Visualisation 3D légère</p>
        </section>
      </div>
    </div>
  )
}

function Card({ icon, title, value, tone, tip }: { icon: string; title: string; value: string | number; tone: string; tip?: string }) {
  return (
    <div className={`backdrop-blur-lg rounded-2xl p-8 border hover:bg-white/15 hover:scale-105 transition ${tone}`} title={tip || ''}>
      <div className="flex items-center justify-between mb-4">
        {/* remplace les icônes js par du texte court pour réduire le bundle */}
        <span className="text-sm font-bold uppercase tracking-wide text-white/70" aria-hidden="true">{icon}</span>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  )
}
