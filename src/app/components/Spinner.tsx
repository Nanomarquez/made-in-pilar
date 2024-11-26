"use client";
import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setLoading } from "@/redux/global/globalSlice";
import { SpinnerImage } from "@/assets";
import Image from "next/image";
function Spinner() {
  const { loading } = useAppSelector((state) => state.global);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (loading) {
      // Configura un temporizador para desactivar el loading después de 30 segundos
      timeout = setTimeout(() => {
        dispatch(setLoading(false)); // Cambia el estado de loading a false
      }, 30000); // 30 segundos
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout); // Limpia el temporizador si se desmonta el componente o cambia el loading
      }
    };
  }, [loading, dispatch]);

  if (loading)
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-black/90 absolute top-0 left-0 z-[101] cursor-progress flex-col">
        <Image
          src={SpinnerImage}
          alt="Spinner"
          width="300"
          height="300"
          className="animate-spin brightness-75 drop-shadow-xl"
        />
      </div>
    );

  return null; // No mostrar nada si loading es false
}

export default Spinner;
