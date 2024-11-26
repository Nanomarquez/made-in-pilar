"use client";

import { setLoading } from "@/redux/global/globalSlice";
import { useAppSelector } from "@/redux/hooks";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
type User = {
  id: string;
};
function parseTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
export const BookingForm = ({
  date,
  availableSlots,
  onReservationComplete,
  isAdmin = false,
}: {
  date: string;
  availableSlots: { from: string; to: string }[];
  onReservationComplete: () => void;
  isAdmin?: boolean;
}) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const { userCredentials } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const handleSubmit = async () => {
    if (!from || !to) {
      setError("Por favor selecciona un rango de horarios.");
      return;
    }
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          from,
          to,
          userId: selectedUser || userCredentials?.uid,
          status: userCredentials?.uid === "Admin" ? "confirmed" : "pending",
        }),
      });

      if (response.ok) {
        onReservationComplete();
      } else {
        const data = await response.json();
        setError(data.error || "Error al realizar la reserva.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión.");
    }
  };

  const fetchUsers = useCallback(async () => {
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
      console.error("Error fetching reservations:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [fetchUsers, isAdmin]);

  return (
    <div className="flex flex-col gap-5">
      {isAdmin && (
        <div>
          <label htmlFor="user" className="block text-white">
            Para
          </label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
            }}
            className="border rounded p-2"
          >
            <option value="">Seleccionar</option>
            {users.map((user) => {
              return (
                <option key={user.id} value={user.id}>
                  {user.id}
                </option>
              );
            })}
          </select>
        </div>
      )}
      {availableSlots.length > 0 ? (
        <>
          <div className="flex gap-5">
            <div>
              <label htmlFor="from" className="block text-white">
                Desde
              </label>
              <select
                id="from"
                value={from}
                onChange={(e) => {
                  setTo("");
                  setFrom(e.target.value);
                }}
                className="border rounded p-2"
              >
                <option value="">Seleccionar</option>
                {availableSlots
                  .filter((slot) => slot.from !== "")
                  .map((slot) => {
                    let value = slot.from;
                    if (slot.from === "24:00") {
                      value = "00:00";
                    }
                    return (
                      <option key={slot.from} value={slot.from}>
                        {value}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div>
              <label htmlFor="to" className="block text-white">
                Hasta
              </label>
              <select
                id="to"
                disabled={!from}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border rounded p-2"
              >
                <option value="">Seleccionar</option>
                {availableSlots
                  .filter((slot) => {
                    if (slot.from === "") return true;
                    return slot.from >= from;
                  })
                  .map((slot) => {
                    let value = slot.to;
                    if (slot.to === "24:00") {
                      value = "00:00";
                    }
                    if (slot.to === "25:00") {
                      value = "01:00";
                    }
                    if (slot.to === "26:00") {
                      value = "02:00";
                    }
                    const desde = parseTime(from);
                    const hasta = parseTime(slot.to);
                    let flag = false;
                    if (hasta - desde > 120) {
                      flag = true;
                    }
                    return (
                      <option
                        className="disabled:bg-slate-300/40 disabled:text-white"
                        disabled={flag}
                        key={slot.to}
                        value={slot.to}
                      >
                        {value}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Reservar
          </button>
        </>
      ) : (
        <p>No hay horarios disponibles para esta fecha.</p>
      )}
    </div>
  );
};
