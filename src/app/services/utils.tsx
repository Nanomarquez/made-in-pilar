import { SlotInfo, Views } from "react-big-calendar";
import { parseReservationsToEventsDay } from "./parse";
import { Reservations } from "@/interfaces";

export const onSelectSlot = ({
  event,
  view,
  reservations,
  setSelectedReservDate,
  setFromTime,
  setToTime,
}: {
  event: SlotInfo;
  view: (typeof Views)[keyof typeof Views];
  reservations: Reservations[];
  setSelectedReservDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setFromTime: React.Dispatch<React.SetStateAction<Date | null>>;
  setToTime: React.Dispatch<React.SetStateAction<Date | null>>;
}) => {
  const { start, end, action } = event;

  if (view === "month") return;

  if (action === "select") {
    // Calcular duración seleccionada
    let adjustedEnd = end;
    const duration = (end.getTime() - start.getTime()) / (60 * 60 * 1000);

    // Limitar a 3 horas si supera el máximo permitido
    if (duration > 3) {
      alert('Maximo 3 horas permitido')
      adjustedEnd = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    }

    // Ajustar el rango para evitar superposición con eventos existentes
    parseReservationsToEventsDay(reservations).forEach((existingEvent) => {
      if (
        start < existingEvent.end &&
        adjustedEnd > existingEvent.start // Chequeo de superposición
      ) {
        adjustedEnd = new Date(
          Math.min(adjustedEnd.getTime(), existingEvent.start.getTime())
        );
      }
    });

    // Si no hay rango válido, cancelar selección
    if (adjustedEnd <= start) {
      alert("El rango seleccionado no es válido.");
      return;
    }

    setSelectedReservDate(start);
    setFromTime(start);
    setToTime(adjustedEnd);
    console.log("Rango ajustado", { start, adjustedEnd });
  }

  if (action === "click") {
    setSelectedReservDate(start);
    setFromTime(start);
    setToTime(null);
  }
};
