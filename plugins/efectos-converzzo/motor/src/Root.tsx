import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { Plan } from "./lib/base";
import { Editar } from "./Editar";

const meta: CalculateMetadataFunction<Plan> = ({ props }) => ({ durationInFrames: Math.max(1, props.duracion), fps: props.fps || 30, width: props.salida?.w ?? 1080, height: props.salida?.h ?? 1920 });

export const Root: React.FC = () => (
  <Composition id="Editar" component={Editar} width={1080} height={1920} durationInFrames={150} fps={30}
    defaultProps={{ video: "", duracion: 150, fps: 30, capas: [] } as Plan} calculateMetadata={meta} />
);
