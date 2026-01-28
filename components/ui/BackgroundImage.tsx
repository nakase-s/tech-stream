import Image from 'next/image';

export default function BackgroundImage() {
    return (
        <div className="fixed inset-0 -z-50 w-full h-full">
            <Image
                src="/background.png"
                alt="App Background"
                fill
                className="object-cover"
                style={{ filter: 'brightness(80%)' }}
                priority
                quality={100}
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/70" />
        </div>
    );
}
