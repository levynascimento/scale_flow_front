// src/services/integrantsApi.js
import api from "./api";

// Lista todos os integrantes da banda
export async function getBandIntegrants(bandId) {
    const res = await api.get(`/bands/${bandId}/integrants`);
    return res.data;
}
