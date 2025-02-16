"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { setUserCredentials, setUserData } from "@/redux/auth/authSlice";
import { setIsAuth } from "@/redux/global/globalSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signOut } from "firebase/auth";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Image1,
  Image2,
  Image3,
  Image4,
  Image5,
  Image6,
  Image7,
} from "../assets";
import VerticalInfiniteCarousel from "@/components/ui/infinite-carousel";
import {
  handleLogin,
  handleRegister,
  handleResetPassword,
} from "@/services/fetch";

function LoginPage() {
  const dispatch = useAppDispatch();
  const { deviceType } = useAppSelector((state) => state.global);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [seePassword, setSeePassword] = useState(false);
  const [seePasswordRepeat, setSeePasswordRepeat] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    signOut(auth);
    dispatch(setIsAuth(false));
    dispatch(setUserData(undefined));
    dispatch(setUserCredentials(null));
  }, [dispatch]);

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div
        className={`w-full flex gap-5 px-5 overflow-hidden ${
          deviceType !== "desktop" ? "absolute opacity-20" : ""
        }`}
      >
        <VerticalInfiniteCarousel images={[Image1, Image2]} speed={4000} />
        <VerticalInfiniteCarousel
          images={[Image3, Image4, Image5]}
          speed={4500}
        />
        <VerticalInfiniteCarousel images={[Image6, Image7]} speed={3500} />
      </div>
      {resetPassword ? (
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
            handleResetPassword({
              e,
              dispatch,
              setError,
              email,
              setResetPassword,
            })
          }
          className="flex flex-col justify-between gap-5 w-3/4 p-12 m-12 glass"
        >
          <p className="text-center text-2xl md:text-3xl font-bold pb-3 md:pb-6">
            Recupera tu contraseña
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <Label htmlFor="email">Ingresa tu email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Madeinpilar@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="bg-[#DCDCDC] w-full text-[#333333] p-2 rounded-lg font-medium text-xl"
            disabled={!email}
          >
            Enviar correo
          </Button>
          <p className="text-center flex gap-1 mx-auto">
            Volver
            <span
              onClick={() => {
                setError(null);
                setResetPassword(false);
              }}
              className="text-[#4335c5] cursor-pointer font-bold"
            >
              Iniciar sesión
            </span>
          </p>
        </form>
      ) : (
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            if (isRegister) {
              handleRegister({
                e,
                dispatch,
                setError,
                username,
                email,
                password,
                setIsRegister,
                router,
              });
            } else {
              handleLogin({
                e,
                dispatch,
                setError,
                username,
                password,
                router,
              });
            }
          }}
          className="flex flex-col justify-between gap-5 w-3/4 p-12 m-12 glass"
        >
          <p className="text-center text-2xl md:text-3xl font-bold pb-3 md:pb-6">
            {isRegister ? "Registro" : "Iniciar sesión"}
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {isRegister && (
            <div>
              <Label htmlFor="email">Ingresa tu email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Madeinpilar@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Ingresa tu usuario</Label>
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
                  className="w-5 h-5 absolute right-2 top-3 z-50 cursor-pointer"
                  onClick={() => setSeePassword(!seePassword)}
                />
              ) : (
                <EyeClosed
                  className="w-5 h-5 absolute right-2 top-3 z-50 cursor-pointer"
                  onClick={() => setSeePassword(!seePassword)}
                />
              )}
            </div>
          </div>
          {isRegister && (
            <div>
              <Label htmlFor="password">Repetí tu Contraseña</Label>
              <div className="relative flex w-full items-center">
                <Input
                  id="passwordRepeat"
                  type={seePasswordRepeat ? "text" : "password"}
                  placeholder="●●●●●●●●"
                  required
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                />
                {seePasswordRepeat ? (
                  <Eye
                    className="w-5 h-5 absolute right-2 top-3 z-50 cursor-pointer"
                    onClick={() => setSeePasswordRepeat(!seePasswordRepeat)}
                  />
                ) : (
                  <EyeClosed
                    className="w-5 h-5 absolute right-2 top-3 z-50 cursor-pointer"
                    onClick={() => setSeePasswordRepeat(!seePasswordRepeat)}
                  />
                )}
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="bg-[#DCDCDC] w-full text-[#333333] p-2 rounded-lg font-medium text-xl"
            disabled={isRegister ? password !== passwordRepeat : false}
          >
            {isRegister ? "Registrarse" : "Iniciar sesión"}
          </Button>
          <div className="flex gap-2 mx-auto flex-col sm:flex-row">
            <p className="text-center text-lg sm:text-xl">
              {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsRegister(!isRegister);
              }}
              className="text-[#4335c5] text-lg sm:text-xl font-bold cursor-pointer"
            >
              {isRegister ? "Iniciar sesión" : "Registrarse"}
            </button>
          </div>
          <p className="text-center">
            Olvidaste tu contraseña?{" "}
            <span
              onClick={() => {
                setError(null);
                setResetPassword(true);
              }}
              className="text-[#4335c5] cursor-pointer font-bold"
            >
              Recuperala
            </span>
          </p>
        </form>
      )}
    </div>
  );
}

export default LoginPage;
