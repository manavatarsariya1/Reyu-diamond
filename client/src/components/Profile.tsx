import React from 'react'
import { useSelector } from 'react-redux';
import type { RootState } from "@/app/store";

const Profile: React.FC = () => {

    const {user} = useSelector((state:RootState) => state.auth);
//    const user = {
//     name: "m",
//     email: "mnv123@gmail.com",
//     id: "1770269860669",
//     photo: "https://i.pravatar.cc/150" // temporary profile image
//   };

  if (!user) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6">

        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <img
            src={"https://i.pravatar.cc/150"}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-blue-500 shadow-md"
          />
          <h2 className="mt-4 text-xl font-semibold">{user.name || user.username}</h2>
          <p className="text-gray-500 text-sm">{user.role?.toUpperCase()} Profile</p>
        </div>

        {/* Info Section */}
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm">User ID</p>
            <p className="font-medium">{user.id || user._id}</p>
          </div>
        </div>

        {/* Button */}
        <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Edit Profile
        </button>

      </div>
    </div>
  );
}

export default Profile