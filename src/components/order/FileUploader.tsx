import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, FileText, Eye } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  onPageCountChange: (pageCount: number) => void;
  onPageRangeChange: (range: string) => void;
}

const FileUploader = ({ onFilesChange, onPageCountChange, onPageRangeChange }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(file.type);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!isValidFileType(file)) {
        toast.error(`${file.name} is not a valid file type. Only PDF and Word documents are allowed.`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      for (const file of validFiles) {
        try {
          if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
              const pdf = await pdfjs.getDocument(typedarray).promise;
              onPageCountChange(pdf.numPages);
              onPageRangeChange(`1-${pdf.numPages}`);
            };
            reader.readAsArrayBuffer(file);
          } else {
            const pageCount = Math.floor(Math.random() * 20) + 1;
            onPageCountChange(pageCount);
            onPageRangeChange(`1-${pageCount}`);
          }
          
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error(`Failed to process ${file.name}`);
        }
      }
      
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      toast.success(`${validFiles.length} file(s) added`);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    onPageCountChange(0);
    onPageRangeChange('all');
    toast.info("File removed");
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePreview = (e: React.MouseEvent, file: File) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const handlePageSelect = (pageNum: number) => {
    const newSelectedPages = new Set(selectedPages);
    if (selectedPages.has(pageNum)) {
      newSelectedPages.delete(pageNum);
    } else {
      newSelectedPages.add(pageNum);
    }
    setSelectedPages(newSelectedPages);
    
    if (newSelectedPages.size > 0) {
      const pages = Array.from(newSelectedPages).sort((a, b) => a - b);
      onPageRangeChange(pages.join(','));
    } else {
      onPageRangeChange('all');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`file-drop-area ${isDragging ? 'file-drop-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx"
          multiple
          onChange={handleFileChange}
        />
        <Upload className="mx-auto h-12 w-12 text-xerox-500 mb-2" />
        <p className="text-lg font-semibold text-xerox-700">
          Drag & Drop Files Here
        </p>
        <p className="text-gray-500">or click to browse</p>
        <p className="text-sm text-gray-500 mt-2">
          Accepted formats: PDF and Word documents only
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-xerox-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {file.type === 'application/pdf' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => handlePreview(e, file)}
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>PDF Preview</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full w-full rounded-md border p-4">
            {selectedFile && (
              <Document
                file={selectedFile}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex flex-col items-center"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div key={index + 1} className="mb-4 relative">
                    <div 
                      className={`absolute inset-0 cursor-pointer transition-colors ${
                        selectedPages.has(index + 1) ? 'bg-blue-200/50' : 'hover:bg-gray-100/50'
                      }`}
                      onClick={() => handlePageSelect(index + 1)}
                    />
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={600}
                    />
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Page {index + 1} of {numPages}
                    </p>
                  </div>
                ))}
              </Document>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploader;