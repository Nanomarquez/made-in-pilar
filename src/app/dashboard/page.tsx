"use client";
import { BookingForm } from "@/components/BookingForm";
import { BookingCalendar } from "@/components/Calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reservation } from "@/lib/types";
import { setLoading } from "@/redux/global/globalSlice";
import { useAppSelector } from "@/redux/hooks";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const statusMap: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  rejected: "Rechazado",
};
function DashboardPage() {
  const { userCredentials } = useAppSelector((state) => state.auth);
  const [size, setSize] = useState(0);
  const dispatch = useDispatch();
  const [selectedPendingDate, setSelectedPendingDate] = useState<Date | null>(
    null
  );
  const [selectedReservDate, setSelectedReservDate] = useState<Date | null>(
    null
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservationsPending = useCallback(async () => {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://made-in-pilar-swfo.vercel.app/api/reservations-pending?id=${userCredentials?.uid}`
    );
    const data = await response.json();
    dispatch(setLoading(false));
    setSize(data);
  }, [dispatch, userCredentials?.uid]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedReservDate) return;
    dispatch(setLoading(true));
    const response = await fetch(
      `https://made-in-pilar-swfo.vercel.app/api/availability?date=${selectedReservDate.toISOString().split("T")[0]}`
    );
    const data = await response.json();
    dispatch(setLoading(false));
    setAvailableSlots(data);
  }, [dispatch, selectedReservDate]);

  const fetchReservations = useCallback(async () => {
    console.log("fetch reservations");
    if (!selectedPendingDate) return;
    dispatch(setLoading(true));
    const response = await fetch(
      `https://made-in-pilar-swfo.vercel.app/api/reservations?date=${
        selectedPendingDate.toISOString().split("T")[0]
      }`
    );
    console.log({ response });
    const data = await response.json();
    dispatch(setLoading(false));
    setReservations(data);
  }, [dispatch, selectedPendingDate]);

  useEffect(() => {
    fetchReservationsPending();
    fetchAvailableSlots();
    fetchReservations();
  }, [fetchReservationsPending, fetchAvailableSlots, fetchReservations]);
  const handleChangeStatus = async (id: string, status: string) => {
    dispatch(setLoading(true));
    const response = await fetch(`https://made-in-pilar-swfo.vercel.app/api/reservations?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      fetchReservations();
      fetchAvailableSlots();
    }

    dispatch(setLoading(false));
  };

  console.log({ reservations });
  return (
    <div className="p-2 md:p-5 h-screen flex gap-2 md:gap-5 flex-col lg:flex-row">
      <div className="flex flex-col gap-5">
        <div className="w-full bg-[#1b1b1b]/50 backdrop-blur-lg rounded-md shadow-lg p-5 px-10 flex flex-col gap-5">
          <h1 className="text-2xl text-white drop-shadow-md font-black">
            Dashboard
          </h1>
          <div className="flex gap-10">
            <div>
              <p className="text-gray-600">Reservaciones pendientes</p>
              <p className="text-white text-3xl font-bold">{size}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1b1b1b]/50 backdrop-blur-lg rounded-md shadow-lg p-3 md:p-5 md:px-10 flex flex-col gap-5 overflow-scroll">
          <Tabs
            defaultValue="pending"
            className="w-[600px]"
            onValueChange={() => {
              setSelectedReservDate(null);
              setSelectedPendingDate(null);
            }}
          >
            <TabsList>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="reserv">Reservar</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <BookingCalendar
                onDateSelect={(date) => setSelectedPendingDate(date)}
                selectedDate={selectedPendingDate}
              />
            </TabsContent>
            <TabsContent value="reserv">
              {" "}
              <BookingCalendar
                disablePast
                onDateSelect={(date) => setSelectedReservDate(date)}
                selectedDate={selectedReservDate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {selectedPendingDate && (
        <div className="bg-[#1b1b1b]/50 backdrop-blur-lg rounded-md shadow-lg p-2 md:p-5 md:px-10 flex flex-col gap-5">
          <p className="text-lg md:text-2xl text-white drop-shadow-md font-black">
            Fecha: {dayjs(selectedPendingDate).format("DD/MM/YYYY")}
          </p>
          <div className="overflow-y-scroll flex flex-col gap-5 pr-2">
            {reservations.length === 0 ? (
              <p className="text-white">No hay reservas para esta fecha.</p>
            ) : (
              reservations.map((res) => (
                <div
                  key={res.id || `${res.from}-${res.to}`}
                  className="flex gap-5 items-center bg-black/50 backdrop-blur-lg rounded-md shadow-lg p-2 w-full md:p-5 md:px-10 justify-between overflow-x-scroll"
                >
                  <p className="text-white font-bold">{res.userId}</p>
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-white text-nowrap">
                      {res.from} - {res.to}
                    </p>
                    <p className="text-white">({statusMap[res.status]})</p>
                  </div>
                  {res.status !== "rejected" && (
                    <button
                      className="bg-red-500 text-white py-2 px-4 rounded"
                      onClick={() => handleChangeStatus(res.id, "rejected")}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {selectedReservDate && (
        <div className="w-full bg-[#1b1b1b]/50 backdrop-blur-lg rounded-md shadow-lg p-5 px-10 h-min flex flex-col gap-5">
          <p className="text-lg md:text-2xl text-white drop-shadow-md font-black">
            Fecha: {dayjs(selectedReservDate).format("DD/MM/YYYY")}
          </p>
          <BookingForm
            date={selectedReservDate.toISOString().split("T")[0]}
            availableSlots={availableSlots}
            onReservationComplete={() => setSelectedReservDate(null)}
          />
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
