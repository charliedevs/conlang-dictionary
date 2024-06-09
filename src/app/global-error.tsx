"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError(props: { error: unknown }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(props.error);
    } else {
      Sentry.captureException(props.error);
    }
  }, [props.error]);

  return (
    <html>
      <body>
        <Error statusCode={500} title="Error" />
      </body>
    </html>
  );
}
