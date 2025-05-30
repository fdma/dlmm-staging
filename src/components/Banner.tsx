"use client";

import Image from 'next/image';
import styles from './Banner.module.css';

const Banner = () => {
    const handleExploreClick = () => {
        const poolsSection = document.querySelector('section');
        if (poolsSection) {
            const offset = poolsSection.offsetTop;
            
            window.scrollTo({
                top: offset - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={styles.bannerWrapper}>
            <div className={styles.bannerContainer}>
                <div className={styles.bannerText}>
                    <h1 className={styles.bannerH1}>
                        Uncover Alpha Pools on Meteora
                    </h1>
                    <button 
                        className={styles.bannerBtn}
                        onClick={handleExploreClick}
                    >
                        <span>Explore Pools</span>
                    </button>
                </div>
                <div className={styles.bannerImg}>
                    <Image
                        src="/images/artwork.svg"
                        alt="banner"
                        width={800}
                        height={800}
                        priority
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Banner; 