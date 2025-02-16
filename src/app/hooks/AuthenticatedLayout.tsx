"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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
    if (pathname !== "/login") {
      if (!isAuth) {
        router.push("/login");
      }
    }
  }, [isAuth, router, pathname]);

  // Obtener datos del usuario desde Firestore y actualizarlos en Redux
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);
        if (snapshot.size > 0) {
          const userData = snapshot.docs[0].data();
          dispatch(setUserData(userData));
        } else {
          console.log("No se encontraron datos del usuario en Firestore.");
        }
      }
    };
    fetchUserData();
  }, [user, dispatch]); // Se ejecuta cada vez que el usuario cambie

  return <>{children}</>;
}
