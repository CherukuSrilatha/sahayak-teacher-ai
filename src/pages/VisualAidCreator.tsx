import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const VisualAidCreator = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Please describe what you need",
        description: "Describe the visual aid you want to create",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with image generation API (Gemini or other) via Lovable Cloud
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Placeholder - will be replaced with actual generated image
      setGeneratedImage("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop");
      
      toast({
        title: "Visual aid generated!",
        description: "Your diagram is ready to use",
      });
    } catch (error) {
      toast({
        title: "Error generating visual aid",
        description: "Please try again",
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Visual Aid Creator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Generate simple line drawings and diagrams for your lessons
          </p>
        </div>

        <Card className="p-6 mb-6 bg-gradient-card shadow-medium">
          <div className="space-y-6">
            <div>
              <Label htmlFor="description" className="text-base font-semibold">Describe Your Visual Aid</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Example: "Simple diagram of the water cycle with clouds, rain, and a river"
              </p>
              <Textarea
                id="description"
                placeholder="Describe what you want to draw..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 resize-none"
              />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <p className="text-sm font-medium text-foreground mb-2">💡 Tips for best results:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Request simple, clear line drawings</li>
                <li>Mention if you need labels or text</li>
                <li>Specify "black and white" for easy blackboard copying</li>
              </ul>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-hero shadow-medium"
            >
              {loading ? "Creating Visual Aid..." : "Generate Visual Aid"}
            </Button>
          </div>
        </Card>

        {generatedImage && (
          <Card className="p-6 bg-gradient-card shadow-medium">
            <h3 className="text-xl font-semibold text-foreground mb-4">Generated Visual Aid</h3>
            <div className="bg-white p-4 rounded-lg mb-4">
              <img 
                src={generatedImage} 
                alt="Generated visual aid" 
                className="w-full h-auto rounded border border-border"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Download Image</Button>
              <Button variant="outline">Print</Button>
              <Button variant="outline">Regenerate</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VisualAidCreator;
