import { X } from "lucide-react";
import { S } from "./constants";
import type { Room } from "../../../types/types";

type DetailModalProps = {
  room: Room;
  onClose: () => void;
};

export default function DetailModal({ room, onClose }: DetailModalProps) {
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={S.modalHdr}>
          <h2 style={S.modalTitle}>{room.name}</h2>
          <button style={S.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {(
          [
            ["Room No",     room.roomNo ?? "—"],
            ["Building",    room.buildingName],
            ["Floor",       `Floor ${room.floor}`],
            ["Category",    room.category],
            ["Accessible",  room.isAccessible ? "Yes" : "No"],
            ["Description", room.description ?? "—"],
          ] as [string, string][]
        ).map(([label, value]) => (
          <div key={label} style={S.detailRow}>
            <span style={S.detailLabel}>{label}</span>
            <span style={S.detailValue}>{value}</span>
          </div>
        ))}

        <div style={S.detailRow}>
          <span style={S.detailLabel}>Tags</span>
          <div style={{ flex: 1 }}>
            {room.tags?.length
              ? room.tags.map((t) => (
                  <span key={t} style={S.tag}>
                    {t}
                  </span>
                ))
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}