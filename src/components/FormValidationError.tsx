import { type FC } from "react";

type Props = {
  message: string | undefined;
};

export const FormValidationError: FC<Props> = ({ message }) => {
  return (
    <>
      {message ? (
        <>
          <p className="mt-1 text-sm text-red-600" id="email-error">
            {message}
          </p>
        </>
      ) : null}
    </>
  );
};

export default FormValidationError;
