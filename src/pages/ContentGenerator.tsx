import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ContentGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what content you'd like to generate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-generator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, language }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }
      
      setGeneratedContent(data.generatedText);
      
      toast({
        title: "Content generated!",
        description: "Your localized content is ready",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error generating content",
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Content Generator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create hyper-local, culturally relevant educational content in your preferred language
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
              <Label htmlFor="prompt" className="text-base font-semibold">What would you like to create?</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Example: "Create a story in Marathi about farmers to explain different soil types"
              </p>
              <Textarea
                id="prompt"
                placeholder="Describe the content you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 resize-none"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-hero shadow-medium"
            >
              {loading ? "Generating..." : "Generate Content"}
            </Button>
          </div>
        </Card>

        {generatedContent && (
          <Card className="p-6 bg-gradient-card shadow-medium">
            <h3 className="text-xl font-semibold text-foreground mb-4">Generated Content</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap">{generatedContent}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline">Copy to Clipboard</Button>
              <Button variant="outline">Download as PDF</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
