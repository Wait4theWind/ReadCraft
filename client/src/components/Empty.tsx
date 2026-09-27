interface Props {
  text: string;
}

export default function Empty({ text }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}
