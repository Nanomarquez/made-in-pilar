"use client";
import { setLoading } from "@/redux/global/globalSlice";
import { useAppDispatch } from "@/redux/hooks";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface UserFormProps {
  fetchUsers: () => Promise<void>;
}

function UserForm({ fetchUsers }: Readonly<UserFormProps>) {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  async function registerUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(setLoading(true));
    setError(null);
    try {
      const response = await fetch("https://made-in-pilar-swfo.vercel.app/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "12345678" }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      fetchUsers();
      setUsername("");
    } catch (error) {
      console.log({ error });
      setError(
        `Error al crear usuario. Por favor, verifica los datos ingresados. ${error}`
      );
      console.error("Error al crear usuario:", error);
      return { success: false, error: error };
    } finally {
      dispatch(setLoading(false));
    }
  }
  return (
    <form onSubmit={registerUser} className="flex flex-col gap-5">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <Label htmlFor="email">{}Ingresa el usuario</Label>
        <Input
          id="username"
          type="text"
          placeholder="Madeinpilar"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="bg-[#DCDCDC] w-full text-[#333333] p-2 rounded-lg font-medium text-lg"
      >
        Crear
      </Button>
    </form>
  );
}

export default UserForm;
