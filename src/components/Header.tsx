import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Globe, LogOut, LayoutDashboard, Shield, Users, X, LogIn, UserPlus2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";

const Header = ({ hidelogo = false }: { hidelogo?: boolean }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, isTeamMember, isSupervisee, isStaff, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const serviceSubLinks = [
    { label: t.nav.education, path: "/education" },
    { label: t.nav.therapy, path: "/therapy" },
    { label: t.nav.families, path: "/families" },
    { label: t.nav.organisations, path: "/organisations" },
    { label: t.nav.supervision, path: "/supervision" },
  ];

  const navLinks = [
    { label: t.nav.services, path: "/services", children: serviceSubLinks },
    { label: "Courses", path: "/courses" },
    { label: "Insights", path: "/insights" },
    { label: (t as any).about?.tagline || "About Us", path: "/about" },
  ];

  const portalEntries = [
    { label: "Client Portal", path: "/portal", desc: "Sessions, tasks & resources", icon: LayoutDashboard },
    { label: "Therapist Portal", path: "/staff", desc: "Clinical tools & client management", icon: Users },
    { label: "Supervisee Portal", path: "/supervisee", desc: "Case logs & supervision", icon: Shield },
  ];

  const portalT = (t as any).portal || {};
  const toggleLanguage = () => setLanguage(language === "en" ? "he" : "en");

  const getPortalLinks = () => {
    if (isAdmin) return [
      { path: "/admin", label: "Admin", icon: Shield },
      { path: "/staff", label: "Therapist", icon: Users },
    ];
    if (isTeamMember) return [
      { path: "/staff", label: "Therapist Portal", icon: Users },
    ];
    if (isSupervisee) return [
      { path: "/supervisee", label: "Supervisee Portal", icon: LayoutDashboard },
    ];
    return [
      { path: "/portal", label: portalT.portal || "Portal", icon: LayoutDashboard },
    ];
  };

  const portalLinks = getPortalLinks();
  const currentPortal = portalLinks.find(p => location.pathname.startsWith(p.path)) || portalLinks[0];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "glass shadow-apple"
        : "bg-background/60 backdrop-blur-md"
    }`}>
      <div className={`container flex items-center justify-between transition-all duration-500 ${scrolled ? "h-20 md:h-24" : "h-24 md:h-32"}`}>
        <Link
          to="/"
          className={`flex items-center gap-3 rounded-full transition-all duration-500 ${
            hidelogo
              ? "pointer-events-none scale-90 bg-transparent p-0 opacity-0 shadow-none ring-0"
              : "bg-card/85 p-1.5 opacity-100 shadow-soft ring-1 ring-border/50 backdrop-blur-sm dark:bg-primary/95 dark:ring-primary/20"
          }`}
        >
          <img
            alt="Binyan"
            loading="eager"
            decoding="async"
            width={320}
            height={320}
            className={`transition-all duration-500 [image-rendering:auto] ${hidelogo ? "opacity-0 scale-90" : "opacity-100 scale-100"} ${scrolled ? "h-16 md:h-20" : "h-20 md:h-28"} w-auto`}
            src="/lovable-uploads/binyan-adam-logo.png"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Portals dropdown — visible to all visitors */}
          {!user && (
            <div className="relative group">
              <button
                className={`px-4 py-2 text-[13px] font-medium tracking-tight transition-colors duration-300 inline-flex items-center gap-1.5 rounded-full text-muted-foreground hover:text-foreground`}
              >
                Portals
                <svg className="w-3 h-3 opacity-40 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                <div className="glass rounded-2xl py-2 min-w-[240px] shadow-apple-lg">
                  {portalEntries.map((p) => (
                    <Link
                      key={p.path}
                      to={p.path}
                      className="flex items-start gap-3 px-4 py-3 mx-1 rounded-xl transition-all duration-200 hover:bg-accent group/item"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <p.icon size={13} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground leading-none">{p.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{p.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {navLinks.map((link) =>
            link.children ? (
              <div key={link.path} className="relative group">
                <Link
                  to={link.path}
                  className={`px-4 py-2 text-[13px] font-medium tracking-tight transition-colors duration-300 inline-flex items-center gap-1.5 rounded-full
                    ${[link.path, ...link.children.map(c => c.path)].includes(location.pathname)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {link.label}
                  <svg className="w-3 h-3 opacity-40 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </Link>
                <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">
                  <div className="glass rounded-2xl py-2 min-w-[200px] shadow-apple-lg">
                    {link.children.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`block px-4 py-2.5 text-[13px] font-medium tracking-tight transition-all duration-200 rounded-lg mx-1
                          ${location.pathname === sub.path
                            ? "text-foreground bg-accent"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-[13px] font-medium tracking-tight transition-colors duration-300 rounded-full
                  ${location.pathname === link.path
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/search")}
            aria-label="Search"
            className="text-muted-foreground hover:text-foreground rounded-full h-8 w-8"
          >
            <Search size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            aria-label={language === "en" ? "Switch language to Hebrew" : "Switch language to English"}
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-full h-8 px-3"
          >
            {language === "en" ? "HE" : "EN"}
          </Button>


          {user ? (
            <>
              <NotificationBell />
              {portalLinks.length > 1 ? (
                <div className="relative group">
                  <Button variant="ghost" size="sm" asChild className="text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-full h-8 px-3">
                    <Link to={currentPortal.path}>{currentPortal.label} ▾</Link>
                  </Button>
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
                    <div className="glass rounded-2xl py-2 min-w-[180px] shadow-apple-lg">
                      {portalLinks.map((p) => (
                        <Link
                          key={p.path}
                          to={p.path}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium tracking-tight transition-colors rounded-lg mx-1
                            ${location.pathname.startsWith(p.path) ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                        >
                          <p.icon size={14} />
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" size="sm" asChild className="text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-full h-8 px-3">
                  <Link to={portalLinks[0].path}>{portalLinks[0].label}</Link>
                </Button>
              )}
              <Button
                size="sm"
                onClick={signOut}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-medium rounded-full px-5 h-8 shadow-apple"
              >
                {portalT.logOut || "Log Out"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-full h-8 px-3">
                <Link to="/login">Log In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-medium rounded-full px-5 h-8 shadow-apple"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/search")} aria-label="Search" className="text-muted-foreground rounded-full">
            <Search size={18} />
          </Button>
          {user && <NotificationBell />}
          <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={language === "en" ? "Switch language to Hebrew" : "Switch language to English"} className="text-muted-foreground rounded-full">
            <Globe size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} className="text-muted-foreground rounded-full">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass border-t border-border/30 shadow-apple-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.path}>
                <Link
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.path ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="ml-4">
                    {link.children.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                          location.pathname === sub.path ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-border/30 mt-2 pt-2">
              {user ? (
                <>
                  {portalLinks.map((p) => (
                    <Link
                      key={p.path}
                      to={p.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <p.icon size={16} />
                      {p.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    {portalT.logOut || "Log Out"}
                  </button>
                </>
              ) : (
                <>
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Portals</p>
                  {portalEntries.map((p) => (
                    <Link
                      key={p.path}
                      to={p.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <p.icon size={15} />
                      {p.label}
                    </Link>
                  ))}
                  <div className="border-t border-border/30 mt-2 pt-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                      <LogIn size={16} />
                      Log In
                    </Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <UserPlus2 size={16} />
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
