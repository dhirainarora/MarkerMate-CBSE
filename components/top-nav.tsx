import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import type { UserRecord } from "@/lib/types";

type TopNavProps = {
  user: UserRecord | null;
};

export function TopNav({ user }: TopNavProps) {
  return (
    <header className="topNav">
      <Link className="brand" href="/">
        MarkerMate CBSE
      </Link>
      <nav className="navLinks">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/#how-it-works">How It Works</Link>
        <Link href="/#subjects">Subjects</Link>
      </nav>
      <div className="navAuth">
        {user ? (
          <>
            <span className="userChip">{user.name}</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link className="ghostButton" href="/login">
              Log In
            </Link>
            <Link className="primaryButton small" href="/signup">
              Start Checking
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
