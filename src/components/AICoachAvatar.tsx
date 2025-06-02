
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SmilePlus } from "lucide-react";

interface AICoachAvatarProps {
  message?: string;
  className?: string;
}

const AICoachAvatar: React.FC<AICoachAvatarProps> = ({
  message = "I'm here to guide you! Ready for your next career win?",
  className = "",
}) => (
  <div className={`flex items-center gap-4 bg-scanmatch-50 px-5 py-4 rounded-lg border shadow-sm animate-fade-in ${className}`}>
    <Avatar className="h-14 w-14 ring-2 ring-scanmatch-200">
      <AvatarImage src="/images/ai-coach-avatar.png" alt="AI Coach" />
      <AvatarFallback className="bg-scanmatch-100 text-scanmatch-700 flex items-center justify-center"><SmilePlus className="h-8 w-8" /></AvatarFallback>
    </Avatar>
    <div>
      <p className="text-base text-scanmatch-700">
        <span className="font-semibold">AI Coach:</span> {message}
      </p>
    </div>
  </div>
);

export default AICoachAvatar;
