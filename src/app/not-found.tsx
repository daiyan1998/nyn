import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col items-start justify-center gap-6 border-b border-line px-[22px] md:px-[44px]">
      <div className="eyebrow">404</div>
      <h1 className="text-[clamp(44px,7vw,110px)]">
        Nothing cut <em className="font-normal text-brass-bright italic">here</em>.
      </h1>
      <p className="max-w-[44ch] text-[15.5px] leading-[1.7] text-bone-dim">
        This page doesn&apos;t exist — or it went the way of a cheap wallet.
      </p>
      <Link href="/" className="btn">
        <span>Back to the workshop</span>
      </Link>
    </section>
  );
}
