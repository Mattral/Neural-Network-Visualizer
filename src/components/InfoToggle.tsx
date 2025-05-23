
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface InfoToggleProps {
  title: string;
  children: React.ReactNode;
}

const InfoToggle = ({ title, children }: InfoToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 border border-border/40 rounded-lg overflow-hidden">
      <div 
        className="info-toggle p-2 bg-secondary/30 hover:bg-secondary/50 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="h-4 w-4 text-primary" />
        <span className="font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto" />
        )}
      </div>
      
      {isOpen && (
        <div className="p-3 text-sm text-muted-foreground bg-secondary/20 transition-all duration-300 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export default InfoToggle;
