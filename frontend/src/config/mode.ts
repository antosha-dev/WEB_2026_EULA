/** Включается через webpack DefinePlugin при npm run wireframe */
declare const process: { env: { WIREFRAME_MODE?: string } };

export const WIREFRAME_MODE = process.env.WIREFRAME_MODE === "true";
