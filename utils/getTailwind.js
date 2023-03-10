import resolveConfig from "tailwindcss/resolveConfig";
import myConfig from "../tailwind.config";

export default resolveConfig(myConfig);

export const getTailwindColors = resolveConfig(myConfig).theme.backgroundColor;
