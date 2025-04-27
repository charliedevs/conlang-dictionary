import { type ReactNode } from "react";

export default function LanguageLayout(props: { children: ReactNode }) {
  return <div className="my-1 px-2 md:container">{props.children}</div>;
}
