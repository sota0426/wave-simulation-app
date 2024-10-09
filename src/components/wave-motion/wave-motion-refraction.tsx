// RefractionWaveSimulation.tsx
import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import 'katex/dist/katex.min.css'

interface RefractionWaveProps {
  period: number
  refractiveIndex1: number
  refractiveIndex2: number
  dot: number
  blackThreshold: number
  isRunning: boolean
  refractionBoundary: number // 屈折する境界面の位置
}

function RefractionWave({
  period,
  refractiveIndex1,
  refractiveIndex2,
  dot,
  blackThreshold,
  isRunning,
  refractionBoundary,
}: RefractionWaveProps) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  const timeRef = useRef(0)
  const sourceRef = useRef<THREE.Mesh | null>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(70, 70, dot, dot)
    geo.rotateX(-Math.PI / 2)

    const colors = new Float32Array(geo.attributes.position.count * 3)
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return geo
  }, [dot])

  const sourcePos = useMemo(() => {
    return new THREE.Vector3(-20, 0, 0) // 波源の位置を設定
  }, [])

  // 屈折率の逆比に基づいて波の速さを計算
  const speed1 = 1 / refractiveIndex1 // 媒質1の速さ
  const speed2 = 1 / refractiveIndex2 // 媒質2の速さ

  useFrame((state, delta) => {
    if (!isRunning) return

    timeRef.current += delta

    const omega = (2 * Math.PI) / period
    const k1 = omega / speed1
    const k2 = omega / speed2

    if (!meshRef.current) return

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array
    const colors = meshRef.current.geometry.attributes.color.array as Float32Array
    const count = positions.length / 3

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]
      const yPosIndex = i * 3 + 1

      let y = 0

      // 媒質1の中での波の計算
      if (x <= refractionBoundary) {
        const distanceToSource = Math.sqrt(
          Math.pow(x - sourcePos.x, 2) + Math.pow(z - sourcePos.z, 2)
        )
        const amplitude = 2 
        y += amplitude * Math.sin(k1 * distanceToSource - omega * timeRef.current)
      }

      // 媒質2の中での波の計算（屈折後）
      if (x > refractionBoundary) {
        const incidentAngle = Math.atan2(z - sourcePos.z, refractionBoundary - sourcePos.x)
        const refractedAngle = Math.asin((speed2 / speed1) * Math.sin(incidentAngle))

        const refractedX = refractionBoundary + (x - refractionBoundary) * Math.cos(refractedAngle)
        const refractedZ = z + (x - refractionBoundary) * Math.sin(refractedAngle)

        const distanceToRefracted = Math.sqrt(
          Math.pow(refractedX - refractionBoundary, 2) + Math.pow(refractedZ - sourcePos.z, 2)
        )
        const amplitude = 2 
        y += amplitude * Math.sin(k2 * distanceToRefracted - omega * timeRef.current)
      }

      positions[yPosIndex] = y

      // カラー設定
      if (Math.abs(y) < blackThreshold) {
        colors[i * 3] = 0
        colors[i * 3 + 1] = 0
        colors[i * 3 + 2] = 0
      } else {
        const colorValue = (y + 2) / 4
        colors[i * 3] = colorValue
        colors[i * 3 + 1] = 0.5
        colors[i * 3 + 2] = 1 - colorValue
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.geometry.attributes.color.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return (
    <>
      <mesh ref={meshRef}>
        <primitive object={geometry} />
        <meshPhongMaterial
          vertexColors={true}
          wireframe={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 波源の描画 */}
      <mesh ref={sourceRef} position={sourcePos}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
      {/* 屈折境界面の描画 */}
      <mesh position={[refractionBoundary, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshBasicMaterial color="gray" side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

export default function RefractionWaveSimulation() {
  const [period, setPeriod] = useState<number>(1)
  const [refractiveIndex1, setRefractiveIndex1] = useState<number>(1.0) // 媒質1の屈折率
  const [refractiveIndex2, setRefractiveIndex2] = useState<number>(1.5) // 媒質2の屈折率
  const [dot, setDot] = useState<number>(200)
  const [blackThreshold, setBlackThreshold] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(true)
  const [refractionBoundary, setRefractionBoundary] = useState<number>(0) // 屈折する境界面

  const toggleRunning = () => {
    setIsRunning(!isRunning)
  }

  return (
    <div className="p-4 max-w-full mx-auto">
      {/* Section 1: Wave Settings */}
      <div className="flex flex-wrap space-x-4">
        <label className="block text-black">
          周期: {period.toFixed(2)}
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={period}
            onChange={(e) => setPeriod(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
          媒質1の屈折率: {refractiveIndex1.toFixed(2)}
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={refractiveIndex1}
            onChange={(e) => setRefractiveIndex1(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
          媒質2の屈折率: {refractiveIndex2.toFixed(2)}
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={refractiveIndex2}
            onChange={(e) => setRefractiveIndex2(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      {/* Section 2: Display Settings */}
      <div className="flex flex-wrap space-x-4">

        <label className="block text-black">
          ドット数: {dot.toFixed(0)}
          <input
            type="range"
            min="100"
            max="400"
            step="10"
            value={dot}
            onChange={(e) => setDot(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
          この変位以下を黒色表示: {blackThreshold.toFixed(2)}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={blackThreshold}
            onChange={(e) => setBlackThreshold(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      {/* Section 3: Refraction Boundary */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <label className="block text-black">
          屈折境界面の位置: {refractionBoundary.toFixed(1)}
          <input
            type="range"
            min="-30"
            max="30"
            step="0.1"
            value={refractionBoundary}
            onChange={(e) => setRefractionBoundary(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      {/* Section 4: Wave Control */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <button
          onClick={toggleRunning}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Canvas 部分 */}
      <div className="w-full h-screen bg-gray-900 relative">
        <Canvas
          className="mx-auto w-full h-3/4"
          camera={{ position: [-50, 50, 100], fov: 60 }}
        >
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <RefractionWave
            period={period}
            refractiveIndex1={refractiveIndex1}
            refractiveIndex2={refractiveIndex2}
            dot={dot}
            blackThreshold={blackThreshold}
            isRunning={isRunning}
            refractionBoundary={refractionBoundary} // 屈折する境界面の位置
          />
        </Canvas>
      </div>
    </div>
  )
}
