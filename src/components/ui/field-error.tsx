import { TriangleAlert } from 'lucide-react';

type FieldErrorProps = { id: string; message?: string };

/** Inline validation message, announced when it appears and linked via aria-describedby. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-3 flex items-start gap-2 text-sm font-medium text-danger">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
