
import React, { useState } from "react";
import FileDropbox from "./FileDropbox";
import { toast } from "@/components/ui/use-toast";
import { readFileAsText } from "@/utils/csvUtils";
import { useSubscription } from "@/context/SubscriberContext";
interface CSVUploaderProps {
  onCsvDataChange: (data: string | null) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onCsvDataChange }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { canRender } = useSubscription()

  const handleFileChange = async (file: File | null) => {
    setUploadedFile(file);
    
    if (!file) {
      onCsvDataChange(null);
      return;
    }
    
    try {
      const content = await readFileAsText(file);
      onCsvDataChange(content);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "File Error",
        description: "Failed to read the uploaded file",
        variant: "destructive",
      });
      onCsvDataChange(null);
    }
  };

  return (
    canRender() ?
    <FileDropbox onChange={handleFileChange} maxSize={10} />
    : null
  );
};

export default CSVUploader;
