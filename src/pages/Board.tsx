
import { useParams } from "react-router-dom";
import ScriblioCanvas from "@/components/ScriblioCanvas";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Board = () => {
  const { boardId } = useParams();
  const { toast } = useToast();

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share this link with others to collaborate",
    });
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <Navbar />
      <div className="fixed right-4 top-20 z-10">
        <Button onClick={handleShareLink} variant="outline" className="bg-white">
          <Copy className="mr-2 h-4 w-4" />
          Share Board
        </Button>
      </div>
      <main className="pt-14 h-full">
        <ScriblioCanvas boardId={boardId} />
      </main>
    </div>
  );
};

export default Board;
