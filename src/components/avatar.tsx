import { initials } from "@/lib/format";
import type { Contact } from "@/types/db";

interface AvatarProps {
  contact: Pick<Contact, "firstname" | "lastname" | "color">;
  size?: number;
}

export function Avatar({ contact, size = 32 }: AvatarProps) {
  return (
    <div
      className={"avatar " + (contact.color || "av-blue")}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.35),
      }}
    >
      {initials(contact)}
    </div>
  );
}
