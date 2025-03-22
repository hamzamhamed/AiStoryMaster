import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryParameters from "@/components/StoryParameters";
import StoryDisplay from "@/components/StoryDisplay";
import RecentStories from "@/components/RecentStories";
import FeatureHighlights from "@/components/FeatureHighlights";
import { Story, GenerateStoryParams } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStoryId, setCurrentStoryId] = useState<number | null>(null);
  
  // Query for the current story if selected
  const { data: currentStory, isLoading: isLoadingStory } = useQuery<Story>({
    queryKey: ['/api/stories', currentStoryId],
    enabled: !!currentStoryId,
  });
  
  // Mutation for generating a new story
  const { mutate: generateStory, isPending: isGenerating } = useMutation({
    mutationFn: async (params: GenerateStoryParams) => {
      const res = await apiRequest('POST', '/api/stories/generate', params);
      return res.json();
    },
    onSuccess: (data: Story) => {
      setCurrentStoryId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/stories/recent'] });
      toast({
        title: "Story Generated",
        description: "Your new story has been successfully created.",
      });
    },
    onError: (error) => {
      console.error("Story generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate your story. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSelectStory = (storyId: number) => {
    setCurrentStoryId(storyId);
  };
  
  const handleNewStory = () => {
    setCurrentStoryId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-10 flex-grow">
        {/* Main Page Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">AI Story Generator</h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            Create unique stories with AI. Customize characters, settings, and themes to craft the perfect tale.
          </p>
        </div>
        
        {/* App Interface */}
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          <StoryParameters
            onSubmit={generateStory}
            isLoading={isGenerating}
          />
          
          <StoryDisplay
            story={currentStory || null}
            loading={isGenerating || isLoadingStory}
            onNewStory={handleNewStory}
          />
        </div>
        
        <RecentStories onSelectStory={handleSelectStory} />
        
        <FeatureHighlights />
      </main>
      
      <Footer />
    </div>
  );
}
