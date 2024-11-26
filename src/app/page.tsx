"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { useAppSelector } from "./redux/hooks";
import { useRouter } from "next/navigation";

export default function Home() {
  const [open, setOpen] = useState(true);
  const { userData, userCredentials } = useAppSelector((state) => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (!open) {
      if (userCredentials?.uid === "Admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router, userCredentials?.uid, open]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bienvenido {userData?.username}</AlertDialogTitle>
          <AlertDialogDescription>
            Cualquier duda o consulta pueden comunicarse con nosotros a través
            de nuestro de nuestro{" "}
            <a
              rel="stylesheet"
              target="_BLANK"
              href="https://api.whatsapp.com/send/?phone=542304367408&text=Tengo+una+duda+desde+la+pagina+web&type=phone_number&app_absent=0"
              className="text-green-600 font-bold"
            >
              WhatsApp
            </a>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
