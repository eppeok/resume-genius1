import { useState, useCallback } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ResumeForm, FormData } from "@/components/ResumeForm";
import { ResumeOutput } from "@/components/ResumeOutput";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [optimizedResume, setOptimizedResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const handleSubmit = useCallback(async (data: FormData) => {
    setIsLoading(true);
    setIsStreaming(true);
    setOptimizedResume("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to optimize resume");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setOptimizedResume(fullContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsStreaming(false);
      toast({
        title: "Resume Optimized!",
        description: "Your ATS-optimized resume is ready.",
      });
    } catch (error) {
      console.error("Error optimizing resume:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to optimize resume",
        variant: "destructive",
      });
      setOptimizedResume("");
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleReset = useCallback(() => {
    setOptimizedResume("");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container max-w-4xl py-12 sm:py-16 lg:py-20 px-4">
        <HeroSection />

        <div className="mt-12 sm:mt-16">
          {optimizedResume || isStreaming ? (
            <ResumeOutput
              content={optimizedResume}
              isStreaming={isStreaming}
              onReset={handleReset}
            />
          ) : (
            <ResumeForm onSubmit={handleSubmit} isLoading={isLoading} />
          )}
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by AI • Your data is processed securely and never stored</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
