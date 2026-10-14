/*
 * ♻️ REFACTORING — Inline Class (Handler → ValidationHandler)
 * Antes: existiam DUAS classes base idênticas para a Chain of Responsibility:
 * `LoginValidator` (utils/loginValidationChain.js) e `Handler`
 * (utils/musicValidationChain.js), com o mesmo setNext() e o mesmo handle().
 * Agora: a classe duplicada foi absorvida e sobrou uma só base.
 * Benefícios:
 *   - Duplicação
 *   + Coesão
 *   + Reuso (qualquer formulário novo usa a mesma base)
 */
export class ValidationHandler {
    setNext(handler) {
        this.next = handler
        return handler
    }

    handle(data) {
        return this.next ? this.next.handle(data) : null
    }

    /*
     * ♻️ REFACTORING — Extract Method (chain)
     * Antes: Login e RepertoireForm montavam a cadeia à mão:
     *   const a = new X(); const b = new Y(); a.setNext(b); a.handle(...)
     * Agora: ValidationHandler.chain(new X(), new Y()).handle(...)
     * Benefícios:
     *   - Duplicação
     *   + Legibilidade
     *   - Acoplamento (o componente não precisa saber como encadear)
     */
    static chain(...handlers) {
        handlers.reduce((current, next) => current.setNext(next))
        return handlers[0]
    }
}

/*
 * ♻️ REFACTORING — Move Field (campo do erro)
 * Antes: o validador devolvia só a mensagem (string) e o componente
 * DESCOBRIA o campo procurando palavras no texto:
 *   if (error.toLowerCase().includes('e-mail')) ...
 *   else if (error.toLowerCase().includes('senha')) ...
 * Se alguém mudasse a mensagem, o erro aparecia no lugar errado.
 * Agora: o nome do campo viaja junto com a mensagem, num objeto próprio.
 * Benefícios:
 *   + Robustez (mudar o texto não quebra a lógica)
 *   - Acoplamento entre texto de UI e lógica
 *   + Coesão
 */
export class ValidationError {
    constructor(field, message) {
        this.field = field
        this.message = message
    }

    toFieldErrors() {
        return { [this.field]: this.message }
    }
}
