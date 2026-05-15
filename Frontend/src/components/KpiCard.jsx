import React from 'react';
import { kpiCardStyles } from '../assets/dummyStyles';
import { FiFileText, FiClock, FiTrendingUp, FiGrid, FiInfo } from "react-icons/fi";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

// Metric Icons 
const MetricIcons = {
    default: () => (
        <FiGrid className='text-white w-5 h-5' />
    ),
    revenue: () => (
        <HiOutlineCurrencyRupee className="text-white w-5 h-5" />
    ),
    growth: () => (
        <FiTrendingUp className='text-white w-5 h-5' />
    ),
    document: () => (
        <FiFileText className='text-white w-5 h-5' />
    ),
    clock: () => (
        <FiClock className='text-white w-5 h-5' />
    ),
};

const KpiCard = ({ title, value, hint, iconType = "default", trend, className = "" }) => {
    // Determine which icon component to render
    const IconComponent = MetricIcons[iconType] || MetricIcons.default;

    // Helper to determine trend badge styling
    const getTrendColor = (trendValue) => {
        if (trendValue > 0) return kpiCardStyles.trendBadgePositive;
        if (trendValue < 0) return kpiCardStyles.trendBadgeNegative;
        return kpiCardStyles.trendBadgeNeutral;
    };

    // Helper to determine icon background/color
    const getIconColor = (type) => {
        return kpiCardStyles.iconColors[type] || kpiCardStyles.iconColors.default;
    };

    return (
        <div className={`${kpiCardStyles.cardContainer} ${className}`}>
            {/* Background Decorative Animation */}
            <div className={kpiCardStyles.animatedBackground} />

            <div className={kpiCardStyles.content}>
                <div className={kpiCardStyles.headerContainer}>
                    <div className={kpiCardStyles.mainContent}>
                        <div className={kpiCardStyles.iconTrendContainer}>
                            {/* Icon Container with dynamic color */}
                            <div className={`${kpiCardStyles.iconContainer} ${getIconColor(iconType)}`}>
                                <IconComponent className={kpiCardStyles.icon} />
                            </div>

                            {/* Trend Badge (only if trend is provided)*/}
                            {trend !== undefined && (
                                <div className={`${kpiCardStyles.trendBadge} ${getTrendColor(trend)}`}>
                                    <FiTrendingUp
                                        className={`${kpiCardStyles.trendIcon} ${trend < 0 ? kpiCardStyles.trendIconNegative : ""}`}
                                    />
                                    <span>{Math.abs(trend)}%</span>
                                </div>
                            )}
                        </div>

                        {/* Metric Text Information */}
                        <div className={kpiCardStyles.textContent}>
                            <div className={kpiCardStyles.title}>{title}</div>
                            <div className={kpiCardStyles.value}>{value}</div>
                            {hint && (
                                <div className={kpiCardStyles.hint}>
                                    <FiInfo className={kpiCardStyles.hintIcon}/>
                                    <span>{hint}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className={kpiCardStyles.cornerAccent} />
        </div>
    );
};

export default KpiCard;