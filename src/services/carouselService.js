import api from "./apiClient";

export async function listCarousel() {
  return (await api.get("/MicroSaas/carousel")).data;
}

export async function listAdminCarousel() {
  return (await api.get("/MicroSaas/carousel/admin")).data;
}

export async function createCarouselSlide(payload) {
  return (await api.post("/MicroSaas/carousel", payload)).data;
}

export async function updateCarouselSlide(id, payload) {
  return (await api.put("/MicroSaas/carousel/" + id, payload)).data;
}

export async function deleteCarouselSlide(id) {
  return (await api.delete("/MicroSaas/carousel/" + id)).data;
}
