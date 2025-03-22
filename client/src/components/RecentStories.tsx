import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Story } from "@shared/schema";

type RecentStoryCardProps = {
  story: Story;
  onSelect: (storyId: number) => void;
};

function RecentStoryCard({ story, onSelect }: RecentStoryCardProps) {
  const formattedDate = format(new Date(story.dateGenerated), "MMMM d, yyyy");
  
  const getThemeColor = (theme: string) => {
    const themeColorMap: Record<string, string> = {
      adventure: "bg-green-100 text-green-800",
      fantasy: "bg-purple-100 text-purple-800",
      scifi: "bg-blue-100 text-blue-800",
      mystery: "bg-yellow-100 text-yellow-800",
      romance: "bg-pink-100 text-pink-800",
      comedy: "bg-orange-100 text-orange-800",
    };
    
    return themeColorMap[theme] || "bg-primary-100 text-primary-800";
  };
  
  // Truncate content for preview
  const previewContent = story.content.slice(0, 150) + (story.content.length > 150 ? "..." : "");
  
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-slate-800">{story.title}</h4>
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getThemeColor(story.theme)}`}>
          {story.theme.charAt(0).toUpperCase() + story.theme.slice(1)}
        </span>
      </div>
      <p className="text-slate-600 text-sm line-clamp-3 mb-3">{previewContent}</p>
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>{formattedDate}</span>
        <Button 
          variant="link" 
          size="sm" 
          className="text-primary-600 hover:text-primary-800 h-auto p-0"
          onClick={() => onSelect(story.id)}
        >
          Open
        </Button>
      </div>
    </div>
  );
}

type RecentStoriesProps = {
  onSelectStory: (storyId: number) => void;
};

export default function RecentStories({ onSelectStory }: RecentStoriesProps) {
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ['/api/stories/recent'],
  });
  
  if (isLoading) {
    return (
      <Card className="mb-10">
        <CardContent className="p-6">
          <h3 className="font-semibold text-xl text-slate-800 mb-4">Your Recent Stories</h3>
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-slate-400">Loading recent stories...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!stories || stories.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-10">
      <CardContent className="p-6">
        <h3 className="font-semibold text-xl text-slate-800 mb-4">Your Recent Stories</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <RecentStoryCard 
              key={story.id} 
              story={story} 
              onSelect={onSelectStory} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
