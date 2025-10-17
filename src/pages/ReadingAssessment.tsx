import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mic, Square, Download, FileText, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";

const ReadingAssessment = () => {
  const [prompt, setPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [report, setReport] = useState<{
    transcription: string;
    fluency_score: number;
    accuracy_analysis: string;
    mistakes: string[];
    suggestions: string[];
    overall_feedback: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly and read the passage",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Processing your recording...",
      });
    }
  };

  const generateReport = async () => {
    if (!audioBlob || !prompt) {
      toast({
        title: "Missing information",
        description: "Please provide both the passage and record audio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const { data, error } = await supabase.functions.invoke('reading-assessment', {
          body: { 
            audio: base64Audio.split(',')[1],
            expectedText: prompt
          }
        });

        if (error) throw error;

        setTranscription(data.transcription);
        setReport(data.report);
        toast({
          title: "Assessment complete!",
          description: "Your reading report is ready",
        });
      };
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const content = `READING ASSESSMENT REPORT
Generated: ${new Date().toLocaleString()}

PASSAGE:
${prompt}

TRANSCRIPTION:
${transcription}

FLUENCY SCORE: ${report.fluency_score}/10

ACCURACY ANALYSIS:
${report.accuracy_analysis}

MISTAKES IDENTIFIED:
${report.mistakes.map((m, i) => `${i + 1}. ${m}`).join('\n')}

SUGGESTIONS FOR IMPROVEMENT:
${report.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

OVERALL FEEDBACK:
${report.overall_feedback}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Report downloaded successfully",
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Reading Assessment</h1>
          <p className="text-muted-foreground">
            Record students reading and get detailed performance reports with suggestions
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Reading Passage</h2>
          <Textarea
            placeholder="Enter the passage the student should read..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[150px] mb-4"
          />

          <div className="flex gap-4">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex-1">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}

            {audioBlob && !isRecording && (
              <Button 
                onClick={generateReport} 
                disabled={loading}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            )}
          </div>
        </Card>

        {report && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Assessment Report</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (isSpeaking) {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    } else {
                      const reportText = `Fluency Score: ${report.fluency_score} out of 10. 
                        Accuracy Analysis: ${report.accuracy_analysis}. 
                        Mistakes: ${report.mistakes.join('. ')}. 
                        Suggestions: ${report.suggestions.join('. ')}. 
                        Overall Feedback: ${report.overall_feedback}`;
                      const utterance = new SpeechSynthesisUtterance(reportText);
                      utterance.onend = () => setIsSpeaking(false);
                      window.speechSynthesis.speak(utterance);
                      setIsSpeaking(true);
                    }
                  }}
                  variant="outline"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {isSpeaking ? "Stop Reading" : "Read Report"}
                </Button>
                <Button onClick={downloadReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Transcription</h3>
                <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg">{transcription}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Fluency Score</h3>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">{report.fluency_score}/10</div>
                  <div className="flex-1 bg-muted h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all"
                      style={{ width: `${report.fluency_score * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Accuracy Analysis</h3>
                <p className="text-muted-foreground">{report.accuracy_analysis}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Mistakes Identified</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {report.mistakes.map((mistake, idx) => (
                    <li key={idx}>{mistake}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Suggestions for Improvement</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {report.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Overall Feedback</h3>
                <p className="text-muted-foreground">{report.overall_feedback}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReadingAssessment;