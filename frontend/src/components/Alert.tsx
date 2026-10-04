import type { ReactNode } from "react";

type AlertProps = {
  type: "error" | "success" | "info";
  children: ReactNode;
};

export function Alert({ type, children }: AlertProps) {
  return (
    <div
      className={`alert alert-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
