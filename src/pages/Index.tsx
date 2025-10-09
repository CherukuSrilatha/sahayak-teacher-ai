import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, FileText, Lightbulb, Image, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const tools = [
    {
      icon: BookOpen,
      title: "Content Generator",
      description: "Create hyper-local stories and lessons in your language",
      href: "/content-generator",
      gradient: "from-primary to-primary/80"
    },
    {
      icon: FileText,
      title: "Worksheet Differentiator",
      description: "Upload textbook pages, get grade-level variations",
      href: "/worksheet-differentiator",
      gradient: "from-secondary to-secondary/80"
    },
    {
      icon: Lightbulb,
      title: "Quick Explainer",
      description: "Instant answers to student questions in local language",
      href: "/quick-explainer",
      gradient: "from-accent to-accent/80"
    },
    {
      icon: Image,
      title: "Visual Aid Creator",
      description: "Generate simple drawings and diagrams for your lessons",
      href: "/visual-aid-creator",
      gradient: "from-primary to-accent"
    },
    {
      icon: Calendar,
      title: "Lesson Planner",
      description: "AI-powered weekly planning to structure your teaching",
      href: "/lesson-planner",
      gradient: "from-secondary to-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC04Yy0xLjEgMC0yIC45LTIgMnY4YzAgMS4xLjkgMiAyIDJoOGMxLjEgMCAyLS45IDItMnYtOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-12 w-12 text-white mr-3" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">Sahayak</h1>
          </div>
          
          <p className="text-xl md:text-2xl text-white/90 text-center max-w-3xl mx-auto mb-4">
            Your AI Teaching Assistant for Multi-Grade Classrooms
          </p>
          
          <p className="text-base md:text-lg text-white/80 text-center max-w-2xl mx-auto mb-10">
            Empowering teachers in low-resource environments with localized content, 
            differentiated materials, and instant educational support
          </p>
          
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elevated">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Teaching Toolkit
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five powerful AI tools designed to save you time and enhance your students' learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Link key={index} to={tool.href}>
                <Card className="group h-full p-6 hover:shadow-elevated transition-all duration-300 cursor-pointer bg-gradient-card border-border">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {tool.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Local Language Support</h3>
              <p className="text-muted-foreground">
                Generate content in Hindi, Marathi, and other regional languages
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Multi-Grade Ready</h3>
              <p className="text-muted-foreground">
                Create differentiated materials for multiple learning levels
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Instant Help</h3>
              <p className="text-muted-foreground">
                Quick explanations and visual aids at your fingertips
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
