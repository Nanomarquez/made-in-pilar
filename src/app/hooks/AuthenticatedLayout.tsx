"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { setUserData } from "@/redux/auth/authSlice";
export function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuth } = useAppSelector((state) => state.global);
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (pathname !== "/login" && pathname !== "/register") {
      if (!isAuth) {
        router.push("/login");
      }
    }
  }, [isAuth, router, pathname]);

  // Obtener datos del usuario desde Firestore y actualizarlos en Redux
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Referencia al documento del usuario en Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().onboardingCompleted) {
          dispatch(setUserData(userDocSnap.data()));
        } else {
          console.log("No se encontraron datos del usuario en Firestore.");
        }
      }
    };

    // Llamar a la función que obtiene los datos del usuario
    fetchUserData();
  }, [user, dispatch]); // Se ejecuta cada vez que el usuario cambie

  return <>{children}</>;
}
