'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type ViewerHandle = { snapshot: () => string | null; resetView: () => void }

type Props = {
  /** neun Zahlen je Dreieck, Millimeter, Z nach oben */
  positions: Float32Array
  color: string
  build: { x: number; y: number }
}

/** Dreh- und zoombare 3D-Ansicht des hochgeladenen Modells auf dem Druckbett. */
export const Viewer = forwardRef<ViewerHandle, Props>(function Viewer({ positions, color, build }, ref) {
  const holder = useRef<HTMLDivElement>(null)
  const state = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    material: THREE.MeshStandardMaterial
    fit: () => void
  } | null>(null)

  useEffect(() => {
    const el = holder.current
    if (!el) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    } catch {
      el.dataset.error = '1'
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0xf6f7f9)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96ab, 1.15))
    const sun = new THREE.DirectionalLight(0xffffff, 1.6)
    sun.position.set(1.2, 2, 1.5)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0xffffff, 0.5)
    fill.position.set(-1.5, 0.6, -1)
    scene.add(fill)

    // Modell: mittig auf das Bett stellen. Dateien haben Z oben, die Ansicht Y oben.
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.computeBoundingBox()
    const box = geometry.boundingBox as THREE.Box3
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    geometry.translate(-center.x, -center.y, -box.min.z)
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.04, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geometry, material)
    const group = new THREE.Group()
    group.rotation.x = -Math.PI / 2
    group.add(mesh)
    scene.add(group)

    // Druckbett mit 10-mm-Raster
    const bedSize = Math.max(build.x, build.y, size.x * 1.2, size.y * 1.2)
    const grid = new THREE.GridHelper(bedSize, Math.max(1, Math.round(bedSize / 10)), 0x2163b5, 0xd0d6e0)
    ;(grid.material as THREE.Material).transparent = true
    ;(grid.material as THREE.Material).opacity = 0.7
    grid.position.y = -0.05
    scene.add(grid)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1

    const radius = Math.max(size.length() / 2, 1)
    const fit = () => {
      const target = new THREE.Vector3(0, size.z / 2, 0)
      const dist = (radius / Math.sin((camera.fov * Math.PI) / 360)) * 1.15
      camera.position.copy(target).add(new THREE.Vector3(0.75, 0.55, 0.9).normalize().multiplyScalar(dist))
      camera.near = dist / 200
      camera.far = dist * 40
      camera.updateProjectionMatrix()
      controls.target.copy(target)
      controls.update()
    }

    const resize = () => {
      const w = el.clientWidth || 600
      const h = el.clientHeight || 420
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    fit()
    const observer = new ResizeObserver(resize)
    observer.observe(el)

    let frame = 0
    const loop = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(loop)
    }
    loop()

    state.current = { renderer, scene, camera, controls, material, fit }
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      geometry.dispose()
      material.dispose()
      grid.geometry.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      state.current = null
    }
  }, [positions, build.x, build.y]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    state.current?.material.color.set(color)
  }, [color])

  useImperativeHandle(ref, () => ({
    snapshot: () => {
      const s = state.current
      if (!s) return null
      s.renderer.render(s.scene, s.camera)
      try {
        return s.renderer.domElement.toDataURL('image/jpeg', 0.85)
      } catch {
        return null
      }
    },
    resetView: () => state.current?.fit(),
  }))

  return (
    <div
      ref={holder}
      className="viewer__canvas"
      role="img"
      aria-label="3D-Ansicht des hochgeladenen Modells. Mit der Maus oder dem Finger drehen, mit dem Mausrad oder zwei Fingern zoomen."
    />
  )
})
