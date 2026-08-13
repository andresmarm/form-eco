import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar el formulario desde un celular en la misma red local
  // (ej. http://192.168.40.83:3000) durante desarrollo. Sin esto, Next.js
  // bloquea con 403 las peticiones de assets/HMR que no vengan de
  // localhost, y la página nunca termina de hidratarse en el celular
  // (se ve estática: los botones no responden y el mapa no carga).
  allowedDevOrigins: ["192.168.40.83"],
};

export default nextConfig;
