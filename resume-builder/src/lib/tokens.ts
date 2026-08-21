export const TOKENS = {
  ink: "#14181F",
  paper: "#FBFAF6",
  blue: "#2F5D8A",
  slate: "#5B6472",
  mist: "#E7E5DC",
  green: "#3E7A5C",
  amber: "#B8863B",
  red: "#A34438",
};

export interface Accent {
  id: string;
  label: string;
  hex: string;
}

export const ACCENTS: Accent[] = [
  { id: "blue", label: "Blueprint", hex: "#2F5D8A" },
  { id: "green", label: "Terminal", hex: "#3E7A5C" },
  { id: "ink", label: "Mono", hex: "#14181F" },
];
