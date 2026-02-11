import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
// import type { RootState } from "@/app/store";
import type { RootState } from "@/app/store";
import { logout } from "@/features/auth/auth.Slice";


const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);

  const LogoutHandler = () => {

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

        <div className="grid grid-cols-2">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
        </div>

        {!user && (
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>

            <Link to="/register">
              <Button variant="hero" size="sm">
                Create Account
              </Button>
            </Link>
          </div>
        )}

        {user && (
          <div className="flex gap-3">
            <Button variant={"outline"} onClick={() => navigate("/dashboard")} size="sm" className="cursor-pointer">
              Dashboard
            </Button>
            <Button variant={"outline"} onClick={LogoutHandler} size="sm" className="cursor-pointer">
              Log out
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Navbar;
