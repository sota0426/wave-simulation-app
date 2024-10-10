// WaveSimulation.tsx
import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'

interface GridWaveProps {
  sourceDistance: number
  period: number
  speed: number
  dot: number
  attenuation: number
  blackThreshold: number
  phaseShift: number
  isRunning: boolean
  isSelectable: boolean
  isExtracted: boolean
  onPointSelected: (point: [number, number, number]) => void
  selectedPoint?: [number, number, number] | null;  
}


function AnimatedWaveLine({
  start,
  end,
  color,
  phaseShift,
  attenuation,
  frequency,
  speed,
  timeRef,
  isRunning,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  phaseShift: number;
  attenuation: number;
  frequency: number;
  speed: number;
  timeRef: React.MutableRefObject<number>;
  isRunning: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const numPoints = 100;
  const positions = useMemo(() => {
    const positions = new Float32Array((numPoints + 1) * 3);
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const point = start.clone().lerp(end, t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    return positions;
  }, [start, end]);

  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [positions]);

  useFrame(() => {
    if (!isRunning || !lineRef.current) return;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i <= numPoints; i++) {
      const x = array[i * 3];
      const z = array[i * 3 + 2];
      const point = new THREE.Vector3(x, 0, z);
      const distance = start.distanceTo(point);
      const amplitude = 2 * Math.exp(-distance * attenuation / 300);
      const y =
        amplitude * Math.sin(distance * frequency - timeRef.current * speed + phaseShift);
      array[i * 3 + 1] = y;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }))} ref={lineRef} />
  );
}

function GridWave({
  sourceDistance,
  period,
  speed,
  dot,
  attenuation,
  blackThreshold,
  phaseShift,
  isRunning,
  isSelectable,
  isExtracted,
  onPointSelected,
  selectedPoint,
}: GridWaveProps) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  const timeRef = useRef(0)
  const yellowSphereRef = useRef<THREE.Mesh | null>(null)
  const redSphereRef = useRef<THREE.Mesh | null>(null)
  const blueSphereRef = useRef<THREE.Mesh | null>(null)
  const compositeYRef = useRef<number>(0);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(70, 70, dot, dot)
    geo.rotateX(-Math.PI / 2)

    const colors = new Float32Array(geo.attributes.position.count * 3)
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return geo
  }, [dot])

  useFrame((state, delta) => {
    if (!isRunning) return;
  
    // 時間の更新
    timeRef.current += delta;
  
    const frequency = 1 / period;
    const source1 = new THREE.Vector3(sourceDistance / 2, 0, 0);
    const source2 = new THREE.Vector3(-sourceDistance / 2, 0, 0);
  
    // 黄色の玉の位置を常に更新
    if (selectedPoint) {
      const selectedPos = new THREE.Vector3(selectedPoint[0], selectedPoint[1], selectedPoint[2]);
  
      const distance1 = selectedPos.distanceTo(source1);
      const amplitude1 = 2 * Math.exp(-distance1 * attenuation / 300);
      const y1 =
        amplitude1 *
        Math.sin(distance1 * frequency - timeRef.current * speed);
  
      const distance2 = selectedPos.distanceTo(source2);
      const amplitude2 = 2 * Math.exp(-distance2 * attenuation / 300);
      const y2 =
        amplitude2 *
        Math.sin(
          distance2 * frequency - timeRef.current * speed + phaseShift
        );
  
      const compositeY = y1 + y2;
  
      if (yellowSphereRef.current) {
        yellowSphereRef.current.position.y = compositeY;
      }
  
      // 振幅を保存
      compositeYRef.current = compositeY;
    }

    const maxTime = 3 * period // 3 cycles of the wave
    timeRef.current += delta
    if (timeRef.current > maxTime) {
      timeRef.current = 0 // Reset the time after 3 cycles
    }


  // 赤い球体（波源1）の位置を更新
  if (redSphereRef.current) {
    const amplitude = 2 // 必要に応じて調整
    const y = amplitude * Math.sin(- timeRef.current * speed)
    redSphereRef.current.position.y = y
  }

  // 青い球体（波源2）の位置を更新
  if (blueSphereRef.current) {
    const amplitude = 2 // 必要に応じて調整
    const y = amplitude * Math.sin(- timeRef.current * speed + phaseShift)
    blueSphereRef.current.position.y = y
  }

 
    
    if(!(isExtracted && selectedPoint)){
    
      // Regular wave display
      if (!meshRef.current) return

      const positions = meshRef.current.geometry.attributes.position.array as Float32Array
      const colors = meshRef.current.geometry.attributes.color.array as Float32Array
      const count = positions.length / 3

      const source1Arr = [sourceDistance / 2, 0, 0]
      const source2Arr = [-sourceDistance / 2, 0, 0]

      for (let i = 0; i < count; i++) {
        const x = positions[i * 3]
        const yPosIndex = i * 3 + 1
        const z = positions[i * 3 + 2]

        const distance1 = Math.sqrt(Math.pow(x - source1Arr[0], 2) + Math.pow(z - source1Arr[2], 2))
        const distance2 = Math.sqrt(Math.pow(x - source2Arr[0], 2) + Math.pow(z - source2Arr[2], 2))

        const amplitude1 = 2 * Math.exp(-distance1 * attenuation / 300)
        let y = amplitude1 * Math.sin(distance1 * frequency - timeRef.current * speed)

        const amplitude2 = 2 * Math.exp(-distance2 * attenuation / 300)
        y += amplitude2 * Math.sin(distance2 * frequency - timeRef.current * speed + phaseShift)

        positions[yPosIndex] = y

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

      // Reset yellow sphere position
      if (yellowSphereRef.current && selectedPoint) {
        yellowSphereRef.current.position.y = positions[1] // Ground level
      }
    }
  })

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!isSelectable) return
    event.stopPropagation()
    const point = event.point
    onPointSelected([point.x, point.y, point.z])
  }

  // Sources positions
  const source1Pos = new THREE.Vector3(sourceDistance / 2, 0, 0)
  const source2Pos = new THREE.Vector3(-sourceDistance / 2, 0, 0)

  return (
    <>
      {!isExtracted && (
        <mesh ref={meshRef} onPointerDown={handlePointerDown}>
          <primitive object={geometry} />
          <meshPhongMaterial
            vertexColors={true}
            wireframe={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

     {selectedPoint && (
    <>
      {/* Wave from source1 */}
      <AnimatedWaveLine
        start={source1Pos}
        end={new THREE.Vector3(selectedPoint[0], selectedPoint[1], selectedPoint[2])}
        color="red"
        phaseShift={0}
        attenuation={attenuation}
        frequency={1 / period}
        speed={speed}
        timeRef={timeRef}
        isRunning={isRunning}
      />
      {/* Wave from source2 */}
      <AnimatedWaveLine
        start={source2Pos}
        end={new THREE.Vector3(selectedPoint[0], selectedPoint[1], selectedPoint[2])}
        color="blue"
        phaseShift={phaseShift}
        attenuation={attenuation}
        frequency={1 / period}
        speed={speed}
        timeRef={timeRef}
        isRunning={isRunning}
      />
    </>
  )}

      {selectedPoint && (
          <mesh
            ref={yellowSphereRef}
            position={new THREE.Vector3(selectedPoint[0], selectedPoint[1], selectedPoint[2])}
            onPointerDown={handlePointerDown}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="yellow" />
          </mesh>


      )}
      <mesh ref={redSphereRef} position={source1Pos}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh ref={blueSphereRef} position={source2Pos}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="blue" />
      </mesh>

    </>
  )
}


export default function WaveSimulation() {
  const [sourceDistance, setSourceDistance] = useState<number>(20)
  const [period, setPeriod] = useState<number>(1)
  const [speed, setSpeed] = useState<number>(2)
  const [dot, setDot] = useState<number>(200)
  const [attenuation, setAttenuation] = useState<number>(20)
  const [blackThreshold, setBlackThreshold] = useState<number>(0)
  const [phaseShift, setPhaseShift] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(true)
  const [isSelectable, setIsSelectable] = useState<boolean>(true)
  const [isExtracted, setIsExtracted] = useState<boolean>(false)

  const [selectedPoint, setSelectedPoint] = useState<[number, number, number] | null>(null)
  const [distances, setDistances] = useState<{
    distance1: number
    distance2: number
    distance1InWavelengths: number
    distance2InWavelengths: number
    difference: number
    differenceInWavelengths: number
    integerPart: number
    fractionalPart: number
  } | null>(null)

  const wavelength = speed * period

  const handlePhaseShiftChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const degreeValue = parseFloat(event.target.value)
    const radianValue = (degreeValue * Math.PI) / 180
    setPhaseShift(radianValue)
  }

  const toggleRunning = () => {
    setIsRunning(!isRunning)
  }

  const onPointSelected = (point: [number, number, number]) => {
    setSelectedPoint(point)

    const source1 = [sourceDistance / 2, 0, 0]
    const source2 = [-sourceDistance / 2, 0, 0]

    const distance1 = Math.sqrt(
      Math.pow(point[0] - source1[0], 2) + Math.pow(point[2] - source1[2], 2)
    )
    const distance2 = Math.sqrt(
      Math.pow(point[0] - source2[0], 2) + Math.pow(point[2] - source2[2], 2)
    )
    const difference = Math.abs(distance1 - distance2)

    const distance1InWavelengths = distance1 / wavelength
    const distance2InWavelengths = distance2 / wavelength
    const differenceInWavelengths = difference / wavelength

    const integerPart = Math.floor(differenceInWavelengths)
    const fractionalPart = differenceInWavelengths - integerPart

    setDistances({
      distance1,
      distance2,
      distance1InWavelengths,
      distance2InWavelengths,
      difference,
      differenceInWavelengths,
      integerPart,
      fractionalPart,
    })
  }

  return (
    <div className="p-4 max-w-full mx-auto">
      {/* Section 1: Wave Settings */}
      <div className="flex flex-wrap space-x-4 ">
        <label className="block text-black">
          波源の距離: {sourceDistance.toFixed(1)} (λ = {wavelength.toFixed(2)})
          <input
            type="range"
            min="0"
            max="30"
            step="0.1"
            value={sourceDistance}
            onChange={(e) => setSourceDistance(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

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
          速さ: {speed.toFixed(2)}
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>
      </div>

      {/* Section 2: Display Settings */}
      <div className="flex flex-wrap space-x-4">
        <label className="block text-black">
          減衰度: {attenuation.toFixed(0)}
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={attenuation}
            onChange={(e) => setAttenuation(parseFloat(e.target.value))}
            className="w-full bg-gray-700 rounded"
          />
        </label>

        <label className="block text-black">
          ドット数: {dot.toFixed(0)}
          <input
            type="range"
            min="50"
            max="300"
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

      {/* Section 3: Source Settings */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <label className="block text-black">
          青色の位相の遅れ: {((phaseShift * 180) / Math.PI).toFixed(0)}°
          （<InlineMath math={`${(phaseShift / Math.PI).toFixed(1)}\\pi`} />）
          <input
            type="range"
            min="0"
            max="360"
            step="30"
            value={((phaseShift * 180) / Math.PI).toFixed(0)}
            onChange={handlePhaseShiftChange}
            className="w-full bg-gray-700 rounded"
          />
        </label>
        <button
          onClick={toggleRunning}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>

        {/* Checkbox to enable/disable point selection */}
        <label className="flex items-center text-black">
          <input
            type="checkbox"
            checked={isSelectable}
            onChange={(e) => {
              setIsSelectable(e.target.checked)
              if (!e.target.checked) {
                setSelectedPoint(null)
                setDistances(null)
                setIsExtracted(false)
              }
            }}
            className="mr-2"
          />
          点を選択する
        </label>

        {/* Button to extract waves */}
        <button
          onClick={() => setIsExtracted(!isExtracted)}
          className="px-4 py-2 text-white bg-green-500 rounded"
          disabled={!selectedPoint}
        >
          {isExtracted ? '元に戻す' : '波を抽出'}
        </button>
      </div>

      {/* Canvas 部分 */}
      <div className="w-full h-screen bg-gray-900 relative">
        <Canvas
          className="mx-auto w-full h-3/4"
          camera={{ position: [0, 30, 30], fov: 60 }}
        >
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <GridWave
            sourceDistance={sourceDistance}
            period={period}
            speed={speed}
            dot={dot}
            attenuation={attenuation}
            blackThreshold={blackThreshold}
            phaseShift={phaseShift}
            isRunning={isRunning}
            isSelectable={isSelectable}
            isExtracted={isExtracted}
            onPointSelected={onPointSelected}
            selectedPoint={selectedPoint}
          />
        </Canvas>

        {/* Display distances */}
        {distances && selectedPoint && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              color: 'white',
              background: 'rgba(0,0,0,0.5)',
              padding: '10px',
              pointerEvents: 'none',
            }}
          >
            <p>
              波源(赤)からの距離: {distances.distance1.toFixed(2)} (
              {distances.distance1InWavelengths.toFixed(2)}λ)
            </p>
            <p>
              波源(青)からの距離: {distances.distance2.toFixed(2)} (
              {distances.distance2InWavelengths.toFixed(2)}λ)
            </p>
            <p>
              距離の差: {distances.difference.toFixed(2)} (
              {distances.differenceInWavelengths.toFixed(2)}λ = {distances.integerPart}λ +{' '}
              {distances.fractionalPart.toFixed(2)}λ)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
