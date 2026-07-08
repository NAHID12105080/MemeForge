import { Line } from "react-konva";

export interface GuideLine {
  orientation: "vertical" | "horizontal";
  position: number;
}

interface SnapGuidesProps {
  guides: GuideLine[];
  canvasWidth: number;
  canvasHeight: number;
}

export function SnapGuides({ guides, canvasWidth, canvasHeight }: SnapGuidesProps) {
  return (
    <>
      {guides.map((guide, index) => (
        <Line
          key={index}
          points={
            guide.orientation === "vertical"
              ? [guide.position, 0, guide.position, canvasHeight]
              : [0, guide.position, canvasWidth, guide.position]
          }
          stroke="#f72585"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      ))}
    </>
  );
}
