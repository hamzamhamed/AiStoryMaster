import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8" />
          <h1 className="text-xl md:text-2xl font-bold">StoryForge AI</h1>
        </div>
        <div>
          <Button variant="secondary" size="sm" className="bg-white text-primary-600 hover:bg-slate-100">
            <span className="hidden md:inline">Sign In</span>
            <span className="md:hidden">Login</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
