import { Status, statusMap } from "@/interfaces";
import { colorStatus } from "@/services/parse";
import React from "react";
import { EventProps } from "react-big-calendar";

function CustomEventComponent({
  event,
}: EventProps & {
  event: { status: Status; title: string };
}) {
  const { status, title } = event;

  return (
    <div
      style={{
        backgroundColor: colorStatus(status),
      }}
      className={`text-center p-1 rounded-md text-xs`}
    >
      {title ? (
        <p>
          {title} - ({statusMap[status]})
        </p>
      ) : (
        <p>({statusMap[status]})</p>
      )}
    </div>
  );
}

export default CustomEventComponent;
