export const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function integerToWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return TENS[t] + (o ? ` ${ONES[o]}` : '');
  }
  return String(n);
}

export function toSpeechText(text: string): string {
  return text.replace(/(\d+)\.(\d+)/g, (_match, intPart: string, decPart: string) => {
    const integer = integerToWords(Number(intPart));
    const decimals = Array.from(decPart)
      .map((d) => ONES[Number(d)] ?? d)
      .join(' ');
    return `${integer} point ${decimals}`;
  });
}

export function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
