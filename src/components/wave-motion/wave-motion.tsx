import React, { useState } from 'react'
import WaveSimulation from './wave-motion-simuration'
import RefractionWaveSimulation from './wave-motion-refraction'

export default function CombinedSimulation() {
  // モードを管理する状態変数
  const [mode, setMode] = useState<'wave' | 'refraction'>('wave')

  // ラジオボタンでモードを切り替える関数
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as 'wave' | 'refraction')
  }

  return (
    <>
 
    <div className="p-4 max-w-full mx-auto">
               {/* 現在のモードに応じたシミュレーションの表示 
      <div className="flex justify-center space-x-4 mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="mode"
            value="wave"
            checked={mode === 'wave'}
            onChange={handleModeChange}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">波干渉モード</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="mode"
            value="refraction"
            checked={mode === 'refraction'}
            onChange={handleModeChange}
            className="mr-2 accent-indigo-600"
          />
          <span className="text-gray-700">反射モード</span>
        </label>
      </div>
*/}
      {/* 現在のモードに応じたシミュレーションの表示 */}

        {mode === 'wave' ? (
          <WaveSimulation />
        ) : (
          <RefractionWaveSimulation />
        )}

    </div>
    </>
  )
}
