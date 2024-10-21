'use client'

import { useState, useRef, useEffect } from 'react'
import { processDocument } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import ReactMarkdown from 'react-markdown'
import { Loader2 } from "lucide-react"


export default function DocumentAI() {
  const [extractedData, setExtractedData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(interval)
            return prevProgress
          }
          return prevProgress + 10
        })
      }, 500)
    } else {
      setProgress(0)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setExtractedData(null)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await processDocument(formData)
      setExtractedData(result)
    } catch (error) {
      console.error('Error processing document:', error)
      setError('Error processing document. Please try again.')
    } finally {
      setIsLoading(false)
      setProgress(100)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const file = event.dataTransfer.files?.[0]
    if (file && fileInputRef.current) {
      fileInputRef.current.files = event.dataTransfer.files
      handleFileChange({ target: { files: event.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Label htmlFor="file-upload" className="cursor-pointer">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <span className="text-sm text-gray-500">Processing document...</span>
            </div>
          ) : (
            <>
              <span className="mt-2 block text-sm font-semibold text-gray-900">
                Drop a file here, or click to select a file
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                PDF or Image files only
              </span>
            </>
          )}
        </Label>
        <Input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept=".pdf,image/*"
          disabled={isLoading}
        />
      </div>
      {isLoading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 mt-2 text-center">{progress}% complete</p>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {extractedData && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Extracted Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactMarkdown>{extractedData}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  )
}