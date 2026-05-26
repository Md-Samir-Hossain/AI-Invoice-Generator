import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { dashboardStyles } from '../assets/dummyStyles';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import { FiEye, FiFileText, FiPlus } from 'react-icons/fi';
import { GoPerson } from "react-icons/go";

// Backend URL constant
const API_BASE = "https://easyinvoice-7bg3.onrender.com";

/* normalize client object */
function normalizeClient(raw) {
    if (!raw) return { name: "", email: "", address: "", phone: "" };
    if (typeof raw === "string")
        return { name: raw, email: "", address: "", phone: "" };
    if (typeof raw === "object") {
        return {
            name: raw.name ?? raw.company ?? raw.client ?? "",
            email: raw.email ?? raw.emailAddress ?? "",
            address: raw.address ?? "",
            phone: raw.phone ?? raw.contact ?? "",
        };
    }
    return { name: "", email: "", address: "", phone: "" };
}

function formatCurrency(amount = 0, currency = "INR") {
    try {
        const n = Number(amount || 0);
        if (currency === "INR")
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(n);
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
        }).format(n);
    } catch {
        return `${currency} ${amount}`;
    }
}


/* small helpers */
function capitalize(s) {
  if (!s) return s;
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

/* ---------- date formatting helper: DD/MM/YYYY ---------- */
function formatDate(dateInput) {
    if (!dateInput) return "—";
    const d = dateInput instanceof Date ? dateInput : new Date(String(dateInput));
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

// Helper Functions
const getClientName = (invoice) => {
    if (!invoice || !invoice.client) return 'Unknown Client';
    return invoice.client.name || 'Unknown Client';
};


const Dashboard = () => {
    const navigate = useNavigate();
    const { getToken, isSignedIn } = useAuth();

    const [storedInvoices, setStoredInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [businessProfile, setBusinessProfile] = useState(null);

    const obtainToken = useCallback(async () => {
        if (typeof getToken !== "function") return null;
        try {
            let token = await getToken({ template: "default" }).catch(() => null);
            if (!token) {
                token = await getToken({ forceRefresh: true }).catch(() => null);
            }
            return token;
        } catch {
            return null;
        }
    }, [getToken]);

    // Fetch Invoices from backend
    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await obtainToken();
            const headers = { Accept: 'application/json'};
            if(token) headers["Authorization"] = `Bearer ${token}`;
            const response = await fetch(`${API_BASE}/api/invoice`, {
                method: 'GET',
                headers
            });
            const json = await response.json().catch(() => null);

            /* ---------- Component (fetch from backend) ---------- */
            if (response.status === 401) {
                // unauthorized - prompt login
                setError("Unauthorized. Please sign in.");
                setStoredInvoices([]);
                return;
            }

            if (!response.ok) {
                const msg = json?.message || `Failed to fetch (${response.status})`;
                throw new Error(msg);
            }

            const raw = json?.data || [];
            const mapped = (Array.isArray(raw) ? raw : []).map((inv) => {
                const clientObj = inv.client ?? {};
                const amountVal = Number(inv.total ?? inv.amount ?? 0);
                const currency = (inv.currency || "INR").toUpperCase();

                return {
                    ...inv,
                    id: inv.invoiceNumber || inv._id || String(inv._id || ""),
                    client: clientObj,
                    amount: amountVal,
                    currency,
                    // keep status normalized
                    status:
                        typeof inv.status === "string"
                            ? capitalize(inv.status)
                            : inv.status || "Draft",
                };
            });
            setStoredInvoices(mapped);
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
            setError(err?.message || "Failed to load invoices");
            setStoredInvoices([]);
        }
        finally {
            setLoading(false);
        }
    }, [obtainToken]);

    // Fetch user Profile
    const fetchBusinessProfile = useCallback(async () => {
        try {
            const token = await obtainToken();
            if (!token) return;
            const response = await fetch(`${API_BASE}/api/business-profile/me`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            if (response.status === 401) {
                // silently ignore; profile not available
                return;
            }
            if (!response.ok) return;
            const json = await response.json().catch(() => null);
            const data = json?.data || null;
            if (data) setBusinessProfile(data);
        } catch (err) {
            // non-fatal
            console.warn("Failed to fetch business profile:", err);
        }
    }, [obtainToken]);

    useEffect(() => {
        if (isSignedIn) {
            fetchInvoices();
            fetchBusinessProfile();

            function onStorage(e) {
                if (e.key === "invoice_v1") {
                    fetchInvoices();
                }
            }
            window.addEventListener("storage", onStorage);
            return () => window.removeEventListener("storage", onStorage);
        }
    }, [isSignedIn, fetchInvoices, fetchBusinessProfile]);

    // 1 USD = INR 
    const HARD_RATES = {
        USD_TO_INR: 95,
    };

    function convertToINR(amount = 0, currency = "INR") {
        const n = Number(amount || 0);
        const curr = String(currency || "INR")
            .trim()
            .toUpperCase();

        if (curr === "INR") return n;
        if (curr === "USD") return n * HARD_RATES.USD_TO_INR;
        return n;
    }

    // Kpi Calculations with percentage (convert each invoice to inr before summariging)
    const Kpis = useMemo(() => {
        const totalInvoices = storedInvoices.length;
        let totalPaid = 0;
        let totalUnpaid = 0;
        let paidCount = 0;
        let unpaidCount = 0;

        storedInvoices.forEach((inv) => {
            const rawAmount =
                typeof inv.amount === "number"
                    ? inv.amount
                    : Number(inv.total ?? inv.amount ?? 0);
            const invCurrency = inv.currency || "INR";
            const amtInINR = convertToINR(rawAmount, invCurrency);

            if (inv.status === "Paid") {
                totalPaid += amtInINR;
                paidCount++;
            }
            if (inv.status === "Unpaid" || inv.status === "Overdue") {
                totalUnpaid += amtInINR;
                unpaidCount++;
            }
        });

        const totalAmount = totalPaid + totalUnpaid;
        const paidPercentage =
            totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
        const unpaidPercentage =
            totalAmount > 0 ? (totalUnpaid / totalAmount) * 100 : 0;

        return {
            totalInvoices,
            totalPaid,
            totalUnpaid,
            paidCount,
            unpaidCount,
            paidPercentage,
            unpaidPercentage,
        };
    }, [storedInvoices]);

    // Recent invoices  (latest 5 invoices)
    const recent = useMemo(() => {
        return storedInvoices
            .slice()
            .sort(
                (a, b) =>
                    (Date.parse(b.issueDate || 0) || 0) -
                    (Date.parse(a.issueDate || 0) || 0)
            )
            .slice(0, 5);
    }, [storedInvoices]);

    const getClientName = (inv) => {
        if (!inv) return "";
        if (typeof inv.client === "string") return inv.client;
        if (typeof inv.client === "object")
            return inv.client?.name || inv.client?.company || inv.company || "";
        return inv.company || "Client";
    };

    // Get client first letter
    const getClientInitial = (inv) => {
        const clientName = getClientName(inv);
        return clientName ? clientName.charAt(0).toUpperCase() : "C";
    };

    // navigate to invoice preview
    function openInvoice(invRow) {
        const payload = invRow;
        navigate(`/app/invoices/${invRow.id}`, { state: { invoice: payload } });
    }


    return (
        <div className={dashboardStyles.pageContainer}>
            <div className={dashboardStyles.headerContainer}>
                <h1 className={dashboardStyles.headerTitle}>Dashboard Overview</h1>
                <p className={dashboardStyles.headerSubtitle}>Track your invoicing performance and business insights.</p>
            </div>

            {loading ? (
                <div className="p-6">Loading invoices...</div>
            ) : error ? (
                <div className="p-6">
                    <div className="p-6 text-red-600">{error}</div>
                    <div className="flex gap-2">
                        <button onClick={fetchInvoices} className="bg-blue-600 text-white px-3 py-1 rounded">
                            Retry
                        </button>
                        {String(error).includes('unauthorized') &&
                            <button onClick={() => navigate("/login")} 
                                className="bg-gray-700 text-white px-3 py-1 rounded"
                            >
                                Sign In
                            </button>
                        }
                    </div>
                </div>
            ) : null}

            {/* Kpi Grid */}
            <div className={dashboardStyles.kpiGrid}>
                <KpiCard
                    title="Total Invoices"
                    value={Kpis.totalInvoices}
                    hint="Active invoices"
                    iconType="document"
                    trend={8.5}
                />
                <KpiCard
                    title="Total Paid"
                    value={formatCurrency(Kpis.totalPaid, "INR")}
                    hint="Received amount (INR)"
                    iconType="revenue"
                    trend={12.2}
                />
                <KpiCard
                    title="Total Unpaid"
                    value={formatCurrency(Kpis.totalUnpaid, "INR")}
                    hint="Outstanding balance (INR)"
                    iconType="clock"
                    trend={-3.1}
                />
            </div>

            <div className={dashboardStyles.mainGrid}>
                {/* Sidebar Column: Quick Stats & Actions */}
                <div className={dashboardStyles.sidebarColumn}>
                    <div className={dashboardStyles.quickStatsCard}>
                        <h3 className={dashboardStyles.quickStatsTitle}>Quick Stats</h3>
                        <div className="space-y-3">
                            <div className={dashboardStyles.quickStatsRow}>
                                <span className={dashboardStyles.quickStatsLabel}>Paid Rate</span>
                                <span className={dashboardStyles.quickStatsValue}>
                                    {Kpis.totalInvoices > 0
                                        ? ((Kpis.paidCount / Kpis.totalInvoices) * 100).toFixed(1)
                                        : 0} %
                                </span>
                            </div>
                            <div className={dashboardStyles.quickStatsRow}>
                                <span className={dashboardStyles.quickStatsLabel}>Avg. Invoice</span>
                                <span className={dashboardStyles.quickStatsValue}>
                                    {formatCurrency(
                                        Kpis.totalInvoices > 0
                                            ? (Kpis.totalPaid + Kpis.totalUnpaid) / Kpis.totalInvoices
                                            : 0, "INR"
                                    )}
                                </span>
                            </div>

                            <div className={dashboardStyles.quickStatsRow}>
                                <span className={dashboardStyles.quickStatsLabel}>Collection Eff.</span>
                                <span className={dashboardStyles.quickStatsValue}>
                                    {Kpis.paidPercentage.toFixed(1) + "%"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={dashboardStyles.cardContainer}>
                        <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div className={dashboardStyles.quickActionsContainer}>
                                <button
                                    onClick={() => navigate("/app/create-invoice")}
                                    className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionBlue}`}
                                >
                                    <div
                                        className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconBlue}`}
                                    >
                                        <FiPlus className="w-4 h-4"/>
                                    </div>
                                    <span className={dashboardStyles.quickActionText}>Create Invoice</span>
                                </button>

                                <button
                                    onClick={() => navigate("/app/invoices")}
                                    className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionGray}`}
                                >
                                    <div
                                        className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconGray}`}
                                    >
                                        <FiFileText className="w-4 h-4" />
                                    </div>
                                    <span className={dashboardStyles.quickActionText}>All Invoices</span>
                                </button>

                                <button
                                    onClick={() => navigate("/app/business")}
                                    className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionGray}`}
                                >
                                    <div
                                        className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconGray}`}
                                    >
                                        <GoPerson className="w-4 h-4"/>
                                    </div>
                                    <span className={dashboardStyles.quickActionText}>Business Profile</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Invoices Table */}
                <div className={dashboardStyles.contentColumn}>
                    <div className={dashboardStyles.cardContainerOverflow}>
                        <div className={dashboardStyles.tableHeader}>
                            <div className={dashboardStyles.tableHeaderContent}>
                                <div>
                                    <h3 className={dashboardStyles.tableTitle}>Recent Invoices</h3>
                                    <p className={dashboardStyles.tableSubtitle}>Here are the latest invoices</p>
                                </div>
                                <button onClick={() => navigate('/app/invoices')} className={dashboardStyles.tableActionButton}>View All</button>
                            </div>
                        </div>

                        <div className={dashboardStyles.tableContainer}>
                            <table className={dashboardStyles.table}>
                                <thead>
                                    <tr className={dashboardStyles.tableHead}>
                                        <th className={dashboardStyles.tableHeaderCell}>Client & ID</th>
                                        <th className={dashboardStyles.tableHeaderCell}>Amount</th>
                                        <th className={dashboardStyles.tableHeaderCell}>Status</th>
                                        <th className={dashboardStyles.tableHeaderCell}>Due Date</th>
                                        <th className={dashboardStyles.tableHeaderCell}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={dashboardStyles.tableBody}>
                                    {recent.length > 0 && recent.map((inv) => {
                                        const clientName = getClientName(inv);
                                        const clientInitials = getClientInitial(inv);

                                        return (
                                            <tr key={inv.id} className={dashboardStyles.tableRow} onClick={() => openInvoice(inv)}>
                                                <td className={dashboardStyles.tableCell}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={dashboardStyles.clientAvatar}>{clientInitials}</div>
                                                        <div>
                                                            <div className={dashboardStyles.clientInfo}>{clientName}</div>
                                                            <div className={dashboardStyles.clientSubInfo}>{inv.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={dashboardStyles.tableCell}>
                                                    <div className={dashboardStyles.amountCell}>{formatCurrency(inv.amount, inv.currency)}</div>
                                                </td>
                                                <td className={dashboardStyles.tableCell}>
                                                    <StatusBadge status={inv.status} size="default" showIcon={true} />
                                                </td>
                                                <td className={dashboardStyles.tableCell}>
                                                    <div className={dashboardStyles.dateCell}>
                                                        {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                                                    </div>
                                                </td>
                                                <td className={dashboardStyles.tableCell}>
                                                    <div className='text-right'>
                                                        <button className={dashboardStyles.actionButton}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openInvoice(inv);
                                                            }}
                                                        >
                                                            <FiEye className='w-4 h-4 group-hover/btn:scale-110 transition-transform'/>
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* If no invoice */}
                                    {recent.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="5" className={dashboardStyles.emptyState}>
                                                <div className={dashboardStyles.emptyStateText}>
                                                    <FiFileText className={dashboardStyles.emptyStateIcon} />
                                                    <div className={dashboardStyles.emptyStateMessage}>No invoices yet.</div>
                                                    <button onClick={() => navigate('/app/create-invoice')} className={dashboardStyles.emptyStateAction}>Create your first invoice</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;