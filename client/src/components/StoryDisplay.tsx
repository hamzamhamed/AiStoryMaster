import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { Story } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type StoryDisplayProps = {
  story: Story | null;
  loading: boolean;
  onNewStory: () => void;
};

export default function StoryDisplay({ story, loading, onNewStory }: StoryDisplayProps) {
  const { toast } = useToast();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleSavePDF = async () => {
    if (!story) return;
    
    try {
      setDownloadingPdf(true);
      
      const response = await apiRequest("POST", "/api/stories/export-pdf", { storyId: story.id });
      
      if (!response.ok) throw new Error("Failed to generate PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and click it to download the PDF
      const a = document.createElement("a");
      a.href = url;
      a.download = `${story.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF Downloaded",
        description: "Your story has been saved as a PDF file.",
      });
    } catch (error) {
      console.error("PDF download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not download your story as PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="lg:w-3/5">
        <div className="bg-white rounded-xl shadow-md p-6 h-full">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-slate-600">Crafting your story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="lg:w-3/5">
        <div className="bg-white rounded-xl shadow-md p-6 h-full">
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <BookIcon className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Your story will appear here</h3>
            <p className="text-slate-500 max-w-md">Fill in the form and click "Generate Story" to create your unique AI-generated tale.</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = story.dateGenerated 
    ? format(new Date(story.dateGenerated), "MMMM d, yyyy") 
    : format(new Date(), "MMMM d, yyyy");

  return (
    <div className="lg:w-3/5">
      <div className="bg-white rounded-xl shadow-md p-6 h-full">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium mb-2">
                {capitalizeFirstLetter(story.theme)}
              </span>
              <h2 className="font-bold text-2xl text-slate-800">{story.title}</h2>
              <p className="text-slate-500 text-sm mt-1">Generated on {formattedDate}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={handleSavePDF}
                disabled={downloadingPdf}
              >
                <Download className="h-4 w-4 mr-1" />
                {downloadingPdf ? "Downloading..." : "Save as PDF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={onNewStory}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Story
              </Button>
            </div>
          </div>
          
          <div className="prose max-w-none story-content text-slate-700">
            {story.content.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Book icon component
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
      />
    </svg>
  );
}
