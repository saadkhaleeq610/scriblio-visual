
import ScriblioCanvas from "@/components/ScriblioCanvas";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <Navbar />
      <main className="pt-14 h-full">
        <ScriblioCanvas />
      </main>
    </div>
  );
};

export default Index;
