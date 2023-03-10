/**
 * @file 监听事件的 hook
 * @date 2023-01-11
 * @author xuejie.he
 * @lastModify xuejie.he 2023-01-11
 */

import { RefObject, useEffect } from "react";
import { useLatest } from "./useLatest";

// MediaQueryList Event based useEventListener interface
function useEventListener<K extends keyof MediaQueryListEventMap>(
    eventName: K,
    handler: (event: MediaQueryListEventMap[K]) => void,
    element: RefObject<MediaQueryList>,
    options?: boolean | AddEventListenerOptions,
): void;

// Window Event based useEventListener interface
function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element?: undefined,
    options?: boolean | AddEventListenerOptions,
): void;

// Element Event based useEventListener interface
function useEventListener<
    K extends keyof HTMLElementEventMap,
    T extends HTMLElement = HTMLDivElement,
>(
    eventName: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    element: RefObject<T>,
    options?: boolean | AddEventListenerOptions,
): void;

// Document Event based useEventListener interface
function useEventListener<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (event: DocumentEventMap[K]) => void,
    element: RefObject<Document>,
    options?: boolean | AddEventListenerOptions,
): void;

/**
 * 绑定事件的hook
 * 这个是 useEffect绑定
 * @param eventName 事件类型
 * @param handler 事件回调
 * @param element 绑定此事件的对象
 * @param options 事件的options属性
 */

function useEventListener<
    KW extends keyof WindowEventMap,
    KH extends keyof HTMLElementEventMap,
    KM extends keyof MediaQueryListEventMap,
    T extends HTMLElement | MediaQueryList | void = void,
>(
    eventName: KW | KH | KM,
    handler: (
        event: WindowEventMap[KW] | HTMLElementEventMap[KH] | MediaQueryListEventMap[KM] | Event,
    ) => void,
    element?: RefObject<T>,
    options?: boolean | AddEventListenerOptions,
) {
    const handlerRef = useLatest(handler);

    useEffect(() => {
        const targetElement: T | Window = element?.current ?? window;

        if (!targetElement?.addEventListener) return;

        const listener: typeof handler = (event) => handlerRef.current(event);

        targetElement.addEventListener(eventName, listener, options);

        return () => {
            targetElement.removeEventListener(eventName, listener, options);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventName, element, options]);
}

export default useEventListener;
