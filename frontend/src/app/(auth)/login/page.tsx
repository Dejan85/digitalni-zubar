import { Suspense } from "react";

import { LoginContainer } from "@/containers/LoginContainer";

// Suspense zbog useSearchParams u containeru
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContainer />
    </Suspense>
  );
}
