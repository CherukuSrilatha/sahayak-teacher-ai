import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Lightbulb, Copy, Download, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const QuickExplainer = () => {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const handleAsk = async () => {
    if (!question.trim()) {
      toast({
        title: "Please enter a question",
        description: "Ask any question your students might have",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quick-explainer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question, language }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate explanation');
      }
      
      setExplanation(data.explanation);
      
      toast({
        title: "Explanation ready!",
        description: "Simple, accurate answer generated",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error generating explanation",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Quick Explainer</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Get instant, simple explanations for any student question in your preferred language
          </p>
        </div>

        <Card className="p-6 mb-6 bg-gradient-card shadow-medium">
          <div className="space-y-6">
            <div>
              <Label htmlFor="language" className="text-base font-semibold">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="marathi">Marathi (मराठी)</SelectItem>
                  <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                  <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
                  <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="question" className="text-base font-semibold">Student's Question</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Example: "Why is the sky blue?" or "How do plants make food?"
              </p>
              <Input
                id="question"
                placeholder="Enter the question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="text-base"
              />
            </div>

            <Button 
              onClick={handleAsk} 
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-success shadow-medium"
            >
              {loading ? "Generating..." : "Get Explanation"}
            </Button>
          </div>
        </Card>

        {explanation && (
          <Card className="p-6 bg-gradient-card shadow-medium">
            <h3 className="text-xl font-semibold text-foreground mb-4">Explanation</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap">{explanation}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(explanation);
                  toast({
                    title: "Copied!",
                    description: "Explanation copied to clipboard",
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([explanation], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `explanation-${Date.now()}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast({
                    title: "Downloaded!",
                    description: "Explanation downloaded successfully",
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (isSpeaking) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  } else {
                    const utterance = new SpeechSynthesisUtterance(explanation);
                    utterance.onend = () => setIsSpeaking(false);
                    window.speechSynthesis.speak(utterance);
                    setIsSpeaking(true);
                  }
                }}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {isSpeaking ? "Stop Reading" : "Read Aloud"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuickExplainer;
