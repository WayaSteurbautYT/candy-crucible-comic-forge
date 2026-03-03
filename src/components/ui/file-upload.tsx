"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, Zip, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface UploadedFile {
  file: File
  id: string
  name: string
  size: number
  type: string
  content?: string
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void
  accept?: string[]
  maxSize?: number
  maxFiles?: number
  className?: string
  multiple?: boolean
  allowZip?: boolean
}

export function FileUpload({
  onFilesChange,
  accept = ['.txt', '.md', '.zip'],
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  className,
  multiple = true,
  allowZip = true
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const processZipFile = async (zipFile: File): Promise<UploadedFile[]> => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(zipFile)
    const extractedFiles: UploadedFile[] = []

    for (const [filename, file] of Object.entries(zipContent)) {
      if (file.dir) continue
      
      const fileExtension = filename.toLowerCase().split('.').pop()
      if (fileExtension === 'txt' || fileExtension === 'md') {
        const content = await file.async('string')
        extractedFiles.push({
          file: new File([content], filename, { type: 'text/plain' }),
          id: `${zipFile.name}-${filename}`,
          name: filename,
          size: content.length,
          type: 'text/plain',
          content
        })
      }
    }

    return extractedFiles
  }

  const processFile = async (file: File): Promise<UploadedFile | null> => {
    const fileExtension = file.name.toLowerCase().split('.').pop()
    
    if (fileExtension === 'zip' && allowZip) {
      const extractedFiles = await processZipFile(file)
      return extractedFiles.length > 0 ? extractedFiles[0] : null
    } else if (fileExtension === 'txt' || fileExtension === 'md') {
      const content = await file.text()
      return {
        file,
        id: file.name,
        name: file.name,
        size: file.size,
        type: file.type,
        content
      }
    }
    
    return null
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true)
    
    try {
      const processedFiles: UploadedFile[] = []
      
      for (const file of acceptedFiles) {
        const processed = await processFile(file)
        if (processed) {
          if (Array.isArray(processed)) {
            processedFiles.push(...processed)
          } else {
            processedFiles.push(processed)
          }
        }
      }
      
      const newFiles = [...uploadedFiles, ...processedFiles].slice(0, maxFiles)
      setUploadedFiles(newFiles)
      onFilesChange(newFiles)
    } catch (error) {
      console.error('Error processing files:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [uploadedFiles, maxFiles, onFilesChange])

  const removeFile = (id: string) => {
    const newFiles = uploadedFiles.filter(f => f.id !== id)
    setUploadedFiles(newFiles)
    onFilesChange(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/zip': ['.zip']
    },
    maxSize,
    maxFiles,
    multiple,
    disabled: isProcessing
  })

  const getFileIcon = (type: string) => {
    if (type === 'application/zip' || type.includes('zip')) return <Zip className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50",
          "transition-colors duration-200 cursor-pointer",
          "p-8 text-center",
          isDragActive && "border-primary bg-primary/5",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive
                ? "Drop the files here..."
                : "Drag & drop story files here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: {accept.join(', ')} (Max: {formatFileSize(maxSize)})
              {allowZip && " • ZIP files will be extracted"}
            </p>
          </div>
          <Button variant="outline" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Select Files"}
          </Button>
        </div>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
