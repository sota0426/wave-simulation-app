"use client" // Next.jsでクライアントサイドで実行されることを示す

import { useState , useMemo } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// WaveInterferenceCircularMotionコンポーネントを定義
export default function WaveInterferenceCircularMotion() {
  // 各種パラメータをuseStateで管理
  const [frequency1, setFrequency1] = useState(100) // 波1の周波数
  const [frequency2, setFrequency2] = useState(100) // 波2の周波数
  const [phase1, setPhase1] = useState(0) // 波1の位相
  const [phase2, setPhase2] = useState(0) // 波2の位相
  const [speed, setSpeed] = useState(1) // アニメーションの速度
  const [scale, setScale] = useState(1) // 波のスケール（縮尺）
  const [time, setTime] = useState(0) // アニメーションの時間経過を管理
  const [isRunning, setIsRunning] = useState(true) // アニメーションのオン・オフを管理

  // シミュレーションで用いる定数
  const numPoints = 500 // 波のポイント数
  const circleWidth = 400 // 円の表示領域の幅
  const circleHeight = 400 // 円の表示領域の高さ
  const waveWidth = 900 // 波の表示領域の幅
  const waveHeight = 300 // 波の表示領域の高さ
  const circleRadius = 60 // 円の半径

  // アニメーションフレームごとに時間を更新（60 FPS想定）
  useAnimationFrame(() => {
    if (isRunning) {
      setTime((prevTime) => prevTime + 0.00004 * speed) // 速度に応じて時間を進行
    }
  })

  // 周波数と位相を元に波のポイントを生成する関数
  const getWavePoints = (freq: number, phase: number) => {
    return Array.from({ length: numPoints }, (_, i) => {
      const x = (i / (numPoints - 1) - 0.5) * waveWidth // 波のX座標
      const y = circleRadius * Math.sin(2 * Math.PI * freq * (x / waveWidth / scale / 10 - time) + phase * Math.PI / 180) // 波のY座標をサイン波で計算
      return { x, y }
    })
  }

  // 円運動の座標を計算する関数
  const getCirclePoint = (freq: number, phase: number) => {
    const angle = -2 * Math.PI * freq  * time + phase * Math.PI / 180 + Math.PI *1.98 // 円運動の角度を計算
    return {
      x: circleRadius * Math.cos(angle), // X座標
      y: circleRadius * Math.sin(angle)  // Y座標
    }
  }

  // 波や円のポイントをメモ化して計算を効率化
  const [wave1Points, wave2Points, combinedWavePoints, circle1Point, circle2Point, combinedCirclePoint] = useMemo(() => {
    const w1 = getWavePoints(frequency1, phase1) // 波1のポイント
    const w2 = getWavePoints(frequency2, phase2) // 波2のポイント
    const cw = w1.map((p, i) => ({ x: p.x, y: p.y + w2[i].y })) // 波1と波2を合成
    const c1 = getCirclePoint(frequency1, phase1) // 円1のポイント
    const c2 = getCirclePoint(frequency2, phase2) // 円2のポイント
    const cc = { x: c1.x + c2.x, y: c1.y + c2.y } // 円1と円2を合成
    return [w1, w2, cw, c1, c2, cc]
  }, [frequency1, frequency2, phase1, phase2, time, scale])

  // 波や円の色を取得する関数
  const getColor = (index: number) => {
    const colors = ["#FF0000", "#0000FF", "#00FF00"] // 色リスト（赤、青、緑）
    return colors[index]
  }

  // 円を描画する関数（動きのある円を`motion.circle`で表現）
  const renderCircle = (point: { x: number, y: number }, color: string, radius: number) => (
    <motion.circle
      cx={circleWidth / 2}
      cy={circleHeight / 2}
      r={radius} // 引数として受け取った半径を設定
      fill={color}
      animate={{ x: point.x, y: point.y }} // 円のアニメーションをX,Y座標に基づいて動かす
      transition={{ duration: 0, ease: "linear" }} // アニメーションのトランジション
    />
  )
  
  // 波を描画する関数（波のパスを描画）
  const renderWave = (points: { x: number, y: number }[], color: string, radius:number) => (
    <path
      d={`M ${points.map(p => `${p.x + waveWidth *0.5},${p.y + waveHeight / 2}`).join(' L ')}`} // 波のパスを生成
      fill="none"
      stroke={color} // 波の色
      strokeWidth={radius} // 波の太さ
    />
  )
  
  // 波のポイントを描画する関数（動きのある波のポイント）
  const renderWavePoint = (point: { x: number, y: number }, color: string, radius: number) => (
    <motion.circle
      cx={waveWidth / 2}
      cy={waveHeight / 2}
      r={radius} // ポイントの太さ
      fill={color}
      animate={{ x: point.x, y: point.y }} // 波のポイントをアニメーションで動かす
      transition={{ duration: 0, ease: "linear" }} // トランジション
    />
  )

  // コンポーネントのレンダリング部分
  return (
    <div className="p-4 max-w-full mx-auto">
    <h1 className="text-2xl font-bold mb-4">波の干渉のシミュレーション（波の干渉、うなりの原理）</h1>
    <div className="flex flex-col lg:flex-row mb-8 space-y-4 lg:space-y-0 lg:space-x-4">
      {/* 左の円の表示 */}
      <div className="w-full lg:w-1/4 h-[300px] relative border border-gray-300 rounded">
        <svg width={circleWidth} height={circleHeight} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <circle cx={circleWidth / 2} cy={circleHeight / 2} r={circleRadius} stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
          <circle cx={circleWidth / 2} cy={circleHeight / 2} r={circleRadius * 2} stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
          <circle cx={circleWidth / 2} cy={circleHeight / 2} r="2" fill="black" />
          {renderCircle(circle1Point, getColor(0),4)} {/* 赤色 */}
          {renderCircle(circle2Point, getColor(1),3)} {/* 青色 */}
          {renderCircle(combinedCirclePoint, getColor(2),6)} {/* 緑色 */}
          <line x1={0} y1={circleWidth / 2 + combinedCirclePoint.y} x2={waveWidth} y2={circleWidth / 2 + combinedCirclePoint.y} stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1={circleWidth / 2} y1={circleHeight / 2} x2={circleWidth / 2 + combinedCirclePoint.x} y2={circleHeight / 2 + combinedCirclePoint.y} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        </svg>
      </div>

      {/* 右の波の表示 */}
      <div className="w-full lg:w-3/4 h-[300px] relative border border-gray-300 rounded">
        <svg width={waveWidth} height={waveHeight} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <line x1={0} y1={waveHeight/2} x2={waveWidth} y2={waveHeight/2} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <line x1={waveWidth/2} y1={0} x2={waveWidth/2} y2={waveHeight} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          {renderWave(wave1Points, getColor(0),1)} {/* 波1（赤色） */}
          {renderWave(wave2Points, getColor(1),0.7)} {/* 波2（青色） */}
          {renderWave(combinedWavePoints, getColor(2),2)} {/* 合成波（緑色） */}
          {renderWavePoint({ x: wave1Points[249].x, y: wave1Points[249].y }, getColor(0),4)} {/* 波1のポイント */}
          {renderWavePoint({ x: wave2Points[249].x, y: wave2Points[249].y}, getColor(1),3)} {/* 波2のポイント */}
          {renderWavePoint({ x: combinedWavePoints[249].x, y: combinedWavePoints[249].y  }, getColor(2),6)} {/* 合成波のポイント */}
          <line x1={0} y1={combinedWavePoints[249].y +waveHeight/2} x2={waveWidth} y2={combinedWavePoints[249].y +waveHeight/2} stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeDasharray="5,5" />
        </svg>
      </div>
    </div>

    {/* 各種パラメータを変更するUI部分 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">波1のパラメータ</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="frequency1">周波数: {frequency1} Hz</Label>
              <Slider
                id="frequency1"
                min={100}
                max={300}
                step={1}
                value={[frequency1]}
                onValueChange={([value]) => setFrequency1(value)} // 周波数を変更するスライダー
              />
            </div>
            <div>
              <Label htmlFor="phase1">位相: {phase1.toFixed(0)}°</Label>
              <Slider
                id="phase1"
                min={0}
                max={360}
                step={1}
                value={[phase1]}
                onValueChange={([value]) => setPhase1(value)} // 位相を変更するスライダー
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">波2のパラメータ</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="frequency2">周波数: {frequency2} Hz</Label>
              <Slider
                id="frequency2"
                min={100}
                max={300}
                step={1}
                value={[frequency2]}
                onValueChange={([value]) => setFrequency2(value)} // 波2の周波数
              />
            </div>
            <div>
              <Label htmlFor="phase2">位相: {phase2.toFixed(0)}°</Label>
              <Slider
                id="phase2"
                min={0}
                max={360}
                step={1}
                value={[phase2]}
                onValueChange={([value]) => setPhase2(value)} // 波2の位相
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">全体のパラメータ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="speed">速さ: {speed.toFixed(2)}</Label>
              <Slider
                id="speed"
                min={0.5}
                max={20}
                step={0.1}
                value={[speed]}
                onValueChange={([value]) => setSpeed(value)} // アニメーションの速度
              />
            </div>
            <div>
              <Label htmlFor="scale">縮尺: {scale.toFixed(2)}x</Label>
              <Slider
                id="scale"
                min={0.1}
                max={2}
                step={0.01}
                value={[scale]}
                onValueChange={([value]) => setScale(value)} // 波の縮尺
              />
            </div>
            <div className="flex items-end">

                         
            <button 
            onClick={() => setIsRunning(!isRunning)} 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-150"
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          </div>    
          </div>
        </CardContent>
      </Card>
    </div>
    <p>
      説明：
    </p>
    <p>
      ・同じ周波数の場合、位相によって波の干渉が変化します。
    </p>
    <p>
      ・周波数が異なる場合、うなりの原理によって波の干渉が変化します。
    </p>
  </div>
  )
}
