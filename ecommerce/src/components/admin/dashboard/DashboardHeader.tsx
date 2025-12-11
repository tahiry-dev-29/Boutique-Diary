import React from "react";
import { Search, Bell, Grid, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  user: {
    username: string;
    avatarUrl?: string;
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      {/* Search Bar */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar aquí..."
          className="pl-10 bg-white border-gray-200 rounded-xl focus-visible:ring-purple-500"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4 self-end sm:self-auto">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Grid className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Moon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="pl-2 border-l border-gray-200">
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage
              src={user.avatarUrl || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
