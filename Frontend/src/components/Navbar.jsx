import React, { useCallback, useEffect, useRef, useState } from 'react'
import { navbarStyles } from '../assets/dummyStyles'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/easyInvoice_logo2.png'
import { useClerk, useUser, useAuth } from '@clerk/react'
import { FaArrowRight } from "react-icons/fa6";


const Navbar = () => {

    const [open, setOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    const { user } = useUser();
    const { getToken, isSignedIn } = useAuth();
    const clerk = useClerk();

    const navigate = useNavigate()
    const profileRef = useRef(null)
    const TOKEN_KEY = "token"

    // For token generation
    const fetchAndStoreToken = useCallback(async () => {
        try {
            if (!getToken || typeof (getToken) !== "function") {
                return null;
            }
            const token = await getToken().catch(() => null);

            if (token) {
                try {
                    localStorage.setItem(TOKEN_KEY, token);
                    console.log(token)
                } catch (err) {
                    // Ignore any errors
                }
                return token;
            } else {
                return null;
            }
        } catch (err) {
            console.error("fetchAndStoreToken failed:", err)
            return null;
        }
    }, [getToken])

    // Keep the localstorage token in sync with clerk auth state
    useEffect(() => {
        let mounted = true;

        const updateToken = async () => {
            if (isSignedIn) {
                const t = await fetchAndStoreToken({ tamplate: "default" }).catch(
                    () => null
                );
                if (!t && mounted) {
                    await fetchAndStoreToken({ forceRefresh: true }).catch(() => null);
                }
            } else {
                try {
                    localStorage.removeItem(TOKEN_KEY);
                } catch (err) {
                    // Ignore any errors
                }
            }
        }
        updateToken();
        return () => { mounted = false }
    }, [isSignedIn, fetchAndStoreToken, user])

    // After successful login redirect to dashboard
    useEffect(() => {
        if(isSignedIn){
            const pathname = window.location.pathname || "/";
            if (
                pathname === '/login' ||
                pathname === '/signup' ||
                pathname.startsWith('/auth') ||
                pathname === '/'
            ) {
                navigate("/app/dashboard", { replace: true })
            } 
        }
    })

    // Close profile popover on outside click
    useEffect(() => {
        function onDocClick(e) {
            if (!profileRef.current) return;
            if (!profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        }
        if (profileOpen) {
            document.addEventListener("mousedown", onDocClick);
            document.addEventListener("touchstart", onDocClick);
        }
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("touchstart", onDocClick);
        };
    }, [profileOpen]);

    // To open login modal
    const openSignIn = () => {
        try {
            if (clerk && typeof (openSignIn) === "function") {
                clerk.openSignIn();
            } else {
                navigate('/login')
            }
        } catch (err) {
            console.error("openSignIn failed:", err)
            navigate("/login")
        }
    }
    // To open sign up modal
    const openSignUp = () => {
        try {
            if (clerk && typeof (openSignUp) === "function") {
                clerk.openSignUp();
            } else {
                navigate('/signup')
            }
        } catch (err) {
            console.error("openSignUp failed:", err)
            navigate("/signup")
        }
    }

    return (
        <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                <nav className={navbarStyles.nav}>
                    <div className={navbarStyles.logoSection}>
                        <Link to="/" className={navbarStyles.logoLink}>
                            <img src={logo} alt="logo" className="h-16" />
                            {/* <span className={navbarStyles.logoText}>InvoiceAi</span> */}
                        </Link>
                        <div className={navbarStyles.desktopNav}>
                            <a href="#features" className={navbarStyles.navLink}>Features</a>
                            <a href="#pricing" className={navbarStyles.navLinkInactive}>Pricing</a>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className={navbarStyles.authSection}>
                            {!isSignedIn && (
                                <div>
                                    <button
                                        onClick={openSignIn}
                                        className={navbarStyles.signInButton}
                                        type='button'
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={openSignUp}
                                        className={navbarStyles.signUpButton}
                                        type='button'
                                    >
                                        <div className={navbarStyles.signUpOverlay}></div>
                                        <span className={navbarStyles.signUpText}>Get Started</span>
                                        <FaArrowRight className={navbarStyles.signUpIcon} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Mobile toggle */}
                        <button onClick={() => setOpen(!open)} className={navbarStyles.mobileMenuButton}>
                            <div className={navbarStyles.mobileMenuIcon}>
                                <span className={`${navbarStyles.mobileMenuLine1} ${open ? navbarStyles.mobileMenuLine1Open : navbarStyles.mobileMenuLine1Closed
                                    }`}>
                                </span>
                                <span className={`${navbarStyles.mobileMenuLine2} ${open ? navbarStyles.mobileMenuLine2Open : navbarStyles.mobileMenuLine2Closed
                                    }`}>
                                </span>
                                <span className={`${navbarStyles.mobileMenuLine3} ${open ? navbarStyles.mobileMenuLine3Open : navbarStyles.mobileMenuLine3Closed
                                    }`}>
                                </span>
                            </div>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            <div className={`${navbarStyles.mobileMenu} ${open ? "block" : "hidden"}`}>
                <div className={navbarStyles.mobileMenuContainer}>
                    <a href="#features" className={navbarStyles.mobileNavLink}>Features</a>
                    <a href="#pricing" className={navbarStyles.mobileNavLink}>Pricing</a>

                    <div className={navbarStyles.mobileAuthSection}>
                        {!isSignedIn && (
                            <div>
                                <button
                                    onClick={openSignIn}
                                    className={navbarStyles.mobileSignIn}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={openSignUp}
                                    className={navbarStyles.mobileSignUp}
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar