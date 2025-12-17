export default function Button({ children, className = '', variant = 'solid', ...props }) {
    const base = 'px-4 py-2 rounded-lg text-sm font-medium transition';

    const styles = {
        solid: 'bg-sf-primary text-white hover:bg-sf-primary-600',
        outline: 'border border-sf-border text-sf-foreground hover:bg-sf-primary/10'
    };

    let finalStyle = styles[variant];

    // 🚨 Se o usuário passar uma cor (bg- / text- / border-), removemos a cor do estilo padrão
    const userIsOverridingColor =
        className.includes('bg-') ||
        className.includes('text-') ||
        className.includes('border-');

    if (userIsOverridingColor) {
        finalStyle = ''; // remove estilos padrões de cor
    }

    return (
        <button
            {...props}
            className={`${base} ${finalStyle} ${className}`}
        >
            {children}
        </button>
    );
}
