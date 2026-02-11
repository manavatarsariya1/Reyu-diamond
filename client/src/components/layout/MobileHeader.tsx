import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
    return (
        <div className="flex items-center p-4 border-b md:hidden bg-white/50 backdrop-blur-sm sticky top-0 z-50">
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
                <Menu />
            </Button>
            <h1 className="font-bold text-lg">Reyu Diamond</h1>
        </div>
    );
};
