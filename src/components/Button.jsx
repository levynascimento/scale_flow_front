/*
 * ♻️ REFACTORING — Move Field (BASE_CLASS / VARIANT_CLASSES)
 * Antes: `base` e `styles` eram recriados como variáveis locais a cada render.
 * Agora: são constantes do módulo, com nome que diz o que guardam.
 * Benefícios:
 *   + Legibilidade
 *   + Desempenho (objetos não são recriados a cada render)
 */
const BASE_CLASS = 'px-4 py-2 rounded-lg text-sm font-medium transition';

const VARIANT_CLASSES = {
    solid: 'bg-sf-primary text-white hover:bg-sf-primary-600',
    outline: 'border border-sf-border text-sf-foreground hover:bg-sf-primary/10'
};

const COLOR_PREFIXES = ['bg-', 'text-', 'border-'];

/*
 * ♻️ REFACTORING — Extract Method (overridesColor)
 * Antes: três `className.includes(...)` encadeados com || no corpo do componente.
 * Benefícios:
 *   + Legibilidade (o nome explica a intenção)
 *   + Testabilidade
 *   - Duplicação (os prefixos ficam numa lista)
 */
function overridesColor(className) {
    return COLOR_PREFIXES.some(prefix => className.includes(prefix));
}

export default function Button({ children, className = '', variant = 'solid', ...props }) {
    /*
     * ♻️ REFACTORING — Inline Variable (finalStyle)
     * Antes: `let finalStyle = styles[variant]` era declarado e depois
     * reatribuído para '' dentro de um if.
     * Agora: um único ternário, sem variável mutável.
     * Benefícios:
     *   - Mutabilidade
     *   + Legibilidade
     */
    const variantClass = overridesColor(className) ? '' : VARIANT_CLASSES[variant];

    return (
        <button {...props} className={`${BASE_CLASS} ${variantClass} ${className}`}>
            {children}
        </button>
    );
}
