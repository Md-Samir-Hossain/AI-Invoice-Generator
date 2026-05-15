import React from 'react';

// Icons for different invoice statuses
const statusIcons = {
    paid: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    ),
    unpaid: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    overdue: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    draft: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    )
};

// Style configuration for each status
const statusConfig = {
    paid: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        gradient: 'from-green-100',
        icon: 'paid'
    },
    unpaid: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        gradient: 'from-blue-100',
        icon: 'unpaid'
    },
    overdue: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        gradient: 'from-red-100',
        icon: 'overdue'
    },
    draft: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        gradient: 'from-gray-100',
        icon: 'draft'
    },
    default: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        gradient: 'from-gray-100',
        icon: 'draft'
    }
};

// Size variants
const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    default: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
};

const StatusBadge = ({ status = '', size = 'default', showIcon = true }) => {
    const s = (status || '').toLowerCase();

    const statusConfig = {
        paid: {
            bg: "bg-emerald-50/80 backdrop-blur-sm",
            text: "text-emerald-700",
            border: "border-emerald-200",
            icon: "paid",
            gradient: "from-emerald-400 to-green-500",
        },
        unpaid: {
            bg: "bg-amber-50/80 backdrop-blur-sm",
            text: "text-amber-700",
            border: "border-amber-200",
            icon: "unpaid",
            gradient: "from-amber-400 to-orange-500",
        },
        overdue: {
            bg: "bg-rose-50/80 backdrop-blur-sm",
            text: "text-rose-700",
            border: "border-rose-200",
            icon: "overdue",
            gradient: "from-rose-400 to-red-500",
        },
        draft: {
            bg: "bg-gray-50/80 backdrop-blur-sm",
            text: "text-gray-700",
            border: "border-gray-200",
            icon: "draft",
            gradient: "from-gray-400 to-gray-500",
        },
        default: {
            bg: "bg-gray-50/80 backdrop-blur-sm",
            text: "text-gray-700",
            border: "border-gray-200",
            icon: "draft",
            gradient: "from-gray-400 to-gray-500",
        },
    };

    const config = statusConfig[s] || statusConfig.default;
    const IconComponent = statusIcons[config.icon] || statusIcons.draft;
    const sizeClasses = {
        small: "px-2 py-1 text-xs gap-1.5",
        default: "px-3 py-1.5 text-sm gap-2",
        large: "px-4 py-2 text-base gap-2.5",
    };
    // const sizeClass = sizeClasses[size] || sizeClasses.default;

    return (
        <div className={`inline-flex items-center rounded-full font-medium border transition-all duration-300 ease-out hover:scale-105 hover:shadow-sm group relative overflow-hidden ${sizeClasses[size]} ${config.bg} ${config.text} ${config.border}`}>

            {/* Background gradient effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            {showIcon && (
                <div className="relative z-10 flex items-center">
                    <IconComponent className="w-3 h-3" />
                </div>
            )}

            <span className="relative z-10 font-semibold tracking-wide capitalize">
                {s === "default" ? status : s}
            </span>

            {/* Pulse animation for unpaid/overdue status */}
            {(s === 'unpaid' || s === 'overdue') && (
                <div className="relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                </div>
            )}
        </div>
    );
};

/* Helper component to display status with an associated count */

export const StatusWithCount = ({ status, count, size = 'default' }) => (
    <div className="inline-flex items-center gap-2 group">
        <StatusBadge status={status} size={size} />
        {count !== undefined && (
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full group-hover:bg-gray-200 transition-colors duration-200">
                {count}
            </span>
        )}
    </div>
);

export default StatusBadge;