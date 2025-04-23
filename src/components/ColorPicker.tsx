
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#F59E0B", // Yellow
    "#10B981", // Green
    "#3B82F6", // Blue
    "#000000", // Black
    "#6B7280", // Gray
    "#EF4444", // Red
  ];

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative"
        >
          <div 
            className="absolute inset-2 rounded"
            style={{ backgroundColor: color }}
          />
          <Palette className="h-4 w-4 opacity-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className={`h-8 w-8 rounded-md border transition-transform hover:scale-110 ${
                color === c ? "ring-2 ring-offset-2 ring-primary" : ""
              }`}
              style={{ backgroundColor: c }}
              onClick={() => handleColorChange(c)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
