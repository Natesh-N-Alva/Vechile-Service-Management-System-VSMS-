import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function Logo({
  href = '/',
  size = 'md',
  className = '',
  showText = true,
}: LogoProps) {
  const sizes = {
    sm: { image: 24, container: 'h-6' },
    md: { image: 32, container: 'h-8' },
    lg: { image: 48, container: 'h-12' },
  };

  const selectedSize = sizes[size];

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${selectedSize.container} relative`}>
        <Image
          src="/logo.jpg"
          alt="VehicleFlow Logo"
          width={selectedSize.image}
          height={selectedSize.image}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-bold text-lg bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
          VehicleFlow
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
