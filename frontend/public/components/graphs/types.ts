export type DataPoint<X = Date | number | string> = {
  x?: X;
  y?: number;
  label?: string;
  metric?: { [key: string]: string };
  description?: (date: string, value: string) => string;
};

export type DomainPadding =
  | number
  | {
      x?: number | [number, number];
      y?: number | [number, number];
    };
