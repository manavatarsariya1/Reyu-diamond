import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface InventoryFiltersProps {
    onSearch: (query: string) => void;
}

export function InventoryFilters({ onSearch }: InventoryFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search by ID, specs, or barcode..."
                    className="pl-9 bg-white shadow-sm border-gray-200"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </Button>
                <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Sort
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm ml-auto md:ml-2" asChild>
                    <Link to="/inventory/add">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Inventory
                    </Link>
                </Button>
            </div>
        </div>
    );
}
