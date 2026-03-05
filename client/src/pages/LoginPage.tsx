import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  loginSchema,
  type LoginInput,
} from "../../../shared/validators/auth.validations";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
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
          <h1 className="text-2xl font-bold mb-6">Login</h1>
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
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm/6 text-gray-400">
          You don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
