"use client";
import React, { useEffect, useState } from "react";
import { Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import "dayjs/locale/es";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "./styles.css";
import { useDispatch } from "react-redux";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import {
  ParsedRservations,
  Reservations,
  Status,
  statusMap,
  User,
} from "@/interfaces";
import {
  fetchReservations,
  fetchReservationsPending,
  fetchUsers,
} from "@/services/fetch";
import { useAppSelector } from "@/redux/hooks";
import CustomCalendar from "@/components/Calendar";
import { setLoading } from "@/redux/global/globalSlice";
dayjs.extend(customParseFormat);
dayjs.locale("es"); // Configura el idioma español

function CalendarPage() {
  const { isAdmin, userData } = useAppSelector((state) => state.auth);
  const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(
    Views.MONTH
  );
  const [date, setDate] = useState<Date>(new Date());
  const [size, setSize] = useState(0);
  const dispatch = useDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<Status | "delete" | undefined>(
    undefined
  );
  const [reservations, setReservations] = useState<Reservations[]>([]);
  const [selectedReservDate, setSelectedReservDate] = useState<Date | null>(
    null
  );
  const [selectEvent, setSelectEvent] = useState<ParsedRservations | null>(
    null
  );
  const [fromTime, setFromTime] = useState<Date | null>(null);
  const [toTime, setToTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchReservations({
      date,
      dispatch,
      setReservations,
      isAdmin,
      username: userData?.username,
    });
    fetchReservationsPending({
      dispatch,
      setSize,
      isAdmin,
      username: userData?.username,
    });
    fetchUsers({ dispatch, setUsers });
  }, [date, dispatch, isAdmin, selectedReservDate, userData?.username]);

  const handleChangeStatus = async (
    id: string,
    status: Status | "delete" | undefined
  ) => {
    dispatch(setLoading(true));
    const response = await fetch(`/api/reservations?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      if (selectEvent) {
        setSelectEvent(
          status === "delete" || status === undefined
            ? null
            : { ...selectEvent, status }
        );
      }
      if (status === "delete") {
        setSelectEvent(null);
      }
      fetchReservations({
        date,
        dispatch,
        setReservations,
        isAdmin,
        username: userData?.username,
      });
    }

    dispatch(setLoading(false));
  };

  console.log({ status });

  const renderBlocks = () => {
    if (view === "day") {
      if (selectedReservDate) {
        return (
          <TimeRangeSelector
            isAdmin={isAdmin}
            reservations={reservations}
            fetchReservations={() =>
              fetchReservations({
                date,
                dispatch,
                setReservations,
                isAdmin,
                username: userData?.username,
              })
            }
            fetchReservationsPending={() =>
              fetchReservationsPending({
                dispatch,
                setSize,
                isAdmin,
                username: userData?.username,
              })
            }
            actualDate={date}
            fromTime={fromTime}
            toTime={toTime}
            setFromTime={setFromTime}
            setToTime={setToTime}
          />
        );
      } else if (selectEvent) {
        return (
          <div className="glass p-5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl">{selectEvent.title}</p>
              <p
                className={`font-bold text-white p-2 rounded-md drop-shadow-md ${
                  selectEvent.status === "pending"
                    ? "bg-orange-400"
                    : selectEvent.status === "confirmed"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {statusMap[selectEvent.status]}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="status">Cambiar de estado</label>
              <select
                name="status"
                id="status"
                defaultValue={selectEvent.status}
                className="border rounded p-2 outline-2 outline-blue-500"
                onChange={(e) => {
                  setStatus(e.target.value as Status | "delete" | undefined);
                }}
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmar</option>
                <option value="rejected">Rechazar</option>
                <option value="delete">Eliminar</option>
              </select>
              <button
                onClick={() => handleChangeStatus(selectEvent.id, status)}
                disabled={!status || status === selectEvent.status}
                className="bg-violet-500 disabled:opacity-20 text-white py-2 px-4 rounded-md hover:bg-violet-600 duration-300"
              >
                Modificar
              </button>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 pb-24">
      <div className="w-full rounded-md shadow-lg p-5 px-10 flex flex-col gap-5 glass">
        <h1 className="text-2xl drop-shadow-md font-black">Dashboard</h1>
        <div className="flex gap-10">
          <div>
            <p className="text-gray-600">Reservaciones pendientes</p>
            <p className="text-3xl font-bold">{size}</p>
          </div>
          {isAdmin && (
            <div>
              <p className="text-gray-600">Usuarios registrados</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
          )}
        </div>
      </div>
      <CustomCalendar
        view={view}
        date={date}
        setSelectedReservDate={setSelectedReservDate}
        setView={setView}
        setDate={setDate}
        reservations={reservations}
        setFromTime={setFromTime}
        setToTime={setToTime}
        setSelectEvent={setSelectEvent}
      />
      {renderBlocks()}
    </div>
  );
}

export default CalendarPage;
