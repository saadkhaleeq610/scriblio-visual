
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Save, Undo, Redo } from "lucide-react";

const Navbar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-scriblio-purple mr-8">Scriblio</h1>
        <div className="flex space-x-1">
          <Button variant="outline" size="sm">
            <Undo className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm">
            <Redo className="h-4 w-4 mr-2" />
            Redo
          </Button>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
