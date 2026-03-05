import React from "react";
import { useAuth } from "../context/AuthContext";

export const ProfilePage: React.FC = () => {
  const { logout, user } = useAuth();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      {user && (
        <div className="bg-white shadow rounded p-6">
          <p>
            <strong>Name:</strong> {user.name || "No name set"}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      )}
      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};
