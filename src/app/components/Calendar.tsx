import { messages } from "@/constants";
import { ParsedRservations, Reservations, Status } from "@/interfaces";
import { dayPropGetter, parseReservationsToEventsDay } from "@/services/parse";
import dayjs from "dayjs";
import React from "react";
import {
  Calendar,
  dayjsLocalizer,
  Views,
  EventProps,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CustomEventComponent from "./CustomEventComponent";
import { onSelectSlot } from "@/services/utils";
import { useAppSelector } from "@/redux/hooks";
function CustomCalendar({
  view,
  date,
  setSelectedReservDate,
  setView,
  setDate,
  reservations,
  setFromTime,
  setToTime,
  setSelectEvent,
}: {
  view: (typeof Views)[keyof typeof Views];
  date: Date;
  setSelectedReservDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setView: React.Dispatch<
    React.SetStateAction<(typeof Views)[keyof typeof Views]>
  >;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  reservations: Reservations[];
  setFromTime: React.Dispatch<React.SetStateAction<Date | null>>;
  setToTime: React.Dispatch<React.SetStateAction<Date | null>>;
  setSelectEvent: React.Dispatch<
    React.SetStateAction<ParsedRservations | null>
  >;
}) {
  const { isAdmin, userData } = useAppSelector((state) => state.auth);
  const localizer = dayjsLocalizer(dayjs);

  function CustomEventWrapper(
    props: EventProps & { event: { status: Status; title: string } }
  ) {
    return <CustomEventComponent {...props} />;
  }

  const components = {
    event: view === "month" ? undefined : CustomEventWrapper,
  };

  return (
    <div className="h-[400px] w-full glass flex flex-col">
      <Calendar
        style={{ height: "400px" }}
        messages={messages}
        // views={[Views.MONTH, Views.DAY, Views.AGENDA]}
        views={
          isAdmin
            ? [Views.MONTH, Views.DAY, Views.AGENDA]
            : [Views.MONTH, Views.DAY]
        }
        defaultView={view}
        view={view}
        date={date}
        onView={(view) => {
          setSelectEvent(null);
          setSelectedReservDate(null);
          setView(view);
        }}
        onNavigate={(date) => {
          setSelectedReservDate(null);
          setSelectEvent(null);
          setDate(new Date(date));
        }}
        localizer={localizer}
        events={
          view === "month"
            ? undefined
            : parseReservationsToEventsDay(
                reservations,
                isAdmin,
                userData?.username
              )
        }
        dayPropGetter={dayPropGetter(reservations, view)}
        components={components}
        onSelectSlot={(event) => {
          setSelectEvent(null);
          onSelectSlot({
            event,
            view,
            reservations,
            setSelectedReservDate,
            setFromTime,
            setToTime,
          });
        }}
        selectable
        step={60}
        timeslots={1}
        onSelectEvent={(e) => {
          if (!isAdmin) return;
          setSelectedReservDate(null);
          setSelectEvent(e);
        }}
      />
    </div>
  );
}

export default CustomCalendar;
