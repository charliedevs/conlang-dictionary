import Image from "next/image";
import Link from "next/link";
import { CurrentUser } from "./current-user";

export const Header = () => {
  return (
    <nav className="navbar relative z-40 py-4" aria-label="Global">
      <div className="flex w-full items-center justify-between px-4">
        <div
          id="header-left"
          className="flex w-full items-center justify-between md:w-auto"
        >
          <Link href="/" className="flex" title="Home">
            <Image
              src="/images/conlang_dictionary.png"
              width="50"
              height="50"
              alt="Conlang Flag Logo"
            />
          </Link>
          <div className="hidden gap-2 md:ml-10 md:flex">FAQ (TODO)</div>
        </div>
        <div
          id="header-right"
          className="flex flex-grow items-center justify-end gap-4"
        >
          <CurrentUser />
        </div>
      </div>
    </nav>
  );
};
