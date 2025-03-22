import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Users, FileDown } from "lucide-react";

export default function FeatureHighlights() {
  return (
    <div className="mb-10">
      <h3 className="font-semibold text-2xl text-slate-800 mb-6 text-center">Features & Capabilities</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-primary-600 mb-4">
              <Lightbulb className="h-10 w-10" />
            </div>
            <h4 className="font-semibold text-xl text-slate-800 mb-2">Creative Themes</h4>
            <p className="text-slate-600">Choose from a variety of story themes like adventure, fantasy, mystery, sci-fi, and more to inspire unique narratives.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-primary-600 mb-4">
              <Users className="h-10 w-10" />
            </div>
            <h4 className="font-semibold text-xl text-slate-800 mb-2">Custom Characters</h4>
            <p className="text-slate-600">Create your own characters with unique names and descriptions to make your stories personal and memorable.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-primary-600 mb-4">
              <FileDown className="h-10 w-10" />
            </div>
            <h4 className="font-semibold text-xl text-slate-800 mb-2">Export as PDF</h4>
            <p className="text-slate-600">Save your generated stories as PDF files to keep forever, share with friends, or print for offline reading.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
