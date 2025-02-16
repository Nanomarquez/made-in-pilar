import { Reservations, User } from "@/interfaces";
import { auth, db } from "@/lib/firebase";
import { setUserCredentials, setUserData } from "@/redux/auth/authSlice";
import { setIsAuth, setLoading } from "@/redux/global/globalSlice";
import { UnknownAction, Dispatch } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const fetchAvailableSlots = async ({
  selectedReservDate,
  dispatch,
  setAvailableSlots,
}: {
  selectedReservDate: Date | null;
  dispatch: Dispatch<UnknownAction>;
  setAvailableSlots: React.Dispatch<React.SetStateAction<never[]>>;
}) => {
  if (!selectedReservDate) return;
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `/api/availability?date=${selectedReservDate.toISOString().split("T")[0]}`
    );
    const data = await response.json();
    dispatch(setLoading(false));
    setAvailableSlots(data);
  } catch (err) {
    console.error("Error fetching available slots:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchReservationsPending = async ({
  dispatch,
  setSize,
  isAdmin = false,
  username,
}: {
  dispatch: Dispatch<UnknownAction>;
  setSize: React.Dispatch<React.SetStateAction<number>>;
  isAdmin: boolean;
  username: string;
}) => {
  try {
    dispatch(setLoading(true));
    const url = isAdmin
      ? `/api/reservations-pending`
      : `/api/reservations-pending?username=${username}`;
    const response = await fetch(url);
    const data = await response.json();
    dispatch(setLoading(false));
    setSize(data);
  } catch (err) {
    console.error("Error fetching reservations pending:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchReservations = async ({
  date,
  dispatch,
  setReservations
}: {
  date: Date;
  dispatch: Dispatch<UnknownAction>;
  setReservations: React.Dispatch<React.SetStateAction<Reservations[]>>;
  isAdmin: boolean;
  username: string;
}) => {
  if (!date) return;
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `/api/reservations?date=${date.toISOString()}`
    );
    const data = await response.json();
    dispatch(setLoading(false));
    setReservations(data);
  } catch (err) {
    console.error("Error fetching reservations:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchUsers = async ({
  dispatch,
  setUsers,
}: {
  dispatch: Dispatch<UnknownAction>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) => {
  dispatch(setLoading(true));

  try {
    const response = await fetch(`/api/get-users`);
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching users:", data.error);
      return;
    }

    setUsers(data);
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

export const handleLogin = async ({
  e,
  dispatch,
  setError,
  username,
  password,
  router,
}: {
  e: React.FormEvent<HTMLFormElement>;
  dispatch: Dispatch<UnknownAction>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  username: string;
  password: string;
  router: AppRouterInstance;
}) => {
  e.preventDefault();
  dispatch(setLoading(true));
  setError(null);
  try {
    // Llama a la API para obtener el token personalizado
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      throw new Error("Error al iniciar sesión");
    }

    const { email } = await response.json();

    const result = await signInWithEmailAndPassword(auth, email, password);
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
};

export const handleRegister = async ({
  e,
  dispatch,
  setError,
  username,
  email,
  password,
  setIsRegister,
  router,
}: {
  e: React.FormEvent<HTMLFormElement>;
  dispatch: Dispatch<UnknownAction>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  username: string;
  email: string;
  password: string;
  setIsRegister: React.Dispatch<React.SetStateAction<boolean>>;
  router: AppRouterInstance;
}) => {
  e.preventDefault();
  dispatch(setLoading(true));
  setError(null);
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);

    dispatch(setIsAuth(true));
    dispatch(setUserCredentials(result.user));

    await setDoc(doc(db, "users", username), {
      username,
      email: email,
      createdAt: new Date().toISOString(),
    });
    const userDoc = await getDoc(doc(db, "users", username));
    dispatch(setUserData(userDoc.data()));
    setIsRegister(false);
    router.push("/");
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const firebaseError = error as { code: string }; // Refinar el tipo del error
      if (firebaseError.code === "auth/email-already-in-use") {
        setError(`El correo ya está registrado.`);
        throw new Error("El correo ya está registrado.");
      }
    } else {
      setError(
        `Error de registro. Por favor, verifica tus credenciales. ${error}`
      );
    }
    console.error("Error al registrar usuario:", error);
    dispatch(setIsAuth(false));
    dispatch(setUserData(undefined));
    dispatch(setUserCredentials(null));
    return { success: false, error: error };
  } finally {
    dispatch(setLoading(false));
  }
};

export const handleResetPassword = async ({
  e,
  dispatch,
  setError,
  email,
  setResetPassword,
}: {
  e: React.FormEvent<HTMLFormElement>;
  dispatch: Dispatch<UnknownAction>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  email: string;
  setResetPassword: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  e.preventDefault();
  dispatch(setLoading(true));
  setError(null);
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Correo de recuperación enviado");
    setResetPassword(false);
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code === "auth/user-not-found") {
        setError("No existe un usuario con ese correo.");
        throw new Error("No existe un usuario con ese correo.");
      }
    } else {
      throw error;
    }
  } finally {
    dispatch(setLoading(false));
  }
};

// const fetchMonthlyReservations = useCallback(
//   async (month: string) => {
//     if (!month) return; // El formato debe ser "YYYY-MM"

//     dispatch(setLoading(true));

//     const url = isAdmin
//       ? `/api/reservations-monthly?date=${month}`
//       : `/api/reservations-monthly?date=${month}&id=${userCredentials?.uid}`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();

//       if (!response.ok) {
//         console.error("Error fetching reservations:", data.error);
//         return;
//       }

//       setReservations(data);
//     } catch (err) {
//       console.error("Error fetching reservations:", err);
//     } finally {
//       dispatch(setLoading(false));
//     }
//   },
//   [dispatch, isAdmin, userCredentials?.uid]
// );
