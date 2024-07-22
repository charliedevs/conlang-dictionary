import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export function Breadcrumbs(props: { name: string; isConlangOwner: boolean }) {
  return (
    <SignedIn>
      <div className="flex w-full justify-start">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                {props.isConlangOwner ? (
                  <Link href="/dashboard">Dashboard</Link>
                ) : (
                  <Link href="/lang">Languages</Link>
                )}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{props.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </SignedIn>
  );
}
