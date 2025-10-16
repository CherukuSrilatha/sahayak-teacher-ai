import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LessonPlanner = () => {
  const [subject, setSubject] = useState("");
  const [grades, setGrades] = useState("");
  const [topics, setTopics] = useState("");
  const [loading, setLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!subject.trim() || !grades.trim() || !topics.trim()) {
      toast({
        title: "Please fill all fields",
        description: "We need subject, grades, and topics to create your plan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lesson-planner`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject, grades, topics }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lesson plan');
      }
      
      setLessonPlan(data.lessonPlan);
      
      toast({
        title: "Lesson plan created!",
        description: "Your weekly plan is ready",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error creating lesson plan",
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Lesson Planner</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create structured weekly lesson plans tailored to your multi-grade classroom
          </p>
        </div>

        <Card className="p-6 mb-6 bg-gradient-card shadow-medium">
          <div className="space-y-6">
            <div>
              <Label htmlFor="subject" className="text-base font-semibold">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Science, English"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="grades" className="text-base font-semibold">Grade Levels</Label>
              <Input
                id="grades"
                placeholder="e.g., Grade 3, 4, and 5"
                value={grades}
                onChange={(e) => setGrades(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="topics" className="text-base font-semibold">Topics to Cover</Label>
              <Textarea
                id="topics"
                placeholder="List the topics or chapters you want to cover this week..."
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                className="min-h-24 resize-none mt-2"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-warm shadow-medium"
            >
              {loading ? "Creating Lesson Plan..." : "Generate Weekly Plan"}
            </Button>
          </div>
        </Card>

        {lessonPlan && (
          <Card className="p-6 bg-gradient-card shadow-medium">
            <h3 className="text-xl font-semibold text-foreground mb-4">{lessonPlan.week} Plan</h3>
            <div className="space-y-3">
              {lessonPlan.days.map((day: any, index: number) => (
                <Card key={index} className="p-4 bg-background/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{day.day}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{day.activity}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{day.duration}</span>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  const content = `${lessonPlan.week} Plan\n\n${lessonPlan.days.map((day: any) => 
                    `${day.day}\n${day.activity}\nDuration: ${day.duration}\n`
                  ).join('\n')}`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `lesson-plan-${Date.now()}.txt`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast({ title: "Downloaded!", description: "Lesson plan saved successfully" });
                }}
              >
                Download Plan
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LessonPlanner;
