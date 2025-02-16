"use client";
import { Reservations } from "@/interfaces";
import { setLoading } from "@/redux/global/globalSlice";
import { useAppSelector } from "@/redux/hooks";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type User = {
  id: string;
};

// Define el tipo para las opciones de tiempo
type TimeOption = {
  label: string;
  value: Date;
  adjustedValue?: Date;
  isDisabled?: boolean;
  isReserved?: boolean;
};

interface TimeRangeSelectorProps {
  isAdmin?: boolean;
  reservations: Reservations[];
  fetchReservations: () => Promise<void>;
  fetchReservationsPending: () => Promise<void>;
  actualDate: Date;
  fromTime: Date | null;
  toTime: Date | null;
  setFromTime: React.Dispatch<React.SetStateAction<Date | null>>;
  setToTime: React.Dispatch<React.SetStateAction<Date | null>>;
}

const TimeRangeSelector = ({
  isAdmin = false,
  reservations,
  fetchReservations,
  fetchReservationsPending,
  actualDate,
  fromTime,
  toTime,
  setFromTime,
  setToTime,
}: TimeRangeSelectorProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const generateTimeOptions = (): TimeOption[] => {
    const options: TimeOption[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const formattedHour = String(hour).padStart(2, "0");

      const date = new Date(actualDate);
      date.setHours(hour, 0, 0, 0); // Establecer la hora, pero manteniendo el mismo día de actualDate
      const isReserved = reservations.some((reservation) => {
        const reservationStart = new Date(reservation.from.seconds * 1000);
        const reservationEnd = new Date(reservation.to.seconds * 1000);

        return (
          (date >= reservationStart && date < reservationEnd) || // Empieza dentro del rango existente
          (date < reservationEnd && date >= reservationStart) // Termina dentro del rango existente
        );
      });

      options.push({ label: `${formattedHour}:00`, value: date, isReserved });
    }
    return options;
  };
  const timeOptions = generateTimeOptions();
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const { userData } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const handleFromChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToTime(null);
    const selectedTime = new Date(e.target.value);
    setFromTime(selectedTime);

    // Ajustar 'Hasta' si queda fuera del rango
    if (toTime && selectedTime >= toTime) {
      setToTime(null);
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTime = new Date(e.target.value);
    setToTime(selectedTime);
  };

  const getFilteredToOptions = (): TimeOption[] => {
    if (!fromTime) return timeOptions;

    const maxToTime = new Date(fromTime);
    maxToTime.setHours(maxToTime.getHours() + 4); // Limitar a 4 horas

    return timeOptions.map((option) => {
      const isNextDay = option.value.getHours() <= fromTime.getHours();
      const adjustedDate = new Date(option.value);
      if (isNextDay) {
        adjustedDate.setDate(fromTime.getDate() + 1); // Pasar al día siguiente
      }
      const isReserved = reservations.some((reservation) => {
        const reservationStart = new Date(reservation.from.seconds * 1000);
        reservationStart.setHours(reservationStart.getHours() + 1);
        const reservationEnd = new Date(reservation.to.seconds * 1000);
        return (
          (adjustedDate >= reservationStart && adjustedDate < reservationEnd) || // Empieza dentro del rango existente
          (adjustedDate < reservationEnd && adjustedDate >= reservationStart) // Termina dentro del rango existente
        );
      });

      return {
        ...option,
        adjustedValue: adjustedDate,
        isDisabled: adjustedDate > maxToTime || isReserved,
      };
    });
  };

  const handleSubmit = async () => {
    if (!fromTime || !toTime) {
      setError("Por favor selecciona un rango de horarios.");
      return;
    }
    if (isAdmin && !selectedUser) {
      setError("Por favor selecciona un usuario.");
      return;
    }
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromTime,
          to: toTime,
          userId: selectedUser || userData?.username,
          status: isAdmin ? "confirmed" : "pending",
        }),
      });

      if (response.ok) {
        // onReservationComplete();
        console.log("OK");
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || "Error al realizar la reserva.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión.");
    } finally {
      fetchReservations();
      fetchReservationsPending();
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
    <div className="glass p-5 flex flex-col gap-2">
      {isAdmin && (
        <div className="flex flex-col gap-2">
          <label htmlFor="user" className="block font-bold">
            Para
          </label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
            }}
            className="border rounded p-2 outline-2 outline-blue-500"
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
      <div className="flex flex-col gap-2">
        <label className="block font-bold">Desde:</label>
        <select
          value={fromTime ? fromTime.toISOString() : ""}
          onChange={handleFromChange}
          className="border rounded p-2 outline-2 outline-blue-500"
        >
          <option value="" disabled>
            Selecciona hora
          </option>
          {timeOptions.map((option) => (
            <option
              className="disabled:text-gray-200"
              disabled={option.isReserved}
              key={option.value.toISOString()}
              value={option.value.toISOString()}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="block font-bold">Hasta:</label>
        <select
          value={toTime ? toTime.toISOString() : ""}
          onChange={handleToChange}
          className="border rounded p-2 outline-2 outline-blue-500"
        >
          <option value="" disabled>
            Selecciona hora
          </option>
          {getFilteredToOptions()
            .filter((option) => !option.isDisabled)
            .map(
              (option) =>
                option.adjustedValue && (
                  <option
                    className="disabled:text-gray-200"
                    key={option.adjustedValue.toISOString()}
                    value={option.adjustedValue.toISOString()}
                    disabled={option.isDisabled}
                  >
                    {option.label}{" "}
                    {option.adjustedValue.getDate() !== fromTime?.getDate()
                      ? "(Día siguiente)"
                      : ""}
                  </option>
                )
            )}
        </select>
      </div>
      <div className="flex flex-col gap-2 font-bold">
        <p className="text-sm">Día: {dayjs(actualDate).format("DD/MM/YYYY")}</p>
        <div className="flex gap-2 text-sm">
          {fromTime && (
            <p>
              Desde:{" "}
              {fromTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          {toTime && (
            <p>
              Hasta:{" "}
              {toTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              (
              {toTime.getDate() !== fromTime?.getDate()
                ? "Día siguiente"
                : "Mismo día"}
              )
            </p>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button
        onClick={handleSubmit}
        className="bg-violet-500 text-white py-2 px-4 rounded-md hover:bg-violet-600 duration-300"
      >
        Reservar
      </button>
    </div>
  );
};

export default TimeRangeSelector;
