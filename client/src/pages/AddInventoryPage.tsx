import { InventoryForm } from "@/components/inventory/InventoryForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AddInventoryPage() {
    const navigate = useNavigate();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild onClick={() => navigate(-1)} className="hover:bg-gray-100 h-10 w-10">
                    {/* <Link > */}
                        <ChevronLeft className="w-5 h-5 p-2 " />
                    {/* </Link> */}
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Inventory</h1>
                    <p className="text-sm text-gray-500">Register new diamond stock</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <InventoryForm />
            </div>
        </div>
    );
}
