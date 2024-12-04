"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { setUserCredentials, setUserData } from "@/redux/auth/authSlice";
import { setIsAuth, setLoading } from "@/redux/global/globalSlice";
import { useAppDispatch } from "@/redux/hooks";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function LoginPage() {
  const dispatch = useAppDispatch();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [seePassword, setSeePassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    signOut(auth);
    dispatch(setIsAuth(false));
    dispatch(setUserData(undefined));
    dispatch(setUserCredentials(null));
  }, [dispatch]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(setLoading(true));
    setError(null);
    try {
      // Llama a la API para obtener el token personalizado
      const response = await fetch(
        "https://made-in-pilar-swfo.vercel.app/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al iniciar sesión");
      }

      const { token } = await response.json();

      const result = await signInWithCustomToken(auth, token);
      dispatch(setIsAuth(true));
      dispatch(setUserCredentials(result.user));
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      dispatch(setUserData(userDoc.data()));
      router.push("/");
    } catch (error) {
      setError("Error de autenticación. Por favor, verifica tus credenciales.");
      dispatch(setIsAuth(false));
      dispatch(setUserData(undefined));
      dispatch(setUserCredentials(null));
      console.error("Error al iniciar sesión:", error);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function registerUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(setLoading(true));
    setError(null);
    try {
      const response = await fetch(
        "https://made-in-pilar-swfo.vercel.app/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      setIsRegister(false);

      const { token } = await response.json();

      const result = await signInWithCustomToken(auth, token);

      dispatch(setIsAuth(true));
      dispatch(setUserCredentials(result.user));

      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      dispatch(setUserData(userDoc.data()));
      router.push("/");
    } catch (error) {
      console.log({ error });
      setError(
        `Error de registro. Por favor, verifica tus credenciales. ${error}`
      );
      console.error("Error al registrar usuario:", error);
      dispatch(setIsAuth(false));
      dispatch(setUserData(undefined));
      dispatch(setUserCredentials(null));
      return { success: false, error: error };
    } finally {
      dispatch(setLoading(false));
    }
  }

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <form
        onSubmit={isRegister ? registerUser : handleSubmit}
        className="flex flex-col justify-between gap-5 w-3/4 p-12 m-12 glass"
      >
        <p className="text-center text-white text-2xl md:text-3xl font-normal pb-3 md:pb-6">
          {isRegister ? "Registro" : "Iniciar sesión"}
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <Label htmlFor="email">{}Ingresa tu usuario</Label>
          <Input
            id="username"
            type="text"
            placeholder="Madeinpilar"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Ingresa tu Contraseña</Label>
          <div className="relative flex w-full items-center">
            <Input
              id="password"
              type={seePassword ? "text" : "password"}
              placeholder="●●●●●●●●"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {seePassword ? (
              <Eye
                className="w-6 h-6 absolute text-white right-2 z-50 cursor-pointer"
                onClick={() => setSeePassword(!seePassword)}
              />
            ) : (
              <EyeClosed
                className="w-6 h-6 absolute text-white right-2 z-50 cursor-pointer"
                onClick={() => setSeePassword(!seePassword)}
              />
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="bg-[#DCDCDC] w-full text-[#333333] p-2 rounded-lg font-medium text-xl"
        >
          {isRegister ? "Registrarse" : "Iniciar sesión"}
        </Button>
        <p className="text-white text-center text-xl">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsRegister(!isRegister);
          }}
          className="text-[#4335c5] text-xl cursor-pointer"
        >
          {isRegister ? "Iniciar sesión" : "Registrarse"}
        </button>{" "}
      </form>
    </div>
  );
}

export default LoginPage;
