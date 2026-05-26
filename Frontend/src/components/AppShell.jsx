import { useState, useEffect, useRef} from 'react';
import { useNavigate, Outlet, NavLink, Link } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/react';
import { appShellStyles } from '../assets/dummyStyles';
import logo from '../assets/easyInvoice_febicon.png';
import logoWithText from '../assets/easyInvoice_logo.png';
import { LuHouse, LuFileText, LuCirclePlus, LuLogOut } from "react-icons/lu";
import { CgProfile, CgClose, CgMenu } from "react-icons/cg";
import { TbLayoutSidebarLeftExpand, TbLayoutSidebarLeftCollapse } from "react-icons/tb";

// Helper functions for display names and initials
const getDisplayName = (user) => {
  if (!user) return 'User';
  return user.fullName || `${user.firstName} ${user.lastName}`.trim() || 'User';
};

const getFirstName = (user) => {
  if (!user) return '';
  return user.firstName || user.fullName?.split(' ') || '';
};

const getInitials = (user) => {
  if (!user) return '?';
  const first = user.firstName?.charAt(0) || user.fullName?.charAt(0) || '';
  const last = user.lastName?.charAt(0) || (user.fullName?.split(' ').length > 1 ? user.fullName.split(' ').charAt(0) : '');
  return (first + last).toUpperCase();
};

const AppShell = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  const contentRef = useRef(null);
  const prevScrollPos = useRef(0);

  // State management
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Toggle Sidebar Function
  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Logout Function
  const logOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn("Sign out error", err);
    }
    navigate('/');
  };

  // Responsive and Scroll Effects 
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    const handleScroll = () => {
      if (contentRef.current) {
        const currentScrollPos = contentRef.current.scrollTop;
        
        // Update shadow on scroll
        setScrolled(currentScrollPos > 10);
        
        // Hide/show header based on scroll direction
        if (currentScrollPos > prevScrollPos.current) {
          // Scrolling down
          setHeaderVisible(false);
        } else {
          // Scrolling up
          setHeaderVisible(true);
        }
        
        prevScrollPos.current = currentScrollPos;
      }
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Placeholder Icons (Referencing SVGs mentioned in transcript)
  const DashboardIcon = () => <span><LuHouse /></span>;
  const InvoiceIcon = () => <span><LuFileText /></span>;
  const CreateIcon = () => <span><LuCirclePlus /></span>;
  const ProfileIcon = () => <span><CgProfile /></span>;
  const LogoutIcon = () => <span><LuLogOut /></span>;
  const CollapseIcon = ({ isCollapsed }) => <span>{isCollapsed ? <TbLayoutSidebarLeftExpand /> : <TbLayoutSidebarLeftCollapse />}</span>;

  /* ----- SidebarLink ----- */
  const SidebarLink = ({ to, icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        ${appShellStyles.sidebarLink}
        ${collapsed ? appShellStyles.sidebarLinkCollapsed : ""}
        ${
          isActive
            ? appShellStyles.sidebarLinkActive
            : appShellStyles.sidebarLinkInactive
        }
      `}
      onClick={() => setMobileOpen(false)}
    >
      {({ isActive }) => (
        <>
          <div
            className={`${appShellStyles.sidebarIcon} ${
              isActive
                ? appShellStyles.sidebarIconActive
                : appShellStyles.sidebarIconInactive
            }`}
          >
            {icon}
          </div>
          {!collapsed && (
            <span className={appShellStyles.sidebarText}>{children}</span>
          )}
          {!collapsed && isActive && (
            <div className={appShellStyles.sidebarActiveIndicator} />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className={appShellStyles.root}>
      <div className={appShellStyles.layout}>

        {/* Desktop Sidebar */}
        <aside className={`${appShellStyles.sidebar} ${collapsed ? appShellStyles.sidebarCollapsed : appShellStyles.sidebarExpanded}`}>
          <div className={appShellStyles.sidebarGradient} />
          <div className={appShellStyles.sidebarContainer}>
            <div className={`${appShellStyles.logoContainer} ${collapsed ? appShellStyles.logoContainerCollapsed : ''}`}>
              <Link to="/" className={appShellStyles.logoLink}>
                {collapsed ? (
                  <div className="relative">
                    <img src={logo} alt="logo" className={appShellStyles.logoImage} />
                  </div>
                ) : (
                  <div className="relative">
                    <img src={logoWithText} alt="logo" className={appShellStyles.logoWithTextImage} />
                  </div>
                )}
              </Link>

              {!collapsed && (
                <button onClick={toggleSidebar} className={appShellStyles.collapseButton}>
                  <CollapseIcon isCollapsed={collapsed} />
                </button>
              )}
            </div>

            {/* Navigation Links */}
            <nav className={appShellStyles.nav}>
              <SidebarLink to="/app/dashboard" icon={<DashboardIcon/>}>
                Dashboard
              </SidebarLink>
              <SidebarLink to="/app/invoices" icon={<InvoiceIcon/>}>
                Invoices
              </SidebarLink>
              <SidebarLink to="/app/create-invoice" icon={<CreateIcon/>}>
                Create Invoice
              </SidebarLink>
              <SidebarLink to="/app/business" icon={<ProfileIcon/>}>
                Business Profile
              </SidebarLink>
            </nav>

            {/* Sidebar Footer / Logout */}
            <div className={appShellStyles.userSection}>
              <div className={`${appShellStyles.userDivider} 
                ${collapsed ? appShellStyles.userDividerCollapsed : appShellStyles.userDividerExpanded}`} 
              />
              {!collapsed ? (
                  <button onClick={logOut} className={appShellStyles.logoutButton}>
                    <LogoutIcon className={appShellStyles.logoutIcon}/>
                    <span className='whitespace-nowrap'>Log out</span>
                  </button>
                ):(
                  <button onClick={logOut} className="w-full flex items-center justify-center p-3 rounded-xl cursor-pointer text-red-600 hover:bg-red-50 hover:shadow-md transition-all duration-300">
                    <LogoutIcon className="w-5 h-5 hover:scale-110 transition-transform" /> 
                  </button>
                )
              }
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className={appShellStyles.mobileOverlay}>
            <div className={appShellStyles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
            <div className={appShellStyles.mobileSidebar}>
              <div className={appShellStyles.mobileHeader}>
                <Link to="/" className={appShellStyles.mobileLogoLink} onClick={() => setMobileOpen(false)}>
                  <img src={logoWithText} alt="logo" className={appShellStyles.mobileLogoWithTextImage} />
                </Link>
                <button onClick={() => setMobileOpen(false)} className={appShellStyles.mobileCloseButton}>
                  <CgClose/>
                </button>
              </div>
              
              {/* Mobile Nav Links */}
              <nav className={appShellStyles.mobileNav}>
                <NavLink
                  onClick={() => setMobileOpen(false)}
                  to="/app/dashboard"
                  className={({ isActive }) =>
                    `${appShellStyles.mobileNavLink} ${
                      isActive
                        ? appShellStyles.mobileNavLinkActive
                        : appShellStyles.mobileNavLinkInactive
                    }`
                  }
                >
                  <DashboardIcon /> Dashboard
                </NavLink>
                <NavLink
                  onClick={() => setMobileOpen(false)}
                  to="/app/invoices"
                  className={({ isActive }) =>
                    `${appShellStyles.mobileNavLink} ${
                      isActive
                        ? appShellStyles.mobileNavLinkActive
                        : appShellStyles.mobileNavLinkInactive
                    }`
                  }
                >
                  <InvoiceIcon /> Invoices
                </NavLink>
                <NavLink
                  onClick={() => setMobileOpen(false)}
                  to="/app/create-invoice"
                  className={({ isActive }) =>
                    `${appShellStyles.mobileNavLink} ${
                      isActive
                        ? appShellStyles.mobileNavLinkActive
                        : appShellStyles.mobileNavLinkInactive
                    }`
                  }
                >
                  <CreateIcon /> Create Invoice
                </NavLink>
                <NavLink
                  onClick={() => setMobileOpen(false)}
                  to="/app/business"
                  className={({ isActive }) =>
                    `${appShellStyles.mobileNavLink} ${
                      isActive
                        ? appShellStyles.mobileNavLinkActive
                        : appShellStyles.mobileNavLinkInactive
                    }`
                  }
                >
                  <ProfileIcon /> Business Profile
                </NavLink>
              </nav>

              <div className={appShellStyles.mobileLogoutSection}>
                <button onClick={() => {
                    logOut();
                    setMobileOpen(false)
                  }} 
                  className={appShellStyles.mobileLogoutButton}
                >
                  <LogoutIcon /> Log out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto" ref={contentRef}>
          <header className={`${appShellStyles.header} ${scrolled ? appShellStyles.headerScrolled : appShellStyles.headerNotScrolled} ${headerVisible ? appShellStyles.headerVisible : appShellStyles.headerHidden}`}>
            <div className={appShellStyles.headerTopSection}>
              <div className={appShellStyles.headerContent}>
                {/* Mobile Menu Toggle */}
                <button onClick={() => setMobileOpen(true)} className={appShellStyles.mobileMenuButton}><CgMenu /></button>

                {/* Desktop Collapse Toggle */}
                {!isMobile && collapsed &&(
                  <button onClick={toggleSidebar} className={appShellStyles.desktopCollapseButton}>
                    <CollapseIcon isCollapsed={collapsed} />
                  </button>
                )}

                {/* Welcome Section */}
                <div className={appShellStyles.welcomeContainer}>
                  <h2 className={appShellStyles.welcomeTitle}>
                    Welcome back, <span className={appShellStyles.welcomeName}>{getFirstName(user)}</span>
                  </h2>
                  <p className={appShellStyles.welcomeSubtitle}>Ready to create amazing invoices?</p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className={appShellStyles.headerActions}>
              <button onClick={() => navigate('/app/create-invoice')} className={appShellStyles.ctaButton}>
                <CreateIcon className={appShellStyles.ctaIcon} />
                <span className='sm:hidden'>Create Invoice</span>
                <span className='hidden sm:inline'>Create</span>
              </button>

              {/* User Avatar Section */}
              <div className={appShellStyles.userSectionDesktop}>
                <div className={appShellStyles.userInfo}>
                  <div className={appShellStyles.userName}>{getDisplayName(user)}</div>
                  <div className={appShellStyles.userEmail}>{user?.primaryEmailAddress?.emailAddress}</div>
                </div>
                
                <div className={appShellStyles.userAvatarContainer}>
                  <div className={appShellStyles.userAvatar}>
                    {getInitials(user)}
                    <div className={appShellStyles.userAvatarBorder} />
                  </div>
                  <div className={appShellStyles.userStatus}></div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className={appShellStyles.main}>
            <div className={appShellStyles.mainContainer}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;