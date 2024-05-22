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

interface ConlangPageProps {
  params: { name: string };
}

export default function ConlangPage({ params }: ConlangPageProps) {
  // TODO: fetch conlang data from database
  return (
    <div className="flex flex-col p-5">
      <SignedIn>
        <div className="flex w-full justify-start">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{params.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </SignedIn>

      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-14">
        <h1 className="text-center text-2xl font-medium">{params.name}</h1>
        <p>Description here</p>
      </div>
    </div>
  );
}
