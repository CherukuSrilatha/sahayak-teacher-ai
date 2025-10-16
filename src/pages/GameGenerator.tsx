import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

const GameGenerator = () => {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("3-4");
  const [gameType, setGameType] = useState("quiz");
  const [loading, setLoading] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<{
    title: string;
    instructions: string;
    content: any;
  } | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: "Missing information",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('game-generator', {
        body: { topic, gradeLevel, gameType }
      });

      if (error) {
        const errorMsg = error.message.includes('non-2xx') 
          ? 'Service is currently busy with high demand. Please try again in a moment.'
          : error.message;
        throw new Error(errorMsg);
      }

      setGeneratedGame(data.game);
      toast({
        title: "Game created!",
        description: "Your educational game is ready",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadGame = () => {
    if (!generatedGame) return;

    const content = `${generatedGame.title}\n\n${generatedGame.instructions}\n\n${JSON.stringify(generatedGame.content, null, 2)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Game downloaded successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Educational Game Generator</h1>
          <p className="text-muted-foreground">
            Create engaging educational games instantly for any topic
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Topic</label>
              <Input
                placeholder="e.g., Multiplication tables, Indian freedom fighters"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Grade Level</label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">Grade 1-2</SelectItem>
                  <SelectItem value="3-4">Grade 3-4</SelectItem>
                  <SelectItem value="5-6">Grade 5-6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Game Type</label>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz Game</SelectItem>
                  <SelectItem value="matching">Matching Game</SelectItem>
                  <SelectItem value="word-search">Word Search</SelectItem>
                  <SelectItem value="fill-blanks">Fill in the Blanks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full"
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate Game"}
            </Button>
          </div>
        </Card>

        {generatedGame && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{generatedGame.title}</h2>
              <Button onClick={downloadGame} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{generatedGame.instructions}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Game Content</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(generatedGame.content, null, 2)}</pre>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GameGenerator;