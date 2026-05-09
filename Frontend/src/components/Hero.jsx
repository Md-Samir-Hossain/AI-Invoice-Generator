import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useAuth } from '@clerk/react';
import { heroStyles } from '../assets/dummyStyles';
import { FaArrowDown, FaArrowRight } from "react-icons/fa6";

const Hero = () => {
    const navigate = useNavigate();
    const clerk = useClerk();
    const { isSignedIn } = useAuth();

    // Navigation and Authentication logic
    const handleSignInPrimary = () => {
        navigate('/app/create-invoice');
    };

    const handleSignOutPrimary = async () => {
        try {
            if (clerk && typeof clerk.openSignUp === 'function') {
                clerk.openSignUp();
            }
        } catch (err) {
            console.error("Failed to open clerk signup model", err);
        }
    };

    // Feature data mapping
    const features = [
        { label: 'AI Powered', description: 'Prompt to invoice', icon: '🤖' },
        { label: 'Professional', description: 'Branded template', icon: '🎨' },
        { label: 'Fast Export', description: 'Download as PDF', icon: '🚀' }
    ];

    // Dummy items for the demo card
    const demoItems = [
        { description: 'Web Design Service', amount: '12,000' },
        { description: 'SEO Optimization', amount: '3,000' },
        { description: 'Domain & Hosting charges', amount: '2,500' },
    ];

    return (
        <section className={heroStyles.section}>
            {/* Background decorative elements */}
            <div className={heroStyles.bgElement1} />
            <div className={heroStyles.bgElement2} />
            <div className={heroStyles.bgElement3} />

            <div className={heroStyles.gridPattern} />
            <div className={heroStyles.container}>
                <div className={heroStyles.grid}>
                    {/* Left Column: Content */}
                    <div className={heroStyles.content}>
                        <div className={heroStyles.contentInner}>
                            <div className={heroStyles.badge}>
                                <div className={heroStyles.badgeDot} />
                                <span className={heroStyles.badgeText}>AI powered invoicing platform</span>
                            </div>

                            <h1 className={heroStyles.heading}>
                                <span className={heroStyles.headingLine1}>Professional</span><br />
                                <span className={heroStyles.headingLine2}>Invoices</span><br />
                                <span className={heroStyles.headingLine3}>in seconds</span>
                            </h1>

                            {/* Description */}
                            <p className={heroStyles.description}>
                                Transform conversations into professional invoices with AI.{" "}
                                <span className={heroStyles.descriptionHighlight}>
                                    Paste any text
                                </span>{" "}
                                and watch AI extract items, calculate totals, and generate ready-to-send invoices instantly.
                            </p>
                        </div>

                        {/* CTA Buttons with Clerk Integration */}
                        <div className={heroStyles.ctaContainer}>
                            {isSignedIn ? (
                                <button onClick={handleSignInPrimary} className={heroStyles.primaryButton}>
                                    <div className={heroStyles.primaryButtonOverlay} />
                                    <span className={heroStyles.primaryButtonText}>Go to Dashboard</span>
                                    <FaArrowRight className={heroStyles.primaryButtonIcon}/>
                                </button>
                            ) : (
                                <button onClick={handleSignOutPrimary} className={heroStyles.primaryButton}>
                                    <div className={heroStyles.primaryButtonOverlay} />
                                    <span className={heroStyles.primaryButtonText}>Start Creating Free</span>
                                    <FaArrowRight className={heroStyles.primaryButtonIcon}/>
                                </button>
                            )}
                            
                            <a href="#features" className={heroStyles.secondaryButton}>
                                <span>Explore Features</span>
                                <FaArrowDown className={heroStyles.secondaryButtonIcon}/>
                            </a>
                        </div>

                        {/* Feature Grid */}
                        <div className={heroStyles.featuresGrid}>
                            {features.map((feature, index) => (
                                <div key={index} className={heroStyles.featureItem}>
                                    <div className={heroStyles.featureIcon}>{feature.icon}</div>
                                    <div className={heroStyles.featureText}>
                                        <div className={heroStyles.featureLabel}>{feature.label}</div>
                                        <div className={heroStyles.featureDesc}>{feature.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Interactive Demo Card */}
                    <div className={heroStyles.demoColumn}>
                        <div className={heroStyles.demoFloating1} />
                        <div className={heroStyles.demoFloating2} />
                        <div className={heroStyles.demoContainer}>
                            <div className={heroStyles.demoCard}>
                                <div className={heroStyles.cardHeader}>
                                    <div className="space-y-1">
                                        <div className={heroStyles.cardLogoContainer}>
                                            <div className={heroStyles.cardLogo}>AI</div>
                                        </div>
                                        <div className={heroStyles.cardClientName}>Design Studios Inc.</div>
                                        <div className={heroStyles.cardClientGst}>GST: 27AAAAA0000A1Z5</div>
                                    </div>
                                    <div className={heroStyles.cardInvoiceInfo}>
                                        <div className={heroStyles.cardInvoiceLabel}>Invoice</div>
                                        <div className={heroStyles.cardInvoiceNumber}>INV-0786</div>
                                        <div className={heroStyles.cardStatus}>Paid</div>
                                    </div>
                                </div>

                                {/* Demo Items Mapping */}
                                <div className={heroStyles.itemsContainer}>
                                    {demoItems.map((item, index) => (
                                        <div key={index} className={heroStyles.itemRow}>
                                            <div className="flex items-center gap-3">
                                                <div className={heroStyles.itemDot} />
                                                <span className={heroStyles.itemDescription}>{item.description}</span>
                                            </div>
                                            <span className={heroStyles.itemAmount}>₹{item.amount}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={heroStyles.calculationContainer}>
                                    <div className={heroStyles.calculationRow}>
                                        <span className={heroStyles.calculationLabel}>
                                            Subtotal
                                        </span>
                                        <span className={heroStyles.calculationValue}>₹17,500</span>
                                    </div>
                                    <div className={heroStyles.calculationRow}>
                                        <span className={heroStyles.calculationLabel}>GST (18%)</span>
                                        <span className={heroStyles.calculationValue}>₹3,150</span>
                                    </div>
                                    <div className={heroStyles.totalRow}>
                                        <span className={heroStyles.totalLabel}>Total Amount</span>
                                        <span className={heroStyles.totalValue}>₹20,650</span>
                                    </div>
                                </div>

                                {/* Subtotal and Actions */}
                                <div className={heroStyles.actionButtons}>
                                    <button className={heroStyles.previewButton}>
                                        <span className={heroStyles.previewButtonText}>Preview</span>
                                    </button>
                                    <button className={heroStyles.sendButton}>
                                        <span className={heroStyles.sendButtonText}>Send Invoice</span>
                                    </button>
                                </div>
                            </div>

                            {/* AI Indicator */}
                            <div className={heroStyles.aiIndicator}>
                                <div className={heroStyles.aiIndicatorContent}>
                                    <div className={heroStyles.aiIndicatorDot} />
                                    <span>AI parsed from: </span>
                                    <span className={heroStyles.aiIndicatorText}>"Invoice for web design - ₹12,000..."</span>
                                </div>
                            </div>
                            <div className={heroStyles.cornerAccent1}></div>
                            <div className={heroStyles.cornerAccent2}></div>
                        </div>
                        <div className={heroStyles.cardBackground} />
                    </div>
                </div>

                {/* Scroll Indicator*/}
                <div className={heroStyles.scrollIndicator}>
                    <div className={heroStyles.scrollContainer}>
                        <span className={heroStyles.scrollText}>Scroll to explore</span>
                        <div className={heroStyles.scrollBar}>
                            <div className={heroStyles.scrollDot} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;