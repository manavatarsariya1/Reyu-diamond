import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchAllDealsRequest } from "@/features/deal/dealSlice";
import { DealCard } from "@/components/deals/DealCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Filter, ShieldCheck, Loader2 } from "lucide-react";

export default function DealDashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { deals, isLoading } = useSelector((state: RootState) => state.deal);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        dispatch(fetchAllDealsRequest());
    }, [dispatch]);

    // Filter Logic
   const filteredDeals = Array.isArray(deals) ? deals.filter(deal => {
    const matchesSearch = String(deal._id).includes(searchQuery);
    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "active") return !["COMPLETED", "CANCELLED"].includes(deal.status);
    if (activeTab === "completed") return deal.status === "COMPLETED";
    return true;
}) : [];

    return (
        <div className="space-y-6 container mx-auto py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Deals & Transactions</h1>
                        <p className="text-muted-foreground">Manage your secure diamond acquisitions and sales.</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search deals..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Deals</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <span className="ml-2 text-purple-600 font-medium">Loading Deals...</span>
                        </div>
                    ) : filteredDeals?.length > 0 ? (
                        filteredDeals.map((deal) => (
                            <DealCard key={deal._id} deal={deal} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">No deals found</h3>
                            <p className="text-gray-500">No transactions match your current filters.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
