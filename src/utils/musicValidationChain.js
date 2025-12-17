// Classe base — define o comportamento da cadeia
class Handler {
    setNext(handler) {
        this.next = handler
        return handler
    }

    handle(request) {
        if (this.next) return this.next.handle(request)
        return null
    }
}

// Valida o título
export class TitleValidator extends Handler {
    handle(request) {
        if (!request.title || request.title.trim() === '') {
            return 'O título da música é obrigatório.'
        }
        return super.handle(request)
    }
}

// Valida o artista
export class ArtistValidator extends Handler {
    handle(request) {
        if (!request.artist || request.artist.trim() === '') {
            return 'O artista da música é obrigatório.'
        }
        return super.handle(request)
    }
}
