import { LogOut, X, LayoutDashboard, Users, CalendarCheck, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth"; // Import Firebase signOut
import { auth } from "../../firebaseConfig"; // Import initialized services

type SidebarProps = {
    open: boolean;
    onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
    const location = useLocation();
    
    const items = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/" },
        { label: "Users", icon: Users, path: "/users" },
        // { label: "Employers", icon: Briefcase, path: "/employers" },
        { label: "Availability", icon: CalendarCheck, path: "/availability" },
        { label: "Settings", icon: Settings, path: "/settings" },
    ];

    const handleLogout = async () => {
        try {
            // Sign out the user
            await signOut(auth);

            // Clear the localStorage
            localStorage.removeItem("admin");

            // Redirect to login page or home page
            window.location.href = "/login"; // Redirecting to login page
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    return (
        <>
            <div
                onClick={onClose}
                className={`
                    fixed inset-0 bg-black/60 z-40
                    transition-opacity duration-300
                    ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
                    md:hidden
                `}
            />

            <aside
                className={`
                    h-screen fixed md:static z-50 w-64
                    bg-[#1b1b1b] border-r border-[#2a2a2a]
                    transform transition-transform duration-300 ease-in-out
                    flex flex-col
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between">
                    <span
                        className="
                            font-bold not-italic
                            text-[40px] leading-[1]
                            tracking-[0]
                            capitalize
                            bg-[linear-gradient(90deg,#CDAC61_0%,#F9F1BA_23.88%,#BA943E_48.95%,#FAF4BB_74.38%,#B88D3D_100%)]
                            bg-clip-text text-transparent
                            text-center
                        "
                    >
                        GoldShift
                    </span>

                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-300 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1">
                    {items.map(({ label, icon: Icon, path }) => {
                        const active = location.pathname === path;

                        return (
                            <NavLink
                                key={label}
                                to={path}
                                onClick={onClose}
                                className={`
                                    w-full px-4 py-3 rounded-lg
                                    flex items-center gap-3 text-left font-medium
                                    transition-colors
                                    ${active
                                        ? "bg-[#FBB040] text-[#030712]"
                                        : "text-gray-300 hover:bg-[#2a2a2a]"
                                    }
                                `}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout Button (Bottom) */}
                <button
                    onClick={handleLogout}
                    className="
                        m-4 mt-auto
                        flex items-center justify-center gap-2
                        border border-red-500 text-red-500
                        rounded-lg py-3
                        hover:bg-red-500 hover:text-black
                        transition-colors cursor-pointer
                    "
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </aside>
        </>
    );
}