"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isDoctor, setIsDoctor] = useState(true);

  const router = useRouter();

  const handleAuth = async () => {
    if (isLogin) {
      try {
        console.log("Attempting login for:", email);

        // Check if the user is a doctor based on the email
        const { data: doctorData, error: doctorError } = await supabase
          .from("doctors")
          .select("uid")
          .eq("email", email);

        if (doctorError) {
          console.error("Error checking doctor:", doctorError);
        }

        // Check if the user is a patient based on the email
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("uid")
          .eq("email", email);

        if (patientError) {
          console.error("Error checking patient:", patientError);
        }

        if (
          (doctorData && doctorData.length > 0) ||
          (patientData && patientData.length > 0)
        ) {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            console.error("Error signing in:", signInError);
          } else {
            console.log("Successfully signed in:", signInData);
            if (doctorData && doctorData.length > 0) {
              console.log("Redirecting to doctor dashboard");
              router.push("/doctor/dashboard");
            } else {
              console.log("Redirecting to patient dashboard");
              router.push("/patient/dashboard");
            }
          }
        } else {
          console.error("User not found in either doctor or patient tables.");
        }
      } catch (error) {
        console.error("Unexpected error during login:", error);
      }
    } else {
      try {
        console.log("Attempting sign-up for:", email);

        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({ email, password });
        if (signUpError) {
          console.error("Error signing up:", signUpError);
        } else {
          const user = signUpData.user;
          if (user) {
            const passwordHash = await bcrypt.hash(password, 10);

            if (isDoctor) {
              const { error: dbError } = await supabase.from("doctors").insert({
                uid: user.id,
                name,
                email,
                passwordhash: passwordHash,
                specialty,
              });

              if (dbError) {
                console.error("Database insert error:", dbError);
              } else {
                console.log("Doctor details inserted into database");
                console.log("Redirecting to doctor dashboard");
                router.push("/doctor/dashboard");
              }
            } else {
              const { error: dbError } = await supabase.from("patients").insert({
                uid: user.id,
                name,
                email,
                passwordhash: passwordHash,
              });

              if (dbError) {
                console.error("Database insert error:", dbError);
              } else {
                console.log("Patient details inserted into database");
                console.log("Redirecting to patient dashboard");
                router.push("/patient/dashboard");
              }
            }
          }
        }
      } catch (error) {
        console.error("Unexpected error during sign-up:", error);
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {isLogin ? "Sign in to your account" : "Create an account"}
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          {isLogin ? "Login to your account" : "Sign up to create a new account"}
        </p>

        <form
          className="my-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleAuth();
          }}
        >
          {!isLogin && (
            <>
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setIsDoctor(true)}
                  type="button"
                  className={`px-4 py-2 border ${
                    isDoctor
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-indigo-600"
                  }`}
                >
                  Doctor
                </button>
                <button
                  onClick={() => setIsDoctor(false)}
                  type="button"
                  className={`px-4 py-2 border ${
                    !isDoctor
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-indigo-600"
                  }`}
                >
                  Patient
                </button>
              </div>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </LabelInputContainer>
              {isDoctor && (
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    placeholder="Specialty"
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                </LabelInputContainer>
              )}
            </>
          )}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            {isLogin ? "Sign In" : "Sign Up"}
            <BottomGradient />
          </button>

          <div className="text-center mt-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              type="button"
              className="text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Create an account" : "Sign in to your account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default Auth;
