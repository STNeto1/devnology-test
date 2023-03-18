import { type FC } from "react";

export const Loading: FC = () => {
  return (
    <div role="status" className="h-full w-full animate-pulse rounded shadow ">
      <div className="mb-4 flex h-48 items-center justify-center rounded bg-gray-300 dark:bg-gray-500"></div>
    </div>
  );
};
