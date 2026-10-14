import { BaseService } from './BaseService.js'

/*
 * ♻️ REFACTORING — Extract Class (musicApi.js → MusicService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 *   + Testabilidade
 */
export class MusicService extends BaseService {
    getById(id) {
        return this.http.get(`/musics/${id}`)
    }

    /*
     * ♻️ REFACTORING — Change Function Declaration (updateMusicInfo → update)
     * Benefícios:
     *   + Consistência com os outros serviços (update, delete, create)
     */
    update(id, body) {
        return this.http.put(`/musics/${id}`, body)
    }

    delete(id) {
        return this.http.delete(`/musics/${id}`)
    }

    addThemes(id, themes) {
        return this.http.post(`/musics/${id}/themes`, themes)
    }

    removeThemes(id, themes) {
        return this.http.delete(`/musics/${id}/themes`, { data: themes })
    }

    listByBand(bandId) {
        return this.http.get(`/bands/${bandId}/musics`)
    }

    create(bandId, body) {
        return this.http.post(`/bands/${bandId}/musics`, body)
    }

    listDifficulties(id) {
        return this.http.get(`/musics/${id}/difficulties`)
    }

    setDifficulty(id, roleSlug, level) {
        return this.http.post(`/musics/${id}/difficulties/${roleSlug}`, { level })
    }

    deleteDifficulty(id, roleSlug) {
        return this.http.delete(`/musics/${id}/difficulties/${roleSlug}`)
    }
}
