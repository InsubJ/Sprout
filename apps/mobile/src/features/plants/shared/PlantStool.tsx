import { G, Line, Rect } from "react-native-svg";
export function PlantStool() {
  return (
    <G>
      <Line
        x1="200"
        y1="248"
        x2="192"
        y2="335"
        stroke="#6B4A2F"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <Line
        x1="175"
        y1="295"
        x2="225"
        y2="295"
        stroke="#6B4A2F"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Line
        x1="170"
        y1="248"
        x2="160"
        y2="345"
        stroke="#8B6F47"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <Line
        x1="230"
        y1="248"
        x2="240"
        y2="345"
        stroke="#8B6F47"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <Rect x="150" y="240" width="100" height="10" rx="3" fill="#A9835A" />
      <Rect x="150" y="247" width="100" height="3" rx="1" fill="#8B6F47" />
    </G>
  );
}
