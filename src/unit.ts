import { comms, DataProps } from ".";
import { deepCloneData } from "./Components/Unit/deepCloneData";

/**
 * 初始化 菜单列表
 */
export const initMenuData = (
    state?: Record<string, string | null>,
): Record<string, Array<DataProps>> => {
    const options = comms.config.options ?? [];

    const data: Record<string, Array<DataProps>> = {};
    let menus: Array<DataProps>;
    try {
        menus = comms.config.data ? JSON.parse(comms.config.data) : [];
    } catch {
        menus = [];
    }

    if (options.length > 1) {
        for (let i = 1; i < options.length; i++) {
            const item = options[i];
            const preItem = options[i - 1].code;

            const colData = state?.[preItem];
            const list = menus.find((menu) => menu.name === colData)?.children ?? [];

            data[item.code] = [...list];
            menus = deepCloneData(list);
        }
    }
    return data;
};

/**
 * 初始化选中的值
 */
export const initSelectData = (
    state?: Record<string, string | null>,
): Record<string, string | null> => {
    const data: Record<string, string | null> = {};
    if (state) {
        for (const key in state) {
            const itemVal = state[key];
            data[key] = itemVal;
        }
        return data;
    }

    const options = comms.config.options ?? [];

    for (let i = 0; i < options.length; i++) {
        const item = options[i];
        data[item.code] = null;
    }
    return data;
};
