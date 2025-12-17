// src/services/roleApi.js
import api from './api';

// GET /roles  -> lista todos os papéis
export async function getRoles() {
    const { data } = await api.get('/roles');
    return data;
}

// GET /roles/{id} -> detalhes de um papel
export async function getRoleById(id) {
    const { data } = await api.get(`/roles/${id}`);
    return data;
}

// POST /roles -> criar novo papel
// body: { "name": "string" }
export async function createRole(payload) {
    const { data } = await api.post('/roles', payload);
    return data;
}

// PUT /roles/{id} -> editar papel
// body: { "name": "string" }
export async function updateRole(id, payload) {
    const { data } = await api.put(`/roles/${id}`, payload);
    return data;
}

// DELETE /roles/{id} -> remover papel
export async function deleteRole(id) {
    await api.delete(`/roles/${id}`);
}

// POST /roles/multiple -> criar vários de uma vez (se você quiser usar depois)
// body: [ "Guitarrista", "Baterista", ... ]
export async function createMultipleRoles(namesArray) {
    const { data } = await api.post('/roles/multiple', namesArray);
    return data;
}
