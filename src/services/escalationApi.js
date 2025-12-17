import api from "./api";

/**
 * ===============================
 * ESCALAÇÕES DO EVENTO
 * ===============================
 */

/**
 * Lista todas as escalações de um evento
 */
export async function getEscalations(eventId) {
    const { data } = await api.get(`/events/${eventId}/escalations`);
    return data;
}

/**
 * Cria uma nova escalação
 */
export async function createEscalation(eventId, payload) {
    const { data } = await api.post(
        `/events/${eventId}/escalations`,
        payload
    );
    return data;
}

/**
 * Remove uma escalação
 */
export async function deleteEscalation(escalationId) {
    await api.delete(`/escalations/${escalationId}`);
}

/**
 * ===============================
 * SUGESTÕES INTELIGENTES
 * ===============================
 */

/**
 * Lista de prioridade para um papel específico
 * Quanto MAIOR o número, maior a prioridade
 */
export async function getPriorityList(roleId, bandId) {
    const { data } = await api.get("/escalations/priority-list", {
        params: {
            roleSlug: roleId,
            bandId
        }
    });
    return data;
}

/**
 * Última escalação de um papel
 */
export async function getLastEscalation(roleId, bandId) {
    const { data } = await api.get("/escalations/last-escalation", {
        params: {
            roleSlug: roleId,
            bandId
        }
    });
    return data;
}

/**
 * Escalações dos últimos 2 meses
 */
export async function getLastTwoMonthsEscalations(roleId, bandId) {
    const { data } = await api.get("/escalations/last-2-months", {
        params: {
            roleSlug: roleId,
            bandId
        }
    });
    return data;
}
