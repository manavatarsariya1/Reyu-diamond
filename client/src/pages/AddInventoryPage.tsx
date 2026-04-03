import { InventoryForm } from "@/components/inventory/InventoryForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

export default function AddInventoryPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    
    // Get the current item from redux if we're editing
    const currentItem = useSelector((state: RootState) => 
        isEdit ? state.inventory.items.find(i => i._id === id) : null
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-gray-100 h-10 w-10">
                    <ChevronLeft className="w-5 h-5 p-2 " />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Inventory" : "Add Inventory"}</h1>
                    <p className="text-sm text-gray-500">{isEdit ? "Update existing stock details" : "Register new diamond stock"}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <InventoryForm 
                    currentItem={currentItem} 
                    onSuccess={() => navigate("/inventory")} 
                />
            </div>
        </div>
    );
}
