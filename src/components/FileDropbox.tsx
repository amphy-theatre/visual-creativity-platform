
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileDropboxProps {
  onChange?: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
}

const FileDropbox: React.FC<FileDropboxProps> = ({
  onChange,
  accept = "text/csv",
  maxSize = 5, // Default 5MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (uploadedFile: File) => {
    // Check file type
    if (!uploadedFile.type.includes("csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size
    if (uploadedFile.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size should not exceed ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    
    if (onChange) {
      onChange(uploadedFile);
    }
    
    // Read file contents
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvData = event.target?.result as string;
        
        // Process the CSV using our edge function
        await processCsvData(csvData);
        
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          title: "Processing failed",
          description: "Unable to process the CSV file",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(uploadedFile);
  };
  
  const processCsvData = async (csvData: string) => {
    try {
      setIsProcessing(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to process files",
          variant: "destructive",
        });
        return;
      }
      
      // Call the edge function to summarize the CSV
      const { data, error } = await supabase.functions.invoke('summarize_csv', {
        body: { 
          csvData,
          userId: user.id 
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.success || !data.summary) {
        throw new Error('Failed to generate summary');
      }
      
      // Store the summary in the database
      const { error: insertError } = await supabase
        .from('file_summaries')
        .insert({
          user_id: user.id,
          summary: data.summary
        });
      
      if (insertError) {
        throw insertError;
      }
      
      toast({
        title: "File processed successfully",
        description: "CSV summary has been generated and stored",
      });
      
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
    
    toast({
      title: "File removed",
      description: "The uploaded file has been removed",
    });
  };

  const browseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={accept}
        className="hidden"
      />
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-foreground/20"
          } hover:border-foreground/30 cursor-pointer text-center`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={browseFiles}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-foreground/50" />
            <p className="text-sm text-foreground/70">
              Drag and drop a CSV file here, or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-foreground/50">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-foreground/50">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isProcessing && (
                <p className="text-xs text-primary animate-pulse">Processing...</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                disabled={isProcessing}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropbox;
