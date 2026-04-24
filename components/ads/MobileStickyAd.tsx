'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AdZone } from '@/components/ads/AdZone';

interface Props {
    postType: string;
    postId: string;
}

export function MobileStickyAd({ postType, postId }: Props) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (isDismissed) return;

        // Show ad after scrolling down slightly to prevent immediate obstruction
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDismissed]);

    if (!isVisible || isDismissed) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden transform transition-transform duration-300 ease-out animate-fade-up shadow-[0_-8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-border/50">
            {/* Close Button */}
            <button
                onClick={() => setIsDismissed(true)}
                className="absolute -top-10 right-2 size-8 bg-white dark:bg-zinc-800 border border-border shadow-lg rounded-full flex items-center justify-center text-foreground-subtle hover:text-foreground hover:scale-110 active:scale-95 transition-all"
                aria-label="Close Advertisement"
            >
                <X className="size-4" />
            </button>
            
            {/* Ad Container */}
            <div className="w-full flex items-center justify-center p-2 min-h-[60px]">
                <AdZone 
                    zoneSlug="mobile_bottom_sticky" 
                    postType={postType} 
                    postId={postId}
                    className="w-full max-w-[320px] mx-auto" 
                />
            </div>
        </div>
    );
}
