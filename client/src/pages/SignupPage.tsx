import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  signupSchema,
  type SignupInput,
} from "../../../shared/validators/auth.validations";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      await signup(data.email, data.password, data.name);
      navigate("/profile");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded shadow-md w-full max-w-md"
        >
          <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className="w-full mb-4 p-2 border rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mb-3">{errors.email.message}</p>
          )}
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="w-full mb-4 p-2 border rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mb-3">
              {errors.password.message}
            </p>
          )}
          <input
            type="text"
            placeholder="Name"
            {...register("name")}
            className="w-full mb-4 p-2 border rounded"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mb-3">{errors.name.message}</p>
          )}
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-blue-500 text-white p-2  rounded hover:bg-blue-600 transition"
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm/6 text-gray-400">
          You already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
