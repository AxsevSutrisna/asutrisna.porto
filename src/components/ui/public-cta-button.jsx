import { Button } from './button'

const HERO_CTA_CLASS = ''

export default function PublicCtaButton({
    href,
    text,
    icon: Icon,
    iconClassName = 'w-4 h-4 text-current',
    onClick,
    target,
    rel,
    type = 'button',
    disabled,
    className = '',
    ...props
}) {
    if (href) {
        return (
            <Button asChild variant="neutral" size="default" className={`${HERO_CTA_CLASS} ${className}`.trim()} {...props}>
                <a href={href} aria-label={text} onClick={onClick} target={target} rel={rel}>
                    <span className="font-medium">{text}</span>
                    <Icon className={iconClassName} />
                </a>
            </Button>
        )
    }

    return (
        <Button
            variant="neutral"
            size="default"
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${HERO_CTA_CLASS} ${className}`.trim()}
            {...props}
        >
            <Icon className={iconClassName} />
            <span className="font-medium">{text}</span>
        </Button>
    )
}