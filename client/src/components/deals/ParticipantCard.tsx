import { User, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParticipantCardProps {
    role: "Buyer" | "Seller";
    name: string;
    id: string;
    isEmailVerified?: boolean;
}
import React from 'react'

const ParticipantCard = ({ role, name, id, isEmailVerified }: ParticipantCardProps) => {

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4" data-participant-id={id}>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${role === 'Buyer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
            <User className="h-5 w-5" />
        </div>

        <div className="flex-grow">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-0.5">{role}</div>
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                {name}
                {isEmailVerified && <ShieldCheck className="w-3.5 h-3.5 text-green-500" />}
            </div>
        </div>

        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
            <Mail className="w-4 h-4 text-gray-500" />
        </Button>
    </div>
);
}

export default ParticipantCard