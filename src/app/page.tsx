"use client"
import React from 'react';
import { useState, Suspense, lazy } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
const CircularMotionWaveSimulationComponent = lazy(() => import('@/components/circular-motion-wave-simulation'))
const WaveInterferenceCircularMotion = lazy(() => import('@/components/wave-interference-circular-motion'))
const CombinedSimulation = lazy(()=>import('@/components/wave-motion/wave-motion'))

export default function Page() {
  const [selectedPage, setSelectedPage] = useState<'circular' | 'interference' | 'waveMotion'|'waveReflection'>('circular')

  return (
    <>
      <Card className="">
        <CardContent className="p-2 bg-stone-3
        
        00">
          <div className="flex justify-center space-x-2">
          <Button 
              onClick={() => setSelectedPage('waveMotion')}
              variant={selectedPage === 'waveMotion' ? 'outline' : 'default'}
            >
              波の干渉シミュレーション
            </Button>                     
            <Button 
              onClick={() => setSelectedPage('circular')}
              variant={selectedPage === 'circular' ? 'outline' : 'default'}
            >
              単振動と等速円運動
            </Button>
            <Button 
              onClick={() => setSelectedPage('interference')}
              variant={selectedPage === 'interference' ? 'outline' : 'default'}
            >
              波の干渉と円運動
            </Button>

          </div>
        </CardContent>
      </Card>
      
      <Suspense fallback={<div>Loading...</div>}>
        {selectedPage === 'circular' && <CircularMotionWaveSimulationComponent />}
        {selectedPage === 'interference' && <WaveInterferenceCircularMotion />}
        {selectedPage === 'waveMotion' && <CombinedSimulation />}        
      </Suspense>
    </>
  )
}
