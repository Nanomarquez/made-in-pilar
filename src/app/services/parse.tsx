import { Reservations, statusMap } from "@/interfaces";
import dayjs from "dayjs";
import { Views } from "react-big-calendar";

export const parseReservationsToEventsMonth = (
  reservations: Reservations[]
) => {
  return reservations.map((reservation) => {
    const { from, to, userId, status } = reservation;

    // Formatear la fecha de inicio y fin utilizando dayjs
    const start = new Date(from.seconds * 1000);
    const end = new Date(to.seconds * 1000);

    // Crear el evento en el formato deseado
    return {
      start,
      end,
      title: `${userId} (${statusMap[status]})`,
      status,
    };
  });
};

export const parseReservationsToEventsDay = (
  reservations: Reservations[],
  isAdmin: boolean,
  username: string
) => {
  return reservations.flatMap((reservation) => {
    const { from, to, userId, status, id } = reservation;

    // Convertir de Firestore timestamps a objetos Date en UTC
    const start = new Date(from.seconds * 1000);
    const end = new Date(to.seconds * 1000);

    // Crear array de eventos
    const events = [];

    // Verifica si el evento cruza la medianoche
    if (start.getDate() !== end.getDate()) {
      // El evento cruza la medianoche, lo dividimos en dos eventos

      // Primer evento: desde la hora de inicio hasta la medianoche del primer día
      const midnightStart = new Date(start);
      midnightStart.setHours(23, 59, 59, 999); // Fin del primer día

      events.push({
        start: start,
        end: midnightStart,
        title: isAdmin ? `${userId}` : `${userId === username ? userId : ""}`,
        status,
        id,
      });

      // Segundo evento: desde la medianoche del siguiente día hasta el final del evento
      const midnightEnd = new Date(end);
      midnightEnd.setHours(0, 0, 0, 0); // Inicio del segundo día (00:00:00)

      events.push({
        start: midnightEnd,
        end: end,
        title: isAdmin ? `${userId}` : `${userId === username ? userId : ""}`,
        status,
        id,
      });
    } else {
      // Si el evento no cruza la medianoche, no lo dividimos
      events.push({
        start: start,
        end: end,
        title: isAdmin ? `${userId}` : `${userId === username ? userId : ""}`,
        status,
        id,
      });
    }

    return events;
  });
};

export const colorStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "#d89a3d";
    case "confirmed":
      return "#64c524";
    case "rejected":
      return "#db5151";
  }
};

export const getReservationStatus = (
  cellDate: Date,
  reservations: Reservations[]
) => {
  const filteredReservations = reservations.filter((reservation) => {
    const from = dayjs(reservation.from.seconds * 1000);
    const to = dayjs(reservation.to.seconds * 1000);
    return (
      (dayjs(cellDate).isSame(from, "day") ||
        dayjs(cellDate).isAfter(from, "day")) &&
      (dayjs(cellDate).isSame(to, "day") || dayjs(cellDate).isBefore(to, "day"))
    );
  });

  const hasPending = filteredReservations.some(
    (reservation) => reservation.status === "pending"
  );
  const allConfirmed = filteredReservations.every(
    (reservation) => reservation.status === "confirmed"
  );

  if (hasPending) return "pending";
  if (allConfirmed && filteredReservations.length > 0) return "confirmed";

  return "none";
};
export const dayPropGetter =
  (reservations: Reservations[], view: (typeof Views)[keyof typeof Views]) =>
  (date: Date) => {
    const status = getReservationStatus(date, reservations);

    if (status === "pending") {
      return {
        className: "selected-day-pending",
        style: {
          backgroundColor: view === "day" ? undefined : "#d89a3d", // Color para días con reservas pendientes
        },
      };
    }

    if (status === "confirmed") {
      return {
        className: "selected-day-confirmed",
        style: {
          backgroundColor: view === "day" ? undefined : "#64c524", // Color para días con todas las reservas confirmadas
        },
      };
    }

    return {}; // Sin estilo si no hay reservas
  };
