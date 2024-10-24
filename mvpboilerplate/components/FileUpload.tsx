'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import ReactMarkdown from 'react-markdown'
import { Loader2 } from "lucide-react"
import { extractTablesFromJson } from '@/app/(actions)/test'
import { processDocument } from '@/app/(actions)/processDocument'

type ProcessedTables = {
  tables: {
    headerRows: { cells: { text: string }[] }[];
    bodyRows: { cells: { text: string }[] }[];
  }[];
};

export default function DocumentAI() {
  const [extractedData, setExtractedData] = useState<ProcessedTables | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 96) {
            clearInterval(interval)
            return prevProgress
          }
          return prevProgress + 3
        })
      }, 300)
    } else {
      setProgress(0)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  // const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   if (!file) return

  //   setIsLoading(true)
  //   setError(null)
  //   setExtractedData(null)
  //   setProgress(0)

  //   const formData = new FormData()
  //   formData.append('file', file)

  //   try {
  //     console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
  //     const result = await processDocument(formData)
  //     console.log('Received result:', result);
  //     setExtractedData(result)
  //   } catch (error: any) {
  //     console.error('Error processing document:', error)
  //     setError(`Error processing document: ${error.message}`)
  //   } finally {
  //     setIsLoading(false)
  //     setProgress(100)
  //   }
  // }

  // const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   if (!file) return

  //   setIsLoading(true)
  //   setError(null)
  //   setExtractedData(null)
  //   setProgress(0)

  //   const formData = new FormData()
  //   formData.append('file', file)

  //   try {
  //     console.log('Reading file:', file.name, 'Type:', file.type, 'Size:', file.size)

  //     const result = await extractTablesFromJson(formData)
  //     console.log('Extracted tables:', result)
      
  //     setExtractedData(result)
  //   } catch (error: any) {
  //     console.error('Error extracting tables from JSON:', error)
  //     setError(`Error extracting tables: ${error.message}`)
  //   } finally {
  //     setIsLoading(false)
  //     setProgress(100)
  //   }
  // }

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
      console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size)
      const result = await processDocument(formData)
      console.log('Received result:', result)
      setExtractedData(result)
    } catch (error: any) {
      console.error('Error processing document:', error)
      setError(`Error processing document: ${error.message}`)
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

  const renderTable = (table: ProcessedTables['tables'][0], index: number) => (
    <div key={index} className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Table {index + 1}</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          {table.headerRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.cells.map((cell, cellIndex) => (
                <th key={cellIndex} className="border border-gray-300 px-4 py-2">
                  {cell.text}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                  {cell.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // return (
  //   <div className="container mx-auto p-4">
  //     <div
  //       className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
  //       onDragOver={handleDragOver}
  //       onDrop={handleDrop}
  //       onClick={() => fileInputRef.current?.click()}
  //     >
  //       <Label htmlFor="file-upload" className="cursor-pointer">
  //         {isLoading ? (
  //           <div className="flex flex-col items-center">
  //             <Loader2 className="h-6 w-6 animate-spin mb-2" />
  //             <span className="text-sm text-gray-500">Processing document...</span>
  //           </div>
  //         ) : (
  //           <>
  //             <span className="mt-2 block text-sm font-semibold text-gray-900">
  //               Drop a file here, or click to select a file
  //             </span>
  //             <span className="mt-1 block text-xs text-gray-500">
  //               PDF or Image files only
  //             </span>
  //           </>
  //         )}
  //       </Label>
  //       <Input
  //         id="file-upload"
  //         ref={fileInputRef}
  //         type="file"
  //         className="sr-only"
  //         onChange={handleFileChange}
  //         accept=".pdf,image/*"
  //         disabled={isLoading}
  //       />
  //     </div>
  //     {isLoading && (
  //       <div className="mt-4">
  //         <Progress value={progress} className="w-full" />
  //         <p className="text-sm text-gray-500 mt-2 text-center">{progress}% complete</p>
  //       </div>
  //     )}
  //     {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

  //     {extractedData && (
  //       <div className="border-1 mt-3 border border-gray-300 rounded-lg p-6">
  //         <ReactMarkdown>{extractedData}</ReactMarkdown>
  //       </div>
  //     )}
  //   </div>
  // )

  return (
    <div className="container mx-auto p-4">
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
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
       <div className="border-1 mt-3 border border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Extracted Tables:</h2>
          {extractedData.tables.map((table, index) => renderTable(table, index))}
        </div>
      )}
    </div>
  )  
}