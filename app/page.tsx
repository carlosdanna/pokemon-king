import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <Typography variant="h1">Ash&apos;s Card Album</Typography>
      <Link href="/album" className={buttonVariants({ size: "lg" })}>
        <Typography as="span" variant="small" color="inherit">
          Open the album
        </Typography>
      </Link>
    </main>
  );
}
