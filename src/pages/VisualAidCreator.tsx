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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visual-aid-creator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate visual aid');
      }
      
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Visual aid generated!",
          description: "Your diagram is ready to use",
        });
      } else {
        toast({
          title: "Description generated",
          description: data.message || "Use this description to draw the visual aid",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error generating visual aid",
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
              <Button 
                variant="outline" 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = `visual-aid-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast({ title: "Downloaded!", description: "Image saved successfully" });
                }}
              >
                Download Image
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const printWindow = window.open('', '', 'width=800,height=600');
                  if (printWindow) {
                    printWindow.document.write(`<img src="${generatedImage}" style="max-width:100%" />`);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
              >
                Print
              </Button>
              <Button 
                variant="outline"
                onClick={handleGenerate}
              >
                Regenerate
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VisualAidCreator;
