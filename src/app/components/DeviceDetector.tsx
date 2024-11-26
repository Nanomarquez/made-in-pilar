"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { DeviceType, setDeviceType } from "@/redux/global/globalSlice";

const DeviceDetector = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        dispatch(setDeviceType(DeviceType.MOBILE));
      } else if (width >= 768 && width < 1024) {
        dispatch(setDeviceType(DeviceType.TABLET));
      } else {
        dispatch(setDeviceType(DeviceType.DESKTOP));
      }
    };

    // Llama a la función al cargar la página
    updateDeviceType();

    // Escucha cambios de tamaño en la ventana
    window.addEventListener("resize", updateDeviceType);

    // Limpia el evento al desmontar el componente
    return () => {
      window.removeEventListener("resize", updateDeviceType);
    };
  }, [dispatch]);

  return null; // Este componente no necesita renderizar nada
};

export default DeviceDetector;
