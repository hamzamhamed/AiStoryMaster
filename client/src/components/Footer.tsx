import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold">StoryForge AI</span>
            </div>
            <p className="text-sm mt-2">Creating unique stories with artificial intelligence.</p>
          </div>
          <div>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-300 hover:text-white transition">Terms</a>
              <a href="#" className="text-slate-300 hover:text-white transition">Privacy</a>
              <a href="#" className="text-slate-300 hover:text-white transition">Help</a>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} StoryForge AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
