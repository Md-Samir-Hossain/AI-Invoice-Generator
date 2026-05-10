import {featuresStyles} from '../assets/dummyStyles';
import { MdKeyboardDoubleArrowRight, MdKeyboardArrowRight} from "react-icons/md";
import { IoBusinessOutline, IoSparklesOutline } from "react-icons/io5";
import { FaRegFilePdf} from "react-icons/fa";



// Internal helper component for individual feature cards
const FeatureCard = ({ title, description, icon }) => (
    <div className={featuresStyles.featureCard} >
        <div className={featuresStyles.featureCardGradient} />
        <div className={featuresStyles.featureCardBorder} />
        <div className={featuresStyles.featureCardContent}>
            <div className={featuresStyles.featureCardIconContainer}>
                {icon}
            </div>
            <div className={featuresStyles.featureCardTextContainer}>
                <h4 className={featuresStyles.featureCardTitle}>{title}</h4>
                <p className={featuresStyles.featureCardDescription}>{description}</p>

                {/* Subtle CTA indicator */}
                <div className={featuresStyles.featureCardCta}>
                    <span className={featuresStyles.featureCardCtaText}>Learn more</span>
                    <MdKeyboardDoubleArrowRight className={featuresStyles.featureCardCtaIcon}/>
                </div>
            </div>
        </div>
    </div>
);

const Features = () => {
    // Feature data to be mapped into cards
    const features = [
        {
            title: "AI Generation",
            description: "Create professional invoices instantly using advanced AI text parsing.",
            icon: <IoSparklesOutline />

        },
        {
            title: "Business Branding",
            description: "Set up your profile once and reuse your logo, stamp, and signature.",
            icon: <IoBusinessOutline/>
        },
        {
            title: "Professional Export",
            description: "Download, print, or share your invoices with professional formatting.",
            icon: <FaRegFilePdf />
        }
    ];

    return (
        <section id="features" className={featuresStyles.section}> 
            {/* Background decorative elements */}
            <div className={featuresStyles.backgroundBlob1} />
            <div className={featuresStyles.backgroundBlob2} />
            <div className={featuresStyles.backgroundBlob3} />

            <div className={featuresStyles.container}>
                <div className={featuresStyles.headerContainer}>
                    <div className={featuresStyles.badge}>
                        <span className={featuresStyles.badgeDot} />
                        <span className={featuresStyles.badgeText}>Powerful Features</span>
                    </div>

                    <h2 className={featuresStyles.title}>
                        Built for{" "}<span className={featuresStyles.titleGradient}>speed and clarity</span>
                    </h2>

                    <p className={featuresStyles.subtitle}>
                        A minimal intelligent interface that focuses on what truly matters. 
                        Create, send, and track invoices effortlessly while maintaining 
                        professionalism and excellence.
                    </p>
                </div>

                {/* Feature Grid mapping */}
                <div className={featuresStyles.featuresGrid}>
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={feature.title}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                        />
                    ))}
                </div>

                {/* Bottom CTA Section */}
                <div className={featuresStyles.bottomCtaContainer}>
                    <button className={featuresStyles.bottomCtaButton}>
                        <span className={featuresStyles.bottomCtaButtonText}>Explore All Features</span>
                        <MdKeyboardArrowRight className={featuresStyles.bottomCtaButtonIcon}/>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Features;