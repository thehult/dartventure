import React from 'react'
import { useGameSave } from '../hooks/useGameSave'

const reputationHack = import.meta.env.MODE === 'development' ? 5 : 0
const moneyHack = import.meta.env.MODE === 'development' ? 100 : 0

interface StatBarProps {}

const StatBar: React.FC<StatBarProps> = () => {
  const gameSave = useGameSave()

  return (
    <div className="w-full text-white flex justify-between items-center px-4 py-2 fixed top-0 left-0 z-50 text-base">
      <div onClick={() => gameSave.addReputation(reputationHack)}>
        <strong>Reputation:</strong> {gameSave.reputation}
      </div>
      <div onClick={() => gameSave.addMoney(moneyHack)}>
        <strong>Money:</strong> ${gameSave.money}
      </div>
    </div>
  )
}

export default StatBar
