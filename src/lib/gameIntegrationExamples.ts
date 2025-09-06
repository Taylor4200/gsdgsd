// Example Integration for Dice Game
// This shows how to integrate the game session manager with the dice game

import { recordGameWin, recordGameLoss } from '@/lib/gameSessionManager'
import { useUserStore } from '@/store/userStore'

// Example integration in the dice game's placeManualBet function
// Add this after the roll result is calculated:

/*
const placeManualBet = async () => {
  if (betAmount <= 0 || !user) return

  // ... existing code ...

  // Generate the roll using provably fair system
  const rollResult = await generateDiceRoll({
    serverSeed: session.serverSeed,
    clientSeed: customClientSeed || session.clientSeed,
    nonce: newNonce
  })

  // Convert to 0-100 range for display
  const result = Math.round(rollResult.result)
  const won = direction === 'under' ? result < target : result > target
  const payout = won ? betAmount * calculateMultiplier() : 0

  // ... existing code ...

  // NEW: Record game session for live feed and raffle tracking
  try {
    if (won && payout > 0) {
      await recordGameWin(
        user.id, // user ID
        'dice', // game ID
        'Dice', // game name
        betAmount, // bet amount
        payout, // win amount
        calculateMultiplier(), // multiplier
        {
          result: result,
          target: target,
          direction: direction,
          nonce: newNonce,
          serverSeed: session.serverSeed,
          clientSeed: session.clientSeed
        } // session data
      )
    } else {
      await recordGameLoss(
        user.id, // user ID
        'dice', // game ID
        'Dice', // game name
        betAmount, // bet amount
        calculateMultiplier(), // multiplier
        {
          result: result,
          target: target,
          direction: direction,
          nonce: newNonce,
          serverSeed: session.serverSeed,
          clientSeed: session.clientSeed
        } // session data
      )
    }
  } catch (error) {
    console.error('Error recording game session:', error)
    // Don't block the game if session recording fails
  }

  // ... rest of existing code ...
}
*/

// Example integration for placeSingleBet function (used in auto betting):
/*
const placeSingleBet = async (nonce?: number, turboMode?: boolean) => {
  // ... existing code ...

  // Convert to 0-100 range for display
  const result = Math.round(rollResult.result)
  const won = direction === 'under' ? result < target : result > target
  const payout = won ? betAmount * calculateMultiplier() : 0

  // ... existing code ...

  // NEW: Record game session for live feed and raffle tracking
  try {
    if (won && payout > 0) {
      await recordGameWin(
        user.id,
        'dice',
        'Dice',
        betAmount,
        payout,
        calculateMultiplier(),
        {
          result: result,
          target: target,
          direction: direction,
          nonce: rollNonce,
          serverSeed: session.serverSeed,
          clientSeed: session.clientSeed,
          autoBet: true
        }
      )
    } else {
      await recordGameLoss(
        user.id,
        'dice',
        'Dice',
        betAmount,
        calculateMultiplier(),
        {
          result: result,
          target: target,
          direction: direction,
          nonce: rollNonce,
          serverSeed: session.serverSeed,
          clientSeed: session.clientSeed,
          autoBet: true
        }
      )
    }
  } catch (error) {
    console.error('Error recording game session:', error)
  }

  // ... rest of existing code ...
}
*/

// Example integration for other games:

// Minesweeper integration:
/*
const handleMineReveal = async (cellIndex: number) => {
  // ... existing mine reveal logic ...

  if (isMine) {
    // Game over - record loss
    await recordGameLoss(
      user.id,
      'minesweeper',
      'Minesweeper',
      betAmount,
      1, // multiplier
      {
        minesHit: 1,
        totalMines: mineCount,
        cellsRevealed: revealedCells.length + 1,
        minePositions: minePositions
      }
    )
  } else {
    // Check if all non-mine cells are revealed (win condition)
    const totalSafeCells = gridSize * gridSize - mineCount
    if (revealedCells.length + 1 === totalSafeCells) {
      const multiplier = calculateMinesweeperMultiplier(mineCount, gridSize)
      const payout = betAmount * multiplier
      
      await recordGameWin(
        user.id,
        'minesweeper',
        'Minesweeper',
        betAmount,
        payout,
        multiplier,
        {
          minesHit: 0,
          totalMines: mineCount,
          cellsRevealed: revealedCells.length + 1,
          minePositions: minePositions,
          gridSize: gridSize
        }
      )
    }
  }
}
*/

// Limbo integration:
/*
const handleLimboBet = async () => {
  // ... existing limbo logic ...

  const result = generateLimboResult()
  const won = result >= targetMultiplier
  const payout = won ? betAmount * targetMultiplier : 0

  // ... existing code ...

  try {
    if (won && payout > 0) {
      await recordGameWin(
        user.id,
        'limbo',
        'Limbo',
        betAmount,
        payout,
        targetMultiplier,
        {
          result: result,
          targetMultiplier: targetMultiplier,
          crashPoint: result
        }
      )
    } else {
      await recordGameLoss(
        user.id,
        'limbo',
        'Limbo',
        betAmount,
        targetMultiplier,
        {
          result: result,
          targetMultiplier: targetMultiplier,
          crashPoint: result
        }
      )
    }
  } catch (error) {
    console.error('Error recording game session:', error)
  }
}
*/

// Plinko integration:
/*
const handlePlinkoDrop = async () => {
  // ... existing plinko logic ...

  const result = simulatePlinkoDrop()
  const multiplier = getPlinkoMultiplier(result.bucket)
  const payout = betAmount * multiplier

  // ... existing code ...

  try {
    if (multiplier > 0) {
      await recordGameWin(
        user.id,
        'plinko',
        'Plinko',
        betAmount,
        payout,
        multiplier,
        {
          bucket: result.bucket,
          path: result.path,
          rows: plinkoRows
        }
      )
    } else {
      await recordGameLoss(
        user.id,
        'plinko',
        'Plinko',
        betAmount,
        0,
        0,
        {
          bucket: result.bucket,
          path: result.path,
          rows: plinkoRows
        }
      )
    }
  } catch (error) {
    console.error('Error recording game session:', error)
  }
}
*/

export {} // Make this a module
