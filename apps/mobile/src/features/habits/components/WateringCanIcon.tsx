import Svg, { Path } from "react-native-svg";

const paths = [
  "M7 12h8v5a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3v-5z",
  "M7 12V9a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3",
  "M15 16l5-4",
  "M19 10l2.5 2.5",
  "M7 14a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4h1",
] as const;

export function WateringCanIcon({
  color = "#FFFFFF",
  flipped = true,
}: {
  color?: string;
  flipped?: boolean;
}) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      {paths.map((path) => (
        <Path
          key={path}
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
