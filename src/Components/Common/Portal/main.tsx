/**
 * @file
 * @date 2022-10-19
 * @author xuejie.he
 * @lastModify xuejie.he 2022-10-19
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mountElement } from "./mount";
import { ActionType, useCssTransition } from "../Hooks/useCssTransition";
import { AutoPositionResult, main } from "../Kite/Unit/autoPosition";
import { getTriangle } from "../Kite/Unit/getTriangle";
import { listenDomChange } from "../Kite/Unit/listenDomChange";
import { toFixed } from "../Kite/Unit/toFixed";
import { getTransitionClass, TransitionClassProps } from "../Kite/Unit/transitionClass";
import Triangle from "../Kite/Unit/triangle";
import { MainProps, SizeProps } from "../Kite/Unit/type";
import { setStyle } from "../Transition/Unit/addStyle";
import useEventListener from "./../../Hooks/useEventListener";
import { useLatest } from "./../../Hooks/useLatest";
import { useCloneElementSize } from "./../Hooks/useCloneElementSize";
import "./style.scss";
import { getScrollValue } from "../Kite/Unit/getScrollValue";
import useUpdateLayoutEffect from "../../Hooks/useUpdateLayoutEffect";
import { deepCloneData } from "../../Unit/deepCloneData";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "id">,
        Omit<MainProps, "handlePositionChange"> {
    root?: Element;
    show?: boolean;
    hashId?: string;
    children?: React.ReactNode;
    isTransition: boolean;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp = forwardRef<HTMLDivElement, TempProps>(
    (
        {
            root,
            placement = "cb",
            direction = "vertical",
            offset,
            triangle,
            animate,

            handleTransitionStart,
            handleTransitionEnd,
            handleTransitionCancel,
            style,
            className,
            mount,
            show,
            hashId,
            bodyClassName,
            isTransition,
            children,
            ...props
        },
        ref,
    ) => {
        Temp.displayName = "PositionPortal";
        /* <------------------------------------ **** STATE START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/

        const positionalRef = useRef<string>();
        const [positional, setPositional] = useState<AutoPositionResult>();
        const autoPositionFn = useLatest(main());
        const transitionEnd = useRef<boolean>();
        const [initStyle, setInitStyle] = useState(style);

        /**
         * ??????diff??????
         */
        const portalSize = useRef<SizeProps>();
        const triangleSize = useRef<SizeProps>();
        /**
         * root???????????????
         */
        const rootAttr = useRef<{
            width: number;
            height: number;
            left: number;
            top: number;
        }>();

        const directionRef = useLatest(direction);
        const placementRef = useLatest(placement);
        const portalOffsetRef = useLatest(offset);
        const triangleOffsetRef = useLatest(triangle);
        const animationRef = useLatest(animate);
        const styleRef = useLatest(style);
        const rootRef = useRef(root);
        const mountRef = useRef(mount);

        const portalRef = useRef<HTMLDivElement | null>(null);

        // const oldShow = useRef<boolean>();

        /**
         * show???????????????
         */
        const showRef = useRef<{
            from?: boolean;
            to?: boolean;
        }>({
            from: undefined,
            to: undefined,
        });

        const [dispatch, currentClassName, currentStyle] = useCssTransition(
            initStyle,
            () => {
                // console.log("**************** start ******************");
                handleTransitionStart?.();
                transitionEnd.current = false;
            },
            () => {
                // console.log("**************** end ******************");
                handleTransitionEnd?.();
                transitionEnd.current = true;
                refreshFn.current();
            },

            () => {
                // console.log("****************** cancel ********************");
                handleTransitionCancel?.();
            },
            portalRef,
        );

        const dispatchRef = useLatest(dispatch);

        const isTransitionRef = useLatest(isTransition);

        const getSizeRef = useCloneElementSize(portalRef, currentClassName, styleRef);

        /**
         * ???????????????????????????
         */
        const refreshFn = useRef((needSwitchVisible = false) => {
            const portal = portalRef.current;
            const btn = rootRef.current;
            /**
             * ??????portal?????????
             */
            const setLatLng = (res: AutoPositionResult | undefined) => {
                if (res) {
                    let left = toFixed(res.menu[0]);
                    let top = toFixed(res.menu[1]);
                    if (mountRef.current) {
                        const pRect = mountRef.current.getBoundingClientRect();
                        const scrollData = getScrollValue();

                        if (pRect) {
                            const x = pRect.left + scrollData.x;
                            const y = pRect.top + scrollData.y;
                            left = toFixed(res.menu[0] - x);
                            top = toFixed(res.menu[1] - y);
                        }
                    }

                    if (portal) {
                        setStyle(
                            portal,
                            Object.assign({}, styleRef.current, {
                                left: `${left}px`,
                                top: `${top}px`,
                            }),
                        );
                    }
                    setInitStyle(
                        Object.assign({}, styleRef.current, {
                            left: `${left}px`,
                            top: `${top}px`,
                        }),
                    );
                }
            };

            /***
             * ????????????????????????class name
             */
            const setTransitionClass = (position: AutoPositionResult | undefined) => {
                let classList: undefined | TransitionClassProps = undefined;

                const arr = placementRef.current.split("");
                const x = arr[0] as "l" | "r" | "c";
                const y = arr[1] as "t" | "b" | "c";
                switch (directionRef.current) {
                    case "horizontal":
                        if (x === "l") {
                            classList = position?.reverse
                                ? getTransitionClass("r", y, directionRef.current)
                                : getTransitionClass("l", y, directionRef.current);
                        } else {
                            classList = position?.reverse
                                ? getTransitionClass("l", y, directionRef.current)
                                : getTransitionClass("r", y, directionRef.current);
                        }
                        break;
                    case "vertical":
                        if (y === "t") {
                            classList = position?.reverse
                                ? getTransitionClass(x, "b", directionRef.current)
                                : getTransitionClass(x, "t", directionRef.current);
                        } else {
                            classList = position?.reverse
                                ? getTransitionClass(x, "t", directionRef.current)
                                : getTransitionClass(x, "b", directionRef.current);
                        }
                        break;
                }
                dispatchRef.current({
                    type: ActionType.SetClassNameAction,
                    payload: {
                        type: animationRef.current,
                        enterActive: classList.enter.active,
                        toEnter: classList.enter.to,
                        fromEnter: classList.enter.from,
                        leaveActive: classList.leave.active,
                        toLeave: classList.leave.to,
                        fromLeave: classList.leave.from,
                    },
                });
            };

            /**
             * ????????????
             */
            if (typeof showRef.current.to === "boolean" && btn) {
                const btnRect = btn.getBoundingClientRect();
                let data: AutoPositionResult | undefined = undefined;

                if (portalSize.current) {
                    data = autoPositionFn.current?.({
                        btnRect,
                        triangleSize: [
                            triangleSize.current?.width ?? 0,
                            triangleSize.current?.height ?? 0,
                        ],
                        menuSize: portalSize.current,
                        direction: directionRef.current,
                        placement: placementRef.current,
                        offset: {
                            menu: portalOffsetRef.current,
                            triangle: triangleOffsetRef.current?.offset,
                        },
                    });
                }
                if (JSON.stringify(data) !== positionalRef.current) {
                    positionalRef.current = JSON.stringify(data);
                    setPositional(data ? { ...data } : undefined);
                    setLatLng(data);
                    setTransitionClass(data);
                }
                if (needSwitchVisible) {
                    // console.log("dispatch?????????show???", oldShow.current);
                    dispatchRef.current({
                        type: ActionType.SwitchVisibleStatusAction,
                        payload: {
                            value: showRef.current.to,
                            isTransition: isTransitionRef.current,
                        },
                    });
                }
            }
        });

        /* <------------------------------------ **** STATE END **** ------------------------------------ */
        /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
        /************* This section will include this component parameter *************/

        /**
         * ???????????????????????????????????????
         * start
         */

        useUpdateLayoutEffect(() => {
            rootRef.current = root;
        }, [root]);

        useUpdateLayoutEffect(() => {
            mountRef.current = mount;
        }, [mount]);

        /**
         * end
         * ???????????????????????????????????????
         */

        useLayoutEffect(() => {
            setInitStyle((pre) => ({ ...pre, ...style }));
        }, [style]);
        useEffect(() => {
            return () => {
                showRef.current = {
                    from: undefined,
                    to: undefined,
                };
            };
        }, []);

        {
            /**
             *
             * ???????????? ??????
             *
             * ???
             * 1. ???????????????true?????????????????????
             *
             *
             * 2. ???????????????????????????????????????
             * ??????portal????????????????????????
             *
             */
            if (show !== showRef.current.to) {
                showRef.current = {
                    from: showRef.current.to,
                    to: show,
                };
                if (transitionEnd.current) {
                    transitionEnd.current = undefined;
                }
            }
        }

        useEffect(() => {
            let timer: null | number = null;
            if (typeof show === "boolean") {
                const fn = (el: HTMLDivElement | null) => {
                    if (!el) {
                        if (portalSize.current) {
                            refreshFn.current(true);
                            return;
                        }
                        return;
                    }
                    const rect = el.getBoundingClientRect();

                    portalSize.current = {
                        width: rect.width,
                        height: rect.height,
                    };
                    const triangleNode = getTriangle(el, "kite_triangle");
                    if (triangleNode) {
                        const _rect = triangleNode.getBoundingClientRect();
                        triangleSize.current = {
                            width: _rect.width,
                            height: _rect.height,
                        };
                    }
                    refreshFn.current(true);
                };

                if (!(showRef.current.from === undefined && showRef.current.to === false)) {
                    timer = window.setTimeout(() => {
                        void getSizeRef.current().then(fn);
                    });
                }
            }

            return () => {
                timer && window.clearTimeout(timer);
            };
            //??????ref?????????
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [show]);

        /**
         * ?????? ?????? ?????????????????????
         */
        const handleScrollOrResize = () => {
            /**
             * ?????? ?????????
             * @returns
             */
            const diffChild = () => {
                const el = portalRef.current;
                if (!el || window.getComputedStyle(el, null).display === "none") {
                    return;
                }

                const rect = el.getBoundingClientRect();

                portalSize.current = {
                    width: rect.width,
                    height: rect.height,
                };
            };

            /**
             * ?????? ??????
             * @returns
             */
            const diffRoot = () => {
                const el = rootRef.current;
                if (!el) {
                    return;
                }

                const rect = el.getBoundingClientRect();

                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
            };

            if (
                showRef.current.to &&
                (transitionEnd.current || transitionEnd.current === undefined)
            ) {
                diffChild();
                diffRoot();
                refreshFn.current();
            }
        };

        useEventListener("resize", handleScrollOrResize);
        useEventListener("scroll", handleScrollOrResize, undefined, true);

        /**
         * ?????? kite???root element?????????
         * ?????? top???left???width???height??????????????? ????????????????????????
         */
        useLayoutEffect(() => {
            const fn = () => {
                if (!root) {
                    return;
                }
                const rect = root.getBoundingClientRect();

                const data = rootAttr.current;
                if (
                    data &&
                    rect.top === data.top &&
                    rect.left === data.left &&
                    rect.width === data.width &&
                    rect.height === data.height
                ) {
                    return;
                }

                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
                // ??????fn
                refreshFn.current();
            };

            /**
             * ????????????
             */
            const main = () => {
                if (
                    showRef.current.to &&
                    (transitionEnd.current || transitionEnd.current === undefined)
                ) {
                    fn();
                }
            };

            let observer: MutationObserver | null = null;

            if (root) {
                const rect = root.getBoundingClientRect();
                rootAttr.current = {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                };
                observer = listenDomChange(root, main);
            }
            return () => {
                observer?.disconnect();
            };
        }, [root]);

        /**
         * ??????children element?????????
         */
        useEffect(() => {
            /**
             * diff??????
             */
            const fn = () => {
                const el = portalRef.current;
                if (!el) {
                    return;
                }

                const rect = el.getBoundingClientRect();
                if (
                    portalSize.current &&
                    rect.width === portalSize.current.width &&
                    rect.height === portalSize.current.height
                ) {
                    return;
                }
                // ??????fn

                portalSize.current = {
                    width: rect.width,
                    height: rect.height,
                };
                refreshFn.current();
            };

            /**
             * ????????????
             */
            const main = () => {
                if (
                    showRef.current.to &&
                    transitionEnd.current &&
                    portalRef.current &&
                    window.getComputedStyle(portalRef.current, null).display !== "none"
                ) {
                    fn();
                }
            };

            let observer: MutationObserver | null = null;

            if (portalRef.current) {
                observer = listenDomChange(portalRef.current, main);
            }
            return () => {
                observer?.disconnect();
            };
        }, []);

        useEffect(() => {
            if (showRef.current.to) {
                refreshFn.current();
            }
        }, [root, direction, placement, offset, triangle, mount]);

        /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
        /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
        /************* This section will include this component general function *************/

        const getClassName = () => {
            const arr = [
                `kite_${direction}${placement.slice(0, 1).toUpperCase()}${placement.slice(1, 2)}`,
                ...deepCloneData(currentClassName.current),
            ];

            if (positional?.reverse) {
                arr.push("kite_reverse");
            }
            return arr.join(" ") + (className ? ` ${className}` : "");
        };

        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
        return createPortal(
            <div
                key={hashId ? `${hashId}-main` : undefined}
                className={getClassName()}
                ref={(el) => {
                    portalRef.current = el;

                    if (typeof ref === "function") {
                        ref(el);
                    } else if (ref !== null) {
                        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
                    }
                }}
                style={{ ...style, ...currentStyle.current }}
                {...props}
            >
                <Triangle
                    className={"kite_triangle"}
                    attr={triangle}
                    position={positional}
                    d={direction}
                    placement={placement}
                />

                <div className={"kite_body" + (bodyClassName ? ` ${bodyClassName}` : "")}>
                    {children}
                </div>
            </div>,
            mountElement(mount),
        );
    },
);
Temp.displayName = "PositionPortal";
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
