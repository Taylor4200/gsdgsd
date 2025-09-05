/**
 * Minesweeper Verification Page
 * 
 * Standalone page for verifying Minesweeper game results using
 * server seed, client seed, and nonce.
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Download,
  Copy,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { verifyGameResult, type VerificationResult } from '@/lib/minesweeper/provablyFair'

const VerificationPage: React.FC = () => {
  const [serverSeed, setServerSeed] = useState('')
  const [clientSeed, setClientSeed] = useState('')
  const [nonce, setNonce] = useState('')
  const [boardWidth, setBoardWidth] = useState('30')
  const [boardHeight, setBoardHeight] = useState('16')
  const [mineCount, setMineCount] = useState('50')
  const [providedHash, setProvidedHash] = useState('')
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    setIsVerifying(true)
    setError('')
    setVerificationResult(null)

    try {
      // Validate inputs
      if (!serverSeed || !clientSeed || !nonce || !providedHash) {
        throw new Error('All fields are required')
      }

      const width = parseInt(boardWidth)
      const height = parseInt(boardHeight)
      const mines = parseInt(mineCount)
      const nonceNum = parseInt(nonce)

      if (width < 5 || width > 50 || height < 5 || height > 50) {
        throw new Error('Board size must be between 5x5 and 50x50')
      }

      if (mines < 1 || mines >= width * height) {
        throw new Error('Invalid mine count')
      }

      if (nonceNum < 0) {
        throw new Error('Nonce must be a positive number')
      }

      // Perform verification
      const result = await verifyGameResult(
        serverSeed,
        clientSeed,
        nonceNum,
        width,
        height,
        mines,
        providedHash
      )

      setVerificationResult(result)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResult = () => {
    if (!verificationResult) return

    const data = {
      verification: verificationResult,
      inputs: {
        serverSeed,
        clientSeed,
        nonce,
        boardWidth,
        boardHeight,
        mineCount,
        providedHash
      },
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `minesweeper-verification-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419] p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-[#00d4ff]" />
            <h1 className="text-3xl font-bold text-white">Minesweeper Verification</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Verify the fairness of any Minesweeper game using cryptographic proof
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card variant="glass" className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-[#00d4ff]" />
                Game Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Server Seed */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Server Seed</label>
                <div className="flex gap-2">
                  <Input
                    value={serverSeed}
                    onChange={(e) => setServerSeed(e.target.value)}
                    placeholder="Enter server seed (64 hex characters)"
                    className="text-white font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(serverSeed)}
                    disabled={!serverSeed}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Client Seed */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Client Seed</label>
                <div className="flex gap-2">
                  <Input
                    value={clientSeed}
                    onChange={(e) => setClientSeed(e.target.value)}
                    placeholder="Enter client seed"
                    className="text-white font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(clientSeed)}
                    disabled={!clientSeed}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Nonce */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nonce</label>
                <Input
                  type="number"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  placeholder="Enter nonce"
                  className="text-white font-mono"
                />
              </div>

              {/* Board Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Board Width</label>
                  <Input
                    type="number"
                    value={boardWidth}
                    onChange={(e) => setBoardWidth(e.target.value)}
                    min="5"
                    max="50"
                    className="text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Board Height</label>
                  <Input
                    type="number"
                    value={boardHeight}
                    onChange={(e) => setBoardHeight(e.target.value)}
                    min="5"
                    max="50"
                    className="text-white"
                  />
                </div>
              </div>

              {/* Mine Count */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mine Count</label>
                <Input
                  type="number"
                  value={mineCount}
                  onChange={(e) => setMineCount(e.target.value)}
                  min="1"
                  className="text-white"
                />
              </div>

              {/* Provided Hash */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Provided Result Hash</label>
                <div className="flex gap-2">
                  <Input
                    value={providedHash}
                    onChange={(e) => setProvidedHash(e.target.value)}
                    placeholder="Enter the hash provided by the game"
                    className="text-white font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(providedHash)}
                    disabled={!providedHash}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerify}
                disabled={isVerifying || !serverSeed || !clientSeed || !nonce || !providedHash}
                className="w-full"
                size="lg"
              >
                {isVerifying ? 'Verifying...' : 'Verify Game'}
              </Button>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
                >
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Verification Results */}
          <Card variant="glass" className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                {verificationResult ? (
                  verificationResult.match ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )
                ) : (
                  <Shield className="h-5 w-5 text-gray-400" />
                )}
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult ? (
                <div className="space-y-4">
                  {/* Status */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border ${
                      verificationResult.match 
                        ? 'bg-green-500/20 border-green-500/30' 
                        : 'bg-red-500/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {verificationResult.match ? (
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-400" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {verificationResult.match ? 'Verification Passed' : 'Verification Failed'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {verificationResult.match 
                            ? 'The game result is cryptographically verified and fair'
                            : 'The game result could not be verified or is invalid'
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Hash Comparison */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-400">Hash Comparison</h4>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Computed Hash</label>
                      <div className="bg-black/20 p-2 rounded text-xs font-mono text-white break-all">
                        {verificationResult.computedHash}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Provided Hash</label>
                      <div className="bg-black/20 p-2 rounded text-xs font-mono text-white break-all">
                        {verificationResult.providedHash}
                      </div>
                    </div>
                  </div>

                  {/* Mine Positions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-400">
                      Computed Mine Positions ({verificationResult.computedMines.length})
                    </h4>
                    <div className="bg-black/20 p-3 rounded max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-6 gap-1">
                        {verificationResult.computedMines.map((mine, index) => (
                          <div
                            key={index}
                            className="bg-red-500/20 text-red-400 text-xs p-1 rounded text-center"
                          >
                            {mine.x},{mine.y}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Download Result */}
                  <Button
                    variant="outline"
                    onClick={downloadResult}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Verification Report
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Enter game parameters to verify</p>
                  <p className="text-sm mt-2">All fields are required for verification</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card variant="glass" className="mt-8 p-6">
          <CardHeader>
            <CardTitle className="text-white">How Provably Fair Verification Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">1. Seed Generation</h4>
                <p className="text-sm">
                  The server generates a random 32-byte seed and publishes only its SHA256 hash. 
                  This ensures the server cannot change the outcome after seeing the result.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">2. HMAC Generation</h4>
                <p className="text-sm">
                  Using HMAC-SHA256 with the server seed as key and client seed + nonce as message, 
                  we generate cryptographically secure randomness for mine placement.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">3. Verification</h4>
                <p className="text-sm">
                  After the game ends, the server reveals the original seed. Players can verify 
                  that the mine positions were generated fairly using the same algorithm.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CasinoLayout>
  )
}

export default VerificationPage

