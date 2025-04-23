
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const createNewBoard = () => {
    const boardId = Math.random().toString(36).substring(2, 8);
    navigate(`/board/${boardId}`);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Scriblio</h1>
        <p className="text-gray-600">Create a new board and start collaborating!</p>
        <Button onClick={createNewBoard} size="lg">
          Create New Board
        </Button>
      </div>
    </div>
  );
};

export default Index;
