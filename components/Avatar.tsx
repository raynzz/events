'use client';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fallbackText?: string;
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-32 h-32 text-3xl'
};

export default function Avatar({
    src,
    alt = 'Avatar',
    size = 'md',
    fallbackText = 'U',
    className = ''
}: AvatarProps) {
    const sizeClass = sizeClasses[size];

    // If we have a valid image source, try to display it
    if (src) {
        return (
            <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ${className}`}>
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // If image fails to load, hide it and show fallback
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-black flex items-center justify-center"><span class="text-white font-bold">${fallbackText}</span></div>`;
                        }
                    }}
                />
            </div>
        );
    }

    // Fallback to initials
    return (
        <div className={`${sizeClass} rounded-full bg-black flex items-center justify-center flex-shrink-0 ${className}`}>
            <span className="text-white font-bold">{fallbackText}</span>
        </div>
    );
}
