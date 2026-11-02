"use client";

import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faBell,
  faMapMarkerAlt,
  faUser,
  faWifi,
  faTriangleExclamation,
  faClock,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import logo from "../public/images/TokoMarni.jpeg";
import LogoutDialog from "./ui/LogOutDialog";
import { useRouter } from "next/navigation";
import nookies from "nookies";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

export const Header = () => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [lastSync, setLastSync] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dropdownRef = useRef(null);

  const handleLogout = () => {
    nookies.destroy(null, "token", { path: "/" });
    localStorage.removeItem("lastSyncTime");
    router.push("/login");
  };

  useEffect(() => {
    const { token: accessToken } = nookies.get();
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        setToken(decoded);

        const lastSyncTime = localStorage.getItem("lastSyncTime");
        if (lastSyncTime) {
          setLastSync(new Date(parseInt(lastSyncTime)).toLocaleString('id-ID'));
        } else {
          const now = Date.now();
          localStorage.setItem("lastSyncTime", now.toString());
          setLastSync(new Date(now).toLocaleString('id-ID'));
        }
      } catch (error) {
        console.error("Failed to decode token", error);
        router.push("/login");
      }
    } else {
        router.push("/login");
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(timer);
    };
  }, [router]);
  
  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(currentTime);

  return (
    <>
      <header className="bg-white/90 backdrop-blur-lg fixed top-0 left-0 right-0 px-4 sm:px-6 py-3 border-b border-slate-200 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex-shrink-0">
            <Image
              src={logo}
              alt="Logo Aplikasi"
              width={80}
              height={40}
              priority
              className="object-contain"
            />
          </Link>
          <div className="hidden lg:flex items-center gap-4 text-sm text-slate-600 border-l border-slate-200 pl-4">
            <div className="text-slate-500">
                <p className="font-semibold">{formattedTime}</p>
                <p className="text-xs">Waktu Indonesia Barat</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 text-slate-500" title={`Login sejak ${lastSync}`}>
                <FontAwesomeIcon icon={faClock} className="text-slate-400" />
                <p className="font-medium">{lastSync}</p>
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
          </div>

          <span
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border
            ${isOnline
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"}`}
          >
            <FontAwesomeIcon icon={isOnline ? faWifi : faTriangleExclamation} />
            <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
          </span>

          {/* <button
            onClick={() => router.push("/dashboard/notification")}
            className="cursor-pointer h-10 w-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition-colors"
            aria-label="Notifikasi"
          >
            <FontAwesomeIcon icon={faBell} className="text-xl" />
          </button> */}
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className={`flex items-center gap-3 cursor-pointer p-1.5 rounded-full transition-colors duration-200 bg-slate-100 ${isDropdownOpen ? 'bg-slate-100 ring-2 ring-sky-300' : 'hover:bg-slate-100'}`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="Buka menu pengguna"
            >
              <div className="relative rounded-full bg-slate-200 h-9 w-9 flex items-center justify-center text-slate-500">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="text-right hidden md:block">
                <p className="font-semibold text-slate-800 text-sm leading-tight">{token?.name}</p>
                <p className="text-xs text-slate-500">{token?.role}</p>
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`hidden md:block text-xs text-slate-400 ml-1 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>

            <div
              className={`absolute right-0 top-full mt-2 w-64 origin-top-right bg-white border border-slate-200 shadow-xl rounded-lg z-50 transition-all duration-200 ease-out
              ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
              role="menu"
              aria-orientation="vertical"
            >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-sm text-slate-800 truncate">{token?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{token?.username ? `@${token.username}` : token?.email || 'Tidak ada username terdaftar'}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setLogoutDialogOpen(true);
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    role="menuitem"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
            </div>
          </div>
        </div>
      </header>

      <LogoutDialog
        logoutDialogOpen={logoutDialogOpen}
        setLogoutDialogOpen={setLogoutDialogOpen}
        handleLogout={handleLogout}
      />
    </>
  );
};