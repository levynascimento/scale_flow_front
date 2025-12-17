import api from "./api";

// 🧑 Buscar dados do usuário logado
export async function getCurrentUser() {
    const { data } = await api.get("/users");
    return data;
}

// ✏️ Atualizar nome e email
export async function updateUser(body) {
    const { data } = await api.put("/users", body);
    return data;
}

// 🔒 Atualizar senha
export async function updatePassword(password) {
    const { data } = await api.put("/users/password", { password });
    return data;
}

// ❌ Deletar conta do usuário logado
export async function deleteUser() {
    await api.delete("/users");
}

// 📌 Listar habilidades do usuário
export async function getUserHabilities() {
    const { data } = await api.get("/users/habilities");
    return data;
}

// 📌 Adicionar habilidade
export async function addUserHability(roleName, level) {
    const { data } = await api.post("/users/habilities", {
        roleName,
        level
    });
    return data;
}

// 📌 Atualizar habilidade existente
export async function updateUserHability(roleName, level) {
    // 🔥 Importante: PUT só aceita body sem wrapper `data`
    const { data } = await api.put("/users/habilities", {
        roleName,
        level
    });
    return data;
}

// 📌 Remover somente a relação do usuário com o papel
// ⚠ NÃO DELETA O PAPEL global da aplicação
export async function deleteUserHability(roleName) {
    const { data } = await api.delete("/users/habilities", {
        headers: { "Content-Type": "application/json" },
        data: { roleName }
    });

    return data;
}

