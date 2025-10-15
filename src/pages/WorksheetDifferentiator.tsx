import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const WorksheetDifferentiator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [worksheets, setWorksheets] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast({
        title: "Please upload a file",
        description: "Upload a textbook page image to differentiate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const imageBase64 = await base64Promise;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/worksheet-differentiator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64 }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate worksheets');
      }
      
      setWorksheets(data.worksheets);
      
      toast({
        title: "Worksheets generated!",
        description: `Created ${data.worksheets.length} differentiated versions`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error generating worksheets",
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Worksheet Differentiator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Upload a textbook page and get multiple grade-level appropriate worksheets
          </p>
        </div>

        <Card className="p-6 mb-6 bg-gradient-card shadow-medium">
          <div className="space-y-6">
            <div>
              <Label htmlFor="file-upload" className="text-base font-semibold">Upload Textbook Page</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a clear photo of your textbook page (JPG, PNG)
              </p>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-primary font-medium">Click to upload</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </Label>
                {selectedFile && (
                  <p className="mt-3 text-sm text-foreground font-medium">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading || !selectedFile}
              size="lg"
              className="w-full bg-gradient-warm shadow-medium"
            >
              {loading ? "Analyzing & Generating..." : "Generate Differentiated Worksheets"}
            </Button>
          </div>
        </Card>

        {worksheets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Generated Worksheets</h3>
            {worksheets.map((worksheet, index) => (
              <Card key={index} className="p-5 bg-gradient-card shadow-soft hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">{worksheet.grade}</h4>
                    <p className="text-sm text-muted-foreground mb-2">Difficulty: {worksheet.difficulty}</p>
                    <p className="text-sm text-foreground">{worksheet.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Preview</Button>
                    <Button size="sm">Download</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksheetDifferentiator;
