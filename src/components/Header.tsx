"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation, siteConfig } from "@/data/site";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstFocusable = menuRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !menuRef.current) return;
      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled || menuOpen ? "is-solid" : ""}`}>
      <div className="header-inner">
        <Link className="brand-lockup" href="/" aria-label="El Vagón, inicio">
          <span className="brand-mark" aria-hidden="true">
            <Image
              className="brand-mark-light"
              src={siteConfig.logos.markLight}
              alt=""
              fill
              loading="eager"
              sizes="52px"
            />
            <Image
              className="brand-mark-dark"
              src={siteConfig.logos.markDark}
              alt=""
              fill
              sizes="52px"
            />
          </span>
          <span className="brand-name">EL VAGÓN</span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          className="header-booking"
          href="/#reservas"
          aria-label="Consultar disponibilidad"
        >
          Reservar
        </Link>

        <button
          ref={triggerRef}
          className="menu-trigger"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Navegación móvil">
          {navigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          className="button button-dark mobile-booking"
          href="/#reservas"
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
        >
          Consultar disponibilidad
        </Link>
        <p>General Belgrano · Buenos Aires</p>
      </div>
    </header>
  );
}
