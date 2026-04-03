import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { requirementService, type Requirement } from "@/api/requirementService";
import { 
    Diamond, MapPin, DollarSign, Calendar, 
    ArrowLeft, Share2, Info, Sparkles, 
    ShieldCheck, Gem, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { toast } from "sonner";

export default function InquiryDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [requirement, setRequirement] = useState<Requirement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequirement = async () => {
            if (!id) return;
            try {
                const data = await requirementService.getPublicRequirement(id);
                setRequirement(data);
            } catch (error) {
                console.error("Failed to fetch inquiry:", error);
                toast.error("Inquiry not found or expired.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequirement();
    }, [id]);

    const handleShare = async () => {
        const shareData = {
            title: `Diamond Inquiry: ${requirement?.carat}ct ${requirement?.shape}`,
            text: `Looking for a ${requirement?.carat}ct ${requirement?.shape} diamond. Color: ${requirement?.color}, Clarity: ${requirement?.clarity}.`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (!requirement) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <Info className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Inquiry Not Found</h2>
                    <p className="text-gray-500 mb-8 max-w-md">The diamond inquiry you're looking for might have been fulfilled or removed by the user.</p>
                    <Button asChild className="rounded-full px-8">
                        <Link to="/marketplace">Explore Marketplace</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/marketplace" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full shadow-sm hover:shadow-md transition-all">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white">
                            <CardContent className="p-0">
                                <div className="aspect-[16/9] bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-[80px]"></div>
                                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-300 rounded-full blur-[80px]"></div>
                                    </div>
                                    <Gem className="w-32 h-32 text-white/90 drop-shadow-2xl animate-pulse" />
                                    <div className="absolute bottom-6 left-6">
                                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1 font-semibold tracking-wide flex items-center gap-1.5 rounded-full">
                                            <Sparkles className="w-3.5 h-3.5" /> Buying Request
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                            Looking for {requirement.carat}ct {requirement.shape}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> {requirement.location}</span>
                                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> Posted {new Date(requirement.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <DetailItem label="Color" value={requirement.color} icon={<Sparkles className="w-4 h-4 text-amber-500" />} />
                                        <DetailItem label="Clarity" value={requirement.clarity} icon={<Diamond className="w-4 h-4 text-blue-500" />} />
                                        <DetailItem label="Lab" value={requirement.lab} icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} />
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Proposed Budget</p>
                                            <p className="text-3xl font-black text-slate-900 flex items-center gap-1">
                                                <DollarSign className="w-6 h-6 text-indigo-600" />
                                                {requirement.budget.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg hover:shadow-indigo-200 transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Have a matching diamond?</h3>
                                    <p className="text-indigo-100 font-medium">Connect with the buyer to fulfill this inquiry and complete a deal.</p>
                                </div>
                                <Button className="bg-white text-indigo-600 hover:bg-slate-50 font-bold px-8 py-6 rounded-2xl shadow-lg whitespace-nowrap">
                                    Connect with Buyer
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-600" /> Buyer Profile
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-xl">
                                        V
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">Verified Buyer</p>
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
                                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">KYC Verified</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <p className="text-sm text-slate-500 leading-relaxed italic">"Trustworthy member of the Reyu Diamond marketplace with 10+ completed transactions."</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg rounded-3xl bg-indigo-50/50 backdrop-blur-sm border border-indigo-100">
                            <CardContent className="p-6 space-y-3">
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Safe Trading</h3>
                                <p className="text-sm text-indigo-900/70 leading-relaxed">Reyu Diamond ensures all trades are secure and verified. Payments are held in escrow until certification is validated.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center items-start space-y-1 hover:shadow-md transition-all">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="opacity-80">{icon}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-lg font-black text-slate-900">{value}</p>
        </div>
    );
}
