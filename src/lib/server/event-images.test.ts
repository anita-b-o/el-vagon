import { describe, expect, it } from "vitest";
import { MAX_EVENT_IMAGE_BYTES, isManagedEventImage, validateEventImage } from "./event-images";

function imageFile(bytes: number[], type: string, name = "imagen.jpg") {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("event image validation", () => {
  it("accepts a JPEG image", async () => {
    await expect(validateEventImage(imageFile([0xff, 0xd8, 0xff, 0xe0], "image/jpeg"))).resolves.toMatchObject({ extension: "jpg" });
  });

  it("rejects an invalid MIME type and a spoofed MIME type", async () => {
    await expect(validateEventImage(imageFile([1, 2, 3], "image/gif", "imagen.gif"))).rejects.toThrow("Formato no permitido");
    await expect(validateEventImage(imageFile([1, 2, 3], "image/jpeg"))).rejects.toThrow("no coincide");
  });

  it("rejects empty and oversized files", async () => {
    await expect(validateEventImage(imageFile([], "image/jpeg"))).rejects.toThrow("vacía");
    const large = new File([new Uint8Array(MAX_EVENT_IMAGE_BYTES + 1)], "grande.jpg", { type: "image/jpeg" });
    await expect(validateEventImage(large)).rejects.toThrow("5 MB");
  });

  it("only considers event-images URLs from this Blob store managed", () => {
    expect(isManagedEventImage("https://store.public.blob.vercel-storage.com/event-images/event.jpg")).toBe(true);
    expect(isManagedEventImage("/images/events/existente.webp")).toBe(false);
    expect(isManagedEventImage("https://example.com/event-images/event.jpg")).toBe(false);
  });
});
