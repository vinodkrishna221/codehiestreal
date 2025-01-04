"use client";

import { Editor as MonacoEditor } from "@monaco-editor/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { executeCode } from "@/lib/code-execution";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  defaultLanguage?: string;
  defaultValue?: string;
  onSubmit?: (code: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "typescript", label: "TypeScript" },
];

export function CodeEditor({
  defaultLanguage = "javascript",
  defaultValue = "// Write your code here\n",
  onSubmit,
}: CodeEditorProps) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(defaultValue);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsExecuting(true);
    try {
      const result = await executeCode({ code, language });
      
      if (result.success) {
        toast({
          title: "Code Execution Successful",
          description: <pre className="mt-2 w-full overflow-auto">{result.output}</pre>,
        });
      } else {
        toast({
          title: "Code Execution Failed",
          description: result.error,
          variant: "destructive",
        });
      }
      
      onSubmit?.(code);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute code",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.id} value={lang.id}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSubmit} disabled={isExecuting}>
          {isExecuting ? "Running..." : "Run Code"}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <MonacoEditor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}