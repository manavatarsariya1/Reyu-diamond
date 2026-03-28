import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
// import type { RootState } from "@/app/store";
import type { RootState } from "@/app/store";
import { logout } from "@/features/auth/auth.Slice";
import NotificationBell from "../notifications/NotificationBell";


const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);

  const LogoutHandler = () => {

    sessionStorage.setItem("didRun", ""); // mark as run
    dispatch(logout());
    navigate("/login")
  }

  return (
    <div className="bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between ">

        <Link to="/" className="flex items-center gap-2">
          <Diamond className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-gradient">
            Reyu Diamond
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link to="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">Marketplace</Link>
          {user && user.role !== 'admin' && (
            <Link to="/ads" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
              Promote
            </Link>
          )}
        </div>

        {!user && (
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Login
              </Button>
            </Link>

            <Link to="/register">
              <Button size="sm" className="font-medium shadow-md">
                Create Account
              </Button>
            </Link>
          </div>
        )}

        {user && (
          <div className="flex items-center gap-3">
            <NotificationBell />
            {user.role === 'admin' ? (
                <Button variant={"default"} onClick={() => navigate("/admin")} size="sm" className="cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-sm">
                    Admin Panel
                </Button>
            ) : (
                <Button variant={"outline"} onClick={() => navigate("/dashboard")} size="sm" className="cursor-pointer border-slate-200 hover:bg-slate-50">
                    Dashboard
                </Button>
            )}
            <Button variant={"ghost"} onClick={LogoutHandler} size="sm" className="cursor-pointer text-slate-500 hover:text-red-500 hover:bg-red-50">
              Log out
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Navbar;
