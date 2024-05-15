import { HTMLProps } from "react";

export default function Textarea({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className="w-full resize-none h-40 rounded outline-none p-2"
    ></textarea>
  );
}
