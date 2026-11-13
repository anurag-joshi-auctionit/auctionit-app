import type { ReactNode } from "react";
import { Button } from "@auctionit/ui";

export function AuthLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-[url('/illustrations/bg.png')] bg-cover bg-center bg-no-repeat dark:bg-[url('/illustrations/bg-dark.png')]">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </div>
      <footer className="my-8 text-center text-foreground">
        © {year}, AuctionIt. All Rights Reserved. Powered by{" "}
        <Button
          variant="link"
          href="https://www.jindalx.com/"
          target="_blank"
          rel="noreferrer"
          className="h-auto p-0"
        >
          JindalX
        </Button>
      </footer>
    </div>
  );
}
