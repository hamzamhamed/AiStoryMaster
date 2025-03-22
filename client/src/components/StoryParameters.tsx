import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Zap } from "lucide-react";
import { generateStorySchema } from "@shared/schema";

type Character = {
  name: string;
  description: string;
};

const themes = [
  { id: "adventure", name: "Adventure" },
  { id: "fantasy", name: "Fantasy" },
  { id: "scifi", name: "Sci-Fi" },
  { id: "mystery", name: "Mystery" },
  { id: "romance", name: "Romance" },
  { id: "comedy", name: "Comedy" },
];

type StoryParametersProps = {
  onSubmit: (values: z.infer<typeof generateStorySchema>) => void;
  isLoading: boolean;
};

export default function StoryParameters({ onSubmit, isLoading }: StoryParametersProps) {
  const [characters, setCharacters] = useState<Character[]>([{ name: "", description: "" }]);

  const form = useForm<z.infer<typeof generateStorySchema>>({
    resolver: zodResolver(generateStorySchema),
    defaultValues: {
      theme: "comedy",
      title: "",
      setting: "",
      length: "medium",
      plotElements: "",
    },
  });

  const handleAddCharacter = () => {
    setCharacters([...characters, { name: "", description: "" }]);
  };

  const handleRemoveCharacter = (index: number) => {
    if (characters.length > 1) {
      const newCharacters = [...characters];
      newCharacters.splice(index, 1);
      setCharacters(newCharacters);
    }
  };

  const handleCharacterChange = (index: number, field: keyof Character, value: string) => {
    const newCharacters = [...characters];
    newCharacters[index][field] = value;
    setCharacters(newCharacters);
  };

  const handleSubmit = (values: z.infer<typeof generateStorySchema>) => {
    // Filter out characters with empty names
    const validCharacters = characters.filter(char => char.name.trim() !== "");
    onSubmit({ ...values, characters: validCharacters });
  };

  return (
    <div className="lg:w-2/5 bg-white rounded-xl shadow-md p-6">
      <h3 className="font-semibold text-xl text-slate-800 mb-4">Story Parameters</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium text-slate-700">Story Theme</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {themes.map((theme) => (
                <div key={theme.id} className="relative">
                  <input
                    type="radio"
                    id={`theme-${theme.id}`}
                    value={theme.id}
                    checked={form.watch("theme") === theme.id}
                    onChange={() => form.setValue("theme", theme.id)}
                    className="peer absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <label
                    htmlFor={`theme-${theme.id}`}
                    className="block p-3 text-center rounded-lg border-2 border-slate-200 bg-slate-50 peer-checked:border-primary-500 peer-checked:bg-primary-50 transition cursor-pointer"
                  >
                    <span className="block text-sm font-medium">{theme.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Story Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter a title or leave blank for AI to generate" 
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Characters */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <FormLabel className="text-sm font-medium text-slate-700">Characters</FormLabel>
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                className="text-xs text-primary-600 hover:text-primary-800 h-auto p-0"
                onClick={handleAddCharacter}
              >
                + Add Character
              </Button>
            </div>
            
            {characters.map((character, index) => (
              <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-700">Character {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                    onClick={() => handleRemoveCharacter(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Input
                    placeholder="Character name"
                    value={character.name}
                    onChange={(e) => handleCharacterChange(index, "name", e.target.value)}
                    className="text-sm"
                  />
                  <Textarea
                    placeholder="Brief description (optional)"
                    value={character.description}
                    onChange={(e) => handleCharacterChange(index, "description", e.target.value)}
                    className="text-sm h-16 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Setting */}
          <FormField
            control={form.control}
            name="setting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Setting</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Where does your story take place?" 
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Length */}
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Story Length</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="short">Short (250-500 words)</SelectItem>
                    <SelectItem value="medium">Medium (500-1000 words)</SelectItem>
                    <SelectItem value="long">Long (1000-1500 words)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          {/* Additional Plot Elements */}
          <FormField
            control={form.control}
            name="plotElements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Plot Elements (optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add specific plot points, objects, or events you'd like included" 
                    className="h-20 resize-none"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Generate Button */}
          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <Zap className="h-5 w-5" />
            {isLoading ? "Generating Story..." : "Generate Story"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
