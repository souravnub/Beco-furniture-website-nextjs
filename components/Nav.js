import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNav } from "../contexts/navContext";
import gsap from "gsap";
import { HiOutlineAtSymbol, HiOutlineArrowRight } from "react-icons/hi";
import { IoCartOutline } from "react-icons/io5";
import MobileMenu from "./MobileMenu";
import CursorHover from "./CursorHover";
import { useCursor } from "../contexts/cursorContext";
import getTailwind, { getTailwindColors } from "../utils/getTailwind";
import { useCart } from "../contexts/cartContext";
import { getCartLength } from "../utils/cartUtils";

const navLinks = [
    {
        text: "About us",
        href: "/about",
    },
    {
        text: "Products",
        href: "/products",
    },
];

const Nav = () => {
    const {
        setNavHeight,
        navType,
        setNavType,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        menuBtnTheme,
        setMenuBtnTheme,
        setInitialNavHeight,
        navCursorBorderColor,
    } = useNav();
    const { setCursorStates, borderColor: currentCursorBorderColor } =
        useCursor();
    const { setIsCartOpen, isCartOpen, cart } = useCart();
    const navRef = useRef();
    const navPaddingAni = useRef();
    const menuBtnRef = useRef();
    const navAniRef = useRef();
    const cartBtnRef = useRef();

    const [isMenuBtnDisabled, setIsMenuBtnDisabled] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        setNavHeight(navRef.current.offsetHeight);
        setInitialNavHeight(navRef.current.offsetHeight);
        // newNavPadding should be small than what is in the className of nav
        const newNavPadding = getTailwind.theme.spacing[3];

        navPaddingAni.current = gsap.to(navRef.current, {
            paddingTop: newNavPadding,
            paddingBottom: newNavPadding,
            paused: true,
            ease: "expo.inOut",
            duration: 0.4,
            onStart: () => {
                setNavType("nav-white");
                setMenuBtnTheme("dark");
                navRef.current.classList.add("border-b");
            },
            onComplete: () => {
                setNavHeight(navRef.current.offsetHeight);
            },
            onReverseComplete: () => {
                setNavHeight(navRef.current.offsetHeight);
            },
        });

        window.addEventListener("scroll", handleWindowScroll);

        return () => {
            window.removeEventListener("scroll", handleWindowScroll);

            // revert will kill the animation & will remove the inline styles that we added because of gsap
            // kill will only kill the animation & will NOT remove the inline styles
            navPaddingAni.current?.revert();
        };
    }, []);

    useEffect(() => {
        //setting border color of cursor when cursor is in nav
        function setCursorBorderOnHover() {
            setCursorStates({ borderColor: navCursorBorderColor });
        }
        function setCursorBorderToDefault() {
            setCursorStates({ borderColor: getTailwindColors.brand[500] });
        }
        navRef.current.addEventListener("mouseenter", setCursorBorderOnHover);
        navRef.current.addEventListener("mouseleave", setCursorBorderToDefault);

        return () => {
            navRef.current?.removeEventListener(
                "mouseenter",
                setCursorBorderOnHover
            );
            navRef.current?.removeEventListener(
                "mouseleave",
                setCursorBorderToDefault
            );
        };
    }, [navCursorBorderColor]);

    useEffect(() => {
        const classList = navRef.current.classList;
        const currentNavType = Array.from(classList).find((ele) =>
            ele.includes("nav-")
        );
        classList.replace(currentNavType, navType || "nav-transparent");
    }, [navType]);

    function handleWindowScroll() {
        if (window.scrollY > 1) {
            // if set nav-white here, then whenever event triggers it will set navClass to navwhite ... therefore set navClass to navWhite only when animation starts
            navPaddingAni.current.play();
        } else {
            navPaddingAni.current.reverse();
            setNavType("nav-transparent");
            setMenuBtnTheme("light");
            navRef.current.classList.remove("border-b");
        }
    }

    function animateNav({ toBg }) {
        let timeline = gsap.timeline({
            defaults: { duration: 0.3, ease: "power.inOut" },
        });
        timeline.to(navRef.current, {
            backgroundColor: toBg,
            color: "white",
            borderBottom: "none",
        });
        timeline.add(menuBtnAnimation(), "<");
        return timeline;
    }

    function menuBtnAnimation() {
        const lines = Array.from(
            menuBtnRef.current.querySelectorAll(":scope > div")
        );

        return gsap
            .timeline({
                defaults: {
                    duration: 0.35,
                    ease: "power3.inOut",
                },
            })
            .addLabel("parallel")
            .to(
                cartBtnRef.current.querySelector(":scope > span"),
                {
                    backgroundColor: "white",
                    color: "black",
                },
                "parallel"
            )
            .to(
                menuBtnRef.current,
                {
                    backgroundColor: "white",
                },
                "parallel"
            )
            .to(
                lines,
                {
                    backgroundColor: "black",
                },
                "parallel"
            )
            .to(lines[0], { rotate: 45, top: "50%" }, "parallel")
            .to(lines[1], { rotate: -45, top: "50%" }, "parallel");
    }

    function handleNavAnimation() {
        if (isMobileMenuOpen) {
            setIsMenuBtnDisabled(true);
            navAniRef.current
                .reverse()
                .eventCallback("onReverseComplete", () => {
                    setIsMenuBtnDisabled(false);
                    navAniRef.current.revert();
                });
        } else {
            navAniRef.current = animateNav({
                toBg: getTailwindColors.dark.DEFAULT,
            })
                .play()
                .eventCallback("onStart", () => {
                    setIsMenuBtnDisabled(true);
                })
                .eventCallback("onComplete", () => {
                    setIsMenuBtnDisabled(false);
                });
        }
    }

    return (
        <nav>
            <div
                ref={navRef}
                className=" nav-transparent fixed top-0 z-10 flex w-full items-center bg-texture p-6 text-sm font-semibold transition">
                <CursorHover
                    hoverStates={{ scale: 4 }}
                    exitStates={{ scale: 1 }}>
                    <Link href="/" className="flex items-center gap-1">
                        <HiOutlineAtSymbol className="text-xl text-inherit" />
                        <span className="text-xl font-semibold">Beco</span>
                    </Link>
                </CursorHover>

                <ul className="hidden md:ml-auto md:flex md:items-center md:gap-10">
                    {navLinks.map(({ href, text }) => {
                        return (
                            <li key={href}>
                                <CursorHover
                                    hoverStates={{ scale: 4 }}
                                    exitStates={{ scale: 1 }}>
                                    <Link
                                        href={href}
                                        className="transition hover:text-brand">
                                        {text}
                                    </Link>
                                </CursorHover>
                            </li>
                        );
                    })}
                </ul>

                <div className="ml-auto flex items-center gap-7 md:gap-10">
                    <CursorHover
                        className="mt-1 inline-block"
                        hoverStates={{
                            scale: 0.5,
                            fill: currentCursorBorderColor,
                        }}
                        exitStates={{ scale: 1, fill: "transparent" }}>
                        <button
                            onClick={() => {
                                setIsCartOpen(true);
                            }}
                            aria-controls="cart"
                            aria-label="open-cart"
                            ref={cartBtnRef}
                            aria-expanded={isCartOpen ? "true" : "false"}
                            className={`${menuBtnTheme} cart-btn relative  p-1 text-2xl`}>
                            <span className="absolute right-1 top-1  aspect-square translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-[.4rem] text-xs text-dark transition">
                                {getCartLength(cart)}
                            </span>
                            <IoCartOutline />
                        </button>
                    </CursorHover>
                    <CursorHover
                        hoverStates={{ scale: 4 }}
                        exitStates={{ scale: 1 }}
                        className="hidden md:ml-auto md:inline-block">
                        <Link
                            href="/contact"
                            className="group flex items-center gap-2">
                            <div
                                className={`menu-contact-btn ${menuBtnTheme} relative flex aspect-square w-4 items-center justify-center overflow-hidden rounded-full p-4`}
                                aria-hidden="true">
                                <HiOutlineArrowRight className="absolute -translate-x-full opacity-0 transition duration-700 group-hover:translate-x-0 group-hover:opacity-100" />
                                <HiOutlineArrowRight className="absolute  opacity-100 transition duration-700 group-hover:translate-x-full group-hover:opacity-0" />
                            </div>
                            Get in touch
                        </Link>
                    </CursorHover>
                    <button
                        disabled={isMenuBtnDisabled}
                        aria-controls="mobile-navigation"
                        aria-label="open-menu"
                        aria-disabled={isMenuBtnDisabled ? "true" : "false"}
                        aria-expanded={isMobileMenuOpen ? "true" : "false"}
                        onClick={() => {
                            setIsMobileMenuOpen((prev) => !prev);
                            handleNavAnimation();
                        }}
                        className={`${menuBtnTheme} menu-btn relative grid aspect-square h-8  place-items-center rounded-full md:hidden`}
                        ref={menuBtnRef}>
                        <span className="sr-only">
                            {isMobileMenuOpen ? "hide menu" : "show menu"}
                        </span>
                        <div className="pointer-events-none absolute top-[45%] h-[1.5px] w-4 origin-center rounded-full"></div>
                        <div className="pointer-events-none absolute top-[55%] h-[1.5px] w-4 origin-center rounded-full"></div>
                    </button>
                </div>
            </div>
            <MobileMenu
                navRef={navRef}
                isOpen={isMobileMenuOpen}
                links={navLinks}
            />
        </nav>
    );
};

export default Nav;
