import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z"
          fill="currentColor"
        />
        <path
          d="M12,2C9.4,2,7.1,3,5.4,4.6C7.3,4.9,9,6.3,9.7,8.1C10.8,7.4,12.1,7,13.5,7c0.7,0,1.4,0.1,2,0.4C15.1,5.3,13.7,3.4,12,2z"
          fill="hsl(var(--secondary))"
          opacity="0.8"
        />
      </svg>
      <span className="font-headline text-xl font-bold tracking-tight">
        MediConnect
      </span>
    </div>
  );
};

export default Logo;
