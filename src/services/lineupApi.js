// src/services/lineupApi.js
import api from "./api";

// LISTAR LINEUPS DA BANDA
export async function getLineups(bandId) {
    const res = await api.get(`/bands/${bandId}/lineups`);
    return res.data;
}

// CONSULTAR UMA LINEUP ESPECÍFICA (DETALHES)
export async function getLineup(lineupId) {
    const res = await api.get(`/lineups/${lineupId}`);
    return res.data;
}

// CRIAR UMA NOVA LINEUP (com papéis incluídos)
export async function createLineup(bandId, payload) {
    // payload: { name, roles: [{ roleId, description }] }
    const res = await api.post(`/bands/${bandId}/lineups`, payload);
    return res.data;
}

// EDITAR NOME DA LINEUP
export async function updateLineupName(lineupId, payload) {
    // payload: { name }
    const res = await api.put(`/lineups/${lineupId}`, payload);
    return res.data;
}

// ADICIONAR PAPEL À LINEUP
export async function addRoleToLineup(lineupId, payload) {
    // payload: { roleId, description }
    const res = await api.post(`/lineups/${lineupId}/roles`, payload);
    return res.data;
}

// EDITAR DESCRIÇÃO DE UM ITEM DA LINEUP (LineupRole)
export async function updateLineupRole(lineupRoleId, payload) {
    // payload: { description }
    const res = await api.put(`/lineups-roles/${lineupRoleId}`, payload);
    return res.data;
}

// REMOVER PAPEL DA LINEUP
export async function removeRoleFromLineup(lineupRoleId) {
    await api.delete(`/lineups-roles/${lineupRoleId}`);
}

// DELETAR A LINEUP INTEIRA
export async function deleteLineup(lineupId) {
    await api.delete(`/lineups/${lineupId}`);
}
