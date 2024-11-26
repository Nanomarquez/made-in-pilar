"use client";

import React, { useCallback, useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { setLoading } from "@/redux/global/globalSlice";
import { Reservation } from "@/lib/types";
import { useAppSelector } from "@/redux/hooks";

export const BookingCalendar = ({
  onDateSelect,
  selectedDate,
  isAdmin = false,
  disablePast = false,
}: {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  isAdmin?: boolean;
  disablePast?: boolean;
}) => {
  const { userCredentials } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const fetchMonthlyReservations = useCallback(
    async (month: string) => {
      if (!month) return; // El formato debe ser "YYYY-MM"

      dispatch(setLoading(true));

      const url = isAdmin
        ? `/api/reservations-monthly?date=${month}`
        : `/api/reservations-monthly?date=${month}&id=${userCredentials?.uid}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          console.error("Error fetching reservations:", data.error);
          return;
        }

        setReservations(data);
      } catch (err) {
        console.error("Error fetching reservations:", err);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, isAdmin, userCredentials?.uid]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchMonthlyReservations(dayjs(selectedDate).format("YYYY-MM"));
    } else {
      fetchMonthlyReservations(dayjs(new Date()).format("YYYY-MM"));
    }
  }, [fetchMonthlyReservations, selectedDate]);

  const handleDateChange = (newDate: Date) => {
    onDateSelect(newDate);
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Asegúrate de comparar solo las fechas, sin considerar horas
    return date < today; // Deshabilita solo los días estrictamente anteriores a hoy
  };

  const tileAdming = ({ date }: { date: Date }) => {
    if (
      reservations.find((res) => res.date === dayjs(date).format("YYYY-MM-DD"))
    ) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <div>
      <Calendar
        className={"!bg-black/50 !border-none !rounded-lg !text-white md:!w-full"}
        tileDisabled={disablePast ? tileDisabled : tileAdming}
        onChange={(e) => handleDateChange(e as Date)}
        value={selectedDate}
      />
    </div>
  );
};
