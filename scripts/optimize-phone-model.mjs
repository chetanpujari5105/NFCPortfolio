// Builds public/models/iphone-18-pro-max-burgundy.glb (the 3D phone, components/phone/Phone3D.tsx)
// from the source export: drops the baked screen mesh (the live OS is the screen), dedupes, then
// quantizes and meshopt-compresses the geometry. Node and material names are kept: Phone3D finds
// the finish materials and the camera control by name. 3.86 MB → 0.97 MB (0.69 MB gzipped).
// The tools aren't project dependencies:
//   npm i --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer
// Usage: node scripts/optimize-phone-model.mjs <source.glb> [out=public/models/iphone-18-pro-max-burgundy.glb]
import { NodeIO, PropertyType } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, prune, quantize, reorder } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

const [src, out = "public/models/iphone-18-pro-max-burgundy.glb"] = process.argv.slice(2);
if (!src) throw new Error("Usage: node scripts/optimize-phone-model.mjs <source.glb> [out]");

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });

const doc = await io.read(src);
for (const node of doc.getRoot().listNodes()) {
  if (node.getName() !== "Front_Screen") continue;
  node.getMesh()?.dispose();
  node.dispose();
}
await doc.transform(
  prune(),
  dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.TEXTURE] }),
  reorder({ encoder: MeshoptEncoder }),
  quantize(),
);
doc
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
await io.write(out, doc);
console.log(`${out}: ${doc.getRoot().listNodes().length} nodes, ${doc.getRoot().listMaterials().length} materials`);
